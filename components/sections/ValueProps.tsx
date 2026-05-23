"use client";

import { useInView } from "react-intersection-observer";
import { motion } from "framer-motion";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

const CARDS = [
  {
    icon: "⚡",
    title: "60-second estimate",
    body: "Four quick questions. Your buying power range instantly. No forms to fill, no waiting, no hard pull.",
  },
  {
    icon: "🎯",
    title: "Real payment context",
    body: "We show you principal, taxes, insurance, and HOA together — the real monthly number, not just P&I.",
  },
  {
    icon: "🛡️",
    title: "No credit impact",
    body: "Your estimate uses only what you share with us. We never pull your credit without your written permission.",
  },
];

export function ValueProps() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <section ref={ref} className="section-pad bg-sand">
      <div className="container-shell">
        <div className="mx-auto max-w-2xl text-center">
          <SectionEyebrow>Why HCMG</SectionEyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink lg:text-5xl">
            The faster path to knowing your numbers
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted">
            Most people spend weeks talking to lenders before understanding what they can actually afford.
            HCMG flips that. Know your numbers first.
          </p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {CARDS.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-accent/30 hover:shadow-orange"
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                style={{ background: "var(--ok-gradient)" }}
              >
                {card.icon}
              </div>
              <h3 className="mb-3 text-xl font-bold text-ink">{card.title}</h3>
              <p className="text-sm leading-7 text-muted">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
