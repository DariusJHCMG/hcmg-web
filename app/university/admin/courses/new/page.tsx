import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin, isUniversityTrainer } from "@/lib/auth";
import Link from "next/link";
import { CourseEditorForm } from "@/components/university/admin/CourseEditorForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | New Course",
  robots: { index: false, follow: false },
};

export default async function NewCoursePage() {
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin/courses/new");
  if (!isUniversityAdmin(profile) && !isUniversityTrainer(profile)) redirect("/university");
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ background: "#f7f8fa", borderBottom: "1px solid #dfe4e8", padding: "11px clamp(16px,4vw,48px)", display: "flex", alignItems: "center", gap: 8 }}>
        <Link href="/university" style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>HCMG U</Link>
        <span style={{ color: "#dfe4e8", fontSize: 12 }}>/</span>
        <Link href="/university/admin" style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>Admin</Link>
        <span style={{ color: "#dfe4e8", fontSize: 12 }}>/</span>
        <Link href="/university/admin/courses" style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>Courses</Link>
        <span style={{ color: "#dfe4e8", fontSize: 12 }}>/</span>
        <span style={{ fontSize: 12, color: "#142234", fontWeight: 600 }}>New Course</span>
      </div>
      {/* Page header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(24px,4vw,40px) clamp(24px,6vw,64px)",
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontSize: "clamp(20px,3vw,28px)", fontWeight: 800, letterSpacing: "-0.5px", fontFamily: "Manrope, system-ui", margin: 0 }}>
            New Course
          </h1>
        </div>
        <div style={{
          padding: "6px 12px", borderRadius: 6,
          background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
          fontSize: 11, fontWeight: 700, color: "#687383", letterSpacing: "0.8px", textTransform: "uppercase",
        }}>
          Draft
        </div>
      </div>

      <CourseEditorForm mode="new" />
    </div>
  );
}
