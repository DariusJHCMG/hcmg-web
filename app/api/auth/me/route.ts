/**
 * GET /api/auth/me — returns the current authenticated user's role.
 * Used by client components to determine portal access without a full page reload.
 * Returns { role: null } with 401 if not authenticated.
 */
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ role: null }, { status: 401 });
  return NextResponse.json({ role: profile.role });
}
