import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { z } from "zod";

const EventSchema = z.object({
  sessionId: z.string().min(1),
  eventType: z.enum(["page_view", "funnel_step", "cta_click", "calculator_use"]),
  pathname:  z.string().optional(),
  data:      z.record(z.unknown()).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ ok: false }, { status: 400 }); }

  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ ok: false }, { status: 400 });

  const { sessionId, eventType, pathname, data } = parsed.data;

  const sb = createServiceClient();
  await sb.from("lead_events").insert({
    session_id: sessionId,
    event_type: eventType,
    pathname:   pathname ?? null,
    data:       data ?? null,
  });

  return NextResponse.json({ ok: true });
}
