"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { calculateMortgageEstimate, formatCurrency } from "@/lib/calculators";
import { Disclosure } from "@/components/ui/Disclosure";
import { formatPhone } from "@/lib/format";
import { submitLead, utmsToPayload } from "@/lib/lead";
import { getStoredUtms } from "@/lib/utm";
import { getSessionMeta, trackFunnelStep } from "@/lib/tracker";
import { identifyLead, getPostHog } from "@/lib/posthog";

// ── Types ──────────────────────────────────────────────────
type Goal = "buy" | "refinance" | "compare";
type PriceBand = "under-250" | "250-400" | "400-600" | "600-plus";
type CreditBand = "760-plus" | "700-759" | "640-699" | "below-640";
type IncomeBand = "under-75" | "75-125" | "125-200" | "200-plus";
type Step = 1 | 2 | 3 | 4 | 5 | 6 | "success";

interface FunnelState {
  goal: Goal | null;
  priceBand: PriceBand | null;
  creditBand: CreditBand | null;
  incomeBand: IncomeBand | null;
  firstName: string;
  email: string;
  phone: string;
  smsConsent: boolean;
}

// ── Lookup tables ──────────────────────────────────────────
const PRICE_MIDPOINTS: Record<PriceBand, number> = {
  "under-250": 220000, "250-400": 325000, "400-600": 500000, "600-plus": 725000,
};
const CREDIT_RATE_ADJ: Record<CreditBand, number> = {
  "760-plus": -0.25, "700-759": 0, "640-699": 0.45, "below-640": 1.0,
};
const CREDIT_DOWN_PCT: Record<CreditBand, number> = {
  "760-plus": 10, "700-759": 5, "640-699": 5, "below-640": 3.5,
};
const INCOME_MIDPOINTS: Record<IncomeBand, number> = {
  "under-75": 62500, "75-125": 100000, "125-200": 162500, "200-plus": 230000,
};
const DTI_BY_CREDIT: Record<CreditBand, number> = {
  "760-plus": 0.43, "700-759": 0.40, "640-699": 0.36, "below-640": 0.33,
};
const LOAN_PATH: Record<CreditBand, string> = {
  "760-plus": "Conventional · Best rates available",
  "700-759": "Conventional · Strong qualification",
  "640-699": "FHA · Great option to explore",
  "below-640": "FHA or VA · Multiple paths available",
};

const SMS_CONSENT_TEXT =
  "By submitting this form, I agree to be contacted by Harris Capital Mortgage Group, LLC (NMLS# 1918223) regarding my mortgage inquiry. I consent to receive calls, texts, and emails. Message and data rates may apply. Reply STOP to opt out of texts at any time.";

// ── Estimate calc ──────────────────────────────────────────
function getEstimate(state: FunnelState) {
  const price = state.priceBand ? PRICE_MIDPOINTS[state.priceBand] : 400000;
  const credit = state.creditBand ?? "700-759";
  const income = state.incomeBand ? INCOME_MIDPOINTS[state.incomeBand] : 100000;
  const baseRate = state.goal === "refinance" ? 6.125 : 6.375;
  const rate = Math.max(baseRate + CREDIT_RATE_ADJ[credit], 4.75);
  const down = CREDIT_DOWN_PCT[credit];
  const dti = DTI_BY_CREDIT[credit];
  const maxMonthly = (income / 12) * dti;
  const maxPrice = (maxMonthly / (rate / 100 / 12)) * (1 - Math.pow(1 + rate / 100 / 12, -360));
  const powerHigh = Math.round(Math.max(maxPrice, price));
  const powerLow = Math.round(powerHigh * 0.88);

  const est = calculateMortgageEstimate({
    homePrice: price, downPaymentPercent: down,
    annualRatePercent: rate, loanTermYears: 30,
    annualTaxes: price * 0.012, annualInsurance: price * 0.0045,
  });

  return { powerLow, powerHigh, monthly: Math.round(est.totalMonthlyPayment), loanPath: LOAN_PATH[credit] };
}

// ── Main component ─────────────────────────────────────────
export interface FunnelLoContext {
  slug: string;
  name: string;
  nmls: string | null;
}

