/**
 * POST /api/goal-engine/resend-webhook
 * Receives Resend delivery event webhooks.
 * Updates goal_email_log with delivery status.
 *
 * Setup in Resend Dashboard → Webhooks:
 *  URL: https://hcmgloans.com/api/goal-engine/resend-webhook
 *  Events: email.delivered, email.opened, email.bounced, email.complained, email.failed
 *
 * Verification: Resend signs requests using HMAC-SHA256 over "msgId.msgTimestamp.body".
 * The secret is base64-encoded in your Resend dashboard webhook settings.
 */

import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";
import { createHmac, timingSafeEqual } from "crypto";

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET ?? "";

async function verifyResendSignature(
  req: NextRequest,
  body: string,
): Promise<boolean> {
  if (!RESEND_WEBHOOK_SECRET) return true; // skip verification in dev

  const msgId        = req.headers.get("svix-id")        ?? "";
  const msgTimestamp = req.headers.get("svix-timestamp")  ?? "";
  const msgSignature = req.headers.get("svix-signature")  ?? "";

  if (!msgId || !msgTimestamp || !msgSignature) return false;

  try {
    // Resend uses svix signing: HMAC-SHA256 over "<msgId>.<msgTimestamp>.<body>"
    // Secret is base64-encoded (strip "whsec_" prefix if present)
    const secretB64 = RESEND_WEBHOOK_SECRET.replace(/^whsec_/, "");
    const secretBytes = Buffer.from(secretB64, "base64");
    const toSign = `${msgId}.${msgTimestamp}.${body}`;
    const computed = createHmac("sha256", secretBytes).update(toSign).digest("base64");

    // msgSignature may be "v1,<sig1> v1,<sig2>" — check any
    const sigs = msgSignature.split(" ").map(s => s.replace(/^v1,/, ""));
    const computedBuf = Buffer.from(computed);
    return sigs.some(sig => {
      try {
        const sigBuf = Buffer.from(sig, "base64");
        return sigBuf.length === computedBuf.length && timingSafeEqual(sigBuf, computedBuf);
      } catch { return false; }
    });
  } catch {
    return false;
  }
}

const EVENT_STATUS_MAP: Record<string, string> = {
  "email.sent":        "sent",
  "email.delivered":   "delivered",
  "email.opened":      "opened",
  "email.clicked":     "clicked",
  "email.bounced":     "bounced",
  "email.complained":  "complained",
  "email.failed":      "failed",
};

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify signature
  const isValid = await verifyResendSignature(req, rawBody);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let event: Record<string, unknown>;
  try { event = JSON.parse(rawBody); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const eventType = event.type as string;
  const data      = (event.data ?? {}) as Record<string, unknown>;
  const resendId  = data.email_id as string | undefined;

  if (!resendId) return NextResponse.json({ ok: true }); // nothing to update

  const status    = EVENT_STATUS_MAP[eventType];
  if (!status) return NextResponse.json({ ok: true }); // unknown event type

  const sb        = createServiceClient();
  const now       = new Date().toISOString();
  const updates: Record<string, unknown> = { status };

  if (status === "delivered") updates.delivered_at = now;
  if (status === "opened")    updates.opened_at    = now;
  if (status === "clicked")   updates.clicked_at   = now;
  if (status === "bounced")   { updates.bounced_at = now; updates.failure_reason = ((data.bounce as Record<string, unknown>)?.message as string) ?? null; }
  if (status === "failed")    { updates.failure_reason = ((data.error as Record<string, unknown>)?.message as string) ?? null; }

  await sb.from("goal_email_log")
    .update(updates)
    .eq("resend_id", resendId);

  return NextResponse.json({ ok: true });
}
