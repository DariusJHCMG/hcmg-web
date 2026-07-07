import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { createServiceClient } from "@/lib/supabase";
import { teamMembers, getTeamGroupedByRole } from "@/data/team";
import type { Profile } from "@/lib/database.types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Meet the HCMG Team, Loan Officers, Processors & Leadership | Harris Capital Mortgage Group",
  description:
    "The people behind HCMG. Licensed loan officers, processors, and operations leaders who walk every client from pre-approval to closing. NMLS# 1918223.",
  alternates: { canonical: "https://getorangekey.com/team" },
  openGraph: {
    title: "Meet the HCMG Team",
    description: "Licensed loan officers, processors, and leadership at Harris Capital Mortgage Group. NMLS# 1918223.",
    url: "https://getorangekey.com/team",
    images: ["/hcmg-social-square.svg"],
  },
};

// ── Normalised shape used by both data sources ───────────────────────

interface DisplayMember {
  id: string;           // uuid or slug (for fallback)
  slug: string;         // URL segment
  full_name: string;
  title: string;
  nmls: string | null;
  avatar_url: string | null;
  short_bio: string | null;
}

interface DisplayGroup {
  role: string;
  members: DisplayMember[];
}

// ── Data fetching ─────────────────────────────────────────────────────

async function getTeamFromSupabase(): Promise<DisplayMember[] | null> {
  try {
    const sb = createServiceClient();
    const { data, error } = await sb
      .from("profiles")
      .select("id, full_name, title, role, lo_slug, nmls, avatar_url, short_bio, show_on_website, is_active")
      .eq("is_active", true)
      .order("full_name");
    if (error || !data || data.length === 0) return null;

    // Only use Supabase data if at least one profile has show_on_website = true
    // (column may not exist yet before patch 004 is run)
    type Row = { id: string; full_name: string; title: string | null; role: string; lo_slug: string | null; nmls: string | null; avatar_url: string | null; short_bio: string | null; show_on_website: boolean };
    const rows = (data as Row[]);
    const visible = rows.filter((p) => p.show_on_website === true);
    if (visible.length === 0) return null;

    return visible.map((p) => ({
      id:         p.id,
      slug:       p.lo_slug ?? p.id,
      full_name:  p.full_name,
      title:      p.title ?? p.role.replace("_", " "),
      nmls:       p.nmls ?? null,
      avatar_url: p.avatar_url ?? null,
      short_bio:  p.short_bio ?? null,
    }));
  } catch {
    return null;
  }
}

function getTeamFromStatic(): { groups: DisplayGroup[]; allMembers: DisplayMember[] } {
  const groups = getTeamGroupedByRole().map((g) => ({
    role: g.role,
    members: g.members.map((m) => ({
      id:         m.slug,
      slug:       m.slug,
      full_name:  m.name,
      title:      m.role,
      nmls:       m.nmls,
      avatar_url: m.photo !== "/team/placeholder.svg" ? m.photo : null,
      short_bio:  m.shortBio,
    })),
  }));
  return {
    groups,
    allMembers: groups.flatMap((g) => g.members),
  };
}

function groupSupabaseMembers(members: DisplayMember[]): DisplayGroup[] {
  // Simple grouping: leadership titles, loan_officer role word, rest = operations
  const leadership: DisplayMember[] = [];
  const los: DisplayMember[] = [];
  const ops: DisplayMember[] = [];
  for (const m of members) {
    const t = m.title.toLowerCase();
    if (/(founder|ceo|chief|president|director|officer\b)/.test(t) && !t.includes("loan officer")) {
      leadership.push(m);
    } else if (t.includes("loan officer") || t.includes("loan originator")) {
      los.push(m);
    } else {
      ops.push(m);
    }
  }
  const result: DisplayGroup[] = [];
  if (leadership.length) result.push({ role: "Leadership", members: leadership });
  if (los.length)        result.push({ role: "Loan Officers", members: los });
  if (ops.length)        result.push({ role: "Operations", members: ops });
  return result;
}

