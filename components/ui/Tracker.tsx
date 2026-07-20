"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initSessionMeta, trackContactAction, trackPageView } from "@/lib/tracker";
import { initPostHog, getPostHog } from "@/lib/posthog";

/**
 * Mounted once in root layout.
 * - Initialises PostHog on first hydration
 * - Captures session meta (entry page, referrer, device) once per tab
 * - Fires a page_view event on every route change
 * Renders nothing.
 */
export function Tracker() {
  const pathname  = usePathname();
  const prevPath  = useRef<string | null>(null);

  useEffect(() => {
    initPostHog();
    initSessionMeta();

    const trackHighIntentClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      if (href.startsWith("tel:")) trackContactAction("phone_click", href.slice(4));
      else if (href.startsWith("mailto:")) trackContactAction("email_click", href.slice(7));
      else if (/^\/team\/[^/]+/.test(href)) trackContactAction("officer_profile_click", href);
    };
    document.addEventListener("click", trackHighIntentClick);
    return () => document.removeEventListener("click", trackHighIntentClick);
  }, []);

  useEffect(() => {
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;

    trackPageView(pathname);

    // PostHog page view
    const ph = getPostHog();
    if (ph.__loaded) {
      ph.capture("$pageview", { $current_url: window.location.href });
    }
  }, [pathname]);

  return null;
}
