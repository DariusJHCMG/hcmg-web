import type { UtmParams } from "./utm";
import { getSessionMeta } from "./tracker";

export interface LeadPayload {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  smsConsent: boolean;
  smsConsentText?: string;
  smsConsentTimestamp?: string;
  notes?: string;
  source?: string;        // e.g. "get-started", "team", "seo"
  seoSlug?: string;       // which seo page (e.g. "orlando-fha-loan"), when source="seo"
  funnelType?: string;    // funnel catalog slug (e.g. "va-purchase", "fha-203k")
  propertyState?: string; // 2-letter state abbreviation for purchase/refinance property
  goal?: string;
  priceRange?: string;
  creditRange?: string;
  incomeRange?: string;
  estimatedBuyingPowerLow?: number;
  estimatedBuyingPowerHigh?: number;
  estimatedMonthlyPayment?: number;
  recommendedLoanType?: string;
  // Loan-officer routing, when the lead originated from a per-LO page
  loSlug?: string;
  loName?: string;
  loNmls?: string | null;
  // UTM attribution
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  // Session intelligence
  sessionId?:  string;
  entryPage?:  string;
  referrer?:   string;
  device?:     string;
  // Bot protection fields are populated by submitLead, never by page code.
  website?: string;
  formStartedAt?: number;
  turnstileToken?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      execute: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

let turnstileScript: Promise<void> | null = null;

async function getTurnstileToken(): Promise<string | undefined> {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (!siteKey || typeof window === "undefined") return undefined;

  if (!turnstileScript) {
    turnstileScript = new Promise((resolve, reject) => {
      if (window.turnstile) return resolve();
      const script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Bot verification could not load."));
      document.head.appendChild(script);
    });
  }
  await turnstileScript;

  return new Promise<string>((resolve, reject) => {
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    document.body.appendChild(container);
    let widgetId = "";
    const cleanup = () => {
      if (widgetId) window.turnstile?.remove(widgetId);
      container.remove();
    };
    const timer = window.setTimeout(() => { cleanup(); reject(new Error("Bot verification timed out.")); }, 12000);
    widgetId = window.turnstile!.render(container, {
      sitekey: siteKey,
      size: "invisible",
      execution: "execute",
      callback: (token: string) => { window.clearTimeout(timer); cleanup(); resolve(token); },
      "error-callback": () => { window.clearTimeout(timer); cleanup(); reject(new Error("Bot verification failed.")); },
      "expired-callback": () => { window.clearTimeout(timer); cleanup(); reject(new Error("Bot verification expired.")); },
    });
    window.turnstile!.execute(widgetId);
  });
}

export async function submitLead(payload: LeadPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const meta = getSessionMeta();
    const turnstileToken = await getTurnstileToken();
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        sessionId: payload.sessionId || meta.sessionId,
        entryPage: payload.entryPage || meta.entryPage,
        referrer: payload.referrer || meta.referrer,
        device: payload.device || meta.device,
        website: "",
        formStartedAt: meta.startedAt,
        turnstileToken,
      }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: (data as { error?: string }).error ?? "Submission failed." };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Verification or network error. Please try again." };
  }
}

/** Build a LeadPayload UTM block from stored session UTMs. */
export function utmsToPayload(utms: UtmParams): Pick<LeadPayload, "utmSource" | "utmMedium" | "utmCampaign" | "utmContent" | "utmTerm"> {
  return {
    utmSource:   utms.utm_source,
    utmMedium:   utms.utm_medium,
    utmCampaign: utms.utm_campaign,
    utmContent:  utms.utm_content,
    utmTerm:     utms.utm_term,
  };
}
