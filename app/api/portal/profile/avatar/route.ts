import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient, createServiceClient } from "@/lib/supabase";

const BUCKET = "avatars";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest) {
  try {
    // Auth check
    const supabase = await createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 400 });
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, or WebP allowed" }, { status: 400 });
    }

    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${session.user.id}/avatar.${ext}`;

    const sb = createServiceClient();

    // Upsert file into storage (overwrites any previous avatar)
    const { error: uploadError } = await sb.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(path);

    // Add cache-buster so the browser doesn't show the old image
    const url = `${publicUrl}?t=${Date.now()}`;

    // Also persist avatar_url on the profile row immediately
    await sb
      .from("profiles")
      .update({ avatar_url: url, updated_at: new Date().toISOString() })
      .eq("id", session.user.id);

    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
