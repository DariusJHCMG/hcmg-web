import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess, logUniAudit } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { lesson_id: string; course_id: string; watch_pct: number; completed?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { lesson_id, course_id, watch_pct, completed } = body;
  if (!lesson_id || !course_id || watch_pct == null) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sb = createServiceClient();

  // ── IDOR fix: verify lesson belongs to the claimed course ──────────────────
  // Never trust lesson_id / course_id from the client. Verify server-side that
  // the lesson actually belongs to the stated course before writing progress.
  const { data: lesson } = await sb
    .from("uni_lessons")
    .select("id, course_id, is_published")
    .eq("id", lesson_id)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }
  if (lesson.course_id !== course_id) {
    // Client submitted a mismatched course_id — reject regardless of intent
    return NextResponse.json({ error: "Invalid lesson/course combination" }, { status: 400 });
  }
  if (!lesson.is_published) {
    return NextResponse.json({ error: "Lesson not available" }, { status: 403 });
  }

  // ── Verify the learner is actually enrolled in this course ──────────────────
  const { data: enrollment } = await sb
    .from("uni_enrollments")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("course_id", course_id)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  // ── Clamp watch_pct to valid range ─────────────────────────────────────────
  const pct = Math.max(0, Math.min(100, Math.round(watch_pct)));
  const isCompleted = completed ?? pct >= 90;
  const now = new Date().toISOString();

  const { error } = await sb.from("uni_progress").upsert(
    {
      profile_id:      profile.id,
      lesson_id,
      course_id,
      watch_pct:       pct,
      completed:       isCompleted,
      completed_at:    isCompleted ? now : null,
      last_watched_at: now,
    },
    { onConflict: "profile_id,lesson_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Write analytics event — video_watched (progress) or lesson_completed
  const eventType: import("@/lib/database.types").EventType = isCompleted ? "lesson_completed" : "video_watched";
  await sb.from("uni_events").insert({
    profile_id:  profile.id,
    event_type:  eventType,
    entity_type: "lesson",
    entity_id:   lesson_id,
    metadata:    { course_id, watch_pct: pct, completed: isCompleted },
  });

  if (isCompleted) {
    await logUniAudit("lesson_completed", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "lesson",
      entityId: lesson_id,
      details: { course_id, watch_pct: pct },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
  }

  return NextResponse.json({ ok: true });
}
