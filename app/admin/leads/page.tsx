import { createServiceClient } from "@/lib/supabase";
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
  const leads = await getLeads();
  return <LeadsClient initialLeads={leads} />;
}
