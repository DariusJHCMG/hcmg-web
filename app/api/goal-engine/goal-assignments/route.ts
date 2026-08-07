/**
 * /api/goal-engine/goal-assignments
 *
 * GET    ?goal_month_id=  — list all assigned profiles for a goal
 * POST                    — assign profiles to a goal (admin only)
 *                          body: { goal_month_id, profile_ids: string[], assign_all?: boolean }
 * DELETE                  — remove a profile from a goal
 *                          body: { goal_month_id, profile_id }
 *
 * When assign_all=true: assigns every active loan_officer.
 * When profile_ids provided: assigns exactly those IDs (replaces entire list).
 *
 * Participation % = (committed assignees / total assignees) * 100
 * Non-assigned LOs are excluded from participation metrics.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export const dynamic = "force-dynamic";

// ── GET — list assignees for a goal ─────────────────────────────
export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile)          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(profile)) return NextResponse.json({ error: "Admin only" },   { status: 403 });

  const { searchParams } = new URL(req.url);
  const goalMonthId = searchParams.get("goal_month_id");
  if (!goalMonthId) return NextResponse.json({ error: "goal_month_id required" }, { status: 400 });

  const sb = createServiceClient();

  // Get assignments with profile info
  const { data: assignments, error } = await sb
    .from("goal_assignments")
    .select(`
      id, assigned_at, notes,
      personal_funded_volume_goal, personal_funded_units_goal,
      profile:profiles!goal_assignments_profile_id_fkey(
        id, full_name, email, avatar_url, nmls, role, is_active
      )
    `)
    .eq("goal_month_id", goalMonthId)
    .order("assigned_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Also get all active LOs so admin can see who is NOT assigned
  const { data: allLOs } = await sb
    .from("profiles")
    .select("id, full_name, email, avatar_url, nmls, role, is_active")
    .eq("role", "loan_officer")
    .eq("is_active", true)
    .order("full_name");

  // Supabase returns the FK join as an array even for many-to-one; normalise to a plain object
  const normalised = (assignments ?? []).map((a) => ({
    ...a,
    profile: Array.isArray(a.profile) ? a.profile[0] ?? null : a.profile,
  }));

  const assignedIds = new Set(normalised.map((a) => (a.profile as { id: string } | null)?.id).filter(Boolean) as string[]);

  return NextResponse.json({
    assignments:    normalised,
    all_los:        allLOs ?? [],
    assigned_ids:   Array.from(assignedIds),
    unassigned_los: (allLOs ?? []).filter((lo) => !assignedIds.has(lo.id)),
  });
}

// ── POST — set/replace assignees ────────────────────────────────
export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile)          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(profile)) return NextResponse.json({ error: "Admin only" },   { status: 403 });

  const body = await req.json();
  const { goal_month_id, profile_ids, assign_all } = body;

  if (!goal_month_id) return NextResponse.json({ error: "goal_month_id required" }, { status: 400 });

  const sb = createServiceClient();

  // Determine final list of profile IDs to assign
  let finalIds: string[] = [];

  if (assign_all) {
    const { data: allLOs } = await sb
      .from("profiles")
      .select("id")
      .eq("role", "loan_officer")
      .eq("is_active", true);
    finalIds = (allLOs ?? []).map((lo) => lo.id);
  } else if (Array.isArray(profile_ids)) {
    finalIds = profile_ids;
  } else {
    return NextResponse.json({ error: "profile_ids or assign_all required" }, { status: 400 });
  }

  // Remove all existing assignments for this goal, then re-insert
  const { error: delErr } = await sb
    .from("goal_assignments")
    .delete()
    .eq("goal_month_id", goal_month_id);

  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });

  if (finalIds.length === 0) {
    return NextResponse.json({ assigned: 0, message: "All assignments cleared." });
  }

  const rows = finalIds.map((pid) => ({
    goal_month_id,
    profile_id:  pid,
    assigned_by: profile.id,
  }));

  const { data: inserted, error: insErr } = await sb
    .from("goal_assignments")
    .insert(rows)
    .select("id");

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ assigned: inserted?.length ?? 0, profile_ids: finalIds });
}

// ── DELETE — remove one assignee ─────────────────────────────────
export async function DELETE(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile)          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(profile)) return NextResponse.json({ error: "Admin only" },   { status: 403 });

  const body = await req.json();
  const { goal_month_id, profile_id } = body;

  if (!goal_month_id || !profile_id) {
    return NextResponse.json({ error: "goal_month_id and profile_id required" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { error } = await sb
    .from("goal_assignments")
    .delete()
    .eq("goal_month_id", goal_month_id)
    .eq("profile_id", profile_id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ removed: true });
}
