import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { teamMembers } from "@/data/team";

export async function POST() {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(caller)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const sb = createServiceClient();

  // Fetch all profiles that have a lo_slug
  const { data: profiles, error: fetchErr } = await sb
    .from("profiles")
    .select("id, lo_slug, title, nmls, offices, short_bio");
  if (fetchErr) return NextResponse.json({ error: fetchErr.message }, { status: 500 });

  const results: { slug: string; name: string; status: string }[] = [];

  for (const member of teamMembers) {
    const profile = (profiles ?? []).find((p) => p.lo_slug === member.slug);
    if (!profile) {
      results.push({ slug: member.slug, name: member.name, status: "no profile found — skipped" });
      continue;
    }

    // Only fill in fields that are currently blank — never overwrite existing data
    const patch: Record<string, unknown> = {};
    if (!profile.title   && member.role)        patch.title     = member.role;
    if (!profile.nmls    && member.nmls)         patch.nmls      = member.nmls;
    if ((!profile.offices || profile.offices.length === 0) && member.offices?.length)
                                                 patch.offices   = member.offices;
    if (!profile.short_bio && member.shortBio)   patch.short_bio = member.shortBio;

    if (Object.keys(patch).length === 0) {
      results.push({ slug: member.slug, name: member.name, status: "already complete — skipped" });
      continue;
    }

    const { error: patchErr } = await sb
      .from("profiles")
      .update(patch)
      .eq("id", profile.id);

    if (patchErr) {
      results.push({ slug: member.slug, name: member.name, status: `error: ${patchErr.message}` });
    } else {
      results.push({
        slug: member.slug,
        name: member.name,
        status: `updated: ${Object.keys(patch).join(", ")}`,
      });
    }
  }

  return NextResponse.json({ ok: true, results });
}
