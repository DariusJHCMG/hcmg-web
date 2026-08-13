/**
 * POST /api/goal-engine/zapier-sync
 * Zapier scheduled sync — keeps app_volume / funded_volume current from ARIVE.
 *
 * Use this for the "ARIVE Hourly Update" zap that pulls fresh loan details
 * from ARIVE and posts them back here so SLICE always reflects the latest
 * loan amount, even after a loan amount changes post-application.
 *
 * This endpoint ALWAYS overwrites app_volume and funded_volume with whatever
 * ARIVE currently reports — unlike the one-shot /zapier route which only sets
 * values on first insert. Use this for syncing; use /zapier for new events.
 *
 * Zapier field mapping (snake_case preferred):
 * {
 *   lo_nmls:         "123456"         ← preferred LO identifier
 *   lo_email:        "john@..."       ← fallback
 *   loan_id:         "17365494"       ← REQUIRED
 *
 *   // Application fields (always send — ARIVE "Total Loan Amount" for apps):
 *   app_date?:       "2026-08-01"     ← ARIVE: App/TRID Completed Date
 *   app_volume?:     258750           ← ARIVE: Total Loan Amount (app)
 *
 *   // Funded fields (send only when loan is funded):
 *   funded_date?:    "2026-08-31"     ← ARIVE: Loan Funded Date
 *   funded_volume?:  258750           ← ARIVE: Total Loan Amount (funded)
 *
 *   // IMPORTANT: map funded_volume and app_volume to SEPARATE Zapier fields.
 *   // Do NOT use a single loan_amount for both — it makes funded vs app
 *   // disambiguation impossible.
 * }
 *
 * Auth: x-zapier-secret header (same secret as /zapier route)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const ZAPIER_SECRET = process.env.ZAPIER_WEBHOOK_SECRET ?? "";

function normDate(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2,"0")}-${us[2].padStart(2,"0")}`;
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch { /* ignore */ }
  return null;
}

function normAmount(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[$,]/g, ""));
  return isNaN(n) || n <= 0 ? null : n;
}

