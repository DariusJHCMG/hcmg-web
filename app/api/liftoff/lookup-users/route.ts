import { NextResponse } from "next/server";
import { getCurrentProfile, canAccessLiftOffQueue, canAccessHelpDeskQueue } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export interface LookupUser {
  id:        string;
  full_name: string;
  type:      "lo" | "team";
}

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessLiftOffQueue(profile) && !canAccessHelpDeskQueue(profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const sb = createServiceClient();

  // ── LOs: distinct submitters from lift_off_requests ─────────────────────────
  const { data: loRows } = await sb
    .from("lift_off_requests")
    .select("submitter_id, submitter_name")
    .not("submitter_id", "is", null)
    .not("submitter_name", "is", null)
    .order("submitter_name");

  const loMap = new Map<string, string>();
  for (const r of loRows ?? []) {
    if (r.submitter_id && r.submitter_name && !loMap.has(r.submitter_id)) {
      loMap.set(r.submitter_id, r.submitter_name);
    }
  }

  // ── All profiles (every LO + admin in the system) ────────────────────────────
  const { data: allProfiles } = await sb
    .from("profiles")
    .select("id, full_name, liftoff_roles")
    .order("full_name");

  // ── Merge: all profiles, tag anyone with liftoff roles as "team" ─────────────
  const merged = new Map<string, LookupUser>();

  // Seed with LO submitters first
  for (const [id, full_name] of loMap) {
    merged.set(id, { id, full_name, type: "lo" });
  }

  // Add / override with every profile
  for (const r of allProfiles ?? []) {
    if (!r.id || !r.full_name) continue;
    const hasLiftoffRole = Array.isArray(r.liftoff_roles) && r.liftoff_roles.length > 0;
    merged.set(r.id, {
      id:        r.id,
      full_name: r.full_name,
      type:      hasLiftoffRole ? "team" : "lo",
    });
  }

  const result = Array.from(merged.values()).sort((a, b) =>
    a.full_name.localeCompare(b.full_name)
  );

  return NextResponse.json({ users: result });
}
