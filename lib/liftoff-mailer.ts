/**
 * Lift Off — Notification Emails
 *
 * Lock Desk requests  → lockdesk@hcmgloans.com
 * All other requests  → processing@hcmgloans.com
 *
 * Respects GOAL_ENGINE_TEST_MODE — when true all mail goes to
 * GOAL_ENGINE_TEST_EMAIL with a [TEST] subject prefix.
 */

import { Resend } from "resend";
import { infoRow, emailSection, ctaButton } from "@/lib/email-templates";

// ── Liftoff-specific email chrome ─────────────────────────────────────────────
// These override the shared templates so Liftoff emails have their own
// clean white design without affecting any other email in the system.

const LO_LOGO = `
<table cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
  <tr>
    <td style="vertical-align:middle;">
      <!-- Orange rocket badge -->
      <table cellpadding="0" cellspacing="0">
        <tr>
          <td style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#FF9847 0%,#F37021 50%,#C45213 100%);text-align:center;vertical-align:middle;font-size:22px;line-height:44px;">
            🚀
          </td>
          <td style="padding-left:12px;vertical-align:middle;">
            <div style="font-family:Arial Black,Arial,sans-serif;font-size:18px;font-weight:900;color:#ffffff;letter-spacing:0.5px;line-height:1;">LIFT OFF</div>
            <div style="font-family:Arial,sans-serif;font-size:9px;font-weight:700;color:rgba(255,255,255,0.45);letter-spacing:2px;text-transform:uppercase;margin-top:3px;">by HCMG</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;

function liftoffEmailHeader(eyebrow: string, headline: string, subline?: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
      style="background:linear-gradient(160deg,#0f1f3d 0%,#142850 60%,#1a3260 100%);">
    <tr><td style="padding:32px 36px 28px;">
      ${LO_LOGO}
      <div style="display:inline-block;background:rgba(243,112,33,0.2);border:1px solid rgba(243,112,33,0.5);border-radius:20px;padding:4px 14px;margin-bottom:14px;">
        <span style="font-family:Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:2.5px;color:#FF9847;text-transform:uppercase;">${eyebrow}</span>
      </div>
      <p style="margin:0;font-family:Arial Black,Arial,sans-serif;font-size:26px;font-weight:900;color:#ffffff;line-height:1.15;letter-spacing:-0.5px;">${headline}</p>
      ${subline ? `<p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:13px;color:rgba(255,255,255,0.5);line-height:1.5;">${subline}</p>` : ""}
    </td></tr>
  </table>`;
}

function liftoffEmailFooter(): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#f8fafc;border-top:1px solid #e5e7eb;">
    <tr><td style="padding:24px 36px;">
      <!-- Liftoff wordmark -->
      <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
        <tr>
          <td style="width:32px;height:32px;border-radius:9px;background:linear-gradient(135deg,#FF9847,#F37021);text-align:center;vertical-align:middle;font-size:16px;line-height:32px;">🚀</td>
          <td style="padding-left:10px;vertical-align:middle;">
            <div style="font-family:Arial Black,Arial,sans-serif;font-size:13px;font-weight:900;color:#142850;letter-spacing:0.3px;">The Lift Off Team</div>
            <div style="font-family:Arial,sans-serif;font-size:11px;color:#F37021;font-weight:600;margin-top:1px;">
              <a href="https://hcmgloans.com/liftoff" style="color:#F37021;text-decoration:none;">hcmgloans.com/liftoff</a>
              &nbsp;·&nbsp;
              <a href="mailto:liftoff@hcmgloans.com" style="color:#57606a;text-decoration:none;">liftoff@hcmgloans.com</a>
            </div>
          </td>
        </tr>
      </table>
      <p style="margin:0;font-family:Arial,sans-serif;font-size:10px;line-height:1.8;color:#9AABB8;">
        Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender<br/>
        6375 S Pecos Rd, Suite 208 · Las Vegas, NV 89120
      </p>
    </td></tr>
  </table>`;
}

function liftoffEmailWrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:#eef2f7;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
      style="margin:0;padding:0;background:#eef2f7;font-family:'Helvetica Neue',Arial,sans-serif;">
    <tr><td align="center" style="padding:40px 16px;">
      <table width="100%" cellpadding="0" cellspacing="0"
          style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #dde3ec;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
        ${content}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const resend       = new Resend(process.env.RESEND_API_KEY);
const TEST_MODE    = process.env.GOAL_ENGINE_TEST_MODE === "true";
const TEST_EMAIL   = process.env.GOAL_ENGINE_TEST_EMAIL ?? "darius@hcmgloans.com";
const FROM         = "Lift Off · HCMG <liftoff@hcmgloans.com>";
const BASE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com";

