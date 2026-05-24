import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { RecruitingForm } from "@/components/recruiting/RecruitingForm";

export const metadata: Metadata = {
  title: "Migrate Your Mortgage Team to HCMG — Onboarding Without a Beat Skipped",
  description:
    "Move your full mortgage team to Harris Capital Mortgage Group with dedicated migration support. Preserve your culture, your pipeline, and your people. 100+ lenders. NMLS# 1918223.",
  alternates: { canonical: "https://getorangekey.com/careers/team-migration" },
  openGraph: {
    type: "website",
    url: "https://getorangekey.com/careers/team-migration",
    title: "Migrate Your Team to HCMG",
    description:
      "Established teams deserve a migration that doesn't break what's working. HCMG handles the transition end-to-end.",
    images: ["/hcmg-social-square.svg"],
  },
};

const VALUE_PROPS = [
  {
    icon: "🚚",
    title: "Dedicated migration manager",
    body:
      "One point of contact owns the move — licensing transfers, file conversions, contact-record imports, tech onboarding, and a written go-live plan with dates.",
  },
  {
    icon: "💼",
    title: "Preserve your existing pipeline",
    body:
      "Active files come with you. We co-ordinate with your prior employer on in-flight loans and handle the borrower-facing transition so deals don&apos;t fall through.",
  },
  {
    icon: "💰",
    title: "Honor your existing economics",
    body:
      "Comp grids are negotiated as part of the move. If your current platform pays you a specific way, we model it transparently before you sign.",
  },
  {
    icon: "⚡",
    title: "Day-one lender access",
    body:
      "100+ wholesale lenders, HCMG+ commercial, and HCMGU education stack ready the moment your licenses are transferred. No 90-day ramp.",
  },
];

export default function TeamMigrationPage() {
  return (
    <main>
      <NavBar />

      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-hero-glow" />
        <div className="container-shell pt-16 pb-12 lg:pt-20">
          <div className="mx-auto max-w-3xl">
            <nav className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              <Link href="/" className="hover:text-accent">
                Home
              </Link>
              <span aria-hidden>›</span>
              <Link href="/careers" className="hover:text-accent">
                Careers
              </Link>
              <span aria-hidden>›</span>
              <span className="text-ink">Team Migration</span>
            </nav>
            <SectionEyebrow>Team Migrations</SectionEyebrow>
            <h1
              className="mt-3 font-extrabold tracking-tight text-ink"
              style={{ fontSize: "clamp(36px, 5.5vw, 60px)", lineHeight: 1.05 }}
            >
              Move your whole team — <span className="ok-gradient-text">without skipping a beat.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Established teams have built something real. Don&apos;t lose your culture, your pipeline, or
              your people in the move. HCMG migration playbooks get your full team onboarded in weeks,
              not months — with active deals preserved and licensing handled centrally.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className="primary-button !text-base !px-7 !py-4">
                Start a migration conversation →
              </a>
              <Link href="/careers" className="secondary-button !text-base !px-7 !py-4">
                Compare other tracks
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-sand section-pad">
        <div className="container-shell max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <SectionEyebrow>How Migration Works</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              The transition is the job. We treat it like one.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {VALUE_PROPS.map((card) => (
              <div
                key={card.title}
                className="rounded-3xl border border-line bg-white p-7 shadow-soft transition-all hover:-translate-y-0.5 hover:border-accent/30"
              >
                <div
                  className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                  style={{ background: "var(--ok-gradient)" }}
                  aria-hidden
                >
                  {card.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-ink">{card.title}</h3>
                <p className="text-sm leading-7 text-muted">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="bg-white section-pad scroll-mt-28">
        <div className="container-shell max-w-3xl">
          <div className="mb-10 text-center">
            <SectionEyebrow>Team Migration Inquiry</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              Tell us about the team you&apos;re moving.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Team size, current platform, monthly volume, target close date — we&apos;ll come back with a
              migration plan, economics, and the names of HCMG ops folks who would own your transition.
            </p>
          </div>
          <RecruitingForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
