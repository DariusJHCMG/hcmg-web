"use client";

/**
 * /goal-engine/admin/webhook-log
 * Live view of every inbound ARIVE webhook call.
 * Auto-refreshes every 30 s so it updates as the hourly ARIVE sync fires.
 */

import { useState, useEffect, useCallback, useRef } from "react";

const C = {
  navy:   "#142850",
  orange: "#F37021",
  ink:    "#1A2B42",
  muted:  "#64748B",
  line:   "#E2E8F0",
  sand:   "#F8FAFC",
  white:  "#ffffff",
  green:  "#16a34a",
  red:    "#dc2626",
  yellow: "#d97706",
};

type PreviousValue = {
  app_volume?:    number | null;
  funded_volume?: number | null;
  app_date?:      string | null;
  funded_date?:   string | null;
  event_type?:    string | null;
};

type NewValues = {
  app_volume?:    number | null;
  funded_volume?: number | null;
};

type LogRow = {
  id:               string;
  received_at:      string;
  source:           string;
  event_type_raw:   string | null;
  event_type:       string | null;
  loan_id:          string | null;
  lo_nmls:          string | null;
  lo_email_raw:     string | null;
  lo_matched_name:  string | null;
  goal_month_label: string | null;
  amount:           number | null;
  event_date:       string | null;
  action:           string | null;
  error_message:    string | null;
  raw_payload:      unknown;
  response_body:    unknown;
  ip_address:       string | null;
  duration_ms:      number | null;
  previous_value:   PreviousValue | null;
};

const POLL_INTERVAL_MS = 30_000; // 30 seconds

function actionColor(action: string | null) {
  if (action === "created")  return { bg: "#f0fdf4", border: "#86efac", color: C.green };
  if (action === "updated")  return { bg: "#eff6ff", border: "#93c5fd", color: "#1d4ed8" };
  if (action === "error")    return { bg: "#fff5f5", border: "#fca5a5", color: C.red };
  if (action === "ignored")  return { bg: "#f8fafc", border: C.line,    color: C.muted };
  return                            { bg: C.sand,    border: C.line,    color: C.muted };
}

