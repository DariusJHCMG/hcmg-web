"use client";

import Link from "next/link";
import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

const STEPS = [
  { num: "01", title: "Tell us your goal", body: "Buy, refinance, or compare options — tell us what you're trying to accomplish." },
  { num: "02", title: "Share a few details", body: "Price range, credit range, income range. Quick-select — no typing required." },
  { num: "03", title: "See your estimate", body: "Instant buying power, estimated monthly payment, and recommended loan type." },
  { num: "04", title: "Connect when ready", body: "A Harris Capital loan officer will reach out within one business day." },
];

export function HowItWorks() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section ref={ref} className="section-pad bg-white">
      <div className="container-shell">
        <div className="mx-auto max-w-xl text-center">
          <SectionEyebrow>The Process</SectionEyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink lg:text-5xl">
            Four steps to knowing your numbers
          </h2>
          <p className="mt-4 text-lg text-muted">Takes under a minute. No credit check.</p>
        </div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl border border-line bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:border-accent/25 hover:shadow-soft"
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-extrabold text-white"
                style={{ background: "var(--ok-gradient)" }}
              >
                {s.num}
              </div>
              <h3 className="mb-3 text-lg font-bold text-ink">{s.title}</h3>
              <p className="text-sm leading-7 text-muted">{s.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link href="/get-started" className="primary-button">
            Get my estimate →
          </Link>
        </div>
      </div>
    </section>
  );
}
