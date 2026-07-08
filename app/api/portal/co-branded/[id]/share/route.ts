import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createServiceClient } from "@/lib/supabase";
import { Resend } from "resend";
import { buildCoBrandedShareEmail } from "@/lib/email-templates";

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
      .select("lo_slug, full_name, phone, email, nmls")
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

    const SITE    = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");
    const pageUrl = `${SITE}/co/${profile.lo_slug}/${page.realtor_slug}`;

    await resend.emails.send({
      from:    "HCMG <no-reply@hcmgloans.com>",
      to:      page.realtor_email,
      subject: `${profile.full_name} created a co-branded page just for you`,
      html: buildCoBrandedShareEmail({
        realtorFirstName: page.realtor_name.split(" ")[0],
        realtorCompany:   page.realtor_company,
        loName:           profile.full_name,
        loPhone:          profile.phone,
        loNmls:           profile.nmls,
        pageUrl,
      }),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
