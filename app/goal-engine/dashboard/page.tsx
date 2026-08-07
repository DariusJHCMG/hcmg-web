/**
 * /goal-engine/dashboard — SLICE by HCMG · LO Dashboard
 * Full explicit colors — no Tailwind custom tokens
 */

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import {
  getActiveGoal, getCommitment, getLOProductionForMonth,
  getLeaderboard, getLOAwards, getNotifications, computeGoalSummary,
  fmt$, fmtPct, daysRemaining, calcPace, requiredPace, monthProgress,
} from "@/lib/goal-engine";
import type { GoalNotification } from "@/lib/database.types";
import { GoalNotificationBell } from "@/components/goal-engine/GoalNotificationBell";
import { HarryWidget } from "@/components/goal-engine/HarryWidget";
import Link from "next/link";

export const dynamic = "force-dynamic";

// ── Design tokens (explicit, no Tailwind custom vars) ─────────
const C = {
  navy:    "#142850",
  orange:  "#F37021",
  orangeL: "#FF9847",
  ink:     "#1A2B42",
  muted:   "#64748B",
  line:    "#E2E8F0",
  sand:    "#F8FAFC",
  white:   "#ffffff",
};

// ── Reusable atoms ────────────────────────────────────────────

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.white, borderRadius: 20,
      border: `1px solid ${C.line}`,
      boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
      ...style,
    }}>
      {children}
    </div>
  );
}

function ProgressBar({ pct, thick }: { pct: number; thick?: boolean }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const color   = pct >= 90 ? "#22c55e" : pct >= 70 ? "#f59e0b" : "#ef4444";
  const h       = thick ? 12 : 8;
  return (
    <div style={{ background: C.line, borderRadius: 99, overflow: "hidden", height: h }}>
      <div style={{ height:"100%", width:`${clamped}%`, background: color, borderRadius: 99, transition:"width .7s" }} />
    </div>
  );
}

function KpiCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div style={{
      background: highlight ? C.orange : C.white,
      borderRadius: 18,
      border: highlight ? "none" : `1px solid ${C.line}`,
      padding: "22px 20px",
      boxShadow: highlight ? "0 8px 24px rgba(243,112,33,0.3)" : "0 2px 8px rgba(15,23,42,0.05)",
    }}>
      <p style={{ margin:0, fontSize:10, fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", color: highlight ? "rgba(255,255,255,0.7)" : C.muted }}>
        {label}
      </p>
      <p style={{ margin:"8px 0 0", fontSize:26, fontWeight:900, color: highlight ? C.white : C.ink, lineHeight:1 }}>
        {value}
      </p>
      {sub && <p style={{ margin:"4px 0 0", fontSize:11, color: highlight ? "rgba(255,255,255,0.65)" : C.muted }}>{sub}</p>}
    </div>
  );
}

function PaceBadge({ pct }: { pct: number }) {
  const on = pct >= 100, behind = pct >= 75;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 12px", borderRadius:99, fontSize:11, fontWeight:700,
      background: on ? "#dcfce7" : behind ? "#fef9c3" : "#fee2e2",
      color:       on ? "#166534" : behind ? "#854d0e" : "#991b1b",
      border: `1px solid ${on ? "#bbf7d0" : behind ? "#fde047" : "#fecaca"}`,
    }}>
      {on ? "🟢 On Pace" : behind ? "🟡 Behind" : "🔴 Off Track"}
    </span>
  );
}

