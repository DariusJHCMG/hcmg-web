import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { getTeamMemberBySlug } from "@/data/team";
import { DscrThankYou } from "@/components/funnel/DscrThankYou";

const ALLOWED_SLUGS = ["darius-james"];

interface LoProfile {
  slug: string;
  name: string;
  nmls: string | null;
  phone: string | null;
}

async function resolveLoProfile(slug: string): Promise<LoProfile | null> {
  if (!ALLOWED_SLUGS.includes(slug)) return null;

  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("profiles")
      .select("lo_slug, full_name, nmls, phone")
      .eq("lo_slug", slug)
      .eq("is_active", true)
      .single();

    if (data) {
      return {
        slug:  data.lo_slug,
        name:  data.full_name,
        nmls:  data.nmls ?? null,
        phone: data.phone ?? null,
      };
    }
  } catch { /* fall through */ }

  const member = getTeamMemberBySlug(slug);
  if (member) {
    return {
      slug:  member.slug,
      name:  member.name,
      nmls:  member.nmls,
      phone: member.phone ?? null,
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

  return {
    title: `Application Received | DSCR Loan · HCMG`,
    description: "Your DSCR loan eligibility request has been received. We'll be in touch within 2 hours.",
    // Prevent this confirmation page from being indexed or shared
    robots: { index: false, follow: false },
  };
}

export const dynamic = "force-dynamic";

export default async function DscrThankYouPage({ params }: Props) {
  const { lo: slug } = await params;
  const profile = await resolveLoProfile(slug);

  if (!profile) notFound();

  return (
    <DscrThankYou
      loSlug={profile.slug}
      loName={profile.name}
      loNmls={profile.nmls}
      loPhone={profile.phone}
    />
  );
}
