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

  // Fetch current profile BEFORE update so we always have lo_slug + full_name
  const { data: current } = await sb
    .from("profiles")
    .select("lo_slug, full_name, is_active")
    .eq("id", id)
    .single();
  const currentSlug = current?.lo_slug ?? null;

  // ── Update profile ────────────────────────────────────────────
  const { error } = await sb.from("profiles").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ── Sync funnel_link is_active ────────────────────────────────
  if (updates.is_active !== undefined && currentSlug) {
    await sb.from("funnel_links")
      .update({ is_active: updates.is_active })
      .eq("lo_slug", currentSlug);

    if (updates.is_active === false) {
      logAudit("user.deactivated", { user_id: id }, caller.id, caller.email);
    }
  }

  // ── Sync funnel_link URL/name if lo_slug or full_name changed ─
  if (updates.lo_slug !== undefined || updates.full_name !== undefined) {
    const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");
    const newSlug = updates.lo_slug ?? currentSlug;
    const newName = updates.full_name ?? current?.full_name ?? "";
    if (newSlug) {
      await sb.from("funnel_links").upsert({
        lo_slug:   newSlug,
        lo_name:   newName,
        url:       `${SITE}/go/${newSlug}`,
        is_active: updates.is_active ?? current?.is_active ?? true,
        clicks:    0,
      }, { onConflict: "lo_slug" });
    }
  }

  if (updates.role) {
    logAudit("user.role_changed", { user_id: id, role: updates.role }, caller.id, caller.email);
  }

  return NextResponse.json({ ok: true });
}
