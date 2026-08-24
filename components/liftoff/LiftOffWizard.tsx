"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { LiftOffRequestType, LockStatus } from "@/lib/database.types";
import { LockPreferenceField } from "@/components/liftoff/LockPreferenceField";
import type { LockPref } from "@/components/liftoff/LockPreferenceField";

// ── Doc checklist per request type ───────────────────────────
interface DocItem { id: string; label: string; category: string; }

function buildSubmissionDocs(selfEmployed: boolean): DocItem[] {
  if (selfEmployed) {
    return [
      { id: "drivers_license", label: "Driver's License",                    category: "borrower" },
      { id: "1003",            label: "1003 — All sections completed in ARIVE", category: "loan" },
      { id: "credit",          label: "Credit Report",                       category: "credit" },
      { id: "tax_returns",     label: "Tax Returns (2 years)",               category: "income" },
      { id: "purchase_agmt",   label: "Purchase Agreement",                  category: "property" },
      { id: "bank_stmts",      label: "Bank Statements (2 months)",          category: "assets" },
    ];
  }
  return [
    { id: "drivers_license", label: "Driver's License",                    category: "borrower" },
    { id: "1003",            label: "1003 — All sections completed in ARIVE", category: "loan" },
    { id: "credit",          label: "Credit Report",                       category: "credit" },
    { id: "w2s",             label: "W-2s (2 years)",                      category: "income" },
    { id: "paystubs",        label: "Paystubs (30-day)",                   category: "income" },
    { id: "purchase_agmt",   label: "Purchase Agreement",                  category: "property" },
    { id: "bank_stmts",      label: "Bank Statements (2 months)",          category: "assets" },
  ];
}

const DOC_CHECKLISTS: Record<LiftOffRequestType, DocItem[]> = {
  register_disclosure: [
    { id: "1003",          label: "1003 Application",        category: "loan" },
    { id: "credit",        label: "Credit Report",           category: "credit" },
    { id: "purchase_agmt", label: "Purchase Agreement",      category: "property" },
    { id: "hoi",           label: "HOI Binder",              category: "property" },
    { id: "title",         label: "Title Order",             category: "property" },
  ],
  disclosure_only: [
    { id: "1003",          label: "1003 Application",        category: "loan" },
    { id: "credit",        label: "Credit Report",           category: "credit" },
    { id: "hoi",           label: "HOI Binder",              category: "property" },
  ],
  submission: [],
  loan_help_desk: [],
  lock_request: [],
};

// ── File status pipeline per request type ────────────────────
const FILE_STATUS_STEPS: Record<LiftOffRequestType, string[]> = {
  register_disclosure:  ["Request Submitted", "Pre-Process Review", "Registered in ARIVE", "Disclosure Sent"],
  disclosure_only:      ["Request Submitted", "Pre-Process Review", "Disclosure Sent"],
  submission:           ["Request Submitted", "Pre-Process Review", "Registered in ARIVE", "Disclosure Sent", "Processor Assigned"],
  loan_help_desk:       ["Request Submitted", "Help Desk Review", "Ops Response", "Resolved"],
  lock_request:         ["Request Submitted", "Lock Desk Review", "Locked in Portal", "LO Notified"],
};

// ── Demo data ─────────────────────────────────────────────────
const DEMO_DATA = {
  requestType:    "submission" as LiftOffRequestType,
  ariveLoanNumber: "HCMG-DEMO-001",
  loanType:       "purchase",
  loanAmount:     "425000",
  purchasePrice:  "500000",
  lockStatus:     "locked" as LockStatus,
  borrowerFirst:  "Marcus",
  borrowerLast:   "Johnson",
  coBorrowerFirst: "Tanya",
  coBorrowerLast:  "Johnson",
  propAddress:    "412 Lakeside Blvd",
  propCity:       "Orlando",
  propState:      "FL",
  propZip:        "32801",
  targetClose:    "2025-10-31",
  incomeNote:     "W2 employee, 3yr same employer (Amazon), base $112K, no gaps, YTD aligns.",
  propertyNote:   "SFR, primary residence, appraised at $510K, no conditions, clear title.",
  assetsNote:     "$68K Chase checking, 3 months SOA provided, no large unexplained deposits.",
  creditNote:     "738 mid score, no derogatory items, 4 open tradelines, 9% utilization.",
  specialInstructions: "Rush — client closing Oct 31. All docs in DMS folder JOHNSON-8842.",
};

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
    description: "Full intake — register, lock, disclosure, pre-UW, ready for processing.",
    tags: ["REGISTER", "LOCK", "DISCLOSURE", "PRE-UW", "PROCESSOR"],
    lockRequired: true,
    icon: "🚀",
  },
  {
    id: "loan_help_desk",
    label: "Loan Help Desk",
    description: "Need help on an existing loan? Select a sub-type and describe the issue — ops will respond within 4 business hours.",
    tags: ["HELP", "OPS", "SUPPORT"],
    icon: "🛎",
  },
  {
    id: "lock_request",
    label: "Lock Desk Request",
    description: "Request a rate lock on a registered loan. Confirm current ARIVE pricing before submitting — the lock desk will execute in the lender portal.",
    tags: ["LOCK", "RATE", "PRICING"],
    icon: "🔒",
  },
];

// ── ARIVE lookup shape ────────────────────────────────────────
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
  // Lock pricing + channel from ARIVE
  noteRate?: number | null;
  discountPoints?: number | null;
  lenderName?: string | null;
  productName?: string | null;
  channelType?: string | null;
  compensationType?: string | null;
  // Deep link
  deepLink?: string | null;
}

