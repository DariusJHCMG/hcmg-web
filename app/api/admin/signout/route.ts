import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  // Use request URL as base so it works on any domain (Vercel preview, custom domain, localhost)
  return NextResponse.redirect(new URL("/login", request.url));
}
