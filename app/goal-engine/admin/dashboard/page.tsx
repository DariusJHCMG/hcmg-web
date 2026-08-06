/**
 * /goal-engine/admin/dashboard — Manager / Executive View (light design)
 */

import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import {
  getActiveGoal, getLeaderboard, computeGoalSummary,
  getAllCommitmentsForGoal, getActiveLoanOfficers,
  fmt$, fmtPct, daysRemaining, calcPace, requiredPace, monthProgress,
} from "@/lib/goal-engine";
import Link from "next/link";
import type { LeaderboardRow } from "@/lib/database.types";
import { HarryWidget } from "@/components/goal-engine/HarryWidget";

export const dynamic = "force-dynamic";

const C = {
  navy: "#142850", orange: "#F37021", ink: "#1A2B42",
  muted: "#64748B", line: "#E2E8F0", sand: "#F8FAFC", white: "#ffffff",
};

function Bar({ pct }: { pct: number }) {
  const c = Math.min(100, Math.max(0, pct));
  const color = pct >= 90 ? "#16a34a" : pct >= 70 ? "#d97706" : "#dc2626";
  return (
    <div style={{ background:C.line, borderRadius:99, overflow:"hidden", height:6 }}>
      <div style={{ height:"100%", width:`${c}%`, background:color, borderRadius:99 }} />
    </div>
  );
}

function Chip({ pct, noCommit }: { pct: number; noCommit?: boolean }) {
  if (noCommit) return (
    <span style={{ padding:"2px 10px", borderRadius:99, background:"#f1f5f9", color:C.muted, fontSize:10, fontWeight:700 }}>No Commit</span>
  );
  if (pct >= 90) return (
    <span style={{ padding:"2px 10px", borderRadius:99, background:"#dcfce7", color:"#166534", fontSize:10, fontWeight:700 }}>🟢 On Pace</span>
  );
  if (pct >= 70) return (
    <span style={{ padding:"2px 10px", borderRadius:99, background:"#fef9c3", color:"#854d0e", fontSize:10, fontWeight:700 }}>🟡 Behind</span>
  );
  return (
    <span style={{ padding:"2px 10px", borderRadius:99, background:"#fee2e2", color:"#991b1b", fontSize:10, fontWeight:700 }}>🔴 Off Track</span>
  );
}

