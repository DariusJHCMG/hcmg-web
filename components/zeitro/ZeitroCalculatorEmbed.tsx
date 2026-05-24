"use client";

import Script from "next/script";
import { useState } from "react";

export default function ZeitroCalculatorEmbed() {
  const [loadFailed, setLoadFailed] = useState(false);

  return (
    <div className="w-full rounded-3xl border border-line bg-white p-4 shadow-soft sm:p-6">
      <div id="zeitro-calculator-container" className="min-h-[420px]">
        {loadFailed && (
          <div className="flex h-full min-h-[420px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              Calculator unavailable
            </div>
            <p className="max-w-md text-base text-muted">
              The mortgage calculator is temporarily unavailable. Please refresh the page or try again in a
              moment.
            </p>
          </div>
        )}
      </div>
      <Script
        id="zeitro-calculator"
        src="https://app.zeitro.com/api/zeitrotag.js?customerid=harriscapitalmortgage&loid=&pageid=calculator"
        strategy="afterInteractive"
        onError={() => setLoadFailed(true)}
      />
    </div>
  );
}
