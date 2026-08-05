/**
 * GET /api/goal-engine/leaderboard?goal_month_id=...
 * Returns leaderboard rows for a given goal month (defaults to active goal).
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { getActiveGoal } from "@/lib/goal-engine-server";

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  let goalMonthId = searchParams.get("goal_month_id");

  if (!goalMonthId) {
    const goal = await getActiveGoal();
    goalMonthId = goal?.id ?? null;
  }
  if (!goalMonthId) {
    return NextResponse.json({ leaderboard: [] });
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("goal_leaderboard")
    .select("*")
    .eq("goal_month_id", goalMonthId)
    .order("funded_volume_actual", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leaderboard: data ?? [] });
}
