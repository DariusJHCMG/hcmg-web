import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getVerifiedProfile, isUniversityAdmin } from "@/lib/auth";

// ── POST /api/university/admin/media/upload-url
//   Returns a signed upload URL so the browser can PUT directly to Supabase Storage.
//   Body: { filename: string, media_type: string }
// ────────────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const profile = await getVerifiedProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const { filename, media_type } = body;
  if (!filename || !media_type) {
    return NextResponse.json({ error: "filename and media_type are required" }, { status: 400 });
  }

  // Build storage path: media_type/year-month/uuid-filename
  const now   = new Date();
  const ym    = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const uid   = crypto.randomUUID();
  const safe  = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path  = `${media_type}/${ym}/${uid}-${safe}`;

  const sb = createServiceClient();

  const { data, error } = await sb.storage
    .from("uni-media")
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Could not create upload URL" }, { status: 500 });
  }

  return NextResponse.json({
    upload_url:   data.signedUrl,
    storage_path: path,
    token:        data.token,
  });
}
