"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { initSessionMeta, trackPageView } from "@/lib/tracker";
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
