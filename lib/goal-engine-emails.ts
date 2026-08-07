/**
 * SLICE by HCMG — Premium Email Templates
 * White background · Navy #142850 · Orange #F37021
 * SLICE logo + HCMG wordmark in every email.
 * Certificate email includes an HTML attachment for download.
 */

import { fmt$, fmtPct } from "./goal-engine";
import type { GoalMonth, GoalCommitment, LeaderboardRow } from "./database.types";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

// ── Inline logos (base64 PNG not available in email — use hosted URLs) ────────
const SLICE_LOGO_URL  = `${SITE}/SLICE.png`;
const HCMG_LOGO_URL   = `${SITE}/hcmg-wordmark-on-light.svg`;
const HCMG_DARK_URL   = `${SITE}/hcmg-wordmark-on-dark.svg`;

// ── Shared design tokens ──────────────────────────────────────────────────────
const NAVY   = "#142850";
const ORANGE = "#F37021";
const INK    = "#1A2B42";
const MUTED  = "#64748B";
const LINE   = "#E2E8F0";
const WHITE  = "#ffffff";
const SAND   = "#F8FAFC";

// ── Email wrapper ─────────────────────────────────────────────────────────────
function wrap(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:${SAND};font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${SAND};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:600px;margin:0 auto;background:${WHITE};border-radius:16px;overflow:hidden;border:1px solid ${LINE};box-shadow:0 4px 24px rgba(20,40,80,0.08);">
        ${body}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Top nav bar ───────────────────────────────────────────────────────────────
function topBar(): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};">
    <tr>
      <td style="padding:0;">
        <!-- Orange accent line at very top -->
        <div style="height:4px;background:linear-gradient(90deg,${ORANGE} 0%,#FF9847 60%,rgba(243,112,33,0.15) 100%);"></div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:20px 32px 18px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:14px;">
                    <img src="${SLICE_LOGO_URL}" alt="SLICE" width="52" height="auto" style="display:block;height:52px;width:auto;" />
                  </td>
                  <td style="vertical-align:middle;border-left:1px solid ${LINE};padding-left:14px;">
                    <div style="font-size:8px;font-weight:700;letter-spacing:2px;color:${ORANGE};text-transform:uppercase;line-height:1;margin-bottom:5px;">by</div>
                    <img src="${HCMG_LOGO_URL}" alt="HCMG" width="80" height="auto" style="display:block;height:14px;width:auto;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <!-- Bottom separator -->
        <div style="height:1px;background:${LINE};"></div>
      </td>
    </tr>
  </table>`;
}

// ── Hero banner ───────────────────────────────────────────────────────────────
function hero(eyebrow: string, headline: string, sub?: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};border-bottom:1px solid ${LINE};">
    <tr><td style="padding:32px 32px 28px;">
      <div style="display:inline-block;background:rgba(243,112,33,0.1);border:1.5px solid rgba(243,112,33,0.3);border-radius:6px;padding:3px 12px;margin-bottom:14px;">
        <span style="font-size:10px;font-weight:800;letter-spacing:2px;color:${ORANGE};text-transform:uppercase;">${eyebrow}</span>
      </div>
      <p style="margin:0;font-size:26px;font-weight:900;color:${NAVY};line-height:1.2;letter-spacing:-0.3px;">${headline}</p>
      ${sub ? `<p style="margin:8px 0 0;font-size:13px;color:${MUTED};line-height:1.6;">${sub}</p>` : ""}
    </td></tr>
  </table>`;
}

