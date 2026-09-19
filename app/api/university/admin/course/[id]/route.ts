import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

interface Props { params: Promise<{ id: string }> }

// POST /api/university/admin/course/[id] — update existing course
export async function POST(request: NextRequest, { params }: Props) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const updates = {
    title:          formData.get("title") as string,
    slug:           formData.get("slug") as string,
    description:    (formData.get("description") as string) || null,
    thumbnail_url:  (formData.get("thumbnail_url") as string) || null,
    category:       (formData.get("category") as string) ?? "general",
    path_tag:       (formData.get("path_tag") as string) || null,
    duration_label: (formData.get("duration_label") as string) || null,
    is_published:   formData.get("is_published") === "true",
    is_required:    formData.get("is_required") === "true",
    updated_at:     new Date().toISOString(),
  };

  const sb = createServiceClient();
  const { error } = await sb.from("uni_courses").update(updates).eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("course_updated", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "course",
    entityId: id,
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.redirect(new URL(`/university/admin/courses/${id}`, request.url));
}
