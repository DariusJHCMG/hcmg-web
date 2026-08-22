import { NextRequest, NextResponse } from "next/server";
import { resultStore } from "@/lib/arive-lookup-store";

// ── POST /api/liftoff/arive-result ───────────────────────────────────────────
// Zapier POSTs loan data here after fetching from ARIVE.
// Stores result keyed by requestId so the browser poll can pick it up.
//
// Expected body from Zapier Step 3 (field names we told Zapier to use):
// {
//   requestId        string   — echoed from the original lookup request
//   found            "true"
//   borrowerFirstName, borrowerLastName
//   loanPurpose      "Purchase" | "Refinance"   ← ARIVE "Loan Purpose"
//   mortgageType     "Conventional"|"FHA"|"VA"|"NonQM"|...  ← ARIVE "Mortgage Type"
//   loanAmount       number
//   purchasePrice    number
//   propertyAddress, propertyCity, propertyState, propertyZip
//   lockStatus       "None" | "Locked" | etc from ARIVE
//   noteRate         number (optional)
//   lenderName       string (optional)
//   productName      string (optional)
// }

// ── loanPurpose → our loan_type values ───────────────────────────────────────
// ARIVE "Loan Purpose" = Purchase / Refinance
// ARIVE "Mortgage Type" = Conventional / FHA / VA / NonQM / USDA / etc.
// Our wizard loan_type options: "purchase" | "purchase_fha" | "purchase_va" |
//   "purchase_usda" | "refinance" | "refinance_fha" | "refinance_va" | "refinance_usda"
// We combine both ARIVE fields to get the most specific value.
function mapLoanType(loanPurpose: string, mortgageType: string): string {
  const purpose  = loanPurpose.toLowerCase().trim();
  const mortgage = mortgageType.toLowerCase().trim();
  const isFHA    = mortgage === "fha";
  const isVA     = mortgage === "va";
  const isUSDA   = mortgage.includes("usda") || mortgage.includes("rural");

  if (purpose === "purchase") {
    if (isFHA)  return "purchase_fha";
    if (isVA)   return "purchase_va";
    if (isUSDA) return "purchase_usda";
    return "purchase";
  }
  if (purpose === "refinance") {
    if (isFHA)  return "refinance_fha";
    if (isVA)   return "refinance_va";
    if (isUSDA) return "refinance_usda";
    return "refinance";
  }
  // Fallback — return raw purpose lowercased
  return purpose || "purchase";
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const requestId = body.requestId as string | undefined;
  if (!requestId) {
    return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
  }

  // ── Map lock status ───────────────────────────────────────────────────────
  const lockRaw = String(body.lockStatus ?? "").toLowerCase();
  const lockStatus: "locked" | "floating" | "lock_required" =
    lockRaw === "locked" || lockRaw === "1"         ? "locked" :
    lockRaw === "lock_required" || lockRaw === "3"  ? "lock_required" :
    "floating";

  // ── Map loan type (purpose + mortgage type combined) ─────────────────────
  const loanPurpose   = String(body.loanPurpose  ?? body.loanType ?? "");
  const mortgageType  = String(body.mortgageType ?? "");
  const loanType = mapLoanType(loanPurpose, mortgageType);

  const result = {
    found:             true as const,
    borrowerFirstName: (body.borrowerFirstName as string) || null,
    borrowerLastName:  (body.borrowerLastName  as string) || null,
    loanType,
    loanAmount:        body.loanAmount    ? Number(body.loanAmount)    : null,
    purchasePrice:     body.purchasePrice ? Number(body.purchasePrice) : null,
    propertyAddress:   (body.propertyAddress as string) || null,
    propertyCity:      (body.propertyCity    as string) || null,
    propertyState:     (body.propertyState   as string) || null,
    propertyZip:       (body.propertyZip     as string) || null,
    lockStatus,
    noteRate:          body.noteRate    ? Number(body.noteRate)    : null,
    lenderName:        (body.lenderName  as string) || null,
    productName:       (body.productName as string) || null,
  };

  resultStore.set(requestId, result);
  return NextResponse.json({ ok: true });
}
