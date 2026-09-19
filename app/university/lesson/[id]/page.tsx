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

  // All lessons in course for prev/next navigation
  const { data: allLessons } = await sb
    .from("uni_lessons")
    .select("id, sort_order")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("sort_order");

  const idx      = (allLessons ?? []).findIndex(l => l.id === id);
  const prevId   = idx > 0 ? (allLessons ?? [])[idx - 1].id : null;
  const nextId   = idx < (allLessons ?? []).length - 1 ? (allLessons ?? [])[idx + 1].id : null;

  // Quiz questions (strip is_correct — sent as options only)
  const { data: questions } = await sb
    .from("uni_quiz_questions")
    .select("id, question_text, options_json, explanation")
    .eq("lesson_id", id)
    .order("sort_order");

  const safeQuestions = (questions ?? []).map(q => ({
    id:            q.id,
    question_text: q.question_text,
    explanation:   q.explanation,
    options:       (q.options_json as { label: string; is_correct: boolean }[]).map(o => ({ label: o.label })),
  }));

  // Current progress
  const { data: progress } = await sb
    .from("uni_progress")
    .select("watch_pct")
    .eq("profile_id", profile.id)
    .eq("lesson_id", id)
    .maybeSingle();

  return (
    <LessonPageClient
      lessonId={lesson.id}
      courseSlug={course.slug}
      courseTitle={course.title}
      lessonTitle={lesson.title}
      lessonDescription={lesson.description}
      transcript={lesson.transcript}
      resources={(lesson.resources_json as { label: string; storage_path: string }[]) ?? []}
      quizQuestions={safeQuestions}
      prevLessonId={prevId}
      nextLessonId={nextId}
      initialWatchPct={progress?.watch_pct ?? 0}
    />
  );
}
