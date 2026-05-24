"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";

/**
 * Embeds Zeitro's pricing engine via the same `zeitrotag.js` loader we use
 * for the calculator. The Zeitro script injects an iframe into the
 * container div below.
 *
 * If the iframe never populates (Zeitro hasn't enabled `pageid=pricing`
 * for this customer account, or requires LO login), we show a fallback
 * message after a short timeout so visitors don't stare at empty space.
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
        id="zeitro-pricing-container"
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
            <h4 className="text-base font-bold text-ink">Live pricing engine isn&apos;t reachable right now.</h4>
            <p className="mt-2 text-sm leading-6 text-muted">
              The Zeitro pricing widget didn&apos;t load — either it isn&apos;t enabled for public preview on
              your account, or you&apos;ll need API credentials to embed it directly.
            </p>
            <p className="mt-3 text-xs text-muted/70">
              To enable: contact your Zeitro account rep and request public-preview embedding (or API access)
              for customer ID <code className="rounded bg-white px-1.5 py-0.5 font-mono">harriscapitalmortgage</code>.
            </p>
          </div>
        </div>
      )}

      <Script
        id="zeitro-pricing"
        src="https://app.zeitro.com/api/zeitrotag.js?customerid=harriscapitalmortgage&loid=&pageid=pricing"
        strategy="afterInteractive"
        onError={() => setStatus("unavailable")}
      />
    </div>
  );
}
