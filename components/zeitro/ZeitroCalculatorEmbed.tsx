"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Loads the HCMG mortgage calculator widget. Same dynamic-injection
 * approach as ZeitroPricingEmbed — the vendor loader looks for
 * id="zeitrotag" and injects the iframe next to that script element.
 *
 * IMPORTANT: only one Zeitro-backed embed can render per page.
 */
const SCRIPT_SRC =
  "https://app.zeitro.com/api/zeitrotag.js?customerid=harriscapitalmortgage&loid=&pageid=calculator";

export default function ZeitroCalculatorEmbed() {
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

    const observer = new MutationObserver(() => {
      if (container.querySelector("iframe")) finish("ready");
    });
    observer.observe(container, { childList: true, subtree: true });

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
    <div className="w-full rounded-3xl border border-line bg-white p-4 shadow-soft sm:p-6">
      <div className="relative">
        <div ref={containerRef} className="min-h-[480px] w-full" />

        {status === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <div className="text-center">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
              <p className="text-sm font-semibold text-muted">Loading calculator…</p>
            </div>
          </div>
        )}

        {status === "unavailable" && (
          <div className="absolute inset-0 flex items-center justify-center px-6">
            <div className="max-w-md text-center">
              <div className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted">
                Calculator unavailable
              </div>
              <p className="text-base text-muted">
                The calculator is temporarily unavailable. Please refresh the page or try again in a moment.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
