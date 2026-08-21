import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createServiceClient } from "@/lib/supabase";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sb = createServiceClient();

    // Resolve the caller's lo_slug
    const { data: profile } = await sb.from("profiles").select("lo_slug").eq("id", session.user.id).single();
    if (!profile?.lo_slug) return NextResponse.json({ error: "No lo_slug" }, { status: 403 });

    // Fetch the co-branded page — must belong to this LO
    const { data: cbPage } = await sb
      .from("co_branded_pages")
      .select("lo_slug, realtor_slug")
      .eq("id", id)
      .eq("lo_slug", profile.lo_slug)
      .maybeSingle();

    if (!cbPage) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Match on exact co_branded_page_id (new leads) or fall back to
    // entry_page / utm_campaign pattern matching (pre-migration leads)
    const { data: leads } = await sb
      .from("leads")
      .select("*")
      .eq("lo_slug", cbPage.lo_slug)
      .or(
        `co_branded_page_id.eq.${id},` +
        `entry_page.ilike.%/co/${cbPage.lo_slug}/${cbPage.realtor_slug}%,` +
        `utm_campaign.ilike.%co-brand-${cbPage.realtor_slug}%`
      )
      .order("created_at", { ascending: false });

    return NextResponse.json({ leads: leads ?? [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
