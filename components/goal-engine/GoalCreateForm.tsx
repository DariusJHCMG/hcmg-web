"use client";

import { useState } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
};

const INPUT: React.CSSProperties = {
  width:"100%", padding:"11px 14px", borderRadius:10,
  border:`1.5px solid ${C.line}`,
  background:C.white, color:C.ink,
  fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box",
};
const LABEL: React.CSSProperties = {
  display:"block", marginBottom:6,
  fontSize:10, fontWeight:700, letterSpacing:"0.15em",
  textTransform:"uppercase", color:C.muted,
};

// ── HARRY AI Goal Calculation Engine — 3-step formula ─────────────
//   Step 1. Funded Loan Goal   = CEILING(fundedVol / avgLoan)
//   Step 2. App Units Goal     = CEILING(fundedLoanGoal / conversionRate)
//   Step 3. App Volume Goal    = appUnitsGoal × avgLoan
function calcHarry(fundedVol: number, avgLoan: number, convRate: number) {
  if (fundedVol <= 0 || avgLoan <= 0 || convRate <= 0) {
    return { fundedLoanGoal: 0, appUnitsGoal: 0, appVolGoal: 0 };
  }
  const fundedLoanGoal = Math.ceil(fundedVol / avgLoan);
  const appUnitsGoal   = Math.ceil(fundedLoanGoal / (convRate / 100));
  const appVolGoal     = appUnitsGoal * avgLoan;
  return { fundedLoanGoal, appUnitsGoal, appVolGoal };
}

