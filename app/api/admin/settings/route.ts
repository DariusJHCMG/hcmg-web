import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import { readSettings, writeSettings } from "@/lib/company-settings";
import { z } from "zod";

const PatchSchema = z.object({
  company_notify_email:    z.string().email().optional().or(z.literal("")),
  company_funnel_label:    z.string().min(1).optional(),
  contact_notify_email:    z.string().email().optional().or(z.literal("")),
  recruiting_notify_email: z.string().email().optional().or(z.literal("")),
  agent_notify_email:      z.string().email().optional().or(z.literal("")),
  ga4_measurement_id:      z.string().optional(),
  ga4_property_id:         z.string().optional(),
  gsc_property:            z.string().optional(),
});

export async function GET() {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(caller)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settings = await readSettings();
  return NextResponse.json(settings);
}

export async function PATCH(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(caller)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => ({}));
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const { error } = await writeSettings(parsed.data);
  if (error) return NextResponse.json({ error }, { status: 500 });

  const updated = await readSettings();
  return NextResponse.json({ ok: true, settings: updated });
}
