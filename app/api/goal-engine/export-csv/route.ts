/**
 * GET /api/goal-engine/export-csv?goal_month_id=<id>
 * Returns a CSV file with the full manager dashboard data for the given goal month.
 * Admin only.
 *
 * Columns: Rank, Name, NMLS, Email, Committed Volume, Funded Volume, Funded Units,
 *          App Volume, App Units, Goal %, Forecast, Commitment Date, Status, Branch
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { getGoalById, getLeaderboard, getActiveLoanOfficers, calcPace, monthProgress, requiredPace } from "@/lib/goal-engine";

function esc(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  // Wrap in quotes if contains comma, quote, or newline
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function fmtDollar(n: number): string {
  return n.toFixed(2);
}

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return new NextResponse("Unauthorized", { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const goalMonthId = searchParams.get("goal_month_id");

  if (!goalMonthId) {
    return new NextResponse("goal_month_id required", { status: 400 });
  }

  const goal = await getGoalById(goalMonthId);
  if (!goal) {
    return new NextResponse("Goal not found", { status: 404 });
  }

  const [leaderboard, allLOs] = await Promise.all([
    getLeaderboard(goalMonthId),
    getActiveLoanOfficers(),
  ]);

  // Fetch emails for all LOs (not in leaderboard row by default)
  const sb = createServiceClient();
  const { data: profileEmails } = await sb
    .from("profiles")
    .select("id, email, branch_id")
    .in("id", allLOs.map(l => l.id));
  const emailMap  = new Map((profileEmails ?? []).map(p => [p.id, p.email]));
  const branchMap = new Map((profileEmails ?? []).map(p => [p.id, (p as Record<string,unknown>).branch_id as string|null]));

  const elapsed     = monthProgress(goal.start_date, goal.end_date);
  const requiredPct = requiredPace(goal.start_date, goal.end_date);

  // Build enriched rows (all LOs, even without commitment)
  const rows = allLOs.map((lo, idx) => {
    const board        = leaderboard.find(r => r.profile_id === lo.id);
    const noCommit     = !board;
    const committed    = board?.funded_volume_commitment ?? 0;
    const funded       = board?.funded_volume_actual     ?? 0;
    const units        = board?.funded_units_actual      ?? 0;
    const appVol       = board?.app_volume_actual        ?? 0;
    const appUnits     = board?.app_units_actual         ?? 0;
    const pct          = committed > 0 ? calcPace(funded, committed) : 0;
    const forecast     = elapsed > 0 ? funded / elapsed : 0;
    const relPace      = pct - requiredPct;
    const status       = noCommit ? "No Commitment"
                       : relPace >= 0     ? "On Pace"
                       : relPace >= -20   ? "Behind"
                       : "Off Track";
    const submittedAt  = board?.submitted_at
      ? new Date(board.submitted_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "";

    return {
      rank:       noCommit ? "" : String(idx + 1),
      name:       lo.full_name,
      nmls:       lo.nmls ?? "",
      email:      emailMap.get(lo.id) ?? "",
      committed:  fmtDollar(committed),
      funded:     fmtDollar(funded),
      units:      String(units),
      app_vol:    fmtDollar(appVol),
      app_units:  String(appUnits),
      goal_pct:   pct > 0 ? `${Math.round(pct)}%` : "0%",
      forecast:   fmtDollar(Math.round(forecast)),
      commit_date: submittedAt,
      status,
      branch:     branchMap.get(lo.id) ?? "",
    };
  }).sort((a, b) => {
    if (!a.rank && b.rank) return 1;
    if (a.rank && !b.rank) return -1;
    return parseFloat(b.funded) - parseFloat(a.funded);
  });

  // Build CSV string
  const headers = [
    "Rank", "Name", "NMLS", "Email",
    "Committed Volume ($)", "Funded Volume ($)", "Funded Units",
    "App Volume ($)", "App Units",
    "Goal %", "Forecast ($)", "Commitment Date", "Status", "Branch",
  ];

  const summaryLines = [
    `SLICE by HCMG — ${goal.month_label} Manager Export`,
    `Company Goal: $${goal.funded_volume_goal.toFixed(0)}`,
    `Unit Goal: ${goal.funded_units_goal} loans`,
    `Generated: ${new Date().toLocaleString("en-US")}`,
    "",
  ];

  const csvRows = [
    summaryLines.join("\n"),
    headers.map(esc).join(","),
    ...rows.map(r => [
      esc(r.rank), esc(r.name), esc(r.nmls), esc(r.email),
      esc(r.committed), esc(r.funded), esc(r.units),
      esc(r.app_vol), esc(r.app_units),
      esc(r.goal_pct), esc(r.forecast), esc(r.commit_date),
      esc(r.status), esc(r.branch),
    ].join(",")),
  ].join("\n");

  const filename = `SLICE-${goal.month_label.replace(/\s+/g, "-")}-${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvRows, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
