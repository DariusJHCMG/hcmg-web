import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { CareersGateway, CAREERS_PATHS } from "@/components/recruiting/CareersGateway";

export const metadata: Metadata = {
  title: "Careers at HCMG, Loan Officers, Producing Managers, Teams & HQ",
  description:
    "Build your mortgage career with Harris Capital Mortgage Group. Loan officers, producing managers, full team moves, and HQ corporate roles. 100+ lender partners. NMLS# 1918223.",
  alternates: { canonical: "https://getorangekey.com/careers" },
  openGraph: {
    type: "website",
    url: "https://getorangekey.com/careers",
    title: "Careers at HCMG",
    description:
      "Loan officers, producing managers, full team moves, and corporate roles. Pick your path into HCMG.",
    images: ["/hcmg-social-square.svg"],
  },
};

export default function CareersLandingPage() {
  return (
    <main>
      <NavBar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-hero-glow" />
        <div className="container-shell pt-16 lg:pt-20 pb-8 lg:pb-12">
          <div className="mx-auto max-w-3xl text-center">
            <SectionEyebrow>Careers at HCMG</SectionEyebrow>
            <h1
              className="mt-4 font-extrabold tracking-tight text-ink"
              style={{ fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.04 }}
            >
              Pick the path that <span className="ok-gradient-text">fits your business.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted">
              Harris Capital Mortgage Group hires across four tracks, producing loan officers, branch
              producing managers, full team moves, and corporate operators. Tell us which one you are and
              we&apos;ll route you to the right conversation.
            </p>
          </div>
        </div>
      </section>

      {/* Gateway cards */}
      <section className="bg-sand">
        <div className="container-shell max-w-6xl py-12 lg:py-16">
          <CareersGateway paths={CAREERS_PATHS} />
        </div>
      </section>

      {/* Trust strip */}
      <section className="bg-white">
        <div className="container-shell max-w-5xl py-16 text-center">
          <p className="mx-auto max-w-2xl text-base leading-7 text-muted">
            HCMG is licensed in 8 states and growing. Las Vegas HQ, Houston hub. NMLS#&nbsp;1918223.
            Equal Housing Lender.
          </p>
          <p className="mt-5 text-sm text-muted">
            Prefer to talk now? Call{" "}
            <a href="tel:8884413930" className="font-bold text-accent hover:underline">
              888-441-3930
            </a>{" "}
            or email{" "}
            <a href="mailto:recruiting@hcmg.com" className="font-bold text-accent hover:underline">
              recruiting@hcmg.com
            </a>
            .
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}
