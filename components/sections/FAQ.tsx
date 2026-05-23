"use client";

import { useState } from "react";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { FAQS } from "@/data/faqs";

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="section-pad bg-sand">
      <div className="container-shell mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <SectionEyebrow>FAQ</SectionEyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink lg:text-5xl">Common questions</h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((item, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-3xl border border-line bg-white transition-all duration-200"
              style={{ borderLeft: open === i ? "4px solid #F37021" : "4px solid transparent" }}
            >
              <button
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span className="text-base font-semibold text-ink">{item.q}</span>
                <span
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-transform duration-200"
                  style={{
                    background: open === i ? "var(--ok-gradient)" : "#F1F5F9",
                    transform: open === i ? "rotate(45deg)" : "none",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 1v10M1 6h10" stroke={open === i ? "white" : "#64748B"} strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              {open === i && (
                <div className="px-6 pb-5 text-sm leading-7 text-muted motion-step-in">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
