"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

const STATS = [
  { value: "$2.4B+", label: "In total loan volume funded" },
  { value: "500+",   label: "Loans funded" },
  { value: "4.9 ★",  label: "Average customer rating" },
];

const REVIEWS = [
  {
    initials: "SM",
    quote: "HCMG made the home buying process seamless. Their team communicated with me every step of the way and got me a rate lower than I expected. Highly recommend!",
    name: "Sarah M.",
    location: "Las Vegas, NV",
  },
  {
    initials: "JT",
    quote: "As a first-time homebuyer, I had so many questions. The HCMG team answered every call and email promptly. They made me feel like family.",
    name: "James T.",
    location: "Henderson, NV",
  },
  {
    initials: "MG",
    quote: "Refinancing with HCMG saved me over $300 a month. The process was quick and hassle-free. I'll definitely use them again.",
    name: "Maria G.",
    location: "Houston, TX",
  },
  {
    initials: "DR",
    quote: "I've worked with many lenders, but HCMG stands out for their transparency and honesty. No hidden fees — what they quoted is what I got.",
    name: "David R.",
    location: "Las Vegas, NV",
  },
  {
    initials: "JL",
    quote: "The team at HCMG helped me secure financing for my first investment property. They explained DSCR loans clearly and got the deal done fast.",
    name: "Jennifer L.",
    location: "Dallas, TX",
  },
  {
    initials: "RK",
    quote: "Friendly, professional, and always available. HCMG made buying my home a joy instead of a stress.",
    name: "Robert K.",
    location: "Las Vegas, NV",
  },
];

export function TrustSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section ref={ref} className="section-pad bg-sand">
      <div className="container-shell">
        <SectionEyebrow>Social Proof</SectionEyebrow>

        {/* Stats */}
        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          {STATS.map((s, i) => (
            <motion.div
              key={s.value}
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl border border-line bg-white p-7 text-center"
            >
              <div className="ok-gradient-text mb-2 font-extrabold" style={{ fontSize: 36 }}>{s.value}</div>
              <div className="text-sm font-medium text-muted">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Reviews */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.12 }}
              className="glass-card p-8"
            >
              <div className="ok-gradient-text mb-4 font-extrabold leading-none" style={{ fontSize: 56 }}>"</div>
              <blockquote className="text-base font-semibold leading-relaxed text-ink">
                {r.quote}
              </blockquote>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "var(--ok-gradient)" }}>
                  {r.initials}
                </div>
                <div>
                  <div className="font-bold text-ink">{r.name}</div>
                  <div className="text-xs text-muted">{r.location}</div>
                  <div className="mt-0.5 text-sm text-accent">★★★★★</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
