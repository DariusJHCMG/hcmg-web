"use client";

import { useState, useEffect } from "react";

interface Settings {
  company_notify_email:    string;
  company_funnel_label:    string;
  contact_notify_email:    string;
  recruiting_notify_email: string;
  ga4_measurement_id:      string;
  ga4_property_id:         string;
  gsc_property:            string;
  google_connected_email:  string;
  google_refresh_token:    string;
}

const COMPANY_PAGES = [
  { label: "Get Started",        path: "/get-started",               desc: "Mortgage estimate funnel — no LO assigned",         type: "funnel"      },
  { label: "Team page",          path: "/team",                      desc: "Leads from team page without clicking an LO link",   type: "funnel"      },
  { label: "SEO / Local pages",  path: "/seo/[slug]",                desc: "100+ local pages (e.g. /seo/orlando-fha-loan) — all link to /get-started with source=seo", type: "funnel" },
  { label: "Contact",            path: "/contact",                   desc: "General contact form — no mortgage data collected",  type: "contact"     },
  { label: "Join / Careers",     path: "/join",                      desc: "LO recruiting inquiry form",                         type: "employment"  },
  { label: "Careers — Producing Manager", path: "/careers/producing-manager", desc: "Branch partner recruiting form",            type: "employment"  },
  { label: "Careers — Move Your Team",    path: "/careers/move-your-team",    desc: "Team move recruiting form",                 type: "employment"  },
  { label: "Careers — Corporate",         path: "/careers/corporate",         desc: "Corporate role recruiting form",            type: "employment"  },
];

const TYPE_BADGE: Record<string, { label: string; cls: string }> = {
  funnel:     { label: "Funnel",     cls: "border-amber-200 bg-amber-50 text-amber-700" },
  contact:    { label: "Contact",    cls: "border-orange-200 bg-orange-50 text-orange-700" },
  employment: { label: "Employment", cls: "border-blue-200 bg-blue-50 text-blue-700" },
};

