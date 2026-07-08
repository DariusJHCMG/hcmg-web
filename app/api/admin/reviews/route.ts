import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isAdmin } from "@/lib/auth";

export async function GET() {
  const caller = await getCurrentProfile();
  if (!caller || !isAdmin(caller)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const sb = createServiceClient();
  const { data, error } = await sb
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data ?? [] });
}
