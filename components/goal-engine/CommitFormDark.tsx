"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const C = { navy:"#142850", orange:"#F37021", ink:"#1A2B42", muted:"#64748B", line:"#E2E8F0", white:"#fff", sand:"#F8FAFC" };

const VOLUMES = [
  { l:"$250,000",   v:250000   }, { l:"$500,000",   v:500000   },
  { l:"$750,000",   v:750000   }, { l:"$1,000,000",  v:1000000  },
  { l:"$1,250,000", v:1250000  }, { l:"$1,500,000",  v:1500000  },
  { l:"$2,000,000", v:2000000  }, { l:"$2,500,000",  v:2500000  },
  { l:"Custom",     v:0        },
];
const CARD: React.CSSProperties = { background:C.white, borderRadius:20, border:`1px solid ${C.line}`, padding:28, boxShadow:"0 2px 12px rgba(15,23,42,0.06)", marginBottom:20 };
const LABEL: React.CSSProperties = { display:"block", marginBottom:8, fontSize:10, fontWeight:800, letterSpacing:".14em", textTransform:"uppercase" as const, color: C.ink };
const INPUT: React.CSSProperties = { width:"100%", padding:"13px 16px", borderRadius:12, border:`2px solid ${C.line}`, background:C.white, fontSize:14, color:C.ink, outline:"none", fontFamily:"Montserrat,system-ui,sans-serif", boxSizing:"border-box" as const };
const TEXTAREA: React.CSSProperties = { ...INPUT, resize:"none" as const };

// HARRY AI Goal Calculation Engine — 3-step formula
//   Step 1. Funded Loan Goal   = CEILING(fundedVol / avgLoan)
//   Step 2. App Units Goal     = CEILING(fundedLoanGoal / conversionRate)
//   Step 3. App Volume Goal    = appUnitsGoal × avgLoan
//
// These are CALCULATED values — LOs cannot edit them.
const AVG_LOAN   = 350_000;   // $350,000 default
const CONV_RATE  = 0.60;      // 60% pull-through default

function calcHarry(fundedVol: number) {
  if (fundedVol <= 0) return { fundedLoanGoal: 0, appUnitsGoal: 0, appVolGoal: 0 };
  const fundedLoanGoal = Math.ceil(fundedVol / AVG_LOAN);
  const appUnitsGoal   = Math.ceil(fundedLoanGoal / CONV_RATE);
  const appVolGoal     = appUnitsGoal * AVG_LOAN;
  return { fundedLoanGoal, appUnitsGoal, appVolGoal };
}

function calcAppGoals(fundedVolumeGoal: number) {
  const { appVolGoal, appUnitsGoal } = calcHarry(fundedVolumeGoal);
  return { appVolGoal, appUnitGoal: appUnitsGoal };
}

interface Props {
  goalMonthId: string; monthLabel: string;
  fundedVolumeGoal: number; fundedUnitsGoal: number;
  existingCommitment?: {
    funded_volume_commitment: number; funded_units_commitment: number;
    app_volume_commitment: number; app_units_commitment: number;
    biggest_focus: string | null; biggest_challenge: string | null;
    confidence_pct: number | null; comments: string | null; locked: boolean;
  } | null;
}

