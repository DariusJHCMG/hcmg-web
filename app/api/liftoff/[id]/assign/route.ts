import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, canAssignRequests } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { sendLiftOffAssigned } from "@/lib/liftoff-mailer";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAssignRequests(profile)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  let body: { assignee_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { assignee_id } = body;
  if (!assignee_id) return NextResponse.json({ error: "assignee_id required" }, { status: 400 });

  const sb = createServiceClient();

  // Fetch the request
  const { data: request } = await sb
    .from("lift_off_requests")
    .select("id, request_status, request_type, borrower_first_name, borrower_last_name, arive_loan_number, created_at")
    .eq("id", id)
    .single();

  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (request.request_status === "completed" || request.request_status === "cancelled") {
    return NextResponse.json({ error: "Cannot assign a completed or cancelled request" }, { status: 409 });
  }

  // Fetch assignee profile
  const { data: assignee } = await sb
    .from("profiles")
    .select("id, full_name, email")
    .eq("id", assignee_id)
    .single();

  if (!assignee) return NextResponse.json({ error: "Assignee not found" }, { status: 404 });

  const now = new Date().toISOString();

  const { error: updateError } = await sb
    .from("lift_off_requests")
    .update({
      assigned_to_id:   assignee.id,
      assigned_to_name: assignee.full_name,
      assigned_at_ts:   now,
      assigned_by_name: profile.full_name,
      claimed_by_id:    assignee.id,
      claimed_by_name:  assignee.full_name,
      claimed_at:       now,
      request_status:   "in_review",
      updated_at:       now,
    })
    .eq("id", id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  // Non-blocking email to assignee
  if (assignee.email) {
    void sendLiftOffAssigned({
      request:        request as Record<string, unknown>,
      assigneeName:   assignee.full_name,
      assigneeEmail:  assignee.email,
      assignedByName: profile.full_name,
      assignedAt:     now,
    }).catch(err => console.error("[liftoff/assign] email failed", err));
  }

  return NextResponse.json({ ok: true, assigned_to_name: assignee.full_name, claimed_at: now });
}
