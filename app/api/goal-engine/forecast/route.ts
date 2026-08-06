/**
 * GET /api/goal-engine/forecast
 *
 * Phase 1 forecast engine — pace-based linear projection.
 * Returns company forecast, per-LO forecast, application forecast, and confidence score.
 *
 * Phase 2 ready: pipeline stage weights are defined but default to 0 until ARIVE feeds them.
 * Phase 3 ready: Harry AI can overlay narrative on top of these numbers.
 *
 * No business logic or DB schema changes — reads existing tables only.
 */

import { NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import {
  getActiveGoal, getLeaderboard, computeGoalSummary,
  monthProgress, daysRemaining,
} from "@/lib/goal-engine";

export const dynamic = "force-dynamic";

// ── Pipeline stage weights (Phase 2 — stubbed at 0 until ARIVE feeds them) ──
const STAGE_WEIGHTS = {
  funded:             1.00,
  clear_to_close:     0.98,
  closing_scheduled:  0.95,
  loan_approved:      0.85,
  locked:             0.70,
  processing:         0.50,
  application:        0.25,
} as const;

export type ForecastConfidenceTier = "high" | "medium" | "low";

function confidenceTier(score: number): ForecastConfidenceTier {
  if (score >= 85) return "high";
  if (score >= 65) return "medium";
  return "low";
}

function confidenceColor(tier: ForecastConfidenceTier) {
  return tier === "high" ? "#16a34a" : tier === "medium" ? "#d97706" : "#dc2626";
}

/**
 * Compute confidence score (0-100) based on:
 *   - How much of the month has elapsed (more elapsed = more reliable)
 *   - How many LOs have committed (more = better coverage)
 *   - How stable the daily pace has been (stubbed as stable for Phase 1)
 */
function computeConfidence(
  elapsedPct: number,
  participationPct: number,
  hasHistory: boolean,
): number {
  // Weight 1: time elapsed — more data → higher confidence
  const timeScore = Math.min(100, elapsedPct * 100);

  // Weight 2: team participation — more LOs committed → more predictable
  const partScore = Math.min(100, participationPct);

  // Weight 3: history available (future: use variance of daily pace)
  const histScore = hasHistory ? 60 : 30;

  // Weighted average: time is the dominant factor for Phase 1
  const raw = timeScore * 0.55 + partScore * 0.30 + histScore * 0.15;

  // Floor at 15% (always some uncertainty), cap at 98%
  return Math.round(Math.min(98, Math.max(15, raw)));
}

/**
 * Linear pace forecast:
 *   forecastFinish = actual / elapsedPct
 *   (if elapsedPct is tiny, blend with commitment to avoid wild extrapolation)
 */
function linearForecast(actual: number, commitment: number, elapsedPct: number): number {
  if (elapsedPct <= 0) return commitment;
  if (elapsedPct >= 1) return actual;

  const paceProjection = actual / elapsedPct;

  // Blend with commitment when very early in month (< 15% elapsed)
  // to avoid wild swings from first few days
  if (elapsedPct < 0.15) {
    const blend = elapsedPct / 0.15; // 0→1 as we go from 0%→15%
    return Math.round(commitment * (1 - blend) + paceProjection * blend);
  }

  return Math.round(paceProjection);
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile)          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(profile)) return NextResponse.json({ error: "Admin only" },   { status: 403 });

  const goal = await getActiveGoal();
  if (!goal) {
    return NextResponse.json({ forecast: null, lo_forecasts: [], message: "No active goal." });
  }

  const [board, summary] = await Promise.all([
    getLeaderboard(goal.id),
    computeGoalSummary(goal),
  ]);

  const sb = createServiceClient();

  // Fetch daily production for sparkline / trend (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86_400_000).toISOString().split("T")[0];
  const { data: dailyProd } = await sb
    .from("goal_production")
    .select("funded_date, funded_volume, app_volume")
    .eq("goal_month_id", goal.id)
    .eq("is_excluded", false)
    .gte("funded_date", thirtyDaysAgo)
    .order("funded_date", { ascending: true });

  // ── Core numbers ─────────────────────────────────────────────
  const elapsedPct       = monthProgress(goal.start_date, goal.end_date);
  const daysLeft         = daysRemaining(goal.end_date);
  const daysTotal        = Math.ceil((new Date(goal.end_date).getTime() - new Date(goal.start_date).getTime()) / 86_400_000);
  const daysElapsed      = daysTotal - daysLeft;

  const goalVol          = goal.funded_volume_goal;
  const goalUnits        = goal.funded_units_goal;
  const actualVol        = summary.totalActualVolume;
  const actualUnits      = summary.totalActualUnits;
  const committedVol     = summary.totalCommittedVolume;
  const participationPct = summary.totalLOs > 0 ? (summary.participationCount / summary.totalLOs) * 100 : 0;

  // Phase 1 company forecast
  const forecastVol   = linearForecast(actualVol,   committedVol,              elapsedPct);
  const forecastUnits = linearForecast(actualUnits, goal.funded_units_goal,    elapsedPct);
  const forecastGap   = forecastVol - goalVol;

  // Average loan size (from actual data, fall back to $175K)
  const avgLoanSize = actualUnits > 0 ? Math.round(actualVol / actualUnits) : 175_000;

  // Loans needed to close the gap
  const loansToCloseGap = forecastGap < 0 ? Math.ceil(Math.abs(forecastGap) / avgLoanSize) : 0;

  // Company pace % (actual vs required pace at this point in month)
  const requiredPct   = elapsedPct * 100;
  const actualPct     = goalVol > 0 ? (actualVol / goalVol) * 100 : 0;
  const companyPace   = requiredPct > 0 ? (actualPct / requiredPct) * 100 : 0;

  // Application forecast (using app_volume)
  const totalAppVol   = board.reduce((s, r) => s + r.app_volume_actual,   0);
  const totalAppUnits = board.reduce((s, r) => s + r.app_units_actual,    0);
  const appVolGoal    = goal.app_volume_goal  ?? 0;
  const appUnitGoal   = goal.app_units_goal   ?? 0;
  const forecastAppVol   = linearForecast(totalAppVol,   appVolGoal,   elapsedPct);
  const forecastAppUnits = linearForecast(totalAppUnits, appUnitGoal,  elapsedPct);

  // Revenue forecast (2.25% average revenue, 36.7% net margin)
  const AVG_REVENUE_BPS  = 0.0225;
  const NET_MARGIN       = 0.367;
  const projectedRevenue = Math.round(forecastVol * AVG_REVENUE_BPS);
  const projectedNet     = Math.round(projectedRevenue * NET_MARGIN);

  // Confidence
  const confidence     = computeConfidence(elapsedPct, participationPct, (dailyProd?.length ?? 0) > 3);
  const confidenceTierVal = confidenceTier(confidence);

  // ── LO-level forecasts ────────────────────────────────────────
  const loForecasts = board.map(row => {
    const loForecast  = linearForecast(row.funded_volume_actual, row.funded_volume_commitment, elapsedPct);
    const loGap       = loForecast - row.funded_volume_commitment;
    const loPace      = row.funded_volume_commitment > 0
      ? (row.funded_volume_actual / row.funded_volume_commitment) * 100 : 0;
    const loReqPct    = requiredPct;
    const loRelPace   = loPace - loReqPct;    // positive = ahead, negative = behind
    const loConf      = computeConfidence(elapsedPct, row.confidence_pct ?? 80, true);

    return {
      profile_id:               row.profile_id,
      full_name:                row.full_name,
      avatar_url:               row.avatar_url,
      funded_volume_commitment: row.funded_volume_commitment,
      funded_volume_actual:     row.funded_volume_actual,
      funded_units_actual:      row.funded_units_actual,
      forecast_volume:          loForecast,
      forecast_gap:             loGap,
      forecast_pct:             row.funded_volume_commitment > 0 ? Math.round((loForecast / row.funded_volume_commitment) * 100) : 0,
      pace_pct:                 Math.round(loPace),
      relative_pace:            Math.round(loRelPace),
      confidence:               loConf,
      confidence_tier:          confidenceTier(loConf),
    };
  });

  // Sort: biggest forecast gap (most behind) first for risk identification
  const loByRisk       = [...loForecasts].sort((a, b) => a.forecast_gap - b.forecast_gap);
  const topRisk        = loByRisk[0] ?? null;
  const topOpportunity = [...loForecasts].sort((a, b) => b.forecast_pct - a.forecast_pct)[0] ?? null;

  // ── Daily trend for sparkline ────────────────────────────────
  // Aggregate by day
  const dayMap = new Map<string, { funded: number; apps: number }>();
  for (const row of (dailyProd ?? [])) {
    if (!row.funded_date) continue;
    const d = dayMap.get(row.funded_date) ?? { funded: 0, apps: 0 };
    d.funded += row.funded_volume ?? 0;
    d.apps   += row.app_volume    ?? 0;
    dayMap.set(row.funded_date, d);
  }

  // Build running cumulative + forecast line
  const trendDays: Array<{ date: string; daily: number; cumulative: number; forecast: number; goal: number }> = [];
  let running = 0;
  const sortedDays = Array.from(dayMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  for (const [date, vals] of sortedDays) {
    running += vals.funded;
    trendDays.push({
      date,
      daily:       Math.round(vals.funded),
      cumulative:  Math.round(running),
      forecast:    0, // populated client-side
      goal:        goalVol,
    });
  }

  // ── Historical forecast accuracy (stub — will fill from past months) ──
  // Phase 1: return empty array; populated once we have multi-month data
  const historicalAccuracy: Array<{
    month_label: string;
    goal: number;
    forecast_at_15: number;
    actual: number;
    accuracy_pct: number;
  }> = [];

  return NextResponse.json({
    forecast: {
      goal_month_id:   goal.id,
      month_label:     goal.month_label,
      start_date:      goal.start_date,
      end_date:        goal.end_date,

      // Company
      goal_vol:          goalVol,
      goal_units:        goalUnits,
      actual_vol:        actualVol,
      actual_units:      actualUnits,
      committed_vol:     committedVol,
      forecast_vol:      forecastVol,
      forecast_units:    forecastUnits,
      forecast_gap:      forecastGap,
      loans_to_close_gap: loansToCloseGap,
      avg_loan_size:     avgLoanSize,

      // Pace
      elapsed_pct:      Math.round(elapsedPct * 100),
      days_elapsed:     daysElapsed,
      days_total:       daysTotal,
      days_remaining:   daysLeft,
      company_pace:     Math.round(companyPace),
      required_pct:     Math.round(requiredPct),
      actual_pct:       Math.round(actualPct),

      // Confidence
      confidence,
      confidence_tier:  confidenceTierVal,
      confidence_color: confidenceColor(confidenceTierVal),

      // Applications
      app_vol_actual:    totalAppVol,
      app_units_actual:  totalAppUnits,
      app_vol_goal:      appVolGoal,
      app_unit_goal:     appUnitGoal,
      forecast_app_vol:  forecastAppVol,
      forecast_app_units: forecastAppUnits,

      // Revenue (Phase 1 stub)
      avg_revenue_bps:  AVG_REVENUE_BPS,
      projected_revenue: projectedRevenue,
      projected_net:     projectedNet,

      // Team
      participation_count: summary.participationCount,
      total_los:           summary.totalLOs,
      participation_pct:   Math.round(participationPct),

      // Risk / opportunity
      top_risk:        topRisk,
      top_opportunity: topOpportunity,

      // Trend data
      trend_days:       trendDays,
    },
    lo_forecasts:        loForecasts,
    historical_accuracy: historicalAccuracy,
    stage_weights:       STAGE_WEIGHTS,
  });
}
