import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { Resend } from "resend";
import { buildMobileAppEmail } from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, device } = await request.json() as { email: string; device: "ios" | "android" | "other" };
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const SITE       = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");
    const installUrl = `${SITE}/portal`;

    const { error } = await resend.emails.send({
      from:    "HCMG <no-reply@hcmgloans.com>",
      to:      email,
      subject: "Install the HCMG Portal App",
      html:    buildMobileAppEmail({ device, installUrl }),
    });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
