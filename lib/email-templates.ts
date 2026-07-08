/**
 * HCMG Shared Email Templates
 * All transactional emails use these helpers for consistent branding.
 *
 * Design: navy (#142850) header, orange (#F37021) accent, white body,
 * sand (#f5f0eb) footer and background. Inline SVG wordmark.
 */

// ── Inline SVG logo (safe for all email clients) ─────────────────────────────

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 40" height="32" style="display:block;">
  <rect width="36" height="36" rx="6" ry="6" y="2" fill="#142850"/>
  <text x="11" y="28" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="22" fill="#fff">H</text>
  <rect x="26" y="24" width="7" height="7" fill="#F37021"/>
  <text x="46" y="22" font-family="Arial Black,Arial,sans-serif" font-weight="900" font-size="16" fill="#ffffff" letter-spacing="1">HCMG</text>
  <text x="46" y="34" font-family="Arial,sans-serif" font-size="8.5" fill="#94a3b8" letter-spacing="0.5">HARRIS CAPITAL MORTGAGE GROUP</text>
</svg>`;

// ── Base styles ───────────────────────────────────────────────────────────────

export const EMAIL_BODY_STYLE = `margin:0;padding:0;background:#f5f0eb;font-family:'Helvetica Neue',Arial,sans-serif;`;
export const EMAIL_WRAP_STYLE = `max-width:580px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;`;

// ── Header ────────────────────────────────────────────────────────────────────

