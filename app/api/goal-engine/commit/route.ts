/**
 * POST /api/goal-engine/commit
 * LO: submit or update their monthly commitment
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { createNotification, getActiveGoal } from "@/lib/goal-engine-server";

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    goal_month_id,
    funded_volume_commitment,
    funded_units_commitment,
    app_volume_commitment,
    app_units_commitment,
    biggest_focus,
    biggest_challenge,
    confidence_pct,
    comments,
    digital_agreement,
  } = body;

  if (!digital_agreement) {
    return NextResponse.json({ error: "Digital agreement is required." }, { status: 400 });
  }

  if (!funded_volume_commitment || funded_volume_commitment <= 0) {
    return NextResponse.json({ error: "Funded volume commitment is required." }, { status: 400 });
  }

  const sb = createServiceClient();

  // Resolve goal month
  const goalMonthId = goal_month_id ?? (await getActiveGoal())?.id;
  if (!goalMonthId) {
    return NextResponse.json({ error: "No active goal found." }, { status: 404 });
  }

  // Check if existing — if locked, reject
  const { data: existing } = await sb
    .from("goal_commitments")
    .select("id, locked")
    .eq("goal_month_id", goalMonthId)
    .eq("profile_id", profile.id)
    .single();

  if (existing?.locked) {
    return NextResponse.json({ error: "This commitment is locked. Contact an admin to unlock." }, { status: 403 });
  }

  const payload = {
    goal_month_id:            goalMonthId,
    profile_id:               profile.id,
    funded_volume_commitment: funded_volume_commitment ?? 0,
    funded_units_commitment:  funded_units_commitment  ?? 0,
    app_volume_commitment:    app_volume_commitment    ?? 0,
    app_units_commitment:     app_units_commitment     ?? 0,
    biggest_focus:            biggest_focus            ?? null,
    biggest_challenge:        biggest_challenge        ?? null,
    confidence_pct:           confidence_pct           ?? null,
    comments:                 comments                 ?? null,
    digital_agreement:        true,
    locked:                   true,
    submitted_at:             new Date().toISOString(),
  };

  let result;
  if (existing) {
    const { data, error } = await sb
      .from("goal_commitments")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    result = data;
  } else {
    const { data, error } = await sb
      .from("goal_commitments")
      .insert(payload)
      .select()
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    result = data;
  }

  // Create in-app notification
  await createNotification(
    profile.id,
    "Commitment Submitted! 🥧",
    `Your slice of the pie has been locked in for this month.`,
    "success",
    "/goal-engine/dashboard",
  );

  return NextResponse.json({ commitment: result }, { status: 201 });
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sb   = createServiceClient();
  const goal = await getActiveGoal();
  if (!goal) return NextResponse.json({ commitment: null });

  const { data } = await sb
    .from("goal_commitments")
    .select("*")
    .eq("goal_month_id", goal.id)
    .eq("profile_id", profile.id)
    .single();

  return NextResponse.json({ commitment: data ?? null });
}
