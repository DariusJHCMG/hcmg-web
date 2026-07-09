import { Suspense } from "react";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile } from "@/lib/auth";
import { readSettings } from "@/lib/company-settings";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { AnalyticsScopeSwitcher } from "@/components/analytics/AnalyticsScopeSwitcher";
import type { AnalyticsData, StepReachRow } from "@/components/analytics/AnalyticsDashboard";

export const dynamic = "force-dynamic";

async function getAnalyticsData(loSlug?: string): Promise<AnalyticsData> {
  const sb = createServiceClient();

  const leadsQuery = loSlug
    ? sb.from("leads")
        .select("id,created_at,source,funnel_type,goal,credit_range,price_range,device,lo_slug,lo_name,utm_source,utm_medium,utm_campaign,status")
        .eq("lo_slug", loSlug)
        .order("created_at", { ascending: false })
    : sb.from("leads")
        .select("id,created_at,source,funnel_type,goal,credit_range,price_range,device,lo_slug,lo_name,utm_source,utm_medium,utm_campaign,status")
        .order("created_at", { ascending: false });

  const funnelLinksQuery = loSlug
    ? sb.from("funnel_links").select("lo_slug,funnel_type,clicks").eq("lo_slug", loSlug)
    : sb.from("funnel_links").select("lo_slug,funnel_type,clicks");

  const [
    { data: leads },
    { data: funnelLinks },
    { count: teamSize },
    { data: stepEvents },
    settings,
  ] = await Promise.all([
    leadsQuery,
    funnelLinksQuery,
    sb.from("profiles").select("*", { count: "exact", head: true }).eq("is_active", true),
    sb.from("lead_events").select("data").eq("event_type", "funnel_step"),
    readSettings(),
  ]);

  const stepCount = new Map<number, number>();
  for (const e of stepEvents ?? []) {
    const step = (e.data as Record<string, unknown>)?.step;
    if (typeof step === "number") stepCount.set(step, (stepCount.get(step) ?? 0) + 1);
  }
  const stepReach: StepReachRow[] = [...stepCount.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([step, reached]) => ({ step, reached }));

  return {
    leads:       (leads       ?? []) as AnalyticsData["leads"],
    funnelLinks: (funnelLinks ?? []) as AnalyticsData["funnelLinks"],
    stepReach,
    teamSize:    teamSize ?? 0,
    ga4Id:       settings.ga4_measurement_id || null,
    gscProperty: settings.gsc_property || null,
  };
}

export default async function AdminAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; lo?: string }>;
}) {
  const { view = "company", lo: loParam } = await searchParams;
  const profile = await getCurrentProfile();

  // Resolve active LO slug based on view
  const activeLo =
    view === "personal" ? (profile?.lo_slug ?? undefined) :
    view === "user"     ? (loParam || undefined) :
    undefined; // company = no filter

  const [data, { data: allProfiles }] = await Promise.all([
    getAnalyticsData(activeLo),
    createServiceClient().from("profiles").select("lo_slug,full_name").eq("is_active", true).order("full_name"),
  ]);

  const los = (allProfiles ?? [])
    .filter((p) => p.lo_slug)
    .map((p) => ({ slug: p.lo_slug!, name: p.full_name }));

  const scopeLabel =
    view === "personal" ? `My Analytics${profile?.full_name ? ` — ${profile.full_name}` : ""}` :
    view === "user" && loParam ? los.find((l) => l.slug === loParam)?.name ?? loParam :
    undefined; // undefined = default company label

  return (
    <div className="space-y-5">
      {/* Scope switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="ok-gradient-text text-[11px] font-bold uppercase tracking-[0.2em]">Analytics</p>
          <h1 className="mt-0.5 text-2xl font-extrabold text-ink">
            {view === "company"  ? "Company-Wide Analytics" :
             view === "personal" ? "My Analytics" :
             loParam ? `Analytics — ${los.find((l) => l.slug === loParam)?.name ?? loParam}` :
             "Select a User"}
          </h1>
        </div>
        <Suspense fallback={null}>
          <AnalyticsScopeSwitcher
            los={los}
            currentView={view}
            currentLo={loParam ?? ""}
          />
        </Suspense>
      </div>

      {/* Show empty state when "user" selected but no LO picked yet */}
      {view === "user" && !loParam ? (
        <div className="rounded-2xl border border-dashed border-line bg-sand/50 px-8 py-16 text-center">
          <p className="text-base font-extrabold text-ink">Select a loan officer above</p>
          <p className="mt-2 text-sm text-muted">Choose a user from the dropdown to view their individual analytics.</p>
        </div>
      ) : (
        <AnalyticsDashboard data={data} scope={view === "company" ? "admin" : "portal"} scopeLabel={scopeLabel} loSlug={activeLo} />
      )}
    </div>
  );
}
