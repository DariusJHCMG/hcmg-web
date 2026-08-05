/**
 * HCMG Goal Engine™ — Email Templates
 * All emails come from Darius James, Chief Lending Officer.
 */

import {
  emailHeader,
  emailFooter,
  emailWrap,
  ctaButton,
} from "./email-templates";
import { fmt$, fmtPct } from "./goal-engine";
import type { GoalMonth, GoalCommitment, LeaderboardRow } from "./database.types";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");
const CLO_SIGNATURE = `
  <table cellpadding="0" cellspacing="0" style="margin-top:24px;border-top:1px solid #e5e7eb;padding-top:20px;">
    <tr>
      <td style="font-size:13px;color:#1A2B42;line-height:1.7;">
        <strong style="font-size:14px;">Darius James</strong><br/>
        <span style="color:#F37021;font-weight:700;">Chief Lending Officer</span><br/>
        Harris Capital Mortgage Group
      </td>
    </tr>
  </table>`;

function statBox(label: string, value: string, sub?: string): string {
  return `
    <td style="width:50%;padding:8px;">
      <div style="background:#f5f0eb;border-radius:12px;padding:16px 20px;text-align:center;">
        <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:#9AABB8;text-transform:uppercase;margin-bottom:4px;">${label}</div>
        <div style="font-size:24px;font-weight:900;color:#142850;">${value}</div>
        ${sub ? `<div style="font-size:11px;color:#F37021;font-weight:700;margin-top:2px;">${sub}</div>` : ""}
      </div>
    </td>`;
}

function progressBar(pct: number, label: string): string {
  const clamped = Math.min(100, Math.max(0, pct));
  const color   = pct >= 90 ? "#22c55e" : pct >= 70 ? "#f59e0b" : "#ef4444";
  return `
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:12px;font-weight:700;color:#1A2B42;">${label}</span>
        <span style="font-size:12px;font-weight:700;color:${color};">${Math.round(clamped)}%</span>
      </div>
      <div style="background:#e5e7eb;border-radius:999px;height:8px;overflow:hidden;">
        <div style="background:${color};height:8px;border-radius:999px;width:${clamped}%;"></div>
      </div>
    </div>`;
}

// ── 1. Goal Announcement ──────────────────────────────────────

