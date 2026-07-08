"use client";

import { useState, useEffect } from "react";

interface Settings {
  company_notify_email:    string;
  company_funnel_label:    string;
  contact_notify_email:    string;
  recruiting_notify_email: string;
}

const COMPANY_PAGES = [
  { label: "Get Started",  path: "/get-started",  desc: "Mortgage estimate funnel — no LO assigned", type: "company" },
  { label: "Contact",      path: "/contact",       desc: "General contact form",                      type: "company" },
  { label: "Team page",    path: "/team",          desc: "Leads without an LO link clicked",          type: "company" },
  { label: "Join / Careers (/join)", path: "/join", desc: "LO recruiting inquiry form",               type: "employment" },
  { label: "Careers — Producing Manager", path: "/careers/producing-manager", desc: "Branch partner recruiting form", type: "employment" },
  { label: "Careers — Move Your Team",    path: "/careers/move-your-team",    desc: "Team move recruiting form",      type: "employment" },
  { label: "Careers — Corporate",         path: "/careers/corporate",         desc: "Corporate role recruiting form", type: "employment" },
];

export default function SettingsPage() {
  const [settings, setSettings]   = useState<Settings | null>(null);
  const [form,     setForm]       = useState<Settings>({ company_notify_email: "", company_funnel_label: "", contact_notify_email: "", recruiting_notify_email: "" });
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
                placeholder="info@harriscapitalmortgage.com — or leave blank"
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
                placeholder="info@harriscapitalmortgage.com — or leave blank"
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
                placeholder="recruiting@harriscapitalmortgage.com — or leave blank"
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
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold
                    ${p.type === "employment"
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                    {p.type === "employment" ? "Employment" : "Company"}
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
