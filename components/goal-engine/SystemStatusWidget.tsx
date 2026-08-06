"use client";

/**
 * SystemStatusWidget — Shows live env var presence + DB health for admins.
 * Fetched client-side so it updates without a full page reload.
 */

import { useState, useEffect, useCallback } from "react";

const C = {
  navy:  "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line:   "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
  green: "#16a34a", red: "#dc2626",
};

type EnvCheck = {
  key: string;
  ok: boolean;
  value: string;
  note: string;
};

type StatusData = {
  ok: boolean;
  db: { ok: boolean; error: string | null; tableCounts: Record<string, number> };
  active_goal: { id: string; month_label: string; is_published: boolean } | null;
  email_mode: "live" | "test";
  test_email: string | null;
  env: EnvCheck[];
};

const CRITICAL_KEYS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "RESEND_API_KEY",
  "CRON_SECRET",
  "NEXT_PUBLIC_SITE_URL",
];

export function SystemStatusWidget() {
  const [status,   setStatus]   = useState<StatusData | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/goal-engine/system-status");
      if (r.ok) setStatus(await r.json());
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 16, padding: "20px 24px" }}>
        <p style={{ margin: 0, fontSize: 13, color: C.muted }}>⏳ Checking system status…</p>
      </div>
    );
  }

  if (!status) return null;

  const missingCritical = status.env.filter(e => CRITICAL_KEYS.includes(e.key) && !e.ok);
  const allGood = status.ok && missingCritical.length === 0;

  return (
    <div style={{ background: C.white, border: `1px solid ${C.line}`, borderRadius: 20, overflow: "hidden", marginBottom: 24, boxShadow: "0 1px 6px rgba(15,23,42,0.06)" }}>
      {/* Header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: "18px 24px", cursor: "pointer",
          borderBottom: expanded ? `1px solid ${C.line}` : "none",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: allGood ? "#f0fdf4" : "#fff5f5",
          borderLeft: `4px solid ${allGood ? C.green : C.red}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 18 }}>{allGood ? "✅" : "⚠️"}</span>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: allGood ? "#166534" : "#991b1b" }}>
              {allGood ? "System Status — All Good" : `System Status — ${missingCritical.length} Critical Issue${missingCritical.length > 1 ? "s" : ""}`}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: allGood ? "#166534" : "#991b1b" }}>
              DB: {status.db.ok ? "✅ Connected" : "❌ Error"} ·
              Active Goal: {status.active_goal ? `✅ ${status.active_goal.month_label}` : "⚠ None"} ·
              Email: {status.email_mode === "live" ? "🚀 Live" : `🧪 Test (→ ${status.test_email ?? "?"})`} ·
              {status.db.tableCounts.profiles ?? 0} profiles · {status.db.tableCounts.goal_commitments ?? 0} commitments
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={e => { e.stopPropagation(); load(); }}
            style={{ padding: "5px 12px", borderRadius: 8, border: `1px solid ${C.line}`, background: C.white, fontSize: 11, fontWeight: 700, color: C.muted, cursor: "pointer" }}
          >
            ↻ Refresh
          </button>
          <span style={{ fontSize: 12, color: allGood ? "#166534" : "#991b1b", fontWeight: 700 }}>
            {expanded ? "▲ Collapse" : "▼ Details"}
          </span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={{ padding: "20px 24px" }}>
          {/* DB info */}
          {status.db.error && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
              <p style={{ margin: 0, fontSize: 12, color: C.red, fontWeight: 700 }}>DB Error: {status.db.error}</p>
            </div>
          )}

          {/* Missing critical vars warning */}
          {missingCritical.length > 0 && (
            <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, padding: "12px 16px", marginBottom: 16 }}>
              <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 800, color: C.red }}>
                ❌ Missing Critical Environment Variables
              </p>
              {missingCritical.map(e => (
                <p key={e.key} style={{ margin: "2px 0", fontSize: 11, color: "#991b1b", fontFamily: "monospace" }}>
                  • <strong>{e.key}</strong> — {e.note}
                </p>
              ))}
              <p style={{ margin: "8px 0 0", fontSize: 11, color: "#991b1b" }}>
                Set these in Vercel Dashboard → Project → Settings → Environment Variables
              </p>
            </div>
          )}

          {/* Env var table */}
          <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted }}>
            Environment Variables
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 20 }} className="sys-grid-2">
            {status.env.map(e => (
              <div key={e.key} style={{
                padding: "10px 14px", borderRadius: 10,
                background: e.ok ? "#f0fdf4" : C.sand,
                border: `1px solid ${e.ok ? "#bbf7d0" : C.line}`,
                display: "flex", alignItems: "flex-start", gap: 10,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{e.ok ? "✅" : CRITICAL_KEYS.includes(e.key) ? "❌" : "⚠️"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: e.ok ? "#166534" : C.ink, fontFamily: "monospace" }}>{e.key}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 10, color: C.muted }}>{e.note}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, fontFamily: "monospace", color: e.ok ? C.muted : C.red }}>{e.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Cron schedule reminder */}
          <p style={{ margin: "0 0 10px", fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted }}>
            Cron Schedule (vercel.json)
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { path: "/api/goal-engine/weekly-email",       schedule: "Every Monday 1pm UTC",  note: "Weekly progress email to all committed LOs" },
              { path: "/api/goal-engine/commitment-reminder", schedule: "Daily 2pm UTC",         note: "Reminder to LOs who haven't committed yet" },
              { path: "/api/goal-engine/end-of-month",       schedule: "1st of month 6am UTC",  note: "Close previous month, issue awards, send recaps" },
            ].map(c => (
              <div key={c.path} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "10px 14px", borderRadius: 10, background: C.sand, border: `1px solid ${C.line}` }}>
                <span style={{ fontSize: 12 }}>🕐</span>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 700, fontFamily: "monospace", color: C.navy }}>{c.path}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.orange, fontWeight: 700 }}>{c.schedule}</p>
                  <p style={{ margin: "1px 0 0", fontSize: 11, color: C.muted }}>{c.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width:600px) { .sys-grid-2 { grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}
