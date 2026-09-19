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

  const { data: lessons } = await sb
    .from("uni_lessons")
    .select("*")
    .eq("course_id", course.id)
    .eq("is_published", true)
    .order("sort_order");

  // Enrollment
  const { data: enrollment } = await sb
    .from("uni_enrollments")
    .select("id, due_date")
    .eq("profile_id", profile.id)
    .eq("course_id", course.id)
    .maybeSingle();

  // Progress for each lesson
  const { data: progressRows } = await sb
    .from("uni_progress")
    .select("lesson_id, watch_pct, completed")
    .eq("profile_id", profile.id)
    .eq("course_id", course.id);

  const progressMap = new Map(
    (progressRows ?? []).map(p => [p.lesson_id, p])
  );

  const completedCount = (progressRows ?? []).filter(p => p.completed).length;
  const totalCount     = (lessons ?? []).length;
  const pct            = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Certificate
  const { data: cert } = await sb
    .from("uni_certificates")
    .select("issued_at")
    .eq("profile_id", profile.id)
    .eq("course_id", course.id)
    .is("revoked_at", null)
    .maybeSingle();

  // First incomplete lesson for CTA
  const nextLesson = (lessons ?? []).find(l => !progressMap.get(l.id)?.completed);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Hero */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,5vw,56px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <Link href="/university" style={{ fontSize: 13, color: "#687383", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
          ← Back to Dashboard
        </Link>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            {course.is_required && (
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", background: "#b23b3b", color: "#fff", padding: "3px 9px", borderRadius: 5, marginBottom: 10, display: "inline-block" }}>
                Required
              </span>
            )}
            <h1 style={{ fontSize: "clamp(26px,4vw,44px)", fontWeight: 800, letterSpacing: "-1.5px", lineHeight: 1.15, fontFamily: "Manrope, system-ui", marginBottom: 12 }}>
              {course.title}
            </h1>
            {course.description && (
              <p style={{ fontSize: 14, color: "#b9c5d0", lineHeight: 1.7, maxWidth: 520 }}>{course.description}</p>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20, flexWrap: "wrap" }}>
              {enrollment ? (
                nextLesson ? (
                  <Link href={`/university/lesson/${nextLesson.id}`} style={{
                    padding: "12px 24px", borderRadius: 10,
                    background: "linear-gradient(135deg,#FF9847,#F37021)",
                    color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
                  }}>
                    {completedCount === 0 ? "Start course ▶" : "Continue →"}
                  </Link>
                ) : cert ? (
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#34d399" }}>✓ Certificate earned {new Date(cert.issued_at).toLocaleDateString()}</span>
                ) : (
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#34d399" }}>✓ Course complete!</span>
                )
              ) : (
                <Link href={`/university/lesson/${(lessons ?? [])[0]?.id}`} style={{
                  padding: "12px 24px", borderRadius: 10,
                  background: "linear-gradient(135deg,#FF9847,#F37021)",
                  color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
                }}>
                  Start course ▶
                </Link>
              )}
              <span style={{ fontSize: 13, color: "#687383" }}>{totalCount} lessons · {course.duration_label ?? ""}</span>
            </div>
          </div>

          {enrollment && totalCount > 0 && (
            <ProgressRing pct={pct} size={80} stroke={6} />
          )}
        </div>
      </div>

      {/* Lesson list */}
      <div style={{ maxWidth: 760, margin: "40px auto", padding: "0 clamp(16px,4vw,40px) 60px" }}>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16, color: "#071a2e" }}>
          {totalCount} Lesson{totalCount !== 1 ? "s" : ""}
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(lessons ?? []).map((lesson, i) => {
            const prog = progressMap.get(lesson.id);
            const done = prog?.completed ?? false;
            return (
              <Link
                key={lesson.id}
                href={`/university/lesson/${lesson.id}`}
                style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px",
                  background: done ? "rgba(52,211,153,0.06)" : "#f7f8fa",
                  border: `1px solid ${done ? "rgba(52,211,153,0.2)" : "#dfe4e8"}`,
                  borderRadius: 10, textDecoration: "none",
                  transition: "box-shadow 0.15s, transform 0.15s",
                }}
              >
                {/* Number / check */}
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: done ? "#118568" : "#071a2e",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: done ? 14 : 12, fontWeight: 700, color: "#fff",
                }}>
                  {done ? "✓" : i + 1}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#142234", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lesson.title}
                  </div>
                  {lesson.description && (
                    <div style={{ fontSize: 12, color: "#687383", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {lesson.description}
                    </div>
                  )}
                </div>

                {lesson.duration_label && (
                  <span style={{ fontSize: 12, color: "#687383", flexShrink: 0 }}>{lesson.duration_label}</span>
                )}

                {prog && !done && prog.watch_pct > 0 && (
                  <span style={{ fontSize: 11, color: "#f58220", fontWeight: 700, flexShrink: 0 }}>{prog.watch_pct}%</span>
                )}

                <span style={{ color: "#687383", fontSize: 16, flexShrink: 0 }}>→</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
