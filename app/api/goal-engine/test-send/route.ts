/**
 * POST /api/goal-engine/test-send
 * Admin only — sends ALL 7 email templates to the test address so
 * you can preview every email before going live.
 *
 * Also accepts ?template=announcement|reminder|weekly|off_pace|milestone|end_of_month|award
 * to send just one specific template.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { TEST_EMAIL } from "@/lib/goal-engine-mailer";
import {
  buildAnnouncementEmail,
  buildReminderEmail,
  buildWeeklyProgressEmail,
  buildOffPaceEmail,
  buildCompanyMilestoneEmail,
  buildEndOfMonthEmail,
  buildAwardEmail,
  getActiveGoal,
  fmt$,
} from "@/lib/goal-engine-server";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE   = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

// Realistic dummy data used when no real goal/commitment exists
const DEMO_GOAL = {
  id:                 "demo-goal-id",
  month_label:        "August 2025",
  month_year:         2025,
  month_num:          8,
  funded_volume_goal: 20_000_000,
  funded_units_goal:  60,
  app_volume_goal:    40_000_000,
  app_units_goal:     120,
  clo_message:        "This month we are attacking purchases and DSCR. Every loan officer needs to own a piece of this goal. Let's set the record.",
  awards_enabled:     true,
  start_date:         "2025-08-01",
  end_date:           "2025-08-31",
  emails_sent:        false,
  is_published:       true,
  created_by:         null,
  email_send_at:      null,
  created_at:         new Date().toISOString(),
  updated_at:         new Date().toISOString(),
};

const DEMO_COMMITMENT = {
  id:                       "demo-commitment-id",
  goal_month_id:            "demo-goal-id",
  profile_id:               "demo-profile-id",
  funded_volume_commitment: 1_500_000,
  funded_units_commitment:  6,
  app_volume_commitment:    3_000_000,
  app_units_commitment:     12,
  biggest_focus:            "Doubling down on realtor referrals and DSCR investors.",
  biggest_challenge:        "Rate volatility making borrowers hesitant.",
  confidence_pct:           85,
  comments:                 null,
  digital_agreement:        true,
  locked:                   true,
  submitted_at:             new Date().toISOString(),
  created_at:               new Date().toISOString(),
  updated_at:               new Date().toISOString(),
};

async function send(subject: string, html: string, tag: string) {
  const { data } = await resend.emails.send({
    from:    "Darius James <darius@hcmgloans.com>",
    to:      TEST_EMAIL,
    subject: `[PREVIEW: ${tag}] ${subject}`,
    html,
  });
  return data?.id ?? null;
}

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const only = searchParams.get("template"); // optional filter

  // Try to use real active goal, fall back to demo
  const sb          = createServiceClient();
  const realGoal    = await getActiveGoal();
  const goal        = realGoal ?? (DEMO_GOAL as any);
  const name        = profile.full_name;
  const commitUrl   = `${SITE}/goal-engine/commit`;

  // Try to get real commitment for the current user
  let commitment = DEMO_COMMITMENT as any;
  if (realGoal) {
    const { data: c } = await sb
      .from("goal_commitments")
      .select("*")
      .eq("goal_month_id", realGoal.id)
      .eq("profile_id", profile.id)
      .single();
    if (c) commitment = c;
  }

  const results: Array<{ template: string; id: string | null; to: string }> = [];

  async function maybeRun(key: string, label: string, fn: () => Promise<void>) {
    if (only && only !== key) return;
    await fn();
    console.log(`[test-send] sent ${key}`);
  }

  // 1. Announcement
  await maybeRun("announcement", "Announcement", async () => {
    const html = buildAnnouncementEmail(goal, name, commitUrl);
    const id   = await send(`🥧 What's Your Slice of the Pie? — ${goal.month_label}`, html, "1/7 ANNOUNCEMENT");
    results.push({ template: "announcement", id, to: TEST_EMAIL });
  });

  // 2. Reminder
  await maybeRun("reminder", "Reminder", async () => {
    const html = buildReminderEmail(goal, name, commitUrl);
    const id   = await send(`⏰ You Haven't Claimed Your Slice Yet — ${goal.month_label}`, html, "2/7 REMINDER");
    results.push({ template: "reminder", id, to: TEST_EMAIL });
  });

  // 3. Weekly Progress
  await maybeRun("weekly", "Weekly Progress", async () => {
    const actualVol   = 680_000;
    const actualUnits = 3;
    const html = buildWeeklyProgressEmail(goal, name, commitment, actualVol, actualUnits, 2, 8, 18);
    const id   = await send(`📊 Your Weekly ${goal.month_label} Progress Update`, html, "3/7 WEEKLY");
    results.push({ template: "weekly", id, to: TEST_EMAIL });
  });

  // 4. Off-Pace Alert
  await maybeRun("off_pace", "Off-Pace Alert", async () => {
    const html = buildOffPaceEmail(goal, name, commitment, 320_000, 18);
    const id   = await send(`🔴 You're Falling Behind Your ${goal.month_label} Goal`, html, "4/7 OFF-PACE");
    results.push({ template: "off_pace", id, to: TEST_EMAIL });
  });

  // 5. Company Milestone (75%)
  await maybeRun("milestone", "Company Milestone", async () => {
    const html = buildCompanyMilestoneEmail(goal, name, 75, 15_000_000);
    const id   = await send(`🎉 We've Hit 75% of Our ${goal.month_label} Goal!`, html, "5/7 MILESTONE");
    results.push({ template: "milestone", id, to: TEST_EMAIL });
  });

  // 6. End of Month Recap
  await maybeRun("end_of_month", "End of Month", async () => {
    const awards = [
      { award_label: "Funded Volume Champion", award_emoji: "🏆" },
      { award_label: "Million Dollar Club",    award_emoji: "💰" },
    ];
    const html = buildEndOfMonthEmail(goal, name, commitment, 1_620_000, 7, 1, 8, awards, 22_400_000);
    const id   = await send(`🏁 ${goal.month_label} — Final Results`, html, "6/7 END OF MONTH");
    results.push({ template: "end_of_month", id, to: TEST_EMAIL });
  });

  // 7. Award Notification
  await maybeRun("award", "Award", async () => {
    const statsHtml = `
      <p style="margin:0 0 4px;font-size:13px;"><strong>Funded Volume:</strong> ${fmt$(1_620_000)}</p>
      <p style="margin:0 0 4px;font-size:13px;"><strong>Funded Units:</strong> 7 loans</p>
      <p style="margin:0;font-size:13px;"><strong>Month:</strong> ${goal.month_label}</p>
    `;
    const html = buildAwardEmail(profile.full_name, "Funded Volume Champion", "🏆", goal.month_label, statsHtml);
    const id   = await send(`🏆 You've Earned: Funded Volume Champion — ${goal.month_label}`, html, "7/7 AWARD");
    results.push({ template: "award", id, to: TEST_EMAIL });
  });

  return NextResponse.json({
    message:  `Sent ${results.length} template(s) to ${TEST_EMAIL}`,
    testMode: true,
    sentTo:   TEST_EMAIL,
    results,
  });
}
