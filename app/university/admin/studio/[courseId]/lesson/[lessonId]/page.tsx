import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityTrainer, isUniversityAdmin } from "@/lib/auth";
import { LessonStudio } from "@/components/university/studio/LessonStudio";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Lesson Editor",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function LessonStudioPage({ params }: Props) {
  const { courseId, lessonId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) notFound();

  const sb = createServiceClient();

  const [
    { data: lesson },
    { data: course },
    { data: questions },
  ] = await Promise.all([
    sb.from("uni_lessons").select("*").eq("id", lessonId).single(),
    sb.from("uni_courses").select("id, title, slug").eq("id", courseId).single(),
    sb.from("uni_quiz_questions").select("*").eq("lesson_id", lessonId).order("sort_order"),
  ]);

  if (!lesson || !course || lesson.course_id !== courseId) notFound();

  // Fetch module if assigned
  let module = null;
  if (lesson.module_id) {
    const { data: mod } = await sb
      .from("uni_modules")
      .select("*")
      .eq("id", lesson.module_id)
      .maybeSingle();
    module = mod;
  }

  return (
    <LessonStudio
      courseId={courseId}
      courseTitle={course.title}
      lesson={lesson}
      module={module}
      questions={questions ?? []}
      isAdmin={isUniversityAdmin(profile)}
    />
  );
}
