/**
 * POST /api/liftoff/starting-now/send
 * Sends a credit repair referral to Starting Now Corporation's Zoho CRM webhook.
 * Creates a starting_now_referrals row, POSTs to Starting Now, and updates the row.
 *
 * Auth: authenticated user session (getVerifiedProfile — server-validated token).
 * NPI: borrower name/email/phone/city/state — only sent after borrower consent confirmed.
 * Credit scores are NEVER sent outbound — only received inbound via /webhook.
 */

import { NextRequest, NextResponse } from "next/server";
import { getVerifiedProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

const STARTING_NOW_URL =
  `https://www.zohoapis.com/crm/v7/functions/referral_partner_webhook/actions/execute` +
  `?auth_type=apikey&zapikey=${process.env.STARTING_NOW_API_KEY ?? ""}`;

export async function POST(req: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: {
    lift_off_request_id: string;
    borrower_email: string;
    borrower_phone: string;
    borrower_city?: string | null;
    borrower_state?: string | null;
    partner_notes?: string | null;
    borrower_consent_confirmed_at: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.lift_off_request_id) {
    return NextResponse.json({ error: "lift_off_request_id is required" }, { status: 400 });
  }
  if (!body.borrower_email?.trim()) {
    return NextResponse.json({ error: "borrower_email is required" }, { status: 400 });
  }
  if (!body.borrower_phone?.trim()) {
    return NextResponse.json({ error: "borrower_phone is required" }, { status: 400 });
  }
  if (!body.borrower_consent_confirmed_at) {
    return NextResponse.json({ error: "borrower_consent_confirmed_at is required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // ── Load the liftoff request — verify submitter owns it (or is admin) ────────
  const { data: liftOffRow, error: liftOffErr } = await sb
    .from("lift_off_requests")
    .select("id, borrower_first_name, borrower_last_name, arive_loan_number, submitter_id")
    .eq("id", body.lift_off_request_id)
    .maybeSingle();

  if (liftOffErr || !liftOffRow) {
    return NextResponse.json({ error: "Lift Off request not found" }, { status: 404 });
  }
  const isAdmin = profile.role === "admin" || profile.role === "developer";
  if (!isAdmin && liftOffRow.submitter_id !== profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Insert referral row with send_status = pending ────────────────────────
  const { data: referral, error: insertErr } = await sb
    .from("starting_now_referrals")
    .insert({
      lift_off_request_id:          body.lift_off_request_id,
      submitter_id:                 profile.id,
      submitter_name:               profile.full_name,
      submitter_email:              profile.email ?? null,
      submitter_nmls:               profile.nmls  ?? null,
      arive_loan_number:            liftOffRow.arive_loan_number ?? null,
      borrower_first_name:          liftOffRow.borrower_first_name,
      borrower_last_name:           liftOffRow.borrower_last_name,
      borrower_email:               body.borrower_email.trim(),
      borrower_phone:               body.borrower_phone.trim(),
      borrower_city:                body.borrower_city  ?? null,
      borrower_state:               body.borrower_state ?? null,
      partner_notes:                body.partner_notes  ?? null,
      borrower_consent_confirmed_at: body.borrower_consent_confirmed_at,
      send_status:                  "pending",
    })
    .select("id")
    .single();

  if (insertErr || !referral) {
    console.error("[starting-now/send] insert failed", insertErr);
    return NextResponse.json({ error: "Failed to create referral record" }, { status: 500 });
  }

  // ── Build Starting Now payload ────────────────────────────────────────────
  // external_crm_contact_id = our referral row id so inbound updates can match back
  const nameParts = profile.full_name.trim().split(/\s+/);
  const partnerFirstName = nameParts[0] ?? "";
  const partnerLastName  = nameParts.slice(1).join(" ") ?? "";

  const snPayload = {
    First_Name:         liftOffRow.borrower_first_name,
    Last_Name:          liftOffRow.borrower_last_name,
    Email:              body.borrower_email.trim(),
    Phone:              body.borrower_phone.trim(),
    Mobile:             body.borrower_phone.trim(),
    City:               body.borrower_city  ?? "",
    State:              body.borrower_state ?? "",
    Partner_First_Name: partnerFirstName,
    Partner_Last_Name:  partnerLastName,
    Partner_Email:      profile.email ?? "",
    Partner_Number:     profile.nmls  ?? "",
    // Default notes to ARIVE loan number so Starting Now always has the file reference
    Partner_Notes:      body.partner_notes?.trim() ||
                        (liftOffRow.arive_loan_number
                          ? `ARIVE: ${liftOffRow.arive_loan_number}`
                          : ""),
    Source:             "HCMG",
    // Our row ID so Starting Now can echo it back in status updates
    External_CRM_Contact_ID: referral.id,
  };

  // ── POST to Starting Now ──────────────────────────────────────────────────
  let sent = false;
  let sendError: string | null = null;
  let sendResponseRaw: Record<string, unknown> | null = null;

  if (!process.env.STARTING_NOW_API_KEY) {
    sendError = "STARTING_NOW_API_KEY is not configured";
  } else {
    try {
      const snRes = await fetch(STARTING_NOW_URL, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(snPayload),
        signal:  AbortSignal.timeout(10_000),
      });
      let rawJson: Record<string, unknown> = {};
      try { rawJson = await snRes.json(); } catch { /* non-JSON response */ }
      sendResponseRaw = rawJson;

      if (snRes.ok) {
        sent = true;
      } else {
        sendError = `Starting Now returned HTTP ${snRes.status}`;
      }
    } catch (e) {
      sendError = e instanceof Error ? e.message : "Network error reaching Starting Now";
    }
  }

  // ── Update referral row with result ──────────────────────────────────────
  await sb.from("starting_now_referrals").update({
    external_crm_contact_id: referral.id,
    send_status:             sent ? "sent" : "failed",
    sent_at:                 sent ? new Date().toISOString() : null,
    send_error:              sendError,
    send_response_raw:       sendResponseRaw,
  }).eq("id", referral.id);

  // Always return 200 — the liftoff request is saved regardless of Starting Now status.
  // The wizard shows a success/warning banner based on the `sent` flag.
  return NextResponse.json({ referral_id: referral.id, sent, error: sendError ?? undefined });
}
