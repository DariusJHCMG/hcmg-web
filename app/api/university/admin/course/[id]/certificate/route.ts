import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

interface Props { params: Promise<{ id: string }> }

// GET /api/university/admin/course/[id]/certificate
export async function GET(_request: NextRequest, { params }: Props) {
  const { id } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();
  const { data } = await sb
    .from("uni_certificate_config")
    .select("*")
    .eq("course_id", id)
    .maybeSingle();

  return NextResponse.json(data ?? null);
}

// PUT /api/university/admin/course/[id]/certificate — upsert
export async function PUT(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    issue_certificate?: boolean;
    validity_days?: number | null;
    renewal_mode?: string;
    include_verification?: boolean;
    trigger_assessment_id?: string | null;
  };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const sb = createServiceClient();

  const upsertData = {
    course_id:             id,
    issue_certificate:     body.issue_certificate ?? true,
    validity_days:         body.validity_days ?? null,
    renewal_mode:          body.renewal_mode ?? "manual",
    include_verification:  body.include_verification ?? true,
    trigger_assessment_id: body.trigger_assessment_id ?? null,
    updated_at:            new Date().toISOString(),
  };

  const { data, error } = await sb
    .from("uni_certificate_config")
    .upsert(upsertData, { onConflict: "course_id" })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("certificate_config_updated", {
    actorId: profile.id, actorEmail: profile.email,
    entityType: "course", entityId: id,
    details: upsertData,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data);
}
