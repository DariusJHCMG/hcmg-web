import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";

// ── ARIVE Lookup — Zapier async pattern ──────────────────────────────────────
//
// Flow:
//   1. LO types loan number → clicks "Look up"
//   2. POST /api/liftoff/arive-lookup  generates a requestId, inserts a pending
//      row in arive_lookup_results, then fires Zapier hook
//   3. Zapier: ARIVE "Get Loan Details" → POST back to /api/liftoff/arive-result
//      which updates the row with result_json
//   4. Browser polls /api/liftoff/arive-poll?id={requestId} every 1.5s (max 15s)
//   5. Result arrives → wizard auto-fills
//
// Using Supabase as the broker eliminates in-memory cold-start isolation issues
// that would cause silent timeouts when Zapier's POST lands on a different
// Lambda instance than the browser poll.
//
// Required env var:
//   ARIVE_ZAPIER_LOOKUP_HOOK=https://hooks.zapier.com/hooks/catch/...
//
// ── REVERT NOTES ────────────────────────────────────────────────────────────
// To revert: git checkout HEAD~1 -- app/api/liftoff/arive-lookup/route.ts
// The wizard will also need reverting — see LiftOffWizard.tsx revert note.
// ─────────────────────────────────────────────────────────────────────────────

// ── Demo loans — returned instantly without any Zapier call ──────────────────
const DEMO_LOANS: Record<string, object> = {
  "HCMG-DEMO-001": {
    found:               true,
    borrowerFirstName:   "Marcus",
    borrowerLastName:    "Johnson",
    loanType:            "purchase",
    loanAmount:          425000,
    purchasePrice:       500000,
    propertyAddress:     "412 Lakeside Blvd",
    propertyCity:        "Orlando",
    propertyState:       "FL",
    propertyZip:         "32801",
    targetCloseDate:     "2025-10-31",
    lockStatus:          "locked",
  },
  "HCMG-DEMO-002": {
    found:               true,
    borrowerFirstName:   "Renee",
    borrowerLastName:    "Williams",
    loanType:            "refinance",
    loanAmount:          310000,
    purchasePrice:       null,
    propertyAddress:     "8801 Cypress Creek Pkwy",
    propertyCity:        "Houston",
    propertyState:       "TX",
    propertyZip:         "77070",
    targetCloseDate:     "2025-11-14",
    lockStatus:          "floating",
  },
};

// ── Loan number normalisation ────────────────────────────────────────────────
function normalizeLoanNumber(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/-?(\d+)$/);
  return match ? match[1] : trimmed;
}

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { loanNumber } = await req.json().catch(() => ({})) as { loanNumber?: string };
  if (!loanNumber?.trim()) {
    return NextResponse.json({ error: "Loan number is required" }, { status: 400 });
  }

  // ── Demo loans — instant response, no Zapier, no DB row ──────────────────
  const demoKey = loanNumber.trim().toUpperCase();
  if (DEMO_LOANS[demoKey]) {
    await new Promise(r => setTimeout(r, 800));
    return NextResponse.json(DEMO_LOANS[demoKey]);
  }

  // ── Require Zapier hook URL ───────────────────────────────────────────────
  const hookUrl = process.env.ARIVE_ZAPIER_LOOKUP_HOOK;
  if (!hookUrl) {
    return NextResponse.json(
      { error: "ARIVE lookup is not configured yet. Please fill in the loan details manually.", notConfigured: true },
      { status: 503 },
    );
  }

  // ── Generate requestId + insert pending row BEFORE firing Zapier ─────────
  // Inserting first ensures the row exists when Zapier POSTs back, even if
  // the POST arrives before this function returns (extremely rare but possible).
  const requestId = `arive-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const sb = createServiceClient();

  const { error: insertError } = await sb
    .from("arive_lookup_results")
    .insert({
      request_id:  requestId,
      result_json: null,
      found:       false,
      expires_at:  new Date(Date.now() + 120_000).toISOString(),
    });

  if (insertError) {
    console.error("[arive-lookup] failed to insert pending row", insertError);
    return NextResponse.json({ error: "Could not start ARIVE lookup. Try again." }, { status: 500 });
  }

  const normalizedLoanNumber = normalizeLoanNumber(loanNumber);

  try {
    await fetch(hookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loanNumber:   normalizedLoanNumber,
        requestId,
        submitterName: profile.full_name,
      }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Clean up the pending row so it doesn't sit orphaned
    void sb.from("arive_lookup_results").delete().eq("request_id", requestId).then();
    return NextResponse.json(
      { error: "Could not reach ARIVE lookup service. Please fill in manually." },
      { status: 502 },
    );
  }

  // Return the requestId — browser will poll /api/liftoff/arive-poll?id={requestId}
  return NextResponse.json({ pending: true, requestId });
}
