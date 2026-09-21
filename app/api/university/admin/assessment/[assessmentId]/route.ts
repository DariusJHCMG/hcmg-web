import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  getVerifiedProfile,
  isUniversityTrainer,
  isUniversityAdmin,
  logUniAudit,
} from "@/lib/auth";

interface Props { params: Promise<{ assessmentId: string }> }

// PATCH /api/university/admin/assessment/[assessmentId]
export async function PATCH(request: NextRequest, { params }: Props) {
  const { assessmentId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const allowed = [
    "title", "description", "instructions", "assessment_type",
    "passing_pct", "max_attempts", "time_limit_mins",
    "randomize_questions", "questions_to_draw", "show_answers_after",
    "is_required", "is_active", "lesson_id",
  ];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("uni_assessments")
    .update(updates)
    .eq("id", assessmentId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("assessment_updated", {
    actorId: profile.id, actorEmail: profile.email,
    entityType: "assessment", entityId: assessmentId,
    details: { fields: Object.keys(updates) },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data);
}

// DELETE /api/university/admin/assessment/[assessmentId]
export async function DELETE(request: NextRequest, { params }: Props) {
  const { assessmentId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Only admins can delete assessments" }, { status: 403 });
  }

  const sb = createServiceClient();
  const { error } = await sb.from("uni_assessments").delete().eq("id", assessmentId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("assessment_deleted", {
    actorId: profile.id, actorEmail: profile.email,
    entityType: "assessment", entityId: assessmentId,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}

// POST /api/university/admin/assessment/[assessmentId]/questions
// Add or replace questions linked to this assessment
export async function POST(request: NextRequest, { params }: Props) {
  const { assessmentId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { question_ids: string[] };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!Array.isArray(body.question_ids)) {
    return NextResponse.json({ error: "question_ids must be an array" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Delete existing links
  await sb.from("uni_assessment_questions").delete().eq("assessment_id", assessmentId);

  // Re-insert in order
  if (body.question_ids.length > 0) {
    const rows = body.question_ids.map((qid, i) => ({
      assessment_id: assessmentId,
      question_id:   qid,
      sort_order:    i,
    }));
    const { error } = await sb.from("uni_assessment_questions").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
