import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { FunnelFlow } from "@/components/funnel/FunnelFlow";
import { createServiceClient } from "@/lib/supabase";
import { teamMembers, getTeamMemberBySlug } from "@/data/team";
import type { Profile } from "@/lib/database.types";

export const revalidate = 60;

// ── Normalised shape ─────────────────────────────────────────────────

interface MemberDetail {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  nmls: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  avatar_url: string | null;
  short_bio: string | null;
  offices: string[] | null;
  licensed_states: string[] | null;
  long_bio: string[] | null;   // only from static fallback
}

// ── Supabase fetch ────────────────────────────────────────────────────

async function getProfileFromSupabase(slug: string): Promise<MemberDetail | null> {
  try {
    const sb = createServiceClient();
    // Try lo_slug first, then UUID
    const { data: bySlug } = await sb
      .from("profiles")
      .select("*")
      .eq("lo_slug", slug)
      .eq("is_active", true)
      .single();
    const raw = (bySlug ?? null) as Profile | null;

    if (!raw) {
      const { data: byId } = await sb
        .from("profiles")
        .select("*")
        .eq("id", slug)
        .eq("is_active", true)
        .single();
      if (!byId) return null;
      return profileToDetail(byId as Profile);
    }
    return profileToDetail(raw);
  } catch {
    return null;
  }
}

function profileToDetail(p: Profile): MemberDetail {
  return {
    id:              p.id,
    slug:            p.lo_slug ?? p.id,
    full_name:       p.full_name,
    title:           p.title ?? p.role.replace("_", " "),
    nmls:            p.nmls ?? null,
    email:           p.email ?? null,
    phone:           p.phone ?? null,
    linkedin:        p.linkedin ?? null,
    avatar_url:      p.avatar_url ?? null,
    short_bio:       p.short_bio ?? null,
    offices:         p.offices ?? null,
    licensed_states: p.licensed_states ?? null,
    long_bio:        null,
  };
}

// ── Static fallback ───────────────────────────────────────────────────

function getStaticMember(slug: string): MemberDetail | null {
  const m = getTeamMemberBySlug(slug);
  if (!m) return null;
  return {
    id:              m.slug,
    slug:            m.slug,
    full_name:       m.name,
    title:           m.role,
    nmls:            m.nmls,
    email:           m.email ?? null,
    phone:           m.phone ?? null,
    linkedin:        m.linkedin ?? null,
    avatar_url:      m.photo !== "/team/placeholder.svg" ? m.photo : null,
    short_bio:       m.shortBio,
    offices:         m.offices ?? null,
    licensed_states: m.licensedStates ?? null,
    long_bio:        m.longBio,
  };
}

async function getMember(slug: string): Promise<MemberDetail | null> {
  const fromDB = await getProfileFromSupabase(slug);
  if (fromDB) return fromDB;
  return getStaticMember(slug);
}

// ── Other team members (sidebar) ─────────────────────────────────────

interface OtherMember {
  id: string;
  slug: string;
  full_name: string;
  title: string;
  avatar_url: string | null;
}

async function getOthers(excludeSlug: string): Promise<OtherMember[]> {
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("profiles")
      .select("id, full_name, title, role, lo_slug, avatar_url, show_on_website")
      .eq("is_active", true)
      .limit(10);
    type Row = { id: string; full_name: string; title: string | null; role: string; lo_slug: string | null; avatar_url: string | null; show_on_website: boolean };
    const visible = ((data ?? []) as Row[]).filter((p) => p.show_on_website === true);
    if (visible.length === 0) throw new Error("no supabase data");
    return visible
      .filter((p) => (p.lo_slug ?? p.id) !== excludeSlug)
      .slice(0, 3)
      .map((p) => ({
        id:         p.id,
        slug:       p.lo_slug ?? p.id,
        full_name:  p.full_name,
        title:      p.title ?? p.role.replace("_", " "),
        avatar_url: p.avatar_url ?? null,
      }));
  } catch {
    // Fall back to static
    return teamMembers
      .filter((m) => m.slug !== excludeSlug)
      .slice(0, 3)
      .map((m) => ({
        id:         m.slug,
        slug:       m.slug,
        full_name:  m.name,
        title:      m.role,
        avatar_url: m.photo !== "/team/placeholder.svg" ? m.photo : null,
      }));
  }
}

