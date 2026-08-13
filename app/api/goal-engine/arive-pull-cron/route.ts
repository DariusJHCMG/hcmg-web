/**
 * POST /api/goal-engine/arive-pull-cron
 * 15-minute cron — pulls today's applications AND fundings from ARIVE via
 * a Zapier Make hook, then upserts any new or changed loans into SLICE.
 *
 * ── Flow ──────────────────────────────────────────────────────────────────
 *
 *   [Vercel Cron every 15 min]
 *       │
 *       └─► POST /api/goal-engine/arive-pull-cron   (this route)
 *               │
 *               ├─► POST ZAPIER_ARIVE_APPS_HOOK   { date, secret }
 *               │       Zapier: Search ARIVE "Applications Today"
 *               │       Zapier: for each loan → POST /zapier-sync with app fields
 *               │
 *               └─► POST ZAPIER_ARIVE_FUNDED_HOOK { date, secret }
 *                       Zapier: Search ARIVE "Fundings Today"
 *                       Zapier: for each loan → POST /zapier-sync with funded fields
 *
 * ── Zapier zap setup (Make integration) ──────────────────────────────────
 *
 *  ZAP 1 — "SLICE: Pull Applications Today"
 *  ┌─ Trigger: Catch Hook (URL → ZAPIER_ARIVE_APPS_HOOK)
 *  │    Fields received from SLICE: { date: "YYYY-MM-DD", secret: "..." }
 *  │
 *  ├─ Action 1: ARIVE — "Find Loans"
 *  │    Filter: Application Date = {{date}}
 *  │    (or use ARIVE "List Loans" with applicationDate filter)
 *  │
 *  ├─ Action 2: Looping by Zapier (iterate over each loan returned)
 *  │
 *  └─ Action 3: Webhooks by Zapier — POST to:
 *       https://slice.hcmgloans.com/api/goal-engine/zapier-sync
 *       Headers: x-zapier-secret: {{ZAPIER_WEBHOOK_SECRET}}
 *       Body:
 *         loan_id:    {{loan.id}}
 *         lo_nmls:    {{loan.loanOfficerNmls}}
 *         lo_email:   {{loan.loanOfficerEmail}}
 *         app_date:   {{loan.applicationDate}}
 *         app_volume: {{loan.loanAmount}}
 *
 *  ZAP 2 — "SLICE: Pull Fundings Today"
 *  ┌─ Trigger: Catch Hook (URL → ZAPIER_ARIVE_FUNDED_HOOK)
 *  │    Fields received from SLICE: { date: "YYYY-MM-DD", secret: "..." }
 *  │
 *  ├─ Action 1: ARIVE — "Find Loans"
 *  │    Filter: Funded Date = {{date}}
 *  │
 *  ├─ Action 2: Looping by Zapier
 *  │
 *  └─ Action 3: Webhooks by Zapier — POST to:
 *       https://slice.hcmgloans.com/api/goal-engine/zapier-sync
 *       Headers: x-zapier-secret: {{ZAPIER_WEBHOOK_SECRET}}
 *       Body:
 *         loan_id:        {{loan.id}}
 *         lo_nmls:        {{loan.loanOfficerNmls}}
 *         lo_email:       {{loan.loanOfficerEmail}}
 *         app_date:       {{loan.applicationDate}}
 *         app_volume:     {{loan.loanAmount}}
 *         funded_date:    {{loan.fundedDate}}
 *         funded_volume:  {{loan.loanAmount}}
 *
 * ── Env vars required ────────────────────────────────────────────────────
 *   ZAPIER_ARIVE_APPS_HOOK    Zapier Catch Hook URL for Zap 1
 *   ZAPIER_ARIVE_FUNDED_HOOK  Zapier Catch Hook URL for Zap 2
 *   ZAPIER_WEBHOOK_SECRET     Shared secret passed so Zapier can auth /zapier-sync
 *   CRON_SECRET               Vercel cron auth header
 */

import { NextRequest, NextResponse } from "next/server";

const CRON_SECRET         = process.env.CRON_SECRET                ?? "";
const ZAPIER_APPS_HOOK    = process.env.ZAPIER_ARIVE_APPS_HOOK     ?? "";
const ZAPIER_FUNDED_HOOK  = process.env.ZAPIER_ARIVE_FUNDED_HOOK   ?? "";
const ZAPIER_SYNC_SECRET  = process.env.ZAPIER_WEBHOOK_SECRET      ?? "";

export const dynamic = "force-dynamic";
// Give Zapier hooks up to 25 s to accept — they respond instantly with 200
// then process async, so this is more than enough.
export const maxDuration = 30;

export async function POST(req: NextRequest) {
  // ── 1. Auth ───────────────────────────────────────────────────
  const auth = req.headers.get("x-cron-secret");
  if (CRON_SECRET && auth !== CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!ZAPIER_APPS_HOOK && !ZAPIER_FUNDED_HOOK) {
    return NextResponse.json(
      { error: "Neither ZAPIER_ARIVE_APPS_HOOK nor ZAPIER_ARIVE_FUNDED_HOOK is set." },
      { status: 500 },
    );
  }

  // ── 2. Determine date range to pull ───────────────────────────
  // We pull today AND yesterday to catch loans that funded/applied late
  // in the previous day but hadn't been synced yet when that day's crons ran.
  const now       = new Date();
  const today     = now.toISOString().slice(0, 10);
  // Yesterday in UTC
  const yday      = new Date(now.getTime() - 86_400_000).toISOString().slice(0, 10);
  const dates     = [yday, today];

  const results: Record<string, { apps?: string; funded?: string }> = {};

  // ── 3. Fire both hooks for each date ─────────────────────────
  await Promise.all(dates.map(async (date) => {
    results[date] = {};

    // ── 3a. Applications hook ──────────────────────────────────
    if (ZAPIER_APPS_HOOK) {
      try {
        const r = await fetch(ZAPIER_APPS_HOOK, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            date,
            event_type: "applications",
            secret:     ZAPIER_SYNC_SECRET,
          }),
          signal: AbortSignal.timeout(10_000),
        });
        results[date].apps = r.ok ? "dispatched" : `HTTP ${r.status}`;
      } catch (e) {
        results[date].apps = e instanceof Error ? e.message : "fetch error";
      }
    }

    // ── 3b. Fundings hook ──────────────────────────────────────
    if (ZAPIER_FUNDED_HOOK) {
      try {
        const r = await fetch(ZAPIER_FUNDED_HOOK, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({
            date,
            event_type: "fundings",
            secret:     ZAPIER_SYNC_SECRET,
          }),
          signal: AbortSignal.timeout(10_000),
        });
        results[date].funded = r.ok ? "dispatched" : `HTTP ${r.status}`;
      } catch (e) {
        results[date].funded = e instanceof Error ? e.message : "fetch error";
      }
    }
  }));

  return NextResponse.json({
    message: "ARIVE pull dispatched.",
    dates,
    results,
  });
}
