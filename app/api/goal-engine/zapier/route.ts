/**
 * POST /api/goal-engine/zapier
 * Zapier webhook — receives production data from ARIVE via Zapier.
 *
 * Zapier creates ONE zap per event type. You need two zaps:
 *   Zap 1: ARIVE "Loan Funded"               → POST here with funded fields
 *   Zap 2: ARIVE "Application Submitted"     → POST here with app fields
 *
 * Zapier field mapping (snake_case preferred, camelCase also accepted):
 * {
 *   lo_nmls:        "123456"          ← REQUIRED (preferred) — NMLS is most reliable
 *   lo_email:       "john@..."        ← fallback if no NMLS
 *   loan_id:        "ARIVE-LN-00012"  ← REQUIRED for deduplication
 *
 *   // For "Loan Funded" zap:
 *   funded_date:    "2025-07-15"      ← ARIVE: Close Date / Funded Date
 *   funded_volume:  485000            ← ARIVE: Loan Amount
 *   funded_unit:    1                 ← hard-code 1 in Zapier
 *
 *   // For "Application Submitted" zap:
 *   app_date:       "2025-07-01"      ← ARIVE: Application Date
 *   app_volume:     485000            ← ARIVE: Loan Amount
 *   app_unit:       1                 ← hard-code 1
 * }
 *
 * ONE ROW PER LOAN PER LO: same merge logic as arive-webhook.
 * A funded event never overwrites previously-set app fields, and vice versa.
 * Same loan_id + same LO = update in place (idempotent).
 * Date-based goal month matching: funded_date / app_date → correct month's goal.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

const ZAPIER_SECRET = process.env.ZAPIER_WEBHOOK_SECRET ?? "";

/** "YYYY-MM-DD" or null */
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

/** Positive dollar amount or null */
function normAmount(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[$,]/g, ""));
  if (isNaN(n) || n <= 0) return null;
  return n;
}

