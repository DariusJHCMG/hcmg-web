"use client";

import { useState } from "react";
import type { Lead, LeadStatus } from "@/lib/database.types";
import { LeadIntelPanel } from "@/components/portal/LeadIntelPanel";

const STATUS_FILTERS: { label: string; value: LeadStatus | "" }[] = [
  { label: "All",       value: ""          },
  { label: "New",       value: "new"       },
  { label: "Contacted", value: "contacted" },
  { label: "Qualified", value: "qualified" },
  { label: "Closed",    value: "closed"    },
  { label: "Lost",      value: "lost"      },
];

interface Props {
  leads: Lead[];
  funnelLabel: string;
  loSlug: string;
  funnelSlug: string;
}

export function FunnelDetailClient({ leads, funnelLabel, loSlug, funnelSlug }: Props) {
  const [status, setStatus]   = useState<LeadStatus | "">("");
  const [search, setSearch]   = useState("");

  const filtered = leads.filter((l) => {
    if (status && l.status !== status) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        l.first_name?.toLowerCase().includes(q) ||
        l.last_name?.toLowerCase().includes(q)  ||
        l.email?.toLowerCase().includes(q)      ||
        l.phone?.includes(q)
      );
    }
    return true;
  });

  function exportCSV() {
    const cols: (keyof Lead)[] = ["first_name","last_name","email","phone","goal","status","utm_source","utm_medium","utm_campaign","created_at"];
    const rows = [
      cols.join(","),
      ...filtered.map((l) => cols.map((c) => `"${String(l[c] ?? "").replace(/"/g,'""')}"`).join(","))
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `${funnelSlug}-leads.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  // Build the funnel URL for the "Share link" button using window.location.origin
  const funnelUrl = typeof window !== "undefined"
    ? `${window.location.origin}/go/${loSlug}/${funnelSlug}`
    : "";

  return (
    <div className="rounded-2xl border border-line bg-white overflow-hidden shadow-soft">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
        <div>
          <h2 className="text-sm font-extrabold text-ink">
            {funnelLabel} Leads
          </h2>
          <p className="text-xs text-muted">{leads.length} total · {filtered.length} shown</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Share link copy */}
          <ShareBtn url={funnelUrl} />
          {/* Export */}
          {filtered.length > 0 && (
            <button
              onClick={exportCSV}
              className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-semibold text-muted hover:border-accent/40 hover:text-accent transition-all"
            >
              Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-sand/60 px-5 py-3 sm:px-6">
        <div className="relative flex-1 min-w-[180px]">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads…"
            className="w-full rounded-xl border border-line bg-white py-2 pl-4 pr-4 text-xs text-ink placeholder:text-muted/40
              focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatus(f.value)}
              className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-all
                ${status === f.value
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line bg-white text-muted hover:border-accent/30 hover:text-ink"
                }`}
            >
              {f.label}
              {f.value === "" && ` · ${leads.length}`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm font-semibold text-ink">
            {leads.length === 0
              ? "No leads from this funnel yet"
              : "No leads match your filters"}
          </p>
          {leads.length === 0 && (
            <p className="mt-1 text-xs text-muted max-w-xs mx-auto">
              Share your funnel link to start capturing leads directly from this funnel.
            </p>
          )}
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
              {filtered.map((lead) => (
                <LeadIntelPanel
                  key={lead.id}
                  lead={lead}
                  hideLoColumn
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Share link copy button ─────────────────────────────────────────────────────
function ShareBtn({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    if (!url) return;
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }
  return (
    <button
      onClick={copy}
      className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-all
        ${copied
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-accent/30 bg-accent/8 text-accent hover:bg-accent/15"
        }`}
    >
      {copied ? "✓ Link copied!" : "🔗 Copy funnel link"}
    </button>
  );
}
