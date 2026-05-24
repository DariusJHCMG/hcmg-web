"use client";

import { useState } from "react";

type Loan = {
  lender: string;
  term: "30yr Fixed" | "15yr Fixed";
  rate: string;
  apr: string;
  points: string;
  uwFee: string;
};

const SAMPLE_RATES: Record<"purchase" | "refinance", { thirty: Loan[]; fifteen: Loan[] }> = {
  purchase: {
    thirty: [
      { lender: "Lender Alpha", term: "30yr Fixed", rate: "6.625%", apr: "6.682%", points: "0.412%", uwFee: "$1,095" },
      { lender: "Lender Beta", term: "30yr Fixed", rate: "6.625%", apr: "6.681%", points: "0.428%", uwFee: "$1,120" },
      { lender: "Lender Gamma", term: "30yr Fixed", rate: "6.750%", apr: "6.812%", points: "0.376%", uwFee: "$995" },
      { lender: "Lender Delta", term: "30yr Fixed", rate: "6.750%", apr: "6.806%", points: "0.451%", uwFee: "$1,195" },
    ],
    fifteen: [
      { lender: "Lender Alpha", term: "15yr Fixed", rate: "5.875%", apr: "5.951%", points: "0.302%", uwFee: "$1,095" },
      { lender: "Lender Beta", term: "15yr Fixed", rate: "5.875%", apr: "5.948%", points: "0.318%", uwFee: "$1,120" },
      { lender: "Lender Gamma", term: "15yr Fixed", rate: "5.999%", apr: "6.075%", points: "0.266%", uwFee: "$995" },
    ],
  },
  refinance: {
    thirty: [
      { lender: "Lender Alpha", term: "30yr Fixed", rate: "6.750%", apr: "6.802%", points: "0.523%", uwFee: "$1,095" },
      { lender: "Lender Beta", term: "30yr Fixed", rate: "6.875%", apr: "6.928%", points: "0.401%", uwFee: "$1,120" },
      { lender: "Lender Gamma", term: "30yr Fixed", rate: "6.875%", apr: "6.932%", points: "0.487%", uwFee: "$995" },
    ],
    fifteen: [
      { lender: "Lender Alpha", term: "15yr Fixed", rate: "6.125%", apr: "6.198%", points: "0.341%", uwFee: "$1,095" },
      { lender: "Lender Beta", term: "15yr Fixed", rate: "6.125%", apr: "6.196%", points: "0.366%", uwFee: "$1,120" },
    ],
  },
};

export function PricingEnginePreview() {
  const [purpose, setPurpose] = useState<"purchase" | "refinance">("purchase");
  const [term, setTerm] = useState<"thirty" | "fifteen">("thirty");
  const [bps, setBps] = useState<150 | 200 | 225 | 275>(275);

  // Net Commission scales with purchase price ($500k) × bps / 10000
  const netCommission = Math.round((500000 * bps) / 10000).toLocaleString("en-US");
  const rows = SAMPLE_RATES[purpose][term];

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white shadow-card">
      {/* Navy top band — premium look */}
      <div className="bg-brand px-5 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              HCMG Pricing Engine
            </div>
            <div className="mt-0.5 text-sm font-bold text-white">
              Sample preview — same UI your borrowers and team will use
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Demo mode
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-8">
        {/* Loan Purpose tabs */}
        <Label>Loan Purpose</Label>
        <div className="mt-2 inline-flex rounded-xl border border-line bg-sand p-1">
          <PurposeTab active={purpose === "purchase"} onClick={() => setPurpose("purchase")}>
            Purchase
          </PurposeTab>
          <PurposeTab active={purpose === "refinance"} onClick={() => setPurpose("refinance")}>
            Refinance
          </PurposeTab>
        </div>

        {/* Form grid — static visual fields */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="State" value="Nevada" />
          <Field label={purpose === "purchase" ? "Purchase Price" : "Loan Amount"} value="$500,000" />
          <Field
            label={purpose === "purchase" ? "Down Payment" : "Equity"}
            value="$100,000"
            trailing="20%"
          />
          <Field label="Credit Score" value="740+" />
          <Field label="Property Type" value="Single Family" />
          <Field label="Residency" value="Primary Home" />
          <Field label="Loan Type" value="Conventional" />
          <Field label="UW Fee" value="Fee Out" />
        </div>

        {/* Comp + Net display */}
        <div className="mt-7 grid items-end gap-4 border-t border-line pt-6 sm:grid-cols-[1fr_1fr] lg:grid-cols-[1fr_auto_auto]">
          <div>
            <Label>Compensation</Label>
            <div className="mt-2 inline-flex flex-wrap gap-2">
              {[150, 200, 225, 275].map((b) => (
                <button
                  key={b}
                  onClick={() => setBps(b as 150 | 200 | 225 | 275)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    bps === b
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-white text-ink hover:border-brand"
                  }`}
                >
                  {b} bps {b === 275 ? "(BPC)" : ""}
                </button>
              ))}
            </div>
          </div>
          <div className="text-right">
            <Label>Net Commission</Label>
            <div
              className="mt-1 font-extrabold tracking-tight text-brand"
              style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}
            >
              ${netCommission}
            </div>
          </div>
          <div className="text-right">
            <Label>Net BPS</Label>
            <div
              className="mt-1 font-extrabold tracking-tight text-accent"
              style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}
            >
              {bps}
            </div>
          </div>
        </div>

        {/* Term switcher + sample rates */}
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-ink">
              Sample Lender Rates ({bps} bps)
            </h3>
            <div className="inline-flex rounded-xl border border-line bg-sand p-1 text-xs">
              <TermTab active={term === "thirty"} onClick={() => setTerm("thirty")}>
                30yr Fixed
              </TermTab>
              <TermTab active={term === "fifteen"} onClick={() => setTerm("fifteen")}>
                15yr Fixed
              </TermTab>
            </div>
          </div>

          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.lender}
                className="grid grid-cols-1 items-center gap-3 rounded-2xl border border-line bg-white px-5 py-4 sm:grid-cols-[1.4fr_1fr_1fr_1fr] sm:gap-4"
              >
                <div>
                  <div className="text-sm font-bold text-ink">{row.lender}</div>
                  <div className="text-xs text-muted">{row.term}</div>
                </div>
                <div className="sm:text-right">
                  <div className="text-base font-extrabold text-ink">{row.rate}</div>
                  <div className="text-[11px] text-muted">{row.apr} APR</div>
                </div>
                <div className="sm:text-right">
                  <div className="text-sm font-bold text-accent">{row.points}</div>
                  <div className="text-[11px] text-muted">Points</div>
                </div>
                <div className="sm:text-right">
                  <div className="text-sm font-bold text-ink">{row.uwFee}</div>
                  <div className="text-[11px] text-muted">UW Fee</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="mt-6 text-[11px] leading-relaxed text-muted/70">
          Sample pricing preview for recruiting and platform demonstration only. Not a commitment to lend.
          Rates, pricing, compensation, and investor availability vary by scenario, credit profile, property,
          state, and approval. Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender.
        </p>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{children}</div>
  );
}

function Field({ label, value, trailing }: { label: string; value: string; trailing?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-1.5 flex items-center justify-between rounded-xl border border-line bg-white px-3.5 py-2.5">
        <span className="text-sm font-semibold text-ink">{value}</span>
        {trailing && <span className="text-xs font-semibold text-muted">{trailing}</span>}
      </div>
    </div>
  );
}

function PurposeTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
        active ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function TermTab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
        active ? "bg-brand text-white shadow-sm" : "text-muted hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
