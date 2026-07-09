import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getCurrentProfile } from "@/lib/auth";
import { readSettings } from "@/lib/company-settings";
import { getOAuthClient } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Optional ?lo=slug param — filters GA4 data to pages for that LO only
  const loSlug = new URL(request.url).searchParams.get("lo") ?? null;

  const settings = await readSettings();
  if (!settings.google_refresh_token) {
    return NextResponse.json(
      { error: "Google account not connected. Go to Admin → Settings and click 'Connect Google Account'." },
      { status: 503 },
    );
  }
  if (!settings.ga4_property_id) {
    return NextResponse.json(
      { error: "GA4 Property ID not configured. Add it in Admin → Settings." },
      { status: 503 },
    );
  }

  // Build GA4 dimension filter for LO-scoped view
  // Matches pages like /get-started?lo=their-slug and /portal/their-slug/*
  const loPageFilter = loSlug ? {
    filter: {
      fieldName: "landingPagePlusQueryString",
      stringFilter: {
        matchType: "CONTAINS" as const,
        value: loSlug,
        caseSensitive: false,
      },
    },
  } : undefined;

  try {
    const auth = await getOAuthClient();
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
          ...(loPageFilter && { dimensionFilter: loPageFilter }),
        },
      }),
      analyticsdata.properties.runReport({
        property: prop,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
          limit: "10",
          ...(loPageFilter && { dimensionFilter: loPageFilter }),
        },
      }),
      analyticsdata.properties.runReport({
        property: prop,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "landingPagePlusQueryString" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }, { name: "bounceRate" }],
          limit: "10",
          ...(loPageFilter && { dimensionFilter: loPageFilter }),
        },
      }),
      analyticsdata.properties.runReport({
        property: prop,
        requestBody: {
          dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "sessions" }, { name: "totalUsers" }],
          ...(loPageFilter && { dimensionFilter: loPageFilter }),
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
