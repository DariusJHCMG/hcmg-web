import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { readSettings } from "@/lib/company-settings";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import type { AnalyticsData, StepReachRow } from "@/components/analytics/AnalyticsDashboard";

export const dynamic = "force-dynamic";

async function getLoAnalyticsData(loSlug: string): Promise<AnalyticsData> {
  const sb = createServiceClient();

  const [
    { data: leads },
    { data: funnelLinks },
    { data: stepEvents },
    settings,
  ] = await Promise.all([
    sb.from("leads")
      .select("id,created_at,source,funnel_type,goal,credit_range,price_range,device,lo_slug,lo_name,utm_source,utm_medium,utm_campaign,status")
      .eq("lo_slug", loSlug)
      .order("created_at", { ascending: false }),
    sb.from("funnel_links")
      .select("lo_slug,funnel_type,clicks")
      .eq("lo_slug", loSlug),
    sb.from("lead_events")
      .select("data")
      .eq("event_type", "funnel_step"),
    readSettings(),
  ]);

  const stepCount = new Map<number, number>();
  for (const e of stepEvents ?? []) {
    const step = (e.data as Record<string, unknown>)?.step;
    if (typeof step === "number") {
      stepCount.set(step, (stepCount.get(step) ?? 0) + 1);
    }
  }
  const stepReach: StepReachRow[] = [...stepCount.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([step, reached]) => ({ step, reached }));

  return {
    leads:       (leads       ?? []) as AnalyticsData["leads"],
    funnelLinks: (funnelLinks ?? []) as AnalyticsData["funnelLinks"],
    stepReach,
    ga4Id:       settings.ga4_measurement_id || null,
    gscProperty: settings.gsc_property || null,
  };
}

export default async function PortalAnalyticsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.lo_slug) redirect("/portal");

  const data = await getLoAnalyticsData(profile.lo_slug);
  return <AnalyticsDashboard data={data} scope="portal" />;
}
