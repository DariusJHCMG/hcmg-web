"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/database.types";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";

const ALL_STATUSES: LeadStatus[] = ["new", "contacted", "qualified", "closed", "lost"];

const SOURCE_LABELS: Record<string, string> = {
  "funnel":        "LO Funnel",
  "get-started":   "Get Started",
  "team":          "Team Page",
  "seo":           "SEO / Local Page",
  "calculator":    "Calculator",
  "contact":       "Contact Form",
  "join":          "Join Page",
  "employment":    "Recruiting / Employment",
  "dscr-landing":  "DSCR Landing Page",
};

// ── Parse DSCR notes field into structured data ───────────────────────────────
function parseDscrNotes(notes: string | null): Record<string, string> {
  if (!notes) return {};
  return Object.fromEntries(
    notes.split(" | ").flatMap((part) => {
      const idx = part.indexOf(": ");
      if (idx === -1) return [];
      return [[part.slice(0, idx).trim(), part.slice(idx + 2).trim()]];
    })
  );
}

function DscrBadge({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] font-semibold text-ink">
      <span className="text-muted/60 font-normal">{label}:</span> {value}
    </span>
  );
}

function sourceLabel(s: string | null): string {
  return SOURCE_LABELS[s ?? ""] ?? s ?? "Unknown";
}

const EMPLOYMENT_SOURCES = new Set(["employment"]);
const CONTACT_SOURCES    = new Set(["contact"]);
const DSCR_SOURCES       = new Set(["dscr-landing"]);
const COMPANY_SOURCES    = new Set(["get-started", "team", "seo", "calculator", "funnel"]);

