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
  if (!settings.gsc_property) {
    return NextResponse.json(
      { error: "GSC property URL not configured. Add it in Admin → Settings." },
      { status: 503 },
    );
  }

  try {
    const accessToken = await buildAccessToken("https://www.googleapis.com/auth/webmasters.readonly");
    if (!accessToken) {
      return NextResponse.json({ error: "Failed to obtain access token via Workload Identity Federation." }, { status: 503 });
    }

    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const searchconsole = google.searchconsole({ version: "v1", auth });
    const siteUrl = settings.gsc_property;

    const endDate   = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 31 * 86400000).toISOString().slice(0, 10);

    const [overviewRes, topQueriesRes, topPagesRes] = await Promise.all([
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, type: "web" },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, type: "web", dimensions: ["query"], rowLimit: 25 },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, type: "web", dimensions: ["page"], rowLimit: 25 },
      }),
    ]);

    const totals = overviewRes.data.rows?.[0] ?? {};
    const overview = {
      clicks:      Number(totals.clicks      ?? 0),
      impressions: Number(totals.impressions ?? 0),
      ctr:         Number(((totals.ctr ?? 0) * 100).toFixed(2)),
      position:    Number((totals.position ?? 0).toFixed(1)),
    };

    const topQueries = (topQueriesRes.data.rows ?? []).map((r) => ({
      query:       r.keys?.[0] ?? "",
      clicks:      Number(r.clicks      ?? 0),
      impressions: Number(r.impressions ?? 0),
      ctr:         Number(((r.ctr ?? 0) * 100).toFixed(2)),
      position:    Number((r.position ?? 0).toFixed(1)),
    }));

    const topPages = (topPagesRes.data.rows ?? []).map((r) => ({
      page:        (r.keys?.[0] ?? "").replace(siteUrl.replace(/\/$/, ""), ""),
      clicks:      Number(r.clicks      ?? 0),
      impressions: Number(r.impressions ?? 0),
      ctr:         Number(((r.ctr ?? 0) * 100).toFixed(2)),
      position:    Number((r.position ?? 0).toFixed(1)),
    }));

    return NextResponse.json({ ok: true, period: `${startDate} → ${endDate}`, overview, topQueries, topPages });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `GSC API error: ${msg}` }, { status: 500 });
  }
}
