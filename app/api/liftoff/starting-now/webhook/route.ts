/**
 * POST /api/liftoff/starting-now/webhook
 * Inbound webhook — Starting Now POSTs client status updates here.
 * Matches the update to a starting_now_referrals row, updates current status,
 * credit scores, follow-up date, notes, opt-out channels, and appends to history.
 *
 * Auth: Bearer token (STARTING_NOW_WEBHOOK_SECRET) — configured on both sides.
 * Public endpoint — no user session required.
 *
 * GLBA / NPI note: credit scores received here are stored in the DB only.
 * They must NOT appear in any email notification body.
 * If opt_out contains "SMS", the matching lead's sms_consent is set to false.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import type { StartingNowStatusHistoryEntry } from "@/lib/database.types";

const WEBHOOK_SECRET = process.env.STARTING_NOW_WEBHOOK_SECRET ?? "";

interface StartingNowPayload {
  external_crm_contact_id?: string;
  startingnow_id?: string;
  email?: string;
  phone?: string;
  status?: string;
  follow_up_date?: string | null;
  experian?: string | null;
  equifax?: string | null;
  transunion?: string | null;
  notes?: string | null;
  opt_out?: string[];
}

export async function POST(req: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  // In production the secret MUST be set — an empty secret means open access.
  // We enforce this strictly: if secret is not configured, reject ALL requests.
  if (!WEBHOOK_SECRET) {
    console.error("[starting-now/webhook] STARTING_NOW_WEBHOOK_SECRET is not set — rejecting all inbound requests");
    return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
  }
  const incoming =
    req.headers.get("authorization")?.replace(/^Bearer /i, "") ??
    req.headers.get("x-webhook-secret") ??
    "";
  if (incoming !== WEBHOOK_SECRET) {
    console.warn("[starting-now/webhook] auth failed — invalid secret", {
      ip: req.headers.get("x-forwarded-for") ?? "unknown",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: StartingNowPayload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!payload.status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // ── Find referral row — try external_crm_contact_id first, then startingnow_id
  let referral: { id: string; borrower_email: string | null; status_history_json: StartingNowStatusHistoryEntry[] | null; experian: string | null; equifax: string | null; transunion: string | null; startingnow_id: string | null } | null = null;

  if (payload.external_crm_contact_id) {
    const { data } = await sb
      .from("starting_now_referrals")
      .select("id, borrower_email, status_history_json, experian, equifax, transunion, startingnow_id")
      .eq("external_crm_contact_id", payload.external_crm_contact_id)
      .maybeSingle();
    referral = data;
  }

  if (!referral && payload.startingnow_id) {
    const { data } = await sb
      .from("starting_now_referrals")
      .select("id, borrower_email, status_history_json, experian, equifax, transunion, startingnow_id")
      .eq("startingnow_id", payload.startingnow_id)
      .maybeSingle();
    referral = data;
  }

  if (!referral) {
    // Return 200 — don't let Starting Now retry forever for a genuinely unknown record
    console.warn("[starting-now/webhook] referral not found", {
      external_crm_contact_id: payload.external_crm_contact_id,
      startingnow_id:          payload.startingnow_id,
    });
    return NextResponse.json({ received: true, matched: false });
  }

  // ── Append to status history ──────────────────────────────────────────────
  const historyEntry: StartingNowStatusHistoryEntry = {
    status:         payload.status,
    updated_at:     new Date().toISOString(),
    experian:       payload.experian       ?? null,
    equifax:        payload.equifax        ?? null,
    transunion:     payload.transunion     ?? null,
    notes:          payload.notes          ?? null,
    follow_up_date: payload.follow_up_date ?? null,
  };

  const existingHistory: StartingNowStatusHistoryEntry[] =
    Array.isArray(referral.status_history_json) ? referral.status_history_json : [];
  const newHistory = [...existingHistory, historyEntry];

  // ── Update referral row ───────────────────────────────────────────────────
  await sb.from("starting_now_referrals").update({
    // Populate Starting Now's ID if we now have it
    startingnow_id:      payload.startingnow_id ?? referral.startingnow_id,
    current_status:      payload.status,
    follow_up_date:      payload.follow_up_date  ?? null,
    // Keep existing scores if Starting Now sends nulls (they may omit unchanged scores)
    experian:            payload.experian   ?? referral.experian,
    equifax:             payload.equifax    ?? referral.equifax,
    transunion:          payload.transunion ?? referral.transunion,
    latest_notes:        payload.notes      ?? null,
    opt_out:             payload.opt_out    ?? [],
    last_update_at:      new Date().toISOString(),
    status_history_json: newHistory,
  }).eq("id", referral.id);

  // ── GLBA / TCPA: propagate SMS opt-out back to leads table ───────────────
  // If Starting Now reports the borrower opted out of SMS, honour it in our leads
  // table so HCMG doesn't continue sending SMS to an opted-out consumer.
  const optOutChannels = (payload.opt_out ?? []).map(c => c.toLowerCase());
  if (optOutChannels.includes("sms")) {
    const emailToMatch = payload.email ?? referral.borrower_email;
    if (emailToMatch) {
      await sb
        .from("leads")
        .update({ sms_consent: false })
        .ilike("email", emailToMatch);
    }
  }

  return NextResponse.json({ received: true, matched: true });
}
