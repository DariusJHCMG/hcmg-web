"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

const STATS = [
  { value: "$2.4B+", label: "In total loan volume funded" },
  { value: "4,800+", label: "Families helped into homes" },
  { value: "4.9 ★", label: "Average customer rating" },
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

        {/* Testimonial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="glass-card mt-8 p-8 lg:p-12"
        >
          <div className="ok-gradient-text mb-4 font-extrabold leading-none" style={{ fontSize: 72 }}>"</div>
          <blockquote className="max-w-4xl font-semibold leading-relaxed text-ink" style={{ fontSize: "clamp(22px, 3vw, 32px)" }}>
            HCMG gave me real numbers in under a minute. I finally understood what I could afford — and my loan officer walked me through every detail from start to finish. Closed in 26 days.
          </blockquote>
          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: "var(--ok-gradient)" }}>
              MW
            </div>
            <div>
              <div className="font-bold text-ink">Marcus Webb</div>
              <div className="text-sm text-muted">First-time buyer · Dallas, TX</div>
              <div className="mt-0.5 text-accent">★★★★★</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
