import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { Resend } from "resend";
import type { Profile } from "@/lib/database.types";

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

function buildInviteHtml({
  full_name, email, lo_slug, title, nmls, portalUrl, teamUrl, funnelUrl,
}: {
  full_name: string; email: string; lo_slug: string | null;
  title: string | null; nmls: string | null;
  portalUrl: string; teamUrl: string | null; funnelUrl: string | null;
}) {
  const first = full_name.split(" ")[0];
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:-apple-system,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">

        <tr><td style="background:#142850;padding:32px 32px 24px;">
          <p style="margin:0 0 4px;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#F37021;">Harris Capital Mortgage Group</p>
          <h1 style="margin:0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.2;">Welcome to HCMG, ${first}!</h1>
          <p style="margin:8px 0 0;font-size:14px;color:#94a3b8;">Your portal account is ready to use.</p>
        </td></tr>

        <tr><td style="padding:28px 32px;">
          <p style="margin:0 0 20px;font-size:15px;color:#1f2328;line-height:1.6;">
            Here&apos;s everything you need to get started:
          </p>

          <!-- Login -->
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1f2328;">Login</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
            <tr><td style="padding:10px 14px;background:#f5f0eb;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#57606a;">Email</p>
              <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1f2328;">${email}</p>
            </td></tr>
            <tr><td style="padding:10px 14px;background:#f5f0eb;">
              <p style="margin:0;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#57606a;">Portal URL</p>
              <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1f2328;">${portalUrl}</p>
            </td></tr>
          </table>

          ${lo_slug ? `
          <!-- LO details -->
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1f2328;">Your details</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border-radius:10px;overflow:hidden;border:1px solid #e5e7eb;">
            ${title ? `<tr><td style="padding:8px 14px;font-size:13px;color:#57606a;border-bottom:1px solid #f0f0f0;background:#fff;"><strong style="color:#1f2328;">Title:</strong> ${title}</td></tr>` : ""}
            ${nmls  ? `<tr><td style="padding:8px 14px;font-size:13px;color:#57606a;border-bottom:1px solid #f0f0f0;background:#fff;"><strong style="color:#1f2328;">NMLS#:</strong> ${nmls}</td></tr>` : ""}
            ${funnelUrl ? `<tr><td style="padding:8px 14px;font-size:13px;color:#57606a;background:#fff;"><strong style="color:#1f2328;">Your funnel link:</strong> <a href="${funnelUrl}" style="color:#F37021;">${funnelUrl}</a></td></tr>` : ""}
          </table>` : ""}

          <!-- CTAs -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:${teamUrl ? "8px" : "0"};">
                <a href="${portalUrl}" style="display:block;background:#142850;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 20px;border-radius:10px;text-align:center;">
                  Go to My Portal →
                </a>
              </td>
              ${teamUrl ? `<td>
                <a href="${teamUrl}" style="display:block;background:#f5f0eb;color:#1f2328;font-size:14px;font-weight:700;text-decoration:none;padding:13px 20px;border-radius:10px;text-align:center;border:1px solid #e5e7eb;">
                  View My Team Page →
                </a>
              </td>` : ""}
            </tr>
          </table>

          <p style="margin:24px 0 0;font-size:12px;color:#9ca3af;line-height:1.6;">
            Use the portal to manage your leads, funnels, co-branded pages, and profile.<br>
            Questions? Contact <a href="mailto:support@hcmgloans.com" style="color:#F37021;">support@hcmgloans.com</a>
          </p>
        </td></tr>

        <tr><td style="border-top:1px solid #e5e7eb;padding:16px 32px;background:#f9fafb;">
          <p style="margin:0;font-size:11px;color:#9ca3af;text-align:center;">
            Harris Capital Mortgage Group, LLC · NMLS# 1918223<br>
            6375 S Pecos Rd Suite 208, Las Vegas NV 89120
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const caller = await getCallerFromRequest(request);
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(caller)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const sb = createServiceClient();

  const { data: user } = await sb
    .from("profiles")
    .select("full_name, email, lo_slug, title, nmls")
    .eq("id", id)
    .single();

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.email) return NextResponse.json({ error: "User has no email" }, { status: 400 });

  const SITE      = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");
  const portalUrl = `${SITE}/portal`;
  const teamUrl   = user.lo_slug ? `${SITE}/team/${user.lo_slug}` : null;
  const funnelUrl = user.lo_slug ? `${SITE}/go/${user.lo_slug}` : null;

  const { error } = await resend.emails.send({
    from:    "HCMG <no-reply@hcmgloans.com>",
    to:      user.email,
    subject: "Your HCMG Portal Access",
    html: buildInviteHtml({
      full_name: user.full_name,
      email:     user.email,
      lo_slug:   user.lo_slug,
      title:     user.title,
      nmls:      user.nmls,
      portalUrl,
      teamUrl,
      funnelUrl,
    }),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
