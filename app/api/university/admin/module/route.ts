import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

// POST /api/university/admin/module — create a module
export async function POST(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { course_id: string; title: string; description?: string; sort_order?: number };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.course_id?.trim() || !body.title?.trim()) {
    return NextResponse.json({ error: "course_id and title are required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Determine sort_order if not provided
  let sortOrder = body.sort_order ?? 0;
  if (body.sort_order == null) {
    const { count } = await sb
      .from("uni_modules")
      .select("id", { count: "exact", head: true })
      .eq("course_id", body.course_id);
    sortOrder = count ?? 0;
  }

  const { data, error } = await sb
    .from("uni_modules")
    .insert({
      course_id:   body.course_id,
      title:       body.title.trim(),
      description: body.description?.trim() || null,
      sort_order:  sortOrder,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("module_created", {
    actorId: profile.id, actorEmail: profile.email,
    entityType: "module", entityId: data.id,
    details: { title: data.title, course_id: data.course_id },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return NextResponse.json(data, { status: 201 });
}
