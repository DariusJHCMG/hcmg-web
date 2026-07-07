import Link from "next/link";

export type CareersPath = {
  slug: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  emphasis?: boolean;
};

/**
 * Inspired by the eMortgage Capital careers chooser, four cards that let a
 * visitor self-identify and land on the right recruiting funnel.
 *
 * The `emphasis` flag styles a card as the full-width corporate row at the
 * bottom (like the "Want to become a HQ Employee?" treatment).
 */
export const CAREERS_PATHS: CareersPath[] = [
  {
    slug: "loan-officer",
    eyebrow: "Loan Officers",
    title: "Want to become a Loan Officer?",
    body:
      "Join a platform built for producing loan officers, 100+ lenders, 275 BPS lender-paid comp, modern borrower tools, and a back office that gets your files closed.",
    cta: "Become a Loan Officer",
    href: "/join",
  },
  {
    slug: "producing-manager",
    eyebrow: "Producing Managers",
    title: "Want to become a Producing Manager?",
    body:
      "Open and lead your own HCMG branch with infrastructure built for scale. Recruit your team, share in their production, and keep your independence with HCMG behind you.",
    cta: "Become a Producing Manager",
    href: "/careers/producing-manager",
  },
  {
    slug: "move-your-team",
    eyebrow: "Teams",
    title: "Move your team to HCMG",
    body:
      "We provide the tools, onboarding support, and operational resources to move your full team to HCMG fast, without losing your culture, your pipeline, or your people.",
    cta: "Move My Team",
    href: "/careers/move-your-team",
  },
  {
    slug: "corporate",
    eyebrow: "Corporate",
    title: "Want to become an HQ Employee?",
    body:
      "Join operations, marketing, technology, or compliance and help power the platform that supports loan officers nationwide.",
    cta: "View Open Roles",
    href: "/careers/corporate",
    emphasis: true,
  },
];

export function CareersGateway({ paths = CAREERS_PATHS }: { paths?: CareersPath[] }) {
  const topRow = paths.filter((p) => !p.emphasis);
  const wideRow = paths.filter((p) => p.emphasis);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {topRow.map((path) => (
          <PathCard key={path.slug} path={path} />
        ))}
      </div>
      {wideRow.map((path) => (
        <PathCard key={path.slug} path={path} wide />
      ))}
    </div>
  );
}

function PathCard({ path, wide = false }: { path: CareersPath; wide?: boolean }) {
  return (
    <div
      className={`group flex flex-col rounded-3xl border-2 border-line bg-white p-7 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-card sm:p-8 ${
        wide ? "lg:flex-row lg:items-center lg:gap-10 lg:p-10" : ""
      }`}
    >
      <div className={wide ? "lg:flex-1" : ""}>
        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {path.eyebrow}
        </div>
        <h3
          className="mt-2 font-extrabold tracking-tight text-ink"
          style={{
            fontSize: wide ? "clamp(28px, 3.5vw, 38px)" : "clamp(22px, 2.4vw, 28px)",
            lineHeight: 1.1,
          }}
        >
          {path.title}
        </h3>
        <p className={`text-sm leading-7 text-muted ${wide ? "mt-4 max-w-2xl" : "mt-4"}`}>
          {path.body}
        </p>
      </div>

      <Link
        href={path.href}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-accent-dark ${
          wide ? "mt-6 lg:mt-0 lg:w-auto lg:flex-shrink-0 lg:px-10" : "mt-7 w-full"
        }`}
      >
        {path.cta} <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
