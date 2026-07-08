import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase";
import { logAudit, getProfileBySlug } from "@/lib/auth";
import { readSettings } from "@/lib/company-settings";

const RESEND_KEY = process.env.RESEND_API_KEY;
function getResend() {
  return RESEND_KEY ? new Resend(RESEND_KEY) : null;
}

const LeadSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1).optional(),
  email: z.string().email(),
  phone: z.string().min(7),
  smsConsent: z.boolean(),
  source:     z.string().optional().default("funnel"),
  seoSlug:    z.string().optional(),    // which seo page slug when source="seo"
  funnelType: z.string().optional(),    // funnel catalog slug (e.g. "va-purchase")
  goal: z.string().optional(),
  priceRange: z.string().optional(),
  creditRange: z.string().optional(),
  incomeRange: z.string().optional(),
  notes: z.string().optional(),
  // LO routing, present when the lead originated on a per-LO profile page
  loSlug: z.string().optional(),
  loName: z.string().optional(),
  loNmls: z.string().nullable().optional(),
  // UTM attribution
  utmSource:   z.string().optional(),
  utmMedium:   z.string().optional(),
  utmCampaign: z.string().optional(),
  utmContent:  z.string().optional(),
  utmTerm:     z.string().optional(),
  // Session intelligence
  sessionId:   z.string().optional(),
  entryPage:   z.string().optional(),
  referrer:    z.string().optional(),
  device:      z.string().optional(),
});

