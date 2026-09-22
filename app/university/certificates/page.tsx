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
    .select("id, course_id, issued_at, verification_id, uni_courses:course_id(title, slug, thumbnail_url)")
    .eq("profile_id", profile.id)
    .is("revoked_at", null)
    .order("issued_at", { ascending: false });

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
        <span style={{ fontSize: 12, color: "#142234", fontWeight: 600 }}>Certificates</span>
      </div>

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
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginTop: 8 }}>
          Each certificate represents a course you've completed and mastered.
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px clamp(16px,4vw,40px) 80px" }}>
        {!certs || certs.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "64px 24px",
            background: "#f7f8fa", borderRadius: 16,
            border: "1px solid #dfe4e8",
          }}>
            {/* Medal SVG */}
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ marginBottom: 20 }}>
              <circle cx="32" cy="38" r="18" fill="#e9ecef" stroke="#dfe4e8" strokeWidth="2"/>
              <circle cx="32" cy="38" r="13" fill="#f7f8fa" stroke="#dfe4e8" strokeWidth="1.5"/>
              <path d="M24 12 L32 4 L40 12 L32 20Z" fill="#dfe4e8"/>
              <rect x="28" y="18" width="8" height="10" rx="2" fill="#e9ecef"/>
            </svg>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#071a2e", marginBottom: 8 }}>No certificates yet</h3>
            <p style={{ fontSize: 14, color: "#687383", marginBottom: 28 }}>
              Complete a course to earn your first certificate.
            </p>
            <Link href="/university/search" style={{
              padding: "13px 28px", borderRadius: 10,
              background: "linear-gradient(135deg,#FF9847,#F37021)",
              color: "#fff", fontWeight: 700, fontSize: 14, textDecoration: "none",
              display: "inline-block",
            }}>
              Browse courses →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 28 }}>
            {certs.map((cert, i) => {
              const course = (cert.uni_courses as unknown) as { title: string; slug: string; thumbnail_url: string | null } | null;
              const verifyUrl = cert.verification_id
                ? `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/university/verify/${cert.verification_id}`
                : null;
              const issuedDate = new Date(cert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

              return (
                <div key={cert.id} style={{
                  position: "relative",
                  background: "linear-gradient(160deg, #071a2e 0%, #0d2d50 55%, #0a2240 100%)",
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid rgba(245,130,32,0.35)",
                  boxShadow: "0 8px 40px rgba(0,0,0,0.28), 0 0 0 1px rgba(245,130,32,0.1) inset",
                  display: "flex", flexDirection: "column",
                  /* subtle shimmer stripe */
                }}>

                  {/* Top shimmer band */}
                  <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 3,
                    background: "linear-gradient(90deg, transparent, #f58220, #ffc26a, #f58220, transparent)",
                  }} />

                  {/* Watermark starburst */}
                  <div style={{
                    position: "absolute", top: 12, right: 16, opacity: 0.06,
                    fontSize: 100, lineHeight: 1, color: "#f58220", userSelect: "none",
                    pointerEvents: "none",
                  }}>✦</div>

                  {/* Cert number ribbon */}
                  <div style={{
                    position: "absolute", top: 14, right: 14,
                    background: "linear-gradient(135deg,#f58220,#d4611a)",
                    borderRadius: 6, padding: "3px 9px",
                    fontSize: 9, fontWeight: 800, letterSpacing: "1.2px",
                    color: "#fff", textTransform: "uppercase",
                  }}>
                    #{String(i + 1).padStart(3, "0")}
                  </div>

                  {/* Badge medallion */}
                  <div style={{ display: "flex", justifyContent: "center", paddingTop: 36, paddingBottom: 4 }}>
                    <div style={{ position: "relative", width: 84, height: 84 }}>
                      {/* Outer ring */}
                      <div style={{
                        position: "absolute", inset: 0,
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, #f58220, #ffc26a, #f58220, #d4611a)",
                        boxShadow: "0 4px 20px rgba(245,130,32,0.5)",
                      }} />
                      {/* Inner ring */}
                      <div style={{
                        position: "absolute", inset: 5,
                        borderRadius: "50%",
                        background: "linear-gradient(145deg, #0f2d50, #071a2e)",
                        border: "1.5px solid rgba(245,130,32,0.4)",
                      }} />
                      {/* Star / icon */}
                      <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 30,
                      }}>
                        {/* Laurel + star SVG */}
                        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                          <polygon points="20,4 23.5,14.5 34.5,14.5 25.7,21 29.2,31.5 20,25 10.8,31.5 14.3,21 5.5,14.5 16.5,14.5" fill="#f58220"/>
                          <polygon points="20,8 22.8,16.2 31.5,16.2 24.5,21.2 27.3,29.5 20,24.5 12.7,29.5 15.5,21.2 8.5,16.2 17.2,16.2" fill="#ffc26a"/>
                          <polygon points="20,11 22,17.5 29,17.5 23.5,21.5 25.5,28 20,24 14.5,28 16.5,21.5 11,17.5 18,17.5" fill="#fff" opacity="0.85"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "12px 22px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                    {/* Label */}
                    <p style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: "2px",
                      textTransform: "uppercase", color: "#f58220",
                      textAlign: "center", marginBottom: 6,
                    }}>
                      Certificate of Completion
                    </p>

                    {/* Course title */}
                    <h3 style={{
                      fontSize: 16, fontWeight: 800, color: "#fff",
                      textAlign: "center", lineHeight: 1.3,
                      marginBottom: 6, letterSpacing: "-0.3px",
                    }}>
                      {course?.title ?? "Course Certificate"}
                    </h3>

                    {/* Divider */}
                    <div style={{
                      height: 1, background: "linear-gradient(90deg, transparent, rgba(245,130,32,0.4), transparent)",
                      margin: "10px 0",
                    }} />

                    {/* Issued date */}
                    <p style={{
                      fontSize: 11, color: "rgba(255,255,255,0.45)",
                      textAlign: "center", marginBottom: 18,
                    }}>
                      Issued {issuedDate}
                    </p>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, marginTop: "auto" }}>
                      <a
                        href={`/api/university/certificate/${cert.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flex: 1, padding: "10px 0", borderRadius: 9,
                          background: "linear-gradient(135deg,#FF9847,#F37021)",
                          color: "#fff", fontSize: 12, fontWeight: 700,
                          textDecoration: "none", textAlign: "center",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                          boxShadow: "0 2px 12px rgba(245,130,32,0.35)",
                        }}
                      >
                        ↓ Download PDF
                      </a>
                      {course?.slug && (
                        <Link href={`/university/course/${course.slug}`} style={{
                          padding: "10px 14px", borderRadius: 9,
                          border: "1.5px solid rgba(255,255,255,0.14)",
                          background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.65)",
                          fontSize: 12, fontWeight: 600, textDecoration: "none",
                          display: "flex", alignItems: "center",
                        }}>
                          Course
                        </Link>
                      )}
                    </div>

                    {/* Verify link */}
                    {verifyUrl && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <code style={{
                            fontSize: 9, color: "rgba(255,255,255,0.3)",
                            background: "rgba(255,255,255,0.04)",
                            padding: "4px 8px", borderRadius: 5, flex: 1,
                            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                          }}>
                            {verifyUrl}
                          </code>
                          <a
                            href={verifyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ fontSize: 10, fontWeight: 700, color: "#34d399", textDecoration: "none", whiteSpace: "nowrap" }}
                          >
                            Verify ↗
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom shimmer band */}
                  <div style={{
                    height: 3,
                    background: "linear-gradient(90deg, transparent, rgba(245,130,32,0.3), transparent)",
                  }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
