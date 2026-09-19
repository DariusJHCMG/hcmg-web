import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import {
  getVerifiedProfile,
  isUniversityTrainer,
  isUniversityAdmin,
  logUniAudit,
} from "@/lib/auth";

// POST /api/university/admin/course — create new course (JSON body)
//
// Phase 0 security changes:
//   - Uses getVerifiedProfile() (server-validated token) for privileged write.
//   - is_published is always FALSE on creation regardless of submitted value.
//     Only university_admin can publish. Trainers create Drafts.
//   - is_required is always FALSE on creation by trainers.
//     Only university_admin can mark a course as required.
export async function POST(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    title: string;
    slug: string;
    description?: string;
    thumbnail_url?: string;
    category?: string;
    path_tag?: string;
    pill_color?: string;
    duration_label?: string;
    // is_published and is_required intentionally omitted from accepted body —
    // trainers cannot publish or mark required on creation
  };

  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.title?.trim() || !body.slug?.trim()) {
    return NextResponse.json({ error: "Title and slug are required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Slug uniqueness check
  const { data: existing } = await sb
    .from("uni_courses")
    .select("id")
    .eq("slug", body.slug.trim())
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ error: "A course with this slug already exists" }, { status: 409 });
  }

  // Sort order: put at end
  const { count } = await sb
    .from("uni_courses")
    .select("id", { count: "exact", head: true });

  const { data, error } = await sb.from("uni_courses").insert({
    title:          body.title.trim(),
    slug:           body.slug.trim(),
    description:    body.description?.trim() || null,
    thumbnail_url:  body.thumbnail_url?.trim() || null,
    category:       body.category ?? "general",
    path_tag:       body.path_tag || null,
    pill_color:     body.pill_color || "gray",
    duration_label: body.duration_label?.trim() || null,
    // Always start as Draft — only admins can publish
    is_published:   false,
    // Never required at creation — only admins can set required
    is_required:    false,
    sort_order:     count ?? 0,
    created_by:     profile.id,
  }).select("*").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("course_created", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "course",
    entityId: data.id,
    details: { title: data.title, slug: data.slug },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/university/admin/course — used by CourseEditorForm for metadata updates
// (slug, title, description, etc.) but NOT publish/required state.
// Separate publish and required endpoints exist for admin-only actions.
export async function PATCH(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { id } = body as { id?: string };
  if (!id) return NextResponse.json({ error: "Missing course id" }, { status: 400 });

  // Fields any trainer can update (metadata only)
  const trainerFields = [
    "title", "slug", "description", "thumbnail_url", "category",
    "path_tag", "pill_color", "duration_label", "sort_order",
  ];
  // Additional fields only an admin can touch
  const adminOnlyFields = ["is_published", "is_required"];

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  for (const key of trainerFields) {
    if (key in body) updates[key] = body[key];
  }

  // Admin-only fields — silently ignored for trainers, applied for admins
  if (isUniversityAdmin(profile)) {
    for (const key of adminOnlyFields) {
      if (key in body) updates[key] = body[key];
    }
  }

  const sb = createServiceClient();

  // Slug uniqueness check if slug is being changed
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
