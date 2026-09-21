import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityTrainer, isUniversityAdmin } from "@/lib/auth";
import { AssessmentStudio } from "@/components/university/studio/AssessmentStudio";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Assessment Builder",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ courseId: string; assessmentId: string }>;
}

export default async function AssessmentStudioPage({ params }: Props) {
  const { courseId, assessmentId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) notFound();

  const sb = createServiceClient();

  const [
    { data: assessment },
    { data: course },
  ] = await Promise.all([
    sb.from("uni_assessments").select("*").eq("id", assessmentId).single(),
    sb.from("uni_courses").select("id, title").eq("id", courseId).single(),
  ]);

  if (!assessment || !course || assessment.course_id !== courseId) notFound();

  // Fetch questions linked to this assessment via uni_assessment_questions
  const { data: linkedQuestions } = await sb
    .from("uni_assessment_questions")
    .select("question_id, sort_order")
    .eq("assessment_id", assessmentId)
    .order("sort_order");

  let questions: ReturnType<typeof Array.prototype.map>[] = [];
  if (linkedQuestions && linkedQuestions.length > 0) {
    const qIds = linkedQuestions.map(q => q.question_id);
    const { data: qs } = await sb
      .from("uni_quiz_questions")
      .select("*")
      .in("id", qIds);

    // Sort by assessment order
    const qMap = new Map((qs ?? []).map(q => [q.id, q]));
    questions = linkedQuestions.map(lq => qMap.get(lq.question_id)).filter(Boolean);
  }

  // Also fetch questions from the linked lesson if any
  if (assessment.lesson_id && linkedQuestions?.length === 0) {
    const { data: lessonQs } = await sb
      .from("uni_quiz_questions")
      .select("*")
      .eq("lesson_id", assessment.lesson_id)
      .order("sort_order");
    questions = lessonQs ?? [];
  }

  return (
    <AssessmentStudio
      courseId={courseId}
      courseTitle={course.title}
      assessment={assessment}
      questions={(questions as unknown) as import("@/lib/database.types").UniQuizQuestion[]}
      isAdmin={isUniversityAdmin(profile)}
    />
  );
}
