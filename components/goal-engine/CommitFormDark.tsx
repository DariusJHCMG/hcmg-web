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
const UNITS = [1,2,3,4,5,6,7,8,10,12,15,20];

const CARD: React.CSSProperties = { background:C.white, borderRadius:20, border:`1px solid ${C.line}`, padding:28, boxShadow:"0 2px 12px rgba(15,23,42,0.06)", marginBottom:20 };
const LABEL: React.CSSProperties = { display:"block", marginBottom:8, fontSize:10, fontWeight:800, letterSpacing:".14em", textTransform:"uppercase" as const, color: C.ink };
const INPUT: React.CSSProperties = { width:"100%", padding:"13px 16px", borderRadius:12, border:`2px solid ${C.line}`, background:C.white, fontSize:14, color:C.ink, outline:"none", fontFamily:"Montserrat,system-ui,sans-serif", boxSizing:"border-box" as const };
const TEXTAREA: React.CSSProperties = { ...INPUT, resize:"none" as const };

// App goal rules:
//   app_volume_goal = funded_volume_goal / 0.60  (apps must be 60% higher than funding goal)
//   app_units_goal  = funded_volume_goal / 350_000
function calcAppGoals(fundedVolumeGoal: number) {
  return {
    appVolGoal:  Math.round(fundedVolumeGoal / 0.60),
    appUnitGoal: Math.round(fundedVolumeGoal / 350_000),
  };
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
  const [units,      setUnits]      = useState(existingCommitment?.funded_units_commitment ?? 3);
  // Auto-calculate app commitments from funded volume commitment
  // app_vol = funded_vol / 0.60, app_units = funded_vol / 350,000
  function autoCalcApp(vol: number) {
    if (vol <= 0) return;
    setAppVol(String(Math.round(vol / 0.60)));
    setAppUnits(Math.round(vol / 350_000));
  }

  const [appVol,     setAppVol]     = useState(existingCommitment?.app_volume_commitment
    ? existingCommitment.app_volume_commitment.toString()
    : existingCommitment?.funded_volume_commitment ? String(Math.round(existingCommitment.funded_volume_commitment / 0.60)) : "");
  const [appUnits,   setAppUnits]   = useState(existingCommitment?.app_units_commitment
    ? existingCommitment.app_units_commitment
    : existingCommitment?.funded_volume_commitment ? Math.round(existingCommitment.funded_volume_commitment / 350_000) : 0);
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
    try {
      const res = await fetch("/api/goal-engine/commit", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ goal_month_id:goalMonthId, funded_volume_commitment:resolvedVol, funded_units_commitment:units, app_volume_commitment:Number(appVol)||0, app_units_commitment:appUnits, biggest_focus:focus||null, biggest_challenge:challenge||null, confidence_pct:confidence, comments:comments||null, digital_agreement:true }),
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

      {/* Units */}
      <div style={CARD}>
        <p style={LABEL}>Funded Units — How many loans?</p>
        <p style={{ margin:"0 0 18px", fontSize:13, color:C.muted }}>How many loans are you committing to fund?</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {UNITS.map(u => <Opt key={u} label={u.toString()} active={units===u} onClick={()=>setUnits(u)} />)}
        </div>
        {units > 0 && <p style={{ marginTop:12, fontSize:12, color:C.muted }}>{units} loans = {Math.round((units/fundedUnitsGoal)*100)}% of company unit goal</p>}
      </div>

      {/* Applications — auto-calculated, editable */}
      <div style={CARD}>
        <p style={LABEL}>Application Commitment</p>

        {/* Auto-calc notice — shows when funded vol is selected */}
        {resolvedVol > 0 && (
          <div style={{ marginBottom:16, padding:"10px 14px", borderRadius:10, background:"rgba(243,112,33,0.06)", border:"1px solid rgba(243,112,33,0.2)" }}>
            <p style={{ margin:"0 0 4px", fontSize:11, fontWeight:800, color:C.orange, textTransform:"uppercase", letterSpacing:".1em" }}>Auto-calculated from your funded commitment</p>
            <p style={{ margin:0, fontSize:12, color:C.muted, lineHeight:1.7 }}>
              App Vol = ${resolvedVol.toLocaleString()} ÷ 0.60 = <strong style={{ color:C.ink }}>${Math.round(resolvedVol/0.60).toLocaleString()}</strong>
              <span style={{ margin:"0 10px", color:C.line }}>|</span>
              App Units = ${resolvedVol.toLocaleString()} ÷ 350,000 = <strong style={{ color:C.ink }}>{Math.round(resolvedVol/350_000)} loans</strong>
              <span style={{ marginLeft:8, color:C.muted }}>— editable below</span>
            </p>
          </div>
        )}

        {/* Company app goals for reference */}
        <div style={{ marginBottom:16, display:"flex", gap:16 }}>
          <div style={{ flex:1, padding:"10px 14px", borderRadius:10, background:C.sand, border:`1px solid ${C.line}` }}>
            <p style={{ margin:"0 0 2px", fontSize:9, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:C.muted }}>Company App Vol Goal</p>
            <p style={{ margin:0, fontSize:16, fontWeight:900, color:C.navy }}>${appVolGoal.toLocaleString()}</p>
            <p style={{ margin:"2px 0 0", fontSize:10, color:C.muted }}>${fundedVolumeGoal.toLocaleString()} ÷ 0.60</p>
          </div>
          <div style={{ flex:1, padding:"10px 14px", borderRadius:10, background:C.sand, border:`1px solid ${C.line}` }}>
            <p style={{ margin:"0 0 2px", fontSize:9, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:C.muted }}>Company App Unit Goal</p>
            <p style={{ margin:0, fontSize:16, fontWeight:900, color:C.navy }}>{appUnitGoal} loans</p>
            <p style={{ margin:"2px 0 0", fontSize:10, color:C.muted }}>${fundedVolumeGoal.toLocaleString()} ÷ 350,000</p>
          </div>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <div>
            <label style={LABEL}>Your App Volume ($)</label>
            <input type="number" min={0} value={appVol}
              onChange={e=>setAppVol(e.target.value)}
              placeholder={resolvedVol > 0 ? String(Math.round(resolvedVol/0.60)) : "e.g. 1666000"}
              style={INPUT}
              onFocus={e=>e.target.style.borderColor=C.orange}
              onBlur={e=>e.target.style.borderColor=C.line} />
            {appVol && appVolGoal > 0 && (
              <p style={{ margin:"6px 0 0", fontSize:11, color:C.muted }}>
                {Math.round((Number(appVol)/appVolGoal)*100)}% of company app vol goal
              </p>
            )}
          </div>
          <div>
            <label style={LABEL}>Your App Units</label>
            <input type="number" min={0} value={appUnits||""}
              onChange={e=>setAppUnits(Number(e.target.value))}
              placeholder={resolvedVol > 0 ? String(Math.round(resolvedVol/350_000)) : "e.g. 3"}
              style={INPUT}
              onFocus={e=>e.target.style.borderColor=C.orange}
              onBlur={e=>e.target.style.borderColor=C.line} />
            {appUnits > 0 && appUnitGoal > 0 && (
              <p style={{ margin:"6px 0 0", fontSize:11, color:C.muted }}>
                {Math.round((appUnits/appUnitGoal)*100)}% of company app unit goal
              </p>
            )}
          </div>
        </div>
      </div>

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
