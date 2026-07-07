"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { formatCurrency } from "@/lib/calculators";
import { UtmLink } from "@/components/ui/UtmLink";

const TRUST_ITEMS = [
  { icon: "🔒", label: "No hard credit check" },
  { icon: "⚡", label: "Results in 60 seconds" },
  { icon: "✓", label: "No commitment required" },
];

const BREAKDOWN = [
  { label: "Principal & interest", value: 2212 },
  { label: "Property taxes (est.)", value: 425 },
  { label: "Homeowner's insurance", value: 160 },
  { label: "HOA", value: 50 },
];
const TOTAL = BREAKDOWN.reduce((s, r) => s + r.value, 0);

export function Hero() {
  const [entered, setEntered] = useState(false);
  useEffect(() => { const id = requestAnimationFrame(() => setEntered(true)); return () => cancelAnimationFrame(id); }, []);

  return (
    <section className="relative overflow-hidden bg-white" style={{ paddingTop: "clamp(72px, 10vw, 120px)", paddingBottom: "clamp(64px, 8vw, 100px)" }}>
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-hero-glow" />

      <div className="container-shell grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left, headline */}
        <div>
          <div className={entered ? "motion-rise motion-delay-1" : "motion-prep"}>
            <SectionEyebrow className="mb-6">
              Harris Capital Mortgage Group · NMLS# 1918223
            </SectionEyebrow>
          </div>

          <h1
            className={`font-extrabold leading-[1.08] tracking-tight text-ink ${entered ? "motion-rise motion-delay-2" : "motion-prep"}`}
            style={{ fontSize: "clamp(40px, 6vw, 72px)" }}
          >
            Find out what you<br />can{" "}
            <span className="ok-gradient-text">afford</span>
            <br />in 60 seconds.
          </h1>

          <p
            className={`mt-6 max-w-xl text-lg leading-8 text-muted lg:text-xl ${entered ? "motion-rise motion-delay-3" : "motion-prep"}`}
          >
            No hard credit check. No pressure. Just a fast, honest look at your
            buying power, before you ever talk to a lender.
          </p>

          {/* Trust row */}
          <div className={`mt-6 flex flex-wrap gap-x-6 gap-y-2 ${entered ? "motion-rise motion-delay-3" : "motion-prep"}`}>
            {TRUST_ITEMS.map((t) => (
              <span key={t.label} className="flex items-center gap-2 text-sm font-semibold text-muted">
                <span>{t.icon}</span>
                {t.label}
              </span>
            ))}
          </div>

          {/* CTAs */}
          <div className={`mt-8 flex flex-wrap gap-3 ${entered ? "motion-rise motion-delay-4" : "motion-prep"}`}>
            <UtmLink href="/get-started" className="primary-button !text-base !px-7 !py-4">
              See what I qualify for →
            </UtmLink>
            <a href="#calculator" className="secondary-button !text-base !px-7 !py-4">
              Try the calculator
            </a>
          </div>

          <p className={`mt-5 text-xs text-muted/60 ${entered ? "motion-rise motion-delay-4" : "motion-prep"}`}>
            Trusted by home buyers in FL · TX · GA · NV · CO · VA · DC · MD
          </p>
        </div>

        {/* Right, payment preview card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={entered ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5, type: "spring", stiffness: 90 }}
          className="relative"
        >
          {/* No-credit badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={entered ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.9, type: "spring", stiffness: 200 }}
            className="absolute -top-4 right-6 z-10 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-orange"
            style={{ background: "var(--ok-gradient)" }}
          >
            No credit check required
          </motion.div>

          <div className="glass-card overflow-hidden">
            {/* Orange strip header */}
            <div
              className="flex items-center justify-center px-6 py-3.5"
              style={{ background: "var(--ok-gradient)" }}
            >
              <span className="text-sm font-semibold text-white">Your estimated monthly payment</span>
            </div>

            <div className="p-6 lg:p-8">
              {/* Big number */}
              <div className="mb-1 text-center">
                <span className="font-extrabold tracking-tight text-ink" style={{ fontSize: 52 }}>
                  {formatCurrency(TOTAL)}
                </span>
                <span className="text-xl font-semibold text-muted">/month</span>
              </div>
              <p className="mb-6 text-center text-xs text-muted/60">
                Based on $425,000 · 6.5% rate · 20% down
              </p>

              {/* Breakdown rows */}
              <div className="space-y-3 border-t border-line pt-5">
                {BREAKDOWN.map((row) => (
                  <div key={row.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted">{row.label}</span>
                    <span className="font-semibold text-ink">{formatCurrency(row.value)}</span>
                  </div>
                ))}
              </div>

              <div className="my-5 border-t border-line" />

              {/* Disclosure */}
              <p className="mb-5 text-center text-xs text-muted/50">
                Estimate only. Not a loan commitment.
              </p>

              {/* CTA */}
              <UtmLink href="/get-started" className="primary-button w-full justify-center !py-3.5">
                Get my actual estimate →
              </UtmLink>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
