import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "About HCMG · Harris Capital Mortgage Group",
  description:
    "Learn about Harris Capital Mortgage Group — a multi-state mortgage lender dedicated to helping families achieve homeownership with transparency and speed. NMLS# 1918223.",
  alternates: { canonical: "https://hcmgloans.com/about" },
};

const VALUES = [
  {
    title: "Integrity",
    body: "We do what we say, and we say what we mean.",
  },
  {
    title: "Excellence",
    body: "We strive for the best in everything we do.",
  },
  {
    title: "Accountability",
    body: "We take ownership of our clients' success.",
  },
  {
    title: "Service",
    body: "Our clients come first, always.",
  },
];

const PILLARS = [
  {
    label: "Our Mission",
    body: "To provide transparent, efficient mortgage solutions that help families achieve homeownership with confidence.",
  },
  {
    label: "Our Vision",
    body: "To be the most trusted mortgage lender in every community we serve, known for integrity and expertise.",
  },
  {
    label: "Our Promise",
    body: "No hidden fees, no surprises. Clear communication and honest guidance from application to closing.",
  },
];

export default function AboutPage() {
  return (
    <main>
      <NavBar />

      {/* ── Hero ── */}
      <section className="section-pad border-b border-line bg-sand">
        <div className="container-shell max-w-3xl text-center">
          <div className="ok-gradient-text mb-3 text-xs font-bold uppercase tracking-[0.2em]">
            Harris Capital Mortgage Group · NMLS# 1918223
          </div>
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-ink lg:text-5xl">
            HCMG
          </h1>
          <p className="mb-2 text-lg font-semibold text-muted">
            Integrity&nbsp;•&nbsp;Excellence&nbsp;•&nbsp;Service
          </p>
          <p className="mb-8 text-base leading-7 text-muted">
            A multi‑state mortgage lender dedicated to helping families achieve homeownership
            with transparency and speed.
          </p>
          <Link href="/get-started" className="primary-button">
            Get Started →
          </Link>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="section-pad">
        <div className="container-shell max-w-3xl">
          <h2 className="mb-6 text-2xl font-extrabold text-ink">Our Story</h2>
          <div className="space-y-4 text-sm leading-7 text-muted">
            <p>
              Harris Capital Mortgage Group (HCMG) was founded with a simple mission: to make the
              mortgage process transparent, efficient, and borrower‑friendly. We believe that every
              family deserves a fair path to homeownership.
            </p>
            <p>
              Headquartered in Las Vegas, Nevada with a branch in Houston, Texas, HCMG has grown
              into a multi‑state lender licensed in 10 states and Washington, D.C. Our team brings
              decades of combined experience in mortgage lending, underwriting, and client service.
            </p>
            <p className="font-semibold text-ink">
              We&rsquo;re not just a lender – we&rsquo;re your partner in one of the most important
              financial decisions of your life.
            </p>
          </div>
        </div>
      </section>

      {/* ── Mission / Vision / Promise ── */}
      <section className="section-pad border-t border-line bg-sand">
        <div className="container-shell max-w-3xl">
          <h2 className="mb-8 text-2xl font-extrabold text-ink">Our Mission &amp; Vision</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.label} className="rounded-2xl border border-line bg-white p-6">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] ok-gradient-text">
                  {p.label}
                </p>
                <p className="text-sm leading-7 text-muted">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className="section-pad border-t border-line">
        <div className="container-shell max-w-3xl">
          <h2 className="mb-8 text-2xl font-extrabold text-ink">Our Core Values</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {VALUES.map((v) => (
              <div key={v.title} className="flex gap-4 rounded-2xl border border-line bg-sand p-6">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold text-white"
                  style={{ background: "var(--ok-gradient)" }}
                >
                  {v.title[0]}
                </div>
                <div>
                  <p className="mb-1 font-bold text-ink">{v.title}</p>
                  <p className="text-sm leading-7 text-muted">{v.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
