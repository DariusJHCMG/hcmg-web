/**
 * GET    /api/goal-engine/goals/[id]  — fetch a single goal
 * PATCH  /api/goal-engine/goals/[id]  — update (publish/unpublish)
 * DELETE /api/goal-engine/goals/[id]  — delete
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendAnnouncementEmails } from "@/lib/goal-engine-announce";

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

  const body = await req.json();
  const sb   = createServiceClient();

  // ── Explicit resend action ────────────────────────────────────
  // When the admin clicks "Resend", the client sends { _resend: true }.
  // We reset emails_sent, then fire announcement emails immediately —
  // no need to flip is_published back and forth.
  if (body._resend === true) {
    const { data: goal } = await sb.from("goal_months").select("*").eq("id", id).single();
    if (!goal?.is_published) {
      return NextResponse.json({ error: "Goal must be published before resending." }, { status: 400 });
    }
    await sb.from("goal_months").update({ emails_sent: false }).eq("id", id);
    await sendAnnouncementEmails(goal as Record<string, unknown>);
    await sb.from("goal_months").update({ emails_sent: true }).eq("id", id);
    return NextResponse.json({ ok: true, resent: true });
  }

  // ── Normal update ─────────────────────────────────────────────
  const { data: existing } = await sb.from("goal_months").select("*").eq("id", id).single();
  const wasUnpublished = existing && !existing.is_published;
  const isNowPublished = body.is_published === true;

  // When publishing, promote goal_status to 'published' (unless already closed/archived)
  const updates = { ...body };
  const immutableStatuses = ["closed", "archived"];
  if (isNowPublished && !immutableStatuses.includes(existing?.goal_status)) {
    updates.goal_status = "published";
  }

  const { data, error } = await sb
    .from("goal_months")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // If transitioning from unpublished → published and emails not yet sent → send now
  if (wasUnpublished && isNowPublished && data && !data.emails_sent) {
    await sendAnnouncementEmails(data as Record<string, unknown>);
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