// ── Page ──────────────────────────────────────────────────────────────

export default async function TeamPage() {
  const supabaseMembers = await getTeamFromSupabase();

  let groups: DisplayGroup[];
  let allMembers: DisplayMember[];

  if (supabaseMembers && supabaseMembers.length > 0) {
    groups     = groupSupabaseMembers(supabaseMembers);
    allMembers = supabaseMembers;
  } else {
    // Supabase not ready yet — use static data/team.ts
    const fallback = getTeamFromStatic();
    groups     = fallback.groups;
    allMembers = fallback.allMembers;
  }

  const teamSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Harris Capital Mortgage Group, LLC",
    url: "https://getorangekey.com",
    employee: allMembers.map((m) => ({
      "@type": "Person",
      name: m.full_name,
      jobTitle: m.title,
      url: `https://getorangekey.com/team/${m.slug}`,
      ...(m.nmls ? { identifier: { "@type": "PropertyValue", propertyID: "NMLS", value: m.nmls } } : {}),
    })),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }} />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 40 }}>
        <div className="container-shell max-w-4xl">
          <SectionEyebrow>The People Behind HCMG</SectionEyebrow>
          <h1 className="mt-3 font-extrabold tracking-tight text-ink" style={{ fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.05 }}>
            Meet the team that gets you home.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Every loan at Harris Capital Mortgage Group is handled by a small team of licensed professionals
            who know your file, answer their own phones, and explain the parts of the process that other lenders skip past.
          </p>
        </div>
      </section>

      {/* Groups */}
      <section className="section-pad bg-white">
        <div className="container-shell max-w-6xl space-y-20">
          {groups.map((group) => (
            <div key={group.role}>
              <div className="mb-10 max-w-2xl">
                <SectionEyebrow>{group.role}</SectionEyebrow>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
                  {groupHeadline(group.role)}
                </h2>
                <p className="mt-3 text-base leading-7 text-muted">{groupBlurb(group.role)}</p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.members.map((m) => (
                  <Link
                    key={m.id}
                    href={`/team/${m.slug}`}
                    className="group block overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition-all hover:-translate-y-1 hover:border-accent hover:shadow-card"
                  >
                    <div className="relative w-full overflow-hidden">
                      <TeamPhoto
                        photo={m.avatar_url ?? "/team/placeholder.svg"}
                        name={m.full_name}
                        className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      {m.nmls && (
                        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink backdrop-blur">
                          NMLS# {m.nmls}
                        </span>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                        {m.title}
                      </div>
                      <div className="mt-2 text-xl font-extrabold text-ink group-hover:text-accent transition-colors">
                        {m.full_name}
                      </div>
                      {m.short_bio && (
                        <p className="mt-3 text-sm leading-6 text-muted">{m.short_bio}</p>
                      )}
                      <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                        View profile <span aria-hidden>→</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sand">
        <div className="container-shell max-w-3xl py-20 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
            Want to work with one of them on your file?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
            Start with a free estimate and we&apos;ll pair you with a licensed HCMG loan officer in your state who fits your scenario.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/get-started" className="primary-button">Get my estimate →</Link>
            <Link href="/contact" className="secondary-button">Talk to us directly</Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function groupHeadline(role: string): string {
  if (role === "Leadership")    return "Strategy, vision, and accountability.";
  if (role === "Loan Officers") return "Licensed advisors who own your file end-to-end.";
  if (role === "Operations")    return "The team that keeps every closing on schedule.";
  return role;
}
function groupBlurb(role: string): string {
  if (role === "Leadership")    return "The team setting direction at HCMG, building the kind of mortgage company we'd want to use ourselves.";
  if (role === "Loan Officers") return "Every loan officer at HCMG is licensed through the Nationwide Multistate Licensing System (NMLS) and personally available for the lifecycle of your file. No call centers, no rotating reps.";
  if (role === "Operations")    return "Processing, underwriting, and the operational backbone of the company. Their work is why borrowers close on time.";
  return "";
}
