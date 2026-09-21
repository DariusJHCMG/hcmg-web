import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  getVerifiedProfile,
  isUniversityTrainer,
  isUniversityAdmin,
  logUniAudit,
} from "@/lib/auth";

interface Props { params: Promise<{ moduleId: string }> }

// PATCH /api/university/admin/module/[moduleId]
export async function PATCH(request: NextRequest, { params }: Props) {
  const { moduleId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const allowed = ["title", "description", "sort_order", "is_active"];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("uni_modules")
    .update(updates)
    .eq("id", moduleId)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("module_updated", {
    actorId: profile.id, actorEmail: profile.email,
    entityType: "module", entityId: moduleId,
    details: { fields: Object.keys(updates) },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data);
}

// DELETE /api/university/admin/module/[moduleId]
export async function DELETE(request: NextRequest, { params }: Props) {
  const { moduleId } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Only admins can delete modules" }, { status: 403 });
  }

  const sb = createServiceClient();

  // Unassign lessons from this module first
  await sb
    .from("uni_lessons")
    .update({ module_id: null })
    .eq("module_id", moduleId);

  const { error } = await sb.from("uni_modules").delete().eq("id", moduleId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("module_deleted", {
    actorId: profile.id, actorEmail: profile.email,
    entityType: "module", entityId: moduleId,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json({ ok: true });
}
