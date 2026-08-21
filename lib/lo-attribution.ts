/**
 * LO Attribution — stores the last LO slug a visitor landed on via a team page.
 * Uses sessionStorage so attribution is tab-scoped and never persists across sessions.
 * Expiry is 24 hours within the session as a safety guard.
 */

const KEY      = "hcmg_lo_attr";
const EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

interface LoAttr {
  slug:      string;
  expiresAt: number;
}

export function setLoAttribution(slug: string): void {
  if (typeof window === "undefined") return;
  const attr: LoAttr = { slug, expiresAt: Date.now() + EXPIRY_MS };
  sessionStorage.setItem(KEY, JSON.stringify(attr));
}

export function getLoAttribution(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const attr = JSON.parse(raw) as LoAttr;
    if (Date.now() > attr.expiresAt) {
      sessionStorage.removeItem(KEY);
      return null;
    }
    return attr.slug;
  } catch {
    return null;
  }
}

export function clearLoAttribution(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
