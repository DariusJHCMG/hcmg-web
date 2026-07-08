"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/database.types";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";

const ALL_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed", "lost"];

const SOURCE_LABELS: Record<string, string> = {
  "funnel":      "LO Funnel",
  "contact":     "Contact Page",
  "get-started": "Get Started",
  "team":        "Team Page",
  "calculator":  "Calculator",
  "join":        "Join Page",
  "employment":  "Recruiting / Employment",
};

function sourceLabel(s: string | null): string {
  return SOURCE_LABELS[s ?? ""] ?? s ?? "Unknown";
}

const EMPLOYMENT_SOURCES = new Set(["employment"]);
const COMPANY_SOURCES    = new Set(["contact", "get-started", "team", "calculator", "join"]);

export function LeadsClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads]               = useState<Lead[]>(initialLeads);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [loFilter, setLoFilter]         = useState<"all" | "company" | "employment" | "lo">("all");

  function exportCSV() {
    const cols: (keyof Lead)[] = ["first_name","last_name","email","phone","source","lo_name","status","goal","price_range","credit_range","utm_source","utm_medium","utm_campaign","created_at"];
    const rows = [cols.join(","), ...allFiltered.map((l) => cols.map((c) => `"${String(l[c] ?? "").replace(/"/g, '""')}"`).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url; a.download = "hcmg-leads.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  function applySearch(list: Lead[]): Lead[] {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter((l) =>
      l.first_name?.toLowerCase().includes(q) ||
      l.last_name?.toLowerCase().includes(q)  ||
      l.email?.toLowerCase().includes(q)      ||
      l.phone?.toLowerCase().includes(q)
    );
  }

  function applyStatus(list: Lead[]): Lead[] {
    return statusFilter ? list.filter((l) => l.status === statusFilter) : list;
  }

  const allFiltered = applySearch(applyStatus(leads));

  // Split into employment, company (mortgage), and LO-assigned
  const employmentLeads = allFiltered.filter((l) => !l.lo_slug && EMPLOYMENT_SOURCES.has(l.source ?? ""));
  const companyLeads    = allFiltered.filter((l) => !l.lo_slug && !EMPLOYMENT_SOURCES.has(l.source ?? ""));
  const loLeads         = allFiltered.filter((l) => !!l.lo_slug);

  const newCompanyCount    = leads.filter((l) => !l.lo_slug && !EMPLOYMENT_SOURCES.has(l.source ?? "") && l.status === "new").length;
  const newEmploymentCount = leads.filter((l) => !l.lo_slug && EMPLOYMENT_SOURCES.has(l.source ?? "") && l.status === "new").length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Leads</h1>
          <p className="mt-0.5 text-sm text-muted">
            {leads.length} total · {companyLeads.length} company · {employmentLeads.length} employment · {loLeads.length} LO-assigned
              {newCompanyCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  ⚠ {newCompanyCount} company
                </span>
              )}
              {newEmploymentCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  ⚠ {newEmploymentCount} employment
                </span>
              )}
          </p>
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
        {/* View filter toggle */}
        <div className="flex rounded-xl border border-line bg-white overflow-hidden text-sm font-semibold">
          {(["all", "company", "employment", "lo"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setLoFilter(v as typeof loFilter)}
              className={`px-3 py-2.5 transition-colors ${loFilter === v ? "bg-accent text-white" : "text-muted hover:bg-sand"}`}
            >
              {v === "all" ? "All" : v === "company" ? "Company" : v === "employment" ? "Employment" : "LO-assigned"}
              {v === "company" && newCompanyCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-amber-400 text-[10px] font-black text-white px-1">
                  {newCompanyCount}
                </span>
              )}
              {v === "employment" && newEmploymentCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-blue-500 text-[10px] font-black text-white px-1">
                  {newEmploymentCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Employment leads section */}
      {(loFilter === "all" || loFilter === "employment") && employmentLeads.length > 0 && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-blue-200 bg-blue-100/60 px-5 py-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-800">
                Employment Leads — Recruiting Inquiries · {employmentLeads.filter(l => l.status === "new").length} new
              </p>
              <p className="mt-0.5 text-[11px] text-blue-700">
                Submitted through /join or /careers. Route to recruiting team.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-blue-200 text-xs font-semibold uppercase tracking-[0.1em] text-blue-800/70">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Contact</th>
                  <th className="px-5 py-3 text-left">Source</th>
                  <th className="px-5 py-3 text-left">Notes / Details</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {employmentLeads.map((lead) => (
                  <LeadIntelPanel key={lead.id} lead={lead} sourceLabel="Recruiting / Employment" hideLoColumn />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Company leads callout — only when viewing all or company */}
      {(loFilter === "all" || loFilter === "company") && companyLeads.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-200 bg-amber-100/60 px-5 py-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">
                ⚠ Company Leads — No LO Assigned · {companyLeads.filter(l => l.status === "new").length} new
              </p>
              <p className="mt-0.5 text-[11px] text-amber-700">
                These came in through company pages (/get-started, /contact, /team). Assign to an LO or action directly.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-amber-200 text-xs font-semibold uppercase tracking-[0.1em] text-amber-800/70">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Contact</th>
                  <th className="px-5 py-3 text-left">Funnel / Source</th>
                  <th className="px-5 py-3 text-left">Goal</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {companyLeads.map((lead) => (
                  <LeadIntelPanel key={lead.id} lead={lead} sourceLabel={sourceLabel(lead.source)} hideLoColumn />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* LO leads table */}
      {(loFilter === "all" || loFilter === "lo") && (
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <div className="border-b border-line bg-sand/60 px-5 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted/70">
              LO-Assigned Leads · {loFilter === "lo" ? loLeads.length : loLeads.length}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.1em] text-muted/60">
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
                {loLeads.length === 0 && (
                  <tr><td colSpan={8} className="px-6 py-10 text-center text-sm text-muted/60">No LO-assigned leads.</td></tr>
                )}
                {loLeads.map((lead) => (
                  <LeadIntelPanel key={lead.id} lead={lead} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty states */}
      {loFilter === "employment" && employmentLeads.length === 0 && (
        <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center text-sm text-muted/60">
          No employment / recruiting leads found.
        </div>
      )}
      {loFilter === "company" && companyLeads.length === 0 && (
        <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center text-sm text-muted/60">
          No company leads found.
        </div>
      )}
    </div>
  );
}
