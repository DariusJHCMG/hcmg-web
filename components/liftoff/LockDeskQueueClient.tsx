"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import type { LiftOffRequest, LiftOffRole } from "@/lib/database.types";
import { getIncompleteReasons } from "@/lib/liftoff-incomplete-reasons";

// ── Filter types ───────────────────────────────────────────────────────────────

type DatePreset = "all" | "today" | "7d" | "30d" | "custom";
type ScopeMode  = "mine" | "everyone";

interface LDFilterState {
  scope:      ScopeMode;
  drillOwner: string;
  datePreset: DatePreset;
  dateFrom:   string;
  dateTo:     string;
}

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
    timeZone: "America/New_York", timeZoneName: "short",
  });
}

function WorkflowBadge({ r }: { r: LiftOffRequest }) {
  if (r.completed_at) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Locked {fmtTs(r.completed_at)}
      </div>
    );
  }
  if (r.started_at) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
        In Progress since {fmtTs(r.started_at)}
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

interface TeamMember {
  id:            string;
  full_name:     string;
  liftoff_roles: LiftOffRole[];
  avatar_url:    string | null;
}

// ── LockDeskRow ────────────────────────────────────────────────────────────────

function LockDeskRow({
  request,
  onUpdated,
  isDemo = false,
  canAssign = false,
}: {
  request:    LiftOffRequest;
  onUpdated:  (updated: Partial<LiftOffRequest> & { id: string }) => void;
  isDemo?:    boolean;
  canAssign?: boolean;
}) {
  const [busy, setBusy]           = useState(false);
  const [err, setErr]             = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes]         = useState("");

  // ── Incomplete modal state ─────────────────────────────────────────────────
  const [showIncomplete, setShowIncomplete]   = useState(false);
  const [incompleteStep, setIncompleteStep]   = useState<1 | 2>(1);
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [customChecked, setCustomChecked]     = useState(false);
  const [customReason, setCustomReason]       = useState("");
  const [incompleteNotes, setIncompleteNotes] = useState("");
  const [incompleteBusy, setIncompleteBusy]   = useState(false);
  const [incompleteErr, setIncompleteErr]     = useState("");

  // ── Assign modal state ─────────────────────────────────────────────────────
  const [showAssign, setShowAssign]             = useState(false);
  const [assigneeList, setAssigneeList]         = useState<TeamMember[]>([]);
  const [assignListLoaded, setAssignListLoaded] = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [assignBusy, setAssignBusy]             = useState(false);
  const [assignErr, setAssignErr]               = useState("");

  const r = request;

  async function doAction(action: "claim" | "start" | "complete") {
    setBusy(true); setErr("");
    const now = new Date().toISOString();

    if (isDemo) {
      await new Promise(res => setTimeout(res, 600));
      if (action === "claim") {
        onUpdated({ id: r.id, request_status: "in_review", claimed_at: now, claimed_by_id: "demo-me", claimed_by_name: "Demo User" });
      } else if (action === "start") {
        onUpdated({ id: r.id, started_at: now, inflight_email_sent_at: now });
      } else {
        onUpdated({ id: r.id, request_status: "completed", completed_at: now, completed_email_sent_at: now });
        setShowNotes(false);
      }
      setBusy(false);
      return;
    }

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

  function openIncompleteModal() {
    setSelectedReasons([]);
    setCustomChecked(false);
    setCustomReason("");
    setIncompleteNotes("");
    setIncompleteStep(1);
    setIncompleteErr("");
    setShowIncomplete(true);
  }

  function closeIncompleteModal() {
    setShowIncomplete(false);
    setIncompleteStep(1);
    setIncompleteErr("");
  }

  function toggleReason(reason: string) {
    setSelectedReasons(prev =>
      prev.includes(reason) ? prev.filter(x => x !== reason) : [...prev, reason]
    );
  }

  async function doIncomplete() {
    setIncompleteBusy(true); setIncompleteErr("");
    const finalReasons = [
      ...selectedReasons,
      ...(customChecked && customReason.trim() ? [customReason.trim()] : []),
    ];
    if (finalReasons.length === 0) {
      setIncompleteErr("Please select at least one reason.");
      setIncompleteBusy(false);
      return;
    }

    const now = new Date().toISOString();

    if (isDemo) {
      await new Promise(res => setTimeout(res, 600));
      onUpdated({
        id: r.id,
        request_status:     "action_needed",
        incomplete_at:      now,
        incomplete_by_name: "Demo User",
        incomplete_reasons: finalReasons,
        incomplete_notes:   incompleteNotes.trim() || null,
      });
      setIncompleteBusy(false);
      closeIncompleteModal();
      return;
    }

    const res = await fetch(`/api/liftoff/${r.id}/incomplete`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ reasons: finalReasons, notes: incompleteNotes.trim() || undefined }),
    });
    const data = await res.json();
    setIncompleteBusy(false);
    if (!res.ok) { setIncompleteErr(data.error ?? "Failed"); return; }
    onUpdated({
      id: r.id,
      request_status:     "action_needed",
      incomplete_at:      data.incomplete_at ?? now,
      incomplete_by_name: data.incomplete_by_name ?? "",
      incomplete_reasons: finalReasons,
      incomplete_notes:   incompleteNotes.trim() || null,
    });
    closeIncompleteModal();
  }

  async function openAssignModal() {
    setSelectedAssignee("");
    setAssignErr("");
    setShowAssign(true);
    if (!assignListLoaded) {
      try {
        const res = await fetch("/api/liftoff/team-members");
        const data: TeamMember[] = await res.json();
        setAssigneeList(data);
        setAssignListLoaded(true);
      } catch {
        setAssignErr("Failed to load team members.");
      }
    }
  }

  function closeAssignModal() {
    setShowAssign(false);
    setAssignErr("");
  }

  async function doAssign() {
    if (!selectedAssignee) return;
    setAssignBusy(true); setAssignErr("");
    const now = new Date().toISOString();
    const assignee = assigneeList.find(m => m.id === selectedAssignee);

    if (isDemo) {
      await new Promise(res => setTimeout(res, 600));
      onUpdated({
        id: r.id,
        request_status:   "in_review",
        claimed_by_name:  assignee?.full_name ?? "Demo User",
        claimed_at:       now,
        assigned_to_name: assignee?.full_name ?? "Demo User",
        assigned_at_ts:   now,
      });
      setAssignBusy(false);
      closeAssignModal();
      return;
    }

    const res = await fetch(`/api/liftoff/${r.id}/assign`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ assignee_id: selectedAssignee }),
    });
    const data = await res.json();
    setAssignBusy(false);
    if (!res.ok) { setAssignErr(data.error ?? "Failed"); return; }
    onUpdated({
      id: r.id,
      request_status:   "in_review",
      claimed_by_name:  data.assigned_to_name ?? assignee?.full_name ?? "",
      claimed_at:       data.claimed_at ?? now,
      assigned_to_name: data.assigned_to_name ?? assignee?.full_name ?? "",
      assigned_at_ts:   data.claimed_at ?? now,
    });
    closeAssignModal();
  }

  const canClaim      = r.request_status === "pending" && !r.claimed_by_id;
  const canStart      = r.request_status === "in_review" && r.claimed_at && !r.started_at;
  const canComplete   = r.request_status !== "completed" && r.request_status !== "cancelled" && r.claimed_at;
  const canIncomplete = Boolean(
    r.claimed_at &&
    r.request_status !== "completed" &&
    r.request_status !== "cancelled" &&
    r.request_status !== "action_needed"
  );

  const isAssignButton   = canAssign && canClaim;
  const isReassignButton = canAssign && r.claimed_at && r.request_status !== "completed" && r.request_status !== "cancelled";

  const reasons = getIncompleteReasons("lock_request");

  const cardBorder =
    r.request_status === "completed"    ? "border-green-200 opacity-75" :
    r.request_status === "action_needed"? "border-red-300" :
    r.started_at                        ? "border-blue-300" :
    r.claimed_at                        ? "border-purple-200" :
    "border-amber-200";   // lock requests get an amber default — matches brand

  return (
    <div className={`rounded-2xl border bg-white p-5 space-y-3 transition-all ${cardBorder}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="text-xl flex-shrink-0 mt-0.5">🔒</span>
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
              {r.request_status === "action_needed" && r.incomplete_at && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-300 px-2 py-0.5 text-[10px] font-bold text-red-700">
                  ⚠️ Sent Back to LO
                </span>
              )}
              {r.resubmission_of && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-300 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                  ↩ Resubmission
                </span>
              )}
            </div>
            <p className="text-[11px] text-muted/60 mt-0.5 font-mono">{r.arive_loan_number ?? "No ARIVE #"}</p>
          </div>
        </div>
        <div className="flex-shrink-0 text-right space-y-1">
          <p className="text-[10px] font-semibold text-muted/60">Submitted</p>
          <p className="text-xs font-bold text-ink">{fmtTs(r.created_at)}</p>
        </div>
      </div>

      {/* Lock pricing snapshot */}
      {(r.lock_requested_rate != null || r.lock_requested_lender) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-amber-700 mb-1.5">Requested Pricing</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
            {r.lock_requested_rate   != null && <span><span className="text-muted">Rate:</span> <strong>{r.lock_requested_rate}%</strong></span>}
            {r.lock_requested_price  != null && <span><span className="text-muted">Price:</span> <strong>{r.lock_requested_price}</strong></span>}
            {r.lock_requested_lender  && <span><span className="text-muted">Lender:</span> <strong>{r.lock_requested_lender}</strong></span>}
            {r.lock_requested_product && <span><span className="text-muted">Product:</span> <strong>{r.lock_requested_product}</strong></span>}
            {r.lock_period_days      != null && <span><span className="text-muted">Period:</span> <strong>{r.lock_period_days}d</strong></span>}
            {r.channel_type          && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${
                r.channel_type.toLowerCase() === "broker"
                  ? "bg-purple-50 border-purple-200 text-purple-700"
                  : "bg-blue-50 border-blue-200 text-blue-700"
              }`}>{r.channel_type}</span>
            )}
            {r.channel_type?.toLowerCase() === "broker" && r.compensation_type && (
              <span className="rounded-full px-2 py-0.5 text-[10px] font-bold border bg-amber-50 border-amber-200 text-amber-700">
                {r.compensation_type}
              </span>
            )}
          </div>
          {r.lock_lo_notes && (
            <p className="mt-2 text-xs text-amber-800 italic border-t border-amber-200 pt-2">
              <span className="font-bold not-italic">LO Note:</span> {r.lock_lo_notes}
            </p>
          )}
        </div>
      )}

      {/* Confirmed lock (if completed) */}
      {r.lock_confirmed_rate != null && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-green-700 mb-1.5">✅ Confirmed Lock</p>
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs">
            {r.lock_confirmed_rate      != null && <span><span className="text-muted">Rate:</span> <strong>{r.lock_confirmed_rate}%</strong></span>}
            {r.lock_confirmed_price     != null && <span><span className="text-muted">Price:</span> <strong>{r.lock_confirmed_price}</strong></span>}
            {r.lock_confirmed_lender    && <span><span className="text-muted">Lender:</span> <strong>{r.lock_confirmed_lender}</strong></span>}
            {r.lock_confirmation_number && <span><span className="text-muted">Conf #:</span> <strong>{r.lock_confirmation_number}</strong></span>}
            {r.lock_confirmed_exp_date  && <span><span className="text-muted">Expires:</span> <strong>{r.lock_confirmed_exp_date}</strong></span>}
          </div>
        </div>
      )}

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

      {/* Assigned-by */}
      {r.assigned_to_name && (
        <div className="text-[11px] text-muted/70">
          Assigned to <span className="font-semibold text-ink">{r.assigned_to_name}</span>
          {r.assigned_by_name && <> by {r.assigned_by_name}</>}
          {r.assigned_at_ts && <> · {fmtTs(r.assigned_at_ts)}</>}
        </div>
      )}

      {/* Incomplete reasons */}
      {r.request_status === "action_needed" && r.incomplete_reasons && r.incomplete_reasons.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-red-700">Needs Fixing</p>
          <ul className="space-y-0.5">
            {r.incomplete_reasons.map((reason, i) => (
              <li key={i} className="text-xs text-red-800 flex items-start gap-1.5">
                <span className="text-red-500 mt-0.5">•</span>{reason}
              </li>
            ))}
          </ul>
          {r.incomplete_notes && (
            <p className="text-xs text-orange-800 border-t border-red-200 pt-2 mt-2">
              <span className="font-bold">Team notes:</span> {r.incomplete_notes}
            </p>
          )}
        </div>
      )}

      {err && <p className="text-xs text-red-600 font-medium">{err}</p>}

      {/* Completion notes textarea */}
      {showNotes && (
        <div className="space-y-2">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Optional notes for the LO (lock confirmation number, expiration, etc.)…"
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

        {isAssignButton && (
          <button onClick={openAssignModal}
            className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#4f46e5)" }}>
            Assign →
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
            🔒 Lock Confirmed
          </button>
        )}

        {showNotes && (
          <>
            <button disabled={busy} onClick={() => doAction("complete")}
              className="rounded-lg px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#22c55e,#16a34a)" }}>
              {busy ? "Completing…" : "✅ Confirm Lock + Notify LO"}
            </button>
            <button onClick={() => setShowNotes(false)}
              className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-muted hover:bg-sand">
              Cancel
            </button>
          </>
        )}

        {canIncomplete && (
          <button onClick={openIncompleteModal}
            className="rounded-lg px-3 py-1.5 text-xs font-bold text-white"
            style={{ background: "linear-gradient(135deg,#ef4444,#f97316)" }}>
            ⚠️ Incomplete
          </button>
        )}

        {isReassignButton && !canClaim && (
          <button onClick={openAssignModal}
            className="rounded-lg px-3 py-1.5 text-xs font-bold border border-indigo-400 text-indigo-700 bg-indigo-50 hover:bg-indigo-100">
            Reassign →
          </button>
        )}
      </div>

      {/* ── Incomplete modal ───────────────────────────────────────────────────── */}
      {showIncomplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-[520px] rounded-2xl bg-white border-2 border-[#142850] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#142850]/20 bg-[#142850]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                Lock Desk · {r.borrower_first_name} {r.borrower_last_name}
              </p>
              <p className="text-base font-extrabold text-white mt-0.5">
                {incompleteStep === 1 ? "What needs to be fixed?" : "Add notes for the LO (optional)"}
              </p>
            </div>

            <div className="px-6 py-5">
              {incompleteStep === 1 ? (
                <>
                  <p className="text-xs text-muted mb-4">Select all that apply for this lock request.</p>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {reasons.map(reason => (
                      <label key={reason} className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox"
                          checked={selectedReasons.includes(reason)}
                          onChange={() => toggleReason(reason)}
                          className="mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                        />
                        <span className="text-sm text-ink group-hover:text-ink/80">{reason}</span>
                      </label>
                    ))}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input type="checkbox"
                        checked={customChecked}
                        onChange={() => setCustomChecked(p => !p)}
                        className="mt-0.5 rounded border-gray-300 text-orange-500 focus:ring-orange-400"
                      />
                      <span className="text-sm text-muted italic">Other / Custom…</span>
                    </label>
                    {customChecked && (
                      <input type="text" value={customReason}
                        onChange={e => setCustomReason(e.target.value)}
                        placeholder="Describe the issue…"
                        className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink
                                   placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40"
                      />
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-xs text-muted mb-4">
                    These will appear in the email sent to {r.submitter_name}.
                  </p>
                  <textarea value={incompleteNotes}
                    onChange={e => setIncompleteNotes(e.target.value)}
                    rows={4}
                    placeholder="Optional notes for the LO — what to fix, etc."
                    className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink
                               placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40 resize-none"
                  />
                </>
              )}
              {incompleteErr && <p className="mt-3 text-xs text-red-600 font-medium">{incompleteErr}</p>}
            </div>

            <div className="px-6 py-4 border-t border-line flex items-center justify-between gap-3">
              {incompleteStep === 1 ? (
                <>
                  <button onClick={closeIncompleteModal}
                    className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-muted hover:bg-sand">
                    Cancel
                  </button>
                  <button
                    disabled={selectedReasons.length === 0 && !(customChecked && customReason.trim())}
                    onClick={() => { setIncompleteErr(""); setIncompleteStep(2); }}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
                    style={{ background: "linear-gradient(135deg,#142850,#1e3a6e)" }}>
                    Next →
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => setIncompleteStep(1)}
                    className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-muted hover:bg-sand">
                    ← Back
                  </button>
                  <button disabled={incompleteBusy} onClick={doIncomplete}
                    className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
                    style={{ background: "linear-gradient(135deg,#ef4444,#f97316)" }}>
                    {incompleteBusy ? "Sending…" : "⚠️ Send Back to LO"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Assign / Reassign modal ──────────────────────────────────────────── */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-[480px] rounded-2xl bg-white border-2 border-[#142850] shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#142850]/20 bg-[#142850]">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/60">
                Lock Desk · {r.borrower_first_name} {r.borrower_last_name}
              </p>
              <p className="text-base font-extrabold text-white mt-0.5">
                {r.claimed_at ? "Reassign to Team Member" : "Assign to Team Member"}
              </p>
            </div>
            <div className="px-6 py-4 max-h-72 overflow-y-auto space-y-2">
              {!assignListLoaded && !assignErr && (
                <div className="flex items-center justify-center py-8">
                  <div className="h-5 w-5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                  <span className="ml-2 text-xs text-muted">Loading team…</span>
                </div>
              )}
              {assignErr && <p className="text-xs text-red-600 py-4 text-center">{assignErr}</p>}
              {assignListLoaded && assigneeList.map(member => {
                const roleMap: Record<string, string> = {
                  liftoff_admin:   "Admin",
                  liftoff_team:    "Team",
                  lock_desk_admin: "Lock Desk",
                  ops_manager:     "Ops Mgr",
                  help_desk_agent: "Help Desk",
                };
                const roleLabels = member.liftoff_roles.map(role => roleMap[role] ?? role).join(", ");
                const initials   = member.full_name.trim().split(/\s+/).map((p: string) => p[0]).slice(0, 2).join("").toUpperCase();
                const isSelected = selectedAssignee === member.id;
                return (
                  <button key={member.id}
                    onClick={() => setSelectedAssignee(member.id)}
                    className={`w-full flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      isSelected ? "border-[#142850] bg-[#142850]/5" : "border-line bg-white hover:bg-sand"
                    }`}>
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.full_name}
                        className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-line" />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-black text-white flex-shrink-0"
                        style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
                        {initials}
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-ink">{member.full_name}</p>
                      {roleLabels && <p className="text-[11px] text-muted">{roleLabels}</p>}
                    </div>
                    {isSelected && <span className="text-[#142850] font-bold text-sm flex-shrink-0">✓</span>}
                  </button>
                );
              })}
              {assignListLoaded && assigneeList.length === 0 && (
                <p className="text-xs text-muted text-center py-4">No team members found.</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-line flex items-center justify-between gap-3">
              <button onClick={closeAssignModal}
                className="rounded-lg border border-line px-4 py-2 text-xs font-semibold text-muted hover:bg-sand">
                Cancel
              </button>
              <button disabled={!selectedAssignee || assignBusy} onClick={doAssign}
                className="rounded-lg px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}>
                {assignBusy ? "Assigning…" : "Confirm Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Queue container ────────────────────────────────────────────────────────────

type Tab = "active" | "completed" | "all";

export function LockDeskQueueClient({
  initialRequests,
  processorName,
  viewerId,
  viewerName,
  canSeeAll  = false,
  isSelfOnly = false,
  isDemo     = false,
  canAssign  = false,
}: {
  initialRequests: LiftOffRequest[];
  processorName:   string;
  viewerId:        string;
  viewerName:      string;
  canSeeAll?:      boolean;
  isSelfOnly?:     boolean;
  isDemo?:         boolean;
  canAssign?:      boolean;
}) {
  const [requests, setRequests] = useState<LiftOffRequest[]>(initialRequests);
  const [tab, setTab]           = useState<Tab>("active");

  const [filters, setFilters] = useState<LDFilterState>({
    scope:      isSelfOnly ? "mine" : "everyone",
    drillOwner: "",
    datePreset: "all",
    dateFrom:   "",
    dateTo:     "",
  });

  function handleUpdated(patch: Partial<LiftOffRequest> & { id: string }) {
    setRequests(prev => prev.map(r => r.id === patch.id ? { ...r, ...patch } : r));
  }

  const [teamOwners, setTeamOwners] = useState<string[]>([]);
  const fetchedRef = useRef(false);
  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetch("/api/liftoff/team-members")
      .then(r => r.json())
      .then((data: { full_name: string }[]) => setTeamOwners(data.map(m => m.full_name).sort()))
      .catch(() => {});
  }, []);

  const preTabFiltered = useMemo(() => {
    const now   = Date.now();
    const dayMs = 86_400_000;
    return requests.filter(r => {
      if (filters.scope === "mine" && r.claimed_by_id !== viewerId) return false;
      if (filters.scope === "everyone" && filters.drillOwner !== "") {
        if (filters.drillOwner === "__unclaimed__") {
          if (r.claimed_by_name) return false;
        } else {
          if ((r.claimed_by_name ?? "") !== filters.drillOwner) return false;
        }
      }
      const created = new Date(r.created_at).getTime();
      if (filters.datePreset === "today") {
        const start = new Date(); start.setHours(0, 0, 0, 0);
        if (created < start.getTime()) return false;
      } else if (filters.datePreset === "7d") {
        if (created < now - 7 * dayMs) return false;
      } else if (filters.datePreset === "30d") {
        if (created < now - 30 * dayMs) return false;
      } else if (filters.datePreset === "custom") {
        if (filters.dateFrom && created < new Date(filters.dateFrom).getTime()) return false;
        if (filters.dateTo   && created > new Date(filters.dateTo + "T23:59:59").getTime()) return false;
      }
      return true;
    });
  }, [requests, filters, viewerId]);

  const filtered = useMemo(() => preTabFiltered.filter(r => {
    if (tab === "active")    return r.request_status !== "completed" && r.request_status !== "cancelled";
    if (tab === "completed") return r.request_status === "completed";
    return true;
  }), [preTabFiltered, tab]);

  const activeCount    = preTabFiltered.filter(r => r.request_status !== "completed" && r.request_status !== "cancelled").length;
  const pendingCount   = preTabFiltered.filter(r => r.request_status === "pending").length;
  const completedCount = preTabFiltered.filter(r => r.request_status === "completed").length;
  const hasActiveFilters = filters.drillOwner !== "" || filters.datePreset !== "all";

  const resetFilters = () => setFilters(f => ({ ...f, drillOwner: "", datePreset: "all", dateFrom: "", dateTo: "" }));

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "active",    label: "Active",    count: activeCount },
    { id: "completed", label: "Completed", count: completedCount },
    { id: "all",       label: "All",       count: preTabFiltered.length },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Awaiting Lock",   value: pendingCount,   highlight: pendingCount > 0,   color: "text-yellow-600" },
          { label: "Active",          value: activeCount,    highlight: false,               color: "ok-gradient-text" },
          { label: "Locked Today",    value: completedCount, highlight: false,               color: "text-green-600" },
        ].map(s => (
          <div key={s.label} className={`rounded-2xl border p-4 bg-white ${s.highlight ? "border-yellow-300" : "border-line"}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted/60">{s.label}</p>
            <p className={`mt-1 text-3xl font-extrabold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="rounded-2xl border border-line bg-white px-5 py-4 space-y-4">
        {!isSelfOnly && canSeeAll && (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-muted">Scope:</span>
            <div className="flex rounded-xl border border-line overflow-hidden">
              {(["mine", "everyone"] as ScopeMode[]).map(s => (
                <button key={s}
                  onClick={() => setFilters(f => ({ ...f, scope: s, drillOwner: "" }))}
                  className={`px-4 py-1.5 text-xs font-bold transition-all ${
                    filters.scope === s ? "bg-[#142850] text-white" : "bg-white text-muted hover:bg-sand"
                  }`}>
                  {s === "mine" ? `🙋 Mine (${viewerName})` : "👥 Everyone"}
                </button>
              ))}
            </div>
            {filters.scope === "everyone" && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted">Owner:</span>
                <select value={filters.drillOwner}
                  onChange={e => setFilters(f => ({ ...f, drillOwner: e.target.value }))}
                  className="rounded-lg border border-line bg-sand px-3 py-1.5 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30">
                  <option value="">All owners</option>
                  <option value="__unclaimed__">Unclaimed</option>
                  {teamOwners.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            )}
          </div>
        )}

        {isSelfOnly && (
          <div className="flex items-center gap-2 rounded-xl bg-sand border border-line px-4 py-2.5">
            <span className="text-sm">🙋</span>
            <p className="text-xs font-semibold text-ink">
              Showing your claimed requests only
              <span className="ml-1 font-normal text-muted">— {viewerName}</span>
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-muted mr-1">Date:</span>
          {(["all", "today", "7d", "30d", "custom"] as DatePreset[]).map(p => (
            <button key={p}
              onClick={() => setFilters(f => ({ ...f, datePreset: p }))}
              className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-all ${
                filters.datePreset === p
                  ? "bg-[#142850] text-white border-[#142850]"
                  : "bg-sand text-muted border-line hover:border-[#142850]/40"
              }`}>
              {p === "all" ? "All time" : p === "today" ? "Today" : p === "7d" ? "7d" : p === "30d" ? "30d" : "Custom"}
            </button>
          ))}
          {filters.datePreset === "custom" && (
            <div className="flex items-center gap-2 ml-1">
              <input type="date" value={filters.dateFrom}
                onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                className="rounded-lg border border-line bg-sand px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30" />
              <span className="text-xs text-muted">→</span>
              <input type="date" value={filters.dateTo}
                onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                className="rounded-lg border border-line bg-sand px-3 py-1.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-[#142850]/30" />
            </div>
          )}
          {hasActiveFilters && (
            <button onClick={resetFilters}
              className="ml-auto text-[11px] font-semibold text-muted hover:text-red-600 transition-colors">
              ✕ Reset filters
            </button>
          )}
        </div>

        <p className="text-[11px] text-muted border-t border-line pt-3">
          Showing <span className="font-semibold text-ink">{filtered.length}</span> of {preTabFiltered.length} requests
          {filters.scope === "mine" && <span className="ml-1">· <span className="font-semibold text-ink">your queue</span></span>}
          {filters.scope === "everyone" && filters.drillOwner && filters.drillOwner !== "__unclaimed__" && (
            <span className="ml-1">· drilled to <span className="font-semibold text-ink">{filters.drillOwner}</span></span>
          )}
          {isDemo && <span className="ml-2 text-purple-600 font-semibold">(demo)</span>}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-line bg-white p-1 w-fit">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`rounded-lg px-4 py-1.5 text-xs font-bold transition-colors ${
              tab === t.id ? "bg-[#142850] text-white" : "text-muted hover:bg-sand hover:text-ink"
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
          <p className="text-3xl mb-2">🔒</p>
          <p className="font-bold text-ink">Lock desk queue is clear</p>
          <p className="text-sm text-muted mt-1">No {tab === "active" ? "active" : tab} lock requests right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <LockDeskRow
              key={r.id}
              request={r}
              onUpdated={handleUpdated}
              isDemo={isDemo}
              canAssign={canAssign}
            />
          ))}
        </div>
      )}

      <p className="text-[11px] text-muted/50 text-center">
        Signed in as <span className="font-semibold">{processorName}</span> · Queue updates on page refresh
      </p>
    </div>
  );
}
