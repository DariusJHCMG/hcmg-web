import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Terms of Service — HCMG",
  description: "Terms of Service for Harris Capital Mortgage Group, LLC. NMLS# 1918223.",
  alternates: { canonical: "https://getorangekey.com/terms" },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-10 text-xl font-bold text-ink">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm leading-7 text-muted">{children}</p>;
}

export default function TermsPage() {
  return (
    <main>
      <NavBar />
      <section className="section-pad">
        <div className="container-shell max-w-3xl">
          <h1 className="mb-2 text-3xl font-extrabold text-ink">Terms of Service</h1>
          <p className="mb-8 text-sm text-muted">Effective date: January 1, 2026</p>

          <H2>1. Acceptance of Terms</H2>
          <P>By accessing or using getorangekey.com, you agree to be bound by these Terms of Service. If you do not agree, please do not use this website.</P>

          <H2>2. Description of Service</H2>
          <P>Harris Capital Mortgage Group, LLC (NMLS# 1918223) (&ldquo;HCMG,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) provides informational mortgage estimates and lead generation services through this website. All lending decisions are made by HCMG through a formal application process.</P>

          <H2>3. Eligibility</H2>
          <P>This service is intended for US residents seeking mortgage information. You must be at least 18 years old to use this service.</P>

          <H2>4. Data Submission</H2>
          <P>By submitting your information, you consent to be contacted by Harris Capital Mortgage Group regarding your mortgage inquiry, subject to your consent choices.</P>

          <H2>5. Acceptable Use</H2>
          <P>You agree not to use this website for any unlawful purpose, to submit false information, or to interfere with the operation of our services.</P>

          <H2>6. Disclaimers</H2>
          <P>HCMG provides informational estimates only. Nothing on this site is a loan approval, pre-qualification, commitment to lend, or guarantee of any rate or term. All estimates are based on the information you provide and general market conditions. Actual terms depend on a complete loan application, credit review, income verification, property appraisal, and other underwriting factors.</P>

          <H2>7. Limitation of Liability</H2>
          <P>To the maximum extent permitted by law, Harris Capital Mortgage Group, LLC shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of this website or our services.</P>

          <H2>8. Indemnification</H2>
          <P>You agree to indemnify and hold harmless Harris Capital Mortgage Group, LLC and its officers, employees, and agents from any claims arising from your use of this service or violation of these terms.</P>

          <H2>9. Governing Law</H2>
          <P>These Terms are governed by the laws of the State of Michigan, without regard to conflict of law provisions.</P>

          <H2>10. Contact</H2>
          <P>Legal inquiries: legal@getorangekey.com · Harris Capital Mortgage Group, LLC · 455 E Eisenhower Pkwy, Suite 300, Ann Arbor, MI 48108</P>
        </div>
      </section>
      <Footer />
    </main>
  );
}
