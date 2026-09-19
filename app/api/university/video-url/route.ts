import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess, logUniAudit } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lesson_id");
  if (!lessonId) return NextResponse.json({ error: "Missing lesson_id" }, { status: 400 });

  const sb = createServiceClient();

  // Verify the user is enrolled in the course that contains this lesson
  const { data: lesson } = await sb
    .from("uni_lessons")
    .select("id, video_token, course_id")
    .eq("id", lessonId)
    .eq("is_published", true)
    .single();

  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  const { data: enrollment } = await sb
    .from("uni_enrollments")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("course_id", lesson.course_id)
    .maybeSingle();

  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  if (!lesson.video_token) return NextResponse.json({ url: null });

  // The video_token is the real HeyGen share URL (stored server-side only).
  // In production, replace this with your token→signed-URL resolution logic
  // (e.g. Supabase Storage createSignedUrl, or a HeyGen API call).
  const videoUrl = lesson.video_token;

  await logUniAudit("video_accessed", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "lesson",
    entityId: lessonId,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  // No-cache: signed URL must not be stored by CDN or browser
  return NextResponse.json(
    { url: videoUrl },
    { headers: { "Cache-Control": "no-store, no-cache, must-revalidate" } }
  );
}
