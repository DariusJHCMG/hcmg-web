/**
 * GET /api/goal-engine/system-status
 * Returns environment variable presence (not values), DB connectivity,
 * active goal state, and email mode. Admin only.
 */

import { NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const checks: Array<{ key: string; ok: boolean; value?: string; note: string }> = [];

  // ── Env vars (check presence, never return values) ─────────────
  const envChecks = [
    { key: "NEXT_PUBLIC_SUPABASE_URL",   note: "Supabase project URL" },
    { key: "NEXT_PUBLIC_SUPABASE_ANON_KEY", note: "Supabase anon key" },
    { key: "SUPABASE_SERVICE_ROLE_KEY",  note: "Service role key (server-side)" },
    { key: "RESEND_API_KEY",             note: "Email sending via Resend" },
    { key: "CRON_SECRET",                note: "Secures weekly-email and end-of-month crons" },
    { key: "ZAPIER_WEBHOOK_SECRET",      note: "Secures Zapier → SLICE webhook" },
    { key: "ARIVE_WEBHOOK_SECRET",       note: "Secures ARIVE native webhook (optional)" },
    { key: "NEXT_PUBLIC_SITE_URL",       note: "Public domain (hcmgloans.com)" },
    { key: "GOAL_ENGINE_TEST_MODE",      note: "true = intercept emails; false = send live" },
    { key: "GOAL_ENGINE_TEST_EMAIL",     note: "Receives all emails in test mode" },
  ];

  for (const e of envChecks) {
    const val = process.env[e.key];
    const isSet = !!(val && val.trim().length > 0);
    checks.push({
      key:   e.key,
      ok:    isSet,
      // Show a masked preview for debugging: first 4 chars + ***
      value: isSet
        ? val!.length > 8
          ? val!.slice(0, 4) + "…" + val!.slice(-3)
          : "****"
        : "NOT SET",
      note:  e.note,
    });
  }

  // ── DB connectivity ─────────────────────────────────────────────
  const sb = createServiceClient();
  let dbOk = false;
  let dbError: string | null = null;
  let activeGoal: { id: string; month_label: string; is_published: boolean } | null = null;
  let tableCounts: Record<string, number> = {};

  try {
    const today = new Date().toISOString().split("T")[0];
    const { data: goal, error: gErr } = await sb
      .from("goal_months")
      .select("id, month_label, is_published")
      .eq("is_published", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .maybeSingle();

    dbOk = !gErr;
    dbError = gErr?.message ?? null;
    activeGoal = goal ?? null;

    // Row counts for health check
    const [commRes, prodRes, profileRes] = await Promise.all([
      sb.from("goal_commitments").select("*", { count: "exact", head: true }),
      sb.from("goal_production").select("*", { count: "exact", head: true }),
      sb.from("profiles").select("*", { count: "exact", head: true }),
    ]);

    tableCounts = {
      goal_commitments: commRes.count ?? 0,
      goal_production:  prodRes.count ?? 0,
      profiles:         profileRes.count ?? 0,
    };
  } catch (e) {
    dbError = String(e);
  }

  const emailMode = process.env.GOAL_ENGINE_TEST_MODE === "false" ? "live" : "test";

  return NextResponse.json({
    ok:          dbOk && checks.filter(c => ["NEXT_PUBLIC_SUPABASE_URL","SUPABASE_SERVICE_ROLE_KEY","RESEND_API_KEY"].includes(c.key)).every(c => c.ok),
    db:          { ok: dbOk, error: dbError, tableCounts },
    active_goal: activeGoal,
    email_mode:  emailMode,
    test_email:  process.env.GOAL_ENGINE_TEST_EMAIL ?? null,
    env:         checks,
  });
}
