/**
 * GET /api/liftoff/starting-now/referrals
 * Returns Starting Now referrals for the current user.
 * Admins/developers can pass ?all=true to see all LOs' referrals.
 * Auth: authenticated user session.
 */

import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = profile.role === "admin" || profile.role === "developer";
  const showAll = isAdmin && req.nextUrl.searchParams.get("all") === "true";

  const sb = createServiceClient();
  let query = sb
    .from("starting_now_referrals")
    .select("*")
    .order("created_at", { ascending: false });

  if (!showAll) {
    query = query.eq("submitter_id", profile.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[starting-now/referrals]", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ referrals: data ?? [], total: (data ?? []).length });
}
