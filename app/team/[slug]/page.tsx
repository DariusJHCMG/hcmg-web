import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { FunnelFlow } from "@/components/funnel/FunnelFlow";
import { Calculator } from "@/components/sections/Calculator";
import { ReviewsSection } from "@/components/team/ReviewsSection";
import { FAQSection } from "@/components/team/FAQSection";
import { teamMembers, getTeamMemberBySlug } from "@/data/team";
import { createServiceClient } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";

export const revalidate = 86400;

// ── Default copy — used until the user saves their own ────────────
const DEFAULT_HERO_BIO = (name: string, role: string) =>
  `I'm a licensed mortgage professional at Harris Capital Mortgage Group. As ${role} at HCMG I help clients find the right loan program — whether you're buying your first home, moving up, or refinancing. No call centers, no runarounds. Just honest guidance and the best rate I can find you.`;

const DEFAULT_ABOUT_HEADLINE =
  "A licensed mortgage professional who puts clients first.";

const DEFAULT_LONG_BIO = (name: string, nmls: string | null, offices: string[]) => [
  `${name} is a licensed mortgage professional at Harris Capital Mortgage Group${nmls ? ` (NMLS# ${nmls})` : ""}, serving clients${offices.length > 0 ? ` from HCMG's ${offices.join(" and ")} office${offices.length > 1 ? "s" : ""}` : ""}.`,
  "At HCMG we have access to dozens of lenders and hundreds of loan programs — which means I shop the market to find the deal that actually fits your situation, not just whatever one bank happens to offer.",
  "A fuller biography is on the way. In the meantime, start the estimate flow on this page or reach out directly — your file comes straight to me.",
];

const DEFAULT_SPECIALTIES = [
  "Purchase Loans", "Refinance", "FHA / VA", "First-Time Buyers",
];

export function generateStaticParams() {
  // lamont-harris-jr has its own dedicated page at app/team/lamont-harris-jr/page.tsx
  return teamMembers
    .filter((m) => m.slug !== "lamont-harris-jr")
    .map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = getTeamMemberBySlug(slug);
  if (!m) return {};

  // Try to enrich with DB data
  const sb = createServiceClient();
  const { data: p } = await sb
    .from("profiles")
    .select("full_name, title, nmls, short_bio, avatar_url")
    .eq("lo_slug", slug)
    .single();

  const name  = p?.full_name ?? m.name;
  const role  = p?.title     ?? m.role;
  const nmls  = p?.nmls      ?? m.nmls;
  const bio   = p?.short_bio ?? m.shortBio;
  const photo = p?.avatar_url ?? m.photo;

  const title = nmls
    ? `${name}, ${role}, NMLS# ${nmls} | HCMG`
    : `${name}, ${role} | HCMG`;

  return {
    title,
    description: bio,
    alternates: { canonical: `https://hcmgloans.com/team/${slug}` },
    openGraph: {
      title: `${name}, ${role}`,
      description: bio ?? undefined,
      url: `https://hcmgloans.com/team/${slug}`,
      images: [photo],
    },
  };
}

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

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = getTeamMemberBySlug(slug);
  if (!m) notFound();

  // Pull from Supabase profile first, fall back to data/team.ts
  const sb = createServiceClient();
  const { data: profileData } = await sb
    .from("profiles")
    .select("*")
    .eq("lo_slug", slug)
    .single();

  const p = profileData as Profile | null;

  // Resolved values — DB takes precedence, data/team.ts or defaults as fallback
  const name          = p?.full_name       ?? m.name;
  const role          = p?.title           ?? m.role;
  const phone         = p?.phone           ?? m.phone ?? "";
  const email         = p?.email           ?? m.email ?? "";
  const linkedin      = p?.linkedin        ?? m.linkedin ?? "";
  const nmls          = p?.nmls            ?? m.nmls;
  const photo         = p?.avatar_url      ?? m.photo;
  const heroBio       = p?.hero_bio        ?? DEFAULT_HERO_BIO(name, role);
  const aboutHeadline = p?.about_headline  ?? DEFAULT_ABOUT_HEADLINE;
  const longBio       = p?.long_bio        ?? DEFAULT_LONG_BIO(name, nmls, m.offices ?? []);
  const specialties   = p?.specialties     ?? m.speciality ?? DEFAULT_SPECIALTIES;
  const offices       = p?.offices         ?? m.offices ?? [];

  const phoneDigits = phone.replace(/[^0-9+]/g, "");
  const first       = name.replace(/['"()]/g, "").split(/\s+/)[0];
  const funnelLo    = { slug: m.slug, name, nmls };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name,
    jobTitle: role,
    url: `https://hcmgloans.com/team/${slug}`,
    image: `https://hcmgloans.com${photo}`,
    worksFor: {
      "@type": "Organization",
      name: "Harris Capital Mortgage Group, LLC",
      alternateName: "HCMG",
      url: "https://hcmgloans.com",
    },
    ...(email    ? { email }               : {}),
    ...(phone    ? { telephone: phone }    : {}),
    ...(linkedin ? { sameAs: [linkedin] }  : {}),
    ...(nmls     ? { identifier: { "@type": "PropertyValue", propertyID: "NMLS", value: nmls } } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://hcmgloans.com" },
      { "@type": "ListItem", position: 2, name: "Team", item: "https://hcmgloans.com/team" },
      { "@type": "ListItem", position: 3, name: name,   item: `https://hcmgloans.com/team/${slug}` },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NavBar />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* HERO — white bg, home-page style                         */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-white" style={{ paddingTop: "clamp(72px, 10vw, 120px)", paddingBottom: "clamp(64px, 8vw, 100px)" }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[600px] bg-hero-glow" />

        <div className="container-shell grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left — headline + copy */}
          <div>
            <SectionEyebrow className="mb-6">
              Harris Capital Mortgage Group{nmls ? ` · NMLS# ${nmls}` : ""}
            </SectionEyebrow>

            <h1 className="font-extrabold leading-[1.08] tracking-tight text-ink" style={{ fontSize: "clamp(40px, 6vw, 72px)" }}>
              Hi, I&apos;m{" "}
              <span className="ok-gradient-text">{first}.</span>
            </h1>
            <p className="mt-2 text-sm font-semibold uppercase tracking-[0.14em] text-muted">
              {role} · Harris Capital Mortgage Group
            </p>

            <p className="mt-6 max-w-xl text-lg leading-8 text-muted">{heroBio}</p>

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
              {phone && (
                <a href={`tel:${phoneDigits}`} className="secondary-button !text-base !px-7 !py-4">
                  <span aria-hidden>📞</span> Call {first}
                </a>
              )}
            </div>
            <p className="mt-4 text-xs text-muted/60">
              Your info routes directly to {first} — no rotation, no call center.
            </p>
          </div>

          {/* Right — profile photo */}
          <div className="overflow-hidden rounded-3xl border border-line shadow-soft">
            <TeamPhoto photo={photo} name={name} aspect="4 / 3" />
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* CALCULATOR                                                */}
      {/* ══════════════════════════════════════════════════════════ */}
      <div id="calculator">
        <Calculator
          heading="Get my estimated monthly payment."
          subheading="Adjust the sliders and see your full payment breakdown instantly. No credit check, no commitment."
        />
      </div>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* ABOUT + FUNNEL                                            */}
      {/* ══════════════════════════════════════════════════════════ */}
      <section id="funnel" className="bg-white py-20 scroll-mt-20">
        <div className="container-shell max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
            {/* Left: about copy + specialties + contact */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">About {first}</p>
              <h2 className="mb-6 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
                {aboutHeadline}
              </h2>
              {longBio.map((para, i) => (
                <p key={i} className="mb-5 text-base leading-8 text-ink/80">{para}</p>
              ))}
              {/* Specialties */}
              {specialties.length > 0 && (
                <div className="mt-4 rounded-2xl border border-line bg-sand p-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">Specialties</p>
                  <div className="flex flex-wrap gap-2">
                    {specialties.map((s) => (
                      <span key={s}
                        className="inline-flex items-center rounded-full border border-accent/25 px-3 py-1 text-xs font-semibold text-accent"
                        style={{ background: "rgba(243,112,33,0.07)" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                  {offices.length > 0 && (
                    <p className="mt-3 text-xs text-muted">📍 {offices.join(" · ")}</p>
                  )}
                  {nmls && (
                    <p className="mt-1 text-xs text-muted">NMLS# {nmls}</p>
                  )}
                </div>
              )}
              {/* Contact chips */}
              <div className="mt-5 flex flex-wrap gap-2">
                {phone && (
                  <a href={`tel:${phoneDigits}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent shadow-soft">
                    <span>📞</span> {phone}
                  </a>
                )}
                {email && (
                  <a href={`mailto:${email}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent shadow-soft">
                    <span>✉️</span> Email {first}
                  </a>
                )}
                {linkedin && (
                  <a href={linkedin} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent shadow-soft">
                    <span className="font-black text-[#0077b5]">in</span> LinkedIn
                  </a>
                )}
              </div>
            </div>

            {/* Right: funnel */}
            <div>
              <FunnelFlow lo={funnelLo} source="team" />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* REVIEWS                                                   */}
      {/* ══════════════════════════════════════════════════════════ */}
      <ReviewsSection firstName={first} loSlug={m.slug} />

      {/* ══════════════════════════════════════════════════════════ */}
      {/* FAQ                                                       */}
      {/* ══════════════════════════════════════════════════════════ */}
      <FAQSection firstName={first} />

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
            No pressure, no obligation. Start the free estimate above or reach out directly — {first} answers their own phone.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="#funnel" className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white bg-white px-6 py-4 text-base font-semibold text-accent transition hover:bg-white/90">
              Get my free estimate →
            </a>
            {phone && (
              <a href={`tel:${phoneDigits}`} className="outline-white-button">
                <span>📞</span> {phone}
              </a>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
