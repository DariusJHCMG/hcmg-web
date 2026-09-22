import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess } from "@/lib/auth";

// POST /api/university/lesson/session/start
// Creates a server-authorized lesson session before the learner starts watching.
// Returns a session_id the client must include in every heartbeat.
// This makes it impossible to fabricate watch time without a real session.
//
// Body: { lesson_id: string, course_id: string }

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { lesson_id: string; course_id: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { lesson_id, course_id } = body;
  if (!lesson_id || !course_id) {
    return NextResponse.json({ error: "lesson_id and course_id are required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Verify lesson belongs to the stated course and is published
  const { data: lesson } = await sb
    .from("uni_lessons")
    .select("id, course_id, is_published")
    .eq("id", lesson_id)
    .eq("is_published", true)
    .single();

  if (!lesson || lesson.course_id !== course_id) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // Verify enrollment
  const { data: enrollment } = await sb
    .from("uni_enrollments")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("course_id", course_id)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  // Expire any existing active sessions for this lesson (one session at a time)
  await sb
    .from("uni_lesson_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("profile_id", profile.id)
    .eq("lesson_id", lesson_id)
    .is("ended_at", null);

  // Create new session
  const { data: session, error } = await sb
    .from("uni_lesson_sessions")
    .insert({
      profile_id:    profile.id,
      enrollment_id: enrollment.id,
      lesson_id,
      course_id,
      ip_address:    request.headers.get("x-forwarded-for") ?? null,
      user_agent:    request.headers.get("user-agent") ?? null,
    })
    .select("id, started_at, expires_at")
    .single();

  if (error || !session) {
    return NextResponse.json({ error: "Could not create session" }, { status: 500 });
  }

  // Fire lesson_started event
  await sb.from("uni_events").insert({
    profile_id:  profile.id,
    event_type:  "lesson_started",
    entity_type: "lesson",
    entity_id:   lesson_id,
    metadata:    { course_id, session_id: session.id },
    session_id:  session.id,
    ip_address:  request.headers.get("x-forwarded-for") ?? null,
    user_agent:  request.headers.get("user-agent") ?? null,
  });

  return NextResponse.json({
    session_id: session.id,
    started_at: session.started_at,
    expires_at: session.expires_at,
  });
}
