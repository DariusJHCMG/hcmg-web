import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Licensing & Disclosures, HCMG · NMLS# 1918223",
  description: "State licensing information for Harris Capital Mortgage Group, LLC. NMLS# 1918223. Equal Housing Lender.",
  alternates: { canonical: "https://getorangekey.com/licensing" },
};

const licenses = [
  { state: "Michigan", abbr: "MI", license: "FR-0022873", status: "Active" },
  { state: "Ohio", abbr: "OH", license: "RM.804867.000", status: "Active" },
  { state: "Indiana", abbr: "IN", license: "26396", status: "Active" },
  { state: "Illinois", abbr: "IL", license: "MB.6761398", status: "Active" },
  { state: "Florida", abbr: "FL", license: "MLD2139", status: "Active" },
  { state: "Texas", abbr: "TX", license: "RMLA-2310481", status: "Active" },
  { state: "Georgia", abbr: "GA", license: "71855", status: "Active" },
  { state: "Wisconsin", abbr: "WI", license: "1918223BA", status: "Active" },
];

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-10 text-xl font-bold text-ink">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm leading-7 text-muted">{children}</p>;
}

export default function LicensingPage() {
  return (
    <main>
      <NavBar />
      <section className="section-pad">
        <div className="container-shell max-w-3xl">
          <h1 className="mb-2 text-3xl font-extrabold text-ink">Licensing &amp; Disclosures</h1>
          <p className="mb-8 text-sm text-muted">Last updated: January 1, 2026</p>

          <H2>Company Information</H2>
          <div className="rounded-2xl border border-line bg-sand p-6 text-sm leading-7 text-muted">
            <strong className="text-ink">Harris Capital Mortgage Group, LLC</strong><br />
            NMLS# 1918223<br />
            <strong>HQ:</strong> 6375 S Pecos Rd, Suite 208, Las Vegas, NV 89120<br />
            <strong>Branch:</strong> 9801 Westheimer Ave, Suite 300, Houston, TX 77032<br />
            888-441-3930 · Fax: 404-882-4100 · info@harriscapitalmortgage.com
          </div>

          <H2>NMLS Consumer Access</H2>
          <P>
            You can verify our licensing status and view additional information on the Nationwide Multistate Licensing System (NMLS) Consumer Access website at{" "}
            <a
              href="https://www.nmlsconsumeraccess.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent underline"
            >
              nmlsconsumeraccess.org
            </a>
            . Search for NMLS# 1918223.
          </P>

          <H2>State Licenses</H2>
          <P>Harris Capital Mortgage Group, LLC is licensed to originate mortgage loans in the following states:</P>

          <div className="overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-sand">
                  <th className="px-5 py-3 text-left font-semibold text-ink">State</th>
                  <th className="px-5 py-3 text-left font-semibold text-ink">License Number</th>
                  <th className="px-5 py-3 text-left font-semibold text-ink">Status</th>
                </tr>
              </thead>
              <tbody>
                {licenses.map((row, i) => (
                  <tr key={row.abbr} className={i % 2 === 0 ? "bg-white" : "bg-sand/50"}>
                    <td className="px-5 py-3 text-muted">{row.state} ({row.abbr})</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{row.license}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <H2>Equal Housing Lender</H2>
          <div className="flex items-start gap-4 rounded-2xl border border-line bg-sand p-6">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl font-black text-white"
              style={{ background: "var(--ok-gradient)" }}
              aria-hidden="true"
            >
              ⊜
            </div>
            <P>
              Harris Capital Mortgage Group, LLC is an Equal Housing Lender. We do not discriminate on the basis of race, color, religion, national origin, sex, handicap, familial status, marital status, age, or source of income in connection with mortgage lending, applications, or servicing.
            </P>
          </div>

          <H2>Regulatory Disclosures</H2>
          <P>
            HCMG provides informational mortgage estimates only. Nothing on this site constitutes a loan commitment, pre-approval, pre-qualification, or guarantee of any rate or term. Estimates are subject to change without notice and are based solely on the information you provide. Actual loan terms require a complete application, credit review, income and asset verification, property appraisal, and final underwriting approval.
          </P>
          <P>
            Interest rates and programs are subject to change daily. Annual Percentage Rate (APR) is based on the loan amount, loan term, origination fees, and other finance charges. Rate locks are available upon completion of a full loan application. All lending decisions are made in accordance with applicable federal and state laws, including the Equal Credit Opportunity Act (ECOA) and the Fair Housing Act.
          </P>

          <H2>Privacy Notice</H2>
          <P>
            As a mortgage company, we are subject to the Gramm-Leach-Bliley Act (GLBA) and maintain appropriate safeguards for your nonpublic personal information. See our{" "}
            <a href="/privacy" className="text-accent underline">Privacy Policy</a> for complete details.
          </P>

          <H2>Contact Regulatory Inquiries</H2>
          <div className="rounded-2xl border border-line bg-sand p-6 text-sm leading-7 text-muted">
            Licensing inquiries: info@harriscapitalmortgage.com<br />
            Harris Capital Mortgage Group, LLC<br />
            NMLS# 1918223<br />
            HQ: 6375 S Pecos Rd, Suite 208, Las Vegas, NV 89120<br />
            Branch: 9801 Westheimer Ave, Suite 300, Houston, TX 77032
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
