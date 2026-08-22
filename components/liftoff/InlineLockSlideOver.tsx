"use client";

import { useState, useEffect } from "react";

interface InlineLockSlideOverProps {
  open: boolean;
  onClose: () => void;
  onSubmitted: (lockRequestId: string) => void;
  // Pre-fill data from current wizard state
  prefill: {
    ariveLoanNumber:   string;
    borrowerFirst:     string;
    borrowerLast:      string;
    coBorrowerFirst:   string;
    loanAmount:        string;
    purchasePrice:     string;
    loanType:          string;
    targetClose:       string;
    propAddress:       string;
    propCity:          string;
    propState:         string;
    propZip:           string;
  };
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input {...props}
      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white
                 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400/60
                 focus:border-orange-400/60 backdrop-blur-sm" />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea rows={3} {...props}
      className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white
                 placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-orange-400/60
                 focus:border-orange-400/60 resize-none backdrop-blur-sm" />
  );
}

function Field({ label, required, children, hint }: {
  label: string; required?: boolean; children: React.ReactNode; hint?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-white/60 mb-1.5">
        {label}{required && <span className="text-orange-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-white/40">{hint}</p>}
    </div>
  );
}

export function InlineLockSlideOver({ open, onClose, onSubmitted, prefill }: InlineLockSlideOverProps) {
  const [rate, setRate]             = useState("");
  const [price, setPrice]           = useState("");
  const [apr, setApr]               = useState("");
  const [monthlyPmt, setMonthlyPmt] = useState("");
  const [lender, setLender]         = useState("");
  const [product, setProduct]       = useState("");
  const [period, setPeriod]         = useState<15|30|45|60>(30);
  const [closeDate, setCloseDate]   = useState("");
  const [loNotes, setLoNotes]       = useState("");
  const [chkArive, setChkArive]     = useState(false);
  const [chkLos, setChkLos]         = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // Reset + pre-fill when opened
  useEffect(() => {
    if (!open) return;
    setRate(""); setPrice(""); setApr(""); setMonthlyPmt("");
    setLender(""); setProduct(""); setPeriod(30);
    setCloseDate(prefill.targetClose || "");
    setLoNotes(""); setChkArive(false); setChkLos(false);
    setError("");
  }, [open, prefill.targetClose]);

  const canSubmit = rate.trim() && price.trim() && chkArive && chkLos && !submitting;

  async function handleSubmit() {
    if (!canSubmit) return;
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/liftoff/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_type:              "lock_request",
          arive_loan_number:         prefill.ariveLoanNumber || null,
          borrower_first_name:       prefill.borrowerFirst   || "—",
          borrower_last_name:        prefill.borrowerLast    || "—",
          co_borrower_first_name:    prefill.coBorrowerFirst || null,
          loan_type:                 prefill.loanType        || null,
          loan_amount:               prefill.loanAmount      ? parseFloat(prefill.loanAmount)    : null,
          purchase_price:            prefill.purchasePrice   ? parseFloat(prefill.purchasePrice) : null,
          property_address:          prefill.propAddress     || null,
          property_city:             prefill.propCity        || null,
          property_state:            prefill.propState       || null,
          property_zip:              prefill.propZip         || null,
          lock_requested_rate:       parseFloat(rate),
          lock_requested_price:      parseFloat(price),
          lock_requested_apr:        apr        ? parseFloat(apr)        : null,
          lock_requested_monthly_pmt: monthlyPmt ? parseFloat(monthlyPmt) : null,
          lock_requested_lender:     lender     || null,
          lock_requested_product:    product    || null,
          lock_period_days:          period,
          lock_requested_close_date: closeDate  || null,
          lock_lo_notes:             loNotes    || null,
          lock_pricing_confirmed_by_lo: true,
          lock_pricing_confirmed_at:    new Date().toISOString(),
          // Link back to parent by ARIVE # — wired up when parent submits
          parent_arive_loan_number:  prefill.ariveLoanNumber || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Submission failed."); setSubmitting(false); return; }
      onSubmitted(data.id);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col shadow-2xl"
        style={{ background: "linear-gradient(160deg,#0f1e3d 0%,#142850 60%,#1a3260 100%)" }}>

        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 px-6 py-5 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20 text-base">🔒</span>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Lock Desk Request</p>
            </div>
            <h2 className="text-xl font-extrabold text-white">Request Rate Lock</h2>
            <p className="text-xs text-white/50 mt-0.5">
              {prefill.borrowerFirst} {prefill.borrowerLast}
              {prefill.ariveLoanNumber ? ` · ARIVE #${prefill.ariveLoanNumber}` : ""}
            </p>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60
                       hover:bg-white/20 hover:text-white transition-colors text-lg leading-none">
            ×
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">

          {/* Pre-fill summary */}
          {(prefill.ariveLoanNumber || prefill.loanAmount) && (
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">Pre-filled from your request</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-white/70 mt-1">
                {prefill.ariveLoanNumber && <span>ARIVE # {prefill.ariveLoanNumber}</span>}
                {prefill.loanAmount      && <span>Loan: ${parseFloat(prefill.loanAmount).toLocaleString()}</span>}
                {prefill.propCity        && <span>{prefill.propCity}, {prefill.propState}</span>}
                {prefill.targetClose     && <span>Close: {prefill.targetClose}</span>}
              </div>
            </div>
          )}

          {/* Pricing */}
          <div className="space-y-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40">Pricing from ARIVE</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Rate %" required>
                <Input type="number" step="0.001" min="0" value={rate}
                  onChange={e => setRate(e.target.value)} placeholder="e.g. 6.875" />
              </Field>
              <Field label="Price / Points" required hint="100.000 = par">
                <Input type="number" step="0.001" value={price}
                  onChange={e => setPrice(e.target.value)} placeholder="e.g. 99.500" />
              </Field>
              <Field label="APR %">
                <Input type="number" step="0.001" min="0" value={apr}
                  onChange={e => setApr(e.target.value)} placeholder="e.g. 7.024" />
              </Field>
              <Field label="Est. Monthly Pmt">
                <Input type="number" step="1" min="0" value={monthlyPmt}
                  onChange={e => setMonthlyPmt(e.target.value)} placeholder="e.g. 2850" />
              </Field>
              <Field label="Lender">
                <Input value={lender} onChange={e => setLender(e.target.value)} placeholder="e.g. UWM" />
              </Field>
              <Field label="Product">
                <Input value={product} onChange={e => setProduct(e.target.value)} placeholder="e.g. 30-Yr Fixed Conv." />
              </Field>
            </div>
          </div>

          {/* Lock Period */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/40 mb-3">Lock Period</p>
            <div className="flex gap-2 flex-wrap">
              {([15, 30, 45, 60] as const).map(d => (
                <button key={d} type="button"
                  onClick={() => setPeriod(d)}
                  className={`rounded-xl border px-4 py-2 text-sm font-bold transition-all ${
                    period === d
                      ? "border-orange-400 bg-orange-500/20 text-orange-300"
                      : "border-white/15 bg-white/5 text-white/50 hover:border-white/30 hover:text-white/80"
                  }`}>
                  {d} days
                </button>
              ))}
            </div>
          </div>

          {/* Dates + Notes */}
          <div className="space-y-4">
            <Field label="Requested Close Date">
              <Input type="date" value={closeDate} onChange={e => setCloseDate(e.target.value)} />
            </Field>
            <Field label="Notes to Lock Desk" hint="Rush details, lender portal info, special instructions.">
              <Textarea value={loNotes} onChange={e => setLoNotes(e.target.value)}
                placeholder="e.g. Rush — client needs lock confirmed by EOD." />
            </Field>
          </div>

          {/* Confirmations */}
          <div className="rounded-xl border border-orange-400/30 bg-orange-500/10 p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-300">
              Required Confirmations — Both must be checked
            </p>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={chkArive} onChange={e => setChkArive(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-orange-500" />
              <span className="text-sm text-white/80 leading-relaxed">
                I have run pricing in ARIVE within the last 20 minutes and the rate / price above reflects current market pricing.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={chkLos} onChange={e => setChkLos(e.target.checked)}
                className="mt-0.5 h-4 w-4 flex-shrink-0 accent-orange-500" />
              <span className="text-sm text-white/80 leading-relaxed">
                I have confirmed the pricing in the LOS (ARIVE) is updated and matches what I want to lock.
              </span>
            </label>
          </div>

          <p className="text-[11px] text-white/40 leading-relaxed">
            By submitting, you are requesting the lock desk execute this lock at the pricing shown above.
            Actual locked pricing may differ slightly based on market conditions at time of lock.
          </p>

          {error && (
            <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="border-t border-white/10 px-6 py-4 flex gap-3 flex-shrink-0">
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="flex-1 rounded-xl py-3 text-sm font-bold text-white transition-all
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:opacity-90 active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}>
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                Submitting…
              </span>
            ) : "Submit Lock Request →"}
          </button>
          <button onClick={onClose}
            className="rounded-xl border border-white/20 px-5 py-3 text-sm font-semibold text-white/60
                       hover:bg-white/10 hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}
