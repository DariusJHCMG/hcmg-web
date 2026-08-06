/**
 * /api/goal-engine/production-corrections
 *
 * GET  — list all corrections (admin only), optionally filtered by goal_month_id
 * POST — create a new production correction event (admin only)
 *
 * Correction types:
 *   manual_add  — admin manually creates a production event
 *   correction  — admin corrects an existing event's values
 *   reversal    — admin reverses/negates a prior event
 *   reassign    — admin reassigns event to a different LO
 *   exclude     — admin marks event as excluded from totals
 *   unexclude   — admin re-includes a previously excluded event
 *
 * NEVER allows Loan Officers to call this endpoint.
 * Every POST requires a reason ≥10 chars.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { getActiveGoal } from "@/lib/goal-engine";

export const dynamic = "force-dynamic";

// ── GET ──────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile)        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(profile)) return NextResponse.json({ error: "Admin only" },  { status: 403 });

  const { searchParams } = new URL(req.url);
  const goalMonthId = searchParams.get("goal_month_id");
  const limit       = Math.min(200, Number(searchParams.get("limit") ?? 100));

  const sb = createServiceClient();

  // Fetch corrections
  let q = sb
    .from("production_corrections")
    .select(`
      *,
      admin:profiles!production_corrections_admin_id_fkey(id, full_name, avatar_url),
      target:profiles!production_corrections_target_profile_id_fkey(id, full_name, avatar_url),
      event:goal_production!production_corrections_event_id_fkey(id, funded_volume, funded_unit, funded_date, app_volume, app_unit, app_date, source, is_excluded, loan_id)
    `)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (goalMonthId) q = q.eq("goal_month_id", goalMonthId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also fetch all production events for the goal (for the admin table)
  let prodQuery = sb
    .from("goal_production")
    .select(`
      *,
      profile:profiles!goal_production_profile_id_fkey(id, full_name, avatar_url, nmls)
    `)
    .order("created_at", { ascending: false })
    .limit(200);

  if (goalMonthId) {
    prodQuery = prodQuery.eq("goal_month_id", goalMonthId);
  } else {
    const goal = await getActiveGoal();
    if (goal) prodQuery = prodQuery.eq("goal_month_id", goal.id);
  }

  const { data: production, error: prodErr } = await prodQuery;

  return NextResponse.json({
    corrections: data ?? [],
    production:  production ?? [],
    prodError:   prodErr?.message ?? null,
  });
}

// ── POST ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile)          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(profile)) return NextResponse.json({ error: "Admin only — Loan Officers cannot modify production data." }, { status: 403 });

  const body = await req.json();
  const {
    correction_type,
    reason,
    goal_month_id,
    target_profile_id,
    loan_id,
    // For manual_add / correction — new values
    funded_volume,
    funded_unit,
    funded_date,
    app_volume,
    app_unit,
    app_date,
    source,
    // For correction / reversal / reassign / exclude — target event
    event_id,
    // For reassign — new LO
    new_profile_id,
  } = body;

  // ── Validation ────────────────────────────────────────────────
  const VALID_TYPES = ["manual_add","correction","reversal","reassign","exclude","unexclude"] as const;
  type CorrectionType = typeof VALID_TYPES[number];

  if (!VALID_TYPES.includes(correction_type)) {
    return NextResponse.json({ error: "Invalid correction_type." }, { status: 400 });
  }
  if (!reason || String(reason).trim().length < 10) {
    return NextResponse.json({ error: "A reason of at least 10 characters is required." }, { status: 400 });
  }
  if (!goal_month_id) {
    return NextResponse.json({ error: "goal_month_id is required." }, { status: 400 });
  }
  if (!target_profile_id && correction_type !== "reassign") {
    return NextResponse.json({ error: "target_profile_id is required." }, { status: 400 });
  }

  const sb = createServiceClient();
  let newEventId = event_id;
  let beforeVal: Record<string, unknown> | null = null;
  let afterVal:  Record<string, unknown> | null = null;

  // ── Fetch existing event if needed ───────────────────────────
  if (event_id && correction_type !== "manual_add") {
    const { data: existing } = await sb
      .from("goal_production")
      .select("*")
      .eq("id", event_id)
      .single();

    if (!existing) {
      return NextResponse.json({ error: "Production event not found." }, { status: 404 });
    }
    beforeVal = existing as Record<string, unknown>;
  }

  // ── Execute the correction ────────────────────────────────────

  if (correction_type === "manual_add") {
    // Insert a brand-new production event
    if (!target_profile_id) return NextResponse.json({ error: "target_profile_id required for manual_add." }, { status: 400 });
    const { data: inserted, error: insErr } = await sb
      .from("goal_production")
      .insert({
        profile_id:     target_profile_id,
        goal_month_id,
        loan_id:        loan_id ?? null,
        funded_volume:  funded_volume ?? null,
        funded_unit:    funded_unit   ?? 0,
        funded_date:    funded_date   ?? null,
        app_volume:     app_volume    ?? null,
        app_unit:       app_unit      ?? 0,
        app_date:       app_date      ?? null,
        source:         source        ?? "manual",
        is_correction:  true,
        correction_type: "manual_add",
        correction_note: reason,
        corrected_by_id: profile.id,
        corrected_at:    new Date().toISOString(),
      })
      .select()
      .single();

    if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });
    newEventId = (inserted as { id: string }).id;
    afterVal   = inserted as Record<string, unknown>;

  } else if (correction_type === "correction") {
    // Update values on an existing event
    if (!event_id) return NextResponse.json({ error: "event_id required for correction." }, { status: 400 });
    const updates: Record<string, unknown> = {
      is_correction:   true,
      correction_type: "correction",
      correction_note: reason,
      corrected_by_id: profile.id,
      corrected_at:    new Date().toISOString(),
    };
    if (funded_volume  !== undefined) updates.funded_volume  = funded_volume;
    if (funded_unit    !== undefined) updates.funded_unit    = funded_unit;
    if (funded_date    !== undefined) updates.funded_date    = funded_date;
    if (app_volume     !== undefined) updates.app_volume     = app_volume;
    if (app_unit       !== undefined) updates.app_unit       = app_unit;
    if (app_date       !== undefined) updates.app_date       = app_date;
    if (loan_id        !== undefined) updates.loan_id        = loan_id;

    const { data: updated, error: updErr } = await sb
      .from("goal_production")
      .update(updates)
      .eq("id", event_id)
      .select()
      .single();

    if (updErr) return NextResponse.json({ error: updErr.message }, { status: 500 });
    afterVal = updated as Record<string, unknown>;

  } else if (correction_type === "reversal") {
    // Insert a mirrored negative event to cancel a prior event
    if (!event_id || !beforeVal) return NextResponse.json({ error: "event_id required for reversal." }, { status: 400 });
    const prev = beforeVal as Record<string, unknown>;
    const { data: reversed, error: revErr } = await sb
      .from("goal_production")
      .insert({
        profile_id:      prev.profile_id,
        goal_month_id,
        loan_id:         loan_id ?? prev.loan_id ?? null,
        funded_volume:   prev.funded_volume  != null ? -(Number(prev.funded_volume))  : null,
        funded_unit:     prev.funded_unit    != null ? -(Number(prev.funded_unit))    : 0,
        funded_date:     prev.funded_date    ?? null,
        app_volume:      prev.app_volume     != null ? -(Number(prev.app_volume))     : null,
        app_unit:        prev.app_unit       != null ? -(Number(prev.app_unit))       : 0,
        app_date:        prev.app_date       ?? null,
        source:          "manual",
        is_correction:   true,
        correction_type: "reversal",
        parent_event_id: event_id,
        correction_note: reason,
        corrected_by_id: profile.id,
        corrected_at:    new Date().toISOString(),
      })
      .select()
      .single();

    if (revErr) return NextResponse.json({ error: revErr.message }, { status: 500 });
    newEventId = (reversed as { id: string }).id;
    afterVal   = reversed as Record<string, unknown>;

  } else if (correction_type === "reassign") {
    // Move event to a different LO
    if (!event_id) return NextResponse.json({ error: "event_id required for reassign." }, { status: 400 });
    if (!new_profile_id) return NextResponse.json({ error: "new_profile_id required for reassign." }, { status: 400 });
    const { data: reassigned, error: raErr } = await sb
      .from("goal_production")
      .update({
        profile_id:      new_profile_id,
        is_correction:   true,
        correction_type: "reassign",
        correction_note: reason,
        corrected_by_id: profile.id,
        corrected_at:    new Date().toISOString(),
      })
      .eq("id", event_id)
      .select()
      .single();

    if (raErr) return NextResponse.json({ error: raErr.message }, { status: 500 });
    afterVal = reassigned as Record<string, unknown>;

  } else if (correction_type === "exclude" || correction_type === "unexclude") {
    if (!event_id) return NextResponse.json({ error: "event_id required for exclude/unexclude." }, { status: 400 });
    const { data: excl, error: exclErr } = await sb
      .from("goal_production")
      .update({
        is_excluded:     correction_type === "exclude",
        is_correction:   true,
        correction_type,
        correction_note: reason,
        corrected_by_id: profile.id,
        corrected_at:    new Date().toISOString(),
      })
      .eq("id", event_id)
      .select()
      .single();

    if (exclErr) return NextResponse.json({ error: exclErr.message }, { status: 500 });
    afterVal = excl as Record<string, unknown>;
  }

  // ── Write audit record ────────────────────────────────────────
  const auditProfileId = (correction_type === "reassign" && new_profile_id)
    ? new_profile_id
    : target_profile_id ?? (beforeVal as Record<string,unknown> | null)?.profile_id;

  const { error: auditErr } = await sb
    .from("production_corrections")
    .insert({
      event_id:          newEventId,
      goal_month_id,
      target_profile_id: auditProfileId,
      admin_id:          profile.id,
      admin_email:       profile.email,
      correction_type:   correction_type as CorrectionType,
      reason:            reason.trim(),
      before_val:        beforeVal,
      after_val:         afterVal,
      loan_id:           loan_id ?? null,
      source:            source ?? "manual",
    });

  if (auditErr) {
    // Audit failure is non-fatal but must be surfaced
    console.error("Audit write failed:", auditErr.message);
  }

  return NextResponse.json({
    success:  true,
    event_id: newEventId,
    audit_written: !auditErr,
  });
}
