import { NextResponse } from "next/server";
import { google } from "googleapis";
import { getCurrentProfile } from "@/lib/auth";
import { readSettings } from "@/lib/company-settings";

// ── Auth helper (shared with GA4 route) ──────────────────────────────────────
// GOOGLE_APPLICATION_CREDENTIALS_JSON: Workload Identity Federation config JSON
// downloaded from Google Cloud Console (external_account type — no private key).
function getGoogleCredentials() {
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
  if (!settings.gsc_property) {
    return NextResponse.json(
      { error: "GSC property URL not configured. Add it in Admin → Settings." },
      { status: 503 },
    );
  }

  const siteUrl = settings.gsc_property;

  try {
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
    });

    const searchconsole = google.searchconsole({ version: "v1", auth });

    // Date range: last 28 days (GSC max is today-3days due to data processing delay)
    const endDate   = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
    const startDate = new Date(Date.now() - 31 * 86400000).toISOString().slice(0, 10);

    const [overviewRes, topQueriesRes, topPagesRes] = await Promise.all([
      // Site-level totals
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          type: "web",
        },
      }),

      // Top queries — sorted server-side by impressions (default GSC order)
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          type:       "web",
          dimensions: ["query"],
          rowLimit:   25,
        },
      }),

      // Top pages — sorted server-side by clicks (default GSC order)
      searchconsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate,
          endDate,
          type:       "web",
          dimensions: ["page"],
          rowLimit:   25,
        },
      }),
    ]);

    // ── Parse overview ────────────────────────────────────────────────────────
    const totals = overviewRes.data.rows?.[0] ?? {};
    const overview = {
      clicks:      Number(totals.clicks      ?? 0),
      impressions: Number(totals.impressions ?? 0),
      ctr:         Number(((totals.ctr ?? 0) * 100).toFixed(2)),
      position:    Number((totals.position ?? 0).toFixed(1)),
    };

    // ── Parse top queries ─────────────────────────────────────────────────────
    const topQueries = (topQueriesRes.data.rows ?? []).map((r) => ({
      query:       r.keys?.[0] ?? "",
      clicks:      Number(r.clicks      ?? 0),
      impressions: Number(r.impressions ?? 0),
      ctr:         Number(((r.ctr ?? 0) * 100).toFixed(2)),
      position:    Number((r.position ?? 0).toFixed(1)),
    }));

    // ── Parse top pages ───────────────────────────────────────────────────────
    const topPages = (topPagesRes.data.rows ?? []).map((r) => ({
      page:        (r.keys?.[0] ?? "").replace(siteUrl.replace(/\/$/, ""), ""),
      clicks:      Number(r.clicks      ?? 0),
      impressions: Number(r.impressions ?? 0),
      ctr:         Number(((r.ctr ?? 0) * 100).toFixed(2)),
      position:    Number((r.position ?? 0).toFixed(1)),
    }));

    return NextResponse.json({
      ok: true,
      period: `${startDate} → ${endDate}`,
      overview,
      topQueries,
      topPages,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `GSC API error: ${msg}` }, { status: 500 });
  }
}
