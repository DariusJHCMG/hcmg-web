import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

interface Props { params: Promise<{ lessonId: string }> }

// PATCH /api/university/admin/lesson/[lessonId] — update lesson
export async function PATCH(request: NextRequest, { params }: Props) {
  const { lessonId } = await params;
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const allowed = [
    "title","description","video_token","transcript","resources_json",
    "sort_order","duration_label","duration_secs","is_published",
  ];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("uni_lessons")
    .update(updates)
    .eq("id", lessonId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("lesson_updated", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "lesson",
    entityId: lessonId,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data);
}

// DELETE /api/university/admin/lesson/[lessonId]
export async function DELETE(request: NextRequest, { params }: Props) {
  const { lessonId } = await params;
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();
  const { error } = await sb.from("uni_lessons").delete().eq("id", lessonId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("lesson_deleted", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "lesson",
    entityId: lessonId,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
