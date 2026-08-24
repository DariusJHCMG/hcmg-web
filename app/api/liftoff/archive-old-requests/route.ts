import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

/**
 * POST /api/liftoff/archive-old-requests
 *
 * Soft-archives Liftoff requests that have passed their legal retention period.
 * Run weekly via Vercel cron (see vercel.json).
 *
 * RETENTION SCHEDULE (per GLBA + HUD requirements):
 *   FHA / VA loans:      2 years post-close (HUD Handbook 4000.1, VA Lender Handbook Ch. 2)
 *   All other loans:     7 years post-close (GLBA Safeguards Rule, state mortgage regs)
 *   Non-completed rows:  Never archived — only completed requests are eligible
 *
 * SOFT-DELETE MODEL:
 *   Sets archived_at = NOW() on eligible rows.
 *   Rows remain in the DB for 1 additional year before hard delete,
 *   in case a regulatory examination or audit requests records during
 *   the transition window.
 *
 * LEGAL BASIS: GLBA Safeguards Rule 16 CFR § 314.4 requires a disposal
 * component in the written security program. FTC guidance: NPI must be
 * disposed of in a manner that protects against unauthorized access.
 */

export async function POST(req: NextRequest) {
  // ── Cron authentication ─────────────────────────────────────────────────────
  // Vercel cron jobs send the CRON_SECRET in the Authorization header.
  // Any other caller is rejected.
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb  = createServiceClient();
  const now = new Date();

  // ── Compute cutoff dates ─────────────────────────────────────────────────────
  // A request is eligible for archiving if:
  //   - request_status = 'completed'
  //   - archived_at is null (not already archived)
  //   - completed_at is beyond the retention window for its loan program

  const twoYearsAgo   = new Date(now);
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const sevenYearsAgo = new Date(now);
  sevenYearsAgo.setFullYear(sevenYearsAgo.getFullYear() - 7);

  // ── Fetch FHA/VA loans past 2-year retention ──────────────────────────────
  const { data: fhaVaRows, error: fhaVaError } = await sb
    .from("lift_off_requests")
    .select("id, loan_program, completed_at")
    .eq("request_status", "completed")
    .in("loan_program", ["fha", "va"])
    .lt("completed_at", twoYearsAgo.toISOString())
    .is("archived_at", null)
    .limit(500); // Process in batches to avoid timeout

  if (fhaVaError) {
    console.error("[archive-old-requests] FHA/VA fetch error", fhaVaError);
  }

  // ── Fetch conventional/other loans past 7-year retention ─────────────────
  const { data: convRows, error: convError } = await sb
    .from("lift_off_requests")
    .select("id, loan_program, completed_at")
    .eq("request_status", "completed")
    .not("loan_program", "in", '("fha","va")')
    .lt("completed_at", sevenYearsAgo.toISOString())
    .is("archived_at", null)
    .limit(500);

  if (convError) {
    console.error("[archive-old-requests] conventional fetch error", convError);
  }

  const toArchive = [
    ...(fhaVaRows ?? []),
    ...(convRows  ?? []),
  ];

  if (toArchive.length === 0) {
    return NextResponse.json({
      ok:       true,
      archived: 0,
      message:  "No requests eligible for archiving at this time.",
      ran_at:   now.toISOString(),
    });
  }

  // ── Soft-archive: stamp archived_at ──────────────────────────────────────
  const ids = toArchive.map(r => r.id);
  const { error: updateError } = await sb
    .from("lift_off_requests")
    .update({ archived_at: now.toISOString() })
    .in("id", ids);

  if (updateError) {
    console.error("[archive-old-requests] update error", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  console.log(`[archive-old-requests] archived ${ids.length} requests at ${now.toISOString()}`);

  return NextResponse.json({
    ok:       true,
    archived: ids.length,
    ids,
    ran_at:   now.toISOString(),
    fha_va:   (fhaVaRows ?? []).length,
    other:    (convRows  ?? []).length,
  });
}
