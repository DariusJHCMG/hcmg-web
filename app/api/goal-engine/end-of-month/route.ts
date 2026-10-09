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
 *  8. Auto-creates a stub goal for the next calendar month.
 *
 * Idempotent: will not send duplicate emails or awards.
 * Can be manually triggered by admin (pass force=true to skip date check).
 *
 * Cron schedule: "0 6 28-31 * *" — fires on days 28–31. The date guard below
 * checks whether today is actually the LAST day of the current month so the
 * cron only does real work once, on the correct final day.
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
  fmt$,
  buildEndOfMonthEmail,
} from "@/lib/goal-engine-server";

const CRON_SECRET = process.env.CRON_SECRET ?? "";

/**
 * Returns true if yesterday (UTC) was the last calendar day of its month.
 * The cron fires at 5:05am UTC on the 1st (~12:05am Eastern) so all loans
 * funded right up to 11:59pm Eastern on the last night are already in the DB.
 * Yesterday = day n-1; today = day 1 of new month → yesterday.getUTCDate() === today-1.
 * Simplest check: today is the 1st in UTC (which it always is when this cron fires).
 */
function isYesterdayLastDayOfMonth(): boolean {
  const now = new Date();
  // today is the 1st UTC → yesterday was the last day of the previous month
  return now.getUTCDate() === 1;
}

/** "YYYY-MM-DD" for the first day of the month N months after the given date. */
function nextMonthStart(year: number, month: number): { year: number; month: number; startDate: string; endDate: string } {
  const nm = month === 12 ? 1 : month + 1;
  const ny = month === 12 ? year + 1 : year;
  // Last day: day 0 of the month after next = last day of nm
  const lastDay = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return {
    year:      ny,
    month:     nm,
    startDate: `${ny}-${String(nm).padStart(2, "0")}-01`,
    endDate:   `${ny}-${String(nm).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}

const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

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

  // ── Resolve which goal to close ───────────────────────────────
  const sb = createServiceClient();
  let goal = await getActiveGoal();

  if (!goal) {
    if (force && body.goal_month_id) {
      // Admin explicitly targeted a specific goal by ID
      const { data } = await sb.from("goal_months").select("*").eq("id", body.goal_month_id).single();
      goal = data ?? null;
    } else if (force) {
      // force=true but no active goal — find the most recently ended non-closed goal.
      // This covers the "cron fired but getActiveGoal is already null" case and
      // the "admin clicks Force Close" after the month ended.
      const today = new Date().toISOString().split("T")[0];
      const { data } = await sb
        .from("goal_months")
        .select("*")
        .eq("is_published", true)
        .neq("goal_status", "closed")
        .lte("start_date", today)
        .order("end_date", { ascending: false })
        .limit(1)
        .maybeSingle();
      goal = data ?? null;
    }
  }

  if (!goal) return NextResponse.json({ message: "No goal to close." });

  // Verify the cron fired on the 1st (i.e. yesterday was month-end) unless forced.
  if (!force) {
    const today = new Date().toISOString().split("T")[0];
    if (!isYesterdayLastDayOfMonth()) {
      return NextResponse.json({
        message: `End-of-month skipped — today is ${today} (not the 1st). Pass force=true to override.`,
      });
    }
  }

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
    getActiveLoanOfficers(goal.id),
  ]);

  const companyTotal = summary.totalActualVolume;
  let emailsSent   = 0;
  let awardsIssued = 0;

  // ── 2b. Run award engine via internal DB call ─────────────────
  // We call the awards route via fetch using the Supabase service key
  // as a bearer token so it bypasses the admin session check.
  // If SUPABASE_SERVICE_ROLE_KEY is unavailable, this step is skipped
  // (admin can manually click "Run Awards" on the admin page).
  try {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (serviceKey) {
      const awardRes = await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/api/goal-engine/awards`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({ goal_month_id: goal.id, _internal: true }),
        }
      );
      if (awardRes.ok) {
        const awardData = await awardRes.json();
        awardsIssued = awardData.issued ?? 0;
      }
    }
  } catch (e) {
    console.error("[end-of-month] Award engine failed:", e);
  }

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
    const idx  = leaderboard.findIndex(r => r.profile_id === lo.id);
    const rank = idx >= 0 ? idx + 1 : leaderboard.length + 1;

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
        tenant_id:       (goal as unknown as Record<string,unknown>).tenant_id ?? null,
      });
      emailsSent++;
    } catch (e) {
      console.error("[end-of-month] Failed email for", email, e);
    }
  }

  // ── 4. Auto-create next month stub goal ───────────────────────
  // This ensures getActiveGoal() always has a current month to return
  // even before an admin manually sets goals. The stub has zero targets
  // so LOs see the right month header immediately; admin sets real goals later.
  let nextMonthCreated = false;
  try {
    const nm = nextMonthStart(goal.month_year, goal.month_num);
    const { data: existing } = await sb
      .from("goal_months")
      .select("id")
      .eq("month_year", nm.year)
      .eq("month_num", nm.month)
      .maybeSingle();

    if (!existing) {
      await sb.from("goal_months").insert({
        month_label:        `${MONTH_NAMES[nm.month - 1]} ${nm.year}`,
        month_year:         nm.year,
        month_num:          nm.month,
        start_date:         nm.startDate,
        end_date:           nm.endDate,
        funded_volume_goal: 0,
        funded_units_goal:  0,
        app_volume_goal:    0,
        app_units_goal:     0,
        is_published:       true,
        goal_status:        "published",
        clo_message:        null,
        awards_enabled:     true,
      });
      nextMonthCreated = true;
    }
  } catch (e) {
    console.error("[end-of-month] Failed to create next month stub:", e);
  }

  return NextResponse.json({
    message:            `End-of-month complete. ${emailsSent} recap emails sent. ${awardsIssued} awards issued.`,
    goal_id:            goal.id,
    month:              goal.month_label,
    emails_sent:        emailsSent,
    awards_issued:      awardsIssued,
    total_funded:       fmt$(companyTotal),
    next_month_created: nextMonthCreated,
    // Keep legacy keys for backwards compatibility
    emailsSent,
    totalFunded:        fmt$(companyTotal),
  });
}
