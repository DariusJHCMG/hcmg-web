import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";

interface Props {
  params: Promise<{ lo: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

export default async function FunnelRedirect({ params, searchParams }: Props) {
  const { lo: slug } = await params;
  const query = await searchParams;

  const sb = createServiceClient();

  // Validate LO exists and is active — use profiles as source of truth.
  // funnel_links may not be populated yet (backfill pending), so never gate on it.
  const { data: profile } = await sb
    .from("profiles")
    .select("lo_slug, is_active")
    .eq("lo_slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile) notFound();

  // Best-effort click counter increment — ignore if funnel_links row doesn't exist yet
  void sb
    .from("funnel_links")
    .update({ clicks: 1 })
    .eq("lo_slug", slug);

  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/+$/, "");
  const UTM  = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  const utmParams = UTM
    .map(p => {
      const v = query[p];
      return v ? `${p}=${encodeURIComponent(Array.isArray(v) ? v[0] : v)}` : null;
    })
    .filter(Boolean)
    .join("&");

  redirect(`${SITE}/get-started?lo=${encodeURIComponent(slug)}${utmParams ? `&${utmParams}` : ""}`);
}