function fmt$(n: number | null | undefined) {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60_000)    return `${Math.round(diff / 1000)}s ago`;
  if (diff < 3_600_000) return `${Math.round(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.round(diff / 3_600_000)}h ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Extract new_values from response_body if present (zapier_sync stores them) */
function getNewValues(row: LogRow): NewValues | null {
  if (!row.response_body || typeof row.response_body !== "object") return null;
  const rb = row.response_body as Record<string, unknown>;
  if (rb.new_values && typeof rb.new_values === "object") {
    return rb.new_values as NewValues;
  }
  return null;
}

export default function WebhookLogPage() {
  const [rows,     setRows]     = useState<LogRow[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState<"all" | "created" | "updated" | "error" | "ignored">("all");
  const [search,   setSearch]   = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const r = await fetch("/api/goal-engine/webhook-log", { cache: "no-store" });
      if (r.ok) {
        setRows(await r.json());
        setLastFetch(new Date());
      }
    } catch { /* silent */ }
    if (!silent) setLoading(false);
  }, []);

  // Initial load
  useEffect(() => { load(); }, [load]);

  // Auto-refresh every 30 s
  useEffect(() => {
    intervalRef.current = setInterval(() => load(true), POLL_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [load]);

  const filtered = rows.filter(r => {
    if (filter !== "all" && r.action !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (r.loan_id         ?? "").toLowerCase().includes(q) ||
        (r.lo_matched_name ?? "").toLowerCase().includes(q) ||
        (r.lo_email_raw    ?? "").toLowerCase().includes(q) ||
        (r.lo_nmls         ?? "").toLowerCase().includes(q) ||
        (r.error_message   ?? "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all:     rows.length,
    created: rows.filter(r => r.action === "created").length,
    updated: rows.filter(r => r.action === "updated").length,
    error:   rows.filter(r => r.action === "error").length,
    ignored: rows.filter(r => r.action === "ignored").length,
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px 64px", fontFamily: "Montserrat,system-ui,sans-serif", color: C.ink }}>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <a href="/goal-engine/admin/arive" style={{ fontSize: 12, fontWeight: 700, color: C.muted, textDecoration: "none" }}>← ARIVE Setup</a>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: 14, flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg,${C.navy},#1e3a5f)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              📡
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: C.navy }}>Webhook Log</h1>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted }}>
                Every inbound ARIVE webhook call — real-time audit trail
                {lastFetch && (
                  <span style={{ marginLeft: 8, color: C.green }}>
                    ● live · updated {timeAgo(lastFetch.toISOString())}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => load(false)}
            disabled={loading}
            style={{ padding: "9px 18px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.white, color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}
          >
            {loading ? "Loading…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* Summary tiles */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 24 }} className="wl-summary">
        {(["all","created","updated","error","ignored"] as const).map(k => {
          const { bg, border, color } = k === "all"
            ? { bg: C.navy, border: "transparent", color: "#fff" }
            : actionColor(k);
          return (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${filter === k && k !== "all" ? color : k === "all" && filter === "all" ? "rgba(243,112,33,0.4)" : border}`,
              background: filter === k ? bg : C.white,
              cursor: "pointer", fontFamily: "inherit", textAlign: "left",
              boxShadow: filter === k ? "0 2px 10px rgba(0,0,0,0.1)" : "none",
              transition: "all .15s",
            }}>
              <p style={{ margin: "0 0 3px", fontSize: 9, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: filter === k ? (k === "all" ? "rgba(255,255,255,0.5)" : color) : C.muted }}>{k}</p>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: filter === k ? (k === "all" ? "#fff" : color) : C.ink }}>{counts[k]}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search loan ID, LO name, email, NMLS, error…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: "10px 16px", borderRadius: 12, border: `1.5px solid ${C.line}`, background: C.sand, fontSize: 13, color: C.ink, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {/* Log rows */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <p style={{ fontSize: 14, color: C.muted }}>Loading webhook log…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: "48px 24px", textAlign: "center" }}>
          <p style={{ margin: "0 0 6px", fontSize: 24 }}>📭</p>
          <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: C.ink }}>
            {rows.length === 0 ? "No webhooks received yet" : "No results match your filter"}
          </p>
          <p style={{ margin: 0, fontSize: 12, color: C.muted }}>
            {rows.length === 0 ? "Webhook calls from ARIVE will appear here once received." : "Try a different filter or search term."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(row => {
            const { bg, border, color } = actionColor(row.action);
            const isOpen = expanded === row.id;
            return (
              <div key={row.id} style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
                {/* Main row */}
                <div
                  onClick={() => setExpanded(isOpen ? null : row.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 20px", cursor: "pointer", flexWrap: "wrap" }}
                >
                  {/* Action badge */}
                  <span style={{ padding: "3px 10px", borderRadius: 99, fontSize: 10, fontWeight: 800, background: bg, border: `1px solid ${border}`, color, flexShrink: 0, minWidth: 64, textAlign: "center" }}>
                    {row.action ?? "—"}
                  </span>

                  {/* Event type */}
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.muted, flexShrink: 0, minWidth: 80 }}>
                    {row.event_type ?? row.event_type_raw ?? "—"}
                  </span>

                  {/* LO name */}
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.ink, flex: 1, minWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.lo_matched_name ?? <span style={{ color: C.muted, fontWeight: 400 }}>Unknown LO</span>}
                  </span>

                  {/* Loan ID */}
                  <span style={{ fontSize: 11, color: C.muted, fontFamily: "monospace", flexShrink: 0, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {row.loan_id ?? "—"}
                  </span>

                  {/* Amount */}
                  <span style={{ fontSize: 13, fontWeight: 800, color: C.navy, flexShrink: 0, minWidth: 70, textAlign: "right" }}>
                    {fmt$(row.amount)}
                  </span>

                  {/* Goal month */}
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0, minWidth: 90 }}>
                    {row.goal_month_label ?? "—"}
                  </span>

                  {/* Time */}
                  <span style={{ fontSize: 11, color: C.muted, flexShrink: 0, minWidth: 70, textAlign: "right" }}>
                    {timeAgo(row.received_at)}
                  </span>

                  {/* Duration */}
                  {row.duration_ms != null && (
                    <span style={{ fontSize: 10, color: C.muted, flexShrink: 0 }}>{row.duration_ms}ms</span>
                  )}

                  {/* Expand indicator */}
                  <span style={{ fontSize: 12, color: C.muted, flexShrink: 0, marginLeft: "auto" }}>{isOpen ? "▲" : "▼"}</span>
                </div>

                {/* Error message inline */}
                {row.error_message && !isOpen && (
                  <div style={{ padding: "0 20px 12px" }}>
                    <span style={{ fontSize: 11, color: C.red, fontWeight: 600 }}>⚠ {row.error_message}</span>
                  </div>
                )}

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{ borderTop: `1px solid ${C.line}`, padding: "16px 20px", background: C.sand }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 16 }} className="wl-detail-grid">
                      {[
                        { l: "Received",    v: new Date(row.received_at).toLocaleString("en-US") },
                        { l: "Source",      v: row.source },
                        { l: "IP Address",  v: row.ip_address ?? "—" },
                        { l: "LO Email",    v: row.lo_email_raw ?? "—" },
                        { l: "LO NMLS",     v: row.lo_nmls ?? "—" },
                        { l: "Event Date",  v: row.event_date ?? "—" },
                        { l: "Event Raw",   v: row.event_type_raw ?? "—" },
                        { l: "Duration",    v: row.duration_ms != null ? `${row.duration_ms}ms` : "—" },
                        { l: "Loan ID",     v: row.loan_id ?? "—" },
                      ].map(s => (
                        <div key={s.l} style={{ padding: "8px 12px", borderRadius: 8, background: C.white, border: `1px solid ${C.line}` }}>
                          <p style={{ margin: "0 0 2px", fontSize: 8, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: C.muted }}>{s.l}</p>
                          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.ink, wordBreak: "break-all" }}>{s.v}</p>
                        </div>
                      ))}
                    </div>
                    {row.error_message && (
                      <div style={{ padding: "10px 14px", borderRadius: 10, background: "#fff5f5", border: "1px solid #fca5a5", marginBottom: 12 }}>
                        <p style={{ margin: "0 0 3px", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.red }}>Error</p>
                        <p style={{ margin: 0, fontSize: 12, color: C.red, fontWeight: 600 }}>{row.error_message}</p>
                      </div>
                    )}

                    {/* Before → After for sync updates */}
                    {row.action === "updated" && row.previous_value && (() => {
                      const prev = row.previous_value;
                      const next = getNewValues(row);

                      // Build per-field diffs: only show fields that actually changed
                      const diffs: { label: string; prev: string; after: string }[] = [];

                      const prevAppVol  = prev.app_volume    ?? null;
                      const prevFndVol  = prev.funded_volume ?? null;
                      // "after" comes from new_values in response_body (zapier_sync) or falls back to row.amount
                      const afterAppVol = next?.app_volume    !== undefined ? next.app_volume    : (row.event_type !== "funded" ? row.amount : null);
                      const afterFndVol = next?.funded_volume !== undefined ? next.funded_volume : (row.event_type === "funded" ? row.amount : null);

                      if (prevAppVol !== afterAppVol) {
                        diffs.push({ label: "App Volume",    prev: fmt$(prevAppVol), after: fmt$(afterAppVol) });
                      }
                      if (prevFndVol !== afterFndVol) {
                        diffs.push({ label: "Funded Volume", prev: fmt$(prevFndVol), after: fmt$(afterFndVol) });
                      }
                      if (prev.app_date !== undefined && prev.app_date !== row.event_date && row.event_type !== "funded") {
                        diffs.push({ label: "App Date",      prev: prev.app_date ?? "—", after: row.event_date ?? "—" });
                      }
                      if (prev.funded_date !== undefined && prev.funded_date !== row.event_date && row.event_type === "funded") {
                        diffs.push({ label: "Funded Date",   prev: prev.funded_date ?? "—", after: row.event_date ?? "—" });
                      }
                      if (prev.event_type && prev.event_type !== row.event_type) {
                        diffs.push({ label: "Event Type",    prev: prev.event_type, after: row.event_type ?? "—" });
                      }

                      if (diffs.length === 0) return null;

                      return (
                        <div style={{ padding: "12px 16px", borderRadius: 10, background: "#eff6ff", border: "1px solid #93c5fd", marginBottom: 12 }}>
                          <p style={{ margin: "0 0 10px", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: "#1d4ed8" }}>Changes — Before → After</p>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 8 }}>
                            {diffs.map(c => (
                              <div key={c.label} style={{ background: "#fff", borderRadius: 8, padding: "8px 12px", border: "1px solid #bfdbfe" }}>
                                <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: "#57606a" }}>{c.label}</p>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "#1f2328" }}>
                                  <span style={{ color: "#dc2626" }}>{c.prev}</span>
                                  <span style={{ margin: "0 8px", color: "#57606a" }}>→</span>
                                  <span style={{ color: "#16a34a" }}>{c.after}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      <div>
                        <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted }}>Raw Payload</p>
                        <pre style={{ margin: 0, padding: "12px 14px", borderRadius: 10, background: C.navy, color: "#7dd3fc", fontSize: 11, overflowX: "auto", lineHeight: 1.6, maxHeight: 260, overflowY: "auto" }}>
                          {JSON.stringify(row.raw_payload, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted }}>Response</p>
                        <pre style={{ margin: 0, padding: "12px 14px", borderRadius: 10, background: C.navy, color: "#86efac", fontSize: 11, overflowX: "auto", lineHeight: 1.6, maxHeight: 260, overflowY: "auto" }}>
                          {JSON.stringify(row.response_body, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @media (max-width:700px) { .wl-summary { grid-template-columns:repeat(3,1fr)!important; } }
        @media (max-width:500px) { .wl-summary { grid-template-columns:repeat(2,1fr)!important; } .wl-detail-grid { grid-template-columns:1fr!important; } }
      `}</style>
    </div>
  );
}
