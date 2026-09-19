import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

// POST /api/university/admin/course — create new course
export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const payload = {
    title:          formData.get("title") as string,
    slug:           formData.get("slug") as string,
    description:    (formData.get("description") as string) || null,
    thumbnail_url:  (formData.get("thumbnail_url") as string) || null,
    category:       (formData.get("category") as string) ?? "general",
    path_tag:       (formData.get("path_tag") as string) || null,
    pill_color:     (formData.get("pill_color") as string) || "gray",
    duration_label: (formData.get("duration_label") as string) || null,
    is_published:   formData.get("is_published") === "true",
    is_required:    formData.get("is_required") === "true",
    created_by:     profile.id,
  };

  if (!payload.title || !payload.slug) {
    return NextResponse.json({ error: "Title and slug required" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb.from("uni_courses").insert(payload).select("id").single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("course_created", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "course",
    entityId: data.id,
    details: { title: payload.title, slug: payload.slug },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.redirect(new URL(`/university/admin/courses/${data.id}`, request.url));
}
