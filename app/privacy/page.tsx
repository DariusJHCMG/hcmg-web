import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy, HCMG · NMLS# 1918223",
  description: "Privacy Policy for Harris Capital Mortgage Group, LLC. How we collect, use, and protect your information.",
  alternates: { canonical: "https://hcmgloans.com/privacy" },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-10 text-xl font-bold text-ink">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm leading-7 text-muted">{children}</p>;
}

export default function PrivacyPage() {
  return (
    <main>
      <NavBar />
      <section className="section-pad">
        <div className="container-shell max-w-3xl">
          <h1 className="mb-2 text-3xl font-extrabold text-ink">Privacy Policy</h1>
          {/*
            EFFECTIVE DATE: Updated January 27, 2026 to comply with:
            - GLBA Safeguards Rule (FTC, 16 CFR Part 314, effective June 2023)
            - CFPB UDAAP guidance on NPI third-party disclosures
            - CCPA (California Consumer Privacy Act)
            - VCDPA (Virginia Consumer Data Protection Act)
            - State mortgage privacy regulations in NV and TX
          */}
          <p className="mb-8 text-sm text-muted">Effective date: January 27, 2026 · Last updated: January 27, 2026</p>

          {/* ── 1. Introduction ──────────────────────────────────── */}
          <H2>1. Introduction</H2>
          <P>
            Harris Capital Mortgage Group, LLC (NMLS# 1918223) (&ldquo;HCMG,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates hcmgloans.com and
            related internal platforms including our Liftoff operations portal. This Privacy Policy explains how we collect, use, share, and protect
            your information when you use our website, mortgage services, and internal loan origination tools.
          </P>
          <P>
            As a licensed mortgage company, we are subject to the Gramm-Leach-Bliley Act (GLBA), Regulation P (12 CFR Part 1016),
            the Real Estate Settlement Procedures Act (RESPA), the Equal Credit Opportunity Act (ECOA), and applicable state mortgage
            privacy laws in Alabama, California, Colorado, Florida, Georgia, Maryland, Mississippi, Nevada, Texas, Virginia, and Washington D.C.
          </P>

          {/* ── 2. Information We Collect ────────────────────────── */}
          <H2>2. Information We Collect</H2>
          <P>We may collect the following categories of information from website visitors, loan applicants, and loan officers:</P>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li><strong>Contact information:</strong> name, email address, phone number, mailing address</li>
            <li><strong>Mortgage-related inputs:</strong> price range, income range, credit range, loan goals, loan purpose, loan amount, purchase price, property address</li>
            <li><strong>Loan transaction data:</strong> ARIVE loan numbers, loan type, lock status, earnest money, seller credits, income notes, asset notes, credit notes (collected from licensed loan officers submitting requests through our internal Liftoff system)</li>
            <li><strong>Usage data:</strong> pages visited, time on site, referring URL, funnel interactions</li>
            <li><strong>Device and browser information:</strong> IP address, browser type, operating system</li>
            <li><strong>Gift fund donor information:</strong> name, address, phone, email (when applicable)</li>
          </ul>

          {/* ── 3. How We Use Your Information ──────────────────── */}
          <H2>3. How We Use Your Information</H2>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li>Processing mortgage applications and loan origination requests</li>
            <li>Connecting you with licensed Harris Capital Mortgage Group loan officers</li>
            <li>Sending SMS and email communications if you have consented</li>
            <li>Coordinating loan disclosures, registrations, submissions, and lock requests through our internal operations team</li>
            <li>Improving our website and services</li>
            <li>Fraud detection and rate limiting (IP address used to detect abuse)</li>
            <li>Complying with legal obligations (RESPA, ECOA, GLBA, TRID, state mortgage regulations)</li>
          </ul>

          {/* ── 4. SMS Communications ────────────────────────────── */}
          <H2>4. SMS Communications</H2>
          <P>
            We may send you SMS messages if you provided your phone number and consented to receive texts. Message frequency varies. Message
            and data rates may apply. Reply <strong>STOP</strong> to opt out at any time. Reply <strong>HELP</strong> for assistance.
            We do not sell your phone number to third parties. See our{" "}
            <a href="/sms-policy" className="text-accent underline">SMS Policy</a> for full details.
          </P>

          {/* ── 5. Data Sharing & Third-Party Service Providers ──── */}
          <H2>5. Data Sharing &amp; Service Providers</H2>
          <P>
            We do not sell your personal information. We may share your information with the following parties
            strictly for the purposes listed below:
          </P>

          <p className="mb-3 text-sm font-semibold text-ink">Harris Capital Mortgage Group Personnel</p>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li>Licensed loan officers who will contact you regarding your mortgage inquiry</li>
            <li>Operations and processing staff who handle loan registrations, disclosures, and submissions through our internal Liftoff platform</li>
          </ul>

          <p className="mb-3 text-sm font-semibold text-ink">Technology Service Providers</p>
          <P>
            The following service providers process data on our behalf under confidentiality obligations.
            Each is bound by their own privacy policy and security certifications as noted:
          </P>
          <div className="mb-6 overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-sand">
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] text-muted">Provider</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] text-muted">Service</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] text-muted">Data Received</th>
                  <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.1em] text-muted">Certification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line text-muted">
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink">Supabase, Inc.</td>
                  <td className="px-4 py-3">Database &amp; authentication</td>
                  <td className="px-4 py-3">All loan and user data (stored in managed PostgreSQL)</td>
                  <td className="px-4 py-3">SOC 2 Type II</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink">Resend, Inc.</td>
                  <td className="px-4 py-3">Transactional email delivery</td>
                  <td className="px-4 py-3">Borrower first name, ARIVE loan number, loan type, submitter email, included in operational email notifications</td>
                  <td className="px-4 py-3">SOC 2 Type II</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink">Zapier, Inc.</td>
                  <td className="px-4 py-3">Workflow automation, ARIVE loan data lookup</td>
                  <td className="px-4 py-3">ARIVE loan number, borrower name, loan type, property address, loan amount, transmitted transiently to retrieve loan details from ARIVE and return them to our system. Data is not stored by Zapier beyond task execution logs.</td>
                  <td className="px-4 py-3">SOC 2 Type II</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink">Vercel, Inc.</td>
                  <td className="px-4 py-3">Web hosting &amp; serverless functions</td>
                  <td className="px-4 py-3">HTTP request metadata (IP address, headers) for all web traffic, not stored long-term</td>
                  <td className="px-4 py-3">SOC 2 Type II, ISO 27001</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink">PostHog, Inc.</td>
                  <td className="px-4 py-3">Analytics &amp; session replay</td>
                  <td className="px-4 py-3">Anonymized page view events, funnel interactions, no NPI. Session replay is masked for form fields.</td>
                  <td className="px-4 py-3">SOC 2 Type II</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-ink">Cloudflare, Inc.</td>
                  <td className="px-4 py-3">Bot protection (Turnstile)</td>
                  <td className="px-4 py-3">Browser fingerprint data for bot challenge verification on public lead forms</td>
                  <td className="px-4 py-3">ISO 27001, SOC 2</td>
                </tr>
              </tbody>
            </table>
          </div>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li>Legal authorities when required by applicable law, court order, or regulatory requirement</li>
          </ul>

          {/* ── 6. Data Retention ─────────────────────────────────── */}
          <H2>6. Data Retention</H2>
          <P>
            We retain your information only as long as necessary to provide our services and meet legal obligations:
          </P>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li><strong>FHA and VA loan files:</strong> 2 years post-closing per HUD Handbook 4000.1 and VA Lender Handbook</li>
            <li><strong>Conventional and other loan files:</strong> 7 years post-closing per GLBA and state mortgage regulations</li>
            <li><strong>Marketing and lead inquiry data:</strong> Until you opt out or request deletion, or 7 years from last contact, whichever is earlier</li>
            <li><strong>ARIVE lookup results:</strong> 120 seconds (automatically deleted after use, these are transient lookups only)</li>
            <li><strong>Session tokens:</strong> 7 days, then automatically expired</li>
          </ul>
          <P>
            After the applicable retention period, records are archived and then permanently deleted in accordance with our
            Written Information Security Program (WISP).
          </P>

          {/* ── 7. Your Rights ────────────────────────────────────── */}
          <H2>7. Your Rights</H2>
          <P>
            Depending on your state of residence, you may have the following rights regarding your personal information:
          </P>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li><strong>Right to know:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Right to correct:</strong> Request correction of inaccurate personal information</li>
            <li><strong>Right to delete:</strong> Request deletion of your personal information (subject to legal retention requirements, mortgage records must be retained per GLBA and HUD regulations)</li>
            <li><strong>Right to opt out of sale:</strong> We do not sell your personal information</li>
          </ul>
          <P>
            To exercise any of these rights, submit a request at{" "}
            <a href="/privacy/data-request" className="text-accent underline">hcmgloans.com/privacy/data-request</a>{" "}
            or email <a href="mailto:privacy@hcmgloans.com" className="text-accent underline">privacy@hcmgloans.com</a>.
            We will respond within <strong>30 days</strong> (45 days for Virginia VCDPA requests). We may ask you to
            verify your identity before processing your request.
          </P>

          {/* ── 8. Security Safeguards ────────────────────────────── */}
          <H2>8. Security Safeguards</H2>
          <P>
            We maintain physical, electronic, and procedural safeguards to protect your nonpublic personal information (NPI) in
            compliance with the GLBA Safeguards Rule (16 CFR Part 314). These include:
          </P>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li>TLS 1.3 encryption for all data in transit</li>
            <li>AES-256 encryption for all data at rest (managed by Supabase)</li>
            <li>Row-Level Security (RLS) in our database, each user can only access data they are authorized to see</li>
            <li>HTTP security headers (Content-Security-Policy, HSTS, X-Frame-Options) to prevent web-layer attacks</li>
            <li>Distributed rate limiting on all authentication and data-submission endpoints</li>
            <li>Session tokens stored as cryptographically random UUIDs in HttpOnly, SameSite=Strict cookies</li>
            <li>Role-based access control, ops staff, lock desk agents, and help desk agents each have scoped access to only the loan queues relevant to their role</li>
          </ul>

          {/* ── 9. GLBA Annual Privacy Notice ─────────────────────── */}
          <H2>9. GLBA Annual Privacy Notice</H2>
          <P>
            As a mortgage company and covered financial institution under the Gramm-Leach-Bliley Act (15 U.S.C. §§ 6801–6827),
            we provide this notice of our privacy practices. We do not share your nonpublic personal information with
            non-affiliated third parties for marketing purposes. We share NPI only as permitted by Regulation P (12 CFR Part 1016):{" "}
            to process transactions you request, to service your account, and as required by law.
          </P>
          <P>
            You have the right to opt out of certain data sharing. Because we do not share NPI for marketing purposes,
            there is nothing to opt out of at this time. If our practices change, we will notify you in advance.
          </P>

          {/* ── 10. Cookies and Tracking ──────────────────────────── */}
          <H2>10. Cookies and Tracking</H2>
          <P>
            We use session cookies for authentication (HttpOnly, not accessible to JavaScript) and analytics cookies
            from PostHog to understand how visitors use our website. We do not use cross-site tracking cookies.
            You can disable analytics cookies through your browser settings, this will not affect your ability to
            use our mortgage services.
          </P>

          {/* ── 11. Children's Privacy ────────────────────────────── */}
          <H2>11. Children&apos;s Privacy</H2>
          <P>
            Our website and services are not directed at children under 13. We do not knowingly collect personal
            information from children. If you believe we have inadvertently collected information from a child,
            contact us immediately at{" "}
            <a href="mailto:privacy@hcmgloans.com" className="text-accent underline">privacy@hcmgloans.com</a>.
          </P>

          {/* ── 12. Changes to This Policy ────────────────────────── */}
          <H2>12. Changes to This Policy</H2>
          <P>
            We may update this Privacy Policy from time to time. When we make material changes, we will update the
            &ldquo;Last updated&rdquo; date at the top of this page. For significant changes affecting how we use your NPI,
            we will notify you by email or by posting a prominent notice on our website at least 30 days before the
            change takes effect.
          </P>

          {/* ── 13. Contact ───────────────────────────────────────── */}
          <H2>13. Contact</H2>
          <div className="rounded-2xl border border-line bg-sand p-6 text-sm leading-7 text-muted">
            <p className="mb-2"><strong className="text-ink">Privacy inquiries and data requests:</strong></p>
            <p>Email: <a href="mailto:privacy@hcmgloans.com" className="text-accent underline">privacy@hcmgloans.com</a></p>
            <p>Online: <a href="/privacy/data-request" className="text-accent underline">hcmgloans.com/privacy/data-request</a></p>
            <p className="mt-4"><strong className="text-ink">Harris Capital Mortgage Group, LLC</strong></p>
            <p>NMLS# 1918223</p>
            <p>HQ: 6375 S Pecos Rd, Suite 208, Las Vegas, NV 89120</p>
            <p>Branch: 9801 Westheimer Ave, Suite 300, Houston, TX 77032</p>
            <p className="mt-4 text-xs text-muted/70">
              Equal Housing Lender. Licensed to originate mortgages in Alabama, California, Colorado, Florida, Georgia, Maryland, Mississippi, Nevada, Texas, Virginia, and Washington D.C.
              NMLS Consumer Access: <a href="https://www.nmlsconsumeraccess.org" target="_blank" rel="noopener noreferrer" className="underline">nmlsconsumeraccess.org</a>
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
