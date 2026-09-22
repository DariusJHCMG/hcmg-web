import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import QRCode from "qrcode";

interface Params { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return new NextResponse("Unauthorized", { status: 401 });

  const sb = createServiceClient();

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

  if (!cert) return new NextResponse("Certificate not found", { status: 404 });

  const isAdmin = profile.university_role === "university_admin"
    || profile.role === "admin"
    || profile.role === "developer";

  if (!isAdmin && cert.profile_id !== profile.id) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const courseInfo  = cert.uni_courses as unknown as { title: string } | null;
  const profileInfo = cert.profiles    as unknown as { full_name: string } | null;
  const courseTitle = courseInfo?.title    ?? "HCMG U Course";
  const learnerName = profileInfo?.full_name ?? "Team Member";

  const BASE_URL   = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portal.hcmgloans.com";
  const verifyUrl  = `${BASE_URL}/university/verify/${cert.verification_id}`;

  const qrDataUri = await QRCode.toDataURL(verifyUrl, {
    width:  140,
    margin: 1,
    color:  { dark: "#06182a", light: "#ffffff" },
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
<title>Certificate — ${e(learnerName)} — ${e(courseTitle)}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;600;700;800;900&family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: 100%; background: #e8ecf0; font-family: 'DM Sans', -apple-system, system-ui, sans-serif; }

  @media screen {
    body { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 40px 20px; gap: 24px; }
    .ui-bar { display: flex; align-items: center; gap: 12px; }
    .ui-hint { font-size: 13px; color: #57606a; font-family: -apple-system, system-ui, sans-serif; }
    .print-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 11px 24px; border-radius: 9px;
      background: linear-gradient(135deg,#FF9847,#F37021);
      color: #fff; font-family: -apple-system, system-ui, sans-serif;
      font-size: 14px; font-weight: 700; border: none; cursor: pointer; text-decoration: none;
    }
  }
  @media print {
    html, body { background: #fff; }
    .ui-bar, .ui-hint { display: none !important; }
    @page { size: landscape; margin: 0; }
    .cert { box-shadow: none !important; border-radius: 0 !important; page-break-inside: avoid; width: 100vw !important; height: 100vh !important; }
  }

  /* ── Certificate shell ───────────────────────────── */
  .cert {
    width: 960px;
    background: #ffffff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 80px rgba(6,24,42,.22);
    position: relative;
  }

  /* Top accent bar */
  .cert-accent-top {
    height: 8px;
    background: linear-gradient(90deg, #f58220 0%, #d4a017 50%, #f58220 100%);
  }

  /* Dark header band */
  .cert-header-band {
    background: linear-gradient(135deg, #06182a 0%, #0d2d50 60%, #06182a 100%);
    padding: 36px 56px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  /* Decorative circles in header */
  .cert-header-band::before {
    content: '';
    position: absolute;
    right: -60px; top: -80px;
    width: 280px; height: 280px;
    border-radius: 50%;
    border: 2px solid rgba(245,130,32,0.12);
  }
  .cert-header-band::after {
    content: '';
    position: absolute;
    right: 20px; top: -40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    border: 2px solid rgba(245,130,32,0.08);
  }

  .cert-logo-area { display: flex; align-items: center; gap: 16px; position: relative; z-index: 1; }
  .cert-logo-icon {
    width: 52px; height: 52px; border-radius: 12px;
    background: linear-gradient(135deg,#FF9847,#F37021);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px; font-weight: 900; color: #fff;
    font-family: 'Manrope', system-ui; flex-shrink: 0;
  }
  .cert-logo-text .org-name {
    font-size: 20px; font-weight: 900; color: #fff;
    font-family: 'Manrope', system-ui; letter-spacing: -0.3px; line-height: 1;
  }
  .cert-logo-text .org-sub {
    font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.45);
    letter-spacing: 1.8px; text-transform: uppercase; margin-top: 4px;
  }

  .cert-official-badge {
    position: relative; z-index: 1;
    text-align: right;
  }
  .cert-official-badge .badge-label {
    font-size: 9px; font-weight: 800; letter-spacing: 2.5px;
    text-transform: uppercase; color: #f58220;
    border: 1.5px solid rgba(245,130,32,0.4);
    padding: 5px 14px; border-radius: 20px;
    background: rgba(245,130,32,0.08);
    display: inline-block; margin-bottom: 6px;
  }
  .cert-official-badge .badge-sub {
    font-size: 10px; color: rgba(255,255,255,0.35); display: block;
  }

  /* Main body */
  .cert-body {
    padding: 44px 56px 36px;
    position: relative;
  }

  /* Subtle watermark H */
  .cert-watermark {
    position: absolute;
    right: 48px; top: 30px;
    font-size: 180px; font-weight: 900; line-height: 1;
    color: #06182a; opacity: 0.025;
    font-family: 'Manrope', system-ui;
    user-select: none; pointer-events: none;
  }

  /* Content layout */
  .cert-content { display: flex; gap: 40px; align-items: flex-start; }
  .cert-main { flex: 1; min-width: 0; }
  .cert-side { width: 160px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }

  .cert-presented-to {
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: #687383; margin-bottom: 10px;
  }

  .cert-name {
    font-size: 48px; font-weight: 800; color: #06182a;
    font-family: 'Manrope', system-ui; letter-spacing: -2px;
    line-height: 1.05; margin-bottom: 0;
  }

  .cert-divider {
    width: 64px; height: 3px; margin: 16px 0;
    background: linear-gradient(90deg,#f58220,#d4a017);
    border-radius: 2px;
  }

  .cert-completing {
    font-size: 11px; font-weight: 700; letter-spacing: 2px;
    text-transform: uppercase; color: #687383; margin-bottom: 8px;
  }

  .cert-course {
    font-size: 24px; font-weight: 800; color: #06182a;
    font-family: 'Manrope', system-ui; letter-spacing: -0.5px;
    line-height: 1.25; margin-bottom: 28px;
  }

  /* Detail boxes */
  .cert-details {
    display: flex; gap: 0;
    border: 1px solid #e5e7eb;
    border-radius: 10px; overflow: hidden;
  }
  .cert-detail {
    flex: 1; padding: 12px 16px;
    border-right: 1px solid #e5e7eb;
  }
  .cert-detail:last-child { border-right: none; }
  .cert-detail-label {
    font-size: 9px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 1.2px; color: #9ca3af; margin-bottom: 4px;
  }
  .cert-detail-value {
    font-size: 13px; font-weight: 700; color: #06182a;
  }
  .cert-detail-value.green { color: #16a34a; }
  .cert-detail-value.red   { color: #b23b3b; }

  /* QR side */
  .cert-qr-img { width: 100px; height: 100px; display: block; }
  .cert-qr-label {
    font-size: 8px; font-weight: 700; letter-spacing: 1px;
    text-transform: uppercase; color: #9ca3af; text-align: center;
  }
  .cert-qr-id {
    font-size: 11px; font-family: monospace; font-weight: 700;
    color: #06182a; text-align: center;
  }

  /* Footer */
  .cert-footer {
    padding: 20px 56px 28px;
    display: flex; align-items: center; justify-content: space-between;
    border-top: 1px solid #f0f2f5;
  }
  .cert-sig { }
  .cert-sig-line { width: 180px; height: 1px; background: #06182a; margin-bottom: 6px; }
  .cert-sig-name { font-size: 13px; font-weight: 800; color: #06182a; }
  .cert-sig-title { font-size: 10px; color: #9ca3af; font-weight: 500; margin-top: 2px; }

  .cert-verify-info { text-align: right; }
  .cert-verify-label { font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; color: #9ca3af; margin-bottom: 3px; }
  .cert-verify-url { font-size: 10px; color: #687383; word-break: break-all; }

  /* Bottom accent bar */
  .cert-accent-bottom {
    height: 6px;
    background: linear-gradient(90deg, #06182a 0%, #0d2d50 50%, #06182a 100%);
  }
</style>
</head>
<body>

<div class="ui-bar">
  <span class="ui-hint"><strong>${e(learnerName)}</strong> · Certificate of Completion · <strong>${e(courseTitle)}</strong></span>
  <button class="print-btn" onclick="window.print()">⬇ Save as PDF</button>
</div>

<div class="cert">
  <div class="cert-accent-top"></div>

  <!-- Header band -->
  <div class="cert-header-band">
    <div class="cert-logo-area">
      <div class="cert-logo-icon">H</div>
      <div class="cert-logo-text">
        <div class="org-name">HCMG University</div>
        <div class="org-sub">Harris Capital Mortgage Group</div>
      </div>
    </div>
    <div class="cert-official-badge">
      <span class="badge-label">Official Certificate</span>
      <span class="badge-sub">Certificate of Completion</span>
    </div>
  </div>

  <!-- Body -->
  <div class="cert-body">
    <div class="cert-watermark">H</div>

    <div class="cert-content">
      <div class="cert-main">
        <p class="cert-presented-to">This certificate is proudly presented to</p>
        <h1 class="cert-name">${e(learnerName)}</h1>
        <div class="cert-divider"></div>
        <p class="cert-completing">For successfully completing</p>
        <h2 class="cert-course">${e(courseTitle)}</h2>

        <div class="cert-details">
          <div class="cert-detail">
            <div class="cert-detail-label">Date Issued</div>
            <div class="cert-detail-value">${issuedDate}</div>
          </div>
          <div class="cert-detail">
            <div class="cert-detail-label">${expiresDate ? "Expires" : "Valid"}</div>
            <div class="cert-detail-value ${expiresDate ? "red" : "green"}">${expiresDate ?? "No expiration"}</div>
          </div>
          <div class="cert-detail">
            <div class="cert-detail-label">Certificate ID</div>
            <div class="cert-detail-value">${verificationShort}</div>
          </div>
        </div>
      </div>

      <div class="cert-side">
        <img class="cert-qr-img" src="${qrDataUri}" alt="Verify QR"/>
        <div class="cert-qr-label">Verify Certificate</div>
        <div class="cert-qr-id">${verificationShort}</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="cert-footer">
    <div class="cert-sig">
      <div class="cert-sig-line"></div>
      <div class="cert-sig-name">HCMG University</div>
      <div class="cert-sig-title">Training &amp; Development · Harris Capital Mortgage Group</div>
    </div>
    <div class="cert-verify-info">
      <div class="cert-verify-label">Verify at</div>
      <div class="cert-verify-url">${verifyUrl}</div>
    </div>
  </div>

  <div class="cert-accent-bottom"></div>
</div>

<div class="ui-hint" style="font-size:11px;">
  Scan the QR code or visit <a href="${verifyUrl}" style="color:#3b82d4;">${verifyUrl}</a> to verify this certificate.
</div>

<script>
  if (new URLSearchParams(window.location.search).get('print') === '1') {
    window.addEventListener('load', () => setTimeout(() => window.print(), 400));
  }
</script>
</body></html>`;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache",
    },
  });
}

function e(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