export function emailHeader(eyebrow: string, headline: string, subline?: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#142850;">
    <tr><td style="padding:28px 36px 24px;">
      <!-- Logo -->
      <div style="margin-bottom:20px;">${LOGO_SVG}</div>
      <!-- Eyebrow -->
      <div style="display:inline-block;background:rgba(243,112,33,0.18);border:1px solid rgba(243,112,33,0.45);border-radius:6px;padding:3px 10px;margin-bottom:10px;">
        <span style="font-size:10px;font-weight:700;letter-spacing:2px;color:#F37021;text-transform:uppercase;">${eyebrow}</span>
      </div>
      <!-- Headline -->
      <p style="margin:0;font-size:24px;font-weight:900;color:#ffffff;line-height:1.2;letter-spacing:-0.3px;">${headline}</p>
      ${subline ? `<p style="margin:6px 0 0;font-size:13px;color:#94a3b8;line-height:1.5;">${subline}</p>` : ""}
    </td></tr>
  </table>`;
}

// ── Footer ────────────────────────────────────────────────────────────────────

export function emailFooter(extra?: string): string {
  return `
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;border-top:1px solid #e5e7eb;">
    <tr><td style="padding:20px 36px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding-bottom:12px;">${LOGO_SVG}</td>
        </tr>
      </table>
      <p style="margin:0 0 4px;font-size:11px;line-height:1.8;color:#9AABB8;">
        Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender<br/>
        6375 S Pecos Rd, Suite 208 · Las Vegas, NV 89120
      </p>
      ${extra ? `<p style="margin:8px 0 0;font-size:11px;color:#9AABB8;">${extra}</p>` : ""}
    </td></tr>
  </table>`;
}

// ── Info row ─────────────────────────────────────────────────────────────────

export function infoRow(label: string, value: string | null | undefined, last = false): string {
  if (!value) return "";
  return `
  <tr>
    <td style="padding:9px 0;${last ? "" : "border-bottom:1px solid #f0f0f0;"}color:#9AABB8;font-size:13px;width:160px;vertical-align:top;white-space:nowrap;">${label}</td>
    <td style="padding:9px 0;${last ? "" : "border-bottom:1px solid #f0f0f0;"}font-weight:600;color:#1A2B42;font-size:13px;">${value}</td>
  </tr>`;
}

// ── Section block (dark header + white body) ─────────────────────────────────

export function emailSection(title: string, rows: string): string {
  if (!rows.trim()) return "";
  return `
  <table width="100%" cellpadding="0" cellspacing="0"
    style="margin-bottom:20px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
    <tr><td style="padding:10px 20px;background:#142850;">
      <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;">${title}</p>
    </td></tr>
    <tr><td style="padding:4px 20px 4px;">
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    </td></tr>
  </table>`;
}

// ── CTA button ────────────────────────────────────────────────────────────────

export function ctaButton(label: string, href: string, secondary = false): string {
  const bg = secondary ? "#f5f0eb" : "#F37021";
  const color = secondary ? "#1A2B42" : "#ffffff";
  const border = secondary ? "border:1px solid #e5e7eb;" : "";
  return `<a href="${href}"
    style="display:inline-block;background:${bg};${border}color:${color};font-size:14px;font-weight:700;
           padding:14px 28px;border-radius:12px;text-decoration:none;letter-spacing:0.2px;"
    >${label}</a>`;
}

// ── Full email wrapper ────────────────────────────────────────────────────────

export function emailWrap(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
</head>
<body style="${EMAIL_BODY_STYLE}">
  <table width="100%" cellpadding="0" cellspacing="0" style="${EMAIL_BODY_STYLE}padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="${EMAIL_WRAP_STYLE}">
        ${content}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Full divider line ─────────────────────────────────────────────────────────

export const EMAIL_DIVIDER = `
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td style="padding:0 36px;"><div style="height:1px;background:#f0f0f0;"></div></td></tr>
  </table>`;

// ═════════════════════════════════════════════════════════════════════════════
// Named email builders — one per email type
// ═════════════════════════════════════════════════════════════════════════════

// ── 1. Portal invite / welcome ────────────────────────────────────────────────

export function buildInviteEmail({
  full_name, email, lo_slug, title, nmls, portalUrl, teamUrl, funnelUrl,
}: {
  full_name: string; email: string; lo_slug: string | null;
  title: string | null; nmls: string | null;
  portalUrl: string; teamUrl: string | null; funnelUrl: string | null;
}): string {
  const first = full_name.split(" ")[0];
  const loRows = lo_slug
    ? emailSection("Your Details",
        infoRow("Title", title) +
        infoRow("NMLS#", nmls) +
        infoRow("Email / Login", email) +
        infoRow("Your funnel link", funnelUrl ? `<a href="${funnelUrl}" style="color:#F37021;">${funnelUrl}</a>` : null, true)
      )
    : "";

  return emailWrap(`
    ${emailHeader("Welcome to HCMG", `Welcome, ${first}!`, "Your portal account is ready — here&apos;s everything you need.")}
    <tr><td style="padding:32px 36px 0;">
      <p style="margin:0 0 24px;font-size:15px;line-height:1.75;color:#5A6B7E;">
        You&apos;ve been added to the <strong style="color:#1A2B42;">Harris Capital Mortgage Group</strong> portal.
        Use it to manage your leads, funnels, co-branded pages, and public profile — all in one place.
      </p>
      ${emailSection("Login",
          infoRow("Email", email) +
          infoRow("Portal URL", `<a href="${portalUrl}" style="color:#F37021;">${portalUrl}</a>`, true)
        )}
      ${loRows}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="padding-right:${teamUrl ? "10px" : "0"};">${ctaButton("Go to My Portal →", portalUrl)}</td>
          ${teamUrl ? `<td>${ctaButton("View My Team Page →", teamUrl, true)}</td>` : ""}
        </tr>
      </table>
      <p style="margin:0 0 28px;font-size:12px;color:#9AABB8;line-height:1.6;">
        Questions? Contact <a href="mailto:support@hcmgloans.com" style="color:#F37021;">support@hcmgloans.com</a>
      </p>
    </td></tr>
    ${emailFooter()}
  `);
}

// ── 2. Co-branded share (to realtor) ─────────────────────────────────────────

export function buildCoBrandedShareEmail({
  realtorFirstName, realtorCompany, loName, loPhone, pageUrl, loNmls,
}: {
  realtorFirstName: string; realtorCompany: string;
  loName: string; loPhone: string | null; pageUrl: string; loNmls?: string | null;
}): string {
  return emailWrap(`
    ${emailHeader("Co-Branded Referral Page", `Hi ${realtorFirstName},`, `${loName} set up a co-branded page just for ${realtorCompany}.`)}
    <tr><td style="padding:32px 36px 0;">
      <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#5A6B7E;">
        <strong style="color:#1A2B42;">${loName}</strong> at Harris Capital Mortgage Group has created a
        co-branded mortgage page for you and <strong style="color:#1A2B42;">${realtorCompany}</strong>.
      </p>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#5A6B7E;">
        Share this link with your clients — when they fill out the quick form they&apos;ll be connected
        directly to ${loName.split(" ")[0]} for their pre-approval. Zero friction for your buyers.
      </p>
      ${emailSection("Your Page",
          infoRow("Page URL", `<a href="${pageUrl}" style="color:#F37021;word-break:break-all;">${pageUrl}</a>`) +
          infoRow("Your LO", loName + (loNmls ? ` · NMLS# ${loNmls}` : "")) +
          infoRow("Phone", loPhone, true)
        )}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td>${ctaButton("View Your Co-Branded Page →", pageUrl)}</td></tr>
      </table>
      <p style="margin:0 0 28px;font-size:12px;color:#9AABB8;">
        Questions? Reply to this email or call ${loName.split(" ")[0]}${loPhone ? ` at ${loPhone}` : ""}.
      </p>
    </td></tr>
    ${emailFooter("This page was created for you by a licensed HCMG loan officer.")}
  `);
}

// ── 3. Mobile app install instructions ───────────────────────────────────────

export function buildMobileAppEmail({
  device, installUrl,
}: {
  device: "ios" | "android" | "other"; installUrl: string;
}): string {
  const deviceLabel = device === "ios" ? "iPhone / iPad" : device === "android" ? "Android" : "your device";
  const deviceIcon  = device === "ios" ? "🍎" : device === "android" ? "🤖" : "📱";

  const steps = device === "ios"
    ? ["Open the link below in <strong>Safari</strong> on your iPhone or iPad",
       "Tap the <strong>Share</strong> button (box with arrow pointing up ↑)",
       "Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>",
       "Tap <strong>Add</strong> — the HCMG icon appears on your home screen"]
    : device === "android"
    ? ["Open the link below in <strong>Chrome</strong> on your Android device",
       "Tap the <strong>three-dot menu</strong> (⋮) in the top-right corner",
       "Tap <strong>&ldquo;Add to Home screen&rdquo;</strong> or <strong>&ldquo;Install app&rdquo;</strong>",
       "Tap <strong>Add</strong> — the HCMG icon appears on your home screen"]
    : ["Open the link below on your phone",
       "Follow your browser&apos;s prompt to install or add to home screen"];

  const stepsHtml = steps.map((s, i) => `
    <tr>
      <td style="width:28px;padding:8px 0;vertical-align:top;">
        <div style="width:22px;height:22px;border-radius:50%;background:#142850;color:#fff;font-size:11px;font-weight:700;text-align:center;line-height:22px;">${i + 1}</div>
      </td>
      <td style="padding:8px 0 8px 8px;font-size:14px;color:#5A6B7E;line-height:1.6;${i < steps.length - 1 ? "border-bottom:1px solid #f0f0f0;" : ""}">${s}</td>
    </tr>`).join("");

  return emailWrap(`
    ${emailHeader(`Install on ${deviceLabel}`, `${deviceIcon} Add HCMG to Your Home Screen`, "No App Store required — installs directly from your browser.")}
    <tr><td style="padding:32px 36px 0;">
      <p style="margin:0 0 20px;font-size:15px;line-height:1.75;color:#5A6B7E;">
        Follow these steps on your <strong style="color:#1A2B42;">${deviceLabel}</strong> to install the HCMG portal as an app:
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;padding:8px 16px;">
        ${stepsHtml}
      </table>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td align="center">${ctaButton("Open Portal on My Phone →", installUrl)}</td></tr>
      </table>
      <p style="margin:0 0 28px;font-size:12px;color:#9AABB8;text-align:center;">
        If you didn&apos;t request this, you can safely ignore this email.
      </p>
    </td></tr>
    ${emailFooter()}
  `);
}

// ── 4. Lead confirmation (buyer) ─────────────────────────────────────────────

export function buildLeadConfirmationEmail({
  firstName, loName, loNmls, goal, priceRange, creditRange,
  buyingPowerLow, buyingPowerHigh, monthlyPayment, recommendedLoanType, siteUrl,
}: {
  firstName: string; loName?: string | null; loNmls?: string | null;
  goal?: string | null; priceRange?: string | null; creditRange?: string | null;
  buyingPowerLow?: number | null; buyingPowerHigh?: number | null;
  monthlyPayment?: number | null; recommendedLoanType?: string | null; siteUrl: string;
}): string {
  const fmt = (n?: number | null) => n ? `$${n.toLocaleString()}` : null;

  const hasEstimate = !!(buyingPowerHigh || monthlyPayment || recommendedLoanType);
  const estimateBlock = hasEstimate ? `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="margin-bottom:24px;background:#fff8f2;border:1px solid #ffe0c4;border-radius:12px;overflow:hidden;">
      <tr><td style="padding:10px 20px;background:#F37021;">
        <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#fff;text-transform:uppercase;">Your Estimate Summary</p>
      </td></tr>
      <tr><td style="padding:4px 20px 4px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow("Buying power", buyingPowerLow && buyingPowerHigh ? `${fmt(buyingPowerLow)} – ${fmt(buyingPowerHigh)}` : null)}
          ${infoRow("Monthly payment", monthlyPayment ? `${fmt(monthlyPayment)}/mo` : null)}
          ${infoRow("Recommended path", recommendedLoanType, true)}
        </table>
      </td></tr>
    </table>` : "";

  return emailWrap(`
    ${emailHeader("Your Estimate Is Ready", `Hi ${firstName} 👋`, loName
      ? `We&apos;ve routed your inquiry directly to ${loName} — they&apos;ll reach out within one business day.`
      : "We&apos;ve received your inquiry. A licensed HCMG loan officer will reach out within one business day.")}
    <tr><td style="padding:32px 36px 0;">
      ${estimateBlock}
      ${emailSection("What You Submitted",
          infoRow("Goal", goal) +
          infoRow("Price range", priceRange) +
          infoRow("Credit range", creditRange) +
          infoRow("Assigned to", loName ? loName + (loNmls ? ` · NMLS# ${loNmls}` : "") : null, true)
        )}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td>${ctaButton("Explore more options →", `${siteUrl}/get-started`)}</td></tr>
      </table>
      <p style="margin:0 0 28px;font-size:13px;line-height:1.75;color:#9AABB8;">
        Questions? Reply to this email or call
        <a href="tel:+18884413930" style="color:#F37021;text-decoration:none;">1-888-441-3930</a>.
      </p>
    </td></tr>
    ${emailFooter("This message was sent because you submitted an inquiry at hcmgloans.com.")}
  `);
}

// ── 5. LO new-lead notification ───────────────────────────────────────────────

export function buildLoNotificationEmail({
  loFirstName, leadFullName, email, phone, goal, priceRange, creditRange,
  incomeRange, utmSource, utmMedium, utmCampaign, monthlyPayment,
  buyingPowerLow, buyingPowerHigh, recommendedLoanType, entryPage, device, portalUrl,
}: {
  loFirstName: string; leadFullName: string; email: string; phone: string;
  goal?: string | null; priceRange?: string | null; creditRange?: string | null;
  incomeRange?: string | null; utmSource?: string | null; utmMedium?: string | null;
  utmCampaign?: string | null; monthlyPayment?: number | null;
  buyingPowerLow?: number | null; buyingPowerHigh?: number | null;
  recommendedLoanType?: string | null; entryPage?: string | null; device?: string | null;
  portalUrl: string;
}): string {
  const fmt = (n?: number | null) => n ? `$${n.toLocaleString()}` : null;

  return emailWrap(`
    ${emailHeader("New Lead Assigned To You", `Hi ${loFirstName} 👋`, "A new lead came in through your funnel. Reach out quickly — fresh leads convert best.")}
    <tr><td style="padding:32px 36px 0;">
      ${emailSection("Contact Details",
          infoRow("Name", leadFullName) +
          infoRow("Email", `<a href="mailto:${email}" style="color:#F37021;">${email}</a>`) +
          infoRow("Phone", `<a href="tel:${phone}" style="color:#F37021;">${phone}</a>`) +
          infoRow("Device", device) +
          infoRow("Entry page", entryPage, true)
        )}
      ${emailSection("Mortgage Details",
          infoRow("Goal", goal) +
          infoRow("Price range", priceRange) +
          infoRow("Credit range", creditRange) +
          infoRow("Income range", incomeRange) +
          infoRow("Est. monthly", monthlyPayment ? `${fmt(monthlyPayment)}/mo` : null) +
          infoRow("Est. buying power", buyingPowerLow && buyingPowerHigh ? `${fmt(buyingPowerLow)} – ${fmt(buyingPowerHigh)}` : null) +
          infoRow("Loan path", recommendedLoanType, true)
        )}
      ${(utmSource || utmCampaign)
        ? emailSection("Lead Attribution",
            infoRow("Source", utmSource) +
            infoRow("Medium", utmMedium) +
            infoRow("Campaign", utmCampaign, true)
          )
        : ""}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td>${ctaButton("View in My Portal →", portalUrl)}</td></tr>
      </table>
    </td></tr>
    ${emailFooter()}
  `);
}

// ── 6. Company / admin lead alert ────────────────────────────────────────────

export function buildCompanyAlertEmail({
  leadFullName, email, phone, source, goal, priceRange, creditRange,
  utmSource, utmCampaign, adminUrl, isEmployment, isContact,
}: {
  leadFullName: string; email: string; phone: string; source: string;
  goal?: string | null; priceRange?: string | null; creditRange?: string | null;
  utmSource?: string | null; utmCampaign?: string | null;
  adminUrl: string; isEmployment: boolean; isContact: boolean;
}): string {
  const eyebrow = isEmployment ? "Recruiting Inquiry" : isContact ? "Contact Form" : "Company Lead — Needs Assignment";
  const headline = isEmployment ? "New Recruiting Inquiry" : isContact ? "New Contact Form Submission" : "New Unassigned Lead";
  const sub = isEmployment || isContact ? `Via ${source}` : `Via ${source} · No LO assigned — log in to assign.`;

  return emailWrap(`
    ${emailHeader(eyebrow, headline, sub)}
    <tr><td style="padding:32px 36px 0;">
      ${emailSection("Contact Details",
          infoRow("Name", leadFullName) +
          infoRow("Email", `<a href="mailto:${email}" style="color:#F37021;">${email}</a>`) +
          infoRow("Phone", `<a href="tel:${phone}" style="color:#F37021;">${phone}</a>`, true)
        )}
      ${!isEmployment && !isContact
        ? emailSection("Mortgage Details",
            infoRow("Goal", goal) +
            infoRow("Price range", priceRange) +
            infoRow("Credit range", creditRange, true)
          )
        : ""}
      ${(utmSource || utmCampaign) && !isEmployment
        ? emailSection("Attribution",
            infoRow("Source", utmSource) +
            infoRow("Campaign", utmCampaign, true)
          )
        : ""}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td>${ctaButton("View in Admin Portal →", adminUrl, false)}</td></tr>
      </table>
    </td></tr>
    ${emailFooter()}
  `);
}
