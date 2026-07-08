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

  // Validate funnel slug exists in our catalog — this is pure in-memory, never fails
  const funnelDef = getFunnelBySlug(funnelSlug);
  if (!funnelDef) notFound();

  const sb = createServiceClient();

  // Validate LO exists and is active — use profiles as source of truth.
  // funnel_links may not be populated yet (backfill pending), so never gate on it.
  const { data: profile } = await sb
    .from("profiles")
    .select("lo_slug, is_active")
    .eq("lo_slug", loSlug)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile) notFound();

  // Best-effort click counter — try per-funnel row first, fall back to base link
  sb.from("funnel_links")
    .select("clicks")
    .eq("lo_slug", loSlug)
    .eq("funnel_type", funnelSlug)
    .maybeSingle()
    .then(({ data: funnelRow }) => {
      if (funnelRow) {
        // Increment the per-funnel row
        void sb.from("funnel_links")
          .update({ clicks: (funnelRow.clicks ?? 0) + 1 })
          .eq("lo_slug", loSlug)
          .eq("funnel_type", funnelSlug);
      } else {
        // Funnel variant row not found (backfill pending) — increment the base link
        sb.from("funnel_links")
          .select("clicks")
          .eq("lo_slug", loSlug)
          .is("funnel_type", null)
          .single()
          .then(({ data: baseRow }) => {
            if (baseRow) {
              void sb.from("funnel_links")
                .update({ clicks: (baseRow.clicks ?? 0) + 1 })
                .eq("lo_slug", loSlug)
                .is("funnel_type", null);
            }
          });
      }
    });

  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/+$/, "");

  // Auto-tag with defaults so every click is tracked, even without manual UTM setup.
  // If the link already has a UTM param (e.g. from a paid ad), it wins over the default.
  function q(key: string) { const v = query[key]; return v ? (Array.isArray(v) ? v[0] : v) : null; }

  const utm_source   = q("utm_source")   ?? "lo-link";
  const utm_medium   = q("utm_medium")   ?? "referral";
  const utm_campaign = q("utm_campaign") ?? `${loSlug}--${funnelSlug}`;
  const utm_content  = q("utm_content")  ?? funnelSlug;
  const utm_term     = q("utm_term");

  const utmParts = [
    `utm_source=${encodeURIComponent(utm_source)}`,
    `utm_medium=${encodeURIComponent(utm_medium)}`,
    `utm_campaign=${encodeURIComponent(utm_campaign)}`,
    `utm_content=${encodeURIComponent(utm_content)}`,
    utm_term ? `utm_term=${encodeURIComponent(utm_term)}` : null,
  ].filter(Boolean).join("&");

  redirect(`${SITE}/get-started?lo=${encodeURIComponent(loSlug)}&funnel=${encodeURIComponent(funnelSlug)}&${utmParts}`);
}
