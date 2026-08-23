"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { LiftOffRequest } from "@/lib/database.types";

interface LookupSlideOverProps {
  open:    boolean;
  onClose: () => void;
  context: "ops" | "helpdesk" | "lockdesk" | "pipeline";
}

interface LookupUser { id: string; full_name: string; type: "lo" | "team"; }

const TYPE_LABELS: Record<string, string> = {
  register_disclosure: "Register + Disclosure",
  disclosure_only:     "Disclosure Only",
  submission:          "Submission",
  loan_help_desk:      "Loan Help Desk",
  lock_request:        "Lock Desk Request",
};
const TYPE_ICONS: Record<string, string> = {
  register_disclosure: "📋",
  disclosure_only:     "📄",
  submission:          "🚀",
  loan_help_desk:      "🛎",
  lock_request:        "🔒",
};
const STATUS_STYLES: Record<string, string> = {
  pending:       "bg-yellow-50 text-yellow-700 border-yellow-200",
  in_review:     "bg-blue-50 text-blue-700 border-blue-200",
  action_needed: "bg-orange-50 text-orange-700 border-orange-200",
  completed:     "bg-green-50 text-green-700 border-green-200",
  cancelled:     "bg-gray-50 text-gray-500 border-gray-200",
};
const STATUS_LABELS: Record<string, string> = {
  pending:       "Pending",
  in_review:     "In Review",
  action_needed: "Action Needed",
  completed:     "Completed",
  cancelled:     "Cancelled",
};
const CONTEXT_LABELS: Record<string, string> = {
  ops:      "Ops Queue",
  helpdesk: "Help Desk Queue",
  lockdesk: "Lock Desk Queue",
  pipeline: "Pipeline",
};

type SearchMode = "arive" | "user";

function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function LookupSlideOver({ open, onClose, context }: LookupSlideOverProps) {
  const router = useRouter();
  const [mode, setMode]         = useState<SearchMode>("arive");
  const [query, setQuery]       = useState("");
  const [userId, setUserId]     = useState("");
  const [users, setUsers]       = useState<LookupUser[]>([]);
  const [usersFetched, setUsersFetched] = useState(false);
  const [results, setResults]   = useState<LiftOffRequest[] | null>(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  // Esc to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Fetch users once on first open
  useEffect(() => {
    if (!open || usersFetched) return;
    setUsersFetched(true);
    fetch("/api/liftoff/lookup-users")
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.users)) setUsers(d.users); })
      .catch(() => {});
  }, [open, usersFetched]);

  function switchMode(m: SearchMode) {
    setMode(m);
    setQuery("");
    setUserId("");
    setResults(null);
    setError("");
  }

  async function doSearch() {
    const q = mode === "user" ? userId : query.trim();
    if (!q) return;
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const res = await fetch(`/api/liftoff/lookup?mode=${mode}&q=${encodeURIComponent(q)}&context=${context}`);
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Search failed."); }
      else { setResults(data.results ?? []); }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") doSearch();
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] flex flex-col bg-white shadow-2xl border-l border-line">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line flex-shrink-0">
          <span className="text-base font-extrabold text-ink">🔍 Quick Lookup</span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white
                       text-muted hover:bg-red-50 hover:text-red-500 transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* Mode tabs */}
        <div className="mx-5 mt-4 mb-0 flex gap-1 rounded-xl border border-line bg-sand p-1 flex-shrink-0">
          {(["arive", "user"] as SearchMode[]).map(m => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                mode === m
                  ? "bg-[#142850] text-white"
                  : "text-muted hover:bg-white hover:text-ink"
              }`}
            >
              {m === "arive" ? "ARIVE #" : "By User"}
            </button>
          ))}
        </div>

        {/* Search area */}
        <div className="px-5 py-4 border-b border-line flex-shrink-0">
          <div className="flex gap-2">
            {mode === "user" ? (
              <select
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className="flex-1 rounded-xl border border-line px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-[#142850]/20 focus:border-[#142850]/40"
              >
                <option value="">Select a user…</option>
                {users.filter(u => u.type === "lo").length > 0 && (
                  <optgroup label="Loan Officers">
                    {users.filter(u => u.type === "lo").map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </optgroup>
                )}
                {users.filter(u => u.type === "team").length > 0 && (
                  <optgroup label="Team Members">
                    {users.filter(u => u.type === "team").map(u => (
                      <option key={u.id} value={u.id}>{u.full_name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            ) : (
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="e.g. HCMG-2025-4471"
                className="flex-1 rounded-xl border border-line px-3 py-2 text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-[#142850]/20 focus:border-[#142850]/40"
              />
            )}
            <button
              onClick={doSearch}
              disabled={loading || (mode === "user" ? !userId : !query.trim())}
              className="rounded-xl bg-[#142850] text-white px-4 py-2 text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#142850]/90 transition-colors whitespace-nowrap"
            >
              {loading ? "…" : "Search"}
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {loading && (
            <div className="flex justify-center pt-8">
              <div className="h-6 w-6 rounded-full border-2 border-[#142850] border-t-transparent animate-spin" />
            </div>
          )}
          {!loading && error && (
            <p className="text-sm text-red-600 text-center pt-6">{error}</p>
          )}
          {!loading && !error && results !== null && results.length === 0 && (
            <p className="text-sm text-muted text-center pt-6">No results found.</p>
          )}
          {!loading && !error && results !== null && results.length > 0 && results.map(r => (
            <button
              key={r.id}
              type="button"
              onClick={() => { onClose(); router.push("/liftoff/" + r.id); }}
              className="block w-full text-left"
            >
              <div className="rounded-xl border border-line bg-white px-4 py-3 space-y-1.5 hover:border-[#142850]/40 hover:shadow-sm transition-all">
                {/* Row 1: borrower + ARIVE # */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm text-ink leading-tight">
                    {r.borrower_first_name} {r.borrower_last_name}
                    {r.co_borrower_first_name && (
                      <span className="font-normal text-muted ml-1 text-xs">+ {r.co_borrower_first_name}</span>
                    )}
                  </span>
                  {r.arive_loan_number && (
                    <span className="font-mono text-[11px] text-muted/70 whitespace-nowrap shrink-0">
                      {r.arive_loan_number}
                    </span>
                  )}
                </div>
                {/* Row 2: type badge + status badge */}
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-sand px-2 py-0.5 text-[10px] font-medium text-ink border border-line">
                    {TYPE_ICONS[r.request_type] ?? "📎"} {TYPE_LABELS[r.request_type] ?? r.request_type}
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${STATUS_STYLES[r.request_status] ?? "bg-gray-50 text-gray-500 border-gray-200"}`}>
                    {STATUS_LABELS[r.request_status] ?? r.request_status}
                  </span>
                </div>
                {/* Row 3: submitted date + submitter */}
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>{fmtDate(r.created_at)}</span>
                  <span className="truncate max-w-[160px] text-right">{r.submitter_name}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-line flex-shrink-0 text-[11px] text-muted/60 text-center">
          Results scoped to {CONTEXT_LABELS[context]} · max 50
        </div>
      </div>
    </>
  );
}
