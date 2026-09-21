import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";

// POST /api/university/admin/exemptions/[id]/revoke
// Revokes an active exemption. university_admin only.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const sb = createServiceClient();

  // Verify the exemption exists and is not already revoked
  const { data: existing } = await sb
    .from("uni_cert_exemptions")
    .select("id, profile_id, course_id, revoked_at")
    .eq("id", id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: "Exemption not found" }, { status: 404 });
  }
  if (existing.revoked_at) {
    return NextResponse.json({ error: "Exemption is already revoked" }, { status: 409 });
  }

  const { error } = await sb
    .from("uni_cert_exemptions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("exemption_revoked", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "cert_exemption",
    entityId: id,
    details: { profile_id: existing.profile_id, course_id: existing.course_id },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  // Redirect back for native form submits
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return NextResponse.redirect(new URL("/university/admin/exemptions", request.url), 303);
  }
  return NextResponse.json({ ok: true });
}
