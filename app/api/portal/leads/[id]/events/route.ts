import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isAdmin } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const sb = createServiceClient();

  // Fetch the lead — verify ownership (LO can only see their own leads)
  const { data: lead } = await sb
    .from("leads")
    .select("id, session_id, lo_slug")
    .eq("id", id)
    .single();

  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // LOs can only see their own leads
  if (!isAdmin(caller) && lead.lo_slug !== caller.lo_slug) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!lead.session_id) return NextResponse.json({ events: [] });

  const { data: events } = await sb
    .from("lead_events")
    .select("*")
    .eq("session_id", lead.session_id)
    .order("ts", { ascending: true });

  return NextResponse.json({ events: events ?? [] });
}
