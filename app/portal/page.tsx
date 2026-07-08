import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { CopyButton } from "@/components/ui/CopyButton";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";
import type { Lead } from "@/lib/database.types";

async function getMyLeads(loSlug: string): Promise<Lead[]> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("leads")
    .select("*")
    .eq("lo_slug", loSlug)
    .order("created_at", { ascending: false });
  return (data ?? []) as Lead[];
}

export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const leads  = profile.lo_slug ? await getMyLeads(profile.lo_slug) : [];
  const SITE   = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");
  const myLink = profile.lo_slug ? `${SITE}/go/${profile.lo_slug}` : null;

  const statsCards = [
    { label: "Total Leads",    value: leads.length },
    { label: "New / Unworked", value: leads.filter((l) => l.status === "new").length },
    { label: "Qualified",      value: leads.filter((l) => l.status === "qualified").length },
    { label: "Closed",         value: leads.filter((l) => l.status === "closed").length },
  ];

  // Source breakdown for the mini chart
  const sourceBreakdown = leads.reduce<Record<string, number>>((acc, l) => {
    const src = l.utm_source ?? l.source ?? "direct";
    acc[src] = (acc[src] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">Harris Capital Mortgage Group</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">Hi, {profile.full_name.split(" ")[0]} 👋</h1>
        {profile.nmls && <p className="mt-0.5 text-sm text-muted">NMLS# {profile.nmls}</p>}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        {statsCards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted/70">{s.label}</p>
            <p className="mt-2 text-3xl font-extrabold ok-gradient-text">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Source breakdown */}
      {Object.keys(sourceBreakdown).length > 0 && (
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Lead Sources</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(sourceBreakdown)
              .sort(([, a], [, b]) => b - a)
              .map(([src, count]) => (
                <span
                  key={src}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-sand px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: "var(--ok-gradient)" }} />
                  {src}
                  <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-bold text-ink shadow-sm">
                    {count}
                  </span>
                </span>
              ))}
          </div>
        </div>
      )}

      {/* My funnel link */}
      {myLink && (
        <div className="rounded-2xl border border-line bg-white p-6">
          <p className="mb-1 font-bold text-ink">Your Personal Funnel Link</p>
          <p className="mb-4 text-sm text-muted">
            Share this link anywhere. Leads that come through it are automatically assigned to you
            and you&apos;ll get an instant email notification.
          </p>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-sand px-4 py-3">
            <code className="flex-1 text-sm font-semibold text-accent break-all">{myLink}</code>
            <CopyButton text={myLink} />
          </div>
          <p className="mt-3 text-xs text-muted/60">
            Tip: add <code>?utm_source=instagram</code> to track where your leads come from.
          </p>
        </div>
      )}

      {/* Leads table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-ink">My Leads</h2>
            <p className="text-xs text-muted">{leads.length} total · click any row to see full intelligence</p>
          </div>
        </div>
        {leads.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-muted/60">
            No leads yet. Share your funnel link to start getting leads!
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Contact</th>
                  <th className="px-5 py-3 text-left">Source</th>
                  <th className="px-5 py-3 text-left">LO</th>
                  <th className="px-5 py-3 text-left">Goal</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">When</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                   <LeadIntelPanel key={lead.id} lead={lead} patchEndpoint="portal" />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
