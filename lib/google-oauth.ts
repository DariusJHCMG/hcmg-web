import { google } from "googleapis";
import { readSettings, writeSettings } from "@/lib/company-settings";

/**
 * Returns an authenticated OAuth2 client using the stored refresh token.
 * Automatically refreshes the access token if expired and saves the new one.
 */
export async function getOAuthClient() {
  const clientId     = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET not set.");
  }

  const settings = await readSettings();
  if (!settings.google_refresh_token) {
    throw new Error("Google account not connected. Go to Admin → Settings and click 'Connect Google Account'.");
  }

  const site = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

  const oauth2 = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${site}/api/auth/google/callback`,
  );

  oauth2.setCredentials({
    access_token:  settings.google_access_token  || undefined,
    refresh_token: settings.google_refresh_token,
    expiry_date:   settings.google_token_expiry
      ? new Date(settings.google_token_expiry).getTime()
      : undefined,
  });

  // When googleapis auto-refreshes, save the new tokens back to settings
  oauth2.on("tokens", async (tokens) => {
    await writeSettings({
      ...(tokens.access_token  && { google_access_token:  tokens.access_token }),
      ...(tokens.refresh_token && { google_refresh_token: tokens.refresh_token }),
      ...(tokens.expiry_date   && { google_token_expiry:  new Date(tokens.expiry_date).toISOString() }),
    });
  });

  return oauth2;
}
