/**
 * POST /api/goal-engine/seed-demo
 * Creates a current-month goal + demo commitment for the logged-in user.
 * Admin only. Safe to run multiple times (uses ON CONFLICT DO NOTHING).
 */

import { NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sb = createServiceClient();
  const now = new Date();
  const year  = now.getFullYear();
  const month = now.getMonth() + 1;                       // 1-based
  const monthLabel = now.toLocaleString("en-US", { month: "long" }) + " " + year;
  const startDate  = `${year}-${String(month).padStart(2,"0")}-01`;
  // Last day of current month
  const lastDay    = new Date(year, month, 0).getDate();
  const endDate    = `${year}-${String(month).padStart(2,"0")}-${lastDay}`;

  // ── 1. Upsert the goal ──────────────────────────────────────
  const { data: goalData, error: goalErr } = await sb
    .from("goal_months")
    .upsert({
      month_label:        monthLabel,
      month_year:         year,
      month_num:          month,
      funded_volume_goal: 20_000_000,
      funded_units_goal:  60,
      app_volume_goal:    28_000_000,
      app_units_goal:     80,
      clo_message:        "This month we are attacking purchases and DSCR. Let's all own a piece of this goal. Every loan counts — every commitment matters. Let's make history.",
      start_date:         startDate,
      end_date:           endDate,
      is_published:       true,
      emails_sent:        false,
      created_by:         profile.id,
    }, { onConflict: "month_year,month_num", ignoreDuplicates: false })
    .select("id")
    .single();

  if (goalErr) return NextResponse.json({ error: goalErr.message }, { status: 500 });
  const goalId = goalData.id;

  // ── 2. Seed demo commitment for the logged-in user ──────────
  await sb.from("goal_commitments").upsert({
    goal_month_id:             goalId,
    profile_id:                profile.id,
    funded_volume_commitment:  2_500_000,
    funded_units_commitment:   9,
    biggest_focus:             "Leading by example — closing my own pipeline while coaching the team.",
    biggest_challenge:         "Balancing coaching responsibilities with personal production.",
    confidence_pct:            95,
    digital_agreement:         true,
    submitted_at:              new Date(Date.now() - 5 * 86_400_000).toISOString(),
  }, { onConflict: "goal_month_id,profile_id", ignoreDuplicates: false });

  // ── 3. Seed demo production records ─────────────────────────
  const records = [
    { loan_id: "DEMO-001", funded_date: startDate, funded_volume: 485_000, funded_unit: 1, app_date: startDate, app_volume: 485_000, app_unit: 1 },
    { loan_id: "DEMO-002", funded_date: startDate, funded_volume: 620_000, funded_unit: 1, app_date: startDate, app_volume: 620_000, app_unit: 1 },
    { loan_id: "DEMO-003", funded_date: null,       funded_volume: null,    funded_unit: 0, app_date: startDate, app_volume: 750_000, app_unit: 1 },
    { loan_id: "DEMO-004", funded_date: null,       funded_volume: null,    funded_unit: 0, app_date: startDate, app_volume: 390_000, app_unit: 1 },
  ];

  for (const r of records) {
    await sb.from("goal_production").upsert({
      profile_id:    profile.id,
      goal_month_id: goalId,
      loan_id:       r.loan_id,
      funded_date:   r.funded_date,
      funded_volume: r.funded_volume,
      funded_unit:   r.funded_unit,
      app_date:      r.app_date,
      app_volume:    r.app_volume,
      app_unit:      r.app_unit,
      source:        "demo",
    }, { onConflict: "loan_id", ignoreDuplicates: true });
  }

  return NextResponse.json({
    success: true,
    goal_id: goalId,
    month:   monthLabel,
    message: `Demo goal for ${monthLabel} seeded. $1,105,000 funded, $2,245,000 in applications.`,
  });
}
