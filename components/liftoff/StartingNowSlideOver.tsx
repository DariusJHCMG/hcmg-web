"use client";

/**
 * StartingNowSlideOver
 * Slide-over panel for submitting a new Credit Repair Referral to Starting Now
 * without leaving the /liftoff/starting-now page.
 * Mirrors the InlineLockSlideOver pattern exactly.
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

// ── Shared primitives ─────────────────────────────────────────
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink
                 placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40
                 focus:border-orange-400 ${props.className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={2}
      {...props}
      className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink
                 placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40
                 focus:border-orange-400 resize-none"
    />
  );
}

function Field({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-muted/70 mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted/50">{hint}</p>}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────
interface StartingNowSlideOverProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: () => void; // parent refreshes the referrals list
}

// ── Component ─────────────────────────────────────────────────
export function StartingNowSlideOver({ open, onClose, onSubmitted }: StartingNowSlideOverProps) {
  const router = useRouter();

  // ARIVE lookup
  const [ariveLoanNumber,    setAriveLoanNumber]    = useState("");
  const [ariveLookupStatus,  setAriveLookupStatus]  = useState<"idle"|"loading"|"found"|"error"|"not_found">("idle");
  const [ariveLookupMessage, setAriveLookupMessage] = useState("");

  // Borrower fields (auto-filled from ARIVE, editable)
  const [borrowerFirst,  setBorrowerFirst]  = useState("");
  const [borrowerLast,   setBorrowerLast]   = useState("");
  const [borrowerEmail,  setBorrowerEmail]  = useState("");
  const [borrowerPhone,  setBorrowerPhone]  = useState("");
  const [borrowerCity,   setBorrowerCity]   = useState("");
  const [borrowerState,  setBorrowerState]  = useState("");

  // Partner + consent
  const [partnerNotes,   setPartnerNotes]   = useState("");
  const [consent,        setConsent]        = useState(false);
  const [certified,      setCertified]      = useState(false);
  const [certNmls,       setCertNmls]       = useState("");
  const [certLoName,     setCertLoName]     = useState("");

  // Submit state
  const [submitting,  setSubmitting]  = useState(false);
  const [snSending,   setSnSending]   = useState(false);
  const [error,       setError]       = useState("");
  const [successMsg,  setSuccessMsg]  = useState("");

  // ── Reset on open ─────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setAriveLoanNumber(""); setAriveLookupStatus("idle"); setAriveLookupMessage("");
    setBorrowerFirst(""); setBorrowerLast("");
    setBorrowerEmail(""); setBorrowerPhone("");
    setBorrowerCity("");  setBorrowerState("");
    setPartnerNotes(""); setConsent(false); setCertified(false);
    setCertNmls(""); setCertLoName("");
    setSubmitting(false); setSnSending(false);
    setError(""); setSuccessMsg("");
  }, [open]);

  // ── ARIVE lookup ──────────────────────────────────────────────
  const doAriveLookup = useCallback(async (loanNumber: string) => {
    if (!loanNumber.trim()) { setError("Enter an ARIVE loan number first."); return; }
    setAriveLookupStatus("loading");
    setAriveLookupMessage("");
    setError("");
    try {
      const res  = await fetch("/api/liftoff/arive-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanNumber: loanNumber.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAriveLookupStatus("error");
        setAriveLookupMessage(data.error ?? "ARIVE lookup failed.");
        return;
      }
      if (!data.pending) { applyAriveData(data); return; }

      // Poll up to 15s
      const { requestId } = data;
      const deadline = Date.now() + 15_000;
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 1_500));
        const pollRes  = await fetch(`/api/liftoff/arive-poll?id=${requestId}`);
        const pollData = await pollRes.json();
        if (!pollData.pending) { applyAriveData(pollData); return; }
      }
      setAriveLookupStatus("error");
      setAriveLookupMessage("ARIVE lookup timed out. Enter details manually.");
    } catch {
      setAriveLookupStatus("error");
      setAriveLookupMessage("Network error. Enter details manually.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyAriveData(data: Record<string, unknown>) {
    if (data.found === false) {
      setAriveLookupStatus("not_found");
      setAriveLookupMessage("Loan not found in ARIVE. Enter borrower details manually.");
      return;
    }
    if (data.borrowerFirstName) setBorrowerFirst(data.borrowerFirstName as string);
    if (data.borrowerLastName)  setBorrowerLast(data.borrowerLastName   as string);
    if (data.borrowerEmail)     setBorrowerEmail(data.borrowerEmail     as string);
    if (data.borrowerPhone)     setBorrowerPhone(data.borrowerPhone     as string);
    if (data.borrowerCity)      setBorrowerCity(data.borrowerCity       as string);
    if (data.borrowerState)     setBorrowerState(data.borrowerState     as string);
    setAriveLookupStatus("found");
    setAriveLookupMessage("Loan found — fields auto-filled. Review and adjust if needed.");
  }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit() {
    if (!ariveLoanNumber.trim())  { setError("ARIVE loan number is required."); return; }
    if (!borrowerFirst.trim())    { setError("Borrower first name is required."); return; }
    if (!borrowerLast.trim())     { setError("Borrower last name is required."); return; }
    if (!borrowerEmail.trim())    { setError("Borrower email is required."); return; }
    if (!borrowerPhone.trim())    { setError("Borrower phone is required."); return; }
    if (!consent)                 { setError("Borrower consent confirmation is required."); return; }
    if (!certified)               { setError("Please check the certification box."); return; }
    if (!certNmls.trim())         { setError("Your NMLS # is required."); return; }

    setSubmitting(true); setError("");

    // Step 1 — create the lift_off_requests row
    const res = await fetch("/api/liftoff/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        request_type:        "credit_repair_referral",
        arive_loan_number:   ariveLoanNumber.trim(),
        borrower_first_name: borrowerFirst.trim(),
        borrower_last_name:  borrowerLast.trim(),
        certified_at:        new Date().toISOString(),
        certified_by_name:   certLoName.trim() || null,
        submitter_nmls:      certNmls.trim(),
        income_note:  "",
        property_note: "",
        assets_note:  "",
        credit_note:  "",
      }),
    });

    let submitData: Record<string, unknown> = {};
    try { submitData = await res.json(); } catch { /* */ }
    if (!res.ok) {
      setError((submitData.error as string) ?? `Server error ${res.status}. Please try again.`);
      setSubmitting(false);
      return;
    }

    // Step 2 — send to Starting Now
    setSnSending(true);
    try {
      const snRes = await fetch("/api/liftoff/starting-now/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lift_off_request_id:           submitData.id,
          borrower_email:                borrowerEmail.trim(),
          borrower_phone:                borrowerPhone.trim(),
          borrower_city:                 borrowerCity.trim()  || null,
          borrower_state:                borrowerState.trim() || null,
          partner_notes:                 partnerNotes.trim()  || null,
          borrower_consent_confirmed_at: new Date().toISOString(),
        }),
      });
      const snData = await snRes.json() as { sent?: boolean; error?: string };
      if (snData.sent) {
        setSuccessMsg("✅ Referral submitted and sent to Starting Now!");
      } else {
        setSuccessMsg("⚠️ Referral saved but Starting Now send failed — check the tracker for details.");
      }
    } catch {
      setSuccessMsg("⚠️ Referral saved but Starting Now send failed — check the tracker for details.");
    }

    setSubmitting(false);
    setSnSending(false);
    onSubmitted(); // tell parent to refresh
    router.refresh();
  }

  if (!open) return null;

  const lookupDone = ariveLookupStatus === "found" || ariveLookupStatus === "not_found";
  const isLoading  = submitting || snSending;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl border-l border-line">

        {/* Header */}
        <div className="flex items-start justify-between border-b border-line bg-sand px-6 py-5 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-100 text-base">🛠️</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] ok-gradient-text">Credit Repair Referral</p>
            </div>
            <h2 className="text-xl font-extrabold text-ink">New Starting Now Referral</h2>
            <p className="text-xs text-muted mt-0.5">Look up the ARIVE loan — borrower info auto-fills.</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-white
                       text-muted hover:bg-red-50 hover:text-red-500 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-white">

          {/* Success / failure state */}
          {successMsg && (
            <div className={`rounded-2xl border px-5 py-4 text-sm font-semibold ${
              successMsg.startsWith("✅")
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}>
              {successMsg}
              <p className="mt-2 text-xs font-normal">
                {successMsg.startsWith("✅")
                  ? "You can close this panel — the tracker below has been updated."
                  : "The referral is saved in the tracker. Retry or contact ops if Starting Now continues to reject the send."}
              </p>
            </div>
          )}

          {/* ARIVE Loan Number + Lookup */}
          {!successMsg && (
            <>
              <div className="space-y-2">
                <Field label="ARIVE Loan Number" required>
                  <div className="flex gap-2">
                    <Input
                      value={ariveLoanNumber}
                      onChange={e => { setAriveLoanNumber(e.target.value); setAriveLookupStatus("idle"); }}
                      placeholder="e.g. 12345678"
                      onKeyDown={e => e.key === "Enter" && doAriveLookup(ariveLoanNumber)}
                    />
                    <button
                      type="button"
                      onClick={() => doAriveLookup(ariveLoanNumber)}
                      disabled={ariveLookupStatus === "loading"}
                      className="flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white
                                 disabled:opacity-50 transition-opacity hover:opacity-90"
                      style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
                    >
                      {ariveLookupStatus === "loading" ? (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                        </svg>
                      ) : "Look Up"}
                    </button>
                  </div>
                </Field>

                {/* Lookup status message */}
                {ariveLookupStatus === "found" && (
                  <p className="text-xs font-semibold text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5">
                    ✓ {ariveLookupMessage}
                  </p>
                )}
                {(ariveLookupStatus === "error" || ariveLookupStatus === "not_found") && (
                  <p className="text-xs font-semibold text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5">
                    ⚠️ {ariveLookupMessage}
                  </p>
                )}
              </div>

              {/* Borrower Info — shown after lookup attempt (or always for manual entry) */}
              {(lookupDone || ariveLookupStatus === "idle") && (
                <>
                  {/* Borrower Name */}
                  <div className="grid gap-3 grid-cols-2">
                    <Field label="First Name" required>
                      <Input
                        value={borrowerFirst}
                        onChange={e => setBorrowerFirst(e.target.value)}
                        placeholder="Auto-filled from ARIVE"
                        className={ariveLookupStatus === "found" ? "bg-sand text-muted" : ""}
                      />
                    </Field>
                    <Field label="Last Name" required>
                      <Input
                        value={borrowerLast}
                        onChange={e => setBorrowerLast(e.target.value)}
                        placeholder="Auto-filled from ARIVE"
                        className={ariveLookupStatus === "found" ? "bg-sand text-muted" : ""}
                      />
                    </Field>
                  </div>

                  {/* Borrower Contact */}
                  {ariveLookupStatus === "found" && (
                    <p className="text-[11px] text-muted/70 bg-sand rounded-lg border border-line px-3 py-2">
                      ✏️ Fields below were auto-filled from ARIVE. You can still edit any field before submitting.
                    </p>
                  )}
                  <div className="grid gap-3 grid-cols-2">
                    <Field label="Borrower Email" required>
                      <Input
                        type="email"
                        value={borrowerEmail}
                        onChange={e => setBorrowerEmail(e.target.value)}
                        placeholder="borrower@email.com"
                      />
                    </Field>
                    <Field label="Borrower Phone" required>
                      <Input
                        type="tel"
                        value={borrowerPhone}
                        onChange={e => setBorrowerPhone(e.target.value)}
                        placeholder="e.g. 4101234567"
                      />
                    </Field>
                  </div>

                  {/* Borrower City + State */}
                  <div className="grid gap-3 grid-cols-2">
                    <Field label="Borrower City">
                      <Input
                        value={borrowerCity}
                        onChange={e => setBorrowerCity(e.target.value)}
                        placeholder="e.g. Baltimore"
                      />
                    </Field>
                    <Field label="Borrower State">
                      <Input
                        value={borrowerState}
                        onChange={e => setBorrowerState(e.target.value)}
                        placeholder="e.g. Maryland"
                      />
                    </Field>
                  </div>

                  {/* Partner Notes */}
                  <Field label="Partner Notes" hint="Optional — defaults to ARIVE loan number if blank">
                    <Textarea
                      value={partnerNotes}
                      onChange={e => setPartnerNotes(e.target.value)}
                      placeholder="Any context for the Starting Now team..."
                    />
                  </Field>

                  {/* GLBA Consent */}
                  <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-orange-700">
                      Borrower Consent Required <span className="text-red-500">*</span>
                    </p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded accent-orange-500 flex-shrink-0" />
                      <span className="text-sm text-ink leading-relaxed">
                        I confirm the borrower has been informed their information will be shared with
                        Starting Now Corporation and has consented to this referral.{" "}
                        <span className="font-bold text-orange-700">(GLBA Reg P — required)</span>
                      </span>
                    </label>
                  </div>

                  {/* Certification */}
                  <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted/70">Certification</p>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={certified} onChange={e => setCertified(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded accent-orange-500 flex-shrink-0" />
                      <span className="text-sm text-ink leading-relaxed">
                        I certify that the information above is accurate and I am authorized to submit this referral.
                      </span>
                    </label>
                    <div className="grid gap-3 grid-cols-2">
                      <Field label="NMLS #" required>
                        <Input value={certNmls} onChange={e => setCertNmls(e.target.value)} placeholder="e.g. 1234567" />
                      </Field>
                      <Field label="LO Name">
                        <Input value={certLoName} onChange={e => setCertLoName(e.target.value)} placeholder="Your full name" />
                      </Field>
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-line bg-sand px-6 py-4 flex gap-3 flex-shrink-0">
          {successMsg ? (
            <button
              onClick={onClose}
              className="flex-1 rounded-xl py-3 text-sm font-bold text-white hover:opacity-90 transition-opacity"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 rounded-xl py-3 text-sm font-bold text-white
                           disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-all"
                style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
              >
                {snSending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Sending to Starting Now…
                  </span>
                ) : submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Submitting…
                  </span>
                ) : "Submit Referral →"}
              </button>
              <button
                onClick={onClose}
                className="rounded-xl border border-line bg-white px-5 py-3 text-sm font-semibold text-muted
                           hover:bg-sand hover:text-ink transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
