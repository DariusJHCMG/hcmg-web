import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getCurrentProfile, isAdmin } from "@/lib/auth";
import {
  buildLeadConfirmationEmail,
  buildLoNotificationEmail,
  buildCompanyAlertEmail,
  buildInviteEmail,
  buildCoBrandedShareEmail,
  buildMobileAppEmail,
} from "@/lib/email-templates";

const resend = new Resend(process.env.RESEND_API_KEY);

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://hcmgloans.com").replace(/\/$/, "");

export async function POST(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile || !isAdmin(profile)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { email } = await request.json() as { email: string };
  if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

  // ── Sample data ───────────────────────────────────────────────
  const sampleLead = {
    firstName: "Jordan", lastName: "Smith",
    email, phone: "702-555-0199",
    goal: "Purchase a home", priceRange: "$350,000 – $500,000",
    creditRange: "700–759 (Good)", incomeRange: "$85,000–$110,000",
    buyingPowerLow: 340000, buyingPowerHigh: 480000,
    monthlyPayment: 2450, recommendedLoanType: "Conventional 30yr Fixed",
    utmSource: "instagram", utmMedium: "social", utmCampaign: "spring-buyers",
    entryPage: `${SITE}/go/darius-james/home-purchase`,
    device: "Mobile",
    loNmls: "1097168",
  };

  const samples: { subject: string; html: string }[] = [
    {
      subject: "SAMPLE 1 — Lead Confirmation (to buyer)",
      html: buildLeadConfirmationEmail({
        firstName: sampleLead.firstName,
        loName: "Darius James",
        loNmls: sampleLead.loNmls,
        goal: sampleLead.goal,
        priceRange: sampleLead.priceRange,
        creditRange: sampleLead.creditRange,
        buyingPowerLow: sampleLead.buyingPowerLow,
        buyingPowerHigh: sampleLead.buyingPowerHigh,
        monthlyPayment: sampleLead.monthlyPayment,
        recommendedLoanType: sampleLead.recommendedLoanType,
        siteUrl: SITE,
      }),
    },
    {
      subject: "SAMPLE 2 — LO New Lead Notification",
      html: buildLoNotificationEmail({
        loFirstName: "Darius",
        leadFullName: `${sampleLead.firstName} ${sampleLead.lastName}`,
        email: sampleLead.email,
        phone: sampleLead.phone,
        goal: sampleLead.goal,
        priceRange: sampleLead.priceRange,
        creditRange: sampleLead.creditRange,
        incomeRange: sampleLead.incomeRange,
        utmSource: sampleLead.utmSource,
        utmMedium: sampleLead.utmMedium,
        utmCampaign: sampleLead.utmCampaign,
        monthlyPayment: sampleLead.monthlyPayment,
        buyingPowerLow: sampleLead.buyingPowerLow,
        buyingPowerHigh: sampleLead.buyingPowerHigh,
        recommendedLoanType: sampleLead.recommendedLoanType,
        entryPage: sampleLead.entryPage,
        device: sampleLead.device,
        portalUrl: `${SITE}/portal`,
      }),
    },
    {
      subject: "SAMPLE 3 — Company Lead Alert (unassigned)",
      html: buildCompanyAlertEmail({
        leadFullName: `${sampleLead.firstName} ${sampleLead.lastName}`,
        email: sampleLead.email,
        phone: sampleLead.phone,
        source: "Funnel — home-purchase",
        goal: sampleLead.goal,
        priceRange: sampleLead.priceRange,
        creditRange: sampleLead.creditRange,
        utmSource: sampleLead.utmSource,
        utmCampaign: sampleLead.utmCampaign,
        adminUrl: `${SITE}/admin/leads`,
        isEmployment: false,
        isContact: false,
      }),
    },
    {
      subject: "SAMPLE 4 — Portal Invite / Welcome",
      html: buildInviteEmail({
        full_name: "Cason Knight",
        email,
        lo_slug: "cason-knight",
        title: "Loan Officer",
        nmls: "2234863",
        portalUrl: `${SITE}/portal`,
        teamUrl: `${SITE}/team/cason-knight`,
        funnelUrl: `${SITE}/go/cason-knight`,
      }),
    },
    {
      subject: "SAMPLE 5 — Co-Branded Share (to realtor)",
      html: buildCoBrandedShareEmail({
        realtorFirstName: "Sarah",
        realtorCompany: "Vegas Premier Realty Group",
        loName: "Darius James",
        loPhone: "702-555-0100",
        loNmls: "1097168",
        pageUrl: `${SITE}/co/darius-james/sarah-johnson-vegas-realty`,
      }),
    },
    {
      subject: "SAMPLE 6 — Mobile App Install (iPhone)",
      html: buildMobileAppEmail({ device: "ios", installUrl: `${SITE}/portal` }),
    },
    {
      subject: "SAMPLE 7 — Mobile App Install (Android)",
      html: buildMobileAppEmail({ device: "android", installUrl: `${SITE}/portal` }),
    },
  ];

  // Send all sequentially so inbox preview order is correct
  const results: { subject: string; ok: boolean; error?: string }[] = [];
  for (const s of samples) {
    const { error } = await resend.emails.send({
      from:    "HCMG Dev <no-reply@hcmgloans.com>",
      to:      email,
      subject: s.subject,
      html:    s.html,
    });
    results.push({ subject: s.subject, ok: !error, error: error?.message });
  }

  const allOk = results.every(r => r.ok);
  return NextResponse.json({ ok: allOk, sent: results.length, results });
}
