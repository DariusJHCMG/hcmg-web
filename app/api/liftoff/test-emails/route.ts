import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import {
  sendLiftOffNotification,
  sendLiftOffInFlight,
  sendLiftOffCompleted,
  sendLiftOffIncomplete,
  sendLiftOffResubmission,
  sendLiftOffAssigned,
} from "@/lib/liftoff-mailer";

// Admin-only endpoint — fires all 6 Liftoff emails to darius@hcmgloans.com
// with realistic dummy data so the team can proof every template.
// No DB reads or writes. Safe to call repeatedly.

const PREVIEW_EMAIL = "darius@hcmgloans.com";

export async function POST() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "admin" && profile.role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const fakeId   = "preview-00000000-0000-0000-0000-000000000001";
  const now      = new Date().toISOString();
  const minsAgo  = (n: number) => new Date(Date.now() - n * 60_000).toISOString();

  // ── Shared dummy request data ──────────────────────────────────────────────
  const baseRequest: Record<string, unknown> = {
    id:                   fakeId,
    request_type:         "submission",
    request_status:       "in_review",
    created_at:           minsAgo(120),
    updated_at:           minsAgo(30),
    arive_loan_number:    "HCMG-2025-PREVIEW",
    borrower_first_name:  "Marcus",
    borrower_last_name:   "Thompson",
    co_borrower_first_name: "Tanya",
    submitter_name:       "Sarah Mitchell",
    submitter_nmls:       "1234567",
    submitter_email:      PREVIEW_EMAIL,
    submitter_phone:      "(702) 555-0182",
    loan_purpose:         "purchase",
    loan_program:         "conventional",
    loan_amount:          485000,
    purchase_price:       545000,
    target_close_date:    "2025-10-31",
    lock_status:          "locked",
    special_instructions: "First-time buyer — please prioritize disclosures.",
    claimed_by_name:      "Jordan Patel",
    team_notes:           "All docs verified. Submitted to UW. Approval expected within 48 hrs.",
    incomplete_reasons:   ["Missing W-2s (both years)", "Bank statements incomplete — need last 2 months"],
    incomplete_notes:     "Please upload the missing documents to ARIVE and resubmit.",
    incomplete_at:        minsAgo(15),
    incomplete_by_name:   "Jordan Patel",
    resubmission_of:      null,
    has_resubmission:     false,
  };

  const lockRequest: Record<string, unknown> = {
    ...baseRequest,
    request_type:              "lock_request",
    arive_loan_number:         "HCMG-2025-PREVIEW",
    channel_type:              "Broker",
    compensation_type:         "Borrower Paid",
    lock_requested_rate:       6.875,
    lock_requested_price:      99.5,
    lock_requested_lender:     "UWM",
    lock_requested_product:    "30-Yr Fixed Conventional",
    lock_period_days:          30,
    lock_requested_close_date: "2025-10-31",
    lock_lo_notes:             "Rush — rate commitment expires today. Please lock ASAP.",
  };

  const errors: string[] = [];

  // ── Email 1a: New Submission Request → processing@ ─────────────────────────
  await sendLiftOffNotification({
    id: fakeId, request_type: "submission", created_at: minsAgo(120),
    submitter_name: "Sarah Mitchell", submitter_nmls: "1234567",
    submitter_email: PREVIEW_EMAIL, submitter_phone: "(702) 555-0182",
    borrower_first_name: "Marcus", borrower_last_name: "Thompson",
    co_borrower_first_name: "Tanya",
    arive_loan_number: "HCMG-2025-PREVIEW",
    loan_purpose: "purchase", loan_program: "conventional",
    loan_amount: 485000, purchase_price: 545000,
    target_close_date: "2025-10-31", lock_status: "locked",
    special_instructions: "First-time buyer — please prioritize disclosures.",
  }).catch(e => errors.push(`notification/submission: ${e}`));

  // ── Email 1b: New Lock Request → lockdesk@ ────────────────────────────────
  await sendLiftOffNotification({
    id: fakeId, request_type: "lock_request", created_at: minsAgo(45),
    submitter_name: "Sarah Mitchell", submitter_nmls: "1234567",
    submitter_email: PREVIEW_EMAIL, submitter_phone: "(702) 555-0182",
    borrower_first_name: "Marcus", borrower_last_name: "Thompson",
    arive_loan_number: "HCMG-2025-PREVIEW",
    loan_purpose: "purchase", loan_program: "conventional",
    loan_amount: 485000, purchase_price: 545000,
    channel_type: "Broker", compensation_type: "Borrower Paid",
    lock_requested_rate: 6.875, lock_requested_price: 99.5,
    lock_requested_lender: "UWM", lock_requested_product: "30-Yr Fixed Conventional",
    lock_period_days: 30, lock_requested_close_date: "2025-10-31",
    lock_lo_notes: "Rush — rate commitment expires today. Please lock ASAP.",
  }).catch(e => errors.push(`notification/lock: ${e}`));

  // ── Email 1c: New Help Desk Request → helpdesk@ ───────────────────────────
  await sendLiftOffNotification({
    id: fakeId, request_type: "loan_help_desk", created_at: minsAgo(30),
    submitter_name: "Sarah Mitchell", submitter_nmls: "1234567",
    submitter_email: PREVIEW_EMAIL, submitter_phone: "(702) 555-0182",
    borrower_first_name: "Marcus", borrower_last_name: "Thompson",
    arive_loan_number: "HCMG-2025-PREVIEW",
    loan_purpose: "purchase", loan_program: "fha", loan_amount: 295000,
    help_desk_sub_type: "aus_underwriting",
    help_desk_description: "AUS returned Refer/Eligible on DU. Borrower has 680 mid score, 2yr W2 income, stable employment. Would LP give a better result? Guidance needed before we rerun.",
  }).catch(e => errors.push(`notification/helpdesk: ${e}`));

  // ── Email 2: In Flight → LO ───────────────────────────────────────────────
  await sendLiftOffInFlight({ request: baseRequest, processorName: "Jordan Patel", startedAt: minsAgo(30) })
    .catch(e => errors.push(`inflight: ${e}`));

  // ── Email 3: Completed → LO ───────────────────────────────────────────────
  await sendLiftOffCompleted({ request: baseRequest, processorName: "Jordan Patel", completedAt: now })
    .catch(e => errors.push(`completed: ${e}`));

  // ── Email 4: Action Required → LO ────────────────────────────────────────
  await sendLiftOffIncomplete({
    request: baseRequest,
    reasons: ["Missing W-2s (both years)", "Bank statements incomplete — need last 2 months"],
    notes: "Please upload the missing documents directly to ARIVE and resubmit through Lift Off.",
    incompleteByName: "Jordan Patel",
    incompleteAt: minsAgo(15),
  }).catch(e => errors.push(`incomplete: ${e}`));

  // ── Email 5: Resubmission → processing@ ──────────────────────────────────
  await sendLiftOffResubmission({
    request: { ...baseRequest, id: fakeId, resubmission_of: "original-preview-id" },
    originalRequest: baseRequest,
    resubmissionNotes: "Uploaded both W-2s and 2 months bank statements to ARIVE. All items confirmed resolved.",
    resubmittedAt: now,
    confirmedReasons: ["Missing W-2s (both years)", "Bank statements incomplete — need last 2 months"],
  }).catch(e => errors.push(`resubmission: ${e}`));

  // ── Email 6: Assigned → ops team member ──────────────────────────────────
  await sendLiftOffAssigned({
    request: baseRequest,
    assigneeName:   "Jordan Patel",
    assigneeEmail:  PREVIEW_EMAIL,
    assignedByName: "Darius Harris",
    assignedAt:     now,
  }).catch(e => errors.push(`assigned: ${e}`));

  return NextResponse.json({
    ok: true,
    sent: 6,
    sent_to: PREVIEW_EMAIL,
    emails: [
      "1a. New Request — Submission (→ processing@)",
      "1b. New Request — Lock Desk (→ lockdesk@)",
      "1c. New Request — Help Desk (→ helpdesk@)",
      "2.  In Flight (→ LO)",
      "3.  Completed (→ LO)",
      "4.  Action Required / Incomplete (→ LO)",
      "5.  Resubmission (→ processing@)",
      "6.  Assigned to You (→ ops member)",
    ],
    errors: errors.length ? errors : undefined,
  });
}
