import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Edit Course",
  robots: { index: false, follow: false },
};

interface Props { params: Promise<{ id: string }> }

export default async function AdminCourseEditPage({ params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const sb = createServiceClient();

  const { data: course } = await sb
    .from("uni_courses")
    .select("*")
    .eq("id", id)
    .single();

  if (!course) notFound();

  const { data: lessons } = await sb
    .from("uni_lessons")
    .select("id, title, duration_label, sort_order, is_published")
    .eq("course_id", id)
    .order("sort_order");

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,4vw,48px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <Link href="/university/admin/courses" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>← Courses</Link>
        <h1 style={{ fontSize: "clamp(20px,3.5vw,30px)", fontWeight: 800, letterSpacing: "-0.5px", fontFamily: "Manrope, system-ui" }}>
          Edit: {course.title}
        </h1>
      </div>

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "36px clamp(16px,4vw,40px) 64px", display: "flex", flexDirection: "column", gap: 40 }}>
        {/* Course metadata form */}
        <section>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#071a2e", marginBottom: 16 }}>Course details</h2>
          <form action={`/api/university/admin/course/${id}`} method="POST" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <input type="hidden" name="_method" value="PATCH" />
            {[
              { name: "title",       label: "Title",          defaultValue: course.title,        type: "text" },
              { name: "slug",        label: "Slug",           defaultValue: course.slug,         type: "text" },
              { name: "thumbnail_url", label: "Thumbnail URL", defaultValue: course.thumbnail_url ?? "", type: "url" },
              { name: "duration_label", label: "Duration label (e.g. 7 modules · 1.4 hours)", defaultValue: course.duration_label ?? "", type: "text" },
            ].map(f => (
              <div key={f.name}>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>{f.label}</label>
                <input name={f.name} type={f.type} defaultValue={f.defaultValue} style={{
                  width: "100%", padding: "10px 14px", borderRadius: 9,
                  border: "1.5px solid #dfe4e8", background: "#fff", fontSize: 14, outline: "none",
                }} />
              </div>
            ))}

            {/* Description */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>Description</label>
              <textarea name="description" rows={3} defaultValue={course.description ?? ""} style={{
                width: "100%", padding: "10px 14px", borderRadius: 9,
                border: "1.5px solid #dfe4e8", background: "#fff", fontSize: 14, outline: "none", resize: "vertical",
              }} />
            </div>

            {/* Category + path_tag */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>Category</label>
                <select name="category" defaultValue={course.category} style={{
                  width: "100%", padding: "10px 14px", borderRadius: 9,
                  border: "1.5px solid #dfe4e8", background: "#fff", fontSize: 14, outline: "none",
                }}>
                  {["general","start","sales","product","operations","compliance"].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>Path tag</label>
                <select name="path_tag" defaultValue={course.path_tag ?? ""} style={{
                  width: "100%", padding: "10px 14px", borderRadius: 9,
                  border: "1.5px solid #dfe4e8", background: "#fff", fontSize: 14, outline: "none",
                }}>
                  <option value="">None</option>
                  {["harrys_playbook","fast_start","sales","product","operations","compliance"].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Flags */}
            <div style={{ display: "flex", gap: 24 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" name="is_published" defaultChecked={course.is_published} value="true" />
                Published
              </label>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
                <input type="checkbox" name="is_required" defaultChecked={course.is_required} value="true" />
                Required
              </label>
            </div>

            <button type="submit" style={{
              padding: "12px 24px", borderRadius: 10, alignSelf: "flex-start",
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
            }}>
              Save changes
            </button>
          </form>
        </section>

        {/* Lessons */}
        <section>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#071a2e" }}>
              Lessons ({(lessons ?? []).length})
            </h2>
            <Link href={`/university/admin/courses/${id}/new-lesson`} style={{
              padding: "8px 16px", borderRadius: 8,
              background: "#071a2e", color: "#fff",
              fontSize: 12, fontWeight: 600, textDecoration: "none",
            }}>
              + Add lesson
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {(lessons ?? []).map((l, i) => (
              <div key={l.id} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", borderRadius: 9,
                border: "1px solid #dfe4e8", background: "#f7f8fa",
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: l.is_published ? "#071a2e" : "#dfe4e8",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 700, color: l.is_published ? "#fff" : "#687383",
                }}>
                  {i + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#071a2e" }}>{l.title}</div>
                  <div style={{ fontSize: 11, color: "#687383" }}>{l.duration_label ?? ""} · {l.is_published ? "Published" : "Draft"}</div>
                </div>
                <Link href={`/university/admin/courses/${id}/lesson/${l.id}`} style={{ fontSize: 12, color: "#f58220", fontWeight: 600, textDecoration: "none" }}>
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
