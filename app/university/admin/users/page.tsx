import { redirect } from "next/navigation";
import { getVerifiedProfile, isUniversityAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";
import { AdminUsersTable } from "@/components/university/admin/AdminUsersTable";

export const metadata: Metadata = {
  title: "HCMG U | User Access",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const profile = await getVerifiedProfile();
  if (!profile) redirect("/login?next=/university/admin/users");
  if (!isUniversityAdmin(profile)) redirect("/university");

  const sb = createServiceClient();

  const { data: users } = await sb
    .from("profiles")
    .select("id, full_name, email, role, is_active, employment_status, university_access, university_role, department, last_login_at")
    .order("full_name");

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(28px,4vw,48px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <Link href="/university/admin" style={{ fontSize: 12, color: "#687383", textDecoration: "none", display: "block", marginBottom: 8 }}>← Admin</Link>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 8 }}>
          Access Management
        </p>
        <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
          User Access
        </h1>
        <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 6 }}>
          Manage <code>university_access</code> and <code>university_role</code> inline. Changes are applied immediately and written to the audit log.
        </p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px" }}>
        <AdminUsersTable users={users ?? []} />

        <p style={{ marginTop: 16, fontSize: 12, color: "#687383" }}>
          {(users ?? []).length} team members listed.
          To change a user&apos;s system role (<code>role</code>) or activation status (<code>is_active</code>),
          use the <Link href="/admin/users" style={{ color: "#f58220" }}>Admin → Users</Link> panel.
        </p>
      </div>
    </div>
  );
}
