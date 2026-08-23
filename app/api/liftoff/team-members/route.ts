import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, canAccessLiftOffQueue } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessLiftOffQueue(profile)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // ?role=x  — single role filter
  // ?roles=x,y,z  — any-of filter (OR)
  const roleSingle = req.nextUrl.searchParams.get("role");
  const rolesParam = req.nextUrl.searchParams.get("roles");
  const roleFilter = rolesParam
    ? rolesParam.split(",").map(r => r.trim()).filter(Boolean)
    : roleSingle
    ? [roleSingle]
    : null;

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("profiles")
    .select("id, full_name, email, liftoff_roles, avatar_url")
    .not("liftoff_roles", "eq", "{}")
    .order("full_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const members = roleFilter
    ? (data ?? []).filter(m =>
        (m.liftoff_roles as string[]).some(r => roleFilter.includes(r))
      )
    : (data ?? []);

  return NextResponse.json({ members });
}
