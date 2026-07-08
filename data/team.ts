// ═══════════════════════════════════════════════════════════════════
// HCMG team roster
//
// Loan-officer NMLS numbers + office locations were pulled from
// the company's NMLS Consumer Access listing (Harris Capital
// Mortgage Group LLC, NMLS# 1918223).
//
// ✅ Phone, email, avatar_url, and bio are managed via the portal
//    (Supabase profiles table) — set them there, they show up on
//    the public team pages automatically. No code changes needed.
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
  `More about ${firstName}'s background and approach is on the way. To connect, start the estimate flow directly on this page or reach out through the contact chips above, the lead will route directly to ${firstName}.`,
];

export const teamMembers: TeamMember[] = [
  // ── Leadership ────────────────────────────────────────────────
  {
    slug: "lamont-harris-jr",
    name: "Lamont Harris Jr.",
    role: "Founder & CEO",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Over 15 years of mortgage industry experience. Founded HCMG to bring transparency and integrity to lending.",
    longBio: [
      "Lamont Harris Jr. is the Founder and Chief Executive Officer of Harris Capital Mortgage Group, bringing over 15 years of mortgage industry experience to the role.",
      "He founded HCMG with a clear purpose: to bring transparency and integrity to the lending process so every family has a fair path to homeownership.",
      "A fuller biography is on the way. To learn more about working with HCMG, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV", "Houston, TX"],
  },
  {
    slug: "astrine-covington",
    name: "Astrine Covington",
    role: "President",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Leads corporate strategy, business development, and overall company growth.",
    longBio: [
      "Astrine Covington serves as President of Harris Capital Mortgage Group, leading corporate strategy, business development, and overall company growth.",
      "A fuller biography is on the way. To learn more about HCMG, reach our team through the contact page.",
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
      "Oversees daily operations, process improvement, and organizational efficiency.",
    longBio: [
      "Ranada Harris serves as Chief Operating Officer at Harris Capital Mortgage Group, overseeing daily operations, process improvement, and organizational efficiency.",
      "A fuller biography is on the way. To learn more, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "aysha-randall",
    name: "Aysha Randall",
    role: "CCO (Chief Compliance Officer)",
    nmls: "2341853",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Ensures regulatory compliance, risk management, and industry standards.",
    longBio: [
      "Aysha Randall serves as Chief Compliance Officer at Harris Capital Mortgage Group (NMLS# 2341853), responsible for regulatory compliance, risk management, and upholding industry standards across every state where HCMG operates.",
      "A fuller biography is on the way. To learn more, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "mesia-crews",
    name: "Mesia Crews",
    role: "Chief Growth Officer",
    nmls: null,
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Drives strategic growth, partnerships, and market expansion.",
    longBio: [
      "Mesia Crews serves as Chief Growth Officer at Harris Capital Mortgage Group, driving strategic growth, partnerships, and market expansion.",
      "A fuller biography is on the way. To learn more, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "adam-demarco",
    name: "Adam DeMarco",
    role: "Chief Production & Learning Officer",
    nmls: "2749110",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Oversees loan production and training/development programs.",
    longBio: [
      "Adam DeMarco serves as Chief Production & Learning Officer at Harris Capital Mortgage Group (NMLS# 2749110), overseeing loan production and training and development programs.",
      "A fuller biography is on the way. To learn more, reach our team through the contact page.",
    ],
    offices: ["Las Vegas, NV"],
  },
  {
    slug: "darius-james",
    name: "Darius James",
    role: "Chief Lending Officer, President of Wholesale Division",
    nmls: "1097168",
    photo: PLACEHOLDER_PHOTO,
    shortBio:
      "Leads wholesale lending strategy and oversees all wholesale division operations.",
    longBio: [
      "Darius James serves as Chief Lending Officer and President of the Wholesale Division at Harris Capital Mortgage Group (NMLS# 1097168), leading wholesale lending strategy and overseeing all wholesale division operations.",
      "A fuller biography is on the way. To learn more about HCMG, reach our team through the contact page.",
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
  // Placeholder entries removed. Operations team members are managed
  // via the admin portal — when added there they will appear in this
  // section on the public team page automatically.
];

export function getTeamMemberBySlug(slug: string): TeamMember | undefined {
  return teamMembers.find((m) => m.slug === slug);
}

export function getTeamGroupedByRole(members: TeamMember[] = teamMembers): { role: string; members: TeamMember[] }[] {
  const groups = new Map<string, TeamMember[]>();
  for (const m of members) {
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
