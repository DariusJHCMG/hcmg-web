import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Certificate Verification — HCMG U",
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ verificationId: string }>;
}

interface VerifyResult {
  valid: boolean;
  status?: "active" | "expired" | "revoked";
  learner_name?: string;
  course_title?: string;
  issued_at?: string;
  expires_at?: string | null;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day:   "numeric",
    year:  "numeric",
  });
}

// Public verification page — no auth required
// Accessed via QR codes printed on PDF certificates
export default async function VerifyPage({ params }: Props) {
  const { verificationId } = await params;

  let result: VerifyResult = { valid: false };
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/university/verify/${verificationId}`,
      { cache: "no-store" }
    );
    if (res.ok) result = await res.json();
  } catch {
    result = { valid: false };
  }

  const isActive  = result.status === "active";
  const isExpired = result.status === "expired";
  const isRevoked = result.status === "revoked";
  const notFound  = !result.status;

  return (
    <main style={{
      minHeight: "100vh",
      backgroundColor: "#f0f2f5",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "32px 16px",
      fontFamily: '-apple-system, "Segoe UI", system-ui, sans-serif',
    }}>
      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: 520,
        backgroundColor: "#ffffff",
        borderRadius: 16,
        boxShadow: "0 2px 20px rgba(0,0,0,0.08)",
        overflow: "hidden",
      }}>
        {/* Header stripe */}
        <div style={{
          backgroundColor: "#06182a",
          padding: "28px 32px 24px",
          textAlign: "center",
        }}>
          {/* HCMG wordmark */}
          <div style={{
            fontSize: 22,
            fontWeight: 900,
            color: "#f58220",
            letterSpacing: "-0.3px",
            marginBottom: 4,
          }}>
            HCMG University
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>
            Certificate Verification
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: "32px" }}>
          {/* ── Active ── */}
          {isActive && (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "rgba(22,163,74,0.10)",
                  marginBottom: 14,
                }}>
                  {/* Checkmark SVG */}
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="16" fill="#16a34a" fillOpacity="0.15"/>
                    <path d="M9 17l5 5 9-10" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1f2328", margin: "0 0 6px" }}>
                  Certificate Verified
                </h1>
                <p style={{ fontSize: 13, color: "#57606a", margin: 0 }}>
                  This certificate is authentic and currently valid.
                </p>
              </div>

              <DetailRow label="Recipient"  value={result.learner_name ?? "—"} />
              <DetailRow label="Course"     value={result.course_title ?? "—"} />
              <DetailRow label="Issued"     value={formatDate(result.issued_at)} />
              {result.expires_at && (
                <DetailRow label="Expires"  value={formatDate(result.expires_at)} />
              )}
              <StatusBadge color="#16a34a" bg="rgba(22,163,74,0.08)" label="Active" />
            </>
          )}

          {/* ── Expired ── */}
          {isExpired && (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "rgba(217,119,6,0.10)",
                  marginBottom: 14,
                }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="16" fill="#d97706" fillOpacity="0.15"/>
                    <path d="M16 10v7M16 21h.01" stroke="#d97706" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1f2328", margin: "0 0 6px" }}>
                  Certificate Expired
                </h1>
                <p style={{ fontSize: 13, color: "#57606a", margin: 0 }}>
                  This certificate was valid but has since expired.
                </p>
              </div>

              <DetailRow label="Recipient"  value={result.learner_name ?? "—"} />
              <DetailRow label="Course"     value={result.course_title ?? "—"} />
              <DetailRow label="Issued"     value={formatDate(result.issued_at)} />
              {result.expires_at && (
                <DetailRow label="Expired"  value={formatDate(result.expires_at)} />
              )}
              <StatusBadge color="#d97706" bg="rgba(217,119,6,0.08)" label="Expired" />
            </>
          )}

          {/* ── Revoked ── */}
          {isRevoked && (
            <>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  backgroundColor: "rgba(220,38,38,0.10)",
                  marginBottom: 14,
                }}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                    <circle cx="16" cy="16" r="16" fill="#dc2626" fillOpacity="0.15"/>
                    <path d="M11 11l10 10M21 11l-10 10" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round"/>
                  </svg>
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1f2328", margin: "0 0 6px" }}>
                  Certificate Revoked
                </h1>
                <p style={{ fontSize: 13, color: "#57606a", margin: 0 }}>
                  This certificate has been revoked and is no longer valid.
                </p>
              </div>

              <DetailRow label="Recipient"  value={result.learner_name ?? "—"} />
              <DetailRow label="Course"     value={result.course_title ?? "—"} />
              <StatusBadge color="#dc2626" bg="rgba(220,38,38,0.08)" label="Revoked" />
            </>
          )}

          {/* ── Not found ── */}
          {notFound && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                borderRadius: "50%",
                backgroundColor: "rgba(87,96,106,0.08)",
                marginBottom: 14,
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <circle cx="16" cy="16" r="16" fill="#57606a" fillOpacity="0.12"/>
                  <path d="M16 14v2M16 20h.01M12 11l4-4 4 4v9H12v-9z" stroke="#57606a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1f2328", margin: "0 0 8px" }}>
                Certificate Not Found
              </h1>
              <p style={{ fontSize: 13, color: "#57606a" }}>
                No certificate matching this verification code was found.
                The link may be invalid or the certificate may have been removed.
              </p>
            </div>
          )}

          {/* Verification code */}
          <div style={{
            marginTop: 28,
            padding: "12px 16px",
            backgroundColor: "#f7f8fa",
            borderRadius: 8,
            border: "1px solid #e5e7eb",
          }}>
            <div style={{ fontSize: 10, color: "#57606a", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
              Verification ID
            </div>
            <div style={{ fontSize: 12, color: "#1f2328", fontFamily: "monospace", wordBreak: "break-all" }}>
              {verificationId}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          borderTop: "1px solid #e5e7eb",
          padding: "16px 32px",
          textAlign: "center",
          backgroundColor: "#f7f8fa",
        }}>
          <p style={{ margin: 0, fontSize: 11, color: "#57606a" }}>
            Issued by{" "}
            <span style={{ fontWeight: 700, color: "#06182a" }}>HCMG University</span>
            {" "}· For questions contact your training administrator
          </p>
        </div>
      </div>

      {/* Made with IBM Bob */}
      <div style={{
        marginTop: 32,
        textAlign: "center",
        fontSize: 11,
        color: "#57606a",
        borderTop: "1px solid #e5e7eb",
        paddingTop: 16,
        width: "100%",
        maxWidth: 520,
      }}>
        Made with IBM Bob
      </div>
    </main>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      padding: "10px 0",
      borderBottom: "1px solid #f0f2f5",
    }}>
      <span style={{ fontSize: 13, color: "#57606a", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#1f2328", fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

function StatusBadge({ color, bg, label }: { color: string; bg: string; label: string }) {
  return (
    <div style={{ textAlign: "center", marginTop: 20 }}>
      <span style={{
        display: "inline-block",
        padding: "6px 18px",
        borderRadius: 20,
        backgroundColor: bg,
        color,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        border: `1px solid ${color}30`,
      }}>
        {label}
      </span>
    </div>
  );
}
