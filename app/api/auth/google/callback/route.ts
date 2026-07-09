import { NextRequest, NextResponse } from "next/server";
import { writeSettings } from "@/lib/company-settings";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code  = searchParams.get("code");
  const error = searchParams.get("error");

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

  if (error || !code) {
    return NextResponse.redirect(`${site}/admin/settings?google_error=${error ?? "no_code"}`);
  }

  const clientId     = process.env.GOOGLE_OAUTH_CLIENT_ID!;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET!;
  const redirectUri  = `${site}/api/auth/google/callback`;

  try {
    // Exchange code for tokens
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id:     clientId,
        client_secret: clientSecret,
        redirect_uri:  redirectUri,
        grant_type:    "authorization_code",
      }).toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      throw new Error(`Token exchange failed: ${err}`);
    }

    const tokens = await tokenRes.json() as {
      access_token:  string;
      refresh_token: string;
      expires_in:    number;
      token_type:    string;
    };

    // Fetch the connected account email
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const user = userRes.ok
      ? await userRes.json() as { email: string }
      : { email: "" };

    // Save tokens to settings
    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString();
    await writeSettings({
      google_access_token:    tokens.access_token,
      google_refresh_token:   tokens.refresh_token,
      google_token_expiry:    expiry,
      google_connected_email: user.email,
    });

    return NextResponse.redirect(`${site}/admin/settings?google_connected=1`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.redirect(
      `${site}/admin/settings?google_error=${encodeURIComponent(msg)}`
    );
  }
}
