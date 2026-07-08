import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { createServiceClient } from "@/lib/supabase";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Meet the HCMG Team, Loan Officers, Processors & Leadership | Harris Capital Mortgage Group",
  description:
    "The people behind HCMG. Licensed loan officers, processors, and operations leaders who walk every client from pre-approval to closing. NMLS# 1918223.",
  alternates: { canonical: "https://getorangekey.com/team" },
  openGraph: {
    title: "Meet the HCMG Team",
    description:
      "Licensed loan officers, processors, and leadership at Harris Capital Mortgage Group. NMLS# 1918223.",
    url: "https://getorangekey.com/team",
    images: ["/hcmg-social-square.svg"],
  },
};

// Role → display group
function inferGroup(role: string): string {
  const r = (role ?? "").toLowerCase();
  if (r.includes("founder") || r.includes("ceo") || r.includes("chief executive") ||
      r.includes("president") || r.includes("chief") || r.includes("national director"))
    return "Leadership";
  if (r.includes("loan officer") || r.includes("loan originator") || r.includes("branch manager"))
    return "Loan Officers";
  return "Operations";
}

const GROUP_ORDER = ["Leadership", "Loan Officers", "Operations"];

function groupHeadline(role: string): string {
  switch (role) {
    case "Leadership":    return "Strategy, vision, and accountability.";
    case "Loan Officers": return "Licensed advisors who own your file end-to-end.";
    case "Operations":    return "The team that keeps every closing on schedule.";
    default: return role;
  }
}
function groupBlurb(role: string): string {
  switch (role) {
    case "Leadership":
      return "The team setting direction at HCMG, building the kind of mortgage company we'd want to use ourselves.";
    case "Loan Officers":
      return "Every loan officer at HCMG is licensed through the Nationwide Multistate Licensing System (NMLS) and personally available for the lifecycle of your file. No call centers, no rotating reps.";
    case "Operations":
      return "Processing, underwriting, and the operational backbone of the company. Their work is why borrowers close on time.";
    default: return "";
  }
}

// Initials from a name
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

export default async function TeamPage() {
  const sb = createServiceClient();

  // Fetch all active profiles that have a display role set
  const { data: rows } = await sb
    .from("profiles")
    .select("id, full_name, role, title, nmls, lo_slug, short_bio, offices, linkedin, avatar_url, is_active, show_on_website")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  const members = (rows ?? []).filter(
    (p) => p.full_name && p.role
  );

  // Group by display group
  const groupMap = new Map<string, typeof members>();
  for (const m of members) {
    const g = inferGroup(m.title ?? m.role ?? "");
    if (!groupMap.has(g)) groupMap.set(g, []);
    groupMap.get(g)!.push(m);
  }
  const groups = GROUP_ORDER
    .filter((g) => groupMap.has(g))
    .map((g) => ({ role: g, members: groupMap.get(g)! }));

  const teamSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Harris Capital Mortgage Group, LLC",
    alternateName: "HCMG",
    url: "https://getorangekey.com",
    employee: members.map((m) => ({
      "@type": "Person",
      name: m.full_name,
      jobTitle: m.title ?? m.role,
      url: m.lo_slug ? `https://getorangekey.com/team/${m.lo_slug}` : undefined,
      ...(m.nmls ? { identifier: { "@type": "PropertyValue", propertyID: "NMLS", value: m.nmls } } : {}),
    })),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamSchema) }}
      />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 40 }}>
        <div className="container-shell max-w-4xl">
          <SectionEyebrow>The People Behind HCMG</SectionEyebrow>
          <h1
            className="mt-3 font-extrabold tracking-tight text-ink"
            style={{ fontSize: "clamp(40px, 6vw, 64px)", lineHeight: 1.05 }}
          >
            Meet the team that gets you home.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
            Every loan at Harris Capital Mortgage Group is handled by a small team of licensed professionals
            who know your file, answer their own phones, and explain the parts of the process that other
            lenders skip past.
          </p>
        </div>
      </section>

      {/* Team groups */}
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
                {group.members.map((m) => {
                  const profileHref = m.lo_slug ? `/team/${m.lo_slug}` : null;
                  const displayRole = m.title ?? m.role ?? "";
                  const bio = m.short_bio ?? "";

                  const card = (
                    <div className={`group block overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition-all
                      ${profileHref ? "hover:-translate-y-1 hover:border-accent hover:shadow-card cursor-pointer" : ""}`}>
                      {/* Avatar — initials only, no photo per requirement */}
                      <div className="relative flex h-48 w-full items-center justify-center"
                           style={{ background: "linear-gradient(135deg,#142850 0%,#1e3a6e 100%)" }}>
                        <span className="text-5xl font-black text-white/90 tracking-tight">
                          {initials(m.full_name)}
                        </span>
                        {m.nmls && (
                          <span className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-ink backdrop-blur">
                            NMLS# {m.nmls}
                          </span>
                        )}
                      </div>

                      <div className="p-6">
                        <div className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                          {displayRole}
                        </div>
                        <div className={`mt-2 text-xl font-extrabold text-ink transition-colors ${profileHref ? "group-hover:text-accent" : ""}`}>
                          {m.full_name}
                        </div>
                        {bio && (
                          <p className="mt-3 text-sm leading-6 text-muted line-clamp-3">{bio}</p>
                        )}
                        {m.offices && m.offices.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {m.offices.map((o: string) => (
                              <span key={o} className="inline-flex rounded-full border border-line bg-sand px-2.5 py-0.5 text-[11px] font-semibold text-muted">
                                {o}
                              </span>
                            ))}
                          </div>
                        )}
                        {profileHref && (
                          <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                            View profile <span aria-hidden>→</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );

                  return profileHref ? (
                    <Link key={m.id} href={profileHref}>{card}</Link>
                  ) : (
                    <div key={m.id}>{card}</div>
                  );
                })}
              </div>
            </div>
          ))}

          {members.length === 0 && (
            <p className="py-20 text-center text-muted">Team profiles coming soon.</p>
          )}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="bg-sand">
        <div className="container-shell max-w-3xl py-20 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
            Want to work with one of them on your file?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted">
            Start with a free estimate and we&apos;ll pair you with a licensed HCMG loan officer in your
            state who fits your scenario.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/get-started" className="primary-button">
              Get my estimate →
            </Link>
            <Link href="/contact" className="secondary-button">
              Talk to us directly
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
