import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess, isUniversityAdmin, isUniversityTrainer, logUniAudit } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId = searchParams.get("lesson_id");
  if (!lessonId) return NextResponse.json({ error: "Missing lesson_id" }, { status: 400 });

  const sb = createServiceClient();
  const isAdmin = isUniversityAdmin(profile) || isUniversityTrainer(profile);

  // Admins/trainers can preview any lesson regardless of publish status.
  // Learners can only access published lessons they are enrolled in.
  let query = sb
    .from("uni_lessons")
    .select("id, video_token, course_id")
    .eq("id", lessonId);

  if (!isAdmin) query = query.eq("is_published", true);

  const { data: lesson } = await query.single();

  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  if (!isAdmin) {
    const { data: enrollment } = await sb
      .from("uni_enrollments")
      .select("id")
      .eq("profile_id", profile.id)
      .eq("course_id", lesson.course_id)
      .maybeSingle();

    if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });
  }

  if (!lesson.video_token) return NextResponse.json({ url: null });

  let videoUrl: string;

  // Storage path (no protocol prefix) → resolve to a signed URL
  if (!lesson.video_token.startsWith("http")) {
    const { data: signed, error: signErr } = await sb.storage
      .from("uni-media")
      .createSignedUrl(lesson.video_token, 60 * 60); // 1-hour expiry

    if (signErr || !signed?.signedUrl) {
      return NextResponse.json({ error: "Could not generate video URL" }, { status: 500 });
    }
    videoUrl = signed.signedUrl;
  } else {
    // Already a full URL (HeyGen share link, external CDN, etc.)
    videoUrl = lesson.video_token;
  }

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
