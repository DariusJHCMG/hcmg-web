import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { isAdmin, logAudit } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Resend } from "resend";
import { z } from "zod";
import type { Profile } from "@/lib/database.types";
import { FUNNEL_CATALOG } from "@/lib/funnel-catalog";

const resend = new Resend(process.env.RESEND_API_KEY);

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
    is_active:       true,
    // LOs are shown on the public team page by default; admins/devs are not
    show_on_website: role === "loan_officer",
    updated_at:      new Date().toISOString(),
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

  // ── 3. Create funnel_links — base link + all catalog variants ────
  if (lo_slug) {
    const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

    // Base link (null funnel_type) — the original /go/[lo] redirect
    await sb.from("funnel_links").upsert({
      lo_slug,
      lo_name:     full_name,
      url:         `${SITE}/go/${lo_slug}`,
      funnel_type: null,
      is_active:   true,
      clicks:      0,
    }, { onConflict: "lo_slug" });

    // One row per funnel variant from the catalog
    const variantRows = FUNNEL_CATALOG.map((f) => ({
      lo_slug,
      lo_name:     full_name,
      url:         `${SITE}/go/${lo_slug}/${f.slug}`,
      funnel_type: f.slug,
      is_active:   true,
      clicks:      0,
    }));
    // Insert all; ignore duplicates if somehow already exist
    await sb.from("funnel_links").insert(variantRows).then(() => {});
  }

  await logAudit("user.created", { email, role, lo_slug, nmls }, caller.id, caller.email);

  // ── 4. Revalidate public team pages immediately ───────────────
  revalidatePath("/team", "page");
  if (lo_slug) {
    revalidatePath(`/team/${lo_slug}`, "page");
    if (lo_slug === "lamont-harris-jr") {
      revalidatePath("/team/lamont-harris-jr", "page");
    }
  }

  // ── 5. Send welcome email ─────────────────────────────────────
  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");
  const portalUrl = `${SITE}/portal`;
  const teamUrl   = lo_slug ? `${SITE}/team/${lo_slug}` : null;

  await resend.emails.send({
    from: "HCMG <no-reply@hcmgloans.com>",
    to:   email,
    subject: "Welcome to the HCMG Portal — your account is ready",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr><td style="background:#142850;padding:32px 32px 24px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#F37021;">Harris Capital Mortgage Group</p>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.2;">Welcome, ${full_name.split(" ")[0]}!</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">Your HCMG portal account is ready.</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 20px;font-size:15px;color:#1f2328;line-height:1.6;">
            Here are your login details:
          </p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="padding:10px 14px;background:#f5f0eb;border-radius:10px 10px 0 0;border:1px solid #e5e7eb;border-bottom:none;">
                <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#57606a;">Email</p>
                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1f2328;">${email}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 14px;background:#f5f0eb;border-radius:0 0 10px 10px;border:1px solid #e5e7eb;">
                <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#57606a;">Temporary Password</p>
                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1f2328;font-family:monospace;">${parsed.data.password}</p>
              </td>
            </tr>
          </table>

          ${lo_slug ? `
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1f2328;">Your personal details:</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            ${title ? `<tr><td style="padding:6px 14px;font-size:13px;color:#57606a;border-bottom:1px solid #f0f0f0;"><strong style="color:#1f2328;">Title:</strong> ${title}</td></tr>` : ""}
            ${nmls  ? `<tr><td style="padding:6px 14px;font-size:13px;color:#57606a;border-bottom:1px solid #f0f0f0;"><strong style="color:#1f2328;">NMLS#:</strong> ${nmls}</td></tr>` : ""}
            <tr><td style="padding:6px 14px;font-size:13px;color:#57606a;"><strong style="color:#1f2328;">Your funnel link:</strong> <a href="${SITE}/go/${lo_slug}" style="color:#F37021;">${SITE}/go/${lo_slug}</a></td></tr>
          </table>` : ""}

          <!-- CTAs -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
            <tr>
              <td style="padding-right:8px;">
                <a href="${portalUrl}" style="display:block;background:#142850;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 20px;border-radius:10px;text-align:center;">
                  Go to Portal →
                </a>
              </td>
              ${teamUrl ? `<td>
                <a href="${teamUrl}" style="display:block;background:#f5f0eb;color:#1f2328;font-size:14px;font-weight:700;text-decoration:none;padding:13px 20px;border-radius:10px;text-align:center;border:1px solid #e5e7eb;">
                  View Your Page →
                </a>
              </td>` : ""}
            </tr>
          </table>

          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;">
            Please change your password after first login. If you didn&apos;t expect this email, contact <a href="mailto:support@hcmgloans.com" style="color:#F37021;">support@hcmgloans.com</a>.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="border-top:1px solid #e5e7eb;padding:16px 32px;background:#f9fafb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
            Harris Capital Mortgage Group, LLC · NMLS# 1918223<br>
            6375 S Pecos Rd, Suite 208, Las Vegas, NV 89120
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
  }).catch(() => {/* best-effort — don't fail creation if email fails */});

  return NextResponse.json({ ok: true, id: uid, lo_slug });
}