export async function POST(req: NextRequest) {
  const startMs = Date.now();

  // ── 1. Auth ──────────────────────────────────────────────────
  const authHeader = req.headers.get("x-zapier-secret");
  if (ZAPIER_SECRET && authHeader !== ZAPIER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse ─────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const sb = createServiceClient();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  async function writeLog(fields: Record<string, unknown>) {
    try {
      await sb.from("webhook_log").insert({
        source:         "zapier_sync",
        event_type_raw: "loan_sync",
        raw_payload:    body,
        ip_address:     ip,
        duration_ms:    Date.now() - startMs,
        ...fields,
      });
    } catch { /* never block response */ }
  }

  // ── 3. Extract fields ─────────────────────────────────────────
  // NOTE: funded_volume and app_volume must be mapped to SEPARATE Zapier fields.
  // Only fall back to a generic loan_amount when the specific field is absent,
  // and only do so if the presence of funded_date makes the context unambiguous.
  const loNmls     = String(body.lo_nmls   ?? body.loNmls   ?? "").trim().replace(/[^0-9]/g, "");
  const loEmail    = String(body.lo_email  ?? body.loEmail  ?? "").trim().toLowerCase();
  const loanId     = String(body.loan_id   ?? body.loanId   ?? "").trim();
  const appDate    = normDate(body.app_date    ?? body.appDate    ?? body.application_date);
  const fundedDate = normDate(body.funded_date ?? body.fundedDate ?? body.close_date ?? body.closeDate);

  // Resolve amounts — prefer the dedicated field; only use generic loan_amount
  // as a fallback when no dedicated field is provided at all.
  const genericAmount = normAmount(body.loan_amount ?? body.loanAmount);
  const appVol    = normAmount(body.app_volume    ?? body.appVolume)    ?? (!fundedDate ? genericAmount : null);
  const fundedVol = normAmount(body.funded_volume ?? body.fundedVolume) ?? ( fundedDate ? genericAmount : null);

  // A loan is funded if ARIVE sent a funded_date.
  // Do NOT infer funding from fundedVol alone — amounts are ambiguous.
  const isFunded = !!fundedDate;

  if (!loanId) {
    await writeLog({ action: "error", error_message: "loan_id missing" });
    return NextResponse.json({ error: "loan_id is required." }, { status: 400 });
  }
  if (!loNmls && !loEmail) {
    await writeLog({ action: "error", error_message: "no LO identifier", loan_id: loanId });
    return NextResponse.json({ error: "lo_nmls or lo_email required." }, { status: 400 });
  }

  // ── 4. Resolve LO ────────────────────────────────────────────
  type LO = { id: string; full_name: string };
  let lo: LO | null = null;
  if (loNmls) {
    const { data } = await sb.from("profiles").select("id,full_name").eq("nmls", loNmls).maybeSingle();
    lo = data;
  }
  if (!lo && loEmail) {
    const { data } = await sb.from("profiles").select("id,full_name").eq("email", loEmail).maybeSingle();
    lo = data;
  }
  if (!lo) {
    await writeLog({ action: "error", error_message: "LO not found", loan_id: loanId, lo_nmls: loNmls || null, lo_email_raw: loEmail || null });
    return NextResponse.json({ error: "Loan Officer not found.", attempted: { loNmls, loEmail } }, { status: 404 });
  }

  // ── 5. Find goal month by date ────────────────────────────────
  const eventDate = fundedDate ?? appDate;
  let goalMonthId: string | null = null;
  if (eventDate) {
    const { data } = await sb.from("goal_months").select("id").lte("start_date", eventDate).gte("end_date", eventDate).maybeSingle();
    goalMonthId = data?.id ?? null;
  }
  if (!goalMonthId) {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await sb.from("goal_months").select("id").lte("start_date", today).gte("end_date", today).maybeSingle();
    goalMonthId = data?.id ?? null;
  }
  let goalLabel: string | null = null;
  if (goalMonthId) {
    const { data: gm } = await sb.from("goal_months").select("month_label").eq("id", goalMonthId).maybeSingle();
    goalLabel = gm?.month_label ?? null;
  }

  // ── 6. Upsert — always overwrite amounts from ARIVE ──────────
  const { data: existing } = await sb.from("goal_production")
    .select("id, event_type, app_volume, funded_volume, app_date, funded_date")
    .eq("loan_id", loanId)
    .eq("profile_id", lo.id)
    .maybeSingle();

  // Snapshot previous values before overwriting so the log shows before → after
  const previousValue = existing ? {
    app_volume:    existing.app_volume    ?? null,
    funded_volume: existing.funded_volume ?? null,
    app_date:      existing.app_date      ?? null,
    funded_date:   existing.funded_date   ?? null,
    event_type:    existing.event_type    ?? null,
  } : null;

  // "amount" for the log: the value being written for the primary event type
  const logAmount = isFunded ? (fundedVol ?? appVol) : appVol;

  const logBase = {
    loan_id:          loanId,
    lo_matched_id:    lo.id,
    lo_matched_name:  lo.full_name,
    lo_nmls:          loNmls || null,
    lo_email_raw:     loEmail || null,
    event_type:       isFunded ? "funded" : "application",
    amount:           logAmount,
    event_date:       fundedDate ?? appDate,
    goal_month_id:    goalMonthId,
    goal_month_label: goalLabel,
    previous_value:   previousValue,
  };

  if (existing) {
    // Always overwrite amounts — this is the sync path
    const update: Record<string, unknown> = { goal_month_id: goalMonthId };
    if (isFunded) {
      update.event_type    = "funded";
      update.funded_date   = fundedDate;
      if (fundedVol != null) update.funded_volume = fundedVol;
      update.funded_unit   = 1;
      // Only update app fields if ARIVE provided them — never blank them out
      if (appDate)         update.app_date   = appDate;
      if (appVol != null)  update.app_volume = appVol;
      if (appDate || appVol != null) update.app_unit = 1;
    } else {
      // Application-only sync: never downgrade a funded loan
      if (existing.event_type !== "funded") update.event_type = "application";
      if (appDate)         update.app_date   = appDate;
      if (appVol != null)  update.app_volume = appVol;  // ← always overwrites with fresh ARIVE value
      if (appDate || appVol != null) update.app_unit = 1;
    }
    const { error } = await sb.from("goal_production").update(update).eq("id", existing.id);
    if (error) {
      await writeLog({ ...logBase, action: "error", error_message: error.message });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    const updatedFields = Object.keys(update).filter(k => k !== "goal_month_id");
    const resp = {
      status: "synced",
      loan_id: loanId,
      lo: lo.full_name,
      goal_month_id: goalMonthId,
      updated_fields: updatedFields,
      // Include new values in response so the log captures before → after
      new_values: {
        app_volume:    appVol    ?? existing.app_volume,
        funded_volume: fundedVol ?? existing.funded_volume,
      },
    };
    await writeLog({ ...logBase, action: "updated", response_body: resp });
    return NextResponse.json(resp);
  }

  // New loan — insert it
  const insert: Record<string, unknown> = { profile_id: lo.id, goal_month_id: goalMonthId, loan_id: loanId, source: "zapier_sync" };
  if (isFunded) {
    insert.event_type    = "funded";
    insert.funded_date   = fundedDate;
    if (fundedVol != null) insert.funded_volume = fundedVol;
    insert.funded_unit   = 1;
    insert.app_date      = appDate ?? fundedDate;
    if (appVol != null)  insert.app_volume = appVol;
    else if (fundedVol != null) insert.app_volume = fundedVol;
    insert.app_unit      = 1;
  } else {
    insert.event_type  = "application";
    insert.app_date    = appDate;
    if (appVol != null) insert.app_volume = appVol;
    insert.app_unit    = 1;
    insert.funded_unit = 0;
  }
  const { error } = await sb.from("goal_production").insert(insert);
  if (error) {
    await writeLog({ ...logBase, action: "error", error_message: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const resp = { status: "created", loan_id: loanId, lo: lo.full_name, goal_month_id: goalMonthId, event_type: insert.event_type };
  await writeLog({ ...logBase, action: "created", response_body: resp });
  return NextResponse.json(resp);
}