export function buildAnnouncementEmail(
  goal: GoalMonth,
  recipientName: string,
  commitUrl: string,
): string {
  const body = `
    ${emailHeader(
      "🥧 Slice of the Pie",
      `${goal.month_label} Company Goal`,
      `Harris Capital Mortgage Group has officially launched this month's goal.`,
    )}
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 36px 0;">
      <tr><td>
        <p style="margin:0 0 20px;font-size:15px;color:#1A2B42;line-height:1.7;">
          Hi <strong>${recipientName}</strong>,
        </p>
        <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
          It&apos;s a new month and it&apos;s time to commit. Harris Capital Mortgage Group has set our monthly targets — 
          now it&apos;s your turn to claim your slice of the pie.
        </p>
      </td></tr>
    </table>

    <!-- Company Goals -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 36px;">
      <tr>
        ${statBox("Funded Volume Goal", fmt$(goal.funded_volume_goal))}
        ${statBox("Funded Units Goal", goal.funded_units_goal.toString(), "Loans")}
      </tr>
      ${goal.app_volume_goal > 0 ? `<tr>
        ${statBox("Application Volume", fmt$(goal.app_volume_goal))}
        ${statBox("Application Units", goal.app_units_goal.toString(), "Apps")}
      </tr>` : ""}
    </table>

    ${goal.clo_message ? `
    <!-- CLO Message -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 36px 0;">
      <tr><td>
        <div style="background:#142850;border-radius:12px;padding:20px 24px;">
          <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;color:#F37021;text-transform:uppercase;">
            Message from Leadership
          </p>
          <p style="margin:0;font-size:14px;color:#e2e8f0;line-height:1.7;font-style:italic;">&ldquo;${goal.clo_message}&rdquo;</p>
        </div>
      </td></tr>
    </table>` : ""}

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 36px;">
      <tr><td>
        <p style="margin:0 0 20px;font-size:15px;font-weight:700;color:#1A2B42;">
          How much are <em>you</em> committing to?
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          Every loan officer must submit their Slice of the Pie commitment. 
          Click below to set your monthly goal, tell us your strategy, and sign your digital commitment.
        </p>
        <div style="text-align:center;padding:8px 0;">
          ${ctaButton("🥧  Claim My Slice of the Pie", commitUrl)}
        </div>
        ${CLO_SIGNATURE}
      </td></tr>
    </table>
    ${emailFooter()}`;

  return emailWrap(body);
}

// ── 2. Commitment Reminder ────────────────────────────────────

export function buildReminderEmail(
  goal: GoalMonth,
  recipientName: string,
  commitUrl: string,
): string {
  const body = `
    ${emailHeader(
      "⏰ Reminder",
      "You Haven't Claimed Your Slice Yet",
      `${goal.month_label} commitment window is still open.`,
    )}
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 36px;">
      <tr><td>
        <p style="margin:0 0 16px;font-size:15px;color:#1A2B42;line-height:1.7;">
          Hi <strong>${recipientName}</strong>,
        </p>
        <p style="margin:0 0 24px;font-size:15px;color:#475569;line-height:1.7;">
          You haven&apos;t submitted your monthly commitment yet. The company goal is live 
          and the team is already claiming their slices — don&apos;t get left behind.
        </p>
        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
          <tr>
            ${statBox("Company Goal", fmt$(goal.funded_volume_goal))}
            ${statBox("Units", goal.funded_units_goal.toString(), "Loans")}
          </tr>
        </table>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          Take 2 minutes to set your goal, share your strategy, and sign your commitment.
        </p>
        <div style="text-align:center;padding:8px 0;">
          ${ctaButton("Submit My Commitment", commitUrl)}
        </div>
        ${CLO_SIGNATURE}
      </td></tr>
    </table>
    ${emailFooter()}`;

  return emailWrap(body);
}

// ── 3. Weekly Progress Email ──────────────────────────────────

export function buildWeeklyProgressEmail(
  goal: GoalMonth,
  recipientName: string,
  commitment: GoalCommitment,
  actualVolume: number,
  actualUnits: number,
  rank: number,
  totalParticipants: number,
  daysLeft: number,
): string {
  const volumePct    = commitment.funded_volume_commitment > 0
    ? (actualVolume / commitment.funded_volume_commitment) * 100 : 0;
  const isOnPace     = volumePct >= 70;
  const statusEmoji  = volumePct >= 90 ? "🟢" : volumePct >= 70 ? "🟡" : "🔴";
  const remaining    = Math.max(0, commitment.funded_volume_commitment - actualVolume);

  const body = `
    ${emailHeader(
      "📊 Weekly Progress",
      `Your ${goal.month_label} Update`,
      `${daysLeft} days remaining · You&apos;re ranked #${rank} of ${totalParticipants}`,
    )}
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 36px 0;">
      <tr><td>
        <p style="margin:0 0 20px;font-size:15px;color:#1A2B42;line-height:1.7;">
          Hi <strong>${recipientName}</strong>, here&apos;s your weekly production snapshot:
        </p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 36px;">
      <tr>
        ${statBox("Your Commitment", fmt$(commitment.funded_volume_commitment))}
        ${statBox("Current Production", fmt$(actualVolume), fmtPct(volumePct))}
      </tr>
      <tr>
        ${statBox("Still Needed", fmt$(remaining))}
        ${statBox("Days Left", daysLeft.toString())}
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 36px 0;">
      <tr><td>
        ${progressBar(volumePct, "Your Funded Volume")}
        ${progressBar((actualUnits / (commitment.funded_units_commitment || 1)) * 100, "Your Funded Units")}
        <p style="margin:16px 0 0;font-size:14px;font-weight:700;color:#1A2B42;">
          ${statusEmoji} ${isOnPace ? "You&apos;re on pace — keep pushing!" : "You&apos;re behind pace — time to accelerate."}
        </p>
        ${CLO_SIGNATURE}
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 36px 32px;">
      <tr><td style="padding-top:24px;">
        <div style="text-align:center;">
          ${ctaButton("View My Dashboard", `${SITE}/portal/goal-engine`)}
        </div>
      </td></tr>
    </table>
    ${emailFooter()}`;

  return emailWrap(body);
}

// ── 4. Off-Pace Alert ─────────────────────────────────────────

export function buildOffPaceEmail(
  goal: GoalMonth,
  recipientName: string,
  commitment: GoalCommitment,
  actualVolume: number,
  daysLeft: number,
): string {
  const pct        = commitment.funded_volume_commitment > 0
    ? (actualVolume / commitment.funded_volume_commitment) * 100 : 0;
  const needed     = Math.max(0, commitment.funded_volume_commitment - actualVolume);
  const dailyNeeded = daysLeft > 0 ? needed / daysLeft : needed;

  const body = `
    ${emailHeader(
      "🔴 Behind Pace",
      "You&apos;re Falling Behind Your Monthly Goal",
      `${goal.month_label} · ${daysLeft} days remaining`,
    )}
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 36px 0;">
      <tr><td>
        <p style="margin:0 0 16px;font-size:15px;color:#1A2B42;line-height:1.7;">
          Hi <strong>${recipientName}</strong>,
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          Your current production pace is <strong style="color:#ef4444;">${Math.round(pct)}%</strong> of your commitment. 
          There&apos;s still time to close the gap — but it requires action today.
        </p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 36px;">
      <tr>
        ${statBox("Your Commitment", fmt$(commitment.funded_volume_commitment))}
        ${statBox("Current Production", fmt$(actualVolume), `${Math.round(pct)}% of goal`)}
      </tr>
      <tr>
        ${statBox("Still Needed", fmt$(needed))}
        ${statBox("Daily Needed", fmt$(dailyNeeded), `for ${daysLeft} days`)}
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 36px 32px;">
      <tr><td>
        ${progressBar(pct, "Your Progress")}
        <p style="margin:16px 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          You have <strong>${daysLeft} days</strong> to make this happen. 
          Every application, every follow-up, every referral counts.
          Let&apos;s finish strong.
        </p>
        <div style="text-align:center;">
          ${ctaButton("View My Dashboard", `${SITE}/portal/goal-engine`)}
        </div>
        ${CLO_SIGNATURE}
      </td></tr>
    </table>
    ${emailFooter()}`;

  return emailWrap(body);
}

// ── 5. Company Milestone ──────────────────────────────────────

export function buildCompanyMilestoneEmail(
  goal: GoalMonth,
  recipientName: string,
  milestonePct: number,
  totalActual: number,
): string {
  const body = `
    ${emailHeader(
      "🎉 Company Milestone",
      `We&apos;ve Hit ${milestonePct}% of Our Goal!`,
      `${goal.month_label} · Keep the momentum going`,
    )}
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 36px 0;">
      <tr><td>
        <p style="margin:0 0 16px;font-size:15px;color:#1A2B42;line-height:1.7;">
          Hi <strong>${recipientName}</strong>,
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          The HCMG team has collectively funded <strong>${fmt$(totalActual)}</strong> this month — 
          reaching <strong style="color:#22c55e;">${milestonePct}%</strong> of our company goal. 
          Incredible work.
        </p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 36px;">
      <tr>
        ${statBox("Company Goal", fmt$(goal.funded_volume_goal))}
        ${statBox("Total Funded", fmt$(totalActual), `${milestonePct}% of goal`)}
      </tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 36px 32px;">
      <tr><td>
        ${progressBar(milestonePct, `${goal.month_label} Progress`)}
        <p style="margin:16px 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          ${milestonePct >= 100
            ? "We did it. Congratulations to every single person on this team. You made it happen."
            : `We&apos;re ${100 - milestonePct}% away from 100%. Let&apos;s finish this.`
          }
        </p>
        <div style="text-align:center;">
          ${ctaButton("See the Leaderboard", `${SITE}/portal/goal-engine/leaderboard`)}
        </div>
        ${CLO_SIGNATURE}
      </td></tr>
    </table>
    ${emailFooter()}`;

  return emailWrap(body);
}

// ── 6. End of Month Recap ─────────────────────────────────────

export function buildEndOfMonthEmail(
  goal: GoalMonth,
  recipientName: string,
  commitment: GoalCommitment,
  actualVolume: number,
  actualUnits: number,
  rank: number,
  totalParticipants: number,
  awards: Array<{ award_label: string; award_emoji: string | null }>,
  companyTotal: number,
): string {
  const pct       = goal.funded_volume_goal > 0 ? (companyTotal / goal.funded_volume_goal) * 100 : 0;
  const personalPct = commitment.funded_volume_commitment > 0
    ? (actualVolume / commitment.funded_volume_commitment) * 100 : 0;

  const body = `
    ${emailHeader(
      "🏁 End of Month",
      `${goal.month_label} — Final Results`,
      `Company achieved ${Math.round(pct)}% of goal`,
    )}
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 36px 0;">
      <tr><td>
        <p style="margin:0 0 16px;font-size:15px;color:#1A2B42;line-height:1.7;">
          Hi <strong>${recipientName}</strong>,
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          The month is done. Here are your final results for ${goal.month_label}.
        </p>
      </td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 36px;">
      <tr>
        ${statBox("Company Goal", fmt$(goal.funded_volume_goal))}
        ${statBox("Company Actual", fmt$(companyTotal), `${Math.round(pct)}%`)}
      </tr>
      <tr>
        ${statBox("Your Commitment", fmt$(commitment.funded_volume_commitment))}
        ${statBox("Your Production", fmt$(actualVolume), `${Math.round(personalPct)}%`)}
      </tr>
    </table>

    ${awards.length > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 36px 0;">
      <tr><td>
        <div style="background:#fefce8;border:1px solid #fde047;border-radius:12px;padding:20px 24px;">
          <p style="margin:0 0 12px;font-size:11px;font-weight:700;letter-spacing:2px;color:#a16207;text-transform:uppercase;">
            Your Awards This Month
          </p>
          ${awards.map((a) => `
          <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#1A2B42;">
            ${a.award_emoji ?? "🏆"} ${a.award_label}
          </p>`).join("")}
        </div>
      </td></tr>
    </table>` : ""}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 36px 32px;">
      <tr><td>
        <p style="margin:0 0 8px;font-size:14px;color:#475569;line-height:1.7;">
          Final Rank: <strong>#${rank} of ${totalParticipants}</strong> · 
          Units: <strong>${actualUnits} loans</strong>
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;line-height:1.7;">
          ${personalPct >= 100
            ? "You hit your commitment. That's the definition of professional excellence."
            : "There&apos;s always next month. Use this data to set a stronger plan."
          }
        </p>
        <div style="text-align:center;">
          ${ctaButton("View Full Results", `${SITE}/portal/goal-engine`)}
        </div>
        ${CLO_SIGNATURE}
      </td></tr>
    </table>
    ${emailFooter()}`;

  return emailWrap(body);
}

