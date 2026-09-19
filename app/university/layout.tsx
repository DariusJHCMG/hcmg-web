import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { hasUniversityAccess, logUniAudit } from "@/lib/auth";
import type { Metadata } from "next";
import { UniversityLayoutClient } from "@/components/university/UniversityLayoutClient";

export const metadata: Metadata = {
  title: "HCMG U | Team Learning",
  description: "Internal training resource for authorized HCMG team members.",
  robots: { index: false, follow: false },
};

export default async function UniversityLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  // Not logged in or inactive profile — middleware handles the redirect,
  // but double-check here for the server-component layer
  if (!profile) redirect("/login?next=/university");

  // Active employment + university_access gate
  if (!hasUniversityAccess(profile)) {
    await logUniAudit("access_denied", {
      actorId: profile.id,
      actorEmail: profile.email,
      details: {
        reason: !profile.is_active
          ? "profile_inactive"
          : profile.employment_status !== "active"
          ? "employment_inactive"
          : "university_access_false",
      },
    });

    return (
      <div style={{
        minHeight: "100vh",
        background: "#071a2e",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        padding: "40px 24px",
      }}>
        <div style={{
          background: "#0d2a48",
          borderRadius: 16,
          padding: "48px 40px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          border: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: "linear-gradient(135deg,#FF9847,#F37021)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 900, color: "#fff",
            margin: "0 auto 20px",
          }}>H</div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 12 }}>
            Access Required
          </h1>
          <p style={{ fontSize: 14, color: "#b9c5d0", lineHeight: 1.7, marginBottom: 28 }}>
            HCMG U is available to authorized, active team members only.
            If you believe this is an error, please contact your manager or HR.
          </p>
          <a
            href="mailto:info@hcmgloans.com"
            style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              color: "#fff",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Contact Support
          </a>
          <div style={{ marginTop: 28 }}>
            <a href="/portal" style={{ color: "#687383", fontSize: 13, textDecoration: "none" }}>
              ← Back to Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <UniversityLayoutClient
      profileName={profile.full_name}
      profileAvatar={profile.avatar_url}
      universityRole={profile.university_role}
    >
      {children}
    </UniversityLayoutClient>
  );
}
