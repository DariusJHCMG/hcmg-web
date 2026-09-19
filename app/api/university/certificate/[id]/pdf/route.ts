import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import QRCode from "qrcode";

// GET /api/university/certificate/[id]/pdf
//
// Returns a print-ready HTML page styled as a professional certificate.
// The browser's native print dialog (Ctrl+P → Save as PDF) produces a clean PDF.
// This approach requires zero native binary dependencies and works in all environments.
//
// Security:
//   - Authenticated learners may only download their own certificates.
//   - university_admin may download any certificate (for HR records).
//   - No certificate data is leaked to unauthorized users.

interface Params { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const sb = createServiceClient();

  // Fetch certificate with course and learner info
  const { data: cert } = await sb
    .from("uni_certificates")
    .select(`
      id, issued_at, expires_at, revoked_at, verification_id,
      profile_id,
      uni_courses!inner ( title ),
      profiles!profile_id ( full_name )
    `)
    .eq("id", id)
    .is("revoked_at", null)
    .maybeSingle();

  if (!cert) {
    return new NextResponse("Certificate not found", { status: 404 });
  }

  // Authorization: learner can only view their own cert; admin can view any
  const isAdmin = profile.university_role === "university_admin"
    || profile.role === "admin"
    || profile.role === "developer";

  if (!isAdmin && cert.profile_id !== profile.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const courseInfo  = cert.uni_courses  as unknown as { title: string } | null;
  const profileInfo = cert.profiles     as unknown as { full_name: string } | null;
  const courseTitle = courseInfo?.title ?? "HCMG U Course";
  const learnerName = profileInfo?.full_name ?? "Team Member";

  const verifyUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com"}/university/verify/${cert.verification_id}`;

  // Generate QR code as data URI
  const qrDataUri = await QRCode.toDataURL(verifyUrl, {
    width:  160,
    margin: 1,
    color:  { dark: "#071a2e", light: "#ffffff" },
  });

  const issuedDate  = new Date(cert.issued_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const expiresDate = cert.expires_at
    ? new Date(cert.expires_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : null;

  const verificationShort = (cert.verification_id as string).split("-")[0].toUpperCase();

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Certificate — ${learnerName} — ${courseTitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; height: 100%; background: #f0f2f5; }

  @media screen {
    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 32px 16px; flex-direction: column; gap: 20px; }
    .print-hint { font-family: -apple-system, system-ui, sans-serif; font-size: 13px; color: #57606a; text-align: center; }
    .print-hint strong { color: #1f2328; }
    .print-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 11px 24px; border-radius: 9px;
      background: linear-gradient(135deg,#FF9847,#F37021);
      color: #fff; font-family: -apple-system, system-ui, sans-serif;
      font-size: 14px; font-weight: 700; border: none; cursor: pointer;
      text-decoration: none;
    }
  }
  @media print {
    .print-hint, .print-btn { display: none !important; }
    body { background: #fff; display: block; padding: 0; }
    .cert { box-shadow: none !important; page-break-inside: avoid; }
  }

  .cert {
    width: 760px;
    background: #ffffff;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 8px 40px rgba(7,26,46,.18);
    font-family: 'DM Sans', -apple-system, system-ui, sans-serif;
    position: relative;
  }

  /* Gold border stripe at top */
  .cert-top-stripe {
    height: 6px;
    background: linear-gradient(90deg, #f58220, #d4a017, #f58220);
  }

  .cert-body {
    padding: 48px 56px 40px;
    position: relative;
  }

  /* Watermark hex */
  .cert-watermark {
    position: absolute;
    right: 48px; top: 40px;
    width: 80px; height: 80px;
    opacity: 0.04;
    font-size: 72px;
    font-weight: 900;
    color: #071a2e;
    font-family: 'Manrope', system-ui;
    line-height: 1;
    user-select: none;
  }

  .cert-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 36px;
  }

  .cert-brand { display: flex; align-items: center; gap: 12px; }
  .cert-hex {
    width: 44px; height: 44px;
    background: #f58220;
    clip-path: polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; font-weight: 900; color: #fff;
    font-family: 'Manrope', system-ui;
  }
  .cert-brand-text { line-height: 1.2; }
  .cert-brand-text .org { font-size: 15px; font-weight: 800; color: #071a2e; font-family: 'Manrope', system-ui; }
  .cert-brand-text .dept { font-size: 11px; color: #687383; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600; }

  .cert-type-badge {
    font-size: 10px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;
    color: #f58220; border: 1.5px solid rgba(245,130,32,.3);
    padding: 4px 12px; border-radius: 20px; background: rgba(245,130,32,.06);
  }

  .cert-presented {
    font-size: 12px; color: #687383; font-weight: 600; letter-spacing: 0.5px;
    text-transform: uppercase; margin-bottom: 8px;
  }

  .cert-learner {
    font-size: 38px; font-weight: 800; color: #071a2e;
    font-family: 'Manrope', system-ui; letter-spacing: -1px;
    line-height: 1.1; margin-bottom: 20px;
    border-bottom: 2px solid #f58220; padding-bottom: 16px;
  }

  .cert-for {
    font-size: 12px; color: #687383; font-weight: 600; letter-spacing: 0.5px;
    text-transform: uppercase; margin-bottom: 10px;
  }
  .cert-course {
    font-size: 22px; font-weight: 800; color: #071a2e;
    font-family: 'Manrope', system-ui; letter-spacing: -0.5px;
    line-height: 1.3; margin-bottom: 28px;
  }

  .cert-details-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0;
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 32px;
  }
  .cert-detail {
    padding: 14px 16px;
    border-right: 1px solid #e5e7eb;
  }
  .cert-detail:last-child { border-right: none; }
  .cert-detail-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.2px; color: #687383; margin-bottom: 4px;
  }
  .cert-detail-value {
    font-size: 13px; font-weight: 700; color: #071a2e;
  }
  .cert-detail-value.expires { color: ${expiresDate ? "#b23b3b" : "#34d399"}; }

  .cert-footer {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    padding-top: 24px;
    border-top: 1px solid #e5e7eb;
  }

  .cert-sig-block { }
  .cert-sig-line {
    width: 200px; height: 1px; background: #071a2e; margin-bottom: 6px;
  }
  .cert-sig-name { font-size: 14px; font-weight: 800; color: #071a2e; }
  .cert-sig-title { font-size: 11px; color: #687383; }

  .cert-qr-block { text-align: center; }
  .cert-qr-block img { width: 80px; height: 80px; display: block; margin: 0 auto 4px; }
  .cert-qr-label { font-size: 9px; color: #687383; letter-spacing: 0.5px; text-transform: uppercase; }
  .cert-qr-code { font-size: 10px; font-family: monospace; color: #071a2e; font-weight: 700; margin-top: 2px; }

  .cert-bottom-stripe {
    height: 4px;
    background: linear-gradient(90deg, #071a2e, #0c2b4b, #071a2e);
  }
</style>
</head>
<body>

<div class="print-hint">
  <p style="margin-bottom:12px;">
    <strong>${learnerName}</strong> — Certificate of Completion for <strong>${courseTitle}</strong>
  </p>
  <button class="print-btn" onclick="window.print()">⬇ Download / Print PDF</button>
</div>

<div class="cert">
  <div class="cert-top-stripe"></div>

  <div class="cert-body">
    <div class="cert-watermark">H</div>

    <div class="cert-header">
      <div class="cert-brand">
        <div class="cert-hex">H</div>
        <div class="cert-brand-text">
          <div class="org">HCMG University</div>
          <div class="dept">Certificate of Completion</div>
        </div>
      </div>
      <div class="cert-type-badge">Official Certificate</div>
    </div>

    <p class="cert-presented">This certificate is proudly presented to</p>
    <div class="cert-learner">${escapeHtml(learnerName)}</div>

    <p class="cert-for">For successfully completing</p>
    <div class="cert-course">${escapeHtml(courseTitle)}</div>

    <div class="cert-details-row">
      <div class="cert-detail">
        <div class="cert-detail-label">Date Issued</div>
        <div class="cert-detail-value">${issuedDate}</div>
      </div>
      <div class="cert-detail">
        <div class="cert-detail-label">${expiresDate ? "Expires" : "Valid"}</div>
        <div class="cert-detail-value expires">${expiresDate ?? "No expiration"}</div>
      </div>
      <div class="cert-detail">
        <div class="cert-detail-label">Certificate ID</div>
        <div class="cert-detail-value">${verificationShort}</div>
      </div>
    </div>

    <div class="cert-footer">
      <div class="cert-sig-block">
        <div class="cert-sig-line"></div>
        <div class="cert-sig-name">HCMG University</div>
        <div class="cert-sig-title">Training &amp; Development</div>
      </div>

      <div class="cert-qr-block">
        <img src="${qrDataUri}" alt="Verification QR Code"/>
        <div class="cert-qr-label">Verify this certificate</div>
        <div class="cert-qr-code">${verificationShort}</div>
      </div>
    </div>
  </div>

  <div class="cert-bottom-stripe"></div>
</div>

<div class="print-hint" style="margin-top:8px;">
  <p>Verify at: <a href="${verifyUrl}" style="color:#3b82d4;">${verifyUrl}</a></p>
</div>

<script>
  // Auto-trigger print dialog when ?print=1 is appended
  if (new URLSearchParams(window.location.search).get('print') === '1') {
    window.addEventListener('load', () => setTimeout(() => window.print(), 400));
  }
</script>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache",
      // When ?download=1 is added, trigger a download
      ...(new URL(request.url).searchParams.get("download") === "1"
        ? { "Content-Disposition": `attachment; filename="HCMG-U-Certificate-${verificationShort}.html"` }
        : {}),
    },
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
