"use client";

import React, { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/lib/calculators";
import { formatPhone } from "@/lib/format";
import { submitLead, utmsToPayload } from "@/lib/lead";
import { getStoredUtms } from "@/lib/utm";
import { getSessionMeta, trackFunnelStep } from "@/lib/tracker";
import { identifyLead, getPostHog } from "@/lib/posthog";
import type { FunnelLoContext } from "@/components/funnel/FunnelFlow";

// ── Tiny helpers ──────────────────────────────────────────────────────────────

function num(v: string) {
  const n = parseFloat(v.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function pmt(principal: number, annualRate: number, months: number) {
  if (principal <= 0 || months <= 0) return 0;
  if (annualRate === 0) return principal / months;
  const r = annualRate / 100 / 12;
  return (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
}

// ── Calculator definitions ────────────────────────────────────────────────────

type FieldDef = {
  key: string;
  label: string;
  placeholder: string;
  prefix?: string;
  suffix?: string;
  hint?: string;
};

type ResultCard = {
  label: string;
  value: (inputs: Record<string, string>) => string;
  highlight?: boolean;
};

type CalcDef = {
  fields: FieldDef[];
  results: ResultCard[];
  gateLabel: string;
  gateSubhead: string;
};

// ── All 12 calculator definitions ────────────────────────────────────────────

const CALC_DEFS: Record<string, CalcDef> = {

  "payment-calculator": {
    fields: [
      { key: "price",    label: "Home price",        placeholder: "350,000", prefix: "$" },
      { key: "down",     label: "Down payment %",     placeholder: "10",      suffix: "%", hint: "Typical: 3.5–20%" },
      { key: "rate",     label: "Interest rate",      placeholder: "6.75",    suffix: "%", hint: "Current 30-yr avg ~6.75%" },
      { key: "term",     label: "Loan term",          placeholder: "30",      suffix: "yrs" },
      { key: "taxes",    label: "Annual property tax",placeholder: "4,200",   prefix: "$", hint: "Optional — leave blank to estimate" },
      { key: "hoi",      label: "Annual insurance",   placeholder: "1,600",   prefix: "$", hint: "Optional — leave blank to estimate" },
    ],
    results: [
      {
        label: "Principal & interest",
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate); const t = num(f.term) || 30;
          const loan = price * (1 - dn / 100);
          return formatCurrency(pmt(loan, r, t * 12));
        },
      },
      {
        label: "Monthly taxes & insurance",
        value: (f) => {
          const price = num(f.price);
          const taxes = f.taxes ? num(f.taxes) : price * 0.012;
          const hoi   = f.hoi   ? num(f.hoi)   : price * 0.0045;
          return formatCurrency((taxes + hoi) / 12);
        },
      },
      {
        label: "Total monthly payment",
        highlight: true,
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate); const t = num(f.term) || 30;
          const loan = price * (1 - dn / 100);
          const pi = pmt(loan, r, t * 12);
          const taxes = f.taxes ? num(f.taxes) : price * 0.012;
          const hoi   = f.hoi   ? num(f.hoi)   : price * 0.0045;
          return formatCurrency(pi + (taxes + hoi) / 12);
        },
      },
      {
        label: "Loan amount",
        value: (f) => {
          const price = num(f.price); const dn = num(f.down);
          return formatCurrency(price * (1 - dn / 100));
        },
      },
    ],
    gateLabel: "Get my personalized payment breakdown →",
    gateSubhead: "A licensed loan officer will walk through your exact options.",
  },

  "purchase-power": {
    fields: [
      { key: "income",  label: "Annual household income", placeholder: "100,000", prefix: "$" },
      { key: "debt",    label: "Monthly debt payments",   placeholder: "500",     prefix: "$", hint: "Car, student loans, minimums, etc." },
      { key: "rate",    label: "Interest rate",           placeholder: "6.75",    suffix: "%", hint: "Current 30-yr avg ~6.75%" },
      { key: "down",    label: "Down payment",            placeholder: "20,000",  prefix: "$" },
    ],
    results: [
      {
        label: "Max home price",
        highlight: true,
        value: (f) => {
          const income = num(f.income); const debt = num(f.debt); const r = num(f.rate); const down = num(f.down);
          const maxMonthly = (income / 12) * 0.43 - debt;
          if (maxMonthly <= 0 || r <= 0) return "$0";
          const mr = r / 100 / 12;
          const loan = maxMonthly * (1 - Math.pow(1 + mr, -360)) / mr;
          return formatCurrency(loan + down);
        },
      },
      {
        label: "Max loan amount",
        value: (f) => {
          const income = num(f.income); const debt = num(f.debt); const r = num(f.rate);
          const maxMonthly = (income / 12) * 0.43 - debt;
          if (maxMonthly <= 0 || r <= 0) return "$0";
          const mr = r / 100 / 12;
          return formatCurrency(maxMonthly * (1 - Math.pow(1 + mr, -360)) / mr);
        },
      },
      {
        label: "Estimated monthly payment",
        value: (f) => {
          const income = num(f.income); const debt = num(f.debt); const r = num(f.rate);
          const maxMonthly = (income / 12) * 0.43 - debt;
          if (maxMonthly <= 0 || r <= 0) return "$0";
          return formatCurrency(maxMonthly);
        },
      },
    ],
    gateLabel: "Show my full affordability report →",
    gateSubhead: "Get a personalized breakdown with today's rates.",
  },

  "rent-vs-buy-calc": {
    fields: [
      { key: "rent",    label: "Current monthly rent",   placeholder: "1,800",   prefix: "$" },
      { key: "price",   label: "Home you're considering",placeholder: "350,000", prefix: "$" },
      { key: "down",    label: "Down payment %",         placeholder: "10",      suffix: "%" },
      { key: "rate",    label: "Interest rate",          placeholder: "6.75",    suffix: "%" },
      { key: "years",   label: "Time horizon",           placeholder: "5",       suffix: "yrs", hint: "How long you'd stay" },
    ],
    results: [
      {
        label: "Monthly mortgage (P&I + taxes + ins)",
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate); const t = 30;
          const loan = price * (1 - dn / 100);
          const pi = pmt(loan, r, t * 12);
          return formatCurrency(pi + (price * 0.012 + price * 0.0045) / 12);
        },
      },
      {
        label: "Monthly rent",
        value: (f) => formatCurrency(num(f.rent)),
      },
      {
        label: "Monthly cost difference",
        highlight: true,
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate); const t = 30;
          const rent = num(f.rent);
          const loan = price * (1 - dn / 100);
          const pi = pmt(loan, r, t * 12);
          const mortgage = pi + (price * 0.012 + price * 0.0045) / 12;
          const diff = mortgage - rent;
          return (diff >= 0 ? "+" : "") + formatCurrency(diff) + "/mo buying costs";
        },
      },
      {
        label: `Equity built (${(0) || "N"} yrs)`,
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate); const yrs = num(f.years) || 5;
          const loan = price * (1 - dn / 100);
          let bal = loan;
          const mr = r / 100 / 12;
          for (let i = 0; i < yrs * 12; i++) {
            const interest = bal * mr;
            const principal = pmt(loan, r, 30 * 12) - interest;
            bal = Math.max(bal - principal, 0);
          }
          const equity = price - bal + (price * (yrs * 0.03)); // appreciation estimate
          return formatCurrency(equity);
        },
      },
    ],
    gateLabel: "Get my full rent vs. buy analysis →",
    gateSubhead: "We'll factor in appreciation, tax benefits, and opportunity cost.",
  },

  "refi-savings": {
    fields: [
      { key: "balance",  label: "Current loan balance",    placeholder: "280,000", prefix: "$" },
      { key: "currentRate", label: "Current interest rate",placeholder: "7.50",    suffix: "%" },
      { key: "newRate",  label: "New rate (estimate)",      placeholder: "6.50",    suffix: "%", hint: "Ask us for today's real rate" },
      { key: "term",     label: "New loan term",            placeholder: "30",      suffix: "yrs" },
      { key: "closing",  label: "Estimated closing costs",  placeholder: "4,000",   prefix: "$", hint: "Typically 1–2% of balance" },
    ],
    results: [
      {
        label: "Current monthly payment",
        value: (f) => {
          const bal = num(f.balance); const r = num(f.currentRate);
          return formatCurrency(pmt(bal, r, 360));
        },
      },
      {
        label: "New monthly payment",
        value: (f) => {
          const bal = num(f.balance); const r = num(f.newRate); const t = num(f.term) || 30;
          return formatCurrency(pmt(bal, r, t * 12));
        },
      },
      {
        label: "Monthly savings",
        highlight: true,
        value: (f) => {
          const bal = num(f.balance);
          const oldPmt = pmt(bal, num(f.currentRate), 360);
          const newPmt = pmt(bal, num(f.newRate), (num(f.term) || 30) * 12);
          return formatCurrency(Math.max(oldPmt - newPmt, 0));
        },
      },
      {
        label: "Break-even point",
        value: (f) => {
          const bal = num(f.balance);
          const oldPmt = pmt(bal, num(f.currentRate), 360);
          const newPmt = pmt(bal, num(f.newRate), (num(f.term) || 30) * 12);
          const savings = oldPmt - newPmt;
          const closing = num(f.closing);
          if (savings <= 0 || closing <= 0) return "—";
          const months = Math.ceil(closing / savings);
          return months < 12 ? `${months} months` : `${(months / 12).toFixed(1)} years`;
        },
      },
    ],
    gateLabel: "Get my real refi quote →",
    gateSubhead: "A licensed loan officer will run your numbers with today's live rates.",
  },

  "cash-out-calc": {
    fields: [
      { key: "value",    label: "Estimated home value",  placeholder: "450,000", prefix: "$" },
      { key: "balance",  label: "Current loan balance",  placeholder: "200,000", prefix: "$" },
      { key: "ltv",      label: "Max LTV desired",       placeholder: "80",      suffix: "%", hint: "Most lenders allow up to 80%" },
      { key: "rate",     label: "New rate (estimate)",   placeholder: "6.75",    suffix: "%" },
    ],
    results: [
      {
        label: "Estimated home equity",
        value: (f) => formatCurrency(Math.max(num(f.value) - num(f.balance), 0)),
      },
      {
        label: "Max new loan amount",
        value: (f) => formatCurrency(num(f.value) * (num(f.ltv) / 100 || 0.8)),
      },
      {
        label: "Cash you could access",
        highlight: true,
        value: (f) => {
          const maxLoan = num(f.value) * ((num(f.ltv) || 80) / 100);
          return formatCurrency(Math.max(maxLoan - num(f.balance), 0));
        },
      },
      {
        label: "New monthly payment",
        value: (f) => {
          const maxLoan = num(f.value) * ((num(f.ltv) || 80) / 100);
          return formatCurrency(pmt(maxLoan, num(f.rate) || 6.75, 360));
        },
      },
    ],
    gateLabel: "See my full cash-out options →",
    gateSubhead: "We'll show you exactly how much equity you can unlock.",
  },

  "debt-consol-calc": {
    fields: [
      { key: "homeValue", label: "Estimated home value",  placeholder: "400,000", prefix: "$" },
      { key: "mortgage",  label: "Current mortgage balance",placeholder: "200,000", prefix: "$" },
      { key: "otherDebt", label: "Total other debt to consolidate",placeholder: "35,000", prefix: "$", hint: "Credit cards, personal loans, etc." },
      { key: "currentMo", label: "Current monthly debt payments",placeholder: "1,200", prefix: "$", hint: "All debts combined" },
      { key: "rate",      label: "New rate (estimate)",   placeholder: "6.75",    suffix: "%" },
    ],
    results: [
      {
        label: "Current total monthly payments",
        value: (f) => formatCurrency(num(f.currentMo)),
      },
      {
        label: "New mortgage payment (consolidated)",
        value: (f) => {
          const newLoan = num(f.mortgage) + num(f.otherDebt);
          return formatCurrency(pmt(newLoan, num(f.rate) || 6.75, 360) + (num(f.homeValue) * 0.012 + num(f.homeValue) * 0.0045) / 12);
        },
      },
      {
        label: "Monthly savings",
        highlight: true,
        value: (f) => {
          const newLoan = num(f.mortgage) + num(f.otherDebt);
          const newPmt = pmt(newLoan, num(f.rate) || 6.75, 360) + (num(f.homeValue) * 0.012 + num(f.homeValue) * 0.0045) / 12;
          return formatCurrency(Math.max(num(f.currentMo) - newPmt, 0));
        },
      },
    ],
    gateLabel: "Get my debt consolidation plan →",
    gateSubhead: "We'll show you exactly how much you could save each month.",
  },

  "down-payment-calc": {
    fields: [
      { key: "price",   label: "Target home price",      placeholder: "350,000", prefix: "$" },
      { key: "program", label: "Down payment %",         placeholder: "10",      suffix: "%", hint: "FHA: 3.5% · Conv: 3–20% · VA: 0%" },
      { key: "taxes",   label: "Local transfer tax rate",placeholder: "0.75",    suffix: "%", hint: "Optional — varies by state/county" },
    ],
    results: [
      {
        label: "Down payment needed",
        highlight: true,
        value: (f) => formatCurrency(num(f.price) * ((num(f.program) || 10) / 100)),
      },
      {
        label: "Estimated closing costs",
        value: (f) => formatCurrency(num(f.price) * 0.025),
      },
      {
        label: "Transfer taxes",
        value: (f) => formatCurrency(num(f.price) * ((num(f.taxes) || 0) / 100)),
      },
      {
        label: "Total cash to close (est.)",
        value: (f) => {
          const price = num(f.price);
          const dp = price * ((num(f.program) || 10) / 100);
          const closing = price * 0.025;
          const taxes = price * ((num(f.taxes) || 0) / 100);
          return formatCurrency(dp + closing + taxes);
        },
      },
    ],
    gateLabel: "Show me my full closing cost breakdown →",
    gateSubhead: "Get a line-by-line estimate with zero surprises.",
  },

  "closing-cost-estimator": {
    fields: [
      { key: "price",   label: "Purchase price",         placeholder: "350,000", prefix: "$" },
      { key: "down",    label: "Down payment %",         placeholder: "10",      suffix: "%" },
      { key: "state",   label: "Approx. state tax rate", placeholder: "0.75",    suffix: "%", hint: "Varies by state — FL ~0.35%, NY ~1.4%" },
    ],
    results: [
      {
        label: "Lender/origination fees (est.)",
        value: (f) => formatCurrency(num(f.price) * 0.01),
      },
      {
        label: "Title & escrow (est.)",
        value: (f) => formatCurrency(num(f.price) * 0.008),
      },
      {
        label: "Prepaid items (taxes, ins, interest)",
        value: (f) => formatCurrency(num(f.price) * 0.007),
      },
      {
        label: "Transfer taxes",
        value: (f) => formatCurrency(num(f.price) * ((num(f.state) || 0) / 100)),
      },
      {
        label: "Total estimated closing costs",
        highlight: true,
        value: (f) => {
          const price = num(f.price);
          return formatCurrency(price * 0.025 + price * ((num(f.state) || 0) / 100));
        },
      },
    ],
    gateLabel: "Get my itemized closing cost estimate →",
    gateSubhead: "We'll give you a real Loan Estimate — no surprises.",
  },

  "income-needed-calc": {
    fields: [
      { key: "price",  label: "Target home price",      placeholder: "350,000", prefix: "$" },
      { key: "down",   label: "Down payment %",         placeholder: "10",      suffix: "%" },
      { key: "rate",   label: "Interest rate",          placeholder: "6.75",    suffix: "%" },
      { key: "debt",   label: "Monthly non-housing debt",placeholder: "400",    prefix: "$", hint: "Car, student loans, minimums" },
    ],
    results: [
      {
        label: "Monthly mortgage (PITI)",
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate);
          const loan = price * (1 - dn / 100);
          const pi = pmt(loan, r, 360);
          return formatCurrency(pi + (price * 0.012 + price * 0.0045) / 12);
        },
      },
      {
        label: "Min. income needed (43% DTI)",
        highlight: true,
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate); const debt = num(f.debt);
          const loan = price * (1 - dn / 100);
          const piti = pmt(loan, r, 360) + (price * 0.012 + price * 0.0045) / 12;
          const totalMonthly = piti + debt;
          return formatCurrency((totalMonthly / 0.43) * 12) + "/yr";
        },
      },
      {
        label: "Monthly income required",
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate); const debt = num(f.debt);
          const loan = price * (1 - dn / 100);
          const piti = pmt(loan, r, 360) + (price * 0.012 + price * 0.0045) / 12;
          return formatCurrency((piti + debt) / 0.43);
        },
      },
    ],
    gateLabel: "See if I qualify with my income →",
    gateSubhead: "We'll tell you exactly where you stand — no credit pull.",
  },

  "dscr-calculator": {
    fields: [
      { key: "rent",    label: "Monthly gross rental income", placeholder: "2,800", prefix: "$" },
      { key: "price",   label: "Property purchase price",     placeholder: "300,000", prefix: "$" },
      { key: "down",    label: "Down payment %",              placeholder: "20",    suffix: "%", hint: "DSCR typically requires 20%+" },
      { key: "rate",    label: "Interest rate",               placeholder: "7.25",  suffix: "%" },
      { key: "taxes",   label: "Annual property taxes",       placeholder: "3,600", prefix: "$" },
      { key: "ins",     label: "Annual insurance",            placeholder: "1,200", prefix: "$" },
    ],
    results: [
      {
        label: "Monthly mortgage (P&I)",
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate);
          const loan = price * (1 - dn / 100);
          return formatCurrency(pmt(loan, r, 360));
        },
      },
      {
        label: "Total monthly obligations",
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate);
          const loan = price * (1 - dn / 100);
          const pi = pmt(loan, r, 360);
          const taxes = (num(f.taxes) || price * 0.012) / 12;
          const ins   = (num(f.ins)   || price * 0.0045) / 12;
          return formatCurrency(pi + taxes + ins);
        },
      },
      {
        label: "DSCR ratio",
        highlight: true,
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate);
          const loan = price * (1 - dn / 100);
          const pi = pmt(loan, r, 360);
          const taxes = (num(f.taxes) || price * 0.012) / 12;
          const ins   = (num(f.ins)   || price * 0.0045) / 12;
          const total = pi + taxes + ins;
          if (total <= 0) return "—";
          const ratio = num(f.rent) / total;
          return ratio.toFixed(2) + (ratio >= 1.25 ? " ✓ Likely qualifies" : " — May need more rent");
        },
      },
    ],
    gateLabel: "Check my full DSCR qualification →",
    gateSubhead: "We'll run your property through our DSCR lender network.",
  },

  "investment-cashflow": {
    fields: [
      { key: "rent",    label: "Monthly gross rent",          placeholder: "2,800", prefix: "$" },
      { key: "price",   label: "Property price",              placeholder: "300,000", prefix: "$" },
      { key: "down",    label: "Down payment %",              placeholder: "20",    suffix: "%" },
      { key: "rate",    label: "Interest rate",               placeholder: "7.25",  suffix: "%" },
      { key: "expenses",label: "Monthly operating expenses",  placeholder: "600",   prefix: "$", hint: "Taxes, ins, maintenance, mgmt" },
    ],
    results: [
      {
        label: "Net operating income (monthly)",
        value: (f) => formatCurrency(Math.max(num(f.rent) - num(f.expenses), 0)),
      },
      {
        label: "Monthly mortgage (P&I)",
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate);
          return formatCurrency(pmt(price * (1 - dn / 100), r, 360));
        },
      },
      {
        label: "Monthly cash flow",
        highlight: true,
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate);
          const noi = num(f.rent) - num(f.expenses);
          const mortgage = pmt(price * (1 - dn / 100), r, 360);
          const cf = noi - mortgage;
          return (cf >= 0 ? "+" : "") + formatCurrency(cf) + "/mo";
        },
      },
      {
        label: "Cash-on-cash return",
        value: (f) => {
          const price = num(f.price); const dn = num(f.down); const r = num(f.rate);
          const downAmt = price * (dn / 100);
          if (downAmt <= 0) return "—";
          const noi = num(f.rent) - num(f.expenses);
          const mortgage = pmt(price * (1 - dn / 100), r, 360);
          const annualCF = (noi - mortgage) * 12;
          return ((annualCF / downAmt) * 100).toFixed(1) + "%";
        },
      },
    ],
    gateLabel: "Get my full investment analysis →",
    gateSubhead: "We'll show you cap rate, IRR, and available financing.",
  },

  "extra-payment": {
    fields: [
      { key: "balance", label: "Remaining loan balance",     placeholder: "280,000", prefix: "$" },
      { key: "rate",    label: "Current interest rate",      placeholder: "6.75",    suffix: "%" },
      { key: "remaining",label: "Years remaining",           placeholder: "25",      suffix: "yrs" },
      { key: "extra",   label: "Extra monthly payment",      placeholder: "250",     prefix: "$" },
    ],
    results: [
      {
        label: "Current payoff",
        value: (f) => `${num(f.remaining) || 25} years`,
      },
      {
        label: "New payoff (with extra payments)",
        highlight: true,
        value: (f) => {
          const bal = num(f.balance); const r = num(f.rate); const yrs = num(f.remaining) || 25;
          const extra = num(f.extra);
          const mr = r / 100 / 12;
          if (bal <= 0 || r <= 0) return "—";
          const stdPmt = pmt(bal, r, yrs * 12);
          const newPmt = stdPmt + extra;
          // solve for n
          if (newPmt <= bal * mr) return "—";
          const n = -Math.log(1 - (bal * mr) / newPmt) / Math.log(1 + mr);
          const savedMonths = yrs * 12 - n;
          const savedYrs = Math.floor(savedMonths / 12);
          const savedMo  = Math.round(savedMonths % 12);
          let result = `${Math.floor(n / 12)}y ${Math.round(n % 12)}mo`;
          if (savedYrs > 0 || savedMo > 0) result += ` (saves ${savedYrs > 0 ? savedYrs + "y " : ""}${savedMo > 0 ? savedMo + "mo" : ""})`;
          return result;
        },
      },
      {
        label: "Total interest saved",
        value: (f) => {
          const bal = num(f.balance); const r = num(f.rate); const yrs = num(f.remaining) || 25;
          const extra = num(f.extra);
          const mr = r / 100 / 12;
          if (bal <= 0 || r <= 0) return "—";
          const stdPmt = pmt(bal, r, yrs * 12);
          const newPmt = stdPmt + extra;
          if (newPmt <= bal * mr) return "—";
          const n = Math.ceil(-Math.log(1 - (bal * mr) / newPmt) / Math.log(1 + mr));
          const stdTotal = stdPmt * yrs * 12 - bal;
          const newTotal = newPmt * n - bal;
          return formatCurrency(Math.max(stdTotal - newTotal, 0));
        },
      },
    ],
    gateLabel: "Get my payoff acceleration plan →",
    gateSubhead: "We'll help you optimize your extra payment strategy.",
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

function NumInput({
  field, value, onChange,
}: {
  field: FieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">
        {field.label}
        {field.hint && <span className="ml-2 text-xs font-normal text-muted">({field.hint})</span>}
      </label>
      <div className="relative flex items-center overflow-hidden rounded-xl border border-line bg-white focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20 transition-all">
        {field.prefix && (
          <span className="select-none border-r border-line bg-sand px-3 py-3 text-sm font-semibold text-muted">
            {field.prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          placeholder={field.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent px-3 py-3 text-sm text-ink placeholder-muted/50 outline-none"
        />
        {field.suffix && (
          <span className="select-none border-l border-line bg-sand px-3 py-3 text-sm font-semibold text-muted">
            {field.suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultCardEl({ card, inputs }: { card: ResultCard; inputs: Record<string, string> }) {
  const value = useMemo(() => card.value(inputs), [card, inputs]);
  return (
    <div className={`rounded-2xl border p-4 ${card.highlight ? "border-accent/30 bg-accent/5" : "border-line bg-white"}`}>
      <div className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">{card.label}</div>
      <div className={`text-xl font-extrabold ${card.highlight ? "text-accent" : "text-ink"}`}>{value}</div>
    </div>
  );
}

function TextField({
  label, type = "text", placeholder, value, onChange, error,
}: {
  label: string; type?: string; placeholder: string; value: string;
  onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all focus:ring-2 focus:ring-accent/20 ${
          error ? "border-red-300 bg-red-50/50 focus:border-red-400" : "border-line bg-white focus:border-accent"
        }`}
      />
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}

const SMS_CONSENT_TEXT =
  "By submitting this form, I agree to be contacted by Harris Capital Mortgage Group, LLC (NMLS# 1918223) regarding my mortgage inquiry. I consent to receive calls, texts, and emails. Message and data rates may apply. Reply STOP to opt out of texts at any time.";

// ── Main component ────────────────────────────────────────────────────────────

type Stage = "calc" | "form" | "success";

export function CalcFunnel({
  funnelType,
  funnelHeadline,
  funnelSubhead,
  funnelBadge,
  lo,
  source,
  seoSlug,
}: {
  funnelType: string;
  funnelHeadline?: string;
  funnelSubhead?: string;
  funnelBadge?: string;
  lo?: FunnelLoContext;
  source?: string;
  seoSlug?: string;
}) {
  const def = CALC_DEFS[funnelType];

  // Per-field input state
  const initialInputs = Object.fromEntries((def?.fields ?? []).map((f) => [f.key, ""]));
  const [inputs, setInputs] = useState<Record<string, string>>(initialInputs);

  // Contact form state
  const [firstName, setFirstName] = useState("");
  const [email, setEmail]         = useState("");
  const [phone, setPhone]         = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [errors, setErrors]       = useState<Partial<Record<"firstName" | "email" | "phone" | "smsConsent", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const [stage, setStage] = useState<Stage>("calc");
  const [dir, setDir]     = useState<1 | -1>(1);

  function setInput(key: string, val: string) {
    setInputs((prev) => ({ ...prev, [key]: val }));
  }

  function validate() {
    const e: typeof errors = {};
    if (!firstName.trim()) e.firstName = "Enter your first name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email address.";
    if (phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit phone number.";
    if (!smsConsent) e.smsConsent = "Consent is required to continue.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
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
      source: source ?? (lo ? "team" : "get-started"),
      seoSlug,
      funnelType,
      goal: undefined,
      loSlug: lo?.slug,
      loName: lo?.name,
      loNmls: lo?.nmls,
      ...utmsToPayload(getStoredUtms()),
      sessionId: meta.sessionId,
      entryPage: meta.entryPage,
      referrer: meta.referrer,
      device: meta.device,
    });

    if (result.success) {
      identifyLead(meta.sessionId, {
        email: email.trim(),
        name: firstName.trim(),
        loSlug: lo?.slug,
        loName: lo?.name,
        utmSource: getStoredUtms().utm_source,
      });
      getPostHog().capture("lead_submitted", {
        funnel_type: funnelType,
        lo_slug: lo?.slug,
        utm_source: getStoredUtms().utm_source,
      });
    }

    setSubmitting(false);
    if (result.success) {
      setDir(1); setStage("success");
    } else {
      setSubmitError(result.error ?? "Something went wrong. Please try again.");
    }
  }

  // Track when user moves from calc → form
  function handleGetReport() {
    trackFunnelStep(1, "calculator-to-form", 0);
    setDir(1); setStage("form");
  }

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
  };
  const transition = { duration: 0.28, ease: "easeOut" };

  if (!def) {
    return (
      <div className="mx-auto max-w-[560px] rounded-2xl border border-line bg-white p-8 text-center text-muted">
        Calculator not found for funnel: <code>{funnelType}</code>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[640px]">

      {/* Funnel header badge */}
      <div className="mb-5 overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="flex items-center gap-3 px-5 py-4">
          <div className="flex-1 min-w-0">
            {funnelBadge && (
              <span className="mb-1 inline-block rounded-full border border-accent/30 bg-accent/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                {funnelBadge}
              </span>
            )}
            <div className="text-base font-extrabold text-ink leading-snug">
              {funnelHeadline ?? "Mortgage Calculator"}
            </div>
            {funnelSubhead && <div className="mt-0.5 text-xs text-muted">{funnelSubhead}</div>}
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-line">
          <div
            className="h-full rounded-r-full transition-all duration-500 ease-out"
            style={{
              width: stage === "calc" ? "50%" : stage === "form" ? "90%" : "100%",
              background: "var(--ok-gradient)",
            }}
          />
        </div>
      </div>

      {/* Stage indicator */}
      {stage !== "success" && (
        <div className="mb-5 flex items-center gap-2 text-xs font-semibold text-muted">
          <span className={stage === "calc" ? "text-accent" : ""}>① Calculate</span>
          <span className="text-line">—</span>
          <span className={stage === "form" ? "text-accent" : ""}>② Get your report</span>
        </div>
      )}

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={stage}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={transition}
        >

          {/* ── STAGE: calc ── */}
          {stage === "calc" && (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Left: Inputs */}
              <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
                <h2 className="mb-4 text-base font-extrabold text-ink">Enter your numbers</h2>
                <div className="space-y-4">
                  {def.fields.map((field) => (
                    <NumInput
                      key={field.key}
                      field={field}
                      value={inputs[field.key]}
                      onChange={(v) => setInput(field.key, v)}
                    />
                  ))}
                </div>
              </div>

              {/* Right: Gated results */}
              <div className="flex flex-col gap-4">
                {/* Blurred result cards + unlock overlay */}
                <div className="relative rounded-2xl border border-line bg-sand p-5 overflow-hidden">
                  {/* Blurred cards — rendered but hidden */}
                  <div className="select-none blur-sm pointer-events-none" aria-hidden="true">
                    <h2 className="mb-3 text-sm font-extrabold uppercase tracking-[0.13em] text-muted">
                      Your result
                    </h2>
                    <div className="space-y-3">
                      {def.results.map((card) => (
                        <ResultCardEl key={card.label} card={card} inputs={inputs} />
                      ))}
                    </div>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-2xl bg-white/80 px-5 text-center backdrop-blur-[2px]">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-white text-lg"
                      style={{ background: "var(--ok-gradient)" }}
                    >
                      🔒
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-ink">Your results are ready</p>
                      <p className="mt-1 text-xs text-muted">Fill in your info to unlock your personalized numbers.</p>
                    </div>
                    <button
                      onClick={handleGetReport}
                      className="primary-button w-full justify-center !py-3"
                    >
                      {def.gateLabel}
                    </button>
                    <p className="text-[11px] text-muted/70">{def.gateSubhead}</p>
                  </div>
                </div>

                <p className="text-center text-[11px] text-muted/60 leading-5">
                  Results are illustrative estimates. Not a commitment to lend.
                </p>
              </div>
            </div>
          )}

          {/* ── STAGE: form ── */}
          {stage === "form" && (
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <h2 className="mb-1 text-xl font-extrabold text-ink">One last step</h2>
              <p className="mb-6 text-sm text-muted">
                Tell us where to send your personalized report and we&apos;ll connect you with a licensed loan officer.
              </p>

              {/* Mini result summary */}
              <div className="mb-6 rounded-xl border border-line bg-sand px-4 py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.12em] text-muted mb-2">Your estimate</div>
                <div className="space-y-1.5">
                  {def.results.filter((c) => c.highlight).map((card) => (
                    <div key={card.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted">{card.label}</span>
                      <span className="text-sm font-extrabold text-accent">{card.value(inputs)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <TextField label="First name *" placeholder="First name" value={firstName} onChange={setFirstName} error={errors.firstName} />
                <TextField label="Email address *" type="email" placeholder="email@example.com" value={email} onChange={setEmail} error={errors.email} />
                <TextField
                  label="Phone number *" type="tel" placeholder="(555) 000-0000"
                  value={phone}
                  onChange={(v) => setPhone(formatPhone(v))}
                  error={errors.phone}
                />

                <label className={`block rounded-xl border px-4 py-4 transition-colors ${errors.smsConsent ? "border-red-300 bg-red-50/60" : "border-line bg-white"}`}>
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox" checked={smsConsent}
                      onChange={(e) => setSmsConsent(e.target.checked)}
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
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError}</div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !smsConsent}
                  className="primary-button w-full justify-center !py-4 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting…" : def.gateLabel}
                </button>
              </div>
            </div>
          )}

          {/* ── STAGE: success ── */}
          {stage === "success" && (
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
                You&apos;re all set{firstName ? `, ${firstName}` : ""}!
              </h2>
              <p className="mb-8 text-base leading-7 text-muted">
                {lo
                  ? `${lo.name} will reach out within one business day to walk through your options.`
                  : "A licensed loan officer from Harris Capital Mortgage Group will reach out within one business day to walk through your options."}
              </p>
              <div className="mb-8 space-y-3 text-left">
                {[
                  { icon: "📧", title: "Check your email",  body: "A confirmation with your estimate summary is on its way." },
                  { icon: "📞", title: "Expect a call",     body: "Within 1 business day from our team in your market." },
                  { icon: "🤝", title: "No pressure",       body: "We're here to help, not to push. You're in control." },
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
              <Link href="/" className="secondary-button inline-flex">Return to home</Link>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
