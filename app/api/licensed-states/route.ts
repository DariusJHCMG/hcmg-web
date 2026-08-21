import { NextResponse } from "next/server";
import { readSettings } from "@/lib/company-settings";
import { licenseStateLists, STATE_NAMES } from "@/lib/license-states";

// Public endpoint — no auth required.
// Returns the list of active licensed states for use in client-side funnel dropdowns.
// Revalidates every 5 minutes so admin changes propagate quickly.
export const revalidate = 300;

export async function GET() {
  const settings = await readSettings();
  const { active } = licenseStateLists(settings.license_states);

  const states = active
    .sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]))
    .map((code) => ({
      code,
      label: `${STATE_NAMES[code]} (${code})`,
    }));

  return NextResponse.json({ states });
}
