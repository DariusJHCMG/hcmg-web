"use client";

import { useState } from "react";

interface FAQItem {
  q: string;
  a: string;
}

const LAMONT_FAQS: FAQItem[] = [
  {
    q: "How is working with HCMG different from going to my bank?",
    a: "Your bank can only offer you their own products and rates. As an independent mortgage broker, HCMG has access to dozens of lenders and hundreds of loan programs — which means we compare the market for you and find the deal that actually fits your situation, not just what one institution happens to offer this week.",
  },
  {
    q: "Does it cost anything to work with Lamont or HCMG?",
    a: "Our consultation is completely free and there's no obligation. Lender-paid compensation means in most cases you pay nothing out of pocket for our origination services. We'll be transparent about all fees upfront — no surprises at closing.",
  },
  {
    q: "Can you help me if I have bad credit or a past bankruptcy?",
    a: "Yes. We work with lenders who specialize in non-QM, FHA, and credit-flexible programs. Depending on how long ago a bankruptcy or foreclosure occurred, there may be strong options available to you. The only way to know is to have a real conversation — reach out and we'll walk through your file honestly.",
  },
  {
    q: "How long does the mortgage process take from application to closing?",
    a: "A typical purchase can close in 21–30 days when the file is clean and both sides are responsive. Some scenarios — VA loans, unique properties, self-employed borrowers — may take a few days longer. We'll give you a realistic timeline up front so you're never left guessing.",
  },
  {
    q: "I already have a mortgage. Can I still refinance or save money?",
    a: "Absolutely. Even if your current rate feels locked in, a cash-out refinance, rate-and-term refi, or debt consolidation refi might significantly reduce your monthly outlay. We run the numbers at no cost — if it doesn't pencil out we'll tell you, and if it does we'll show you exactly what you save.",
  },
  {
    q: "What loan programs does HCMG offer?",
    a: "Conventional (Fannie/Freddie), FHA, VA, USDA, jumbo, non-QM/bank statement loans, down payment assistance programs, renovation loans (FHA 203k, Homestyle), and more. If it exists, we can likely source it. Start the estimate flow above and we'll match you to the right program for your goals.",
  },
  {
    q: "Will applying hurt my credit score?",
    a: "The initial consultation and pre-qualification does not require a hard pull. When you're ready to submit a full application we'll run a soft check first to see where you stand, and we'll discuss the impact of a hard inquiry before we ever touch your credit.",
  },
];

export function FAQSection({ firstName }: { firstName: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-sand py-20">
      <div className="container-shell max-w-3xl">
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">Common Questions</p>
          <h2 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
            Your questions, answered by {firstName}.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted">
            Straight answers about the mortgage process — no jargon, no sales pitch.
          </p>
        </div>

        <div className="space-y-3">
          {LAMONT_FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <div
                key={i}
                className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                  isOpen
                    ? "border-accent/30 bg-white shadow-soft"
                    : "border-line bg-white hover:border-accent/20"
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={`text-base font-bold leading-snug transition-colors ${isOpen ? "text-accent" : "text-ink"}`}>
                    {faq.q}
                  </span>
                  <span
                    className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                      isOpen
                        ? "border-accent bg-accent text-white rotate-45"
                        : "border-line bg-sand text-muted"
                    }`}
                    aria-hidden
                  >
                    <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M6 1v10M1 6h10" />
                    </svg>
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-accent/10 px-6 pb-5 pt-4">
                    <p className="text-base leading-7 text-muted">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
