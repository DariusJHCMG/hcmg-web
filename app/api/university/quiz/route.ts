import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, hasUniversityAccess, logUniAudit } from "@/lib/auth";

// POST /api/university/quiz
// Body: { lesson_id, answers: { [questionId]: optionIndex } }
export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { lesson_id: string; answers: Record<string, number> };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { lesson_id, answers } = body;
  if (!lesson_id || !answers) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Fetch questions with correct answers (server-side only)
  const { data: questions } = await sb
    .from("uni_quiz_questions")
    .select("id, options_json, explanation")
    .eq("lesson_id", lesson_id)
    .order("sort_order");

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: "No questions found" }, { status: 404 });
  }

  // Score the attempt
  let correct = 0;
  const results = questions.map((q) => {
    const chosen = answers[q.id] ?? -1;
    const correctIdx = (q.options_json as { label: string; is_correct: boolean }[])
      .findIndex(o => o.is_correct);
    const isCorrect = chosen === correctIdx;
    if (isCorrect) correct++;
    return {
      question_id:  q.id,
      chosen_index: chosen,
      correct_index: correctIdx,
      is_correct:   isCorrect,
      explanation:  q.explanation,
    };
  });

  const score_pct = Math.round((correct / questions.length) * 100);
  const passed    = score_pct >= 80;

  // Write attempt
  await sb.from("uni_quiz_attempts").insert({
    profile_id:   profile.id,
    lesson_id,
    score_pct,
    passed,
    answers_json: answers,
  });

  await logUniAudit("quiz_attempted", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "lesson",
    entityId: lesson_id,
    details: { score_pct, passed },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ score_pct, passed, results });
}
