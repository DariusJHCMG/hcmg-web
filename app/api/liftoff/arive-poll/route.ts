import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";

// ── GET /api/liftoff/arive-poll?id={requestId} ───────────────────────────────
// Browser polls this every 1.5s after firing the lookup.
// Returns { pending: true } until Zapier has written the result row,
// then returns the full AriveLoanData and deletes the row.
// Reading from Supabase means any Lambda instance can serve the result —
// no cold-start isolation issues.

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const requestId = req.nextUrl.searchParams.get("id");
  if (!requestId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const sb = createServiceClient();

  const { data, error } = await sb
    .from("arive_lookup_results")
    .select("result_json, found, expires_at")
    .eq("request_id", requestId)
    .single();

  // Row missing = expired and cleaned up, or never written
  if (error || !data) {
    return NextResponse.json({ pending: true });
  }

  // Row exists but result not yet written by Zapier
  if (!data.result_json) {
    return NextResponse.json({ pending: true });
  }

  // Result is ready — return it and delete the row in the background
  void sb
    .from("arive_lookup_results")
    .delete()
    .eq("request_id", requestId)
    .then();

  return NextResponse.json(data.result_json);
}
