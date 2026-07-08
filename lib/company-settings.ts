import { createServiceClient } from "@/lib/supabase";

const SETTINGS_SLUG = "__settings__";

export interface CompanySettings {
  company_notify_email: string;
  company_funnel_label: string;
}

export const DEFAULT_SETTINGS: CompanySettings = {
  company_notify_email: "info@harriscapitalmortgage.com",
  company_funnel_label: "HCMG Company",
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
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function writeSettings(updates: Partial<CompanySettings>): Promise<{ error?: string }> {
  const current = await readSettings();
  const updated: CompanySettings = { ...current, ...updates };

  const sb = createServiceClient();
  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmg-web.vercel.app").replace(/\/$/, "");

  const { error } = await sb.from("funnel_links").upsert({
    lo_slug:   SETTINGS_SLUG,
    lo_name:   JSON.stringify(updated),
    url:       `${SITE}/get-started`,
    is_active: false,
    clicks:    0,
  }, { onConflict: "lo_slug" });

  return error ? { error: error.message } : {};
}
