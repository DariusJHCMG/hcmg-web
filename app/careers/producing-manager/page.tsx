import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { RecruitingForm } from "@/components/recruiting/RecruitingForm";

export const metadata: Metadata = {
  title: "Become an HCMG Branch Partner, Open Your Own Branch with HCMG Behind You",
  description:
    "Open and lead your own HCMG branch. Recruit your team, share in their production, keep your independence, with HCMG's pricing, processing, and operations supporting every loan.",
  alternates: { canonical: "https://hcmgloans.com/careers/branch-partner" },
  openGraph: {
    type: "website",
    url: "https://hcmgloans.com/careers/branch-partner",
    title: "Become an HCMG Branch Partner",
    description:
      "Open your own HCMG branch with infrastructure built for scale. Override on every loan your team closes.",
    images: ["/hcmg-social.png"],
  },
};

const VALUE_PROPS = [
  {
    icon: "🏢",
    title: "Recruit under the HCMG brand",
    body:
      "Bring in producers with a name they recognize, a comp story that closes, and a platform that lets them quote with real pricing power on day one.",
  },
  {
    icon: "📈",
    title: "Override on every team loan",
    body:
      "Real economic stake in the production you build. Comp grids are transparent, no carve-outs, no surprise haircuts at the end of the month.",
  },
  {
    icon: "🛠️",
    title: "Operational infrastructure on tap",
    body:
      "Dedicated processing, underwriting, and closing teams. HCMGU training pipeline for everyone you recruit. Compliance and licensing handled centrally.",
  },
  {
    icon: "🌐",
    title: "100+ lender partners + HCMG+ commercial",
    body:
      "Compete on any file in any market. Residential, jumbo, non-QM, and commercial all under one roof.",
  },
];

export default function BranchPartnerPage() {
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
              <span className="text-ink">Branch Partner</span>
            </nav>
            <SectionEyebrow>Branch Partners</SectionEyebrow>
            <h1
              className="mt-3 font-extrabold tracking-tight text-ink"
              style={{ fontSize: "clamp(36px, 5.5vw, 60px)", lineHeight: 1.05 }}
            >
              Build your <span className="ok-gradient-text">own HCMG branch.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Recruit your team. Share in their production. Keep your independence, with HCMG&apos;s
              pricing, processing, and operations behind every loan. Built for the producer ready to lead
              the next chapter, not manage the last one.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#apply" className="primary-button !text-base !px-7 !py-4">
                Start the conversation →
              </a>
              <Link href="/careers" className="secondary-button !text-base !px-7 !py-4">
                Compare other tracks
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="bg-sand section-pad">
        <div className="container-shell max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <SectionEyebrow>What Branch Partners Get</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              The leverage that turns a producer into a market leader.
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

      {/* Form */}
      <section id="apply" className="bg-white section-pad scroll-mt-28">
        <div className="container-shell max-w-3xl">
          <div className="mb-10 text-center">
            <SectionEyebrow>Branch Partner Inquiry</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              Tell us what you&apos;re building.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Production, current platform, team size, target market, give us context and our team will
              come back with branch economics, comp grids, and an honest read on the fit.
            </p>
          </div>
          <RecruitingForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
