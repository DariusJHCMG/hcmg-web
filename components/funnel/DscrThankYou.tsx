"use client";

import { useEffect, useRef } from "react";

interface Props {
  loSlug: string;
  loName: string;
  loNmls: string | null;
  loPhone: string | null;
}

export function DscrThankYou({ loSlug, loName, loNmls, loPhone }: Props) {
  const phone = loPhone ?? "(702) 765-9800";
  const firstName = loName.split(" ")[0];
  const calMounted = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.gtag?.("event", "dscr_lead_submitted", {
      lo_slug: loSlug,
      funnel_type: "dscr-purchase",
      page_path: window.location.pathname,
    });
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


  const STEPS = [
    { n: "1", title: "We review your details",       body: "Your property scenario is reviewed — usually within 1 hour." },
    { n: "2", title: `${firstName} reaches out`,     body: `${firstName} calls or texts to confirm your deal and answer questions.` },
    { n: "3", title: "Pre-approval in 24–48 hrs",    body: "No W-2s. No tax returns. Just the property details you provided." },
    { n: "4", title: "Close in 7–21 days",           body: "Our streamlined process gets you to the closing table fast." },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ background: "#f7f8fa" }}>

      {/* ── Nav — no link, not clickable ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-line shadow-sm">
        <div className="container-shell flex items-center justify-between h-14">
          {/* Plain div — intentionally not a link */}
          <div className="flex items-center gap-2 select-none">
            <span className="text-base font-extrabold tracking-tight" style={{ color: "#142850" }}>HCMG</span>
            <span className="hidden sm:block text-xs text-muted border-l border-line pl-2">Harris Capital Mortgage Group</span>
          </div>
          <a
            href={`tel:${phone.replace(/\D/g, "")}`}
            className="text-sm font-bold transition-colors"
            style={{ color: "#142850" }}
          >
            {phone}
          </a>
        </div>
      </nav>

      {/* ── Hero banner ── */}
      <div className="py-8 px-4 text-center" style={{ background: "#142850" }}>
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.25)" }}>
          <svg className="w-8 h-8" fill="none" stroke="#ffffff" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">You&apos;re All Set!</h1>
        <p className="text-sm text-white/70 max-w-sm mx-auto leading-relaxed">
          Your DSCR eligibility request has been received.{" "}
          <span className="text-white font-semibold">{loName}</span> will reach out within 2 hours.
        </p>
      </div>

      <div className="px-4 py-8 max-w-2xl mx-auto space-y-5">

        {/* ── What happens next ── */}
        <div className="rounded-2xl bg-white border border-line p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: "#142850" }}>
            What Happens Next
          </p>
          <ol className="space-y-5">
            {STEPS.map(({ n, title, body }) => (
              <li key={n} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "#142850" }}>
                  <span className="text-xs font-extrabold text-white">{n}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">{title}</p>
                  <p className="text-xs text-muted leading-relaxed mt-0.5">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ── Call / text CTAs ── */}
        <div className="rounded-2xl bg-white border border-line p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-4" style={{ color: "#142850" }}>
            Can&apos;t Wait? Reach Out Now
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={`tel:${phone.replace(/\D/g, "")}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "#142850" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {firstName}: {phone}
            </a>
            <a
              href={`sms:${phone.replace(/\D/g, "")}`}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: "#f0f4ff", color: "#142850", border: "1px solid #c7d2fe" }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              Text {firstName}
            </a>
          </div>
        </div>

        {/* ── Book a call ── */}
        <div className="rounded-2xl bg-white border border-line p-6">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: "#142850" }}>
            Schedule a Call
          </p>
          <p className="text-xs text-muted mb-4">
            Book a free 30-minute strategy call with {firstName} — no pressure, just answers.
          </p>
          <a
            href="https://cal.com/darius-james/dscr-strategy-call"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-xl py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: "#142850" }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book a 30-Minute Strategy Call
          </a>
        </div>

        {/* ── NMLS disclaimer ── */}
        <p className="text-center text-[11px] text-muted leading-relaxed pb-4">
          Harris Capital Mortgage Group, LLC · NMLS# 1918223 ·{" "}
          <strong className="text-ink">{loName}</strong>
          {loNmls ? ` · NMLS# ${loNmls}` : ""} · Licensed in FL, TX, GA, NV, CO, VA, DC, MD, CA, MS.{" "}
          Not a commitment to lend. Subject to credit approval.
        </p>

      </div>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-line py-5">
        <div className="container-shell text-center">
          <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 text-[11px] text-muted">
            <a href="/privacy"          className="hover:text-ink">Privacy Policy</a>
            <a href="/terms"            className="hover:text-ink">Terms of Use</a>
            <a href="/licensing"        className="hover:text-ink">Licensing</a>
            <a href="/legal-disclaimer" className="hover:text-ink">Legal Disclaimer</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
