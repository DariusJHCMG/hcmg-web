import { createServiceClient } from "@/lib/supabase";
import { normalizeLicenseStates, type LicenseStatus } from "@/lib/license-states";

const SETTINGS_SLUG = "__settings__";

export interface CompanySettings {
  company_notify_email:    string;  // alert for get-started / team / seo funnel leads (no LO)
  company_funnel_label:    string;  // display label in leads table
  contact_notify_email:    string;  // alert for /contact form submissions
  recruiting_notify_email: string;  // alert for /join and /careers recruiting leads
  ga4_measurement_id:      string;  // e.g. "G-XXXXXXXXXX" — used for tag injection
  ga4_property_id:         string;  // e.g. "123456789" — numeric property ID for Data API
  gsc_property:            string;  // e.g. "https://hcmgloans.com" — GSC property URL
  // OAuth tokens for Analytics (set via /api/auth/google/callback)
  google_access_token:     string;
  google_refresh_token:    string;
  google_token_expiry:     string;  // ISO timestamp
  google_connected_email:  string;  // email of connected Google account
  license_states:          Record<string, LicenseStatus>;
}

export const DEFAULT_SETTINGS: CompanySettings = {
  company_notify_email:    "info@hcmgloans.com",
  company_funnel_label:    "HCMG Company",
  contact_notify_email:    "",
  recruiting_notify_email: "",
  ga4_measurement_id:      "",
  ga4_property_id:         "",
  gsc_property:            "",
  google_access_token:     "",
  google_refresh_token:    "",
  google_token_expiry:     "",
  google_connected_email:  "",
  license_states:          normalizeLicenseStates(),
};

export async function readSettings(): Promise<CompanySettings> {
  const sb = createServiceClient();
  const { data } = await sb
    .from("funnel_links")
    .select("lo_name")
    .eq("lo_slug", SETTINGS_SLUG)
    .single();

  if (!data?.lo_name) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(data.lo_name);
    return { ...DEFAULT_SETTINGS, ...parsed, license_states: normalizeLicenseStates(parsed.license_states) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function writeSettings(updates: Partial<CompanySettings>): Promise<{ error?: string }> {
  const current = await readSettings();
  const updated: CompanySettings = { ...current, ...updates };

  const sb = createServiceClient();
  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

  const { error } = await sb.from("funnel_links").upsert({
    lo_slug:   SETTINGS_SLUG,
    lo_name:   JSON.stringify(updated),
    url:       `${SITE}/get-started`,
    is_active: false,
    clicks:    0,
  }, { onConflict: "lo_slug" });

  return error ? { error: error.message } : {};
}
