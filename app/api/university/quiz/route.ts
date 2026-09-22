import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, hasUniversityAccess, logUniAudit } from "@/lib/auth";

// POST /api/university/quiz
// Body: { lesson_id, answers: { [questionId]: optionIndex | number[] } }
//
// Supports question types:
//   multiple_choice — answers[id] = number (index of chosen option)
//   multiple_select — answers[id] = number[] (indices of all chosen options)
//   true_false      — treated as multiple_choice (single correct option)
//   short_answer    — skipped (manual grading); returns is_correct: null
//
// Auth: uses getVerifiedProfile() (server-validated token) because this route
// writes an attempt record. A replayed cookie-local JWT cannot fake a passing
// score that persists in the database.
export async function POST(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { lesson_id: string; answers: Record<string, number | number[]> };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { lesson_id, answers } = body;
  if (!lesson_id || !answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sb = createServiceClient();

  // ── IDOR fix 1: verify the lesson exists and is published ─────────────────
  const { data: lesson } = await sb
    .from("uni_lessons")
    .select("id, course_id, is_published")
    .eq("id", lesson_id)
    .single();

  if (!lesson || !lesson.is_published) {
    return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
  }

  // ── IDOR fix 2: verify the learner is enrolled in the course ──────────────
  const { data: enrollment } = await sb
    .from("uni_enrollments")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("course_id", lesson.course_id)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  // ── Fetch questions with correct answers + question_type (server-side only)
  // Also fetch any course-level assessment passing_pct for this lesson's course
  const [{ data: questions }, { data: assessment }] = await Promise.all([
    sb
      .from("uni_quiz_questions")
      .select("id, options_json, explanation, question_type")
      .eq("lesson_id", lesson_id)
      .order("sort_order"),
    sb
      .from("uni_assessments")
      .select("passing_pct")
      .eq("course_id", lesson.course_id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: "No questions found" }, { status: 404 });
  }

  // ── Grade the attempt ─────────────────────────────────────────────────────
  let gradableCount = 0;
  let correct       = 0;

  const results = questions.map((q) => {
    const options     = q.options_json as { label: string; is_correct: boolean }[];
    const qType       = (q.question_type ?? "multiple_choice") as string;
    const rawAnswer   = answers[q.id];

    // ── short_answer: skip automated grading ────────────────────────────────
    if (qType === "short_answer") {
      return {
        question_id:  q.id,
        is_correct:   null as boolean | null,
        explanation:  q.explanation,
      };
    }

    gradableCount++;

    // ── multiple_select: all correct options must be chosen, none wrong ─────
    if (qType === "multiple_select") {
      const chosenSet   = new Set(Array.isArray(rawAnswer) ? rawAnswer : []);
      const correctSet  = new Set(
        options.map((o, i) => o.is_correct ? i : -1).filter(i => i >= 0)
      );
      const isCorrect =
        chosenSet.size === correctSet.size &&
        [...correctSet].every(i => chosenSet.has(i));
      if (isCorrect) correct++;
      return {
        question_id:  q.id,
        // ── Security: do NOT return correct_index to the client ─────────────
        is_correct:   isCorrect,
        explanation:  q.explanation,
      };
    }

    // ── multiple_choice / true_false (default): single correct option ───────
    const chosen     = typeof rawAnswer === "number" ? rawAnswer : -1;
    const correctIdx = options.findIndex(o => o.is_correct);
    const isCorrect  = chosen === correctIdx;
    if (isCorrect) correct++;
    return {
      question_id:  q.id,
      // ── Security: do NOT return correct_index to the client ─────────────
      is_correct:   isCorrect,
      explanation:  q.explanation,
    };
  });

  // Score is based only on gradable questions (excludes short_answer).
  // Passing threshold comes from the course's active assessment if one exists,
  // otherwise defaults to 80.
  const score_pct    = gradableCount > 0
    ? Math.round((correct / gradableCount) * 100)
    : 0;
  const passingScore = assessment?.passing_pct ?? 80;
  const passed       = score_pct >= passingScore;

  // ── Persist the attempt ────────────────────────────────────────────────────
  await sb.from("uni_quiz_attempts").insert({
    profile_id:   profile.id,
    lesson_id,
    score_pct,
    passed,
    answers_json: answers,
  });

  // ── When quiz is passed, mark the lesson as complete in uni_progress ────────
  // Knowledge-check lessons complete via quiz pass, not via video session.
  // Without this, uni_progress never gets completed=true and course completion
  // and cert issuance never trigger.
  if (passed) {
    const now = new Date().toISOString();
    await sb.from("uni_progress").upsert(
      {
        profile_id:      profile.id,
        lesson_id,
        course_id:       lesson.course_id,
        watch_pct:       100,
        completed:       true,
        completed_at:    now,
        last_watched_at: now,
      },
      { onConflict: "profile_id,lesson_id" }
    );
  }

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
