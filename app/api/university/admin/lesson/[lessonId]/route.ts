import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  getVerifiedProfile,
  isUniversityTrainer,
  isUniversityAdmin,
  logUniAudit,
} from "@/lib/auth";

interface Props { params: Promise<{ lessonId: string }> }

// PATCH /api/university/admin/lesson/[lessonId] — update lesson
//
// Phase 0 changes:
//   - Uses getVerifiedProfile() (server-validated token).
//   - is_published is admin-only — trainers cannot self-publish lessons.
export async function PATCH(request: NextRequest, { params }: Props) {
  const { lessonId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Fields any trainer can update
  const trainerAllowed = [
    "title", "lesson_type", "description", "video_token", "thumbnail_url", "caption_url",
    "transcript", "resources_json", "sort_order", "module_id", "module_sort_order",
    "duration_label", "duration_secs", "completion_mode", "completion_threshold_pct",
  ];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of trainerAllowed) {
    if (key in body) updates[key] = body[key];
  }
  // is_published is admin-only — trainers cannot publish lessons directly
  if (isUniversityAdmin(profile) && "is_published" in body) {
    updates.is_published = body.is_published;
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
    details: { fields: Object.keys(updates) },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data);
}

// DELETE /api/university/admin/lesson/[lessonId]
//
// Phase 0 changes:
//   - Uses getVerifiedProfile() (server-validated token).
//   - Verifies the trainer owns the parent course (created_by) OR is admin.
//     A trainer cannot delete lessons from another trainer's course.
//   - Blocks deletion of published lessons — must be unpublished first.
//     Admins can bypass with force=true in JSON body.
export async function DELETE(request: NextRequest, { params }: Props) {
  const { lessonId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();

  // Fetch the lesson + its parent course (for ownership check)
  const { data: lesson } = await sb
    .from("uni_lessons")
    .select("id, title, is_published, course_id, uni_courses:course_id(id, created_by, title)")
    .eq("id", lessonId)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  const courseRaw = lesson.uni_courses;
  const course = (Array.isArray(courseRaw) ? courseRaw[0] : courseRaw) as
    { id: string; created_by: string | null; title: string } | null;

  // Ownership check — trainers may only delete from their own courses
  if (!isUniversityAdmin(profile)) {
    if (!course || course.created_by !== profile.id) {
      return NextResponse.json({
        error: "You can only delete lessons from your own courses",
      }, { status: 403 });
    }
  }

  // Block deletion of published lessons unless admin forces it
  let force = false;
  try {
    const body = await request.json().catch(() => ({}));
    force = Boolean((body as { force?: boolean }).force);
  } catch { /* no body */ }

  if (lesson.is_published && !force) {
    return NextResponse.json({
      error: "Cannot delete a published lesson. Unpublish it first, or pass force=true (admin only).",
    }, { status: 409 });
  }

  if (lesson.is_published && force && !isUniversityAdmin(profile)) {
    return NextResponse.json({
      error: "Only administrators can force-delete published lessons",
    }, { status: 403 });
  }

  // Log with full context before deleting
  await logUniAudit("lesson_deleted", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "lesson",
    entityId: lessonId,
    details: {
      lesson_title: lesson.title,
      course_id: lesson.course_id,
      course_title: course?.title,
      was_published: lesson.is_published,
      force_deleted: lesson.is_published && force,
    },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  const { error } = await sb.from("uni_lessons").delete().eq("id", lessonId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
