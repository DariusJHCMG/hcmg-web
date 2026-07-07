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

  const { email, password, full_name, role, lo_slug, nmls, phone, notify_email, title, short_bio, offices, linkedin } = parsed.data;

  const sb = createServiceClient();

  // ── 1. Create auth user ───────────────────────────────────────
  const { data: authData, error: authError } = await sb.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name, role, lo_slug: lo_slug || "", nmls: nmls || "", notify_email: notify_email || "" },
  });

  if (authError || !authData.user) {
    return NextResponse.json({ error: authError?.message ?? "Failed to create user" }, { status: 400 });
  }

  // ── 2. Update extra profile fields not covered by the trigger ─
  const extraFields: Record<string, unknown> = {};
  if (phone)       extraFields.phone      = phone;
  if (title)       extraFields.title      = title;
  if (short_bio)   extraFields.short_bio  = short_bio;
  if (offices)     extraFields.offices    = offices;
  if (linkedin)    extraFields.linkedin   = linkedin;

  if (Object.keys(extraFields).length > 0) {
    await sb.from("profiles").update(extraFields).eq("id", authData.user.id);
  }

  // ── 3. Create funnel_link if LO slug provided ─────────────────
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

  await logAudit("user.created", { email, role, lo_slug }, caller.id, caller.email);

  return NextResponse.json({ ok: true, id: authData.user.id });
}
