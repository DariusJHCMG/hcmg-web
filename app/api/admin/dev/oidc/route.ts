import { NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";

export async function GET() {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(caller)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const token = process.env.VERCEL_OIDC_TOKEN;
  return NextResponse.json({
    vercel_oidc_token_present: !!token,
    vercel_oidc_token_length:  token?.length ?? 0,
    vercel_oidc_token_preview: token ? `${token.slice(0, 20)}...` : null,
  });
}
