export type LoanType = "conventional" | "fha" | "va" | "usda";

export type EstimateInput = {
  homePrice: number;
  downPaymentPercent: number;
  annualRatePercent: number;
  loanTermYears: number;
  annualTaxes?: number;
  annualInsurance?: number;
  monthlyHoa?: number;
  loanType?: LoanType;
};

export type EstimateOutput = {
  loanAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  monthlyMip: number;        // FHA MIP / VA funding fee spread / USDA guarantee fee
  totalMonthlyPayment: number;
  downPaymentAmount: number;
};

export type AmortizationRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

// FHA annual MIP rate (as of 2024) — 0.55% for 30-yr, LTV > 90%
const FHA_MIP_RATE = 0.0055;
// USDA annual guarantee fee
const USDA_ANNUAL_FEE = 0.0035;

export function calculateMortgageEstimate(input: EstimateInput): EstimateOutput {
  const downPaymentAmount = input.homePrice * (input.downPaymentPercent / 100);
  const loanAmount = Math.max(input.homePrice - downPaymentAmount, 0);
  const monthlyRate = input.annualRatePercent / 100 / 12;
  const numberOfPayments = input.loanTermYears * 12;

  const monthlyPrincipalAndInterest =
    monthlyRate === 0
      ? loanAmount / numberOfPayments
      : (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const monthlyTaxes = (input.annualTaxes ?? input.homePrice * 0.012) / 12;
  const monthlyInsurance = (input.annualInsurance ?? input.homePrice * 0.0045) / 12;
  const monthlyHoa = input.monthlyHoa ?? 0;

  // Mortgage insurance by loan type
  let monthlyMip = 0;
  const lt = input.loanType ?? "conventional";
  if (lt === "fha") {
    monthlyMip = (loanAmount * FHA_MIP_RATE) / 12;
  } else if (lt === "usda") {
    monthlyMip = (loanAmount * USDA_ANNUAL_FEE) / 12;
  }
  // VA: one-time funding fee (not monthly) — we show $0/mo with a note
  // Conventional with <20% down: PMI roughly 0.5–1.5%, default ~0.8%
  if (lt === "conventional" && input.downPaymentPercent < 20) {
    monthlyMip = (loanAmount * 0.008) / 12;
  }

  return {
    loanAmount,
    monthlyPrincipalAndInterest,
    monthlyTaxes,
    monthlyInsurance,
    monthlyHoa,
    monthlyMip,
    totalMonthlyPayment:
      monthlyPrincipalAndInterest + monthlyTaxes + monthlyInsurance + monthlyHoa + monthlyMip,
    downPaymentAmount,
  };
}

export function generateAmortizationSchedule(input: EstimateInput): AmortizationRow[] {
  const downPaymentAmount = input.homePrice * (input.downPaymentPercent / 100);
  let balance = Math.max(input.homePrice - downPaymentAmount, 0);
  const monthlyRate = input.annualRatePercent / 100 / 12;
  const numberOfPayments = input.loanTermYears * 12;

  const payment =
    monthlyRate === 0
      ? balance / numberOfPayments
      : (balance * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
        (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  const rows: AmortizationRow[] = [];
  for (let month = 1; month <= numberOfPayments; month++) {
    const interest = balance * monthlyRate;
    const principal = payment - interest;
    balance = Math.max(balance - principal, 0);
    rows.push({ month, payment, principal, interest, balance });
  }
  return rows;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 3): string {
  return `${value.toFixed(decimals)}%`;
}
