"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  isSlaBreached,
  computeResponseMinutes,
  computeActualHandleMinutes,
  formatMinutes,
} from "@/lib/liftoff-sla";
import { PipelineTabBar } from "@/components/liftoff/PipelineTabBar";
import type { LiftOffRequest, LiftOffRequestType } from "@/lib/database.types";

// ── Types ──────────────────────────────────────────────────────────────────────

type DatePreset = "all" | "today" | "7d" | "30d" | "custom";
type ScopeMode  = "mine" | "everyone";
type SortKey    = "created_at" | "sla_deadline_at" | "response_mins" | "handle_mins";
type SortDir    = "asc" | "desc";

interface FilterState {
  scope:      ScopeMode;
  drillOwner: string;
  types:      LiftOffRequestType[];
  datePreset: DatePreset;
  dateFrom:   string;
  dateTo:     string;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const REQUEST_TYPE_LABELS: Record<LiftOffRequestType, string> = {
  lock_request:         "Lock Request",
  register_disclosure:  "Register & Disclose",
  disclosure_only:      "Disclosure Only",
  restructure_suspense: "Restructure / Suspense",
  submission:           "Submission",
};

const ALL_TYPES: LiftOffRequestType[] = [
  "lock_request", "register_disclosure", "disclosure_only", "restructure_suspense", "submission",
];

const STATUS_CHIPS: Record<string, string> = {
  pending:       "bg-gray-50 text-gray-600 border-gray-200",
  in_review:     "bg-blue-50 text-blue-700 border-blue-200",
  action_needed: "bg-amber-50 text-amber-700 border-amber-200",
  completed:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled:     "bg-gray-50 text-gray-400 border-gray-200",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round(nums.reduce((a, b) => a + b, 0) / nums.length);
}

// ── SLA result chip ────────────────────────────────────────────────────────────

function SlaResultChip({ r }: { r: LiftOffRequest }) {
  if (r.request_status === "completed") {
    const met = r.sla_deadline_at && r.completed_at
      ? new Date(r.completed_at) <= new Date(r.sla_deadline_at)
      : true;
    return (
      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
        met ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"
      }`}>
        {met ? "✓ Met" : "✗ Breached"}
      </span>
    );
  }
  if (!r.sla_deadline_at) return <span className="text-[11px] text-muted italic">No SLA</span>;
  const breached = isSlaBreached(r);
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${
      breached ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
    }`}>
      {breached ? "⚠ Breached" : "⏳ Active"}
    </span>
  );
}

// ── Metric tile ────────────────────────────────────────────────────────────────

