import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { FunnelFlow } from "@/components/funnel/FunnelFlow";
import { Calculator } from "@/components/sections/Calculator";
import { getTeamMemberBySlug } from "@/data/team";
import { ReviewsSection } from "@/components/team/ReviewsSection";
import { FAQSection } from "@/components/team/FAQSection";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Lamont Harris Jr., Founder & CEO | Harris Capital Mortgage Group",
  description:
    "Lamont Harris Jr. is the Founder and CEO of Harris Capital Mortgage Group. Over 15 years of mortgage industry experience. Get a free estimate, no hard credit check.",
  alternates: { canonical: "https://getorangekey.com/team/lamont-harris-jr" },
  openGraph: {
    title: "Lamont Harris Jr. — HCMG Founder & CEO",
    description:
      "Work directly with Lamont Harris Jr. on your home purchase or refinance. No call center, no rotation — your file routed directly to Lamont.",
    url: "https://getorangekey.com/team/lamont-harris-jr",
    images: ["/team/placeholder.svg"],
  },
};

// ── Helpers ───────────────────────────────────────────────────────

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm font-semibold text-muted">
      <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-white text-xs" style={{ background: "var(--ok-gradient)" }}>✓</span>
      {children}
    </li>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default async function LamontPage() {
  const m = getTeamMemberBySlug("lamont-harris-jr")!;
  const phoneDigits = m.phone?.replace(/[^0-9+]/g, "") ?? "";
  const funnelLo = { slug: m.slug, name: m.name, nmls: m.nmls };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Lamont Harris Jr.",
    jobTitle: "Founder & CEO",
    url: "https://getorangekey.com/team/lamont-harris-jr",
    image: "https://getorangekey.com/team/placeholder.svg",
    worksFor: {
      "@type": "Organization",
      name: "Harris Capital Mortgage Group, LLC",
      url: "https://getorangekey.com",
    },
    email: m.email,
    telephone: m.phone,
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <NavBar />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HERO — white bg, home-page style                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white" style={{ paddingTop: "clamp(72px, 10vw, 120px)", paddingBottom: "clamp(64px, 8vw, 100px)" }}>
        {/* Background glow — same as home page */}
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-hero-glow" />

        <div className="container-shell grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left — headline + copy */}
          <div>
            <SectionEyebrow className="mb-6">
              Harris Capital Mortgage Group · NMLS# 1918223
            </SectionEyebrow>

            <h1 className="font-extrabold leading-[1.08] tracking-tight text-ink" style={{ fontSize: "clamp(40px, 6vw, 72px)" }}>
              Hi, I&apos;m{" "}
              <span className="ok-gradient-text">{m.name.split(" ")[0]}.</span>
            </h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              {m.role} · Harris Capital Mortgage Group
            </p>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">
              I started HCMG because the mortgage industry needed more transparency —
              fewer call centers, fewer runarounds, and more real conversations about what
              a loan actually costs and what it can do for your family.
            </p>
            <p className="mt-3 max-w-xl text-base leading-7 text-muted">
              With <strong className="text-ink">15+ years in the business</strong> and
              access to dozens of lenders and hundreds of loan programs, I shop the market
              for you. No pressure. Just honest numbers.
            </p>

            {/* Trust row */}
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
              <CheckItem>Dozens of lenders — best rate for you</CheckItem>
              <CheckItem>No call center — your file stays with me</CheckItem>
              <CheckItem>No hard credit check · No commitment</CheckItem>
            </ul>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#funnel" className="primary-button !text-base !px-7 !py-4">
                Get my free estimate →
              </a>
              {m.phone && (
                <a href={`tel:${phoneDigits}`} className="secondary-button !text-base !px-7 !py-4">
                  <span aria-hidden>📞</span> Call {m.name.split(" ")[0]}
                </a>
              )}
            </div>
            <p className="mt-4 text-xs text-muted/60">
              Your info routes directly to {m.name.split(" ")[0]} — no rotation, no call center.
            </p>
          </div>

          {/* Right — photo card */}
          <div className="relative">
            {/* Role pill */}
            <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-orange whitespace-nowrap"
              style={{ background: "var(--ok-gradient)" }}>
              {m.role}
            </div>

            <div className="glass-card overflow-hidden">
              <TeamPhoto photo={m.photo} name={m.name} aspect="4 / 5" />

              {/* Bottom info strip */}
              <div className="border-t border-line bg-white px-5 py-4">
                <p className="font-extrabold text-ink">{m.name}</p>
                <p className="text-xs text-muted">{m.role} · HCMG</p>
                {m.nmls && (
                  <p className="mt-1 text-[11px] font-semibold text-accent">NMLS# {m.nmls}</p>
                )}
                <div className="mt-3 flex gap-2">
                  {m.phone && (
                    <a href={`tel:${phoneDigits}`}
                      className="flex-1 rounded-xl border border-line py-2 text-center text-xs font-bold text-ink transition hover:border-accent hover:text-accent">
                      📞 Call
                    </a>
                  )}
                  {m.email && (
                    <a href={`mailto:${m.email}`}
                      className="flex-1 rounded-xl border border-line py-2 text-center text-xs font-bold text-ink transition hover:border-accent hover:text-accent">
                      ✉️ Email
                    </a>
                  )}
                  <a href="#funnel"
                    className="flex-1 rounded-xl bg-accent py-2 text-center text-xs font-bold text-white transition hover:bg-accent-dark">
                    Get Quote →
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CALCULATOR — get my estimated monthly payment             */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div id="calculator">
        <Calculator
          heading="Get my estimated monthly payment."
          subheading="Adjust the sliders and see your full payment breakdown instantly. No credit check, no commitment."
        />
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ABOUT — long bio on white                                 */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="bg-white py-20">
        <div className="container-shell max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Left: about copy */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">About Lamont</p>
              <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
                A lender who believes every family deserves a fair shot at homeownership.
              </h2>
              {m.longBio.map((para, i) => (
                <p key={i} className="mb-5 text-base leading-8 text-ink/80">
                  {para}
                </p>
              ))}
              {/* Contact chips */}
              <div className="mt-6 flex flex-wrap gap-2">
                {m.phone && (
                  <a href={`tel:${phoneDigits}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent shadow-soft">
                    <span>📞</span> {m.phone}
                  </a>
                )}
                {m.email && (
                  <a href={`mailto:${m.email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent shadow-soft">
                    <span>✉️</span> Email Lamont
                  </a>
                )}
                {m.linkedin && (
                  <a href={m.linkedin} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent shadow-soft">
                    <span className="font-black text-[#0077b5]">in</span> LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Right: quick-facts card */}
            <div className="rounded-3xl border border-line bg-sand p-8 shadow-soft">
              <p className="mb-6 text-xs font-bold uppercase tracking-[0.16em] text-muted">Quick Facts</p>
              <dl className="space-y-5">
                <div className="flex items-start gap-4 border-b border-line pb-5">
                  <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-lg">🏆</span>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Experience</dt>
                    <dd className="mt-1 text-base font-bold text-ink">15+ years in mortgage lending</dd>
                  </div>
                </div>
                <div className="flex items-start gap-4 border-b border-line pb-5">
                  <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-lg">📍</span>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Offices</dt>
                    <dd className="mt-1 text-base font-bold text-ink">Las Vegas, NV &middot; Houston, TX</dd>
                  </div>
                </div>
                <div className="flex items-start gap-4 border-b border-line pb-5">
                  <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-lg">🏛️</span>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Company NMLS</dt>
                    <dd className="mt-1 text-base font-bold text-ink"># 1918223</dd>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-accent/10 text-lg">📋</span>
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted">Specialties</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {["Purchase Loans", "Refinance", "FHA / VA", "Jumbo", "Cash-Out Refi", "First-Time Buyers"].map((s) => (
                        <span key={s} className="inline-flex items-center rounded-full border border-accent/25 bg-accent/8 px-2.5 py-0.5 text-xs font-semibold text-accent"
                          style={{ background: "rgba(243,112,33,0.07)" }}>
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FUNNEL — gated estimate, routes to Lamont               */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="funnel" className="bg-sand py-20 scroll-mt-20">
        <div className="container-shell max-w-3xl">
          {/* LO identity card — same style as get-started page */}
          <div className="mx-auto mb-8 max-w-xl">
            <div className="flex items-center gap-4 rounded-3xl border border-line bg-white p-4 shadow-soft sm:p-5">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl">
                <TeamPhoto photo={m.photo} name={m.name} aspect="1 / 1" className="h-full w-full" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                  You&apos;re starting with
                </div>
                <div className="truncate text-base font-bold text-ink">{m.name}</div>
                <div className="text-xs text-muted">
                  {m.role} · HCMG · No call center, no rotation
                </div>
              </div>
            </div>
          </div>
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              See what you can afford in 60 seconds.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted">
              Purchase or refinance &middot; No hard credit check &middot; No commitment
            </p>
          </div>
          <FunnelFlow lo={funnelLo} source="team" />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* REVIEWS                                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <ReviewsSection firstName="Lamont" />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FAQ                                                        */}
      {/* ══════════════════════════════════════════════════════════ */}
      <FAQSection firstName="Lamont" />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* BOTTOM CTA BAND                                           */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="bg-accent py-16">
        <div className="container-shell max-w-3xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">Ready to move forward?</p>
          <h2 className="text-3xl font-extrabold text-white lg:text-4xl">
            Let&apos;s talk about your next home.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
            No pressure, no obligation. Start the free estimate above or reach out directly — Lamont answers his own phone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#funnel" className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white bg-white px-6 py-4 text-base font-semibold text-accent transition hover:bg-white/90">
              Get my free estimate →
            </a>
            {m.phone && (
              <a href={`tel:${phoneDigits}`} className="outline-white-button">
                <span>📞</span> {m.phone}
              </a>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
