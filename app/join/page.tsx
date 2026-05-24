import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { PricingEnginePreview } from "@/components/recruiting/PricingEnginePreview";
import { RecruitingForm } from "@/components/recruiting/RecruitingForm";
import ZeitroCalculatorEmbed from "@/components/zeitro/ZeitroCalculatorEmbed";

export const metadata: Metadata = {
  title: "Join HCMG — Loan Officer Careers at Harris Capital Mortgage Group",
  description:
    "Grow your mortgage business with HCMG. 100+ lender partners, 275 BPS lender-paid compensation, HCMGU on-demand training, and a revenue-share platform built for producing loan officers and mortgage brokers.",
  alternates: { canonical: "https://getorangekey.com/join" },
  openGraph: {
    type: "website",
    url: "https://getorangekey.com/join",
    siteName: "HCMG — Harris Capital Mortgage Group",
    title: "Join HCMG — Loan Officer Careers",
    description:
      "100+ lender partners. 275 BPS lender-paid comp. Revenue share. Modern borrower tools. Built for producing loan officers and mortgage brokers who want pricing power and clarity.",
    images: ["/hcmg-social-square.svg"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Join HCMG — Loan Officer Careers",
    description:
      "100+ lender partners. 275 BPS lender-paid comp. Built for producing LOs and mortgage brokers.",
    images: ["/hcmg-social-square.svg"],
  },
  keywords: [
    "loan officer jobs",
    "mortgage broker jobs",
    "join HCMG",
    "Harris Capital Mortgage Group careers",
    "lender-paid compensation",
    "275 BPS mortgage broker",
    "revenue share mortgage",
    "HCMGU",
  ],
};

const hiringSchema = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "Loan Officer / Mortgage Broker",
  description:
    "Harris Capital Mortgage Group is hiring producing loan officers and mortgage brokers. Lender-paid compensation up to 275 BPS, access to 100+ lender partners, revenue-share platform, and HCMGU on-demand training.",
  datePosted: new Date().toISOString().slice(0, 10),
  employmentType: ["FULL_TIME", "CONTRACTOR"],
  hiringOrganization: {
    "@type": "Organization",
    name: "Harris Capital Mortgage Group, LLC",
    sameAs: "https://getorangekey.com",
  },
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      streetAddress: "6375 S Pecos Rd, Suite 208",
      addressLocality: "Las Vegas",
      addressRegion: "NV",
      postalCode: "89120",
      addressCountry: "US",
    },
  },
  industry: "Mortgage Lending",
};

const WHY_JOIN = [
  {
    icon: "🏦",
    title: "Competitive lender access",
    body:
      "100+ wholesale lender partners plus HCMG+, our commercial division. Shop the right investor for every file instead of forcing your borrowers into one lender's box.",
  },
  {
    icon: "💰",
    title: "Transparent compensation",
    body:
      "Lender-paid compensation up to 275 BPS. Clear comp grids. No mystery splits, no manager carve-outs after the fact. You see the math up front, every loan.",
  },
  {
    icon: "📱",
    title: "Modern borrower tools",
    body:
      "A pricing engine your team and borrowers actually want to use. Live rate previews, fully digital intake, mobile-first applications. No 2014 LOS interfaces.",
  },
  {
    icon: "⚡",
    title: "Faster support",
    body:
      "Processing, underwriting, and ops that move at the speed your borrowers expect. Real humans on real timelines — not tickets in a queue.",
  },
  {
    icon: "🛠️",
    title: "Tech-enabled workflow",
    body:
      "Pre-built CRM routing per loan officer, automated lead capture, and integrations that keep the file moving without 15 logins.",
  },
  {
    icon: "📈",
    title: "Built for growth",
    body:
      "HCMGU on-demand education and a revenue-share platform that pays $595 per loan closed by your referrals — for the lifetime of their and your employment.",
  },
];

const WHO_THIS_IS_FOR = [
  "Self-generating loan officers who want pricing power and a back office that performs",
  "Mortgage brokers who want more lender access without giving up independence",
  "Producing LOs who need better pricing visibility and fewer mystery deductions",
  "Branch managers looking for a stronger platform and a clearer comp story",
];

