import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import Link from "next/link";

async function getKPIs() {
  const sb = createServiceClient();
  const now = new Date();
  const todayStart  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart   = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const monthStart  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const [
    { count: totalLeads },
    { count: leadsToday },
    { count: leadsWeek },
    { count: leadsMonth },
    { count: newLeads },
    { count: teamSize },
    { data: recentLeads },
  ] = await Promise.all([
    sb.from("leads").select("*", { count: "exact", head: true }),
    sb.from("leads").select("*", { count: "exact", head: true }).gte("created_at", todayStart),
    sb.from("leads").select("*", { count: "exact", head: true }).gte("created_at", weekStart),
    sb.from("leads").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
    sb.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    sb.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    sb.from("leads").select("id,first_name,last_name,email,phone,source,lo_name,status,created_at").order("created_at", { ascending: false }).limit(8),
  ]);

  return { totalLeads, leadsToday, leadsWeek, leadsMonth, newLeads, teamSize, recentLeads };
}

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-blue-50 text-blue-700",
  contacted: "bg-yellow-50 text-yellow-700",
  qualified: "bg-purple-50 text-purple-700",
  closed:    "bg-green-50 text-green-700",
  lost:      "bg-red-50 text-red-600",
};

export default async function AdminDashboard() {
  const [profile, kpis] = await Promise.all([getCurrentProfile(), getKPIs()]);

  const stats = [
    { label: "Leads Today",   value: kpis.leadsToday  ?? 0, sub: "last 24 h",      color: "ok-gradient-text" },
    { label: "This Week",     value: kpis.leadsWeek   ?? 0, sub: "rolling 7 days", color: "ok-gradient-text" },
    { label: "This Month",    value: kpis.leadsMonth  ?? 0, sub: "calendar month",  color: "ok-gradient-text" },
    { label: "Total Leads",   value: kpis.totalLeads  ?? 0, sub: "all time",        color: "ok-gradient-text" },
    { label: "Unworked",      value: kpis.newLeads    ?? 0, sub: "status = new",    color: "ok-gradient-text" },
    { label: "Active Team",   value: kpis.teamSize    ?? 0, sub: "users",           color: "ok-gradient-text" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Welcome back, {profile?.full_name}.</p>
      </div>

      {/* KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted/70">{s.label}</p>
            <p className={`mt-2 text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-xs text-muted/60">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "All Leads",     href: "/admin/leads",   icon: "✉" },
          { label: "Manage Team",   href: "/admin/team",    icon: "👥" },
          { label: "Funnel Links",  href: "/admin/funnels", icon: "⟶" },
          { label: "User Accounts", href: "/admin/users",   icon: "🔑" },
        ].map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="flex items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold text-ink transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-card"
          >
            <span className="text-xl">{a.icon}</span> {a.label}
          </Link>
        ))}
      </div>

      {/* Recent leads */}
      <div className="rounded-2xl border border-line bg-white">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <h2 className="font-bold text-ink">Recent Leads</h2>
          <Link href="/admin/leads" className="text-xs font-semibold text-accent hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Email</th>
                <th className="px-5 py-3 text-left">Phone</th>
                <th className="px-5 py-3 text-left">Source</th>
                <th className="px-5 py-3 text-left">Assigned LO</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {(kpis.recentLeads ?? []).map((lead: any, i: number) => (
                <tr key={lead.id} className={i % 2 === 0 ? "bg-white" : "bg-sand/40"}>
                  <td className="px-5 py-3 font-semibold text-ink">
                    {lead.first_name} {lead.last_name ?? ""}
                  </td>
                  <td className="px-5 py-3 text-muted">{lead.email}</td>
                  <td className="px-5 py-3 text-muted">{lead.phone}</td>
                  <td className="px-5 py-3 text-muted">{lead.source}</td>
                  <td className="px-5 py-3 text-muted">{lead.lo_name ?? "—"}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS_COLORS[lead.status] ?? ""}`}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(!kpis.recentLeads || kpis.recentLeads.length === 0) && (
            <p className="px-6 py-8 text-center text-sm text-muted/60">No leads yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
