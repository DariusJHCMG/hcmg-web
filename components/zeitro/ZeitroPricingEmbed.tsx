"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Loads the HCMG live pricing widget into a contained area of the page.
 *
 * The vendor (Zeitro) loader looks for an HTML element with id="zeitrotag"
 * via `getElementById` and injects an iframe adjacent to it. We can't use
 * `next/script` for this because it places scripts in <head>, which would
 * cause the iframe to appear in the wrong DOM location. Instead we
 * dynamically create the script element inside our own container so the
 * iframe lands exactly where we want it.
 *
 * IMPORTANT: only one of these embeds can render per page, the loader
 * uses a fixed element id and multiple instances would collide.
 */
const SCRIPT_SRC =
  "https://app.zeitro.com/api/zeitrotag.js?customerid=harriscapitalmortgage&loid=&pageid=todayrates";

export default function ZeitroPricingEmbed() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resolved = false;
    const finish = (next: "ready" | "unavailable") => {
      if (resolved) return;
      resolved = true;
      setStatus(next);
      observer.disconnect();
      clearTimeout(timeoutId);
    };

    // Watch for an iframe to be inserted anywhere under our container.
    const observer = new MutationObserver(() => {
      if (container.querySelector("iframe")) finish("ready");
    });
    observer.observe(container, { childList: true, subtree: true });

    // Inject the loader script inside our container so the iframe lands here.
    const script = document.createElement("script");
    script.id = "zeitrotag";
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onerror = () => finish("unavailable");
    container.appendChild(script);

    const timeoutId = window.setTimeout(() => finish("unavailable"), 12000);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
      try {
        script.remove();
      } catch {
        /* ignore */
      }
    };
  }, []);

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="min-h-[640px] w-full overflow-hidden rounded-2xl border border-line bg-white"
      />

      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
            <p className="text-sm font-semibold text-muted">Loading pricing engine…</p>
          </div>
        </div>
      )}

      {status === "unavailable" && (
        <div className="absolute inset-0 flex items-center justify-center bg-sand/95 px-6">
          <div className="max-w-md text-center">
            <h4 className="text-base font-bold text-ink">Pricing engine is temporarily unavailable.</h4>
            <p className="mt-2 text-sm leading-6 text-muted">
              We couldn&apos;t load the live engine just now. Please refresh the page or try again in a
              moment, if it keeps failing, our team is already on it.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
