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

  const auth = getAuth(["https://www.googleapis.com/auth/webmasters.readonly"]);
  if (!auth) {
    return NextResponse.json(
      { error: "Google service account not configured. Add GOOGLE_SA_CLIENT_EMAIL and GOOGLE_SA_PRIVATE_KEY to Vercel environment variables." },
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