// ── Step indicator ────────────────────────────────────────────
function StepBar({ step, requestType, onChangeType }: {
  step: 1 | 2 | 3;
  requestType: LiftOffRequestType | "";
  onChangeType: () => void;
}) {
  const isTwoStep = requestType !== "submission";
  const steps = requestType === "lock_request"
    ? [
        { n: 1, label: "Pick request type", sub: "Choose what kind of lift off" },
        { n: 2, label: "Pricing & Submit",   sub: "Borrower, pricing, certify" },
      ]
    : requestType === "loan_help_desk"
    ? [
        { n: 1, label: "Pick request type", sub: "Choose what kind of lift off" },
        { n: 2, label: "Details & Submit",  sub: "Borrower, issue description, certify" },
      ]
    : requestType === "submission"
    ? [
        { n: 1, label: "Pick request type",      sub: "Choose what kind of lift off" },
        { n: 2, label: "Loan + prior progress",  sub: "ARIVE # + lock status" },
        { n: 3, label: "Borrower / IPAC / docs", sub: "Fill details, checklist, certify" },
      ]
    : [
        { n: 1, label: "Pick request type", sub: "Choose what kind of lift off" },
        { n: 2, label: "Details & Submit",  sub: "Borrower, loan info, certify" },
      ];
  const cols = isTwoStep ? "grid-cols-2" : "grid-cols-3";
  return (
    <div className="mb-8 space-y-3">
      {requestType && (
        <div className="flex items-center justify-between rounded-xl border border-line bg-white px-5 py-3">
          <span className="text-xs text-muted">
            Selected type: <strong className="text-ink">{REQUEST_TYPES.find(t => t.id === requestType)?.label}</strong>
          </span>
          <span className="text-xs font-bold text-accent cursor-pointer hover:underline" onClick={onChangeType}>CHANGE</span>
        </div>
      )}
      <div className={`grid ${cols} gap-px rounded-xl overflow-hidden border border-line`}>
        {steps.map((s) => (
          <div key={s.n} className={`px-5 py-3 text-sm ${
            step === s.n ? "bg-[#142850] text-white" : step > s.n ? "bg-sand text-muted" : "bg-white text-muted/50"
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
    </div>
  );
}

// ── Field helpers ─────────────────────────────────────────────
function Field({ label, required, children, hint, className }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string; className?: string;
}) {
  return (
    <div className={className}>
      <label className="block text-xs font-bold uppercase tracking-[0.1em] text-muted/80 mb-1.5">
        {label}{required && <span className="text-orange-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-muted/60">{hint}</p>}
    </div>
  );
}

function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  // If the caller passes a bg-* override (e.g. bg-sand), strip bg-white from the base so it actually takes effect.
  const base = className?.includes("bg-")
    ? "w-full rounded-xl border border-line px-4 py-2.5 text-sm placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400"
    : "w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400";
  return (
    <input {...props}
      className={`${base}${className ? ` ${className}` : ""}`} />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea rows={3} {...props}
      className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink
                 placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 resize-none" />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  const { options, disabled, ...rest } = props;
  return (
    <select {...rest} disabled={disabled}
      className={`w-full rounded-xl border border-line px-4 py-2.5 text-sm
                 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400
                 ${disabled ? "bg-sand text-muted cursor-not-allowed" : "bg-white text-ink"}`}>
      <option value="">Select…</option>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── DocState type ──────────────────────────────────────────────
type DocState = { checked: boolean; na: boolean; naNote: string };

// ── N/A Reason Modal ──────────────────────────────────────────
function NaReasonModal({
  open, docLabel, onConfirm, onCancel,
}: {
  open: boolean;
  docLabel: string;
  onConfirm: (note: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState("");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4 mx-4">
        <div>
          <h3 className="text-sm font-bold text-ink">Mark as N/A</h3>
          <p className="text-xs text-muted mt-1">{docLabel}</p>
        </div>
        <textarea
          rows={4}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          placeholder="Explain why this document does not apply to this loan..."
          className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink
                     placeholder:text-muted/40 focus:outline-none focus:ring-2 focus:ring-orange-400/40 focus:border-orange-400 resize-none"
        />
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => { onCancel(); setDraft(""); }}
            className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink hover:bg-sand transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!draft.trim()}
            onClick={() => { onConfirm(draft.trim()); setDraft(""); }}
            className="rounded-xl bg-[#142850] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1a3566] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm N/A
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Document Checklist component ──────────────────────────────
function DocChecklist({
  items, checked, onCheck, onNa, isDemo,
}: {
  items: DocItem[];
  checked: Record<string, DocState>;
  onCheck: (id: string) => void;
  onNa: (id: string) => void;
  isDemo: boolean;
}) {
  const resolvedCount = isDemo
    ? items.length
    : items.filter(i => checked[i.id]?.checked || (checked[i.id]?.na && checked[i.id]?.naNote)).length;
  const pendingCount = items.length - resolvedCount;

  return (
    <div className="rounded-2xl border-2 border-[#142850] bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Document Checklist</h3>
          <p className="text-[11px] text-muted mt-0.5">
            Confirm which documents are in the file. All items must be resolved to submit.
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-bold border ${
          pendingCount === 0
            ? "bg-green-50 text-green-700 border-green-200"
            : "bg-orange-50 text-orange-700 border-orange-200"
        }`}>
          {resolvedCount} of {items.length} resolved
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-line overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${items.length > 0 ? (resolvedCount / items.length) * 100 : 0}%`,
            background: "linear-gradient(135deg,#FF9847,#F37021)",
          }}
        />
      </div>

      <div className="space-y-2">
        {items.map(item => {
          const isChecked = isDemo ? true : (checked[item.id]?.checked ?? false);
          const isNa      = isDemo ? false : (checked[item.id]?.na ?? false);
          const naNote    = checked[item.id]?.naNote ?? "";

          return (
            <div key={item.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition-all
                ${isChecked
                  ? "border-green-200 bg-green-50"
                  : isNa
                    ? "border-gray-200 bg-gray-50"
                    : "border-line bg-white"
                }`}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => !isDemo && onCheck(item.id)}
                className="h-4 w-4 rounded accent-orange-500 flex-shrink-0 cursor-pointer"
              />
              <div className="flex-1 min-w-0">
                <span className={`text-sm font-semibold ${isChecked ? "text-green-800" : isNa ? "text-gray-500" : "text-ink"}`}>
                  {item.label}
                </span>
                {isNa && naNote && (
                  <p className="text-[11px] text-muted/60 italic mt-0.5 truncate" title={naNote}>
                    {naNote.length > 60 ? naNote.slice(0, 60) + "…" : naNote}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isChecked ? (
                  <span className="text-[10px] font-bold text-green-600 uppercase tracking-wide">✓ In File</span>
                ) : isNa ? (
                  <>
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide border border-gray-300 bg-gray-100 rounded-full px-2 py-0.5">N/A</span>
                    <button
                      type="button"
                      onClick={() => !isDemo && onCheck(item.id)}
                      className="text-xs text-muted/60 hover:text-gray-700 underline underline-offset-2 cursor-pointer"
                    >
                      Undo
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wide border border-orange-200 bg-orange-50 rounded-full px-2 py-0.5">
                      PENDING
                    </span>
                    {!isDemo && (
                      <button
                        type="button"
                        onClick={() => onNa(item.id)}
                        className="text-xs text-muted/60 hover:text-gray-700 underline underline-offset-2 cursor-pointer"
                      >
                        N/A
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── File Status sidebar ───────────────────────────────────────
function FileStatusPanel({ requestType }: { requestType: LiftOffRequestType }) {
  const steps = FILE_STATUS_STEPS[requestType] ?? [];
  return (
    <div className="rounded-2xl border border-line bg-white p-5 space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">File Status</p>
      <div className="space-y-2">
        {steps.map((s, i) => (
          <div key={s} className={`flex items-start gap-3 rounded-xl px-3 py-2.5 ${
            i === 0 ? "bg-green-50 border border-green-200" : "bg-sand border border-line"
          }`}>
            <span className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-black
              ${i === 0 ? "bg-green-500 text-white" : "bg-line text-muted"}`}>
              {i === 0 ? "✓" : i + 1}
            </span>
            <div>
              <p className={`text-xs font-bold ${i === 0 ? "text-green-800" : "text-muted"}`}>{s}</p>
              <p className="text-[10px] text-muted/60 mt-0.5">
                {i === 0 ? "Will trigger on submit" : "Pending"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main wizard ───────────────────────────────────────────────
export default function LiftOffWizard() {
  return <Suspense><WizardInner /></Suspense>;
}

function WizardInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isDemo       = searchParams.get("demo") === "1";

  const [step, setStep]             = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // Idempotency key — one UUID per mount, replaced after each successful submit.
  // Sending the same key twice to the API is a no-op (returns the existing row).
  const submissionKeyRef = useRef(crypto.randomUUID());

  // Step 1
  const [requestType, setRequestType] = useState<LiftOffRequestType | "">("");

  // Step 2 — ARIVE
  const [ariveLoanNumber, setAriveLoanNumber]       = useState("");
  const [ariveLookupStatus, setAriveLookupStatus]   = useState<"idle"|"loading"|"found"|"not_found"|"error"|"not_configured">("idle");
  const [ariveLookupMessage, setAriveLookupMessage] = useState("");
  const [ariveLookupRaw, setAriveLookupRaw]         = useState<AriveLoanData | null>(null);
  const [carriedForwardIds, setCarriedForwardIds]   = useState("");
  const [loanPurpose, setLoanPurpose]               = useState("");  // purchase | refinance
  const [loanProgram, setLoanProgram]               = useState("");  // conventional | fha | va | non_qm | heloc | etc.
  const [loanAmount, setLoanAmount]                 = useState("");
  const [purchasePrice, setPurchasePrice]           = useState("");
  const [earnestMoneyDeposit, setEarnestMoneyDeposit] = useState("");
  const [sellerCredit, setSellerCredit]               = useState("");
  const [lockStatus, setLockStatus]                 = useState<LockStatus | "">("");
  const [floatReason, setFloatReason]               = useState("");
  // Lock preference (replaces old lockStatus for non-lock-request types)
  const [lockPref, setLockPref]                     = useState<LockPref>("");
  const [linkedLockRequestId, setLinkedLockRequestId] = useState<string | null>(null);

  // Step 2 — Property type / occupancy
  const [propertyType, setPropertyType] = useState("");
  const [occupancyType, setOccupancyType] = useState("");
  const [selfEmployed, setSelfEmployed] = useState<boolean | null>(null);

  // Step 3 — Borrower
  const [borrowerFirst, setBorrowerFirst]     = useState("");
  const [borrowerLast, setBorrowerLast]       = useState("");
  const [coBorrowerFirst, setCoBorrowerFirst] = useState("");
  const [coBorrowerLast, setCoBorrowerLast]   = useState("");

  // Step 3 — Property
  const [propAddress, setPropAddress] = useState("");
  const [propCity, setPropCity]       = useState("");
  const [propState, setPropState]     = useState("");
  const [propZip, setPropZip]         = useState("");
  const [targetClose, setTargetClose] = useState("");

  // Step 3 — IPAC
  const [incomeNote, setIncomeNote]         = useState("");
  const [propertyNote, setPropertyNote]     = useState("");
  const [assetsNote, setAssetsNote]         = useState("");
  const [creditNote, setCreditNote]         = useState("");
  const [loanGoal, setLoanGoal]             = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Step 2 — Help Desk
  const [helpDeskSubType, setHelpDeskSubType]       = useState("");
  const [helpDeskDescription, setHelpDeskDescription] = useState("");

  // Step 3 — 1003 matches registration
  const [matches1003, setMatches1003]               = useState<boolean | null>(null);
  const [matches1003Changes, setMatches1003Changes] = useState("");

  // Step 3 — Gift funds
  const [giftFundsPresent, setGiftFundsPresent]     = useState<"yes" | "no" | "">("");
  const [donorFirstName, setDonorFirstName]         = useState("");
  const [donorLastName, setDonorLastName]           = useState("");
  const [donorPhone, setDonorPhone]                 = useState("");
  const [donorEmail, setDonorEmail]                 = useState("");
  const [donorAddress1, setDonorAddress1]           = useState("");
  const [donorAddress2, setDonorAddress2]           = useState("");
  const [donorCity, setDonorCity]                   = useState("");
  const [donorState, setDonorState]                 = useState("");
  const [donorZip, setDonorZip]                     = useState("");

  // Step 3 — Ready to submit
  const [readyToSubmit, setReadyToSubmit]               = useState(false);
  const [submissionRequestedAt, setSubmissionRequestedAt] = useState<string | null>(null);

  // Step 3 — Doc checklist (keyed by doc id)
  const [docChecked, setDocChecked] = useState<Record<string, DocState>>({});
  const [pendingNaModal, setPendingNaModal] = useState<string | null>(null);

  // Certification
  const [certified, setCertified]   = useState(false);
  const [certNmls, setCertNmls]     = useState("");
  const [certLoName, setCertLoName] = useState("");

  // Step 2 — Lock Request pricing + channel
  const [lockRate, setLockRate]               = useState("");
  const [lockPrice, setLockPrice]             = useState("");
  const [lockLender, setLockLender]           = useState("");
  const [channelType, setChannelType]         = useState("");
  const [compensationType, setCompensationType] = useState("");
  const [lockProduct, setLockProduct]         = useState("");
  const [lockPeriod, setLockPeriod]           = useState<15|30|45|60>(30);
  const [lockCloseDate, setLockCloseDate]     = useState("");
  const [lockLoNotes, setLockLoNotes]         = useState("");
  const [lockChkArive, setLockChkArive]       = useState(false);
  const [lockChkLos, setLockChkLos]           = useState(false);

  const selectedType   = REQUEST_TYPES.find(t => t.id === requestType);
  const lockRequired   = selectedType?.lockRequired ?? false;
  const isHelpDesk     = requestType === "loan_help_desk";
  const isLockRequest  = requestType === "lock_request";
  const isSubmission   = requestType === "submission";
  const docItems       = isSubmission && selfEmployed !== null ? buildSubmissionDocs(selfEmployed) : (requestType ? DOC_CHECKLISTS[requestType] ?? [] : []);
  const resolvedCount  = isDemo ? docItems.length : docItems.filter(d => docChecked[d.id]?.checked || (docChecked[d.id]?.na && docChecked[d.id]?.naNote)).length;
  const pendingDocs    = docItems.length - resolvedCount;

  // ── Demo prefill ─────────────────────────────────────────────
  useEffect(() => {
    if (!isDemo) return;
    setPropertyType("sfr");
    setOccupancyType("primary");
    setRequestType(DEMO_DATA.requestType);
    setAriveLoanNumber(DEMO_DATA.ariveLoanNumber);
    setLoanPurpose("purchase");
    setLoanProgram("conventional");
    setLoanAmount(DEMO_DATA.loanAmount);
    setPurchasePrice(DEMO_DATA.purchasePrice);
    setLockStatus(DEMO_DATA.lockStatus);
    setBorrowerFirst(DEMO_DATA.borrowerFirst);
    setBorrowerLast(DEMO_DATA.borrowerLast);
    setCoBorrowerFirst(DEMO_DATA.coBorrowerFirst);
    setCoBorrowerLast(DEMO_DATA.coBorrowerLast);
    setPropAddress(DEMO_DATA.propAddress);
    setPropCity(DEMO_DATA.propCity);
    setPropState(DEMO_DATA.propState);
    setPropZip(DEMO_DATA.propZip);
    setTargetClose(DEMO_DATA.targetClose);
    setIncomeNote(DEMO_DATA.incomeNote);
    setPropertyNote(DEMO_DATA.propertyNote);
    setAssetsNote(DEMO_DATA.assetsNote);
    setCreditNote(DEMO_DATA.creditNote);
    setSpecialInstructions(DEMO_DATA.specialInstructions);
    setCertNmls("1918223");
    setCertLoName("Demo LO");
    setAriveLookupStatus("found");
    setAriveLookupMessage("Demo mode — loan pre-filled.");
  }, [isDemo]);

  // ── ARIVE lookup ─────────────────────────────────────────────
  async function handleAriveLookup() {
    if (!ariveLoanNumber.trim()) { setError("Enter an ARIVE loan number first."); return; }
    setAriveLookupStatus("loading");
    setAriveLookupMessage("");
    setError("");
    try {
      // Step 1 — fire the lookup (triggers Zapier → ARIVE)
      const res  = await fetch("/api/liftoff/arive-lookup", {
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

      // Step 2 — if direct result (demo loans), fill immediately
      if (!data.pending) {
        applyAriveData(data);
        return;
      }

      // Step 3 — poll for Zapier result (max 15s, every 1.5s)
      const { requestId } = data;
      const deadline = Date.now() + 15_000;
      while (Date.now() < deadline) {
        await new Promise(r => setTimeout(r, 1_500));
        const pollRes = await fetch(`/api/liftoff/arive-poll?id=${requestId}`);
        const pollData = await pollRes.json();
        if (!pollData.pending) {
          applyAriveData(pollData);
          return;
        }
      }
      // Timed out
      setAriveLookupStatus("error");
      setAriveLookupMessage("ARIVE lookup timed out. Fill in manually.");
    } catch {
      setAriveLookupStatus("error");
      setAriveLookupMessage("Network error. Fill in manually.");
    }
  }

  // ── Apply ARIVE data to wizard fields ────────────────────────
  function applyAriveData(data: Record<string, unknown>) {
    if (data.found === false) {
      setAriveLookupStatus("not_found");
      setAriveLookupMessage("Loan number not found in ARIVE. Fill in manually.");
      return;
    }
    setAriveLookupRaw(data as AriveLoanData);
    if (data.borrowerFirstName)   setBorrowerFirst(data.borrowerFirstName   as string);
    if (data.borrowerLastName)    setBorrowerLast(data.borrowerLastName     as string);
    if (data.coBorrowerFirstName) setCoBorrowerFirst(data.coBorrowerFirstName as string);
    if (data.coBorrowerLastName)  setCoBorrowerLast(data.coBorrowerLastName  as string);
    if (data.propertyType)        setPropertyType(data.propertyType          as string);
    if (data.occupancyType)       setOccupancyType(data.occupancyType        as string);
    if (data.loanType) {
      // loanType from ARIVE result is e.g. "purchase", "purchase_fha", "refinance_va", "non_qm"
      const lt = data.loanType as string;
      // Purpose
      if (lt === "heloc" || lt === "heloan")              setLoanPurpose("purchase");
      else if (lt.startsWith("purchase"))                 setLoanPurpose("purchase");
      else if (lt.startsWith("refinance") || lt === "cash_out_refi") setLoanPurpose("refinance");
      // Program
      if (lt.includes("non_qm") || lt.includes("nonqm")) setLoanProgram("non_qm");
      else if (lt.includes("fha"))                        setLoanProgram("fha");
      else if (lt.includes("va"))                         setLoanProgram("va");
      else if (lt.includes("usda"))                       setLoanProgram("usda");
      else if (lt === "heloc")                            setLoanProgram("heloc");
      else if (lt === "heloan")                           setLoanProgram("heloan");
      else if (lt === "construction")                     setLoanProgram("construction");
      else if (lt === "renovation")                       setLoanProgram("renovation");
      else                                                setLoanProgram("conventional");
    }
    if (data.loanAmount)         setLoanAmount(String(data.loanAmount));
    if (data.purchasePrice)      setPurchasePrice(String(data.purchasePrice));
    if (data.propertyAddress)    setPropAddress(data.propertyAddress     as string);
    if (data.propertyCity)       setPropCity(data.propertyCity           as string);
    if (data.propertyState)      setPropState(data.propertyState         as string);
    if (data.propertyZip)        setPropZip(data.propertyZip             as string);
    if (data.targetCloseDate)    setTargetClose((data.targetCloseDate as string).split("T")[0]);
    if (data.lockStatus)         setLockStatus(data.lockStatus           as LockStatus);
    // Auto-fill lock pricing + channel fields
    if (data.noteRate       != null) setLockRate(String(data.noteRate));
    if (data.discountPoints != null) setLockPrice(String(data.discountPoints));
    if (data.lenderName)         setLockLender(data.lenderName     as string);
    if (data.productName)        setLockProduct(data.productName   as string);
    if (data.channelType)           setChannelType(data.channelType           as string);
    if (data.compensationType)      setCompensationType(data.compensationType as string);
    if (data.earnestMoneyDeposit != null) setEarnestMoneyDeposit(String(data.earnestMoneyDeposit));
    if (data.sellerCredit        != null) setSellerCredit(String(data.sellerCredit));
    setAriveLookupStatus("found");
    setAriveLookupMessage("Loan found — fields auto-filled from ARIVE. Review and adjust if needed.");
  }

  // ── Whether ARIVE fields are locked (read-only) ───────────────
  const ariveFieldsLocked = !isDemo && ariveLookupStatus === "found";

  // ── Navigation ────────────────────────────────────────────────
  function next() {
    if (step === 1 && !requestType) { setError("Please select a request type."); return; }
    if (step === 2) {
      if (!ariveLoanNumber.trim()) { setError("ARIVE loan number is required."); return; }
      // Require successful ARIVE lookup before proceeding (non-demo)
      if (!isDemo && ariveLookupStatus !== "found") {
        setError("Please look up the ARIVE loan number before continuing."); return;
      }
      if (isLockRequest) {
        if (!lockRate.trim())  { setError("Rate is required for a lock request."); return; }
        if (!lockPrice.trim()) { setError("Price / points is required for a lock request."); return; }
        if (!lockChkArive)     { setError("Please confirm you have run pricing in ARIVE within the last 20 minutes."); return; }
        if (!lockChkLos)       { setError("Please confirm the pricing in the LOS (ARIVE) matches what you want to lock."); return; }
      } else if (isHelpDesk) {
        if (!helpDeskSubType)              { setError("Please select a sub-type for your help desk request."); return; }
        if (helpDeskDescription.trim().length < 100) { setError("Please describe the issue in at least 100 characters."); return; }
      } else if (isSubmission) {
        if (selfEmployed === null) { setError("Please indicate if any borrower is self-employed or 1099."); return; }
        if (lockRequired && !lockPref) { setError("Please select Lock or Float for this loan."); return; }
        if (lockPref === "float" && !floatReason.trim()) { setError("Float reason is required when floating."); return; }
      }
      // register_disclosure and disclosure_only submit on step 2 — no step 3 needed
    }
    setError("");
    setStep(s => (s < 3 ? (s + 1) as 1|2|3 : s));
  }
  function back() { setError(""); setStep(s => (s > 1 ? (s - 1) as 1|2|3 : s)); }

  // ── Submit ────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!certified)                      { setError("Please check the certification box."); return; }
    if (!certNmls.trim())                { setError("Your NMLS # is required for certification."); return; }
    if (!borrowerFirst || !borrowerLast) { setError("Borrower name is required."); return; }
    // Lock request — validate pricing confirmations on submit (step 2 is final)
    if (isLockRequest) {
      if (!ariveLoanNumber.trim())   { setError("ARIVE loan number is required."); return; }
      if (!lockRate.trim())          { setError("Rate is required for a lock request."); return; }
      if (!lockPrice.trim())         { setError("Discount Points is required for a lock request."); return; }
      if (!isDemo && !lockChkArive)  { setError("Please confirm you have run pricing in ARIVE within the last 20 minutes."); return; }
      if (!isDemo && !lockChkLos)    { setError("Please confirm the pricing in the LOS (ARIVE) matches what you want to lock."); return; }
    }
    if (!isDemo && isSubmission) {
      if (!incomeNote.trim())   { setError("IPAC — Income note is required."); return; }
      if (!propertyNote.trim()) { setError("IPAC — Property note is required."); return; }
      if (!assetsNote.trim())   { setError("IPAC — Assets note is required."); return; }
      if (!creditNote.trim())   { setError("IPAC — Credit note is required."); return; }
      if (pendingDocs > 0)      { setError(`Resolve ${pendingDocs} pending document${pendingDocs > 1 ? "s" : ""} before submitting.`); return; }
    }
    if (isDemo) { router.push("/liftoff?demo=1&submitted=1"); return; }

    setSubmitting(true);
    setError("");

    // Only persist the checklist if at least one item is resolved.
    // Sending all-pending rows just shows "0 of N PENDING" on the detail page
    // which is noise for request types where docs aren't submitted by the LO.
    const rawChecklist = docItems.map(d => ({
      id: d.id, label: d.label, category: d.category,
      checked: docChecked[d.id]?.checked ?? false,
      na: docChecked[d.id]?.na ?? false,
      naNote: docChecked[d.id]?.naNote ?? "",
    }));
    const anyResolved = rawChecklist.some(d => d.checked || d.na);
    const checklistPayload = anyResolved ? rawChecklist : null;

    const payload: Record<string, unknown> = {
      request_type:           requestType,
      arive_loan_number:      ariveLoanNumber.trim(),
      arive_lookup_raw:       ariveLookupRaw ?? null,
      arive_looked_up_at:     ariveLookupStatus === "found" ? new Date().toISOString() : null,
      arive_deep_link:        ariveLookupRaw?.deepLink ?? null,
      carried_forward_ids:    carriedForwardIds || null,
      loan_purpose:           loanPurpose       || null,
      loan_program:           loanProgram       || null,
      loan_type:              loanPurpose && loanProgram
                                ? (loanPurpose === "purchase" && loanProgram !== "heloc"
                                    ? (loanProgram === "conventional" ? "purchase" : `purchase_${loanProgram}`)
                                    : loanPurpose === "refinance"
                                      ? (loanProgram === "conventional" ? "refinance" : `refinance_${loanProgram}`)
                                      : loanProgram)
                                : null,
      loan_amount:            loanAmount           ? parseFloat(loanAmount)           : null,
      purchase_price:         purchasePrice        ? parseFloat(purchasePrice)        : null,
      earnest_money_deposit:  earnestMoneyDeposit  ? parseFloat(earnestMoneyDeposit)  : null,
      seller_credit:          sellerCredit         ? parseFloat(sellerCredit)         : null,
      lock_status:            lockPref === "lock" ? "locked" : lockPref === "float" ? "floating" : lockPref === "lock_requested" ? "lock_required" : (lockStatus || null),
      lock_preference:        lockPref          || null,
      float_reason:           floatReason       || null,
      linked_lock_request_id: linkedLockRequestId || null,
      borrower_first_name:    borrowerFirst,
      borrower_last_name:     borrowerLast,
      co_borrower_first_name: coBorrowerFirst   || null,
      co_borrower_last_name:  coBorrowerLast    || null,
      property_address:       propAddress       || null,
      property_city:          propCity          || null,
      property_state:         propState         || null,
      property_zip:           propZip           || null,
      property_type:          propertyType      || null,
      occupancy_type:         occupancyType     || null,
      target_close_date:      targetClose       || null,
      income_note:            incomeNote        || "",
      property_note:          propertyNote      || "",
      assets_note:            assetsNote        || "",
      credit_note:            creditNote        || "",
      special_instructions:   specialInstructions || null,
      loan_goal:              loanGoal            || null,
      gift_funds_present:     giftFundsPresent    || null,
      donor_first_name:       donorFirstName      || null,
      donor_last_name:        donorLastName       || null,
      donor_phone:            donorPhone          || null,
      donor_email:            donorEmail          || null,
      donor_address_1:        donorAddress1       || null,
      donor_address_2:        donorAddress2       || null,
      donor_city:             donorCity           || null,
      donor_state:            donorState          || null,
      donor_zip:              donorZip            || null,
      self_employed_borrower: selfEmployed ?? null,
      doc_checklist_json:     checklistPayload,
      ready_to_submit:            readyToSubmit,
      submission_requested_at:    submissionRequestedAt || null,
      matches_1003:               matches1003,
      matches_1003_changes:       matches1003Changes || null,
      certified_at:               new Date().toISOString(),
      certified_by_name:      certLoName        || null,
      submitter_nmls:         certNmls          || null,
    };
    if (isHelpDesk) {
      payload.help_desk_sub_type    = helpDeskSubType    || null;
      payload.help_desk_description = helpDeskDescription || null;
    }
    if (isLockRequest) {
      payload.lock_requested_rate        = lockRate    ? parseFloat(lockRate)    : null;
      payload.lock_requested_price       = lockPrice   ? parseFloat(lockPrice)   : null;
      payload.lock_requested_lender      = lockLender  || null;
      payload.lock_requested_product     = lockProduct || null;
      payload.lock_period_days           = lockPeriod;
      payload.lock_requested_close_date  = lockCloseDate || null;
      payload.lock_lo_notes              = lockLoNotes   || null;
      payload.lock_pricing_confirmed_by_lo = lockChkArive && lockChkLos;
      payload.lock_pricing_confirmed_at  = new Date().toISOString();
      payload.channel_type               = channelType      || null;
      payload.compensation_type          = compensationType || null;
    }
    try {
      const res  = await fetch("/api/liftoff/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Idempotency key — server rejects duplicate submits with the same key
          "Idempotency-Key": submissionKeyRef.current,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed."); setSubmitting(false); return; }
      // Rotate key so a future re-use of the same wizard instance gets a fresh key
      submissionKeyRef.current = crypto.randomUUID();
      router.push(`/liftoff/${data.id}?submitted=1`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">Harris Capital Mortgage Group</p>
          <h1 className="mt-1 text-2xl font-extrabold text-ink">Submit Lift Off Request</h1>
        </div>
        {isDemo && (
          <span className="rounded-full bg-purple-100 border border-purple-300 px-3 py-1 text-xs font-bold text-purple-700">
            DEMO MODE
          </span>
        )}
      </div>

      <StepBar step={step} requestType={requestType} onChangeType={() => { setStep(1); setError(""); }} />

      {/* ── STEP 1 — Pick type ── */}
      {step === 1 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-ink">Step 1 — Pick Your Request Type</h2>
            {!requestType && (
              <span className="rounded-full bg-orange-50 px-3 py-0.5 text-[10px] font-bold text-orange-600 border border-orange-200">
                NO SELECTION
              </span>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {REQUEST_TYPES.map(t => (
              <button key={t.id} type="button"
                onClick={() => { setRequestType(t.id); setError(""); setDocChecked({}); }}
                className={`text-left rounded-2xl border-2 p-5 transition-all
                  ${requestType === t.id
                    ? "border-orange-400 bg-orange-50"
                    : "border-line bg-white hover:border-orange-200 hover:bg-orange-50/40"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl mt-0.5">{t.icon}</span>
                  <div className="flex-1">
                    <p className="font-bold text-ink text-sm mb-1">{t.label}</p>
                    <p className="text-xs text-muted leading-relaxed mb-3">{t.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {t.tags.map(tag => (
                        <span key={tag} className="rounded-full px-2 py-0.5 text-[10px] font-bold border bg-sand border-line text-muted">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {/* Doc count preview */}
                    <p className="mt-2 text-[10px] text-muted/60">
                      {DOC_CHECKLISTS[t.id]?.length ?? 0} docs required for this request type
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── STEP 2 — Loan + Lock ── */}
      {step === 2 && requestType && (
        <div className="space-y-6">

            {/* ARIVE lookup */}
            <div className="rounded-2xl border-2 border-[#142850] bg-[#142850]/5 p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">🔍</span>
                <div>
                  <h3 className="text-sm font-bold text-ink">ARIVE Loan Number</h3>
                  <p className="text-xs text-muted">Required. Enter the number and click Look Up to auto-fill.</p>
                </div>
              </div>
              <Field label="ARIVE Loan Number" required>
                <div className="flex gap-2">
                  <Input value={ariveLoanNumber}
                    onChange={e => { setAriveLoanNumber(e.target.value); setAriveLookupStatus("idle"); }}
                    placeholder="e.g. HCMG-DEMO-001" className="flex-1" />
                  <button type="button"
                    disabled={ariveLookupStatus === "loading" || !ariveLoanNumber.trim()}
                    onClick={handleAriveLookup}
                    className="flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold text-white
                               hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: "linear-gradient(135deg,#142850,#1a3260)" }}>
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
                <p className="mt-1.5 text-[11px] text-muted/60">
                  Can&apos;t look up yet? Type the number and continue — fill loan details manually below.
                </p>
              </Field>
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
                <div className="flex items-center gap-2 rounded-xl bg-sand border border-line px-4 py-2.5 text-sm text-muted">
                  <span>ℹ</span> ARIVE auto-fill coming soon. Fill the details below manually.
                </div>
              )}
            </div>

            {/* Lock Request — Borrower & Property (shown above pricing for lock requests) */}
            {isLockRequest && (
              <div className="rounded-2xl border border-line bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Borrower &amp; Property</h3>
                  {ariveLookupStatus === "found" && borrowerFirst && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      Auto-filled from ARIVE
                    </span>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Borrower First Name" required>
                    <Input value={borrowerFirst} readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="Borrower Last Name" required>
                    <Input value={borrowerLast} readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="Co-Borrower First">
                    <Input value={coBorrowerFirst} readOnly
                      placeholder="—"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="Co-Borrower Last">
                    <Input value={coBorrowerLast} readOnly
                      placeholder="—"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-line mt-2">
                  <Field label="Property Address" className="sm:col-span-2">
                    <Input value={propAddress} readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="City">
                    <Input value={propCity} readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="State">
                      <Input value={propState} readOnly
                        placeholder="—"
                        className="bg-sand text-muted cursor-not-allowed" />
                    </Field>
                    <Field label="ZIP">
                      <Input value={propZip} readOnly
                        placeholder="—"
                        className="bg-sand text-muted cursor-not-allowed" />
                    </Field>
                  </div>
                  <Field label="Property Type">
                    <Select value={propertyType}
                      onChange={() => {}}
                      disabled
                      options={[
                        { value: "sfr",          label: "Single Family Residence (SFR)" },
                        { value: "condo",        label: "Condo" },
                        { value: "townhome",     label: "Townhome" },
                        { value: "2_4_unit",     label: "2–4 Unit" },
                        { value: "manufactured", label: "Manufactured / Mobile" },
                        { value: "other",        label: "Other" },
                      ]} />
                  </Field>
                  <Field label="Occupancy Type">
                    <Select value={occupancyType}
                      onChange={() => {}}
                      disabled
                      options={[
                        { value: "primary",    label: "Primary Residence" },
                        { value: "secondary",  label: "Second Home" },
                        { value: "investment", label: "Investment Property" },
                      ]} />
                  </Field>
                </div>
              </div>
            )}

            {/* Lock Request — Pricing Panel */}
            {isLockRequest ? (
              <div className="rounded-2xl border-2 border-[#142850] bg-white p-6 space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-ink">Pricing from ARIVE</h3>
                    <p className="text-xs text-muted mt-0.5">
                      {ariveFieldsLocked
                        ? "Fields auto-filled from ARIVE. Confirm the pricing is current, then check both boxes below."
                        : "Look up the loan above first — rate, price, lender and product will auto-fill from ARIVE."}
                    </p>
                  </div>
                  {ariveFieldsLocked && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5 flex-shrink-0 ml-3">
                      Auto-filled from ARIVE
                    </span>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Rate %" required>
                    <Input type="number" step="0.001" min="0" value={lockRate}
                      readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="Discount Points" required hint="e.g. -0.123 = rebate, 0.500 = cost">
                    <Input type="number" step="0.001" value={lockPrice}
                      readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="Lender">
                    <Input value={lockLender}
                      readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="Product">
                    <Input value={lockProduct}
                      readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                </div>

                {/* Channel + Compensation — shown after ARIVE lookup */}
                {ariveFieldsLocked && channelType && (
                  <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-sand px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">Channel</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                        channelType.toLowerCase() === "broker"
                          ? "bg-purple-50 border-purple-200 text-purple-700"
                          : "bg-blue-50 border-blue-200 text-blue-700"
                      }`}>
                        {channelType}
                      </span>
                    </div>
                    {channelType.toLowerCase() === "broker" && compensationType && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">Compensation</span>
                        <span className="rounded-full px-2.5 py-0.5 text-xs font-bold border bg-amber-50 border-amber-200 text-amber-700">
                          {compensationType}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70 mb-2">Lock Period</p>
                  <div className="flex flex-wrap gap-4">
                    {([15, 30, 45, 60] as const).map(d => (
                      <label key={d} className={`flex items-center gap-2 cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold transition-all ${
                        lockPeriod === d ? "border-orange-400 bg-orange-50 text-ink" : "border-line bg-white text-muted hover:border-orange-200"
                      }`}>
                        <input type="radio" name="lockPeriod" checked={lockPeriod === d}
                          onChange={() => setLockPeriod(d)} className="accent-orange-500" />
                        {d} days
                      </label>
                    ))}
                  </div>
                </div>

                <Field label="Notes to Lock Desk" hint="Any special instructions, rush details, or lender portal info.">
                  <Textarea value={lockLoNotes} onChange={e => setLockLoNotes(e.target.value)}
                    placeholder="e.g. Rush — client needs lock confirmed today. Lender portal credentials on file." rows={3} />
                </Field>

                {/* Confirmations */}
                <div className="rounded-xl border border-[#142850]/20 bg-[#142850]/5 p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">Required Confirmations</p>
                  <label className="flex items-start gap-3 cursor-pointer text-sm">
                    <input type="checkbox" checked={lockChkArive} onChange={e => setLockChkArive(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-orange-500 flex-shrink-0" />
                    <span className="leading-relaxed text-ink">
                      I have run pricing in ARIVE within the last 20 minutes and the rate / price above reflects current market pricing.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer text-sm">
                    <input type="checkbox" checked={lockChkLos} onChange={e => setLockChkLos(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-orange-500 flex-shrink-0" />
                    <span className="leading-relaxed text-ink">
                      I have confirmed the pricing in the LOS (ARIVE) is updated and matches what I want to lock.
                    </span>
                  </label>
                  <p className="text-[11px] text-muted/60">Both boxes must be checked before you can continue.</p>
                </div>

                {/* Certification — inline for lock requests (no Step 3) */}
                <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">Certification</p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={certified} onChange={e => setCertified(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-orange-500 flex-shrink-0" />
                    <span className="text-sm text-ink leading-relaxed">
                      By submitting this form, I certify this file is complete and ready for the Lift Off review process.
                    </span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="NMLS #" required>
                      <Input value={certNmls} onChange={e => setCertNmls(e.target.value)} placeholder="e.g. 1234567" />
                    </Field>
                    <Field label="LO Name">
                      <Input value={certLoName} onChange={e => setCertLoName(e.target.value)} placeholder="Your full name" />
                    </Field>
                  </div>
                </div>
              </div>
            ) : (
              <>
            {/* Prior progress */}
            <div className="rounded-2xl border border-line bg-white p-6">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Prior Progress for This Loan</h3>
            </div>
            </>
            )}

            {/* Borrower & Property — for help desk, shown ABOVE loan info (hidden for lock — already shown above) */}
            {isHelpDesk && (
              <div className="rounded-2xl border border-line bg-white p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Borrower &amp; Property</h3>
                  {ariveLookupStatus === "found" && borrowerFirst && (
                    <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                      Auto-filled from ARIVE
                    </span>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Borrower First Name" required>
                    <Input value={borrowerFirst} readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="Borrower Last Name" required>
                    <Input value={borrowerLast} readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="Co-Borrower First">
                    <Input value={coBorrowerFirst} readOnly
                      placeholder="—"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="Co-Borrower Last">
                    <Input value={coBorrowerLast} readOnly
                      placeholder="—"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                </div>
              </div>
            )}

            {/* Borrower & Property — hidden for lock + help desk (shown above their own panels instead) */}
            {!isLockRequest && !isHelpDesk && <div className="rounded-2xl border border-line bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Borrower &amp; Property</h3>
                {ariveLookupStatus === "found" && borrowerFirst && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    Auto-filled from ARIVE
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Borrower First Name" required>
                  <Input value={borrowerFirst} readOnly
                    placeholder="Auto-filled from ARIVE"
                    className="bg-sand text-muted cursor-not-allowed" />
                </Field>
                <Field label="Borrower Last Name" required>
                  <Input value={borrowerLast} readOnly
                    placeholder="Auto-filled from ARIVE"
                    className="bg-sand text-muted cursor-not-allowed" />
                </Field>
                <Field label="Co-Borrower First">
                  <Input value={coBorrowerFirst} readOnly
                    placeholder="—"
                    className="bg-sand text-muted cursor-not-allowed" />
                </Field>
                <Field label="Co-Borrower Last">
                  <Input value={coBorrowerLast} readOnly
                    placeholder="—"
                    className="bg-sand text-muted cursor-not-allowed" />
                </Field>
              </div>

              {!isHelpDesk && !isLockRequest && (
                <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-line mt-2">
                  <Field label="Property Address" className="sm:col-span-2">
                    <Input value={propAddress} readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <Field label="City">
                    <Input value={propCity} readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                  <div className="grid grid-cols-2 gap-2">
                    <Field label="State">
                      <Input value={propState} readOnly
                        placeholder="—"
                        className="bg-sand text-muted cursor-not-allowed" />
                    </Field>
                    <Field label="ZIP">
                      <Input value={propZip} readOnly
                        placeholder="—"
                        className="bg-sand text-muted cursor-not-allowed" />
                    </Field>
                  </div>
                  <Field label="Property Type">
                    <Select value={propertyType}
                      onChange={() => {}}
                      disabled
                      options={[
                        { value: "sfr",          label: "Single Family Residence (SFR)" },
                        { value: "condo",        label: "Condo" },
                        { value: "townhome",     label: "Townhome" },
                        { value: "2_4_unit",     label: "2–4 Unit" },
                        { value: "manufactured", label: "Manufactured / Mobile" },
                        { value: "other",        label: "Other" },
                      ]} />
                  </Field>
                  <Field label="Occupancy Type">
                    <Select value={occupancyType}
                      onChange={() => {}}
                      disabled
                      options={[
                        { value: "primary",    label: "Primary Residence" },
                        { value: "secondary",  label: "Second Home" },
                        { value: "investment", label: "Investment Property" },
                      ]} />
                  </Field>
                </div>
              )}
            </div>}

            {/* Loan details — hidden for lock requests (pricing already captured above) */}
            {!isLockRequest && <div className="rounded-2xl border border-line bg-white p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Loan Information</h3>
                {ariveLookupStatus === "found" && (
                  <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
                    Auto-filled from ARIVE
                  </span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Loan Purpose">
                  <Select value={loanPurpose}
                    onChange={() => {}}
                    disabled
                    options={[
                      { value: "purchase",  label: "Purchase" },
                      { value: "refinance", label: "Refinance" },
                    ]} />
                </Field>
                <Field label="Loan Program">
                  <Select value={loanProgram}
                    onChange={() => {}}
                    disabled
                    options={[
                      { value: "conventional",  label: "Conventional" },
                      { value: "fha",           label: "FHA" },
                      { value: "va",            label: "VA" },
                      { value: "usda",          label: "USDA / Rural" },
                      { value: "non_qm",        label: "Non-QM / DSCR" },
                      { value: "heloc",         label: "HELOC" },
                      { value: "construction",  label: "Construction" },
                      { value: "renovation",    label: "Renovation" },
                      { value: "other",         label: "Other" },
                    ]} />
                </Field>
                <Field label="Loan Amount">
                  <Input type="number" min="0" step="1000" value={loanAmount}
                    readOnly
                    placeholder="Auto-filled from ARIVE"
                    className="bg-sand text-muted cursor-not-allowed" />
                </Field>
                {(loanPurpose === "purchase" || loanProgram === "heloc" || purchasePrice) && (
                  <Field label="Purchase / Appraised Value">
                    <Input type="number" min="0" step="1000" value={purchasePrice}
                      readOnly
                      placeholder="Auto-filled from ARIVE"
                      className="bg-sand text-muted cursor-not-allowed" />
                  </Field>
                )}
                {(loanPurpose === "purchase" || earnestMoneyDeposit) && (
                  <Field label="Earnest Money Deposit" hint="Auto-filled from ARIVE">
                    <Input type="number" min="0" step="100" value={earnestMoneyDeposit}
                      onChange={e => setEarnestMoneyDeposit(e.target.value)}
                      placeholder="Auto-filled from ARIVE"
                      className={ariveFieldsLocked && earnestMoneyDeposit ? "bg-sand text-muted cursor-not-allowed" : ""} />
                  </Field>
                )}
                {sellerCredit !== "" && (
                  <Field label="Seller Credit" hint="Auto-filled from ARIVE">
                    <Input type="number" min="0" step="100" value={sellerCredit}
                      onChange={e => setSellerCredit(e.target.value)}
                      placeholder="Auto-filled from ARIVE"
                      className={ariveFieldsLocked && sellerCredit ? "bg-sand text-muted cursor-not-allowed" : ""} />
                  </Field>
                )}
                <Field label="Rate %">
                  <Input type="number" step="0.001" min="0" value={lockRate}
                    readOnly
                    placeholder="Auto-filled from ARIVE"
                    className="bg-sand text-muted cursor-not-allowed" />
                </Field>
                <Field label="Discount Points" hint="e.g. -0.123 = rebate, 0.500 = cost">
                  <Input type="number" step="0.001" value={lockPrice}
                    readOnly
                    placeholder="Auto-filled from ARIVE"
                    className="bg-sand text-muted cursor-not-allowed" />
                </Field>
                <Field label="Lender">
                  <Input value={lockLender}
                    readOnly
                    placeholder="Auto-filled from ARIVE"
                    className="bg-sand text-muted cursor-not-allowed" />
                </Field>
                <Field label="Product">
                  <Input value={lockProduct}
                    readOnly
                    placeholder="Auto-filled from ARIVE"
                    className="bg-sand text-muted cursor-not-allowed" />
                </Field>
              </div>

              {/* Channel + Compensation badges — shown after ARIVE lookup */}
              {ariveFieldsLocked && channelType && (
                <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line bg-sand px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">Channel</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${
                      channelType.toLowerCase() === "broker"
                        ? "bg-purple-50 border-purple-200 text-purple-700"
                        : "bg-blue-50 border-blue-200 text-blue-700"
                    }`}>
                      {channelType}
                    </span>
                  </div>
                  {channelType.toLowerCase() === "broker" && compensationType && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">Compensation</span>
                      <span className="rounded-full px-2.5 py-0.5 text-xs font-bold border bg-amber-50 border-amber-200 text-amber-700">
                        {compensationType}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>}

            {/* Help Desk — Sub-type + Description */}
            {isHelpDesk && (
              <div className="rounded-2xl border-2 border-[#142850] bg-white p-6 space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-ink">🛎 Help Desk Request</h3>
                  <p className="text-xs text-muted mt-0.5">Select the sub-type and describe the issue in detail. Minimum 100 characters so ops can understand what help is needed.</p>
                </div>
                <Field label="Sub-Type" required>
                  <Select
                    value={helpDeskSubType}
                    onChange={e => setHelpDeskSubType(e.target.value)}
                    options={[
                      { value: "aus_underwriting",    label: "AUS / Underwriting Question" },
                      { value: "suspense_conditions",  label: "Suspense / Conditions" },
                      { value: "restructure_loan",     label: "Restructure Loan" },
                      { value: "ptd_ptf_conditions",   label: "PTD / PTF Conditions" },
                      { value: "appraisal_issue",      label: "Appraisal Issue" },
                      { value: "title_closing_issue",  label: "Title / Closing Issue" },
                      { value: "income_asset_question",label: "Income / Asset Question" },
                      { value: "credit_issue",         label: "Credit Issue" },
                      { value: "exception_request",    label: "Exception Request" },
                      { value: "general_help",         label: "General Help" },
                    ]}
                  />
                </Field>
                <Field label="Describe the Issue" required hint={`${helpDeskDescription.length} / 100 min characters`}>
                  <Textarea
                    value={helpDeskDescription}
                    onChange={e => setHelpDeskDescription(e.target.value)}
                    rows={6}
                    placeholder="Describe the issue in detail — what loan, what problem, what you've already tried, and what help you need from ops."
                  />
                  {helpDeskDescription.trim().length > 0 && helpDeskDescription.trim().length < 100 && (
                    <p className="mt-1.5 text-[11px] text-orange-600 font-semibold">
                      {100 - helpDeskDescription.trim().length} more characters needed
                    </p>
                  )}
                  {helpDeskDescription.trim().length >= 100 && (
                    <p className="mt-1.5 text-[11px] text-green-600 font-semibold">✓ Description looks good</p>
                  )}
                </Field>

                {/* Certification — inline for help desk (no Step 3) */}
                <div className="rounded-xl border-2 border-orange-200 bg-orange-50 p-4 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">Certification</p>
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input type="checkbox" checked={certified} onChange={e => setCertified(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded accent-orange-500 flex-shrink-0" />
                    <span className="text-sm text-ink leading-relaxed">
                      By submitting this form, I certify this file is complete and ready for the Lift Off review process.
                    </span>
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="NMLS #" required>
                      <Input value={certNmls} onChange={e => setCertNmls(e.target.value)} placeholder="e.g. 1234567" />
                    </Field>
                    <Field label="LO Name">
                      <Input value={certLoName} onChange={e => setCertLoName(e.target.value)} placeholder="Your full name" />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* Self-Employed / 1099 */}
            {isSubmission && (
              <div className="rounded-2xl border border-line bg-white p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-ink">Is any borrower self-employed or 1099?</h3>
                  <p className="text-xs text-muted/70 italic mt-0.5">Required — determines which income documents are needed.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelfEmployed(true)}
                    className={`rounded-full px-5 py-2 text-sm font-bold border-2 transition-colors ${
                      selfEmployed === true
                        ? "bg-[#142850] border-[#142850] text-white"
                        : "bg-white border-line text-muted hover:border-[#142850]/40"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelfEmployed(false)}
                    className={`rounded-full px-5 py-2 text-sm font-bold border-2 transition-colors ${
                      selfEmployed === false
                        ? "bg-[#142850] border-[#142850] text-white"
                        : "bg-white border-line text-muted hover:border-[#142850]/40"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            )}

            {/* Lock / Float Preference */}
            {!isHelpDesk && !isLockRequest && (
              <div className="rounded-2xl border border-line bg-white p-6">
                <LockPreferenceField
                  value={lockPref}
                  onChange={setLockPref}
                  floatReason={floatReason}
                  onFloatReasonChange={setFloatReason}
                  required={lockRequired}
                  prefill={{
                    ariveLoanNumber: ariveLoanNumber,
                    borrowerFirst:   borrowerFirst,
                    borrowerLast:    borrowerLast,
                    coBorrowerFirst: coBorrowerFirst,
                    loanAmount:      loanAmount,
                    purchasePrice:   purchasePrice,
                    loanType:        loanPurpose && loanProgram ? `${loanPurpose}_${loanProgram}` : loanPurpose || "",
                    targetClose:     targetClose,
                    propAddress:     propAddress,
                    propCity:        propCity,
                    propState:       propState,
                    propZip:         propZip,
                  }}
                  linkedLockRequestId={linkedLockRequestId}
                  onLockRequestLinked={setLinkedLockRequestId}
                />
              </div>
            )}

            {/* Certification — inline for register_disclosure and disclosure_only (no Step 3) */}
            {!isLockRequest && !isHelpDesk && !isSubmission && (
              <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6 space-y-3">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">Certification</p>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={certified} onChange={e => setCertified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded accent-orange-500 flex-shrink-0" />
                  <span className="text-sm text-ink leading-relaxed">
                    By submitting this form, I certify this file is complete and ready for the Lift Off review process.
                  </span>
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="NMLS #" required>
                    <Input value={certNmls} onChange={e => setCertNmls(e.target.value)} placeholder="e.g. 1234567" />
                  </Field>
                  <Field label="LO Name">
                    <Input value={certLoName} onChange={e => setCertLoName(e.target.value)} placeholder="Your full name" />
                  </Field>
                </div>
              </div>
            )}

        </div>
      )}

      {/* ── STEP 3 — IPAC / Docs (Submission only) ── */}
      {step === 3 && requestType && (
        <div className="space-y-6">

            {/* 1003 Matches Registration */}
            {isSubmission && (
              <div className="rounded-2xl border-2 border-[#142850] bg-white p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-ink">1003 Matches Registration</h3>
                  <p className="text-xs text-muted mt-1">
                    Do income, property, assets, credit, and declarations match?
                  </p>
                  <p className="text-xs text-muted/70 mt-1 italic">
                    If they do not match it will cause delays — please explain up front for a clean submission.
                  </p>
                </div>

                {/* Toggle */}
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-bold ${matches1003 === false ? "text-ink" : "text-muted/40"}`}>No</span>
                  <button
                    type="button"
                    onClick={() => setMatches1003(prev => prev === true ? false : true)}
                    className={`relative inline-flex h-7 w-14 flex-shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400/40 ${
                      matches1003 === true
                        ? "bg-[#142850] border-[#142850]"
                        : "bg-line border-line"
                    }`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
                      matches1003 === true ? "translate-x-7" : "translate-x-0.5"
                    }`} />
                  </button>
                  <span className={`text-sm font-bold ${matches1003 === true ? "text-ink" : "text-muted/40"}`}>Yes</span>
                </div>

                {/* What changed — only when No */}
                {matches1003 === false && (
                  <Field label="What Changed From Time of Registration?" required>
                    <Textarea
                      value={matches1003Changes}
                      onChange={e => setMatches1003Changes(e.target.value)}
                      rows={4}
                      placeholder="Describe what changed — income, property, assets, credit, or declarations…"
                    />
                  </Field>
                )}
              </div>
            )}

            {/* IPAC Notes */}
            {isSubmission && <div className="rounded-2xl border-2 border-[#142850] bg-white p-6 space-y-4">
              <div className="text-center pb-2 border-b border-line">
                <h3 className="text-lg font-extrabold text-ink">IPAC</h3>
                <p className="text-xs font-semibold text-muted italic mt-0.5">Summary on Income Property Assets &amp; Credit</p>
                <p className="text-xs font-bold text-ink mt-1">Being detailed provides a faster closing and better experience!</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Income" required hint="Employment type, income sources, YTD, gaps, etc.">
                  <Textarea value={incomeNote} onChange={e => setIncomeNote(e.target.value)} rows={4}
                    placeholder="Summary of income used on this loan" />
                </Field>
                <Field label="Property" required hint="Property type, condition, occupancy, appraisal status.">
                  <Textarea value={propertyNote} onChange={e => setPropertyNote(e.target.value)} rows={4}
                    placeholder="Summary of property type, value and condition, occupancy and other property underwriting items" />
                </Field>
                <Field label="Assets" required hint="Checking, savings, gift funds, sourcing notes.">
                  <Textarea value={assetsNote} onChange={e => setAssetsNote(e.target.value)} rows={4}
                    placeholder="Summary of assets being used and other asset underwriting items" />
                </Field>
                <Field label="Credit" required hint="Score, tradelines, derogatory items, explanations.">
                  <Textarea value={creditNote} onChange={e => setCreditNote(e.target.value)} rows={4}
                    placeholder="Summary of credit profile and issues" />
                </Field>
              </div>
              <div className="pt-2 border-t border-line space-y-1">
                <Field label="What is the client hoping to accomplish with this loan?" required
                  hint="If this is a purchase we know the client is buying a new home — elaborate (relocation, job change, divorce buyout, etc.)">
                  <Textarea value={loanGoal} onChange={e => setLoanGoal(e.target.value)} rows={4}
                    placeholder="And/Or is there anything unique that could impact the process?" />
                </Field>
              </div>
            </div>}

            {/* Gift Funds */}
            {isSubmission && (
              <div className="rounded-2xl border border-line bg-white p-6 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Gift Funds</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Are Gift Funds Present?" required>
                    <Select
                      value={giftFundsPresent}
                      onChange={e => setGiftFundsPresent(e.target.value as "yes" | "no" | "")}
                      options={[
                        { value: "no",  label: "No" },
                        { value: "yes", label: "Yes" },
                      ]}
                    />
                  </Field>

                  {giftFundsPresent === "yes" && (
                    <>
                      <Field label="Donor Name" required>
                        <div className="flex gap-2">
                          <Input value={donorFirstName} onChange={e => setDonorFirstName(e.target.value)} placeholder="First" />
                          <Input value={donorLastName}  onChange={e => setDonorLastName(e.target.value)}  placeholder="Last" />
                        </div>
                      </Field>
                      <Field label="Donor Phone" required>
                        <Input value={donorPhone} onChange={e => setDonorPhone(e.target.value)} placeholder="(555) 555-5555" />
                      </Field>
                      <Field label="Donor Email" required>
                        <Input type="email" value={donorEmail} onChange={e => setDonorEmail(e.target.value)} placeholder="donor@email.com" />
                      </Field>
                      <Field label="Donor Address" required className="sm:col-span-2">
                        <div className="space-y-2">
                          <Input value={donorAddress1} onChange={e => setDonorAddress1(e.target.value)} placeholder="Address Line 1" />
                          <Input value={donorAddress2} onChange={e => setDonorAddress2(e.target.value)} placeholder="Address Line 2" />
                          <div className="grid grid-cols-3 gap-2">
                            <Input value={donorCity}  onChange={e => setDonorCity(e.target.value)}  placeholder="City" className="col-span-1" />
                            <Input value={donorState} onChange={e => setDonorState(e.target.value)} placeholder="State" maxLength={2} />
                            <Input value={donorZip}   onChange={e => setDonorZip(e.target.value)}   placeholder="Zip Code" maxLength={10} />
                          </div>
                        </div>
                      </Field>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Document Checklist */}
            {isSubmission && (
              <>
                <NaReasonModal
                  open={pendingNaModal !== null}
                  docLabel={docItems.find(d => d.id === pendingNaModal)?.label ?? ""}
                  onConfirm={note => {
                    if (pendingNaModal) {
                      setDocChecked(prev => ({ ...prev, [pendingNaModal]: { checked: false, na: true, naNote: note } }));
                    }
                    setPendingNaModal(null);
                  }}
                  onCancel={() => setPendingNaModal(null)}
                />
                <DocChecklist
                  items={docItems}
                  checked={docChecked}
                  onCheck={id => setDocChecked(prev => {
                    const cur = prev[id] ?? { checked: false, na: false, naNote: "" };
                    return { ...prev, [id]: { checked: !cur.checked, na: false, naNote: "" } };
                  })}
                  onNa={id => setPendingNaModal(id)}
                  isDemo={isDemo}
                />
              </>
            )}

            {/* Special Instructions */}
            <div className="rounded-2xl border border-line bg-white p-6">
              <Field label="Special Instructions"
                hint="Rush details, unusual situations, disclosure timing, or anything the Lift Off team must know.">
                <Textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)}
                  rows={4}
                  placeholder="Rush details, unusual situations, disclosure timing, or anything the Lift Off team must know (min. 60 characters or 20 words)." />
              </Field>
            </div>

            {/* Ready to Submit */}
            <div className="rounded-2xl border-2 border-[#142850] bg-white p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-ink">Ready to Submit Loan</h3>
                <p className="text-xs text-muted/70 italic mt-0.5">
                  Please click the submit &quot;action&quot; button below
                </p>
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-4">
                <span className={`text-sm font-bold ${!readyToSubmit ? "text-ink" : "text-muted/40"}`}>No</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !readyToSubmit;
                    setReadyToSubmit(next);
                    setSubmissionRequestedAt(next ? new Date().toISOString() : null);
                  }}
                  className={`relative inline-flex h-7 w-14 flex-shrink-0 rounded-full border-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-400/40 ${
                    readyToSubmit ? "bg-[#142850] border-[#142850]" : "bg-line border-line"
                  }`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 mt-0.5 ${
                    readyToSubmit ? "translate-x-7" : "translate-x-0.5"
                  }`} />
                </button>
                <span className={`text-sm font-bold ${readyToSubmit ? "text-ink" : "text-muted/40"}`}>Yes</span>
              </div>

              {/* Timestamp */}
              {submissionRequestedAt && (
                <div className="rounded-xl border border-[#142850]/20 bg-[#142850]/5 px-4 py-3 space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">Submission Requested Timestamp</p>
                  <p className="text-sm font-bold text-ink">
                    {new Date(submissionRequestedAt).toLocaleDateString("en-US", {
                      month: "2-digit", day: "2-digit", year: "numeric",
                    })} at {new Date(submissionRequestedAt).toLocaleTimeString("en-US", {
                      hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Certification */}
            <div className="rounded-2xl border-2 border-orange-200 bg-orange-50 p-6 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Certification</h3>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={certified} onChange={e => setCertified(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded accent-orange-500 flex-shrink-0" />
                <span className="text-sm text-ink leading-relaxed">
                  By submitting this form, I certify this file is complete and ready for the Lift Off review process.
                </span>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="NMLS #" required>
                  <Input value={certNmls} onChange={e => setCertNmls(e.target.value)} placeholder="e.g. 1234567" />
                </Field>
                <Field label="LO Name">
                  <Input value={certLoName} onChange={e => setCertLoName(e.target.value)} placeholder="Your full name" />
                </Field>
              </div>
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
          {/* Continue — step 1 for all types; step 2 only for submission (has a step 3) */}
          {(step === 1 || (isSubmission && step === 2)) && (
            <button type="button" onClick={next}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              Continue →
            </button>
          )}
          {/* Lock request: step 2 is final */}
          {isLockRequest && step === 2 && (
            <button type="submit"
              disabled={submitting || (!isDemo && (!certified || !certNmls.trim()))}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              {submitting ? "Submitting…" : "Submit Lock Request 🔒"}
            </button>
          )}
          {/* Help desk: step 2 is final */}
          {isHelpDesk && step === 2 && (
            <button type="submit"
              disabled={submitting || (!isDemo && (!certified || !certNmls.trim()))}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              {submitting ? "Submitting…" : "Submit Help Desk Request 🛎"}
            </button>
          )}
          {/* Register + Disclosure and Disclosure Only: step 2 is final */}
          {!isLockRequest && !isHelpDesk && !isSubmission && step === 2 && (
            <button type="submit"
              disabled={submitting || (!isDemo && (!certified || !certNmls.trim()))}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              {submitting ? "Submitting…" : "Submit Lift Off Request 🚀"}
            </button>
          )}
          {/* Submission: step 3 is final */}
          {isSubmission && step === 3 && (
            <button type="submit"
              disabled={submitting || (!isDemo && (!certified || (pendingDocs > 0)))}
              className="rounded-xl px-6 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
              {submitting
                ? "Submitting…"
                : (!isDemo && pendingDocs > 0)
                ? `Resolve ${pendingDocs} Pending Item${pendingDocs > 1 ? "s" : ""} to Submit`
                : "Submit Lift Off Request 🚀"}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
