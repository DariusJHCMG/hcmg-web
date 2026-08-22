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
import {
  emailHeader,
  emailFooter,
  emailSection,
  infoRow,
  ctaButton,
  emailWrap,
} from "@/lib/email-templates";

const resend       = new Resend(process.env.RESEND_API_KEY);
const TEST_MODE    = process.env.GOAL_ENGINE_TEST_MODE === "true";
const TEST_EMAIL   = process.env.GOAL_ENGINE_TEST_EMAIL ?? "darius@hcmgloans.com";
const FROM         = "Lift Off · HCMG <noreply@hcmgloans.com>";
const BASE_URL     = process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com";

const LOCK_DESK_EMAIL  = "lockdesk@hcmgloans.com";
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
  lock_requested_apr?:         number | null;
  lock_requested_monthly_pmt?: number | null;
  lock_requested_lender?:      string | null;
  lock_requested_product?:     string | null;
  lock_period_days?:           number | null;
  lock_requested_close_date?:  string | null;
  lock_lo_notes?:              string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  register_disclosure:  "Register + Disclosure",
  disclosure_only:      "Disclosure Only",
  submission:           "Submission",
  restructure_suspense: "Restructure / Suspense",
  lock_request:         "Lock Desk Request",
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

  const pricingRows =
    infoRow("Rate",           r.lock_requested_rate  != null ? `${r.lock_requested_rate}%`  : null) +
    infoRow("Price / Points", r.lock_requested_price != null ? String(r.lock_requested_price) : null) +
    infoRow("APR",            r.lock_requested_apr   != null ? `${r.lock_requested_apr}%`   : null) +
    infoRow("Monthly Pmt",    fmt.money(r.lock_requested_monthly_pmt)) +
    infoRow("Lender",         r.lock_requested_lender) +
    infoRow("Product",        r.lock_requested_product) +
    infoRow("Lock Period",    r.lock_period_days != null ? `${r.lock_period_days} days` : null) +
    infoRow("Req. Close",     fmt.date(r.lock_requested_close_date));

  const loanRows =
    infoRow("ARIVE Loan #",   r.arive_loan_number) +
    infoRow("Loan Type",      r.loan_type) +
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

  return emailWrap(
    emailHeader(
      "Lock Desk · New Request",
      `🔒 Lock Request — ${borrower}${co}`,
      `Submitted ${fmt.ts(r.created_at)} · ARIVE #${r.arive_loan_number ?? "—"}`,
    ) + body + emailFooter(),
  );
}

// ── Processing Request Email ──────────────────────────────────────────────────

function buildProcessingEmail(r: LiftOffEmailPayload, viewUrl: string): string {
  const borrower  = [r.borrower_first_name, r.borrower_last_name].filter(Boolean).join(" ");
  const co        = r.co_borrower_first_name ? ` + ${r.co_borrower_first_name}` : "";
  const typeLabel = TYPE_LABELS[r.request_type] ?? r.request_type;

  const loanRows =
    infoRow("ARIVE Loan #",   r.arive_loan_number) +
    infoRow("Loan Type",      r.loan_type) +
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

  const body = `
    <div style="padding:32px 36px 8px;">
      ${emailSection("Loan Information", loanRows)}
      ${notesSection}
      ${emailSection("Loan Officer", loRows)}
      <div style="margin:24px 0 32px;">
        ${ctaButton("View Request →", viewUrl)}
      </div>
    </div>`;

  return emailWrap(
    emailHeader(
      `Lift Off · ${typeLabel}`,
      `New Request — ${borrower}${co}`,
      `Submitted ${fmt.ts(r.created_at)} · ARIVE #${r.arive_loan_number ?? "—"}`,
    ) + body + emailFooter(),
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
          ✈️ Your Lift Off request is now in flight — ${p.processorName} is working on it now.
        </p>
      </div>
      ${emailSection("Request Details", detailRows)}
      <div style="margin:24px 0 32px;">
        ${ctaButton("View Your Request →", viewUrl)}
      </div>
    </div>`;

  return emailWrap(
    emailHeader(
      "Lift Off · In Flight",
      `✈️ Your request is being processed`,
      `${typeLabel} — ${borrower} · ARIVE #${requestField(r, "arive_loan_number") ?? "—"}`,
    ) + body + emailFooter(),
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
          ✅ Your Lift Off request has been completed by ${p.processorName}.
        </p>
      </div>
      ${emailSection("Request Details", detailRows)}
      ${notesSection}
      <div style="margin:24px 0 32px;">
        ${ctaButton("View Completed Request →", viewUrl)}
      </div>
    </div>`;

  return emailWrap(
    emailHeader(
      "Lift Off · Completed",
      `✅ Request completed`,
      `${typeLabel} — ${borrower} · ARIVE #${requestField(r, "arive_loan_number") ?? "—"}`,
    ) + body + emailFooter(),
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
