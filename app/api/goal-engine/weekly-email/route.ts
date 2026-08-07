/**
 * POST /api/goal-engine/weekly-email
 * Cron job endpoint — send weekly progress emails to all LOs.
 * Trigger via Vercel Cron (vercel.json) or Supabase Edge Function on Monday 8am.
 *
 * Auth: requires CRON_SECRET header (set as env var)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendGoalEmail } from "@/lib/goal-engine-mailer";
import {
  getActiveLoanOfficers,
  getActiveGoal,
  daysRemaining,
  buildWeeklyProgressEmail,
  buildOffPaceEmail,
  monthProgress,
} from "@/lib/goal-engine-server";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-cron-secret");
  if (CRON_SECRET && auth !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goal = await getActiveGoal();
  if (!goal) return NextResponse.json({ message: "No active goal." });

  const sb   = createServiceClient();
  const los  = await getActiveLoanOfficers();
  const days = daysRemaining(goal.end_date);
  const paceRequired = monthProgress(goal.start_date, goal.end_date) * 100;

  let sent = 0;

  for (const lo of los) {
    const email = lo.notify_email ?? lo.email;

    // Fetch commitment
    const { data: commitment } = await sb
      .from("goal_commitments")
      .select("*")
      .eq("goal_month_id", goal.id)
      .eq("profile_id", lo.id)
      .single();

    if (!commitment) continue; // no commitment = no email

    // Compute actual production — only funded rows that are not excluded
    const { data: prodRows } = await sb
      .from("goal_production")
      .select("funded_volume, funded_unit")
      .eq("goal_month_id", goal.id)
      .eq("profile_id", lo.id)
      .eq("is_excluded", false)
      .in("event_type", ["funded", "correction"]);

    const actualVolume = (prodRows ?? []).reduce((s, r) => s + (r.funded_volume ?? 0), 0);
    const actualUnits  = (prodRows ?? []).reduce((s, r) => s + (r.funded_unit  ?? 0), 0);
    const volumePct    = commitment.funded_volume_commitment > 0
      ? (actualVolume / commitment.funded_volume_commitment) * 100 : 0;

    // Fetch rank
    const { data: board } = await sb
      .from("goal_leaderboard")
      .select("profile_id")
      .eq("goal_month_id", goal.id)
      .order("funded_volume_actual", { ascending: false });

    const rank             = (board ?? []).findIndex((r) => r.profile_id === lo.id) + 1 || 99;
    const totalParticipants = board?.length ?? 1;

    const isOffPace = volumePct < paceRequired - 15; // >15% behind pace

    const html = isOffPace
      ? buildOffPaceEmail(goal, lo.full_name.split(" ")[0], commitment, actualVolume, days)
      : buildWeeklyProgressEmail(
          goal, lo.full_name.split(" ")[0],
          commitment, actualVolume, actualUnits,
          rank, totalParticipants, days,
          paceRequired,    // pass elapsed% so status label is time-adjusted
        );

    const subject = isOffPace
      ? `🔴 You're Falling Behind Your ${goal.month_label} Goal`
      : `📊 Your Weekly ${goal.month_label} Progress Update`;

    try {
      const { id: resendId } = await sendGoalEmail({ to: email, subject, html });

      await sb.from("goal_email_log").insert({
        goal_month_id:   goal.id,
        profile_id:      lo.id,
        email_type:      isOffPace ? "off_pace" : "weekly",
        recipient_email: email,
        subject,
        resend_id:       resendId,
      });
      sent++;
    } catch (e) {
      console.error("Weekly email failed for", email, e);
    }
  }

  return NextResponse.json({ message: `Sent ${sent} weekly emails.` });
}
