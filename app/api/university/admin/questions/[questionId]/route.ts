import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  getVerifiedProfile,
  isUniversityTrainer,
  isUniversityAdmin,
  logUniAudit,
} from "@/lib/auth";

interface Props { params: Promise<{ questionId: string }> }

// PATCH /api/university/admin/questions/[questionId]
export async function PATCH(request: NextRequest, { params }: Props) {
  const { questionId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const allowed = ["question_text", "question_type", "options_json", "explanation", "sort_order", "points", "is_required", "passing_pct"];
  const updates: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("uni_quiz_questions")
    .update(updates)
    .eq("id", questionId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/university/admin/questions/[questionId]
export async function DELETE(request: NextRequest, { params }: Props) {
  const { questionId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();
  const { error } = await sb.from("uni_quiz_questions").delete().eq("id", questionId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("question_deleted", {
    actorId: profile.id, actorEmail: profile.email,
    entityType: "question", entityId: questionId,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
