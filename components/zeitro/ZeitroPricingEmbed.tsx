"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

/**
 * Loads the HCMG pricing engine via the white-labeled vendor embed.
 * The vendor (Zeitro) script injects an iframe into the container div.
 *
 * Visible UI copy is intentionally white-labeled — no vendor name appears
 * to the visitor. If the iframe never populates we show a neutral fallback
 * so visitors don't stare at empty space.
 */
export default function ZeitroPricingEmbed() {
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">("loading");
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Observe the container — if any child element appears, we know the
  // Zeitro script populated it and we can flip to "ready". If nothing
  // shows up after ~10s, mark it unavailable.
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

    const observer = new MutationObserver(() => {
      if (container.children.length > 0) finish("ready");
    });
    observer.observe(container, { childList: true, subtree: true });

    const timeoutId = window.setTimeout(() => finish("unavailable"), 10000);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="relative w-full">
      <div
        id="zeitro-todayrates-container"
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
              moment — if it keeps failing, our team is already on it.
            </p>
          </div>
        </div>
      )}

      <Script
        id="hcmg-pricing-engine"
        src="https://app.zeitro.com/api/zeitrotag.js?customerid=harriscapitalmortgage&loid=&pageid=todayrates"
        strategy="afterInteractive"
        onError={() => setStatus("unavailable")}
      />
    </div>
  );
}
