import { NextRequest, NextResponse } from "next/server";
import { resultStore } from "@/lib/arive-lookup-store";

// ── GET /api/liftoff/arive-poll?id={requestId} ───────────────────────────────
// Browser polls this every 1.5s after firing the lookup.
// Returns { pending: true } until Zapier POSTs the result,
// then returns the full AriveLoanData and clears the store entry.

export async function GET(req: NextRequest) {
  const requestId = req.nextUrl.searchParams.get("id");
  if (!requestId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const result = resultStore.get(requestId);
  if (!result) {
    return NextResponse.json({ pending: true });
  }

  // Return result and immediately clean up
  resultStore.delete(requestId);
  return NextResponse.json(result);
}
