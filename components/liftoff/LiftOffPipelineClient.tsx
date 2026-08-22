"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import type { LiftOffRequest, LiftOffRequestType, LiftOffRequestStatus } from "@/lib/database.types";
import { SLA_WINDOWS, liveSeverity, formatSlaCountdown } from "@/lib/liftoff-sla";

// ── Types ──────────────────────────────────────────────────────────────────────

type DatePreset = "all" | "today" | "7d" | "30d" | "custom";

interface FilterState {
  types: LiftOffRequestType[];
  owner: string;          // claimed_by_name or "all"
  datePreset: DatePreset;
  dateFrom: string;
  dateTo: string;
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

const COLUMNS: { key: LiftOffRequestStatus; label: string; color: string }[] = [
  { key: "pending",       label: "Pending",       color: "#6B7280" },
  { key: "in_review",     label: "In Review",     color: "#3B82F6" },
  { key: "action_needed", label: "Action Needed", color: "#F59E0B" },
  { key: "completed",     label: "Completed",     color: "#10B981" },
];

// ── SLA pill ───────────────────────────────────────────────────────────────────

function SlaPill({ slaDeadlineAt, requestType, tick }: {
  slaDeadlineAt: string | null;
  requestType: LiftOffRequestType;
  tick: number;
}) {
  if (!slaDeadlineAt) return null;
  void tick; // consumed only to force re-render
  const windowHours = SLA_WINDOWS[requestType];
  const severity = liveSeverity(slaDeadlineAt, windowHours);
  const label = formatSlaCountdown(slaDeadlineAt);
  const colours: Record<typeof severity, string> = {
    normal:   "bg-emerald-50 text-emerald-700 border-emerald-200",
    warning:  "bg-amber-50  text-amber-700  border-amber-200",
    critical: "bg-red-50    text-red-700    border-red-200",
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${colours[severity]}`}>
      {severity === "critical" ? "🔴" : severity === "warning" ? "🟡" : "🟢"} {label}
    </span>
  );
}

// ── Pipeline card ──────────────────────────────────────────────────────────────

function PipelineCard({ req, tick }: { req: LiftOffRequest; tick: number }) {
  const isLockPending = !!req.linked_lock_request_id || req.request_type === "lock_request";
  const isActionNeeded = req.request_status === "action_needed";
  const isCompletedToday = (() => {
    if (!req.completed_at) return false;
    const d = new Date(req.completed_at);
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  })();

  return (
    <Link
      href={`/liftoff/${req.id}`}
      className={`block rounded-xl border bg-white px-4 py-3.5 transition-all hover:shadow-sm hover:border-[#142850]/30 ${
        isCompletedToday ? "border-l-4 border-l-emerald-400 border-r border-t border-b border-line" :
        req.request_type === "lock_request" ? "border border-amber-300" :
        "border-line"
      }`}
    >
      {/* Borrower + loan number */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-bold text-ink leading-tight">
          {req.borrower_first_name} {req.borrower_last_name}
        </p>
        {req.arive_loan_number && (
          <span className="text-[10px] font-mono text-muted flex-shrink-0">{req.arive_loan_number}</span>
        )}
      </div>

      {/* Request type + badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
        <span className="rounded-full bg-sand border border-line px-2 py-0.5 text-[10px] font-semibold text-muted">
          {REQUEST_TYPE_LABELS[req.request_type]}
        </span>
        {req.request_type === "lock_request" && (
          <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-700">🔒 Lock</span>
        )}
        {isActionNeeded && (
          <span className="rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-700">⚠ Needs Attention</span>
        )}
      </div>

      {/* SLA */}
      <SlaPill slaDeadlineAt={req.sla_deadline_at} requestType={req.request_type} tick={tick} />

      {/* Assignee / submitter */}
      <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted">
        <span>
          {req.claimed_by_name
            ? <><span className="font-semibold text-ink">{req.claimed_by_name}</span></>
            : <span className="italic">Unclaimed</span>
          }
        </span>
        <span>{req.submitter_name}</span>
      </div>
    </Link>
  );
}

// ── Kanban column ──────────────────────────────────────────────────────────────

function KanbanColumn({
  col, requests, tick, defaultCollapsed,
}: {
  col: typeof COLUMNS[number];
  requests: LiftOffRequest[];
  tick: number;
  defaultCollapsed: boolean;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const sorted = [...requests].sort((a, b) => (b.priority_score ?? 0) - (a.priority_score ?? 0));

  return (
    <div className="flex flex-col min-w-0">
      {/* Column header */}
      <button
        onClick={() => setCollapsed(c => !c)}
        className="flex items-center gap-2 rounded-xl border border-line bg-sand px-4 py-2.5 mb-2 text-left hover:bg-[#eee8df] transition-colors"
      >
        <span className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: col.color }} />
        <span className="text-xs font-bold text-ink flex-1">{col.label}</span>
        <span className="rounded-full bg-white border border-line px-2 py-0.5 text-[10px] font-bold text-muted">{sorted.length}</span>
        <span className="text-muted text-xs">{collapsed ? "▶" : "▼"}</span>
      </button>

      {/* Cards */}
      {!collapsed && (
        <div className="space-y-2 overflow-y-auto">
          {sorted.length === 0 ? (
            <p className="text-center text-xs text-muted/60 py-6 italic">No requests</p>
          ) : (
            sorted.map(r => <PipelineCard key={r.id} req={r} tick={tick} />)
          )}
        </div>
      )}
    </div>
  );
}

// ── Metric tile ────────────────────────────────────────────────────────────────

function MetricTile({ label, value, sub, accent }: { label: string; value: number; sub?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-5 py-4">
      <p className="text-xs font-semibold text-muted uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-3xl font-extrabold ${accent ?? "text-ink"}`}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted">{sub}</p>}
    </div>
  );
}

