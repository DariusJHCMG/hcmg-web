"use client";

import { useState } from "react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const INPUT: React.CSSProperties = {
  width:"100%", padding:"12px 16px", borderRadius:12,
  border:"1.5px solid rgba(255,255,255,0.1)",
  background:"rgba(255,255,255,0.06)", color:"#fff",
  fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box",
};
const LABEL: React.CSSProperties = {
  display:"block", marginBottom:7,
  fontSize:10, fontWeight:700, letterSpacing:"0.15em",
  textTransform:"uppercase", color:"rgba(255,255,255,0.4)",
};

export function GoalCreateFormDark() {
  const currentYear = new Date().getFullYear();
  const [monthNum,  setMonthNum]  = useState(new Date().getMonth() + 1);
  const [year,      setYear]      = useState(currentYear);
  const [fundedVol, setFundedVol] = useState("");
  const [fundedU,   setFundedU]   = useState("");
  const [appVol,    setAppVol]    = useState("");
  const [appU,      setAppU]      = useState("");
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
          <select value={monthNum} onChange={e=>setMonthNum(Number(e.target.value))} style={{ ...INPUT }}>
            {MONTHS.map((m,i) => <option key={m} value={i+1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label style={LABEL}>Year</label>
          <input type="number" min={2020} max={2040} value={year} onChange={e=>setYear(Number(e.target.value))} style={INPUT} />
        </div>
        <div>
          <label style={{ ...LABEL, opacity:0 }}>Preview</label>
          <div style={{ height:44, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)", borderRadius:12, display:"flex", alignItems:"center", padding:"0 16px" }}>
            <span style={{ fontSize:13, fontWeight:800, color:"#F37021" }}>{MONTHS[monthNum-1]} {year}</span>
          </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div><label style={LABEL}>Start Date</label><input type="date" required value={start} onChange={e=>setStart(e.target.value)} style={INPUT} /></div>
        <div><label style={LABEL}>End Date</label><input type="date" required value={end} onChange={e=>setEnd(e.target.value)} style={INPUT} /></div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div><label style={LABEL}>Company Funded Volume ($)</label><input type="number" required min={0} placeholder="e.g. 20000000" value={fundedVol} onChange={e=>setFundedVol(e.target.value)} style={INPUT} /></div>
        <div><label style={LABEL}>Company Funded Units</label><input type="number" required min={0} placeholder="e.g. 60" value={fundedU} onChange={e=>setFundedU(e.target.value)} style={INPUT} /></div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div><label style={LABEL}>App Volume Goal ($) <span style={{ opacity:0.5, fontWeight:400 }}>(optional)</span></label><input type="number" min={0} placeholder="e.g. 40000000" value={appVol} onChange={e=>setAppVol(e.target.value)} style={INPUT} /></div>
        <div><label style={LABEL}>App Units Goal <span style={{ opacity:0.5, fontWeight:400 }}>(optional)</span></label><input type="number" min={0} placeholder="e.g. 120" value={appU} onChange={e=>setAppU(e.target.value)} style={INPUT} /></div>
      </div>

      <div style={{ marginBottom:20 }}>
        <label style={LABEL}>Message from Leadership</label>
        <textarea rows={3} value={cloMsg} onChange={e=>setCloMsg(e.target.value)}
          placeholder="e.g. This month we're attacking purchases and DSCR. Let's all own a piece of this goal."
          style={{ ...INPUT, resize:"none" }} />
      </div>

      <div style={{
        padding:"16px 20px", borderRadius:14, marginBottom:20, cursor:"pointer",
        background: publish ? "rgba(243,112,33,0.08)" : "rgba(255,255,255,0.03)",
        border: publish ? "1.5px solid rgba(243,112,33,0.3)" : "1.5px solid rgba(255,255,255,0.08)",
      }}>
        <label style={{ display:"flex", gap:14, cursor:"pointer", alignItems:"flex-start" }}>
          <input type="checkbox" checked={publish} onChange={e=>setPublish(e.target.checked)} style={{ width:16, height:16, marginTop:2, accentColor:"#F37021" }} />
          <div>
            <p style={{ margin:"0 0 3px", fontSize:13, fontWeight:800, color:"#fff" }}>Publish & Send Announcement Emails</p>
            <p style={{ margin:0, fontSize:11, color:"rgba(255,255,255,0.4)", lineHeight:1.5 }}>
              Publishes immediately and emails every active LO the announcement.
            </p>
          </div>
        </label>
      </div>

      {result?.success && (
        <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:12, background:"rgba(34,197,94,0.1)", border:"1px solid rgba(34,197,94,0.25)", fontSize:13, color:"#4ade80" }}>
          ✅ Goal {publish ? "published and emails sent" : "saved as draft"} successfully!
        </div>
      )}
      {result?.error && (
        <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:12, background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.25)", fontSize:13, color:"#fca5a5" }}>
          ⚠️ {result.error}
        </div>
      )}

      <button type="submit" disabled={loading} style={{
        padding:"13px 28px", borderRadius:12,
        background: loading ? "rgba(255,255,255,0.1)" : "linear-gradient(135deg,#FF9847,#F37021)",
        color:"#fff", fontSize:14, fontWeight:800, border:"none",
        cursor: loading ? "not-allowed":"pointer", fontFamily:"inherit",
        opacity: loading ? 0.7 : 1,
      }}>
        {loading ? "Creating…" : publish ? "🚀 Publish & Announce" : "💾 Save as Draft"}
      </button>
    </form>
  );
}
