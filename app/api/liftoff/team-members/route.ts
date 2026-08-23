import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, canAccessLiftOffQueue } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessLiftOffQueue(profile)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const role = req.nextUrl.searchParams.get("role");

  const sb = createServiceClient();
  let query = sb
    .from("profiles")
    .select("id, full_name, email, liftoff_roles, avatar_url")
    .order("full_name");

  if (role) {
    query = query.contains("liftoff_roles", [role]);
  } else {
    query = query.not("liftoff_roles", "eq", "{}");
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ members: data ?? [] });
}
