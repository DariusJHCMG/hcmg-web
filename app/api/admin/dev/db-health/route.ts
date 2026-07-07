import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

export async function GET() {
  try {
    const sb = createServiceClient();
    const { error } = await sb.from("profiles").select("id").limit(1);
    if (error) return NextResponse.json({ ok: false, error: error.message });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) });
  }
}
