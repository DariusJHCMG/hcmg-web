import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | New Course",
  robots: { index: false, follow: false },
};

export default function NewCoursePage() {
  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,4vw,48px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <Link href="/university/admin/courses" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>← Courses</Link>
        <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
          New Course
        </h1>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "36px clamp(16px,4vw,40px) 64px" }}>
        <form action="/api/university/admin/course" method="POST" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { name: "title",          label: "Title",                  type: "text",    required: true  },
            { name: "slug",           label: "URL slug (e.g. new-lo-fast-start)", type: "text", required: true },
            { name: "thumbnail_url",  label: "Thumbnail URL",          type: "url",    required: false },
            { name: "duration_label", label: "Duration (e.g. 7 modules · 1.4 hours)", type: "text", required: false },
          ].map(f => (
            <div key={f.name}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>{f.label}</label>
              <input name={f.name} type={f.type} required={f.required} style={{
                width: "100%", padding: "10px 14px", borderRadius: 9,
                border: "1.5px solid #dfe4e8", background: "#fff", fontSize: 14, outline: "none",
              }} />
            </div>
          ))}

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>Description</label>
            <textarea name="description" rows={3} style={{
              width: "100%", padding: "10px 14px", borderRadius: 9,
              border: "1.5px solid #dfe4e8", background: "#fff", fontSize: 14, outline: "none", resize: "vertical",
            }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>Category</label>
              <select name="category" defaultValue="general" style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1.5px solid #dfe4e8", background: "#fff", fontSize: 14 }}>
                {["general","start","sales","product","operations","compliance"].map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>Path tag</label>
              <select name="path_tag" defaultValue="" style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1.5px solid #dfe4e8", background: "#fff", fontSize: 14 }}>
                <option value="">None</option>
                {["harrys_playbook","fast_start","sales","product","operations","compliance"].map(t => (<option key={t} value={t}>{t}</option>))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 6 }}>Pill color</label>
              <select name="pill_color" defaultValue="gray" style={{ width: "100%", padding: "10px 14px", borderRadius: 9, border: "1.5px solid #dfe4e8", background: "#fff", fontSize: 14 }}>
                {["orange","blue","gold","green","red","gray"].map(c => (<option key={c} value={c}>{c}</option>))}
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" name="is_published" value="true" /> Published
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer" }}>
              <input type="checkbox" name="is_required" value="true" /> Required
            </label>
          </div>

          <button type="submit" style={{
            padding: "12px 24px", borderRadius: 10, alignSelf: "flex-start",
            background: "linear-gradient(135deg,#FF9847,#F37021)",
            color: "#fff", fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
          }}>
            Create course →
          </button>
        </form>
      </div>
    </div>
  );
}
