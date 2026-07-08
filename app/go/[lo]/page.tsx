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
  sb.from("funnel_links")
    .select("clicks")
    .eq("lo_slug", slug)
    .is("funnel_type", null)
    .single()
    .then(({ data }) => {
      if (data) {
        void sb.from("funnel_links")
          .update({ clicks: (data.clicks ?? 0) + 1 })
          .eq("lo_slug", slug)
          .is("funnel_type", null);
      }
    });

  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/+$/, "");

  // Auto-tag with defaults so every click is tracked, even without manual UTM setup.
  // If the link already has a UTM param (e.g. from a paid ad), it wins over the default.
  function q(key: string) { const v = query[key]; return v ? (Array.isArray(v) ? v[0] : v) : null; }

  const utm_source   = q("utm_source")   ?? "lo-link";
  const utm_medium   = q("utm_medium")   ?? "referral";
  const utm_campaign = q("utm_campaign") ?? slug;
  const utm_content  = q("utm_content");
  const utm_term     = q("utm_term");

  const utmParts = [
    `utm_source=${encodeURIComponent(utm_source)}`,
    `utm_medium=${encodeURIComponent(utm_medium)}`,
    `utm_campaign=${encodeURIComponent(utm_campaign)}`,
    utm_content ? `utm_content=${encodeURIComponent(utm_content)}` : null,
    utm_term    ? `utm_term=${encodeURIComponent(utm_term)}`       : null,
  ].filter(Boolean).join("&");

  redirect(`${SITE}/get-started?lo=${encodeURIComponent(slug)}&${utmParts}`);
}
