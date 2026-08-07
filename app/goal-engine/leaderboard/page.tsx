/**
 * /goal-engine/leaderboard — SLICE by HCMG · World-class Leaderboard
 */

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getActiveGoal, getLeaderboard, computeGoalSummary, fmt$, fmtPct, daysRemaining } from "@/lib/goal-engine";
import Link from "next/link";

export const dynamic = "force-dynamic";

const C = { navy:"#142850", orange:"#F37021", ink:"#1A2B42", muted:"#64748B", line:"#E2E8F0", white:"#fff", sand:"#F8FAFC" };

function Bar({ pct }: { pct: number }) {
  const c = Math.min(100, Math.max(0, pct));
  const color = pct >= 90 ? "#22c55e" : pct >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ background: C.line, borderRadius:99, overflow:"hidden", height:6 }}>
      <div style={{ height:"100%", width:`${c}%`, background:color, borderRadius:99 }} />
    </div>
  );
}

function PaceTag({ pct }: { pct: number }) {
  const on = pct >= 90, mid = pct >= 70;
  return (
    <span style={{
      padding:"2px 8px", borderRadius:99, fontSize:10, fontWeight:800,
      background: on ? "#dcfce7" : mid ? "#fef9c3" : "#fee2e2",
      color:       on ? "#166534" : mid ? "#854d0e" : "#991b1b",
    }}>
      {on ? "🟢" : mid ? "🟡" : "🔴"} {on ? "On Pace" : mid ? "Behind" : "Off Track"}
    </span>
  );
}

