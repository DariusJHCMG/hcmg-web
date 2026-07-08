"use client";

import Script from "next/script";

/**
 * Injects the GA4 gtag.js script.
 * id prop takes precedence; falls back to NEXT_PUBLIC_GA_MEASUREMENT_ID env var.
 */
export function GoogleAnalytics({ id: idProp }: { id?: string | null }) {
  const id = idProp || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${id}', { page_path: window.location.pathname });
        `}
      </Script>
    </>
  );
}
