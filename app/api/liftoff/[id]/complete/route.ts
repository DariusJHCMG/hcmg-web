import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { canAccessLiftOffQueue } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendLiftOffCompleted } from "@/lib/liftoff-mailer";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessLiftOffQueue(profile)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Optional body — completion notes + assigned processor (submission only)
  let body: { notes?: string; assignedProcessorName?: string; assignedProcessorEmail?: string } = {};
  try { body = await req.json(); } catch { /* no body is fine */ }

  const sb = createServiceClient();

  const { data: r } = await sb
    .from("lift_off_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (r.request_status === "completed") return NextResponse.json({ error: "Already completed" }, { status: 409 });

  // Block completion if a linked lock request is still pending
  if (r.linked_lock_request_id) {
    const { data: lockReq } = await sb
      .from("lift_off_requests")
      .select("request_status")
      .eq("id", r.linked_lock_request_id)
      .maybeSingle();

    if (lockReq && lockReq.request_status !== "completed") {
      return NextResponse.json(
        { error: "Cannot complete — linked lock request is still pending. Complete the lock request first." },
        { status: 409 },
      );
    }
  }

  // Submission requires an assigned processor
  if (r.request_type === "submission") {
    if (!body.assignedProcessorName?.trim() || !body.assignedProcessorEmail?.trim()) {
      return NextResponse.json({ error: "An assigned processor is required to complete a submission." }, { status: 400 });
    }
  }

  const now = new Date().toISOString();
  const update: Record<string, unknown> = {
    request_status: "completed",
    completed_at:   now,
  };
  if (body.notes?.trim())                    update.team_notes               = body.notes.trim();
  if (body.assignedProcessorName?.trim())    update.assigned_processor_name  = body.assignedProcessorName.trim();
  if (body.assignedProcessorEmail?.trim())   update.assigned_processor_email = body.assignedProcessorEmail.trim();

  const { error } = await sb
    .from("lift_off_requests")
    .update(update)
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send completion email to LO (non-blocking)
  if (r.submitter_email) {
    void sendLiftOffCompleted({
      request:                { ...r, team_notes: body.notes?.trim() || r.team_notes },
      processorName:          profile.full_name,
      completedAt:            now,
      assignedProcessorName:  body.assignedProcessorName?.trim(),
      assignedProcessorEmail: body.assignedProcessorEmail?.trim(),
    }).catch(err => console.error("[liftoff/complete] email failed", err));
  }

  return NextResponse.json({
    ok: true,
    completed_at:            now,
    assigned_processor_name:  body.assignedProcessorName?.trim() ?? null,
    assigned_processor_email: body.assignedProcessorEmail?.trim() ?? null,
  });
}
