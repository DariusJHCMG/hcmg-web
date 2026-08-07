/**
 * POST /api/goal-engine/backfill-production
 * Admin-only. Accepts an array of production records and upserts them
 * into goal_production for the active goal month.
 *
 * Body: {
 *   records: Array<{
 *     lo_email?:      string
 *     lo_name?:       string
 *     loan_id:        string
 *     funded_date?:   string   // YYYY-MM-DD
 *     funded_volume?: number
 *     app_date?:      string
 *     app_volume?:    number
 *   }>
 * }
 *
 * Each record is matched to a profile (email first, then name).
 * Each record is upserted into goal_production using the same
 * merge logic as the Zapier webhook.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

function normDate(v: unknown): string | null {
  if (!v) return null;
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) return s.slice(0, 10);
  const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2,"0")}-${us[2].padStart(2,"0")}`;
  try { const d = new Date(s); if (!isNaN(d.getTime())) return d.toISOString().slice(0,10); } catch { /**/ }
  return null;
}

function normAmount(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : parseFloat(String(v).replace(/[$,]/g, ""));
  return isNaN(n) || n <= 0 ? null : n;
}

type RawRecord = {
  lo_email?:      string;
  lo_name?:       string;
  loan_id:        string;
  funded_date?:   string;
  funded_volume?: number;
  app_date?:      string;
  app_volume?:    number;
};

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile)          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(profile)) return NextResponse.json({ error: "Admin only" },   { status: 403 });

  const body = await req.json();
  const records: RawRecord[] = body.records ?? [];

  if (!Array.isArray(records) || records.length === 0) {
    return NextResponse.json({ error: "records array required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Get active goal month
  const today = new Date().toISOString().slice(0, 10);
  const { data: goalMonth } = await sb
    .from("goal_months")
    .select("id")
    .eq("is_published", true)
    .lte("start_date", today)
    .gte("end_date", today)
    .maybeSingle();

  if (!goalMonth) {
    return NextResponse.json({ error: "No active published goal month found" }, { status: 404 });
  }

  const goalMonthId = goalMonth.id;
  const results = { created: 0, updated: 0, skipped: 0, errors: [] as string[] };

  for (const rec of records) {
    const loanId     = String(rec.loan_id ?? "").trim();
    const loEmail    = String(rec.lo_email ?? "").trim().toLowerCase();
    const loName     = String(rec.lo_name  ?? "").trim();
    const fundedDate = normDate(rec.funded_date);
    const fundedVol  = normAmount(rec.funded_volume);
    const appDate    = normDate(rec.app_date);
    const appVol     = normAmount(rec.app_volume);

    if (!loanId) { results.skipped++; continue; }

    // Resolve LO
    type LO = { id: string };
    let lo: LO | null = null;
    if (loEmail) {
      const { data } = await sb.from("profiles").select("id").eq("email", loEmail).maybeSingle();
      lo = data;
    }
    if (!lo && loName) {
      const { data } = await sb.from("profiles").select("id").ilike("full_name", loName).maybeSingle();
      if (!data && loName) {
        const { data: d2 } = await sb.from("profiles").select("id").ilike("arive_name", loName).maybeSingle();
        lo = d2;
      } else {
        lo = data;
      }
    }
    if (!lo) { results.errors.push(`LO not found: ${loEmail || loName || "unknown"}`); results.skipped++; continue; }

    const isFunded = !!fundedDate || !!fundedVol;

    // Check existing row
    const { data: existing } = await sb
      .from("goal_production")
      .select("id, funded_date, funded_volume, app_date, app_volume, event_type")
      .eq("loan_id", loanId)
      .eq("profile_id", lo.id)
      .maybeSingle();

    if (existing) {
      const merged: Record<string, unknown> = { goal_month_id: goalMonthId };
      if (isFunded) {
        merged.event_type = "funded";
        if (fundedDate) merged.funded_date   = fundedDate;
        if (fundedVol)  merged.funded_volume = fundedVol;
        merged.funded_unit = 1;
        if (!existing.app_date   && appDate) merged.app_date   = appDate;
        if (!existing.app_volume && appVol)  merged.app_volume = appVol;
        if (!existing.app_volume) merged.app_unit = 1;
      } else {
        if (existing.event_type !== "funded") merged.event_type = "application";
        if (appDate) merged.app_date   = appDate;
        if (appVol)  merged.app_volume = appVol;
        merged.app_unit = 1;
      }
      const { error } = await sb.from("goal_production").update(merged).eq("id", existing.id);
      if (error) { results.errors.push(error.message); } else { results.updated++; }
    } else {
      const insert: Record<string, unknown> = {
        profile_id:    lo.id,
        goal_month_id: goalMonthId,
        loan_id:       loanId,
        source:        "backfill",
        event_type:    isFunded ? "funded" : "application",
      };
      if (isFunded) {
        insert.funded_date   = fundedDate;
        insert.funded_volume = fundedVol;
        insert.funded_unit   = 1;
        insert.app_date      = appDate ?? fundedDate;
        insert.app_volume    = appVol ?? fundedVol;
        insert.app_unit      = 1;
      } else {
        insert.app_date    = appDate;
        insert.app_volume  = appVol;
        insert.app_unit    = 1;
        insert.funded_unit = 0;
      }
      const { error } = await sb.from("goal_production").insert(insert);
      if (error) { results.errors.push(error.message); } else { results.created++; }
    }
  }

  return NextResponse.json({
    goal_month_id: goalMonthId,
    total:   records.length,
    created: results.created,
    updated: results.updated,
    skipped: results.skipped,
    errors:  results.errors,
  });
}
