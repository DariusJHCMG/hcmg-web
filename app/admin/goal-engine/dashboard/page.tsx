/**
 * /admin/goal-engine/dashboard — Manager / Executive Dashboard
 * Full visibility into all LOs, commitments, production, pace, and needs attention.
 */

import { redirect } from "next/navigation";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import {
  getActiveGoal,
  getAllGoals,
  getLeaderboard,
  computeGoalSummary,
  getAllCommitmentsForGoal,
  getActiveLoanOfficers,
  fmt$,
  fmtPct,
  daysRemaining,
  calcPace,
  requiredPace,
  monthProgress,
} from "@/lib/goal-engine";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { LeaderboardRow } from "@/lib/database.types";

export const dynamic = "force-dynamic";

function ProgressBar({ pct, sm }: { pct: number; sm?: boolean }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const color   = pct >= 90 ? "#22c55e" : pct >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div className={`w-full bg-gray-100 rounded-full overflow-hidden ${sm ? "h-1.5" : "h-2.5"}`}>
      <div className="h-full rounded-full transition-all" style={{ width: `${clamped}%`, backgroundColor: color }} />
    </div>
  );
}

function PaceChip({ pct }: { pct: number }) {
  if (pct >= 90) return <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-bold text-green-700">🟢 On Pace</span>;
  if (pct >= 70) return <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-[10px] font-bold text-yellow-700">🟡 Behind</span>;
  return <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-700">🔴 Off Track</span>;
}

