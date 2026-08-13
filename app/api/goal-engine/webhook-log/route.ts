/**
 * GET /api/goal-engine/webhook-log
 * Returns the 200 most recent webhook log rows. Admin only.
 */

import { NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile)          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(profile)) return NextResponse.json({ error: "Admin only" },   { status: 403 });

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("webhook_log")
    .select("id, received_at, source, event_type_raw, event_type, loan_id, lo_nmls, lo_email_raw, lo_matched_name, goal_month_label, amount, event_date, action, error_message, raw_payload, response_body, ip_address, duration_ms, previous_value")
    .order("received_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
