import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess, logUniAudit } from "@/lib/auth";
import { deriveMinDwellSecs } from "@/app/api/university/lesson/session/heartbeat/route";

// POST /api/university/lesson/session/complete
//
// The ONLY route that sets completed=true on a lesson.
// The browser NEVER directly declares completion.
// This route runs CanCompleteLesson() server-side and either grants or denies.
//
// Body: { session_id: string }

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { session_id: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  if (!body.session_id) {
    return NextResponse.json({ error: "session_id is required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // ── 1. Load and validate the session ────────────────────────────────────────
  const { data: session } = await sb
    .from("uni_lesson_sessions")
    .select("id, profile_id, lesson_id, course_id, enrollment_id, verified_secs, video_duration_secs, watch_segments, dwell_secs, scroll_pct, completed, ended_at, expires_at")
    .eq("id", body.session_id)
    .eq("profile_id", profile.id) // Ownership — cannot complete another user's session
    .single();

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }
  if (new Date(session.expires_at) < new Date()) {
    return NextResponse.json({ error: "Session expired" }, { status: 410 });
  }
  if (session.completed) {
    // Already completed — idempotent success
    return NextResponse.json({ ok: true, already_completed: true });
  }

  // ── 2. Load lesson completion rules ─────────────────────────────────────────
  const { data: lesson } = await sb
    .from("uni_lessons")
    .select("id, lesson_type, completion_mode, completion_threshold_pct, duration_secs")
    .eq("id", session.lesson_id)
    .single();

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // ── 3. CanCompleteLesson checks ──────────────────────────────────────────────
  type FailReason = { code: string; message: string };
  const failures: FailReason[] = [];

  const threshold = lesson.completion_threshold_pct ?? 80;
  const duration  = session.video_duration_secs ?? 0;

  // Check A: Video watch threshold met
  if (lesson.lesson_type === "video" || lesson.lesson_type === "audio") {
    if (duration > 0) {
      const watchPct = Math.round((session.verified_secs / duration) * 100);
      if (watchPct < threshold) {
        failures.push({
          code: "INSUFFICIENT_WATCH_TIME",
          message: `Verified watch time is ${watchPct}% — need at least ${threshold}%.`,
        });
      }
    }
  }

  // Check A2: Text/assignment dwell time and scroll threshold met
  if (lesson.lesson_type === "text" || lesson.lesson_type === "assignment") {
    const minDwell = deriveMinDwellSecs((lesson as { duration_secs?: number | null }).duration_secs ?? null);
    const dwellSecs = session.dwell_secs ?? 0;
    const scrollPct = session.scroll_pct ?? 0;
    const MIN_SCROLL_PCT = 80; // Must have scrolled at least 80% of the content

    if (dwellSecs < minDwell) {
      failures.push({
        code: "INSUFFICIENT_DWELL_TIME",
        message: `Reading time is ${dwellSecs}s — need at least ${minDwell}s to complete this lesson.`,
      });
    }
    if (scrollPct < MIN_SCROLL_PCT) {
      failures.push({
        code: "INSUFFICIENT_SCROLL",
        message: `You have only scrolled ${scrollPct}% — please read the full lesson before completing.`,
      });
    }
  }

  // Check B: Knowledge check passed (if completion_mode = quiz_pass)
  if (lesson.completion_mode === "quiz_pass") {
    const { data: questions } = await sb
      .from("uni_quiz_questions")
      .select("id", { count: "exact", head: false })
      .eq("lesson_id", session.lesson_id);

    if ((questions?.length ?? 0) > 0) {
      // Look for a passed quiz attempt on this lesson's questions
      const { data: attempt } = await sb
        .from("uni_quiz_attempts")
        .select("id, passed")
        .eq("profile_id", profile.id)
        .eq("lesson_id", session.lesson_id)
        .eq("passed", true)
        .maybeSingle();

      if (!attempt) {
        failures.push({
          code: "QUIZ_NOT_PASSED",
          message: "You must pass the knowledge check before completing this lesson.",
        });
      }
    }
  }

  // Check C: Already completed via a previous session (idempotent guard)
  const { data: existingProgress } = await sb
    .from("uni_progress")
    .select("completed")
    .eq("profile_id", profile.id)
    .eq("lesson_id", session.lesson_id)
    .maybeSingle();

  if (existingProgress?.completed) {
    // Already completed — close session and return success
    await sb
      .from("uni_lesson_sessions")
      .update({ completed: true, ended_at: new Date().toISOString() })
      .eq("id", session.id);
    return NextResponse.json({ ok: true, already_completed: true });
  }

  // ── 4. Grant or deny ─────────────────────────────────────────────────────────
  if (failures.length > 0) {
    return NextResponse.json({ ok: false, failures }, { status: 422 });
  }

  const now = new Date().toISOString();
  const watchPct = duration > 0
    ? Math.min(100, Math.round((session.verified_secs / duration) * 100))
    : 100; // Non-video lesson

  // Mark session complete
  await sb
    .from("uni_lesson_sessions")
    .update({ completed: true, ended_at: now })
    .eq("id", session.id);

  // Mark progress complete
  await sb
    .from("uni_progress")
    .upsert(
      {
        profile_id:      profile.id,
        lesson_id:       session.lesson_id,
        course_id:       session.course_id,
        watch_pct:       watchPct,
        completed:       true,
        completed_at:    now,
        last_watched_at: now,
      },
      { onConflict: "profile_id,lesson_id" },
    );

  // Fire lesson_completed event
  await sb.from("uni_events").insert({
    profile_id:  profile.id,
    event_type:  "lesson_completed",
    entity_type: "lesson",
    entity_id:   session.lesson_id,
    value:       watchPct,
    metadata:    {
      course_id:     session.course_id,
      session_id:    session.id,
      verified_secs: session.verified_secs,
      watch_pct:     watchPct,
    },
    session_id: session.id,
  });

  // Audit log
  await logUniAudit("lesson_completed", {
    actorId:    profile.id,
    actorEmail: profile.email,
    entityType: "lesson",
    entityId:   session.lesson_id,
    details:    {
      course_id:     session.course_id,
      session_id:    session.id,
      verified_secs: session.verified_secs,
      watch_pct:     watchPct,
    },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true, watch_pct: watchPct });
}
