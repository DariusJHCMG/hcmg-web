import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, device } = await request.json() as { email: string; device: "ios" | "android" | "other" };
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const installUrl = "https://hcmgloans.com/portal";

    const iosSteps = `
      <ol style="margin:0;padding-left:20px;line-height:1.8;color:#4b5563;font-size:15px;">
        <li>Open the link below in <strong>Safari</strong> on your iPhone or iPad</li>
        <li>Tap the <strong>Share</strong> button (the box with an arrow pointing up)</li>
        <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
        <li>Tap <strong>Add</strong> — the HCMG icon will appear on your home screen</li>
      </ol>`;

    const androidSteps = `
      <ol style="margin:0;padding-left:20px;line-height:1.8;color:#4b5563;font-size:15px;">
        <li>Open the link below in <strong>Chrome</strong> on your Android device</li>
        <li>Tap the <strong>three-dot menu</strong> (⋮) in the top right</li>
        <li>Tap <strong>"Add to Home screen"</strong> or <strong>"Install app"</strong></li>
        <li>Tap <strong>Add</strong> — the HCMG icon will appear on your home screen</li>
      </ol>`;

    const genericSteps = `
      <p style="color:#4b5563;font-size:15px;">Open the link below on your phone, then follow your browser's prompt to install or add to home screen.</p>`;

    const steps = device === "ios" ? iosSteps : device === "android" ? androidSteps : genericSteps;
    const deviceLabel = device === "ios" ? "iPhone / iPad" : device === "android" ? "Android" : "your device";

    const { error } = await resend.emails.send({
      from: "HCMG <no-reply@hcmgloans.com>",
      to: email,
      subject: "Install the HCMG Portal App",
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr><td style="background:#142850;padding:32px 32px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td>
                <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#F37021;">Harris Capital Mortgage Group</p>
                <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.2;">Install the Portal App</h1>
                <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">Fast access on ${deviceLabel} — no App Store needed.</p>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 20px;font-size:15px;color:#1f2328;line-height:1.6;">
            Here are your install instructions for <strong>${deviceLabel}</strong>:
          </p>
          ${steps}

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:28px;">
            <tr><td align="center">
              <a href="${installUrl}"
                style="display:inline-block;background:#142850;color:#ffffff;font-size:15px;font-weight:700;
                       text-decoration:none;padding:14px 36px;border-radius:12px;letter-spacing:0.02em;">
                Open Portal on My Phone →
              </a>
            </td></tr>
          </table>

          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;text-align:center;">
            If you didn't request this, you can safely ignore this email.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="border-top:1px solid #e5e7eb;padding:16px 32px;background:#f9fafb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
            Harris Capital Mortgage Group, LLC · NMLS# 1918223<br>
            6375 S Pecos Rd, Suite 208, Las Vegas, NV 89120
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
