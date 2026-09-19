import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";

// POST — issue or revoke a certificate (university_admin only)
export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { action: "issue" | "revoke"; profile_id: string; course_id: string };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  const { action, profile_id, course_id } = body;
  if (!action || !profile_id || !course_id) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const sb = createServiceClient();

  if (action === "issue") {
    const { error } = await sb.from("uni_certificates").upsert(
      { profile_id, course_id, issued_by: profile.id, revoked_at: null },
      { onConflict: "profile_id,course_id" }
    );
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logUniAudit("certificate_issued", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "certificate",
      details: { profile_id, course_id },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "revoke") {
    const { error } = await sb.from("uni_certificates")
      .update({ revoked_at: new Date().toISOString() })
      .eq("profile_id", profile_id)
      .eq("course_id", course_id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await logUniAudit("certificate_revoked", {
      actorId: profile.id,
      actorEmail: profile.email,
      entityType: "certificate",
      details: { profile_id, course_id },
      ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
    });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
