import { notFound, redirect } from "next/navigation";
import { getVerifiedProfile, hasUniversityAccess } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { AssessmentPlayer } from "@/components/university/AssessmentPlayer";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Props { params: Promise<{ assessmentId: string }> }

export default async function AssessmentPage({ params }: Props) {
  const { assessmentId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university");
  if (!hasUniversityAccess(profile)) redirect("/university");

  const sb = createServiceClient();

  const { data: assessment } = await sb
    .from("uni_assessments")
    .select("*")
    .eq("id", assessmentId)
    .eq("is_active", true)
    .single();

  if (!assessment) notFound();

  // Course info for breadcrumb
  const { data: course } = await sb
    .from("uni_courses")
    .select("id, slug, title")
    .eq("id", assessment.course_id)
    .single();

  if (!course) notFound();

  // Verify enrollment — redirect to the course page if not enrolled
  const { data: enrollment } = await sb
    .from("uni_enrollments")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("course_id", assessment.course_id)
    .maybeSingle();

  if (!enrollment) redirect(`/university/course/${course.slug}`);

  // Fetch questions via assessment_questions join
  const { data: linkedQuestions } = await sb
    .from("uni_assessment_questions")
    .select("question_id, sort_order")
    .eq("assessment_id", assessmentId)
    .order("sort_order");

  let questions: {
    id: string;
    question_text: string;
    options: { label: string }[];
    explanation: string | null;
    question_type: string;
  }[] = [];

  if (linkedQuestions && linkedQuestions.length > 0) {
    const qIds = linkedQuestions.map(q => q.question_id);
    const { data: rawQs } = await sb
      .from("uni_quiz_questions")
      .select("id, question_text, options_json, explanation, question_type")
      .in("id", qIds);

    const qMap = new Map((rawQs ?? []).map(q => [q.id, q]));
    questions = linkedQuestions
      .map(lq => {
        const q = qMap.get(lq.question_id);
        if (!q) return null;
        return {
          id: q.id,
          question_text: q.question_text,
          explanation: q.explanation,
          question_type: q.question_type ?? "multiple_choice",
          options: (q.options_json as { label: string; is_correct: boolean }[]).map(o => ({ label: o.label })),
        };
      })
      .filter(Boolean) as typeof questions;

    // Randomize if configured
    if (assessment.randomize_questions) {
      for (let i = questions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [questions[i], questions[j]] = [questions[j], questions[i]];
      }
    }

    // Limit to questions_to_draw if configured
    if (assessment.questions_to_draw && assessment.questions_to_draw < questions.length) {
      questions = questions.slice(0, assessment.questions_to_draw);
    }
  }

  // Previous attempts count
  const { count: attemptsUsed } = await sb
    .from("uni_quiz_attempts")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .eq("assessment_id", assessmentId);

  const maxAttemptsReached = assessment.max_attempts
    ? (attemptsUsed ?? 0) >= assessment.max_attempts
    : false;

  return (
    <AssessmentPlayer
      assessmentId={assessmentId}
      courseId={course.id}
      courseSlug={course.slug}
      courseTitle={course.title}
      assessmentTitle={assessment.title}
      instructions={assessment.instructions}
      passingPct={assessment.passing_pct}
      timeLimitMins={assessment.time_limit_mins}
      showAnswersAfter={assessment.show_answers_after}
      questions={questions}
      attemptsUsed={attemptsUsed ?? 0}
      maxAttempts={assessment.max_attempts}
      maxAttemptsReached={maxAttemptsReached}
    />
  );
}
