import { createServiceClient } from "@/lib/supabase";
import type { AuditLog } from "@/lib/database.types";
import { AuditClient } from "./AuditClient";

async function getAuditLogs(): Promise<AuditLog[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("audit_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  return (data ?? []) as AuditLog[];
}

export const dynamic = "force-dynamic";

export default async function AuditPage() {
  const logs = await getAuditLogs();
  return <AuditClient initialLogs={logs} />;
}
