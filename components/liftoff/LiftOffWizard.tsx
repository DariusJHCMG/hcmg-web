"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LiftOffRequestType, LockStatus } from "@/lib/database.types";

// ── Request type definitions ──────────────────────────────────
const REQUEST_TYPES: {
  id: LiftOffRequestType;
  label: string;
  description: string;
  tags: string[];
  lockRequired?: boolean;
  icon: string;
}[] = [
  {
    id: "register_disclosure",
    label: "Register + Disclosure",
    description: "Register, then issue LE and send disclosures. Lock or float reason required.",
    tags: ["REGISTER", "LOCK", "DISCLOSURE"],
    lockRequired: true,
    icon: "📋",
  },
  {
    id: "disclosure_only",
    label: "Disclosure Only (file already registered)",
    description: "Send disclosures on a loan that's already been registered. Lock required.",
    tags: ["LOCK", "DISCLOSURE"],
    lockRequired: true,
    icon: "📄",
  },
  {
    id: "submission",
    label: "Submission",
    description: "Full intake — register, lock, LE, disclosure, pre-UW, ready for processing.",
    tags: ["REGISTER", "LOCK", "DISCLOSURE", "PRE-UW", "PROCESSOR"],
    lockRequired: true,
    icon: "🚀",
  },
  {
    id: "restructure_suspense",
    label: "Restructure / Suspense",
    description: "Resolve a blocker on an existing loan — restructure if no solution, or submit an exception request when you have one.",
    tags: ["RESTRUCTURE", "EXCEPTION", "COMPLIANCE"],
    icon: "🔄",
  },
  {
    id: "wire_request",
    label: "Wire Request",
    description: "Closing-stage funding request — uploads Final CD, requires dual approval before wire releases.",
    tags: ["CLOSING", "DUAL APPROVAL", "TRIO"],
    icon: "💸",
  },
  {
    id: "adverse",
    label: "Adverse",
    description: "Declare a loan dead. Captures resell attempt + appraisal disposition; routes to compliance / procmgr / dms_admin to complete ARIVE LOS.",
    tags: ["ADVERSE", "COMPLIANCE", "ARIVE"],
    icon: "⚠️",
  },
];

// ── ARIVE lookup response shape ───────────────────────────────
interface AriveLoanData {
  found?: boolean;
  borrowerFirstName?: string;
  borrowerLastName?: string;
  coBorrowerFirstName?: string;
  coBorrowerLastName?: string;
  loanType?: string;
  loanAmount?: number;
  purchasePrice?: number;
  propertyAddress?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyZip?: string;
  targetCloseDate?: string;
  lockStatus?: string;
  floatReason?: string;
}

