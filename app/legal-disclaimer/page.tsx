import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Legal Disclaimer · Harris Capital Mortgage Group",
  description:
    "Legal disclaimer for Harris Capital Mortgage Group, LLC. Terms governing the use of information on this website.",
  alternates: { canonical: "https://getorangekey.com/legal-disclaimer" },
};

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-10 text-xl font-bold text-ink">{children}</h2>;
}
function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-sm leading-7 text-muted">{children}</p>;
}

const PRINCIPAL_OFFICERS = [
  { name: "Lamont Harris Jr.",  title: "Founder & CEO",                                         bio: "Over 15 years of mortgage industry experience. Founded HCMG to bring transparency and integrity to lending." },
  { name: "Astrine Covington",  title: "President",                                              bio: "Leads corporate strategy, business development, and overall company growth." },
  { name: "Ranada Harris",      title: "COO",                                                    bio: "Oversees daily operations, process improvement, and organizational efficiency." },
  { name: "Aysha Randall",      title: "CCO (Chief Compliance Officer)",                         bio: "Ensures regulatory compliance, risk management, and industry standards." },
  { name: "Mesia Crews",        title: "Chief Growth Officer",                                   bio: "Drives strategic growth, partnerships, and market expansion." },
  { name: "Adam DeMarco",       title: "Chief Production & Learning Officer",                    bio: "Oversees loan production and training/development programs." },
  { name: "Darius James",       title: "Chief Lending Officer, President of Wholesale Division", bio: "Leads wholesale lending strategy and oversees all wholesale division operations." },
];

export default function LegalDisclaimerPage() {
  return (
    <main>
      <NavBar />
      <section className="section-pad">
        <div className="container-shell max-w-3xl">
          <h1 className="mb-2 text-3xl font-extrabold text-ink">Legal Disclaimer</h1>
          <p className="mb-8 text-sm text-muted">Harris Capital Mortgage Group, LLC · NMLS# 1918223</p>

          <P>
            Harris Capital Mortgage Group, LLC hereby authorizes you to view, and print information
            on this web site subject to the fact that it is used for informational and
            non-commercial purposes.
          </P>
          <P>
            It is our intention that data provided on a subject is of a general nature. Our web site
            does not represent an exhaustive treatment of subjects nor is the information intended to
            constitute accounting, tax, legal, consulting or other professional advice.
          </P>
          <P>
            Prior to making any decision or taking any action we kindly request you to contact your
            tax or legal advisors.
          </P>
          <P>
            Please use this document and information at your own risk. The content of this site is
            copyrighted and therefore any unauthorized use of any materials on this web site may
            violate copyright, trademark, and other laws.
          </P>
          <P>
            Materials on this web site may not be modified, reproduced, or publicly displayed,
            distributed or performed for any public or commercial purposes prior to our approval.
          </P>

          <H2>Principal Officers</H2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-line">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-sand">
                  <th className="px-5 py-3 text-left font-semibold text-ink">Name</th>
                  <th className="px-5 py-3 text-left font-semibold text-ink">Title</th>
                  <th className="px-5 py-3 text-left font-semibold text-ink">Role Summary</th>
                </tr>
              </thead>
              <tbody>
                {PRINCIPAL_OFFICERS.map((o, i) => (
                  <tr key={o.name} className={i % 2 === 0 ? "bg-white" : "bg-sand/50"}>
                    <td className="px-5 py-3 font-semibold text-ink">{o.name}</td>
                    <td className="px-5 py-3 text-muted">{o.title}</td>
                    <td className="px-5 py-3 text-muted">{o.bio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
