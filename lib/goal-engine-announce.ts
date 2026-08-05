/**
 * Announcement email helper — lives in lib/ (not a route file)
 * so it can be imported by both goals/route.ts and goals/[id]/route.ts
 * without triggering Next.js "not a valid Route export" errors.
 */

import { createServiceClient } from "./supabase";
import { sendGoalEmail } from "./goal-engine-mailer";
import { getActiveLoanOfficers, buildAnnouncementEmail } from "./goal-engine-server";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

export async function sendAnnouncementEmails(goal: Record<string, unknown>) {
  const sb  = createServiceClient();
  const los = await getActiveLoanOfficers();

  for (const lo of los) {
    const email      = lo.notify_email ?? lo.email;
    const subject    = `🥧 What's Your Slice of the Pie? — ${goal.month_label}`;
    const commitUrl  = `${SITE}/goal-engine/commit`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html = buildAnnouncementEmail(goal as any, lo.full_name.split(" ")[0], commitUrl);

    try {
      const { id: resendId } = await sendGoalEmail({ to: email, subject, html });

      await sb.from("goal_email_log").insert({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        goal_month_id:   (goal as any).id,
        profile_id:      lo.id,
        email_type:      "announcement",
        recipient_email: email,
        subject,
        resend_id:       resendId,
      });
    } catch (e) {
      console.error("Failed to send announcement email to", email, e);
    }
  }

  // Mark emails sent on the goal record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await sb.from("goal_months").update({ emails_sent: true }).eq("id", (goal as any).id);
}
