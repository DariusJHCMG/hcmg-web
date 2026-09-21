import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin, isUniversityTrainer } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Manage Courses",
  robots: { index: false, follow: false },
};

export default async function AdminCoursesPage(
  { searchParams }: { searchParams: Promise<Record<string,string>> }
) {
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin/courses");
  if (!isUniversityAdmin(profile) && !isUniversityTrainer(profile)) redirect("/university");

  const sp = await searchParams;
  const filterQ      = sp.q?.trim().toLowerCase() ?? "";
  const filterStatus = sp.status ?? "";

  const sb = createServiceClient();

  let query = sb.from("uni_courses").select("*").order("sort_order");
  const { data: allCourses } = await query;

  const courses = (allCourses ?? []).filter(c => {
    if (filterQ && !c.title.toLowerCase().includes(filterQ) && !(c.slug ?? "").toLowerCase().includes(filterQ)) return false;
    if (filterStatus === "published" && !c.is_published) return false;
    if (filterStatus === "draft"     && c.is_published)  return false;
    if (filterStatus === "required"  && !c.is_required)  return false;
    return true;
  });

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
          <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 4 }}>
            {(allCourses ?? []).length} course{(allCourses ?? []).length !== 1 ? "s" : ""}
            {filterQ || filterStatus ? ` · ${courses.length} shown` : ""}
          </p>
        </div>
        <Link href="/university/admin/courses/new" style={{
          padding: "11px 22px", borderRadius: 10,
          background: "linear-gradient(135deg,#FF9847,#F37021)",
          color: "#fff", fontWeight: 700, fontSize: 13, textDecoration: "none",
        }}>
          + New Course
        </Link>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px clamp(16px,4vw,40px) 64px" }}>

        {/* Search + filter bar */}
        <form method="GET" style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            border: "1.5px solid #dfe4e8", borderRadius: 8, padding: "0 12px",
            background: "#fff", height: 38, flex: "1 1 200px",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#687383" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              name="q"
              type="search"
              defaultValue={filterQ}
              placeholder="Search courses…"
              style={{ border: "none", outline: "none", fontSize: 13, background: "transparent", flex: 1, color: "#071a2e" }}
            />
          </div>
          <select
            name="status"
            defaultValue={filterStatus}
            style={{ padding: "7px 12px", borderRadius: 8, border: "1.5px solid #dfe4e8", fontSize: 12, background: "#fff", fontFamily: "inherit" }}
          >
            <option value="">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="required">Required</option>
          </select>
          <button type="submit" style={{ padding: "8px 18px", borderRadius: 8, background: "linear-gradient(135deg,#FF9847,#F37021)", color: "#fff", border: "none", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            Filter
          </button>
          {(filterQ || filterStatus) && (
            <Link href="/university/admin/courses" style={{ fontSize: 12, color: "#687383", alignSelf: "center", textDecoration: "underline" }}>Clear</Link>
          )}
        </form>

        {courses.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#687383", fontSize: 14, background: "#f7f8fa", borderRadius: 10, border: "1px solid #dfe4e8" }}>
            {filterQ || filterStatus
              ? <>No courses match. <Link href="/university/admin/courses" style={{ color: "#f58220" }}>Clear filters →</Link></>
              : <>No courses yet. <Link href="/university/admin/courses/new" style={{ color: "#f58220" }}>Create the first one →</Link></>
            }
          </div>
        ) : (
          <div style={{ border: "1px solid #dfe4e8", borderRadius: 10, overflow: "hidden" }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr auto auto auto auto auto",
              padding: "10px 16px", background: "#071a2e",
              fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: "#687383",
              gap: 12,
            }}>
              <span>Course</span>
              <span>Category</span>
              <span>Required</span>
              <span>Status</span>
              <span>Edit</span>
              <span>Studio</span>
            </div>

            {courses.map((c, i) => (
              <div key={c.id} style={{
                display: "grid", gridTemplateColumns: "1fr auto auto auto auto auto",
                padding: "14px 16px", gap: 12,
                alignItems: "center",
                borderBottom: i < courses.length - 1 ? "1px solid #dfe4e8" : undefined,
                background: i % 2 === 0 ? "#fff" : "#f7f8fa",
              }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#071a2e" }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: "#687383" }}>
                    <span style={{ opacity: 0.6 }}>URL:</span> /university/course/{c.slug}
                  </div>
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
                  {c.is_published ? "Published" : "Draft"}
                </span>
                <Link href={`/university/admin/courses/${c.id}`} style={{
                  fontSize: 12, fontWeight: 600, color: "#687383", textDecoration: "none",
                  padding: "4px 10px", borderRadius: 7,
                  background: "rgba(0,0,0,0.03)", border: "1px solid #dfe4e8",
                  whiteSpace: "nowrap",
                }}>
                  Edit →
                </Link>
                <Link href={`/university/admin/studio/${c.id}`} style={{
                  fontSize: 12, fontWeight: 700, color: "#f58220", textDecoration: "none",
                  padding: "4px 10px", borderRadius: 7,
                  background: "rgba(245,130,32,0.08)", border: "1px solid rgba(245,130,32,0.2)",
                  whiteSpace: "nowrap",
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