// ── Step indicator ────────────────────────────────────────────
function StepBar({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Pick request type",          sub: "Choose what kind of lift off" },
    { n: 2, label: "Loan + prior progress",      sub: "ARIVE # + carry forward what's already done" },
    { n: 3, label: "Borrower / IPAC / docs",     sub: "Fill the rest, certify, submit" },
  ];
  return (
    <div className="grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-line mb-8">
      {steps.map((s) => (
        <div key={s.n}
          className={`px-5 py-3 text-sm ${
            step === s.n
              ? "bg-[#142850] text-white"
              : step > s.n
              ? "bg-sand text-muted"
              : "bg-white text-muted/50"
          }`}>
          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black mr-2
            ${step === s.n ? "bg-orange-500 text-white" : step > s.n ? "bg-green-500 text-white" : "bg-line text-muted/50"}`}>
            {step > s.n ? "✓" : s.n}
          </span>
          <span className="font-bold">{s.label}</span>
          <p className="text-[10px] mt-0.5 opacity-60 pl-7 hidden sm:block">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

// ── Field helpers ─────────────────────────────────────────────
function Field({
  label, required, children, hint, className,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold uppercase tracking-[0.1em] text-ink mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted/70">{hint}</p>}
    </div>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink
                 placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400"
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={3}
      {...props}
      className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink
                 placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 resize-none"
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  const { options, ...rest } = props;
  return (
    <select
      {...rest}
      className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink
                 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400">
      <option value="">Select…</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}

// ── Main wizard ───────────────────────────────────────────────
export default function LiftOffWizard() {
  const router = useRouter();
  const [step, setStep]             = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // Step 1
  const [requestType, setRequestType] = useState<LiftOffRequestType | "">("");

  // Step 2 — ARIVE lookup
  const [ariveLoanNumber, setAriveLoanNumber]     = useState("");
  const [ariveLookupStatus, setAriveLookupStatus] = useState<"idle" | "loading" | "found" | "not_found" | "error" | "not_configured">("idle");
  const [ariveLookupMessage, setAriveLookupMessage] = useState("");
  const [ariveLookupRaw, setAriveLookupRaw]       = useState<AriveLoanData | null>(null);

  // Step 2 — loan details (can be auto-filled or manual)
  const [carriedForwardIds, setCarriedForwardIds] = useState("");
  const [loanType, setLoanType]                   = useState("");
  const [loanAmount, setLoanAmount]               = useState("");
  const [purchasePrice, setPurchasePrice]         = useState("");
  const [lockStatus, setLockStatus]               = useState<LockStatus | "">("");
  const [floatReason, setFloatReason]             = useState("");

  // Step 3 — Borrower (can be auto-filled)
  const [borrowerFirst, setBorrowerFirst]     = useState("");
  const [borrowerLast, setBorrowerLast]       = useState("");
  const [coBorrowerFirst, setCoBorrowerFirst] = useState("");
  const [coBorrowerLast, setCoBorrowerLast]   = useState("");

  // Step 3 — Property (can be auto-filled)
  const [propAddress, setPropAddress] = useState("");
  const [propCity, setPropCity]       = useState("");
  const [propState, setPropState]     = useState("");
  const [propZip, setPropZip]         = useState("");
  const [targetClose, setTargetClose] = useState("");

  // Step 3 — IPAC notes (all required)
  const [incomeNote, setIncomeNote]     = useState("");
  const [propertyNote, setPropertyNote] = useState("");
  const [assetsNote, setAssetsNote]     = useState("");
  const [creditNote, setCreditNote]     = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Step 3 — Restructure
  const [suspenseReason, setSuspenseReason] = useState("");
  const [suspenseNotes, setSuspenseNotes]   = useState("");
  const [reasonFixed, setReasonFixed]       = useState<boolean | null>(null);

  // Step 3 — Wire
  const [wireLender, setWireLender]                     = useState("");
  const [wireLenderLoanNumber, setWireLenderLoanNumber] = useState("");
  const [wireBranch, setWireBranch]                     = useState("");
  const [wireClosingDate, setWireClosingDate]           = useState("");
  const [wireLockDate, setWireLockDate]                 = useState("");
  const [wireLockExpDate, setWireLockExpDate]           = useState("");
  const [wireDisbursementDate, setWireDisbursementDate] = useState("");
  const [wireSettlementAgentName, setWireSettlementAgentName]   = useState("");
  const [wireSettlementAgentEmail, setWireSettlementAgentEmail] = useState("");
  const [wireBalancedWithTitle, setWireBalancedWithTitle] = useState<boolean | null>(null);
  const [wireRequestorEmail, setWireRequestorEmail]     = useState("");

  // Step 3 — Adverse
  const [adverseReason, setAdverseReason]   = useState("");
  const [adverseNotes, setAdverseNotes]     = useState("");
  const [adverseOutcome, setAdverseOutcome] = useState("");
  const [adverseWithdrawFromPortal, setAdverseWithdrawFromPortal]       = useState<boolean | null>(null);
  const [adverseLeaderAttemptedResell, setAdverseLeaderAttemptedResell] = useState<boolean | null>(null);
  const [adverseOpenAppraisalOrder, setAdverseOpenAppraisalOrder]       = useState<boolean | null>(null);
  const [adverseAppraisalDisposition, setAdverseAppraisalDisposition]   = useState("");

  // Certification
  const [certified, setCertified] = useState(false);

  const selectedType  = REQUEST_TYPES.find((t) => t.id === requestType);
  const lockRequired  = selectedType?.lockRequired ?? false;
  const isWire        = requestType === "wire_request";
  const isAdverse     = requestType === "adverse";
  const isRestructure = requestType === "restructure_suspense";
  const needsIpac     = !isWire && !isAdverse;

  // ── ARIVE lookup ─────────────────────────────────────────────
  async function handleAriveLookup() {
    if (!ariveLoanNumber.trim()) {
      setError("Enter an ARIVE loan number first.");
      return;
    }
    setAriveLookupStatus("loading");
    setAriveLookupMessage("");
    setError("");

    try {
      const res = await fetch("/api/liftoff/arive-lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ loanNumber: ariveLoanNumber.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setAriveLookupStatus(data.notConfigured ? "not_configured" : "error");
        setAriveLookupMessage(data.error ?? "Lookup failed.");
        return;
      }

      if (data.found === false) {
        setAriveLookupStatus("not_found");
        setAriveLookupMessage("Loan number not found in ARIVE. Please fill in manually.");
        return;
      }

      // Auto-fill all available fields
      setAriveLookupRaw(data);
      if (data.borrowerFirstName)    setBorrowerFirst(data.borrowerFirstName);
      if (data.borrowerLastName)     setBorrowerLast(data.borrowerLastName);
      if (data.coBorrowerFirstName)  setCoBorrowerFirst(data.coBorrowerFirstName);
      if (data.coBorrowerLastName)   setCoBorrowerLast(data.coBorrowerLastName);
      if (data.loanType)             setLoanType(data.loanType);
      if (data.loanAmount)           setLoanAmount(String(data.loanAmount));
      if (data.purchasePrice)        setPurchasePrice(String(data.purchasePrice));
      if (data.propertyAddress)      setPropAddress(data.propertyAddress);
      if (data.propertyCity)         setPropCity(data.propertyCity);
      if (data.propertyState)        setPropState(data.propertyState);
      if (data.propertyZip)          setPropZip(data.propertyZip);
      if (data.targetCloseDate)      setTargetClose(data.targetCloseDate.split("T")[0]);
      if (data.lockStatus)           setLockStatus(data.lockStatus as LockStatus);
      if (data.floatReason)          setFloatReason(data.floatReason);

      setAriveLookupStatus("found");
      setAriveLookupMessage("Loan found — fields auto-filled from ARIVE. Review and adjust if needed.");
    } catch {
      setAriveLookupStatus("error");
      setAriveLookupMessage("Network error during lookup. Please fill in manually.");
    }
  }

  // ── Navigation ───────────────────────────────────────────────
  function next() {
    if (step === 1) {
      if (!requestType) { setError("Please select a request type."); return; }
    }
    if (step === 2) {
      if (!ariveLoanNumber.trim()) { setError("ARIVE loan number is required."); return; }
      if (lockRequired && !lockStatus) { setError("Lock status is required for this request type."); return; }
      if (lockStatus === "floating" && !floatReason.trim()) { setError("Float reason is required when floating."); return; }
    }
    setError("");
    setStep((s) => (s < 3 ? (s + 1) as 1 | 2 | 3 : s));
  }
  function back() { setError(""); setStep((s) => (s > 1 ? (s - 1) as 1 | 2 | 3 : s)); }

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!certified)            { setError("Please check the certification box before submitting."); return; }
    if (!borrowerFirst || !borrowerLast) { setError("Borrower first and last name are required."); return; }
    if (needsIpac) {
      if (!incomeNote.trim())   { setError("IPAC — Income note is required."); return; }
      if (!propertyNote.trim()) { setError("IPAC — Property note is required."); return; }
      if (!assetsNote.trim())   { setError("IPAC — Assets note is required."); return; }
      if (!creditNote.trim())   { setError("IPAC — Credit note is required."); return; }
    }

    setSubmitting(true);
    setError("");

    const payload: Record<string, unknown> = {
      request_type:        requestType,
      arive_loan_number:   ariveLoanNumber.trim(),
      arive_lookup_raw:    ariveLookupRaw ?? null,
      arive_looked_up_at:  ariveLookupStatus === "found" ? new Date().toISOString() : null,
      carried_forward_ids: carriedForwardIds || null,
      loan_type:           loanType          || null,
      loan_amount:         loanAmount        ? parseFloat(loanAmount)    : null,
      purchase_price:      purchasePrice     ? parseFloat(purchasePrice) : null,
      lock_status:         lockStatus        || null,
      float_reason:        floatReason       || null,
      borrower_first_name: borrowerFirst,
      borrower_last_name:  borrowerLast,
      co_borrower_first_name: coBorrowerFirst || null,
      co_borrower_last_name:  coBorrowerLast  || null,
      property_address:    propAddress   || null,
      property_city:       propCity      || null,
      property_state:      propState     || null,
      property_zip:        propZip       || null,
      target_close_date:   targetClose   || null,
      income_note:         incomeNote    || "",
      property_note:       propertyNote  || "",
      assets_note:         assetsNote    || "",
      credit_note:         creditNote    || "",
      special_instructions: specialInstructions || null,
      certified_at:        new Date().toISOString(),
    };

    if (isRestructure) {
      payload.suspense_reason = suspenseReason || null;
      payload.suspense_notes  = suspenseNotes  || null;
      payload.reason_fixed    = reasonFixed;
    }

    if (isWire) {
      payload.wire_lender               = wireLender               || null;
      payload.wire_lender_loan_number   = wireLenderLoanNumber     || null;
      payload.wire_branch               = wireBranch               || null;
      payload.wire_closing_date         = wireClosingDate          || null;
      payload.wire_lock_date            = wireLockDate             || null;
      payload.wire_lock_exp_date        = wireLockExpDate          || null;
      payload.wire_disbursement_date    = wireDisbursementDate     || null;
      payload.wire_settlement_agent_name  = wireSettlementAgentName  || null;
      payload.wire_settlement_agent_email = wireSettlementAgentEmail || null;
      payload.wire_balanced_with_title  = wireBalancedWithTitle;
      payload.wire_requestor_email      = wireRequestorEmail       || null;
    }

    if (isAdverse) {
      payload.adverse_reason                  = adverseReason                  || null;
      payload.adverse_notes                   = adverseNotes                   || null;
      payload.adverse_outcome                 = adverseOutcome                 || null;
      payload.adverse_withdraw_from_portal    = adverseWithdrawFromPortal;
      payload.adverse_leader_attempted_resell = adverseLeaderAttemptedResell;
      payload.adverse_open_appraisal_order    = adverseOpenAppraisalOrder;
      payload.adverse_appraisal_disposition   = adverseAppraisalDisposition    || null;
    }

    try {
      const res = await fetch("/api/liftoff/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed."); setSubmitting(false); return; }
      router.push(`/liftoff/${data.id}?submitted=1`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">Harris Capital Mortgage Group</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">Submit Lift Off Request</h1>
      </div>

      <StepBar step={step} />

      {/* ── STEP 1 ── */}
      {step === 1 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">
              Step 1 — Pick Your Request Type
            </h2>
            {!requestType && (
              <span className="rounded-full bg-orange-50 px-3 py-0.5 text-[10px] font-bold text-orange-600 border border-orange-200">
                NO SELECTION
              </span>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {REQUEST_TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setRequestType(t.id); setError(""); }}
                className={`text-left rounded-2xl border-2 p-5 transition-all
                  ${requestType === t.id
                    ? "border-orange-400 bg-orange-50"
                    : "border-line bg-white hover:border-orange-200 hover:bg-orange-50/40"
                  }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{t.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-ink text-sm mb-1">{t.label}</p>
                    <p className="text-xs text-muted leading-relaxed mb-3">{t.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.tags.map((tag) => (
                        <span key={tag}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border
                            ${t.lockRequired && tag === "LOCK"
                              ? "bg-orange-50 border-orange-300 text-orange-700"
                              : "bg-sand border-line text-muted"
                            }`}>
                          {tag}
                        </span>
                      ))}
                      {t.lockRequired && (
                        <span className="rounded-full px-2 py-0.5 text-[10px] font-bold bg-orange-500 text-white">
                          LOCK REQUIRED
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2 ── */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink mb-4">
            Step 2 — Loan + Prior Progress
          </h2>

          {/* ARIVE lookup card */}
          <div className="rounded-2xl border-2 border-[#142850] bg-[#142850]/5 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-xl">🔍</span>
              <div>
                <h3 className="text-sm font-bold text-ink">ARIVE Loan Lookup</h3>
                <p className="text-xs text-muted">Enter the ARIVE loan number and click Look Up to auto-fill this form.</p>
              </div>
            </div>

            <Field label="ARIVE Loan Number" required>
              <div className="flex gap-2">
                <Input
                  value={ariveLoanNumber}
                  onChange={e => { setAriveLoanNumber(e.target.value); setAriveLookupStatus("idle"); }}
                  placeholder="e.g. 2025-001234"
                  className="flex-1"
                />
                <button
                  type="button"
                  disabled={ariveLookupStatus === "loading" || !ariveLoanNumber.trim()}
                  onClick={handleAriveLookup}
                  className="flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-opacity
                             hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(135deg,#142850,#1a3260)" }}
                >
                  {ariveLookupStatus === "loading" ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>
                      Looking up…
                    </span>
                  ) : "Look Up →"}
                </button>
              </div>
            </Field>

            {/* Lookup status banner */}
            {ariveLookupStatus === "found" && (
              <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 px-4 py-2.5 text-sm text-green-800 font-semibold">
                <span>✓</span> {ariveLookupMessage}
              </div>
            )}
            {ariveLookupStatus === "not_found" && (
              <div className="flex items-center gap-2 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-2.5 text-sm text-yellow-800 font-semibold">
                <span>⚠</span> {ariveLookupMessage}
              </div>
            )}
            {(ariveLookupStatus === "error" || ariveLookupStatus === "not_configured") && (
              <div className="flex items-center gap-2 rounded-xl bg-orange-50 border border-orange-200 px-4 py-2.5 text-sm text-orange-800 font-semibold">
                <span>ℹ</span> {ariveLookupMessage}
              </div>
            )}
          </div>

          {/* Loan details — editable whether or not auto-filled */}
          <div className="rounded-2xl border border-line bg-white p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Loan Details</h3>
              {ariveLookupStatus === "found" && (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                  Auto-filled from ARIVE
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Carried Forward From (prior Lift Off IDs)" hint="If this carries forward a previous request, paste its ID here.">
                <Input value={carriedForwardIds} onChange={e => setCarriedForwardIds(e.target.value)} placeholder="Optional — prior request ID" />
              </Field>
              <Field label="Loan Type">
                <Select
                  value={loanType}
                  onChange={e => setLoanType(e.target.value)}
                  options={[
                    { value: "purchase",       label: "Purchase" },
                    { value: "refinance",      label: "Refinance" },
                    { value: "cash_out_refi",  label: "Cash-Out Refinance" },
                    { value: "heloc",          label: "HELOC" },
                    { value: "construction",   label: "Construction" },
                    { value: "renovation",     label: "Renovation" },
                    { value: "other",          label: "Other" },
                  ]}
                />
              </Field>
              <Field label="Loan Amount">
                <Input type="number" min="0" step="1000" value={loanAmount}
                  onChange={e => setLoanAmount(e.target.value)} placeholder="e.g. 425000" />
              </Field>
              {(loanType === "purchase" || purchasePrice) && (
                <Field label="Purchase Price">
                  <Input type="number" min="0" step="1000" value={purchasePrice}
                    onChange={e => setPurchasePrice(e.target.value)} placeholder="e.g. 500000" />
                </Field>
              )}
            </div>
          </div>

          {/* Lock — only for types that need it */}
          {!isRestructure && !isAdverse && (
            <div className="rounded-2xl border border-line bg-white p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">
                Lock Status {lockRequired && <span className="text-orange-500 ml-1">— Required for this request type</span>}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Lock Status" required={lockRequired}>
                  <Select
                    value={lockStatus}
                    onChange={e => setLockStatus(e.target.value as LockStatus)}
                    options={[
                      { value: "locked",        label: "Locked" },
                      { value: "floating",      label: "Floating" },
                      { value: "lock_required", label: "Lock Required" },
                    ]}
                  />
                </Field>
                {lockStatus === "floating" && (
                  <Field label="Float Reason" required>
                    <Input value={floatReason} onChange={e => setFloatReason(e.target.value)}
                      placeholder="Reason for floating" />
                  </Field>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── STEP 3 ── */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink mb-4">
            Step 3 — Borrower / IPAC / Docs
          </h2>

          {/* Borrower */}
          <div className="rounded-2xl border border-line bg-white p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Borrower</h3>
              {ariveLookupStatus === "found" && borrowerFirst && (
                <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                  Auto-filled from ARIVE
                </span>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First Name" required>
                <Input value={borrowerFirst} onChange={e => setBorrowerFirst(e.target.value)} placeholder="First" required />
              </Field>
              <Field label="Last Name" required>
                <Input value={borrowerLast} onChange={e => setBorrowerLast(e.target.value)} placeholder="Last" required />
              </Field>
              <Field label="Co-Borrower First Name">
                <Input value={coBorrowerFirst} onChange={e => setCoBorrowerFirst(e.target.value)} placeholder="Optional" />
              </Field>
              <Field label="Co-Borrower Last Name">
                <Input value={coBorrowerLast} onChange={e => setCoBorrowerLast(e.target.value)} placeholder="Optional" />
              </Field>
            </div>
          </div>

          {/* Property */}
          {!isRestructure && !isAdverse && (
            <div className="rounded-2xl border border-line bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Property</h3>
                {ariveLookupStatus === "found" && propAddress && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    Auto-filled from ARIVE
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Street Address" className="sm:col-span-2">
                  <Input value={propAddress} onChange={e => setPropAddress(e.target.value)} placeholder="123 Main St" />
                </Field>
                <Field label="City">
                  <Input value={propCity} onChange={e => setPropCity(e.target.value)} placeholder="City" />
                </Field>
                <Field label="State">
                  <Input value={propState} onChange={e => setPropState(e.target.value)} placeholder="FL" maxLength={2} />
                </Field>
                <Field label="ZIP">
                  <Input value={propZip} onChange={e => setPropZip(e.target.value)} placeholder="32801" maxLength={10} />
                </Field>
                <Field label="Target Close Date">
                  <Input type="date" value={targetClose} onChange={e => setTargetClose(e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {/* Type-specific fields */}
          {isRestructure && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-orange-700">Restructure / Suspense Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Suspense Reason" required>
                  <Select value={suspenseReason} onChange={e => setSuspenseReason(e.target.value)}
                    options={[
                      { value: "appraisal_issue",     label: "Appraisal Issue" },
                      { value: "title_issue",         label: "Title Issue" },
                      { value: "income_issue",        label: "Income / Employment Issue" },
                      { value: "credit_issue",        label: "Credit Issue" },
                      { value: "asset_issue",         label: "Asset Issue" },
                      { value: "property_condition",  label: "Property Condition" },
                      { value: "pricing_restructure", label: "Pricing / Rate Restructure" },
                      { value: "borrower_change",     label: "Borrower Change" },
                      { value: "other",               label: "Other" },
                    ]}
                  />
                </Field>
                <Field label="Do you have a solution?">
                  <div className="flex gap-4 pt-1">
                    {[{ v: true, label: "Yes — exception ready" }, { v: false, label: "No — suspend" }].map(({ v, label }) => (
                      <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="reasonFixed" checked={reasonFixed === v}
                          onChange={() => setReasonFixed(v)} className="accent-orange-500" />
                        {label}
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="Suspense Notes" hint="Describe the blocker in detail." className="sm:col-span-2">
                  <Textarea value={suspenseNotes} onChange={e => setSuspenseNotes(e.target.value)} placeholder="Describe the issue…" rows={4} />
                </Field>
              </div>
            </div>
          )}

          {isWire && (
            <div className="rounded-2xl border border-line bg-white p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Wire Request Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Lender">
                  <Input value={wireLender} onChange={e => setWireLender(e.target.value)} placeholder="Lender name" />
                </Field>
                <Field label="Lender Loan #">
                  <Input value={wireLenderLoanNumber} onChange={e => setWireLenderLoanNumber(e.target.value)} placeholder="Lender's loan number" />
                </Field>
                <Field label="Branch">
                  <Input value={wireBranch} onChange={e => setWireBranch(e.target.value)} placeholder="Branch name" />
                </Field>
                <Field label="Requestor Email">
                  <Input type="email" value={wireRequestorEmail} onChange={e => setWireRequestorEmail(e.target.value)} placeholder="your@email.com" />
                </Field>
                <Field label="Closing Date">
                  <Input type="date" value={wireClosingDate} onChange={e => setWireClosingDate(e.target.value)} />
                </Field>
                <Field label="Lock Date">
                  <Input type="date" value={wireLockDate} onChange={e => setWireLockDate(e.target.value)} />
                </Field>
                <Field label="Lock Expiration Date">
                  <Input type="date" value={wireLockExpDate} onChange={e => setWireLockExpDate(e.target.value)} />
                </Field>
                <Field label="Disbursement Date">
                  <Input type="date" value={wireDisbursementDate} onChange={e => setWireDisbursementDate(e.target.value)} />
                </Field>
                <Field label="Settlement Agent Name">
                  <Input value={wireSettlementAgentName} onChange={e => setWireSettlementAgentName(e.target.value)} placeholder="Settlement agent" />
                </Field>
                <Field label="Settlement Agent Email">
                  <Input type="email" value={wireSettlementAgentEmail} onChange={e => setWireSettlementAgentEmail(e.target.value)} placeholder="agent@title.com" />
                </Field>
                <Field label="Balanced with Title?">
                  <div className="flex gap-4 pt-1">
                    {[{ v: true, label: "Yes" }, { v: false, label: "No" }].map(({ v, label }) => (
                      <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="wireBalanced" checked={wireBalancedWithTitle === v}
                          onChange={() => setWireBalancedWithTitle(v)} className="accent-orange-500" />
                        {label}
                      </label>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {isAdverse && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-red-700">Adverse Action Details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Adverse Reason" required>
                  <Select value={adverseReason} onChange={e => setAdverseReason(e.target.value)}
                    options={[
                      { value: "credit_denied",          label: "Credit Denied" },
                      { value: "incomplete_application", label: "Incomplete Application" },
                      { value: "property_issue",         label: "Property / Appraisal Issue" },
                      { value: "borrower_withdrew",      label: "Borrower Withdrew" },
                      { value: "pricing_unworkable",     label: "Pricing / Terms Unworkable" },
                      { value: "other",                  label: "Other" },
                    ]}
                  />
                </Field>
                <Field label="Outcome">
                  <Select value={adverseOutcome} onChange={e => setAdverseOutcome(e.target.value)}
                    options={[
                      { value: "denied",     label: "Denied" },
                      { value: "withdrawn",  label: "Withdrawn" },
                      { value: "incomplete", label: "Incomplete" },
                    ]}
                  />
                </Field>
                <Field label="Leader Attempted Resell?">
                  <div className="flex gap-4 pt-1">
                    {[{ v: true, label: "Yes" }, { v: false, label: "No" }].map(({ v, label }) => (
                      <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="adverseResell" checked={adverseLeaderAttemptedResell === v}
                          onChange={() => setAdverseLeaderAttemptedResell(v)} className="accent-orange-500" />
                        {label}
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="Open Appraisal Order?">
                  <div className="flex gap-4 pt-1">
                    {[{ v: true, label: "Yes" }, { v: false, label: "No" }].map(({ v, label }) => (
                      <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="adverseAppraisal" checked={adverseOpenAppraisalOrder === v}
                          onChange={() => setAdverseOpenAppraisalOrder(v)} className="accent-orange-500" />
                        {label}
                      </label>
                    ))}
                  </div>
                </Field>
                {adverseOpenAppraisalOrder && (
                  <Field label="Appraisal Disposition">
                    <Select value={adverseAppraisalDisposition} onChange={e => setAdverseAppraisalDisposition(e.target.value)}
                      options={[
                        { value: "cancel_order",      label: "Cancel Order" },
                        { value: "hold_for_reborrow", label: "Hold for Re-borrow" },
                        { value: "transfer_to_new",   label: "Transfer to New Loan" },
                      ]}
                    />
                  </Field>
                )}
                <Field label="Withdraw from Portal?">
                  <div className="flex gap-4 pt-1">
                    {[{ v: true, label: "Yes" }, { v: false, label: "No" }].map(({ v, label }) => (
                      <label key={String(v)} className="flex items-center gap-2 cursor-pointer text-sm">
                        <input type="radio" name="adverseWithdraw" checked={adverseWithdrawFromPortal === v}
                          onChange={() => setAdverseWithdrawFromPortal(v)} className="accent-orange-500" />
                        {label}
                      </label>
                    ))}
                  </div>
                </Field>
                <Field label="Notes" className="sm:col-span-2">
                  <Textarea value={adverseNotes} onChange={e => setAdverseNotes(e.target.value)} placeholder="Any additional context…" rows={3} />
                </Field>
              </div>
            </div>
          )}

          {/* ── IPAC Notes (required for all types except Wire + Adverse) ── */}
          {needsIpac && (
            <div className="rounded-2xl border-2 border-[#142850] bg-white p-6 space-y-4">
              <div className="flex items-center gap-3 mb-1">
                <div>
                  <h3 className="text-sm font-bold text-ink">
                    IPAC Notes
                    <span className="ml-2 text-orange-500 text-xs font-bold">ALL REQUIRED</span>
                  </h3>
                  <p className="text-[11px] text-muted mt-0.5">
                    <strong>I</strong>ncome · <strong>P</strong>roperty · <strong>A</strong>ssets · <strong>C</strong>redit
                    — describe the file status for each category.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="I — Income" required hint="Employment type, income sources, YTD, gaps, etc.">
                  <Textarea
                    value={incomeNote}
                    onChange={e => setIncomeNote(e.target.value)}
                    placeholder="e.g. W2 employee, 2yr same employer, no gaps, base $85K..."
                    rows={4}
                    required
                  />
                </Field>
                <Field label="P — Property" required hint="Property type, condition, occupancy, appraisal status, etc.">
                  <Textarea
                    value={propertyNote}
                    onChange={e => setPropertyNote(e.target.value)}
                    placeholder="e.g. SFR, primary, appraised at $520K, no conditions..."
                    rows={4}
                    required
                  />
                </Field>
                <Field label="A — Assets" required hint="Checking, savings, gift funds, sourcing notes, etc.">
                  <Textarea
                    value={assetsNote}
                    onChange={e => setAssetsNote(e.target.value)}
                    placeholder="e.g. $62K checking Chase, 3 months SOA provided, no large deposits..."
                    rows={4}
                    required
                  />
                </Field>
                <Field label="C — Credit" required hint="Score, tradelines, derogatory items, explanations, etc.">
                  <Textarea
                    value={creditNote}
                    onChange={e => setCreditNote(e.target.value)}
                    placeholder="e.g. 720 mid, no derog, 3 open TL, 12% utilization..."
                    rows={4}
                    required
                  />
                </Field>
              </div>

              <Field label="Special Instructions">
                <Textarea
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  placeholder="Anything else ops needs to know about this file…"
                  rows={3}
                />
              </Field>
            </div>
          )}

          {/* Wire / Adverse special instructions */}
          {(isWire || isAdverse) && (
            <div className="rounded-2xl border border-line bg-white p-6">
              <Field label="Special Instructions">
                <Textarea
                  value={specialInstructions}
                  onChange={e => setSpecialInstructions(e.target.value)}
                  placeholder="Anything else ops needs to know…"
                  rows={3}
                />
              </Field>
            </div>
          )}

          {/* Certification */}
          <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={certified} onChange={e => setCertified(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded accent-orange-500 flex-shrink-0" />
              <span className="text-sm text-ink leading-relaxed">
                <strong>I certify</strong> that all information provided in this Lift Off request is accurate and complete
                to the best of my knowledge. I understand that this request will be processed by the HCMG operations team
                and that I am responsible for the accuracy of this submission.
              </span>
            </label>
          </div>
        </div>
      )}

      {/* ── Error ── */}
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* ── Navigation ── */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          {step > 1 && (
            <button type="button" onClick={back}
              className="rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-sand transition-colors">
              ← Back
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step < 3 && (
            <button type="button" onClick={next}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              Continue →
            </button>
          )}
          {step === 3 && (
            <button type="submit" disabled={submitting || !certified}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              {submitting ? "Submitting…" : "Submit Lift Off Request 🚀"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
