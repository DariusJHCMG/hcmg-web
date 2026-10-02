import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityAdmin } from "@/lib/auth";

// ONE-SHOT dev route — delete after use.
// Clears all Harry's Playbook progress + sessions for a specific profile.
export async function POST(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller || !isUniversityAdmin(caller)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { profile_id, course_id } = await request.json();
  if (!profile_id || !course_id) {
    return NextResponse.json({ error: "profile_id and course_id required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // 1. End all active sessions for this course
  const { error: e1 } = await sb
    .from("uni_lesson_sessions")
    .update({ ended_at: new Date().toISOString() })
    .eq("profile_id", profile_id)
    .eq("course_id", course_id);

  // 2. Delete all sessions
  const { error: e2 } = await sb
    .from("uni_lesson_sessions")
    .delete()
    .eq("profile_id", profile_id)
    .eq("course_id", course_id);

  // 3. Delete all progress rows
  const { error: e3 } = await sb
    .from("uni_progress")
    .delete()
    .eq("profile_id", profile_id)
    .eq("course_id", course_id);

  // 4. Delete quiz attempts for lessons in this course
  const { data: lessons } = await sb
    .from("uni_lessons")
    .select("id")
    .eq("course_id", course_id);

  const lessonIds = (lessons ?? []).map(l => l.id);
  const { error: e4 } = lessonIds.length > 0
    ? await sb.from("uni_quiz_attempts").delete().eq("profile_id", profile_id).in("lesson_id", lessonIds)
    : { error: null };

  // 5. Remove enrollment so the course resets fully
  const { error: e5 } = await sb
    .from("uni_enrollments")
    .delete()
    .eq("profile_id", profile_id)
    .eq("course_id", course_id);

  const errors = [e1, e2, e3, e4, e5].filter(Boolean);
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: `Cleared all progress, sessions, quiz attempts, and enrollment for profile ${profile_id} on course ${course_id}.`,
  });
}
