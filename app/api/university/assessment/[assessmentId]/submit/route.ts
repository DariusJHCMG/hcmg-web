import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, hasUniversityAccess, logUniAudit } from "@/lib/auth";
import { sendUniEmail, uniEmailTemplate } from "@/lib/university/sendUniEmail";

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

  // Sort questions by assessment order, restricted to only the questions the
  // client was actually shown (i.e. present in the answers object).
  // The assessment draws a random subset (questions_to_draw) — grading must
  // only count questions that were presented, not all linked questions.
  const answeredIds = new Set(Object.keys(answers));
  const qMap   = new Map(questions.map(q => [q.id, q]));
  const sorted = linked
    .filter(l => answeredIds.has(l.question_id))
    .map(l => qMap.get(l.question_id))
    .filter(Boolean) as typeof questions;

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

  // Issue certificate if passed — also send a congratulations email
  if (passed) {
    const { data: course } = await sb
      .from("uni_courses")
      .select("title, slug, completion_rules, recert_interval_days")
      .eq("id", assessment.course_id)
      .single();

    const rules = (course?.completion_rules ?? {}) as { require_assessment?: boolean };

    // Always send a "you passed the assessment" email
    const { data: learner } = await sb
      .from("profiles")
      .select("email, full_name")
      .eq("id", profile.id)
      .maybeSingle();

    if (learner?.email) {
      const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portal.hcmgloans.com";
      const html = uniEmailTemplate({
        title: "You passed your final assessment!",
        bodyHtml: `
          <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
            Hi ${learner.full_name ?? "there"},
          </p>
          <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
            You scored <strong>${score_pct}%</strong> on the final assessment for
            <strong>${course?.title ?? "your course"}</strong>. Great work!
          </p>
          <p style="margin:0;font-size:13px;color:#687383;line-height:1.6;">
            ${rules.require_assessment
              ? "Your completion certificate will be issued automatically once all course requirements are met."
              : "Head back to the course to view your certificate."}
          </p>`,
        ctaLabel: "View My Training →",
        ctaUrl:   `${BASE_URL}/university/course/${course?.slug ?? ""}`,
      });
      await sendUniEmail({ to: learner.email, subject: `You passed: ${course?.title ?? "Final Assessment"}`, html });
    }

    // ── Cert issuance: issue when assessment is passed ─────────────────────
    // A lesson is considered "done" if it has a completed uni_progress row OR
    // a passed quiz attempt (knowledge-check lessons complete via quiz, not
    // via video session). This makes the check robust regardless of lesson type.
    const { data: allLessons } = await sb
      .from("uni_lessons")
      .select("id")
      .eq("course_id", assessment.course_id)
      .eq("is_published", true);

    let lessonsOk = true;
    if (allLessons && allLessons.length > 0) {
      const [{ data: progressRows }, { data: passedQuizzes }] = await Promise.all([
        sb.from("uni_progress")
          .select("lesson_id")
          .eq("profile_id", profile.id)
          .eq("course_id", assessment.course_id)
          .eq("completed", true),
        sb.from("uni_quiz_attempts")
          .select("lesson_id")
          .eq("profile_id", profile.id)
          .eq("passed", true)
          .in("lesson_id", allLessons.map(l => l.id)),
      ]);
      const completedLessonIds = new Set([
        ...(progressRows ?? []).map(p => p.lesson_id),
        ...(passedQuizzes ?? []).filter(q => q.lesson_id).map(q => q.lesson_id),
      ]);
      lessonsOk = allLessons.every(l => completedLessonIds.has(l.id));
    }

    if (lessonsOk) {
      const expiresAt = course?.recert_interval_days
        ? new Date(Date.now() + course.recert_interval_days * 86400000).toISOString()
        : null;

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
          profile_id:      profile.id,
          course_id:       assessment.course_id,
          issued_at:       new Date().toISOString(),
          expires_at:      expiresAt,
          cert_type:       "course",
          verification_id: randomUUID(),
        });

        // Send certificate issued email
        if (learner?.email) {
          const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portal.hcmgloans.com";
          const html = uniEmailTemplate({
            title: "🎓 Your certificate is ready",
            bodyHtml: `
              <p style="margin:0 0 12px;font-size:14px;color:#374151;line-height:1.6;">
                Hi ${learner.full_name ?? "there"},
              </p>
              <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.6;">
                Congratulations — you have completed <strong>${course?.title ?? "your course"}</strong>
                and your completion certificate has been issued.
              </p>
              <p style="margin:0;font-size:13px;color:#687383;line-height:1.6;">
                You can download and share your certificate from the Certificates section in HCMG U.
              </p>`,
            ctaLabel: "View My Certificates →",
            ctaUrl:   `${BASE_URL}/university/certificates`,
          });
          await sendUniEmail({ to: learner.email, subject: `Certificate issued: ${course?.title ?? "Course Complete"}`, html });
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
