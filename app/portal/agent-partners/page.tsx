import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";
import type { Lead } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function PortalAgentPartnersPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (!profile.lo_slug) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-ink">Agent Partners</h1>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center text-sm text-amber-800">
          Your account doesn&apos;t have a loan officer slug set. Contact an admin to configure this.
        </div>
      </div>
    );
  }

  const sb = createServiceClient();

  // Only co-branded leads assigned to this LO
  const { data: leadsData } = await sb
    .from("leads")
    .select("*")
    .eq("lo_slug", profile.lo_slug)
    .in("source", ["co-brand", "co-branded"])
    .order("created_at", { ascending: false });
  const leads = (leadsData ?? []) as Lead[];

  // Only co-branded pages belonging to this LO
  const { data: pagesData } = await sb
    .from("co_branded_pages")
    .select("id, realtor_name, realtor_company, realtor_slug")
    .eq("lo_slug", profile.lo_slug)
    .order("realtor_name");
  const pages = pagesData ?? [];
  const pageMap = new Map(pages.map((p) => [p.id, p]));

  // Group leads by co_branded_page_id
  const groups = new Map<string | null, Lead[]>();
  for (const lead of leads) {
    const key = lead.co_branded_page_id ?? null;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(lead);
  }

  const totalNew = leads.filter((l) => l.status === "new").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Agent Partners</h1>
        <p className="mt-1 text-sm text-muted">
          {leads.length} co-branded buyer {leads.length === 1 ? "lead" : "leads"} · {totalNew} new · From your co-branded realtor pages.
        </p>
      </div>

      {leads.length === 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-12 text-center text-sm text-muted">
          No co-branded buyer leads yet.{" "}
          {pages.length === 0
            ? "Set up a co-branded page with a realtor partner to start capturing leads."
            : "Share your co-branded page links with your realtor partners to start capturing leads."}
        </div>
      )}

      {/* One section per realtor page */}
      {Array.from(groups.entries()).map(([pageId, groupLeads]) => {
        const page = pageId ? pageMap.get(pageId) : null;
        const realtorName = page?.realtor_name  ?? "Unknown Realtor";
        const realtorCo   = page?.realtor_company ?? "";
        const groupNew    = groupLeads.filter((l) => l.status === "new").length;

        return (
          <div key={pageId ?? "unmatched"} className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
            {/* Section header */}
            <div className="flex items-center justify-between border-b border-emerald-200 bg-emerald-100/60 px-5 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
                {realtorName}{realtorCo ? ` · ${realtorCo}` : ""}
              </p>
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
                      patchEndpoint="portal"
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
