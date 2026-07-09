import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getCurrentProfile } from "@/lib/auth";
import { readSettings } from "@/lib/company-settings";

// ── Auth helper ───────────────────────────────────────────────────────────────
// GOOGLE_APPLICATION_CREDENTIALS_JSON: Workload Identity Federation config JSON
// downloaded from Google Cloud Console (external_account type — no private key).
function getGoogleCredentials(): Record<string, unknown> | null {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (!raw) return null;
  try {
    const json = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function GET() {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const credentials = getGoogleCredentials();
  if (!credentials) {
    return NextResponse.json(
      { error: "GOOGLE_APPLICATION_CREDENTIALS_JSON env var not set. Add the Workload Identity config JSON to Vercel environment variables." },
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

  const propertyId = settings.ga4_property_id.replace(/^properties\//, "");

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
    });

    const analyticsdata = google.analyticsdata({ version: "v1beta", auth });

    const prop = `properties/${propertyId}`;

    const [overviewRes, channelRes, topPagesRes, deviceRes] = await Promise.all([
      // Overall metrics
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

      // Traffic channels
      analyticsdata.properties.runReport({
        property: prop,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
          limit: "10",
        },
      }),

      // Top landing pages
      analyticsdata.properties.runReport({
        property: prop,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "landingPagePlusQueryString" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "bounceRate" }],
          limit: "10",
        },
      }),

      // Device split
      analyticsdata.properties.runReport({
        property: prop,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
        },
      }),
    ]);

    // ── Overview ──────────────────────────────────────────────────────────────
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

    // ── Channels ──────────────────────────────────────────────────────────────
    const channels = (channelRes.data.rows ?? []).map((r) => ({
      channel:  r.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
      users:    Number(r.metricValues?.[1]?.value ?? 0),
    }));

    // ── Top pages ─────────────────────────────────────────────────────────────
    const topPages = (topPagesRes.data.rows ?? []).map((r) => ({
      page:       r.dimensionValues?.[0]?.value ?? "/",
      sessions:   Number(r.metricValues?.[0]?.value ?? 0),
      users:      Number(r.metricValues?.[1]?.value ?? 0),
      bounceRate: Number((Number(r.metricValues?.[2]?.value ?? 0) * 100).toFixed(1)),
    }));

    // ── Devices ───────────────────────────────────────────────────────────────
    const devices = (deviceRes.data.rows ?? []).map((r) => ({
      device:   r.dimensionValues?.[0]?.value ?? "Unknown",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
      users:    Number(r.metricValues?.[1]?.value ?? 0),
    }));

    return NextResponse.json({
      ok: true,
      period: "Last 30 days",
      overview,
      channels,
      topPages,
      devices,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `GA4 API error: ${msg}` }, { status: 500 });
  }
}
