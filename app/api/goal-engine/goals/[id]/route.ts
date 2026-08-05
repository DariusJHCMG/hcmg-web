/**
 * PATCH /api/goal-engine/goals/[id]
 * Admin: update a goal (including publishing/unpublishing)
 *
 * DELETE /api/goal-engine/goals/[id]
 * Admin: delete a goal
 *
 * GET /api/goal-engine/goals/[id]
 * Get a single goal
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendAnnouncementEmails } from "../route";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb = createServiceClient();
  const { data, error } = await sb.from("goal_months").select("*").eq("id", id).single();
  if (error) return NextResponse.json({ error: error.message }, { status: 404 });
  return NextResponse.json({ goal: data });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body   = await req.json();
  const sb     = createServiceClient();

  // Fetch existing to check if we're publishing for the first time
  const { data: existing } = await sb.from("goal_months").select("*").eq("id", id).single();
  const wasUnpublished = existing && !existing.is_published;
  const isNowPublished = body.is_published === true;

  const { data, error } = await sb
    .from("goal_months")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If just published and emails not yet sent → send now
  if (wasUnpublished && isNowPublished && data && !data.emails_sent) {
    await sendAnnouncementEmails(data);
  }

  return NextResponse.json({ goal: data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sb = createServiceClient();
  const { error } = await sb.from("goal_months").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
