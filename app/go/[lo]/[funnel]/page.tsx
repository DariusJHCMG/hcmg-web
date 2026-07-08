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

  // Validate LO slug is active
  const { data: link, error } = await sb
    .from("funnel_links")
    .select("lo_slug, clicks, is_active")
    .eq("lo_slug", loSlug)
    .is("funnel_type", null)   // base LO record
    .single();

  if (error || !link || !link.is_active) notFound();

  // Increment click counter on the LO-funnel specific row if it exists,
  // or fall back to incrementing the base row (best-effort)
  const { data: variantRow } = await sb
    .from("funnel_links")
    .select("id, clicks")
    .eq("lo_slug", loSlug)
    .eq("funnel_type", funnelSlug)
    .maybeSingle();

  if (variantRow) {
    void sb
      .from("funnel_links")
      .update({ clicks: (variantRow.clicks ?? 0) + 1 })
      .eq("id", variantRow.id);
  } else {
    void sb
      .from("funnel_links")
      .update({ clicks: (link.clicks ?? 0) + 1 })
      .eq("lo_slug", loSlug)
      .is("funnel_type", null);
  }

  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/+$/, "");

  const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const utmParams = UTM
    .map(p => { const v = query[p]; return v ? `${p}=${encodeURIComponent(Array.isArray(v) ? v[0] : v)}` : null; })
    .filter(Boolean)
    .join("&");

  const dest = `${SITE}/get-started?lo=${encodeURIComponent(loSlug)}&funnel=${encodeURIComponent(funnelSlug)}${utmParams ? `&${utmParams}` : ""}`;

  redirect(dest);
}
