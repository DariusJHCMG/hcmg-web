import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createServiceClient } from "@/lib/supabase";

async function getOwned(id: string, userId: string) {
  const sb = createServiceClient();
  const { data: profile } = await sb.from("profiles").select("lo_slug").eq("id", userId).single();
  if (!profile?.lo_slug) return null;
  const { data } = await sb
    .from("co_branded_pages")
    .select("*")
    .eq("id", id)
    .eq("lo_slug", profile.lo_slug)
    .maybeSingle();
  return data ?? null;
}

// PATCH — update fields or toggle is_active
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await getOwned(id, session.user.id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const allowed = [
      "realtor_name", "realtor_company", "realtor_phone", "realtor_email",
      "realtor_license", "realtor_photo_url", "realtor_logo_url", "headline", "is_active",
    ];
    const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    const sb = createServiceClient();
    const { error } = await sb.from("co_branded_pages").update(patch).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// DELETE — permanently delete
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const existing = await getOwned(id, session.user.id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const sb = createServiceClient();
    const { error } = await sb.from("co_branded_pages").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