export function LeadsClient({
  initialLeads,
  adminLoSlug,
  adminName,
  allLOs,
}: {
  initialLeads: Lead[];
  adminLoSlug: string | null;
  adminName: string | null;
  allLOs: { slug: string; name: string }[];
}) {
  const [leads]                         = useState<Lead[]>(initialLeads);
  // "my-leads" = admin's own LO pipeline; "company" = full company view
  const [view, setView]                 = useState<"my-leads" | "company">("my-leads");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [loFilter, setLoFilter]         = useState<"all" | "company" | "contact" | "employment" | "lo" | "dscr">("all");
  // LO spotlight: filter company view to a specific LO slug
  const [loSpotlight, setLoSpotlight]   = useState<string>("");

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

  // My Leads: admin's own LO pipeline
  const myLeads = allFiltered.filter((l) => adminLoSlug && l.lo_slug === adminLoSlug);

  // Company view: apply loSpotlight if set
  const companyFiltered = loSpotlight
    ? allFiltered.filter((l) => l.lo_slug === loSpotlight)
    : allFiltered;

  // Split by source type (company view)
  const dscrLeads       = companyFiltered.filter((l) => DSCR_SOURCES.has(l.source ?? ""));
  const employmentLeads = companyFiltered.filter((l) => !l.lo_slug && EMPLOYMENT_SOURCES.has(l.source ?? ""));
  const contactLeads    = companyFiltered.filter((l) => !l.lo_slug && CONTACT_SOURCES.has(l.source ?? ""));
  const companyLeads    = companyFiltered.filter((l) => !l.lo_slug && !EMPLOYMENT_SOURCES.has(l.source ?? "") && !CONTACT_SOURCES.has(l.source ?? "") && !DSCR_SOURCES.has(l.source ?? ""));
  const loLeads         = companyFiltered.filter((l) => !!l.lo_slug && !DSCR_SOURCES.has(l.source ?? ""));

  const newDscrCount       = leads.filter((l) => DSCR_SOURCES.has(l.source ?? "") && l.status === "new").length;
  const newCompanyCount    = leads.filter((l) => !l.lo_slug && COMPANY_SOURCES.has(l.source ?? "") && l.status === "new").length;
  const newContactCount    = leads.filter((l) => !l.lo_slug && CONTACT_SOURCES.has(l.source ?? "") && l.status === "new").length;
  const newEmploymentCount = leads.filter((l) => !l.lo_slug && EMPLOYMENT_SOURCES.has(l.source ?? "") && l.status === "new").length;
  const myNewCount         = leads.filter((l) => adminLoSlug && l.lo_slug === adminLoSlug && l.status === "new").length;

  return (
    <div className="space-y-5">
      {/* ── Header + View Switcher ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Leads</h1>
          <p className="mt-0.5 text-sm text-muted">
            {leads.length} total · {dscrLeads.length} DSCR · {companyLeads.length} funnel · {contactLeads.length} contact · {employmentLeads.length} recruiting · {loLeads.length} LO
              {newDscrCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full border border-brand/30 bg-brand/5 px-2 py-0.5 text-[11px] font-bold text-brand">
                  ⚡ {newDscrCount} DSCR
                </span>
              )}
              {newCompanyCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                  ⚠ {newCompanyCount} funnel
                </span>
              )}
              {newContactCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-700">
                  ⚠ {newContactCount} contact
                </span>
              )}
              {newEmploymentCount > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                  ⚠ {newEmploymentCount} recruiting
                </span>
              )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="secondary-button !py-2 !px-4 !text-sm">
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* ── View Switcher ── */}
      {adminLoSlug && (
        <div className="flex items-center gap-2 rounded-2xl border border-line bg-white p-1.5 w-fit">
          <button
            onClick={() => setView("my-leads")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              view === "my-leads" ? "bg-accent text-white shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            My Leads
            {myNewCount > 0 && (
              <span className={`inline-flex items-center justify-center h-5 min-w-5 rounded-full text-[10px] font-black px-1 ${view === "my-leads" ? "bg-white text-accent" : "bg-accent text-white"}`}>
                {myNewCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setView("company")}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
              view === "company" ? "bg-ink text-white shadow-sm" : "text-muted hover:text-ink"
            }`}
          >
            Company View
            {(newCompanyCount + newContactCount + newEmploymentCount) > 0 && (
              <span className={`inline-flex items-center justify-center h-5 min-w-5 rounded-full text-[10px] font-black px-1 ${view === "company" ? "bg-white text-ink" : "bg-muted/20 text-ink"}`}>
                {newCompanyCount + newContactCount + newEmploymentCount}
              </span>
            )}
          </button>
        </div>
      )}

      {/* ── MY LEADS VIEW ── */}
      {view === "my-leads" && adminLoSlug && (
        <div className="space-y-4">
          {/* Search + Status filters */}
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
          </div>
          <div className="rounded-2xl border border-line bg-white overflow-hidden">
            <div className="border-b border-line bg-sand/60 px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ink">My Leads{adminName ? ` — ${adminName}` : ""}</p>
                <p className="text-xs text-muted">{myLeads.length} total · click any row to expand</p>
              </div>
              {myNewCount > 0 && (
                <span className="inline-flex items-center rounded-full bg-accent/10 border border-accent/20 px-3 py-1 text-xs font-bold text-accent">
                  {myNewCount} new
                </span>
              )}
            </div>
            {myLeads.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-muted/60">
                {search || statusFilter ? "No leads match your filters." : "No leads assigned to you yet."}
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
                      <th className="px-5 py-3 text-left">Date</th>
                      <th className="px-5 py-3 text-left"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {myLeads.map((lead) => (
                      <LeadIntelPanel key={lead.id} lead={lead} hideLoColumn />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── COMPANY VIEW ── */}
      {(view === "company" || !adminLoSlug) && (
      <div className="space-y-5">

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
        {/* LO spotlight filter */}
        {allLOs.length > 0 && (
          <select
            value={loSpotlight}
            onChange={(e) => setLoSpotlight(e.target.value)}
            className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-accent focus:outline-none transition"
          >
            <option value="">All LOs</option>
            {allLOs.map(({ slug, name }) => (
              <option key={slug} value={slug}>{name}</option>
            ))}
          </select>
        )}
        {/* Section filter toggle */}
        <div className="flex rounded-xl border border-line bg-white overflow-hidden text-sm font-semibold">
          {(["all", "dscr", "company", "contact", "employment", "lo"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setLoFilter(v)}
              className={`px-3 py-2.5 transition-colors ${
                loFilter === v
                  ? v === "dscr" ? "bg-brand text-white" : "bg-accent text-white"
                  : "text-muted hover:bg-sand"
              }`}
            >
              {v === "all"        ? "All"
                : v === "dscr"       ? "DSCR"
                : v === "company"    ? "Funnel"
                : v === "contact"    ? "Contact"
                : v === "employment" ? "Recruiting"
                : "LO-assigned"}
              {v === "dscr" && newDscrCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-white text-[10px] font-black text-brand px-1">
                  {newDscrCount}
                </span>
              )}
              {v === "company" && newCompanyCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-amber-400 text-[10px] font-black text-white px-1">
                  {newCompanyCount}
                </span>
              )}
              {v === "contact" && newContactCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-4 rounded-full bg-orange-500 text-[10px] font-black text-white px-1">
                  {newContactCount}
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

      {/* ── DSCR Leads section — navy/brand ── */}
      {(loFilter === "all" || loFilter === "dscr") && (
        <div className="rounded-2xl border border-brand/20 bg-brand/5 overflow-hidden">
          <div className="flex items-center justify-between border-b border-brand/20 bg-brand px-5 py-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">
                ⚡ DSCR Leads — Darius James · {newDscrCount} new
              </p>
              <p className="mt-0.5 text-[11px] text-white/60">
                Submitted via hcmgloans.com/dscr/darius-james · 640+ credit qualified
              </p>
            </div>
            <span className="text-xs font-bold text-white/80">{dscrLeads.length} total</span>
          </div>

          {dscrLeads.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted/60">
              No DSCR leads yet. Once your Google Ads campaign sends traffic, leads will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand/20 text-xs font-semibold uppercase tracking-[0.1em] text-brand/70 bg-brand/10">
                    <th className="px-5 py-3 text-left">Lead</th>
                    <th className="px-5 py-3 text-left">Contact</th>
                    <th className="px-5 py-3 text-left">Property Details</th>
                    <th className="px-5 py-3 text-left">Credit / Loan</th>
                    <th className="px-5 py-3 text-left">Google Ads Attribution</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {dscrLeads.map((lead) => {
                    const dscr = parseDscrNotes(lead.notes);
                    return (
                      <LeadIntelPanel
                        key={lead.id}
                        lead={lead}
                        sourceLabel="DSCR Landing Page"
                        dscrData={dscr}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contact leads section — orange */}
      {(loFilter === "all" || loFilter === "contact") && contactLeads.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-orange-200 bg-orange-100/60 px-5 py-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">
                Contact Form Leads · {contactLeads.filter(l => l.status === "new").length} new
              </p>
              <p className="mt-0.5 text-[11px] text-orange-700">
                Submitted via /contact. General inquiries — no mortgage data collected.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-orange-200 text-xs font-semibold uppercase tracking-[0.1em] text-orange-800/70">
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Contact</th>
                    <th className="px-5 py-3 text-left">Source</th>
                    <th className="px-5 py-3 text-left">Message</th>
                    <th className="px-5 py-3 text-left">State</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Date</th>
                    <th className="px-5 py-3 text-left"></th>
                  </tr>
              </thead>
              <tbody>
                {contactLeads.map((lead) => (
                  <LeadIntelPanel key={lead.id} lead={lead} sourceLabel="Contact Form" hideLoColumn />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Employment leads section — blue */}
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
                  <th className="px-5 py-3 text-left">State</th>
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
                  <th className="px-5 py-3 text-left">State</th>
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
                  <th className="px-5 py-3 text-left">State</th>
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

      {loFilter === "contact" && contactLeads.length === 0 && (
        <div className="rounded-2xl border border-line bg-white px-6 py-10 text-center text-sm text-muted/60">
          No contact form leads found.
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
      )}

    </div>
  );
}
