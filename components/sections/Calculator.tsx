"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Disclosure } from "@/components/ui/Disclosure";
import {
  calculateMortgageEstimate,
  generateAmortizationSchedule,
  formatCurrency,
  type LoanType,
} from "@/lib/calculators";
import { formatPhone } from "@/lib/format";
import { submitLead, utmsToPayload } from "@/lib/lead";
import { getStoredUtms } from "@/lib/utm";
import { getSessionMeta } from "@/lib/tracker";

const LICENSED_STATES = [
  { code: "FL", label: "Florida (FL)" },
  { code: "TX", label: "Texas (TX)" },
  { code: "GA", label: "Georgia (GA)" },
  { code: "NV", label: "Nevada (NV)" },
  { code: "CO", label: "Colorado (CO)" },
  { code: "VA", label: "Virginia (VA)" },
  { code: "DC", label: "Washington DC (DC)" },
  { code: "MD", label: "Maryland (MD)" },
  { code: "CA", label: "California (CA)" },
  { code: "MS", label: "Mississippi (MS)" },
];

const SMS_CONSENT_TEXT =
  "By submitting this form, I agree to be contacted by Harris Capital Mortgage Group, LLC (NMLS# 1918223) regarding my mortgage inquiry. I consent to receive calls, texts, and emails. Message and data rates may apply. Reply STOP to opt out of texts at any time.";

// Loan type presets
const LOAN_PRESETS: Record<LoanType, { label: string; downMin: number; defaultDown: number; note?: string }> = {
  conventional: { label: "Conventional",  downMin: 3,   defaultDown: 20  },
  fha:          { label: "FHA",           downMin: 3.5, defaultDown: 3.5, note: "Includes annual MIP (0.55%)" },
  va:           { label: "VA",            downMin: 0,   defaultDown: 0,   note: "0% down · No monthly MIP" },
  usda:         { label: "USDA",          downMin: 0,   defaultDown: 0,   note: "Includes guarantee fee (0.35%/yr)" },
};

