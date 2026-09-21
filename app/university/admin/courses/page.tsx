import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Manage Courses",
  robots: { index: false, follow: false },
};

export default async function AdminCoursesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const sb = createServiceClient();

  const { data: courses } = await sb
    .from("uni_courses")
    .select("*")
    .order("sort_order");

  const PILL: Record<string, string> = {
    orange: "#f58220", blue: "#60a5fa", gold: "#d4a017",
    green: "#34d399", red: "#f87171", gray: "#b9c5d0",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,4vw,48px) clamp(24px,6vw,64px)",
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16,
      }}>
        <div>
          <Link href="/university/admin" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>← Admin</Link>
          <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
            Courses
          </h1>
        </div>
        <Link href="/university/admin/courses/new" style={{
          padding: "11px 22px", borderRadius: 10,
          background: "linear-gradient(135deg,#FF9847,#F37021)",
          color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
        }}>
          + New Course
        </Link>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>
        {!courses || courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#687383", fontSize: 14 }}>
            No courses yet. <Link href="/university/admin/courses/new" style={{ color: "#f58220" }}>Create the first one →</Link>
          </div>
        ) : (
          <div style={{ border: "1px solid #dfe4e8", borderRadius: 10, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto auto auto auto",
              padding: "10px 16px", background: "#071a2e",
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#687383",
              gap: 12,
            }}>
              <span>Course</span>
              <span>Category</span>
              <span>Required</span>
              <span>Status</span>
              <span></span>
            </div>

            {courses.map((c, i) => (
              <div key={c.id} style={{
                display: "grid", gridTemplateColumns: "1fr auto auto auto auto",
                padding: "14px 16px", gap: 12,
                alignItems: "center",
                borderBottom: i < courses.length - 1 ? "1px solid #dfe4e8" : undefined,
                background: i % 2 === 0 ? "#fff" : "#f7f8fa",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#071a2e" }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "#687383" }}>/{c.slug}</div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px",
                  color: PILL[c.pill_color ?? "gray"] ?? "#b9c5d0", whiteSpace: "nowrap",
                }}>
                  {c.category}
                </span>
                <span style={{ fontSize: 12, color: c.is_required ? "#b23b3b" : "#687383" }}>
                  {c.is_required ? "Yes" : "—"}
                </span>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 5,
                  background: c.is_published ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.06)",
                  color: c.is_published ? "#34d399" : "#687383",
                }}>
                  {c.is_published ? "Published" : c.content_status === "in_review" ? "In Review" : c.content_status === "approved" ? "Approved" : "Draft"}
                </span>
                <Link href={`/university/admin/studio/${c.id}`} style={{
                  fontSize: 12, fontWeight: 700, color: "#f58220", textDecoration: "none",
                  padding: "4px 10px", borderRadius: 7,
                  background: "rgba(245,130,32,0.08)", border: "1px solid rgba(245,130,32,0.2)",
                }}>
                  Studio →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
