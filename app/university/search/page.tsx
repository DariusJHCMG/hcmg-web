import { Suspense } from "react";
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
  const enrolledIdList = [...enrolledIds];

  // Fetch actual published lesson counts so pct is based on real totals
  const lessonCountMap: Record<string, number> = {};
  if (enrolledIdList.length > 0) {
    const { data: lessonCounts } = await sb
      .from("uni_lessons")
      .select("course_id")
      .in("course_id", enrolledIdList)
      .eq("is_published", true);
    for (const l of (lessonCounts ?? [])) {
      lessonCountMap[l.course_id] = (lessonCountMap[l.course_id] ?? 0) + 1;
    }
  }

  const progressMap: Record<string, { completed: number; total: number; started: boolean }> = {};
  for (const courseId of enrolledIdList) {
    progressMap[courseId] = { completed: 0, total: lessonCountMap[courseId] ?? 0, started: false };
  }
  for (const p of (progress ?? [])) {
    if (!progressMap[p.course_id]) progressMap[p.course_id] = { completed: 0, total: lessonCountMap[p.course_id] ?? 0, started: false };
    progressMap[p.course_id].started = true;
    if (p.completed) progressMap[p.course_id].completed++;
  }

  return (
    <Suspense fallback={<div style={{ padding: 40, color: "#687383", fontFamily: "system-ui" }}>Loading library…</div>}>
      <UniversitySearchClient
        courses={courses ?? []}
        enrolledIds={[...enrolledIds]}
        progressMap={progressMap}
      />
    </Suspense>
  );
}
