import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";

// ── PATCH /api/university/admin/media/[assetId]
// ── DELETE /api/university/admin/media/[assetId]
// ────────────────────────────────────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await params;
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const sb = createServiceClient();

  const { data: existing } = await sb
    .from("uni_media_assets")
    .select("id, name")
    .eq("id", assetId)
    .single();

  if (!existing) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

  const allowed = ["name", "description", "duration_secs"];
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { data, error } = await sb
    .from("uni_media_assets")
    .update(updates)
    .eq("id", assetId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ asset: data });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ assetId: string }> }
) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await params;
  const sb = createServiceClient();

  const { data: existing } = await sb
    .from("uni_media_assets")
    .select("id, name, storage_path, media_type")
    .eq("id", assetId)
    .single();

  if (!existing) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

  // Soft-archive: mark as archived instead of deleting the storage file
  const { error } = await sb
    .from("uni_media_assets")
    .update({ is_archived: true, updated_at: new Date().toISOString() })
    .eq("id", assetId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("media_archived", {
    actorId:    profile.id,
    actorEmail: profile.email,
    entityType: "media_asset",
    entityId:   assetId,
    details:    { name: existing.name, media_type: existing.media_type },
  });

  return NextResponse.json({ ok: true });
}