const confirmationHtml = (firstName: string, loName?: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#142850;padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:2px;">HCMG</p>
            <p style="margin:4px 0 0;font-size:12px;color:#F37021;letter-spacing:1px;">HARRIS CAPITAL MORTGAGE GROUP · NMLS# 1918223</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A2B42;">Hi ${firstName} 👋</p>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#5A6B7E;">
              Thanks for reaching out, we&apos;ve received your mortgage inquiry${
                loName ? ` and routed it directly to ${loName}` : " and a licensed loan officer"
              } will be in touch within one business day.
            </p>
            <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#5A6B7E;">
              In the meantime, you can use our free mortgage calculator to explore your payment options:
            </p>
            <a href="https://getorangekey.com/get-started" style="display:inline-block;background:#F37021;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;">
              Explore my options →
            </a>
            <hr style="margin:32px 0;border:none;border-top:1px solid #f0f0f0;" />
            <p style="margin:0;font-size:12px;line-height:1.7;color:#9AABB8;">
              This message was sent because you submitted a mortgage inquiry at getorangekey.com.
              Harris Capital Mortgage Group, LLC · NMLS# 1918223.
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

const loNotificationHtml = (lead: ReturnType<typeof LeadSchema.parse>, loName: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#142850;padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:2px;">HCMG</p>
            <p style="margin:4px 0 0;font-size:12px;color:#F37021;letter-spacing:1px;">NEW LEAD ASSIGNED TO YOU</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1A2B42;">Hi ${loName.split(" ")[0]} 👋</p>
            <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#5A6B7E;">
              You have a new lead from your funnel link. Here are their details:
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;width:140px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-weight:600;color:#1A2B42;">${lead.firstName} ${lead.lastName ?? ""}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#1A2B42;">${lead.email}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#1A2B42;">${lead.phone}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;">Goal</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#1A2B42;">${lead.goal ?? "—"}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;">Price Range</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#1A2B42;">${lead.priceRange ?? "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#9AABB8;">Credit Range</td><td style="padding:8px 0;color:#1A2B42;">${lead.creditRange ?? "—"}</td></tr>
            </table>
            <a href="https://hcmg-web.vercel.app/portal" style="display:inline-block;margin-top:28px;background:#F37021;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;">
              View in my portal →
            </a>
            <hr style="margin:32px 0;border:none;border-top:1px solid #f0f0f0;" />
            <p style="margin:0;font-size:12px;line-height:1.7;color:#9AABB8;">
              Harris Capital Mortgage Group, LLC · NMLS# 1918223. Reply STOP to opt out.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://getorangekey.com";

const companyLeadAlertHtml = (lead: ReturnType<typeof LeadSchema.parse>, fullName: string, source: string) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f9f9f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.06);">
        <tr>
          <td style="background:#142850;padding:32px 40px;">
            <p style="margin:0;font-size:22px;font-weight:800;color:#fff;letter-spacing:2px;">HCMG</p>
            <p style="margin:4px 0 0;font-size:12px;color:#F37021;letter-spacing:1px;">⚠ COMPANY LEAD — NEEDS ASSIGNMENT</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1A2B42;">New unassigned lead</p>
            <p style="margin:0 0 20px;font-size:13px;color:#9AABB8;">
              Came in via <strong style="color:#1A2B42;">${source}</strong> — no loan officer assigned. Log in to the admin portal to assign or action this lead.
            </p>
            <table style="width:100%;border-collapse:collapse;font-size:14px;">
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;width:140px;">Name</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;font-weight:600;color:#1A2B42;">${fullName || "—"}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;">Email</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#1A2B42;">${lead.email}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;">Phone</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#1A2B42;">${lead.phone}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;">Goal</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#1A2B42;">${lead.goal ?? "—"}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;">Price Range</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#1A2B42;">${lead.priceRange ?? "—"}</td></tr>
              <tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#9AABB8;">Credit Range</td><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;color:#1A2B42;">${lead.creditRange ?? "—"}</td></tr>
              <tr><td style="padding:8px 0;color:#9AABB8;">Funnel / Source</td><td style="padding:8px 0;font-weight:600;color:#1A2B42;">${source}</td></tr>
            </table>
            <a href="${SITE_URL}/admin/leads" style="display:inline-block;margin-top:28px;background:#142850;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;">
              View in admin portal →
            </a>
            <hr style="margin:32px 0;border:none;border-top:1px solid #f0f0f0;" />
            <p style="margin:0;font-size:12px;line-height:1.7;color:#9AABB8;">
              Harris Capital Mortgage Group, LLC · NMLS# 1918223.
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
  const lastName = lead.lastName ?? "";
  const fullName = `${lead.firstName}${lastName ? ` ${lastName}` : ""}`.trim();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? null;

  // ── 1. Persist to Supabase ────────────────────────────────
  const sb = createServiceClient();
  const { data: savedLead } = await sb.from("leads").insert({
    first_name:   lead.firstName,
    last_name:    lead.lastName ?? null,
    email:        lead.email,
    phone:        lead.phone,
    sms_consent:  lead.smsConsent,
    source:       lead.source ?? "funnel",
    goal:         lead.goal ?? null,
    price_range:  lead.priceRange ?? null,
    credit_range: lead.creditRange ?? null,
    income_range: lead.incomeRange ?? null,
    notes:        [
      lead.notes,
      lead.seoSlug   ? `SEO page: /seo/${lead.seoSlug}`      : null,
      lead.funnelType ? `Funnel: ${lead.funnelType}`          : null,
    ].filter(Boolean).join("\n") || null,
    lo_slug:      lead.loSlug ?? null,
    lo_name:      lead.loName ?? null,
    lo_nmls:      lead.loNmls ?? null,
    status:       "new",
    ip_address:   ip,
    utm_source:   lead.utmSource   ?? null,
    utm_medium:   lead.utmMedium   ?? null,
    utm_campaign: lead.utmCampaign ?? null,
    utm_content:  lead.utmContent  ?? null,
    utm_term:     lead.utmTerm     ?? null,
    session_id:   lead.sessionId   ?? null,
    entry_page:   lead.entryPage   ?? null,
    referrer:     lead.referrer    ?? null,
    device:       lead.device      ?? null,
  }).select("id").single();

  // Log to audit
  logAudit("lead.created", {
    lead_id:  savedLead?.id,
    email:    lead.email,
    lo_slug:  lead.loSlug,
    source:   lead.source,
  }, undefined, undefined, ip ?? undefined);

  // ── 2. Fire-and-forget: Porchy Flight Deck CRM ───────────
  const flightDeckUrl = process.env.FLIGHT_DECK_LEADS_URL;
  const flightDeckKey = process.env.FLIGHT_DECK_API_KEY;
  if (flightDeckUrl && flightDeckKey) {
    fetch(flightDeckUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${flightDeckKey}` },
      body: JSON.stringify({
        ...lead,
        source_app: "orange-key-web",
        assigned_lo_slug: lead.loSlug ?? null,
        assigned_lo_name: lead.loName ?? null,
        assigned_lo_nmls: lead.loNmls ?? null,
      }),
    }).catch(() => {});
  }

  // ── 3. Resolve LO notify email ────────────────────────────
  let loNotifyEmail: string | null = null;
  if (lead.loSlug) {
    const loProfile = await getProfileBySlug(lead.loSlug);
    loNotifyEmail = loProfile?.notify_email ?? loProfile?.email ?? null;
  }

  // ── 4. Send emails (skipped if RESEND_API_KEY not set) ───
  const resend = getResend();
  if (resend) {
    const emailJobs = [
      // Confirmation to the lead submitter always fires
      resend.emails.send({
        from: "HCMG <noreply@hcmgloans.com>",
        to: lead.email,
        subject: lead.loName ? `Your HCMG estimate, routed to ${lead.loName}` : "Your HCMG estimate is ready",
        html: confirmationHtml(lead.firstName, lead.loName),
      }),
    ];

    if (lead.loSlug && loNotifyEmail && lead.loName) {
      // LO lead — notify the assigned LO directly
      emailJobs.push(
        resend.emails.send({
          from: "HCMG Leads <noreply@hcmgloans.com>",
          to: loNotifyEmail,
          subject: `New lead: ${fullName || lead.email}`,
          html: loNotificationHtml(lead, lead.loName),
        })
      );
    } else if (!lead.loSlug) {
      // Unassigned lead — pick alert email by source type
      const settings = await readSettings();
      const source = lead.source ?? "website";
      const isEmployment = source === "employment";
      const isContact    = source === "contact";

      const alertEmail = isEmployment ? settings.recruiting_notify_email
        : isContact    ? settings.contact_notify_email
        : settings.company_notify_email;   // get-started, team, seo, etc.

      if (alertEmail) {
        const sourceDisplay = isEmployment ? "Recruiting"
          : isContact ? "Contact form"
          : (lead as { seoSlug?: string }).seoSlug
            ? `SEO — ${(lead as { seoSlug?: string }).seoSlug}`
            : source;
        emailJobs.push(
          resend.emails.send({
            from: "HCMG Leads <noreply@hcmgloans.com>",
            to: alertEmail,
            subject: isEmployment
              ? `Recruiting inquiry — ${fullName || lead.email}`
              : isContact
              ? `Contact form inquiry — ${fullName || lead.email}`
              : `Company lead — ${fullName || lead.email} via ${sourceDisplay}`,
            html: companyLeadAlertHtml(lead, fullName, sourceDisplay),
          })
        );
      }
    }

    await Promise.all(emailJobs).catch(() => {}); // don't fail the lead save if email fails
  }

  return NextResponse.json({ ok: true });
}
