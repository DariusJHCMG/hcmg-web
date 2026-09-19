import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess, logUniAudit } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lessonId   = searchParams.get("lesson_id");
  const storagePath = searchParams.get("path");
  if (!lessonId || !storagePath) {
    return NextResponse.json({ error: "Missing params" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Verify enrollment
  const { data: lesson } = await sb
    .from("uni_lessons")
    .select("course_id")
    .eq("id", lessonId)
    .single();

  if (!lesson) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: enrollment } = await sb
    .from("uni_enrollments")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("course_id", lesson.course_id)
    .maybeSingle();

  if (!enrollment) return NextResponse.json({ error: "Not enrolled" }, { status: 403 });

  // Issue 60-second signed URL from private storage bucket
  const { data, error } = await sb.storage
    .from("uni-resources")
    .createSignedUrl(storagePath, 60);

  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: "Could not generate URL" }, { status: 500 });
  }

  await logUniAudit("resource_downloaded", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "lesson",
    entityId: lessonId,
    details: { path: storagePath },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(
    { url: data.signedUrl },
    { headers: { "Cache-Control": "no-store" } }
  );
}