// ── generateStaticParams — build all slugs at deploy time ─────────────

export async function generateStaticParams() {
  // Start with static slugs (always available)
  const staticSlugs = teamMembers.map((m) => ({ slug: m.slug }));
  try {
    const sb = createServiceClient();
    const { data } = await sb.from("profiles").select("id, lo_slug").eq("is_active", true);
    const dbSlugs  = (data ?? []).map((p: { id: string; lo_slug: string | null }) => ({
      slug: p.lo_slug ?? p.id,
    }));
    // Merge, dedup
    const all = [...staticSlugs, ...dbSlugs];
    const seen = new Set<string>();
    return all.filter((s) => { if (seen.has(s.slug)) return false; seen.add(s.slug); return true; });
  } catch {
    return staticSlugs;
  }
}

// ── Metadata ──────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const m = await getMember(slug);
  if (!m) return {};
  const title = m.nmls
    ? `${m.full_name}, ${m.title}, NMLS# ${m.nmls} | HCMG`
    : `${m.full_name}, ${m.title} | HCMG`;
  return {
    title,
    description: m.short_bio ?? `${m.full_name} at Harris Capital Mortgage Group.`,
    alternates: { canonical: `https://getorangekey.com/team/${slug}` },
    openGraph: {
      title: `${m.full_name}, ${m.title}`,
      description: m.short_bio ?? "",
      url: `https://getorangekey.com/team/${slug}`,
      images: [m.avatar_url ?? "/team/placeholder.svg"],
    },
  };
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function TeamMemberPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const m = await getMember(slug);
  if (!m) notFound();

  const others      = await getOthers(m.slug);
  const phoneDigits = m.phone?.replace(/[^0-9+]/g, "") ?? "";
  const funnelLo    = { slug: m.slug, name: m.full_name, nmls: m.nmls };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: m.full_name,
    jobTitle: m.title,
    url: `https://getorangekey.com/team/${slug}`,
    worksFor: { "@type": "Organization", name: "Harris Capital Mortgage Group, LLC", url: "https://getorangekey.com" },
    ...(m.email    ? { email: m.email } : {}),
    ...(m.phone    ? { telephone: m.phone } : {}),
    ...(m.linkedin ? { sameAs: [m.linkedin] } : {}),
    ...(m.nmls     ? { identifier: { "@type": "PropertyValue", propertyID: "NMLS", value: m.nmls } } : {}),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://getorangekey.com" },
      { "@type": "ListItem", position: 2, name: "Team", item: "https://getorangekey.com/team" },
      { "@type": "ListItem", position: 3, name: m.full_name, item: `https://getorangekey.com/team/${slug}` },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 32 }}>
        <div className="container-shell max-w-5xl">
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <Link href="/" className="hover:text-accent">Home</Link>
            <span aria-hidden>›</span>
            <Link href="/team" className="hover:text-accent">Team</Link>
            <span aria-hidden>›</span>
            <span className="text-ink">{m.full_name}</span>
          </nav>

          <div className="grid items-start gap-10 lg:grid-cols-[1fr_1.4fr]">
            {/* Photo */}
            <div className="relative overflow-hidden rounded-3xl border border-line shadow-card">
              <TeamPhoto photo={m.avatar_url ?? "/team/placeholder.svg"} name={m.full_name} />
              {m.nmls && (
                <div className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-ink backdrop-blur">
                  NMLS# {m.nmls}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <SectionEyebrow>{m.title}</SectionEyebrow>
              <h1 className="mt-3 font-extrabold tracking-tight text-ink" style={{ fontSize: "clamp(36px, 5vw, 56px)", lineHeight: 1.05 }}>
                {m.full_name}
              </h1>
              {m.short_bio && (
                <p className="mt-5 text-lg leading-8 text-muted">{m.short_bio}</p>
              )}

              {/* Contact chips */}
              {(m.phone || m.email || m.linkedin) && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {m.phone && (
                    <a href={`tel:${phoneDigits}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent">
                      <span>📞</span> Call
                    </a>
                  )}
                  {m.phone && (
                    <a href={`sms:${phoneDigits}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent">
                      <span>💬</span> Text
                    </a>
                  )}
                  {m.email && (
                    <a href={`mailto:${m.email}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent">
                      <span>✉️</span> Email
                    </a>
                  )}
                  {m.linkedin && (
                    <a href={m.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent">
                      <span>in</span> LinkedIn
                    </a>
                  )}
                </div>
              )}

              {/* CTAs */}
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <a href="#funnel" className="primary-button justify-center !py-4 text-center">
                  Request a Quote with {m.full_name.split(" ")[0]} →
                </a>
                <a href="#funnel" className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-brand bg-white px-6 py-4 text-base font-semibold text-brand transition hover:bg-brand hover:text-white">
                  Apply Online
                </a>
              </div>
              <p className="mt-3 text-xs text-muted/70">
                Your application routes directly to {m.full_name.split(" ")[0]}, no rotation, no call center.
              </p>

              {/* Quick facts */}
              <dl className="mt-8 grid gap-x-8 gap-y-4 border-t border-line pt-6 sm:grid-cols-2">
                {m.offices && m.offices.length > 0 && (
                  <Fact label={m.offices.length > 1 ? "Offices" : "Office"} value={m.offices.join(" · ")} />
                )}
                {m.licensed_states && m.licensed_states.length > 0 && (
                  <Fact label="Licensed in" value={m.licensed_states.join(" · ")} />
                )}
                {m.nmls && <Fact label="NMLS" value={`#${m.nmls}`} />}
              </dl>
            </div>
          </div>

          {/* Long bio paragraphs (static only, until replaced with Supabase rich text) */}
          {m.long_bio && m.long_bio.length > 0 && (
            <div className="mt-12 max-w-3xl space-y-4">
              {m.long_bio.map((para, i) => (
                <p key={i} className="text-base leading-8 text-muted">{para}</p>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Funnel */}
      <section id="funnel" className="section-pad bg-sand scroll-mt-24">
        <div className="container-shell">
          <div className="mx-auto mb-10 max-w-xl text-center">
            <div className="ok-gradient-text mb-3 text-xs font-bold uppercase tracking-[0.2em]">
              Start with {m.full_name.split(" ")[0]}
            </div>
            <h2 className="font-extrabold tracking-tight text-ink" style={{ fontSize: "clamp(28px, 4vw, 44px)", lineHeight: 1.1 }}>
              See what you can afford in 60 seconds.
            </h2>
            <p className="mt-3 text-base text-muted">Purchase or refinance · No hard credit check · No commitment</p>
          </div>
          <FunnelFlow lo={funnelLo} />
        </div>
      </section>

      {/* Others */}
      {others.length > 0 && (
        <section className="bg-sand py-16">
          <div className="container-shell max-w-5xl">
            <h2 className="mb-8 text-2xl font-extrabold text-ink">More of the HCMG team</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {others.map((o) => (
                <Link key={o.id} href={`/team/${o.slug}`}
                  className="group block overflow-hidden rounded-2xl border border-line bg-white transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-soft">
                  <TeamPhoto photo={o.avatar_url ?? "/team/placeholder.svg"} name={o.full_name} />
                  <div className="p-5">
                    <div className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                      {o.title}
                    </div>
                    <div className="mt-1.5 font-bold text-ink group-hover:text-accent transition-colors">
                      {o.full_name}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-8 text-center">
              <Link href="/team" className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-[0.14em] text-accent hover:underline">
                See the full team <span>→</span>
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
