import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

const VALID_ROLES = ["liftoff_admin", "liftoff_team", "lock_desk_admin", null];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (profile.role !== "admin" && profile.role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  let body: { liftoff_role?: string | null };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const role = body.liftoff_role ?? null;
  if (!VALID_ROLES.includes(role as string | null)) {
    return NextResponse.json({ error: "Invalid liftoff_role" }, { status: 400 });
  }

  const sb = createServiceClient();
  const { error } = await sb
    .from("profiles")
    .update({ liftoff_role: role })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
