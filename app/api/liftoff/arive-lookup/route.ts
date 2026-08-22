import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";

// ── ARIVE Lookup — direct REST API call ──────────────────────────────────────
//
// Flow:
//   1. LO types ARIVE loan number → clicks "Look up"
//   2. This route calls GET https://api.arive.com/api/loans
//      with searchField=DISPLAY_ID (numeric) or LENDER_LOAN_ID (raw string)
//   3. Maps the first result to AriveLoanData and returns it to the wizard
//   4. The wizard auto-fills all matching fields
//
// Required env var:
//   ARIVE_API_KEY=<from ARIVE Settings → API Integrations → API Key>
//
// ── REVERT NOTES ────────────────────────────────────────────────────────────
// To revert to the previous Zapier-webhook version, restore from git:
//   git checkout HEAD -- app/api/liftoff/arive-lookup/route.ts
//   and swap ARIVE_API_KEY back to ARIVE_ZAPIER_WEBHOOK_URL in your env.
// The wizard (LiftOffWizard.tsx) was NOT changed — no wizard revert needed.
// ─────────────────────────────────────────────────────────────────────────────

const ARIVE_BASE = "https://api.arive.com";

// ── Demo loans — returned instantly without any API call ─────────────────────
// Share these loan numbers with the team for presentations / testing.
const DEMO_LOANS: Record<string, object> = {
  "HCMG-DEMO-001": {
    found:               true,
    borrowerFirstName:   "Marcus",
    borrowerLastName:    "Johnson",
    coBorrowerFirstName: "Tanya",
    coBorrowerLastName:  "Johnson",
    loanType:            "purchase",
    loanAmount:          425000,
    purchasePrice:       500000,
    propertyAddress:     "412 Lakeside Blvd",
    propertyCity:        "Orlando",
    propertyState:       "FL",
    propertyZip:         "32801",
    targetCloseDate:     "2025-10-31",
    lockStatus:          "locked",
    floatReason:         null,
  },
  "HCMG-DEMO-002": {
    found:               true,
    borrowerFirstName:   "Renee",
    borrowerLastName:    "Williams",
    coBorrowerFirstName: null,
    coBorrowerLastName:  null,
    loanType:            "refinance",
    loanAmount:          310000,
    purchasePrice:       null,
    propertyAddress:     "8801 Cypress Creek Pkwy",
    propertyCity:        "Houston",
    propertyState:       "TX",
    propertyZip:         "77070",
    targetCloseDate:     "2025-11-14",
    lockStatus:          "floating",
    floatReason:         "Waiting for rate improvement — client approved float strategy",
  },
};

// ── Loan number normalisation ────────────────────────────────────────────────
// Wizard sends strings like "HCMG-2025-4471".
// ARIVE DISPLAY_ID expects the numeric part: 4471.
// If the whole string is already a number, use it directly.
// If we can't extract a number, fall back to LENDER_LOAN_ID with the raw string.
function normalizeLoanNumber(raw: string): { displayId?: number; lenderLoanId?: string } {
  const trimmed = raw.trim();
  // All-numeric?
  if (/^\d+$/.test(trimmed)) return { displayId: parseInt(trimmed, 10) };
  // Has a trailing numeric segment after a dash?
  const match = trimmed.match(/-(\d+)$/);
  if (match) return { displayId: parseInt(match[1], 10) };
  // Fall back to lender loan ID search with raw string
  return { lenderLoanId: trimmed };
}

// ── lockStatus mapping (ARIVE integer → our LockStatus string) ───────────────
// 0 = not locked/floating, 1 = locked, 2 = lock expired, 3 = lock requested
function mapLockStatus(status: unknown): "locked" | "floating" | "lock_required" {
  if (status === 1) return "locked";
  if (status === 3) return "lock_required";
  return "floating";
}

// ── loanPurpose mapping ───────────────────────────────────────────────────────
function mapLoanType(purpose: unknown): string | undefined {
  if (typeof purpose !== "string") return undefined;
  const p = purpose.toLowerCase();
  if (p === "purchase") return "purchase";
  if (p === "refinance") return "refinance";
  return p; // pass through any other value
}

// ── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { loanNumber } = await req.json().catch(() => ({})) as { loanNumber?: string };
  if (!loanNumber?.trim()) {
    return NextResponse.json({ error: "Loan number is required" }, { status: 400 });
  }

  // ── Demo loan numbers — always work, no API call needed ──────────────────
  const demoKey = loanNumber.trim().toUpperCase();
  if (DEMO_LOANS[demoKey]) {
    await new Promise(r => setTimeout(r, 800)); // simulate brief network delay
    return NextResponse.json(DEMO_LOANS[demoKey]);
  }

  // ── Require ARIVE API key ────────────────────────────────────────────────
  const apiKey = process.env.ARIVE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ARIVE lookup is not configured yet. Please fill in the loan details manually.", notConfigured: true },
      { status: 503 },
    );
  }

  // ── Normalise loan number → build search params ──────────────────────────
  const { displayId, lenderLoanId } = normalizeLoanNumber(loanNumber);
  const searchField = displayId !== undefined ? "DISPLAY_ID" : "LENDER_LOAN_ID";
  const searchValue = displayId !== undefined ? String(displayId) : (lenderLoanId ?? loanNumber.trim());

  const searchUrl = new URL(`${ARIVE_BASE}/api/loans`);
  searchUrl.searchParams.set("searchField", searchField);
  searchUrl.searchParams.set("searchValue", searchValue);
  searchUrl.searchParams.set("limit", "1");

  // ── Call ARIVE search ────────────────────────────────────────────────────
  let searchRow: Record<string, unknown> | null = null;
  try {
    const res = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: {
        "X-API-KEY":    apiKey,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      const ariveBody = await res.text().catch(() => "");
      console.error("[arive-lookup] search failed", res.status, ariveBody);
      // Return the raw ARIVE error so we can diagnose — strip sensitive info in prod later
      return NextResponse.json(
        { error: `ARIVE lookup failed (${res.status}). Please fill in manually.`, _debug: ariveBody, _url: searchUrl.toString().replace(apiKey, "***") },
        { status: 502 },
      );
    }

    const body = await res.json() as { count?: number; rows?: unknown[] };
    if (!body.rows?.length) {
      return NextResponse.json({ found: false });
    }
    searchRow = body.rows[0] as Record<string, unknown>;
  } catch (err) {
    const message = err instanceof Error && err.name === "TimeoutError"
      ? "ARIVE lookup timed out. Please fill in manually."
      : "Could not reach ARIVE. Please fill in manually.";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  // ── Optional: fetch detail for targetCloseDate / noteRate ────────────────
  // The search endpoint doesn't return keyDates, so we do a second call
  // using sysGUID if available. Failure here is non-fatal — we just omit those fields.
  let detailRow: Record<string, unknown> | null = null;
  const sysGUID = searchRow.sysGUID as string | undefined;
  if (sysGUID) {
    try {
      const detailRes = await fetch(`${ARIVE_BASE}/api/loans/${sysGUID}`, {
        method: "GET",
        headers: {
          "X-API-KEY":    apiKey,
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(5_000),
      });
      if (detailRes.ok) {
        detailRow = await detailRes.json() as Record<string, unknown>;
      }
    } catch {
      // non-fatal — proceed without detail data
    }
  }

  // ── Extract borrower fields ──────────────────────────────────────────────
  const borrowers = (searchRow.loanBorrowers as Record<string, unknown>[] | undefined) ?? [];
  const primaryBorrower   = borrowers.find(b => b.applicantType === "Borrower");
  const coBorrower        = borrowers.find(b => b.applicantType === "CoBorrower");

  // ── Extract property fields ──────────────────────────────────────────────
  const prop = (searchRow.subjectProperty as Record<string, unknown> | undefined) ?? {};

  // ── Extract close date (detail → keyDates.estimatedFundingDate) ──────────
  const keyDates = detailRow
    ? (detailRow.keyDates as Record<string, unknown> | undefined) ?? {}
    : {};
  const targetCloseDate: string | null =
    (keyDates.estimatedFundingDate as string | undefined) ??
    (keyDates.closingContingency   as string | undefined) ??
    null;

  // ── Build response ───────────────────────────────────────────────────────
  const response = {
    found:               true,
    borrowerFirstName:   (primaryBorrower?.firstName  as string)  ?? null,
    borrowerLastName:    (primaryBorrower?.lastName   as string)  ?? null,
    coBorrowerFirstName: (coBorrower?.firstName       as string)  ?? null,
    coBorrowerLastName:  (coBorrower?.lastName        as string)  ?? null,
    loanType:            mapLoanType(searchRow.loanPurpose)       ?? null,
    loanAmount:          (searchRow.baseLoanAmount    as number)  ?? null,
    purchasePrice:       (searchRow.purchasePriceOrEstimatedValue as number) ?? null,
    propertyAddress:     (prop.addressLineText        as string)  ?? null,
    propertyCity:        (prop.city                   as string)  ?? null,
    propertyState:       (prop.state                  as string)  ?? null,
    propertyZip:         (prop.postalCode             as string)  ?? null,
    targetCloseDate:     targetCloseDate,
    lockStatus:          mapLockStatus(searchRow.lockStatus),
    floatReason:         null, // ARIVE API does not expose float reason
  };

  return NextResponse.json(response);
}
