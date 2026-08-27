/**
 * tests/calculators.test.ts
 *
 * Unit tests for lib/calculators.ts — mortgage payment math, amortization
 * schedule generation, MIP/PMI calculations, and formatting helpers.
 */

import { describe, it, expect } from "vitest";
import {
  calculateMortgageEstimate,
  generateAmortizationSchedule,
  formatCurrency,
  formatPercent,
} from "../lib/calculators";

// ── calculateMortgageEstimate ─────────────────────────────────────────────────

describe("calculateMortgageEstimate", () => {
  // Classic textbook case: $300k loan, 6% annual, 30-year fixed
  // P&I = 300000 * (0.005 * 1.005^360) / (1.005^360 - 1) = $1,798.65
  it("computes P&I correctly for a standard 30-year fixed loan", () => {
    const result = calculateMortgageEstimate({
      homePrice: 375000,
      downPaymentPercent: 20,
      annualRatePercent: 6,
      loanTermYears: 30,
    });
    // loanAmount = 375000 * 0.80 = 300000
    expect(result.loanAmount).toBe(300000);
    expect(result.downPaymentAmount).toBe(75000);
    // P&I should be close to $1,798.65
    expect(result.monthlyPrincipalAndInterest).toBeCloseTo(1798.65, 0);
  });

  it("handles 0% interest rate (interest-free scenario)", () => {
    const result = calculateMortgageEstimate({
      homePrice: 120000,
      downPaymentPercent: 0,
      annualRatePercent: 0,
      loanTermYears: 30,
    });
    // 0% rate → monthly = loanAmount / numberOfPayments
    expect(result.loanAmount).toBe(120000);
    expect(result.monthlyPrincipalAndInterest).toBeCloseTo(120000 / 360, 2);
  });

  it("handles 100% down payment (edge case — $0 loan)", () => {
    const result = calculateMortgageEstimate({
      homePrice: 400000,
      downPaymentPercent: 100,
      annualRatePercent: 7,
      loanTermYears: 30,
    });
    expect(result.loanAmount).toBe(0);
    expect(result.monthlyPrincipalAndInterest).toBe(0);
    expect(result.totalMonthlyPayment).toBeGreaterThan(0); // taxes/insurance still apply
  });

  it("uses default taxes and insurance when not provided", () => {
    const result = calculateMortgageEstimate({
      homePrice: 400000,
      downPaymentPercent: 20,
      annualRatePercent: 7,
      loanTermYears: 30,
    });
    // default annual taxes = homePrice * 0.012 = 4800 → /12 = 400
    expect(result.monthlyTaxes).toBeCloseTo(400, 0);
    // default annual insurance = homePrice * 0.0045 = 1800 → /12 = 150
    expect(result.monthlyInsurance).toBeCloseTo(150, 0);
    expect(result.monthlyMip).toBe(0); // conventional ≥20% down → no PMI
  });

  it("uses provided taxes and insurance over defaults", () => {
    const result = calculateMortgageEstimate({
      homePrice: 400000,
      downPaymentPercent: 20,
      annualRatePercent: 7,
      loanTermYears: 30,
      annualTaxes: 6000,
      annualInsurance: 1200,
      monthlyHoa: 250,
    });
    expect(result.monthlyTaxes).toBeCloseTo(500, 0);
    expect(result.monthlyInsurance).toBeCloseTo(100, 0);
    expect(result.monthlyHoa).toBe(250);
  });

  it("totalMonthlyPayment is sum of all components", () => {
    const result = calculateMortgageEstimate({
      homePrice: 300000,
      downPaymentPercent: 10,
      annualRatePercent: 6.5,
      loanTermYears: 30,
      annualTaxes: 3600,
      annualInsurance: 1200,
      monthlyHoa: 100,
    });
    const expected =
      result.monthlyPrincipalAndInterest +
      result.monthlyTaxes +
      result.monthlyInsurance +
      result.monthlyHoa +
      result.monthlyMip;
    expect(result.totalMonthlyPayment).toBeCloseTo(expected, 2);
  });
});

// ── MIP and PMI ───────────────────────────────────────────────────────────────

