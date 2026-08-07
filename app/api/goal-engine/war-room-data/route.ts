/**
 * GET /api/goal-engine/war-room-data
 * Returns aggregated war room data for the TV display.
 * No auth required (public company data only — no individual sensitive data).
 */

import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getActiveGoal, computeGoalSummary } from "@/lib/goal-engine";

export const dynamic = "force-dynamic";

export async function GET() {
  const sb   = createServiceClient();
  const goal = await getActiveGoal();

  if (!goal) {
    return NextResponse.json({
      goal: null, summary: null,
      leaderboard: [], todayActivity: { funded:0, fundedUnits:0, apps:0, appUnits:0 },
    });
  }

  const today = new Date().toISOString().split("T")[0];

  const [summary, board, todayProd] = await Promise.all([
    computeGoalSummary(goal),
    sb.from("goal_leaderboard")
      .select("profile_id, full_name, avatar_url, funded_volume_commitment, funded_volume_actual, funded_units_actual, app_volume_actual, app_units_actual")
      .eq("goal_month_id", goal.id)
      .order("funded_volume_commitment", { ascending: false })
      .order("funded_volume_actual",     { ascending: false }),
    sb.from("goal_production")
      .select("funded_volume, funded_unit, app_volume, app_unit")
      .eq("goal_month_id", goal.id)
      .eq("funded_date", today),
  ]);

  const todayData = todayProd.data ?? [];
  const todayActivity = {
    funded:      todayData.reduce((s, r) => s + (r.funded_volume ?? 0), 0),
    fundedUnits: todayData.reduce((s, r) => s + (r.funded_unit  ?? 0), 0),
    apps:        todayData.reduce((s, r) => s + (r.app_volume   ?? 0), 0),
    appUnits:    todayData.reduce((s, r) => s + (r.app_unit     ?? 0), 0),
  };

  return NextResponse.json({
    goal: {
      id:                  goal.id,
      month_label:         goal.month_label,
      funded_volume_goal:  goal.funded_volume_goal,
      funded_units_goal:   goal.funded_units_goal,
      app_volume_goal:     goal.app_volume_goal,
      app_units_goal:      goal.app_units_goal,
      start_date:          goal.start_date,
      end_date:            goal.end_date,
    },
    summary: {
      totalActualVolume:    summary.totalActualVolume,
      totalActualUnits:     summary.totalActualUnits,
      totalActualAppVolume: (board.data ?? []).reduce((s, r) => s + ((r as {app_volume_actual?:number}).app_volume_actual ?? 0), 0),
      totalActualAppUnits:  (board.data ?? []).reduce((s, r) => s + ((r as {app_units_actual?:number}).app_units_actual ?? 0), 0),
      totalCommittedVolume: summary.totalCommittedVolume,
      totalCommittedUnits:  summary.totalCommittedUnits,
      participationCount:   summary.participationCount,
      totalLOs:             summary.totalLOs,
      volumePct:            summary.volumePct,
    },
    leaderboard:   board.data ?? [],
    todayActivity,
  });
}