const LOCK_DESK_EMAIL  = "lockdesk@hcmgloans.com";
const HELP_DESK_EMAIL  = "helpdesk@hcmgloans.com";
const PROCESSING_EMAIL = "processing@hcmgloans.com";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface LiftOffEmailPayload {
  id:               string;
  request_type:     string;
  created_at:       string;

  // Submitter
  submitter_name:   string;
  submitter_nmls:   string | null;
  submitter_email:  string | null;
  submitter_phone:  string | null;

  // Borrower
  borrower_first_name: string;
  borrower_last_name:  string;
  co_borrower_first_name?: string | null;

  // Loan
  arive_loan_number?: string | null;
  loan_purpose?:      string | null;
  loan_program?:      string | null;
  loan_type?:         string | null;
  loan_amount?:       number | null;
  purchase_price?:    number | null;
  target_close_date?: string | null;
  lock_status?:       string | null;

  // Special instructions
  special_instructions?: string | null;

  // Lock Request pricing
  lock_requested_rate?:        number | null;
  lock_requested_price?:       number | null;
  lock_requested_lender?:      string | null;
  lock_requested_product?:     string | null;
  lock_period_days?:           number | null;
  lock_requested_close_date?:  string | null;
  lock_lo_notes?:              string | null;
  channel_type?:               string | null;
  compensation_type?:          string | null;

  // Loan Help Desk
  help_desk_sub_type?:    string | null;
  help_desk_description?: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  register_disclosure: "Register + Disclosure",
  disclosure_only:     "Disclosure Only",
  submission:          "Submission",
  loan_help_desk:      "Loan Help Desk",
  lock_request:        "Lock Desk Request",
};

const fmt = {
  money:  (n: number | null | undefined) =>
    n != null ? `$${n.toLocaleString("en-US")}` : null,
  date:   (s: string | null | undefined) =>
    s ? new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null,
  ts:     (s: string) =>
    new Date(s).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "2-digit", minute: "2-digit", timeZoneName: "short",
    }),
};

async function send(to: string, subject: string, html: string) {
  const realTo  = TEST_MODE ? TEST_EMAIL : to;
  const realSub = TEST_MODE ? `[TEST → ${to}] ${subject}` : subject;
  try {
    await resend.emails.send({ from: FROM, to: realTo, subject: realSub, html });
  } catch (err) {
    console.error("[liftoff-mailer] send failed →", to, err);
  }
}

// ── Lock Desk Request Email ───────────────────────────────────────────────────

function buildLockDeskEmail(r: LiftOffEmailPayload, viewUrl: string): string {
  const borrower = [r.borrower_first_name, r.borrower_last_name].filter(Boolean).join(" ");
  const co       = r.co_borrower_first_name ? ` + ${r.co_borrower_first_name}` : "";

  const isBroker = r.channel_type?.toLowerCase() === "broker";
  const pricingRows =
    infoRow("Channel",          r.channel_type) +
    (isBroker && r.compensation_type ? infoRow("Compensation", r.compensation_type) : "") +
    infoRow("Rate",             r.lock_requested_rate  != null ? `${r.lock_requested_rate}%` : null) +
    infoRow("Discount Points",  r.lock_requested_price != null ? String(r.lock_requested_price) : null) +
    infoRow("Lender",           r.lock_requested_lender) +
    infoRow("Product",          r.lock_requested_product) +
    infoRow("Lock Period",      r.lock_period_days != null ? `${r.lock_period_days} days` : null) +
    infoRow("Req. Close",       fmt.date(r.lock_requested_close_date));

  const loanRows =
    infoRow("ARIVE Loan #",   r.arive_loan_number) +
    infoRow("Loan Purpose",   r.loan_purpose) +
    infoRow("Loan Program",   r.loan_program) +
    infoRow("Loan Amount",    fmt.money(r.loan_amount)) +
    infoRow("Purchase Price", fmt.money(r.purchase_price));

  const loRows =
    infoRow("Submitted By",   r.submitter_name) +
    infoRow("NMLS #",         r.submitter_nmls) +
    infoRow("Email",          r.submitter_email) +
    infoRow("Phone",          r.submitter_phone) +
    infoRow("Submitted At",   fmt.ts(r.created_at));

  const notesSection = r.lock_lo_notes
    ? `<table width="100%" cellpadding="0" cellspacing="0"
        style="margin-bottom:20px;border:1px solid #fcd34d;border-radius:12px;overflow:hidden;background:#fffbeb;">
        <tr><td style="padding:10px 20px;background:#f59e0b;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">Notes from LO</p>
        </td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;color:#1A2B42;line-height:1.6;">
          ${r.lock_lo_notes.replace(/\n/g, "<br/>")}
        </td></tr>
      </table>`
    : "";

  const body = `
    <div style="padding:32px 36px 8px;">
      ${emailSection("Requested Pricing", pricingRows)}
      ${notesSection}
      ${emailSection("Loan Information", loanRows)}
      ${emailSection("Loan Officer", loRows)}
      <div style="margin:24px 0 32px;">
        ${ctaButton("View Request →", viewUrl)}
      </div>
    </div>`;

  return liftoffEmailWrap(
    liftoffEmailHeader(
      "Lock Desk · New Request",
      `🔒 Lock Request — ${borrower}${co}`,
      `Submitted ${fmt.ts(r.created_at)} · ARIVE #${r.arive_loan_number ?? "—"}`,
    ) + body + liftoffEmailFooter(),
  );
}

// ── Processing Request Email ──────────────────────────────────────────────────

