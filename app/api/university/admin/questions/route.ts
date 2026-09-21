import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

// GET /api/university/admin/questions?lesson_id=xxx  OR  ?course_id=xxx
export async function GET(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lessonId = request.nextUrl.searchParams.get("lesson_id");
  const courseId = request.nextUrl.searchParams.get("course_id");

  const sb = createServiceClient();
  let query = sb.from("uni_quiz_questions").select("*").order("sort_order");

  if (lessonId) query = query.eq("lesson_id", lessonId);
  else if (courseId) query = query.eq("course_id", courseId);
  else return NextResponse.json({ error: "lesson_id or course_id required" }, { status: 400 });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/university/admin/questions
export async function POST(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    lesson_id: string;
    course_id?: string;
    question_text: string;
    question_type?: string;
    options_json: { label: string; is_correct: boolean }[];
    explanation?: string;
    sort_order?: number;
    points?: number;
    is_required?: boolean;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.lesson_id?.trim() || !body.question_text?.trim()) {
    return NextResponse.json({ error: "lesson_id and question_text are required" }, { status: 400 });
  }

  if (!Array.isArray(body.options_json) || body.options_json.length < 2) {
    return NextResponse.json({ error: "At least 2 answer options are required" }, { status: 400 });
  }

  const hasCorrect = body.options_json.some(o => o.is_correct);
  if (!hasCorrect && body.question_type !== "short_answer") {
    return NextResponse.json({ error: "At least one option must be marked as correct" }, { status: 400 });
  }

  const sb = createServiceClient();

  let sortOrder = body.sort_order ?? 0;
  if (body.sort_order == null) {
    const { count } = await sb
      .from("uni_quiz_questions")
      .select("id", { count: "exact", head: true })
      .eq("lesson_id", body.lesson_id);
    sortOrder = count ?? 0;
  }

  const { data, error } = await sb
    .from("uni_quiz_questions")
    .insert({
      lesson_id:     body.lesson_id,
      course_id:     body.course_id ?? null,
      question_text: body.question_text.trim(),
      question_type: body.question_type ?? "multiple_choice",
      options_json:  body.options_json,
      explanation:   body.explanation?.trim() || null,
      sort_order:    sortOrder,
      points:        body.points ?? 1,
      is_required:   body.is_required ?? true,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("question_created", {
    actorId: profile.id, actorEmail: profile.email,
    entityType: "question", entityId: data.id,
    details: { lesson_id: data.lesson_id },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data, { status: 201 });
}
