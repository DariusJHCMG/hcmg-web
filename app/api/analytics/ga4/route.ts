import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getCurrentProfile } from "@/lib/auth";
import { readSettings } from "@/lib/company-settings";

function getAuth(scopes: string[]) {
  const email = process.env.GOOGLE_SA_CLIENT_EMAIL;
  const key   = process.env.GOOGLE_SA_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!email || !key) return null;
  return new google.auth.JWT({ email, key, scopes });
}

export async function GET() {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const auth = getAuth(["https://www.googleapis.com/auth/analytics.readonly"]);
  if (!auth) {
    return NextResponse.json(
      { error: "Google service account not configured. Add GOOGLE_SA_CLIENT_EMAIL and GOOGLE_SA_PRIVATE_KEY to Vercel environment variables." },
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
