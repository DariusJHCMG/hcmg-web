"use client";

import { useState, useEffect } from "react";
import type { GoalMonth } from "@/lib/database.types";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
  green: "#16a34a", red: "#dc2626",
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

function calcHarry(fundedVol: number, avgLoan: number, convRate: number) {
  if (fundedVol <= 0 || avgLoan <= 0 || convRate <= 0) {
    return { fundedLoanGoal: 0, appUnitsGoal: 0, appVolGoal: 0 };
  }
  const fundedLoanGoal = Math.ceil(fundedVol / avgLoan);
  const appUnitsGoal   = Math.ceil(fundedLoanGoal / (convRate / 100));
  const appVolGoal     = appUnitsGoal * avgLoan;
  return { fundedLoanGoal, appUnitsGoal, appVolGoal };
}

type LORow = {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  nmls: string | null;
};

function Avatar({ name, url }: { name: string; url?: string | null }) {
  return url
    ? <img src={url} alt={name} style={{ width:30, height:30, borderRadius:"50%", objectFit:"cover", flexShrink:0, border:`2px solid ${C.line}` }} />
    : <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,#FF9847,${C.orange})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#fff", flexShrink:0 }}>
        {name.trim().split(/\s+/).map(n=>n[0]).slice(0,2).join("").toUpperCase()}
      </div>;
}

interface Props {
  goal: GoalMonth;
  onSaved: (updated: { funded_volume_goal: number; funded_units_goal: number }) => void;
  onCancel: () => void;
}

