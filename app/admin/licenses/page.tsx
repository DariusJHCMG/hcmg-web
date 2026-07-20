import { readSettings } from "@/lib/company-settings";
import { normalizeLicenseStates } from "@/lib/license-states";
import { LicensesClient } from "./LicensesClient";

export const dynamic = "force-dynamic";

export default async function LicensesPage() {
  const settings = await readSettings();
  return <LicensesClient initialStates={normalizeLicenseStates(settings.license_states)} />;
}
