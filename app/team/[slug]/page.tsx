import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { FunnelFlow } from "@/components/funnel/FunnelFlow";
import { teamMembers, getTeamMemberBySlug } from "@/data/team";

export const revalidate = 86400;

export function generateStaticParams() {
  return teamMembers.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const m = getTeamMemberBySlug(slug);
  if (!m) return {};
  const title = m.nmls
    ? `${m.name}, ${m.role}, NMLS# ${m.nmls} | HCMG`
    : `${m.name}, ${m.role} | HCMG`;
  return {
    title,
    description: m.shortBio,
    alternates: { canonical: `https://getorangekey.com/team/${slug}` },
    openGraph: {
      title: `${m.name}, ${m.role}`,
      description: m.shortBio,
      url: `https://getorangekey.com/team/${slug}`,
      images: [m.photo],
    },
  };
}

export default async function TeamMemberPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const m = getTeamMemberBySlug(slug);
  if (!m) notFound();

  const others = teamMembers.filter((t) => t.slug !== slug).slice(0, 3);
  const phoneDigits = m.phone?.replace(/[^0-9+]/g, "") ?? "";
  const funnelLo = { slug: m.slug, name: m.name, nmls: m.nmls };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: m.name,
    jobTitle: m.role,
    url: `https://getorangekey.com/team/${slug}`,
    image: `https://getorangekey.com${m.photo}`,
    worksFor: {
      "@type": "Organization",
      name: "Harris Capital Mortgage Group, LLC",
      alternateName: "HCMG",
      url: "https://getorangekey.com",
    },
    ...(m.email ? { email: m.email } : {}),
    ...(m.phone ? { telephone: m.phone } : {}),
    ...(m.linkedin ? { sameAs: [m.linkedin] } : {}),
    ...(m.nmls
      ? {
          identifier: { "@type": "PropertyValue", propertyID: "NMLS", value: m.nmls },
        }
      : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://getorangekey.com" },
      { "@type": "ListItem", position: 2, name: "Team", item: "https://getorangekey.com/team" },
      {
        "@type": "ListItem",
        position: 3,
        name: m.name,
        item: `https://getorangekey.com/team/${slug}`,
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 32 }}>
        <div className="container-shell max-w-5xl">
          {/* Breadcrumb */}
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <span aria-hidden>›</span>
            <Link href="/team" className="hover:text-accent">
              Team
            </Link>
            <span aria-hidden>›</span>
            <span className="text-ink">{m.name}</span>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr]">
            {/* Photo */}
            <div className="relative overflow-hidden rounded-3xl border border-line shadow-card">
              <TeamPhoto photo={m.photo} name={m.name} />
              {m.nmls && (
                <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink backdrop-blur">
                  NMLS# {m.nmls}
                </div>
              )}
            </div>

            {/* Header text */}
            <div>
              <SectionEyebrow>{m.role}</SectionEyebrow>
              <h1
                className="mt-3 font-extrabold tracking-tight text-ink"
                style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.05 }}
              >
                {m.name}
              </h1>
              <p className="mt-5 text-lg leading-8 text-muted">{m.shortBio}</p>

              {/* Quick contact chips */}
              {(m.phone || m.email || m.linkedin) && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {m.phone && (
                    <a
                      href={`tel:${phoneDigits}`}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    >
                      <span aria-hidden>📞</span> Call
                    </a>
                  )}
                  {m.phone && (
                    <a
                      href={`sms:${phoneDigits}`}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    >
                      <span aria-hidden>💬</span> Text
                    </a>
                  )}
                  {m.email && (
                    <a
                      href={`mailto:${m.email}`}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    >
                      <span aria-hidden>✉️</span> Email
                    </a>
                  )}
                  {m.linkedin && (
                    <a
                      href={m.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                    >
                      <span aria-hidden>in</span> LinkedIn
                    </a>
                  )}
                </div>
              )}

              {/* Primary CTAs, anchor to the embedded funnel below */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <a
                  href="#funnel"
                  className="primary-button justify-center !py-4 text-center"
                >
                  Request a Quote with {firstName(m.name)} →
                </a>
                <a
                  href="#funnel"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-brand bg-white px-6 py-4 text-base font-semibold text-brand transition hover:bg-brand hover:text-white"
                >
                  Apply Online
                </a>
              </div>
              <p className="mt-3 text-xs text-muted/70">
                Your application routes directly to {firstName(m.name)}, no rotation, no call center.
              </p>

              {/* Quick facts, secondary info */}
              <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-2">
                {m.yearsExperience !== undefined && (
                  <Fact label="Experience" value={`${m.yearsExperience}+ years in mortgage`} />
                )}
                {m.offices && m.offices.length > 0 && (
                  <Fact label={m.offices.length > 1 ? "Offices" : "Office"} value={m.offices.join(" · ")} />
                )}
                {m.licensedStates && m.licensedStates.length > 0 && (
                  <Fact label="Licensed in" value={m.licensedStates.join(" · ")} />
                )}
                {m.nmls && <Fact label="NMLS" value={`#${m.nmls}`} />}
              </dl>

              {m.speciality && m.speciality.length > 0 && (
                <div className="mt-6">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Specialties
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {m.speciality.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full border border-accent/30 bg-accent/5 px-3 py-1 text-xs font-semibold text-accent"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Embedded funnel, leads route directly to this LO */}
      <section id="funnel" className="section-pad bg-sand scroll-mt-24">
        <div className="container-shell">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <div className="ok-gradient-text mb-3 text-xs font-bold uppercase tracking-[0.2em]">
              Start with {firstName(m.name)}
            </div>
            <h2
              className="font-extrabold tracking-tight text-ink"
              style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1 }}
            >
              See what you can afford in 60 seconds.
            </h2>
            <p className="mt-3 text-base text-muted">
              Purchase or refinance · No hard credit check · No commitment
            </p>
            <p className="mt-2 text-xs text-muted/70">
              Your answers route directly to {firstName(m.name)}, no rotation, no call center.
            </p>
          </div>
          <FunnelFlow lo={funnelLo} />
        </div>
      </section>

      {/* Long bio */}
      <section className="bg-white py-20">
        <div className="container-shell max-w-3xl">
          <h2 className="mb-6 text-2xl font-extrabold text-ink">About {firstName(m.name)}</h2>
          {m.longBio.map((para, i) => (
            <p key={i} className="mb-5 text-base leading-8 text-ink/85">
              {para}
            </p>
          ))}
        </div>
      </section>

      {/* Other team members */}
      {others.length > 0 && (
        <section className="bg-sand py-16">
          <div className="container-shell max-w-5xl">
            <h2 className="mb-8 text-2xl font-extrabold text-ink">More of the HCMG team</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {others.map((o) => (
                <Link
                  key={o.slug}
                  href={`/team/${o.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-line bg-white transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
                >
                  <div className="w-full overflow-hidden">
                    <TeamPhoto photo={o.photo} name={o.name} />
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                      {o.role}
                    </div>
                    <div className="mt-1.5 font-bold text-ink group-hover:text-accent transition-colors">
                      {o.name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/team"
                className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.14em] text-accent hover:underline"
              >
                See the full team <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function firstName(full: string): string {
  return full.replace(/['"()]/g, "").split(/\s+/)[0];
}
