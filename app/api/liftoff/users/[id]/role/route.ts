import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

const VALID_ROLES = ["liftoff_admin", "liftoff_team", "lock_desk_admin", "lock_desk_agent", "ops_manager", "help_desk_agent", "processor"];

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
  let body: { liftoff_roles?: string[] };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const roles = body.liftoff_roles ?? [];
  if (!Array.isArray(roles)) {
    return NextResponse.json({ error: "liftoff_roles must be an array" }, { status: 400 });
  }
  const invalid = roles.find(r => !VALID_ROLES.includes(r));
  if (invalid) {
    return NextResponse.json({ error: `Invalid liftoff_role: ${invalid}` }, { status: 400 });
  }

  const sb = createServiceClient();
  const { error } = await sb
    .from("profiles")
    .update({ liftoff_roles: roles })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
