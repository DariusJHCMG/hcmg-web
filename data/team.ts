// ═══════════════════════════════════════════════════════════════════
// HCMG team roster
//
// ▶ Replace the placeholder entries below with real team data once
//   names, photos, NMLS numbers, and bios are available.
//
// Per-member fields:
//   slug          unique URL-safe identifier (e.g. "jane-doe")
//   name          full name as it should appear publicly
//   role          short job title shown under the name
//   nmls          NMLS individual license number (or null if N/A)
//   photo         path to /public photo (square crop preferred)
//   shortBio      one-sentence summary used on grid cards + meta
//   longBio       array of paragraphs for the per-member page
//   email         optional contact email
//   phone         optional direct phone, formatted for display
//   linkedin      optional LinkedIn profile URL
//   yearsExperience  optional, drives the experience badge
//   licensedStates   optional array of US state abbreviations
//   speciality    optional list of focus areas (e.g. ["VA loans", "First-time buyers"])
// ═══════════════════════════════════════════════════════════════════

export type TeamMember = {
  slug: string;
  name: string;
  role: string;
  nmls: string | null;
  photo: string;
  shortBio: string;
  longBio: string[];
  email?: string;
  phone?: string;
  linkedin?: string;
  yearsExperience?: number;
  licensedStates?: string[];
  speciality?: string[];
};

// Generic team-card placeholder (initials-only SVG, navy bg).
// Replace per-member photo paths with real images once available.
const PLACEHOLDER_PHOTO = "/team/placeholder.svg";

export const teamMembers: TeamMember[] = [
  {
    slug: "founder-placeholder",
    name: "Founder Name",
    role: "Founder & Chief Executive Officer",
    nmls: "0000000",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Founded HCMG with the mission of bringing transparent, honest mortgage advice to every buyer.",
    longBio: [
      "Replace this paragraph with the founder's career background — where they started in mortgage lending, the path that led to founding HCMG, and what they're trying to build here.",
      "A second paragraph can describe their philosophy on lending, what they value in client relationships, and the kind of borrower they personally enjoy working with.",
      "A third short paragraph can be personal — where they live, what they do outside of work, any community involvement worth highlighting.",
    ],
    yearsExperience: 20,
    licensedStates: ["FL", "TX", "GA", "NV", "CO", "VA", "DC", "MD"],
    speciality: ["Jumbo loans", "Investment property", "Self-employed borrowers"],
  },
  {
    slug: "loan-officer-1",
    name: "Senior Loan Officer Name",
    role: "Senior Loan Officer",
    nmls: "0000001",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Specializes in first-time buyer programs and helping clients build a clear path from pre-approval to closing.",
    longBio: [
      "Replace with bio paragraph one — how they got into lending, where they're licensed, what they care about in the work.",
      "Paragraph two — typical client profile, signature scenarios they handle well, what borrowers tell them about working together.",
      "Paragraph three — personal note, location, hobbies, languages spoken, certifications.",
    ],
    yearsExperience: 8,
    licensedStates: ["FL", "GA", "TX"],
    speciality: ["First-time buyers", "FHA", "VA loans"],
  },
  {
    slug: "loan-officer-2",
    name: "Loan Officer Name",
    role: "Loan Officer",
    nmls: "0000002",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Focuses on refinance strategy and helping homeowners time the market for maximum savings.",
    longBio: [
      "Replace with paragraph one.",
      "Replace with paragraph two — niche expertise, what kinds of files they get excited about.",
      "Replace with paragraph three — personal background, why HCMG.",
    ],
    yearsExperience: 5,
    licensedStates: ["TX", "CO", "NV"],
    speciality: ["Rate-and-term refinance", "Cash-out refinance"],
  },
  {
    slug: "processor-placeholder",
    name: "Senior Processor Name",
    role: "Senior Loan Processor",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Keeps files moving through underwriting cleanly so borrowers close on time, every time.",
    longBio: [
      "Replace with paragraph one — operational background, what they bring to the process.",
      "Replace with paragraph two — favorite kinds of files, common challenges they help borrowers solve.",
      "Replace with paragraph three — personal note.",
    ],
    yearsExperience: 12,
    speciality: ["Complex income files", "Investment property processing"],
  },
  {
    slug: "underwriter-placeholder",
    name: "Lead Underwriter Name",
    role: "Lead Underwriter",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Reviews every loan with an eye toward getting to yes while protecting the borrower and the file.",
    longBio: [
      "Replace with paragraph one.",
      "Replace with paragraph two.",
      "Replace with paragraph three.",
    ],
    yearsExperience: 15,
    speciality: ["Conventional", "Jumbo", "Non-QM"],
  },
  {
    slug: "ops-placeholder",
    name: "Operations Lead Name",
    role: "Director of Operations",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Runs the engine room — vendor management, compliance, and the systems that keep HCMG efficient.",
    longBio: [
      "Replace with paragraph one.",
      "Replace with paragraph two.",
      "Replace with paragraph three.",
    ],
    yearsExperience: 10,
    speciality: ["Compliance", "Lender vendor management"],
  },
];

export function getTeamMemberBySlug(slug: string): TeamMember | undefined {
  return teamMembers.find((m) => m.slug === slug);
}

export function getTeamGroupedByRole(): { role: string; members: TeamMember[] }[] {
  const groups = new Map<string, TeamMember[]>();
  for (const m of teamMembers) {
    const bucket = inferGroup(m.role);
    if (!groups.has(bucket)) groups.set(bucket, []);
    groups.get(bucket)!.push(m);
  }
  const order = ["Leadership", "Loan Officers", "Operations"];
  return order
    .filter((g) => groups.has(g))
    .map((role) => ({ role, members: groups.get(role)! }));
}

function inferGroup(role: string): string {
  const r = role.toLowerCase();
  if (r.includes("founder") || r.includes("ceo") || r.includes("president") || r.includes("chief"))
    return "Leadership";
  if (r.includes("loan officer") || r.includes("loan originator") || r.includes("branch manager"))
    return "Loan Officers";
  return "Operations";
}
