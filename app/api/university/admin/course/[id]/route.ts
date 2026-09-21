import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  getVerifiedProfile,
  isUniversityTrainer,
  isUniversityAdmin,
  logUniAudit,
} from "@/lib/auth";

interface Props { params: Promise<{ id: string }> }

// PATCH /api/university/admin/course/[id] — update course metadata
//
// Phase 0 security changes:
//   - Uses getVerifiedProfile() (server-validated token).
//   - is_published and is_required are admin-only fields. Trainers can update
//     all other metadata. Silently strips admin-only fields from trainer requests
//     (so the UI does not need special-case logic, but the server enforces it).
export async function PATCH(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // Fields any trainer (or admin) can update
  const trainerAllowed = [
    "title", "slug", "short_description", "description", "thumbnail_url",
    "category", "path_tag", "pill_color", "duration_label", "sort_order",
    "difficulty", "audience", "instructor_name", "completion_rules",
  ];
  // Admin-only fields — only applied when caller has university_admin
  const adminOnly = ["is_published", "is_required"];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of trainerAllowed) {
    if (key in body) updates[key] = body[key];
  }
  if (isUniversityAdmin(profile)) {
    for (const key of adminOnly) {
      if (key in body) updates[key] = body[key];
    }
  }

  const sb = createServiceClient();

  // Slug uniqueness check
  if (updates.slug) {
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

// POST for backwards compatibility (CourseEditorForm uses POST)
export async function POST(request: NextRequest, ctx: Props) {
  return PATCH(request, ctx);
}
