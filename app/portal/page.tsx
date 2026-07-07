import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { CopyButton } from "@/components/ui/CopyButton";
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

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-blue-50 text-blue-700",
  contacted: "bg-yellow-50 text-yellow-700",
  qualified: "bg-purple-50 text-purple-700",
  closed:    "bg-green-50 text-green-700",
  lost:      "bg-red-50 text-red-600",
};

export default async function PortalPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");

  const leads  = profile.lo_slug ? await getMyLeads(profile.lo_slug) : [];
  const myLink = profile.lo_slug ? `https://getorangekey.com/go/${profile.lo_slug}` : null;

  const statsCards = [
    { label: "Total Leads",   value: leads.length },
    { label: "New / Unworked",value: leads.filter((l) => l.status === "new").length },
    { label: "Qualified",     value: leads.filter((l) => l.status === "qualified").length },
    { label: "Closed",        value: leads.filter((l) => l.status === "closed").length },
  ];

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
        <div className="border-b border-line px-6 py-4">
          <h2 className="font-bold text-ink">My Leads</h2>
          <p className="text-xs text-muted">{leads.length} total</p>
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
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Phone</th>
                  <th className="px-5 py-3 text-left">Goal</th>
                  <th className="px-5 py-3 text-left">Price Range</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={lead.id} className={i % 2 === 0 ? "bg-white" : "bg-sand/40"}>
                    <td className="px-5 py-3 font-semibold text-ink">
                      {lead.first_name} {lead.last_name ?? ""}
                    </td>
                    <td className="px-5 py-3 text-muted">{lead.email}</td>
                    <td className="px-5 py-3 text-muted">{lead.phone}</td>
                    <td className="px-5 py-3 text-muted">{lead.goal ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">{lead.price_range ?? "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_COLORS[lead.status]}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted text-xs">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
