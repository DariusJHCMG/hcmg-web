/**
 * SLICE by HCMG — Email Mailer with Test Mode Interceptor
 *
 * When GOAL_ENGINE_TEST_MODE=true, ALL emails are redirected to
 * GOAL_ENGINE_TEST_EMAIL instead of the real recipient.
 * The subject line is prefixed with [TEST → real@address.com]
 * so you can see exactly who would have received it.
 *
 * Flip GOAL_ENGINE_TEST_MODE=false in .env.local when ready to go live.
 */

import { Resend } from "resend";

const resend        = new Resend(process.env.RESEND_API_KEY);
const TEST_MODE     = process.env.GOAL_ENGINE_TEST_MODE === "true";
const TEST_EMAIL    = process.env.GOAL_ENGINE_TEST_EMAIL ?? "darius@hcmgloans.com";
const FROM_ADDRESS  = "Darius James <darius@hcmgloans.com>";

export interface SendEmailOptions {
  to:          string;   // real recipient
  subject:     string;
  html:        string;
  attachments?: Array<{ filename: string; content: string }>; // base64 content
}

export interface SendEmailResult {
  id:          string | null;
  intercepted: boolean;
  sentTo:      string;
}

/**
 * Send a goal-engine email, respecting TEST_MODE.
 * Returns the Resend message ID and whether it was intercepted.
 */
export async function sendGoalEmail(opts: SendEmailOptions): Promise<SendEmailResult> {
  const intercepted = TEST_MODE;
  const sentTo      = intercepted ? TEST_EMAIL : opts.to;
  const subject     = intercepted
    ? `[TEST → ${opts.to}] ${opts.subject}`
    : opts.subject;

  const { data } = await resend.emails.send({
    from:        FROM_ADDRESS,
    to:          sentTo,
    subject,
    html:        opts.html,
    ...(opts.attachments?.length ? { attachments: opts.attachments } : {}),
  });

  return { id: data?.id ?? null, intercepted, sentTo };
}

/**
 * Batch-send to many recipients, all intercepted in test mode.
 */
export async function sendGoalEmailBatch(
  emails: SendEmailOptions[],
): Promise<SendEmailResult[]> {
  const results: SendEmailResult[] = [];
  for (const e of emails) {
    try {
      const r = await sendGoalEmail(e);
      results.push(r);
    } catch (err) {
      console.error("[goal-engine-mailer] Failed to send to", e.to, err);
      results.push({ id: null, intercepted: TEST_MODE, sentTo: e.to });
    }
  }
  return results;
}

/** True when running in test/demo mode */
export function isTestMode(): boolean {
  return TEST_MODE;
}

export { TEST_EMAIL };
