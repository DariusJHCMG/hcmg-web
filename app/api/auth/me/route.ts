import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ role: null }, { status: 401 });
  return NextResponse.json({ role: profile.role });
}
