import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendLiftOffNotification } from "@/lib/liftoff-mailer";
import type { LiftOffEmailPayload } from "@/lib/liftoff-mailer";

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Enforce submitter identity from session — never trust client
  const now = new Date().toISOString();
  const payload = {
    ...body,
    submitter_id:    profile.id,
    submitter_name:  profile.full_name,
    submitter_nmls:  profile.nmls   ?? null,
    submitter_email: profile.email  ?? null,
    submitter_phone: profile.phone  ?? null,
    request_status:  "pending",
    created_at:      now,
  };

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("lift_off_requests")
    .insert(payload)
    .select("id, created_at")
    .single();

  if (error) {
    console.error("[liftoff/submit]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    arive_loan_number:  (body.arive_loan_number  as string)  ?? null,
    loan_type:          (body.loan_type           as string)  ?? null,
    loan_amount:        (body.loan_amount         as number)  ?? null,
    purchase_price:     (body.purchase_price      as number)  ?? null,
    target_close_date:  (body.target_close_date   as string)  ?? null,
    lock_status:        (body.lock_status         as string)  ?? null,
    special_instructions: (body.special_instructions as string) ?? null,

    // Lock Request pricing
    lock_requested_rate:        (body.lock_requested_rate        as number) ?? null,
    lock_requested_price:       (body.lock_requested_price       as number) ?? null,
    lock_requested_apr:         (body.lock_requested_apr         as number) ?? null,
    lock_requested_monthly_pmt: (body.lock_requested_monthly_pmt as number) ?? null,
    lock_requested_lender:      (body.lock_requested_lender      as string) ?? null,
    lock_requested_product:     (body.lock_requested_product     as string) ?? null,
    lock_period_days:           (body.lock_period_days           as number) ?? null,
    lock_requested_close_date:  (body.lock_requested_close_date  as string) ?? null,
    lock_lo_notes:              (body.lock_lo_notes              as string) ?? null,
  };

  void sendLiftOffNotification(emailPayload).catch(err =>
    console.error("[liftoff/submit] email notification failed", err),
  );

  return NextResponse.json({ id: data.id }, { status: 201 });
}
