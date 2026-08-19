"use client";

import { useState } from "react";
import type { LiftOffRequestStatus } from "@/lib/database.types";

const STATUS_OPTIONS: { value: LiftOffRequestStatus; label: string }[] = [
  { value: "pending",       label: "Pending" },
  { value: "in_review",     label: "In Review" },
  { value: "action_needed", label: "Action Needed" },
  { value: "completed",     label: "Completed" },
  { value: "cancelled",     label: "Cancelled" },
];

export function LiftOffAdminActions({
  requestId,
  currentStatus,
}: {
  requestId: string;
  currentStatus: LiftOffRequestStatus;
}) {
  const [status, setStatus]     = useState<LiftOffRequestStatus>(currentStatus);
  const [note, setNote]         = useState("");
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const [open, setOpen]         = useState(false);

  async function save() {
    setSaving(true);
    setSaved(false);
    const body: Record<string, unknown> = { request_status: status };
    if (status === "action_needed" && note.trim()) {
      body.return_reason = note.trim();
    }
    const res = await fetch(`/api/liftoff/${requestId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (res.ok) { setSaved(true); setOpen(false); setTimeout(() => setSaved(false), 3000); }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-ink
                   hover:bg-sand transition-colors"
      >
        {saved ? "✓ Saved" : "Update"}
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 w-64 rounded-2xl border border-line bg-white shadow-xl p-4 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">Update Status</p>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as LiftOffRequestStatus)}
            className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink bg-white focus:outline-none focus:ring-2 focus:ring-orange-400/40"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>

          {status === "action_needed" && (
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Describe what the LO needs to fix…"
              rows={3}
              className="w-full rounded-xl border border-line px-3 py-2 text-sm text-ink bg-white resize-none
                         focus:outline-none focus:ring-2 focus:ring-orange-400/40"
            />
          )}

          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="flex-1 rounded-xl py-2 text-xs font-bold text-white disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setOpen(false)}
              className="rounded-xl border border-line px-3 py-2 text-xs font-semibold text-muted hover:bg-sand"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