export function FunnelFlow({ lo }: { lo?: FunnelLoContext } = {}) {
  const [step, setStep] = useState<Step>(1);
  const [dir, setDir] = useState<1 | -1>(1);
  const [state, setState] = useState<FunnelState>({
    goal: null, priceBand: null, creditBand: null, incomeBand: null,
    firstName: "", email: "", phone: "", smsConsent: false,
  });
  const [errors, setErrors] = useState<Partial<Record<"firstName" | "email" | "phone" | "smsConsent", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const estimate = getEstimate(state);
  const stepNum = typeof step === "number" ? step : 6;
  const progress = Math.min((stepNum / 6) * 100, 100);

  const stepStartRef = React.useRef<number>(Date.now());

  function go(n: Step, d: 1 | -1 = 1) { setDir(d); setStep(n); }
  function next(n: Step, choiceLabel?: string) {
    const duration = Date.now() - stepStartRef.current;
    stepStartRef.current = Date.now();
    if (typeof step === "number" && choiceLabel) {
      trackFunnelStep(step, choiceLabel, duration);
    }
    go(n, 1);
  }
  function back(n: Step) { go(n, -1); }
  function set<K extends keyof FunnelState>(k: K, v: FunnelState[K]) { setState((s) => ({ ...s, [k]: v })); }

  function validate() {
    const e: typeof errors = {};
    if (!state.firstName.trim()) e.firstName = "Enter your first name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email.trim())) e.email = "Enter a valid email address.";
    if (state.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit phone number.";
    if (!state.smsConsent) e.smsConsent = "Consent is required to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError("");
    const meta = getSessionMeta();
    const result = await submitLead({
      firstName: state.firstName.trim(),
      email: state.email.trim(),
      phone: state.phone,
      smsConsent: true,
      smsConsentText: SMS_CONSENT_TEXT,
      smsConsentTimestamp: new Date().toISOString(),
      goal: state.goal ?? undefined,
      priceRange: state.priceBand ?? undefined,
      creditRange: state.creditBand ?? undefined,
      incomeRange: state.incomeBand ?? undefined,
      estimatedBuyingPowerLow: estimate.powerLow,
      estimatedBuyingPowerHigh: estimate.powerHigh,
      estimatedMonthlyPayment: estimate.monthly,
      recommendedLoanType: estimate.loanPath,
      loSlug: lo?.slug,
      loName: lo?.name,
      loNmls: lo?.nmls,
      ...utmsToPayload(getStoredUtms()),
      sessionId: meta.sessionId,
      entryPage: meta.entryPage,
      referrer:  meta.referrer,
      device:    meta.device,
    });

    if (result.success) {
      // Identify the lead in PostHog so session replay is linked to them
      identifyLead(meta.sessionId, {
        email:     state.email.trim(),
        name:      state.firstName.trim(),
        loSlug:    lo?.slug,
        loName:    lo?.name,
        utmSource: getStoredUtms().utm_source,
      });
      getPostHog().capture("lead_submitted", {
        goal:       state.goal,
        price_band: state.priceBand,
        credit_band: state.creditBand,
        lo_slug:    lo?.slug,
        utm_source: getStoredUtms().utm_source,
      });
    }

    setSubmitting(false);
    if (result.success) {
      go("success", 1);
    } else {
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };
  const transition = { duration: 0.28, ease: "easeOut" };

  return (
    <div className="mx-auto w-full max-w-[560px]">
      {/* Progress */}
      {step !== "success" && (
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Step {stepNum} of 6</span>
            {stepNum > 1 && (
              <button
                onClick={() => back((stepNum - 1) as Step)}
                className="text-xs font-semibold text-muted hover:text-accent"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: "var(--ok-gradient)" }}
            />
          </div>
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={String(step)}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
        >
          {step === 1 && (
            <StepShell
              title="What are you trying to do?"
              sub="Start with your goal and we'll show you the right numbers."
              onContinue={() => state.goal && next(2)}
              disabled={!state.goal}
              ctaLabel="Continue →"
            >
              <div className="space-y-3">
                {([
                  { v: "buy" as Goal, label: "🏠  Buy a home" },
                  { v: "refinance" as Goal, label: "🔄  Refinance my current mortgage" },
                  { v: "compare" as Goal, label: "📊  Compare my options" },
                ] as { v: Goal; label: string }[]).map((o) => (
                  <button key={o.v} onClick={() => set("goal", o.v)}
                    className={`funnel-option ${state.goal === o.v ? "funnel-option-selected" : ""}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell title="What price range are you looking at?" sub="A quick range helps us build a realistic payment estimate." onContinue={() => state.priceBand && next(3)} disabled={!state.priceBand} ctaLabel="Show my estimate →">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { v: "under-250" as PriceBand, label: "Under $250,000" },
                  { v: "250-400" as PriceBand, label: "$250k – $400k" },
                  { v: "400-600" as PriceBand, label: "$400k – $600k" },
                  { v: "600-plus" as PriceBand, label: "Over $600,000" },
                ] as { v: PriceBand; label: string }[]).map((o) => (
                  <button key={o.v} onClick={() => set("priceBand", o.v)}
                    className={`funnel-option ${state.priceBand === o.v ? "funnel-option-selected" : ""}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title="Where does your credit likely fall today?" sub="A ballpark is all we need. This won't affect your score." onContinue={() => state.creditBand && next(4)} disabled={!state.creditBand} ctaLabel="Continue →">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { v: "760-plus" as CreditBand, label: "760+", sub: "Excellent" },
                  { v: "700-759" as CreditBand, label: "700 – 759", sub: "Good" },
                  { v: "640-699" as CreditBand, label: "640 – 699", sub: "Fair" },
                  { v: "below-640" as CreditBand, label: "Below 640", sub: "Building" },
                ] as { v: CreditBand; label: string; sub: string }[]).map((o) => (
                  <button key={o.v} onClick={() => set("creditBand", o.v)}
                    className={`funnel-option ${state.creditBand === o.v ? "funnel-option-selected" : ""}`}>
                    <div className="font-bold">{o.label}</div>
                    <div className="mt-1 text-xs font-normal text-muted">{o.sub}</div>
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted/70">Not sure? Pick the range that feels closest. We'll work from there.</p>
            </StepShell>
          )}

          {step === 4 && (
            <StepShell title="What's your approximate household income?" sub="We use this to shape your estimate, not to make decisions." onContinue={() => state.incomeBand && next(5)} disabled={!state.incomeBand} ctaLabel="See my payment range →">
              <div className="grid grid-cols-2 gap-3">
                {([
                  { v: "under-75" as IncomeBand, label: "Under $75,000" },
                  { v: "75-125" as IncomeBand, label: "$75k – $125k" },
                  { v: "125-200" as IncomeBand, label: "$125k – $200k" },
                  { v: "200-plus" as IncomeBand, label: "Over $200,000" },
                ] as { v: IncomeBand; label: string }[]).map((o) => (
                  <button key={o.v} onClick={() => set("incomeBand", o.v)}
                    className={`funnel-option ${state.incomeBand === o.v ? "funnel-option-selected" : ""}`}>
                    {o.label}
                  </button>
                ))}
              </div>
            </StepShell>
          )}

          {step === 5 && (
            <div>
              <div className="mb-6 flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, delay: 0.15 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-white"
                  style={{ background: "var(--ok-gradient)" }}
                >
                  ✓
                </motion.div>
                <h2 className="text-2xl font-extrabold text-ink">Here's your estimate</h2>
              </div>
              <p className="mb-6 text-sm text-muted">Based on what you shared, here's your range.</p>

              <div className="space-y-4">
                {([
                  { label: "Estimated buying power", value: `${formatCurrency(estimate.powerLow)} – ${formatCurrency(estimate.powerHigh)}`, sub: "Based on typical debt-to-income guidelines", delay: 0.1 },
                  { label: "Estimated monthly payment", value: `${formatCurrency(estimate.monthly)}/mo`, sub: "Est. includes taxes and insurance", delay: 0.2 },
                  { label: "Recommended loan path", value: estimate.loanPath, sub: "Based on your credit range", delay: 0.3 },
                ]).map((card) => (
                  <motion.div
                    key={card.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: card.delay, duration: 0.4 }}
                    className="rounded-2xl border border-line bg-white p-5"
                  >
                    <div className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-muted">{card.label}</div>
                    <div className="text-2xl font-extrabold text-ink">{card.value}</div>
                    <div className="mt-1 text-xs text-muted/70">{card.sub}</div>
                  </motion.div>
                ))}
              </div>

              <Disclosure variant="estimate" className="mt-4" />

              <div className="mt-6 space-y-3">
                <button onClick={() => next(6)} className="primary-button w-full justify-center !py-4">
                  Unlock my exact rate →
                </button>
                <button onClick={() => go(1, -1)} className="ghost-button w-full justify-center !py-4">
                  Adjust my answers
                </button>
              </div>
            </div>
          )}

          {step === 6 && (
            <div>
              <h2 className="mb-2 text-2xl font-extrabold text-ink">Unlock your exact rate and next step</h2>
              <p className="mb-4 text-sm text-muted">Tell us where to send your estimate and we'll connect you with a licensed loan officer.</p>

              {/* Estimate summary */}
              <div className="mb-6 rounded-2xl border border-line bg-sand px-5 py-3 text-sm text-muted">
                Your estimate: <strong className="text-ink">{formatCurrency(estimate.powerLow)}–{formatCurrency(estimate.powerHigh)}</strong> buying power · ~<strong className="text-ink">{formatCurrency(estimate.monthly)}/mo</strong>
              </div>

              <div className="space-y-4">
                <TextField label="First name *" placeholder="First name" value={state.firstName} onChange={(v) => set("firstName", v)} error={errors.firstName} />
                <TextField label="Email address *" type="email" placeholder="email@example.com" value={state.email} onChange={(v) => set("email", v)} error={errors.email} />
                <TextField
                  label="Phone number *" type="tel" placeholder="(555) 000-0000"
                  value={state.phone}
                  onChange={(v) => set("phone", formatPhone(v))}
                  error={errors.phone}
                />

                {/* TCPA consent */}
                <label className={`block rounded-2xl border px-4 py-4 transition-colors ${errors.smsConsent ? "border-red-300 bg-red-50/60" : "border-line bg-white"}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox" checked={state.smsConsent}
                      onChange={(e) => set("smsConsent", e.target.checked)}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-line accent-accent"
                    />
                    <span className="text-xs leading-5 text-muted">
                      {SMS_CONSENT_TEXT}{" "}
                      <Link href="/sms-policy" className="underline hover:text-accent">View our SMS Policy</Link>.
                      {" "}* Required
                    </span>
                  </div>
                  {errors.smsConsent && <p className="mt-2 pl-7 text-xs font-semibold text-red-600">{errors.smsConsent}</p>}
                </label>

                {submitError && (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !state.smsConsent}
                  className="primary-button w-full justify-center !py-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : "Get my exact rate →"}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full text-2xl text-white shadow-orange"
                style={{ background: "var(--ok-gradient)" }}
              >
                ✓
              </motion.div>

              <h2 className="mb-3 text-2xl font-extrabold text-ink">
                You're all set{state.firstName ? `, ${state.firstName}` : ""}!
              </h2>
              <p className="mb-8 text-base leading-7 text-muted">
                {lo
                  ? `${lo.name} will reach out within one business day to discuss your options and walk you through next steps.`
                  : "A licensed loan officer from Harris Capital Mortgage Group will reach out within one business day to discuss your options and walk you through next steps."}
              </p>

              <div className="mb-8 space-y-3 text-left">
                {[
                  { icon: "📧", title: "Check your email", body: "A confirmation with your estimate summary is on its way." },
                  { icon: "📞", title: "Expect a call", body: "Within 1 business day from our team in your market." },
                  { icon: "🤝", title: "No pressure", body: "We're here to help, not to push. You're in control." },
                ].map((c) => (
                  <div key={c.title} className="flex items-start gap-4 rounded-2xl border border-line bg-white px-5 py-4">
                    <span className="text-xl">{c.icon}</span>
                    <div>
                      <div className="font-semibold text-ink">{c.title}</div>
                      <div className="text-sm text-muted">{c.body}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Link href="/" className="secondary-button inline-flex">
                Return to home
              </Link>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Mobile sticky CTA */}
      {typeof step === "number" && step < 5 && (
        <div className="mobile-sticky-cta md:hidden">
          <button
            disabled={
              (step === 1 && !state.goal) ||
              (step === 2 && !state.priceBand) ||
              (step === 3 && !state.creditBand) ||
              (step === 4 && !state.incomeBand)
            }
            onClick={() => next((step + 1) as Step)}
            className="mobile-sticky-primary disabled:opacity-40"
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────
function StepShell({ title, sub, children, onContinue, disabled, ctaLabel }: {
  title: string; sub: string; children: React.ReactNode;
  onContinue: () => void; disabled: boolean; ctaLabel: string;
}) {
  return (
    <div>
      <h2 className="mb-2 text-2xl font-extrabold text-ink">{title}</h2>
      <p className="mb-6 text-sm text-muted">{sub}</p>
      {children}
      <button
        onClick={onContinue} disabled={disabled}
        className="primary-button mt-6 w-full justify-center !py-4 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {ctaLabel}
      </button>
      <p className="mt-3 text-center text-xs text-muted/60">
        Takes under a minute · No hard credit check · No commitment
      </p>
    </div>
  );
}

function TextField({ label, type = "text", placeholder, value, onChange, error }: {
  label: string; type?: string; placeholder: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-ink">{label}</span>
      <input
        type={type} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`input-base ${error ? "!border-red-300 !bg-red-50/50 focus:!border-red-400 focus:!ring-red-100" : ""}`}
      />
      {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
    </label>
  );
}
