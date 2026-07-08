"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { OrangeKeyLogo } from "@/components/ui/OrangeKeyLogo";

function InstallContent() {
  const params = useSearchParams();
  const device = params.get("device") ?? "other";

  const isIos     = device === "ios";
  const isAndroid = device === "android";

  const steps = isIos
    ? [
        { text: "Make sure you're in <strong>Safari</strong> — not Chrome or another browser" },
        { text: "Tap the <strong>Share</strong> button at the bottom of the screen (box with an arrow pointing up)" },
        { text: "Scroll down and tap <strong>\"Add to Home Screen\"</strong>" },
        { text: "Tap <strong>Add</strong> — the HCMG icon will appear on your home screen" },
      ]
    : isAndroid
    ? [
        { text: "Make sure you're in <strong>Chrome</strong> — not Safari or another browser" },
        { text: "Tap the <strong>three-dot menu</strong> in the top-right corner" },
        { text: "Tap <strong>\"Add to Home screen\"</strong> or <strong>\"Install app\"</strong>" },
        { text: "Tap <strong>Add</strong> — the HCMG icon will appear on your home screen" },
      ]
    : [
        { text: "Open this page in your phone's default browser" },
        { text: "Use your browser's menu to find <strong>\"Add to Home Screen\"</strong> or <strong>\"Install app\"</strong>" },
        { text: "Tap <strong>Add</strong> — the HCMG icon will appear on your home screen" },
      ];

  const portalUrl = "https://hcmgloans.com/portal";

  return (
    <div className="min-h-screen bg-sand flex flex-col items-center justify-center px-4 py-12">
      {/* Card */}
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-line bg-white shadow-card">

        {/* Header bar */}
        <div className="px-6 pt-7 pb-6 text-center" style={{ background: "linear-gradient(135deg,#142850,#1e3a6e)" }}>
          <div className="mb-4 flex justify-center">
            <OrangeKeyLogo variant="primary-dark" size={36} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60 mb-1">
            {isIos ? "iPhone / iPad" : isAndroid ? "Android" : "Mobile"} Install
          </p>
          <h1 className="text-xl font-extrabold text-white leading-tight">
            Add HCMG to your<br />home screen
          </h1>
          <p className="mt-2 text-xs text-white/60">
            No App Store · Works on any phone · Free
          </p>
        </div>

        {/* Steps */}
        <div className="px-6 py-6 space-y-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-extrabold text-white"
                style={{ background: "linear-gradient(135deg,#F37021,#FF9847)" }}>
                {i + 1}
              </div>
              <p
                className="pt-1 text-sm leading-6 text-ink"
                dangerouslySetInnerHTML={{ __html: s.text }}
              />
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="mx-6 border-t border-line" />

        {/* CTA — open portal (triggers install banner on Android Chrome) */}
        <div className="px-6 py-6 space-y-3">
          <a
            href={portalUrl}
            className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white transition hover:opacity-90"
            style={{ background: "linear-gradient(90deg,#F37021,#FF9847)" }}
          >
            Open Portal Now →
          </a>
          <p className="text-center text-[11px] text-muted">
            {isIos
              ? "Tap Share ↑ then \"Add to Home Screen\" after opening"
              : isAndroid
              ? "Chrome will show an \"Install app\" banner after opening"
              : "Follow your browser's prompt after opening"}
          </p>
        </div>
      </div>

      {/* Already installed note */}
      <p className="mt-6 max-w-xs text-center text-xs text-muted">
        Already installed? Open the HCMG icon on your home screen — it launches directly to your dashboard with no browser bar.
      </p>
    </div>
  );
}

export default function InstallPage() {
  return (
    <Suspense>
      <InstallContent />
    </Suspense>
  );
}
