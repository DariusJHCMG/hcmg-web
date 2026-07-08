import type { UtmParams } from "./utm";

export interface LeadPayload {
  firstName: string;
  email: string;
  phone: string;
  smsConsent: boolean;
  smsConsentText: string;
  smsConsentTimestamp: string;
  source?: string;     // e.g. "get-started", "team", "seo"
  seoSlug?: string;    // which seo page (e.g. "orlando-fha-loan"), when source="seo"
  funnelType?: string; // funnel catalog slug (e.g. "va-purchase", "fha-203k")
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
}

export async function submitLead(payload: LeadPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return { success: false, error: (data as { error?: string }).error ?? "Submission failed." };
    }
    return { success: true };
  } catch {
    return { success: false, error: "Network error. Please try again." };
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
