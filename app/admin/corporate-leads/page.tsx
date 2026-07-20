import { createServiceClient } from "@/lib/supabase";
import type { Lead } from "@/lib/database.types";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";

export const dynamic = "force-dynamic";

export default async function CorporateLeadsPage() {
  const sb = createServiceClient();
  const { data } = await sb.from("leads").select("*").eq("source", "corporate-benefits").order("created_at", { ascending: false });
  const leads = (data ?? []) as Lead[];
  return (
    <div className="space-y-5">
      <div><h1 className="text-2xl font-extrabold text-ink">Corporate Home Benefits</h1><p className="mt-1 text-sm text-muted">{leads.length} employer inquiries · {leads.filter(l => l.status === "new").length} new · Captured from /company-partners.</p></div>
      <div className="overflow-hidden rounded-2xl border border-violet-200 bg-violet-50">
        <div className="border-b border-violet-200 bg-violet-100/60 px-5 py-3"><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-800">Corporate Home Benefits Program Leads</p><p className="mt-1 text-[11px] text-violet-700">HR, benefits, and employer partnership inquiries.</p></div>
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="border-b border-violet-200 text-xs font-semibold uppercase tracking-[0.1em] text-violet-800/70"><th className="px-5 py-3 text-left">Name</th><th className="px-5 py-3 text-left">Contact</th><th className="px-5 py-3 text-left">Source</th><th className="px-5 py-3 text-left">Company details</th><th className="px-5 py-3 text-left">Status</th><th className="px-5 py-3 text-left">Date</th><th className="px-5 py-3" /></tr></thead>
          <tbody>{leads.length === 0 && <tr><td colSpan={7} className="px-6 py-12 text-center text-muted">No Corporate Home Benefits inquiries yet.</td></tr>}{leads.map(lead => <LeadIntelPanel key={lead.id} lead={lead} sourceLabel={lead.funnel_type === "corporate-benefits-meeting" ? "Meeting Request" : "Program Consultation"} hideLoColumn />)}</tbody>
        </table></div>
      </div>
    </div>
  );
}