export function Calculator({ heading, subheading, seoSlug }: { heading?: string; subheading?: string; seoSlug?: string } = {}) {
  const [loanType, setLoanType]   = useState<LoanType>("conventional");
  const [calc, setCalc] = useState({
    homePrice:          425000,
    downPaymentPercent: 20,
    annualRatePercent:  6.375,
    loanTermYears:      30,
    annualTaxes:        5100,
    annualInsurance:    1913,
    monthlyHoa:         0,
  });
  const [showAdvanced,    setShowAdvanced]    = useState(false);
  const [showAmortization, setShowAmortization] = useState(false);

  // Gate state
  const [unlocked,       setUnlocked]       = useState(false);
  const [firstName,      setFirstName]      = useState("");
  const [email,          setEmail]          = useState("");
  const [phone,          setPhone]          = useState("");
  const [propertyState,  setPropertyState]  = useState("");
  const [smsConsent,     setSmsConsent]     = useState(false);
  const [errors,         setErrors]         = useState<Partial<Record<"firstName"|"email"|"phone"|"propertyState"|"smsConsent", string>>>({});
  const [submitting,     setSubmitting]     = useState(false);
  const [submitError,    setSubmitError]    = useState("");

  const est = useMemo(() => calculateMortgageEstimate({ ...calc, loanType }), [calc, loanType]);

  const amortRows = useMemo(() =>
    showAmortization ? generateAmortizationSchedule({ ...calc, loanType }) : [],
  [calc, loanType, showAmortization]);

  const cashToClose = {
    low:  Math.round(est.downPaymentAmount + calc.homePrice * 0.02),
    high: Math.round(est.downPaymentAmount + calc.homePrice * 0.03),
  };

  function set<K extends keyof typeof calc>(key: K, val: (typeof calc)[K]) {
    setCalc((c) => ({ ...c, [key]: val }));
  }

  function switchLoanType(lt: LoanType) {
    setLoanType(lt);
    const preset = LOAN_PRESETS[lt];
    // Always snap to the loan type's default down payment on tab switch
    setCalc((c) => ({
      ...c,
      downPaymentPercent: preset.defaultDown,
    }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!firstName.trim()) e.firstName = "Enter your first name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email.";
    if (phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit phone number.";
    if (!propertyState) e.propertyState = "Select your property state.";
    if (!smsConsent) e.smsConsent = "Consent is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleUnlock() {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    const meta = getSessionMeta();
    const result = await submitLead({
      firstName: firstName.trim(),
      email: email.trim(),
      phone,
      smsConsent: true,
      smsConsentText: SMS_CONSENT_TEXT,
      smsConsentTimestamp: new Date().toISOString(),
      source: seoSlug ? "seo" : "home-calculator",
      seoSlug,
      funnelType: `${loanType}-calculator`,
      propertyState: propertyState || undefined,
      estimatedMonthlyPayment: Math.round(est.totalMonthlyPayment),
      ...utmsToPayload(getStoredUtms()),
      sessionId: meta.sessionId,
      entryPage: meta.entryPage,
      referrer: meta.referrer,
      device: meta.device,
    });
    setSubmitting(false);
    if (result.success) setUnlocked(true);
    else setSubmitError(result.error ?? "Something went wrong. Please try again.");
  }

  const preset = LOAN_PRESETS[loanType];
  const showMip = est.monthlyMip > 0;

  return (
    <section id="calculator" className="section-pad bg-white">
      <div className="container-shell grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left */}
        <div>
          <SectionEyebrow>Mortgage Calculator</SectionEyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink lg:text-5xl">
            {heading ?? "See your payment before you fall in love"}
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted">
            {subheading ?? "Adjust the numbers and your estimate updates instantly. No forms, no commitment, just the math, right now."}
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Full PITI breakdown — Principal, Interest, Taxes & Insurance",
              "FHA, VA, USDA & Conventional loan types",
              "Complete amortization schedule included",
            ].map((b) => (
              <li key={b} className="flex items-center gap-3 text-sm font-semibold text-muted">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-white text-xs" style={{ background: "var(--ok-gradient)" }}>✓</span>
                {b}
              </li>
            ))}
          </ul>
          <Link href="/get-started" className="primary-button mt-8 inline-flex">
            Get my personalized estimate →
          </Link>
        </div>

        {/* Right card */}
        <div className="glass-card p-6 lg:p-8">

          {/* ── Loan type tabs ─────────────────────────────────────── */}
          <div className="mb-6">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted/70">Loan Type</p>
            <div className="flex gap-1 rounded-xl border border-line bg-sand p-1">
              {(Object.keys(LOAN_PRESETS) as LoanType[]).map((lt) => (
                <button
                  key={lt}
                  onClick={() => switchLoanType(lt)}
                  className={`flex-1 rounded-lg py-2 text-xs font-bold transition-all ${
                    loanType === lt
                      ? "text-white shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                  style={loanType === lt ? { background: "var(--ok-gradient)" } : {}}
                >
                  {LOAN_PRESETS[lt].label}
                </button>
              ))}
            </div>
            {preset.note && (
              <p className="mt-1.5 text-[11px] text-accent font-semibold">{preset.note}</p>
            )}
          </div>

          <div className="space-y-6">
            {/* Home price */}
            <RangeField label="Home price" display={formatCurrency(calc.homePrice)} value={calc.homePrice} min={100000} max={2000000} step={5000} onChange={(v) => set("homePrice", v)} />

            {/* Down payment */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Down payment</span>
                <span className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-accent">
                  {calc.downPaymentPercent}% = {formatCurrency(est.downPaymentAmount)}
                </span>
              </div>
              <input
                type="range"
                min={preset.downMin}
                max={50}
                step={0.5}
                value={Math.max(calc.downPaymentPercent, preset.downMin)}
                onChange={(e) => set("downPaymentPercent", Number(e.target.value))}
                className="range-brand"
              />
              {loanType === "fha" && calc.downPaymentPercent < 10 && (
                <p className="mt-1 text-[11px] text-muted/70">MIP required for life of loan when down &lt; 10%</p>
              )}
            </div>

            {/* Rate */}
            <RangeField label="Interest rate" display={`${calc.annualRatePercent.toFixed(3)}%`} value={calc.annualRatePercent} min={4.5} max={10} step={0.125} onChange={(v) => set("annualRatePercent", v)} />

            {/* Term */}
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Loan term</span>
              <select className="input-base" value={calc.loanTermYears} onChange={(e) => set("loanTermYears", Number(e.target.value))}>
                {[30, 25, 20, 15, 10].map((y) => <option key={y} value={y}>{y} years</option>)}
              </select>
            </label>

            {/* Advanced toggle */}
            <button type="button" onClick={() => setShowAdvanced((v) => !v)} className="text-sm font-semibold text-accent hover:underline">
              {showAdvanced ? "− Hide" : "+ Advanced"} options
            </button>
            {showAdvanced && (
              <div className="grid gap-4 sm:grid-cols-3 pt-2">
                <NumberInput label="Annual taxes ($)"     value={calc.annualTaxes}    onChange={(v) => set("annualTaxes", v)} />
                <NumberInput label="Annual insurance ($)" value={calc.annualInsurance} onChange={(v) => set("annualInsurance", v)} />
                <NumberInput label="Monthly HOA ($)"      value={calc.monthlyHoa}      onChange={(v) => set("monthlyHoa", v)} />
              </div>
            )}
          </div>

          {/* ── Output panel — gated ───────────────────────────────── */}
          <div className="relative mt-8">
            {/* Real results */}
            <div
              className={`rounded-3xl p-6 transition-all duration-500 ${unlocked ? "" : "blur-sm select-none pointer-events-none"}`}
              style={{ background: "#FFF3E6" }}
              aria-hidden={!unlocked}
            >
              <p className="mb-1 text-center text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                Estimated total monthly payment (PITI{showMip ? "+MIP" : ""})
              </p>
              <p className="text-center font-extrabold tracking-tight text-ink" style={{ fontSize: 44 }}>
                {formatCurrency(Math.round(est.totalMonthlyPayment))}<span className="text-xl font-semibold text-muted">/mo</span>
              </p>

              {/* PITI breakdown */}
              <div className="mt-5 space-y-2.5 border-t border-line/40 pt-5">
                {[
                  { l: "P — Principal & Interest", v: est.monthlyPrincipalAndInterest },
                  { l: "I — Property Taxes (est.)",       v: est.monthlyTaxes },
                  { l: "I — Homeowner's Insurance (est.)", v: est.monthlyInsurance },
                  ...(showMip ? [{ l: loanType === "fha" ? "MIP — FHA Mortgage Insurance" : loanType === "usda" ? "USDA Guarantee Fee" : "PMI — Mortgage Insurance", v: est.monthlyMip }] : []),
                  ...(est.monthlyHoa > 0 ? [{ l: "HOA Fee", v: est.monthlyHoa }] : []),
                ].map((r) => (
                  <div key={r.l} className="flex justify-between text-sm">
                    <span className="text-muted">{r.l}</span>
                    <span className="font-semibold text-ink">{formatCurrency(Math.round(r.v))}</span>
                  </div>
                ))}
              </div>

              <div className="my-4 border-t border-line/40" />
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-muted">Cash to close (est.)</span>
                <span className="font-bold text-ink">{formatCurrency(cashToClose.low)} – {formatCurrency(cashToClose.high)}</span>
              </div>

              {loanType === "va" && (
                <p className="mt-2 text-[11px] text-muted/70">* VA loans have a one-time funding fee (1.25–3.3%) not reflected in monthly payment.</p>
              )}

              <Link href="/get-started" className="primary-button mt-5 w-full justify-center !py-3.5">
                Get my exact rate →
              </Link>
              <Disclosure variant="estimate" className="mt-4 text-center" />
            </div>

            {/* Gate overlay */}
            {!unlocked && (
              <div className="absolute inset-0 flex flex-col justify-center rounded-3xl bg-white/85 px-6 py-8 backdrop-blur-[3px]">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full text-white text-xl" style={{ background: "var(--ok-gradient)" }}>
                    🔒
                  </div>
                </div>
                <p className="mb-1 text-center text-base font-extrabold text-ink">Your estimate is ready</p>
                <p className="mb-5 text-center text-xs text-muted">Enter your info to unlock your full PITI breakdown.</p>

                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <GateInput placeholder="First name"    value={firstName} onChange={setFirstName} error={errors.firstName} />
                    <GateInput type="email" placeholder="Email address" value={email} onChange={setEmail} error={errors.email} />
                  </div>
                  <GateInput type="tel" placeholder="Phone number" value={phone} onChange={(v) => setPhone(formatPhone(v))} error={errors.phone} />

                  <div>
                    <select
                      value={propertyState}
                      onChange={(e) => setPropertyState(e.target.value)}
                      className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20 ${
                        errors.propertyState ? "border-red-300 bg-red-50/50 focus:border-red-400" : "border-line bg-white focus:border-accent"
                      } ${propertyState === "" ? "text-muted/60" : "text-ink"}`}
                    >
                      <option value="">Property state…</option>
                      {LICENSED_STATES.map((s) => (
                        <option key={s.code} value={s.code}>{s.label}</option>
                      ))}
                    </select>
                    {errors.propertyState && <p className="mt-1 text-[11px] font-semibold text-red-600">{errors.propertyState}</p>}
                  </div>

                  <label className={`flex items-start gap-2 rounded-xl border px-3 py-3 text-[11px] leading-5 text-muted cursor-pointer ${errors.smsConsent ? "border-red-300 bg-red-50/60" : "border-line bg-white"}`}>
                    <input type="checkbox" checked={smsConsent} onChange={(e) => setSmsConsent(e.target.checked)} className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded accent-accent" />
                    <span>{SMS_CONSENT_TEXT} * Required</span>
                  </label>
                  {errors.smsConsent && <p className="text-xs font-semibold text-red-600">{errors.smsConsent}</p>}
                  {submitError && <p className="text-xs font-semibold text-red-600">{submitError}</p>}

                  <button onClick={handleUnlock} disabled={submitting} className="primary-button w-full justify-center !py-3.5 disabled:cursor-not-allowed disabled:opacity-50">
                    {submitting ? "Unlocking…" : "Unlock my PITI breakdown →"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Amortization Schedule ──────────────────────────────────────────── */}
      <div className="container-shell mt-12 max-w-4xl">
        <div className="rounded-2xl border border-line bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setShowAmortization((v) => !v)}
            className="flex w-full items-center justify-between px-6 py-4 text-left hover:bg-sand/50 transition-colors"
          >
            <div>
              <p className="font-bold text-ink">Amortization Schedule</p>
              <p className="text-sm text-muted">
                {calc.loanTermYears * 12} payments · Loan amount {formatCurrency(est.loanAmount)} · {calc.annualRatePercent.toFixed(3)}% rate
              </p>
            </div>
            <span className="text-xl text-muted transition-transform" style={{ transform: showAmortization ? "rotate(180deg)" : "rotate(0deg)" }}>
              ▾
            </span>
          </button>

          {showAmortization && (
            <div className="border-t border-line">
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-4 p-6 bg-sand/30">
                {(() => {
                  const rows = amortRows;
                  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
                  const totalPaid = rows.reduce((s, r) => s + r.payment, 0);
                  return [
                    { label: "Loan Amount",     value: formatCurrency(est.loanAmount) },
                    { label: "Total Interest",  value: formatCurrency(Math.round(totalInterest)) },
                    { label: "Total Cost",      value: formatCurrency(Math.round(totalPaid)) },
                  ].map((s) => (
                    <div key={s.label} className="text-center">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted/70">{s.label}</p>
                      <p className="mt-1 text-lg font-extrabold text-ink">{s.value}</p>
                    </div>
                  ));
                })()}
              </div>

              {/* Table — show first 24 rows + yearly summary for rest */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-line bg-sand/20">
                      <th className="px-4 py-3 text-left font-bold uppercase tracking-[0.08em] text-muted/60">Month</th>
                      <th className="px-4 py-3 text-right font-bold uppercase tracking-[0.08em] text-muted/60">Payment</th>
                      <th className="px-4 py-3 text-right font-bold uppercase tracking-[0.08em] text-muted/60">Principal</th>
                      <th className="px-4 py-3 text-right font-bold uppercase tracking-[0.08em] text-muted/60">Interest</th>
                      <th className="px-4 py-3 text-right font-bold uppercase tracking-[0.08em] text-muted/60">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortRows.slice(0, 24).map((r) => (
                      <tr key={r.month} className={r.month % 2 === 0 ? "bg-sand/10" : ""}>
                        <td className="px-4 py-2 font-medium text-ink">Month {r.month}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-ink">{formatCurrency(Math.round(r.payment))}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-accent font-semibold">{formatCurrency(Math.round(r.principal))}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-muted">{formatCurrency(Math.round(r.interest))}</td>
                        <td className="px-4 py-2 text-right tabular-nums text-ink">{formatCurrency(Math.round(r.balance))}</td>
                      </tr>
                    ))}
                    {/* Yearly summaries for year 3+ */}
                    {Array.from({ length: Math.floor(amortRows.length / 12) }, (_, yi) => yi + 1)
                      .filter((y) => y > 2)
                      .map((year) => {
                        const yearRows = amortRows.slice((year - 1) * 12, year * 12);
                        const endRow = yearRows[yearRows.length - 1];
                        if (!endRow) return null;
                        const yPrincipal = yearRows.reduce((s, r) => s + r.principal, 0);
                        const yInterest  = yearRows.reduce((s, r) => s + r.interest,  0);
                        const yPayment   = yearRows.reduce((s, r) => s + r.payment,   0);
                        return (
                          <tr key={`y${year}`} className="bg-sand/30 font-semibold border-t border-line/50">
                            <td className="px-4 py-2 text-muted">Year {year}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-ink">{formatCurrency(Math.round(yPayment))}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-accent">{formatCurrency(Math.round(yPrincipal))}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-muted">{formatCurrency(Math.round(yInterest))}</td>
                            <td className="px-4 py-2 text-right tabular-nums text-ink">{formatCurrency(Math.round(endRow.balance))}</td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
              <p className="px-6 py-3 text-[11px] text-muted/60 border-t border-line">
                Showing detailed rows for months 1–24; annual summaries for years 3+. Actual schedule may vary. Consult your loan officer for an official amortization table.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function RangeField({ label, display, value, min, max, step, onChange }: {
  label: string; display: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-ink">{label}</span>
        <span className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-accent">{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="range-brand" />
    </div>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold text-ink">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className="input-base !h-11 !text-sm" />
    </label>
  );
}

function GateInput({ type = "text", placeholder, value, onChange, error }: {
  type?: string; placeholder: string; value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20 ${
          error ? "border-red-300 bg-red-50/50 focus:border-red-400" : "border-line bg-white focus:border-accent"
        }`}
      />
      {error && <p className="mt-1 text-[11px] font-semibold text-red-600">{error}</p>}
    </div>
  );
}