// ── 7. Award Notification ─────────────────────────────────────

export function buildAwardEmail(
  recipientName: string,
  awardLabel: string,
  awardEmoji: string | null,
  monthLabel: string,
  statsHtml: string,
): string {
  const body = `
    ${emailHeader(
      `${awardEmoji ?? "🏆"} Award`,
      awardLabel,
      `${monthLabel} · Harris Capital Mortgage Group`,
    )}
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 36px;">
      <tr><td style="text-align:center;">
        <div style="font-size:64px;margin-bottom:16px;">${awardEmoji ?? "🏆"}</div>
        <p style="margin:0 0 8px;font-size:22px;font-weight:900;color:#142850;">${awardLabel}</p>
        <p style="margin:0 0 24px;font-size:15px;color:#475569;">
          Presented to <strong>${recipientName}</strong><br/>
          ${monthLabel}
        </p>
        <div style="background:#f5f0eb;border-radius:12px;padding:20px;margin:0 auto;max-width:400px;text-align:left;">
          ${statsHtml}
        </div>
        <p style="margin:24px 0 0;font-size:14px;color:#475569;line-height:1.7;">
          Congratulations on this well-earned recognition. 
          Your dedication and performance set the standard for this team.
        </p>
        ${CLO_SIGNATURE}
        <div style="margin-top:24px;">
          ${ctaButton("View My Awards", `${SITE}/portal/goal-engine`)}
        </div>
      </td></tr>
    </table>
    ${emailFooter()}`;

  return emailWrap(body);
}
