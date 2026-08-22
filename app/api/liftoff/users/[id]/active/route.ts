import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { createClient } from "@supabase/supabase-js";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "admin" && profile.role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  let body: { is_active?: boolean };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (typeof body.is_active !== "boolean") {
    return NextResponse.json({ error: "is_active must be a boolean" }, { status: 400 });
  }

  const { is_active } = body;

  // 1. Update the profile row
  const sb = createServiceClient();
  const { error: profileErr } = await sb
    .from("profiles")
    .update({ is_active })
    .eq("id", id);

  if (profileErr) return NextResponse.json({ error: profileErr.message }, { status: 500 });

  // 2. Sync Supabase Auth ban status
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  const { error: banErr } = await adminClient.auth.admin.updateUserById(id, {
    ban_duration: is_active ? "none" : "876600h", // 876600h ≈ 100 years
  });

  // Auth ban failure is non-fatal — profile is already updated
  if (banErr) console.error("[liftoff/users/active] auth ban error:", banErr.message);

  return NextResponse.json({ ok: true, is_active });
}
