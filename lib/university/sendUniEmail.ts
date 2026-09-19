import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase";

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = "HCMG University <university@hcmgloans.com>";

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

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f0f2f5;font-family:-apple-system,'Segoe UI',system-ui,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:560px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
        <tr><td style="background:#06182a;padding:24px 32px;">
          <span style="font-size:20px;font-weight:900;color:#f58220;letter-spacing:-0.3px;">HCMG</span>
          <span style="font-size:20px;font-weight:900;color:#fff;letter-spacing:-0.3px;"> University</span>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <h1 style="margin:0 0 16px;font-size:20px;font-weight:800;color:#071a2e;">${opts.title}</h1>
          ${opts.bodyHtml}
          ${cta}
        </td></tr>
        <tr><td style="padding:16px 32px;background:#f7f8fa;border-top:1px solid #e5e7eb;text-align:center;">
          <p style="margin:0;font-size:11px;color:#57606a;">
            HCMG University · Internal training platform · Do not reply to this email
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
