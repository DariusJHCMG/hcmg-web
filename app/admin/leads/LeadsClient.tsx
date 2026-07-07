"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/database.types";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";

const POSTHOG_PROJECT_ID = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;

const ALL_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed", "lost"];

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads]               = useState<Lead[]>(initialLeads);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [sourceFilter, setSourceFilter] = useState("");

  async function updateStatus(id: string, status: LeadStatus) {
    await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, status } : l));
  }

  function exportCSV() {
    const cols: (keyof Lead)[] = ["first_name","last_name","email","phone","source","lo_name","status","goal","price_range","credit_range","utm_source","utm_medium","utm_campaign","created_at"];
    const rows = [cols.join(","), ...filtered.map((l) => cols.map((c) => `"${String(l[c] ?? "").replace(/"/g, '""')}"`).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "hcmg-leads.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const filtered = leads.filter((l) => {
    const matchesStatus = !statusFilter || l.status === statusFilter;
    const matchesSource = !sourceFilter || l.source === sourceFilter;
    if (!matchesStatus || !matchesSource) return false;
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
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-muted/60">No leads found.</td></tr>
              )}
              {filtered.map((lead) => (
                <LeadIntelPanel
                  key={lead.id}
                  lead={lead}
                  posthogProjectId={POSTHOG_PROJECT_ID}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
