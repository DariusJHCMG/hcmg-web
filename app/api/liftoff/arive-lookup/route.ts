import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";

// ── ARIVE Lookup — direct REST API call (OAuth 2.0) ──────────────────────────
//
// Flow:
//   1. LO types ARIVE loan number → clicks "Look up"
//   2. This route exchanges Client ID + Secret Key for a Bearer token
//   3. Calls GET https://api.arive.com/api/loans with Authorization: Bearer <token>
//   4. Maps the first result to AriveLoanData and returns it to the wizard
//   5. The wizard auto-fills all matching fields
//
// Required env vars (all from ARIVE Settings → API Integrations):
//   ARIVE_CLIENT_ID=<Client ID>
//   ARIVE_CLIENT_SECRET=<Secret Key>
//   ARIVE_API_KEY=<API Key>   ← sent as X-API-KEY alongside Bearer token
//
// ── REVERT NOTES ────────────────────────────────────────────────────────────
// To revert: git checkout HEAD~2 -- app/api/liftoff/arive-lookup/route.ts
// The wizard (LiftOffWizard.tsx) was NOT changed — no wizard revert needed.
// ─────────────────────────────────────────────────────────────────────────────

const ARIVE_BASE = "https://api.arive.com";

// ── OAuth token exchange ─────────────────────────────────────────────────────
// ARIVE uses OAuth 2.0 client_credentials grant.
// Token endpoint pattern used by their Zapier integration.
async function getAriveToken(clientId: string, clientSecret: string): Promise<string> {
  const res = await fetch(`${ARIVE_BASE}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type:    "client_credentials",
      client_id:     clientId,
      client_secret: clientSecret,
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ARIVE token exchange failed (${res.status}): ${body}`);
  }
  const data = await res.json() as { access_token?: string };
  if (!data.access_token) throw new Error("ARIVE token response missing access_token");
  return data.access_token;
}

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

  // ── Require ARIVE credentials ────────────────────────────────────────────
  const clientId     = process.env.ARIVE_CLIENT_ID;
  const clientSecret = process.env.ARIVE_CLIENT_SECRET;
  const apiKey       = process.env.ARIVE_API_KEY;
  if (!clientId || !clientSecret || !apiKey) {
    return NextResponse.json(
      { error: "ARIVE lookup is not configured yet. Please fill in the loan details manually.", notConfigured: true },
      { status: 503 },
    );
  }

  // ── Exchange credentials for Bearer token ────────────────────────────────
  let bearerToken: string;
  try {
    bearerToken = await getAriveToken(clientId, clientSecret);
  } catch (err) {
    console.error("[arive-lookup] token exchange failed", err);
    return NextResponse.json(
      { error: "Could not authenticate with ARIVE. Please fill in manually." },
      { status: 502 },
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
        "Authorization": `Bearer ${bearerToken}`,
        "X-API-KEY":     apiKey,
        "Content-Type":  "application/json",
      },
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      const ariveBody = await res.text().catch(() => "");
      console.error("[arive-lookup] search failed", res.status, ariveBody);
      return NextResponse.json(
        { error: `ARIVE lookup failed (${res.status}). Please fill in manually.`, _debug: ariveBody },
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
          "Authorization": `Bearer ${bearerToken}`,
          "X-API-KEY":     apiKey,
          "Content-Type":  "application/json",
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
