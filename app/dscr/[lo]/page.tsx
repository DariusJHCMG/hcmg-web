import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { getTeamMemberBySlug } from "@/data/team";
import { DscrLandingPage } from "@/components/funnel/DscrLandingPage";

// Only Darius James is authorized for this landing page
const ALLOWED_SLUGS = ["darius-james"];

interface LoProfile {
  slug: string;
  name: string;
  nmls: string | null;
  role: string;
  phone: string | null;
  avatar: string | null;
}

async function resolveLoProfile(slug: string): Promise<LoProfile | null> {
  // Enforce allow-list, this page is only for approved LOs
  if (!ALLOWED_SLUGS.includes(slug)) return null;

  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("profiles")
      .select("lo_slug, full_name, nmls, title, role, phone, avatar_url")
      .eq("lo_slug", slug)
      .eq("is_active", true)
      .single();

    if (data) {
      return {
        slug: data.lo_slug,
        name: data.full_name,
        nmls: data.nmls ?? null,
        role: data.title ?? data.role?.replace("_", " ") ?? "Loan Officer",
        phone: data.phone ?? null,
        avatar: data.avatar_url ?? null,
      };
    }
  } catch { /* fall through to static data */ }

  // Fall back to static team data
  const member = getTeamMemberBySlug(slug);
  if (member) {
    return {
      slug: member.slug,
      name: member.name,
      nmls: member.nmls,
      role: member.role,
      phone: member.phone ?? null,
      avatar: member.photo !== "/team/placeholder.svg" ? member.photo : null,
    };
  }

  return null;
}

interface Props {
  params: Promise<{ lo: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lo: slug } = await params;
  const profile = await resolveLoProfile(slug);

  if (!profile) return {};

  const title = `DSCR Investment Property Loans | ${profile.name} · HCMG`;
  const description =
    "Qualify for a DSCR loan based on rental income, not your personal income or tax returns. No W-2s required. Same-day approvals. 100+ lenders. Close in 7-21 days.";

  return {
    title,
    description,
    alternates: { canonical: `https://hcmgloans.com/dscr/${slug}` },
    openGraph: {
      title,
      description,
      url: `https://hcmgloans.com/dscr/${slug}`,
    },
    robots: { index: true, follow: true },
  };
}

export const dynamic = "force-dynamic";

export default async function DscrLoPage({ params }: Props) {
  const { lo: slug } = await params;
  const profile = await resolveLoProfile(slug);

  if (!profile) notFound();

  return (
    <DscrLandingPage
      lo={{
        slug: profile.slug,
        name: profile.name,
        nmls: profile.nmls,
        role: profile.role,
        phone: profile.phone,
        avatar: profile.avatar,
      }}
    />
  );
}
