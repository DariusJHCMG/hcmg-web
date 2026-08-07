"use client";

/**
 * BackfillButton — Admin tool to manually sync existing ARIVE data
 * for the current month before Zapier was connected.
 *
 * Paste CSV rows: lo_email, loan_id, funded_date, funded_volume
 * Each line = one funded loan. Submit → POSTs to /api/goal-engine/backfill-production
 */

import { useState } from "react";

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
  green: "#16a34a", greenBg: "#dcfce7", red: "#dc2626", redBg: "#fee2e2",
};

type BackfillRecord = {
  lo_email?: string;
  lo_name?:  string;
  loan_id:   string;
  funded_date?:   string;
  funded_volume?: number;
  app_date?:      string;
  app_volume?:    number;
};

type BackfillResult = {
  goal_month_id: string;
  total:   number;
  created: number;
  updated: number;
  skipped: number;
  errors:  string[];
} | null;

function parseInput(raw: string): BackfillRecord[] {
  const lines = raw.trim().split("\n").filter(l => l.trim());
  const records: BackfillRecord[] = [];

  for (const line of lines) {
    const parts = line.split(",").map(p => p.trim().replace(/^"|"$/g, ""));
    // Expect: lo_email, loan_id, funded_date, funded_volume
    // OR:     lo_name, loan_id, funded_date, funded_volume
    if (parts.length < 2) continue;

    const [col0, col1, col2, col3] = parts;
    const isEmail = col0.includes("@");

    records.push({
      lo_email:      isEmail ? col0 : undefined,
      lo_name:       isEmail ? undefined : col0,
      loan_id:       col1,
      funded_date:   col2 || undefined,
      funded_volume: col3 ? parseFloat(col3.replace(/[$,]/g, "")) || undefined : undefined,
    });
  }
  return records;
}

export function BackfillButton() {
  const [open,    setOpen]    = useState(false);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<BackfillResult>(null);
  const [error,   setError]   = useState<string | null>(null);

  const preview = input.trim() ? parseInput(input) : [];

  async function submit() {
    if (preview.length === 0) return;
    setLoading(true); setResult(null); setError(null);
    try {
      const res = await fetch("/api/goal-engine/backfill-production", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: preview }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed"); }
      else { setResult(data); setInput(""); }
    } catch (e) {
      setError(String(e));
    }
    setLoading(false);
  }

  return (
    <div style={{ background:C.white, border:`1.5px solid #fed7aa`, borderRadius:16, padding:"20px 24px", marginBottom:24 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10 }}>
        <div>
          <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:800, color:"#92400e" }}>
            📥 Backfill Current Month Production
          </p>
          <p style={{ margin:0, fontSize:12, color:"#92400e", lineHeight:1.6 }}>
            Paste loan data from ARIVE for loans that funded before Zapier was connected.
            Each row: <code style={{ background:"#fef9c3", padding:"1px 5px", borderRadius:3 }}>lo_email, loan_id, funded_date, funded_volume</code>
          </p>
        </div>
        <button
          onClick={() => { setOpen(o => !o); setResult(null); setError(null); }}
          style={{
            padding:"8px 18px", borderRadius:10, border:`1px solid #fed7aa`,
            background:"#fffbeb", color:"#92400e",
            fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:"inherit", flexShrink:0,
          }}
        >
          {open ? "▲ Hide" : "▼ Open Backfill Tool"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop:16 }}>
          <div style={{ marginBottom:10, padding:"10px 14px", background:C.sand, borderRadius:8, border:`1px solid ${C.line}` }}>
            <p style={{ margin:"0 0 4px", fontSize:11, fontWeight:800, color:C.ink }}>Format (one loan per line):</p>
            <code style={{ fontSize:11, color:C.navy }}>lo_email, loan_id, funded_date, funded_volume</code>
            <br />
            <code style={{ fontSize:11, color:C.muted }}>lamont.harris@hcmgloans.com, 17395396, 2025-08-01, 485000</code>
            <p style={{ margin:"6px 0 0", fontSize:11, color:C.muted }}>
              Dates: YYYY-MM-DD or MM/DD/YYYY. funded_volume in dollars (no $ sign needed).
              You can also use <code>lo_name</code> instead of email in the first column.
            </p>
          </div>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={"lamont.harris@hcmgloans.com, 17395396, 2025-08-01, 485000\naaron.clark@hcmgloans.com, 17395400, 2025-08-02, 620000"}
            rows={8}
            style={{
              width:"100%", padding:"12px 14px", borderRadius:10,
              border:`1.5px solid ${C.line}`, background:C.sand,
              fontSize:12, fontFamily:"'Menlo','Monaco','Consolas',monospace",
              color:C.ink, outline:"none", resize:"vertical",
              boxSizing:"border-box" as const, lineHeight:1.6,
            }}
          />

          {preview.length > 0 && (
            <div style={{ marginTop:8, marginBottom:12, padding:"10px 14px", background:"#f0fdf4", borderRadius:8, border:"1px solid #86efac" }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.green }}>
                ✓ {preview.length} record{preview.length !== 1 ? "s" : ""} ready to backfill
              </p>
              <div style={{ marginTop:6, maxHeight:120, overflowY:"auto" }}>
                {preview.map((r, i) => (
                  <p key={i} style={{ margin:"2px 0", fontSize:11, color:C.muted, fontFamily:"monospace" }}>
                    {r.lo_email || r.lo_name} · {r.loan_id} · {r.funded_date} · ${(r.funded_volume ?? 0).toLocaleString()}
                  </p>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div style={{ marginBottom:12, padding:"10px 14px", background:C.redBg, borderRadius:8, border:"1px solid #fca5a5" }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.red }}>❌ {error}</p>
            </div>
          )}

          {result && (
            <div style={{ marginBottom:12, padding:"12px 16px", background:C.greenBg, borderRadius:8, border:"1px solid #86efac" }}>
              <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:800, color:C.green }}>
                ✅ Backfill complete — {result.total} records processed
              </p>
              <p style={{ margin:0, fontSize:12, color:C.green }}>
                Created: {result.created} · Updated: {result.updated} · Skipped: {result.skipped}
              </p>
              {result.errors.length > 0 && (
                <div style={{ marginTop:8 }}>
                  {result.errors.map((e, i) => (
                    <p key={i} style={{ margin:"2px 0", fontSize:11, color:C.red }}>⚠ {e}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading || preview.length === 0}
            style={{
              padding:"10px 24px", borderRadius:10, border:"none",
              background: preview.length === 0 ? C.line : "linear-gradient(135deg,#FF9847,#F37021)",
              color: preview.length === 0 ? C.muted : "#fff",
              fontSize:13, fontWeight:800,
              cursor: preview.length === 0 ? "not-allowed" : "pointer",
              fontFamily:"inherit",
            }}
          >
            {loading ? "Syncing…" : `📥 Backfill ${preview.length} Record${preview.length !== 1 ? "s" : ""}`}
          </button>
        </div>
      )}
    </div>
  );
}
