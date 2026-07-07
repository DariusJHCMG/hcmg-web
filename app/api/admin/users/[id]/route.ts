import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getCurrentProfile, isAdmin, logAudit } from "@/lib/auth";
import { z } from "zod";

const PatchSchema = z.object({
  // Status / role
  is_active:       z.boolean().optional(),
  role:            z.enum(["admin", "developer", "loan_officer"]).optional(),
  // Core identity
  full_name:       z.string().min(1).optional(),
  phone:           z.string().optional(),
  notify_email:    z.string().email().optional().or(z.literal("")),
  nmls:            z.string().optional(),
  lo_slug:         z.string().optional(),
  // Public website fields
  title:           z.string().optional(),
  short_bio:       z.string().optional(),
  offices:         z.array(z.string()).optional(),
  linkedin:        z.string().url().optional().or(z.literal("")),
  licensed_states: z.array(z.string()).optional(),
  show_on_website: z.boolean().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const caller = await getCurrentProfile();
  if (!caller || !isAdmin(caller)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const sb = createServiceClient();
  const updates = parsed.data;

  // ── Update profile ────────────────────────────────────────────
  const { error } = await sb.from("profiles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ── Sync funnel_link when deactivating ────────────────────────
  if (updates.is_active === false) {
    // Disable their funnel link so /go/[slug] returns 404
    await sb.from("funnel_links").update({ is_active: false })
      .eq("lo_slug", (await sb.from("profiles").select("lo_slug").eq("id", id).single()).data?.lo_slug ?? "");

    logAudit("user.deactivated", { user_id: id }, caller.id, caller.email);
  }

  if (updates.is_active === true) {
    await sb.from("funnel_links").update({ is_active: true })
      .eq("lo_slug", (await sb.from("profiles").select("lo_slug").eq("id", id).single()).data?.lo_slug ?? "");
  }

  // ── Sync funnel_link URL if lo_slug changed ───────────────────
  if (updates.lo_slug !== undefined) {
    const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");
    const { data: prof } = await sb.from("profiles").select("full_name, lo_slug").eq("id", id).single();
    if (prof?.lo_slug) {
      await sb.from("funnel_links").upsert({
        lo_slug:   prof.lo_slug,
        lo_name:   prof.full_name ?? updates.full_name ?? "",
        url:       `${SITE}/go/${prof.lo_slug}`,
        is_active: true,
        clicks:    0,
      }, { onConflict: "lo_slug" });
    }
  }

  if (updates.role) {
    logAudit("user.role_changed", { user_id: id, role: updates.role }, caller.id, caller.email);
  }

  return NextResponse.json({ ok: true });
}
