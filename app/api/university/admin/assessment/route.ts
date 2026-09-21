import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

// GET /api/university/admin/assessment?course_id=xxx
export async function GET(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseId = request.nextUrl.searchParams.get("course_id");
  if (!courseId) return NextResponse.json({ error: "course_id required" }, { status: 400 });

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("uni_assessments")
    .select("*, uni_assessment_questions(question_id, sort_order, uni_quiz_questions(*))")
    .eq("course_id", courseId)
    .order("created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/university/admin/assessment
export async function POST(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    course_id: string;
    title: string;
    description?: string;
    instructions?: string;
    assessment_type?: string;
    passing_pct?: number;
    max_attempts?: number | null;
    time_limit_mins?: number | null;
    randomize_questions?: boolean;
    questions_to_draw?: number | null;
    show_answers_after?: boolean;
    is_required?: boolean;
    lesson_id?: string | null;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.course_id?.trim() || !body.title?.trim()) {
    return NextResponse.json({ error: "course_id and title are required" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("uni_assessments")
    .insert({
      course_id:           body.course_id,
      lesson_id:           body.lesson_id ?? null,
      title:               body.title.trim(),
      description:         body.description?.trim() || null,
      instructions:        body.instructions?.trim() || null,
      assessment_type:     body.assessment_type ?? "final_assessment",
      passing_pct:         body.passing_pct ?? 70,
      max_attempts:        body.max_attempts ?? null,
      time_limit_mins:     body.time_limit_mins ?? null,
      randomize_questions: body.randomize_questions ?? false,
      questions_to_draw:   body.questions_to_draw ?? null,
      show_answers_after:  body.show_answers_after ?? true,
      is_required:         body.is_required ?? false,
      is_active:           true,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("assessment_created", {
    actorId: profile.id, actorEmail: profile.email,
    entityType: "assessment", entityId: data.id,
    details: { title: data.title, course_id: data.course_id },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data, { status: 201 });
}
