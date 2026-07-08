import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createServiceClient } from "@/lib/supabase";

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

// GET — list all co-branded pages for the logged-in LO
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sb = createServiceClient();
    const { data: profile } = await sb.from("profiles").select("lo_slug").eq("id", session.user.id).single();
    if (!profile?.lo_slug) return NextResponse.json({ pages: [] });

    const { data, error } = await sb
      .from("co_branded_pages")
      .select("*")
      .eq("lo_slug", profile.lo_slug)
      .order("created_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ pages: data ?? [] });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// POST — create a new co-branded page
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sb = createServiceClient();
    const { data: profile } = await sb.from("profiles").select("lo_slug").eq("id", session.user.id).single();
    if (!profile?.lo_slug) return NextResponse.json({ error: "No LO slug on your account" }, { status: 400 });

    const body = await request.json();
    const { realtor_name, realtor_company, realtor_phone, realtor_email,
            realtor_license, realtor_photo_url, realtor_logo_url, headline } = body;

    if (!realtor_name?.trim() || !realtor_company?.trim()) {
      return NextResponse.json({ error: "Realtor name and company are required" }, { status: 400 });
    }

    // Generate a unique slug
    const base = toSlug(`${realtor_name} ${realtor_company}`);
    let realtor_slug = base;
    let attempt = 0;
    while (true) {
      const { data: existing } = await sb
        .from("co_branded_pages")
        .select("id")
        .eq("lo_slug", profile.lo_slug)
        .eq("realtor_slug", realtor_slug)
        .maybeSingle();
      if (!existing) break;
      attempt++;
      realtor_slug = `${base}-${attempt}`;
    }

    const { data, error } = await sb
      .from("co_branded_pages")
      .insert({
        lo_slug: profile.lo_slug,
        realtor_slug,
        realtor_name: realtor_name.trim(),
        realtor_company: realtor_company.trim(),
        realtor_phone: realtor_phone?.trim() || null,
        realtor_email: realtor_email?.trim() || null,
        realtor_license: realtor_license?.trim() || null,
        realtor_photo_url: realtor_photo_url?.trim() || null,
        realtor_logo_url: realtor_logo_url?.trim() || null,
        headline: headline?.trim() || null,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ page: data });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