const FAQS = [
  {
    q: "What's the lender-paid compensation structure?",
    a: "HCMG offers lender-paid compensation up to 275 BPS depending on your production tier and program. Comp grids are published — no surprises, no carve-outs.",
  },
  {
    q: "How many lenders does HCMG work with?",
    a: "Over 100 wholesale lender partners across conventional, government, jumbo, and non-QM products. Plus HCMG+ for commercial loans when your borrower needs more than residential.",
  },
  {
    q: "What's the revenue-share platform?",
    a: "Earn $595 per loan closed by loan officers you refer to HCMG — for the lifetime of their employment with HCMG and yours. It's a real long-tail income stream, not a one-time bonus.",
  },
  {
    q: "What support do I get from operations?",
    a: "Dedicated processing, underwriting, and closing teams who own your files end-to-end. Real humans, real timelines. Plus HCMGU on-demand training to upskill anyone on your team.",
  },
  {
    q: "Do you support remote LOs?",
    a: "Yes. We have producers across multiple states with full operational support delivered remotely. Las Vegas is HQ; Houston is our second hub.",
  },
];

export default function JoinPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hiringSchema) }}
      />
      <NavBar />

      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-hero-glow" />
        <div className="container-shell pt-16 lg:pt-24 pb-12 lg:pb-16">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <SectionEyebrow>Loan Officer Careers · HCMG</SectionEyebrow>
              <h1
                className="mt-4 font-extrabold tracking-tight text-ink"
                style={{ fontSize: "clamp(40px, 6vw, 72px)", lineHeight: 1.04 }}
              >
                Grow Your Mortgage Business With{" "}
                <span className="ok-gradient-text">Real Pricing Power</span>.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-muted lg:text-xl">
                Join a platform built for loan officers who want competitive products, transparent
                compensation, fast support, and modern borrower tools.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#apply" className="primary-button !text-base !px-7 !py-4">
                  Apply to Join →
                </a>
                <a href="#pricing-engine" className="secondary-button !text-base !px-7 !py-4">
                  See Our Pricing Tools
                </a>
              </div>

              <p className="mt-5 text-xs text-muted/70">
                NMLS# 1918223 · Equal Housing Lender · Producing today in NV, TX &amp; beyond
              </p>
            </div>

            {/* Stats card */}
            <div className="relative">
              <div className="grid gap-4 sm:grid-cols-2">
                <StatCard value="100+" label="Lender partners" sub="Plus HCMG+ for commercial" />
                <StatCard value="275" label="BPS lender-paid comp" sub="Published grids, no carve-outs" highlight />
                <StatCard value="$595" label="Per referred loan" sub="Revenue-share, lifetime" />
                <StatCard value="HCMGU" label="On-demand training" sub="For you and your team" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Pricing Engine Preview ─────────────────────────────── */}
      <section id="pricing-engine" className="bg-sand section-pad scroll-mt-28">
        <div className="container-shell max-w-6xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <SectionEyebrow>Pricing Engine Preview</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-5xl">
              The pricing tool you&apos;ll quote with — built around your numbers.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted lg:text-lg">
              See your net commission and BPS the moment you change a scenario. Compare lenders side-by-side
              without leaving the screen. This is a sample preview — your live engine has access to every
              partnered investor and your real comp plan.
            </p>
          </div>

          <PricingEnginePreview />
        </div>
      </section>

      {/* ── Why Join ───────────────────────────────────────────── */}
      <section className="bg-white section-pad">
        <div className="container-shell max-w-6xl">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <SectionEyebrow>Why HCMG</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-5xl">
              Built for loan officers who want to win more files.
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {WHY_JOIN.map((card) => (
              <div
                key={card.title}
                className="glass-card p-7 transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/30 hover:shadow-accent"
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

      {/* ── Comp / Revenue-Share strip ─────────────────────────── */}
      <section className="bg-brand text-white">
        <div className="container-shell max-w-6xl py-16 lg:py-20">
          <div className="grid items-start gap-10 lg:grid-cols-3">
            <div className="lg:col-span-1">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
                Compensation &amp; Revenue Share
              </div>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight lg:text-4xl">
                Paid for the work — and for the team you build.
              </h2>
            </div>
            <div className="grid gap-6 lg:col-span-2 sm:grid-cols-3">
              <CompCard value="275" unit="BPS" label="Lender-Paid Compensation" />
              <CompCard value="$595" unit="" label="Per Loan via RSP" />
              <CompCard value="100+" unit="" label="Wholesale Lender Partners" />
            </div>
          </div>
          <p className="mt-10 max-w-3xl text-xs leading-relaxed text-white/60">
            Lender-paid compensation up to 275 BPS, subject to tier qualification and program rules. Revenue
            Share Platform pays $595 per loan closed by referred originators for the lifetime of their and
            your employment at HCMG. Subject to plan terms and changes. Not an offer or commitment.
          </p>
        </div>
      </section>

      {/* ── Mortgage Calculator (Zeitro embed) ─────────────────── */}
      <section className="bg-white section-pad">
        <div className="container-shell max-w-5xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <SectionEyebrow>Try the Mortgage Calculator</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              The same calculator your borrowers will use.
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Live, embedded directly. Plug in a scenario, see the math, then imagine handing this to every
              one of your borrowers on day one.
            </p>
          </div>
          <ZeitroCalculatorEmbed />
        </div>
      </section>

      {/* ── Who This Is For ────────────────────────────────────── */}
      <section className="bg-sand section-pad">
        <div className="container-shell max-w-5xl">
          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr]">
            <div>
              <SectionEyebrow>Who This Is For</SectionEyebrow>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
                If you&apos;re producing and you&apos;re tired of guessing — we should talk.
              </h2>
            </div>
            <ul className="space-y-4">
              {WHO_THIS_IS_FOR.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-4 rounded-2xl border border-line bg-white p-5 shadow-soft"
                >
                  <span
                    className="mt-0.5 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: "var(--ok-gradient)" }}
                    aria-hidden
                  >
                    ✓
                  </span>
                  <span className="text-base leading-7 text-ink/85">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────── */}
      <section className="bg-white section-pad">
        <div className="container-shell max-w-3xl">
          <div className="mb-10 text-center">
            <SectionEyebrow>FAQ</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              What recruits ask us first.
            </h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((f, i) => (
              <details
                key={i}
                className="group overflow-hidden rounded-2xl border border-line bg-white open:shadow-soft"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 px-6 py-5 text-left text-base font-semibold text-ink marker:hidden">
                  <span>{f.q}</span>
                  <span
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-sand text-muted transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <div className="px-6 pb-5 text-sm leading-7 text-muted">{f.a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── Application Form ───────────────────────────────────── */}
      <section id="apply" className="bg-sand section-pad scroll-mt-28">
        <div className="container-shell max-w-3xl">
          <div className="mb-10 text-center">
            <SectionEyebrow>Recruiting Inquiry</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              Ready to see what HCMG can do for your pipeline?
            </h2>
            <p className="mt-4 text-base leading-7 text-muted">
              Drop a few details below. A member of our recruiting team will reach out within one business day
              with pricing examples, comp grids, and a real conversation — no canned pitch deck.
            </p>
          </div>
          <RecruitingForm />
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <section className="bg-white pb-20 pt-4">
        <div className="container-shell max-w-3xl text-center">
          <p className="text-sm text-muted">
            Prefer to talk now? Call us at{" "}
            <a href="tel:8884413930" className="font-bold text-accent hover:underline">
              888-441-3930
            </a>{" "}
            — or email{" "}
            <a href="mailto:recruiting@hcmg.com" className="font-bold text-accent hover:underline">
              recruiting@hcmg.com
            </a>
            .
          </p>
          <p className="mt-4 text-xs text-muted/60">
            Harris Capital Mortgage Group, LLC · NMLS# 1918223 · 6375 S Pecos Rd, Suite 208, Las Vegas, NV
            89120 · Equal Housing Lender
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function StatCard({
  value,
  label,
  sub,
  highlight = false,
}: {
  value: string;
  label: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-3xl border p-6 shadow-card ${
        highlight ? "border-accent bg-brand text-white" : "border-line bg-white text-ink"
      }`}
    >
      <div
        className={`font-extrabold leading-none tracking-tight ${highlight ? "text-accent" : "ok-gradient-text"}`}
        style={{ fontSize: "clamp(36px, 5vw, 52px)" }}
      >
        {value}
      </div>
      <div className={`mt-3 text-sm font-bold ${highlight ? "text-white" : "text-ink"}`}>{label}</div>
      <div className={`mt-1 text-xs ${highlight ? "text-white/70" : "text-muted"}`}>{sub}</div>
    </div>
  );
}

function CompCard({ value, unit, label }: { value: string; unit: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur">
      <div className="flex items-baseline gap-1">
        <span
          className="font-extrabold tracking-tight text-accent"
          style={{ fontSize: "clamp(36px, 4.5vw, 52px)", lineHeight: 1 }}
        >
          {value}
        </span>
        {unit && <span className="text-lg font-bold text-white/80">{unit}</span>}
      </div>
      <div className="mt-3 text-sm font-bold text-white">{label}</div>
    </div>
  );
}
