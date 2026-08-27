/**
 * POST /api/liftoff/submit — submit a new LiftOff request (submission, lock request,
 * disclosure, or help desk ticket). Computes SLA deadline, stores the request, and
 * sends notification and confirmation emails.
 * Auth: authenticated user (any role with liftoff access).
 */
import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendLiftOffNotification, sendLiftOffConfirmation } from "@/lib/liftoff-mailer";
import type { LiftOffEmailPayload } from "@/lib/liftoff-mailer";
import { computeSla } from "@/lib/liftoff-sla";
import type { LiftOffRequestType } from "@/lib/database.types";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendPushToQueueUsers } from "@/lib/push";

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // ── Rate limit: 20 submissions per authenticated user per hour ─────────────
  // Prevents a compromised or rogue internal account from bulk-inserting rows.
  // 20/hr is well above any real LO's usage (typical: 2–5 submissions/day).
  const rl = await checkRateLimit(`liftoff:submit:${profile.id}`, 20, 3600);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many submissions. Please wait before submitting again." },
      { status: 429 },
    );
  }

  // ── Idempotency guard ──────────────────────────────────────────────────────
  // The wizard sends a per-attempt UUID in Idempotency-Key.
  // If we already have a completed row for this key (double-click, network retry)
  // we return the existing ID without inserting a duplicate.
  const idempotencyKey = req.headers.get("idempotency-key") ?? null;
  const sb = createServiceClient();

  if (idempotencyKey) {
    const { data: existing } = await sb
      .from("lift_off_requests")
      .select("id, created_at")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ id: existing.id }, { status: 200 });
    }
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Enforce submitter identity from session — never trust client
  const submittedAt = new Date();
  const now = submittedAt.toISOString();
  const slaFields = computeSla(body.request_type as LiftOffRequestType, submittedAt);
  const payload = {
    ...body,
    submitter_id:     profile.id,
    submitter_name:   profile.full_name,
    submitter_nmls:   profile.nmls   ?? null,
    submitter_email:  profile.email  ?? null,
    submitter_phone:  profile.phone  ?? null,
    request_status:   "pending",
    created_at:       now,
    idempotency_key:  idempotencyKey,
    ...slaFields,
  };

  const { data, error } = await sb
    .from("lift_off_requests")
    .insert(payload)
    .select("id, created_at")
    .single();

  if (error) {
    console.error("[liftoff/submit]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // ── Link inline lock request if one was submitted during the wizard ──
  // The slide-over submits a lock_request row using only the ARIVE loan number
  // (parent has no ID yet). Now that the parent has an ID, wire up both sides.
  const ariveLoan = (body.arive_loan_number as string) ?? null;
  const hasInlineLock = body.lock_preference === "lock_requested" && ariveLoan;
  if (hasInlineLock) {
    const { data: lockRow } = await sb
      .from("lift_off_requests")
      .select("id")
      .eq("request_type", "lock_request")
      .eq("arive_loan_number", ariveLoan)
      .eq("submitter_id", profile.id)
      .is("parent_request_id", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lockRow) {
      // Set parent_request_id on the lock row
      void sb
        .from("lift_off_requests")
        .update({ parent_request_id: data.id })
        .eq("id", lockRow.id)
        .then();
      // Set linked_lock_request_id on the parent row
      void sb
        .from("lift_off_requests")
        .update({ linked_lock_request_id: lockRow.id })
        .eq("id", data.id)
        .then();
    }
  }

  // ── Fire notification email (non-blocking — never fail the request over email) ──
  const emailPayload: LiftOffEmailPayload = {
    id:               data.id,
    request_type:     String(body.request_type ?? ""),
    created_at:       data.created_at ?? now,

    submitter_name:   profile.full_name,
    submitter_nmls:   profile.nmls   ?? null,
    submitter_email:  profile.email  ?? null,
    submitter_phone:  profile.phone  ?? null,

    borrower_first_name:    String(body.borrower_first_name ?? ""),
    borrower_last_name:     String(body.borrower_last_name  ?? ""),
    co_borrower_first_name: (body.co_borrower_first_name as string) ?? null,

    arive_loan_number:       (body.arive_loan_number       as string) ?? null,
    arive_deep_link:         (body.arive_deep_link         as string) ?? null,
    loan_type:               (body.loan_type               as string) ?? null,
    loan_amount:             (body.loan_amount             as number) ?? null,
    purchase_price:          (body.purchase_price          as number) ?? null,
    earnest_money_deposit:   (body.earnest_money_deposit   as number) ?? null,
    seller_credit:           (body.seller_credit           as number) ?? null,
    target_close_date:       (body.target_close_date       as string) ?? null,
    lock_status:        (body.lock_status         as string)  ?? null,
    special_instructions: (body.special_instructions as string) ?? null,

    // Lock Request pricing
    lock_requested_rate:       (body.lock_requested_rate       as number) ?? null,
    lock_requested_price:      (body.lock_requested_price      as number) ?? null,
    lock_requested_lender:     (body.lock_requested_lender     as string) ?? null,
    lock_requested_product:    (body.lock_requested_product    as string) ?? null,
    lock_period_days:          (body.lock_period_days          as number) ?? null,
    lock_requested_close_date: (body.lock_requested_close_date as string) ?? null,
    lock_lo_notes:             (body.lock_lo_notes             as string) ?? null,
    channel_type:              (body.channel_type              as string) ?? null,
    compensation_type:         (body.compensation_type         as string) ?? null,

    // Help Desk
    help_desk_sub_type:        (body.help_desk_sub_type        as string) ?? null,
    help_desk_description:     (body.help_desk_description     as string) ?? null,
  };

  // Push notification to ops queue (non-blocking)
  void sendPushToQueueUsers({
    title: "📥 New Lift Off Request",
    body:  `${String(body.borrower_first_name ?? "")} ${String(body.borrower_last_name ?? "")} — submitted by ${profile.full_name}`,
    url:   "/liftoff/queue",
  }).catch(() => {});

  // Notify ops queue via email
  void sendLiftOffNotification(emailPayload).catch(err =>
    console.error("[liftoff/submit] email notification failed", err),
  );
  // Confirm receipt to the LO
  void sendLiftOffConfirmation(emailPayload).catch(err =>
    console.error("[liftoff/submit] confirmation email failed", err),
  );

  return NextResponse.json({ id: data.id }, { status: 201 });
}
