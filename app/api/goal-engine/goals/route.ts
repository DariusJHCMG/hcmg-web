/**
 * POST /api/goal-engine/goals  — Admin/CLO: create a monthly goal
 * GET  /api/goal-engine/goals  — Returns all goals (admin) or published (LO)
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendAnnouncementEmails } from "@/lib/goal-engine-announce";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createServiceClient();
  let query = sb
    .from("goal_months")
    .select("*")
    .order("month_year", { ascending: false })
    .order("month_num",  { ascending: false });

  if (!isAdmin(profile)) {
    query = query.eq("is_published", true);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ goals: data ?? [] });
}

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const {
    month_label, month_year, month_num,
    funded_volume_goal, funded_units_goal,
    app_volume_goal, app_units_goal,
    clo_message, awards_enabled,
    start_date, end_date,
    is_published,
  } = body;

  if (!month_label || !month_year || !month_num || !start_date || !end_date) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb.from("goal_months").insert({
    month_label,
    month_year,
    month_num,
    funded_volume_goal:  funded_volume_goal  ?? 0,
    funded_units_goal:   funded_units_goal   ?? 0,
    app_volume_goal:     app_volume_goal     ?? 0,
    app_units_goal:      app_units_goal      ?? 0,
    clo_message:         clo_message         ?? null,
    awards_enabled:      awards_enabled      ?? true,
    start_date,
    end_date,
    is_published:        is_published        ?? false,
    goal_status:         is_published ? "published" : "draft",
    created_by:          profile.id,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (is_published && data) {
    await sendAnnouncementEmails(data as Record<string, unknown>);
  }

  return NextResponse.json({ goal: data }, { status: 201 });
}
