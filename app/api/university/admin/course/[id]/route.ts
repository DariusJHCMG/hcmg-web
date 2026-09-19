import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

interface Props { params: Promise<{ id: string }> }

// PATCH /api/university/admin/course/[id] — update course (JSON body)
export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const allowed = [
    "title","slug","description","thumbnail_url","category",
    "path_tag","pill_color","duration_label","is_published","is_required","sort_order",
  ];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  // If slug being changed, check uniqueness
  if (updates.slug) {
    const sb = createServiceClient();
    const { data: existing } = await sb
      .from("uni_courses")
      .select("id")
      .eq("slug", updates.slug as string)
      .neq("id", id)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "A course with this slug already exists" }, { status: 409 });
    }
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("uni_courses")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("course_updated", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "course",
    entityId: id,
    details: { fields: Object.keys(updates) },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data);
}

// Also keep POST for backwards compatibility (same as PATCH)
export async function POST(request: NextRequest, ctx: Props) {
  return PATCH(request, ctx);
}