export async function POST(req: NextRequest) {
  // ── 1. Auth ──────────────────────────────────────────────────
  const authHeader = req.headers.get("x-zapier-secret");
  if (ZAPIER_SECRET && authHeader !== ZAPIER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ── 2. Parse ─────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // ── 3. Extract fields — accept snake_case and camelCase ───────
  const loNmls     = String(body.lo_nmls    ?? body.loNmls    ?? "").trim().replace(/[^0-9]/g, "");
  const loEmail    = String(body.lo_email   ?? body.loEmail   ?? "").trim().toLowerCase();
  const loanId     = String(body.loan_id    ?? body.loanId    ?? "").trim();
  const fundedDate = normDate(body.funded_date  ?? body.fundedDate  ?? body.close_date ?? body.closeDate);
  const fundedVol  = normAmount(body.funded_volume ?? body.fundedVolume ?? body.loanAmount ?? body.loan_amount);
  const appDate    = normDate(body.app_date ?? body.appDate ?? body.application_date ?? body.applicationDate);
  const appVol     = normAmount(body.app_volume ?? body.appVolume ?? body.loanAmount ?? body.loan_amount);

  // Determine event type from which date fields are present
  // (Zapier sends only the fields that belong to its trigger)
  const isFundedEvent = !!fundedDate || !!fundedVol;
  const isAppEvent    = !!appDate    || !!appVol;

  if (!isFundedEvent && !isAppEvent) {
    return NextResponse.json({
      error: "Could not determine event type. Provide funded_date+funded_volume OR app_date+app_volume.",
    }, { status: 400 });
  }

  if (!loNmls && !loEmail) {
    return NextResponse.json({
      error: "lo_nmls or lo_email required to identify the Loan Officer.",
      tip: "Map ARIVE 'Loan Officer NMLS' to lo_nmls in Zapier (preferred).",
    }, { status: 400 });
  }

  if (!loanId) {
    return NextResponse.json({
      error: "loan_id required for deduplication.",
      tip: "Map ARIVE 'Loan ID' to loan_id in Zapier.",
    }, { status: 400 });
  }

  const sb = createServiceClient();

  // ── 4. Resolve LO profile ─────────────────────────────────────
  type LO = { id: string; full_name: string };
  let lo: LO | null = null;

  if (loNmls) {
    const { data } = await sb.from("profiles").select("id,full_name")
      .eq("nmls", loNmls).eq("is_active", true).maybeSingle();
    lo = data;
  }
  if (!lo && loEmail) {
    const { data } = await sb.from("profiles").select("id,full_name")
      .eq("email", loEmail).eq("is_active", true).maybeSingle();
    lo = data;
  }

  if (!lo) {
    return NextResponse.json({
      error: "Loan Officer not found in SLICE.",
      attempted: { loNmls: loNmls || null, loEmail: loEmail || null },
      tip: "Check /goal-engine/admin/users — verify NMLS and email match ARIVE.",
    }, { status: 404 });
  }

  // ── 5. Find the correct goal month by date ────────────────────
  const eventDate = fundedDate ?? appDate;
  let goalMonthId: string | null = null;

  if (eventDate) {
    const { data } = await sb.from("goal_months").select("id")
      .eq("is_published", true)
      .lte("start_date", eventDate)
      .gte("end_date", eventDate)
      .maybeSingle();
    goalMonthId = data?.id ?? null;
  }
  // Fallback to currently active goal
  if (!goalMonthId) {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await sb.from("goal_months").select("id")
      .eq("is_published", true)
      .lte("start_date", today)
      .gte("end_date", today)
      .maybeSingle();
    goalMonthId = data?.id ?? null;
  }

  // ── 6. Look up existing row (loan_id, profile_id) ─────────────
  const { data: existing } = await sb
    .from("goal_production")
    .select("id, funded_date, funded_volume, funded_unit, app_date, app_volume, app_unit, event_type")
    .eq("loan_id", loanId)
    .eq("profile_id", lo.id)
    .maybeSingle();

  if (existing) {
    // ── 7a. UPDATE — merge, never blindly overwrite ───────────
    const merged: Record<string, unknown> = {
      goal_month_id: goalMonthId,
      raw_payload:   body,
    };

    if (isFundedEvent) {
      merged.event_type = "funded";
      if (fundedDate) merged.funded_date   = fundedDate;
      if (fundedVol)  merged.funded_volume = fundedVol;
      merged.funded_unit = 1;
      // Preserve existing app fields — only fill if not already set
      if (!existing.app_date   && appDate) merged.app_date   = appDate;
      if (!existing.app_volume && appVol)  merged.app_volume = appVol;
      if (!existing.app_unit || existing.app_unit === 0) merged.app_unit = 1;
    } else {
      // App-only event — don't overwrite funded fields
      if (existing.event_type !== "funded") merged.event_type = "application";
      if (appDate) merged.app_date   = appDate;
      if (appVol)  merged.app_volume = appVol;
      merged.app_unit = 1;
    }

    const { error } = await sb.from("goal_production").update(merged).eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      status:        "updated",
      loan_id:       loanId,
      lo:            lo.full_name,
      goal_month_id: goalMonthId,
      merged_fields: Object.keys(merged).filter(k => k !== "raw_payload"),
    });
  }

  // ── 7b. INSERT — new row ──────────────────────────────────────
  const insert: Record<string, unknown> = {
    profile_id:    lo.id,
    goal_month_id: goalMonthId,
    loan_id:       loanId,
    source:        "zapier",
    raw_payload:   body,
  };

  if (isFundedEvent) {
    insert.event_type   = "funded";
    insert.funded_date  = fundedDate;
    insert.funded_volume= fundedVol;
    insert.funded_unit  = 1;
    // Best-effort app fields
    insert.app_date     = appDate ?? fundedDate;
    insert.app_volume   = appVol  ?? fundedVol;
    insert.app_unit     = 1;
  } else {
    insert.event_type   = "application";
    insert.app_date     = appDate;
    insert.app_volume   = appVol;
    insert.app_unit     = 1;
    insert.funded_date  = null;
    insert.funded_volume= null;
    insert.funded_unit  = 0;
  }

  const { error } = await sb.from("goal_production").insert(insert);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    status:        "created",
    loan_id:       loanId,
    lo:            lo.full_name,
    goal_month_id: goalMonthId,
    event_type:    insert.event_type,
  });
}