export default function SettingsPage() {
  const [settings, setSettings]   = useState<Settings | null>(null);
  const [form,     setForm]       = useState<Settings>({ company_notify_email: "", company_funnel_label: "", contact_notify_email: "", recruiting_notify_email: "", ga4_measurement_id: "", ga4_property_id: "", gsc_property: "", google_connected_email: "", google_refresh_token: "" });
  const [saving,   setSaving]     = useState(false);
  const [msg,      setMsg]        = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data: Settings) => { setSettings(data); setForm(data); })
      .catch(() => setMsg({ type: "err", text: "Failed to load settings." }));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setMsg(null);
    const res  = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const json = await res.json();
    if (res.ok) {
      setSettings(json.settings);
      setMsg({ type: "ok", text: "Settings saved." });
    } else {
      setMsg({ type: "err", text: json.error ?? "Save failed." });
    }
    setSaving(false);
  }

  const IC = "w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 transition";

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Company Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Configure how company-wide leads are handled and who gets notified.
        </p>
      </div>

      {/* Status banner */}
      {msg && (
        <div className={`flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold
          ${msg.type === "ok" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="ml-4 text-xs opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* How company leads work callout */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm">
        <p className="font-bold text-amber-900">How company leads work</p>
        <p className="mt-1.5 text-xs leading-6 text-amber-800">
          Leads from the company pages below (not tied to a specific loan officer) are saved directly to the
          <strong> Admin → Leads</strong> table and appear in the amber <em>Company Leads</em> section at the top — visible only to admins.
          They are <strong>never auto-routed</strong> to an LO. An admin reviews them and assigns or contacts the lead directly.
        </p>
        <p className="mt-2 text-xs text-amber-700">
          Optionally, set the alert email below to get an instant email notification every time a company lead comes in —
          the email shows the lead&apos;s details and which funnel page they came from.
          Leave it blank to disable email alerts (leads still appear in the portal).
        </p>
      </div>

      {/* Alert emails */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-1 text-sm font-black uppercase tracking-[0.14em] text-muted">Lead Alert Emails</h2>
        <p className="mb-5 text-xs text-muted">
          Each lead type can route to a different email address. Leave any field blank to disable alerts for that type.
          All leads are always saved to the portal regardless.
        </p>

        {settings === null ? (
          <p className="text-sm text-muted/60">Loading…</p>
        ) : (
          <form onSubmit={save} className="space-y-5">

            {/* Funnel leads */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <label className="mb-1 block text-xs font-bold text-amber-900">🟡 Funnel Lead Alert Email</label>
              <input
                type="email"
                className={IC}
                placeholder="info@hcmgloans.com — or leave blank"
                value={form.company_notify_email}
                onChange={(e) => setForm((p) => ({ ...p, company_notify_email: e.target.value }))}
              />
              <p className="mt-1 text-[11px] text-amber-800/70">
                Leads from /get-started, /team, /seo/* (no LO assigned). Leave blank to disable.
              </p>
            </div>

            {/* Contact leads */}
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <label className="mb-1 block text-xs font-bold text-orange-900">🟠 Contact Form Alert Email</label>
              <input
                type="email"
                className={IC}
                placeholder="info@hcmgloans.com — or leave blank"
                value={form.contact_notify_email}
                onChange={(e) => setForm((p) => ({ ...p, contact_notify_email: e.target.value }))}
              />
              <p className="mt-1 text-[11px] text-orange-800/70">
                Leads from /contact. General inquiries only — no mortgage data. Leave blank to disable.
              </p>
            </div>

            {/* Recruiting leads */}
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <label className="mb-1 block text-xs font-bold text-blue-900">🔵 Recruiting Alert Email</label>
              <input
                type="email"
                className={IC}
                placeholder="recruiting@hcmgloans.com — or leave blank"
                value={form.recruiting_notify_email}
                onChange={(e) => setForm((p) => ({ ...p, recruiting_notify_email: e.target.value }))}
              />
              <p className="mt-1 text-[11px] text-blue-800/70">
                Leads from /join and /careers. Leave blank to disable.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Company Lead Display Label</label>
              <input
                type="text"
                className={IC}
                placeholder="HCMG Company"
                value={form.company_funnel_label}
                onChange={(e) => setForm((p) => ({ ...p, company_funnel_label: e.target.value }))}
              />
              <p className="mt-1 text-[11px] text-muted/60">
                The label shown in the Leads table for unassigned leads.
              </p>
            </div>

            {/* GA4 + GSC */}
            <div className="col-span-full rounded-xl border border-line bg-sand/50 p-4 space-y-4">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-muted/70">Analytics Integrations</p>

              {/* Google OAuth Connect */}
              {settings?.google_refresh_token ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-green-800">✅ Google Account Connected</p>
                    <p className="text-xs text-green-700 mt-0.5">{settings.google_connected_email}</p>
                  </div>
                  <a href="/api/auth/google/connect"
                    className="text-xs font-semibold text-green-700 underline underline-offset-2 hover:text-green-900">
                    Reconnect
                  </a>
                </div>
              ) : (
                <div className="rounded-lg border border-line bg-white p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-ink">Connect Google Account</p>
                    <p className="text-xs text-muted mt-0.5">Required for live GA4 Traffic and Search Console SEO data in the Analytics dashboard.</p>
                  </div>
                  <a href="/api/auth/google/connect"
                    className="shrink-0 inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm hover:bg-sand transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Connect with Google
                  </a>
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-bold text-ink">GA4 Measurement ID <span className="font-normal text-muted/60">(for page tracking)</span></label>
                <input
                  type="text"
                  className={IC}
                  placeholder="G-XXXXXXXXXX"
                  value={form.ga4_measurement_id}
                  onChange={(e) => setForm((p) => ({ ...p, ga4_measurement_id: e.target.value }))}
                />
                <p className="mt-1 text-[11px] text-muted/60">
                  Found in GA4 → Admin → Data Streams. Format: <code>G-XXXXXXXXXX</code>. Injected on every page for tracking.
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-ink">GA4 Property ID <span className="font-normal text-muted/60">(for Data API — live dashboard)</span></label>
                <input
                  type="text"
                  className={IC}
                  placeholder="123456789"
                  value={form.ga4_property_id}
                  onChange={(e) => setForm((p) => ({ ...p, ga4_property_id: e.target.value }))}
                />
                <p className="mt-1 text-[11px] text-muted/60">
                  Numeric property ID. Found in GA4 → Admin → Property Settings. <strong>Different from the Measurement ID.</strong>
                </p>
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-ink">Google Search Console Property URL <span className="font-normal text-muted/60">(for live SEO dashboard)</span></label>
                <input
                  type="text"
                  className={IC}
                  placeholder="https://hcmgloans.com"
                  value={form.gsc_property}
                  onChange={(e) => setForm((p) => ({ ...p, gsc_property: e.target.value }))}
                />
                <p className="mt-1 text-[11px] text-muted/60">
                  Your verified GSC property URL. Must exactly match the property in Search Console (include https://, no trailing slash).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <button type="submit" disabled={saving}
                className="primary-button !py-2.5 !px-6 !text-sm disabled:opacity-50">
                {saving ? "Saving…" : "Save settings →"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Company funnel pages */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line bg-sand/60 px-5 py-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Company Funnel Pages</h2>
        </div>
        <p className="px-5 pt-4 pb-2 text-xs text-muted">
          These pages accept leads that are not tied to any specific loan officer.
          All submissions land in the admin portal under the Company Leads section.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.1em] text-muted/60">
              <th className="px-5 py-3 text-left">Page</th>
              <th className="px-5 py-3 text-left">Type</th>
              <th className="px-5 py-3 text-left">Description</th>
              <th className="px-5 py-3 text-left">Open</th>
            </tr>
          </thead>
          <tbody>
            {COMPANY_PAGES.map((p, i) => (
              <tr key={p.path} className={i % 2 === 0 ? "bg-white" : "bg-sand/30"}>
                <td className="px-5 py-3 font-semibold text-ink text-sm">{p.label}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold ${TYPE_BADGE[p.type]?.cls ?? ""}`}>
                    {TYPE_BADGE[p.type]?.label ?? p.type}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-muted">{p.desc}</td>
                <td className="px-5 py-3">
                  <a href={p.path} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold text-accent hover:underline">
                    {p.path} ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