export function CommitFormDark({ goalMonthId, monthLabel, fundedVolumeGoal, fundedUnitsGoal, existingCommitment }: Props) {
  const router = useRouter();
  const locked = existingCommitment?.locked ?? false;

  const [selVol,    setSelVol]    = useState<number|null>(
    existingCommitment?.funded_volume_commitment
      ? (VOLUMES.find(o=>o.v===existingCommitment.funded_volume_commitment)?.v ?? 0) : null
  );
  const [customVol,  setCustomVol]  = useState(existingCommitment?.funded_volume_commitment?.toString() ?? "");
  // App values and units are always derived — never editable by LO
  function autoCalcApp(_vol: number) { /* no-op — values derived at render time from resolvedVol */ }
  const [focus,      setFocus]      = useState(existingCommitment?.biggest_focus ?? "");
  const [challenge,  setChallenge]  = useState(existingCommitment?.biggest_challenge ?? "");
  const [confidence, setConfidence] = useState(existingCommitment?.confidence_pct ?? 80);
  const [comments,   setComments]   = useState(existingCommitment?.comments ?? "");
  const [agreed,     setAgreed]     = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState<string|null>(null);

  const resolvedVol = selVol === 0 ? Number(customVol)||0 : selVol ?? 0;
  const { appVolGoal, appUnitGoal } = calcAppGoals(fundedVolumeGoal);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(null);
    if (!agreed) { setError("You must agree to the digital commitment."); return; }
    if (resolvedVol <= 0) { setError("Please select a funded volume commitment."); return; }
    setLoading(true);
    // All units and app values derived from HARRY AI formula — never user-entered
    const { fundedLoanGoal: submitUnits, appUnitsGoal: submitAppUnits, appVolGoal: submitAppVol } = calcHarry(resolvedVol);
    try {
      const res = await fetch("/api/goal-engine/commit", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ goal_month_id:goalMonthId, funded_volume_commitment:resolvedVol, funded_units_commitment:submitUnits, app_volume_commitment:submitAppVol, app_units_commitment:submitAppUnits, biggest_focus:focus||null, biggest_challenge:challenge||null, confidence_pct:confidence, comments:comments||null, digital_agreement:true }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed."); return; }
      router.push("/goal-engine/dashboard"); router.refresh();
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }

  function Opt({ label, active, onClick }: { label:string; active:boolean; onClick:()=>void }) {
    return (
      <button type="button" onClick={onClick} style={{
        padding:"10px 16px", borderRadius:12, cursor:"pointer", fontFamily:"inherit",
        background: active ? C.orange : C.sand,
        border: active ? `2px solid ${C.orange}` : `2px solid ${C.line}`,
        color: active ? C.white : C.ink,
        fontSize:13, fontWeight:800, transition:"all .12s",
        boxShadow: active ? "0 4px 12px rgba(243,112,33,0.3)" : "none",
      }}>{label}</button>
    );
  }

  if (locked) {
    return (
      <div style={{ ...CARD, textAlign:"center", padding:48 }}>
        <div style={{ fontSize:44, marginBottom:12 }}>🔒</div>
        <h2 style={{ margin:"0 0 8px", fontSize:20, fontWeight:900, color:C.ink }}>Commitment Locked</h2>
        <p style={{ margin:"0 0 20px", fontSize:14, color:C.muted }}>Your {monthLabel} commitment is submitted and locked.</p>
        <div style={{ textAlign:"left", maxWidth:340, margin:"0 auto", fontSize:14, color:C.ink, lineHeight:1.9 }}>
          <p><strong style={{ color:C.orange }}>Volume:</strong> ${existingCommitment!.funded_volume_commitment.toLocaleString()}</p>
          <p><strong style={{ color:C.orange }}>Units:</strong> {existingCommitment!.funded_units_commitment} loans</p>
          {existingCommitment?.biggest_focus && <p><strong style={{ color:C.orange }}>Focus:</strong> {existingCommitment.biggest_focus}</p>}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      {/* Volume */}
      <div style={CARD}>
        <p style={{ ...LABEL }}>Funded Volume Commitment</p>
        <p style={{ margin:"0 0 18px", fontSize:13, color:C.muted }}>How much funded volume are you committing to this month?</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
          {VOLUMES.map(o => (
            <Opt key={o.v} label={o.l} active={selVol===o.v} onClick={()=>{ setSelVol(o.v); if (o.v > 0) autoCalcApp(o.v); }} />
          ))}
        </div>
        {selVol === 0 && (
          <div>
            <label style={LABEL}>Custom Amount ($)</label>
            <input type="number" min={1} placeholder="e.g. 875000" value={customVol} onChange={e=>setCustomVol(e.target.value)} style={INPUT}
              onFocus={e=>e.target.style.borderColor=C.orange}
              onBlur={e=>{ e.target.style.borderColor=C.line; const v=Number(e.target.value); if(v>0) autoCalcApp(v); }} />
          </div>
        )}
        {resolvedVol > 0 && (
          <p style={{ marginTop:12, fontSize:12, color:C.muted }}>
            <strong style={{ color:C.orange }}>${resolvedVol.toLocaleString()}</strong>
            {" "}· {Math.round((resolvedVol/fundedVolumeGoal)*100)}% of company goal
          </p>
        )}
      </div>

      {/* Units — auto-calculated, read-only */}
      {resolvedVol > 0 && (() => {
        const autoUnits = calcHarry(resolvedVol).fundedLoanGoal;
        return (
          <div style={{ ...CARD, background: "#F8FAFC", border: `1px solid ${C.line}` }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <p style={LABEL}>Funded Units — Loans to Close</p>
                <p style={{ margin:0, fontSize:13, color:C.muted }}>Auto-calculated from your volume commitment · read-only</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ margin:0, fontSize:28, fontWeight:900, color:C.navy }}>{autoUnits}</p>
                <p style={{ margin:"2px 0 0", fontSize:11, color:C.muted }}>loans · {Math.round((autoUnits/fundedUnitsGoal)*100)}% of company unit goal</p>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Applications — HARRY AI calculated, read-only */}
      {resolvedVol > 0 && (() => {
        const { fundedLoanGoal, appUnitsGoal, appVolGoal: myAppVol } = calcHarry(resolvedVol);
        const { appVolGoal: coAppVol, appUnitGoal: coAppUnits } = calcAppGoals(fundedVolumeGoal);
        return (
          <div style={CARD}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,#FF9847,${C.orange})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:900, color:"#fff", flexShrink:0 }}>H</div>
              <div>
                <p style={{ margin:0, fontSize:13, fontWeight:900, color:C.navy }}>HARRY AI Application Goals</p>
                <p style={{ margin:0, fontSize:10, color:C.muted }}>Auto-calculated · read-only · based on your funded commitment</p>
              </div>
            </div>

            {/* 3-step formula breakdown */}
            <div style={{ marginBottom:16, padding:"14px 16px", borderRadius:12, background:"rgba(243,112,33,0.05)", border:"1px solid rgba(243,112,33,0.18)" }}>
              <p style={{ margin:"0 0 10px", fontSize:9, fontWeight:800, letterSpacing:".14em", textTransform:"uppercase", color:C.orange }}>
                HARRY AI Calculation Engine
              </p>
              {[
                {
                  step: "1",
                  label: "Funded Loan Goal",
                  formula: `CEILING($${resolvedVol.toLocaleString()} ÷ $${AVG_LOAN.toLocaleString()})`,
                  result: `${fundedLoanGoal} loans`,
                  color: C.navy,
                },
                {
                  step: "2",
                  label: "Application Goal",
                  formula: `CEILING(${fundedLoanGoal} ÷ ${(CONV_RATE * 100).toFixed(0)}%)`,
                  result: `${appUnitsGoal} applications`,
                  color: C.ink,
                },
                {
                  step: "3",
                  label: "Application Volume Goal",
                  formula: `${appUnitsGoal} × $${AVG_LOAN.toLocaleString()}`,
                  result: `$${myAppVol.toLocaleString()}`,
                  color: C.orange,
                },
              ].map(s => (
                <div key={s.step} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8, padding:"8px 0", borderBottom:`1px solid rgba(243,112,33,0.1)` }}>
                  <div style={{ width:22, height:22, borderRadius:"50%", background:s.color, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:900, color:"#fff", flexShrink:0 }}>
                    {s.step}
                  </div>
                  <div style={{ flex:1 }}>
                    <p style={{ margin:0, fontSize:10, fontWeight:800, color:C.muted, letterSpacing:".08em" }}>{s.label}</p>
                    <p style={{ margin:"1px 0 0", fontSize:11, color:C.ink, fontFamily:"monospace" }}>{s.formula}</p>
                  </div>
                  <p style={{ margin:0, fontSize:14, fontWeight:900, color:s.color, flexShrink:0 }}>{s.result}</p>
                </div>
              ))}
              <p style={{ margin:"8px 0 0", fontSize:10, color:C.muted, lineHeight:1.6 }}>
                Avg loan: ${AVG_LOAN.toLocaleString()} · Conversion rate: {(CONV_RATE * 100).toFixed(0)}%
              </p>
            </div>

            {/* Read-only result cards */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:12 }}>
              {[
                { l:"Your Funded Loans", v:`${fundedLoanGoal}`, sub:"loans to fund" },
                { l:"Your App Goal",     v:`${appUnitsGoal}`,   sub:"applications needed", accent:true },
                { l:"Your App Volume",   v:`$${myAppVol >= 1_000_000 ? (myAppVol/1_000_000).toFixed(1)+"M" : Math.round(myAppVol/1_000)+"K"}`, sub:"total app volume" },
              ].map(s => (
                <div key={s.l} style={{ padding:"12px 14px", borderRadius:12, background: s.accent ? C.navy : C.sand, border:`1px solid ${s.accent ? "transparent" : C.line}` }}>
                  <p style={{ margin:"0 0 4px", fontSize:9, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color: s.accent ? "rgba(255,255,255,0.5)" : C.muted }}>{s.l}</p>
                  <p style={{ margin:0, fontSize:18, fontWeight:900, color: s.accent ? "#fff" : C.navy, lineHeight:1 }}>{s.v}</p>
                  <p style={{ margin:"3px 0 0", fontSize:9, color: s.accent ? "rgba(255,255,255,0.4)" : C.muted }}>{s.sub}</p>
                </div>
              ))}
            </div>

            {/* Company reference row */}
            <div style={{ display:"flex", gap:10, padding:"10px 14px", borderRadius:10, background:C.sand, border:`1px solid ${C.line}` }}>
              <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>Company goals for reference:</span>
              <span style={{ fontSize:11, fontWeight:800, color:C.ink }}>App Vol: ${coAppVol >= 1_000_000 ? (coAppVol/1_000_000).toFixed(1)+"M" : Math.round(coAppVol/1_000)+"K"}</span>
              <span style={{ fontSize:11, color:C.muted }}>·</span>
              <span style={{ fontSize:11, fontWeight:800, color:C.ink }}>App Units: {coAppUnits}</span>
              <span style={{ fontSize:11, color:C.muted }}>·</span>
              <span style={{ fontSize:11, color:C.muted }}>Your share: {fundedVolumeGoal > 0 ? Math.round((resolvedVol/fundedVolumeGoal)*100) : 0}%</span>
            </div>

            {/* Lock notice */}
            <div style={{ marginTop:12, display:"flex", alignItems:"center", gap:6 }}>
              <span style={{ fontSize:12 }}>🔒</span>
              <p style={{ margin:0, fontSize:11, color:C.muted, lineHeight:1.5 }}>
                Application goals are calculated by HARRY AI and cannot be edited. They update automatically when you change your funded commitment above.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Strategy */}
      <div style={CARD}>
        <div style={{ marginBottom:24 }}>
          <p style={LABEL}>What are you going to do differently this month?</p>
          <textarea rows={3} value={focus} onChange={e=>setFocus(e.target.value)}
            placeholder="e.g. Doubling down on realtor referrals and following up every pre-approval within 24h..."
            style={TEXTAREA} onFocus={e=>e.target.style.borderColor=C.orange} onBlur={e=>e.target.style.borderColor=C.line} />
        </div>
        <div style={{ marginBottom:24 }}>
          <p style={LABEL}>What obstacles could prevent you from reaching this goal?</p>
          <textarea rows={3} value={challenge} onChange={e=>setChallenge(e.target.value)}
            placeholder="e.g. Rate volatility, limited purchase inventory..."
            style={TEXTAREA} onFocus={e=>e.target.style.borderColor=C.orange} onBlur={e=>e.target.style.borderColor=C.line} />
        </div>
        <div style={{ marginBottom:24 }}>
          <p style={{ ...LABEL, marginBottom:14 }}>Confidence Level</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
            {[50,60,70,80,90,100].map(p => <Opt key={p} label={`${p}%`} active={confidence===p} onClick={()=>setConfidence(p)} />)}
          </div>
        </div>
        <div>
          <label style={LABEL}>Additional Comments <span style={{ fontWeight:400, textTransform:"none", letterSpacing:0, color:C.muted }}>(optional)</span></label>
          <textarea rows={2} value={comments} onChange={e=>setComments(e.target.value)}
            placeholder="Anything else leadership should know..." style={TEXTAREA}
            onFocus={e=>e.target.style.borderColor=C.orange} onBlur={e=>e.target.style.borderColor=C.line} />
        </div>
      </div>

      {/* Agreement */}
      <div style={{ ...CARD, background: agreed ? "#f0fdf4" : C.white, border: agreed ? "2px solid #86efac" : `2px solid ${C.line}` }}>
        <label style={{ display:"flex", gap:16, cursor:"pointer", alignItems:"flex-start" }}>
          <input type="checkbox" checked={agreed} onChange={e=>setAgreed(e.target.checked)}
            style={{ width:20, height:20, marginTop:2, flexShrink:0, accentColor:"#16a34a" }} />
          <div>
            <p style={{ margin:"0 0 6px", fontSize:15, fontWeight:800, color:C.ink }}>
              I commit to doing everything possible to hit this goal.
            </p>
            <p style={{ margin:0, fontSize:13, color:C.muted, lineHeight:1.7 }}>
              By checking this box, I digitally sign my {monthLabel} commitment to Harris Capital Mortgage Group.
              This is permanent and visible to leadership.
            </p>
          </div>
        </label>
      </div>

      {error && (
        <div style={{ marginBottom:16, padding:"13px 18px", borderRadius:12, background:"#FFF5F5", border:"1.5px solid #FECACA", fontSize:13, color:"#DC2626", fontWeight:700 }}>
          ⚠️ {error}
        </div>
      )}

      <button type="submit" disabled={loading||!agreed} style={{
        width:"100%", padding:"17px 24px", borderRadius:16, border:"none",
        background: (loading||!agreed) ? "#CBD5E1" : "linear-gradient(135deg,#FF9847,#F37021,#C45213)",
        color:"#fff", fontSize:16, fontWeight:900,
        cursor:(loading||!agreed)?"not-allowed":"pointer",
        fontFamily:"Montserrat,system-ui,sans-serif",
        boxShadow:(loading||!agreed)?"none":"0 8px 28px rgba(243,112,33,0.4)",
        transition:"all .15s",
      }}>
        {loading ? "Submitting…" : "🥧 Submit My Commitment"}
      </button>
    </form>
  );
}
