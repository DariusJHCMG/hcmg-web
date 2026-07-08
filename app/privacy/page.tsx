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
          <p className="mb-8 text-sm text-muted">Effective date: January 1, 2026 · Last updated: January 1, 2026</p>

          <H2>1. Introduction</H2>
          <P>Harris Capital Mortgage Group, LLC (NMLS# 1918223) (&ldquo;HCMG,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates hcmgloans.com. This Privacy Policy explains how we collect, use, share, and protect your information when you use our website and services.</P>

          <H2>2. Information We Collect</H2>
          <P>We may collect the following categories of information:</P>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li>Contact information (name, email address, phone number)</li>
            <li>Mortgage-related inputs (price range, income range, credit range, loan goals)</li>
            <li>Usage data (pages visited, time on site, referring URL)</li>
            <li>Device and browser information (IP address, browser type, operating system)</li>
          </ul>

          <H2>3. How We Use Your Information</H2>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li>Providing mortgage estimate services</li>
            <li>Connecting you with licensed Harris Capital Mortgage Group loan officers</li>
            <li>Sending SMS and email communications if you have consented</li>
            <li>Improving our website and services</li>
            <li>Complying with legal obligations (RESPA, ECOA, GLBA, state mortgage regulations)</li>
          </ul>

          <H2>4. SMS Communications</H2>
          <P>We may send you SMS messages if you provided your phone number and consented to receive texts. Message frequency varies. Message and data rates may apply. Reply STOP to opt out at any time. Reply HELP for assistance. We do not sell your phone number to third parties. See our <a href="/sms-policy" className="text-accent underline">SMS Policy</a> for full details.</P>

          <H2>5. Data Sharing</H2>
          <P>We do not sell your personal information. We may share your information with:</P>
          <ul className="mb-4 list-disc pl-6 text-sm leading-7 text-muted">
            <li>Harris Capital Mortgage Group loan officers who will contact you regarding your inquiry</li>
            <li>Service providers who assist in operating our website (under confidentiality agreements)</li>
            <li>Legal authorities when required by law</li>
          </ul>

          <H2>6. Data Retention</H2>
          <P>Loan-related data is retained for 7 years per GLBA requirements. Marketing and inquiry data is retained until you opt out or request deletion.</P>

          <H2>7. Your Rights</H2>
          <P>You may request access to, correction of, or deletion of your personal information by contacting us at privacy@hcmgloans.com. We will respond within 30 days.</P>

          <H2>8. GLBA Notice</H2>
          <P>As a mortgage company, we are subject to the Gramm-Leach-Bliley Act. We maintain physical, electronic, and procedural safeguards to protect your nonpublic personal information (NPI).</P>

          <H2>9. Contact</H2>
          <div className="rounded-2xl border border-line bg-sand p-6 text-sm leading-7 text-muted">
            Privacy inquiries: info@harriscapitalmortgage.com<br />
            Harris Capital Mortgage Group, LLC<br />
            HQ: 6375 S Pecos Rd, Suite 208, Las Vegas, NV 89120<br />
            Branch: 9801 Westheimer Ave, Suite 300, Houston, TX 77032
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
