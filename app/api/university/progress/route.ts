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

  const pct = Math.max(0, Math.min(100, Math.round(watch_pct)));
  const isCompleted = completed ?? pct >= 90;
  const now = new Date().toISOString();

  const sb = createServiceClient();

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
