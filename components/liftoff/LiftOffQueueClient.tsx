"use client";

import { useState } from "react";
import Link from "next/link";
import type { LiftOffRequest } from "@/lib/database.types";

const TYPE_LABELS: Record<string, string> = {
  register_disclosure:  "Register + Disclosure",
  disclosure_only:      "Disclosure Only",
  submission:           "Submission",
  restructure_suspense: "Restructure / Suspense",
  lock_request:         "Lock Desk Request",
};

const TYPE_ICONS: Record<string, string> = {
  register_disclosure:  "📋",
  disclosure_only:      "📄",
  submission:           "🚀",
  restructure_suspense: "🔄",
  lock_request:         "🔒",
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

function fmtTs(s: string | null | undefined) {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-US", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function WorkflowBadge({ r }: { r: LiftOffRequest }) {
  if (r.completed_at) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Completed {fmtTs(r.completed_at)}
      </div>
    );
  }
  if (r.started_at) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        In Flight since {fmtTs(r.started_at)}
      </div>
    );
  }
  if (r.claimed_at) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-purple-700">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
        Claimed {fmtTs(r.claimed_at)}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-[10px] font-bold text-yellow-700">
      <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
      Awaiting pickup
    </div>
  );
}

function RequestRow({
  request,
  onUpdated,
}: {
  request: LiftOffRequest;
  onUpdated: (updated: Partial<LiftOffRequest> & { id: string }) => void;
}) {
  const [busy, setBusy]         = useState(false);
  const [err, setErr]           = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes]       = useState("");

  const r = request;

  async function doAction(action: "claim" | "start" | "complete") {
    setBusy(true); setErr("");
    const body = action === "complete" && notes.trim() ? { notes: notes.trim() } : undefined;
    const res = await fetch(`/api/liftoff/${r.id}/${action}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) { setErr(data.error ?? "Failed"); return; }
    if (action === "claim") {
      onUpdated({ id: r.id, request_status: "in_review", claimed_at: data.claimed_at, claimed_by_name: data.claimed_by_name });
    } else if (action === "start") {
      onUpdated({ id: r.id, started_at: data.started_at });
    } else {
      onUpdated({ id: r.id, request_status: "completed", completed_at: data.completed_at });
      setShowNotes(false);
    }
  }

  const canClaim    = r.request_status === "pending" && !r.claimed_by_id;
  const canStart    = r.request_status === "in_review" && r.claimed_at && !r.started_at;
  const canComplete = r.request_status !== "completed" && r.request_status !== "cancelled" && r.claimed_at;

  return (
    <div className={`rounded-2xl border bg-white p-5 space-y-3 transition-all ${
      r.request_status === "completed" ? "border-green-200 opacity-75" :
      r.started_at ? "border-blue-300" :
      r.claimed_at ? "border-purple-200" :
      "border-line"
    }`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[r.request_type] ?? "📁"}</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-ink text-sm">
                {r.borrower_first_name} {r.borrower_last_name}
                {r.co_borrower_first_name && (
                  <span className="ml-1 font-normal text-muted text-xs">+ {r.co_borrower_first_name}</span>
                )}
              </p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${STATUS_STYLES[r.request_status] ?? ""}`}>
                {STATUS_LABELS[r.request_status] ?? r.request_status}
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">{TYPE_LABELS[r.request_type] ?? r.request_type}</p>
            <p className="text-[11px] text-muted/60 mt-0.5 font-mono">{r.arive_loan_number ?? "No ARIVE #"}</p>
          </div>
        </div>
        <div className="flex-shrink-0 text-right space-y-1">
          <p className="text-[10px] font-semibold text-muted/60">Submitted</p>
          <p className="text-xs font-bold text-ink">{fmtTs(r.created_at)}</p>
        </div>
      </div>

      {/* Workflow status */}
      <WorkflowBadge r={r} />

      {/* LO info */}
      <div className="flex items-center gap-4 pt-1 border-t border-line text-xs text-muted">
        <span><span className="font-semibold text-ink">{r.submitter_name}</span> · NMLS# {r.submitter_nmls ?? "—"}</span>
        {r.submitter_email && <span>{r.submitter_email}</span>}
        {r.submitter_phone && <span>{r.submitter_phone}</span>}
      </div>

      {/* Claimed-by */}
      {r.claimed_by_name && (
        <div className="text-[11px] text-muted/70">
          Claimed by <span className="font-semibold text-ink">{r.claimed_by_name}</span> at {fmtTs(r.claimed_at)}
          {r.started_at && <> · Started {fmtTs(r.started_at)}</>}
        </div>
      )}

      {/* Error */}
      {err && (
        <p className="text-xs text-red-600 font-medium">{err}</p>
      )}

      {/* Completion notes textarea */}
      {showNotes && (
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional completion notes for the LO (will appear in their email)…"
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink
                       placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40 resize-none"
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2 flex-wrap pt-1">
        <Link href={`/liftoff/${r.id}`}
          className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-semibold text-ink hover:bg-sand transition-colors">
          View →
        </Link>

        {canClaim && (
          <button disabled={busy} onClick={() => doAction("claim")}
            className="rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#a855f7,#7c3aed)" }}>
            {busy ? "…" : "Claim"}
          </button>
        )}

        {canStart && (
          <button disabled={busy} onClick={() => doAction("start")}
            className="rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#3b82f6,#1d4ed8)" }}>
            {busy ? "…" : "✈️ Start — Notify LO"}
          </button>
        )}

        {canComplete && !showNotes && (
          <button disabled={busy} onClick={() => setShowNotes(true)}
            className="rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
            ✅ Complete
          </button>
        )}

        {showNotes && (
          <>
            <button disabled={busy} onClick={() => doAction("complete")}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
              {busy ? "Completing…" : "✅ Confirm Complete + Notify LO"}
            </button>
            <button onClick={() => setShowNotes(false)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:bg-sand">
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Queue tabs ─────────────────────────────────────────────────────────────────

type Tab = "active" | "completed" | "all";

export function LiftOffQueueClient({
  initialRequests,
  processorName,
}: {
  initialRequests: LiftOffRequest[];
  processorName: string;
}) {
  const [requests, setRequests] = useState<LiftOffRequest[]>(initialRequests);
  const [tab, setTab]           = useState<Tab>("active");

  function handleUpdated(patch: Partial<LiftOffRequest> & { id: string }) {
    setRequests(prev =>
      prev.map(r => r.id === patch.id ? { ...r, ...patch } : r)
    );
  }

  const filtered = requests.filter(r => {
    if (tab === "active")    return r.request_status !== "completed" && r.request_status !== "cancelled";
    if (tab === "completed") return r.request_status === "completed";
    return true;
  });

  const activeCount    = requests.filter(r => r.request_status !== "completed" && r.request_status !== "cancelled").length;
  const pendingCount   = requests.filter(r => r.request_status === "pending").length;
  const completedCount = requests.filter(r => r.request_status === "completed").length;

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "active",    label: "Active",    count: activeCount },
    { id: "completed", label: "Completed", count: completedCount },
    { id: "all",       label: "All",       count: requests.length },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Awaiting Pickup", value: pendingCount,   highlight: pendingCount > 0,   color: "text-yellow-600" },
          { label: "Active",          value: activeCount,    highlight: false,               color: "ok-gradient-text" },
          { label: "Completed Today", value: completedCount, highlight: false,               color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 bg-white ${s.highlight ? "border-yellow-300" : "border-line"}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted/60">{s.label}</p>
            <p className={`mt-1 text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-line bg-white p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
              tab === t.id
                ? "bg-[#142850] text-white"
                : "text-muted hover:bg-sand hover:text-ink"
            }`}>
            {t.label}
            <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-black ${
              tab === t.id ? "bg-white/20 text-white" : "bg-line text-muted"
            }`}>{t.count}</span>
          </button>
        ))}
      </div>

      {/* Request cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white px-6 py-16 text-center">
          <p className="text-3xl mb-2">🎉</p>
          <p className="font-bold text-ink">Queue is clear</p>
          <p className="text-sm text-muted mt-1">No {tab === "active" ? "active" : tab} requests right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <RequestRow key={r.id} request={r} onUpdated={handleUpdated} />
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted/50 text-center">
        Signed in as <span className="font-semibold">{processorName}</span> · Queue updates on page refresh
      </p>
    </div>
  );
}
