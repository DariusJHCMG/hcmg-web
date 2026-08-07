"use client";

/**
 * BackfillButton — Admin tool to manually sync ARIVE data.
 * Accepts raw ARIVE CSV export (paste directly from the file).
 * Auto-detects columns from the ARIVE header row.
 * Supports both funded loans and application pipeline.
 */

import { useState } from "react";

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
  green: "#16a34a", greenBg: "#dcfce7", red: "#dc2626", redBg: "#fee2e2",
  amber: "#d97706", amberBg: "#fffbeb",
};

type BackfillRecord = {
  lo_name?:       string;
  loan_id:        string;
  funded_date?:   string;
  funded_volume?: number;
  app_date?:      string;
  app_volume?:    number;
};

type BackfillResult = {
  goal_month_id: string;
  total: number; created: number; updated: number; skipped: number;
  errors: string[];
} | null;

type Mode = "funded" | "apps";

// ── CSV parser ────────────────────────────────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseARIVECsv(raw: string, mode: Mode): BackfillRecord[] {
  const lines = raw.trim().split("\n").filter(l => l.trim());
  if (lines.length < 2) return [];

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());

  // Column index helpers
  const col = (name: string) => headers.indexOf(name);

  const idxLoanId    = col("arive loan id");
  const idxLoName    = col("primary loan officer name");
  const idxAmount    = col("total loan amount");
  const idxFunded    = col("loan funded");         // funded date
  const idxAppDate   = col("app/trid completed date"); // app date
  const idxStageName = col("stage name");

  // Fallback indices
  const idxAppDate2  = col("purchase date");        // secondary app date fallback

  const records: BackfillRecord[] = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < 2) continue;

    const loanId    = idxLoanId  >= 0 ? row[idxLoanId]?.trim()  : "";
    const loName    = idxLoName  >= 0 ? row[idxLoName]?.trim()  : "";
    const amount    = idxAmount  >= 0 ? parseFloat(row[idxAmount]?.replace(/[$,]/g, "") ?? "0") : 0;
    const fundedDt  = idxFunded  >= 0 ? row[idxFunded]?.trim()  : "";
    const appDt     = idxAppDate >= 0 ? row[idxAppDate]?.trim() : (idxAppDate2 >= 0 ? row[idxAppDate2]?.trim() : "");
    const stage     = idxStageName >= 0 ? row[idxStageName]?.trim() : "";

    if (!loanId) continue;

    // For funded mode: only include rows where Loan Funded date is set OR stage = "Loan Finalized"
    if (mode === "funded") {
      const isFunded = (fundedDt && fundedDt.length > 0) || stage === "Loan Finalized";
      if (!isFunded) continue;
      if (!amount || amount <= 0) continue;
      records.push({
        lo_name:       loName || undefined,
        loan_id:       loanId,
        funded_date:   normDateStr(fundedDt) ?? normDateStr(appDt) ?? undefined,
        funded_volume: amount > 0 ? amount : undefined,
      });
    }

    // For apps mode: include all rows that have an app date or any active stage
    if (mode === "apps") {
      if (!amount || amount <= 0) continue;
      const dateToUse = normDateStr(appDt);
      if (!dateToUse) continue;
      records.push({
        lo_name:    loName || undefined,
        loan_id:    loanId,
        app_date:   dateToUse,
        app_volume: amount > 0 ? amount : undefined,
      });
    }
  }

  return records;
}

