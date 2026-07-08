import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import type { Lead, CoBrandedPage } from "@/lib/database.types";
import { CoBrandedDetail } from "./CoBrandedDetail";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

async function getCoBrandedPage(id: string, loSlug: string): Promise<CoBrandedPage | null> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("co_branded_pages")
    .select("*")
    .eq("id", id)
    .eq("lo_slug", loSlug)
    .maybeSingle();
  return data ?? null;
}

async function getCoBrandedLeads(cbPage: CoBrandedPage): Promise<Lead[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("leads")
    .select("*")
    .eq("lo_slug", cbPage.lo_slug)
    .or(
      `entry_page.ilike.%/co/${cbPage.lo_slug}/${cbPage.realtor_slug}%,` +
      `utm_campaign.ilike.%co-brand-${cbPage.realtor_slug}%`
    )
    .order("created_at", { ascending: false });
  return (data ?? []) as Lead[];
}

export default async function PortalCoBrandedDetailPage({ params }: Props) {
  const { id } = await params;

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.lo_slug) redirect("/portal/co-branded");

  const cbPage = await getCoBrandedPage(id, profile.lo_slug);
  if (!cbPage) notFound();

  const leads = await getCoBrandedLeads(cbPage);

  return (
    <CoBrandedDetail
      page={cbPage}
      leads={leads}
      loSlug={profile.lo_slug}
      backHref="/portal/co-branded"
    />
  );
}
