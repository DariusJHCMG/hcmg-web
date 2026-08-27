/**
 * GET /api/admin/licenses — list all licensed states from company settings.
 * PATCH /api/admin/licenses — update the licensed states list.
 * Auth: admin role required.
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile, isAdmin, logAudit } from "@/lib/auth";
import { readSettings, writeSettings } from "@/lib/company-settings";
import { STATE_CODES, normalizeLicenseStates } from "@/lib/license-states";

const Schema = z.object({
  states: z.record(z.enum(["active", "coming_soon", "unavailable"])),
  license_numbers: z.record(z.string()).optional(),
});

export async function GET() {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(caller)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const settings = await readSettings();
  return NextResponse.json({
    states: normalizeLicenseStates(settings.license_states),
    license_numbers: settings.license_numbers ?? {},
    licenses_last_updated: settings.licenses_last_updated ?? "",
  });
}

export async function PUT(request: NextRequest) {
  const caller = await getCurrentProfile();
  if (!caller) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  if (!isAdmin(caller)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = Schema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success || Object.keys(parsed.data.states).some(code => !STATE_CODES.includes(code))) {
    return NextResponse.json({ error: "Invalid license configuration" }, { status: 400 });
  }
  const states = normalizeLicenseStates(parsed.data.states);
  const license_numbers = parsed.data.license_numbers ?? {};
  const licenses_last_updated = new Date().toISOString();
  const { error } = await writeSettings({ license_states: states, license_numbers, licenses_last_updated });
  if (error) return NextResponse.json({ error }, { status: 500 });
  await logAudit("licenses.updated", { states, license_numbers }, caller.id, caller.email);
  return NextResponse.json({ ok: true, states, license_numbers, licenses_last_updated });
}
