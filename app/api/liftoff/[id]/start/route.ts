import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessLiftOffQueue } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendLiftOffInFlight } from "@/lib/liftoff-mailer";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessLiftOffQueue(profile)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const sb = createServiceClient();

  const { data: r } = await sb
    .from("lift_off_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (r.request_status !== "in_review") return NextResponse.json({ error: "Request must be claimed first" }, { status: 409 });
  if (r.started_at) return NextResponse.json({ error: "Already started" }, { status: 409 });

  const now = new Date().toISOString();
  const { error } = await sb
    .from("lift_off_requests")
    .update({ started_at: now })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send in-flight email to LO (non-blocking)
  if (r.submitter_email) {
    void sendLiftOffInFlight({
      request:       r,
      processorName: profile.full_name,
      startedAt:     now,
    }).catch(err => console.error("[liftoff/start] email failed", err));
  }

  return NextResponse.json({ ok: true, started_at: now });
}
