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

  // ── Team members: profiles with any liftoff role ─────────────────────────────
  const { data: teamRows } = await sb
    .from("profiles")
    .select("id, full_name")
    .not("liftoff_roles", "eq", "{}")
    .order("full_name");

  const teamMap = new Map<string, string>();
  for (const r of teamRows ?? []) {
    if (r.id && r.full_name) teamMap.set(r.id, r.full_name);
  }

  // ── Merge: team members override LO entries for the same id ─────────────────
  const merged = new Map<string, LookupUser>();

  for (const [id, full_name] of loMap) {
    merged.set(id, { id, full_name, type: "lo" });
  }
  for (const [id, full_name] of teamMap) {
    // If they also submitted requests, label them as team (higher privilege)
    merged.set(id, { id, full_name, type: "team" });
  }

  const result = Array.from(merged.values()).sort((a, b) =>
    a.full_name.localeCompare(b.full_name)
  );

  return NextResponse.json(result);
}
