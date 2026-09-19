import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HCMG U | My Certificates",
  robots: { index: false, follow: false },
};

export default async function CertificatesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const sb = createServiceClient();

  const { data: certs } = await sb
    .from("uni_certificates")
    .select("id, course_id, issued_at, uni_courses:course_id(title, slug, thumbnail_url)")
    .eq("profile_id", profile.id)
    .is("revoked_at", null)
    .order("issued_at", { ascending: false });

  return (
    <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", background: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(145deg, #06182a, #0c2b4b)",
        padding: "clamp(32px,5vw,56px) clamp(24px,6vw,64px)",
        color: "#fff",
      }}>
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", color: "#f58220", marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ display: "inline-block", width: 16, height: 2, background: "#f58220" }} />
          My achievements
        </p>
        <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, letterSpacing: "-1.5px", fontFamily: "Manrope, system-ui" }}>
          Certificates
        </h1>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px clamp(16px,4vw,40px) 64px" }}>
        {!certs || certs.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 0",
            background: "#f7f8fa", borderRadius: 12,
            border: "1px solid #dfe4e8",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>◈</div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#071a2e", marginBottom: 8 }}>No certificates yet</h3>
            <p style={{ fontSize: 14, color: "#687383", marginBottom: 24 }}>
              Complete a course to earn your first certificate.
            </p>
            <Link href="/university/search" style={{
              padding: "12px 24px", borderRadius: 10,
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
            }}>
              Browse courses →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {certs.map(cert => {
              const course = (cert.uni_courses as unknown) as { title: string; slug: string; thumbnail_url: string | null } | null;
              return (
                <div key={cert.id} style={{
                  background: "linear-gradient(145deg, #06182a, #0c2b4b)",
                  borderRadius: 14,
                  padding: "24px 20px",
                  border: "1px solid rgba(245,130,32,0.2)",
                  boxShadow: "0 4px 20px rgba(245,130,32,0.08)",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: "linear-gradient(135deg,#FF9847,#F37021)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, color: "#fff", marginBottom: 14,
                  }}>◈</div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
                    {course?.title ?? "Course Certificate"}
                  </h3>
                  <p style={{ fontSize: 12, color: "#687383", marginBottom: 14 }}>
                    Issued {new Date(cert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <div style={{ display: "flex", gap: 8 }}>
                    {course?.slug && (
                      <Link href={`/university/course/${course.slug}`} style={{
                        padding: "8px 14px", borderRadius: 8,
                        border: "1.5px solid rgba(255,255,255,0.12)",
                        background: "transparent", color: "#b9c5d0",
                        fontSize: 12, fontWeight: 600, textDecoration: "none",
                      }}>
                        View course
                      </Link>
                    )}
                    <span style={{
                      padding: "8px 14px", borderRadius: 8,
                      background: "rgba(52,211,153,0.1)",
                      color: "#34d399", fontSize: 12, fontWeight: 700,
                    }}>
                      ✓ Complete
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
