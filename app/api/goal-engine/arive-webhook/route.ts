/**
 * POST /api/goal-engine/arive-webhook
 * Native ARIVE outbound webhook receiver.
 * Handles loan.funded and loan.application_submitted events directly.
 *
 * ARIVE sends:
 * {
 *   event: "loan.funded" | "loan.application_submitted",
 *   loan: {
 *     id: string,
 *     loanOfficerEmail: string,
 *     loanOfficerNmls?: string,
 *     loanAmount: number,
 *     fundedDate?: string,
 *     applicationDate?: string,
 *   }
 * }
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { getActiveGoal } from "@/lib/goal-engine-server";

const SECRET = process.env.ARIVE_WEBHOOK_SECRET ?? "";

export async function POST(req: NextRequest) {
  // Validate secret header
  const incomingSecret = req.headers.get("x-arive-secret") ?? req.headers.get("x-webhook-secret") ?? "";
  if (SECRET && incomingSecret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = (body.event as string) ?? "";
  const loan  = (body.loan ?? {}) as Record<string, unknown>;

  // Only process funded and application events
  const isFunded = event === "loan.funded" || event === "LOAN_FUNDED";
  const isApp    = event === "loan.application_submitted" || event === "APPLICATION_SUBMITTED" || event === "LOAN_APPLICATION";
  if (!isFunded && !isApp) {
    return NextResponse.json({ status: "ignored", event }, { status: 200 });
  }

  const loanId      = (loan.id ?? loan.loanId ?? loan.loan_id) as string;
  const loEmail     = (loan.loanOfficerEmail ?? loan.lo_email) as string | undefined;
  const loNmls      = (loan.loanOfficerNmls  ?? loan.lo_nmls)  as string | undefined;
  const loanAmount  = parseFloat(String(loan.loanAmount ?? loan.loan_amount ?? 0)) || 0;
  const fundedDate  = (loan.fundedDate  ?? loan.funded_date)  as string | undefined;
  const appDate     = (loan.applicationDate ?? loan.app_date) as string | undefined;

  if (!loanId) {
    return NextResponse.json({ error: "loan.id required" }, { status: 400 });
  }

  const sb = createServiceClient();

  // Find LO profile
  let profile: { id: string; full_name: string } | null = null;
  if (loNmls) {
    const { data } = await sb.from("profiles").select("id, full_name").eq("nmls", loNmls).single();
    profile = data;
  }
  if (!profile && loEmail) {
    const { data } = await sb.from("profiles").select("id, full_name").eq("email", loEmail).single();
    profile = data;
  }
  if (!profile) {
    return NextResponse.json({
      error: "LO not found. Ensure loanOfficerEmail or loanOfficerNmls matches a SLICE profile.",
      attempted: { loEmail, loNmls },
    }, { status: 404 });
  }

  // Find active goal month
  const goal = await getActiveGoal();

  // Check for existing record (idempotent)
  const { data: existing } = await sb
    .from("goal_production")
    .select("id")
    .eq("loan_id", loanId)
    .single();

  const payload = {
    profile_id:    profile.id,
    goal_month_id: goal?.id ?? null,
    loan_id:       loanId,
    funded_date:   isFunded && fundedDate ? fundedDate : null,
    funded_volume: isFunded ? loanAmount : null,
    funded_unit:   isFunded ? 1 : 0,
    app_date:      appDate ?? null,
    app_volume:    loanAmount,
    app_unit:      1,
    source:        "arive_native",
    raw_payload:   body,
  };

  if (existing) {
    await sb.from("goal_production").update(payload).eq("id", existing.id);
    return NextResponse.json({ status: "updated", loan_id: loanId, lo: profile.full_name });
  }

  const { error } = await sb.from("goal_production").insert(payload);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ status: "created", loan_id: loanId, lo: profile.full_name, event });
}
