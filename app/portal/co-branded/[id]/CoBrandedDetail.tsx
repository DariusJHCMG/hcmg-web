"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/database.types";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";

// ── Types ──────────────────────────────────────────────────────────

interface CoBrandedPage {
  id: string;
  lo_slug: string;
  realtor_slug: string;
  realtor_name: string;
  realtor_company: string;
  realtor_phone: string | null;
  realtor_email: string | null;
  realtor_license: string | null;
  realtor_photo_url: string | null;
  realtor_logo_url: string | null;
  headline: string | null;
  is_active: boolean;
  clicks: number;
  created_at: string;
}

interface Props {
  page: CoBrandedPage;
  leads: Lead[];
  loSlug: string;
  backHref: string;
}

// ── Helpers ───────────────────────────────────────────────────────

const STATUS_FILTERS: { label: string; value: LeadStatus | "" }[] = [
  { label: "All",       value: ""          },
  { label: "New",       value: "new"       },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Closed",    value: "closed"    },
  { label: "Lost",      value: "lost"      },
];

function initials(name: string) {
  const w = name.trim().split(/\s+/);
  return (w[0]?.[0] ?? "") + (w[1]?.[0] ?? "");
}

function relDate(iso: string) {
  const d = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (d < 1) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 30) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function CopyBtn({ text, label = "Copy link" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  }
  return (
    <button onClick={copy}
      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${copied ? "border-green-300 bg-green-50 text-green-700" : "border-line bg-white text-muted hover:border-accent hover:text-accent shadow-soft"}`}>
      {copied ? "✓ Copied" : label}
    </button>
  );
}

function StatCard({ value, label, color = "ok-gradient-text" }: { value: number; label: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-soft text-center">
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-muted">{label}</p>
    </div>
  );
}

function BarChart({ data, total, accent }: { data: Record<string, number>; total: number; accent: string }) {
  if (Object.keys(data).length === 0) return <p className="text-xs text-muted">No data yet.</p>;
  return (
    <div className="space-y-2.5">
      {Object.entries(data).sort(([, a], [, b]) => b - a).slice(0, 6).map(([key, count]) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={key}>
            <div className="mb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-ink capitalize">{key}</span>
              <span className="text-xs font-bold text-muted">{count} · {pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: accent }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

export function CoBrandedDetail({ page, leads, loSlug, backHref }: Props) {
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [search,       setSearch]       = useState("");

  const SITE = typeof window !== "undefined" ? window.location.origin : "https://getorangekey.com";
  const pageUrl = `${SITE}/co/${loSlug}/${page.realtor_slug}`;

  // ── Stats ──────────────────────────────────────────────────────
  const total       = leads.length;
  const newLeads    = leads.filter(l => l.status === "new").length;
  const qualified   = leads.filter(l => l.status === "qualified").length;
  const closed      = leads.filter(l => l.status === "closed").length;
  const thirtyDays  = leads.filter(l => Date.now() - new Date(l.created_at).getTime() < 30 * 86400000).length;

  const sourceMap: Record<string, number> = {};
  const creditMap: Record<string, number> = {};
  const priceMap:  Record<string, number> = {};
  for (const l of leads) {
    const src = l.utm_source ?? "direct";
    sourceMap[src] = (sourceMap[src] ?? 0) + 1;
    if (l.credit_range) creditMap[l.credit_range] = (creditMap[l.credit_range] ?? 0) + 1;
    if (l.price_range)  priceMap[l.price_range]   = (priceMap[l.price_range]   ?? 0) + 1;
  }

  // ── Filtered leads ─────────────────────────────────────────────
  const filtered = leads.filter(l => {
    if (statusFilter && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (l.first_name?.toLowerCase().includes(q) || l.last_name?.toLowerCase().includes(q) ||
              l.email?.toLowerCase().includes(q) || l.phone?.includes(q));
    }
    return true;
  });

  function exportCSV() {
    const cols: (keyof Lead)[] = ["first_name","last_name","email","phone","goal","credit_range","price_range","status","utm_source","created_at"];
    const rows = [cols.join(","), ...filtered.map(l => cols.map(c => `"${String(l[c] ?? "").replace(/"/g,'""')}"`).join(","))];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a"); a.href = url;
    a.download = `co-branded-${page.realtor_slug}-leads.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  const accent = "#7c5cd8";

  return (
    <div className="space-y-6">

      {/* ── Back nav ── */}
      <a href={backHref} className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent transition-colors">
        ← Back to Co-Branded Pages
      </a>

      {/* ── Hero card ── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="h-1 w-full" style={{ background: `linear-gradient(90deg,${accent},#F37021)` }} />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">

            {/* Left: realtor info */}
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                {page.realtor_photo_url ? (
                  <img src={page.realtor_photo_url} alt={page.realtor_name}
                    className="h-16 w-16 rounded-2xl object-cover object-top border border-line shadow-soft" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-soft"
                    style={{ background: `linear-gradient(135deg,${accent},#5b4bc4)` }}>
                    {initials(page.realtor_name).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${page.is_active ? "bg-green-50 text-green-700 border-green-200" : "bg-sand text-muted border-line"}`}>
                    {page.is_active ? "● Live" : "● Paused"}
                  </span>
                </div>
                <h1 className="text-xl font-extrabold text-ink leading-tight">{page.realtor_name}</h1>
                <p className="text-sm text-muted">{page.realtor_company}</p>
                {page.realtor_license && <p className="text-xs text-muted mt-0.5">Lic# {page.realtor_license}</p>}
                <p className="text-xs text-muted/60 mt-1">Created {relDate(page.created_at)}</p>
              </div>
            </div>

            {/* Right: actions */}
            <div className="flex flex-wrap items-center gap-2">
              <CopyBtn text={pageUrl} label="Copy link" />
              <a href={pageUrl} target="_blank" rel="noopener noreferrer"
                className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted hover:border-accent hover:text-accent shadow-soft transition-all">
                Preview ↗
              </a>
            </div>
          </div>

          {/* Page URL pill */}
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-sand px-4 py-2.5">
            <span className="flex-1 truncate font-mono text-xs text-muted">{pageUrl}</span>
            <CopyBtn text={pageUrl} label="Copy" />
          </div>

          {/* Headline preview */}
          {page.headline && (
            <div className="mt-3 rounded-xl border border-line bg-sand px-4 py-2.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted/60 mb-0.5">Custom headline</p>
              <p className="text-sm font-semibold text-ink">&ldquo;{page.headline}&rdquo;</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard value={page.clicks}  label="Page Views"    color="ok-gradient-text" />
        <StatCard value={total}        label="Total Leads"   color="ok-gradient-text" />
        <StatCard value={newLeads}     label="New / Unworked" color="text-blue-600" />
        <StatCard value={qualified}    label="Qualified"     color="text-purple-600" />
        <StatCard value={thirtyDays}   label="Last 30 Days"  color="text-green-600" />
      </div>

      {/* ── Analytics panels ── */}
      {total > 0 && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <p className="mb-4 text-sm font-extrabold text-ink">Traffic Sources</p>
            <BarChart data={sourceMap} total={total} accent={accent} />
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <p className="mb-4 text-sm font-extrabold text-ink">Credit Range</p>
            <BarChart data={creditMap} total={total} accent="#F37021" />
          </div>
          <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <p className="mb-4 text-sm font-extrabold text-ink">Price Range</p>
            <BarChart data={priceMap} total={total} accent="#22c55e" />
          </div>
        </div>
      )}

      {/* ── Leads table ── */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden shadow-soft">

        {/* Table header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-extrabold text-ink">Leads from this page</h2>
            <p className="text-xs text-muted">{total} total · {filtered.length} shown</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email…"
              className="rounded-xl border border-line bg-sand px-3 py-1.5 text-xs placeholder:text-muted/50 focus:border-accent focus:outline-none w-44"
            />
            {filtered.length > 0 && (
              <button onClick={exportCSV}
                className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted hover:border-accent/40 hover:text-accent transition-all">
                Export CSV
              </button>
            )}
          </div>
        </div>

        {/* Status filters */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-line px-5 py-2">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setStatusFilter(f.value)}
              className={`flex-shrink-0 rounded-lg px-3 py-1 text-xs font-semibold transition-all ${statusFilter === f.value ? "bg-accent text-white" : "text-muted hover:text-ink"}`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-2xl mb-2">📭</p>
            <p className="font-semibold text-ink">{total === 0 ? "No leads yet" : "No leads match your filters"}</p>
            <p className="mt-1 text-sm text-muted">
              {total === 0 ? "Share this page with the realtor — leads will appear here when buyers submit." : "Try clearing your search or filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-sand text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Contact</th>
                  <th className="px-5 py-3 text-left">Source</th>
                  <th className="px-5 py-3 text-left">Goal</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">When</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map(lead => (
                  <LeadIntelPanel key={lead.id} lead={lead} hideLoColumn patchEndpoint="portal" />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