export function GoalCreateForm() {
  const currentYear = new Date().getFullYear();
  const [monthNum,  setMonthNum]  = useState(new Date().getMonth() + 1);
  const [year,      setYear]      = useState(currentYear);
  const [fundedVol, setFundedVol] = useState("");
  const [avgLoan,   setAvgLoan]   = useState("350000");
  const [convRate,  setConvRate]  = useState("60");
  const [cloMsg,    setCloMsg]    = useState("");
  const [start,     setStart]     = useState("");
  const [end,       setEnd]       = useState("");
  const [publish,   setPublish]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<{ success?: boolean; error?: string } | null>(null);

  // Derived HARRY AI values — computed fresh every render, no separate state
  const fv    = Number(fundedVol)  || 0;
  const al    = Number(avgLoan)    || 350_000;
  const cr    = Number(convRate)   || 60;
  const harry = calcHarry(fv, al, cr);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/goal-engine/goals", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          month_label:        `${MONTHS[monthNum-1]} ${year}`,
          month_year:         year,
          month_num:          monthNum,
          funded_volume_goal: fv,
          funded_units_goal:  harry.fundedLoanGoal,
          app_volume_goal:    harry.appVolGoal,
          app_units_goal:     harry.appUnitsGoal,
          clo_message:        cloMsg||null,
          awards_enabled:     true,
          start_date:         start,
          end_date:           end,
          is_published:       publish,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setResult({ error: data.error ?? "Failed to create goal." }); }
      else {
        setResult({ success: true });
        setFundedVol(""); setAvgLoan("350000"); setConvRate("60");
        setCloMsg(""); setStart(""); setEnd(""); setPublish(false);
      }
    } catch { setResult({ error:"Network error." }); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* Month / Year */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginBottom:20 }}>
        <div>
          <label style={LABEL}>Month</label>
          <select value={monthNum} onChange={e=>setMonthNum(Number(e.target.value))} style={INPUT}>
            {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL}>Year</label>
          <input type="number" min={2020} max={2040} value={year} onChange={e=>setYear(Number(e.target.value))} style={INPUT} />
        </div>
        <div>
          <label style={{ ...LABEL, opacity:0 }}>Preview</label>
          <div style={{ height:43, background:C.sand, border:`1px solid ${C.line}`, borderRadius:10, display:"flex", alignItems:"center", padding:"0 14px" }}>
            <span style={{ fontSize:14, fontWeight:800, color:C.orange }}>{MONTHS[monthNum-1]} {year}</span>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div><label style={LABEL}>Start Date</label><input type="date" required value={start} onChange={e=>setStart(e.target.value)} style={INPUT} /></div>
        <div><label style={LABEL}>End Date</label><input type="date" required value={end} onChange={e=>setEnd(e.target.value)} style={INPUT} /></div>
      </div>

      {/* HARRY AI inputs */}
      <div style={{ marginBottom:8, padding:"16px 18px", borderRadius:14, background:"rgba(20,40,80,0.03)", border:`1.5px solid ${C.line}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:`linear-gradient(135deg,#FF9847,${C.orange})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"#fff", flexShrink:0 }}>H</div>
          <div>
            <p style={{ margin:0, fontSize:12, fontWeight:900, color:C.navy }}>HARRY AI Goal Calculation Engine</p>
            <p style={{ margin:0, fontSize:10, color:C.muted }}>All goals auto-calculated from these three inputs</p>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
          <div>
            <label style={LABEL}>Company Funded Volume ($)</label>
            <input type="number" required min={0} placeholder="e.g. 20000000"
              value={fundedVol} onChange={e=>setFundedVol(e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Average Loan Amount ($)</label>
            <input type="number" min={50000} placeholder="e.g. 350000"
              value={avgLoan} onChange={e=>setAvgLoan(e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>App → Funded Conversion (%)</label>
            <input type="number" min={1} max={100} placeholder="e.g. 60"
              value={convRate} onChange={e=>setConvRate(e.target.value)} style={INPUT} />
          </div>
        </div>
      </div>

      {/* HARRY AI 3-step output */}
      {fv > 0 && (
        <div style={{ marginBottom:20, borderRadius:14, border:"1.5px solid rgba(243,112,33,0.3)", overflow:"hidden" }}>
          {/* Header */}
          <div style={{ background:`linear-gradient(135deg,${C.navy},#1e3a5f)`, padding:"12px 18px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, fontWeight:900, color:"#fff", letterSpacing:".04em" }}>HARRY AI</span>
            <span style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.45)", letterSpacing:".12em", textTransform:"uppercase" }}>Forecast & Goal Calculation</span>
          </div>

          {/* 3 steps */}
          <div style={{ background:C.white, padding:"16px 18px" }}>
            {[
              {
                step:"1", label:"Funded Loan Goal",
                formula:`CEILING($${fv.toLocaleString()} ÷ $${al.toLocaleString()})`,
                result:`${harry.fundedLoanGoal} funded loans`,
                note:`Company must fund ${harry.fundedLoanGoal} loans at avg $${al.toLocaleString()}`,
                color:C.navy,
              },
              {
                step:"2", label:"Application Goal",
                formula:`CEILING(${harry.fundedLoanGoal} ÷ ${cr}%)`,
                result:`${harry.appUnitsGoal} applications`,
                note:`At ${cr}% pull-through, need ${harry.appUnitsGoal} apps to fund ${harry.fundedLoanGoal}`,
                color:C.ink,
              },
              {
                step:"3", label:"Application Volume Goal",
                formula:`${harry.appUnitsGoal} × $${al.toLocaleString()}`,
                result:`$${harry.appVolGoal.toLocaleString()}`,
                note:`Total dollar value of all required applications`,
                color:C.orange,
              },
            ].map((s, i, arr) => (
              <div key={s.step} style={{ display:"flex", gap:14, alignItems:"flex-start", paddingBottom: i < arr.length-1 ? 12 : 0, marginBottom: i < arr.length-1 ? 12 : 0, borderBottom: i < arr.length-1 ? `1px solid ${C.line}` : "none" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", flexShrink:0, marginTop:2 }}>{s.step}</div>
                <div style={{ flex:1 }}>
                  <p style={{ margin:"0 0 2px", fontSize:11, fontWeight:800, color:C.muted, letterSpacing:".06em" }}>{s.label}</p>
                  <p style={{ margin:"0 0 2px", fontSize:12, color:C.ink, fontFamily:"monospace" }}>{s.formula}</p>
                  <p style={{ margin:0, fontSize:10, color:C.muted }}>{s.note}</p>
                </div>
                <p style={{ margin:0, fontSize:16, fontWeight:900, color:s.color, flexShrink:0, whiteSpace:"nowrap" as const }}>{s.result}</p>
              </div>
            ))}
          </div>

          {/* Summary result cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", background:C.sand, borderTop:`1px solid ${C.line}` }}>
            {[
              { l:"Funded Goal",    v:`$${fv >= 1_000_000 ? (fv/1_000_000).toFixed(1)+"M" : Math.round(fv/1_000)+"K"}`, dark:true },
              { l:"Funded Loans",  v:`${harry.fundedLoanGoal}` },
              { l:"App Goal",      v:`${harry.appUnitsGoal} apps`, accent:true },
              { l:"App Volume",    v:`$${harry.appVolGoal >= 1_000_000 ? (harry.appVolGoal/1_000_000).toFixed(1)+"M" : Math.round(harry.appVolGoal/1_000)+"K"}` },
            ].map(s => (
              <div key={s.l} style={{ padding:"12px 14px", background: s.dark ? C.navy : s.accent ? "rgba(243,112,33,0.07)" : "transparent", borderRight:`1px solid ${C.line}` }}>
                <p style={{ margin:"0 0 3px", fontSize:8, fontWeight:800, letterSpacing:".14em", textTransform:"uppercase", color: s.dark ? "rgba(255,255,255,0.45)" : C.muted }}>{s.l}</p>
                <p style={{ margin:0, fontSize:15, fontWeight:900, color: s.dark ? "#fff" : s.accent ? C.orange : C.navy }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leadership message */}
      <div style={{ marginBottom:20 }}>
        <label style={LABEL}>Message from Leadership</label>
        <textarea rows={3} value={cloMsg} onChange={e=>setCloMsg(e.target.value)}
          placeholder="e.g. This month we're attacking purchases and DSCR. Let's all own a piece of this goal."
          style={{ ...INPUT, resize:"none" }} />
      </div>

      {/* Publish toggle */}
      <div style={{
        padding:"16px 20px", borderRadius:12, marginBottom:20, cursor:"pointer",
        background: publish ? "rgba(243,112,33,0.06)" : C.sand,
        border: publish ? `1.5px solid rgba(243,112,33,0.35)` : `1.5px solid ${C.line}`,
      }}>
        <label style={{ display:"flex", gap:14, cursor:"pointer", alignItems:"flex-start" }}>
          <input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)} style={{ width:16, height:16, marginTop:2, accentColor:C.orange }} />
          <div>
            <p style={{ margin:"0 0 3px", fontSize:13, fontWeight:800, color:C.ink }}>Publish & Send Announcement Emails</p>
            <p style={{ margin:0, fontSize:11, color:C.muted, lineHeight:1.5 }}>
              Publishes immediately and emails every active LO the announcement.
            </p>
          </div>
        </label>
      </div>

      {result?.success && (
        <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"#dcfce7", border:"1px solid #86efac", fontSize:13, color:"#166534", fontWeight:600 }}>
          ✅ Goal {publish ? "published and emails sent" : "saved as draft"} successfully!
        </div>
      )}
      {result?.error && (
        <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"#fee2e2", border:"1px solid #fca5a5", fontSize:13, color:"#991b1b", fontWeight:600 }}>
          ⚠️ {result.error}
        </div>
      )}

      <button type="submit" disabled={loading || fv <= 0} style={{
        padding:"12px 28px", borderRadius:12,
        background: (loading || fv <= 0) ? C.line : "linear-gradient(135deg,#FF9847,#F37021)",
        color: (loading || fv <= 0) ? C.muted : "#fff",
        fontSize:14, fontWeight:800, border:"none",
        cursor: (loading || fv <= 0) ? "not-allowed" : "pointer",
        fontFamily:"inherit",
        opacity: loading ? 0.7 : 1,
      }}>
        {loading ? "Creating…" : publish ? "🚀 Publish & Announce" : "💾 Save as Draft"}
      </button>
    </form>
  );
}
