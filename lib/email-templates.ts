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

  // Link to the public /install page with device param — no login required
  const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");
  const installPageUrl = `${SITE}/install?device=${device}`;

  const steps = device === "ios"
    ? ["Tap the button below to open the install page in <strong>Safari</strong>",
       "Tap the <strong>Share</strong> button at the bottom of the screen (box with arrow pointing up ↑)",
       "Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>",
       "Tap <strong>Add</strong> — the HCMG icon appears on your home screen"]
    : device === "android"
    ? ["Tap the button below to open the install page in <strong>Chrome</strong>",
       "Tap the <strong>three-dot menu</strong> (⋮) in the top-right corner",
       "Tap <strong>&ldquo;Add to Home screen&rdquo;</strong> or <strong>&ldquo;Install app&rdquo;</strong>",
       "Tap <strong>Add</strong> — the HCMG icon appears on your home screen"]
    : ["Tap the button below to open the install page on your phone",
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
        <tr><td align="center">${ctaButton("Install on My Phone →", installPageUrl)}</td></tr>
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
  loFirstName, leadFullName, email, phone, propertyState, goal, priceRange, creditRange,
  incomeRange, utmSource, utmMedium, utmCampaign, monthlyPayment,
  buyingPowerLow, buyingPowerHigh, recommendedLoanType, entryPage, device, portalUrl,
}: {
  loFirstName: string; leadFullName: string; email: string; phone: string;
  propertyState?: string | null;
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
          infoRow("Property state", propertyState) +
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
  leadFullName, email, phone, source, propertyState, goal, priceRange, creditRange,
  utmSource, utmCampaign, adminUrl, isEmployment, isContact,
}: {
  leadFullName: string; email: string; phone: string; source: string;
  propertyState?: string | null;
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
            infoRow("Property state", propertyState) +
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

// ── Label maps for DSCR slug → readable text ─────────────────────────────────

const DSCR_PROPERTY_TYPE: Record<string, string> = {
  "single-family":  "Single-Family Home",
  "multi-family":   "Multi-Family (2–4 units)",
  "condo":          "Condo",
  "townhouse":      "Townhouse",
  "commercial":     "Commercial",
};
const DSCR_PROPERTY_USE: Record<string, string> = {
  "long-term":      "Long-Term Rental",
  "short-term":     "Short-Term Rental (STR/Airbnb)",
  "mixed":          "Mixed Use",
};
const DSCR_TRANSACTION: Record<string, string> = {
  "purchase":       "Purchase",
  "refinance":      "Refinance",
  "cash-out":       "Cash-Out Refinance",
};
const DSCR_LOAN_AMOUNT: Record<string, string> = {
  "under-200k":     "Under $200,000",
  "200-400k":       "$200,000 – $400,000",
  "400-600k":       "$400,000 – $600,000",
  "600k-plus":      "$600,000+",
};
const DSCR_CREDIT: Record<string, string> = {
  "760-plus":       "720+",
  "680-719":        "680–719",
  "640-679":        "640–679",
  "620-639":        "620–639",
  "below-620":      "Below 620",
};
const DSCR_TIMELINE: Record<string, string> = {
  "ready-now":      "Ready Now",
  "1-3-months":     "1–3 Months",
  "3-6-months":     "3–6 Months",
  "just-exploring": "Just Exploring",
};
const DSCR_RENTAL_INCOME: Record<string, string> = {
  "under-1500":     "Under $1,500 / mo",
  "1500-2500":      "$1,500 – $2,500 / mo",
  "2500-4000":      "$2,500 – $4,000 / mo",
  "4000-plus":      "$4,000+ / mo",
};

function dscrLabel(map: Record<string, string>, val: string | null | undefined): string | null {
  if (!val) return null;
  return map[val] ?? val.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

// ── 7. DSCR lead outreach (to lead, CC LO) ───────────────────────────────────

export function buildDscrLeadEmail({
  firstName, loName, loPhone, loNmls, calendarUrl, dscrNotes,
}: {
  firstName: string;
  loName: string;
  loPhone: string | null;
  loNmls: string | null;
  calendarUrl: string | null;
  dscrNotes: Record<string, string>;
}): string {
  const propertyType   = dscrLabel(DSCR_PROPERTY_TYPE,   dscrNotes["Property Type"]);
  const propertyUse    = dscrLabel(DSCR_PROPERTY_USE,    dscrNotes["Property Use"]);
  const transactionType = dscrLabel(DSCR_TRANSACTION,    dscrNotes["Transaction Type"]);
  const loanAmount     = dscrLabel(DSCR_LOAN_AMOUNT,     dscrNotes["Loan Amount"]);
  const creditScore    = dscrLabel(DSCR_CREDIT,          dscrNotes["Credit Score"]);
  const timeline       = dscrLabel(DSCR_TIMELINE,        dscrNotes["Timeline"]);
  const rentalIncome   = dscrLabel(DSCR_RENTAL_INCOME,   dscrNotes["Monthly Rental Income"]);
  const location       = dscrNotes["Property Location"]  ?? null;

  const detailsRows = [
    infoRow("Property type",    propertyType),
    infoRow("Property use",     propertyUse),
    infoRow("Transaction",      transactionType),
    infoRow("Location",         location),
    infoRow("Loan amount",      loanAmount),
    infoRow("Est. rental income", rentalIncome),
    infoRow("Credit score",     creditScore),
    infoRow("Timeline",         timeline, true),
  ].join("");

  const loFirstName = loName.split(" ")[0];
  const phoneFormatted = loPhone
    ? loPhone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
    : null;

  const calendarBlock = calendarUrl
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 20px;">
         <tr><td>${ctaButton("Book a 30-Minute Strategy Call →", calendarUrl)}</td></tr>
       </table>`
    : "";

  // Rows for the "What You Shared" card — only non-empty values
  const detailItems = [
    { label: "Property Type",      value: propertyType },
    { label: "Property Use",       value: propertyUse },
    { label: "Transaction",        value: transactionType },
    { label: "Location",           value: location },
    { label: "Loan Amount",        value: loanAmount },
    { label: "Est. Rental Income", value: rentalIncome },
    { label: "Credit Score",       value: creditScore },
    { label: "Timeline",           value: timeline },
  ].filter(r => r.value);

  const detailRowsHtml = detailItems.map((r, i) => `
    <tr>
      <td style="padding:11px 20px;${i < detailItems.length - 1 ? "border-bottom:1px solid #f3f4f6;" : ""}width:44%;font-size:12px;color:#6b7280;font-weight:500;">${r.label}</td>
      <td style="padding:11px 20px;${i < detailItems.length - 1 ? "border-bottom:1px solid #f3f4f6;" : ""}font-size:13px;color:#111827;font-weight:600;">${r.value}</td>
    </tr>`).join("");

  const calBlock = calendarUrl ? `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0 24px;">
      <tr>
        <td>
          <a href="${calendarUrl}"
            style="display:inline-block;background:#142850;color:#ffffff;font-size:14px;font-weight:700;
                   padding:15px 32px;border-radius:8px;text-decoration:none;letter-spacing:0.2px;">
            Book a 30-Minute Strategy Call &rarr;
          </a>
        </td>
      </tr>
    </table>` : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:#ffffff;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;padding:0;">
    <tr><td align="center" style="padding:40px 16px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">

        <!-- Logo bar -->
        <tr>
          <td style="padding:0 0 28px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#142850;border-radius:6px;padding:6px 10px;">
                  <span style="font-family:Arial Black,Arial,sans-serif;font-weight:900;font-size:15px;color:#ffffff;letter-spacing:1px;">HCMG</span>
                </td>
                <td style="padding-left:10px;font-size:11px;color:#9ca3af;font-weight:500;letter-spacing:0.3px;">
                  HARRIS CAPITAL MORTGAGE GROUP
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:0 0 20px;">
            <p style="margin:0 0 6px;font-size:26px;font-weight:800;color:#111827;line-height:1.2;">Hi ${firstName},</p>
            <p style="margin:0;font-size:15px;color:#6b7280;line-height:1.6;">
              Thanks for sharing your investment property details.
            </p>
          </td>
        </tr>

        <!-- Body text -->
        <tr>
          <td style="padding:0 0 24px;">
            <p style="margin:0;font-size:15px;line-height:1.75;color:#374151;">
              I specialize in <strong style="color:#142850;">DSCR loans</strong> — where you qualify based on the
              property&apos;s rental income, not W-2s or tax returns. Here&apos;s a summary of what you shared:
            </p>
          </td>
        </tr>

        <!-- Details card -->
        ${detailRowsHtml.trim() ? `
        <tr>
          <td style="padding:0 0 24px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
              <tr>
                <td colspan="2" style="background:#142850;padding:10px 20px;">
                  <span style="font-size:10px;font-weight:700;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;">What You Shared</span>
                </td>
              </tr>
              ${detailRowsHtml}
            </table>
          </td>
        </tr>` : ""}

        <!-- CTA text -->
        <tr>
          <td style="padding:0 0 8px;">
            <p style="margin:0;font-size:15px;line-height:1.75;color:#374151;">
              Based on your scenario, I&apos;d love to walk you through your options and
              confirm you&apos;re getting the best terms available. Pick a time below:
            </p>
          </td>
        </tr>

        <!-- Calendar button -->
        ${calBlock}

        <!-- Reply fallback -->
        <tr>
          <td style="padding:0 0 36px;">
            <p style="margin:0;font-size:13px;color:#9ca3af;line-height:1.6;">
              Or just reply to this email with a good time &mdash; I&apos;ll make it work.
            </p>
          </td>
        </tr>

        <!-- Signature -->
        <tr>
          <td style="border-top:1px solid #e5e7eb;padding:28px 0 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:16px;vertical-align:top;">
                  <div style="width:48px;height:48px;border-radius:50%;background:#142850;display:flex;align-items:center;justify-content:center;">
                    <span style="font-size:18px;font-weight:900;color:#ffffff;font-family:Arial Black,Arial,sans-serif;">D</span>
                  </div>
                </td>
                <td style="vertical-align:top;">
                  <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#111827;">${loName}</p>
                  <p style="margin:0 0 4px;font-size:12px;color:#6b7280;">Chief Lending Officer &middot; Harris Capital Mortgage Group</p>
                  ${phoneFormatted ? `<p style="margin:0 0 2px;font-size:13px;color:#374151;">${phoneFormatted}</p>` : ""}
                  ${loNmls ? `<p style="margin:0;font-size:11px;color:#9ca3af;">NMLS# ${loNmls}</p>` : ""}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Legal footer -->
        <tr>
          <td style="padding:32px 0 40px;">
            <p style="margin:0;font-size:10px;color:#d1d5db;line-height:1.7;">
              Harris Capital Mortgage Group, LLC &middot; NMLS# 1918223 &middot; Equal Housing Lender<br/>
              You received this because you submitted a DSCR loan inquiry at hcmgloans.com.<br/>
              Not a commitment to lend. Subject to credit approval.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── 8. DSCR LO alert (internal — sent to LO inbox on every new DSCR lead) ────

export function buildDscrLoAlertEmail({
  loFirstName, leadFullName, email, phone, dscrNotes, portalUrl, utmSource, utmCampaign,
}: {
  loFirstName: string;
  leadFullName: string;
  email: string;
  phone: string;
  dscrNotes: Record<string, string>;
  portalUrl: string;
  utmSource?: string | null;
  utmCampaign?: string | null;
}): string {
  const phoneFormatted = phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3");

  const detailRows = [
    infoRow("Name",              leadFullName),
    infoRow("Email",             `<a href="mailto:${email}" style="color:#F37021;">${email}</a>`),
    infoRow("Phone",             `<a href="tel:${phone}" style="color:#F37021;">${phoneFormatted}</a>`),
  ].join("") + [
    infoRow("Property type",     dscrLabel(DSCR_PROPERTY_TYPE,  dscrNotes["Property Type"])),
    infoRow("Property use",      dscrLabel(DSCR_PROPERTY_USE,   dscrNotes["Property Use"])),
    infoRow("Transaction",       dscrLabel(DSCR_TRANSACTION,    dscrNotes["Transaction Type"])),
    infoRow("Location",          dscrNotes["Property Location"] ?? null),
    infoRow("Property value",    dscrNotes["Property Value"]    ?? null),
    infoRow("Down payment",      dscrNotes["Down Payment"]      ?? null),
    infoRow("Loan amount",       dscrLabel(DSCR_LOAN_AMOUNT,    dscrNotes["Loan Amount"])),
    infoRow("Est. rental income",dscrLabel(DSCR_RENTAL_INCOME,  dscrNotes["Monthly Rental Income"])),
    infoRow("Credit score",      dscrLabel(DSCR_CREDIT,         dscrNotes["Credit Score"])),
    infoRow("Timeline",          dscrLabel(DSCR_TIMELINE,       dscrNotes["Timeline"]), true),
  ].join("");

  const utmBlock = (utmSource || utmCampaign)
    ? emailSection("Lead Source",
        infoRow("UTM Source",   utmSource) +
        infoRow("UTM Campaign", utmCampaign, true)
      )
    : "";

  return emailWrap(`
    ${emailHeader("🔔 New DSCR Lead", `New lead, ${loFirstName}!`, "Someone just completed your DSCR funnel — reach out within the hour.")}
    <tr><td style="padding:32px 36px 0;">
      ${emailSection("Lead Details", detailRows)}
      ${utmBlock}
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr>
          <td style="padding-right:10px;">${ctaButton("View in Portal →", portalUrl)}</td>
          <td>${ctaButton(`Call ${leadFullName.split(" ")[0]} →`, `tel:${phone}`, true)}</td>
        </tr>
      </table>
      <p style="margin:0 0 28px;font-size:12px;color:#9AABB8;line-height:1.6;">
        Fresh leads convert best — call or text within the first hour for the highest close rate.
      </p>
    </td></tr>
    ${emailFooter()}
  `);
}

// ── 9. Co-branded lead confirmation (to buyer — natural language, from LO) ────

export function buildCoBrandedLeadConfirmationEmail({
  firstName,
  loName, loPhone, loNmls, loTitle,
  realtorFirstName, realtorName, realtorCompany, realtorPhone,
  buyingPowerLow, buyingPowerHigh, recommendedLoanType,
  applicationUrl, calendarUrl,
}: {
  firstName: string;
  loName: string;
  loPhone: string | null;
  loNmls: string | null;
  loTitle: string | null;
  realtorFirstName: string;
  realtorName: string;
  realtorCompany: string;
  realtorPhone: string | null;
  buyingPowerLow?: number | null;
  buyingPowerHigh?: number | null;
  recommendedLoanType?: string | null;
  applicationUrl: string | null;
  calendarUrl: string | null;
}): string {
  const fmt = (n?: number | null) => n ? `$${n.toLocaleString()}` : null;
  const loFirst = loName.split(" ")[0];

  const estimateRange = buyingPowerLow && buyingPowerHigh
    ? `${fmt(buyingPowerLow)} – ${fmt(buyingPowerHigh)}`
    : null;

  // ── Shared text styles ──────────────────────────────────────
  const para  = `margin:0 0 18px;font-size:15px;line-height:1.8;color:#374151;`;
  const label = `margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;color:#9ca3af;text-transform:uppercase;`;
  const divider = `<tr><td style="padding:4px 0 20px;"><div style="height:1px;background:#f3f4f6;"></div></td></tr>`;

  // ── Estimate block ──────────────────────────────────────────
  const estimateBlock = (estimateRange || recommendedLoanType) ? `
    <tr><td style="padding:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <tr><td style="padding:8px 20px;background:#f9fafb;">
          <p style="${label}">Your Initial Estimate</p>
        </td></tr>
        <tr><td style="padding:12px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${estimateRange    ? `<tr><td style="font-size:13px;color:#6b7280;padding:5px 0;width:180px;">Estimated home price range</td><td style="font-size:13px;font-weight:600;color:#111827;padding:5px 0;">${estimateRange}</td></tr>` : ""}
            ${recommendedLoanType ? `<tr><td style="font-size:13px;color:#6b7280;padding:5px 0;">Potential program to discuss</td><td style="font-size:13px;font-weight:600;color:#111827;padding:5px 0;">${recommendedLoanType}</td></tr>` : ""}
          </table>
        </td></tr>
      </table>
    </td></tr>` : "";

  // ── Application CTA ─────────────────────────────────────────
  const appBlock = applicationUrl ? `
    <tr><td style="padding:0 0 16px;">
      <p style="${label}">Ready to Start Your Pre-Approval?</p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#6b7280;">
        Complete the full mortgage application and credit check so I can begin reviewing your information for pre-approval.
      </p>
      <a href="${applicationUrl}"
        style="display:inline-block;background:#F37021;color:#ffffff;font-size:14px;font-weight:700;
               padding:12px 24px;border-radius:8px;text-decoration:none;">
        Continue to Full Application →
      </a>
    </td></tr>
    ${divider}` : "";

  // ── Calendar CTA ─────────────────────────────────────────────
  const calBlock = calendarUrl ? `
    <tr><td style="padding:0 0 16px;">
      <p style="${label}">Want to Talk First?</p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#6b7280;">
        Choose a convenient time to speak with me about your estimate and financing options.
      </p>
      <a href="${calendarUrl}"
        style="display:inline-block;background:#ffffff;border:2px solid #7c5cd8;color:#7c5cd8;font-size:14px;font-weight:700;
               padding:12px 24px;border-radius:8px;text-decoration:none;">
        Book a Call With Me →
      </a>
    </td></tr>
    ${divider}` : "";

  // ── Realtor contact ──────────────────────────────────────────
  const realtorBlock = realtorPhone ? `
    <tr><td style="padding:0 0 16px;">
      <p style="${label}">Need Help With Your Home Search?</p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:#6b7280;">
        ${realtorFirstName} is available to help you find properties and navigate the homebuying process.
      </p>
      <a href="tel:${realtorPhone.replace(/[^0-9+]/g, "")}"
        style="display:inline-block;background:#ffffff;border:1px solid #e5e7eb;color:#374151;font-size:14px;font-weight:600;
               padding:12px 24px;border-radius:8px;text-decoration:none;">
        Contact ${realtorFirstName} →
      </a>
    </td></tr>
    ${divider}` : "";

  // ── LO signature ─────────────────────────────────────────────
  const signatureBlock = `
    <tr><td style="padding:0 0 24px;">
      <p style="margin:0 0 4px;font-size:15px;font-weight:700;color:#111827;">I look forward to speaking with you soon.</p>
      <p style="margin:16px 0 2px;font-size:14px;font-weight:700;color:#111827;">${loName}</p>
      ${loTitle ? `<p style="margin:0 0 2px;font-size:13px;color:#6b7280;">${loTitle}</p>` : ""}
      <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">Harris Capital Mortgage Group</p>
      ${loNmls ? `<p style="margin:0 0 2px;font-size:13px;color:#6b7280;">NMLS #${loNmls}</p>` : ""}
      ${loPhone ? `<p style="margin:0;font-size:13px;color:#6b7280;">${loPhone}</p>` : ""}
    </td></tr>`;

  // ── Realtor partner block ─────────────────────────────────────
  const realtorPartnerBlock = `
    <tr><td style="padding:0 0 24px;">
      <div style="border-top:1px solid #f3f4f6;padding-top:16px;">
        <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;">Your Realtor Partner</p>
        <p style="margin:0 0 2px;font-size:14px;font-weight:700;color:#111827;">${realtorName}</p>
        <p style="margin:0 0 2px;font-size:13px;color:#6b7280;">${realtorCompany}</p>
        ${realtorPhone ? `<p style="margin:0;font-size:13px;color:#6b7280;">${realtorPhone}</p>` : ""}
      </div>
    </td></tr>`;

  // ── Legal disclaimer ─────────────────────────────────────────
  const disclaimer = `
    <tr><td style="padding:0 0 8px;">
      <p style="margin:0;font-size:11px;line-height:1.7;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:16px;">
        <strong>Initial estimate only.</strong> This estimate is based solely on the information you provided and has not been verified.
        It is not a commitment to lend, loan approval, or pre-approval. A completed application, credit check, supporting
        documentation, and underwriting review are required.
      </p>
    </td></tr>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

        <!-- Thin accent bar -->
        <tr><td style="height:4px;background:linear-gradient(90deg,#F37021,#FF9847);"></td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 36px 8px;">
          <table width="100%" cellpadding="0" cellspacing="0">

            <!-- Greeting -->
            <tr><td style="padding:0 0 18px;">
              <p style="${para}">Hi ${firstName},</p>
              <p style="${para}">
                Thank you for sharing your homebuying goals.
              </p>
              <p style="${para}">
                ${realtorFirstName} and I are working together to help make your homebuying journey easier.
                I'll help you understand your financing options and work toward pre-approval, while
                ${realtorFirstName} can help with properties, showings, neighborhoods, and your home search.
              </p>
              <p style="${para}">
                Based on the information you provided, here is your initial estimate.
              </p>
            </td></tr>

            <!-- Estimate -->
            ${estimateBlock}

            <tr><td style="padding:0 0 18px;">
              <p style="${para}">
                I'll contact you within one business day to review your information, answer your questions, and explain your next steps.
              </p>
            </td></tr>

            ${divider}

            <!-- CTAs -->
            ${appBlock}
            ${calBlock}
            ${realtorBlock}

            <!-- Signature -->
            ${signatureBlock}

            <!-- Realtor partner -->
            ${realtorPartnerBlock}

            <!-- Disclaimer -->
            ${disclaimer}

          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── 10. Co-branded LO lead alert (internal — to loan officer) ────────────────

export function buildCoBrandedLoAlertEmail({
  loFirstName, loName,
  leadFullName, leadFirstName, email, phone, submittedAt,
  realtorName, realtorCompany,
  propertyState, goal, priceRange, creditRange, incomeRange,
  buyingPowerLow, buyingPowerHigh, monthlyPayment, recommendedLoanType,
  entryPage, device, utmSource, utmCampaign,
  portalUrl,
}: {
  loFirstName: string;
  loName: string;
  leadFullName: string;
  leadFirstName: string;
  email: string;
  phone: string;
  submittedAt: string;
  realtorName: string;
  realtorCompany: string;
  propertyState?: string | null;
  goal?: string | null;
  priceRange?: string | null;
  creditRange?: string | null;
  incomeRange?: string | null;
  buyingPowerLow?: number | null;
  buyingPowerHigh?: number | null;
  monthlyPayment?: number | null;
  recommendedLoanType?: string | null;
  entryPage?: string | null;
  device?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  portalUrl: string;
}): string {
  const fmt = (n?: number | null) => n ? `$${n.toLocaleString()}` : null;
  const phoneDigits = phone.replace(/[^0-9+]/g, "");

  const estimateRange = buyingPowerLow && buyingPowerHigh
    ? `${fmt(buyingPowerLow)} – ${fmt(buyingPowerHigh)}`
    : null;

  const monthlyStr = monthlyPayment
    ? `${fmt(monthlyPayment)}/mo (est. principal, interest, taxes &amp; insurance)`
    : null;

  // ── Shared styles ───────────────────────────────────────────
  const sectionLabel = `font-size:10px;font-weight:700;letter-spacing:2px;color:#94a3b8;text-transform:uppercase;`;
  const tdLabel      = `padding:9px 0;border-bottom:1px solid #f0f4f8;color:#6b7280;font-size:13px;width:200px;vertical-align:top;`;
  const tdValue      = `padding:9px 0;border-bottom:1px solid #f0f4f8;font-weight:600;color:#111827;font-size:13px;`;

  function row(label: string, value: string | null | undefined, last = false): string {
    if (!value) return "";
    const border = last ? "border-bottom:none;" : "";
    return `<tr>
      <td style="${tdLabel}${border}">${label}</td>
      <td style="${tdValue}${border}">${value}</td>
    </tr>`;
  }

  function section(title: string, rows: string): string {
    if (!rows.trim()) return "";
    return `
    <tr><td style="padding:0 0 20px;">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
        <tr><td style="padding:8px 20px;background:#142850;">
          <p style="margin:0;${sectionLabel}">${title}</p>
        </td></tr>
        <tr><td style="padding:4px 20px;">
          <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
        </td></tr>
      </table>
    </td></tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:600px;background:#ffffff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#142850;padding:28px 32px 24px;">
          <div style="margin-bottom:16px;">${LOGO_SVG}</div>
          <div style="display:inline-block;background:rgba(243,112,33,0.2);border:1px solid rgba(243,112,33,0.5);
                      border-radius:6px;padding:3px 10px;margin-bottom:10px;">
            <span style="font-size:10px;font-weight:700;letter-spacing:2px;color:#F37021;text-transform:uppercase;">
              New Co-Branded Buyer Lead
            </span>
          </div>
          <p style="margin:0;font-size:22px;font-weight:900;color:#ffffff;line-height:1.2;">
            Hi ${loFirstName},
          </p>
          <p style="margin:6px 0 0;font-size:14px;color:#94a3b8;line-height:1.5;">
            <strong style="color:#ffffff;">${leadFullName}</strong> just completed your homebuying questionnaire with
            <strong style="color:#ffffff;">${realtorName}</strong>.
          </p>
          <p style="margin:6px 0 0;font-size:13px;color:#F37021;font-weight:600;">
            Contact this lead as soon as possible while the inquiry is fresh.
          </p>
        </td></tr>

        <!-- Quick-action buttons -->
        <tr><td style="padding:20px 32px 4px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:10px;">
                <a href="tel:${phoneDigits}"
                  style="display:inline-block;background:#142850;color:#ffffff;font-size:13px;font-weight:700;
                         padding:10px 20px;border-radius:8px;text-decoration:none;">
                  📞 Call ${leadFirstName}
                </a>
              </td>
              <td style="padding-right:10px;">
                <a href="sms:${phoneDigits}"
                  style="display:inline-block;background:#ffffff;border:1px solid #e2e8f0;color:#142850;font-size:13px;font-weight:700;
                         padding:10px 20px;border-radius:8px;text-decoration:none;">
                  💬 Text ${leadFirstName}
                </a>
              </td>
              <td>
                <a href="mailto:${email}"
                  style="display:inline-block;background:#ffffff;border:1px solid #e2e8f0;color:#142850;font-size:13px;font-weight:700;
                         padding:10px 20px;border-radius:8px;text-decoration:none;">
                  ✉️ Email ${leadFirstName}
                </a>
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Sections -->
        <tr><td style="padding:20px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">

            ${section("Contact Information",
              row("Name", leadFullName) +
              row("Phone", `<a href="tel:${phoneDigits}" style="color:#F37021;">${phone}</a>`) +
              row("Email", `<a href="mailto:${email}" style="color:#F37021;">${email}</a>`) +
              row("Submitted", submittedAt) +
              row("Co-brand partner", `${realtorName}, ${realtorCompany}`, true)
            )}

            ${section("Lead Snapshot",
              row("Goal", goal) +
              row("Property state", propertyState) +
              row("Target home price", priceRange) +
              row("Credit range provided", creditRange) +
              row("Income range provided", incomeRange, true)
            )}

            ${(estimateRange || monthlyStr || recommendedLoanType) ? section("Initial System Estimate",
              row("Estimated home price range", estimateRange) +
              row("Estimated monthly payment", monthlyStr) +
              row("Potential program to review", recommendedLoanType, true)
            ) : ""}

            <!-- Estimate disclaimer -->
            ${(estimateRange || monthlyStr) ? `
            <tr><td style="padding:0 0 20px;">
              <p style="margin:0;font-size:11px;line-height:1.7;color:#9ca3af;background:#f8fafc;
                         border:1px solid #e2e8f0;border-radius:8px;padding:10px 14px;">
                These estimates are based on self-reported information and have not been verified through
                an application, credit report, or documentation.
              </p>
            </td></tr>` : ""}

            <!-- Suggested opening -->
            <tr><td style="padding:0 0 20px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
                <tr><td style="padding:8px 20px;background:#142850;">
                  <p style="margin:0;${sectionLabel}">Suggested Opening</p>
                </td></tr>
                <tr><td style="padding:14px 20px;">
                  <p style="margin:0;font-size:13px;line-height:1.8;color:#374151;font-style:italic;">
                    &ldquo;Hi ${leadFirstName}, this is ${loName}. You just completed the homebuying
                    questionnaire with ${realtorName.split(" ")[0]} and me. I wanted to personally
                    introduce myself, review your estimate, and answer your questions.
                    Do you have a few minutes?&rdquo;
                  </p>
                </td></tr>
              </table>
            </td></tr>

            <!-- Portal CTA -->
            <tr><td style="padding:0 0 20px;">
              <a href="${portalUrl}"
                style="display:inline-block;background:#F37021;color:#ffffff;font-size:14px;font-weight:700;
                       padding:14px 28px;border-radius:10px;text-decoration:none;">
                Open Lead in My Portal →
              </a>
            </td></tr>

            ${(entryPage || device || utmSource || utmCampaign) ? section("Tracking Information",
              row("Entry page", entryPage) +
              row("Device", device) +
              row("Lead source", utmSource) +
              row("Campaign", utmCampaign, true)
            ) : ""}

          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 32px 24px;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.7;">
            Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender<br/>
            This is an automated lead notification. Do not reply to this email.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildCoBrandedRealtorAlertEmail({
  realtorFirstName,
  leadFullName,
  goal,
  propertyState,
  loName,
  loTitle,
  loNmls,
  loPhone,
}: {
  realtorFirstName: string;
  leadFullName: string;
  goal?: string | null;
  propertyState?: string | null;
  loName: string;
  loTitle?: string | null;
  loNmls?: string | null;
  loPhone?: string | null;
}): string {
  const goalLabel = goal ?? "Purchase a Home";
  const stateLabel = propertyState ?? "Not provided";

  const tdLabel = `padding:10px 0;border-bottom:1px solid #f0f4f8;color:#6b7280;font-size:13px;width:200px;vertical-align:top;`;
  const tdValue = `padding:10px 0;border-bottom:1px solid #f0f4f8;font-weight:600;color:#111827;font-size:13px;`;

  function row(label: string, value: string, last = false): string {
    const border = last ? "border-bottom:none;" : "";
    return `<tr>
      <td style="${tdLabel}${border}">${label}</td>
      <td style="${tdValue}${border}">${value}</td>
    </tr>`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta name="color-scheme" content="light"/>
</head>
<body style="margin:0;padding:0;background:#f5f0eb;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f0eb;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
        style="max-width:580px;background:#ffffff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#142850;padding:24px 32px 20px;">
          <div>${LOGO_SVG}</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px 36px 8px;">
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1f2328;">
            Hi ${realtorFirstName},
          </p>
          <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#1f2328;">
            Great news. <strong>${leadFullName}</strong> completed the homebuying questionnaire you shared.
          </p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#1f2328;">
            I received their information and will personally contact them within one business day to review
            their initial estimate, discuss financing options, and explain the next steps toward preapproval.
          </p>
        </td></tr>

        <!-- Referral Status -->
        <tr><td style="padding:0 36px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
            <tr><td style="padding:8px 20px;background:#f7f8fa;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;font-size:10px;font-weight:700;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">
                Referral Status
              </p>
            </td></tr>
            <tr><td style="padding:4px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${row("Client", leadFullName)}
                ${row("Goal", goalLabel)}
                ${row("Property state", stateLabel)}
                ${row("Questionnaire", "Completed")}
                ${row("Full application", "Not yet completed")}
                ${row("Credit review", "Not yet completed")}
                ${row("Next step", `${loName.split(" ")[0]} will contact the client`, true)}
              </table>
            </td></tr>
          </table>
        </td></tr>

        <!-- No action needed -->
        <tr><td style="padding:0 36px 28px;">
          <p style="margin:0;font-size:15px;line-height:1.7;color:#1f2328;">
            No action is needed from you right now. I&rsquo;ll handle the financing conversation and keep
            you updated as your client moves through the process.
          </p>
        </td></tr>

        <!-- Additional context -->
        <tr><td style="padding:0 36px 28px;">
          <table width="100%" cellpadding="0" cellspacing="0"
            style="background:#f7f8fa;border:1px solid #e5e7eb;border-radius:10px;">
            <tr><td style="padding:18px 20px;">
              <p style="margin:0 0 6px;font-size:10px;font-weight:700;letter-spacing:2px;color:#6b7280;text-transform:uppercase;">
                Do You Have Additional Context?
              </p>
              <p style="margin:0;font-size:14px;line-height:1.7;color:#374151;">
                If your client is interested in a specific property, has an offer deadline, or shared
                information that would help me prepare for the conversation, reply directly to this email
                and let me know.
              </p>
            </td></tr>
          </table>
        </td></tr>

        <!-- Closing -->
        <tr><td style="padding:0 36px 28px;">
          <p style="margin:0 0 24px;font-size:15px;line-height:1.7;color:#1f2328;">
            Thank you for trusting me with your client. I&rsquo;ll take great care of them and keep you in the loop.
          </p>
          <!-- Signature -->
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="border-left:3px solid #F37021;padding-left:14px;">
                <p style="margin:0;font-size:15px;font-weight:700;color:#1f2328;line-height:1.4;">${loName}</p>
                ${loTitle ? `<p style="margin:2px 0 0;font-size:13px;color:#57606a;">${loTitle}</p>` : ""}
                <p style="margin:2px 0 0;font-size:13px;color:#57606a;">Harris Capital Mortgage Group</p>
                ${loNmls ? `<p style="margin:2px 0 0;font-size:13px;color:#57606a;">NMLS #${loNmls}</p>` : ""}
                ${loPhone ? `<p style="margin:4px 0 0;font-size:13px;color:#142850;font-weight:600;">${loPhone}</p>` : ""}
              </td>
            </tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:16px 36px 24px;border-top:1px solid #f1f5f9;">
          <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.7;">
            Harris Capital Mortgage Group, LLC &middot; NMLS# 1918223 &middot; Equal Housing Lender<br/>
            This notification was sent because a client submitted a homebuying questionnaire through your co-branded page.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
