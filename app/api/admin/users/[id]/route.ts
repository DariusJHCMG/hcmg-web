import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { isAdmin, logAudit } from "@/lib/auth";
import { z } from "zod";
import type { Profile } from "@/lib/database.types";

async function getCallerFromRequest(request: NextRequest): Promise<Profile | null> {
  try {
    const auth = request.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
    if (!token) return null;
    const sb = createServiceClient();
    const { data: { user }, error } = await sb.auth.getUser(token);
    if (error || !user) return null;
    const { data } = await sb.from("profiles").select("*").eq("id", user.id).single();
    return data as Profile | null;
  } catch { return null; }
}

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
  const caller = await getCallerFromRequest(request);
  if (!caller) {
    return NextResponse.json({ error: "Not authenticated — please refresh and try again" }, { status: 401 });
  }
  if (!isAdmin(caller)) {
    return NextResponse.json({ error: `Role '${caller.role}' cannot perform this action` }, { status: 403 });
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
    const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const caller = await getCallerFromRequest(request);
  if (!caller) {
    return NextResponse.json({ error: "Not authenticated — please refresh and try again" }, { status: 401 });
  }
  if (!isAdmin(caller)) {
    return NextResponse.json({ error: `Role '${caller.role}' cannot perform this action` }, { status: 403 });
  }

  const { id } = await params;

  // Cannot delete yourself
  if (id === caller.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const sb = createServiceClient();

  // 1. Fetch the profile so we can clean up related data
  const { data: profile } = await sb
    .from("profiles")
    .select("lo_slug, avatar_url, full_name, email")
    .eq("id", id)
    .single();

  const lo_slug  = profile?.lo_slug  ?? null;
  const avatarUrl = profile?.avatar_url ?? null;

  // 2. Delete funnel_link row
  if (lo_slug) {
    await sb.from("funnel_links").delete().eq("lo_slug", lo_slug);
  }

  // 3. Delete avatar from storage
  if (avatarUrl) {
    // Path is {userId}/avatar.{ext} — extract from URL
    const match = avatarUrl.match(/avatars\/([^?]+)/);
    if (match?.[1]) {
      await sb.storage.from("avatars").remove([match[1]]);
    }
  }

  // 4. Delete profile row
  await sb.from("profiles").delete().eq("id", id);

  // 5. Delete the auth user (must be last — removes login access)
  const { error: authError } = await sb.auth.admin.deleteUser(id);
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  await logAudit(
    "user.deleted",
    { deleted_id: id, email: profile?.email, name: profile?.full_name, lo_slug },
    caller.id,
    caller.email,
  );

  return NextResponse.json({ ok: true });
}
