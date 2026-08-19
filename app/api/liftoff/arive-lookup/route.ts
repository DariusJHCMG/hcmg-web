import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";

// ── ARIVE Lookup via Zapier webhook ──────────────────────────
//
// Flow:
//   1. LO types ARIVE loan number → clicks "Look up"
//   2. This route POSTs {loanNumber, submitterName, submitterNmls}
//      to your Zapier webhook URL
//   3. Zapier pulls the loan from ARIVE, maps the fields, and
//      returns JSON matching AriveLoanData below
//   4. The wizard auto-fills all matching fields
//
// Configure your Zapier webhook URL in:
//   .env.local  →  ARIVE_ZAPIER_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/...
//
// Expected Zapier response shape (all fields optional — fill what you have):
// {
//   "borrowerFirstName":    "John",
//   "borrowerLastName":     "Smith",
//   "coBorrowerFirstName":  "Jane",
//   "coBorrowerLastName":   "Smith",
//   "loanType":             "purchase",
//   "loanAmount":           425000,
//   "purchasePrice":        500000,
//   "propertyAddress":      "123 Main St",
//   "propertyCity":         "Orlando",
//   "propertyState":        "FL",
//   "propertyZip":          "32801",
//   "targetCloseDate":      "2025-10-15",
//   "lockStatus":           "locked",
//   "floatReason":          null,
//   "found":                true   // false if loan number not found in ARIVE
// }

export async function POST(req: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { loanNumber } = await req.json().catch(() => ({})) as { loanNumber?: string };
  if (!loanNumber?.trim()) {
    return NextResponse.json({ error: "Loan number is required" }, { status: 400 });
  }

  const webhookUrl = process.env.ARIVE_ZAPIER_WEBHOOK_URL;
  if (!webhookUrl) {
    // Webhook not yet configured — return a clear message so the LO knows
    return NextResponse.json(
      { error: "ARIVE lookup is not configured yet. Please fill in the loan details manually.", notConfigured: true },
      { status: 503 }
    );
  }

  try {
    const zapRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        loanNumber:    loanNumber.trim(),
        submitterName: profile.full_name,
        submitterNmls: profile.nmls ?? null,
        source:        "hcmg-liftoff",
      }),
      signal: AbortSignal.timeout(15_000), // 15s timeout
    });

    if (!zapRes.ok) {
      return NextResponse.json(
        { error: `ARIVE lookup failed (${zapRes.status}). Please fill in manually.` },
        { status: 502 }
      );
    }

    const data = await zapRes.json();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error && err.name === "TimeoutError"
      ? "ARIVE lookup timed out. Please fill in manually."
      : "Could not reach ARIVE. Please fill in manually.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
