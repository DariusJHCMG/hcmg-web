/**
 * POST /api/goal-engine/repair-orphans
 * Admin-only. Finds goal_production rows with goal_month_id = null and
 * assigns them to the correct goal month based on funded_date or app_date.
 *
 * Also fixes rows whose goal_month_id points to the wrong month
 * (date falls outside that month's start–end range).
 *
 * Safe to run multiple times — idempotent.
 */

import { NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile)          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(profile)) return NextResponse.json({ error: "Admin only" },   { status: 403 });

  const sb = createServiceClient();

  // Load all published goal months once
  const { data: months } = await sb
    .from("goal_months")
    .select("id, month_label, start_date, end_date")
    .eq("is_published", true)
    .order("start_date", { ascending: true });

  if (!months || months.length === 0) {
    return NextResponse.json({ error: "No published goal months found." }, { status: 404 });
  }

  // Pull all non-excluded rows that either have no goal_month_id
  // or whose event date falls outside their assigned month
  const { data: rows, error: fetchErr } = await sb
    .from("goal_production")
    .select("id, loan_id, funded_date, app_date, goal_month_id, event_type")
    .eq("is_excluded", false);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });
  if (!rows || rows.length === 0) return NextResponse.json({ repaired: 0, message: "No rows to check." });

  /** Find the goal month whose start–end range contains a date string */
  function matchMonth(date: string | null): string | null {
    if (!date) return null;
    const d = date.slice(0, 10);
    const m = months!.find(m => m.start_date.slice(0,10) <= d && m.end_date.slice(0,10) >= d);
    return m?.id ?? null;
  }

  let repaired = 0;
  let skipped  = 0;
  const errors: string[] = [];

  for (const row of rows) {
    // Determine the correct goal_month_id using the event date
    const eventDate  = (row.event_type === "funded" ? row.funded_date : null) ?? row.app_date ?? row.funded_date;
    const correctId  = matchMonth(eventDate);

    // Skip if already correct or if we can't determine the right month
    if (!correctId)                      { skipped++; continue; }
    if (row.goal_month_id === correctId) { skipped++; continue; }

    const { error } = await sb
      .from("goal_production")
      .update({ goal_month_id: correctId })
      .eq("id", row.id);

    if (error) { errors.push(`${row.loan_id}: ${error.message}`); }
    else       { repaired++; }
  }

  return NextResponse.json({
    message: `Repaired ${repaired} row(s). ${skipped} already correct. ${errors.length} error(s).`,
    repaired,
    skipped,
    errors: errors.length ? errors : undefined,
  });
}
