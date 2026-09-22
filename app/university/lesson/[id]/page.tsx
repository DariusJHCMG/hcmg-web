import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { LessonPageClient } from "@/components/university/LessonPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Props { params: Promise<{ id: string }> }

export default async function LessonPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/university");

  const sb = createServiceClient();

  const { data: lesson } = await sb
    .from("uni_lessons")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .single();

  if (!lesson) notFound();

  // Course
  const { data: course } = await sb
    .from("uni_courses")
    .select("id, slug, title")
    .eq("id", lesson.course_id)
    .single();

  if (!course) notFound();

  // Auto-enroll if not already enrolled
  const { data: enrollment } = await sb
    .from("uni_enrollments")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("course_id", course.id)
    .maybeSingle();

  if (!enrollment) {
    await sb.from("uni_enrollments").insert({
      profile_id: profile.id,
      course_id:  course.id,
      assignment_type: "self",
    });
  }

  // All lessons in course for prev/next navigation (ordered by module then sort)
  const { data: allLessons } = await sb
    .from("uni_lessons")
    .select("id, sort_order, module_sort_order, module_id")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("sort_order");

  const idx      = (allLessons ?? []).findIndex(l => l.id === id);
  const prevId   = idx > 0 ? (allLessons ?? [])[idx - 1].id : null;
  const nextId   = idx < (allLessons ?? []).length - 1 ? (allLessons ?? [])[idx + 1].id : null;

  // Quiz questions (strip is_correct — sent as options only)
  const { data: questions } = await sb
    .from("uni_quiz_questions")
    .select("id, question_text, options_json, explanation, question_type")
    .eq("lesson_id", id)
    .order("sort_order");

  const safeQuestions = (questions ?? []).map(q => ({
    id:            q.id,
    question_text: q.question_text,
    explanation:   q.explanation,
    question_type: (q.question_type ?? "multiple_choice") as string,
    options:       (q.options_json as { label: string; is_correct: boolean }[]).map(o => ({ label: o.label })),
  }));

  // Find linked assessment (for quiz_pass completion mode)
  const { data: linkedAssessment } = await sb
    .from("uni_assessments")
    .select("id")
    .eq("lesson_id", id)
    .eq("is_active", true)
    .maybeSingle();

  // Current progress
  const { data: progress } = await sb
    .from("uni_progress")
    .select("watch_pct")
    .eq("profile_id", profile.id)
    .eq("lesson_id", id)
    .maybeSingle();

  // Check if this user has already passed the quiz for this lesson
  const { data: passingAttempt } = await sb
    .from("uni_quiz_attempts")
    .select("id")
    .eq("profile_id", profile.id)
    .eq("lesson_id", id)
    .eq("passed", true)
    .limit(1)
    .maybeSingle();

  return (
    <LessonPageClient
      lessonId={lesson.id}
      courseId={course.id}
      courseSlug={course.slug}
      courseTitle={course.title}
      lessonTitle={lesson.title}
      lessonDescription={lesson.description}
      lessonType={lesson.lesson_type ?? "video"}
      transcript={lesson.transcript}
      resources={(lesson.resources_json as { label: string; storage_path: string }[]) ?? []}
      quizQuestions={safeQuestions}
      linkedAssessmentId={linkedAssessment?.id ?? null}
      prevLessonId={prevId}
      nextLessonId={nextId}
      initialWatchPct={progress?.watch_pct ?? 0}
      initialQuizPassed={!!passingAttempt}
      completionMode={lesson.completion_mode ?? "watch_pct"}
      completionThresholdPct={lesson.completion_threshold_pct ?? 80}
    />
  );
}