function buildProcessingEmail(r: LiftOffEmailPayload, viewUrl: string): string {
  const borrower  = [r.borrower_first_name, r.borrower_last_name].filter(Boolean).join(" ");
  const co        = r.co_borrower_first_name ? ` + ${r.co_borrower_first_name}` : "";
  const typeLabel = TYPE_LABELS[r.request_type] ?? r.request_type;

  const loanRows =
    infoRow("ARIVE Loan #",   r.arive_loan_number) +
    infoRow("Loan Purpose",   r.loan_purpose) +
    infoRow("Loan Program",   r.loan_program) +
    infoRow("Loan Amount",    fmt.money(r.loan_amount)) +
    infoRow("Purchase Price", fmt.money(r.purchase_price)) +
    infoRow("Target Close",   fmt.date(r.target_close_date)) +
    infoRow("Lock Status",    r.lock_status);

  const loRows =
    infoRow("Submitted By",   r.submitter_name) +
    infoRow("NMLS #",         r.submitter_nmls) +
    infoRow("Email",          r.submitter_email) +
    infoRow("Phone",          r.submitter_phone) +
    infoRow("Submitted At",   fmt.ts(r.created_at));

  const notesSection = r.special_instructions
    ? `<table width="100%" cellpadding="0" cellspacing="0"
        style="margin-bottom:20px;border:1px solid #fed7aa;border-radius:12px;overflow:hidden;background:#fff7ed;">
        <tr><td style="padding:10px 20px;background:#F37021;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">Special Instructions</p>
        </td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;color:#1A2B42;line-height:1.6;">
          ${r.special_instructions.replace(/\n/g, "<br/>")}
        </td></tr>
      </table>`
    : "";

  const helpDeskSection = r.request_type === "loan_help_desk"
    ? `<table width="100%" cellpadding="0" cellspacing="0"
        style="margin-bottom:20px;border:1px solid #fed7aa;border-radius:12px;overflow:hidden;background:#fff7ed;">
        <tr><td style="padding:10px 20px;background:#F37021;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">Help Desk Request</p>
        </td></tr>
        <tr><td style="padding:14px 20px;">
          ${infoRow("Sub-type",    r.help_desk_sub_type)}
          ${r.help_desk_description
            ? `<tr>
                <td style="padding:6px 0;font-size:11px;font-weight:700;color:#57606a;text-transform:uppercase;letter-spacing:0.08em;width:140px;vertical-align:top;">Description</td>
                <td style="padding:6px 0;font-size:13px;color:#1A2B42;line-height:1.6;">${r.help_desk_description.replace(/\n/g, "<br/>")}</td>
               </tr>`
            : ""}
        </td></tr>
      </table>`
    : "";

  const body = `
    <div style="padding:32px 36px 8px;">
      ${emailSection("Loan Information", loanRows)}
      ${helpDeskSection}
      ${notesSection}
      ${emailSection("Loan Officer", loRows)}
      <div style="margin:24px 0 32px;">
        ${ctaButton("View Request →", viewUrl)}
      </div>
    </div>`;

  return liftoffEmailWrap(
    liftoffEmailHeader(
      `Lift Off · ${typeLabel}`,
      `New Request — ${borrower}${co}`,
      `Submitted ${fmt.ts(r.created_at)} · ARIVE #${r.arive_loan_number ?? "—"}`,
    ) + body + liftoffEmailFooter(),
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export async function sendLiftOffNotification(r: LiftOffEmailPayload): Promise<void> {
  const viewUrl   = `${BASE_URL}/admin/liftoff/${r.id}`;
  const typeLabel = TYPE_LABELS[r.request_type] ?? r.request_type;
  const borrower  = [r.borrower_first_name, r.borrower_last_name].filter(Boolean).join(" ");

  if (r.request_type === "lock_request") {
    await send(
      LOCK_DESK_EMAIL,
      `🔒 Lock Request — ${borrower} · ${r.arive_loan_number ?? "No ARIVE #"}`,
      buildLockDeskEmail(r, viewUrl),
    );
  } else if (r.request_type === "loan_help_desk") {
    await send(
      HELP_DESK_EMAIL,
      `🛎 Help Desk: ${typeLabel} — ${borrower} · ${r.arive_loan_number ?? "No ARIVE #"}`,
      buildProcessingEmail(r, viewUrl),
    );
  } else {
    await send(
      PROCESSING_EMAIL,
      `New Lift Off: ${typeLabel} — ${borrower} · ${r.arive_loan_number ?? "No ARIVE #"}`,
      buildProcessingEmail(r, viewUrl),
    );
  }
}

// ── In-Flight Email (LO notification) ────────────────────────────────────────

export interface LiftOffWorkflowPayload {
  request:       Record<string, unknown>;
  processorName: string;
  startedAt?:    string;
  completedAt?:  string;
}

function requestField(r: Record<string, unknown>, key: string): string | null {
  const v = r[key];
  return v != null ? String(v) : null;
}

function buildInFlightEmail(p: LiftOffWorkflowPayload, viewUrl: string): string {
  const r         = p.request;
  const borrower  = [requestField(r, "borrower_first_name"), requestField(r, "borrower_last_name")].filter(Boolean).join(" ");
  const typeLabel = TYPE_LABELS[requestField(r, "request_type") ?? ""] ?? requestField(r, "request_type") ?? "";

  const detailRows =
    infoRow("Request Type",  typeLabel) +
    infoRow("ARIVE Loan #",  requestField(r, "arive_loan_number")) +
    infoRow("Borrower",      borrower) +
    infoRow("Submitted At",  fmt.ts(requestField(r, "created_at") ?? new Date().toISOString())) +
    infoRow("Started At",    fmt.ts(p.startedAt ?? new Date().toISOString())) +
    infoRow("Claimed By",    requestField(r, "claimed_by_name"));

  const body = `
    <div style="padding:32px 36px 8px;">
      <div style="margin-bottom:20px;padding:16px 20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;">
        <p style="margin:0;font-size:14px;font-weight:700;color:#1d4ed8;">
          ✈️ Your Lift Off request is now in flight and being worked on by our ops team.
        </p>
      </div>
      ${emailSection("Request Details", detailRows)}
      <div style="margin:24px 0 32px;">
        ${ctaButton("View Your Request →", viewUrl)}
      </div>
    </div>`;

  return liftoffEmailWrap(
    liftoffEmailHeader(
      "Lift Off · In Flight",
      `✈️ Your request is being processed`,
      `${typeLabel} — ${borrower} · ARIVE #${requestField(r, "arive_loan_number") ?? "—"}`,
    ) + body + liftoffEmailFooter(),
  );
}

function buildCompletedEmail(p: LiftOffWorkflowPayload, viewUrl: string): string {
  const r         = p.request;
  const borrower  = [requestField(r, "borrower_first_name"), requestField(r, "borrower_last_name")].filter(Boolean).join(" ");
  const typeLabel = TYPE_LABELS[requestField(r, "request_type") ?? ""] ?? requestField(r, "request_type") ?? "";
  const notes     = requestField(r, "team_notes");

  const detailRows =
    infoRow("Request Type",  typeLabel) +
    infoRow("ARIVE Loan #",  requestField(r, "arive_loan_number")) +
    infoRow("Borrower",      borrower) +
    infoRow("Submitted At",  fmt.ts(requestField(r, "created_at") ?? new Date().toISOString())) +
    infoRow("Completed At",  fmt.ts(p.completedAt ?? new Date().toISOString())) +
    infoRow("Completed By",  p.processorName);

  const notesSection = notes
    ? `<table width="100%" cellpadding="0" cellspacing="0"
        style="margin-bottom:20px;border:1px solid #bbf7d0;border-radius:12px;overflow:hidden;background:#f0fdf4;">
        <tr><td style="padding:10px 20px;background:#16a34a;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">Notes from the Team</p>
        </td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;color:#1A2B42;line-height:1.6;">
          ${notes.replace(/\n/g, "<br/>")}
        </td></tr>
      </table>`
    : "";

  const body = `
    <div style="padding:32px 36px 8px;">
      <div style="margin-bottom:20px;padding:16px 20px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;">
        <p style="margin:0;font-size:14px;font-weight:700;color:#15803d;">
          ✅ Your Lift Off request has been completed by our ops team.
        </p>
      </div>
      ${emailSection("Request Details", detailRows)}
      ${notesSection}
      <div style="margin:24px 0 32px;">
        ${ctaButton("View Completed Request →", viewUrl)}
      </div>
    </div>`;

  return liftoffEmailWrap(
    liftoffEmailHeader(
      "Lift Off · Completed",
      `✅ Request completed`,
      `${typeLabel} — ${borrower} · ARIVE #${requestField(r, "arive_loan_number") ?? "—"}`,
    ) + body + liftoffEmailFooter(),
  );
}

export async function sendLiftOffInFlight(p: LiftOffWorkflowPayload): Promise<void> {
  const r         = p.request;
  const viewUrl   = `${BASE_URL}/liftoff/${requestField(r, "id")}`;
  const borrower  = [requestField(r, "borrower_first_name"), requestField(r, "borrower_last_name")].filter(Boolean).join(" ");
  const typeLabel = TYPE_LABELS[requestField(r, "request_type") ?? ""] ?? "Lift Off";
  const toEmail   = requestField(r, "submitter_email");
  if (!toEmail) return;
  await send(
    toEmail,
    `✈️ In Flight: ${typeLabel} — ${borrower}`,
    buildInFlightEmail(p, viewUrl),
  );
}

export async function sendLiftOffCompleted(p: LiftOffWorkflowPayload): Promise<void> {
  const r         = p.request;
  const viewUrl   = `${BASE_URL}/liftoff/${requestField(r, "id")}`;
  const borrower  = [requestField(r, "borrower_first_name"), requestField(r, "borrower_last_name")].filter(Boolean).join(" ");
  const typeLabel = TYPE_LABELS[requestField(r, "request_type") ?? ""] ?? "Lift Off";
  const toEmail   = requestField(r, "submitter_email");
  if (!toEmail) return;
  await send(
    toEmail,
    `✅ Completed: ${typeLabel} — ${borrower}`,
    buildCompletedEmail(p, viewUrl),
  );
}

// ── Incomplete Email (LO notification) ───────────────────────────────────────

export interface LiftOffIncompletePayload {
  request:          Record<string, unknown>;
  reasons:          string[];
  notes:            string | null;
  incompleteByName: string;
  incompleteAt:     string;
}

function buildIncompleteEmail(p: LiftOffIncompletePayload, viewUrl: string): string {
  const r         = p.request;
  const borrower  = [requestField(r, "borrower_first_name"), requestField(r, "borrower_last_name")].filter(Boolean).join(" ");
  const typeLabel = TYPE_LABELS[requestField(r, "request_type") ?? ""] ?? requestField(r, "request_type") ?? "";

  const reasonsList = p.reasons
    .map(reason => `<li style="margin-bottom:6px;font-size:13px;color:#1A2B42;">${reason}</li>`)
    .join("");

  const reasonsSection = `
    <table width="100%" cellpadding="0" cellspacing="0"
        style="margin-bottom:20px;border:1px solid #fecaca;border-radius:12px;overflow:hidden;background:#fff5f5;">
      <tr><td style="padding:10px 20px;background:#dc2626;">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">What Needs to Be Fixed</p>
      </td></tr>
      <tr><td style="padding:14px 20px;">
        <ul style="margin:0;padding-left:18px;">
          ${reasonsList}
        </ul>
      </td></tr>
    </table>`;

  const notesSection = p.notes
    ? `<table width="100%" cellpadding="0" cellspacing="0"
        style="margin-bottom:20px;border:1px solid #fed7aa;border-radius:12px;overflow:hidden;background:#fff7ed;">
        <tr><td style="padding:10px 20px;background:#F37021;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">Notes from the Team</p>
        </td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;color:#1A2B42;line-height:1.6;">
          ${p.notes.replace(/\n/g, "<br/>")}
        </td></tr>
      </table>`
    : "";

  const detailRows =
    infoRow("Request Type",  typeLabel) +
    infoRow("ARIVE Loan #",  requestField(r, "arive_loan_number")) +
    infoRow("Borrower",      borrower) +
    infoRow("Submitted At",  fmt.ts(requestField(r, "created_at") ?? new Date().toISOString())) +
    infoRow("Returned At",   fmt.ts(p.incompleteAt)) +
    infoRow("Returned By",   p.incompleteByName);

  const alertBanner = `
    <div style="margin-bottom:20px;padding:16px 20px;background:#fff5f5;border:1px solid #fecaca;border-radius:12px;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#dc2626;">
        Your Lift Off request has been returned by our ops team and requires your attention before it can be processed.
      </p>
    </div>`;

  const body = `
    <div style="padding:32px 36px 8px;">
      ${alertBanner}
      ${reasonsSection}
      ${notesSection}
      ${emailSection("Request Details", detailRows)}
      <div style="margin:24px 0 32px;">
        ${ctaButton("Review & Fix Your Request →", viewUrl)}
      </div>
    </div>`;

  return liftoffEmailWrap(
    liftoffEmailHeader(
      "⚠️ Action Required",
      `⚠️ Action Required — ${typeLabel}`,
      `${borrower} · ARIVE #${requestField(r, "arive_loan_number") ?? "—"}`,
    ) + body + liftoffEmailFooter(),
  );
}

export async function sendLiftOffIncomplete(p: LiftOffIncompletePayload): Promise<void> {
  const r         = p.request;
  const viewUrl   = `${BASE_URL}/liftoff/${requestField(r, "id")}`;
  const borrower  = [requestField(r, "borrower_first_name"), requestField(r, "borrower_last_name")].filter(Boolean).join(" ");
  const typeLabel = TYPE_LABELS[requestField(r, "request_type") ?? ""] ?? "Lift Off";
  const toEmail   = requestField(r, "submitter_email");
  if (!toEmail) return;
  await send(
    toEmail,
    `⚠️ Action Required: ${typeLabel} — ${borrower}`,
    buildIncompleteEmail(p, viewUrl),
  );
}

// ── Resubmission Email (ops queue notification) ───────────────────────────────

export interface LiftOffResubmissionPayload {
  request:           Record<string, unknown>;  // new resubmission row
  originalRequest:   Record<string, unknown>;  // original request row
  resubmissionNotes: string | null;
  resubmittedAt:     string;
  confirmedReasons:  string[];
}

function buildResubmissionEmail(p: LiftOffResubmissionPayload, viewUrl: string): string {
  const r         = p.request;
  const orig      = p.originalRequest;
  const borrower  = [requestField(r, "borrower_first_name"), requestField(r, "borrower_last_name")].filter(Boolean).join(" ");
  const co        = requestField(r, "co_borrower_first_name") ? ` + ${requestField(r, "co_borrower_first_name")}` : "";
  const typeLabel = TYPE_LABELS[requestField(r, "request_type") ?? ""] ?? requestField(r, "request_type") ?? "";

  const resubmissionBanner = `
    <table width="100%" cellpadding="0" cellspacing="0"
        style="margin-bottom:20px;border:1px solid #fcd34d;border-radius:12px;overflow:hidden;background:#fffbeb;">
      <tr><td style="padding:10px 20px;background:#d97706;">
        <p style="margin:0;font-size:11px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">↩ Resubmission</p>
      </td></tr>
      <tr><td style="padding:14px 20px;font-size:13px;color:#1A2B42;line-height:1.6;">
        <strong>${requestField(r, "submitter_name") ?? "The LO"}</strong> has reviewed and fixed the incomplete items
        and resubmitted this request for processing.
      </td></tr>
    </table>`;

  const confirmedList = p.confirmedReasons.length > 0
    ? `<table width="100%" cellpadding="0" cellspacing="0"
          style="margin-bottom:20px;border:1px solid #d1fae5;border-radius:12px;overflow:hidden;background:#f0fdf4;">
        <tr><td style="padding:10px 20px;background:#16a34a;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">Confirmed Fixed</p>
        </td></tr>
        <tr><td style="padding:14px 20px;">
          <ul style="margin:0;padding-left:18px;">
            ${p.confirmedReasons.map(r => `<li style="margin-bottom:6px;font-size:13px;color:#1A2B42;">✓ ${r}</li>`).join("")}
          </ul>
        </td></tr>
      </table>`
    : "";

  const notesSection = p.resubmissionNotes
    ? `<table width="100%" cellpadding="0" cellspacing="0"
          style="margin-bottom:20px;border:1px solid #fed7aa;border-radius:12px;overflow:hidden;background:#fff7ed;">
        <tr><td style="padding:10px 20px;background:#F37021;">
          <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">Resubmission Notes from LO</p>
        </td></tr>
        <tr><td style="padding:14px 20px;font-size:13px;color:#1A2B42;line-height:1.6;">
          ${p.resubmissionNotes.replace(/\n/g, "<br/>")}
        </td></tr>
      </table>`
    : "";

  const detailRows =
    infoRow("Request Type",    typeLabel) +
    infoRow("ARIVE Loan #",    requestField(r, "arive_loan_number")) +
    infoRow("Borrower",        borrower) +
    infoRow("Submitted By",    requestField(r, "submitter_name")) +
    infoRow("Resubmitted At",  fmt.ts(p.resubmittedAt)) +
    infoRow("Original ID",     requestField(orig, "id"));

  const body = `
    <div style="padding:32px 36px 8px;">
      ${resubmissionBanner}
      ${confirmedList}
      ${notesSection}
      ${emailSection("Request Details", detailRows)}
      <div style="margin:24px 0 32px;">
        ${ctaButton("View Resubmission →", viewUrl)}
      </div>
    </div>`;

  return liftoffEmailWrap(
    liftoffEmailHeader(
      `Lift Off · ↩ Resubmission`,
      `↩ Resubmission — ${typeLabel}`,
      `${borrower}${co} · ARIVE #${requestField(r, "arive_loan_number") ?? "—"}`,
    ) + body + liftoffEmailFooter(),
  );
}

export async function sendLiftOffResubmission(p: LiftOffResubmissionPayload): Promise<void> {
  const r         = p.request;
  const viewUrl   = `${BASE_URL}/admin/liftoff/${requestField(r, "id")}`;
  const borrower  = [requestField(r, "borrower_first_name"), requestField(r, "borrower_last_name")].filter(Boolean).join(" ");
  const typeLabel = TYPE_LABELS[requestField(r, "request_type") ?? ""] ?? "Lift Off";
  const to = requestField(r, "request_type") === "lock_request" ? LOCK_DESK_EMAIL : PROCESSING_EMAIL;
  await send(
    to,
    `↩ Resubmission: ${typeLabel} — ${borrower}`,
    buildResubmissionEmail(p, viewUrl),
  );
}

// ── Assigned Email (ops team member notification) ─────────────────────────────

export interface LiftOffAssignedPayload {
  request:        Record<string, unknown>;
  assigneeName:   string;
  assigneeEmail:  string;
  assignedByName: string;
  assignedAt:     string;
}

function buildAssignedEmail(p: LiftOffAssignedPayload, viewUrl: string): string {
  const r         = p.request;
  const borrower  = [requestField(r, "borrower_first_name"), requestField(r, "borrower_last_name")].filter(Boolean).join(" ");
  const typeLabel = TYPE_LABELS[requestField(r, "request_type") ?? ""] ?? requestField(r, "request_type") ?? "";

  const alertBanner = `
    <div style="margin-bottom:20px;padding:16px 20px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;">
      <p style="margin:0;font-size:14px;font-weight:700;color:#1d4ed8;">
        📋 You have been assigned a Lift Off request by ${p.assignedByName}.
      </p>
    </div>`;

  const detailRows =
    infoRow("Request Type",  typeLabel) +
    infoRow("Borrower",      borrower) +
    infoRow("ARIVE Loan #",  requestField(r, "arive_loan_number")) +
    infoRow("Submitted At",  fmt.ts(requestField(r, "created_at") ?? new Date().toISOString())) +
    infoRow("Assigned At",   fmt.ts(p.assignedAt)) +
    infoRow("Assigned By",   p.assignedByName);

  const body = `
    <div style="padding:32px 36px 8px;">
      ${alertBanner}
      ${emailSection("Request Details", detailRows)}
      <div style="margin:24px 0 32px;">
        ${ctaButton("View Request →", viewUrl)}
      </div>
    </div>`;

  return liftoffEmailWrap(
    liftoffEmailHeader(
      "Lift Off · Assigned to You",
      `📋 Assigned: ${typeLabel} — ${borrower}`,
      `Assigned by ${p.assignedByName} · ARIVE #${requestField(r, "arive_loan_number") ?? "—"}`,
    ) + body + liftoffEmailFooter(),
  );
}

export async function sendLiftOffAssigned(p: LiftOffAssignedPayload): Promise<void> {
  const r         = p.request;
  const viewUrl   = `${BASE_URL}/liftoff/${requestField(r, "id")}`;
  const borrower  = [requestField(r, "borrower_first_name"), requestField(r, "borrower_last_name")].filter(Boolean).join(" ");
  const typeLabel = TYPE_LABELS[requestField(r, "request_type") ?? ""] ?? "Lift Off";
  await send(
    p.assigneeEmail,
    `📋 Assigned to you: ${typeLabel} — ${borrower}`,
    buildAssignedEmail(p, viewUrl),
  );
}

// ── Preview: send every email template to a single address ───────────────────
// Used by the admin test-emails button. Calls the internal HTML builders
// directly and force-routes every email to the requested address.
// Small sequential delays prevent Resend rate limiting (10 req/s free tier).

export async function sendAllPreviewEmails(to: string): Promise<{ sent: string[]; errors: string[] }> {
  const delay = (ms: number) => new Promise(r => setTimeout(r, ms));
  const sent: string[] = [];
  const errors: string[] = [];

  const fakeId  = "preview-00000000-0000-0000-0000-000000000001";
  const now     = new Date().toISOString();
  const ago     = (n: number) => new Date(Date.now() - n * 60_000).toISOString();
  const viewAdm = `${BASE_URL}/admin/liftoff/${fakeId}`;
  const viewLO  = `${BASE_URL}/liftoff/${fakeId}`;

  // Shared dummy data
  const submissionPayload: LiftOffEmailPayload = {
    id: fakeId, request_type: "submission", created_at: ago(120),
    submitter_name: "Sarah Mitchell", submitter_nmls: "1234567",
    submitter_email: to, submitter_phone: "(702) 555-0182",
    borrower_first_name: "Marcus", borrower_last_name: "Thompson",
    co_borrower_first_name: "Tanya",
    arive_loan_number: "HCMG-2025-PREVIEW",
    loan_purpose: "purchase", loan_program: "conventional",
    loan_amount: 485000, purchase_price: 545000,
    target_close_date: "2025-10-31", lock_status: "locked",
    special_instructions: "First-time buyer — please prioritize disclosures.",
  };

  const lockPayload: LiftOffEmailPayload = {
    id: fakeId, request_type: "lock_request", created_at: ago(45),
    submitter_name: "Sarah Mitchell", submitter_nmls: "1234567",
    submitter_email: to, submitter_phone: "(702) 555-0182",
    borrower_first_name: "Marcus", borrower_last_name: "Thompson",
    arive_loan_number: "HCMG-2025-PREVIEW",
    loan_purpose: "purchase", loan_program: "conventional",
    loan_amount: 485000, purchase_price: 545000,
    channel_type: "Broker", compensation_type: "Borrower Paid",
    lock_requested_rate: 6.875, lock_requested_price: 99.5,
    lock_requested_lender: "UWM", lock_requested_product: "30-Yr Fixed Conventional",
    lock_period_days: 30, lock_requested_close_date: "2025-10-31",
    lock_lo_notes: "Rush — rate commitment expires today. Please lock ASAP.",
  };

  const helpDeskPayload: LiftOffEmailPayload = {
    id: fakeId, request_type: "loan_help_desk", created_at: ago(30),
    submitter_name: "Sarah Mitchell", submitter_nmls: "1234567",
    submitter_email: to, submitter_phone: "(702) 555-0182",
    borrower_first_name: "Marcus", borrower_last_name: "Thompson",
    arive_loan_number: "HCMG-2025-PREVIEW",
    loan_purpose: "purchase", loan_program: "fha", loan_amount: 295000,
    help_desk_sub_type: "aus_underwriting",
    help_desk_description: "AUS returned Refer/Eligible on DU. Borrower has 680 mid score, 2yr W2 income, stable employment. Would LP give a better result? Guidance needed before we rerun.",
  };

  const baseReq: Record<string, unknown> = {
    id: fakeId, request_type: "submission", request_status: "in_review",
    created_at: ago(120), updated_at: ago(30),
    arive_loan_number: "HCMG-2025-PREVIEW",
    borrower_first_name: "Marcus", borrower_last_name: "Thompson",
    co_borrower_first_name: "Tanya",
    submitter_name: "Sarah Mitchell", submitter_nmls: "1234567",
    submitter_email: to, submitter_phone: "(702) 555-0182",
    loan_purpose: "purchase", loan_program: "conventional",
    loan_amount: 485000, purchase_price: 545000,
    target_close_date: "2025-10-31", lock_status: "locked",
    claimed_by_name: "Jordan Patel",
    team_notes: "All docs verified. Submitted to UW. Approval expected within 48 hrs.",
  };

  const lockReq: Record<string, unknown> = {
    ...baseReq,
    request_type: "lock_request",
    channel_type: "Broker", compensation_type: "Borrower Paid",
    lock_requested_rate: 6.875, lock_requested_price: 99.5,
    lock_requested_lender: "UWM", lock_requested_product: "30-Yr Fixed Conventional",
    lock_period_days: 30, lock_requested_close_date: "2025-10-31",
    lock_lo_notes: "Rush — rate commitment expires today. Please lock ASAP.",
    lock_confirmed_rate: 6.875, lock_confirmed_price: 99.5,
    lock_confirmed_apr: 7.02, lock_confirmed_lock_period: 30,
    lock_confirmed_lock_date: "2025-09-15", lock_confirmed_exp_date: "2025-10-15",
    lock_confirmation_number: "UWM-LOCK-20250915-4471",
    lock_confirmed_lender: "UWM",
    lock_desk_notes: "Locked at requested terms. Confirmation sent to all parties.",
  };

  // Helper: send one email directly to `to`, labelled with what it represents
  async function fireOne(label: string, subject: string, html: string) {
    try {
      await resend.emails.send({ from: FROM, to, subject: `[PREVIEW] ${subject}`, html });
      sent.push(label);
    } catch (e) {
      errors.push(`${label}: ${e}`);
    }
  }

  // 1a — New Request: Submission (normally → processing@hcmgloans.com)
  await fireOne(
    "1a. New Request — Submission (→ processing@)",
    `New Lift Off: Submission — Marcus Thompson · HCMG-2025-PREVIEW`,
    buildProcessingEmail(submissionPayload, viewAdm),
  );
  await delay(150);

  // 1b — New Request: Register + Disclosure (normally → processing@hcmgloans.com)
  await fireOne(
    "1b. New Request — Register + Disclosure (→ processing@)",
    `New Lift Off: Register + Disclosure — Marcus Thompson · HCMG-2025-PREVIEW`,
    buildProcessingEmail({ ...submissionPayload, request_type: "register_disclosure" }, viewAdm),
  );
  await delay(150);

  // 1c — New Request: Disclosure Only (normally → processing@hcmgloans.com)
  await fireOne(
    "1c. New Request — Disclosure Only (→ processing@)",
    `New Lift Off: Disclosure Only — Marcus Thompson · HCMG-2025-PREVIEW`,
    buildProcessingEmail({ ...submissionPayload, request_type: "disclosure_only" }, viewAdm),
  );
  await delay(150);

  // 1d — New Request: Lock Desk (normally → lockdesk@hcmgloans.com)
  await fireOne(
    "1d. New Request — Lock Desk (→ lockdesk@)",
    `🔒 Lock Request — Marcus Thompson · HCMG-2025-PREVIEW`,
    buildLockDeskEmail(lockPayload, viewAdm),
  );
  await delay(150);

  // 1e — New Request: Help Desk (normally → helpdesk@hcmgloans.com)
  await fireOne(
    "1e. New Request — Help Desk (→ helpdesk@)",
    `🛎 Help Desk: Loan Help Desk — Marcus Thompson · HCMG-2025-PREVIEW`,
    buildProcessingEmail(helpDeskPayload, viewAdm),
  );
  await delay(150);

  // 2 — In Flight (normally → LO submitter_email)
  await fireOne(
    "2. In Flight (→ LO)",
    `✈️ In Flight: Submission — Marcus Thompson`,
    buildInFlightEmail({ request: baseReq, processorName: "Jordan Patel", startedAt: ago(30) }, viewLO),
  );
  await delay(150);

  // 3 — Completed (normally → LO submitter_email)
  await fireOne(
    "3. Completed (→ LO)",
    `✅ Completed: Submission — Marcus Thompson`,
    buildCompletedEmail({ request: baseReq, processorName: "Jordan Patel", completedAt: now }, viewLO),
  );
  await delay(150);

  // 4 — Action Required / Incomplete (normally → LO submitter_email)
  await fireOne(
    "4. Action Required (→ LO)",
    `⚠️ Action Required: Submission — Marcus Thompson`,
    buildIncompleteEmail({
      request: baseReq,
      reasons: ["Missing W-2s (both years)", "Bank statements incomplete — need last 2 months"],
      notes: "Please upload the missing documents directly to ARIVE and resubmit through Lift Off.",
      incompleteByName: "Jordan Patel",
      incompleteAt: ago(15),
    }, viewLO),
  );
  await delay(150);

  // 5 — Resubmission (normally → processing@ or lockdesk@)
  await fireOne(
    "5. Resubmission (→ processing@)",
    `↩ Resubmission: Submission — Marcus Thompson`,
    buildResubmissionEmail({
      request: { ...baseReq, id: fakeId, resubmission_of: "original-preview-id" },
      originalRequest: baseReq,
      resubmissionNotes: "Uploaded both W-2s and 2 months bank statements to ARIVE. All items confirmed resolved.",
      resubmittedAt: now,
      confirmedReasons: ["Missing W-2s (both years)", "Bank statements incomplete — need last 2 months"],
    }, viewAdm),
  );
  await delay(150);

  // 6 — Assigned (normally → assignee email)
  await fireOne(
    "6. Assigned to You (→ ops team member)",
    `📋 Assigned to you: Submission — Marcus Thompson`,
    buildAssignedEmail({
      request: baseReq,
      assigneeName: "Jordan Patel",
      assigneeEmail: to,
      assignedByName: "Darius Harris",
      assignedAt: now,
    }, viewAdm),
  );

  return { sent, errors };
}
