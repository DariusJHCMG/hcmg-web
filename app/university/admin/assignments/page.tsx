import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Assignments",
  robots: { index: false, follow: false },
};

export default async function AdminAssignmentsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const sb = createServiceClient();

  const [{ data: courses }, { data: profiles }] = await Promise.all([
    sb.from("uni_courses").select("id, title, slug").eq("is_published", true).order("sort_order"),
    sb.from("profiles").select("id, full_name, email, role, department, university_access").eq("is_active", true).eq("university_access", true).order("full_name"),
  ]);

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,4vw,48px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <Link href="/university/admin" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>← Admin</Link>
        <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
          Course Assignments
        </h1>
        <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 6 }}>
          Assign courses to individual team members, roles, or companywide.
        </p>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "40px clamp(16px,4vw,40px) 64px" }}>
        <AssignmentForm courses={courses ?? []} profiles={profiles ?? []} adminId={profile.id} />
      </div>
    </div>
  );
}

function AssignmentForm({
  courses,
  profiles,
  adminId,
}: {
  courses: { id: string; title: string; slug: string }[];
  profiles: { id: string; full_name: string; email: string; role: string; department: string | null; university_access: boolean }[];
  adminId: string;
}) {
  // This is rendered server-side — the form POSTs to a simple API endpoint
  // For a full interactive experience, this would be a client component
  return (
    <form action="/api/university/admin/assign" method="POST" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <input type="hidden" name="assigned_by" value={adminId} />

      {/* Course */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 7 }}>
          Course
        </label>
        <select name="course_id" required style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          border: "1.5px solid #dfe4e8", background: "#fff",
          fontSize: 14, color: "#071a2e", outline: "none",
        }}>
          <option value="">Select a course…</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>

      {/* Assignment type */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 7 }}>
          Assign to
        </label>
        <select name="assignment_type" required style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          border: "1.5px solid #dfe4e8", background: "#fff",
          fontSize: 14, color: "#071a2e", outline: "none",
        }}>
          <option value="companywide">All active HCMG U members</option>
          <option value="self">Individual user</option>
          <option value="role">By role</option>
          <option value="department">By department</option>
        </select>
      </div>

      {/* Individual user */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 7 }}>
          User (for individual assignment)
        </label>
        <select name="profile_id" style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          border: "1.5px solid #dfe4e8", background: "#fff",
          fontSize: 14, color: "#071a2e", outline: "none",
        }}>
          <option value="">All (based on type above)</option>
          {profiles.map(p => (
            <option key={p.id} value={p.id}>{p.full_name} — {p.email}</option>
          ))}
        </select>
      </div>

      {/* Due date */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#071a2e", display: "block", marginBottom: 7 }}>
          Due date (optional)
        </label>
        <input type="date" name="due_date" style={{
          width: "100%", padding: "11px 14px", borderRadius: 10,
          border: "1.5px solid #dfe4e8", background: "#fff",
          fontSize: 14, color: "#071a2e", outline: "none",
        }} />
      </div>

      <button type="submit" style={{
        padding: "13px 24px", borderRadius: 10,
        background: "linear-gradient(135deg,#FF9847,#F37021)",
        color: "#fff", fontWeight: 700, fontSize: 14,
        border: "none", cursor: "pointer",
      }}>
        Assign course →
      </button>
    </form>
  );
}
