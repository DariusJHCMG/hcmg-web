import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendLiftOffResubmission } from "@/lib/liftoff-mailer";
import { computeSla } from "@/lib/liftoff-sla";
import type { LiftOffRequestType } from "@/lib/database.types";

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: { original_id?: string; notes?: string | null; confirmed_reasons?: string[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { original_id, notes, confirmed_reasons } = body;
  if (!original_id) return NextResponse.json({ error: "original_id required" }, { status: 400 });

  const sb = createServiceClient();

  // Fetch original request
  const { data: original } = await sb
    .from("lift_off_requests")
    .select("*")
    .eq("id", original_id)
    .single();

  if (!original) return NextResponse.json({ error: "Request not found" }, { status: 404 });

  // Must be the original submitter
  if (original.submitter_id !== profile.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Must be action_needed and no resubmission yet
  if (original.request_status !== "action_needed") {
    return NextResponse.json({ error: "Request is not in action_needed state" }, { status: 409 });
  }
  if (original.has_resubmission) {
    return NextResponse.json({ error: "A resubmission already exists for this request" }, { status: 409 });
  }

  const now = new Date();
  const nowStr = now.toISOString();
  const slaFields = computeSla(original.request_type as LiftOffRequestType, now);

  // Build the new resubmission row — spread original, override lifecycle fields
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, ...originalFields } = original as Record<string, unknown>;
  const newRow = {
    ...originalFields,
    // Status + timestamps
    request_status:           "pending",
    created_at:               nowStr,
    updated_at:               nowStr,
    // Resubmission linkage
    resubmission_of:          original_id,
    resubmission_notes:       notes ?? null,
    resubmission_confirmed_at: nowStr,
    has_resubmission:         false,
    // Reset workflow fields
    claimed_by_id:            null,
    claimed_by_name:          null,
    claimed_at:               null,
    started_at:               null,
    completed_at:             null,
    inflight_email_sent_at:   null,
    completed_email_sent_at:  null,
    // Reset incomplete fields
    incomplete_reasons:       null,
    incomplete_notes:         null,
    incomplete_at:            null,
    incomplete_by_name:       null,
    // Reset assignment fields
    assigned_to_id:           null,
    assigned_to_name:         null,
    assigned_at_ts:           null,
    assigned_by_name:         null,
    // Recomputed SLA
    ...slaFields,
  };

  const { data: inserted, error: insertError } = await sb
    .from("lift_off_requests")
    .insert(newRow)
    .select("id")
    .single();

  if (insertError || !inserted) {
    console.error("[liftoff/resubmit] insert error", insertError);
    return NextResponse.json({ error: insertError?.message ?? "Insert failed" }, { status: 500 });
  }

  // Mark original as having a resubmission
  await sb
    .from("lift_off_requests")
    .update({ has_resubmission: true, updated_at: nowStr })
    .eq("id", original_id);

  // Non-blocking email to ops queue
  void sendLiftOffResubmission({
    request:           inserted as Record<string, unknown>,
    originalRequest:   original as Record<string, unknown>,
    resubmissionNotes: notes ?? null,
    resubmittedAt:     nowStr,
    confirmedReasons:  confirmed_reasons ?? [],
  }).catch(err => console.error("[liftoff/resubmit] email failed", err));

  return NextResponse.json({ ok: true, id: inserted.id }, { status: 201 });
}
