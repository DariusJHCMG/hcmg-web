/**
 * POST /api/goal-engine/goals
 * Admin/CLO: create a monthly goal
 *
 * GET /api/goal-engine/goals
 * Returns all goals (admin) or published goals (LO)
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendGoalEmail } from "@/lib/goal-engine-mailer";
import {
  getActiveLoanOfficers,
  buildAnnouncementEmail,
} from "@/lib/goal-engine-server";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createServiceClient();
  let query = sb.from("goal_months").select("*").order("month_year", { ascending: false }).order("month_num", { ascending: false });

  if (!isAdmin(profile)) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goals: data ?? [] });
}

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const {
    month_label, month_year, month_num,
    funded_volume_goal, funded_units_goal,
    app_volume_goal, app_units_goal,
    clo_message, awards_enabled,
    start_date, end_date,
    is_published,
  } = body;

  if (!month_label || !month_year || !month_num || !start_date || !end_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb.from("goal_months").insert({
    month_label,
    month_year,
    month_num,
    funded_volume_goal:  funded_volume_goal  ?? 0,
    funded_units_goal:   funded_units_goal   ?? 0,
    app_volume_goal:     app_volume_goal     ?? 0,
    app_units_goal:      app_units_goal      ?? 0,
    clo_message:         clo_message         ?? null,
    awards_enabled:      awards_enabled      ?? true,
    start_date,
    end_date,
    is_published:        is_published        ?? false,
    created_by:          profile.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If published → send announcement emails
  if (is_published && data) {
    await sendAnnouncementEmails(data);
  }

  return NextResponse.json({ goal: data }, { status: 201 });
}

// ── Shared: send announcement to all active LOs ───────────────
export async function sendAnnouncementEmails(goal: Record<string, unknown>) {
  const sb  = createServiceClient();
  const los = await getActiveLoanOfficers();

  for (const lo of los) {
    const email   = lo.notify_email ?? lo.email;
    const subject = `🥧 What's Your Slice of the Pie? — ${goal.month_label}`;
    const commitUrl = `${SITE}/goal-engine/commit`;

    const html = buildAnnouncementEmail(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      goal as any,
      lo.full_name.split(" ")[0],
      commitUrl,
    );

    try {
      const { id: resendId } = await sendGoalEmail({ to: email, subject, html });

      await sb.from("goal_email_log").insert({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        goal_month_id:   (goal as any).id,
        profile_id:      lo.id,
        email_type:      "announcement",
        recipient_email: email,
        subject,
        resend_id:       resendId,
      });
    } catch (e) {
      console.error("Failed to send announcement email to", email, e);
    }
  }

  // Mark emails sent
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await sb.from("goal_months").update({ emails_sent: true }).eq("id", (goal as any).id);
}
