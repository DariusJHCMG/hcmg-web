import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | User Access",
  robots: { index: false, follow: false },
};

export default async function AdminUsersPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

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
        <h1 style={{ fontSize: "clamp(22px,3.5vw,34px)", fontWeight: 800, letterSpacing: "-1px", fontFamily: "Manrope, system-ui" }}>
          User Access
        </h1>
        <p style={{ fontSize: 13, color: "#b9c5d0", marginTop: 6 }}>
          Manage university_access and university_role for each team member.
        </p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px clamp(16px,4vw,40px) 64px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 700 }}>
          <thead>
            <tr style={{ background: "#071a2e" }}>
              {["Name","Email","Status","Employment","U Access","U Role","Last Login"].map(h => (
                <th key={h} style={{
                  padding: "10px 12px", textAlign: "left",
                  fontSize: 10, fontWeight: 700, textTransform: "uppercase",
                  letterSpacing: "0.8px", color: "#687383",
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(users ?? []).map((u, i) => (
              <tr key={u.id} style={{ borderBottom: "1px solid #dfe4e8", background: i % 2 === 0 ? "#fff" : "#f7f8fa" }}>
                <td style={{ padding: "12px 12px" }}>
                  <div style={{ fontWeight: 600, color: "#071a2e" }}>{u.full_name}</div>
                  <div style={{ fontSize: 11, color: "#687383" }}>{u.role}</div>
                </td>
                <td style={{ padding: "12px 12px", fontSize: 12, color: "#687383" }}>{u.email}</td>
                <td style={{ padding: "12px 12px" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                    background: u.is_active ? "rgba(52,211,153,0.1)" : "rgba(178,59,59,0.1)",
                    color: u.is_active ? "#34d399" : "#f87171",
                  }}>
                    {u.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "12px 12px" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                    background: u.employment_status === "active" ? "rgba(52,211,153,0.1)" : "rgba(178,59,59,0.1)",
                    color: u.employment_status === "active" ? "#34d399" : "#f87171",
                  }}>
                    {u.employment_status ?? "active"}
                  </span>
                </td>
                <td style={{ padding: "12px 12px" }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 5,
                    background: u.university_access ? "rgba(245,130,32,0.12)" : "rgba(255,255,255,0.04)",
                    color: u.university_access ? "#f58220" : "#687383",
                  }}>
                    {u.university_access ? "Yes" : "No"}
                  </span>
                </td>
                <td style={{ padding: "12px 12px", fontSize: 12, color: "#071a2e" }}>
                  {u.university_role ?? "learner"}
                </td>
                <td style={{ padding: "12px 12px", fontSize: 11, color: "#687383" }}>
                  {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ marginTop: 20, fontSize: 12, color: "#687383" }}>
          To change a user&apos;s university access, update <code>university_access</code> and <code>university_role</code> in the{" "}
          <Link href="/admin/users" style={{ color: "#f58220" }}>Admin → Users</Link> panel or directly in Supabase. Changes take effect immediately.
        </p>
      </div>
    </div>
  );
}
