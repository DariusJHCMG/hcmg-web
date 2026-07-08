import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";
import { getFunnelBySlug } from "@/lib/funnel-catalog";

interface Props {
  params: Promise<{ lo: string; funnel: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

export default async function LoFunnelRedirect({ params, searchParams }: Props) {
  const { lo: loSlug, funnel: funnelSlug } = await params;
  const query = await searchParams;

  // Validate funnel slug exists in our catalog
  const funnelDef = getFunnelBySlug(funnelSlug);
  if (!funnelDef) notFound();

  const sb = createServiceClient();

  // Validate LO slug is active — any row for this LO is enough to confirm they exist
  const { data: rows } = await sb
    .from("funnel_links")
    .select("lo_slug, clicks, is_active")
    .eq("lo_slug", loSlug)
    .eq("is_active", true)
    .limit(1);

  if (!rows?.[0]) notFound();

  // Best-effort click increment (ignore errors — funnel_type column may not exist yet)
  void sb
    .from("funnel_links")
    .update({ clicks: (rows[0].clicks ?? 0) + 1 })
    .eq("lo_slug", loSlug)
    .eq("is_active", true);

  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/+$/, "");
  const UTM  = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  const utmParams = UTM
    .map(p => {
      const v = query[p];
      return v ? `${p}=${encodeURIComponent(Array.isArray(v) ? v[0] : v)}` : null;
    })
    .filter(Boolean)
    .join("&");

  redirect(`${SITE}/get-started?lo=${encodeURIComponent(loSlug)}&funnel=${encodeURIComponent(funnelSlug)}${utmParams ? `&${utmParams}` : ""}`);
}
