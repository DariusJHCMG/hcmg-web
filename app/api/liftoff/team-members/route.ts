import { NextResponse } from "next/server";
import { getCurrentProfile, canAccessLiftOffQueue } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canAccessLiftOffQueue(profile)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("profiles")
    .select("id, full_name, liftoff_roles, avatar_url")
    .not("liftoff_roles", "eq", "{}")
    .order("full_name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}
