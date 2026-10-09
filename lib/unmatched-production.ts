/**
 * lib/unmatched-production.ts
 *
 * Shared helpers for the unmatched-LO production staging flow.
 *
 * When a Zap / ARIVE webhook fires for an LO not yet in SLICE:
 *   storeUnmatched()  — saves the event to unmatched_production
 *
 * When an LO profile is later created/matched:
 *   promoteUnmatched() — moves their staged rows into goal_production
 */

import { createServiceClient } from "./supabase";

type UnmatchedPayload = {
  lo_nmls?:      string | null;
  lo_email?:     string | null;
  lo_name?:      string | null;
  lo_arive_id?:  string | null;
  loan_id:       string;
  source:        "zapier" | "arive_native" | "zapier_sync";
  event_type:    "application" | "funded";
  funded_date?:  string | null;
  funded_volume?:number | null;
  app_date?:     string | null;
  app_volume?:   number | null;
  goal_month_id?:string | null;
  raw_payload?:  Record<string, unknown>;
};

/** Save a production event for an unrecognised LO so it can be matched later. */
export async function storeUnmatched(payload: UnmatchedPayload): Promise<void> {
  const sb = createServiceClient();
  try {
    await sb.from("unmatched_production").upsert(
      {
        lo_nmls:       payload.lo_nmls       ?? null,
        lo_email:      payload.lo_email      ?? null,
        lo_name:       payload.lo_name       ?? null,
        lo_arive_id:   payload.lo_arive_id   ?? null,
        loan_id:       payload.loan_id,
        source:        payload.source,
        event_type:    payload.event_type,
        funded_date:   payload.funded_date   ?? null,
        funded_volume: payload.funded_volume ?? null,
        funded_unit:   payload.event_type === "funded" ? 1 : 0,
        app_date:      payload.app_date      ?? null,
        app_volume:    payload.app_volume    ?? null,
        app_unit:      (payload.app_date || payload.app_volume) ? 1 : 0,
        goal_month_id: payload.goal_month_id ?? null,
        raw_payload:   payload.raw_payload   ?? null,
        promoted:      false,
      },
      // Deduplicate on loan_id + event_type so re-fired Zaps don't duplicate
      { onConflict: "loan_id,event_type,lo_email,lo_nmls,lo_arive_id", ignoreDuplicates: true }
    );
  } catch {
    // Never block the webhook response — staging is best-effort
  }
}

/**
 * Promote all unmatched rows for a profile to goal_production.
 * Called after an LO is added to SLICE (by email, NMLS, or ARIVE ID).
 * Returns the number of rows promoted.
 */
export async function promoteUnmatched(
  profileId: string,
  email?:    string | null,
  nmls?:     string | null,
  ariveId?:  string | null,
): Promise<number> {
  const sb = createServiceClient();

  // Find all unmatched rows that could belong to this profile
  const orClauses: string[] = [];
  if (email)   orClauses.push(`lo_email.eq.${email}`);
  if (nmls)    orClauses.push(`lo_nmls.eq.${nmls}`);
  if (ariveId) orClauses.push(`lo_arive_id.eq.${ariveId}`);
  if (orClauses.length === 0) return 0;

  const { data: rows } = await sb
    .from("unmatched_production")
    .select("*")
    .eq("promoted", false)
    .or(orClauses.join(","));

  if (!rows || rows.length === 0) return 0;

  // Load all goal months once for date matching
  const { data: months } = await sb
    .from("goal_months")
    .select("id, start_date, end_date")
    .eq("is_published", true);

  function matchMonth(date: string | null): string | null {
    if (!date || !months) return null;
    const d = date.slice(0, 10);
    const m = months.find(m => m.start_date.slice(0,10) <= d && m.end_date.slice(0,10) >= d);
    return m?.id ?? null;
  }

  let promoted = 0;

  for (const row of rows) {
    const goalMonthId = row.goal_month_id
      ?? matchMonth(row.funded_date ?? row.app_date);

    // Check if this loan already exists in goal_production for this LO
    const { data: existing } = await sb
      .from("goal_production")
      .select("id, event_type, funded_volume, app_volume")
      .eq("loan_id", row.loan_id)
      .eq("profile_id", profileId)
      .maybeSingle();

    if (existing) {
      // Merge — same logic as the live webhooks
      const update: Record<string, unknown> = { goal_month_id: goalMonthId };
      if (row.event_type === "funded") {
        update.event_type    = "funded";
        if (row.funded_date)   update.funded_date   = row.funded_date;
        if (row.funded_volume) update.funded_volume = row.funded_volume;
        update.funded_unit = 1;
        if (!existing.app_volume && row.app_volume) update.app_volume = row.app_volume;
      } else {
        if (existing.event_type !== "funded") update.event_type = "application";
        if (row.app_date)   update.app_date   = row.app_date;
        if (row.app_volume) update.app_volume = row.app_volume;
        update.app_unit = 1;
      }
      await sb.from("goal_production").update(update).eq("id", existing.id);
    } else {
      // Insert new row
      const insert: Record<string, unknown> = {
        profile_id:    profileId,
        goal_month_id: goalMonthId,
        loan_id:       row.loan_id,
        source:        "unmatched_promote",
        event_type:    row.event_type,
      };
      if (row.event_type === "funded") {
        insert.funded_date   = row.funded_date;
        insert.funded_volume = row.funded_volume;
        insert.funded_unit   = 1;
        insert.app_date      = row.app_date ?? row.funded_date;
        insert.app_volume    = row.app_volume ?? row.funded_volume;
        insert.app_unit      = 1;
      } else {
        insert.app_date    = row.app_date;
        insert.app_volume  = row.app_volume;
        insert.app_unit    = 1;
        insert.funded_unit = 0;
      }
      const { error } = await sb.from("goal_production").insert(insert);
      if (error) continue;
    }

    // Mark as promoted
    await sb.from("unmatched_production")
      .update({ promoted: true, matched_at: new Date().toISOString(), matched_profile_id: profileId })
      .eq("id", row.id);

    promoted++;
  }

  return promoted;
}