export default async function GoalEngineLeaderboard() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");

  const goal = await getActiveGoal();
  const [board, summary] = await Promise.all([
    goal ? getLeaderboard(goal.id) : [],
    goal ? computeGoalSummary(goal) : null,
  ]);
  const days   = goal ? daysRemaining(goal.end_date) : 0;
  const medals = ["🥇","🥈","🥉"];

  return (
    <div style={{ fontFamily:"Montserrat,system-ui,sans-serif", color: C.ink, maxWidth:1200, margin:"0 auto", padding:"28px 24px 56px" }}>

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <Link href="/goal-engine/dashboard" style={{ fontSize:13, fontWeight:700, color: C.muted, textDecoration:"none" }}>← Dashboard</Link>
        <h1 style={{ margin:"14px 0 0", fontSize:30, fontWeight:900, color: C.ink }}>Leaderboard</h1>
        {goal && <p style={{ margin:"4px 0 0", fontSize:14, color: C.muted }}>{goal.month_label} · {days} days remaining</p>}
      </div>

      {!goal && (
        <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.line}`, padding:"64px 32px", textAlign:"center", boxShadow:"0 2px 12px rgba(15,23,42,0.06)" }}>
          <div style={{ fontSize:52, marginBottom:16 }}>🏆</div>
          <h2 style={{ margin:"0 0 8px", fontSize:22, fontWeight:800, color: C.ink }}>No Active Goal</h2>
          <p style={{ margin:0, fontSize:14, color: C.muted }}>Leaderboard populates once a goal is active.</p>
        </div>
      )}

      {goal && summary && (
        <>
          {/* Summary KPIs */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:16 }} className="ge-grid-4">
            {[
              { l:"Company Goal",    v: fmt$(goal.funded_volume_goal),        dark:true, sub:`${goal.funded_units_goal} loans` },
              { l:"Total Funded",    v: fmt$(summary.totalActualVolume),      sub:`${fmtPct(summary.volumePct)} of goal` },
              { l:"Funded Units",    v: `${summary.totalActualUnits} loans`,  sub:`of ${goal.funded_units_goal} unit goal` },
              { l:"Participation",   v: `${summary.participationCount}/${summary.totalLOs}`, sub:"LOs committed" },
            ].map(s => (
              <div key={s.l} style={{
                background: (s as {dark?:boolean}).dark ? C.navy : C.white,
                borderRadius:18, padding:"20px",
                border: (s as {dark?:boolean}).dark ? "none" : `1px solid ${C.line}`,
                boxShadow: (s as {dark?:boolean}).dark ? "0 8px 32px rgba(20,40,80,0.25)" : "0 2px 8px rgba(15,23,42,0.05)",
              }}>
                <p style={{ margin:0, fontSize:9, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color: (s as {dark?:boolean}).dark ? "rgba(255,255,255,0.4)" : C.muted }}>{s.l}</p>
                <p style={{ margin:"6px 0 0", fontSize:24, fontWeight:900, color: (s as {dark?:boolean}).dark ? "#fff" : C.ink }}>{s.v}</p>
                {s.sub && <p style={{ margin:"3px 0 0", fontSize:11, color: (s as {dark?:boolean}).dark ? "rgba(255,255,255,0.4)" : C.muted }}>{s.sub}</p>}
              </div>
            ))}
          </div>
          {/* App volume KPIs — shown when goal has app_volume_goal */}
          {goal.app_volume_goal > 0 && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:28 }} className="ge-grid-4">
              {[
                { l:"App Vol Goal",    v: fmt$(goal.app_volume_goal),              sub:`${goal.app_units_goal} apps target` },
                { l:"App Vol Actual",  v: fmt$(summary.totalActualAppVolume),      sub:`${fmtPct(summary.appVolPct)} of goal` },
                { l:"App Units",       v: `${summary.totalActualAppUnits} apps`,   sub: goal.app_units_goal > 0 ? `of ${goal.app_units_goal} unit goal` : "submitted" },
                { l:"App Pace",        v: fmtPct(summary.appVolPct),               sub: summary.appVolPct >= 90 ? "🟢 On Pace" : summary.appVolPct >= 70 ? "🟡 Behind" : "🔴 Off Track" },
              ].map(s => (
                <div key={s.l} style={{
                  background: C.white, borderRadius:18, padding:"20px",
                  border:`1px solid ${C.line}`,
                  boxShadow:"0 2px 8px rgba(15,23,42,0.05)",
                }}>
                  <p style={{ margin:0, fontSize:9, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color:C.muted }}>{s.l}</p>
                  <p style={{ margin:"6px 0 0", fontSize:24, fontWeight:900, color: C.ink }}>{s.v}</p>
                  <p style={{ margin:"3px 0 0", fontSize:11, color: C.muted }}>{s.sub}</p>
                </div>
              ))}
            </div>
          )}
          {/* No app row gap spacer when no app goal */}
          {!goal.app_volume_goal && <div style={{ marginBottom:28 }} />}

          {/* Funded Volume Leaderboard */}
          <div style={{ background:C.white, borderRadius:24, border:`1px solid ${C.line}`, overflow:"hidden", boxShadow:"0 4px 24px rgba(15,23,42,0.07)", marginBottom:28 }}>
            <div style={{ padding:"22px 28px", borderBottom:`1px solid ${C.line}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ margin:0, fontSize:17, fontWeight:800, color: C.ink }}>Funded Volume Leaderboard</p>
                <p style={{ margin:"2px 0 0", fontSize:12, color: C.muted }}>Ranked by total funded volume this month</p>
              </div>
            </div>

            {board.length === 0
              ? (
                <div style={{ padding:"48px 28px", textAlign:"center" }}>
                  <p style={{ margin:"0 0 6px", fontSize:20 }}>🏆</p>
                  <p style={{ margin:"0 0 4px", fontSize:14, fontWeight:700, color: C.ink }}>No one assigned yet</p>
                  <p style={{ margin:0, fontSize:13, color: C.muted }}>Assign LOs to this goal first, then they will appear here once they commit.</p>
                </div>
              )
              : (
                <div style={{ overflowX:"auto" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", minWidth:680 }}>
                    <thead>
                      <tr style={{ background: C.sand }}>
                        {["#","Loan Officer","Committed","Funded","Units","Goal %","Pace"].map(h => (
                          <th key={h} style={{ padding:"12px 20px", fontSize:9, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color: C.muted, textAlign: h === "Loan Officer" ? "left" : "right", borderBottom:`1px solid ${C.line}`, whiteSpace:"nowrap" as const }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {board.map((row, i) => {
                        const committed = row.funded_volume_commitment > 0;
                        const pct  = committed ? (row.funded_volume_actual / row.funded_volume_commitment) * 100 : 0;
                        const isMe = row.profile_id === profile.id;
                        return (
                          <tr key={row.profile_id} style={{
                            background: isMe ? "rgba(243,112,33,0.05)" : C.white,
                            borderBottom: `1px solid ${C.line}`,
                            borderLeft: isMe ? `4px solid ${C.orange}` : "4px solid transparent",
                            opacity: committed ? 1 : 0.6,
                          }}>
                            <td style={{ padding:"16px 20px", textAlign:"right", fontSize:18, fontWeight:900 }}>
                              {committed ? (medals[i] ?? <span style={{ fontSize:12, color: C.muted }}>#{i+1}</span>) : <span style={{ fontSize:12, color: C.muted }}>—</span>}
                            </td>
                            <td style={{ padding:"16px 20px" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                                {row.avatar_url
                                  ? <img src={row.avatar_url} alt="" style={{ width:38, height:38, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.line}` }} />
                                  : <div style={{ width:38, height:38, borderRadius:"50%", background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"#fff", flexShrink:0 }}>
                                      {row.full_name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                                    </div>
                                }
                                <div>
                                  <p style={{ margin:0, fontSize:14, fontWeight:800, color: isMe ? C.orange : C.ink }}>
                                    {row.full_name} {isMe && <span style={{ fontSize:11, color: C.muted, fontWeight:400 }}>(you)</span>}
                                  </p>
                                  {row.nmls && <p style={{ margin:"1px 0 0", fontSize:10, color: C.muted }}>NMLS# {row.nmls}</p>}
                                </div>
                              </div>
                            </td>
                            <td style={{ padding:"16px 20px", textAlign:"right", fontSize:13, color: C.muted, fontWeight:600 }}>
                              {committed ? fmt$(row.funded_volume_commitment) : <span style={{ fontSize:11, color:"#d97706", fontWeight:700 }}>Pending</span>}
                            </td>
                            <td style={{ padding:"16px 20px", textAlign:"right", fontSize:14, fontWeight:900, color: C.ink }}>{fmt$(row.funded_volume_actual)}</td>
                            <td style={{ padding:"16px 20px", textAlign:"right", fontSize:14, fontWeight:800, color: C.ink }}>{row.funded_units_actual}</td>
                            <td style={{ padding:"16px 20px", textAlign:"right" }}>
                              {committed
                                ? <span style={{ fontSize:15, fontWeight:900, color: pct>=100?"#16a34a":pct>=70?"#d97706":"#dc2626" }}>{fmtPct(pct)}</span>
                                : <span style={{ fontSize:11, color: C.muted }}>—</span>
                              }
                            </td>
                            <td style={{ padding:"16px 20px" }}>
                              {committed
                                ? <div style={{ display:"flex", flexDirection:"column", gap:6, minWidth:130 }}>
                                    <Bar pct={pct} />
                                    <PaceTag pct={pct} />
                                  </div>
                                : <span style={{ fontSize:11, padding:"2px 8px", borderRadius:99, background:"#fef9c3", color:"#854d0e", fontWeight:700 }}>Not committed yet</span>
                              }
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>

          {/* Application Leaderboard */}
          {board.some(r => r.app_volume_actual > 0) && (
            <div style={{ background:C.white, borderRadius:24, border:`1px solid ${C.line}`, overflow:"hidden", boxShadow:"0 4px 24px rgba(15,23,42,0.07)" }}>
              <div style={{ padding:"22px 28px", borderBottom:`1px solid ${C.line}` }}>
                <p style={{ margin:0, fontSize:17, fontWeight:800, color: C.ink }}>Application Leaderboard</p>
                <p style={{ margin:"2px 0 0", fontSize:12, color: C.muted }}>Ranked by application volume</p>
              </div>
              <div style={{ overflowX:"auto" }}>
                <table style={{ width:"100%", borderCollapse:"collapse", minWidth:560 }}>
                  <thead>
                    <tr style={{ background: C.sand }}>
                      {["#","Loan Officer","App Volume","Apps","Funded","Conversion"].map(h => (
                        <th key={h} style={{ padding:"12px 20px", fontSize:9, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color: C.muted, textAlign: h === "Loan Officer" ? "left":"right", borderBottom:`1px solid ${C.line}` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...board].sort((a,b)=>b.app_volume_actual-a.app_volume_actual).filter(r=>r.app_volume_actual>0).map((row,i) => {
                      const conv = row.app_units_actual > 0 ? Math.round((row.funded_units_actual/row.app_units_actual)*100) : 0;
                      const isMe = row.profile_id === profile.id;
                      return (
                        <tr key={row.profile_id} style={{ background: isMe?"rgba(243,112,33,0.05)":C.white, borderBottom:`1px solid ${C.line}` }}>
                          <td style={{ padding:"14px 20px", textAlign:"right", fontSize:18 }}>{medals[i] ?? `#${i+1}`}</td>
                          <td style={{ padding:"14px 20px" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                              {row.avatar_url
                                ? <img src={row.avatar_url} alt="" style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.line}`, flexShrink:0 }} />
                                : <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", flexShrink:0 }}>
                                    {row.full_name.split(" ").map((n:string)=>n[0]).slice(0,2).join("")}
                                  </div>
                              }
                              <div>
                                <p style={{ margin:0, fontSize:14, fontWeight:800, color: isMe?C.orange:C.ink }}>
                                  {row.full_name} {isMe && <span style={{ fontSize:11, color:C.muted, fontWeight:400 }}>(you)</span>}
                                </p>
                                {row.nmls && <p style={{ margin:"1px 0 0", fontSize:10, color:C.muted }}>NMLS# {row.nmls}</p>}
                              </div>
                            </div>
                          </td>
                          <td style={{ padding:"14px 20px", textAlign:"right", fontSize:14, fontWeight:800, color: C.ink }}>{fmt$(row.app_volume_actual)}</td>
                          <td style={{ padding:"14px 20px", textAlign:"right", fontSize:14, fontWeight:800, color: C.ink }}>{row.app_units_actual}</td>
                          <td style={{ padding:"14px 20px", textAlign:"right", fontSize:14, fontWeight:800, color: C.ink }}>{row.funded_units_actual}</td>
                          <td style={{ padding:"14px 20px", textAlign:"right" }}>
                            <span style={{ fontSize:14, fontWeight:900, color: conv>=70?"#16a34a":conv>=50?"#d97706":"#dc2626" }}>{conv}%</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <style>{`
        @media (max-width:700px) { .ge-grid-4 { grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}