export default async function GoalEngineDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");

  const goal = await getActiveGoal();
  const [commitment, production, leaderboard, awards, notifications] = await Promise.all([
    goal ? getCommitment(goal.id, profile.id) : null,
    goal ? getLOProductionForMonth(profile.id, goal.id) : [],
    goal ? getLeaderboard(goal.id) : [],
    getLOAwards(profile.id),
    getNotifications(profile.id, 5),
  ]);

  const actualVol  = production.reduce((s, r) => s + (r.funded_volume ?? 0), 0);
  const actualUnit = production.reduce((s, r) => s + (r.funded_unit  ?? 0), 0);
  const appVol     = production.reduce((s, r) => s + (r.app_volume   ?? 0), 0);
  const appUnit    = production.reduce((s, r) => s + (r.app_unit     ?? 0), 0);
  const rank       = leaderboard.findIndex(r => r.profile_id === profile.id) + 1 || null;
  const summary    = goal ? await computeGoalSummary(goal) : null;
  const days       = goal ? daysRemaining(goal.end_date) : 0;
  const elapsed    = goal ? monthProgress(goal.start_date, goal.end_date) * 100 : 0;
  const volPct     = commitment ? calcPace(actualVol,  commitment.funded_volume_commitment) : 0;
  const unitPct    = commitment ? calcPace(actualUnit, commitment.funded_units_commitment)  : 0;
  const reqPct     = goal ? requiredPace(goal.start_date, goal.end_date) : 0;
  const compPct    = summary?.volumePct ?? 0;
  const medals     = ["🥇","🥈","🥉"];

  return (
    <div style={{ fontFamily:"Montserrat,system-ui,sans-serif", color: C.ink, maxWidth:1200, margin:"0 auto", padding:"28px 24px 56px" }}>

      {/* ── Page header ── */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32, flexWrap:"wrap", gap:12 }}>
        <div>
          <h1 style={{ margin:"0 0 0", fontSize:30, fontWeight:900, color: C.ink }}>
            Hi, {profile.full_name.split(" ")[0]} 👋
          </h1>
          <p style={{ margin:"4px 0 0", fontSize:14, color: C.muted }}>
            {goal ? `${goal.month_label} · ${days} days remaining` : "No active goal this month"}
          </p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <GoalNotificationBell notifications={notifications as GoalNotification[]} />
          {goal && !commitment && (
            <Link href="/goal-engine/commit" style={{
              display:"inline-flex", alignItems:"center", gap:8,
              padding:"11px 22px", borderRadius:14, textDecoration:"none",
              background:"linear-gradient(135deg,#FF9847,#F37021)",
              color:"#fff", fontSize:14, fontWeight:800,
              boxShadow:"0 6px 20px rgba(243,112,33,0.4)",
            }}>
              🥧 Claim My Slice
            </Link>
          )}
        </div>
      </div>

      {/* ── No active goal ── */}
      {!goal && (
        <Card style={{ padding:"64px 32px", textAlign:"center" }}>
          <div style={{ fontSize:56, marginBottom:16 }}>🎯</div>
          <h2 style={{ margin:"0 0 8px", fontSize:22, fontWeight:800, color: C.ink }}>No Active Goal This Month</h2>
          <p style={{ margin:0, fontSize:14, color: C.muted }}>Leadership will announce the next monthly goal soon.</p>
        </Card>
      )}

      {goal && (
        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

          {/* ── Company Goal Banner — Pie Style ── */}
          {(() => {
            const appActual  = summary?.totalActualAppVolume ?? 0;
            const appUnits   = summary?.totalActualAppUnits  ?? 0;
            const appPct     = goal.app_volume_goal  > 0 ? Math.min(100, (appActual  / goal.app_volume_goal)  * 100) : 0;
            const appUPct    = goal.app_units_goal   > 0 ? Math.min(100, (appUnits   / goal.app_units_goal)   * 100) : 0;
            const fundedPct  = Math.min(100, compPct);
            const fundedUPct = goal.funded_units_goal > 0 ? Math.min(100, ((summary?.totalActualUnits ?? 0) / goal.funded_units_goal) * 100) : 0;

            return (
              <div style={{
                background: "linear-gradient(to right, #ffffff 0%, #FF9847 50%, #F37021 100%)",
                borderRadius: 24,
                padding: "28px 32px",
                boxShadow: "0 8px 40px rgba(243,112,33,0.25)",
                border: `1px solid rgba(243,112,33,0.3)`,
              }}>
                <p style={{ margin:"0 0 20px", fontSize:11, fontWeight:800, letterSpacing:".2em", textTransform:"uppercase", color: C.navy }}>
                  {goal.month_label} — Company Goal
                </p>

                {/* Two-column layout: pie left, stats right */}
                <div style={{ display:"flex", gap:36, alignItems:"center", flexWrap:"wrap" }} className="ge-banner-wrap">

                  {/* ── SLICE logo on white side ── */}
                  <div style={{ flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", width:180 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/SLICE.png" alt="SLICE" style={{ width: 110, height: "auto" }} />
                  </div>

                  {/* ── Stats grid ── */}
                  <div style={{ flex:1, minWidth:200 }}>
                    {/* Legend + values: 2×2 grid */}
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:20 }} className="ge-stat-grid">
                      {[
                        { dot:"#F37021", label:"Funded Vol Goal",   goal: fmt$(goal.funded_volume_goal),  actual: fmt$(summary?.totalActualVolume ?? 0),           pct: fundedPct  },
                        { dot:"#3b82f6", label:"Funded Units Goal", goal: `${goal.funded_units_goal} loans`, actual: `${summary?.totalActualUnits ?? 0} funded`,  pct: fundedUPct },
                        { dot:"#22c55e", label:"App Vol Goal",      goal: fmt$(goal.app_volume_goal),     actual: fmt$(appActual),                                  pct: appPct     },
                        { dot:"#a855f7", label:"App Units Goal",    goal: `${goal.app_units_goal} apps`,  actual: `${appUnits} filed`,                              pct: appUPct    },
                      ].map(s => (
                        <div key={s.label} style={{ padding:"10px 14px", borderRadius:12, background: C.navy, border:`1px solid rgba(255,255,255,0.08)` }}>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:6 }}>
                            <span style={{ width:8, height:8, borderRadius:"50%", background:s.dot, flexShrink:0, display:"inline-block" }} />
                            <span style={{ fontSize:9, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(255,255,255,0.45)" }}>{s.label}</span>
                          </div>
                          <p style={{ margin:"0 0 1px", fontSize:18, fontWeight:900, color:"#fff", lineHeight:1 }}>{s.actual}</p>
                          <p style={{ margin:0, fontSize:10, color:"rgba(255,255,255,0.35)" }}>of {s.goal} · <span style={{ color: s.pct >= 90 ? "#22c55e" : s.pct >= 70 ? "#f59e0b" : "#ef4444", fontWeight:800 }}>{Math.round(s.pct)}%</span></p>
                        </div>
                      ))}
                    </div>

                    {/* Team + Days */}
                    <div style={{ display:"flex", gap:12 }}>
                      <div style={{ flex:1, padding:"8px 14px", borderRadius:10, background: C.navy, border:`1px solid rgba(255,255,255,0.08)` }}>
                        <p style={{ margin:0, fontSize:9, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>Team</p>
                        <p style={{ margin:"3px 0 0", fontSize:16, fontWeight:900, color:"#fff" }}>{summary?.participationCount ?? 0}/{summary?.totalLOs ?? 0} committed</p>
                      </div>
                      <div style={{ flex:1, padding:"8px 14px", borderRadius:10, background: C.navy, border:`1px solid rgba(255,255,255,0.08)` }}>
                        <p style={{ margin:0, fontSize:9, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:"rgba(255,255,255,0.4)" }}>Pace</p>
                        <p style={{ margin:"3px 0 0", fontSize:16, fontWeight:900, color: compPct >= 90 ? "#22c55e" : compPct >= 70 ? "#f59e0b" : "#ef4444" }}>{fmtPct(compPct)} funded</p>
                      </div>
                    </div>
                  </div>
                </div>

                {goal.clo_message && (
                  <div style={{ marginTop:20, paddingTop:20, borderTop:`1px solid rgba(20,40,80,0.15)` }}>
                    <p style={{ margin:"0 0 4px", fontSize:9, fontWeight:800, letterSpacing:".2em", textTransform:"uppercase", color: C.navy }}>
                      Message from Darius
                    </p>
                    <p style={{ margin:0, fontSize:14, color: C.navy, fontStyle:"italic", lineHeight:1.7, opacity:0.75 }}>
                      &ldquo;{goal.clo_message}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ── No commitment CTA ── */}
          {!commitment && (
            <div style={{
              border:`2px dashed ${C.orange}`,
              borderRadius:24, padding:"52px 32px",
              textAlign:"center",
              background:"rgba(243,112,33,0.04)",
            }}>
              <div style={{ fontSize:52, marginBottom:12 }}>🥧</div>
              <h2 style={{ margin:"0 0 10px", fontSize:22, fontWeight:800, color: C.ink }}>
                You haven&apos;t claimed your slice yet
              </h2>
              <p style={{ margin:"0 0 28px", fontSize:14, color: C.muted, maxWidth:460, marginLeft:"auto", marginRight:"auto", lineHeight:1.7 }}>
                Submit your monthly commitment to join the leaderboard and receive weekly progress emails from Darius.
              </p>
              <Link href="/goal-engine/commit" style={{
                display:"inline-flex", alignItems:"center", gap:10,
                padding:"15px 36px", borderRadius:16, textDecoration:"none",
                background:"linear-gradient(135deg,#FF9847,#F37021)",
                color:"#fff", fontSize:15, fontWeight:800,
                boxShadow:"0 8px 28px rgba(243,112,33,0.4)",
              }}>
                🥧 Claim My Slice of the Pie
              </Link>
            </div>
          )}

          {/* ── KPI cards ── */}
          {commitment && (
            <>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16 }} className="ge-kpi-grid">
                <KpiCard label="Your Commitment" value={fmt$(commitment.funded_volume_commitment)} sub={`${commitment.funded_units_commitment} loans committed`} />
                <KpiCard label="Funded Volume"   value={fmt$(actualVol)}  sub={`${actualUnit} loans · ${fmtPct(volPct)}`}  highlight />
                <KpiCard label="Still Needed"    value={fmt$(Math.max(0, commitment.funded_volume_commitment - actualVol))} sub={`${days} days left`} />
                <KpiCard label="Applications"    value={fmt$(appVol)}     sub={`${appUnit} apps submitted`} />
              </div>

              {/* ── Progress card ── */}
              <Card style={{ padding:28 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:10 }}>
                  <div>
                    <p style={{ margin:0, fontSize:11, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color: C.muted }}>
                      Your Progress
                    </p>
                    {rank && (
                      <p style={{ margin:"3px 0 0", fontSize:13, fontWeight:700, color: C.orange }}>
                        #{rank} on Leaderboard
                      </p>
                    )}
                  </div>
                  <PaceBadge pct={volPct - reqPct + 100} />
                </div>
                {[
                  { label:"Funded Volume", pct:volPct,  right:`${fmt$(actualVol)} / ${fmt$(commitment.funded_volume_commitment)}` },
                  { label:"Funded Units",  pct:unitPct, right:`${actualUnit} / ${commitment.funded_units_commitment} loans` },
                  { label:"Month Elapsed", pct:elapsed, right:`${fmtPct(elapsed)} · ${days} days left` },
                ].map(row => (
                  <div key={row.label} style={{ marginBottom:18 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                      <span style={{ fontSize:13, fontWeight:700, color: C.ink }}>{row.label}</span>
                      <span style={{ fontSize:12, color: C.muted }}>{row.right}</span>
                    </div>
                    <ProgressBar pct={row.pct} />
                  </div>
                ))}
                {commitment.confidence_pct && (
                  <p style={{ margin:"12px 0 0", paddingTop:16, borderTop:`1px solid ${C.line}`, fontSize:12, color: C.muted }}>
                    Confidence level: <strong style={{ color: C.ink }}>{commitment.confidence_pct}%</strong>
                  </p>
                )}
              </Card>

              {/* ── Commitment detail ── */}
              {(commitment.biggest_focus || commitment.biggest_challenge) && (
                <Card style={{ padding:28 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
                    <p style={{ margin:0, fontSize:11, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color: C.muted }}>
                      Your Commitment
                    </p>
                    <span style={{
                      padding:"3px 10px", borderRadius:99, fontSize:10, fontWeight:800,
                      background:"#dcfce7", color:"#166534", border:"1px solid #bbf7d0",
                    }}>🔒 Locked</span>
                  </div>
                  {commitment.biggest_focus && (
                    <div style={{ marginBottom:16 }}>
                      <p style={{ margin:"0 0 6px", fontSize:9, fontWeight:800, letterSpacing:".18em", textTransform:"uppercase", color: C.orange }}>
                        Focus This Month
                      </p>
                      <p style={{ margin:0, fontSize:14, color: C.ink, lineHeight:1.7 }}>{commitment.biggest_focus}</p>
                    </div>
                  )}
                  {commitment.biggest_challenge && (
                    <div>
                      <p style={{ margin:"0 0 6px", fontSize:9, fontWeight:800, letterSpacing:".18em", textTransform:"uppercase", color: C.muted }}>
                        Biggest Challenge
                      </p>
                      <p style={{ margin:0, fontSize:14, color: C.ink, lineHeight:1.7 }}>{commitment.biggest_challenge}</p>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}

          {/* ── Mini Leaderboard ── */}
          <Card style={{ overflow:"hidden", padding:0 }}>
            <div style={{ padding:"20px 28px", borderBottom:`1px solid ${C.line}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ margin:0, fontSize:16, fontWeight:800, color: C.ink }}>Leaderboard</p>
                <p style={{ margin:"2px 0 0", fontSize:12, color: C.muted }}>Top performers this month</p>
              </div>
              <Link href="/goal-engine/leaderboard" style={{ fontSize:13, fontWeight:800, color: C.orange, textDecoration:"none" }}>
                View Full →
              </Link>
            </div>
            {leaderboard.length === 0 ? (
              <p style={{ padding:"40px 28px", textAlign:"center", fontSize:14, color: C.muted }}>
                No commitments yet this month.
              </p>
            ) : leaderboard.slice(0, 5).map((row, i) => {
                const pct  = row.funded_volume_commitment > 0 ? (row.funded_volume_actual / row.funded_volume_commitment) * 100 : 0;
                const isMe = row.profile_id === profile.id;
                return (
                  <div key={row.profile_id} style={{
                    display:"flex", alignItems:"center", gap:16, padding:"14px 28px",
                    borderBottom:`1px solid ${C.line}`,
                    background: isMe ? "rgba(243,112,33,0.06)" : C.white,
                    borderLeft: isMe ? `4px solid ${C.orange}` : "4px solid transparent",
                  }}>
                    <span style={{ width:26, textAlign:"center", fontSize:18, flexShrink:0 }}>
                      {medals[i] ?? <span style={{ fontSize:12, color: C.muted }}>#{i+1}</span>}
                    </span>
                    <div style={{ display:"flex", alignItems:"center", gap:12, flex:1, minWidth:0 }}>
                      {row.avatar_url
                        ? <img src={row.avatar_url} alt="" style={{ width:36, height:36, borderRadius:"50%", objectFit:"cover", border:`2px solid ${C.line}`, flexShrink:0 }} />
                        : <div style={{ width:36, height:36, borderRadius:"50%", background:`linear-gradient(135deg,#FF9847,#F37021)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, color:"#fff", flexShrink:0 }}>
                            {row.full_name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                          </div>
                      }
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:0, fontSize:14, fontWeight:800, color: isMe ? C.orange : C.ink, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                          {row.full_name} {isMe && <span style={{ fontSize:11, color: C.muted, fontWeight:400 }}>(you)</span>}
                        </p>
                        <div style={{ marginTop:6 }}><ProgressBar pct={pct} /></div>
                      </div>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0 }}>
                      <p style={{ margin:0, fontSize:15, fontWeight:900, color: C.ink }}>{fmt$(row.funded_volume_actual)}</p>
                      <p style={{ margin:"2px 0 0", fontSize:11, color: C.muted }}>{row.funded_units_actual} loans · {fmtPct(pct)}</p>
                    </div>
                  </div>
                );
              })
            }
          </Card>

          {/* ── HARRY AI Coaching Widget ── */}
          <HarryWidget insightType="lo_coaching" />

          {/* ── Awards ── */}
          {awards.length > 0 && (
            <Card style={{ padding:28 }}>
              <p style={{ margin:"0 0 16px", fontSize:11, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color: C.muted }}>
                Your Awards
              </p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                {awards.slice(0, 6).map(a => (
                  <div key={a.id} style={{
                    display:"flex", alignItems:"center", gap:12,
                    padding:"12px 18px", borderRadius:14,
                    background:"#fffbeb", border:"1px solid #fde68a",
                  }}>
                    <span style={{ fontSize:24 }}>{a.award_emoji ?? "🏆"}</span>
                    <div>
                      <p style={{ margin:0, fontSize:13, fontWeight:800, color:"#92400e" }}>{a.award_label}</p>
                      <p style={{ margin:"2px 0 0", fontSize:11, color:"#b45309" }}>{a.issued_at?.slice(0,7)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      <style>{`
        @media (max-width:900px) { .ge-kpi-grid { grid-template-columns:repeat(2,1fr) !important; } }
        @media (max-width:700px) { .ge-banner-wrap { flex-direction:column !important; align-items:center !important; } }
        @media (max-width:640px) { .ge-kpi-grid,.ge-stat-grid { grid-template-columns:repeat(2,1fr) !important; } }
        @media (max-width:380px) { .ge-kpi-grid,.ge-stat-grid { grid-template-columns:1fr !important; } }
      `}</style>
    </div>
  );
}
