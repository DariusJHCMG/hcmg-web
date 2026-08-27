import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, canAccessLiftOffQueue } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendLiftOffIncomplete } from "@/lib/liftoff-mailer";
import { sendPushToUser } from "@/lib/push";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessLiftOffQueue(profile)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  let body: { reasons?: string[]; notes?: string } = {};
  try { body = await req.json(); } catch { /* no body */ }

  if (!body.reasons || body.reasons.length === 0) {
    return NextResponse.json({ error: "reasons is required and must be non-empty" }, { status: 400 });
  }

  const sb = createServiceClient();

  const { data: r } = await sb
    .from("lift_off_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (r.request_status === "completed" || r.request_status === "cancelled") {
    return NextResponse.json({ error: `Cannot mark incomplete — request is ${r.request_status}` }, { status: 409 });
  }

  const now = new Date().toISOString();

  // Only flag as breached if the SLA deadline has actually passed.
  // Always escalate severity to "critical" because the request now needs
  // the LO's attention regardless of remaining window time.
  const isSlaBreached = r.sla_deadline_at
    ? new Date() > new Date(r.sla_deadline_at)
    : false;

  const { error } = await sb
    .from("lift_off_requests")
    .update({
      request_status:     "action_needed",
      incomplete_reasons: body.reasons,
      incomplete_notes:   body.notes ?? null,
      incomplete_at:      now,
      incomplete_by_name: profile.full_name,
      is_sla_breached:    isSlaBreached,
      sla_severity:       "critical",
    })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // In-app notification to LO (non-blocking)
  if (r.submitter_id) {
    void sb.from("goal_notifications").insert({
      profile_id: r.submitter_id,
      title:      "⚠️ Action Needed",
      body:       `${r.borrower_first_name} ${r.borrower_last_name} — your request needs attention.`,
      type:       "warning",
      link:       `/liftoff/${id}`,
      source:     "liftoff",
    }).then(() => {});
  }

  // Push notification to LO (non-blocking)
  if (r.submitter_id) {
    void sendPushToUser(r.submitter_id, {
      title: "⚠️ Action Needed",
      body:  `${r.borrower_first_name} ${r.borrower_last_name} — your request needs attention.`,
      url:   `/liftoff/${id}`,
    }).catch(() => {});
  }

  // Fire non-blocking email to the submitter (LO)
  if (r.submitter_email) {
    void sendLiftOffIncomplete({
      request:          r as Record<string, unknown>,
      reasons:          body.reasons,
      notes:            body.notes ?? null,
      incompleteByName: profile.full_name,
      incompleteAt:     now,
    }).catch(err => console.error("[liftoff/incomplete] email failed", err));
  }

  return NextResponse.json({ ok: true, incomplete_at: now });
}
