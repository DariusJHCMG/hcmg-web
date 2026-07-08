import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { FunnelFlow } from "@/components/funnel/FunnelFlow";
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

function ValuePill({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur-sm">
      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-accent">
        <svg viewBox="0 0 12 10" className="h-3 w-3" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="1 5 4.5 8.5 11 1" />
        </svg>
      </span>
      <span className="text-sm font-semibold text-white">{children}</span>
    </div>
  );
}

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-3xl font-extrabold text-accent">{value}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/70">{label}</p>
    </div>
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
      {/* HERO — branded navy bg, "Hi, I'm Lamont" style           */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-brand py-16 lg:py-24">
        {/* Subtle background texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(ellipse 70% 80% at -10% 60%, rgba(243,112,33,0.55) 0%, transparent 55%), radial-gradient(ellipse 50% 40% at 110% -10%, rgba(255,152,71,0.35) 0%, transparent 60%)",
          }}
        />

        <div className="container-shell relative max-w-6xl">
          {/* Breadcrumb */}
          <nav className="mb-10 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span aria-hidden>›</span>
            <Link href="/team" className="hover:text-white transition-colors">Team</Link>
            <span aria-hidden>›</span>
            <span className="text-white/80">Lamont Harris Jr.</span>
          </nav>

          <div className="grid items-center gap-12 lg:grid-cols-[480px_1fr]">
            {/* Photo — large, offset corner style */}
            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-card">
                <TeamPhoto photo={m.photo} name={m.name} aspect="4 / 5" />
              </div>
              {/* Floating NMLS badge */}
              <div className="absolute -bottom-4 -right-3 rounded-2xl border border-white/20 bg-brand-dark px-4 py-3 shadow-lg">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">NMLS#</p>
                <p className="mt-0.5 text-sm font-extrabold text-white">1918223</p>
                <p className="text-[10px] text-white/40">Company</p>
              </div>
              {/* Experience badge */}
              <div className="absolute -left-3 top-6 rounded-2xl border border-white/20 bg-accent px-4 py-3 shadow-lg">
                <p className="text-2xl font-extrabold text-white">15+</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/80">Years in<br />Mortgage</p>
              </div>
            </div>

            {/* Text column */}
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Harris Capital Mortgage Group
              </p>
              <h1 className="font-extrabold text-white" style={{ fontSize: "clamp(38px, 5.5vw, 64px)", lineHeight: 1.05 }}>
                Hi,<br />I&apos;m Lamont.
              </h1>
              <p className="mt-1 text-sm font-semibold uppercase tracking-[0.14em] text-white/50">
                Founder &amp; CEO
              </p>

              <div className="mt-6 space-y-2 text-base leading-7 text-white/80">
                <p>
                  I started HCMG because the mortgage industry needed more transparency —
                  fewer call centers, fewer runarounds, and more real conversations about what
                  a loan actually costs and what it can do for your family.
                </p>
                <p>
                  With <strong className="text-white">15+ years in the business</strong> and
                  access to dozens of lenders and hundreds of loan programs, I shop the market
                  for you. No pressure. Just honest numbers.
                </p>
              </div>

              {/* Value pills */}
              <div className="mt-7 grid gap-2 sm:grid-cols-1">
                <ValuePill>Dozens of lenders — we shop the market for you</ValuePill>
                <ValuePill>No call center — your file stays with me</ValuePill>
                <ValuePill>Purchase, refinance, cash-out &amp; more</ValuePill>
                <ValuePill>Transparent pricing, no hidden fees</ValuePill>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#funnel" className="primary-button">
                  Get my free estimate →
                </a>
                {m.phone && (
                  <a
                    href={`tel:${phoneDigits}`}
                    className="outline-white-button"
                  >
                    <span aria-hidden>📞</span> Call Lamont
                  </a>
                )}
              </div>
              <p className="mt-3 text-xs text-white/40">
                No hard credit check · No commitment · Your info goes directly to me
              </p>
            </div>
          </div>

          {/* Stats strip */}
          <div className="mt-14 grid grid-cols-3 gap-6 rounded-3xl border border-white/10 bg-white/5 px-8 py-6 backdrop-blur-sm sm:grid-cols-3">
            <StatBadge value="15+" label="Years Experience" />
            <StatBadge value="1,000+" label="Families Helped" />
            <StatBadge value="5.0★" label="Average Rating" />
          </div>
        </div>
      </section>

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
          <div className="mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
              Start with Lamont
            </p>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              See what you can afford in 60 seconds.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted">
              Purchase or refinance &middot; No hard credit check &middot; No commitment
            </p>
            <p className="mt-2 text-xs text-muted/70">
              Your answers route directly to Lamont — no call center, no rotation.
            </p>
          </div>
          <FunnelFlow lo={funnelLo} />
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
      <section className="bg-brand py-16">
        <div className="container-shell max-w-3xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-accent">Ready to move forward?</p>
          <h2 className="text-3xl font-extrabold text-white lg:text-4xl">
            Let&apos;s talk about your next home.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
            No pressure, no obligation. Start the free estimate above or reach out directly — Lamont answers his own phone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#funnel" className="primary-button">
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
