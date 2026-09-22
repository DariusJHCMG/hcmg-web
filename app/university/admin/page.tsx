import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { IntroVideoSettings } from "@/components/university/admin/IntroVideoSettings";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | Admin",
  robots: { index: false, follow: false },
};

export default async function UniversityAdminPage() {
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin");
  if (!isUniversityAdmin(profile)) redirect("/university");

  const sb = createServiceClient();

  const [
    { count: totalEnrolled },
    { count: completedThisMonth },
    { count: totalCourses },
    { data: recentActivity },
  ] = await Promise.all([
    sb.from("uni_enrollments").select("id", { count: "exact", head: true }),
    sb.from("uni_progress")
      .select("id", { count: "exact", head: true })
      .eq("completed", true)
      .gte("completed_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
    sb.from("uni_courses").select("id", { count: "exact", head: true }).eq("is_published", true),
    sb.from("uni_audit_log")
      .select("action, actor_email, created_at, details")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const stats = [
    { label: "Total enrollments",      value: totalEnrolled ?? 0 },
    { label: "Completions this month", value: completedThisMonth ?? 0 },
    { label: "Published courses",      value: totalCourses ?? 0 },
  ];

  const adminLinks = [
    { href: "/university/admin/courses",     label: "Training Studio",   desc: "Build and publish courses, lessons, and assessments" },
    { href: "/university/admin/media",       label: "Media Library",     desc: "Upload and manage videos, images, documents, and captions" },
    { href: "/university/admin/assignments", label: "Assignments",       desc: "Assign courses to individuals, roles, or departments" },
    { href: "/university/admin/reports",     label: "Reports",           desc: "Completion rates, overdue tracking, quiz performance" },
    { href: "/university/admin/compliance",  label: "Compliance",        desc: "Org compliance score, certificate expiry, required training" },
    { href: "/university/admin/users",       label: "User Access",       desc: "Manage access and university role assignments" },
    { href: "/university/admin/audit-log",   label: "Audit Log",         desc: "Complete record of all privileged actions" },
    { href: "/university/admin/exemptions",  label: "Exemptions",        desc: "Grant and track compliance exemptions" },
    { href: "/university/admin/org-units",   label: "Org Units",         desc: "Manage divisions, departments, branches, and teams" },
    { href: "/university/hr",               label: "HR Overview",        desc: "Employee training status, non-compliance, new hire tracking" },
  ];

  const ACTION_LABELS: Record<string, string> = {
    certificate_issued:          "Certificate issued",
    certificate_revoked:         "Certificate revoked",
    certificate_expired_auto:    "Certificate auto-expired",
    exemption_granted:           "Exemption granted",
    exemption_revoked:           "Exemption revoked",
    quiz_passed:                 "Quiz passed",
    quiz_failed:                 "Quiz failed",
    assessment_attempted:        "Assessment submitted",
    lesson_completed:            "Lesson completed",
    video_accessed:              "Video accessed",
    user_role_updated:           "User role updated",
    user_access_updated:         "User access updated",
    org_unit_created:            "Org unit created",
    org_unit_deactivated:        "Org unit deactivated",
    course_status_changed:       "Course status changed",
    course_updated:              "Course updated",
    course_submit_review:        "Course submitted for review",
    course_approve:              "Course approved",
    course_publish:              "Course published",
    course_unpublish:            "Course unpublished",
    course_archive:              "Course archived",
    lesson_updated:              "Lesson updated",
    lesson_deleted:              "Lesson deleted",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{
        background: "#f7f8fa", borderBottom: "1px solid #dfe4e8",
        padding: "11px clamp(16px,4vw,48px)",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <Link href="/university" style={{ fontSize: 12, color: "#687383", textDecoration: "none" }}>HCMG U</Link>
        <span style={{ color: "#dfe4e8", fontSize: 12 }}>/</span>
        <span style={{ fontSize: 12, color: "#142234", fontWeight: 600 }}>Admin</span>
      </div>

      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(32px,5vw,56px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 10 }}>
          Administrator
        </p>
        <h1 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
          HCMG U Admin
        </h1>
        <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 6 }}>Signed in as {profile.full_name}</p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 32 }}>
          {stats.map(s => (
            <div key={s.label} style={{
              background: "#f7f8fa", border: "1px solid #dfe4e8",
              borderRadius: 12, padding: "20px 20px",
            }}>
              <div style={{ fontSize: 32, fontWeight: 800, color: "#071a2e", fontFamily: "Manrope, system-ui" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 12, color: "#687383", marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12, marginBottom: 40 }}>
          {adminLinks.map(l => (
            <Link key={l.href} href={l.href} style={{
              textDecoration: "none",
              background: "#071a2e", borderRadius: 12, padding: "20px",
              border: "1px solid rgba(255,255,255,0.06)",
              transition: "box-shadow 0.15s",
              display: "block",
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, marginBottom: 12,
                background: "rgba(245,130,32,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f58220" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9,18 15,12 9,6"/>
                </svg>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{l.label}</div>
              <div style={{ fontSize: 12, color: "#687383", lineHeight: 1.55 }}>{l.desc}</div>
            </Link>
          ))}
        </div>

        {/* Settings */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 12 }}>Settings</h2>
        <IntroVideoSettings />

        {/* Recent activity */}
        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#071a2e", marginBottom: 12 }}>Recent Activity</h2>
        <div style={{ border: "1px solid #dfe4e8", borderRadius: 10, overflow: "hidden" }}>
          {(recentActivity ?? []).length === 0 ? (
            <p style={{ padding: "20px", color: "#687383", fontSize: 13 }}>No activity yet.</p>
          ) : (recentActivity ?? []).map((a, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 16px",
              borderBottom: i < (recentActivity ?? []).length - 1 ? "1px solid #dfe4e8" : undefined,
              background: i % 2 === 0 ? "#fff" : "#f7f8fa",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#071a2e", minWidth: 160 }}>{ACTION_LABELS[a.action] ?? a.action.replace(/_/g, " ")}</div>
              <div style={{ fontSize: 12, color: "#687383", flex: 1 }}>{a.actor_email ?? "system"}</div>
              <div style={{ fontSize: 11, color: "#b9c5d0" }}>{new Date(a.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
