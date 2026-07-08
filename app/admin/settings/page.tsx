"use client";

import { useState, useEffect } from "react";

interface Settings {
  company_notify_email: string;
  company_funnel_label: string;
}

const COMPANY_PAGES = [
  { label: "Get Started (/get-started)",   path: "/get-started",  desc: "Main mortgage estimate funnel — no LO assigned" },
  { label: "Contact (/contact)",            path: "/contact",       desc: "General contact form" },
  { label: "Join (/join)",                  path: "/join",          desc: "Join the HCMG team form" },
];

export default function SettingsPage() {
  const [settings, setSettings]   = useState<Settings | null>(null);
  const [form,     setForm]       = useState<Settings>({ company_notify_email: "", company_funnel_label: "" });
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
          Configure company-wide lead routing and notification emails.
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

      {/* Lead routing */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <h2 className="mb-1 text-sm font-black uppercase tracking-[0.14em] text-muted">Company Lead Routing</h2>
        <p className="mb-5 text-xs text-muted">
          Leads that come in through the company pages below (not tied to a specific loan officer) are
          sent to this email address. This is in addition to the lead always being saved to the Leads table.
        </p>

        {settings === null ? (
          <p className="text-sm text-muted/60">Loading…</p>
        ) : (
          <form onSubmit={save} className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Company Notification Email</label>
              <input
                type="email"
                required
                className={IC}
                placeholder="info@harriscapitalmortgage.com"
                value={form.company_notify_email}
                onChange={(e) => setForm((p) => ({ ...p, company_notify_email: e.target.value }))}
              />
              <p className="mt-1 text-[11px] text-muted/60">
                All non-LO-routed leads (from /get-started, /contact, /team, /go/company) send an alert here.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-ink">Company Funnel Label</label>
              <input
                type="text"
                required
                className={IC}
                placeholder="HCMG Company"
                value={form.company_funnel_label}
                onChange={(e) => setForm((p) => ({ ...p, company_funnel_label: e.target.value }))}
              />
              <p className="mt-1 text-[11px] text-muted/60">
                Display name used in the Leads table when a lead has no assigned LO.
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
          These public pages generate leads that are not tied to a specific loan officer.
          Leads from these pages are routed to the company notification email above.
        </p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.1em] text-muted/60">
              <th className="px-5 py-3 text-left">Page</th>
              <th className="px-5 py-3 text-left">Description</th>
              <th className="px-5 py-3 text-left">Link</th>
            </tr>
          </thead>
          <tbody>
            {COMPANY_PAGES.map((p, i) => (
              <tr key={p.path} className={i % 2 === 0 ? "bg-white" : "bg-sand/30"}>
                <td className="px-5 py-3 font-semibold text-ink">{p.label}</td>
                <td className="px-5 py-3 text-xs text-muted">{p.desc}</td>
                <td className="px-5 py-3">
                  <a href={p.path} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-bold text-accent hover:underline">
                    Open ↗
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* How leads are routed */}
      <div className="rounded-2xl border border-line bg-sand p-5 text-sm leading-7 text-muted">
        <p className="font-semibold text-ink">How company vs LO lead routing works</p>
        <ul className="mt-2 space-y-1 text-xs leading-6">
          <li>
            <span className="font-semibold text-ink">LO funnel link</span> (e.g. /go/cason-knight) →
            lead assigned to that LO, notification sent to their notify email
          </li>
          <li>
            <span className="font-semibold text-ink">Company pages</span> (/get-started, /contact, /team) →
            lead has no LO assignment, notification sent to the company email above
          </li>
          <li>
            <span className="font-semibold text-ink">All leads</span> → always saved to the Leads table
            regardless of source
          </li>
        </ul>
      </div>
    </div>
  );
}
