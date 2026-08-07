/**
 * POST /api/goal-engine/arive-webhook
 * Native ARIVE outbound webhook receiver.
 *
 * ── ARIVE sends two distinct event types ──────────────────────────────
 *
 *  loan.application_submitted  (or APPLICATION_SUBMITTED / loan_application)
 *  {
 *    event: "loan.application_submitted",
 *    loan: {
 *      id:                  "ARIVE-LN-00012345",   ← REQUIRED for dedup
 *      loanOfficerNmls:     "123456",               ← PREFERRED for LO match
 *      loanOfficerEmail:    "john@hcmgloans.com",   ← fallback
 *      loanOfficerId:       "arive-internal-id",    ← 3rd fallback
 *      loanAmount:          485000,                 ← loan dollar amount
 *      applicationDate:     "2025-07-01",           ← ISO date
 *    }
 *  }
 *
 *  loan.funded  (or LOAN_FUNDED)
 *  {
 *    event: "loan.funded",
 *    loan: {
 *      id:                  "ARIVE-LN-00012345",
 *      loanOfficerNmls:     "123456",
 *      loanOfficerEmail:    "john@hcmgloans.com",
 *      loanAmount:          485000,
 *      fundedDate:          "2025-07-15",           ← when the loan funded
 *      applicationDate:     "2025-07-01",           ← optional: original app date
 *    }
 *  }
 *
 * ── Key design decisions ───────────────────────────────────────────────
 *
 *  ONE ROW PER LOAN PER LO.
 *  We use a single row keyed on (loan_id, profile_id). An application event
 *  writes app_date + app_volume. A funded event MERGES on top of the same
 *  row — adding funded_date + funded_volume WITHOUT touching app fields that
 *  were already set. This means:
 *    - app event arrives first → row has app fields, funded fields null
 *    - funded event arrives later → same row updated to add funded fields
 *    - funded event arrives first (ARIVE skipped app event) → row has funded
 *      fields; app fields filled from fundedDate as best-effort fallback
 *    - same event retried → idempotent update, no change
 *
 *  ARIVE retries: handled — same (loan_id, profile_id) key on every call.
 *  Wrong month: funded_date / app_date matched to goal_months date range,
 *  not "whatever goal is active right now".
 *
 *  event_type column:
 *    'application'  — app event, not yet funded
 *    'funded'       — funded event (may also have app fields)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const SECRET = process.env.ARIVE_WEBHOOK_SECRET ?? "";

/** "YYYY-MM-DD" or null — handles ISO date, ISO datetime, and MM/DD/YYYY */
function normDate(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);
  // MM/DD/YYYY  (common US format)
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2,"0")}-${us[2].padStart(2,"0")}`;
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch { /* ignore */ }
  return null;
}

/** Positive dollar amount or null */
function normAmount(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[$,]/g, ""));
  if (isNaN(n) || n <= 0) return null;
  return n;
}

/** Find the published goal month that contains a given date */
async function findGoalMonth(
  sb: ReturnType<typeof createServiceClient>,
  date: string | null,
): Promise<string | null> {
  if (!date) return null;
  const { data } = await sb
    .from("goal_months")
    .select("id")
    .eq("is_published", true)
    .lte("start_date", date)
    .gte("end_date", date)
    .maybeSingle();
  return data?.id ?? null;
}

/** Fallback: currently active goal */
async function currentGoalMonth(
  sb: ReturnType<typeof createServiceClient>,
): Promise<string | null> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await sb
    .from("goal_months")
    .select("id")
    .eq("is_published", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .maybeSingle();
  return data?.id ?? null;
}

export async function POST(req: NextRequest) {
  const startMs = Date.now();

  // ── 1. Auth ──────────────────────────────────────────────────
  const secret =
    req.headers.get("x-arive-secret") ??
    req.headers.get("x-webhook-secret") ??
    req.headers.get("authorization")?.replace(/^Bearer /i, "") ??
    "";
  if (SECRET && secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse ─────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const sb = createServiceClient();
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  /** Write a log row — fire-and-forget, never throws */
  async function writeLog(fields: Record<string, unknown>) {
    try {
      await sb.from("webhook_log").insert({
        source:          "arive",
        event_type_raw:  String(body.event ?? body.type ?? ""),
        raw_payload:     body,
        ip_address:      ip,
        duration_ms:     Date.now() - startMs,
        ...fields,
      });
    } catch { /* never block the response */ }
  }

  // ── 3. Classify event ────────────────────────────────────────
  const rawEvent = String(body.event ?? body.type ?? "")
    .toLowerCase().replace(/[.\-\s]/g, "_");
  const isFunded = rawEvent.includes("funded");
  const isApp    = rawEvent.includes("application") || rawEvent.includes("submitted");

  if (!isFunded && !isApp) {
    await writeLog({ action: "ignored", event_type: "unknown" });
    return NextResponse.json({ status: "ignored", event: body.event }, { status: 200 });
  }

  // ── 4. Extract loan fields ───────────────────────────────────
  const L = (body.loan ?? body.data ?? body) as Record<string, unknown>;

  const loanId    = String(L.id ?? L.loanId ?? L.loan_id ?? "").trim();
  const loNmls    = String(L.loanOfficerNmls ?? L.lo_nmls ?? L.nmls ?? "")
                      .trim().replace(/[^0-9]/g, "");
  const loEmail   = String(L.loanOfficerEmail ?? L.lo_email ?? "")
                      .trim().toLowerCase();
  const ariveId   = String(L.loanOfficerId ?? L.lo_id ?? "").trim();
  const amount    = normAmount(L.loanAmount ?? L.loan_amount ?? L.amount);
  const fundedDt  = normDate(L.fundedDate ?? L.funded_date ?? L.closeDate ?? L.close_date);
  const appDt     = normDate(
    L.applicationDate ?? L.app_date ?? L.application_date ??
    L.submissionDate  ?? L.submission_date
  );

  if (!loanId) {
    await writeLog({ action: "error", error_message: "loan.id missing", lo_nmls: loNmls || null, lo_email_raw: loEmail || null });
    return NextResponse.json({
      error: "loan.id is required — cannot deduplicate without it.",
      received_keys: Object.keys(L),
    }, { status: 400 });
  }

  // ── 5. Resolve LO ────────────────────────────────────────────
  type LO = { id: string; full_name: string; email: string };
  let lo: LO | null = null;

  if (loNmls) {
    const { data } = await sb.from("profiles").select("id,full_name,email")
      .eq("nmls", loNmls).eq("is_active", true).maybeSingle();
    lo = data;
  }
  if (!lo && loEmail) {
    const { data } = await sb.from("profiles").select("id,full_name,email")
      .eq("email", loEmail).eq("is_active", true).maybeSingle();
    lo = data;
  }
  if (!lo && ariveId) {
    const { data } = await sb.from("profiles").select("id,full_name,email")
      .eq("arive_lo_id", ariveId).eq("is_active", true).maybeSingle();
    lo = data;
  }

  if (!lo) {
    await writeLog({
      action:        "error",
      error_message: "LO not found",
      loan_id:       loanId,
      lo_nmls:       loNmls || null,
      lo_email_raw:  loEmail || null,
      event_type:    isFunded ? "funded" : "application",
      amount,
      event_date:    isFunded ? fundedDt : appDt,
    });
    return NextResponse.json({
      error: "Loan Officer not found. Check NMLS or email matches a SLICE profile.",
      attempted: { loNmls: loNmls || null, loEmail: loEmail || null, ariveId: ariveId || null },
      tip: "Visit /goal-engine/admin/users to verify each LO's NMLS and email.",
    }, { status: 404 });
  }

  // ── 6. Find goal month ───────────────────────────────────────
  const eventDate = isFunded ? (fundedDt ?? appDt) : appDt;
  let goalMonthId = await findGoalMonth(sb, eventDate);
  if (!goalMonthId) goalMonthId = await currentGoalMonth(sb);

  // Look up goal label for log
  let goalLabel: string | null = null;
  if (goalMonthId) {
    const { data: gm } = await sb.from("goal_months").select("month_label").eq("id", goalMonthId).maybeSingle();
    goalLabel = gm?.month_label ?? null;
  }

  // ── 7. Look up existing row ───────────────────────────────────
  const { data: existing } = await sb
    .from("goal_production")
    .select("id, funded_date, funded_volume, funded_unit, app_date, app_volume, app_unit, event_type")
    .eq("loan_id", loanId)
    .eq("profile_id", lo.id)
    .maybeSingle();

  if (existing) {
    const merged: Record<string, unknown> = {
      goal_month_id: goalMonthId,
      raw_payload:   body,
    };

    if (isFunded) {
      merged.event_type   = "funded";
      if (fundedDt) merged.funded_date   = fundedDt;
      if (amount)   merged.funded_volume = amount;
      merged.funded_unit  = 1;
      if (!existing.app_date   && appDt)  merged.app_date   = appDt;
      if (!existing.app_volume && amount) merged.app_volume = amount;
      if (!existing.app_unit || existing.app_unit === 0) merged.app_unit = 1;
    } else {
      if (existing.event_type !== "funded") merged.event_type = "application";
      if (appDt)  merged.app_date   = appDt;
      if (amount) merged.app_volume = amount;
      merged.app_unit = 1;
    }

    const { error } = await sb.from("goal_production").update(merged).eq("id", existing.id);
    if (error) {
      await writeLog({ action: "error", error_message: error.message, loan_id: loanId, lo_matched_id: lo.id, lo_matched_name: lo.full_name, lo_email_raw: loEmail, lo_nmls: loNmls, event_type: isFunded ? "funded" : "application", amount, event_date: isFunded ? fundedDt : appDt, goal_month_id: goalMonthId, goal_month_label: goalLabel });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const resp = { status: "updated", loan_id: loanId, lo: lo.full_name, lo_email: lo.email, goal_month_id: goalMonthId, event: body.event, merged_fields: Object.keys(merged).filter(k => k !== "raw_payload") };
    await writeLog({ action: "updated", loan_id: loanId, lo_matched_id: lo.id, lo_matched_name: lo.full_name, lo_email_raw: loEmail, lo_nmls: loNmls, event_type: isFunded ? "funded" : "application", amount, event_date: isFunded ? fundedDt : appDt, goal_month_id: goalMonthId, goal_month_label: goalLabel, response_body: resp });
    return NextResponse.json(resp);
  }

  // ── 8b. INSERT ───────────────────────────────────────────────
  const insert: Record<string, unknown> = {
    profile_id:    lo.id,
    goal_month_id: goalMonthId,
    loan_id:       loanId,
    source:        "arive_native",
    raw_payload:   body,
  };

  if (isFunded) {
    insert.event_type   = "funded";
    insert.funded_date  = fundedDt;
    insert.funded_volume= amount;
    insert.funded_unit  = 1;
    insert.app_date     = appDt ?? fundedDt;
    insert.app_volume   = amount;
    insert.app_unit     = 1;
  } else {
    insert.event_type   = "application";
    insert.app_date     = appDt;
    insert.app_volume   = amount;
    insert.app_unit     = 1;
    insert.funded_date  = null;
    insert.funded_volume= null;
    insert.funded_unit  = 0;
  }

  const { error } = await sb.from("goal_production").insert(insert);
  if (error) {
    await writeLog({ action: "error", error_message: error.message, loan_id: loanId, lo_matched_id: lo.id, lo_matched_name: lo.full_name, lo_email_raw: loEmail, lo_nmls: loNmls, event_type: insert.event_type, amount, event_date: isFunded ? fundedDt : appDt, goal_month_id: goalMonthId, goal_month_label: goalLabel });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const resp = { status: "created", loan_id: loanId, lo: lo.full_name, lo_email: lo.email, goal_month_id: goalMonthId, event: body.event, event_type: insert.event_type };
  await writeLog({ action: "created", loan_id: loanId, lo_matched_id: lo.id, lo_matched_name: lo.full_name, lo_email_raw: loEmail, lo_nmls: loNmls, event_type: String(insert.event_type), amount, event_date: isFunded ? fundedDt : appDt, goal_month_id: goalMonthId, goal_month_label: goalLabel, response_body: resp });
  return NextResponse.json(resp);
}
