"use client";

import { useMemo, useState } from "react";
import { STATE_CODES, STATE_NAMES, type LicenseStatus } from "@/lib/license-states";
import { STATE_PATHS } from "@/lib/statePaths";

const OPTIONS: { value: LicenseStatus; label: string; short: string; color: string; soft: string }[] = [
  { value: "active", label: "Licensed & Active", short: "Active", color: "#F37021", soft: "#FFF1E8" },
  { value: "coming_soon", label: "Coming Soon", short: "Soon", color: "#142850", soft: "#EEF2F8" },
  { value: "unavailable", label: "Not Available", short: "Off", color: "#94A3B8", soft: "#F1F5F9" },
];

export function LicensesClient({ initialStates }: { initialStates: Record<string, LicenseStatus> }) {
  const [states, setStates] = useState(initialStates);
  const [saved, setSaved] = useState(initialStates);
  const [filter, setFilter] = useState<LicenseStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(states) !== JSON.stringify(saved);
  const counts = useMemo(() => Object.fromEntries(OPTIONS.map(o => [o.value, STATE_CODES.filter(c => states[c] === o.value).length])), [states]);
  const visible = STATE_CODES.filter(code => (filter === "all" || states[code] === filter) && `${STATE_NAMES[code]} ${code}`.toLowerCase().includes(query.toLowerCase()));

  function update(code: string, status: LicenseStatus) {
    setNotice("");
    setStates(current => ({ ...current, [code]: status }));
  }

  async function save() {
    setSaving(true); setNotice("");
    const response = await fetch("/api/admin/licenses", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ states }) });
    const data = await response.json().catch(() => ({}));
    setSaving(false);
    if (!response.ok) return setNotice(data.error ?? "Could not save license settings.");
    setSaved(data.states); setStates(data.states); setNotice("Saved. The public maps are now updated.");
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-28">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Website controls</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">State licenses</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Control exactly how every state appears on the homepage and Find a Loan Officer map. Changes publish as soon as you save.</p>
        </div>
        <a href="/#where-we-lend" target="_blank" className="secondary-button whitespace-nowrap !px-4 !py-2.5 !text-sm">View public map ↗</a>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {OPTIONS.map(option => <button key={option.value} onClick={() => setFilter(filter === option.value ? "all" : option.value)} className={`rounded-2xl border bg-white p-5 text-left shadow-soft transition ${filter === option.value ? "border-accent ring-2 ring-accent/10" : "border-line hover:border-accent/40"}`}>
          <div className="flex items-center justify-between"><span className="h-3 w-3 rounded-full" style={{ background: option.color }} /><span className="text-3xl font-black text-ink">{counts[option.value]}</span></div>
          <p className="mt-3 text-sm font-bold text-ink">{option.label}</p><p className="mt-1 text-xs text-muted">Click to filter</p>
        </button>)}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
        <section className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
          <div className="border-b border-line p-5"><p className="text-sm font-extrabold text-ink">Live map preview</p><p className="mt-1 text-xs text-muted">Updates instantly while you make selections.</p></div>
          <div className="bg-sand p-5">
            <svg viewBox="0 0 975 610" className="w-full" aria-label="License map preview">
              {Object.keys(STATE_PATHS).map(code => <path key={code} d={STATE_PATHS[code]} fill={states[code] === "active" ? "#F37021" : states[code] === "coming_soon" ? "#142850" : "#CBD5E1"} stroke="#fff" strokeWidth="1.3" className="cursor-pointer transition-colors" onClick={() => update(code, states[code] === "active" ? "coming_soon" : states[code] === "coming_soon" ? "unavailable" : "active")}><title>{STATE_NAMES[code]} — {OPTIONS.find(o => o.value === states[code])?.label}</title></path>)}
            </svg>
          </div>
          <div className="flex flex-wrap gap-4 border-t border-line px-5 py-4">{OPTIONS.map(o => <span key={o.value} className="flex items-center gap-2 text-xs font-semibold text-muted"><span className="h-2.5 w-2.5 rounded-sm" style={{ background:o.color }}/>{o.label}</span>)}</div>
        </section>

        <section className="rounded-3xl border border-line bg-white shadow-card">
          <div className="flex flex-col gap-3 border-b border-line p-5 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-sm font-extrabold text-ink">All states</p><p className="mt-1 text-xs text-muted">Choose one status per state.</p></div>
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search states…" className="input-base w-full rounded-xl border border-line px-3 py-2 text-sm sm:w-48" />
          </div>
          <div className="max-h-[610px] divide-y divide-line overflow-y-auto">
            {visible.map(code => <div key={code} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black text-white" style={{ background: OPTIONS.find(o => o.value === states[code])?.color }}>{code}</span><div><p className="text-sm font-bold text-ink">{STATE_NAMES[code]}</p><p className="text-xs text-muted">{OPTIONS.find(o => o.value === states[code])?.label}</p></div></div>
              <div className="grid grid-cols-3 gap-1 rounded-xl bg-sand p-1">{OPTIONS.map(o => <button key={o.value} onClick={() => update(code, o.value)} title={o.label} className={`rounded-lg px-2.5 py-2 text-[11px] font-bold transition ${states[code] === o.value ? "text-white shadow-sm" : "text-muted hover:bg-white"}`} style={states[code] === o.value ? { background:o.color } : undefined}>{o.short}</button>)}</div>
            </div>)}
            {!visible.length && <p className="p-10 text-center text-sm text-muted">No states match this filter.</p>}
          </div>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 p-4 shadow-[0_-10px_30px_rgba(15,23,42,.08)] backdrop-blur lg:left-56">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4"><div><p className={`text-sm font-bold ${dirty ? "text-accent" : "text-ink"}`}>{dirty ? "You have unpublished changes" : "Everything is up to date"}</p>{notice && <p className={`text-xs ${notice.startsWith("Saved") ? "text-green-700" : "text-red-600"}`}>{notice}</p>}</div><div className="flex gap-2"><button disabled={!dirty || saving} onClick={() => setStates(saved)} className="secondary-button !px-4 !py-2.5 !text-sm disabled:opacity-40">Discard</button><button disabled={!dirty || saving} onClick={save} className="primary-button !px-5 !py-2.5 !text-sm disabled:opacity-40">{saving ? "Publishing…" : "Save & publish"}</button></div></div>
      </div>
    </div>
  );
}
