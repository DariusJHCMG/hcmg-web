import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getCurrentProfile } from "@/lib/auth";
import { readSettings } from "@/lib/company-settings";

// ── Auth helper ───────────────────────────────────────────────────────────────
// Uses Workload Identity Federation via manual STS token exchange.
// GOOGLE_APPLICATION_CREDENTIALS_JSON: config JSON from GCP (external_account).
// VERCEL_OIDC_TOKEN: injected by Vercel at runtime when OIDC is enabled.
async function buildAccessToken(scopes: string): Promise<string | null> {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;
  if (!raw || !oidcToken) return null;

  let config: {
    audience: string;
    service_account_impersonation_url?: string;
    token_url: string;
  };
  try {
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf-8");
    config = JSON.parse(json);
  } catch {
    return null;
  }

  // Step 1: Exchange Vercel OIDC token → Google STS federated token
  const stsBody = new URLSearchParams({
    grant_type:           "urn:ietf:params:oauth:grant-type:token-exchange",
    audience:             config.audience,
    scope:                "https://www.googleapis.com/auth/cloud-platform",
    requested_token_type: "urn:ietf:params:oauth:token-type:access_token",
    subject_token:        oidcToken,
    subject_token_type:   "urn:ietf:params:oauth:token-type:jwt",
  });

  const stsRes = await fetch(config.token_url, {
    method:  "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body:    stsBody.toString(),
  });
  if (!stsRes.ok) {
    const err = await stsRes.text();
    throw new Error(`STS exchange failed: ${err}`);
  }
  const { access_token: federatedToken } = await stsRes.json() as { access_token: string };

  // Step 2: Impersonate service account → scoped access token
  if (!config.service_account_impersonation_url) return federatedToken;

  const impersonateRes = await fetch(`${config.service_account_impersonation_url}`, {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${federatedToken}`,
    },
    body: JSON.stringify({ scope: scopes.split(" "), lifetime: "3600s" }),
  });
  if (!impersonateRes.ok) {
    const err = await impersonateRes.text();
    throw new Error(`Service account impersonation failed: ${err}`);
  }
  const { accessToken } = await impersonateRes.json() as { accessToken: string };
  return accessToken;
}

export async function GET() {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    return NextResponse.json(
      { error: "GOOGLE_APPLICATION_CREDENTIALS_JSON env var not set. Add the Workload Identity config JSON to Vercel environment variables." },
      { status: 503 },
    );
  }
  if (!process.env.VERCEL_OIDC_TOKEN) {
    return NextResponse.json(
      { error: "VERCEL_OIDC_TOKEN not available. Enable it in Vercel project Settings → General → Vercel OIDC Token." },
      { status: 503 },
    );
  }

  const settings = await readSettings();
  if (!settings.ga4_property_id) {
    return NextResponse.json(
      { error: "GA4 Property ID not configured. Add it in Admin → Settings." },
      { status: 503 },
    );
  }

  try {
    const accessToken = await buildAccessToken("https://www.googleapis.com/auth/analytics.readonly");
    if (!accessToken) {
      return NextResponse.json({ error: "Failed to obtain access token via Workload Identity Federation." }, { status: 503 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const analyticsdata = google.analyticsdata({ version: "v1beta", auth });
    const prop = `properties/${settings.ga4_property_id.replace(/^properties\//, "")}`;

    const [overviewRes, channelRes, topPagesRes, deviceRes] = await Promise.all([
      analyticsdata.properties.runReport({
        property: prop,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "screenPageViews" },
            { name: "engagementRate" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
            { name: "newUsers" },
          ],
        },
      }),
      analyticsdata.properties.runReport({
        property: prop,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
          limit: "10",
        },
      }),
      analyticsdata.properties.runReport({
        property: prop,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "landingPagePlusQueryString" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "bounceRate" }],
          limit: "10",
        },
      }),
      analyticsdata.properties.runReport({
        property: prop,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        },
      }),
    ]);

    const mv = overviewRes.data.rows?.[0]?.metricValues ?? [];
    const overview = {
      sessions:           Number(mv[0]?.value ?? 0),
      totalUsers:         Number(mv[1]?.value ?? 0),
      pageviews:          Number(mv[2]?.value ?? 0),
      engagementRate:     Number((Number(mv[3]?.value ?? 0) * 100).toFixed(1)),
      bounceRate:         Number((Number(mv[4]?.value ?? 0) * 100).toFixed(1)),
      avgSessionDuration: Number(Number(mv[5]?.value ?? 0).toFixed(0)),
      newUsers:           Number(mv[6]?.value ?? 0),
      returningUsers:     Math.max(0, Number(mv[1]?.value ?? 0) - Number(mv[6]?.value ?? 0)),
    };

    const channels = (channelRes.data.rows ?? []).map((r) => ({
      channel:  r.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
      users:    Number(r.metricValues?.[1]?.value ?? 0),
    }));

    const topPages = (topPagesRes.data.rows ?? []).map((r) => ({
      page:       r.dimensionValues?.[0]?.value ?? "/",
      sessions:   Number(r.metricValues?.[0]?.value ?? 0),
      users:      Number(r.metricValues?.[1]?.value ?? 0),
      bounceRate: Number((Number(r.metricValues?.[2]?.value ?? 0) * 100).toFixed(1)),
    }));

    const devices = (deviceRes.data.rows ?? []).map((r) => ({
      device:   r.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
      users:    Number(r.metricValues?.[1]?.value ?? 0),
    }));

    return NextResponse.json({ ok: true, period: "Last 30 days", overview, channels, topPages, devices });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `GA4 API error: ${msg}` }, { status: 500 });
  }
}
