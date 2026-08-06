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

// app_volume_goal = funded_volume_goal / 0.60
// app_units_goal  = funded_volume_goal / 350,000
function autoAppGoals(fv: number) {
  return {
    vol:   fv > 0 ? String(Math.round(fv / 0.60)) : "",
    units: fv > 0 ? String(Math.round(fv / 350_000)) : "",
  };
}

export function GoalCreateForm() {
  const currentYear = new Date().getFullYear();
  const [monthNum,  setMonthNum]  = useState(new Date().getMonth() + 1);
  const [year,      setYear]      = useState(currentYear);
  const [fundedVol, setFundedVol] = useState("");
  const [fundedU,   setFundedU]   = useState("");
  const [appVol,    setAppVol]    = useState("");
  const [appU,      setAppU]      = useState("");

  // When funded vol changes, auto-fill app goals
  function handleFundedVolChange(val: string) {
    setFundedVol(val);
    const n = Number(val);
    if (n > 0) {
      const { vol, units } = autoAppGoals(n);
      setAppVol(vol);
      setAppU(units);
    }
  }
  const [cloMsg,    setCloMsg]    = useState("");
  const [start,     setStart]     = useState("");
  const [end,       setEnd]       = useState("");
  const [publish,   setPublish]   = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState<{ success?: boolean; error?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/goal-engine/goals", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          month_label: `${MONTHS[monthNum-1]} ${year}`,
          month_year: year, month_num: monthNum,
          funded_volume_goal: Number(fundedVol)||0,
          funded_units_goal:  Number(fundedU)||0,
          app_volume_goal:    Number(appVol)||0,
          app_units_goal:     Number(appU)||0,
          clo_message:  cloMsg||null,
          awards_enabled:true, start_date:start, end_date:end,
          is_published: publish,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setResult({ error: data.error ?? "Failed to create goal." }); }
      else {
        setResult({ success:true });
        setFundedVol(""); setFundedU(""); setAppVol(""); setAppU(""); setCloMsg(""); setStart(""); setEnd(""); setPublish(false);
      }
    } catch { setResult({ error:"Network error." }); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div><label style={LABEL}>Start Date</label><input type="date" required value={start} onChange={e=>setStart(e.target.value)} style={INPUT} /></div>
        <div><label style={LABEL}>End Date</label><input type="date" required value={end} onChange={e=>setEnd(e.target.value)} style={INPUT} /></div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:8 }}>
        <div><label style={LABEL}>Company Funded Volume ($)</label><input type="number" required min={0} placeholder="e.g. 20000000" value={fundedVol} onChange={e=>handleFundedVolChange(e.target.value)} style={INPUT} /></div>
        <div><label style={LABEL}>Company Funded Units</label><input type="number" required min={0} placeholder="e.g. 60" value={fundedU} onChange={e=>setFundedU(e.target.value)} style={INPUT} /></div>
      </div>

      {/* App goal auto-calc info */}
      {Number(fundedVol) > 0 && (
        <div style={{ marginBottom:20, padding:"10px 14px", borderRadius:10, background:"rgba(243,112,33,0.05)", border:"1px solid rgba(243,112,33,0.2)", fontSize:12, color:C.muted }}>
          📊 <strong style={{ color:C.orange }}>Auto-calculated:</strong>{" "}
          App Volume Goal = ${Number(fundedVol).toLocaleString()} ÷ 0.60 = <strong style={{ color:C.ink }}>${Math.round(Number(fundedVol)/0.60).toLocaleString()}</strong>
          {" · "}App Units Goal = ${Number(fundedVol).toLocaleString()} ÷ 350,000 = <strong style={{ color:C.ink }}>{Math.round(Number(fundedVol)/350_000)} loans</strong>
          <span style={{ marginLeft:8, color:C.muted }}>— editable below</span>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div>
          <label style={LABEL}>App Volume Goal ($)</label>
          <input type="number" min={0} placeholder="Auto-calculated from funded vol ÷ 0.60" value={appVol} onChange={e=>setAppVol(e.target.value)} style={INPUT} />
        </div>
        <div>
          <label style={LABEL}>App Units Goal</label>
          <input type="number" min={0} placeholder="Auto-calculated from funded vol ÷ 350k" value={appU} onChange={e=>setAppU(e.target.value)} style={INPUT} />
        </div>
      </div>

      <div style={{ marginBottom:20 }}>
        <label style={LABEL}>Message from Leadership</label>
        <textarea rows={3} value={cloMsg} onChange={e=>setCloMsg(e.target.value)}
          placeholder="e.g. This month we're attacking purchases and DSCR. Let's all own a piece of this goal."
          style={{ ...INPUT, resize:"none" }} />
      </div>

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

      <button type="submit" disabled={loading} style={{
        padding:"12px 28px", borderRadius:12,
        background: loading ? C.line : "linear-gradient(135deg,#FF9847,#F37021)",
        color: loading ? C.muted : "#fff",
        fontSize:14, fontWeight:800, border:"none",
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily:"inherit",
        opacity: loading ? 0.7 : 1,
      }}>
        {loading ? "Creating…" : publish ? "🚀 Publish & Announce" : "💾 Save as Draft"}
      </button>
    </form>
  );
}
