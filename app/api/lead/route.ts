import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { createServiceClient } from "@/lib/supabase";
import { logAudit, getProfileBySlug } from "@/lib/auth";
import { readSettings } from "@/lib/company-settings";
import {
  buildLeadConfirmationEmail,
  buildLoNotificationEmail,
  buildCompanyAlertEmail,
} from "@/lib/email-templates";

const RESEND_KEY = process.env.RESEND_API_KEY;
function getResend() {
  return RESEND_KEY ? new Resend(RESEND_KEY) : null;
}

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

const LeadSchema = z.object({
  firstName:               z.string().min(1),
  lastName:                z.string().min(1).optional(),
  email:                   z.string().email(),
  phone:                   z.string().min(7),
  smsConsent:              z.boolean(),
  smsConsentText:          z.string().optional(),
  smsConsentTimestamp:     z.string().optional(),
  source:                  z.string().optional().default("funnel"),
  seoSlug:                 z.string().optional(),
  funnelType:              z.string().optional(),
  goal:                    z.string().optional(),
  priceRange:              z.string().optional(),
  creditRange:             z.string().optional(),
  incomeRange:             z.string().optional(),
  estimatedBuyingPowerLow:  z.number().optional(),
  estimatedBuyingPowerHigh: z.number().optional(),
  estimatedMonthlyPayment:  z.number().optional(),
  recommendedLoanType:      z.string().optional(),
  notes:                   z.string().optional(),
  loSlug:                  z.string().optional(),
  loName:                  z.string().optional(),
  loNmls:                  z.string().nullable().optional(),
  utmSource:               z.string().optional(),
  utmMedium:               z.string().optional(),
  utmCampaign:             z.string().optional(),
  utmContent:              z.string().optional(),
  utmTerm:                 z.string().optional(),
  sessionId:               z.string().optional(),
  entryPage:               z.string().optional(),
  referrer:                z.string().optional(),
  device:                  z.string().optional(),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(n?: number | null) {
  if (!n) return null;
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function goalLabel(g?: string | null) {
  if (!g) return null;
  return g === "buy" ? "Purchase a home" : g === "refinance" ? "Refinance" : g === "compare" ? "Compare options" : g;
}

function creditLabel(c?: string | null) {
  if (!c) return null;
  const map: Record<string, string> = {
    "760-plus": "760+ (Excellent)",
    "700-759":  "700–759 (Good)",
    "640-699":  "640–699 (Fair)",
    "below-640":"Below 640 (Building)",
  };
  return map[c] ?? c;
}

function deviceLabel(d?: string | null) {
  if (!d) return null;
  return d.charAt(0).toUpperCase() + d.slice(1);
}

// ── Shared email styles ───────────────────────────────────────────────────────

const BASE = `
  font-family:'Helvetica Neue',Arial,sans-serif;
  margin:0;padding:0;background:#f4f5f7;
`;

const WRAP = `
  max-width:580px;margin:0 auto;background:#fff;
  border-radius:16px;overflow:hidden;
  box-shadow:0 2px 20px rgba(0,0,0,0.07);
`;

const HEADER = (sub: string) => `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#1A2B42 0%,#142850 100%);">
    <tr>
      <td style="padding:32px 40px 28px;">
        <div style="display:inline-block;background:rgba(243,112,33,0.15);border:1px solid rgba(243,112,33,0.4);border-radius:8px;padding:3px 10px;margin-bottom:10px;">
          <span style="font-size:10px;font-weight:700;letter-spacing:2px;color:#F37021;text-transform:uppercase;">${sub}</span>
        </div>
        <p style="margin:0;font-size:26px;font-weight:900;color:#fff;letter-spacing:-0.5px;">HCMG</p>
        <p style="margin:3px 0 0;font-size:11px;color:#94a3b8;letter-spacing:1.5px;">HARRIS CAPITAL MORTGAGE GROUP · NMLS# 1918223</p>
      </td>
    </tr>
  </table>
`;

const FOOTER = `
  <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;">
    <tr>
      <td style="padding:24px 40px;">
        <p style="margin:0;font-size:11px;line-height:1.8;color:#9AABB8;">
          Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender.<br/>
          This message was sent because you submitted an inquiry at hcmgloans.com.
          To unsubscribe from marketing emails, reply with "UNSUBSCRIBE".
        </p>
      </td>
    </tr>
  </table>
`;

// ── Estimate card block ───────────────────────────────────────────────────────

function estimateBlock(lead: z.infer<typeof LeadSchema>): string {
  const hasEstimate = lead.estimatedMonthlyPayment || lead.estimatedBuyingPowerHigh || lead.recommendedLoanType;
  if (!hasEstimate) return "";

  const rows: { label: string; value: string }[] = [];
  if (lead.estimatedBuyingPowerLow && lead.estimatedBuyingPowerHigh) {
    rows.push({ label: "Estimated buying power", value: `${fmt(lead.estimatedBuyingPowerLow)} – ${fmt(lead.estimatedBuyingPowerHigh)}` });
  }
  if (lead.estimatedMonthlyPayment) {
    rows.push({ label: "Estimated monthly payment", value: `${fmt(lead.estimatedMonthlyPayment)}/mo` });
  }
  if (lead.recommendedLoanType) {
    rows.push({ label: "Recommended loan path", value: lead.recommendedLoanType });
  }

  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;background:#fff8f2;border:1px solid #ffe0c4;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:14px 20px;background:#F37021;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#fff;text-transform:uppercase;">Your Estimate Summary</p>
      </td></tr>
      ${rows.map(r => `
        <tr>
          <td style="padding:10px 20px;border-bottom:1px solid #ffe0c4;">
            <p style="margin:0;font-size:11px;color:#9AABB8;text-transform:uppercase;letter-spacing:1px;">${r.label}</p>
            <p style="margin:3px 0 0;font-size:16px;font-weight:800;color:#1A2B42;">${r.value}</p>
          </td>
        </tr>
      `).join("")}
    </table>
  `;
}

// ── Detail rows helper ────────────────────────────────────────────────────────

function detailRow(label: string, value: string | null | undefined, last = false): string {
  if (!value) return "";
  return `
    <tr>
      <td style="padding:9px 0;${last ? "" : "border-bottom:1px solid #f0f0f0;"}color:#9AABB8;font-size:13px;width:160px;vertical-align:top;">${label}</td>
      <td style="padding:9px 0;${last ? "" : "border-bottom:1px solid #f0f0f0;"}font-weight:600;color:#1A2B42;font-size:13px;">${value}</td>
    </tr>
  `;
}

// ── Email 1: Lead confirmation ────────────────────────────────────────────────

function confirmationHtml(lead: z.infer<typeof LeadSchema>): string {
  const loName = lead.loName;
  const funnelLabel = lead.funnelType
    ? lead.funnelType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : null;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="${BASE}">
  <div style="${WRAP}">
    ${HEADER("Your Estimate Is Ready")}
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:36px 40px 0;">
        <p style="margin:0 0 6px;font-size:24px;font-weight:800;color:#1A2B42;">Hi ${lead.firstName} 👋</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#5A6B7E;">
          ${loName
            ? `We've received your mortgage inquiry and routed it directly to <strong style="color:#1A2B42;">${loName}</strong>. They'll reach out within one business day.`
            : `We've received your mortgage inquiry. A licensed loan officer from Harris Capital Mortgage Group will reach out within one business day.`
          }
        </p>

        ${estimateBlock(lead)}

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          ${detailRow("Goal", goalLabel(lead.goal))}
          ${detailRow("Price range", lead.priceRange)}
          ${detailRow("Credit range", creditLabel(lead.creditRange))}
          ${funnelLabel ? detailRow("Inquiry type", funnelLabel) : ""}
          ${loName ? detailRow("Assigned to", loName + (lead.loNmls ? ` · NMLS# ${lead.loNmls}` : ""), true) : ""}
        </table>

        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
          <tr>
            <td style="padding:4px 0;">
              <a href="${SITE_URL}/get-started"
                style="display:inline-block;background:#F37021;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;letter-spacing:0.2px;">
                Explore more options →
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:20px 0 0;font-size:13px;line-height:1.75;color:#9AABB8;">
          Questions? Reply to this email or call us at
          <a href="tel:+18884413930" style="color:#F37021;text-decoration:none;">1-888-441-3930</a>.
        </p>
      </td></tr>
    </table>
    ${FOOTER}
  </div>
</body>
</html>`;
}

// ── Email 2: LO new lead notification ────────────────────────────────────────

function loNotificationHtml(lead: z.infer<typeof LeadSchema>, loName: string, loNmls: string | null): string {
  const fullName = `${lead.firstName}${lead.lastName ? ` ${lead.lastName}` : ""}`;
  const funnelLabel = lead.funnelType
    ? lead.funnelType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : null;
  const portalUrl = `${SITE_URL}/portal`;

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="${BASE}">
  <div style="${WRAP}">
    ${HEADER("New Lead Assigned To You")}
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:36px 40px 0;">

        <p style="margin:0 0 4px;font-size:24px;font-weight:800;color:#1A2B42;">Hi ${loName.split(" ")[0]} 👋</p>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#5A6B7E;">
          You have a new lead from your funnel link.
          ${lead.utmCampaign ? `Campaign: <strong style="color:#1A2B42;">${lead.utmCampaign}</strong>.` : ""}
          Reach out quickly — fresh leads convert best.
        </p>

        <!-- Lead contact block -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="margin-bottom:24px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:10px 20px;background:#1A2B42;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase;">Contact Details</p>
          </td></tr>
          <tr><td style="padding:16px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${detailRow("Name", fullName)}
              ${detailRow("Email", `<a href="mailto:${lead.email}" style="color:#F37021;">${lead.email}</a>`)}
              ${detailRow("Phone", `<a href="tel:${lead.phone}" style="color:#F37021;">${lead.phone}</a>`)}
              ${detailRow("Device", deviceLabel(lead.device))}
              ${detailRow("Entry page", lead.entryPage, true)}
            </table>
          </td></tr>
        </table>

        <!-- Mortgage details -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="margin-bottom:24px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:10px 20px;background:#1A2B42;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase;">Mortgage Details</p>
          </td></tr>
          <tr><td style="padding:16px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${detailRow("Goal", goalLabel(lead.goal))}
              ${detailRow("Price range", lead.priceRange)}
              ${detailRow("Credit range", creditLabel(lead.creditRange))}
              ${detailRow("Income range", lead.incomeRange)}
              ${funnelLabel ? detailRow("Funnel type", funnelLabel) : ""}
              ${lead.recommendedLoanType ? detailRow("Loan path", lead.recommendedLoanType) : ""}
              ${lead.estimatedMonthlyPayment ? detailRow("Est. monthly payment", `${fmt(lead.estimatedMonthlyPayment)}/mo`) : ""}
              ${lead.estimatedBuyingPowerHigh ? detailRow("Est. buying power", `${fmt(lead.estimatedBuyingPowerLow)} – ${fmt(lead.estimatedBuyingPowerHigh)}`, true) : ""}
            </table>
          </td></tr>
        </table>

        <!-- UTM attribution -->
        ${(lead.utmSource || lead.utmCampaign) ? `
        <table width="100%" cellpadding="0" cellspacing="0"
          style="margin-bottom:24px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:10px 20px;background:#1A2B42;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase;">Lead Attribution</p>
          </td></tr>
          <tr><td style="padding:16px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${detailRow("Source", lead.utmSource)}
              ${detailRow("Medium", lead.utmMedium)}
              ${detailRow("Campaign", lead.utmCampaign)}
              ${detailRow("Content", lead.utmContent, true)}
            </table>
          </td></tr>
        </table>` : ""}

        <a href="${portalUrl}"
          style="display:inline-block;background:#F37021;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:28px;">
          View in my portal →
        </a>

      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;">
      <tr><td style="padding:20px 40px;">
        <p style="margin:0;font-size:11px;line-height:1.8;color:#9AABB8;">
          Harris Capital Mortgage Group, LLC · NMLS# 1918223
          ${loNmls ? ` · Your NMLS# ${loNmls}` : ""} · Equal Housing Lender.
        </p>
      </td></tr>
    </table>
  </div>
</body>
</html>`;
}

// ── Email 3: Company / admin alert ───────────────────────────────────────────

function companyLeadAlertHtml(lead: z.infer<typeof LeadSchema>, fullName: string, sourceDisplay: string, isEmployment: boolean, isContact: boolean): string {
  const adminUrl = `${SITE_URL}/admin/leads`;
  const funnelLabel = lead.funnelType
    ? lead.funnelType.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase())
    : null;

  const headerSub = isEmployment ? "Recruiting Inquiry" : isContact ? "Contact Form Inquiry" : "⚠ Company Lead — Needs Assignment";

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="${BASE}">
  <div style="${WRAP}">
    ${HEADER(headerSub)}
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:36px 40px 0;">

        <p style="margin:0 0 4px;font-size:22px;font-weight:800;color:#1A2B42;">
          ${isEmployment ? "New recruiting inquiry" : isContact ? "New contact form submission" : "New unassigned lead"}
        </p>
        <p style="margin:0 0 20px;font-size:14px;color:#9AABB8;">
          Via <strong style="color:#1A2B42;">${sourceDisplay}</strong>
          ${!isEmployment && !isContact ? " · No loan officer assigned — log in to assign or action." : ""}
        </p>

        <!-- Contact -->
        <table width="100%" cellpadding="0" cellspacing="0"
          style="margin-bottom:20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:10px 20px;background:#1A2B42;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase;">Contact Details</p>
          </td></tr>
          <tr><td style="padding:16px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${detailRow("Name", fullName || "—")}
              ${detailRow("Email", `<a href="mailto:${lead.email}" style="color:#F37021;">${lead.email}</a>`)}
              ${detailRow("Phone", `<a href="tel:${lead.phone}" style="color:#F37021;">${lead.phone}</a>`)}
              ${detailRow("Device", deviceLabel(lead.device))}
              ${detailRow("Referrer", lead.referrer, true)}
            </table>
          </td></tr>
        </table>

        <!-- Mortgage details (only for non-employment, non-contact) -->
        ${!isEmployment && !isContact ? `
        <table width="100%" cellpadding="0" cellspacing="0"
          style="margin-bottom:20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:10px 20px;background:#1A2B42;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase;">Mortgage Details</p>
          </td></tr>
          <tr><td style="padding:16px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${detailRow("Goal", goalLabel(lead.goal))}
              ${detailRow("Price range", lead.priceRange)}
              ${detailRow("Credit range", creditLabel(lead.creditRange))}
              ${detailRow("Income range", lead.incomeRange)}
              ${funnelLabel ? detailRow("Funnel type", funnelLabel) : ""}
              ${lead.estimatedMonthlyPayment ? detailRow("Est. monthly payment", `${fmt(lead.estimatedMonthlyPayment)}/mo`) : ""}
              ${lead.estimatedBuyingPowerHigh ? detailRow("Est. buying power", `${fmt(lead.estimatedBuyingPowerLow)} – ${fmt(lead.estimatedBuyingPowerHigh)}`, true) : ""}
            </table>
          </td></tr>
        </table>

        ${(lead.utmSource || lead.utmCampaign) ? `
        <table width="100%" cellpadding="0" cellspacing="0"
          style="margin-bottom:20px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
          <tr><td style="padding:10px 20px;background:#1A2B42;">
            <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:1.5px;color:#94a3b8;text-transform:uppercase;">Lead Attribution</p>
          </td></tr>
          <tr><td style="padding:16px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${detailRow("Source", lead.utmSource)}
              ${detailRow("Medium", lead.utmMedium)}
              ${detailRow("Campaign", lead.utmCampaign, true)}
            </table>
          </td></tr>
        </table>` : ""}` : ""}

        <a href="${adminUrl}"
          style="display:inline-block;background:#142850;color:#fff;font-size:14px;font-weight:700;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:28px;">
          View in admin portal →
        </a>

      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #f0f0f0;">
      <tr><td style="padding:20px 40px;">
        <p style="margin:0;font-size:11px;line-height:1.8;color:#9AABB8;">
          Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender.
        </p>
      </td></tr>
    </table>
  </div>
</body>
</html>`;
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = LeadSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const lead = parsed.data;
  const lastName = lead.lastName ?? "";
  const fullName = `${lead.firstName}${lastName ? ` ${lastName}` : ""}`.trim();
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? null;

  // ── 1. Persist to Supabase ────────────────────────────────────────────────
  const sb = createServiceClient();
  const { data: savedLead } = await sb.from("leads").insert({
    first_name:                   lead.firstName,
    last_name:                    lead.lastName ?? null,
    email:                        lead.email,
    phone:                        lead.phone,
    sms_consent:                  lead.smsConsent,
    source:                       lead.source ?? "funnel",
    funnel_type:                  lead.funnelType ?? null,
    goal:                         lead.goal ?? null,
    price_range:                  lead.priceRange ?? null,
    credit_range:                 lead.creditRange ?? null,
    income_range:                 lead.incomeRange ?? null,
    estimated_buying_power_low:   lead.estimatedBuyingPowerLow  ?? null,
    estimated_buying_power_high:  lead.estimatedBuyingPowerHigh ?? null,
    estimated_monthly_payment:    lead.estimatedMonthlyPayment  ?? null,
    recommended_loan_type:        lead.recommendedLoanType      ?? null,
    notes: [
      lead.notes,
      lead.seoSlug    ? `SEO page: /seo/${lead.seoSlug}` : null,
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

  logAudit("lead.created", {
    lead_id: savedLead?.id,
    email:   lead.email,
    lo_slug: lead.loSlug,
    source:  lead.source,
  }, undefined, undefined, ip ?? undefined);

  // ── 2. Fire-and-forget: Porchy Flight Deck CRM ───────────────────────────
  const flightDeckUrl = process.env.FLIGHT_DECK_LEADS_URL;
  const flightDeckKey = process.env.FLIGHT_DECK_API_KEY;
  if (flightDeckUrl && flightDeckKey) {
    fetch(flightDeckUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${flightDeckKey}` },
      body: JSON.stringify({
        ...lead,
        source_app:       "orange-key-web",
        assigned_lo_slug: lead.loSlug ?? null,
        assigned_lo_name: lead.loName ?? null,
        assigned_lo_nmls: lead.loNmls ?? null,
      }),
    }).catch(() => {});
  }

  // ── 3. Resolve LO notify email ────────────────────────────────────────────
  let loNotifyEmail: string | null = null;
  let loNmls: string | null = null;
  if (lead.loSlug) {
    const loProfile = await getProfileBySlug(lead.loSlug);
    loNotifyEmail = loProfile?.notify_email ?? loProfile?.email ?? null;
    loNmls        = loProfile?.nmls ?? null;
  }

  // ── 4. Send emails ────────────────────────────────────────────────────────
  const resend = getResend();
  if (resend) {
    const emailJobs: Promise<unknown>[] = [
      // Always send confirmation to the lead
      resend.emails.send({
        from:    "HCMG <noreply@hcmgloans.com>",
        to:      lead.email,
        subject: lead.loName
          ? `You're connected — ${lead.loName} will be in touch shortly`
          : "We received your inquiry — Harris Capital Mortgage Group",
        html: buildLeadConfirmationEmail({
          firstName:           lead.firstName,
          loName:              lead.loName,
          loNmls:              loNmls,
          goal:                goalLabel(lead.goal),
          priceRange:          lead.priceRange,
          creditRange:         creditLabel(lead.creditRange),
          buyingPowerLow:      lead.estimatedBuyingPowerLow,
          buyingPowerHigh:     lead.estimatedBuyingPowerHigh,
          monthlyPayment:      lead.estimatedMonthlyPayment,
          recommendedLoanType: lead.recommendedLoanType,
          siteUrl:             SITE_URL,
        }),
      }),
    ];

    if (lead.loSlug && loNotifyEmail && lead.loName) {
      // Assigned LO notification
      emailJobs.push(
        resend.emails.send({
          from:    "HCMG Leads <noreply@hcmgloans.com>",
          to:      loNotifyEmail,
          subject: `🔔 New lead: ${fullName || lead.email}${lead.funnelType ? ` via ${lead.funnelType}` : ""}`,
          html: buildLoNotificationEmail({
            loFirstName:         lead.loName.split(" ")[0],
            leadFullName:        fullName,
            email:               lead.email,
            phone:               lead.phone,
            goal:                goalLabel(lead.goal),
            priceRange:          lead.priceRange,
            creditRange:         creditLabel(lead.creditRange),
            incomeRange:         lead.incomeRange,
            utmSource:           lead.utmSource,
            utmMedium:           lead.utmMedium,
            utmCampaign:         lead.utmCampaign,
            monthlyPayment:      lead.estimatedMonthlyPayment,
            buyingPowerLow:      lead.estimatedBuyingPowerLow,
            buyingPowerHigh:     lead.estimatedBuyingPowerHigh,
            recommendedLoanType: lead.recommendedLoanType,
            entryPage:           lead.entryPage,
            device:              deviceLabel(lead.device),
            portalUrl:           `${SITE_URL}/portal`,
          }),
        })
      );
    } else if (!lead.loSlug) {
      // Unassigned — route to correct admin inbox
      const settings = await readSettings();
      const source   = lead.source ?? "website";
      const isEmployment = source === "employment";
      const isContact    = source === "contact";

      const alertEmail = isEmployment ? settings.recruiting_notify_email
        : isContact                  ? settings.contact_notify_email
        : settings.company_notify_email;

      if (alertEmail) {
        const sourceDisplay = isEmployment ? "Recruiting"
          : isContact ? "Contact form"
          : lead.seoSlug ? `SEO — ${lead.seoSlug}`
          : lead.funnelType ? `Funnel — ${lead.funnelType}`
          : source;

        emailJobs.push(
          resend.emails.send({
            from:    "HCMG Leads <noreply@hcmgloans.com>",
            to:      alertEmail,
            subject: isEmployment ? `Recruiting inquiry — ${fullName || lead.email}`
              : isContact         ? `Contact form — ${fullName || lead.email}`
              : `Company lead — ${fullName || lead.email}`,
            html: buildCompanyAlertEmail({
              leadFullName: fullName,
              email:        lead.email,
              phone:        lead.phone,
              source:       sourceDisplay,
              goal:         goalLabel(lead.goal),
              priceRange:   lead.priceRange,
              creditRange:  creditLabel(lead.creditRange),
              utmSource:    lead.utmSource,
              utmCampaign:  lead.utmCampaign,
              adminUrl:     `${SITE_URL}/admin/leads`,
              isEmployment,
              isContact,
            }),
          })
        );
      }
    }

    await Promise.all(emailJobs).catch(() => {}); // never fail lead save on email error
  }

  return NextResponse.json({ ok: true });
}
