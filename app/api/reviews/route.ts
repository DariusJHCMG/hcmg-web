import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { z } from "zod";

const SubmitSchema = z.object({
  author:  z.string().min(2).max(80),
  rating:  z.number().int().min(1).max(5),
  text:    z.string().min(10).max(1000),
  lo_slug: z.string().optional().nullable(),
  scope:   z.enum(["personal", "company"]).default("personal"),
});

// ── GET — fetch approved reviews ─────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lo_slug = searchParams.get("lo_slug");
  const scope   = searchParams.get("scope") ?? "personal";

  const sb = createServiceClient();
  let query = sb
    .from("reviews")
    .select("id, author, rating, text, scope, created_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (scope === "company") {
    query = query.eq("scope", "company");
  } else {
    // personal — scope to the LO
    if (lo_slug) query = query.eq("lo_slug", lo_slug).eq("scope", "personal");
    else query = query.is("lo_slug", null).eq("scope", "personal");
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data ?? [] });
}

// ── POST — submit a new review (pending approval) ────────────────
export async function POST(request: NextRequest) {
  const body   = await request.json().catch(() => ({}));
  const parsed = SubmitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }
  const { author, rating, text, lo_slug, scope } = parsed.data;

  const sb = createServiceClient();
  const { error } = await sb.from("reviews").insert({
    author,
    rating,
    text,
    lo_slug:  lo_slug ?? null,
    scope,
    status:   "pending",
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
