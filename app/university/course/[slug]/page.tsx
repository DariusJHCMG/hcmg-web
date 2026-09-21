import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { ProgressRing } from "@/components/university/ProgressRing";
import type { Metadata } from "next";

export const metadata: Metadata = { robots: { index: false, follow: false } };

interface Props { params: Promise<{ slug: string }> }

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?next=/university");

  const sb = createServiceClient();

  const { data: course } = await sb
    .from("uni_courses")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (!course) notFound();

  const [
    { data: lessons },
    { data: modules },
    { data: enrollment },
    { data: progressRows },
    { data: objectives },
    { data: cert },
    { data: assessments },
  ] = await Promise.all([
    sb.from("uni_lessons").select("*").eq("course_id", course.id).eq("is_published", true).order("sort_order"),
    sb.from("uni_modules").select("*").eq("course_id", course.id).eq("is_active", true).order("sort_order"),
    sb.from("uni_enrollments").select("id, due_date").eq("profile_id", profile.id).eq("course_id", course.id).maybeSingle(),
    sb.from("uni_progress").select("lesson_id, watch_pct, completed").eq("profile_id", profile.id).eq("course_id", course.id),
    sb.from("uni_course_objectives").select("objective").eq("course_id", course.id).order("sort_order"),
    sb.from("uni_certificates").select("issued_at, verification_id").eq("profile_id", profile.id).eq("course_id", course.id).is("revoked_at", null).maybeSingle(),
    sb.from("uni_assessments").select("id, title, assessment_type, passing_pct, is_required, is_active").eq("course_id", course.id).eq("is_active", true).order("created_at"),
  ]);

  const progressMap = new Map((progressRows ?? []).map(p => [p.lesson_id, p]));
  const completedCount = (progressRows ?? []).filter(p => p.completed).length;
  const totalCount     = (lessons ?? []).length;
  const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const nextLesson     = (lessons ?? []).find(l => !progressMap.get(l.id)?.completed);

  // Group lessons by module
  const hasModules = (modules ?? []).length > 0;
  type LessonRow = NonNullable<typeof lessons>[0];
  type GroupedSection = {
    module: { id: string; title: string } | null;
    lessons: LessonRow[];
  };
  const groupedSections: GroupedSection[] = [];

  if (hasModules) {
    for (const mod of modules ?? []) {
      const modLessons = (lessons ?? []).filter(l => l.module_id === mod.id).sort((a, b) => a.module_sort_order - b.module_sort_order);
      if (modLessons.length > 0) {
        groupedSections.push({ module: mod, lessons: modLessons as GroupedSection["lessons"] });
      }
    }
    // Add unassigned lessons
    const unassigned = (lessons ?? []).filter(l => !l.module_id);
    if (unassigned.length > 0) {
      groupedSections.push({ module: null, lessons: unassigned as GroupedSection["lessons"] });
    }
    // If no groups formed (all unassigned), just show flat
    if (groupedSections.length === 0 || (groupedSections.length === 1 && !groupedSections[0].module)) {
      // treat as flat
    }
  }

  const S = {
    navy:    "#06182a",
    navyM:   "#0c2b4b",
    orange:  "#f58220",
    text:    "#071a2e",
    muted:   "#687383",
    light:   "#b9c5d0",
    border:  "#dfe4e8",
    surface: "#f7f8fa",
    white:   "#fff",
    green:   "#34d399",
    greenD:  "#118568",
  };

  function LessonItem({ lesson, idx }: { lesson: NonNullable<typeof lessons>[0]; idx: number }) {
    const prog = progressMap.get(lesson.id);
    const done = prog?.completed ?? false;
    return (
      <Link
        href={`/university/lesson/${lesson.id}`}
        style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "13px 16px",
          background: done ? "rgba(52,211,153,0.05)" : S.surface,
          border: `1px solid ${done ? "rgba(52,211,153,0.18)" : S.border}`,
          borderRadius: 9, textDecoration: "none",
          transition: "box-shadow 0.15s",
        }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
          background: done ? S.greenD : S.navy,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: done ? 13 : 11, fontWeight: 700, color: "#fff",
        }}>
          {done ? "✓" : idx + 1}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: S.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {lesson.title}
          </div>
          {lesson.description && (
            <div style={{ fontSize: 12, color: S.muted, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {lesson.description}
            </div>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {lesson.duration_label && <span style={{ fontSize: 12, color: S.muted }}>{lesson.duration_label}</span>}
          {prog && !done && prog.watch_pct > 0 && (
            <span style={{ fontSize: 11, color: S.orange, fontWeight: 700 }}>{prog.watch_pct}%</span>
          )}
          <span style={{ color: S.muted, fontSize: 14 }}>→</span>
        </div>
      </Link>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(145deg, ${S.navy}, ${S.navyM})`,
        padding: "clamp(28px,5vw,56px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <Link href="/university" style={{ fontSize: 13, color: S.muted, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          ← Back to Dashboard
        </Link>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            {course.is_required && (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", background: "#b23b3b", color: "#fff", padding: "3px 9px", borderRadius: 5, marginBottom: 10, display: "inline-block" }}>
                Required
              </span>
            )}
            <h1 style={{ fontSize: "clamp(24px,4vw,42px)", fontWeight: 800, letterSpacing: "-1px", lineHeight: 1.15, fontFamily: "Manrope, system-ui", marginBottom: 12 }}>
              {course.title}
            </h1>
            {course.short_description && (
              <p style={{ fontSize: 15, color: "#d1dae4", lineHeight: 1.6, maxWidth: 560, marginBottom: 8 }}>{course.short_description}</p>
            )}
            {course.description && !course.short_description && (
              <p style={{ fontSize: 14, color: S.light, lineHeight: 1.7, maxWidth: 520, marginBottom: 8 }}>{course.description}</p>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
              {enrollment ? (
                nextLesson ? (
                  <Link href={`/university/lesson/${nextLesson.id}`} style={{
                    padding: "12px 24px", borderRadius: 10,
                    background: `linear-gradient(135deg,#FF9847,#F37021)`,
                    color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
                  }}>
                    {completedCount === 0 ? "Start course ▶" : "Continue →"}
                  </Link>
                ) : cert ? (
                  <span style={{ fontSize: 14, fontWeight: 700, color: S.green }}>✓ Certificate earned {new Date(cert.issued_at).toLocaleDateString()}</span>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 700, color: S.green }}>✓ Course complete!</span>
                )
              ) : (lessons ?? []).length > 0 ? (
                <Link href={`/university/lesson/${(lessons ?? [])[0].id}`} style={{
                  padding: "12px 24px", borderRadius: 10,
                  background: `linear-gradient(135deg,#FF9847,#F37021)`,
                  color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
                }}>
                  Start course ▶
                </Link>
              ) : (
                <span style={{ fontSize: 14, color: S.muted, fontStyle: "italic" }}>No lessons published yet.</span>
              )}
              <span style={{ fontSize: 13, color: S.muted }}>
                {totalCount} lesson{totalCount !== 1 ? "s" : ""}
                {course.duration_label ? ` · ${course.duration_label}` : ""}
                {hasModules ? ` · ${(modules ?? []).length} module${(modules ?? []).length !== 1 ? "s" : ""}` : ""}
              </span>
            </div>
          </div>

          {enrollment && totalCount > 0 && (
            <div style={{ flexShrink: 0 }}>
              <ProgressRing pct={pct} size={80} stroke={6} />
              {completedCount > 0 && (
                <p style={{ fontSize: 11, color: S.muted, textAlign: "center", marginTop: 6 }}>
                  {completedCount}/{totalCount} done
                </p>
              )}
            </div>
          )}
        </div>

        {/* Metadata row */}
        <div style={{ display: "flex", gap: 20, marginTop: 24, flexWrap: "wrap" }}>
          {course.instructor_name && (
            <span style={{ fontSize: 13, color: S.light }}>
              <span style={{ opacity: 0.6 }}>Instructor</span> {course.instructor_name}
            </span>
          )}
          {course.audience && (
            <span style={{ fontSize: 13, color: S.light }}>
              <span style={{ opacity: 0.6 }}>For</span> {course.audience}
            </span>
          )}
          {course.difficulty && (
            <span style={{ fontSize: 13, color: S.light, textTransform: "capitalize" }}>{course.difficulty}</span>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>

        {/* Learning objectives */}
        {(objectives ?? []).length > 0 && (
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: S.text, marginBottom: 12 }}>What you&apos;ll learn</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
              {(objectives ?? []).map((obj, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 14, color: S.text }}>
                  <span style={{ color: S.orange, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span>{obj.objective}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Curriculum */}
        {hasModules && groupedSections.length > 1 ? (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: S.text, marginBottom: 16 }}>Course Content</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {groupedSections.map((section, si) => (
                <div key={si}>
                  {section.module && (
                    <div style={{
                      padding: "10px 16px", marginBottom: 8,
                      background: S.navy, borderRadius: "9px 9px 0 0",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: S.muted, marginBottom: 2 }}>
                        Module {si + 1}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{section.module.title}</div>
                    </div>
                  )}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {section.lessons.map((l, li) => (
                      <LessonItem key={l.id} lesson={l} idx={li} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: S.text, marginBottom: 16 }}>
              {totalCount} Lesson{totalCount !== 1 ? "s" : ""}
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(lessons ?? []).map((lesson, i) => (
                <LessonItem key={lesson.id} lesson={lesson} idx={i} />
              ))}
            </div>
          </div>
        )}

        {/* Assessments */}
        {(assessments ?? []).length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: S.text, marginBottom: 12 }}>Assessments</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {(assessments ?? []).map(a => (
                <Link
                  key={a.id}
                  href={`/university/assessment/${a.id}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 14,
                    padding: "14px 16px", borderRadius: 9,
                    background: S.surface, border: `1px solid ${S.border}`,
                    textDecoration: "none", transition: "box-shadow 0.15s",
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                    background: S.navy,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 16, color: S.white,
                  }}>✏</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>{a.title}</div>
                    <div style={{ fontSize: 12, color: S.muted, marginTop: 2 }}>
                      Passing score: {a.passing_pct}%
                      {a.is_required && <span style={{ marginLeft: 10, color: S.orange, fontWeight: 700 }}>Required</span>}
                    </div>
                  </div>
                  <span style={{ fontSize: 14, color: S.muted }}>→</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
