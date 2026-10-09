import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";
import type { Lead } from "@/lib/database.types";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  new:       "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed:    "Closed",
  lost:      "Lost",
};

const STATUS_COLORS: Record<string, string> = {
  new:       "border-blue-200 bg-blue-50 text-blue-700",
  contacted: "border-amber-200 bg-amber-50 text-amber-700",
  qualified: "border-purple-200 bg-purple-50 text-purple-700",
  closed:    "border-green-200 bg-green-50 text-green-700",
  lost:      "border-red-200 bg-red-50 text-red-600",
};

export default async function PortalLeadsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  if (!profile.lo_slug) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold text-ink">My Leads</h1>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center text-sm text-amber-800">
          Your account doesn&apos;t have a loan officer slug set. Contact an admin to configure this.
        </div>
      </div>
    );
  }

  const sb = createServiceClient();
  const { data } = await sb
    .from("leads")
    .select("*")
    .eq("lo_slug", profile.lo_slug)
    .order("created_at", { ascending: false });
  const leads = (data ?? []) as Lead[];

  // Co-branded map for source labels
  const { data: pagesData } = await sb
    .from("co_branded_pages")
    .select("id, realtor_name")
    .eq("lo_slug", profile.lo_slug);
  const coBrandedMap = new Map((pagesData ?? []).map((p) => [p.id, `via ${p.realtor_name}`]));

  const counts = {
    total:     leads.length,
    new:       leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    qualified: leads.filter((l) => l.status === "qualified").length,
    closed:    leads.filter((l) => l.status === "closed").length,
    lost:      leads.filter((l) => l.status === "lost").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-ink">My Leads</h1>
        <p className="mt-0.5 text-sm text-muted">
          {counts.total} total · {counts.new} new · {counts.qualified} qualified · {counts.closed} closed
        </p>
      </div>

      {/* Stat chips */}
      <div className="flex flex-wrap gap-2">
        {(["new","contacted","qualified","closed","lost"] as const).map((s) => (
          counts[s] > 0 && (
            <span key={s} className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold capitalize ${STATUS_COLORS[s]}`}>
              {STATUS_LABELS[s]} · {counts[s]}
            </span>
          )
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        {leads.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-muted/60">
            No leads yet. Share your funnel link to start getting leads.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Contact</th>
                  <th className="px-5 py-3 text-left">Source</th>
                  <th className="px-5 py-3 text-left">Goal</th>
                  <th className="px-5 py-3 text-left">State</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">When</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <LeadIntelPanel
                    key={lead.id}
                    lead={lead}
                    patchEndpoint="portal"
                    sourceLabel={lead.co_branded_page_id ? coBrandedMap.get(lead.co_branded_page_id) : undefined}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
