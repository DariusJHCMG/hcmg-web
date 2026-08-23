import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, canAccessLiftOffQueue, canAccessHelpDeskQueue } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

type LookupMode    = "arive" | "borrower" | "user";
type LookupContext = "ops" | "helpdesk" | "pipeline";

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessLiftOffQueue(profile) && !canAccessHelpDeskQueue(profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const mode    = searchParams.get("mode")    as LookupMode | null;
  const q       = searchParams.get("q")?.trim() ?? "";
  const context = (searchParams.get("context") ?? "pipeline") as LookupContext;

  if (!mode || !["arive", "borrower", "user"].includes(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }
  if (!q) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const sb = createServiceClient();
  let query = sb.from("lift_off_requests").select("*");

  // ── Context scoping ─────────────────────────────────────────────────────────
  if (context === "ops") {
    query = query.neq("request_type", "loan_help_desk");
  } else if (context === "helpdesk") {
    query = query.eq("request_type", "loan_help_desk");
  }
  // pipeline → no type filter

  // ── Mode branching ───────────────────────────────────────────────────────────
  const wq = `%${q}%`; // wrap with wildcards for partial matching
  if (mode === "arive") {
    query = query.ilike("arive_loan_number", wq);
  } else if (mode === "borrower") {
    query = query.or(
      `borrower_first_name.ilike.${wq},borrower_last_name.ilike.${wq},co_borrower_first_name.ilike.${wq},co_borrower_last_name.ilike.${wq}`
    );
  } else if (mode === "user") {
    query = query.or(`submitter_id.eq.${q},claimed_by_id.eq.${q}`);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ results: data ?? [] });
}
