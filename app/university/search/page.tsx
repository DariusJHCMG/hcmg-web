import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { UniversitySearchClient } from "@/components/university/UniversitySearchClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Training Library",
  robots: { index: false, follow: false },
};

export default async function SearchPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const sb = createServiceClient();

  const { data: courses } = await sb
    .from("uni_courses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  const { data: enrollments } = await sb
    .from("uni_enrollments")
    .select("course_id")
    .eq("profile_id", profile.id);

  const { data: progress } = await sb
    .from("uni_progress")
    .select("course_id, completed")
    .eq("profile_id", profile.id);

  const enrolledIds = new Set((enrollments ?? []).map(e => e.course_id));
  const progressMap: Record<string, { completed: number; total: number }> = {};
  for (const p of (progress ?? [])) {
    if (!progressMap[p.course_id]) progressMap[p.course_id] = { completed: 0, total: 0 };
    progressMap[p.course_id].total++;
    if (p.completed) progressMap[p.course_id].completed++;
  }

  return (
    <UniversitySearchClient
      courses={courses ?? []}
      enrolledIds={[...enrolledIds]}
      progressMap={progressMap}
    />
  );
}
