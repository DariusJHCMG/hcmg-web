import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { FUNNEL_CATALOG } from "@/lib/funnel-catalog";

export async function POST() {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(caller)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = createServiceClient();
  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");

  // Fetch all active LO profiles with a slug
  const { data: profiles, error: fetchErr } = await sb
    .from("profiles")
    .select("id, lo_slug, full_name, is_active")
    .not("lo_slug", "is", null)
    .neq("lo_slug", "")
    .eq("is_active", true);

  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const loProfiles = (profiles ?? []) as { id: string; lo_slug: string; full_name: string; is_active: boolean }[];

  const results: { lo: string; created: number; skipped: number; error?: string }[] = [];
  let totalCreated = 0;

  for (const profile of loProfiles) {
    const loSlug = profile.lo_slug;

    // Fetch existing funnel_links for this LO
    const { data: existingRows } = await sb
      .from("funnel_links")
      .select("funnel_type")
      .eq("lo_slug", loSlug)
      .not("funnel_type", "is", null);

    const existingSlugs = new Set((existingRows ?? []).map((r: { funnel_type: string | null }) => r.funnel_type));

    // Build upsert rows for all missing funnel types
    const toCreate = FUNNEL_CATALOG.filter((f) => !existingSlugs.has(f.slug));

    if (toCreate.length === 0) {
      results.push({ lo: loSlug, created: 0, skipped: FUNNEL_CATALOG.length });
      continue;
    }

    const rows = toCreate.map((f) => ({
      lo_slug:     loSlug,
      lo_name:     profile.full_name,
      url:         `${SITE}/go/${loSlug}/${f.slug}`,
      funnel_type: f.slug,
      is_active:   true,
      clicks:      0,
    }));

    // Use insert with ignoreDuplicates in case no composite unique constraint exists yet
    const { error: insertErr } = await sb
      .from("funnel_links")
      .insert(rows);

    if (insertErr) {
      results.push({ lo: loSlug, created: 0, skipped: 0, error: insertErr.message });
    } else {
      results.push({ lo: loSlug, created: toCreate.length, skipped: FUNNEL_CATALOG.length - toCreate.length });
      totalCreated += toCreate.length;
    }
  }

  return NextResponse.json({
    ok: true,
    total_los: loProfiles.length,
    total_funnel_types: FUNNEL_CATALOG.length,
    total_created: totalCreated,
    results,
  });
}
