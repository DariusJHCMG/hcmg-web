import { createServiceClient } from "@/lib/supabase";
import type { Lead } from "@/lib/database.types";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";

export const dynamic = "force-dynamic";

export default async function AgentLeadsPage() {
  const sb = createServiceClient();

  // All co-branded buyer leads
  const { data: leadsData } = await sb
    .from("leads")
    .select("*")
    .in("source", ["co-brand", "co-branded"])
    .order("created_at", { ascending: false });
  const leads = (leadsData ?? []) as Lead[];

  // All co-branded pages (to get realtor names & match page IDs)
  const { data: pagesData } = await sb
    .from("co_branded_pages")
    .select("id, realtor_name, realtor_company, realtor_slug")
    .order("realtor_name");
  const pages = pagesData ?? [];

  // Build page-id → page map
  const pageMap = new Map(pages.map((p) => [p.id, p]));

  // Group leads by co_branded_page_id (leads with no page ID go into a fallback group)
  const groups = new Map<string | null, Lead[]>();
  for (const lead of leads) {
    const key = lead.co_branded_page_id ?? null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(lead);
  }

  const totalNew = leads.filter((l) => l.status === "new").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Agent Partners</h1>
        <p className="mt-1 text-sm text-muted">
          {leads.length} co-branded buyer {leads.length === 1 ? "lead" : "leads"} · {totalNew} new · Submitted through co-branded pages.
        </p>
      </div>

      {leads.length === 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-12 text-center text-sm text-muted">
          No co-branded buyer leads yet. Share a co-branded page to start capturing leads.
        </div>
      )}

      {/* One section per realtor page, sorted by most recent lead */}
      {Array.from(groups.entries()).map(([pageId, groupLeads]) => {
        const page = pageId ? pageMap.get(pageId) : null;
        const realtorName  = page?.realtor_name  ?? "Unknown Realtor";
        const realtorCo    = page?.realtor_company ?? "";
        const groupNew     = groupLeads.filter((l) => l.status === "new").length;

        return (
          <div key={pageId ?? "unmatched"} className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
            {/* Section header */}
            <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-100/60 px-5 py-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
                  {realtorName}{realtorCo ? ` · ${realtorCo}` : ""}
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700">
                {groupLeads.length} {groupLeads.length === 1 ? "lead" : "leads"}{groupNew > 0 ? ` · ${groupNew} new` : ""}
              </span>
            </div>

            {/* Leads table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-emerald-200 text-xs font-semibold uppercase tracking-[0.1em] text-emerald-800/70">
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Contact</th>
                    <th className="px-5 py-3 text-left">Source</th>
                    <th className="px-5 py-3 text-left">LO</th>
                    <th className="px-5 py-3 text-left">Goal</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {groupLeads.map((lead) => (
                    <LeadIntelPanel
                      key={lead.id}
                      lead={lead}
                      sourceLabel={`via ${realtorName}`}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
