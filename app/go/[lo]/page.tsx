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

  // Validate slug is active — look up the base funnel_link (no funnel_type)
  const { data: link, error } = await sb
    .from("funnel_links")
    .select("lo_slug, clicks, is_active")
    .eq("lo_slug", slug)
    .is("funnel_type", null)
    .maybeSingle();

  // Fall back to the old single() behaviour for legacy rows that predate funnel_type column
  if (!link) {
    const { data: legacy, error: legacyErr } = await sb
      .from("funnel_links")
      .select("lo_slug, clicks, is_active")
      .eq("lo_slug", slug)
      .single();
    if (legacyErr || !legacy || !legacy.is_active) notFound();

    void sb
      .from("funnel_links")
      .update({ clicks: (legacy.clicks ?? 0) + 1 })
      .eq("lo_slug", slug);

    const SITE2 = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/+$/, "");
    const UTM2 = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
    const utmParams2 = UTM2
      .map(p => { const v = query[p]; return v ? `${p}=${encodeURIComponent(Array.isArray(v) ? v[0] : v)}` : null; })
      .filter(Boolean).join("&");
    redirect(`${SITE2}/get-started?lo=${encodeURIComponent(slug)}${utmParams2 ? `&${utmParams2}` : ""}`);
  }

  if (error || !link.is_active) notFound();

  // Increment click counter (best-effort, fire-and-forget)
  void sb
    .from("funnel_links")
    .update({ clicks: (link.clicks ?? 0) + 1 })
    .eq("lo_slug", slug)
    .is("funnel_type", null);

  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/+$/, "");
  const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const utmParams = UTM
    .map(p => { const v = query[p]; return v ? `${p}=${encodeURIComponent(Array.isArray(v) ? v[0] : v)}` : null; })
    .filter(Boolean).join("&");

  const dest = `${SITE}/get-started?lo=${encodeURIComponent(slug)}${utmParams ? `&${utmParams}` : ""}`;
  redirect(dest);
}
