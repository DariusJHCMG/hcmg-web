import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Enforce submitter identity from session — never trust client
  const payload = {
    ...body,
    submitter_id:   profile.id,
    submitter_name: profile.full_name,
    submitter_nmls: profile.nmls ?? null,
    request_status: "pending",
  };

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("lift_off_requests")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("[liftoff/submit]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
