import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

// POST /api/university/admin/lesson — create a new lesson
export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    course_id: string;
    title: string;
    description?: string;
    video_token?: string;
    transcript?: string;
    resources_json?: { label: string; storage_path: string }[];
    sort_order?: number;
    duration_label?: string;
    duration_secs?: number;
    is_published?: boolean;
  };

  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.course_id || !body.title) {
    return NextResponse.json({ error: "course_id and title are required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Auto sort_order: put at end
  const { count } = await sb
    .from("uni_lessons")
    .select("id", { count: "exact", head: true })
    .eq("course_id", body.course_id);

  const { data, error } = await sb.from("uni_lessons").insert({
    course_id:     body.course_id,
    title:         body.title,
    description:   body.description ?? null,
    video_token:   body.video_token ?? null,
    transcript:    body.transcript ?? null,
    resources_json: body.resources_json ?? null,
    sort_order:    body.sort_order ?? (count ?? 0),
    duration_label: body.duration_label ?? null,
    duration_secs: body.duration_secs ?? null,
    is_published:  body.is_published ?? false,
  }).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("lesson_created", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "lesson",
    entityId: data.id,
    details: { course_id: body.course_id, title: body.title },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data, { status: 201 });
}
