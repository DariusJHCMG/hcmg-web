/**
 * POST /api/goal-engine/notifications/read
 * Mark a notification as read
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, all } = await req.json();
  const sb = createServiceClient();

  if (all) {
    await sb
      .from("goal_notifications")
      .update({ read: true })
      .eq("profile_id", profile.id);
  } else if (id) {
    await sb
      .from("goal_notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("profile_id", profile.id);
  }

  return NextResponse.json({ success: true });
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createServiceClient();
  const { data } = await sb
    .from("goal_notifications")
    .select("*")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(30);

  return NextResponse.json({ notifications: data ?? [] });
}
