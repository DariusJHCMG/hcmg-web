import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * POST /api/privacy/dsr
 *
 * Receives a Data Subject Request from the /privacy/data-request form.
 * Sends a confirmation to the requester and an intake email to the
 * privacy team (privacy@hcmgloans.com) for manual review.
 *
 * LEGAL BASIS:
 *   CCPA § 1798.100: businesses must respond within 45 days (extendable
 *   to 90 days once with notice). We commit to 30 days in our privacy policy.
 *   VCDPA § 59.1-577: 45-day response requirement.
 *   GLBA Regulation P: financial institutions must have a process to handle
 *   consumer requests to limit sharing.
 *
 * All requests are logged to a human reviewer — we do NOT auto-process
 * deletions. Mortgage records subject to legal retention cannot be deleted
 * regardless of request type.
 */

const resend = new Resend(process.env.RESEND_API_KEY);
const PRIVACY_TEAM_EMAIL = "privacy@hcmgloans.com";
const FROM               = "HCMG Privacy <noreply@hcmgloans.com>";

// ── Rate limit: 3 DSR submissions per email per day ──────────────────────────
// Prevents abuse. We use a simple in-memory guard for this low-volume endpoint.
// (DSR submissions are rare — a distributed Redis rate limiter is overkill here)
const dsrAttempts = new Map<string, { count: number; resetAt: number }>();
function isDsrRateLimited(email: string): boolean {
  const now    = Date.now();
  const dayMs  = 24 * 60 * 60 * 1000;
  const record = dsrAttempts.get(email);
  if (!record || now > record.resetAt) {
    dsrAttempts.set(email, { count: 1, resetAt: now + dayMs });
    return false;
  }
  record.count++;
  return record.count > 3;
}

const REQUEST_LABELS = {
  access:  "Right to Know (Access)",
  correct: "Right to Correct",
  delete:  "Right to Delete",
} as const;

type RequestType = keyof typeof REQUEST_LABELS;

