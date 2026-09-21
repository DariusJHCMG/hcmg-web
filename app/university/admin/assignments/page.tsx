import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";
import { AssignmentFormClient } from "@/components/university/admin/AssignmentFormClient";

export const metadata: Metadata = {
  title: "HCMG U | Assignments",
  robots: { index: false, follow: false },
};

export default async function AdminAssignmentsPage() {
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin/assignments");
  if (!isUniversityAdmin(profile)) redirect("/university");

  const sb = createServiceClient();

  const [{ data: courses }, { data: profiles }, { data: recentEnrollments }] = await Promise.all([
    sb.from("uni_courses").select("id, title, slug").eq("is_published", true).order("sort_order"),
    sb.from("profiles")
      .select("id, full_name, email, role, department, university_access")
      .eq("is_active", true)
      .eq("university_access", true)
      .order("full_name"),
    sb.from("uni_enrollments")
      .select("profile_id, course_id, assignment_type, enrolled_at, profiles:profile_id(full_name, email), uni_courses:course_id(title)")
      .order("enrolled_at", { ascending: false })
      .limit(40),
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

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px clamp(16px,4vw,40px) 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>
          <AssignmentFormClient
            courses={courses ?? []}
            profiles={profiles ?? []}
            adminId={profile.id}
          />

          {/* Recent assignments */}
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 14, fontFamily: "Manrope" }}>
              Recent Enrollments
            </h2>
            {(recentEnrollments ?? []).length === 0 ? (
              <p style={{ fontSize: 13, color: "#687383" }}>No assignments yet.</p>
            ) : (
              <div style={{ border: "1px solid #dfe4e8", borderRadius: 10, overflow: "hidden" }}>
                {(recentEnrollments ?? []).map((e, i) => {
                  const emp    = (e.profiles as unknown as { full_name: string; email: string } | null);
                  const course = (e.uni_courses as unknown as { title: string } | null);
                  return (
                    <div key={i} style={{
                      padding: "10px 14px",
                      borderBottom: i < (recentEnrollments ?? []).length - 1 ? "1px solid #dfe4e8" : undefined,
                      background: i % 2 === 0 ? "#fff" : "#f7f8fa",
                      fontSize: 12,
                    }}>
                      <div style={{ fontWeight: 600, color: "#071a2e" }}>{emp?.full_name ?? "—"}</div>
                      <div style={{ color: "#687383" }}>{course?.title ?? "—"}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 3 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 4,
                          background: "rgba(245,130,32,0.1)", color: "#f58220", textTransform: "uppercase",
                        }}>
                          {e.assignment_type ?? "self"}
                        </span>
                        <span style={{ fontSize: 10, color: "#b9c5d0" }}>
                          {new Date(e.enrolled_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
