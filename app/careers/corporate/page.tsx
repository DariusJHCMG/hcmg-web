import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { RecruitingForm } from "@/components/recruiting/RecruitingForm";

export const metadata: Metadata = {
  title: "HCMG HQ Careers — Operations, Marketing, Technology, Compliance",
  description:
    "Join HCMG's corporate team. Operations, marketing, technology, compliance — high-leverage roles powering the platform that supports loan officers nationwide. NMLS# 1918223.",
  alternates: { canonical: "https://getorangekey.com/careers/corporate" },
  openGraph: {
    type: "website",
    url: "https://getorangekey.com/careers/corporate",
    title: "HCMG HQ Careers",
    description:
      "Operations, marketing, technology, compliance — build the engine behind HCMG.",
    images: ["/hcmg-social-square.svg"],
  },
};

const TRACKS = [
  {
    icon: "⚙️",
    title: "Operations",
    body:
      "Processing, underwriting, closing ops, vendor management. The roles that make every loan close on time and keep producers happy.",
  },
  {
    icon: "📣",
    title: "Marketing",
    body:
      "Brand, content, recruiting marketing, paid acquisition, lifecycle. Tell HCMG's story to borrowers and to the producers we want to recruit.",
  },
  {
    icon: "💻",
    title: "Technology",
    body:
      "Web, integrations, internal tooling, data, AI. We move fast and ship — no enterprise process theater.",
  },
  {
    icon: "🛡️",
    title: "Compliance",
    body:
      "State licensing, NMLS, RESPA, TILA, fair lending. Keep HCMG ahead of the regulators across every state we serve.",
  },
];

export default function CorporatePage() {
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
              <span className="text-ink">HQ Employee</span>
            </nav>
            <SectionEyebrow>Corporate · HQ</SectionEyebrow>
            <h1
              className="mt-3 font-extrabold tracking-tight text-ink"
              style={{ fontSize: "clamp(36px, 5.5vw, 60px)", lineHeight: 1.05 }}
            >
              Build the engine <span className="ok-gradient-text">behind HCMG.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Operations, marketing, technology, compliance. Small teams, big leverage. If you&apos;ve
              done your time at a slow legacy lender and want to ship — this is where the work happens.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className="primary-button !text-base !px-7 !py-4">
                Apply for a corporate role →
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
            <SectionEyebrow>Where We&apos;re Hiring</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              Four tracks. Las Vegas HQ. Hybrid for the right hires.
            </h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {TRACKS.map((card) => (
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
            <SectionEyebrow>Corporate Application</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              No open req posted? Send it anyway.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              HCMG&apos;s headcount plan is fluid. If you&apos;re strong and the timing&apos;s right, we
              create the role. Tell us what you do, where you do it best, and what you&apos;d build at
              HCMG.
            </p>
          </div>
          <RecruitingForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
