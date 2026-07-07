import { redirect, notFound } from "next/navigation";
import { createServiceClient } from "@/lib/supabase";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

export default async function FunnelRedirect({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;

  const sb = createServiceClient();

  // Validate slug is active
  const { data: link, error } = await sb
    .from("funnel_links")
    .select("lo_slug, clicks, is_active")
    .eq("lo_slug", slug)
    .single();

  if (error || !link || !link.is_active) notFound();

  // Increment click counter (best-effort, fire-and-forget)
  void sb
    .from("funnel_links")
    .update({ clicks: (link.clicks ?? 0) + 1 })
    .eq("lo_slug", slug);

  // Build destination — get-started page with LO context + UTM passthrough
  // Avoid new URL() constructor — build string directly to prevent crashes
  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/+$/, "");
  
  const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  const utmParams = UTM
    .map(p => { const v = query[p]; return v ? `${p}=${encodeURIComponent(Array.isArray(v) ? v[0] : v)}` : null; })
    .filter(Boolean)
    .join("&");

  const dest = `${SITE}/get-started?lo=${encodeURIComponent(slug)}${utmParams ? `&${utmParams}` : ""}`;

  redirect(dest);
}
