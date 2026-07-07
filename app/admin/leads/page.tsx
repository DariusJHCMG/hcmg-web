"use client";

import { useEffect, useState, useCallback } from "react";
import { createBrowserClient } from "@/lib/supabase-browser";
import type { Lead, LeadStatus } from "@/lib/database.types";

const STATUS_COLORS: Record<string, string> = {
  new:       "bg-blue-50 text-blue-700",
  contacted: "bg-yellow-50 text-yellow-700",
  qualified: "bg-purple-50 text-purple-700",
  closed:    "bg-green-50 text-green-700",
  lost:      "bg-red-50 text-red-600",
};
const ALL_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed", "lost"];

export default function LeadsPage() {
  const [leads, setLeads]               = useState<Lead[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [expanded, setExpanded]         = useState<string | null>(null);

  const supabase = createBrowserClient();

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    let q = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (statusFilter) q = q.eq("status", statusFilter);
    if (sourceFilter) q = q.eq("source", sourceFilter);
    const { data } = await q;
    setLeads((data ?? []) as Lead[]);
    setLoading(false);
  }, [statusFilter, sourceFilter]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  async function updateStatus(id: string, status: LeadStatus) {
    await (supabase.from("leads") as any).update({ status }).eq("id", id);
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  }

  function exportCSV() {
    const cols: (keyof Lead)[] = ["first_name","last_name","email","phone","source","lo_name","status","goal","price_range","credit_range","created_at"];
    const rows = [cols.join(","), ...filtered.map((l) => cols.map((c) => `"${String(l[c] ?? "").replace(/"/g, '""')}"`).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "hcmg-leads.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = leads.filter((l) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.first_name?.toLowerCase().includes(q) ||
      l.last_name?.toLowerCase().includes(q)  ||
      l.email?.toLowerCase().includes(q)      ||
      l.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Leads</h1>
          <p className="mt-0.5 text-sm text-muted">{filtered.length} leads</p>
        </div>
        <button onClick={exportCSV} className="secondary-button !py-2 !px-4 !text-sm">
          ↓ Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Search name, email, phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "")}
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none transition"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none transition"
        >
          <option value="">All sources</option>
          {["funnel","contact","get-started","team","calculator"].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Contact</th>
                <th className="px-5 py-3 text-left">Source</th>
                <th className="px-5 py-3 text-left">LO Assigned</th>
                <th className="px-5 py-3 text-left">Goal</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Date</th>
                <th className="px-5 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-muted/60">Loading…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-muted/60">No leads found.</td></tr>
              )}
              {!loading && filtered.map((lead, i) => (
                <>
                  <tr
                    key={lead.id}
                    className={`cursor-pointer transition-colors ${i % 2 === 0 ? "bg-white" : "bg-sand/40"} hover:bg-accent/5`}
                    onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                  >
                    <td className="px-5 py-3 font-semibold text-ink">
                      {lead.first_name} {lead.last_name ?? ""}
                    </td>
                    <td className="px-5 py-3 text-muted">
                      <div>{lead.email}</div>
                      <div className="text-xs">{lead.phone}</div>
                    </td>
                    <td className="px-5 py-3 text-muted">{lead.source}</td>
                    <td className="px-5 py-3 text-muted">{lead.lo_name ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">{lead.goal ?? "—"}</td>
                    <td className="px-5 py-3">
                      <select
                        value={lead.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => updateStatus(lead.id, e.target.value as LeadStatus)}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold cursor-pointer border-none outline-none ${STATUS_COLORS[lead.status]}`}
                      >
                        {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-muted text-xs">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-muted text-xs">{expanded === lead.id ? "▲" : "▼"}</td>
                  </tr>
                  {expanded === lead.id && (
                    <tr key={`${lead.id}-detail`} className="bg-accent/5">
                      <td colSpan={8} className="px-6 py-4">
                        <div className="grid gap-4 sm:grid-cols-3 text-xs text-muted">
                          <div><span className="font-semibold text-ink">Price Range:</span> {lead.price_range ?? "—"}</div>
                          <div><span className="font-semibold text-ink">Credit Range:</span> {lead.credit_range ?? "—"}</div>
                          <div><span className="font-semibold text-ink">Income Range:</span> {lead.income_range ?? "—"}</div>
                          <div><span className="font-semibold text-ink">Loan Type:</span> {lead.recommended_loan_type ?? "—"}</div>
                          <div><span className="font-semibold text-ink">SMS Consent:</span> {lead.sms_consent ? "Yes" : "No"}</div>
                          <div><span className="font-semibold text-ink">LO NMLS:</span> {lead.lo_nmls ?? "—"}</div>
                          {lead.notes && (
                            <div className="sm:col-span-3"><span className="font-semibold text-ink">Notes:</span> {lead.notes}</div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
