import { notFound, redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin, isUniversityTrainer } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import { CourseEditorForm } from "@/components/university/admin/CourseEditorForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Edit Course",
  robots: { index: false, follow: false },
};

interface Props { params: Promise<{ id: string }> }

export default async function AdminCourseEditPage({ params }: Props) {
  const { id } = await params;
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin/courses");
  if (!isUniversityAdmin(profile) && !isUniversityTrainer(profile)) redirect("/university");

  const sb = createServiceClient();

  const { data: course } = await sb
    .from("uni_courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) notFound();

  const { data: lessons } = await sb
    .from("uni_lessons")
    .select("*")
    .eq("course_id", id)
    .order("sort_order");

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{
        background: "#f7f8fa", borderBottom: "1px solid #dfe4e8",
        padding: "11px clamp(16px,4vw,48px)",
        display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap",
      }}>
        <Link href="/university" style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>HCMG U</Link>
        <span style={{ color: "#dfe4e8", fontSize: 12 }}>/</span>
        <Link href="/university/admin" style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>Admin</Link>
        <span style={{ color: "#dfe4e8", fontSize: 12 }}>/</span>
        <Link href="/university/admin/courses" style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>Courses</Link>
        <span style={{ color: "#dfe4e8", fontSize: 12 }}>/</span>
        <span style={{ fontSize: 12, color: "#142234", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }}>{course.title}</span>
      </div>

      {/* Page header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(24px,4vw,40px) clamp(24px,6vw,64px)",
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 16, flexWrap: "wrap",
      }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontSize: "clamp(18px,3vw,26px)", fontWeight: 800, letterSpacing: "-0.5px",
            fontFamily: "Manrope, system-ui", margin: 0,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {course.title}
          </h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          {/* Studio link */}
          <Link
            href={`/university/admin/studio/${course.id}`}
            style={{
              padding: "6px 14px", borderRadius: 7,
              border: "1px solid rgba(245,130,32,0.4)",
              background: "rgba(245,130,32,0.1)",
              color: "#f58220", fontSize: 12, fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Open Studio →
          </Link>

          {/* Published badge */}
          <div style={{
            padding: "6px 12px", borderRadius: 6,
            background: course.is_published ? "rgba(52,211,153,0.15)" : "rgba(255,255,255,0.08)",
            border: `1px solid ${course.is_published ? "rgba(52,211,153,0.3)" : "rgba(255,255,255,0.12)"}`,
            fontSize: 11, fontWeight: 700,
            color: course.is_published ? "#34d399" : "#687383",
            letterSpacing: "0.8px", textTransform: "uppercase" as const,
          }}>
            {course.is_published ? "● Published" : "Draft"}
          </div>

          {/* Preview link */}
          <a
            href={`/university/course/${course.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "6px 14px", borderRadius: 7,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "#b9c5d0", fontSize: 12, fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Preview ↗
          </a>
        </div>
      </div>

      <CourseEditorForm
        mode="edit"
        course={course}
        initialLessons={lessons ?? []}
      />
    </div>
  );
}
