import { NextResponse } from "next/server";
import { google } from "googleapis";
import { ExternalAccountClient } from "google-auth-library";
import { getCurrentProfile } from "@/lib/auth";
import { readSettings } from "@/lib/company-settings";

// ── Auth helper ───────────────────────────────────────────────────────────────
// Builds a GoogleAuth client using Workload Identity Federation.
// GOOGLE_APPLICATION_CREDENTIALS_JSON: the config JSON downloaded from GCP.
// VERCEL_OIDC_TOKEN: injected by Vercel at runtime (must be enabled in project settings).
function buildAuth(scopes: string[]) {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) return null;

  let config: Record<string, unknown>;
  try {
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf-8");
    config = JSON.parse(json);
  } catch {
    return null;
  }

  const oidcToken = process.env.VERCEL_OIDC_TOKEN;
  if (!oidcToken) return null;

  const client = ExternalAccountClient.fromJSON({
    ...config,
    credential_source: undefined,
    subject_token_supplier: {
      getSubjectToken: async () => oidcToken,
    },
  } as Parameters<typeof ExternalAccountClient.fromJSON>[0]);

  if (!client) return null;
  client.scopes = scopes;
  return client;
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
      { error: "VERCEL_OIDC_TOKEN not available. Enable OIDC token generation in your Vercel project settings (Settings → General → Vercel OIDC Token)." },
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

  const auth = buildAuth(["https://www.googleapis.com/auth/webmasters.readonly"]);
  if (!auth) {
    return NextResponse.json({ error: "Failed to build Google auth client. Check GOOGLE_APPLICATION_CREDENTIALS_JSON format." }, { status: 503 });
  }

  const siteUrl = settings.gsc_property;

  try {
    const searchconsole = google.searchconsole({ version: "v1", auth });

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
