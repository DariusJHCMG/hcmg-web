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

  // Find any active funnel_link for this LO slug.
  // We do NOT filter on funnel_type here because:
  //  a) the column may not exist yet (migration pending), and
  //  b) for the base /go/[lo] route we just need to know the LO is valid.
  const { data: rows } = await sb
    .from("funnel_links")
    .select("lo_slug, clicks, is_active")
    .eq("lo_slug", slug)
    .eq("is_active", true)
    .limit(1);

  const link = rows?.[0] ?? null;
  if (!link) notFound();

  // Increment click counter on the first matching row (best-effort)
  void sb
    .from("funnel_links")
    .update({ clicks: (link.clicks ?? 0) + 1 })
    .eq("lo_slug", slug)
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

  redirect(`${SITE}/get-started?lo=${encodeURIComponent(slug)}${utmParams ? `&${utmParams}` : ""}`);
}
