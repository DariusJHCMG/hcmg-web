import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isUniversityAdmin } from "@/lib/auth";

// GET  /api/university/admin/settings  → returns all uni_settings rows
// POST /api/university/admin/settings  → upsert a key/value pair
//   Body: { key: string; value: string | null }

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = createServiceClient();
  const { data } = await sb.from("uni_settings").select("key, value, updated_at");
  return NextResponse.json({ settings: data ?? [] });
}

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isUniversityAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { key: string; value: string | null };
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }

  if (!body.key) return NextResponse.json({ error: "key is required" }, { status: 400 });

  const sb = createServiceClient();
  await sb
    .from("uni_settings")
    .upsert({ key: body.key, value: body.value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  return NextResponse.json({ ok: true });
}
