import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, canAccessLiftOffQueue, canAccessHelpDeskQueue, canAccessLockDeskQueue } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

type LookupMode    = "arive" | "user";
type LookupContext = "ops" | "helpdesk" | "lockdesk" | "pipeline";

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessLiftOffQueue(profile) && !canAccessHelpDeskQueue(profile) && !canAccessLockDeskQueue(profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const mode    = searchParams.get("mode")    as LookupMode | null;
  const q       = searchParams.get("q")?.trim() ?? "";
  const context = (searchParams.get("context") ?? "pipeline") as LookupContext;

  if (!mode || !["arive", "user"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  if (!q) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const sb = createServiceClient();
  let query = sb.from("lift_off_requests").select("*");

  // ── Context scoping ─────────────────────────────────────────────────────────
  if (context === "ops") {
    query = query.neq("request_type", "loan_help_desk").neq("request_type", "lock_request");
  } else if (context === "helpdesk") {
    query = query.eq("request_type", "loan_help_desk");
  } else if (context === "lockdesk") {
    query = query.eq("request_type", "lock_request");
  }
  // pipeline → no type filter

  // ── Mode branching ───────────────────────────────────────────────────────────
  if (mode === "arive") {
    query = query.ilike("arive_loan_number", `%${q}%`);
  } else if (mode === "user") {
    // Validate q is a UUID before injecting into the .or() filter string.
    // PostgREST does not parameterise .or() expressions, so a non-UUID value
    // could alter query semantics (e.g. append extra filter clauses).
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!UUID_RE.test(q)) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }
    query = query.or(`submitter_id.eq.${q},claimed_by_id.eq.${q}`);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ results: data ?? [] });
}