export default async function AdminGoalDashboard() {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) redirect("/admin");

  const goal = await getActiveGoal();

  if (!goal) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/goal-engine" className="text-sm font-semibold text-muted hover:text-accent">← Goal Engine</Link>
        </div>
        <div className="rounded-2xl border border-line bg-white p-10 text-center">
          <p className="text-4xl mb-4">📊</p>
          <h2 className="text-lg font-bold text-ink mb-2">No Active Goal</h2>
          <p className="text-sm text-muted mb-4">Create and publish a monthly goal to see the manager dashboard.</p>
          <Link href="/admin/goal-engine" className="inline-flex rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white">
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

  const sb = createServiceClient();

  // Enrich each LO with production data
  const enrichedRows: Array<LeaderboardRow & {
    relativePace: number;
    noCommitment: boolean;
    forecast: number;
  }> = [];

  const requiredPct = requiredPace(goal.start_date, goal.end_date);
  const elapsed     = monthProgress(goal.start_date, goal.end_date);
  const days        = daysRemaining(goal.end_date);

  for (const lo of allLOs) {
    const boardRow = leaderboard.find((r) => r.profile_id === lo.id);
    const noCommitment = !boardRow;

    // Build synthetic row if not in leaderboard
    const row: LeaderboardRow = boardRow ?? {
      goal_month_id:            goal.id,
      profile_id:               lo.id,
      full_name:                lo.full_name,
      avatar_url:               lo.avatar_url,
      nmls:                     lo.nmls,
      funded_volume_commitment: 0,
      funded_units_commitment:  0,
      app_volume_commitment:    0,
      app_units_commitment:     0,
      confidence_pct:           null,
      submitted_at:             null,
      funded_volume_actual:     0,
      funded_units_actual:      0,
      app_volume_actual:        0,
      app_units_actual:         0,
    };

    const volumePace  = row.funded_volume_commitment > 0
      ? calcPace(row.funded_volume_actual, row.funded_volume_commitment) : 0;
    const relativePace = volumePace - requiredPct; // positive = on pace

    // Forecast: extrapolate current pace to end of month
    const forecast = elapsed > 0
      ? (row.funded_volume_actual / elapsed)
      : 0;

    enrichedRows.push({ ...row, relativePace, noCommitment, forecast });
  }

  // Sort: on pace first, then behind, then off track, then no commitment
  enrichedRows.sort((a, b) => {
    if (a.noCommitment && !b.noCommitment) return 1;
    if (!a.noCommitment && b.noCommitment) return -1;
    return b.funded_volume_actual - a.funded_volume_actual;
  });

  const onPace    = enrichedRows.filter((r) => !r.noCommitment && r.relativePace >= 0);
  const behind    = enrichedRows.filter((r) => !r.noCommitment && r.relativePace < 0 && r.relativePace >= -20);
  const offTrack  = enrichedRows.filter((r) => !r.noCommitment && r.relativePace < -20);
  const noCommit  = enrichedRows.filter((r) => r.noCommitment);

  const totalForecast = enrichedRows.reduce((s, r) => s + r.forecast, 0);
  const participationPct = allLOs.length > 0
    ? Math.round((commitments.filter((c) => c.submitted_at).length / allLOs.length) * 100) : 0;

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin/goal-engine" className="text-sm font-semibold text-muted hover:text-accent">← Goal Engine</Link>
          <h1 className="mt-3 text-2xl font-extrabold text-ink">Manager Dashboard</h1>
          <p className="mt-0.5 text-sm text-muted">{goal.month_label} · {days} days remaining</p>
        </div>
      </div>

      {/* Executive Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-line bg-[#142850] p-5 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-1">Company Funded Goal</p>
          <p className="text-2xl font-extrabold">{fmt$(goal.funded_volume_goal)}</p>
          <p className="text-xs text-blue-300 mt-0.5">{goal.funded_units_goal} loans</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted/70 mb-1">Actual Funded</p>
          <p className="text-2xl font-extrabold ok-gradient-text">{fmt$(summary.totalActualVolume)}</p>
          <p className="text-xs text-muted mt-0.5">{fmtPct(summary.volumePct)} of goal · {summary.totalActualUnits} loans</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted/70 mb-1">Total Committed</p>
          <p className="text-2xl font-extrabold text-ink">{fmt$(summary.totalCommittedVolume)}</p>
          <p className="text-xs text-muted mt-0.5">{fmtPct(summary.commitVsGoalPct)} vs goal</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted/70 mb-1">Forecast</p>
          <p className="text-2xl font-extrabold text-ink">{fmt$(totalForecast)}</p>
          <p className="text-xs text-muted mt-0.5">at current pace</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted/70 mb-1">Participation</p>
          <p className="text-2xl font-extrabold text-ink">{participationPct}%</p>
          <p className="text-xs text-muted mt-0.5">{commitments.filter((c) => c.submitted_at).length}/{allLOs.length} LOs committed</p>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted/70 mb-1">Days Left</p>
          <p className="text-2xl font-extrabold text-ink">{days}</p>
          <p className="text-xs text-muted mt-0.5">{fmtPct(requiredPct)} of month elapsed</p>
        </div>
        <div className="rounded-2xl border border-line bg-green-50 border-green-200 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-700 mb-1">On Pace</p>
          <p className="text-2xl font-extrabold text-green-700">{onPace.length}</p>
        </div>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-red-700 mb-1">Need Attention</p>
          <p className="text-2xl font-extrabold text-red-600">{offTrack.length + noCommit.length}</p>
        </div>
      </div>

      {/* Company Progress */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted/70 mb-3">Company Goal Progress</p>
        <ProgressBar pct={summary.volumePct} />
        <div className="mt-2 flex items-center justify-between text-xs text-muted">
          <span>{fmt$(summary.totalActualVolume)} funded</span>
          <span className="font-bold">{fmtPct(summary.volumePct)}</span>
          <span>{fmt$(goal.funded_volume_goal)} goal</span>
        </div>
      </div>

      {/* All LO Table */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-ink">All Loan Officers</h2>
            <p className="text-xs text-muted">Full production visibility with pace tracking</p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full bg-green-50 border border-green-200 px-2.5 py-1 text-[10px] font-bold text-green-700">
              🟢 {onPace.length} On Pace
            </span>
            <span className="rounded-full bg-yellow-50 border border-yellow-200 px-2.5 py-1 text-[10px] font-bold text-yellow-700">
              🟡 {behind.length} Behind
            </span>
            <span className="rounded-full bg-red-50 border border-red-200 px-2.5 py-1 text-[10px] font-bold text-red-700">
              🔴 {offTrack.length} Off Track
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-sand text-[10px] font-bold uppercase tracking-[0.12em] text-muted/70">
                <th className="px-5 py-3 text-left w-8">#</th>
                <th className="px-5 py-3 text-left">Loan Officer</th>
                <th className="px-5 py-3 text-right">Committed</th>
                <th className="px-5 py-3 text-right">Funded</th>
                <th className="px-5 py-3 text-right">Units</th>
                <th className="px-5 py-3 text-right">Goal %</th>
                <th className="px-5 py-3 text-right">Forecast</th>
                <th className="px-5 py-3 text-right">Difference</th>
                <th className="px-5 py-3 text-left w-28">Status</th>
              </tr>
            </thead>
            <tbody>
              {enrichedRows.map((row, i) => {
                const pct = row.funded_volume_commitment > 0
                  ? calcPace(row.funded_volume_actual, row.funded_volume_commitment) : 0;
                const diff = row.funded_volume_actual - row.funded_volume_commitment;

                return (
                  <tr
                    key={row.profile_id}
                    className={`border-b border-line last:border-0 hover:bg-sand/50 transition-colors ${row.noCommitment ? "opacity-60" : ""}`}
                  >
                    <td className="px-5 py-3.5 text-sm font-extrabold text-muted/60">
                      {row.noCommitment ? "–" : (medals[i] ?? `${i + 1}`)}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        {row.avatar_url ? (
                          <img src={row.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover object-top border border-line" />
                        ) : (
                          <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white"
                            style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                            {row.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                          </span>
                        )}
                        <div>
                          <p className="font-bold text-ink">{row.full_name}</p>
                          {row.nmls && <p className="text-[10px] text-muted">NMLS# {row.nmls}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-muted">
                      {row.noCommitment ? <span className="text-yellow-600 font-semibold">No commitment</span> : fmt$(row.funded_volume_commitment)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-ink">{fmt$(row.funded_volume_actual)}</td>
                    <td className="px-5 py-3.5 text-right font-bold text-ink">{row.funded_units_actual}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`font-extrabold ${pct >= 100 ? "text-green-600" : pct >= 70 ? "text-yellow-600" : row.noCommitment ? "text-muted" : "text-red-500"}`}>
                        {row.noCommitment ? "—" : fmtPct(pct)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right text-sm text-ink">{fmt$(row.forecast)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span className={`text-sm font-semibold ${diff >= 0 ? "text-green-600" : "text-red-500"}`}>
                        {row.noCommitment ? "—" : (diff >= 0 ? "+" : "") + fmt$(diff)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {row.noCommitment
                        ? <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">No Commit</span>
                        : <PaceChip pct={pct - requiredPct + 100} />
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Needs Attention Section */}
      {(offTrack.length > 0 || noCommit.length > 0) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="font-bold text-red-900 mb-4">🔴 Needs Attention ({offTrack.length + noCommit.length})</h2>
          <div className="space-y-3">
            {[...offTrack, ...noCommit].map((row) => (
              <div key={row.profile_id} className="flex items-center justify-between gap-4 rounded-xl bg-white border border-red-100 px-4 py-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white"
                    style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                    {row.full_name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </span>
                  <div>
                    <p className="font-bold text-ink">{row.full_name}</p>
                    <p className="text-xs text-muted">
                      {row.noCommitment ? "No commitment submitted" : `Funded: ${fmt$(row.funded_volume_actual)} / ${fmt$(row.funded_volume_commitment)}`}
                    </p>
                  </div>
                </div>
                {!row.noCommitment && (
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-red-600">
                      {fmtPct(calcPace(row.funded_volume_actual, row.funded_volume_commitment))}
                    </p>
                    <p className="text-xs text-muted">of goal</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