function normDateStr(v: string | undefined | null): string | undefined {
  if (!v || v.trim() === "") return undefined;
  const s = v.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2,"0")}-${us[2].padStart(2,"0")}`;
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch { /**/ }
  return undefined;
}

function fmt$(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

// ── Component ─────────────────────────────────────────────────────────
export function BackfillButton() {
  const [open,    setOpen]    = useState(false);
  const [mode,    setMode]    = useState<Mode>("funded");
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState<BackfillResult>(null);
  const [error,   setError]   = useState<string | null>(null);

  const preview = input.trim() ? parseARIVECsv(input, mode) : [];
  const totalVol = preview.reduce((s, r) => s + (r.funded_volume ?? r.app_volume ?? 0), 0);

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
    } catch (e) { setError(String(e)); }
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
            Paste your ARIVE CSV export directly — headers included. Works for both funded loans and applications.
          </p>
        </div>
        <button
          onClick={() => { setOpen(o => !o); setResult(null); setError(null); }}
          style={{ padding:"8px 18px", borderRadius:10, border:`1px solid #fed7aa`, background:C.amberBg, color:"#92400e", fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}
        >
          {open ? "▲ Hide" : "▼ Open Backfill Tool"}
        </button>
      </div>

      {open && (
        <div style={{ marginTop:18 }}>

          {/* Mode tabs */}
          <div style={{ display:"flex", gap:8, marginBottom:16 }}>
            {(["funded", "apps"] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setResult(null); setError(null); }}
                style={{
                  padding:"8px 20px", borderRadius:10, border:"none",
                  background: mode === m ? (m === "funded" ? C.navy : C.orange) : C.sand,
                  color: mode === m ? "#fff" : C.muted,
                  fontSize:12, fontWeight:800, cursor:"pointer", fontFamily:"inherit",
                  borderBottom: mode === m ? "none" : `1.5px solid ${C.line}`,
                }}
              >
                {m === "funded" ? "🏦 Funded Loans" : "📋 Applications"}
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div style={{ marginBottom:12, padding:"12px 16px", background:C.sand, borderRadius:10, border:`1px solid ${C.line}` }}>
            {mode === "funded" ? (
              <p style={{ margin:0, fontSize:12, color:C.muted, lineHeight:1.7 }}>
                <strong style={{ color:C.ink }}>Paste your ARIVE Funded Loans CSV export.</strong><br />
                Rows are included when <code style={{ background:C.line, padding:"1px 4px", borderRadius:3 }}>Loan Funded</code> date is set
                OR <code style={{ background:C.line, padding:"1px 4px", borderRadius:3 }}>Stage Name = "Loan Finalized"</code>.<br />
                LOs are matched by <strong>Primary Loan Officer Name</strong> → your SLICE profile name must match.
              </p>
            ) : (
              <p style={{ margin:0, fontSize:12, color:C.muted, lineHeight:1.7 }}>
                <strong style={{ color:C.ink }}>Paste your ARIVE Applications CSV export.</strong><br />
                All rows with a valid <code style={{ background:C.line, padding:"1px 4px", borderRadius:3 }}>App/TRID Completed Date</code> and a loan amount are included.<br />
                Rows without a date or amount are skipped automatically.
              </p>
            )}
          </div>

          <textarea
            value={input}
            onChange={e => { setInput(e.target.value); setResult(null); setError(null); }}
            placeholder={`Paste ARIVE CSV here (include the header row)...\n\n"Primary Borrower","ARIVE Loan Id","Total Loan Amount","Primary Loan Officer Name","Loan Funded","Stage Name",...\n"John Smith","17181419","348471","Lamont Harris","2026-07-30","Loan Finalized",...`}
            rows={10}
            style={{
              width:"100%", padding:"12px 14px", borderRadius:10,
              border:`1.5px solid ${C.line}`, background:C.sand,
              fontSize:11, fontFamily:"'Menlo','Monaco','Consolas',monospace",
              color:C.ink, outline:"none", resize:"vertical",
              boxSizing:"border-box" as const, lineHeight:1.6,
            }}
          />

          {/* Preview */}
          {preview.length > 0 && (
            <div style={{ marginTop:10, marginBottom:12, background:"#f0fdf4", borderRadius:10, border:"1px solid #86efac", overflow:"hidden" }}>
              <div style={{ padding:"10px 16px", borderBottom:"1px solid #86efac", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <p style={{ margin:0, fontSize:12, fontWeight:800, color:C.green }}>
                  ✓ {preview.length} {mode === "funded" ? "funded loan" : "application"}{preview.length !== 1 ? "s" : ""} detected · {fmt$(totalVol)} total volume
                </p>
              </div>
              <div style={{ maxHeight:180, overflowY:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
                  <thead>
                    <tr style={{ background:"#dcfce7" }}>
                      <th style={{ padding:"6px 12px", textAlign:"left", fontWeight:800, color:C.green }}>LO</th>
                      <th style={{ padding:"6px 12px", textAlign:"left", fontWeight:800, color:C.green }}>Loan ID</th>
                      <th style={{ padding:"6px 12px", textAlign:"left", fontWeight:800, color:C.green }}>Date</th>
                      <th style={{ padding:"6px 12px", textAlign:"right", fontWeight:800, color:C.green }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((r, i) => (
                      <tr key={i} style={{ borderBottom:"1px solid #bbf7d0" }}>
                        <td style={{ padding:"5px 12px", color:C.ink }}>{r.lo_name ?? "—"}</td>
                        <td style={{ padding:"5px 12px", color:C.muted, fontFamily:"monospace" }}>{r.loan_id}</td>
                        <td style={{ padding:"5px 12px", color:C.muted }}>{r.funded_date ?? r.app_date ?? "—"}</td>
                        <td style={{ padding:"5px 12px", textAlign:"right", color:C.ink, fontWeight:700 }}>
                          {fmt$(r.funded_volume ?? r.app_volume ?? 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {input.trim() && preview.length === 0 && (
            <div style={{ marginTop:10, marginBottom:12, padding:"10px 14px", background:"#fffbeb", borderRadius:8, border:"1px solid #fde68a" }}>
              <p style={{ margin:0, fontSize:12, color:C.amber }}>
                ⚠ No {mode === "funded" ? "funded loans" : "applications"} detected.
                {mode === "funded"
                  ? " Make sure the CSV has a 'Loan Funded' date column and rows with Stage Name = 'Loan Finalized'."
                  : " Make sure rows have an 'App/TRID Completed Date' and a 'Total Loan Amount'."}
              </p>
            </div>
          )}

          {error && (
            <div style={{ marginBottom:12, padding:"10px 14px", background:C.redBg, borderRadius:8, border:"1px solid #fca5a5" }}>
              <p style={{ margin:0, fontSize:12, fontWeight:700, color:C.red }}>❌ {error}</p>
            </div>
          )}

          {result && (
            <div style={{ marginBottom:12, padding:"14px 16px", background:C.greenBg, borderRadius:10, border:"1px solid #86efac" }}>
              <p style={{ margin:"0 0 4px", fontSize:13, fontWeight:800, color:C.green }}>
                ✅ Backfill complete — {result.total} records processed
              </p>
              <p style={{ margin:0, fontSize:12, color:C.green }}>
                Created: {result.created} · Updated: {result.updated} · Skipped: {result.skipped}
              </p>
              {result.errors.length > 0 && (
                <div style={{ marginTop:8, padding:"8px 10px", background:"#fee2e2", borderRadius:6 }}>
                  <p style={{ margin:"0 0 4px", fontSize:11, fontWeight:700, color:C.red }}>LOs not matched ({result.errors.length}):</p>
                  {result.errors.map((e, i) => (
                    <p key={i} style={{ margin:"1px 0", fontSize:11, color:C.red, fontFamily:"monospace" }}>⚠ {e}</p>
                  ))}
                  <p style={{ margin:"6px 0 0", fontSize:11, color:C.red }}>
                    Make sure each LO's name in ARIVE matches their SLICE profile name exactly, or set their ARIVE name alias in Team Members.
                  </p>
                </div>
              )}
            </div>
          )}

          <div style={{ display:"flex", gap:10, alignItems:"center", marginTop:4 }}>
            <button
              onClick={submit}
              disabled={loading || preview.length === 0}
              style={{
                padding:"11px 26px", borderRadius:10, border:"none",
                background: preview.length === 0 ? C.line : (mode === "funded" ? "linear-gradient(135deg,#1e3a5f,#142850)" : "linear-gradient(135deg,#FF9847,#F37021)"),
                color: preview.length === 0 ? C.muted : "#fff",
                fontSize:13, fontWeight:800,
                cursor: preview.length === 0 ? "not-allowed" : "pointer",
                fontFamily:"inherit",
              }}
            >
              {loading ? "Syncing…" : `📥 Backfill ${preview.length} ${mode === "funded" ? "Funded Loan" : "Application"}${preview.length !== 1 ? "s" : ""}`}
            </button>
            {preview.length > 0 && (
              <span style={{ fontSize:12, color:C.muted }}>
                {fmt$(totalVol)} total volume
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
