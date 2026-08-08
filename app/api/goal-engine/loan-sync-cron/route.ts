/**
 * POST /api/goal-engine/loan-sync-cron
 * Hourly cron — pushes every active loan_id for the current goal month
 * to the Zapier Catch Hook. Zapier then calls ARIVE Get Loan Details
 * and posts the fresh amount back to /api/goal-engine/zapier-sync.
 *
 * Vercel Cron: vercel.json → "0 * * * *" (every hour)
 * Auth: x-cron-secret header
 *
 * Flow:
 *   SLICE cron → POST { loan_id, lo_nmls } to ZAPIER_LOAN_SYNC_HOOK
 *   Zapier      → ARIVE Get Loan Details (loan_id)
 *   Zapier      → POST current amounts to /api/goal-engine/zapier-sync
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const CRON_SECRET       = process.env.CRON_SECRET ?? "";
const ZAPIER_SYNC_HOOK  = process.env.ZAPIER_LOAN_SYNC_HOOK ?? "";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // ── Auth ─────────────────────────────────────────────────────
  const auth = req.headers.get("x-cron-secret");
  if (CRON_SECRET && auth !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ZAPIER_SYNC_HOOK) {
    return NextResponse.json({ error: "ZAPIER_LOAN_SYNC_HOOK env var not set." }, { status: 500 });
  }

  const sb = createServiceClient();

  // ── Find active goal month ────────────────────────────────────
  const today = new Date().toISOString().slice(0, 10);
  const { data: goal } = await sb
    .from("goal_months")
    .select("id, month_label")
    .lte("start_date", today)
    .gte("end_date", today)
    .maybeSingle();

  if (!goal) {
    return NextResponse.json({ message: "No active goal month." });
  }

  // ── Pull all non-excluded loan rows for this month ────────────
  const { data: loans, error } = await sb
    .from("goal_production")
    .select("loan_id, profile_id, profiles(nmls)")
    .eq("goal_month_id", goal.id)
    .eq("is_excluded", false)
    .not("loan_id", "is", null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!loans || loans.length === 0) {
    return NextResponse.json({ message: "No loans to sync.", goal: goal.month_label });
  }

  // Deduplicate — one push per unique loan_id (a loan may have both
  // an application and funded row but we only need to sync once)
  const seen = new Set<string>();
  const unique = loans.filter(r => {
    if (seen.has(r.loan_id)) return false;
    seen.add(r.loan_id);
    return true;
  });

  // ── Push each loan_id to Zapier catch hook ────────────────────
  // Fire all requests concurrently but cap at 10 in-flight at once
  // to avoid overwhelming Zapier rate limits.
  let pushed  = 0;
  let failed  = 0;
  const errors: string[] = [];
  const CONCURRENCY = 10;

  for (let i = 0; i < unique.length; i += CONCURRENCY) {
    const batch = unique.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (row) => {
      const nmls = (row.profiles as unknown as { nmls?: string } | null)?.nmls ?? null;
      try {
        const res = await fetch(ZAPIER_SYNC_HOOK, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            loan_id:  row.loan_id,
            lo_nmls:  nmls,
            // Zapier uses these to call ARIVE Get Loan Details
            // and then POST the result to /zapier-sync
          }),
        });
        if (res.ok) { pushed++; }
        else {
          failed++;
          errors.push(`${row.loan_id}: HTTP ${res.status}`);
        }
      } catch (e) {
        failed++;
        errors.push(`${row.loan_id}: ${e instanceof Error ? e.message : "fetch failed"}`);
      }
    }));
  }

  return NextResponse.json({
    message:    `Loan sync dispatched for ${goal.month_label}.`,
    goal_id:    goal.id,
    month:      goal.month_label,
    total:      unique.length,
    pushed,
    failed,
    errors:     errors.length > 0 ? errors : undefined,
  });
}
