/**
 * POST /api/goal-engine/awards
 * Admin: run award engine for a goal month — auto-determines winners,
 * stores awards, sends emails.
 *
 * GET /api/goal-engine/awards?goal_month_id=...
 * Returns awards for a month.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendGoalEmail } from "@/lib/goal-engine-mailer";
import { AWARD_CATALOG, buildAwardEmail, fmt$ } from "@/lib/goal-engine-server";

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const goalMonthId      = searchParams.get("goal_month_id");
  if (!goalMonthId) return NextResponse.json({ awards: [] });

  const sb = createServiceClient();
  const { data } = await sb.from("goal_awards").select("*").eq("goal_month_id", goalMonthId);
  return NextResponse.json({ awards: data ?? [] });
}

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { goal_month_id } = await req.json();
  if (!goal_month_id) return NextResponse.json({ error: "goal_month_id required" }, { status: 400 });

  const sb = createServiceClient();

  // Fetch leaderboard for this goal
  const { data: board } = await sb
    .from("goal_leaderboard")
    .select("*")
    .eq("goal_month_id", goal_month_id)
    .order("funded_volume_actual", { ascending: false });

  if (!board || board.length === 0) {
    return NextResponse.json({ error: "No leaderboard data found." }, { status: 404 });
  }

  const { data: goal } = await sb.from("goal_months").select("*").eq("id", goal_month_id).single();
  if (!goal) return NextResponse.json({ error: "Goal not found." }, { status: 404 });

  const issued: Array<{ profile_id: string; award_type: string; award_label: string; award_emoji: string }> = [];

  // Helper: determine award winner
  async function issueAward(
    awardType: string,
    awardLabel: string,
    awardEmoji: string,
    profileId: string,
    statsSnapshot: Record<string, unknown>,
  ) {
    // Check if already issued
    const { data: existing } = await sb
      .from("goal_awards")
      .select("id")
      .eq("goal_month_id", goal_month_id)
      .eq("award_type", awardType)
      .single();
    if (existing) return; // already issued

    await sb.from("goal_awards").insert({
      goal_month_id,
      profile_id:     profileId,
      award_type:     awardType,
      award_label:    awardLabel,
      award_emoji:    awardEmoji,
      stats_snapshot: statsSnapshot,
    });

    issued.push({ profile_id: profileId, award_type: awardType, award_label: awardLabel, award_emoji: awardEmoji });
  }

  // ── Rule engine ──────────────────────────────────────────────

  // 1. Funded Volume Champion (top by funded volume)
  if (board[0]) {
    await issueAward(
      "funded_champion", "Funded Volume Champion", "🏆",
      board[0].profile_id,
      { funded_volume: board[0].funded_volume_actual, funded_units: board[0].funded_units_actual },
    );
  }

  // 2. Units Champion (most units)
  const byUnits = [...board].sort((a, b) => b.funded_units_actual - a.funded_units_actual);
  if (byUnits[0]?.funded_units_actual > 0) {
    await issueAward(
      "units_champion", "Funded Units Champion", "🏆",
      byUnits[0].profile_id,
      { funded_units: byUnits[0].funded_units_actual },
    );
  }

  // 3. Application Champion (most app volume)
  const byApp = [...board].sort((a, b) => b.app_volume_actual - a.app_volume_actual);
  if (byApp[0]?.app_volume_actual > 0) {
    await issueAward(
      "app_champion", "Application Champion", "🔥",
      byApp[0].profile_id,
      { app_volume: byApp[0].app_volume_actual, app_units: byApp[0].app_units_actual },
    );
  }

  // 4. Best Conversion Rate (funded / app_units, min 3 apps)
  const withConversion = board
    .filter((r) => r.app_units_actual >= 3)
    .map((r) => ({ ...r, rate: r.funded_units_actual / r.app_units_actual }))
    .sort((a, b) => b.rate - a.rate);
  if (withConversion[0]) {
    await issueAward(
      "best_conversion", "Best Conversion Rate", "📈",
      withConversion[0].profile_id,
      { rate: Math.round(withConversion[0].rate * 100), apps: withConversion[0].app_units_actual },
    );
  }

  // 5. Largest Slice (highest commitment)
  const byCommit = [...board].sort((a, b) => b.funded_volume_commitment - a.funded_volume_commitment);
  if (byCommit[0]) {
    await issueAward(
      "largest_slice", "Largest Slice of the Pie", "👑",
      byCommit[0].profile_id,
      { commitment: byCommit[0].funded_volume_commitment },
    );
  }

  // 6. Perfect Goal Achievement (100%+ of commitment)
  const perfect = board.filter((r) =>
    r.funded_volume_commitment > 0 &&
    r.funded_volume_actual >= r.funded_volume_commitment,
  );
  for (const r of perfect) {
    await issueAward(
      `perfect_goal_${r.profile_id}`, "Perfect Goal Achievement", "🎯",
      r.profile_id,
      { pct: Math.round((r.funded_volume_actual / r.funded_volume_commitment) * 100) },
    );
  }

  // 7. Million Dollar Club
  const millionDollar = board.filter((r) => r.funded_volume_actual >= 1_000_000);
  for (const r of millionDollar) {
    await issueAward(
      `million_dollar_${r.profile_id}`, "Million Dollar Club", "💰",
      r.profile_id,
      { funded_volume: r.funded_volume_actual },
    );
  }

  // ── Send award emails ─────────────────────────────────────────
  for (const award of issued) {
    const lo = board.find((r) => r.profile_id === award.profile_id);
    if (!lo) continue;

    const { data: loProfile } = await sb
      .from("profiles")
      .select("email, notify_email, full_name")
      .eq("id", award.profile_id)
      .single();
    if (!loProfile) continue;

    const email = loProfile.notify_email ?? loProfile.email;
    const statsHtml = `
      <p style="margin:0 0 4px;font-size:13px;"><strong>Funded Volume:</strong> ${fmt$(lo.funded_volume_actual)}</p>
      <p style="margin:0 0 4px;font-size:13px;"><strong>Funded Units:</strong> ${lo.funded_units_actual} loans</p>
      <p style="margin:0;font-size:13px;"><strong>Month:</strong> ${goal.month_label}</p>
    `;

    const html = buildAwardEmail(
      loProfile.full_name,
      award.award_label,
      award.award_emoji,
      goal.month_label,
      statsHtml,
    );

    try {
      const subject = `${award.award_emoji} You've Earned: ${award.award_label} — ${goal.month_label}`;
      const { id: resendId } = await sendGoalEmail({ to: email, subject, html });

      await sb.from("goal_awards")
        .update({ email_sent: true })
        .eq("goal_month_id", goal_month_id)
        .eq("profile_id", award.profile_id)
        .eq("award_type", award.award_type);

      await sb.from("goal_email_log").insert({
        goal_month_id,
        profile_id:      award.profile_id,
        email_type:      "award",
        recipient_email: email,
        subject:         `${award.award_emoji} You've Earned: ${award.award_label}`,
        resend_id:       resendId,
      });
    } catch (e) {
      console.error("Award email failed for", email, e);
    }
  }

  return NextResponse.json({ issued: issued.length, awards: issued });
}