// ── Stat card grid ────────────────────────────────────────────────────────────
function statGrid(stats: Array<{ label: string; value: string; sub?: string; navy?: boolean }>): string {
  const cells = stats.map(s => `
    <td style="width:${Math.round(100/stats.length)}%;padding:6px;">
      <div style="background:${s.navy ? NAVY : SAND};border:1px solid ${s.navy ? "rgba(243,112,33,0.3)" : LINE};border-radius:12px;padding:16px 18px;text-align:center;">
        <div style="font-size:10px;font-weight:700;letter-spacing:1.5px;color:${s.navy ? "rgba(255,255,255,0.5)" : MUTED};text-transform:uppercase;margin-bottom:6px;">${s.label}</div>
        <div style="font-size:22px;font-weight:900;color:${s.navy ? WHITE : NAVY};line-height:1;">${s.value}</div>
        ${s.sub ? `<div style="font-size:11px;color:${s.navy ? ORANGE : ORANGE};font-weight:700;margin-top:4px;">${s.sub}</div>` : ""}
      </div>
    </td>`).join("");
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 26px 0;">
    <tr>${cells}</tr>
  </table>`;
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function progressBar(pct: number, label: string): string {
  const c     = Math.min(100, Math.max(0, pct));
  const color = pct >= 90 ? "#16a34a" : pct >= 70 ? "#d97706" : "#dc2626";
  const bg    = pct >= 90 ? "#dcfce7" : pct >= 70 ? "#fef9c3" : "#fee2e2";
  return `
  <div style="margin-bottom:14px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:5px;">
      <tr>
        <td style="font-size:12px;font-weight:700;color:${INK};">${label}</td>
        <td align="right" style="font-size:12px;font-weight:900;color:${color};">${Math.round(c)}%</td>
      </tr>
    </table>
    <div style="background:${LINE};border-radius:999px;height:10px;overflow:hidden;">
      <div style="background:${color};height:10px;border-radius:999px;width:${c}%;"></div>
    </div>
  </div>`;
}

// ── CLO signature ─────────────────────────────────────────────────────────────
function cloSig(): string {
  return `
  <table cellpadding="0" cellspacing="0" style="margin-top:28px;padding-top:20px;border-top:1.5px solid ${LINE};">
    <tr>
      <td>
        <p style="margin:0;font-size:15px;font-weight:900;color:${NAVY};">Darius James</p>
        <p style="margin:2px 0 0;font-size:12px;font-weight:700;color:${ORANGE};text-transform:uppercase;letter-spacing:0.5px;">Chief Lending Officer</p>
        <p style="margin:2px 0 0;font-size:12px;color:${MUTED};">Harris Capital Mortgage Group</p>
      </td>
    </tr>
  </table>`;
}

// ── CTA button ────────────────────────────────────────────────────────────────
function cta(label: string, href: string): string {
  return `<a href="${href}"
    style="display:inline-block;background:linear-gradient(135deg,#FF9847,#F37021);color:#fff;font-size:14px;font-weight:800;
           padding:15px 36px;border-radius:12px;text-decoration:none;letter-spacing:0.3px;box-shadow:0 4px 16px rgba(243,112,33,0.35);"
    >${label}</a>`;
}

// ── Footer ────────────────────────────────────────────────────────────────────
function footer(): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${WHITE};margin-top:0;">
    <tr><td style="padding:0;">
      <!-- Top fade line -->
      <div style="height:1px;background:${LINE};"></div>
      <div style="height:3px;background:linear-gradient(90deg,${ORANGE} 0%,#FF9847 50%,rgba(243,112,33,0.0) 100%);"></div>
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:22px 32px 20px;">
            <table cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
              <tr>
                <td style="vertical-align:middle;padding-right:12px;">
                  <img src="${SLICE_LOGO_URL}" alt="SLICE" width="36" height="auto" style="display:block;height:36px;width:auto;" />
                </td>
                <td style="vertical-align:middle;border-left:1px solid ${LINE};padding-left:12px;">
                  <img src="${HCMG_LOGO_URL}" alt="HCMG" width="70" height="auto" style="display:block;height:12px;width:auto;" />
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:11px;color:${MUTED};line-height:1.8;">
              Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender<br/>
              6375 S Pecos Rd, Suite 208 · Las Vegas, NV 89120
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`;
}

