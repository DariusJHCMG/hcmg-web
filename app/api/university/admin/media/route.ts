import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";

// ── GET /api/university/admin/media
//   ?type=video|image|audio|document|presentation|caption
//   &search=query
//   &page=1
// ────────────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type   = searchParams.get("type");
  const search = searchParams.get("search") ?? "";
  const page   = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit  = 40;
  const offset = (page - 1) * limit;

  const sb = createServiceClient();

  let query = sb
    .from("uni_media_assets")
    .select("*", { count: "exact" })
    .eq("is_archived", false)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type && type !== "all") query = query.eq("media_type", type);
  if (search.trim()) query = query.ilike("name", `%${search.trim()}%`);

  const { data, count, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ assets: data ?? [], total: count ?? 0, page, limit });
}

// ── POST /api/university/admin/media
//   Registers a media asset after client-side Supabase Storage upload
//   Body: { name, media_type, storage_path, mime_type?, file_size?, duration_secs?, description? }
// ────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { name, media_type, storage_path, mime_type, file_size, duration_secs, description } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  if (!media_type)   return NextResponse.json({ error: "media_type is required" }, { status: 400 });
  if (!storage_path) return NextResponse.json({ error: "storage_path is required" }, { status: 400 });

  const validTypes = ["video","image","audio","document","presentation","caption"];
  if (!validTypes.includes(media_type)) {
    return NextResponse.json({ error: `Invalid media_type. Must be one of: ${validTypes.join(", ")}` }, { status: 400 });
  }

  const sb = createServiceClient();

  const { data, error } = await sb
    .from("uni_media_assets")
    .insert({
      uploaded_by:   profile.id,
      name:          name.trim(),
      media_type,
      storage_path,
      mime_type:     mime_type ?? null,
      file_size:     file_size ?? null,
      duration_secs: duration_secs ?? null,
      description:   description ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("media_uploaded", {
    actorId:    profile.id,
    actorEmail: profile.email,
    entityType: "media_asset",
    entityId:   data.id,
    details:    { name: data.name, media_type },
  });

  return NextResponse.json({ asset: data }, { status: 201 });
}
