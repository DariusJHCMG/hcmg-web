import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess } from "@/lib/auth";

interface Params { params: Promise<{ id: string }> }

// PATCH /api/university/notifications/[id]
// Marks a single notification as read. User may only mark their own.

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();

  // Only update if this notification belongs to the requesting user
  const { error } = await sb
    .from("uni_notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", id)
    .eq("profile_id", profile.id); // enforces ownership — cannot mark another user's notification

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