describe("mortgage insurance by loan type", () => {
  it("FHA loan adds MIP (0.55% annual of loan amount)", () => {
    const result = calculateMortgageEstimate({
      homePrice: 300000,
      downPaymentPercent: 3.5,
      annualRatePercent: 6.5,
      loanTermYears: 30,
      loanType: "fha",
    });
    const expectedMip = (result.loanAmount * 0.0055) / 12;
    expect(result.monthlyMip).toBeCloseTo(expectedMip, 2);
  });

  it("USDA loan adds guarantee fee (0.35% annual)", () => {
    const result = calculateMortgageEstimate({
      homePrice: 200000,
      downPaymentPercent: 0,
      annualRatePercent: 6,
      loanTermYears: 30,
      loanType: "usda",
    });
    const expectedFee = (result.loanAmount * 0.0035) / 12;
    expect(result.monthlyMip).toBeCloseTo(expectedFee, 2);
  });

  it("VA loan has no monthly MIP ($0)", () => {
    const result = calculateMortgageEstimate({
      homePrice: 400000,
      downPaymentPercent: 0,
      annualRatePercent: 6,
      loanTermYears: 30,
      loanType: "va",
    });
    expect(result.monthlyMip).toBe(0);
  });

  it("conventional <20% down adds PMI (~0.8% annual)", () => {
    const result = calculateMortgageEstimate({
      homePrice: 300000,
      downPaymentPercent: 10,
      annualRatePercent: 6.5,
      loanTermYears: 30,
      loanType: "conventional",
    });
    const expectedPmi = (result.loanAmount * 0.008) / 12;
    expect(result.monthlyMip).toBeCloseTo(expectedPmi, 2);
  });

  it("conventional ≥20% down has no PMI", () => {
    const result = calculateMortgageEstimate({
      homePrice: 300000,
      downPaymentPercent: 20,
      annualRatePercent: 6.5,
      loanTermYears: 30,
      loanType: "conventional",
    });
    expect(result.monthlyMip).toBe(0);
  });
});

// ── generateAmortizationSchedule ─────────────────────────────────────────────

describe("generateAmortizationSchedule", () => {
  const input = {
    homePrice: 300000,
    downPaymentPercent: 0,
    annualRatePercent: 6,
    loanTermYears: 30,
  };

  it("returns 360 rows for a 30-year loan", () => {
    const rows = generateAmortizationSchedule(input);
    expect(rows).toHaveLength(360);
  });

  it("first row has correct month number", () => {
    const rows = generateAmortizationSchedule(input);
    expect(rows[0].month).toBe(1);
    expect(rows[359].month).toBe(360);
  });

  it("balance reaches ~0 by the final payment", () => {
    const rows = generateAmortizationSchedule(input);
    expect(rows[rows.length - 1].balance).toBeCloseTo(0, 0);
  });

  it("each row's interest = balance * monthly rate", () => {
    const rows = generateAmortizationSchedule(input);
    const monthlyRate = 6 / 100 / 12;
    // Check first 5 rows
    let balance = 300000;
    for (let i = 0; i < 5; i++) {
      const expectedInterest = balance * monthlyRate;
      expect(rows[i].interest).toBeCloseTo(expectedInterest, 2);
      balance -= rows[i].principal;
    }
  });
});

// ── formatCurrency ────────────────────────────────────────────────────────────

describe("formatCurrency", () => {
  it("formats whole dollar amounts with $ and commas", () => {
    expect(formatCurrency(0)).toBe("$0");
    expect(formatCurrency(1000)).toBe("$1,000");
    expect(formatCurrency(1234567)).toBe("$1,234,567");
  });

  it("rounds to whole dollars (no cents)", () => {
    expect(formatCurrency(1234.99)).toBe("$1,235");
  });
});

// ── formatPercent ─────────────────────────────────────────────────────────────

describe("formatPercent", () => {
  it("defaults to 3 decimal places", () => {
    expect(formatPercent(6.5)).toBe("6.500%");
    expect(formatPercent(0)).toBe("0.000%");
  });

  it("respects custom decimal places", () => {
    expect(formatPercent(6.5, 1)).toBe("6.5%");
    expect(formatPercent(6.5, 0)).toBe("7%");
  });
});
