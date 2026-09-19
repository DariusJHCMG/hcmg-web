import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// GET /api/university/verify/[verificationId]
//
// PUBLIC endpoint — no auth required.
// Used by PDF QR codes and verification links to confirm certificate validity.
// Returns minimal public data only — no sensitive employee details.

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ verificationId: string }> }
) {
  const { verificationId } = await params;

  if (!verificationId) {
    return NextResponse.json({ valid: false }, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  const sb = createServiceClient();

  const { data: cert } = await sb
    .from("uni_certificates")
    .select(`
      id,
      issued_at,
      expires_at,
      revoked_at,
      revocation_reason,
      verification_id,
      uni_courses!inner ( id, title ),
      profiles!profile_id ( full_name )
    `)
    .eq("verification_id", verificationId)
    .maybeSingle();

  if (!cert) {
    return NextResponse.json({ valid: false }, {
      headers: { "Cache-Control": "no-store" },
    });
  }

  // Determine status
  let status: "active" | "expired" | "revoked";
  if (cert.revoked_at) {
    status = cert.revocation_reason === "expired" ? "expired" : "revoked";
  } else if (cert.expires_at && new Date(cert.expires_at) < new Date()) {
    status = "expired";
  } else {
    status = "active";
  }

  const courseInfo  = cert.uni_courses as unknown as { id: string; title: string } | null;
  const profileInfo = cert.profiles    as unknown as { full_name: string } | null;

  return NextResponse.json(
    {
      valid:        status === "active",
      status,
      learner_name: profileInfo?.full_name ?? "HCMG Employee",
      course_title: courseInfo?.title ?? "HCMG U Course",
      issued_at:    cert.issued_at,
      expires_at:   cert.expires_at,
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
