import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityTrainer, logUniAudit } from "@/lib/auth";

// GET /api/university/admin/objectives?course_id=xxx
export async function GET(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const courseId = request.nextUrl.searchParams.get("course_id");
  if (!courseId) return NextResponse.json({ error: "course_id required" }, { status: 400 });

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("uni_course_objectives")
    .select("*")
    .eq("course_id", courseId)
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST /api/university/admin/objectives
export async function POST(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { course_id: string; objective: string; sort_order?: number };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.course_id?.trim() || !body.objective?.trim()) {
    return NextResponse.json({ error: "course_id and objective are required" }, { status: 400 });
  }

  const sb = createServiceClient();

  let sortOrder = body.sort_order ?? 0;
  if (body.sort_order == null) {
    const { count } = await sb
      .from("uni_course_objectives")
      .select("id", { count: "exact", head: true })
      .eq("course_id", body.course_id);
    sortOrder = count ?? 0;
  }

  const { data, error } = await sb
    .from("uni_course_objectives")
    .insert({
      course_id:  body.course_id,
      objective:  body.objective.trim(),
      sort_order: sortOrder,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

// PATCH /api/university/admin/objectives — update text
export async function PATCH(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { id: string; objective?: string; sort_order?: number };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  if (!body.id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updates: Record<string, unknown> = {};
  if (body.objective !== undefined) updates.objective = body.objective.trim();
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("uni_course_objectives")
    .update(updates)
    .eq("id", body.id)
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/university/admin/objectives?id=xxx
export async function DELETE(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityTrainer(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const sb = createServiceClient();
  const { error } = await sb.from("uni_course_objectives").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
