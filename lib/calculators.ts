export type EstimateInput = {
  homePrice: number;
  downPaymentPercent: number;
  annualRatePercent: number;
  loanTermYears: number;
  annualTaxes?: number;
  annualInsurance?: number;
  monthlyHoa?: number;
};

export type EstimateOutput = {
  loanAmount: number;
  monthlyPrincipalAndInterest: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  totalMonthlyPayment: number;
  downPaymentAmount: number;
};

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

  return {
    loanAmount,
    monthlyPrincipalAndInterest,
    monthlyTaxes,
    monthlyInsurance,
    monthlyHoa,
    totalMonthlyPayment: monthlyPrincipalAndInterest + monthlyTaxes + monthlyInsurance + monthlyHoa,
    downPaymentAmount,
  };
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