function MetricTile({ label, value, sub, accent, warn }: {
  label: string; value: string; sub?: string; accent?: string; warn?: boolean;
}) {
  return (
    <div className={`rounded-2xl border bg-white px-5 py-4 ${warn ? "border-red-300" : "border-line"}`}>
      <p className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-2xl font-extrabold ${accent ?? "text-ink"}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

// ── Simple bar chart (SVG, no external deps) ───────────────────────────────────

function MiniBarChart({ data, colors, height = 120 }: {
  data: { label: string; values: number[]; }[];
  colors: string[];
  height?: number;
}) {
  if (data.length === 0) return <p className="text-xs text-muted/60 italic py-4 text-center">No data</p>;
  const totals = data.map(d => d.values.reduce((a, b) => a + b, 0));
  const maxVal = Math.max(...totals, 1);
  const barW   = Math.min(40, Math.floor(400 / Math.max(data.length, 1)) - 8);

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${Math.max(data.length * (barW + 12) + 20, 200)} ${height + 40}`}
        style={{ width: "100%", minWidth: `${data.length * (barW + 12) + 20}px`, height: `${height + 40}px` }}>
        {data.map((d, i) => {
          const x    = 10 + i * (barW + 12);
          let yOff   = height;
          return (
            <g key={d.label}>
              {d.values.map((v, vi) => {
                const h = Math.round((v / maxVal) * height);
                yOff -= h;
                return (
                  <g key={vi}>
                    <rect x={x} y={yOff} width={barW} height={h} fill={colors[vi] ?? "#6B7280"} rx={3} />
                    {h > 14 && (
                      <text x={x + barW / 2} y={yOff + h / 2 + 4} textAnchor="middle"
                        fontSize={9} fill="#fff" fontWeight={700}>{v}</text>
                    )}
                  </g>
                );
              })}
              <text x={x + barW / 2} y={height + 14} textAnchor="middle"
                fontSize={9} fill="#57606a">
                {d.label.length > 10 ? d.label.slice(0, 9) + "…" : d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Simple line chart (SVG) ────────────────────────────────────────────────────

function MiniLineChart({ points, height = 80 }: {
  points: { label: string; value: number }[];
  height?: number;
}) {
  if (points.length < 2) return <p className="text-xs text-muted/60 italic py-4 text-center">Not enough data</p>;
  const maxV = Math.max(...points.map(p => p.value), 1);
  const w    = 400;
  const xStep = w / (points.length - 1);
  const coords = points.map((p, i) => ({
    x: i * xStep,
    y: height - Math.round((p.value / maxV) * (height - 10)) - 4,
  }));
  const pathD = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");

  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${height + 28}`} style={{ width: "100%", height: `${height + 28}px` }}>
        <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth={2} strokeLinejoin="round" />
        {coords.map((c, i) => (
          <g key={i}>
            <circle cx={c.x} cy={c.y} r={3} fill="#3B82F6" />
            <text x={c.x} y={height + 16} textAnchor="middle" fontSize={9} fill="#57606a">
              {points[i].label}
            </text>
            <text x={c.x} y={c.y - 6} textAnchor="middle" fontSize={9} fill="#1d4ed8" fontWeight={700}>
              {points[i].value}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ── Sort arrow ─────────────────────────────────────────────────────────────────

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-muted/30 ml-1">⇅</span>;
  return <span className="text-[#142850] ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

// ── Main client ────────────────────────────────────────────────────────────────

export function LiftOffSLATrackerClient({
  initialRequests,
  isDemo,
  viewerId,
  viewerName,
  isSelfOnly,
  canSeeAll,
  lockOnly,
}: {
  initialRequests: LiftOffRequest[];
  isDemo:     boolean;
  viewerId:   string;
  viewerName: string;
  isSelfOnly: boolean;
  canSeeAll:  boolean;
  lockOnly:   boolean;
}) {
  const availableTypes: LiftOffRequestType[] = lockOnly ? ["lock_request"] : ALL_TYPES;

  const owners = useMemo(() => {
    const s = new Set<string>();
    initialRequests.forEach(r => { if (r.claimed_by_name) s.add(r.claimed_by_name); });
    return Array.from(s).sort();
  }, [initialRequests]);

  const [filters, setFilters] = useState<FilterState>({
    scope:      isSelfOnly ? "mine" : "everyone",
    drillOwner: "",
    types:      [...availableTypes],
    datePreset: "all",
    dateFrom:   "",
    dateTo:     "",
  });

  const [sortKey, setSortKey] = useState<SortKey>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const now   = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    return initialRequests.filter(r => {
      if (filters.scope === "mine" && r.claimed_by_id !== viewerId) return false;
      if (filters.scope === "everyone" && filters.drillOwner !== "") {
        if (filters.drillOwner === "__unclaimed__") {
          if (r.claimed_by_name) return false;
        } else if ((r.claimed_by_name ?? "") !== filters.drillOwner) return false;
      }
      if (!filters.types.includes(r.request_type)) return false;
      const created = new Date(r.created_at).getTime();
      if (filters.datePreset === "today") {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        if (created < start.getTime()) return false;
      } else if (filters.datePreset === "7d")  { if (created < now - 7  * dayMs) return false; }
        else if (filters.datePreset === "30d") { if (created < now - 30 * dayMs) return false; }
        else if (filters.datePreset === "custom") {
          if (filters.dateFrom && created < new Date(filters.dateFrom).getTime()) return false;
          if (filters.dateTo   && created > new Date(filters.dateTo + "T23:59:59").getTime()) return false;
        }
      return true;
    });
  }, [initialRequests, filters, viewerId]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const completed  = filtered.filter(r => r.request_status === "completed");
    const metSla     = completed.filter(r => r.sla_deadline_at && r.completed_at && new Date(r.completed_at) <= new Date(r.sla_deadline_at));
    const breached   = filtered.filter(r => isSlaBreached(r));
    const respMins   = filtered.map(r => computeResponseMinutes(r)).filter((n): n is number => n !== null);
    const handleMins = completed.map(r => computeActualHandleMinutes(r)).filter((n): n is number => n !== null);
    const incomplete = filtered.filter(r => !!r.incomplete_at);
    const metPct     = completed.length > 0 ? Math.round((metSla.length / completed.length) * 100) : null;
    const incPct     = filtered.length > 0  ? Math.round((incomplete.length / filtered.length) * 100) : 0;

    return {
      total:     filtered.length,
      completed: completed.length,
      metSla:    metSla.length,
      metPct,
      breached:  breached.length,
      avgResp:   avg(respMins),
      avgHandle: avg(handleMins),
      incPct,
      incomplete: incomplete.length,
    };
  }, [filtered]);

  // ── Chart data ─────────────────────────────────────────────────────────────

  // 1. SLA by request type (stacked: met / breached)
  const byTypeBars = useMemo(() => {
    return ALL_TYPES
      .filter(t => !lockOnly || t === "lock_request")
      .map(t => {
        const rows = filtered.filter(r => r.request_type === t && r.request_status === "completed");
        const met  = rows.filter(r => r.sla_deadline_at && r.completed_at && new Date(r.completed_at) <= new Date(r.sla_deadline_at)).length;
        const br   = rows.length - met;
        return { label: REQUEST_TYPE_LABELS[t].split(" ")[0], values: [met, br] };
      })
      .filter(d => d.values[0] + d.values[1] > 0);
  }, [filtered, lockOnly]);

  // 2. SLA compliance % by day (last 14 days or all within date filter)
  const complianceLine = useMemo(() => {
    const completedRows = filtered.filter(r => r.request_status === "completed" && r.completed_at);
    if (completedRows.length < 2) return [];
    // bucket by day of created_at
    const map = new Map<string, { met: number; total: number }>();
    completedRows.forEach(r => {
      const day = r.created_at.slice(0, 10);
      const cur = map.get(day) ?? { met: 0, total: 0 };
      cur.total++;
      if (r.sla_deadline_at && r.completed_at && new Date(r.completed_at) <= new Date(r.sla_deadline_at)) cur.met++;
      map.set(day, cur);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([day, { met, total }]) => ({
        label: new Date(day).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }),
        value: Math.round((met / total) * 100),
      }));
  }, [filtered]);

  // 3. Avg handle time by processor (Everyone only)
  const handleByProcessor = useMemo(() => {
    if (filters.scope !== "everyone") return [];
    const map = new Map<string, number[]>();
    filtered.forEach(r => {
      const h = computeActualHandleMinutes(r);
      if (h === null || !r.claimed_by_name) return;
      const cur = map.get(r.claimed_by_name) ?? [];
      cur.push(h);
      map.set(r.claimed_by_name, cur);
    });
    return Array.from(map.entries())
      .map(([name, mins]) => ({
        label: name,
        values: [Math.round(mins.reduce((a, b) => a + b, 0) / mins.length)],
      }))
      .sort((a, b) => a.values[0] - b.values[0]);
  }, [filtered, filters.scope]);

  // 4. Incomplete reasons pie (manual SVG donut)
  const incompleteReasons = useMemo(() => {
    const map = new Map<string, number>();
    filtered.forEach(r => {
      (r.incomplete_reasons ?? []).forEach(reason => {
        map.set(reason, (map.get(reason) ?? 0) + 1);
      });
    });
    return Array.from(map.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count);
  }, [filtered]);

  // ── Sorting ────────────────────────────────────────────────────────────────
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: number, vb: number;
      if (sortKey === "response_mins") {
        va = computeResponseMinutes(a) ?? Infinity;
        vb = computeResponseMinutes(b) ?? Infinity;
      } else if (sortKey === "handle_mins") {
        va = computeActualHandleMinutes(a) ?? Infinity;
        vb = computeActualHandleMinutes(b) ?? Infinity;
      } else {
        va = new Date(a[sortKey] ?? 0).getTime();
        vb = new Date(b[sortKey] ?? 0).getTime();
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [filtered, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  }

  // ── Filter helpers ─────────────────────────────────────────────────────────
  const hasActiveFilters = filters.drillOwner !== "" || filters.types.length < availableTypes.length || filters.datePreset !== "all";

  const resetFilters = () => setFilters(f => ({
    ...f, drillOwner: "", types: [...availableTypes], datePreset: "all", dateFrom: "", dateTo: "",
  }));

  // ── metPct colour ──────────────────────────────────────────────────────────
  const metPctAccent = stats.metPct === null ? "text-ink"
    : stats.metPct >= 80 ? "text-emerald-600"
    : stats.metPct >= 60 ? "text-amber-600"
    : "text-red-600";

  return (
    <div className="space-y-6">
      <PipelineTabBar />

      {/* ── Filter bar ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-white px-5 py-4 space-y-4">

        {/* Scope toggle */}
        {!isSelfOnly && canSeeAll && (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-muted">Scope:</span>
            <div className="flex rounded-xl border border-line overflow-hidden">
              {(["mine", "everyone"] as ScopeMode[]).map(s => (
                <button key={s}
                  onClick={() => setFilters(f => ({ ...f, scope: s, drillOwner: "" }))}
                  className={`px-4 py-1.5 text-xs font-bold transition-all ${
                    filters.scope === s ? "bg-[#142850] text-white" : "bg-white text-muted hover:bg-sand"
                  }`}>
                  {s === "mine" ? `🙋 Mine (${viewerName})` : "👥 Everyone"}
                </button>
              ))}
            </div>
            {filters.scope === "everyone" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Owner:</span>
                <select
                  value={filters.drillOwner}
                  onChange={e => setFilters(f => ({ ...f, drillOwner: e.target.value }))}
                  className="rounded-lg border border-line bg-sand px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30">
                  <option value="">All owners</option>
                  <option value="__unclaimed__">Unclaimed</option>
                  {owners.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {isSelfOnly && (
          <div className="flex items-center gap-2 rounded-xl bg-sand border border-line px-4 py-2.5">
            <span>🙋</span>
            <p className="text-xs font-semibold text-ink">Showing your requests only <span className="font-normal text-muted">— {viewerName}</span></p>
          </div>
        )}

        {/* Type chips */}
        {!lockOnly && (
          <div className="flex flex-wrap gap-2">
            <span className="text-xs font-semibold text-muted self-center mr-1">Type:</span>
            {ALL_TYPES.map(t => (
              <button key={t}
                onClick={() => setFilters(f => ({
                  ...f,
                  types: f.types.includes(t) ? f.types.filter(x => x !== t) : [...f.types, t],
                }))}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                  filters.types.includes(t) ? "bg-[#142850] text-white border-[#142850]" : "bg-sand text-muted border-line hover:border-[#142850]/40"
                }`}>
                {REQUEST_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        )}

        {/* Date range */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted mr-1">Date:</span>
          {(["all", "today", "7d", "30d", "custom"] as DatePreset[]).map(p => (
            <button key={p}
              onClick={() => setFilters(f => ({ ...f, datePreset: p }))}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                filters.datePreset === p ? "bg-[#142850] text-white border-[#142850]" : "bg-sand text-muted border-line hover:border-[#142850]/40"
              }`}>
              {p === "all" ? "All time" : p === "today" ? "Today" : p === "7d" ? "7d" : p === "30d" ? "30d" : "Custom"}
            </button>
          ))}
          {filters.datePreset === "custom" && (
            <div className="flex items-center gap-2 ml-1">
              <input type="date" value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                className="rounded-lg border border-line bg-sand px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30" />
              <span className="text-xs text-muted">→</span>
              <input type="date" value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                className="rounded-lg border border-line bg-sand px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30" />
            </div>
          )}
          {hasActiveFilters && (
            <button onClick={resetFilters}
              className="ml-auto text-[11px] font-semibold text-muted hover:text-red-600 transition-colors">
              ✕ Reset filters
            </button>
          )}
        </div>

        <p className="text-[11px] text-muted border-t border-line pt-3">
          Analysing <span className="font-semibold text-ink">{filtered.length}</span> of {initialRequests.length} requests
          {filters.scope === "mine" && <span className="ml-1">· <span className="font-semibold text-ink">your queue</span></span>}
          {filters.scope === "everyone" && filters.drillOwner && filters.drillOwner !== "__unclaimed__" && (
            <span className="ml-1">· drilled to <span className="font-semibold text-ink">{filters.drillOwner}</span></span>
          )}
          {isDemo && <span className="ml-2 text-purple-600 font-semibold">(demo)</span>}
        </p>
      </div>

      {/* ── Metric tiles ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <MetricTile label="Total Requests"  value={String(stats.total)}   sub="in scope" />
        <MetricTile label="SLA Met %"       value={stats.metPct !== null ? `${stats.metPct}%` : "—"} sub={`${stats.metSla} of ${stats.completed} completed`} accent={metPctAccent} />
        <MetricTile label="SLA Breached"    value={String(stats.breached)} sub="active + completed" accent="text-red-600" warn={stats.breached > 0} />
        <MetricTile label="Avg Handle Time" value={stats.avgHandle !== null ? formatMinutes(stats.avgHandle) : "—"} sub="start → complete" accent="text-amber-600" />
        <MetricTile label="Avg Response"    value={stats.avgResp !== null ? formatMinutes(stats.avgResp) : "—"} sub="submit → claimed" accent="text-blue-600" />
        <MetricTile label="Incomplete Rate" value={`${stats.incPct}%`} sub={`${stats.incomplete} sent back`} accent={stats.incPct > 30 ? "text-red-600" : stats.incPct > 15 ? "text-amber-600" : "text-ink"} warn={stats.incPct > 30} />
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

        {/* SLA by type */}
        <div className="rounded-2xl border border-line bg-white px-5 py-4">
          <p className="text-xs font-bold text-ink mb-1">SLA by Request Type</p>
          <p className="text-[11px] text-muted mb-3">Completed requests — met vs breached</p>
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500 inline-block" />Met</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted"><span className="h-2.5 w-2.5 rounded-sm bg-red-400 inline-block" />Breached</span>
          </div>
          {byTypeBars.length > 0
            ? <MiniBarChart data={byTypeBars} colors={["#10B981", "#F87171"]} height={100} />
            : <p className="text-xs text-muted/60 italic py-4 text-center">No completed requests in scope</p>}
        </div>

        {/* Compliance over time */}
        <div className="rounded-2xl border border-line bg-white px-5 py-4">
          <p className="text-xs font-bold text-ink mb-1">SLA Compliance Over Time</p>
          <p className="text-[11px] text-muted mb-3">% met per day (completed requests)</p>
          <MiniLineChart points={complianceLine} height={90} />
        </div>

        {/* Handle time by processor — Everyone only */}
        {filters.scope === "everyone" && (
          <div className="rounded-2xl border border-line bg-white px-5 py-4">
            <p className="text-xs font-bold text-ink mb-1">Avg Handle Time by Processor</p>
            <p className="text-[11px] text-muted mb-3">Start → Complete (minutes, completed requests)</p>
            {handleByProcessor.length > 0
              ? <MiniBarChart data={handleByProcessor} colors={["#3B82F6"]} height={100} />
              : <p className="text-xs text-muted/60 italic py-4 text-center">No completed requests with handle data</p>}
          </div>
        )}

        {/* Incomplete reasons */}
        {incompleteReasons.length > 0 && (
          <div className="rounded-2xl border border-line bg-white px-5 py-4">
            <p className="text-xs font-bold text-ink mb-3">Incomplete Reasons</p>
            <div className="space-y-2">
              {incompleteReasons.map(({ label, count }) => {
                const pct = Math.round((count / stats.incomplete) * 100);
                return (
                  <div key={label}>
                    <div className="flex justify-between text-[11px] mb-0.5">
                      <span className="text-ink font-medium truncate max-w-[75%]">{label}</span>
                      <span className="text-muted font-semibold">{count}× ({pct}%)</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-line overflow-hidden">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Request-level SLA table ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-line flex items-center justify-between">
          <p className="text-sm font-bold text-ink">All Requests — SLA Detail</p>
          <span className="text-[11px] text-muted">{sorted.length} rows</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-line bg-sand">
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide">Borrower</th>
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide">ARIVE #</th>
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide">Type</th>
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide">Status</th>
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide cursor-pointer select-none"
                  onClick={() => handleSort("created_at")}>
                  Submitted <SortArrow active={sortKey === "created_at"} dir={sortDir} />
                </th>
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide cursor-pointer select-none"
                  onClick={() => handleSort("response_mins")}>
                  Response <SortArrow active={sortKey === "response_mins"} dir={sortDir} />
                </th>
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide cursor-pointer select-none"
                  onClick={() => handleSort("handle_mins")}>
                  Handle Time <SortArrow active={sortKey === "handle_mins"} dir={sortDir} />
                </th>
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide cursor-pointer select-none"
                  onClick={() => handleSort("sla_deadline_at")}>
                  SLA Deadline <SortArrow active={sortKey === "sla_deadline_at"} dir={sortDir} />
                </th>
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide">SLA Result</th>
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide">Owner</th>
                <th className="text-left px-4 py-2.5 font-bold text-muted uppercase text-[10px] tracking-wide">Incomplete</th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={11} className="text-center py-10 text-muted italic text-xs">No requests match filters</td></tr>
              )}
              {sorted.map(r => {
                const respMins   = computeResponseMinutes(r);
                const handleMins = computeActualHandleMinutes(r);
                return (
                  <tr key={r.id} className="border-b border-line last:border-0 hover:bg-sand/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/liftoff/${r.id}`} className="font-semibold text-ink hover:text-[#142850] transition-colors">
                        {r.borrower_first_name} {r.borrower_last_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-muted">{r.arive_loan_number ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-sand border border-line px-2 py-0.5 text-[10px] font-semibold text-muted whitespace-nowrap">
                        {REQUEST_TYPE_LABELS[r.request_type]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_CHIPS[r.request_status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                        {r.request_status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{fmtDate(r.created_at)}</td>
                    <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">
                      {respMins !== null ? formatMinutes(respMins) : <span className="text-muted italic font-normal">unclaimed</span>}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink whitespace-nowrap">
                      {handleMins !== null
                        ? formatMinutes(handleMins)
                        : r.started_at
                          ? <span className="text-blue-600 font-semibold">In progress</span>
                          : <span className="text-muted italic font-normal">—</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-muted whitespace-nowrap">{fmtDateTime(r.sla_deadline_at)}</td>
                    <td className="px-4 py-3"><SlaResultChip r={r} /></td>
                    <td className="px-4 py-3 text-ink">
                      {r.claimed_by_name ?? <span className="text-muted italic">Unclaimed</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {r.incomplete_at ? <span className="text-amber-600 font-bold">✓</span> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
