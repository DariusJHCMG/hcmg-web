import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { getCurrentProfile } from "@/lib/auth";
import { readSettings } from "@/lib/company-settings";
import { getOAuthClient } from "@/lib/google-oauth";

export async function GET(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Optional ?lo=slug param — filters GSC data to pages containing that slug
  const loSlug = new URL(request.url).searchParams.get("lo") ?? null;

  const settings = await readSettings();
  if (!settings.google_refresh_token) {
    return NextResponse.json(
      { error: "Google account not connected. Go to Admin → Settings and click 'Connect Google Account'." },
      { status: 503 },
    );
  }
  if (!settings.gsc_property) {
    return NextResponse.json(
      { error: "GSC property URL not configured. Add it in Admin → Settings." },
      { status: 503 },
    );
  }

  try {
    const auth = await getOAuthClient();
    const searchconsole = google.searchconsole({ version: "v1", auth });

    // Normalise: GSC requires exact match — try stored value first,
    // then with trailing slash, then without.
    const raw = settings.gsc_property.trim();
    const candidates = Array.from(new Set([
      raw,
      raw.endsWith("/") ? raw : `${raw}/`,
      raw.endsWith("/") ? raw.slice(0, -1) : raw,
    ]));

    // Find the first URL that GSC accepts
    let siteUrl = raw;
    for (const candidate of candidates) {
      try {
        await searchconsole.searchanalytics.query({
          siteUrl: candidate,
          requestBody: { startDate: "2024-01-01", endDate: "2024-01-01", type: "web" },
        });
        siteUrl = candidate;
        break;
      } catch {
        // try next
      }
    }

    const endDate   = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 31 * 86400000).toISOString().slice(0, 10);

    // GSC page filter — only include pages whose URL contains the LO slug
    const pageFilter = loSlug ? {
      dimensionFilterGroups: [{
        filters: [{
          dimension:  "page",
          operator:   "contains",
          expression: loSlug,
        }],
      }],
    } : {};

    const [overviewRes, topQueriesRes, topPagesRes] = await Promise.all([
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, type: "web", ...pageFilter },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, type: "web", dimensions: ["query"], rowLimit: 25, ...pageFilter },
      }),
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: { startDate, endDate, type: "web", dimensions: ["page"], rowLimit: 25, ...pageFilter },
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
