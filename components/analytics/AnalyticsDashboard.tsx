"use client";

import { useMemo, useState } from "react";

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

function PlaceholderTile({ label, icon, description }: { label: string; icon: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-sand/50 p-5">
      <div className="mb-1 flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted/60">{label}</p>
      </div>
      <p className="mt-1 text-xs text-muted/50 leading-5">{description}</p>
      <p className="mt-2 text-[10px] font-bold text-accent/60">Connect Google Search Console →</p>
    </div>
  );
}

// ── Date range filter ─────────────────────────────────────────────────────────

const RANGES = [
  { label: "7d",   days: 7   },
  { label: "30d",  days: 30  },
  { label: "90d",  days: 90  },
  { label: "All",  days: 9999 },
];

// ── Main component ────────────────────────────────────────────────────────────

export function AnalyticsDashboard({ data, scope }: { data: AnalyticsData; scope: "admin" | "portal" }) {
  const [rangeDays, setRangeDays] = useState(30);
  const [activeTab, setActiveTab] = useState<"lead-gen" | "funnel" | "traffic" | "seo">("lead-gen");

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
            {scope === "admin" ? "Company-Wide Analytics" : "My Analytics"}
          </p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-ink">Analytics</h1>
          {scope === "admin" && data.teamSize !== undefined && (
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
      <div className="flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
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

      {/* ── TRAFFIC TAB ───────────────────────────────────────────────────── */}
      {activeTab === "traffic" && (
        <div className="space-y-4">
          {data.ga4Id ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-start gap-3">
              <span className="text-xl mt-0.5">✓</span>
              <div>
                <p className="text-sm font-extrabold text-green-800">GA4 Connected — {data.ga4Id}</p>
                <p className="mt-1 text-xs text-green-700 leading-5">
                  Google Analytics is collecting data. View your full traffic dashboard at{" "}
                  <a href="https://analytics.google.com" target="_blank" rel="noopener noreferrer"
                    className="font-bold underline">analytics.google.com</a>.
                  These tiles will show embedded data once the GA4 Data API integration is added.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <p className="text-sm font-extrabold text-amber-900">GA4 not configured</p>
              <p className="mt-1 text-xs text-amber-800 leading-5">
                Add your GA4 Measurement ID in Settings to start collecting traffic data.
                Once added, GA4 will track all pageviews automatically.
              </p>
              <a href="/admin/settings" className="mt-2 inline-block text-xs font-bold text-amber-900 underline">
                Go to Settings →
              </a>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Unique Visitors",       icon: "👤", description: "Individual website visitors in period" },
              { label: "Total Sessions",         icon: "🌐", description: "Total number of website visits" },
              { label: "Organic Visitors",       icon: "🔍", description: "Visitors from unpaid search results" },
              { label: "Paid Visitors",          icon: "💰", description: "Visitors from paid advertising" },
              { label: "New vs Returning",       icon: "🔄", description: "Acquisition vs repeat engagement" },
              { label: "Visitors by State/City", icon: "📍", description: "Geographic traffic breakdown" },
              { label: "Traffic Source",         icon: "📊", description: "Google, Meta, direct, referral split" },
              { label: "Engagement Rate",        icon: "⚡", description: "Meaningful interactions with site" },
              { label: "Exit Pages",             icon: "🚪", description: "Where visitors leave the site" },
            ].map((t) => (
              <PlaceholderTile key={t.label} {...t} />
            ))}
          </div>
        </div>
      )}

      {/* ── SEO TAB ───────────────────────────────────────────────────────── */}
      {activeTab === "seo" && (
        <div className="space-y-4">
          {data.gscProperty ? (
            <div className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-start gap-3">
              <span className="text-xl mt-0.5">✓</span>
              <div>
                <p className="text-sm font-extrabold text-green-800">Search Console Connected — {data.gscProperty}</p>
                <p className="mt-1 text-xs text-green-700 leading-5">
                  View your SEO data at{" "}
                  <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer"
                    className="font-bold underline">search.google.com/search-console</a>.
                  Embedded metrics will populate once the GSC API integration is added.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4">
              <p className="text-sm font-extrabold text-amber-900">Search Console not configured</p>
              <p className="mt-1 text-xs text-amber-800 leading-5">
                Add your GSC property URL in Settings to link your Search Console account.
              </p>
              <a href="/admin/settings" className="mt-2 inline-block text-xs font-bold text-amber-900 underline">
                Go to Settings →
              </a>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Google Impressions",        icon: "👁",  description: "How many times the site appeared in search" },
              { label: "Organic Clicks",             icon: "🖱",  description: "Clicks generated from search results" },
              { label: "Avg. Keyword Position",      icon: "📈",  description: "Average ranking position across all keywords" },
              { label: "Organic CTR",                icon: "🎯",  description: "Impressions → clicks rate" },
              { label: "Indexed Landing Pages",      icon: "📄",  description: "State, city, and loan-program pages in Google" },
              { label: "Top Search Queries",         icon: "🔑",  description: "Keywords producing visibility and traffic" },
              { label: "Top Organic Landing Pages",  icon: "🏆",  description: "SEO pages generating the most traffic" },
            ].map((t) => (
              <PlaceholderTile key={t.label} {...t} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
