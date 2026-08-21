import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

// POST /api/co-branded/[id]/track
// Public — no auth required. Increments one counter on a co_branded_pages row.
// Body: { event: "app_click" | "book_call_click" | "booking_complete" }

const COUNTER_MAP: Record<string, string> = {
  app_click:        "app_clicks",
  book_call_click:  "book_call_clicks",
  booking_complete: "bookings_completed",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { event } = await request.json().catch(() => ({}));
    const column = COUNTER_MAP[event as string];
    if (!column) return NextResponse.json({ error: "Unknown event" }, { status: 400 });

    const sb = createServiceClient();

    // Fetch current count then increment (Supabase JS v2 has no atomic increment shortcut)
    const { data: row } = await sb
      .from("co_branded_pages")
      .select(column)
      .eq("id", id)
      .maybeSingle();

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const current = (row as unknown as Record<string, unknown>)[column];
    await sb
      .from("co_branded_pages")
      .update({ [column]: (typeof current === "number" ? current : 0) + 1 })
      .eq("id", id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
