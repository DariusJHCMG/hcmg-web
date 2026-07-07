/**
 * PostHog client — singleton wrapper.
 * Import getPostHog() anywhere client-side.
 */
import posthog from "posthog-js";

let initialised = false;

export function initPostHog() {
  if (typeof window === "undefined" || initialised) return;
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";
  if (!key) return; // silently skip if not configured
  posthog.init(key, {
    api_host: host,
    capture_pageview: false,       // we handle pageviews manually
    capture_pageleave: true,
    session_recording: {
      // mask sensitive fields automatically
      maskAllInputs: false,
      maskInputOptions: { password: true },
    },
    loaded: (ph) => {
      // In development, disable so we don't pollute PostHog
      if (process.env.NODE_ENV === "development") ph.opt_out_capturing();
    },
  });
  initialised = true;
}

export function getPostHog() {
  return posthog;
}

/** Identify a lead in PostHog so the session replay is linked to them. */
export function identifyLead(sessionId: string, traits: {
  email: string;
  name: string;
  loSlug?: string;
  loName?: string;
  utmSource?: string;
}) {
  if (!initialised) return;
  posthog.identify(sessionId, {
    email:      traits.email,
    name:       traits.name,
    lo_slug:    traits.loSlug,
    lo_name:    traits.loName,
    utm_source: traits.utmSource,
  });
}
