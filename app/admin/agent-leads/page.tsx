import { createServiceClient } from "@/lib/supabase";
import type { Lead } from "@/lib/database.types";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";

export const dynamic = "force-dynamic";
const LABELS: Record<string, string> = { "agent-partnership": "Partnership Inquiry", "agent-meeting": "Meeting Request", "agent-portal-access": "Portal Access Request", "agent-cobrand-page": "Co-Branded Page Request" };

export default async function AgentLeadsPage() {
  const sb = createServiceClient();
  const { data } = await sb.from("leads").select("*").eq("source", "real-estate-agent").order("created_at", { ascending: false });
  const leads = (data ?? []) as Lead[];
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-extrabold text-ink">Agent Partners</h1><p className="mt-1 text-sm text-muted">{leads.length} inquiries · {leads.filter(l => l.status === "new").length} new · Captured from /agents.</p></div>
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
        <div className="border-b border-emerald-200 bg-emerald-100/60 px-5 py-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">Real Estate Agent Funnel Leads</p></div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-emerald-200 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-800/70"><th className="px-5 py-3 text-left">Name</th><th className="px-5 py-3 text-left">Contact</th><th className="px-5 py-3 text-left">Funnel</th><th className="px-5 py-3 text-left">Details</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3" /></tr></thead>
          <tbody>{leads.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-muted">No agent partner leads yet.</td></tr>}{leads.map(lead => <LeadIntelPanel key={lead.id} lead={lead} sourceLabel={LABELS[lead.funnel_type ?? ""] ?? "Agent Inquiry"} hideLoColumn />)}</tbody>
        </table></div>
      </div>
    </div>
  );
}
