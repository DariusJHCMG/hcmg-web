/**
 * POST /api/goal-engine/commitment-reminder
 * Automated commitment reminder cron.
 * - Runs daily via Vercel Cron.
 * - Sends initial reminder 3 days after goal published (if no commitment).
 * - Sends final reminder 2 days before commitment_deadline (if still no commitment).
 * - Idempotent via goal_reminder_log table.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { sendGoalEmail } from "@/lib/goal-engine-mailer";
import { buildReminderEmail, getActiveGoal, getActiveLoanOfficers } from "@/lib/goal-engine-server";

const CRON_SECRET = process.env.CRON_SECRET ?? "";
const SITE        = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

export async function POST(req: NextRequest) {
  const auth = req.headers.get("x-cron-secret");
  if (CRON_SECRET && auth !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const goal = await getActiveGoal();
  if (!goal) return NextResponse.json({ message: "No active goal." });

  const sb       = createServiceClient();
  const los      = await getActiveLoanOfficers();
  const today    = new Date();
  const published = new Date(goal.start_date);
  const daysSincePublish = Math.floor((today.getTime() - published.getTime()) / 86_400_000);

  // Determine deadline: use commitment_deadline if set, else end_date - 10 days
  const deadlineStr = ((goal as unknown) as Record<string, unknown>).commitment_deadline as string | null ?? null;
  const deadline    = deadlineStr
    ? new Date(deadlineStr)
    : new Date(new Date(goal.end_date).getTime() - 10 * 86_400_000);
  const daysToDeadline = Math.floor((deadline.getTime() - today.getTime()) / 86_400_000);

  const commitUrl = `${SITE}/goal-engine/commit`;
  let sent = 0;

  for (const lo of los) {
    // Check if already committed
    const { data: existing } = await sb
      .from("goal_commitments")
      .select("id")
      .eq("goal_month_id", goal.id)
      .eq("profile_id", lo.id)
      .single();

    if (existing) continue; // already committed — no reminder needed

    const email = lo.notify_email ?? lo.email;

    // Determine which stage to send
    let stage: "initial" | "final" | null = null;
    if (daysToDeadline >= 0 && daysToDeadline <= 2)           stage = "final";
    else if (daysSincePublish >= 3 && daysSincePublish < 10)  stage = "initial";
    if (!stage) continue;

    // Idempotency check
    const { data: alreadySent } = await sb
      .from("goal_reminder_log")
      .select("id")
      .eq("goal_month_id", goal.id)
      .eq("profile_id", lo.id)
      .eq("reminder_stage", stage)
      .single();

    if (alreadySent) continue;

    const subject = stage === "final"
      ? `⏰ Final Reminder: Claim Your Slice Before the Deadline — ${goal.month_label}`
      : `⏰ You Haven't Claimed Your Slice Yet — ${goal.month_label}`;

    const html = buildReminderEmail(goal, lo.full_name.split(" ")[0], commitUrl);

    try {
      const { id: resendId } = await sendGoalEmail({ to: email, subject, html });

      // Log reminder (idempotency)
      await sb.from("goal_reminder_log").insert({
        goal_month_id:  goal.id,
        profile_id:     lo.id,
        reminder_stage: stage,
      });

      // Log email
      await sb.from("goal_email_log").insert({
        goal_month_id:   goal.id,
        profile_id:      lo.id,
        email_type:      `reminder_${stage}`,
        recipient_email: email,
        subject,
        resend_id:       resendId,
        status:          "sent",
        tenant_id:       (goal as unknown as Record<string,unknown>).tenant_id ?? null,
      });

      sent++;
    } catch (e) {
      console.error("[commitment-reminder] Failed to send to", email, e);
    }
  }

  return NextResponse.json({ message: `Sent ${sent} commitment reminders.` });
}
