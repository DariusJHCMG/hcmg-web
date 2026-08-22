"use client";

import { useState } from "react";
import { InlineLockSlideOver } from "./InlineLockSlideOver";

export type LockPref = "lock" | "lock_requested" | "float" | "";

interface LockPreferenceFieldProps {
  value: LockPref;
  onChange: (val: LockPref) => void;
  floatReason: string;
  onFloatReasonChange: (v: string) => void;
  required?: boolean;
  prefill: {
    ariveLoanNumber: string;
    borrowerFirst:   string;
    borrowerLast:    string;
    coBorrowerFirst: string;
    loanAmount:      string;
    purchasePrice:   string;
    loanType:        string;
    targetClose:     string;
    propAddress:     string;
    propCity:        string;
    propState:       string;
    propZip:         string;
  };
  linkedLockRequestId: string | null;
  onLockRequestLinked: (id: string) => void;
}

type ModalStep = "q1" | "q2" | null;

export function LockPreferenceField({
  value,
  onChange,
  floatReason,
  onFloatReasonChange,
  required,
  prefill,
  linkedLockRequestId,
  onLockRequestLinked,
}: LockPreferenceFieldProps) {
  const [modalStep, setModalStep]     = useState<ModalStep>(null);
  const [slideOver, setSlideOver]     = useState(false);

  function handleSelectLock() {
    // Already sorted — don't re-open modal
    if (value === "lock" || value === "lock_requested") return;
    setModalStep("q1");
  }

  function handleSelectFloat() {
    onChange("float");
    setModalStep(null);
  }

  // Q1: "Have you already submitted a Lock Desk Request?"
  function q1Yes() {
    setModalStep("q2");
  }
  function q1No() {
    setModalStep(null);
    setSlideOver(true);
  }

  // Q2: "Have you received confirmation the lock is completed?"
  function q2Yes() {
    onChange("lock");
    setModalStep(null);
  }
  function q2No() {
    onChange("lock_requested");
    setModalStep(null);
  }

  function handleSlideOverSubmitted(lockId: string) {
    setSlideOver(false);
    onChange("lock_requested");
    onLockRequestLinked(lockId);
  }

  // ── Render locked-in state ────────────────────────────────────
  if (value === "lock_requested") {
    return (
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-[0.1em] text-muted/80 mb-1.5">
          Lock / Float Preference{required && <span className="text-orange-500 ml-0.5">*</span>}
        </label>
        <div className="flex items-center gap-3 rounded-xl border-2 border-[#142850] bg-[#142850]/5 px-5 py-3.5">
          <span className="text-xl">🔒</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#142850]">Lock Desk Request Sent</p>
            <p className="text-[11px] text-muted/70 mt-0.5">
              Your lock request has been submitted to the lock desk queue.
              {linkedLockRequestId && <> ID: <span className="font-mono">{linkedLockRequestId.slice(0, 8)}…</span></>}
            </p>
          </div>
          <button type="button" onClick={() => { onChange(""); setModalStep(null); }}
            className="text-[10px] font-bold text-muted/50 hover:text-red-500 transition-colors">
            CHANGE
          </button>
        </div>
      </div>
    );
  }

  if (value === "lock") {
    return (
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-[0.1em] text-muted/80 mb-1.5">
          Lock / Float Preference{required && <span className="text-orange-500 ml-0.5">*</span>}
        </label>
        <div className="flex items-center gap-3 rounded-xl border-2 border-green-400 bg-green-50 px-5 py-3.5">
          <span className="text-xl">✅</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-green-800">Locked — Confirmed</p>
            <p className="text-[11px] text-green-700/70 mt-0.5">Lock desk has confirmed this loan is locked.</p>
          </div>
          <button type="button" onClick={() => { onChange(""); setModalStep(null); }}
            className="text-[10px] font-bold text-muted/50 hover:text-red-500 transition-colors">
            CHANGE
          </button>
        </div>
      </div>
    );
  }

  // ── Default selection UI ──────────────────────────────────────
  return (
    <>
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-[0.1em] text-muted/80 mb-1.5">
          Lock / Float Preference{required && <span className="text-orange-500 ml-0.5">*</span>}
        </label>
        <p className="text-xs text-muted/70 -mt-1">
          Tell the ops team how you want to handle the rate on this loan.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {/* Lock */}
          <button type="button" onClick={handleSelectLock}
            className="flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all border-line bg-white hover:border-[#142850]/40 hover:bg-[#142850]/5">
            <span className="text-xl mt-0.5 flex-shrink-0">🔒</span>
            <div>
              <p className="text-sm font-bold text-ink">Lock</p>
              <p className="text-[11px] text-muted/70 mt-0.5 leading-relaxed">
                Lock this loan at current pricing. A lock desk request will be submitted.
              </p>
            </div>
          </button>

          {/* Float */}
          <button type="button" onClick={handleSelectFloat}
            className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
              value === "float"
                ? "border-yellow-400 bg-yellow-50"
                : "border-line bg-white hover:border-yellow-300 hover:bg-yellow-50/50"
            }`}>
            <span className="text-xl mt-0.5 flex-shrink-0">🌊</span>
            <div>
              <p className="text-sm font-bold text-ink">Float</p>
              <p className="text-[11px] text-muted/70 mt-0.5 leading-relaxed">
                Float the rate. Provide a reason for the ops team below.
              </p>
            </div>
          </button>
        </div>

        {/* Float reason */}
        {value === "float" && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.1em] text-muted/80 mb-1.5">
              Float Reason<span className="text-orange-500 ml-0.5">*</span>
            </label>
            <textarea
              value={floatReason}
              onChange={e => onFloatReasonChange(e.target.value)}
              rows={3}
              placeholder="Reason for floating — e.g. waiting for rate improvement, client approved float strategy…"
              className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink
                         placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40
                         focus:border-orange-400 resize-none"
            />
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modalStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="px-6 pt-6 pb-4 border-b border-line">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#142850] text-white text-sm">🔒</span>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted/60">Lock Desk</p>
              </div>
              <h3 className="text-lg font-extrabold text-ink mt-1">
                {modalStep === "q1"
                  ? "Have you submitted a Lock Desk Request for this loan?"
                  : "Has the lock been confirmed by the lock desk?"}
              </h3>
              <p className="text-xs text-muted/70 mt-1.5 leading-relaxed">
                {modalStep === "q1"
                  ? "A lock desk request must be submitted so the team can execute the lock in the lender portal."
                  : "This tells the processing team whether they can proceed or need to wait for the lock to be confirmed."}
              </p>
            </div>

            {/* Modal options */}
            <div className="p-6 space-y-3">
              {modalStep === "q1" ? (
                <>
                  <button type="button" onClick={q1Yes}
                    className="w-full flex items-center gap-4 rounded-xl border-2 border-line bg-white p-4
                               hover:border-[#142850] hover:bg-[#142850]/5 transition-all text-left group">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl
                                     bg-green-100 text-green-700 text-lg group-hover:bg-green-200 transition-colors">✓</span>
                    <div>
                      <p className="font-bold text-ink text-sm">Yes, already submitted</p>
                      <p className="text-xs text-muted/70 mt-0.5">I already have a lock request in the queue.</p>
                    </div>
                  </button>
                  <button type="button" onClick={q1No}
                    className="w-full flex items-center gap-4 rounded-xl border-2 border-line bg-white p-4
                               hover:border-orange-400 hover:bg-orange-50 transition-all text-left group">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl
                                     bg-orange-100 text-orange-600 text-lg group-hover:bg-orange-200 transition-colors">+</span>
                    <div>
                      <p className="font-bold text-ink text-sm">No, submit one now</p>
                      <p className="text-xs text-muted/70 mt-0.5">Open the lock request form — pre-filled from this request.</p>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <button type="button" onClick={q2Yes}
                    className="w-full flex items-center gap-4 rounded-xl border-2 border-line bg-white p-4
                               hover:border-green-400 hover:bg-green-50 transition-all text-left group">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl
                                     bg-green-100 text-green-700 text-lg group-hover:bg-green-200 transition-colors">✅</span>
                    <div>
                      <p className="font-bold text-ink text-sm">Yes, lock is confirmed</p>
                      <p className="text-xs text-muted/70 mt-0.5">Lock desk has confirmed — processing can proceed.</p>
                    </div>
                  </button>
                  <button type="button" onClick={q2No}
                    className="w-full flex items-center gap-4 rounded-xl border-2 border-line bg-white p-4
                               hover:border-yellow-400 hover:bg-yellow-50 transition-all text-left group">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl
                                     bg-yellow-100 text-yellow-700 text-lg group-hover:bg-yellow-200 transition-colors">⏳</span>
                    <div>
                      <p className="font-bold text-ink text-sm">No, still waiting</p>
                      <p className="text-xs text-muted/70 mt-0.5">Request is pending — processing will wait for lock confirmation.</p>
                    </div>
                  </button>
                </>
              )}

              <button type="button" onClick={() => setModalStep(null)}
                className="w-full text-center text-xs font-semibold text-muted/50 hover:text-muted py-2 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Slide-over ── */}
      <InlineLockSlideOver
        open={slideOver}
        onClose={() => setSlideOver(false)}
        onSubmitted={handleSlideOverSubmitted}
        prefill={prefill}
      />
    </>
  );
}
