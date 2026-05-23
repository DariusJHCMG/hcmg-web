"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Disclosure } from "@/components/ui/Disclosure";
import { calculateMortgageEstimate, formatCurrency } from "@/lib/calculators";

export function Calculator() {
  const [calc, setCalc] = useState({
    homePrice: 425000,
    downPaymentPercent: 20,
    annualRatePercent: 6.375,
    loanTermYears: 30,
    annualTaxes: 5100,
    annualInsurance: 1913,
    monthlyHoa: 0,
  });
  const [showAdvanced, setShowAdvanced] = useState(false);

  const est = useMemo(() => calculateMortgageEstimate(calc), [calc]);
  const cashToClose = {
    low: Math.round(est.downPaymentAmount + calc.homePrice * 0.02),
    high: Math.round(est.downPaymentAmount + calc.homePrice * 0.03),
  };

  function set<K extends keyof typeof calc>(key: K, val: (typeof calc)[K]) {
    setCalc((c) => ({ ...c, [key]: val }));
  }

  return (
    <section id="calculator" className="section-pad bg-white">
      <div className="container-shell grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left */}
        <div>
          <SectionEyebrow>Mortgage Calculator</SectionEyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink lg:text-5xl">
            See your payment before you fall in love
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted">
            Adjust the numbers and your estimate updates instantly. No forms, no commitment — just the math, right now.
          </p>
          <ul className="mt-6 space-y-3">
            {["Includes property taxes and insurance", "Shows complete cash-to-close breakdown", "Works for purchase or refinance"].map((b) => (
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

        {/* Right — card */}
        <div className="glass-card p-6 lg:p-8">
          <div className="space-y-6">
            {/* Home price */}
            <RangeField label="Home price" display={formatCurrency(calc.homePrice)} value={calc.homePrice} min={100000} max={2000000} step={5000} onChange={(v) => set("homePrice", v)} />
            {/* Down payment */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">Down payment</span>
                <span className="rounded-full border border-line px-3 py-1 text-sm font-semibold text-accent">{calc.downPaymentPercent}% = {formatCurrency(est.downPaymentAmount)}</span>
              </div>
              <input type="range" min={3} max={50} step={0.5} value={calc.downPaymentPercent} onChange={(e) => set("downPaymentPercent", Number(e.target.value))} className="range-brand" />
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
                <NumberInput label="Annual taxes ($)" value={calc.annualTaxes} onChange={(v) => set("annualTaxes", v)} />
                <NumberInput label="Annual insurance ($)" value={calc.annualInsurance} onChange={(v) => set("annualInsurance", v)} />
                <NumberInput label="Monthly HOA ($)" value={calc.monthlyHoa} onChange={(v) => set("monthlyHoa", v)} />
              </div>
            )}
          </div>

          {/* Output panel */}
          <div className="mt-8 rounded-3xl p-6" style={{ background: "#FFF3E6" }}>
            <p className="mb-1 text-center text-xs font-semibold uppercase tracking-[0.16em] text-accent">Estimated total monthly payment</p>
            <p className="text-center font-extrabold tracking-tight text-ink" style={{ fontSize: 44 }}>
              {formatCurrency(Math.round(est.totalMonthlyPayment))}<span className="text-xl font-semibold text-muted">/mo</span>
            </p>
            <div className="mt-5 space-y-2.5 border-t border-line/40 pt-5">
              {[
                { l: "Principal & interest", v: est.monthlyPrincipalAndInterest },
                { l: "Taxes (est.)", v: est.monthlyTaxes },
                { l: "Insurance (est.)", v: est.monthlyInsurance },
                { l: "HOA", v: est.monthlyHoa },
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
            <Link href="/get-started" className="primary-button mt-5 w-full justify-center !py-3.5">
              Get my exact rate →
            </Link>
            <Disclosure variant="estimate" className="mt-4 text-center" />
          </div>
        </div>
      </div>
    </section>
  );
}

function RangeField({ label, display, value, min, max, step, onChange }: { label: string; display: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void }) {
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
