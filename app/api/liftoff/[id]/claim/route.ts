import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessLiftOffQueue, canSeeLockRequests, canSeeGeneralRequests } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessLiftOffQueue(profile)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const sb = createServiceClient();

  // Fetch the request to check type gating
  const { data: req_ } = await sb
    .from("lift_off_requests")
    .select("id, request_type, request_status, claimed_by_id")
    .eq("id", id)
    .single();

  if (!req_) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (req_.request_status !== "pending") return NextResponse.json({ error: "Only pending requests can be claimed" }, { status: 409 });
  if (req_.claimed_by_id) return NextResponse.json({ error: "Already claimed" }, { status: 409 });

  // Role gating
  if (req_.request_type === "lock_request" && !canSeeLockRequests(profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (req_.request_type !== "lock_request" && !canSeeGeneralRequests(profile)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date().toISOString();
  const { error } = await sb
    .from("lift_off_requests")
    .update({
      claimed_by_id:   profile.id,
      claimed_by_name: profile.full_name,
      claimed_at:      now,
      request_status:  "in_review",
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, claimed_at: now, claimed_by_name: profile.full_name });
}
