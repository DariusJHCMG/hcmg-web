"use client";

import { useEffect, useState } from "react";

interface Check {
  label: string;
  key: string;
  ok: boolean | null;
  value: string;
}

export default function DevToolsPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [apiHealth, setApiHealth]   = useState<"checking" | "ok" | "error">("checking");
  const [dbHealth,  setDbHealth]    = useState<"checking" | "ok" | "error">("checking");
  const [revalidating, setRevalidating] = useState(false);
  const [revalMsg, setRevalMsg] = useState("");
  const [backfilling, setBackfilling] = useState(false);
  const [backfillResults, setBackfillResults] = useState<{ slug: string; name: string; status: string }[] | null>(null);
  const [backfillingFunnels, setBackfillingFunnels] = useState(false);
  const [backfillFunnelsResult, setBackfillFunnelsResult] = useState<{ total_los: number; total_funnel_types: number; total_created: number } | null>(null);
  const [backfillFunnelsError, setBackfillFunnelsError] = useState("");

  useEffect(() => {
    fetchChecks();
    checkApiHealth();
    checkDbHealth();
  }, []);

  async function fetchChecks() {
    const res  = await fetch("/api/admin/dev/env");
    const data = await res.json();
    setChecks(data.checks ?? []);
  }

  async function checkApiHealth() {
    try {
      const res = await fetch("/api/lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      // 400 = endpoint alive (bad payload expected), anything else = bad
      setApiHealth(res.status === 400 ? "ok" : "error");
    } catch { setApiHealth("error"); }
  }

  async function checkDbHealth() {
    try {
      const res  = await fetch("/api/admin/dev/db-health");
      const data = await res.json();
      setDbHealth(data.ok ? "ok" : "error");
    } catch { setDbHealth("error"); }
  }

  async function backfillProfiles() {
    setBackfilling(true); setBackfillResults(null);
    try {
      const res  = await fetch("/api/admin/dev/backfill-profiles", { method: "POST" });
      const json = await res.json();
      setBackfillResults(json.results ?? [{ slug: "", name: "", status: json.error ?? "Unknown error" }]);
    } catch (e) {
      setBackfillResults([{ slug: "", name: "", status: String(e) }]);
    }
    setBackfilling(false);
  }

  async function backfillFunnels() {
    setBackfillingFunnels(true); setBackfillFunnelsResult(null); setBackfillFunnelsError("");
    try {
      const res  = await fetch("/api/admin/dev/backfill-funnels", { method: "POST" });
      const json = await res.json();
      if (json.ok) {
        setBackfillFunnelsResult(json);
      } else {
        setBackfillFunnelsError(json.error ?? "Unknown error");
      }
    } catch (e) {
      setBackfillFunnelsError(String(e));
    }
    setBackfillingFunnels(false);
  }

  async function revalidateAll() {
    setRevalidating(true); setRevalMsg("");
    const res = await fetch("/api/admin/dev/revalidate", { method: "POST" });
    const json = await res.json();
    setRevalMsg(json.ok ? "Cache cleared successfully." : "Revalidation failed.");
    setRevalidating(false);
  }

  const STATUS = {
    ok:       <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700">✓ OK</span>,
    error:    <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">✗ Error</span>,
    checking: <span className="inline-flex rounded-full bg-sand px-2.5 py-0.5 text-[11px] font-bold text-muted/70">… Checking</span>,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-ink">Developer Tools</h1>
        <p className="mt-1 text-sm text-muted">Environment health, API status, and cache controls.</p>
      </div>

      {/* API + DB health */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="mb-2 text-sm font-bold text-ink">Lead API</p>
          <p className="mb-3 text-xs text-muted">POST /api/lead endpoint reachability</p>
          {STATUS[apiHealth]}
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <p className="mb-2 text-sm font-bold text-ink">Supabase Database</p>
          <p className="mb-3 text-xs text-muted">Connection to profiles table</p>
          {STATUS[dbHealth]}
        </div>
      </div>

      {/* Env checks */}
      <div className="rounded-2xl border border-line bg-white overflow-hidden">
        <div className="border-b border-line bg-sand px-6 py-3">
          <p className="text-sm font-bold text-ink">Environment Variables</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-[0.1em] text-muted/70">
              <th className="px-5 py-3 text-left">Variable</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Value (masked)</th>
            </tr>
          </thead>
          <tbody>
            {checks.length === 0 && (
              <tr><td colSpan={3} className="px-6 py-6 text-center text-sm text-muted/60">Checking…</td></tr>
            )}
            {checks.map((c, i) => (
              <tr key={c.key} className={i % 2 === 0 ? "bg-white" : "bg-sand/40"}>
                <td className="px-5 py-3 font-mono text-xs text-ink">{c.key}</td>
                <td className="px-5 py-3">
                  {c.ok
                    ? <span className="inline-flex rounded-full bg-green-50 px-2.5 py-0.5 text-[11px] font-bold text-green-700">✓ Set</span>
                    : <span className="inline-flex rounded-full bg-red-50 px-2.5 py-0.5 text-[11px] font-bold text-red-600">✗ Missing</span>
                  }
                </td>
                <td className="px-5 py-3 font-mono text-xs text-muted">{c.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cache revalidation */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <p className="mb-1 text-sm font-bold text-ink">Cache Revalidation</p>
        <p className="mb-4 text-xs text-muted">Force Next.js to regenerate all cached static pages on next request.</p>
        <div className="flex items-center gap-4">
          <button
            onClick={revalidateAll}
            disabled={revalidating}
            className="secondary-button !py-2 !px-5 !text-sm disabled:opacity-50"
          >
            {revalidating ? "Clearing…" : "Revalidate all pages"}
          </button>
          {revalMsg && <p className="text-sm font-semibold text-green-600">{revalMsg}</p>}
        </div>
      </div>

      {/* Backfill static team data */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <p className="mb-1 text-sm font-bold text-ink">Backfill Static Team Data → Profiles</p>
        <p className="mb-4 text-xs text-muted">
          Writes title, NMLS, offices, and short bio from the static team roster into any matching Supabase
          profile that has those fields blank. Safe to run multiple times — never overwrites existing data.
        </p>
        <button
          onClick={backfillProfiles}
          disabled={backfilling}
          className="secondary-button !py-2 !px-5 !text-sm disabled:opacity-50"
        >
          {backfilling ? "Running…" : "Run backfill"}
        </button>

        {backfillResults && (
          <div className="mt-4 overflow-x-auto rounded-xl border border-line">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-line bg-sand/60 text-left font-semibold uppercase tracking-[0.1em] text-muted/70">
                  <th className="px-4 py-2">Slug</th>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Result</th>
                </tr>
              </thead>
              <tbody>
                {backfillResults.map((r, i) => (
                  <tr key={i} className={`border-b border-line/50 ${r.status.startsWith("updated") ? "bg-green-50" : r.status.startsWith("error") ? "bg-red-50" : ""}`}>
                    <td className="px-4 py-2 font-mono">{r.slug || "—"}</td>
                    <td className="px-4 py-2 font-semibold text-ink">{r.name || "—"}</td>
                    <td className="px-4 py-2 text-muted">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Backfill all funnel links */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <p className="mb-1 text-sm font-bold text-ink">Backfill Funnel Library → All LOs</p>
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">
          <p className="font-bold">⚠ Requires DB migration first</p>
          <p className="mt-1">Run this SQL in Supabase before clicking the button:</p>
          <code className="mt-1.5 block whitespace-nowrap rounded bg-white/60 px-2 py-1 font-mono text-[11px] text-amber-900">
            ALTER TABLE funnel_links ADD COLUMN IF NOT EXISTS funnel_type TEXT DEFAULT NULL;
          </code>
        </div>
        <p className="mb-4 text-xs text-muted">
          Creates one funnel_link row per funnel type (107 funnels) for every active LO with a slug.
          Safe to run multiple times — only creates rows that don&apos;t already exist.
          Run this after adding new funnels to the catalog or creating LO accounts in bulk.
        </p>
        <button
          onClick={backfillFunnels}
          disabled={backfillingFunnels}
          className="secondary-button !py-2 !px-5 !text-sm disabled:opacity-50"
        >
          {backfillingFunnels ? "Running…" : "Run funnel backfill"}
        </button>
        {backfillFunnelsResult && (
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-xs font-bold text-green-700">
              ✓ {backfillFunnelsResult.total_created} rows created
            </span>
            <span className="rounded-xl border border-line bg-sand px-4 py-2 text-xs font-semibold text-muted">
              {backfillFunnelsResult.total_los} LOs · {backfillFunnelsResult.total_funnel_types} funnel types
            </span>
          </div>
        )}
        {backfillFunnelsError && (
          <p className="mt-3 text-sm font-semibold text-red-600">{backfillFunnelsError}</p>
        )}
      </div>

      {/* Quick links */}
      <div className="rounded-2xl border border-line bg-white p-6">
        <p className="mb-4 text-sm font-bold text-ink">Quick Links</p>
        <div className="flex flex-wrap gap-3 text-sm">
          {[
            { label: "Supabase Dashboard", href: "https://supabase.com/dashboard" },
            { label: "Vercel Dashboard",   href: "https://vercel.com/dashboard" },
            { label: "Resend Dashboard",   href: "https://resend.com/emails" },
            { label: "NMLS Consumer Access", href: "https://www.nmlsconsumeraccess.org/EntityDetails.aspx/COMPANY/1918223" },
          ].map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-line bg-sand px-4 py-2.5 font-semibold text-ink transition-colors hover:border-accent hover:text-accent"
            >
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
