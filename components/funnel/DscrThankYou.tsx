"use client";

import { useEffect } from "react";
import Script from "next/script";
import Link from "next/link";

interface Props {
  loSlug: string;
  loName: string;
  loNmls: string | null;
  loPhone: string | null;
}

/**
 * Fires GA4 + Google Ads conversion events once on mount.
 *
 * Google Ads conversion action:
 *   - Set your conversion label in NEXT_PUBLIC_GADS_DSCR_CONVERSION_LABEL env var
 *     e.g.  AW-123456789/AbCdEfGhIjKlMnOp
 *   - In Google Ads → Tools → Conversions → create a "Website" conversion,
 *     choose "Page load" trigger, and point it at /dscr/[lo]/thank-you
 *     OR use the gtag event name "dscr_lead_submitted" as the trigger.
 *
 * GA4 custom event:
 *   - Event name: dscr_lead_submitted
 *   - Parameters: lo_slug, funnel_type
 */
export function DscrThankYou({ loSlug, loName, loNmls, loPhone }: Props) {
  const phone = loPhone ?? "(702) 765-9800";
  const firstName = loName.split(" ")[0];

  useEffect(() => {
    if (typeof window === "undefined") return;

    // ── GA4 custom conversion event ──────────────────────────────
    window.gtag?.("event", "dscr_lead_submitted", {
      lo_slug: loSlug,
      funnel_type: "dscr-purchase",
      page_path: window.location.pathname,
    });

    // ── Google Ads conversion ping ───────────────────────────────
    // Env var takes precedence; falls back to the hardcoded label.
    const convLabel =
      process.env.NEXT_PUBLIC_GADS_DSCR_CONVERSION_LABEL ||
      "AW-18350208109/4G_RCLH9otgcEO3oh65E";
    window.gtag?.("event", "conversion", {
      send_to: convLabel,
      value: 1.0,
      currency: "USD",
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-line shadow-sm">
        <div className="container-shell flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-extrabold text-brand tracking-tight">HCMG</span>
            <span className="hidden sm:block text-xs text-muted border-l border-line pl-2">
              Harris Capital Mortgage Group
            </span>
          </Link>
          <a
            href={`tel:${phone.replace(/\D/g, "")}`}
            className="text-brand font-bold text-sm hover:text-accent transition-colors"
          >
            {phone}
          </a>
        </div>
      </nav>

      {/* ── Confirmation card ── */}
      <section className="section-pad bg-sand">
        <div className="container-shell max-w-xl">
          <div className="rounded-3xl border border-line bg-white shadow-card p-8 sm:p-10 text-center">

            {/* Check icon */}
            <div className="w-16 h-16 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-6">
              <svg className="w-9 h-9 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mb-3">
              You&apos;re All Set!
            </h1>
            <p className="text-muted text-sm leading-relaxed mb-8 max-w-sm mx-auto">
              Your DSCR eligibility request has been received.{" "}
              <strong className="text-ink">{loName}</strong> will reach out within
              2 hours to review your investment property scenario and confirm your options.
            </p>

            {/* What happens next */}
            <div className="rounded-2xl bg-brand/5 border border-brand/10 p-5 text-left mb-8">
              <p className="text-xs font-bold text-brand uppercase tracking-wider mb-4">
                What Happens Next
              </p>
              <ol className="space-y-4">
                {[
                  {
                    n: "1",
                    title: "We review your details",
                    body: "Our team reviews your property scenario — usually within 1 hour.",
                  },
                  {
                    n: "2",
                    title: `${firstName} reaches out`,
                    body: `${firstName} calls or texts to confirm your scenario and answer any questions.`,
                  },
                  {
                    n: "3",
                    title: "Pre-approval in 24–48 hours",
                    body: "No W-2s. No tax returns. Just the property details you already provided.",
                  },
                  {
                    n: "4",
                    title: "Close in 7–21 days",
                    body: "Once approved, our streamlined process gets you to the closing table fast.",
                  },
                ].map(({ n, title, body }) => (
                  <li key={n} className="flex items-start gap-4">
                    <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-extrabold text-white">{n}</span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-ink">{title}</p>
                      <p className="text-xs text-muted leading-relaxed">{body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Call CTA */}
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="primary-button w-full justify-center mb-3"
            >
              Call {firstName} Now: {phone}
            </a>
            <p className="text-xs text-muted">
              Can&apos;t wait? Call or text anytime — no hold music, no call center.
            </p>

          </div>

          {/* ── Cal.com inline booking ── */}
          <div className="mt-8 rounded-3xl border border-line bg-white shadow-card overflow-hidden">
            <div className="px-6 pt-6 pb-2 text-center">
              <p className="text-base font-extrabold text-ink">Book Your Strategy Call</p>
              <p className="text-xs text-muted mt-1">Pick a time that works — 30 minutes with {firstName} directly.</p>
            </div>
            <div
              id="my-cal-inline-dscr-strategy-call"
              style={{ width: "100%", height: "100%", overflow: "scroll" }}
            />
          </div>
          <Script
            src="https://app.cal.com/embed/embed.js"
            strategy="lazyOnload"
            onLoad={() => {
              const w = window as unknown as Record<string, unknown>;
              const Cal = w["Cal"] as ((...args: unknown[]) => void) & {
                ns: Record<string, (...args: unknown[]) => void>;
                config?: Record<string, unknown>;
              };
              if (!Cal) return;
              Cal("init", "dscr-strategy-call", { origin: "https://app.cal.com" });
              Cal.config = Cal.config || {};
              Cal.config.forwardQueryParams = true;
              Cal.ns["dscr-strategy-call"]("inline", {
                elementOrSelector: "#my-cal-inline-dscr-strategy-call",
                config: { layout: "month_view", useSlotsViewOnSmallScreen: "true" },
                calLink: "darius-james/dscr-strategy-call",
              });
              Cal.ns["dscr-strategy-call"]("ui", {
                cssVarsPerTheme: { light: { "cal-brand": "#f18800" } },
                hideEventTypeDetails: false,
                layout: "month_view",
              });
            }}
          />

          {/* NMLS disclaimer */}
          <p className="mt-8 text-center text-xs text-muted leading-relaxed">
            Harris Capital Mortgage Group, LLC · NMLS# 1918223 ·{" "}
            <strong className="text-ink">{loName}</strong>
            {loNmls ? ` · NMLS# ${loNmls}` : ""} · Licensed in FL, TX, GA, NV, CO, VA, DC, MD, CA, MS.
            This is not a commitment to lend.
          </p>
        </div>
      </section>

      {/* ── Footer links ── */}
      <footer className="bg-white border-t border-line py-6">
        <div className="container-shell text-center">
          <div className="flex justify-center gap-6 text-xs">
            <Link href="/privacy"           className="text-muted hover:text-ink">Privacy Policy</Link>
            <Link href="/terms"             className="text-muted hover:text-ink">Terms</Link>
            <Link href="/licensing"         className="text-muted hover:text-ink">Licensing</Link>
            <Link href="/legal-disclaimer"  className="text-muted hover:text-ink">Legal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
