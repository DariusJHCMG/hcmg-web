/**
 * POST /api/goal-engine/zapier
 * Zapier/ARIVE webhook — receives production data and updates goal tracking.
 *
 * Expected payload:
 * {
 *   lo_nmls?: string         -- used to match LO profile
 *   lo_email?: string        -- fallback
 *   loan_id: string
 *   funded_date?: string     -- ISO date
 *   funded_volume?: number
 *   funded_unit?: number     -- usually 1
 *   app_date?: string
 *   app_volume?: number
 *   app_unit?: number
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getActiveGoal } from "@/lib/goal-engine-server";

const ZAPIER_SECRET = process.env.ZAPIER_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  // Validate shared secret
  const authHeader = req.headers.get("x-zapier-secret");
  if (ZAPIER_SECRET && authHeader !== ZAPIER_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    lo_nmls,
    lo_email,
    loan_id,
    funded_date,
    funded_volume,
    funded_unit,
    app_date,
    app_volume,
    app_unit,
  } = body;

  const sb = createServiceClient();

  // Find LO profile
  let profile = null;
  if (lo_nmls) {
    const { data } = await sb.from("profiles").select("id, full_name").eq("nmls", lo_nmls).single();
    profile = data;
  }
  if (!profile && lo_email) {
    const { data } = await sb.from("profiles").select("id, full_name").eq("email", lo_email).single();
    profile = data;
  }

  if (!profile) {
    return NextResponse.json({ error: "LO not found. Provide lo_nmls or lo_email." }, { status: 404 });
  }

  // Find active goal month
  const goal = await getActiveGoal();

  // Check for duplicate loan_id
  if (loan_id) {
    const { data: existing } = await sb
      .from("goal_production")
      .select("id")
      .eq("loan_id", loan_id)
      .eq("profile_id", profile.id)
      .single();
    if (existing) {
      // Update instead of insert
      const { error } = await sb
        .from("goal_production")
        .update({
          funded_date:   funded_date   ?? null,
          funded_volume: funded_volume ?? null,
          funded_unit:   funded_unit   ?? 0,
          app_date:      app_date      ?? null,
          app_volume:    app_volume    ?? null,
          app_unit:      app_unit      ?? 0,
          raw_payload:   body,
        })
        .eq("id", existing.id);

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ status: "updated", loan_id });
    }
  }

  const { error } = await sb.from("goal_production").insert({
    profile_id:    profile.id,
    goal_month_id: goal?.id ?? null,
    loan_id:       loan_id  ?? null,
    funded_date:   funded_date   ?? null,
    funded_volume: funded_volume ?? null,
    funded_unit:   funded_unit   ?? 0,
    app_date:      app_date      ?? null,
    app_volume:    app_volume    ?? null,
    app_unit:      app_unit      ?? 0,
    source:        "zapier",
    raw_payload:   body,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ status: "created", loan_id, lo: profile.full_name });
}