export default async function GoalEngineManagerDashboard() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");
  if (!isAdmin(profile)) redirect("/goal-engine/dashboard");

  const goal = await getActiveGoal();

  if (!goal) {
    return (
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif" }}>
        <Link href="/goal-engine/admin" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>← Manage Goals</Link>
        <div style={{ marginTop:20, background:C.white, border:`1px solid ${C.line}`, borderRadius:20, padding:"64px 32px", textAlign:"center", boxShadow:"0 1px 6px rgba(15,23,42,0.06)" }}>
          <p style={{ fontSize:48, margin:"0 0 16px" }}>📊</p>
          <h2 style={{ margin:"0 0 8px", fontSize:20, fontWeight:800, color:C.ink }}>No Active Goal</h2>
          <p style={{ margin:"0 0 20px", fontSize:13, color:C.muted }}>Create and publish a goal to see the manager view.</p>
          <Link href="/goal-engine/admin" style={{ display:"inline-block", padding:"12px 24px", borderRadius:12, textDecoration:"none", background:"linear-gradient(135deg,#FF9847,#F37021)", color:"#fff", fontSize:13, fontWeight:800 }}>
            Create Goal →
          </Link>
        </div>
      </div>
    );
  }

  const [leaderboard, summary, commitments, allLOs] = await Promise.all([
    getLeaderboard(goal.id),
    computeGoalSummary(goal),
    getAllCommitmentsForGoal(goal.id),
    getActiveLoanOfficers(),
  ]);

  const requiredPct  = requiredPace(goal.start_date, goal.end_date);
  const elapsed      = monthProgress(goal.start_date, goal.end_date);
  const days         = daysRemaining(goal.end_date);
  const medals       = ["🥇","🥈","🥉"];

  type EnrichedRow = LeaderboardRow & { relativePace:number; noCommitment:boolean; forecast:number };

  const enrichedRows: EnrichedRow[] = allLOs.map(lo => {
    const boardRow     = leaderboard.find(r => r.profile_id === lo.id);
    const noCommitment = !boardRow;
    const row: LeaderboardRow = boardRow ?? {
      goal_month_id:lo.id, profile_id:lo.id, full_name:lo.full_name,
      avatar_url:lo.avatar_url, nmls:lo.nmls,
      funded_volume_commitment:0, funded_units_commitment:0,
      app_volume_commitment:0,   app_units_commitment:0,
      confidence_pct:null, submitted_at:null,
      funded_volume_actual:0, funded_units_actual:0,
      app_volume_actual:0,   app_units_actual:0,
    };
    const volumePace = row.funded_volume_commitment > 0 ? calcPace(row.funded_volume_actual, row.funded_volume_commitment) : 0;
    const forecast   = elapsed > 0 ? row.funded_volume_actual / elapsed : 0;
    return { ...row, relativePace:volumePace - requiredPct, noCommitment, forecast };
  }).sort((a,b) => {
    if (a.noCommitment && !b.noCommitment) return 1;
    if (!a.noCommitment && b.noCommitment) return -1;
    return b.funded_volume_actual - a.funded_volume_actual;
  });

  const onPace   = enrichedRows.filter(r => !r.noCommitment && r.relativePace >= 0);
  const behind   = enrichedRows.filter(r => !r.noCommitment && r.relativePace < 0 && r.relativePace >= -20);
  const offTrack = enrichedRows.filter(r => !r.noCommitment && r.relativePace < -20);
  const noCommit = enrichedRows.filter(r => r.noCommitment);
  const totalForecast     = enrichedRows.reduce((s,r) => s + r.forecast, 0);
  const participationPct  = allLOs.length > 0
    ? Math.round((commitments.filter(c=>c.submitted_at).length / allLOs.length)*100)
    : 0;

  const TH: React.CSSProperties = {
    padding:"12px 18px", fontSize:9, fontWeight:700, letterSpacing:"0.15em",
    textTransform:"uppercase" as const, color:C.muted,
    background:C.sand, borderBottom:`1px solid ${C.line}`, whiteSpace:"nowrap" as const,
  };
  const TD: React.CSSProperties = {
    padding:"14px 18px", fontSize:13, color:C.ink,
    borderBottom:`1px solid ${C.line}`, verticalAlign:"middle" as const,
  };

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif" }}>

      {/* Page header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28, flexWrap:"wrap", gap:12 }}>
        <div>
          <Link href="/goal-engine/admin" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>← Manage Goals</Link>
          <h1 style={{ margin:"12px 0 0", fontSize:28, fontWeight:900, color:C.ink }}>Manager Dashboard</h1>
          <p style={{ margin:"4px 0 0", fontSize:13, color:C.muted }}>{goal.month_label} · {days} days remaining</p>
        </div>
      </div>

      {/* KPI cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:24 }} className="ge-grid-4">
        {[
          { label:"Company Goal",    value:fmt$(goal.funded_volume_goal),          sub:`${goal.funded_units_goal} loans`,                          navy:true },
          { label:"Actual Funded",   value:fmt$(summary.totalActualVolume),        sub:`${fmtPct(summary.volumePct)} of goal` },
          { label:"Total Committed", value:fmt$(summary.totalCommittedVolume),     sub:`${fmtPct(summary.commitVsGoalPct)} vs goal` },
          { label:"Forecast",        value:fmt$(totalForecast),                    sub:"at current pace" },
          { label:"Participation",   value:`${participationPct}%`,                 sub:`${commitments.filter(c=>c.submitted_at).length}/${allLOs.length} committed` },
          { label:"Days Remaining",  value:days.toString(),                        sub:`${fmtPct(requiredPct)} elapsed` },
          { label:"On Pace",         value:onPace.length.toString(),               green:true },
          { label:"Need Attention",  value:(offTrack.length+noCommit.length).toString(), red:true },
        ].map(s => (
          <div key={s.label} style={{
            background: (s as any).navy ? C.navy : C.white,
            border: (s as any).navy ? `1px solid rgba(243,112,33,0.3)` : `1px solid ${C.line}`,
            borderRadius:16, padding:20,
            boxShadow:"0 1px 4px rgba(15,23,42,0.05)",
          }}>
            <p style={{ margin:0, fontSize:9, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase",
              color: (s as any).navy ? "rgba(255,255,255,0.5)" : C.muted }}>{s.label}</p>
            <p style={{ margin:"6px 0 0", fontSize:22, fontWeight:900,
              color: (s as any).navy ? "#fff" : (s as any).green ? "#16a34a" : (s as any).red ? "#dc2626" : C.ink }}>{s.value}</p>
            {(s as any).sub && <p style={{ margin:"2px 0 0", fontSize:11,
              color: (s as any).navy ? "rgba(255,255,255,0.4)" : C.muted }}>{(s as any).sub}</p>}
          </div>
        ))}
      </div>

      {/* Company progress bar */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:16, padding:"20px 24px", marginBottom:24, boxShadow:"0 1px 4px rgba(15,23,42,0.05)" }}>
        <p style={{ margin:"0 0 10px", fontSize:9, fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", color:C.muted }}>Company Goal Progress</p>
        <Bar pct={summary.volumePct} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:8, fontSize:12 }}>
          <span style={{ color:C.muted }}>{fmt$(summary.totalActualVolume)} funded</span>
          <span style={{ fontWeight:800, color:C.ink }}>{fmtPct(summary.volumePct)}</span>
          <span style={{ color:C.muted }}>{fmt$(goal.funded_volume_goal)} goal</span>
        </div>
      </div>

      {/* All LO table */}
      <div style={{ background:C.white, border:`1px solid ${C.line}`, borderRadius:20, overflow:"hidden", marginBottom:24, boxShadow:"0 1px 6px rgba(15,23,42,0.06)" }}>
        <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.line}`, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:8 }}>
          <div>
            <h2 style={{ margin:0, fontSize:15, fontWeight:800, color:C.ink }}>All Loan Officers</h2>
            <p style={{ margin:"2px 0 0", fontSize:11, color:C.muted }}>Full production visibility with pace tracking</p>
          </div>
          <div style={{ display:"flex", gap:8 }}>
            {[
              { label:`🟢 ${onPace.length} On Pace`,     bg:"#dcfce7", color:"#166534" },
              { label:`🟡 ${behind.length} Behind`,      bg:"#fef9c3", color:"#854d0e" },
              { label:`🔴 ${offTrack.length} Off Track`, bg:"#fee2e2", color:"#991b1b" },
            ].map(c => (
              <span key={c.label} style={{ padding:"4px 10px", borderRadius:99, background:c.bg, color:c.color, fontSize:10, fontWeight:700 }}>{c.label}</span>
            ))}
          </div>
        </div>
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th style={{ ...TH, width:40, textAlign:"center" }}>#</th>
                <th style={{ ...TH, textAlign:"left" }}>Loan Officer</th>
                <th style={{ ...TH, textAlign:"right" }}>Committed</th>
                <th style={{ ...TH, textAlign:"right" }}>Funded</th>
                <th style={{ ...TH, textAlign:"right" }}>Units</th>
                <th style={{ ...TH, textAlign:"right" }}>Goal %</th>
                <th style={{ ...TH, textAlign:"right" }}>Forecast</th>
                <th style={{ ...TH, textAlign:"right" }}>Diff</th>
                <th style={{ ...TH }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {enrichedRows.map((row, i) => {
                const pct    = row.funded_volume_commitment > 0 ? calcPace(row.funded_volume_actual, row.funded_volume_commitment) : 0;
                const diff   = row.funded_volume_actual - row.funded_volume_commitment;
                const adjPct = pct - requiredPct + 100;
                return (
                  <tr key={row.profile_id} style={{ opacity: row.noCommitment ? 0.6 : 1, background:C.white }}>
                    <td style={{ ...TD, textAlign:"center", fontSize:16, fontWeight:800, color:C.ink }}>
                      {row.noCommitment ? "–" : (medals[i] ?? <span style={{ fontSize:12, fontWeight:700, color:C.muted }}>#{i+1}</span>)}
                    </td>
                    <td style={TD}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        {row.avatar_url
                          ? <img src={row.avatar_url} alt="" style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", border:`1.5px solid ${C.line}`, flexShrink:0 }} />
                          : <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", flexShrink:0 }}>
                              {row.full_name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                            </div>
                        }
                        <div>
                          <p style={{ margin:0, fontSize:13, fontWeight:800, color:C.ink }}>{row.full_name}</p>
                          {row.nmls && <p style={{ margin:"1px 0 0", fontSize:10, color:C.muted }}>NMLS# {row.nmls}</p>}
                        </div>
                      </div>
                    </td>
                    <td style={{ ...TD, textAlign:"right", color:C.muted }}>
                      {row.noCommitment ? <span style={{ color:"#d97706", fontSize:11, fontWeight:700 }}>No commit</span> : fmt$(row.funded_volume_commitment)}
                    </td>
                    <td style={{ ...TD, textAlign:"right", fontWeight:800, color:C.ink }}>{fmt$(row.funded_volume_actual)}</td>
                    <td style={{ ...TD, textAlign:"right", fontWeight:800, color:C.ink }}>{row.funded_units_actual}</td>
                    <td style={{ ...TD, textAlign:"right" }}>
                      <span style={{ fontWeight:900, color: row.noCommitment ? C.muted : pct>=100 ? "#16a34a" : pct>=70 ? "#d97706" : "#dc2626" }}>
                        {row.noCommitment ? "—" : fmtPct(pct)}
                      </span>
                    </td>
                    <td style={{ ...TD, textAlign:"right", color:C.muted }}>{fmt$(row.forecast)}</td>
                    <td style={{ ...TD, textAlign:"right" }}>
                      <span style={{ fontWeight:700, color: row.noCommitment ? C.muted : diff>=0 ? "#16a34a" : "#dc2626" }}>
                        {row.noCommitment ? "—" : (diff>=0?"+":"")+fmt$(diff)}
                      </span>
                    </td>
                    <td style={TD}><Chip pct={adjPct} noCommit={row.noCommitment} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Needs attention */}
      {(offTrack.length > 0 || noCommit.length > 0) && (
        <div style={{ background:"#fff5f5", border:"1.5px solid #fca5a5", borderRadius:20, padding:"24px" }}>
          <h2 style={{ margin:"0 0 16px", fontSize:15, fontWeight:800, color:"#991b1b" }}>
            🔴 Needs Attention — {offTrack.length + noCommit.length} LOs
          </h2>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[...offTrack, ...noCommit].map(row => (
              <div key={row.profile_id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12, background:C.white, border:`1px solid #fecaca`, borderRadius:12, padding:"12px 16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,#FF9847,#F37021)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff" }}>
                    {row.full_name.split(" ").map(n=>n[0]).slice(0,2).join("")}
                  </div>
                  <div>
                    <p style={{ margin:0, fontSize:13, fontWeight:800, color:C.ink }}>{row.full_name}</p>
                    <p style={{ margin:"1px 0 0", fontSize:11, color:C.muted }}>
                      {row.noCommitment ? "No commitment submitted" : `${fmt$(row.funded_volume_actual)} / ${fmt$(row.funded_volume_commitment)}`}
                    </p>
                  </div>
                </div>
                {!row.noCommitment && (
                  <p style={{ margin:0, fontSize:15, fontWeight:900, color:"#dc2626" }}>
                    {fmtPct(calcPace(row.funded_volume_actual, row.funded_volume_commitment))}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── HARRY AI Executive Briefing ── */}
      <div style={{ marginTop:28 }}>
        <HarryWidget insightType="executive_briefing" />
      </div>

      <style>{`
        @media (max-width:700px) { .ge-grid-4 { grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}
