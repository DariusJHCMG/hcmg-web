import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { UniversityDashboardClient } from "@/components/university/UniversityDashboardClient";
import type { UniCourse } from "@/lib/database.types";

export default async function UniversityPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const sb = createServiceClient();

  // Published courses
  const { data: courses } = await sb
    .from("uni_courses")
    .select("*")
    .eq("is_published", true)
    .order("sort_order");

  // User's enrollments (include due_date for overdue detection)
  const { data: enrollments } = await sb
    .from("uni_enrollments")
    .select("course_id, due_date, assignment_type")
    .eq("profile_id", profile.id);

  // User's progress
  const { data: progress } = await sb
    .from("uni_progress")
    .select("*")
    .eq("profile_id", profile.id);

  // Certificates earned
  const { count: certificatesEarned } = await sb
    .from("uni_certificates")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profile.id)
    .is("revoked_at", null);

  // Harry's Playbook lesson count
  const harrysPlaybookCourse = (await sb
    .from("uni_courses")
    .select("id")
    .eq("path_tag", "harrys_playbook")
    .eq("is_published", true)
    .maybeSingle()).data;

  const harrysPlaybookLessonCount = harrysPlaybookCourse
    ? ((await sb
        .from("uni_lessons")
        .select("id", { count: "exact", head: true })
        .eq("course_id", harrysPlaybookCourse.id)
        .eq("is_published", true)).count ?? 0)
    : 0;

  // Completed lesson count
  const completedLessons = (progress ?? []).filter(p => p.completed).length;

  // Find "continue watching" — last watched incomplete lesson
  const sorted = [...(progress ?? [])]
    .filter(p => !p.completed)
    .sort((a, b) => new Date(b.last_watched_at).getTime() - new Date(a.last_watched_at).getTime());

  let continueLesson: { lesson_id: string; course_id: string; watch_pct: number; lesson_title: string; course_title: string; lesson_number: number; total_lessons: number } | null = null;
  if (sorted.length > 0) {
    const p = sorted[0];
    const { data: lesson } = await sb
      .from("uni_lessons")
      .select("id, title, course_id, sort_order")
      .eq("id", p.lesson_id)
      .single();

    if (lesson) {
      const course = (courses ?? []).find(c => c.id === lesson.course_id);
      const { count: total } = await sb
        .from("uni_lessons")
        .select("id", { count: "exact" })
        .eq("course_id", lesson.course_id)
        .eq("is_published", true);

      continueLesson = {
        lesson_id:     lesson.id,
        course_id:     lesson.course_id,
        watch_pct:     p.watch_pct,
        lesson_title:  lesson.title,
        course_title:  course?.title ?? "Course",
        lesson_number: lesson.sort_order + 1,
        total_lessons: total ?? 0,
      };
    }
  }

  // Build progress map: course_id → {completed, total}
  const progressMap: Record<string, { completed: number; total: number }> = {};
  for (const p of (progress ?? [])) {
    if (!progressMap[p.course_id]) progressMap[p.course_id] = { completed: 0, total: 0 };
    progressMap[p.course_id].total++;
    if (p.completed) progressMap[p.course_id].completed++;
  }

  const enrolledCourseIds = new Set((enrollments ?? []).map(e => e.course_id));

  // Required + overdue courses: enrolled, not complete, and either is_required or past due_date
  const today = new Date().toISOString().slice(0, 10);
  const requiredIncomplete: { courseId: string; title: string; slug: string; dueDate: string | null; isOverdue: boolean }[] = [];
  for (const enr of (enrollments ?? [])) {
    const course = (courses ?? []).find(c => c.id === enr.course_id);
    if (!course) continue;
    const prog = progressMap[enr.course_id];
    const done = prog && prog.total > 0 && prog.completed === prog.total;
    if (done) continue;
    const overdue = !!enr.due_date && enr.due_date < today;
    if (course.is_required || overdue) {
      requiredIncomplete.push({
        courseId: course.id,
        title: course.title,
        slug: course.slug,
        dueDate: enr.due_date ?? null,
        isOverdue: overdue,
      });
    }
  }

  return (
    <UniversityDashboardClient
      profileName={profile.full_name}
      courses={(courses ?? []) as UniCourse[]}
      enrolledCourseIds={[...enrolledCourseIds]}
      progressMap={progressMap}
      completedLessons={completedLessons}
      activePaths={(enrollments ?? []).length}
      continueLesson={continueLesson}
      certificatesEarned={certificatesEarned ?? 0}
      harrysPlaybookLessonCount={harrysPlaybookLessonCount}
      requiredIncomplete={requiredIncomplete}
    />
  );
}
