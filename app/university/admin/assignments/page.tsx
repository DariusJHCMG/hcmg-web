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

  const [{ data: courses }, { data: profiles }] = await Promise.all([
    sb.from("uni_courses").select("id, title, slug").eq("is_published", true).order("sort_order"),
    sb.from("profiles")
      .select("id, full_name, email, role, department, university_access")
      .eq("is_active", true)
      .eq("university_access", true)
      .order("full_name"),
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
        <AssignmentFormClient
          courses={courses ?? []}
          profiles={profiles ?? []}
          adminId={profile.id}
        />
      </div>
    </div>
  );
}
