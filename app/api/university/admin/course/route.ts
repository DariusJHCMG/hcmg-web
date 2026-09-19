import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

// POST /api/university/admin/course — create new course (JSON body)
export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
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
    is_published?: boolean;
    is_required?: boolean;
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
    is_published:   body.is_published ?? false,
    is_required:    body.is_required ?? false,
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
