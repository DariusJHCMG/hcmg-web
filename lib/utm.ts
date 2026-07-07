/**
 * UTM helpers — runs only in the browser.
 *
 * Strategy:
 *  1. On any page load that has UTM params in the URL, persist them to
 *     sessionStorage so they survive navigation within the same tab.
 *  2. Any link to /get-started can call appendUtms() to keep them in the URL.
 *  3. FunnelFlow reads the stored UTMs and sends them with the lead payload.
 *
 * Keys stored: utm_source, utm_medium, utm_campaign, utm_content, utm_term
 */

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmKey = (typeof UTM_KEYS)[number];
export type UtmParams = Partial<Record<UtmKey, string>>;

const SESSION_KEY = "hcmg_utms";

/** Call once on page mount. Reads UTMs from the URL and saves them to sessionStorage. */
export function captureUtms(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const found: UtmParams = {};
  for (const key of UTM_KEYS) {
    const v = params.get(key);
    if (v) found[key] = v;
  }
  if (Object.keys(found).length > 0) {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(found));
  }
}

/** Return the currently stored UTM params (empty object if none). */
export function getStoredUtms(): UtmParams {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UtmParams) : {};
  } catch {
    return {};
  }
}

/**
 * Append stored UTM params to a /get-started (or any) href.
 * Existing params in the href are preserved; UTMs only added if not already present.
 */
export function appendUtms(href: string): string {
  if (typeof window === "undefined") return href;
  const utms = getStoredUtms();
  if (Object.keys(utms).length === 0) return href;

  // Split off the hash so we don't break anchor links
  const [pathAndQuery, hash] = href.split("#");
  const [path, existingQuery] = pathAndQuery.split("?");
  const params = new URLSearchParams(existingQuery ?? "");
  for (const [k, v] of Object.entries(utms)) {
    if (v && !params.has(k)) params.set(k, v);
  }
  const qs = params.toString();
  return `${path}${qs ? `?${qs}` : ""}${hash ? `#${hash}` : ""}`;
}
