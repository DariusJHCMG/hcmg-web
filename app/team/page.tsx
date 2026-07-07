import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { teamMembers, getTeamGroupedByRole } from "@/data/team";

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

const teamSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Harris Capital Mortgage Group, LLC",
  alternateName: "HCMG",
  url: "https://getorangekey.com",
  employee: teamMembers.map((m) => ({
    "@type": "Person",
    name: m.name,
    jobTitle: m.role,
    url: `https://getorangekey.com/team/${m.slug}`,
    image: `https://getorangekey.com${m.photo}`,
    ...(m.nmls ? { identifier: { "@type": "PropertyValue", propertyID: "NMLS", value: m.nmls } } : {}),
  })),
};

export default function TeamPage() {
  const groups = getTeamGroupedByRole();

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
                {group.members.map((m) => (
                  <Link
                    key={m.slug}
                    href={`/team/${m.slug}`}
                    className="group block overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition-all hover:-translate-y-1 hover:border-accent hover:shadow-card"
                  >
                    <div className="relative w-full overflow-hidden">
                      <TeamPhoto
                        photo={m.photo}
                        name={m.name}
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
                        {m.role}
                      </div>
                      <div className="mt-2 text-xl font-extrabold text-ink group-hover:text-accent transition-colors">
                        {m.name}
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted">{m.shortBio}</p>
                      {m.speciality && m.speciality.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5">
                          {m.speciality.slice(0, 3).map((s) => (
                            <span
                              key={s}
                              className="inline-flex items-center rounded-full border border-line bg-sand px-2.5 py-0.5 text-[11px] font-semibold text-muted"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
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

function groupHeadline(role: string): string {
  switch (role) {
    case "Leadership":
      return "Strategy, vision, and accountability.";
    case "Loan Officers":
      return "Licensed advisors who own your file end-to-end.";
    case "Operations":
      return "The team that keeps every closing on schedule.";
    default:
      return role;
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
    default:
      return "";
  }
}
