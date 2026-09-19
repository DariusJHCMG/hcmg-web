import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess } from "@/lib/auth";

// GET /api/university/notifications
// Returns the authenticated user's notifications (newest first, max 50).
// Also returns unread_count for the badge.
//
// Query params:
//   ?limit=N   — number of notifications to return (default 20, max 50)
//   ?unread=1  — return only unread notifications

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit  = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);
  const unreadOnly = searchParams.get("unread") === "1";

  const sb = createServiceClient();

  let query = sb
    .from("uni_notifications")
    .select("id,notification_type,title,body,entity_type,entity_id,is_read,read_at,created_at")
    .eq("profile_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (unreadOnly) query = query.eq("is_read", false);

  const [{ data: notifications }, { count: unreadCount }] = await Promise.all([
    query,
    sb
      .from("uni_notifications")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .eq("is_read", false),
  ]);

  return NextResponse.json({
    notifications: notifications ?? [],
    unread_count:  unreadCount ?? 0,
  });
}

// PATCH /api/university/notifications
// Body: { action: "mark_all_read" }
// Marks all of the authenticated user's notifications as read.

export async function PATCH(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { action: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  if (body.action !== "mark_all_read") {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const sb = createServiceClient();
  await sb
    .from("uni_notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("profile_id", profile.id)
    .eq("is_read", false);

  return NextResponse.json({ ok: true });
}
