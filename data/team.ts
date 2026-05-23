// ═══════════════════════════════════════════════════════════════════
// HCMG team roster
//
// Loan-officer NMLS numbers + office locations were pulled from
// the company's NMLS Consumer Access listing (Harris Capital
// Mortgage Group LLC, NMLS# 1918223).
//
// Bios for each person are still placeholders — replace longBio
// arrays once real biographical copy is approved.
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
  offices?: string[];
};

const PLACEHOLDER_PHOTO = "/team/placeholder.svg";

const LOAN_OFFICER_LONG_BIO = (firstName: string, name: string, nmls: string, offices: string[]): string[] => [
  `${name} is a licensed mortgage loan originator (NMLS# ${nmls}) at Harris Capital Mortgage Group, serving clients from HCMG's ${offices.join(" and ")} office${offices.length > 1 ? "s" : ""}.`,
  `More about ${firstName}'s background and approach is on the way. To connect, start with a free mortgage estimate or reach out through our contact page — we'll route you to the right HCMG loan officer for your scenario.`,
];

export const teamMembers: TeamMember[] = [
  // ── Leadership ────────────────────────────────────────────────
  {
    slug: "lamont-harris-sr",
    name: "Lamont Harris Sr.",
    role: "Chief Executive Officer",
    nmls: "491049",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Leads strategy, vision, and direction for Harris Capital Mortgage Group.",
    longBio: [
      "Lamont Harris Sr. serves as Chief Executive Officer of Harris Capital Mortgage Group (NMLS# 491049), leading the company's overall strategy, growth, and vision. Based in Las Vegas with additional presence in Houston, he originates loans alongside his executive role.",
      "A fuller biography is on the way. To learn more about working with HCMG, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV", "Houston, TX"],
  },
  {
    slug: "darius-james",
    name: "Darius James",
    role: "President",
    nmls: "1097168",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "President of HCMG, leading the executive team and day-to-day operations of the company.",
    longBio: [
      "Darius James serves as President at Harris Capital Mortgage Group (NMLS# 1097168), leading the executive team and overseeing the company's day-to-day operations.",
      "A fuller biography is on the way. To learn more about HCMG, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "mesia-crews",
    name: 'Jamesia "Mesia" Crews',
    role: "Executive Vice President of Originations",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Heads HCMG's loan origination organization, leading the company's loan officers and origination strategy.",
    longBio: [
      "Jamesia \"Mesia\" Crews serves as Executive Vice President of Originations at Harris Capital Mortgage Group, leading the company's loan-officer team and origination strategy.",
      "A fuller biography is on the way. To learn more, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "aysha-randall",
    name: "Aysha Randall",
    role: "Chief Compliance Officer",
    nmls: "2341853",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Owns compliance, licensing, and regulatory operations across every state HCMG serves.",
    longBio: [
      "Aysha Randall serves as Chief Compliance Officer at Harris Capital Mortgage Group (NMLS# 2341853), responsible for compliance, licensing, and regulatory operations across every state where HCMG originates loans.",
      "A fuller biography is on the way. To learn more, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "ranada-harris",
    name: "Ranada Harris",
    role: "Chief Operating Officer",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Oversees operations across processing, underwriting, and closing at HCMG.",
    longBio: [
      "Ranada Harris serves as Chief Operating Officer at Harris Capital Mortgage Group, leading operations across processing, underwriting, and closing.",
      "A fuller biography is on the way. To learn more, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "adam-demarco",
    name: "Adam DeMarco",
    role: "National Director of Sales and Marketing",
    nmls: "2749110",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Leads sales and marketing strategy nationwide for HCMG.",
    longBio: [
      "Adam DeMarco serves as National Director of Sales and Marketing at Harris Capital Mortgage Group (NMLS# 2749110), leading the company's sales organization and marketing strategy nationwide.",
      "A fuller biography is on the way. To learn more, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV"],
  },

  // ── Loan Officers ────────────────────────────────────────────
  {
    slug: "cason-knight",
    name: "Cason Thomas Knight",
    role: "Loan Officer",
    nmls: "2234863",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Houston and Las Vegas offices.",
    longBio: LOAN_OFFICER_LONG_BIO("Cason", "Cason Thomas Knight", "2234863", ["Houston, TX", "Las Vegas, NV"]),
    offices: ["Houston, TX", "Las Vegas, NV"],
  },
  {
    slug: "don-earl",
    name: "Don Ray Earl",
    role: "Loan Officer",
    nmls: "896069",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Las Vegas and San Diego offices.",
    longBio: LOAN_OFFICER_LONG_BIO("Don", "Don Ray Earl", "896069", ["Las Vegas, NV", "San Diego, CA"]),
    offices: ["Las Vegas, NV", "San Diego, CA"],
  },
  {
    slug: "glenda-medina",
    name: "Glenda Adesmiler Medina",
    role: "Loan Officer",
    nmls: "2247461",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Las Vegas office.",
    longBio: LOAN_OFFICER_LONG_BIO("Glenda", "Glenda Adesmiler Medina", "2247461", ["Las Vegas, NV"]),
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "james-sadowski",
    name: "James Carl Sadowski Jr",
    role: "Loan Officer",
    nmls: "2711950",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Las Vegas office.",
    longBio: LOAN_OFFICER_LONG_BIO("James", "James Carl Sadowski Jr", "2711950", ["Las Vegas, NV"]),
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "james-pasquale",
    name: "James Michael Pasquale",
    role: "Loan Officer",
    nmls: "2410580",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Houston and Las Vegas offices.",
    longBio: LOAN_OFFICER_LONG_BIO("James", "James Michael Pasquale", "2410580", ["Houston, TX", "Las Vegas, NV"]),
    offices: ["Houston, TX", "Las Vegas, NV"],
  },
  {
    slug: "jason-kelly",
    name: "Jason Matthew Kelly",
    role: "Loan Officer",
    nmls: "2000016",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Houston and Las Vegas offices.",
    longBio: LOAN_OFFICER_LONG_BIO("Jason", "Jason Matthew Kelly", "2000016", ["Houston, TX", "Las Vegas, NV"]),
    offices: ["Houston, TX", "Las Vegas, NV"],
  },
  {
    slug: "jimmy-castillo",
    name: "Jimmy Flores Castillo",
    role: "Loan Officer",
    nmls: "2140847",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Houston and Las Vegas offices.",
    longBio: LOAN_OFFICER_LONG_BIO("Jimmy", "Jimmy Flores Castillo", "2140847", ["Houston, TX", "Las Vegas, NV"]),
    offices: ["Houston, TX", "Las Vegas, NV"],
  },
  {
    slug: "latonya-jordan-odom",
    name: "LaTonya Matrice Jordan-Odom",
    role: "Loan Officer",
    nmls: "1798502",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Las Vegas office.",
    longBio: LOAN_OFFICER_LONG_BIO("LaTonya", "LaTonya Matrice Jordan-Odom", "1798502", ["Las Vegas, NV"]),
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "liudmila-paliankova",
    name: "Liudmila Paliankova",
    role: "Loan Officer",
    nmls: "1979184",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Las Vegas office.",
    longBio: LOAN_OFFICER_LONG_BIO("Liudmila", "Liudmila Paliankova", "1979184", ["Las Vegas, NV"]),
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "philbert-wilson",
    name: "Philbert Wilson",
    role: "Loan Officer",
    nmls: "1053787",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Houston and Las Vegas offices.",
    longBio: LOAN_OFFICER_LONG_BIO("Philbert", "Philbert Wilson", "1053787", ["Houston, TX", "Las Vegas, NV"]),
    offices: ["Houston, TX", "Las Vegas, NV"],
  },
  {
    slug: "rafael-espinoza",
    name: "Rafael Espinoza",
    role: "Loan Officer",
    nmls: "2083843",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Las Vegas office.",
    longBio: LOAN_OFFICER_LONG_BIO("Rafael", "Rafael Espinoza", "2083843", ["Las Vegas, NV"]),
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "tamara-hodges-brown",
    name: "Tamara Hodges-Brown",
    role: "Loan Officer",
    nmls: "2465567",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Licensed mortgage loan originator at HCMG, serving clients from our Las Vegas office.",
    longBio: LOAN_OFFICER_LONG_BIO("Tamara", "Tamara Hodges-Brown", "2465567", ["Las Vegas, NV"]),
    offices: ["Las Vegas, NV"],
  },

  // ── Operations ─────────────────────────────────────────────────
  // ▶ Placeholder slots — replace with real names/photos/bios.
  {
    slug: "ops-processor-placeholder",
    name: "Senior Processor Name",
    role: "Senior Loan Processor",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Keeps files moving through underwriting cleanly so borrowers close on time, every time.",
    longBio: [
      "Replace with paragraph one — operational background, what they bring to the HCMG process.",
      "Replace with paragraph two — favorite kinds of files, common challenges they help borrowers solve.",
      "Replace with paragraph three — personal note.",
    ],
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "ops-underwriter-placeholder",
    name: "Lead Underwriter Name",
    role: "Lead Underwriter",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Reviews every loan with an eye toward getting to yes while protecting the borrower and the file.",
    longBio: [
      "Replace with paragraph one — underwriting background, where they trained.",
      "Replace with paragraph two — file types they specialize in, what they look for.",
      "Replace with paragraph three — personal note.",
    ],
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "ops-director-placeholder",
    name: "Operations Director Name",
    role: "Director of Operations",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Runs the engine room — vendor management, compliance support, and the systems that keep HCMG efficient.",
    longBio: [
      "Replace with paragraph one — operational background, what they own at HCMG.",
      "Replace with paragraph two — systems and processes they oversee.",
      "Replace with paragraph three — personal note.",
    ],
    offices: ["Las Vegas, NV"],
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
  if (
    r.includes("founder") ||
    r.includes("ceo") ||
    r.includes("chief executive") ||
    r.includes("president") ||
    r.includes("chief") ||
    r.includes("national director")
  )
    return "Leadership";
  if (r.includes("loan officer") || r.includes("loan originator") || r.includes("branch manager"))
    return "Loan Officers";
  return "Operations";
}
