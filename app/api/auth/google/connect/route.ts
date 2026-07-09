import { NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";

const SCOPES = [
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export async function GET() {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(caller)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "GOOGLE_OAUTH_CLIENT_ID env var not set." },
      { status: 503 },
    );
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");
  const redirectUri = `${site}/api/auth/google/callback`;

  const params = new URLSearchParams({
    client_id:     clientId,
    redirect_uri:  redirectUri,
    response_type: "code",
    scope:         SCOPES,
    access_type:   "offline",
    prompt:        "consent",  // force refresh_token on every connect
  });

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  );
}