// ── Main client ────────────────────────────────────────────────────────────────

export function LiftOffPipelineClient({
  initialRequests,
  isDemo,
}: {
  initialRequests: LiftOffRequest[];
  isDemo: boolean;
}) {
  // live 1s tick to update SLA countdowns
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // build unique owner list
  const owners = useMemo(() => {
    const s = new Set<string>();
    initialRequests.forEach(r => { if (r.claimed_by_name) s.add(r.claimed_by_name); });
    return Array.from(s).sort();
  }, [initialRequests]);

  const [filters, setFilters] = useState<FilterState>({
    types: [...ALL_TYPES],
    owner: "all",
    datePreset: "all",
    dateFrom: "",
    dateTo: "",
  });

  // ── Filtered requests ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    return initialRequests.filter(r => {
      // type filter
      if (!filters.types.includes(r.request_type)) return false;

      // owner filter
      if (filters.owner !== "all") {
        if ((r.claimed_by_name ?? "") !== filters.owner) return false;
      }

      // date filter
      const created = new Date(r.created_at).getTime();
      if (filters.datePreset === "today") {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        if (created < start.getTime()) return false;
      } else if (filters.datePreset === "7d") {
        if (created < now - 7 * dayMs) return false;
      } else if (filters.datePreset === "30d") {
        if (created < now - 30 * dayMs) return false;
      } else if (filters.datePreset === "custom") {
        if (filters.dateFrom && created < new Date(filters.dateFrom).getTime()) return false;
        if (filters.dateTo && created > new Date(filters.dateTo + "T23:59:59").getTime()) return false;
      }

      return true;
    });
  }, [initialRequests, filters]);

  // ── Metrics ──────────────────────────────────────────────────────────────────
  const metrics = useMemo(() => {
    const active     = filtered.filter(r => r.request_status !== "completed" && r.request_status !== "cancelled");
    const lockPend   = filtered.filter(r => r.request_type === "lock_request" && r.request_status !== "completed" && r.request_status !== "cancelled");
    const now        = Date.now();
    const warning    = filtered.filter(r => {
      if (!r.sla_deadline_at || r.request_status === "completed") return false;
      return liveSeverity(r.sla_deadline_at, SLA_WINDOWS[r.request_type]) === "warning";
    });
    const critical   = filtered.filter(r => {
      if (!r.sla_deadline_at || r.request_status === "completed") return false;
      return liveSeverity(r.sla_deadline_at, SLA_WINDOWS[r.request_type]) === "critical";
    });
    const doneToday  = filtered.filter(r => {
      if (!r.completed_at) return false;
      const d = new Date(r.completed_at);
      const n = new Date(now);
      return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
    });
    return { active: active.length, lockPend: lockPend.length, warning: warning.length, critical: critical.length, doneToday: doneToday.length };
  }, [filtered]);

  // ── Kanban grouping ──────────────────────────────────────────────────────────
  const byStatus = useMemo(() => {
    const map: Record<string, LiftOffRequest[]> = {};
    for (const col of COLUMNS) map[col.key] = [];
    for (const r of filtered) {
      if (map[r.request_status]) map[r.request_status].push(r);
    }
    return map;
  }, [filtered]);

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const toggleType = (t: LiftOffRequestType) => {
    setFilters(f => ({
      ...f,
      types: f.types.includes(t) ? f.types.filter(x => x !== t) : [...f.types, t],
    }));
  };

  return (
    <div className="space-y-5">
      {/* Metrics row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <MetricTile label="Active"       value={metrics.active}   sub="non-completed" />
        <MetricTile label="Lock Pending" value={metrics.lockPend} sub="lock requests active" accent="text-amber-600" />
        <MetricTile label="SLA Warning"  value={metrics.warning}  sub="≤20% time left"       accent="text-amber-500" />
        <MetricTile label="SLA Breached" value={metrics.critical} sub="past deadline"         accent="text-red-600" />
        <MetricTile label="Done Today"   value={metrics.doneToday} sub="completed today"      accent="text-emerald-600" />
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl border border-line bg-white px-5 py-4 space-y-3">
        {/* Type chips */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs font-semibold text-muted self-center mr-1">Type:</span>
          {ALL_TYPES.map(t => (
            <button
              key={t}
              onClick={() => toggleType(t)}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                filters.types.includes(t)
                  ? "bg-[#142850] text-white border-[#142850]"
                  : "bg-sand text-muted border-line hover:border-[#142850]/40"
              }`}
            >
              {REQUEST_TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Owner + Date row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Owner */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted">Owner:</span>
            <select
              value={filters.owner}
              onChange={e => setFilters(f => ({ ...f, owner: e.target.value }))}
              className="rounded-lg border border-line bg-sand px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30"
            >
              <option value="all">All</option>
              <option value="">Unclaimed</option>
              {owners.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>

          {/* Date presets */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-muted mr-1">Date:</span>
            {(["all", "today", "7d", "30d", "custom"] as DatePreset[]).map(p => (
              <button
                key={p}
                onClick={() => setFilters(f => ({ ...f, datePreset: p }))}
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                  filters.datePreset === p
                    ? "bg-[#142850] text-white border-[#142850]"
                    : "bg-sand text-muted border-line hover:border-[#142850]/40"
                }`}
              >
                {p === "all" ? "All" : p === "today" ? "Today" : p === "7d" ? "7d" : p === "30d" ? "30d" : "Custom"}
              </button>
            ))}
          </div>

          {/* Custom date inputs */}
          {filters.datePreset === "custom" && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                className="rounded-lg border border-line bg-sand px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30"
              />
              <span className="text-xs text-muted">→</span>
              <input
                type="date"
                value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                className="rounded-lg border border-line bg-sand px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30"
              />
            </div>
          )}

          {/* Reset */}
          {(filters.types.length < ALL_TYPES.length || filters.owner !== "all" || filters.datePreset !== "all") && (
            <button
              onClick={() => setFilters({ types: [...ALL_TYPES], owner: "all", datePreset: "all", dateFrom: "", dateTo: "" })}
              className="ml-auto text-[11px] font-semibold text-muted hover:text-red-600 transition-colors"
            >
              ✕ Reset filters
            </button>
          )}
        </div>

        {/* Result count */}
        <p className="text-[11px] text-muted">
          Showing {filtered.length} of {initialRequests.length} requests
          {isDemo && <span className="ml-2 text-purple-600 font-semibold">(demo)</span>}
        </p>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map(col => (
          <KanbanColumn
            key={col.key}
            col={col}
            requests={byStatus[col.key] ?? []}
            tick={tick}
            defaultCollapsed={col.key === "completed"}
          />
        ))}
      </div>
    </div>
  );
}
