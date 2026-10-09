/**
 * GET /api/goal-engine/awards/all
 * Admin-only. Returns every award across all months, with LO and month info joined.
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
    .from("goal_awards")
    .select(`
      id,
      award_type,
      award_label,
      award_emoji,
      issued_at,
      email_sent,
      stats_snapshot,
      profiles ( full_name, avatar_url ),
      goal_months ( month_label, month_year, month_num )
    `)
    .order("issued_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ awards: data ?? [] });
}