export function GoalEditForm({ goal, onSaved, onCancel }: Props) {
  // Pre-populate from existing goal
  const [fundedVol, setFundedVol] = useState(String(Number(goal.funded_volume_goal) || ""));
  const [avgLoan,   setAvgLoan]   = useState("350000");
  const [convRate,  setConvRate]  = useState("60");
  const [cloMsg,    setCloMsg]    = useState(goal.clo_message ?? "");
  const [start,     setStart]     = useState(goal.start_date.slice(0, 10));
  const [end,       setEnd]       = useState(goal.end_date.slice(0, 10));
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // Assignee picker
  const [allLOs,     setAllLOs]     = useState<LORow[]>([]);
  const [losLoading, setLosLoading] = useState(true);
  const [assigned,   setAssigned]   = useState<Set<string>>(new Set());
  const [loSearch,   setLoSearch]   = useState("");

  // Load all LOs + existing assignees in parallel
  useEffect(() => {
    Promise.all([
      fetch("/api/goal-engine/profiles-list").then(r => r.ok ? r.json() : { profiles: [] }),
      fetch(`/api/goal-engine/goal-assignments?goal_month_id=${goal.id}`).then(r => r.ok ? r.json() : { assignments: [] }),
    ]).then(([profilesData, assignData]) => {
      const profiles: LORow[] = profilesData.profiles ?? [];
      setAllLOs(profiles);
      const existingIds = new Set<string>(
        (assignData.assignments ?? []).map((a: { profile_id: string }) => a.profile_id)
      );
      // If no assignments exist yet (placeholder stub), default to all selected
      setAssigned(existingIds.size > 0 ? existingIds : new Set(profiles.map(p => p.id)));
    }).catch(() => {}).finally(() => setLosLoading(false));
  }, [goal.id]);

  // HARRY AI derived values
  const fv    = Number(fundedVol) || 0;
  const al    = Number(avgLoan)   || 350_000;
  const cr    = Number(convRate)  || 60;
  const harry = calcHarry(fv, al, cr);

  const filteredLOs = allLOs.filter(lo =>
    lo.full_name.toLowerCase().includes(loSearch.toLowerCase()) ||
    lo.email.toLowerCase().includes(loSearch.toLowerCase())
  );

  function toggleLO(id: string) {
    setAssigned(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  function addAll()   { setAssigned(new Set(allLOs.map(lo => lo.id))); }
  function clearAll() { setAssigned(new Set()); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      // 1. Update goal fields
      const goalBody = {
        funded_volume_goal: fv,
        funded_units_goal:  harry.fundedLoanGoal  || Number(goal.funded_units_goal),
        app_volume_goal:    harry.appVolGoal       || Number(goal.app_volume_goal),
        app_units_goal:     harry.appUnitsGoal     || Number(goal.app_units_goal),
        clo_message:        cloMsg.trim() || null,
        start_date:         start,
        end_date:           end,
      };
      const res = await fetch(`/api/goal-engine/goals/${goal.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalBody),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setError(d.error ?? "Failed to update goal.");
        return;
      }

      // 2. Replace assignees
      const aRes = await fetch("/api/goal-engine/goal-assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal_month_id: goal.id, profile_ids: Array.from(assigned) }),
      });
      if (!aRes.ok) {
        const d = await aRes.json().catch(() => ({}));
        setError(`Goal saved but assignments failed: ${d.error ?? "unknown"}`);
        return;
      }

      onSaved({ funded_volume_goal: fv, funded_units_goal: harry.fundedLoanGoal || Number(goal.funded_units_goal) });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: 20, padding: "24px 28px", background: C.sand, borderRadius: 16, border: `1.5px solid ${C.line}` }}>
      <p style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 900, color: C.ink }}>
        Edit Goal — {goal.month_label}
      </p>

      {/* ── Dates ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:20 }}>
        <div><label style={LABEL}>Start Date</label><input type="date" required value={start} onChange={e=>setStart(e.target.value)} style={INPUT} /></div>
        <div><label style={LABEL}>End Date</label><input type="date" required value={end} onChange={e=>setEnd(e.target.value)} style={INPUT} /></div>
      </div>

      {/* ── HARRY AI inputs ── */}
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
            <input type="number" required min={0} placeholder="e.g. 20000000" value={fundedVol} onChange={e=>setFundedVol(e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>Average Loan Amount ($)</label>
            <input type="number" min={50000} placeholder="e.g. 350000" value={avgLoan} onChange={e=>setAvgLoan(e.target.value)} style={INPUT} />
          </div>
          <div>
            <label style={LABEL}>App → Funded Conversion (%)</label>
            <input type="number" min={1} max={100} placeholder="e.g. 60" value={convRate} onChange={e=>setConvRate(e.target.value)} style={INPUT} />
          </div>
        </div>
      </div>

      {/* ── HARRY AI output ── */}
      {fv > 0 && (
        <div style={{ marginBottom:20, borderRadius:14, border:"1.5px solid rgba(243,112,33,0.3)", overflow:"hidden" }}>
          <div style={{ background:`linear-gradient(135deg,${C.navy},#1e3a5f)`, padding:"12px 18px", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, fontWeight:900, color:"#fff", letterSpacing:".04em" }}>HARRY AI</span>
            <span style={{ fontSize:9, fontWeight:700, color:"rgba(255,255,255,0.45)", letterSpacing:".12em", textTransform:"uppercase" }}>Forecast & Goal Calculation</span>
          </div>
          <div style={{ background:C.white, padding:"16px 18px" }}>
            {[
              { step:"1", label:"Funded Loan Goal",   formula:`CEILING($${fv.toLocaleString()} ÷ $${al.toLocaleString()})`,     result:`${harry.fundedLoanGoal} funded loans`, note:`Company must fund ${harry.fundedLoanGoal} loans at avg $${al.toLocaleString()}`, color:C.navy },
              { step:"2", label:"Application Goal",   formula:`CEILING(${harry.fundedLoanGoal} ÷ ${cr}%)`,                       result:`${harry.appUnitsGoal} applications`,   note:`At ${cr}% pull-through, need ${harry.appUnitsGoal} apps to fund ${harry.fundedLoanGoal}`, color:C.ink },
              { step:"3", label:"Application Volume", formula:`${harry.appUnitsGoal} × $${al.toLocaleString()}`,                 result:`$${harry.appVolGoal.toLocaleString()}`, note:`Total dollar value of all required applications`, color:C.orange },
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
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", background:C.sand, borderTop:`1px solid ${C.line}` }}>
            {[
              { l:"Funded Goal",  v:`$${fv >= 1_000_000 ? (fv/1_000_000).toFixed(1)+"M" : Math.round(fv/1_000)+"K"}`, dark:true },
              { l:"Funded Loans", v:`${harry.fundedLoanGoal}` },
              { l:"App Goal",     v:`${harry.appUnitsGoal} apps`, accent:true },
              { l:"App Volume",   v:`$${harry.appVolGoal >= 1_000_000 ? (harry.appVolGoal/1_000_000).toFixed(1)+"M" : Math.round(harry.appVolGoal/1_000)+"K"}` },
            ].map(s => (
              <div key={s.l} style={{ padding:"12px 14px", background: s.dark ? C.navy : s.accent ? "rgba(243,112,33,0.07)" : "transparent", borderRight:`1px solid ${C.line}` }}>
                <p style={{ margin:"0 0 3px", fontSize:8, fontWeight:800, letterSpacing:".14em", textTransform:"uppercase", color: s.dark ? "rgba(255,255,255,0.45)" : C.muted }}>{s.l}</p>
                <p style={{ margin:0, fontSize:15, fontWeight:900, color: s.dark ? "#fff" : s.accent ? C.orange : C.navy }}>{s.v}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Leadership message ── */}
      <div style={{ marginBottom:20 }}>
        <label style={LABEL}>Message from Leadership</label>
        <textarea rows={3} value={cloMsg} onChange={e=>setCloMsg(e.target.value)}
          placeholder="e.g. This month we're attacking purchases and DSCR. Let's all own a piece of this goal."
          style={{ ...INPUT, resize:"none" }} />
      </div>

      {/* ── Assignees picker ── */}
      <div style={{ marginBottom:20, border:`1.5px solid ${C.line}`, borderRadius:14, overflow:"hidden" }}>
        <div style={{ padding:"14px 18px", background:C.sand, borderBottom:`1px solid ${C.line}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:10 }}>
          <div>
            <p style={{ margin:0, fontSize:13, fontWeight:800, color:C.ink }}>
              👥 Assignees
              {assigned.size > 0 && (
                <span style={{ marginLeft:8, padding:"2px 10px", borderRadius:99, background:`linear-gradient(135deg,#FF9847,${C.orange})`, color:"#fff", fontSize:11, fontWeight:800 }}>
                  {assigned.size} selected
                </span>
              )}
            </p>
            <p style={{ margin:"2px 0 0", fontSize:11, color:C.muted }}>
              Only these LOs receive the announcement email and count toward participation %.
            </p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button type="button" onClick={addAll} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${C.line}`, background:`linear-gradient(135deg,#FF9847,${C.orange})`, color:"#fff", fontSize:11, fontWeight:800, cursor:"pointer", fontFamily:"inherit" }}>
              + Add All
            </button>
            <button type="button" onClick={clearAll} style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${C.line}`, background:C.white, color:C.muted, fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
              Clear All
            </button>
          </div>
        </div>
        <div style={{ padding:"10px 14px", borderBottom:`1px solid ${C.line}`, background:C.white }}>
          <input
            type="text"
            placeholder="Search by name or email…"
            value={loSearch}
            onChange={e => setLoSearch(e.target.value)}
            style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:`1.5px solid ${C.line}`, background:C.sand, fontSize:13, color:C.ink, fontFamily:"inherit", outline:"none", boxSizing:"border-box" as const }}
          />
        </div>
        <div style={{ maxHeight:280, overflowY:"auto", background:C.white }}>
          {losLoading ? (
            <p style={{ padding:"20px", textAlign:"center", fontSize:13, color:C.muted }}>Loading team members…</p>
          ) : filteredLOs.length === 0 ? (
            <p style={{ padding:"20px", textAlign:"center", fontSize:13, color:C.muted }}>
              {loSearch ? `No results for "${loSearch}"` : "No active loan officers found."}
            </p>
          ) : filteredLOs.map(lo => {
            const checked = assigned.has(lo.id);
            return (
              <label key={lo.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", borderBottom:`1px solid ${C.line}`, cursor:"pointer", background: checked ? "rgba(243,112,33,0.04)" : C.white }}>
                <input type="checkbox" checked={checked} onChange={() => toggleLO(lo.id)} style={{ width:16, height:16, accentColor:C.orange, flexShrink:0 }} />
                <Avatar name={lo.full_name} url={lo.avatar_url} />
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:13, fontWeight:800, color: checked ? C.orange : C.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                    {lo.full_name}
                  </p>
                  <p style={{ margin:"1px 0 0", fontSize:11, color:C.muted }}>
                    {lo.email}{lo.nmls ? ` · NMLS# ${lo.nmls}` : ""}
                  </p>
                </div>
                {checked && <span style={{ fontSize:10, fontWeight:800, color:C.orange, flexShrink:0 }}>✓ Assigned</span>}
              </label>
            );
          })}
        </div>
        {!losLoading && allLOs.length > 0 && (
          <div style={{ padding:"10px 16px", borderTop:`1px solid ${C.line}`, background:C.sand, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <p style={{ margin:0, fontSize:11, color:C.muted }}>{assigned.size} of {allLOs.length} LOs assigned</p>
            {assigned.size === 0 && <span style={{ fontSize:11, fontWeight:700, color:"#d97706" }}>⚠ No one assigned</span>}
          </div>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{ marginBottom:16, padding:"12px 16px", borderRadius:10, background:"#fee2e2", border:"1px solid #fca5a5", fontSize:13, color:C.red, fontWeight:600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
        <button type="submit" disabled={loading || fv <= 0} style={{
          padding:"12px 28px", borderRadius:12,
          background: (loading || fv <= 0) ? C.line : "linear-gradient(135deg,#FF9847,#F37021)",
          color: (loading || fv <= 0) ? C.muted : "#fff",
          fontSize:14, fontWeight:800, border:"none",
          cursor: (loading || fv <= 0) ? "not-allowed" : "pointer",
          fontFamily:"inherit", opacity: loading ? 0.7 : 1,
        }}>
          {loading ? "Saving…" : "💾 Save Changes"}
        </button>
        <button type="button" onClick={onCancel} disabled={loading} style={{
          padding:"12px 20px", borderRadius:12,
          background:C.white, color:C.muted,
          border:`1.5px solid ${C.line}`,
          fontSize:14, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
        }}>
          Cancel
        </button>
      </div>
    </form>
  );
}
