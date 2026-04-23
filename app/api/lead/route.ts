import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const LeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7),
  smsConsent: z.boolean(),
  source: z.string().optional().default("funnel"),
  goal: z.string().optional(),
  priceRange: z.string().optional(),
  creditRange: z.string().optional(),
  incomeRange: z.string().optional(),
  notes: z.string().optional(),
});

const confirmationHtml = (firstName: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:linear-gradient(135deg,#FFAF00,#FF7800,#E84F00);padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.5px;">Orange Key</p>
            <p style="margin:4px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Harris Capital Mortgage Group · NMLS# 1918223</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A2B42;">Hi ${firstName} 👋</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#5A6B7E;">
              Thanks for reaching out — we&apos;ve received your mortgage inquiry and a licensed loan officer will be in touch within one business day.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#5A6B7E;">
              In the meantime, you can use our free mortgage calculator to explore your payment options:
            </p>
            <a href="https://getorangekey.com/get-started" style="display:inline-block;background:linear-gradient(135deg,#FF7800,#E84F00);color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;">
              Explore my options →
            </a>
            <hr style="margin:32px 0;border:none;border-top:1px solid #f0f0f0;" />
            <p style="margin:0;font-size:12px;line-height:1.7;color:#9AABB8;">
              This message was sent because you submitted a mortgage inquiry at getorangekey.com.
              Harris Capital Mortgage Group, LLC · NMLS# 1918223 · 455 E Eisenhower Pkwy, Suite 300, Ann Arbor, MI 48108.
              Equal Housing Lender.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const lead = parsed.data;

  // Fire-and-forget: send to Porchy Flight Deck CRM
  const flightDeckUrl = process.env.FLIGHT_DECK_LEADS_URL;
  const flightDeckKey = process.env.FLIGHT_DECK_API_KEY;
  if (flightDeckUrl && flightDeckKey) {
    fetch(flightDeckUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${flightDeckKey}`,
      },
      body: JSON.stringify({ ...lead, source_app: "orange-key-web" }),
    }).catch(() => {});
  }

  // Send confirmation + internal notification in parallel
  await Promise.all([
    resend.emails.send({
      from: "Orange Key <noreply@getorangekey.com>",
      to: lead.email,
      subject: "Your Orange Key estimate is ready",
      html: confirmationHtml(lead.firstName),
    }),
    resend.emails.send({
      from: "Orange Key Leads <noreply@getorangekey.com>",
      to: "leads@getorangekey.com",
      subject: `New lead: ${lead.firstName} ${lead.lastName}`,
      html: `<pre style="font-family:monospace;font-size:13px;">${JSON.stringify(lead, null, 2)}</pre>`,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