export async function POST(req: NextRequest) {
  let body: {
    requestType?: string;
    firstName?:   string;
    lastName?:    string;
    email?:       string;
    phone?:       string | null;
    details?:     string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { requestType, firstName, lastName, email, phone, details } = body;

  // ── Validation ───────────────────────────────────────────────────────────────
  if (!["access", "correct", "delete"].includes(requestType ?? "")) {
    return NextResponse.json({ error: "Invalid request type" }, { status: 400 });
  }
  if (!firstName?.trim() || !lastName?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (!email?.trim() || !email.includes("@")) {
    return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
  }
  if (!details?.trim() || details.trim().length < 10) {
    return NextResponse.json({ error: "Please describe your request in more detail" }, { status: 400 });
  }

  // ── Rate limiting ────────────────────────────────────────────────────────────
  if (isDsrRateLimited(email.toLowerCase())) {
    return NextResponse.json(
      { error: "Too many requests. Please email privacy@hcmgloans.com directly." },
      { status: 429 },
    );
  }

  const type      = requestType as RequestType;
  const typeLabel = REQUEST_LABELS[type];
  const fullName  = `${firstName.trim()} ${lastName.trim()}`;
  const refId     = `DSR-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const submittedAt = new Date().toLocaleString("en-US", {
    timeZone: "America/New_York",
    month: "long", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }) + " ET";

  // ── Email to privacy team ────────────────────────────────────────────────────
  const teamHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ddd;">
    <div style="background:#142850;padding:24px 32px;">
      <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,0.6);text-transform:uppercase;">HCMG Privacy Team</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:900;color:#fff;">New Data Subject Request</h1>
    </div>
    <div style="padding:28px 32px;">
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px 0;font-weight:700;color:#444;width:140px;">Reference ID</td>
          <td style="padding:10px 0;font-family:monospace;color:#142850;">${refId}</td>
        </tr>
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px 0;font-weight:700;color:#444;">Request Type</td>
          <td style="padding:10px 0;color:#1a1a1a;font-weight:600;">${typeLabel}</td>
        </tr>
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px 0;font-weight:700;color:#444;">Requester Name</td>
          <td style="padding:10px 0;color:#1a1a1a;">${fullName}</td>
        </tr>
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px 0;font-weight:700;color:#444;">Email</td>
          <td style="padding:10px 0;color:#1a1a1a;"><a href="mailto:${email}" style="color:#3b82d4;">${email}</a></td>
        </tr>
        ${phone ? `
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px 0;font-weight:700;color:#444;">Phone</td>
          <td style="padding:10px 0;color:#1a1a1a;">${phone}</td>
        </tr>` : ""}
        <tr style="border-bottom:1px solid #eee;">
          <td style="padding:10px 0;font-weight:700;color:#444;">Submitted At</td>
          <td style="padding:10px 0;color:#1a1a1a;">${submittedAt}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-weight:700;color:#444;vertical-align:top;">Details</td>
          <td style="padding:10px 0;color:#1a1a1a;white-space:pre-wrap;">${details.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
        </tr>
      </table>

      <div style="margin-top:24px;padding:16px 20px;background:#fffbeb;border:1px solid #fcd34d;border-radius:10px;">
        <p style="margin:0;font-size:12px;font-weight:700;color:#92400e;">⚖️ Response deadline</p>
        <p style="margin:6px 0 0;font-size:12px;color:#78350f;">
          CCPA: 30 days (extendable to 45 with notice) · VCDPA: 45 days<br/>
          Send a confirmation email to <strong>${email}</strong> within 24 hours of reviewing this request.<br/>
          If this is a deletion request, note that mortgage loan records cannot be deleted before their legal retention period.
        </p>
      </div>
    </div>
  </div>
</body></html>`;

  // ── Confirmation email to requester ─────────────────────────────────────────
  const requesterHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:20px;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #ddd;">
    <div style="background:#142850;padding:24px 32px;">
      <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:rgba(255,255,255,0.6);text-transform:uppercase;">Harris Capital Mortgage Group</p>
      <h1 style="margin:8px 0 0;font-size:22px;font-weight:900;color:#fff;">Privacy Request Received</h1>
    </div>
    <div style="padding:28px 32px;">
      <p style="font-size:14px;color:#444;line-height:1.7;">Dear ${firstName.trim()},</p>
      <p style="font-size:14px;color:#444;line-height:1.7;">
        We have received your <strong>${typeLabel}</strong> request.
        We will review it and respond to you at this email address within <strong>30 days</strong>.
      </p>
      <div style="margin:20px 0;padding:16px 20px;background:#f0f9ff;border:1px solid #bae6fd;border-radius:10px;font-size:13px;color:#0c4a6e;">
        <p style="margin:0;font-weight:700;">Reference: ${refId}</p>
        <p style="margin:4px 0 0;">Keep this reference number for your records.</p>
      </div>
      ${type === "delete" ? `
      <div style="margin:16px 0;padding:16px 20px;background:#fff7ed;border:1px solid #fed7aa;border-radius:10px;font-size:12px;color:#9a3412;line-height:1.7;">
        <p style="margin:0;font-weight:700;">Important note about deletion requests:</p>
        <p style="margin:6px 0 0;">
          Mortgage loan records are subject to federal retention requirements under the
          Gramm-Leach-Bliley Act, HUD Handbook 4000.1, and VA Lender Handbook. FHA/VA loan
          records must be retained for 2 years post-close; conventional records for 7 years.
          These records cannot be deleted before their retention period expires. All other
          personal information (non-loan data) will be deleted upon your request.
        </p>
      </div>` : ""}
      <p style="font-size:13px;color:#777;line-height:1.7;">
        Questions? Contact us at{" "}
        <a href="mailto:privacy@hcmgloans.com" style="color:#3b82d4;">privacy@hcmgloans.com</a>
        and reference your request ID.
      </p>
      <p style="font-size:12px;color:#aaa;margin-top:24px;">
        Harris Capital Mortgage Group, LLC · NMLS# 1918223<br/>
        6375 S Pecos Rd, Suite 208, Las Vegas, NV 89120
      </p>
    </div>
  </div>
</body></html>`;

  // ── Send both emails ─────────────────────────────────────────────────────────
  const [teamResult, requesterResult] = await Promise.allSettled([
    resend.emails.send({
      from:    FROM,
      to:      PRIVACY_TEAM_EMAIL,
      subject: `[DSR] ${typeLabel} — ${fullName} (${refId})`,
      html:    teamHtml,
    }),
    resend.emails.send({
      from:    FROM,
      to:      email,
      subject: `Privacy request received — Reference ${refId}`,
      html:    requesterHtml,
    }),
  ]);

  // Log failures but don't expose internals to client
  if (teamResult.status === "rejected") {
    console.error("[privacy/dsr] team email failed", teamResult.reason);
  }
  if (requesterResult.status === "rejected") {
    console.error("[privacy/dsr] requester confirmation failed", requesterResult.reason);
  }

  // If team email completely failed, still confirm to user (we can retry manually)
  return NextResponse.json({
    ok:     true,
    ref_id: refId,
  });
}