// ── Navy message box ──────────────────────────────────────────────────────────
function navyBox(eyebrow: string, body: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:0 26px;">
    <tr><td>
      <div style="background:${NAVY};border-radius:14px;padding:20px 24px;margin:0 0 20px;">
        <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:2px;color:${ORANGE};text-transform:uppercase;">${eyebrow}</p>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.8);line-height:1.7;font-style:italic;">&ldquo;${body}&rdquo;</p>
      </div>
    </td></tr>
  </table>`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. ANNOUNCEMENT
// ══════════════════════════════════════════════════════════════════════════════

export function buildAnnouncementEmail(
  goal: GoalMonth,
  recipientName: string,
  commitUrl: string,
): string {
  const body = `
    ${topBar()}
    ${hero("🥧 Slice of the Pie", `${goal.month_label} Company Goal Is Live`, "Harris Capital Mortgage Group has officially launched this month's goal.")}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 32px 0;">
      <tr><td>
        <p style="margin:0;font-size:15px;color:${INK};line-height:1.8;">
          Hi <strong>${recipientName}</strong>,
        </p>
        <p style="margin:12px 0 0;font-size:15px;color:${MUTED};line-height:1.8;">
          It&apos;s a new month. The company goal is set. Now it&apos;s time to claim your slice of the pie.
          Every loan officer who commits will be on the leaderboard — publicly accountable and recognized.
        </p>
      </td></tr>
    </table>

    ${statGrid([
      { label: "Funded Volume Goal", value: fmt$(goal.funded_volume_goal), navy: true },
      { label: "Funded Units Goal",  value: goal.funded_units_goal.toString(), sub: "Loans" },
    ])}

    ${goal.app_volume_goal > 0 ? statGrid([
      { label: "Application Volume", value: fmt$(goal.app_volume_goal) },
      { label: "Application Units",  value: goal.app_units_goal.toString(), sub: "Apps" },
    ]) : ""}

    ${goal.clo_message ? navyBox("Message from Leadership", goal.clo_message) : ""}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 32px 32px;">
      <tr><td>
        <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:${NAVY};">How much are <em>you</em> committing to?</p>
        <p style="margin:0 0 24px;font-size:14px;color:${MUTED};line-height:1.7;">
          Take 2 minutes to set your monthly goal, share your strategy, and sign your commitment.
          Your slice shows up on the live leaderboard the moment you submit.
        </p>
        <div style="text-align:center;padding:8px 0;">
          ${cta("🥧 Claim My Slice of the Pie", commitUrl)}
        </div>
        ${cloSig()}
      </td></tr>
    </table>
    ${footer()}`;

  return wrap(body);
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. COMMITMENT REMINDER
// ══════════════════════════════════════════════════════════════════════════════

export function buildReminderEmail(
  goal: GoalMonth,
  recipientName: string,
  commitUrl: string,
): string {
  const body = `
    ${topBar()}
    ${hero("⏰ Reminder", "You Haven't Claimed Your Slice Yet", `${goal.month_label} · Commitment window is still open`)}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 32px;">
      <tr><td>
        <p style="margin:0 0 12px;font-size:15px;color:${INK};line-height:1.8;">Hi <strong>${recipientName}</strong>,</p>
        <p style="margin:0 0 24px;font-size:15px;color:${MUTED};line-height:1.8;">
          The company goal is live and your teammates are already claiming their slices.
          You haven&apos;t submitted yet — don&apos;t let the month get away from you.
        </p>

        ${statGrid([
          { label: "Company Goal",  value: fmt$(goal.funded_volume_goal), navy: true },
          { label: "Units Target",  value: goal.funded_units_goal.toString(), sub: "Loans" },
        ])}

        <p style="margin:20px 0 24px;font-size:14px;color:${MUTED};line-height:1.7;">
          Your commitment is public. Your teammates see who&apos;s in and who&apos;s not.
          Take 2 minutes to own your slice.
        </p>
        <div style="text-align:center;padding:8px 0;">
          ${cta("Submit My Commitment Now", commitUrl)}
        </div>
        ${cloSig()}
      </td></tr>
    </table>
    ${footer()}`;

  return wrap(body);
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. WEEKLY PROGRESS
// ══════════════════════════════════════════════════════════════════════════════

export function buildWeeklyProgressEmail(
  goal: GoalMonth,
  recipientName: string,
  commitment: GoalCommitment,
  actualVolume: number,
  actualUnits: number,
  rank: number,
  totalParticipants: number,
  daysLeft: number,
  paceRequired?: number,   // elapsed % of month — passed from cron; defaults to 100 if missing
): string {
  const volumePct   = commitment.funded_volume_commitment > 0
    ? (actualVolume / commitment.funded_volume_commitment) * 100 : 0;
  const unitPct     = commitment.funded_units_commitment > 0
    ? (actualUnits / commitment.funded_units_commitment) * 100 : 0;
  const remaining   = Math.max(0, commitment.funded_volume_commitment - actualVolume);
  // Time-adjusted pace: how far ahead/behind you are relative to elapsed time
  const required    = paceRequired ?? 100;
  const paceDelta   = volumePct - required;          // positive = ahead, negative = behind
  const statusColor = paceDelta >= 0 ? "#16a34a" : paceDelta >= -15 ? "#d97706" : "#dc2626";
  const statusMsg   = paceDelta >= 0
    ? "🟢 You&apos;re ahead of pace — keep pushing!"
    : paceDelta >= -15
    ? "🟡 Slightly behind pace — time to pick it up."
    : "🔴 Behind pace — you need to accelerate right now.";

  const body = `
    ${topBar()}
    ${hero("📊 Weekly Progress", `Your ${goal.month_label} Update`, `${daysLeft} days remaining · Ranked #${rank} of ${totalParticipants}`)}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 32px 0;">
      <tr><td>
        <p style="margin:0 0 20px;font-size:15px;color:${INK};line-height:1.8;">Hi <strong>${recipientName}</strong>, here&apos;s your weekly snapshot:</p>
      </td></tr>
    </table>

    ${statGrid([
      { label: "Your Commitment",    value: fmt$(commitment.funded_volume_commitment), navy: true },
      { label: "Funded So Far",      value: fmt$(actualVolume), sub: fmtPct(volumePct) },
    ])}
    ${statGrid([
      { label: "Still Needed",       value: fmt$(remaining) },
      { label: "Days Left",          value: daysLeft.toString() },
    ])}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 32px 0;">
      <tr><td>
        ${progressBar(volumePct, "Funded Volume")}
        ${progressBar(unitPct,   "Funded Units")}
        <div style="background:${SAND};border:1.5px solid ${LINE};border-radius:10px;padding:14px 18px;margin-top:16px;">
          <p style="margin:0;font-size:14px;font-weight:800;color:${statusColor};">${statusMsg}</p>
        </div>
        <div style="text-align:center;padding:28px 0 8px;">
          ${cta("View My Dashboard", `${SITE}/goal-engine/dashboard`)}
        </div>
        ${cloSig()}
      </td></tr>
    </table>
    ${footer()}`;

  return wrap(body);
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. OFF-PACE ALERT
// ══════════════════════════════════════════════════════════════════════════════

export function buildOffPaceEmail(
  goal: GoalMonth,
  recipientName: string,
  commitment: GoalCommitment,
  actualVolume: number,
  daysLeft: number,
): string {
  const pct         = commitment.funded_volume_commitment > 0
    ? (actualVolume / commitment.funded_volume_commitment) * 100 : 0;
  const needed      = Math.max(0, commitment.funded_volume_commitment - actualVolume);
  const dailyNeeded = daysLeft > 0 ? needed / daysLeft : needed;

  const body = `
    ${topBar()}
    ${hero("🔴 Behind Pace", "You&apos;re Falling Behind Your Goal", `${goal.month_label} · ${daysLeft} days remaining`)}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 32px 0;">
      <tr><td>
        <p style="margin:0 0 12px;font-size:15px;color:${INK};line-height:1.8;">Hi <strong>${recipientName}</strong>,</p>
        <p style="margin:0 0 20px;font-size:15px;color:${MUTED};line-height:1.8;">
          Your production is at <strong style="color:#dc2626;">${Math.round(pct)}%</strong> of your commitment.
          There is still time — but it requires action today, not next week.
        </p>
      </td></tr>
    </table>

    ${statGrid([
      { label: "Your Commitment",  value: fmt$(commitment.funded_volume_commitment), navy: true },
      { label: "Funded So Far",    value: fmt$(actualVolume), sub: `${Math.round(pct)}% of goal` },
    ])}
    ${statGrid([
      { label: "Still Needed",     value: fmt$(needed) },
      { label: "Daily Needed",     value: fmt$(dailyNeeded), sub: `for ${daysLeft} days` },
    ])}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 32px 32px;">
      <tr><td>
        ${progressBar(pct, "Your Progress")}
        <p style="margin:16px 0 24px;font-size:14px;color:${MUTED};line-height:1.8;">
          You have <strong style="color:${NAVY};">${daysLeft} days</strong>. Every application, every follow-up,
          every referral counts. You committed to this. Let&apos;s finish strong.
        </p>
        <div style="text-align:center;">
          ${cta("View My Dashboard", `${SITE}/goal-engine/dashboard`)}
        </div>
        ${cloSig()}
      </td></tr>
    </table>
    ${footer()}`;

  return wrap(body);
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. COMPANY MILESTONE
// ══════════════════════════════════════════════════════════════════════════════

export function buildCompanyMilestoneEmail(
  goal: GoalMonth,
  recipientName: string,
  milestonePct: number,
  totalActual: number,
): string {
  const body = `
    ${topBar()}
    ${hero("🎉 Company Milestone", `We&apos;ve Hit ${milestonePct}% of Our Goal!`, `${goal.month_label} · Keep the momentum going`)}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 32px 0;">
      <tr><td>
        <p style="margin:0 0 20px;font-size:15px;color:${INK};line-height:1.8;">
          Hi <strong>${recipientName}</strong>,
        </p>
        <p style="margin:0 0 20px;font-size:15px;color:${MUTED};line-height:1.8;">
          The HCMG team has collectively funded <strong style="color:${NAVY};">${fmt$(totalActual)}</strong> this month —
          reaching <strong style="color:#16a34a;">${milestonePct}%</strong> of our company goal. This is what teamwork looks like.
        </p>
      </td></tr>
    </table>

    ${statGrid([
      { label: "Company Goal",   value: fmt$(goal.funded_volume_goal), navy: true },
      { label: "Total Funded",   value: fmt$(totalActual), sub: `${milestonePct}% of goal` },
    ])}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 32px 32px;">
      <tr><td>
        ${progressBar(milestonePct, `${goal.month_label} Progress`)}
        <p style="margin:16px 0 24px;font-size:14px;color:${MUTED};line-height:1.8;">
          ${milestonePct >= 100
            ? "We did it. Congratulations to every single person on this team. You made it happen."
            : `We&apos;re ${100 - milestonePct}% away from 100%. Push every deal to the finish line.`}
        </p>
        <div style="text-align:center;">
          ${cta("See the Leaderboard", `${SITE}/goal-engine/leaderboard`)}
        </div>
        ${cloSig()}
      </td></tr>
    </table>
    ${footer()}`;

  return wrap(body);
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. END OF MONTH RECAP
// ══════════════════════════════════════════════════════════════════════════════

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
  const companyPct  = goal.funded_volume_goal > 0 ? Math.round((companyTotal / goal.funded_volume_goal) * 100) : 0;
  const personalPct = commitment.funded_volume_commitment > 0
    ? Math.round((actualVolume / commitment.funded_volume_commitment) * 100) : 0;

  const body = `
    ${topBar()}
    ${hero("🏁 End of Month", `${goal.month_label} — Final Results`, `Company achieved ${companyPct}% of goal`)}

    ${statGrid([
      { label: "Company Goal",     value: fmt$(goal.funded_volume_goal), navy: true },
      { label: "Company Actual",   value: fmt$(companyTotal), sub: `${companyPct}%` },
    ])}
    ${statGrid([
      { label: "Your Commitment",  value: fmt$(commitment.funded_volume_commitment) },
      { label: "Your Production",  value: fmt$(actualVolume), sub: `${personalPct}%` },
    ])}

    ${awards.length > 0 ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:20px 32px 0;">
      <tr><td>
        <div style="background:${NAVY};border-radius:14px;padding:20px 24px;">
          <p style="margin:0 0 14px;font-size:10px;font-weight:800;letter-spacing:2px;color:${ORANGE};text-transform:uppercase;">Your Awards This Month</p>
          ${awards.map(a => `
          <p style="margin:0 0 8px;font-size:15px;font-weight:800;color:${WHITE};">
            ${a.award_emoji ?? "🏆"} ${a.award_label}
          </p>`).join("")}
        </div>
      </td></tr>
    </table>` : ""}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 32px 32px;">
      <tr><td>
        <p style="margin:0 0 6px;font-size:14px;color:${MUTED};line-height:1.8;">
          Final Rank: <strong style="color:${NAVY};">#${rank} of ${totalParticipants}</strong> &nbsp;·&nbsp;
          Units: <strong style="color:${NAVY};">${actualUnits} loans</strong>
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:${MUTED};line-height:1.8;">
          ${personalPct >= 100
            ? "You hit your commitment. That is the definition of professional excellence."
            : "Use this data to build a stronger plan next month. The leaderboard resets — your reputation doesn&apos;t."}
        </p>
        <div style="text-align:center;">
          ${cta("View Full Results", `${SITE}/goal-engine/dashboard`)}
        </div>
        ${cloSig()}
      </td></tr>
    </table>
    ${footer()}`;

  return wrap(body);
}

// ══════════════════════════════════════════════════════════════════════════════
// 7. AWARD EMAIL + CERTIFICATE HTML (for attachment)
// ══════════════════════════════════════════════════════════════════════════════

export function buildAwardEmail(
  recipientName: string,
  awardLabel: string,
  awardEmoji: string | null,
  monthLabel: string,
  statsHtml: string,
  awardId?: string,
): string {
  const emoji = awardEmoji ?? "🏆";

  const body = `
    ${topBar()}
    ${hero(`${emoji} Award`, awardLabel, `${monthLabel} · Harris Capital Mortgage Group`)}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px 32px;">
      <tr><td style="text-align:center;">

        <!-- Award badge -->
        <div style="display:inline-block;background:linear-gradient(135deg,${NAVY},#1e3a6e);border-radius:50%;width:96px;height:96px;text-align:center;line-height:96px;margin-bottom:20px;border:3px solid ${ORANGE};">
          <span style="font-size:48px;line-height:96px;">${emoji}</span>
        </div>

        <p style="margin:0 0 6px;font-size:24px;font-weight:900;color:${NAVY};">${awardLabel}</p>
        <p style="margin:0 0 4px;font-size:14px;color:${MUTED};">Presented to <strong style="color:${NAVY};">${recipientName}</strong></p>
        <p style="margin:0 0 28px;font-size:13px;color:${MUTED};">${monthLabel}</p>

        <!-- Stats -->
        <div style="background:${SAND};border:1px solid ${LINE};border-radius:12px;padding:20px;margin:0 auto 28px;max-width:380px;text-align:left;">
          ${statsHtml}
        </div>

        <!-- Certificate callout -->
        <div style="background:linear-gradient(135deg,${NAVY},#1e3a6e);border-radius:14px;padding:20px 28px;margin-bottom:28px;">
          <p style="margin:0 0 6px;font-size:11px;font-weight:800;letter-spacing:2px;color:${ORANGE};text-transform:uppercase;">🏅 Your Official Certificate</p>
          <p style="margin:0 0 16px;font-size:13px;color:rgba(255,255,255,0.75);line-height:1.7;">
            View, download, and print your certificate of recognition. Share it on LinkedIn or keep it for your records.
          </p>
          ${awardId ? `
          <a href="${SITE}/goal-engine/certificate/${awardId}"
            style="display:inline-block;background:${ORANGE};color:#fff;padding:11px 24px;border-radius:10px;font-size:13px;font-weight:800;text-decoration:none;letter-spacing:0.03em;">
            🎓 View &amp; Download Certificate →
          </a>` : `
          <a href="${SITE}/goal-engine/awards"
            style="display:inline-block;background:${ORANGE};color:#fff;padding:11px 24px;border-radius:10px;font-size:13px;font-weight:800;text-decoration:none;letter-spacing:0.03em;">
            🏆 View Your Awards →
          </a>`}
        </div>

        <p style="margin:0 0 28px;font-size:14px;color:${MUTED};line-height:1.8;max-width:440px;margin-left:auto;margin-right:auto;">
          Your dedication and performance set the standard for this team.
          Congratulations on this well-earned recognition.
        </p>

        ${cta("View My Trophy Room", `${SITE}/goal-engine/awards`)}
        ${cloSig()}
      </td></tr>
    </table>
    ${footer()}`;

  return wrap(body);
}


// ══════════════════════════════════════════════════════════════════════════════
// 8. COMMITMENT CONFIRMATION EMAIL (sent to the LO who just committed)
// ══════════════════════════════════════════════════════════════════════════════

export function buildCommitmentConfirmEmail(
  firstName: string,
  monthLabel: string,
  fundedVolume: number,
  fundedUnits: number,
  appUnits: number,
  appVolume: number,
  focus: string | null,
  challenge: string | null,
  confidence: number | null,
): string {
  const body = `
    ${topBar()}
    ${hero("🥧 Commitment Locked In", `Your slice is claimed, ${firstName}!`, `${monthLabel} · Harris Capital Mortgage Group`)}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 32px 0;">
      <tr><td>
        <p style="margin:0 0 20px;font-size:15px;color:${INK};line-height:1.8;">
          Your ${monthLabel} commitment has been submitted and locked in.
          This is your official record — leadership can see it and it counts toward participation.
        </p>

        <!-- Commitment stats -->
        ${statGrid([
          { label: "Funded Volume", value: fmt$(fundedVolume), navy: true },
          { label: "Funded Loans",  value: `${fundedUnits} loans` },
        ])}
        ${statGrid([
          { label: "App Goal",   value: `${appUnits} apps` },
          { label: "App Volume", value: fmt$(appVolume) },
          { label: "Confidence", value: `${confidence ?? 80}%` },
        ])}

        ${focus ? `
        <!-- Strategy -->
        <div style="margin:20px 0 0;padding:18px 20px;background:${SAND};border:1px solid ${LINE};border-radius:12px;">
          <p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:2px;color:${ORANGE};text-transform:uppercase;">Your Plan This Month</p>
          <p style="margin:0;font-size:13px;color:${INK};line-height:1.7;font-style:italic;">&ldquo;${focus}&rdquo;</p>
        </div>` : ""}

        ${challenge ? `
        <div style="margin:12px 0 0;padding:18px 20px;background:${SAND};border:1px solid ${LINE};border-radius:12px;">
          <p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:2px;color:${MUTED};text-transform:uppercase;">Obstacles to Watch</p>
          <p style="margin:0;font-size:13px;color:${INK};line-height:1.7;font-style:italic;">&ldquo;${challenge}&rdquo;</p>
        </div>` : ""}

        <!-- Motivational callout -->
        <div style="margin:24px 0;padding:20px 24px;background:linear-gradient(135deg,${NAVY},#1e3a6e);border-radius:14px;text-align:center;">
          <p style="margin:0 0 6px;font-size:22px;font-weight:900;color:#fff;">You own your number. 🔥</p>
          <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.65);line-height:1.7;">
            The pie is claimed. Now go fund it. Track your progress on the leaderboard anytime.
          </p>
        </div>

        ${cta("View My Dashboard →", `${SITE}/goal-engine/dashboard`)}
        ${cloSig()}
      </td></tr>
    </table>
    ${footer()}`;

  return wrap(body);
}

// ══════════════════════════════════════════════════════════════════════════════
// 9. COMMITMENT ALERT EMAIL (sent to Darius + Lamont on every new commitment)
// ══════════════════════════════════════════════════════════════════════════════

export function buildCommitmentAlertEmail(
  loFullName: string,
  loEmail: string,
  monthLabel: string,
  fundedVolume: number,
  fundedUnits: number,
  appUnits: number,
  confidence: number | null,
  focus: string | null,
  challenge: string | null,
): string {
  const body = `
    ${topBar()}
    ${hero("📋 New Commitment", `${loFullName} just committed`, `${monthLabel} · SLICE by HCMG`)}

    <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 32px 0;">
      <tr><td>
        <!-- LO identity -->
        <div style="margin-bottom:20px;padding:16px 20px;background:${SAND};border:1px solid ${LINE};border-radius:12px;">
          <p style="margin:0 0 2px;font-size:15px;font-weight:900;color:${NAVY};">${loFullName}</p>
          <p style="margin:0;font-size:12px;color:${MUTED};">${loEmail}</p>
        </div>

        <!-- Commitment numbers -->
        ${statGrid([
          { label: "Funded Volume", value: fmt$(fundedVolume), navy: true },
          { label: "Funded Loans",  value: `${fundedUnits} loans` },
          { label: "App Goal",      value: `${appUnits} apps` },
          { label: "Confidence",    value: `${confidence ?? 80}%` },
        ])}

        ${focus ? `
        <div style="margin:20px 0 0;padding:18px 20px;background:${SAND};border:1px solid ${LINE};border-radius:12px;">
          <p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:2px;color:${ORANGE};text-transform:uppercase;">Their Plan</p>
          <p style="margin:0;font-size:13px;color:${INK};line-height:1.7;font-style:italic;">&ldquo;${focus}&rdquo;</p>
        </div>` : ""}

        ${challenge ? `
        <div style="margin:12px 0 0;padding:18px 20px;background:${SAND};border:1px solid ${LINE};border-radius:12px;">
          <p style="margin:0 0 6px;font-size:9px;font-weight:800;letter-spacing:2px;color:${MUTED};text-transform:uppercase;">Obstacles They Named</p>
          <p style="margin:0;font-size:13px;color:${INK};line-height:1.7;font-style:italic;">&ldquo;${challenge}&rdquo;</p>
        </div>` : ""}

        <div style="margin:24px 0 0;">
          ${cta("View All Commitments →", `${SITE}/goal-engine/admin`)}
        </div>
      </td></tr>
    </table>
    ${footer()}`;

  return wrap(body);
}


// ══════════════════════════════════════════════════════════════════════════════
// 8. CERTIFICATE HTML (for email attachment — opens in browser, print to PDF)
// ══════════════════════════════════════════════════════════════════════════════

export function buildCertificateHtml(
  recipientFullName: string,
  awardLabel: string,
  awardEmoji: string | null,
  monthLabel: string,
  statsHtml: string,
): string {
  const emoji = awardEmoji ?? "🏆";
  const issuedDate = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>${awardLabel} — ${recipientFullName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;800;900&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Montserrat', 'Helvetica Neue', Arial, sans-serif;
      background: #0f1b2d;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
    }
    .cert {
      width: 100%;
      max-width: 760px;
      background: #ffffff;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 24px 80px rgba(0,0,0,0.5);
      position: relative;
    }
    /* Gold border accent */
    .cert::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: 20px;
      border: 3px solid #F37021;
      pointer-events: none;
    }
    .cert-top {
      background: linear-gradient(135deg, #142850 0%, #1e3a6e 100%);
      padding: 36px 48px 32px;
      text-align: center;
      border-bottom: 4px solid #F37021;
    }
    .logos {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
      margin-bottom: 28px;
    }
    .logos img { height: 48px; width: auto; display: block; }
    .logos .divider {
      width: 1px; height: 36px;
      background: rgba(255,255,255,0.2);
    }
    .cert-type {
      font-size: 10px;
      font-weight: 800;
      letter-spacing: 4px;
      color: #F37021;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    .cert-title {
      font-size: 36px;
      font-weight: 900;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: -0.5px;
      margin-bottom: 8px;
    }
    .cert-emoji {
      font-size: 56px;
      display: block;
      margin-bottom: 16px;
    }
    .cert-month {
      font-size: 14px;
      color: rgba(255,255,255,0.55);
      font-weight: 700;
    }
    .cert-body {
      padding: 40px 56px 36px;
      text-align: center;
    }
    .cert-presented {
      font-size: 13px;
      font-weight: 700;
      color: #64748B;
      letter-spacing: 1px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }
    .cert-name {
      font-size: 38px;
      font-weight: 900;
      color: #142850;
      letter-spacing: -0.5px;
      margin-bottom: 4px;
    }
    .cert-org {
      font-size: 14px;
      color: #64748B;
      margin-bottom: 32px;
    }
    .cert-divider {
      width: 80px;
      height: 3px;
      background: linear-gradient(135deg, #FF9847, #F37021);
      border-radius: 99px;
      margin: 0 auto 32px;
    }
    .cert-stats {
      display: flex;
      justify-content: center;
      gap: 0;
      margin-bottom: 32px;
      border: 1px solid #E2E8F0;
      border-radius: 14px;
      overflow: hidden;
      max-width: 480px;
      margin-left: auto;
      margin-right: auto;
    }
    .cert-stat {
      flex: 1;
      padding: 16px 20px;
      text-align: center;
      border-right: 1px solid #E2E8F0;
    }
    .cert-stat:last-child { border-right: none; }
    .cert-stat-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 4px;
    }
    .cert-stat-value {
      font-size: 20px;
      font-weight: 900;
      color: #142850;
    }
    .cert-footer {
      background: #F8FAFC;
      border-top: 1px solid #E2E8F0;
      padding: 24px 48px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .cert-sig-block { text-align: left; }
    .cert-sig-line {
      width: 140px;
      height: 1.5px;
      background: #142850;
      margin-bottom: 6px;
    }
    .cert-sig-name {
      font-size: 13px;
      font-weight: 900;
      color: #142850;
    }
    .cert-sig-title {
      font-size: 10px;
      font-weight: 700;
      color: #F37021;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cert-date-block { text-align: right; }
    .cert-date-label {
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #64748B;
      margin-bottom: 4px;
    }
    .cert-date-value {
      font-size: 13px;
      font-weight: 800;
      color: #142850;
    }
    .cert-seal {
      position: absolute;
      bottom: 80px;
      right: 48px;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #142850, #1e3a6e);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid #F37021;
      font-size: 28px;
    }
    @media print {
      body { background: white; padding: 0; }
      .cert { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="cert">

    <!-- Top navy header with logos -->
    <div class="cert-top">
      <div class="logos">
        <img src="${SLICE_LOGO_URL}" alt="SLICE by HCMG" />
        <div class="divider"></div>
        <img src="${HCMG_DARK_URL}" alt="Harris Capital Mortgage Group" style="height:20px;" />
      </div>
      <div class="cert-type">Certificate of Recognition</div>
      <span class="cert-emoji">${emoji}</span>
      <div class="cert-title">${awardLabel}</div>
      <div class="cert-month">${monthLabel} · Harris Capital Mortgage Group</div>
    </div>

    <!-- Body -->
    <div class="cert-body">
      <div class="cert-presented">This certificate is proudly presented to</div>
      <div class="cert-name">${recipientFullName}</div>
      <div class="cert-org">Harris Capital Mortgage Group</div>
      <div class="cert-divider"></div>

      <!-- Stats row -->
      <div class="cert-stats">
        ${statsHtml}
      </div>

      <p style="font-size:14px;color:#64748B;line-height:1.8;max-width:440px;margin:0 auto;">
        In recognition of outstanding performance, dedication, and excellence in the
        <strong style="color:#142850;">${monthLabel}</strong> SLICE production goal.
      </p>
    </div>

    <!-- Footer with signature -->
    <div class="cert-footer">
      <div class="cert-sig-block">
        <div class="cert-sig-line"></div>
        <div class="cert-sig-name">Darius James</div>
        <div class="cert-sig-title">Chief Lending Officer</div>
      </div>
      <div class="cert-date-block">
        <div class="cert-date-label">Issued</div>
        <div class="cert-date-value">${issuedDate}</div>
      </div>
    </div>

    <!-- Seal -->
    <div class="cert-seal">${emoji}</div>

  </div>

  <p style="text-align:center;margin-top:20px;font-size:12px;color:rgba(255,255,255,0.4);font-family:sans-serif;">
    To save as PDF: File → Print → Save as PDF &nbsp;·&nbsp; hcmgloans.com
  </p>
</body>
</html>`;
}

// ── Certificate stat cell helper (used in buildCertificateHtml) ───────────────
export function certStat(label: string, value: string): string {
  return `<div class="cert-stat">
    <div class="cert-stat-label">${label}</div>
    <div class="cert-stat-value">${value}</div>
  </div>`;
}
