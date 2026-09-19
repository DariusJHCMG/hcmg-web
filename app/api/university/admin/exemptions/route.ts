import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityAdmin, logUniAudit } from "@/lib/auth";

// GET  /api/university/admin/exemptions — list all exemptions (university_admin)
// POST /api/university/admin/exemptions — grant a new exemption (university_admin)

export async function GET() {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("uni_cert_exemptions")
    .select(`
      id, justification, granted_at, expires_at, revoked_at,
      profile_id, course_id,
      profiles:profile_id ( full_name, email, department ),
      uni_courses:course_id ( title ),
      grantor:granted_by ( full_name )
    `)
    .order("granted_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Support both JSON body (API) and HTML form submit (native form POST)
  const contentType = request.headers.get("content-type") ?? "";
  let profile_id: string | null = null;
  let course_id: string | null = null;
  let justification: string | null = null;
  let expires_at: string | null = null;

  if (contentType.includes("application/json")) {
    let body: { profile_id?: string; course_id?: string; justification?: string; expires_at?: string };
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
    profile_id    = body.profile_id ?? null;
    course_id     = body.course_id ?? null;
    justification = body.justification ?? null;
    expires_at    = body.expires_at ?? null;
  } else {
    // application/x-www-form-urlencoded (native form)
    const fd = await request.formData();
    profile_id    = (fd.get("profile_id") as string) ?? null;
    course_id     = (fd.get("course_id") as string) ?? null;
    justification = (fd.get("justification") as string) ?? null;
    expires_at    = (fd.get("expires_at") as string) ?? null;
  }

  if (!profile_id || !course_id || !justification?.trim()) {
    return NextResponse.json({ error: "profile_id, course_id, and justification are required" }, { status: 400 });
  }
  if (justification.trim().length < 20) {
    return NextResponse.json({ error: "Justification must be at least 20 characters" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { data: exemption, error } = await sb
    .from("uni_cert_exemptions")
    .insert({
      profile_id,
      course_id,
      justification: justification.trim(),
      granted_by:    profile.id,
      granted_at:    new Date().toISOString(),
      expires_at:    expires_at || null,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await logUniAudit("exemption_granted", {
    actorId: profile.id,
    actorEmail: profile.email,
    entityType: "cert_exemption",
    entityId: exemption?.id,
    details: { profile_id, course_id, justification, expires_at },
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  // Redirect back to exemptions page for native form submits
  if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
    return NextResponse.redirect(new URL("/university/admin/exemptions", request.url), 303);
  }
  return NextResponse.json({ ok: true, id: exemption?.id });
}
