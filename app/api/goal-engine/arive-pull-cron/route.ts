/**
 * POST /api/goal-engine/arive-pull-cron
 * 15-minute cron — gap-fill safety net for Zaps 1 & 2.
 *
 * ── Why this exists ────────────────────────────────────────────────────────
 *
 * ARIVE's Zapier integration has no date-based loan search, so we cannot
 * directly query "all loans applied today". Instead this cron takes a
 * different approach: for every loan already in goal_production that was
 * created or updated today, it fires a re-sync call to /zapier-sync
 * (same as loan-sync-cron). This catches two scenarios:
 *
 *  1. Zap 1/2 fired correctly but the amount in ARIVE changed since — the
 *     re-sync overwrites the stale amount.
 *
 *  2. Zap 1/2 fired but SLICE only got partial data (e.g. no app_date) —
 *     the re-sync fills in the gap via Zap 5's "Get Loan Details" path.
 *
 * For loans that Zap 1/2 missed entirely (never fired), Zap 5 (loan-sync-cron)
 * will catch them once they exist in SLICE. The only true gap is a loan that
 * never enters SLICE at all — those require the manual backfill tool.
 *
 * ── Flow ───────────────────────────────────────────────────────────────────
 *
 *   [Vercel Cron every 15 min]
 *       │
 *       └─► POST /api/goal-engine/arive-pull-cron
 *               │
 *               └─► For each loan in goal_production updated in last 30 min
 *                   → POST ZAPIER_LOAN_SYNC_HOOK { loan_id, lo_email }
 *                   → Zap 5 fetches fresh details from ARIVE → /zapier-sync
 *
 * ── Env vars required ──────────────────────────────────────────────────────
 *   ZAPIER_LOAN_SYNC_HOOK   Zap 5 catch hook URL (shared with loan-sync-cron)
 *   CRON_SECRET             Vercel cron auth header
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const CRON_SECRET      = process.env.CRON_SECRET          ?? "";
const ZAPIER_SYNC_HOOK = process.env.ZAPIER_LOAN_SYNC_HOOK ?? "";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // ── 1. Auth ───────────────────────────────────────────────────
  const auth = req.headers.get("x-cron-secret");
  if (CRON_SECRET && auth !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ZAPIER_SYNC_HOOK) {
    return NextResponse.json(
      { error: "ZAPIER_LOAN_SYNC_HOOK is not set — Zap 5 catch hook URL required." },
      { status: 500 },
    );
  }

  const sb = createServiceClient();

  // ── 2. Find active goal month ─────────────────────────────────
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

  // ── 3. Pull loans updated in the last 30 minutes ─────────────
  // These are the loans most likely to need a re-sync — either just
  // created by Zap 1/2, or recently changed in ARIVE.
  const windowStart = new Date(Date.now() - 30 * 60 * 1000).toISOString();
  const { data: loans, error } = await sb
    .from("goal_production")
    .select("loan_id, profile_id, profiles(email)")
    .eq("goal_month_id", goal.id)
    .eq("is_excluded", false)
    .not("loan_id", "is", null)
    .gte("updated_at", windowStart);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!loans || loans.length === 0) {
    return NextResponse.json({ message: "No recently updated loans to re-sync.", goal: goal.month_label });
  }

  // ── 4. Fire sync hook for each recently-updated loan ─────────
  let pushed = 0;
  let failed = 0;
  const errors: string[] = [];
  const CONCURRENCY = 10;

  for (let i = 0; i < loans.length; i += CONCURRENCY) {
    const batch = loans.slice(i, i + CONCURRENCY);
    await Promise.all(batch.map(async (row) => {
      const email = (row.profiles as unknown as { email?: string } | null)?.email ?? null;
      try {
        const res = await fetch(ZAPIER_SYNC_HOOK, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ loan_id: row.loan_id, lo_email: email }),
          signal:  AbortSignal.timeout(8_000),
        });
        if (res.ok) { pushed++; }
        else { failed++; errors.push(`${row.loan_id}: HTTP ${res.status}`); }
      } catch (e) {
        failed++;
        errors.push(`${row.loan_id}: ${e instanceof Error ? e.message : "fetch failed"}`);
      }
    }));
  }

  return NextResponse.json({
    message:  `Recent-loan re-sync dispatched for ${goal.month_label}.`,
    goal_id:  goal.id,
    month:    goal.month_label,
    window:   "last 30 min",
    total:    loans.length,
    pushed,
    failed,
    errors:   errors.length > 0 ? errors : undefined,
  });
}
