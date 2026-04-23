import { NextRequest, NextResponse } from "next/server";
import { calculateMortgageEstimate } from "@/lib/calculators";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const estimate = calculateMortgageEstimate({
    homePrice: Number(body.homePrice ?? 0),
    downPaymentPercent: Number(body.downPaymentPercent ?? 0),
    annualRatePercent: Number(body.annualRatePercent ?? 0),
    loanTermYears: Number(body.loanTermYears ?? 30),
    annualTaxes: body.annualTaxes ? Number(body.annualTaxes) : undefined,
    annualInsurance: body.annualInsurance ? Number(body.annualInsurance) : undefined,
    monthlyHoa: body.monthlyHoa ? Number(body.monthlyHoa) : undefined,
  });

  return NextResponse.json({ estimate });
}
