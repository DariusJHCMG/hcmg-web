/**
 * HCMG Tracker — lightweight client-side event collection.
 * All functions are browser-only; they no-op on the server.
 *
 * Session lifecycle:
 *  - A UUID session_id is generated once per browser tab and stored in sessionStorage.
 *  - Entry page, referrer, and device type are captured on first load and stored alongside it.
 *  - Events are fire-and-forget POSTs to /api/track (never block UI).
 */

const SESSION_KEY  = "hcmg_session_id";
const META_KEY     = "hcmg_session_meta";

export type EventType = "page_view" | "funnel_step" | "cta_click" | "calculator_use";

export interface SessionMeta {
  sessionId:  string;
  entryPage:  string;
  referrer:   string;
  device:     "mobile" | "tablet" | "desktop";
  startedAt:  number;
}

// ── Session ID ────────────────────────────────────────────────────

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

// ── Device detection ─────────────────────────────────────────────

function detectDevice(): "mobile" | "tablet" | "desktop" {
  const ua = navigator.userAgent;
  if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
  if (/iPad|Tablet/i.test(ua)) return "tablet";
  return "desktop";
}

// ── Session meta (entry page, referrer, device) ───────────────────
// Captured once on first visit and stored for the life of the tab.

export function initSessionMeta(): SessionMeta {
  if (typeof window === "undefined") {
    return { sessionId: "", entryPage: "", referrer: "", device: "desktop", startedAt: Date.now() };
  }
  const existing = sessionStorage.getItem(META_KEY);
  if (existing) return JSON.parse(existing) as SessionMeta;

  const meta: SessionMeta = {
    sessionId: getSessionId(),
    entryPage: window.location.pathname + window.location.search,
    referrer:  document.referrer
      ? new URL(document.referrer).hostname
      : "direct",
    device: detectDevice(),
    startedAt: Date.now(),
  };
  sessionStorage.setItem(META_KEY, JSON.stringify(meta));
  return meta;
}

export function getSessionMeta(): SessionMeta {
  if (typeof window === "undefined") {
    return { sessionId: "", entryPage: "", referrer: "", device: "desktop", startedAt: Date.now() };
  }
  const raw = sessionStorage.getItem(META_KEY);
  if (raw) {
    const parsed = JSON.parse(raw) as SessionMeta;
    return { ...parsed, startedAt: parsed.startedAt ?? Date.now() };
  }
  return initSessionMeta();
}

// ── Event dispatch ────────────────────────────────────────────────

function fire(eventType: EventType, data?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const sessionId = getSessionId();
  const pathname  = window.location.pathname;

  // Fire-and-forget — never await, never block
  fetch("/api/track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, eventType, pathname, data: data ?? {} }),
    keepalive: true, // survives page unload
  }).catch(() => {});
}

// ── Public tracking helpers ───────────────────────────────────────

export function trackPageView(pathname: string, title?: string) {
  fire("page_view", { title: title ?? document.title, path: pathname });
}

export function trackFunnelStep(
  step: number,
  choice: string,
  durationMs?: number,
) {
  fire("funnel_step", { step, choice, duration_ms: durationMs ?? null });
}

export function trackCtaClick(label: string) {
  fire("cta_click", { label });
}

export function trackCalculatorUse(inputs: Record<string, unknown>) {
  fire("calculator_use", inputs);
}
