import { notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityTrainer, isUniversityAdmin } from "@/lib/auth";
import { CourseStudio } from "@/components/university/studio/CourseStudio";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Training Studio",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function StudioPage({ params, searchParams }: Props) {
  const { courseId } = await params;
  const { tab } = await searchParams;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) notFound();

  const sb = createServiceClient();

  const [
    { data: course },
    { data: lessons },
    { data: modules },
    { data: assessments },
    { data: objectives },
    { data: certConfig },
  ] = await Promise.all([
    sb.from("uni_courses").select("*").eq("id", courseId).single(),
    sb.from("uni_lessons").select("*").eq("course_id", courseId).order("sort_order"),
    sb.from("uni_modules").select("*").eq("course_id", courseId).order("sort_order"),
    sb.from("uni_assessments").select("*").eq("course_id", courseId).order("created_at"),
    sb.from("uni_course_objectives").select("*").eq("course_id", courseId).order("sort_order"),
    sb.from("uni_certificate_config").select("*").eq("course_id", courseId).maybeSingle(),
  ]);

  if (!course) notFound();

  const validTabs = ["overview", "curriculum", "assessments", "settings"] as const;
  type StudioTab = typeof validTabs[number];
  const initialTab: StudioTab = validTabs.includes(tab as StudioTab) ? (tab as StudioTab) : "overview";

  return (
    <CourseStudio
      course={course}
      lessons={lessons ?? []}
      modules={modules ?? []}
      assessments={assessments ?? []}
      objectives={objectives ?? []}
      certConfig={certConfig ?? null}
      isAdmin={isUniversityAdmin(profile)}
      initialTab={initialTab}
    />
  );
}
