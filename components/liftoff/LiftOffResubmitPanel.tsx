"use client";

import { useState } from "react";
import Link from "next/link";

interface Props {
  requestId:         string;
  incompleteReasons: string[];
  incompleteNotes:   string | null;
  submitterName:     string;
}

export function LiftOffResubmitPanel({
  requestId,
  incompleteReasons,
  incompleteNotes,
  submitterName,
}: Props) {
  const [confirmedReasons, setConfirmedReasons] = useState<Record<string, boolean>>(
    Object.fromEntries(incompleteReasons.map(r => [r, false]))
  );
  const [notes, setNotes]   = useState("");
  const [busy, setBusy]     = useState(false);
  const [err, setErr]       = useState("");
  const [done, setDone]     = useState(false);
  const [newId, setNewId]   = useState<string | null>(null);

  const allConfirmed = incompleteReasons.every(r => confirmedReasons[r]);

  function toggleReason(reason: string) {
    setConfirmedReasons(prev => ({ ...prev, [reason]: !prev[reason] }));
  }

  async function handleResubmit() {
    if (!allConfirmed) return;
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/liftoff/resubmit", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          original_id:        requestId,
          notes:              notes.trim() || null,
          confirmed_reasons:  incompleteReasons.filter(r => confirmedReasons[r]),
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data.error ?? "Resubmission failed."); setBusy(false); return; }
      setNewId(data.id);
      setDone(true);
    } catch {
      setErr("Network error — please try again.");
    }
    setBusy(false);
  }

  // Success state
  if (done) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-6 flex items-start gap-4">
        <span className="text-2xl flex-shrink-0">✅</span>
        <div className="space-y-1">
          <p className="font-bold text-green-800 text-sm">Resubmitted — your request is back in the queue.</p>
          <p className="text-xs text-green-700">
            The HCMG ops team has been notified. They will pick up your updated request shortly.
          </p>
          {newId && (
            <Link href={`/liftoff/${newId}`}
              className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-green-800 underline hover:text-green-900">
              View new request →
            </Link>
          )}
          <Link href="/liftoff"
            className="block mt-2 text-xs font-bold text-green-800 underline hover:text-green-900">
            ← Back to My Requests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-red-300 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-red-600">
        <p className="text-xs font-bold uppercase tracking-[0.15em] text-white/70 mb-0.5">Action Required</p>
        <p className="text-base font-extrabold text-white">⚠️ This request needs your attention</p>
        <p className="text-xs text-white/70 mt-0.5">
          Confirm you have fixed each issue below, then resubmit to the ops queue.
        </p>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Reasons checklist */}
        {incompleteReasons.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">
              What needs to be fixed — check each item once resolved
            </p>
            {incompleteReasons.map(reason => (
              <label key={reason}
                className={`flex items-start gap-3 cursor-pointer rounded-xl border px-4 py-3 transition-colors ${
                  confirmedReasons[reason]
                    ? "border-green-300 bg-green-50"
                    : "border-line bg-sand hover:border-orange-300"
                }`}>
                <input
                  type="checkbox"
                  checked={confirmedReasons[reason] ?? false}
                  onChange={() => toggleReason(reason)}
                  className="mt-0.5 rounded border-gray-300 text-green-500 focus:ring-green-400"
                />
                <span className={`text-sm ${confirmedReasons[reason] ? "text-green-800 line-through opacity-70" : "text-ink"}`}>
                  {reason}
                </span>
                {confirmedReasons[reason] && (
                  <span className="ml-auto flex-shrink-0 text-green-600 font-bold text-sm">✓</span>
                )}
              </label>
            ))}
          </div>
        )}

        {/* Team notes callout */}
        {incompleteNotes && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-orange-700 mb-1">
              Notes from the team
            </p>
            <p className="text-xs text-orange-900 whitespace-pre-wrap">{incompleteNotes}</p>
          </div>
        )}

        {/* Notes for ops team */}
        <div className="space-y-1.5">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">
            Add any notes for the ops team (optional)
          </p>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder={`Let ${submitterName.split(" ")[0] ?? "the team"} know what you changed or any context…`}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-ink
                       placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40 resize-none"
          />
        </div>

        {/* Error */}
        {err && <p className="text-xs text-red-600 font-medium">{err}</p>}

        {/* CTA */}
        <div className="flex items-center gap-3 pt-1">
          <button
            disabled={!allConfirmed || busy}
            onClick={handleResubmit}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-white disabled:opacity-40 transition-opacity hover:opacity-90"
            style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
            {busy ? "Submitting…" : "↩ Resubmit to Ops Queue"}
          </button>
          {!allConfirmed && (
            <p className="text-xs text-muted">
              Check all {incompleteReasons.length - Object.values(confirmedReasons).filter(Boolean).length} remaining items to continue.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
