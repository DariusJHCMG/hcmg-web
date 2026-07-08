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

/** Convert "Test Works" → "test-works", de-dupe against existing slugs */
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const CreateUserSchema = z.object({
  email:        z.string().email(),
  password:     z.string().min(8),
  full_name:    z.string().min(1),
  role:         z.enum(["admin", "developer", "loan_officer"]),
  lo_slug:      z.string().optional(),
  nmls:         z.string().optional(),
  phone:        z.string().optional(),
  notify_email: z.string().email().optional().or(z.literal("")),
  title:        z.string().optional(),
  short_bio:    z.string().optional(),
  offices:      z.array(z.string()).optional(),
  linkedin:     z.string().optional(),
});

export async function POST(request: NextRequest) {
  const caller = await getCallerFromRequest(request);
  if (!caller) {
    return NextResponse.json({ error: "Not authenticated — please refresh and try again" }, { status: 401 });
  }
  if (!isAdmin(caller)) {
    return NextResponse.json({ error: `Role '${caller.role}' cannot perform this action` }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 });
  }

  const { email, password, full_name, role, nmls, phone, notify_email, title, short_bio, offices, linkedin } = parsed.data;
  const sb = createServiceClient();

  // ── Auto-generate lo_slug if not provided ────────────────────
  let lo_slug = parsed.data.lo_slug?.trim() || generateSlug(full_name);

  // Ensure slug is unique — append -2, -3, etc. if taken
  if (lo_slug) {
    const { data: existing } = await sb
      .from("profiles")
      .select("lo_slug")
      .like("lo_slug", `${lo_slug}%`);
    const taken = new Set((existing ?? []).map((r: { lo_slug: string | null }) => r.lo_slug));
    if (taken.has(lo_slug)) {
      let i = 2;
      while (taken.has(`${lo_slug}-${i}`)) i++;
      lo_slug = `${lo_slug}-${i}`;
    }
  }

  // ── 1. Create auth user ───────────────────────────────────────
  const { data: authData, error: authError } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      role,
      lo_slug:      lo_slug || "",
      nmls:         nmls || "",
      notify_email: notify_email || "",
    },
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Failed to create user" }, { status: 400 });
  }

  const uid = authData.user.id;

  // ── 2. Wait briefly then upsert the full profile row ─────────
  // The DB trigger fires on insert and creates the profile row.
  // We upsert to ensure ALL fields are set correctly regardless
  // of what the trigger did or didn't populate.
  await new Promise((r) => setTimeout(r, 300));

  const profilePatch: Record<string, unknown> = {
    id:           uid,
    email,
    full_name,
    role,
    is_active:    true,
    show_on_website: false,
    updated_at:   new Date().toISOString(),
  };
  if (lo_slug)      profilePatch.lo_slug      = lo_slug;
  if (nmls)         profilePatch.nmls         = nmls;
  if (phone)        profilePatch.phone        = phone;
  if (notify_email) profilePatch.notify_email = notify_email;
  if (title)        profilePatch.title        = title;
  if (short_bio)    profilePatch.short_bio    = short_bio;
  if (offices)      profilePatch.offices      = offices;
  if (linkedin)     profilePatch.linkedin     = linkedin;

  await sb.from("profiles").upsert(profilePatch, { onConflict: "id" });

  // ── 3. Create funnel_link ─────────────────────────────────────
  if (lo_slug) {
    const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");
    await sb.from("funnel_links").upsert({
      lo_slug,
      lo_name:   full_name,
      url:       `${SITE}/go/${lo_slug}`,
      is_active: true,
      clicks:    0,
    }, { onConflict: "lo_slug" });
  }

  await logAudit("user.created", { email, role, lo_slug, nmls }, caller.id, caller.email);

  return NextResponse.json({ ok: true, id: uid, lo_slug });
}
