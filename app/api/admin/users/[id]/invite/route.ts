import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { isAdmin } from "@/lib/auth";
import { Resend } from "resend";
import { buildInviteEmail } from "@/lib/email-templates";
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

  if (!user)        return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (!user.email)  return NextResponse.json({ error: "User has no email" }, { status: 400 });

  const SITE      = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");
  const portalUrl = `${SITE}/portal`;
  const teamUrl   = user.lo_slug ? `${SITE}/team/${user.lo_slug}` : null;
  const funnelUrl = user.lo_slug ? `${SITE}/go/${user.lo_slug}`   : null;

  const { error } = await resend.emails.send({
    from:    "HCMG <no-reply@hcmgloans.com>",
    to:      user.email,
    subject: "Your HCMG Portal Access",
    html: buildInviteEmail({
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
