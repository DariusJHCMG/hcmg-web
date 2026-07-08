import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createServiceClient } from "@/lib/supabase";

export async function PATCH(request: NextRequest) {
  try {
    // Get the current session to identify the caller
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const allowed = [
      "full_name", "phone", "notify_email", "linkedin", "short_bio", "avatar_url",
      "hero_bio", "about_headline", "long_bio", "years_experience", "specialties",
    ];
    const patch: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) patch[key] = body[key];
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    patch.updated_at = new Date().toISOString();

    const sb = createServiceClient();
    const { error } = await sb
      .from("profiles")
      .update(patch)
      .eq("id", session.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
