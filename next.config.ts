import type { NextConfig } from "next";

// ── HTTP Security Headers ──────────────────────────────────────────────────────
// Applied to every response. These headers block the most common web-layer
// attacks against a financial application handling NPI.
//
// Legal basis: FTC Safeguards Rule 16 CFR § 314.4(c) requires "technical
// safeguards" including access controls and encryption. Security headers are
// the baseline technical safeguard for web applications.

const SECURITY_HEADERS = [
  // ── Content-Security-Policy ──────────────────────────────────────────────
  // NOTE: CSP is set dynamically in middleware.ts using a per-request nonce.
  // This removes 'unsafe-inline' from script-src entirely (A+ score).
  // The static header below is a fallback for routes not covered by the
  // middleware matcher (e.g. Next.js static file routes). The nonce-based
  // policy in middleware.ts takes precedence on all app routes.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' https://us.i.posthog.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://iryqfwktlwcqqlmvtngx.supabase.co wss://iryqfwktlwcqqlmvtngx.supabase.co https://us.i.posthog.com https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; "),
  },
  // ── Strict-Transport-Security ────────────────────────────────────────────
  // Forces HTTPS for 2 years on this domain + all subdomains.
  // includeSubDomains protects api.hcmgloans.com etc.
  // preload submits to the HSTS preload list — browsers never send HTTP at all.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // ── X-Frame-Options ──────────────────────────────────────────────────────
  // Belt-and-suspenders clickjacking defence (fallback for old browsers
  // that don't parse CSP frame-ancestors).
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  // ── X-Content-Type-Options ───────────────────────────────────────────────
  // Blocks MIME sniffing. Without this a malicious file upload could be
  // re-interpreted as HTML/JS and execute in the victim's browser.
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  // ── Referrer-Policy ──────────────────────────────────────────────────────
  // Loan detail pages are at /liftoff/{uuid}. Without this the full UUID
  // URL appears in the Referer header sent to PostHog, Google, etc.
  // strict-origin-when-cross-origin sends only the origin on cross-origin
  // requests and the full URL only on same-origin requests.
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  // ── Permissions-Policy ───────────────────────────────────────────────────
  // Explicitly disable browser features HCMG never uses.
  // Reduces attack surface if a third-party script is ever compromised.
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply to every route — API routes, pages, static assets
        source: "/:path*",
        headers: SECURITY_HEADERS,
      },
    ];
  },

  async redirects() {
    return [
      { source: "/contact-us",                                    destination: "/contact",                           permanent: true },
      { source: "/fha-loans",                                     destination: "/loans/fha",                         permanent: true },
      { source: "/fha",                                           destination: "/loans/fha",                         permanent: true },
      { source: "/va-loans",                                      destination: "/loans/va",                          permanent: true },
      { source: "/conventional-loans",                            destination: "/loans/conventional",                permanent: true },
      { source: "/jumbo-loans",                                   destination: "/loans/jumbo",                       permanent: true },
      { source: "/fixed-loans",                                   destination: "/loans/conventional",                permanent: true },
      { source: "/fixed-rate-loans",                              destination: "/loans/conventional",                permanent: true },
      { source: "/adjustable-rate",                               destination: "/loans/arm",                         permanent: true },
      { source: "/adjustable-rate-mortgage-loans-arm",            destination: "/loans/arm",                         permanent: true },
      { source: "/purchase",                                      destination: "/loans/first-time-buyer",            permanent: true },
      { source: "/rate-check",                                    destination: "/get-started",                       permanent: true },
      { source: "/mortgage-application",                          destination: "/get-started",                       permanent: true },
      { source: "/apply",                                         destination: "/get-started",                       permanent: true },
      { source: "/calculators",                                   destination: "/mortgage-calculator",               permanent: true },
      { source: "/mortgage-affordability-calculator",             destination: "/mortgage-calculator",               permanent: true },
      { source: "/mortgage-faqs",                                 destination: "/learn",                             permanent: true },
      { source: "/guides/savannah-mortgage",                      destination: "/learn/savannah-ga-mortgage-guide",  permanent: true },
      { source: "/privacy-policy",                                destination: "/privacy",                           permanent: true },
      { source: "/seo/orlando-fl-fha-loan",                       destination: "/seo/orlando-fha-loan",              permanent: true },
    ];
  },
};

export default nextConfig;
