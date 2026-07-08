import { createServiceClient } from "@/lib/supabase";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import type { AnalyticsData } from "@/components/analytics/AnalyticsDashboard";

export const dynamic = "force-dynamic";

async function getAnalyticsData(): Promise<AnalyticsData> {
  const sb = createServiceClient();

  const [
    { data: leads },
    { data: funnelLinks },
    { count: teamSize },
  ] = await Promise.all([
    sb.from("leads")
      .select("id,created_at,source,funnel_type,goal,credit_range,price_range,device,lo_slug,lo_name,utm_source,utm_medium,utm_campaign,status")
      .order("created_at", { ascending: false }),
    sb.from("funnel_links")
      .select("lo_slug,funnel_type,clicks"),
    sb.from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true),
  ]);

  return {
    leads:       (leads       ?? []) as AnalyticsData["leads"],
    funnelLinks: (funnelLinks ?? []) as AnalyticsData["funnelLinks"],
    teamSize:    teamSize ?? 0,
  };
}

export default async function AdminAnalyticsPage() {
  const data = await getAnalyticsData();
  return <AnalyticsDashboard data={data} scope="admin" />;
}
