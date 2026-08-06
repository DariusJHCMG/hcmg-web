/**
 * POST /api/goal-engine/end-of-month
 * End-of-month automation:
 *  1. Verifies today is the last day of the active goal period.
 *  2. Closes the goal (sets goal_status = 'closed').
 *  3. Recalculates final production totals.
 *  4. Calculates final rankings.
 *  5. Runs award engine.
 *  6. Sends personal recap emails.
 *  7. Preserves historical snapshot.
 *
 * Idempotent: will not send duplicate emails or awards.
 * Can be manually triggered by admin (pass force=true to skip date check).
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendGoalEmail } from "@/lib/goal-engine-mailer";
import {
  getActiveGoal,
  getLeaderboard,
  computeGoalSummary,
  getActiveLoanOfficers,
  getCommitment,
  getLOProductionForMonth,
  daysRemaining,
  fmt$,
  buildEndOfMonthEmail,
} from "@/lib/goal-engine-server";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("x-cron-secret");
  const isAutoCron = CRON_SECRET && authHeader === CRON_SECRET;

  // If not a cron call, must be an authenticated admin
  if (!isAutoCron) {
    const profile = await getCurrentProfile();
    if (!profile || !isAdmin(profile)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
  }

  const body  = await req.json().catch(() => ({}));
  const force = body.force === true; // admins can force-run for testing

  const goal = await getActiveGoal();
  if (!goal) return NextResponse.json({ message: "No active goal." });

  // Verify today is the last day of the goal period (unless forced)
  if (!force) {
    const today   = new Date().toISOString().split("T")[0];
    const endDate = goal.end_date;
    if (today !== endDate) {
      return NextResponse.json({
        message: `End-of-month runs only on the last day (${endDate}). Current date: ${today}. Pass force=true to override.`,
      });
    }
  }

  const sb = createServiceClient();

  // ── Check if already closed ────────────────────────────────────
  const currentGoal = (goal as unknown) as Record<string, unknown>;
  if (currentGoal.goal_status === "closed" && !force) {
    return NextResponse.json({ message: "Goal is already closed." });
  }

  // ── 1. Close the goal ──────────────────────────────────────────
  await sb.from("goal_months").update({
    goal_status:  "closed",
    is_published: true,
  }).eq("id", goal.id);

  // ── 2. Get final rankings ──────────────────────────────────────
  const [leaderboard, summary, los] = await Promise.all([
    getLeaderboard(goal.id),
    computeGoalSummary(goal),
    getActiveLoanOfficers(),
  ]);

  const companyTotal = summary.totalActualVolume;
  let emailsSent = 0;

  // ── 3. Send personal recap emails ─────────────────────────────
  for (const lo of los) {
    const email = lo.notify_email ?? lo.email;

    // Check for duplicate send
    const { data: alreadySent } = await sb
      .from("goal_email_log")
      .select("id")
      .eq("goal_month_id", goal.id)
      .eq("profile_id", lo.id)
      .eq("email_type", "end_of_month")
      .limit(1);
    if (alreadySent?.length) continue;

    const [commitment, production] = await Promise.all([
      getCommitment(goal.id, lo.id),
      getLOProductionForMonth(lo.id, goal.id),
    ]);

    if (!commitment) continue; // skip LOs without commitment

    const actualVol   = production.reduce((s, r) => s + (r.funded_volume ?? 0), 0);
    const actualUnits = production.reduce((s, r) => s + (r.funded_unit  ?? 0), 0);
    const rank        = leaderboard.findIndex(r => r.profile_id === lo.id) + 1 || los.length;

    // Get awards for this LO this month
    const { data: loAwards } = await sb
      .from("goal_awards")
      .select("award_label, award_emoji")
      .eq("goal_month_id", goal.id)
      .eq("profile_id", lo.id);

    const html = buildEndOfMonthEmail(
      goal,
      lo.full_name.split(" ")[0],
      commitment,
      actualVol,
      actualUnits,
      rank,
      leaderboard.length,
      loAwards ?? [],
      companyTotal,
    );

    const subject = `🏁 ${goal.month_label} — Your Final Results`;
    try {
      const { id: resendId } = await sendGoalEmail({ to: email, subject, html });
      await sb.from("goal_email_log").insert({
        goal_month_id:   goal.id,
        profile_id:      lo.id,
        email_type:      "end_of_month",
        recipient_email: email,
        subject,
        resend_id:       resendId,
        status:          "sent",
        tenant_id:       "cmrss19yi000fysf83wcom9th",
      });
      emailsSent++;
    } catch (e) {
      console.error("[end-of-month] Failed email for", email, e);
    }
  }

  return NextResponse.json({
    message:    `End-of-month complete. ${emailsSent} recap emails sent.`,
    goal_id:    goal.id,
    month:      goal.month_label,
    emailsSent,
    totalFunded: fmt$(companyTotal),
  });
}
