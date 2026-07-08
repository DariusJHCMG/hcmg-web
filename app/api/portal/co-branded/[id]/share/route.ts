import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createServiceClient } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sb = createServiceClient();
    const { data: profile } = await sb
      .from("profiles")
      .select("lo_slug, full_name, phone, email")
      .eq("id", session.user.id)
      .single();
    if (!profile?.lo_slug) return NextResponse.json({ error: "No LO slug" }, { status: 400 });

    const { data: page } = await sb
      .from("co_branded_pages")
      .select("*")
      .eq("id", id)
      .eq("lo_slug", profile.lo_slug)
      .maybeSingle();
    if (!page) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!page.realtor_email) return NextResponse.json({ error: "Realtor has no email on file" }, { status: 400 });

    const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");
    const pageUrl = `${SITE}/co/${profile.lo_slug}/${page.realtor_slug}`;

    await resend.emails.send({
      from: "HCMG <no-reply@hcmgloans.com>",
      to: page.realtor_email,
      subject: `${profile.full_name} created a co-branded page just for you`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:540px;margin:0 auto;padding:32px 24px;color:#1f2328">
          <img src="${SITE}/hcmg-logo.svg" alt="HCMG" style="height:36px;margin-bottom:24px" />
          <h1 style="font-size:22px;font-weight:800;margin:0 0 8px">Hi ${page.realtor_name.split(" ")[0]},</h1>
          <p style="font-size:15px;line-height:1.7;color:#57606a;margin:0 0 20px">
            ${profile.full_name} at Harris Capital Mortgage Group has set up a co-branded referral page 
            just for you and ${page.realtor_company}. Share this link with your clients to help them 
            get pre-qualified instantly — leads come straight to ${profile.full_name.split(" ")[0]}.
          </p>
          <a href="${pageUrl}"
             style="display:inline-block;background:linear-gradient(135deg,#FF9847,#F37021);color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;margin-bottom:24px">
            View your co-branded page →
          </a>
          <p style="font-size:13px;color:#57606a;margin:0 0 4px">Or copy this link:</p>
          <p style="font-size:13px;color:#3b82d4;margin:0 0 24px;word-break:break-all">${pageUrl}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0" />
          <p style="font-size:12px;color:#8b949e;margin:0">
            Questions? Reply to this email or contact ${profile.full_name} directly${profile.phone ? ` at ${profile.phone}` : ""}.
            <br/>Harris Capital Mortgage Group, LLC · NMLS# 1918223
          </p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
