import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import type { Lead } from "@/lib/database.types";
import { LeadsClient } from "./LeadsClient";

async function getLeads(): Promise<Lead[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Lead[];
}

async function getAllLOs(): Promise<{ slug: string; name: string }[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("profiles")
    .select("lo_slug, full_name")
    .not("lo_slug", "is", null)
    .eq("is_active", true)
    .order("full_name", { ascending: true });
  return (data ?? [])
    .filter((p) => p.lo_slug && p.full_name)
    .map((p) => ({ slug: p.lo_slug as string, name: p.full_name as string }));
}

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const [leads, profile, allLOs] = await Promise.all([
    getLeads(),
    getCurrentProfile(),
    getAllLOs(),
  ]);
  return (
    <LeadsClient
      initialLeads={leads}
      adminLoSlug={profile?.lo_slug ?? null}
      adminName={profile?.full_name ?? null}
      allLOs={allLOs}
    />
  );
}
