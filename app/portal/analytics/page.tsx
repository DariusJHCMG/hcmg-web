import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import type { AnalyticsData } from "@/components/analytics/AnalyticsDashboard";

export const dynamic = "force-dynamic";

async function getLoAnalyticsData(loSlug: string): Promise<AnalyticsData> {
  const sb = createServiceClient();

  const [{ data: leads }, { data: funnelLinks }] = await Promise.all([
    sb.from("leads")
      .select("id,created_at,source,funnel_type,goal,credit_range,price_range,device,lo_slug,lo_name,utm_source,utm_medium,utm_campaign,status")
      .eq("lo_slug", loSlug)
      .order("created_at", { ascending: false }),
    sb.from("funnel_links")
      .select("lo_slug,funnel_type,clicks")
      .eq("lo_slug", loSlug),
  ]);

  return {
    leads:       (leads       ?? []) as AnalyticsData["leads"],
    funnelLinks: (funnelLinks ?? []) as AnalyticsData["funnelLinks"],
  };
}

export default async function PortalAnalyticsPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.lo_slug) redirect("/portal");

  const data = await getLoAnalyticsData(profile.lo_slug);
  return <AnalyticsDashboard data={data} scope="portal" />;
}
