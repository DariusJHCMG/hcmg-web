import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = "HCMG University <hcmgu@hcmgloans.com>";

function getResend(): Resend | null {
  return RESEND_KEY ? new Resend(RESEND_KEY) : null;
}

interface SendUniEmailOptions {
  to: string;
  subject: string;
  html: string;
  /** If provided, tracks delivery in uni_notifications */
  notificationId?: string;
}

/**
 * Send a university email via Resend.
 * Gracefully no-ops in environments without RESEND_API_KEY.
 * Records email_sent_at on the notification row when notificationId is provided.
 */
export async function sendUniEmail(opts: SendUniEmailOptions): Promise<{ id?: string; error?: string }> {
  const resend = getResend();
  if (!resend) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[sendUniEmail] RESEND_API_KEY not set — skipping email to", opts.to);
    }
    return { error: "email_disabled" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from:    FROM,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
    });

    if (error) return { error: error.message };

    // Update the notification row with delivery timestamp + message id
    if (opts.notificationId && data?.id) {
      const sb = createServiceClient();
      await sb
        .from("uni_notifications")
        .update({
          email_sent_at:    new Date().toISOString(),
          email_message_id: data.id,
        })
        .eq("id", opts.notificationId);
    }

    return { id: data?.id };
  } catch (err) {
    return { error: String(err) };
  }
}

/**
 * Render a standard HCMG U email wrapper around a body HTML string.
 * Keeps all emails visually consistent.
 */
export function uniEmailTemplate(opts: {
  title: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const cta = opts.ctaLabel && opts.ctaUrl
    ? `<p style="margin:24px 0 0;text-align:center;">
        <a href="${opts.ctaUrl}"
           style="display:inline-block;padding:12px 28px;border-radius:8px;
                  background:linear-gradient(135deg,#FF9847,#F37021);
                  color:#fff;font-weight:700;font-size:14px;text-decoration:none;">
          ${opts.ctaLabel}
        </a>
       </p>`
    : "";

  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portal.hcmgloans.com";

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:580px;background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">

        <!-- Header -->
        <tr><td style="background:#06182a;padding:22px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0"><tr>
            <td>
              <span style="font-size:22px;font-weight:900;color:#f58220;letter-spacing:-0.5px;font-family:system-ui,sans-serif;">HCMG</span>
              <span style="font-size:22px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;font-family:system-ui,sans-serif;"> University</span>
            </td>
            <td align="right">
              <span style="font-size:11px;font-weight:600;color:#687383;letter-spacing:1px;text-transform:uppercase;">Internal Training</span>
            </td>
          </tr></table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 32px 24px;">
          <h1 style="margin:0 0 16px;font-size:21px;font-weight:800;color:#071a2e;line-height:1.25;">${opts.title}</h1>
          ${opts.bodyHtml}
          ${cta}
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:0 32px;"><div style="border-top:1px solid #e5e7eb;"></div></td></tr>

        <!-- Signature -->
        <tr><td style="padding:20px 32px 12px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="padding-right:14px;vertical-align:middle;">
              <div style="width:36px;height:36px;border-radius:8px;background:#06182a;display:flex;align-items:center;justify-content:center;text-align:center;line-height:36px;">
                <span style="font-size:15px;font-weight:900;color:#f58220;">H</span>
              </div>
            </td>
            <td style="vertical-align:middle;">
              <div style="font-size:13px;font-weight:700;color:#071a2e;line-height:1.3;">HCMG University</div>
              <div style="font-size:11px;color:#687383;margin-top:1px;">Harris Capital Mortgage Group · Internal Training Platform</div>
              <div style="font-size:11px;color:#687383;margin-top:1px;">
                <a href="${BASE_URL}/university" style="color:#f58220;text-decoration:none;">portal.hcmgloans.com/university</a>
              </div>
            </td>
          </tr></table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:12px 32px 20px;background:#f7f8fa;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;font-size:10px;color:#9ca3af;line-height:1.6;">
            This email was sent from <strong>hcmgu@hcmgloans.com</strong> · Do not reply directly to this email.<br/>
            You are receiving this because you are an active HCMG team member with HCMG U access.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body></html>`;
}
