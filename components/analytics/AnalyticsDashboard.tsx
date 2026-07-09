"use client";

import { useEffect, useMemo, useState } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AnalyticsData {
  /** All leads (company-wide for admin, LO-scoped for portal) */
  leads: LeadRow[];
  /** funnel_links rows (clicks) */
  funnelLinks: FunnelLinkRow[];
  /** Aggregated funnel step reach counts: { step: number, reached: number }[] */
  stepReach: StepReachRow[];
  /** Total active profiles (admin only) */
  teamSize?: number;
  /** GA4 Measurement ID (if configured) */
  ga4Id?: string | null;
  /** GSC property URL (if configured) */
  gscProperty?: string | null;
}

export interface StepReachRow {
  step: number;
  reached: number;
}

export interface LeadRow {
  id: string;
  created_at: string;
  source: string | null;
  funnel_type: string | null;
  goal: string | null;
  credit_range: string | null;
  price_range: string | null;
  device: string | null;
  lo_slug: string | null;
  lo_name: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  status: string;
}

export interface FunnelLinkRow {
  lo_slug: string;
  funnel_type: string | null;
  clicks: number;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(n: number, d: number) {
  if (!d) return "—";
  return (n / d * 100).toFixed(1) + "%";
}

function top<T>(arr: T[], key: (v: T) => string, n = 5): { label: string; count: number }[] {
  const map = new Map<string, number>();
  for (const v of arr) {
    const k = key(v) || "Unknown";
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

function sinceStart(leads: LeadRow[], days: number) {
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  return leads.filter((l) => l.created_at >= cutoff).length;
}

function byDay(leads: LeadRow[], days = 30): { date: string; count: number }[] {
  const map = new Map<string, number>();
  const cutoff = new Date(Date.now() - days * 86400000);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    map.set(d.toISOString().slice(0, 10), 0);
  }
  for (const l of leads) {
    if (new Date(l.created_at) < cutoff) continue;
    const d = l.created_at.slice(0, 10);
    if (map.has(d)) map.set(d, (map.get(d) ?? 0) + 1);
  }
  return [...map.entries()].map(([date, count]) => ({ date, count }));
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiTile({
  label, value, sub, accent = false,
}: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted/70">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${accent ? "ok-gradient-text" : "text-ink"}`}>
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted/60">{sub}</p>}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 pt-2">
      <span className="h-[4px] w-6 rounded-full" style={{ background: "linear-gradient(90deg,#FF9847,#F37021)" }} />
      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{children}</h2>
    </div>
  );
}

function BarList({ items, total }: { items: { label: string; count: number }[]; total: number }) {
  if (!items.length) return <p className="py-4 text-center text-xs text-muted/60">No data yet.</p>;
  const max = items[0].count;
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="font-semibold text-ink capitalize">{item.label}</span>
            <span className="text-muted">{item.count} · {pct(item.count, total)}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-sand">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.count / max) * 100}%`, background: "var(--ok-gradient)" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function MiniSparkline({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const w = 100 / data.length;
  const points = data
    .map((d, i) => `${i * w + w / 2},${50 - (d.count / max) * 44}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 100 50`} className="w-full h-16" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="url(#spark-grad)"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF9847" />
          <stop offset="100%" stopColor="#F37021" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── GA4 response types ────────────────────────────────────────────────────────

interface GA4Data {
  ok: true;
  period: string;
  overview: {
    sessions: number;
    totalUsers: number;
    pageviews: number;
    engagementRate: number;
    bounceRate: number;
    avgSessionDuration: number;
    newUsers: number;
    returningUsers: number;
  };
  channels: { channel: string; sessions: number; users: number }[];
  topPages:  { page: string; sessions: number; users: number; bounceRate: number }[];
  devices:   { device: string; sessions: number; users: number }[];
}

interface GSCData {
  ok: true;
  period: string;
  overview: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  topQueries: { query: string; clicks: number; impressions: number; ctr: number; position: number }[];
  topPages:   { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
}

// ── Shared sub-components for live panels ─────────────────────────────────────

function LiveKpi({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted/70">{label}</p>
      <p className="mt-2 text-2xl font-extrabold text-ink">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted/60">{sub}</p>}
    </div>
  );
}

function LiveTable<T extends Record<string, string | number>>({
  rows,
  cols,
  maxRows = 10,
}: {
  rows: T[];
  cols: { key: keyof T; label: string; align?: "right" }[];
  maxRows?: number;
}) {
  if (!rows.length)
    return <p className="py-4 text-center text-xs text-muted/50">No data yet.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-line">
            {cols.map((c) => (
              <th
                key={String(c.key)}
                className={`pb-2 font-bold uppercase tracking-[0.1em] text-muted/60 ${c.align === "right" ? "text-right" : "text-left"}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, maxRows).map((r, i) => (
            <tr key={i} className={i % 2 === 0 ? "" : "bg-sand/30"}>
              {cols.map((c) => (
                <td
                  key={String(c.key)}
                  className={`py-2 font-medium text-ink ${c.align === "right" ? "text-right tabular-nums" : ""}`}
                >
                  {String(r[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SetupCard({ scope, service }: { scope: "admin" | "portal"; service: "ga4" | "gsc" }) {
  const settingsHref = scope === "admin" ? "/admin/settings" : null;
  const label = service === "ga4" ? "Google Analytics (GA4)" : "Google Search Console";
  return (
    <div className="rounded-2xl border border-dashed border-line bg-sand/50 px-8 py-12 text-center">
      <p className="text-base font-extrabold text-ink">{label} not configured</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
        {scope === "admin"
          ? `Add your ${service === "ga4" ? "GA4 Property ID" : "GSC Property URL"} and a Google Service Account key in Settings to see live data here.`
          : `Live ${label} data is configured by your admin.`}
      </p>
      {settingsHref && (
        <a href={settingsHref} className="mt-5 inline-block rounded-xl border border-accent px-5 py-2.5 text-sm font-bold text-accent hover:bg-accent/5">
          Go to Settings →
        </a>
      )}
    </div>
  );
}

function LoadingPanel() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-accent" />
      <span className="ml-3 text-sm text-muted">Loading live data…</span>
    </div>
  );
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-8 text-center">
      <p className="font-bold text-red-800">Failed to load data</p>
      <p className="mt-1 text-sm text-red-700">{message}</p>
      <button onClick={onRetry} className="mt-4 rounded-xl border border-red-300 px-4 py-2 text-sm font-bold text-red-800 hover:bg-red-100">
        Retry
      </button>
    </div>
  );
}

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ── Date range filter ─────────────────────────────────────────────────────────

const RANGES = [
  { label: "7d",   days: 7   },
  { label: "30d",  days: 30  },
  { label: "90d",  days: 90  },
  { label: "All",  days: 9999 },
];

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyticsDashboard({ data, scope, scopeLabel }: { data: AnalyticsData; scope: "admin" | "portal"; scopeLabel?: string }) {
  const [rangeDays, setRangeDays] = useState(30);
  const [activeTab, setActiveTab] = useState<"lead-gen" | "funnel" | "traffic" | "seo">("lead-gen");

  // ── Live GA4 state ──────────────────────────────────────────────────────────
  const [ga4State, setGa4State] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ok"; d: GA4Data }
    | { status: "error"; message: string }
    | { status: "unconfigured" }
  >({ status: "idle" });

  // ── Live GSC state ──────────────────────────────────────────────────────────
  const [gscState, setGscState] = useState<
    | { status: "idle" }
    | { status: "loading" }
    | { status: "ok"; d: GSCData }
    | { status: "error"; message: string }
    | { status: "unconfigured" }
  >({ status: "idle" });

  async function fetchGa4() {
    setGa4State({ status: "loading" });
    try {
      const res = await fetch("/api/analytics/ga4");
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (res.status === 503) { setGa4State({ status: "unconfigured" }); return; }
        setGa4State({ status: "error", message: json.error ?? "Unknown error" });
      } else {
        setGa4State({ status: "ok", d: json as GA4Data });
      }
    } catch (e) {
      setGa4State({ status: "error", message: String(e) });
    }
  }

  async function fetchGsc() {
    setGscState({ status: "loading" });
    try {
      const res = await fetch("/api/analytics/gsc");
      const json = await res.json();
      if (!res.ok || !json.ok) {
        if (res.status === 503) { setGscState({ status: "unconfigured" }); return; }
        setGscState({ status: "error", message: json.error ?? "Unknown error" });
      } else {
        setGscState({ status: "ok", d: json as GSCData });
      }
    } catch (e) {
      setGscState({ status: "error", message: String(e) });
    }
  }

  // Auto-fetch when tab becomes active
  useEffect(() => {
    if (activeTab === "traffic" && ga4State.status === "idle") fetchGa4();
    if (activeTab === "seo"     && gscState.status === "idle") fetchGsc();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const allLeads = data.leads;

  const leads = useMemo(() => {
    if (rangeDays >= 9999) return allLeads;
    const cutoff = new Date(Date.now() - rangeDays * 86400000).toISOString();
    return allLeads.filter((l) => l.created_at >= cutoff);
  }, [allLeads, rangeDays]);

  // ── Core KPIs ──────────────────────────────────────────────────────────────
  const totalLeads     = leads.length;
  const newLeads       = leads.filter((l) => l.status === "new").length;
  const qualifiedLeads = leads.filter((l) => l.status === "qualified").length;
  const closedLeads    = leads.filter((l) => l.status === "closed").length;
  const leads7d        = sinceStart(allLeads, 7);
  const leads30d       = sinceStart(allLeads, 30);

  // ── Funnel KPIs ────────────────────────────────────────────────────────────
  const totalClicks = data.funnelLinks.reduce((s, f) => s + f.clicks, 0);
  const convRate    = pct(totalLeads, totalClicks);

  // ── Source breakdowns ──────────────────────────────────────────────────────
  const byUtmSource    = top(leads, (l) => l.utm_source ?? l.source ?? "direct");
  const byUtmMedium    = top(leads, (l) => l.utm_medium ?? "unknown");
  const byUtmCampaign  = top(leads, (l) => l.utm_campaign ?? "none", 8);
  const byFunnel       = top(leads.filter((l) => l.funnel_type), (l) => l.funnel_type!);
  const byGoal         = top(leads.filter((l) => l.goal), (l) => l.goal!);
  const byDevice       = top(leads, (l) => l.device ?? "unknown");
  const byCredit       = top(leads.filter((l) => l.credit_range), (l) => l.credit_range!);
  const byLo           = top(leads.filter((l) => l.lo_name), (l) => l.lo_name!, 10);

  // ── Top funnels by clicks ──────────────────────────────────────────────────
  const topFunnelsByClicks = [...data.funnelLinks]
    .filter((f) => f.funnel_type)
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 8)
    .map((f) => ({ label: f.funnel_type!, count: f.clicks }));

  // ── Sparkline ─────────────────────────────────────────────────────────────
  const sparkData = byDay(allLeads, Math.min(rangeDays, 30));

  const TABS = [
    { key: "lead-gen" as const, label: "Lead Generation" },
    { key: "funnel"   as const, label: "Funnel" },
    { key: "traffic"  as const, label: "Traffic" },
    { key: "seo"      as const, label: "SEO" },
  ];

  return (
    <div className="space-y-6">

      {/* Header + date range */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ok-gradient-text text-[11px] font-bold uppercase tracking-[0.2em]">
            {scopeLabel ?? (scope === "admin" ? "Company-Wide Analytics" : "My Analytics")}
          </p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-ink">Analytics</h1>
          {scope === "admin" && !scopeLabel && data.teamSize !== undefined && (
            <p className="mt-1 text-xs text-muted">{data.teamSize} active team members · {allLeads.length.toLocaleString()} total leads all time</p>
          )}
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-line bg-white p-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setRangeDays(r.days)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                rangeDays === r.days
                  ? "text-white shadow-sm"
                  : "text-muted hover:text-ink"
              }`}
              style={rangeDays === r.days ? { background: "var(--ok-gradient)" } : {}}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero KPI row */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <KpiTile label="Total Leads" value={totalLeads.toLocaleString()} sub={`in selected period`} accent />
        <KpiTile label="Last 7 Days" value={leads7d} sub="rolling 7 days" accent />
        <KpiTile label="Last 30 Days" value={leads30d} sub="rolling 30 days" accent />
        <KpiTile label="Funnel → Lead" value={convRate} sub={`${totalClicks} total funnel clicks`} accent />
      </div>

      {/* Lead trend sparkline */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-extrabold text-ink">Lead Volume</p>
          <p className="text-xs text-muted">Last {Math.min(rangeDays, 30)} days · {totalLeads} total</p>
        </div>
        <MiniSparkline data={sparkData} />
        <div className="mt-2 flex justify-between text-[10px] text-muted/50">
          <span>{sparkData[0]?.date}</span>
          <span>{sparkData[sparkData.length - 1]?.date}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-shrink-0 px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
              activeTab === t.key
                ? "border-accent text-accent"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LEAD GEN TAB ──────────────────────────────────────────────────── */}
      {activeTab === "lead-gen" && (
        <div className="space-y-6">

          {/* Status KPIs */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiTile label="New / Unworked" value={newLeads} sub={pct(newLeads, totalLeads) + " of leads"} />
            <KpiTile label="Qualified" value={qualifiedLeads} sub={pct(qualifiedLeads, totalLeads) + " of leads"} />
            <KpiTile label="Closed" value={closedLeads} sub={pct(closedLeads, totalLeads) + " of leads"} />
            <KpiTile label="Close Rate" value={pct(closedLeads, totalLeads)} sub="closed ÷ total" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Lead source */}
            <div className="rounded-2xl border border-line bg-white p-5">
              <SectionHeader>Lead Source (utm_source)</SectionHeader>
              <div className="mt-4">
                <BarList items={byUtmSource} total={totalLeads} />
              </div>
            </div>

            {/* Medium */}
            <div className="rounded-2xl border border-line bg-white p-5">
              <SectionHeader>Medium (utm_medium)</SectionHeader>
              <div className="mt-4">
                <BarList items={byUtmMedium} total={totalLeads} />
              </div>
            </div>

            {/* Campaign */}
            <div className="rounded-2xl border border-line bg-white p-5">
              <SectionHeader>Top Campaigns (utm_campaign)</SectionHeader>
              <div className="mt-4">
                <BarList items={byUtmCampaign} total={totalLeads} />
              </div>
            </div>

            {/* Goal */}
            <div className="rounded-2xl border border-line bg-white p-5">
              <SectionHeader>Lead Goal</SectionHeader>
              <div className="mt-4">
                <BarList items={byGoal} total={totalLeads} />
              </div>
            </div>

            {/* Device */}
            <div className="rounded-2xl border border-line bg-white p-5">
              <SectionHeader>Device</SectionHeader>
              <div className="mt-4">
                <BarList items={byDevice} total={totalLeads} />
              </div>
            </div>

            {/* Credit range */}
            <div className="rounded-2xl border border-line bg-white p-5">
              <SectionHeader>Credit Range</SectionHeader>
              <div className="mt-4">
                <BarList items={byCredit} total={totalLeads} />
              </div>
            </div>

            {/* LO breakdown — admin only */}
            {scope === "admin" && byLo.length > 0 && (
              <div className="rounded-2xl border border-line bg-white p-5 lg:col-span-2">
                <SectionHeader>Leads by Loan Officer</SectionHeader>
                <div className="mt-4">
                  <BarList items={byLo} total={totalLeads} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── FUNNEL TAB ────────────────────────────────────────────────────── */}
      {activeTab === "funnel" && (
        <div className="space-y-6">

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiTile label="Total Funnel Clicks" value={totalClicks.toLocaleString()} sub="all /go links" accent />
            <KpiTile label="Leads from Funnels" value={leads.filter((l) => l.source === "funnel" || l.funnel_type).length} sub="funnel-sourced" />
            <KpiTile label="Click→Lead Rate" value={convRate} sub="clicks ÷ leads" />
            <KpiTile label="Distinct Funnels Used" value={new Set(leads.filter((l) => l.funnel_type).map((l) => l.funnel_type)).size} sub="funnel types" />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Top funnels by leads */}
            <div className="rounded-2xl border border-line bg-white p-5">
              <SectionHeader>Leads by Funnel Type</SectionHeader>
              <div className="mt-4">
                <BarList items={byFunnel} total={totalLeads} />
              </div>
            </div>

            {/* Top funnels by clicks */}
            <div className="rounded-2xl border border-line bg-white p-5">
              <SectionHeader>Funnel Clicks (all time)</SectionHeader>
              <div className="mt-4">
                {topFunnelsByClicks.length > 0
                  ? <BarList items={topFunnelsByClicks} total={topFunnelsByClicks.reduce((s, f) => s + f.count, 0)} />
                  : <p className="py-4 text-center text-xs text-muted/60">No click data yet.</p>}
              </div>
            </div>

            {/* Question-level drop-off — real data from lead_events */}
            <div className="rounded-2xl border border-line bg-white p-5 lg:col-span-2">
              <SectionHeader>Question-Level Drop-Off</SectionHeader>
              {data.stepReach.length === 0 ? (
                <p className="mt-4 text-center text-xs text-muted/60 py-4">
                  No funnel step events yet. Drop-off data populates as visitors complete funnel steps.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {(() => {
                    const maxReached = data.stepReach[0]?.reached ?? 1;
                    return data.stepReach.map((row, i) => {
                      const prev = i === 0 ? maxReached : data.stepReach[i - 1].reached;
                      const dropPct = prev > 0 ? ((prev - row.reached) / prev * 100).toFixed(1) : "0";
                      return (
                        <div key={row.step}>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-semibold text-ink">Step {row.step}</span>
                            <span className="text-muted">
                              {row.reached.toLocaleString()} reached
                              {i > 0 && <span className="ml-2 text-red-500">−{dropPct}% drop</span>}
                            </span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-sand">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${(row.reached / maxReached) * 100}%`,
                                background: i === 0 ? "var(--ok-gradient)" : `hsl(${24 - i * 4}, 90%, ${50 + i * 4}%)`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    });
                  })()}
                  <p className="pt-2 text-[11px] text-muted/50">
                    Based on <code className="bg-sand px-1 py-0.5 rounded">funnel_step</code> events from all sessions. Each bar = unique sessions that reached that step.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── TRAFFIC TAB — live GA4 Data API ───────────────────────────────── */}
      {activeTab === "traffic" && (
        <div className="space-y-5">
          {/* Header bar */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Google Analytics · Last 30 days</p>
              {ga4State.status === "ok" && (
                <p className="mt-0.5 text-xs text-muted/60">{ga4State.d.period}</p>
              )}
            </div>
            <button
              onClick={fetchGa4}
              disabled={ga4State.status === "loading"}
              className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted hover:text-ink disabled:opacity-40"
            >
              {ga4State.status === "loading" ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          {ga4State.status === "idle"         && <LoadingPanel />}
          {ga4State.status === "loading"      && <LoadingPanel />}
          {ga4State.status === "unconfigured" && <SetupCard scope={scope} service="ga4" />}
          {ga4State.status === "error"        && <ErrorPanel message={ga4State.message} onRetry={fetchGa4} />}

          {ga4State.status === "ok" && (() => {
            const d = ga4State.d;
            const totalSessions = d.overview.sessions || 1;
            return (
              <div className="space-y-5">
                {/* KPI row */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <LiveKpi label="Sessions"        value={d.overview.sessions.toLocaleString()}  sub="last 30 days" />
                  <LiveKpi label="Total Users"     value={d.overview.totalUsers.toLocaleString()} sub={`${d.overview.newUsers.toLocaleString()} new`} />
                  <LiveKpi label="Pageviews"       value={d.overview.pageviews.toLocaleString()} sub={`${(d.overview.pageviews / (d.overview.sessions || 1)).toFixed(1)} per session`} />
                  <LiveKpi label="Engagement Rate" value={`${d.overview.engagementRate}%`}       sub={`${d.overview.bounceRate}% bounce`} />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {/* New vs Returning */}
                  <div className="rounded-2xl border border-line bg-white p-5">
                    <SectionHeader>New vs. Returning Users</SectionHeader>
                    <div className="mt-4 space-y-3">
                      {[
                        { label: "New Users",       count: d.overview.newUsers },
                        { label: "Returning Users", count: d.overview.returningUsers },
                      ].map((row) => (
                        <div key={row.label}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="font-semibold text-ink">{row.label}</span>
                            <span className="text-muted">{row.count.toLocaleString()} · {pct(row.count, d.overview.totalUsers)}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-sand">
                            <div className="h-full rounded-full" style={{ width: `${(row.count / (d.overview.totalUsers || 1)) * 100}%`, background: "var(--ok-gradient)" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 border-t border-line pt-3 text-xs text-muted">
                      Avg. session: <strong className="text-ink">{fmtDuration(d.overview.avgSessionDuration)}</strong>
                    </div>
                  </div>

                  {/* Traffic channels */}
                  <div className="rounded-2xl border border-line bg-white p-5">
                    <SectionHeader>Traffic Channels</SectionHeader>
                    <div className="mt-4 space-y-3">
                      {d.channels.map((ch) => (
                        <div key={ch.channel}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="font-semibold text-ink capitalize">{ch.channel}</span>
                            <span className="text-muted">{ch.sessions.toLocaleString()} · {pct(ch.sessions, totalSessions)}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-sand">
                            <div className="h-full rounded-full" style={{ width: `${(ch.sessions / totalSessions) * 100}%`, background: "var(--ok-gradient)" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Device split */}
                  <div className="rounded-2xl border border-line bg-white p-5">
                    <SectionHeader>Device Type</SectionHeader>
                    <div className="mt-4 space-y-3">
                      {d.devices.map((dv) => (
                        <div key={dv.device}>
                          <div className="mb-1 flex justify-between text-xs">
                            <span className="font-semibold text-ink capitalize">{dv.device}</span>
                            <span className="text-muted">{dv.sessions.toLocaleString()} · {pct(dv.sessions, totalSessions)}</span>
                          </div>
                          <div className="h-2 w-full overflow-hidden rounded-full bg-sand">
                            <div className="h-full rounded-full" style={{ width: `${(dv.sessions / totalSessions) * 100}%`, background: "var(--ok-gradient)" }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top landing pages */}
                  <div className="rounded-2xl border border-line bg-white p-5">
                    <SectionHeader>Top Landing Pages</SectionHeader>
                    <div className="mt-4">
                      <LiveTable
                        rows={d.topPages}
                        cols={[
                          { key: "page",       label: "Page" },
                          { key: "sessions",   label: "Sessions",   align: "right" },
                          { key: "bounceRate", label: "Bounce %",   align: "right" },
                        ]}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ── SEO TAB — live GSC Search Analytics API ───────────────────────── */}
      {activeTab === "seo" && (
        <div className="space-y-5">
          {/* Header bar */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Google Search Console · Last 28 days</p>
              {gscState.status === "ok" && (
                <p className="mt-0.5 text-xs text-muted/60">{gscState.d.period}</p>
              )}
            </div>
            <button
              onClick={fetchGsc}
              disabled={gscState.status === "loading"}
              className="rounded-xl border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted hover:text-ink disabled:opacity-40"
            >
              {gscState.status === "loading" ? "Loading…" : "↻ Refresh"}
            </button>
          </div>

          {gscState.status === "idle"         && <LoadingPanel />}
          {gscState.status === "loading"      && <LoadingPanel />}
          {gscState.status === "unconfigured" && <SetupCard scope={scope} service="gsc" />}
          {gscState.status === "error"        && <ErrorPanel message={gscState.message} onRetry={fetchGsc} />}

          {gscState.status === "ok" && (() => {
            const d = gscState.d;
            return (
              <div className="space-y-5">
                {/* KPI row */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <LiveKpi label="Total Clicks"      value={d.overview.clicks.toLocaleString()}      sub="organic visits from Google" />
                  <LiveKpi label="Impressions"       value={d.overview.impressions.toLocaleString()} sub="times appeared in search" />
                  <LiveKpi label="Avg. CTR"          value={`${d.overview.ctr}%`}                    sub="clicks ÷ impressions" />
                  <LiveKpi label="Avg. Position"     value={d.overview.position}                     sub="lower = higher ranking" />
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  {/* Top search queries */}
                  <div className="rounded-2xl border border-line bg-white p-5 lg:col-span-2">
                    <SectionHeader>Top Search Queries</SectionHeader>
                    <div className="mt-4">
                      <LiveTable
                        rows={d.topQueries}
                        cols={[
                          { key: "query",       label: "Query" },
                          { key: "clicks",      label: "Clicks",       align: "right" },
                          { key: "impressions", label: "Impressions",   align: "right" },
                          { key: "ctr",         label: "CTR %",        align: "right" },
                          { key: "position",    label: "Avg. Position", align: "right" },
                        ]}
                        maxRows={25}
                      />
                    </div>
                  </div>

                  {/* Top landing pages */}
                  <div className="rounded-2xl border border-line bg-white p-5 lg:col-span-2">
                    <SectionHeader>Top Organic Landing Pages</SectionHeader>
                    <div className="mt-4">
                      <LiveTable
                        rows={d.topPages}
                        cols={[
                          { key: "page",        label: "Page" },
                          { key: "clicks",      label: "Clicks",       align: "right" },
                          { key: "impressions", label: "Impressions",   align: "right" },
                          { key: "ctr",         label: "CTR %",        align: "right" },
                          { key: "position",    label: "Avg. Position", align: "right" },
                        ]}
                        maxRows={25}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

    </div>
  );
}
