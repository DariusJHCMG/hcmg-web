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

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const [leads, profile] = await Promise.all([getLeads(), getCurrentProfile()]);
  return (
    <LeadsClient
      initialLeads={leads}
      adminLoSlug={profile?.lo_slug ?? null}
      adminName={profile?.full_name ?? null}
    />
  );
}
