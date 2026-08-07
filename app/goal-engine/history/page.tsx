/**
 * /goal-engine/history — LO Monthly Performance History
 */

import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { fmt$, fmtPct, calcPace } from "@/lib/goal-engine";
import Link from "next/link";

export const dynamic = "force-dynamic";

const C = { navy:"#142850", orange:"#F37021", ink:"#1A2B42", muted:"#64748B", line:"#E2E8F0", sand:"#F8FAFC", white:"#ffffff" };

function pct(a: number, b: number) { return b > 0 ? Math.round((a / b) * 100) : 0; }
function bar(p: number) {
  const c = Math.min(100, Math.max(0, p));
  const color = p >= 90 ? "#22c55e" : p >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ background:C.line, borderRadius:99, height:5, overflow:"hidden", minWidth:60 }}>
      <div style={{ height:"100%", width:`${c}%`, background:color }} />
    </div>
  );
}

export default async function HistoryPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/goal-engine-login");

  const sb = createServiceClient();

  // All months with commitments for this LO
  const { data: commitments } = await sb
    .from("goal_commitments")
    .select(`
      *,
      goal_months(
        id, month_label, month_year, month_num,
        funded_volume_goal, funded_units_goal,
        app_volume_goal, app_units_goal,
        start_date, end_date
      )
    `)
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(24);

  // Awards for this LO
  const { data: allAwards } = await sb
    .from("goal_awards")
    .select("goal_month_id, award_label, award_emoji")
    .eq("profile_id", profile.id);

  // Production grouped by goal_month_id
  const goalMonthIds = (commitments ?? []).map(c => c.goal_month_id);
  const { data: allProduction } = goalMonthIds.length
    ? await sb
        .from("goal_production")
        .select("goal_month_id, funded_volume, funded_unit, app_volume, app_unit")
        .eq("profile_id", profile.id)
        .in("goal_month_id", goalMonthIds)
    : { data: [] };

  // Leaderboard positions — single query for all months, no N+1
  const positions: Record<string, number> = {};
  if (goalMonthIds.length > 0) {
    const { data: allBoard } = await sb
      .from("goal_leaderboard")
      .select("goal_month_id, profile_id, funded_volume_actual")
      .in("goal_month_id", goalMonthIds)
      .order("funded_volume_actual", { ascending: false });

    // Group by month and find this LO's rank in each
    if (allBoard) {
      for (const monthId of goalMonthIds) {
        const monthBoard = allBoard.filter(r => r.goal_month_id === monthId);
        const idx = monthBoard.findIndex(r => r.profile_id === profile.id);
        if (idx >= 0) positions[monthId] = idx + 1;
      }
    }
  }

  // Build enriched rows
  type HistoryRow = {
    monthLabel: string;
    fundedCommit: number; fundedActual: number; fundedUnits: number; fundedUnitsCommit: number;
    appCommit: number;    appActual: number;    appUnits: number;    appUnitsCommit: number;
    volumeAchievePct: number; unitAchievePct: number;
    rank: number | null;
    awards: Array<{ award_label: string; award_emoji: string | null }>;
  };

  const rows: HistoryRow[] = (commitments ?? []).map(c => {
    const prod = (allProduction ?? []).filter(p => p.goal_month_id === c.goal_month_id);
    const fundedActual     = prod.reduce((s, r) => s + (r.funded_volume ?? 0), 0);
    const fundedUnits      = prod.reduce((s, r) => s + (r.funded_unit  ?? 0), 0);
    const appActual        = prod.reduce((s, r) => s + (r.app_volume   ?? 0), 0);
    const appUnits         = prod.reduce((s, r) => s + (r.app_unit     ?? 0), 0);
    const awards           = (allAwards ?? []).filter(a => a.goal_month_id === c.goal_month_id);
    return {
      monthLabel:          c.goal_months?.month_label ?? "—",
      fundedCommit:        c.funded_volume_commitment,
      fundedActual,
      fundedUnits,
      fundedUnitsCommit:   c.funded_units_commitment,
      appCommit:           c.app_volume_commitment,
      appActual,
      appUnits,
      appUnitsCommit:      c.app_units_commitment,
      volumeAchievePct:    pct(fundedActual, c.funded_volume_commitment),
      unitAchievePct:      pct(fundedUnits,  c.funded_units_commitment),
      rank:                positions[c.goal_month_id] ?? null,
      awards,
    };
  });

  // Career stats
  const careerFundedVol   = rows.reduce((s, r) => s + r.fundedActual, 0);
  const careerFundedUnits = rows.reduce((s, r) => s + r.fundedUnits, 0);
  const careerAppVol      = rows.reduce((s, r) => s + r.appActual, 0);
  const careerAppUnits    = rows.reduce((s, r) => s + r.appUnits, 0);
  const avgAchieve        = rows.length ? Math.round(rows.reduce((s, r) => s + r.volumeAchievePct, 0) / rows.length) : 0;
  const bestVol           = rows.length ? Math.max(...rows.map(r => r.fundedActual)) : 0;

  return (
    <div style={{ maxWidth:1200, margin:"0 auto", padding:"28px 24px 56px", fontFamily:"Montserrat,system-ui,sans-serif", color:C.ink }}>

      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <Link href="/goal-engine/dashboard" style={{ fontSize:13, fontWeight:700, color:C.muted, textDecoration:"none" }}>← Dashboard</Link>
        <h1 style={{ margin:"14px 0 0", fontSize:28, fontWeight:900, color:C.ink }}>Performance History</h1>
        <p style={{ margin:"4px 0 0", fontSize:14, color:C.muted }}>Your complete SLICE production record</p>
      </div>

      {/* Career KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14, marginBottom:28 }} className="ge-grid-4">
        {[
          { label:"Career Funded Volume",  value:fmt$(careerFundedVol),   navy:true },
          { label:"Career Funded Units",   value:`${careerFundedUnits}`,  sub:"loans" },
          { label:"Career App Volume",     value:fmt$(careerAppVol),      sub:"applications" },
          { label:"Avg Goal Achievement",  value:`${avgAchieve}%`,        sub:`Best: ${fmt$(bestVol)}` },
        ].map(s => (
          <div key={s.label} style={{
            background: s.navy ? C.navy : C.white,
            border: s.navy ? "none" : `1px solid ${C.line}`,
            borderRadius:18, padding:20,
            boxShadow: s.navy ? "0 8px 32px rgba(20,40,80,0.25)" : "0 2px 8px rgba(15,23,42,0.05)",
          }}>
            <p style={{ margin:0, fontSize:9, fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", color: s.navy ? "rgba(255,255,255,0.4)" : C.muted }}>{s.label}</p>
            <p style={{ margin:"6px 0 0", fontSize:24, fontWeight:900, color: s.navy ? "#fff" : C.ink }}>{s.value}</p>
            {s.sub && <p style={{ margin:"3px 0 0", fontSize:11, color: s.navy ? "rgba(255,255,255,0.4)" : C.muted }}>{s.sub}</p>}
          </div>
        ))}
      </div>

      {/* Monthly history table */}
      {rows.length === 0 ? (
        <div style={{ background:C.white, borderRadius:20, border:`1px solid ${C.line}`, padding:"64px 32px", textAlign:"center" }}>
          <div style={{ fontSize:48, marginBottom:16 }}>📊</div>
          <h2 style={{ margin:"0 0 8px", fontSize:20, fontWeight:800, color:C.ink }}>No History Yet</h2>
          <p style={{ margin:"0 0 20px", fontSize:14, color:C.muted }}>Submit your first monthly commitment to start building your history.</p>
          <Link href="/goal-engine/commit" style={{ display:"inline-block", padding:"12px 24px", borderRadius:12, textDecoration:"none", background:"linear-gradient(135deg,#FF9847,#F37021)", color:"#fff", fontSize:13, fontWeight:800 }}>
            Claim My Slice →
          </Link>
        </div>
      ) : (
        <div style={{ background:C.white, borderRadius:24, border:`1px solid ${C.line}`, overflow:"hidden", boxShadow:"0 4px 24px rgba(15,23,42,0.07)" }}>
          <div style={{ padding:"20px 24px", borderBottom:`1px solid ${C.line}` }}>
            <p style={{ margin:0, fontSize:16, fontWeight:800, color:C.ink }}>Monthly Breakdown</p>
            <p style={{ margin:"2px 0 0", fontSize:12, color:C.muted }}>Last {rows.length} months with commitments</p>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse", minWidth:860 }}>
              <thead>
                <tr style={{ background:C.sand }}>
                  {["Month","Funded Actual","Funded Commit","Achieve %","Units","App Actual","App Units","Rank","Awards"].map(h => (
                    <th key={h} style={{ padding:"10px 14px", fontSize:9, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:C.muted, textAlign:"left", borderBottom:`1px solid ${C.line}`, whiteSpace:"nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ borderBottom:`1px solid ${C.line}`, background:C.white }}>
                    <td style={{ padding:"14px 14px", fontWeight:800, color:C.ink, fontSize:13, whiteSpace:"nowrap" as const }}>{r.monthLabel}</td>
                    <td style={{ padding:"14px 14px", fontWeight:900, color:C.ink, fontSize:14 }}>{fmt$(r.fundedActual)}</td>
                    <td style={{ padding:"14px 14px", fontSize:12, color:C.muted }}>{fmt$(r.fundedCommit)}</td>
                    <td style={{ padding:"14px 14px" }}>
                      <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
                        <span style={{ fontSize:14, fontWeight:900, color: r.volumeAchievePct>=100?"#16a34a":r.volumeAchievePct>=70?"#d97706":"#dc2626" }}>
                          {r.volumeAchievePct}%
                        </span>
                        {bar(r.volumeAchievePct)}
                      </div>
                    </td>
                    <td style={{ padding:"14px 14px", fontSize:13, color:C.ink }}>{r.fundedUnits}<span style={{ fontSize:10, color:C.muted }}>/{r.fundedUnitsCommit}</span></td>
                    <td style={{ padding:"14px 14px", fontSize:13, color:C.muted }}>{fmt$(r.appActual)}</td>
                    <td style={{ padding:"14px 14px", fontSize:13, color:C.muted }}>{r.appUnits}</td>
                    <td style={{ padding:"14px 14px", textAlign:"center" }}>
                      {r.rank
                        ? <span style={{ fontSize:14, fontWeight:900, color: r.rank<=3 ? C.orange : C.ink }}>
                            {r.rank<=3 ? ["🥇","🥈","🥉"][r.rank-1] : `#${r.rank}`}
                          </span>
                        : <span style={{ fontSize:12, color:C.muted }}>—</span>
                      }
                    </td>
                    <td style={{ padding:"14px 14px" }}>
                      {r.awards.length > 0
                        ? <div style={{ display:"flex", gap:4, flexWrap:"wrap" }}>
                            {r.awards.slice(0,3).map((a, j) => (
                              <span key={j} title={a.award_label} style={{ fontSize:16 }}>{a.award_emoji ?? "🏆"}</span>
                            ))}
                          </div>
                        : <span style={{ fontSize:12, color:C.muted }}>—</span>
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width:700px) { .ge-grid-4 { grid-template-columns:repeat(2,1fr) !important; } }
      `}</style>
    </div>
  );
}
