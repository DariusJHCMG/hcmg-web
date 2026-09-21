import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, hasUniversityAccess, logUniAudit } from "@/lib/auth";

// POST /api/university/assessment/[assessmentId]/submit
// Body: { answers: { [questionId]: number | number[] } }
//
// Grades the attempt against the assessment's configured passing_pct,
// persists the attempt, and returns score + per-question results.
interface Props { params: Promise<{ assessmentId: string }> }

export async function POST(request: NextRequest, { params }: Props) {
  const { assessmentId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !hasUniversityAccess(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { answers: Record<string, number | number[]> };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { answers } = body;
  if (!answers || typeof answers !== "object") {
    return NextResponse.json({ error: "Missing answers" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Verify assessment exists and is active
  const { data: assessment } = await sb
    .from("uni_assessments")
    .select("id, course_id, passing_pct, max_attempts, is_active, show_answers_after")
    .eq("id", assessmentId)
    .eq("is_active", true)
    .single();

  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  // Verify enrollment
  const { data: enrollment } = await sb
    .from("uni_enrollments")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("course_id", assessment.course_id)
    .maybeSingle();

  if (!enrollment) {
    return NextResponse.json({ error: "Not enrolled in this course" }, { status: 403 });
  }

  // Check max attempts
  if (assessment.max_attempts) {
    const { count } = await sb
      .from("uni_quiz_attempts")
      .select("id", { count: "exact", head: true })
      .eq("profile_id", profile.id)
      .eq("assessment_id", assessmentId);

    if ((count ?? 0) >= assessment.max_attempts) {
      return NextResponse.json({ error: "Maximum attempts reached" }, { status: 409 });
    }
  }

  // Fetch questions via assessment_questions
  const { data: linked } = await sb
    .from("uni_assessment_questions")
    .select("question_id, sort_order")
    .eq("assessment_id", assessmentId)
    .order("sort_order");

  if (!linked || linked.length === 0) {
    return NextResponse.json({ error: "No questions found" }, { status: 404 });
  }

  const qIds = linked.map(l => l.question_id);
  const { data: questions } = await sb
    .from("uni_quiz_questions")
    .select("id, options_json, explanation, question_type")
    .in("id", qIds);

  if (!questions || questions.length === 0) {
    return NextResponse.json({ error: "Questions not found" }, { status: 404 });
  }

  // Sort questions by assessment order
  const qMap   = new Map(questions.map(q => [q.id, q]));
  const sorted = linked.map(l => qMap.get(l.question_id)).filter(Boolean) as typeof questions;

  // Grade
  let gradableCount = 0;
  let correct       = 0;

  const results = sorted.map(q => {
    const options   = q.options_json as { label: string; is_correct: boolean }[];
    const qType     = (q.question_type ?? "multiple_choice") as string;
    const rawAnswer = answers[q.id];

    if (qType === "short_answer") {
      return { question_id: q.id, is_correct: null as boolean | null, explanation: q.explanation };
    }

    gradableCount++;

    if (qType === "multiple_select") {
      const chosenSet  = new Set(Array.isArray(rawAnswer) ? rawAnswer : []);
      const correctSet = new Set(options.map((o, i) => o.is_correct ? i : -1).filter(i => i >= 0));
      const isCorrect  = chosenSet.size === correctSet.size && [...correctSet].every(i => chosenSet.has(i));
      if (isCorrect) correct++;
      return { question_id: q.id, is_correct: isCorrect, explanation: assessment.show_answers_after ? q.explanation : null };
    }

    const chosen     = typeof rawAnswer === "number" ? rawAnswer : -1;
    const correctIdx = options.findIndex(o => o.is_correct);
    const isCorrect  = chosen === correctIdx;
    if (isCorrect) correct++;
    return { question_id: q.id, is_correct: isCorrect, explanation: assessment.show_answers_after ? q.explanation : null };
  });

  const score_pct = gradableCount > 0 ? Math.round((correct / gradableCount) * 100) : 0;
  const passed    = score_pct >= assessment.passing_pct;

  // Persist attempt — lesson_id is nullable for course-level assessments
  await sb.from("uni_quiz_attempts").insert({
    profile_id:    profile.id,
    lesson_id:     null,
    assessment_id: assessmentId,
    score_pct,
    passed,
    answers_json:  answers,
  });

  // Issue certificate if passed and this is a required assessment
  if (passed) {
    // Check completion rules
    const { data: course } = await sb
      .from("uni_courses")
      .select("completion_rules, recert_interval_days")
      .eq("id", assessment.course_id)
      .single();

    const rules = (course?.completion_rules ?? {}) as { require_assessment?: boolean };

    if (rules.require_assessment) {
      // Check all lessons are completed if required
      let lessonsOk = true;
      const { data: allLessons } = await sb
        .from("uni_lessons")
        .select("id")
        .eq("course_id", assessment.course_id)
        .eq("is_published", true);

      if (allLessons && allLessons.length > 0) {
        const { count: completedCount } = await sb
          .from("uni_progress")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", profile.id)
          .eq("course_id", assessment.course_id)
          .eq("completed", true);

        lessonsOk = (completedCount ?? 0) >= allLessons.length;
      }

      if (lessonsOk) {
        // Issue certificate with a verification ID so it appears on /certificates
        const expiresAt = course?.recert_interval_days
          ? new Date(Date.now() + course.recert_interval_days * 86400000).toISOString()
          : null;

        // Check if a cert already exists (upsert with ignoreDuplicates won't add verification_id)
        const { data: existing } = await sb
          .from("uni_certificates")
          .select("id")
          .eq("profile_id", profile.id)
          .eq("course_id", assessment.course_id)
          .is("revoked_at", null)
          .maybeSingle();

        if (!existing) {
          const { randomUUID } = await import("crypto");
          await sb.from("uni_certificates").insert({
            profile_id:       profile.id,
            course_id:        assessment.course_id,
            issued_at:        new Date().toISOString(),
            expires_at:       expiresAt,
            cert_type:        "course",
            verification_id:  randomUUID(),
          });
        }
      }
    }
  }

  await logUniAudit("assessment_attempted", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "assessment",
    entityId: assessmentId,
    details: { score_pct, passed, assessment_title: undefined },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ score_pct, passed, results });
}
