import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { Calculator } from "@/components/sections/Calculator";
import { Disclosure } from "@/components/ui/Disclosure";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mortgage Calculator — PITI Payment, FHA, Amortization | HCMG",
  description:
    "Free mortgage calculator with PITI breakdown — Principal, Interest, Taxes & Insurance. Includes FHA loan calculator with MIP, VA, USDA, amortization schedule, and PMI. No credit check. Harris Capital Mortgage Group · NMLS# 1918223.",
  keywords: [
    "mortgage calculator", "fha loan calculator", "mortgage calculator with pmi taxes and insurance",
    "amortization calculator mortgage", "piti mortgage calculator", "mortgage payment calculator",
    "how to calculate mortgage payment", "down payment calculator", "va loan calculator",
  ],
  alternates: { canonical: "https://hcmgloans.com/mortgage-calculator" },
  openGraph: {
    title: "Mortgage Calculator with PITI, FHA & Amortization | HCMG",
    description:
      "Calculate your full monthly mortgage payment — PITI breakdown, FHA MIP, amortization schedule, PMI. Free, no credit check. Works for purchase or refinance.",
    url: "https://hcmgloans.com/mortgage-calculator",
    images: ["/hcmg-social.png"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How does a mortgage calculator work?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A mortgage calculator uses your home price, down payment, interest rate, and loan term to compute your principal and interest payment using the standard amortization formula. Our calculator also adds estimated property taxes, homeowner's insurance, and HOA fees to give you a complete monthly payment picture.",
      },
    },
    {
      "@type": "Question",
      name: "What is included in a monthly mortgage payment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A full mortgage payment (PITI) includes: Principal (the portion that reduces your loan balance), Interest (the cost of borrowing), Taxes (property taxes, usually escrowed monthly), and Insurance (homeowner's insurance, plus mortgage insurance if your down payment is under 20%). HOA fees are additional if applicable.",
      },
    },
    {
      "@type": "Question",
      name: "How do I figure out my mortgage payment?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Figuring out mortgage payments is straightforward with our free calculator above. Enter your home price, down payment, interest rate, and loan term. The calculator instantly shows your estimated monthly payment including principal, interest, property taxes, and insurance (PITI). For an FHA loan, it also adds the monthly MIP. For conventional loans with under 20% down, it adds PMI. You can also expand the amortization schedule to see your exact principal and interest split every month over the life of the loan.",
      },
    },
    {
      "@type": "Question",
      name: "What will my estimated mortgage payment be?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your estimated mortgage payment depends on four main factors: home price, down payment, interest rate, and loan term. As a rough estimate: on a $400,000 home with 20% down, a 30-year loan at 7% results in a principal and interest payment of about $2,129/month. Add property taxes (~$400/mo), insurance (~$150/mo), and your total estimated mortgage payment (PITI) is around $2,679/month. Use the calculator above to get an estimate based on your exact numbers — it updates instantly as you adjust the sliders.",
      },
    },
    {
      "@type": "Question",
      name: "How do I estimate a mortgage payment on a house?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "To estimate a mortgage payment on a house: (1) Enter the home price in the calculator above. (2) Set your down payment percentage — 3.5% for FHA, 0% for VA/USDA, or 3–20% for conventional. (3) Enter the current interest rate — use the rate your lender quoted, or a market estimate. (4) Choose your loan term (usually 30 years). The calculator will show your full monthly payment estimate including taxes and insurance. For the most accurate estimate, speak with an HCMG loan officer — they can pull live rates based on your credit profile.",
      },
    },
    {
      "@type": "Question",
      name: "How much down payment do I need?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Down payment requirements vary by loan type: FHA loans allow as little as 3.5% down, conventional loans can start at 3% for first-time buyers, VA and USDA loans offer 0% down for eligible borrowers, and jumbo loans typically require 10–20% down.",
      },
    },
    {
      "@type": "Question",
      name: "Does using this calculator affect my credit score?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "No. This calculator requires no personal information and makes no credit inquiries. It is a free estimation tool only. A hard credit pull only happens when you formally apply for a mortgage.",
      },
    },
    {
      "@type": "Question",
      name: "How accurate is this mortgage calculator?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The calculator gives a reliable estimate based on the numbers you enter. Actual payments will vary based on your exact rate (which depends on your credit score, loan type, and lender), local property tax rates, and insurance premiums. Use it as a planning tool and get a personalized quote from a licensed loan officer for precise numbers.",
      },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://hcmgloans.com" },
    { "@type": "ListItem", position: 2, name: "Mortgage Calculator", item: "https://hcmgloans.com/mortgage-calculator" },
  ],
};

const LOAN_TYPES = [
  { label: "FHA Loan Calculator", href: "/seo/orlando-fha-loan", desc: "3.5% down · 580+ credit" },
  { label: "VA Loan Calculator", href: "/seo/las-vegas-va-loan", desc: "0% down · Veterans & active duty" },
  { label: "Conventional Calculator", href: "/seo/atlanta-conventional-loan", desc: "3–20% down · 620+ credit" },
  { label: "Refinance Calculator", href: "/seo/miami-refinance", desc: "Lower your rate or payment" },
  { label: "Jumbo Loan Calculator", href: "/seo/los-angeles-jumbo-loan", desc: "Loans above conforming limits" },
  { label: "HELOC Calculator", href: "/seo/houston-heloc", desc: "Borrow against your equity" },
];

const STATE_CALCULATORS = [
  { label: "Florida",        href: "/mortgage-calculator/florida" },
  { label: "Texas",          href: "/mortgage-calculator/texas" },
  { label: "Georgia",        href: "/mortgage-calculator/georgia" },
  { label: "Nevada",         href: "/mortgage-calculator/nevada" },
  { label: "Colorado",       href: "/mortgage-calculator/colorado" },
  { label: "Virginia",       href: "/mortgage-calculator/virginia" },
  { label: "Maryland",       href: "/mortgage-calculator/maryland" },
  { label: "California",     href: "/mortgage-calculator/california" },
  { label: "Mississippi",    href: "/mortgage-calculator/mississippi" },
  { label: "Washington DC",  href: "/mortgage-calculator/dc" },
];

export default function MortgageCalculatorPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 0 }}>
        <div className="container-shell max-w-4xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">Free Tool · No Credit Check</p>
          <h1
            className="font-extrabold tracking-tight text-ink"
            style={{ fontSize: "clamp(34px, 5vw, 60px)", lineHeight: 1.08 }}
          >
            Mortgage Payment Calculator
          </h1>
          <p className="mx-auto mt-3 text-base font-semibold text-muted/70">
            Also called: Home Loan Calculator · House Payment Calculator · Loan Calculator · Payment Calculator
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted">
            Free mortgage calculator and payment estimator — instantly estimate your monthly mortgage payment including principal, interest, property taxes, insurance (PITI), FHA MIP, and PMI. No credit check. No sign-up.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-4 text-sm font-semibold text-muted">
            {["FHA, VA, USDA & Conventional", "Full PITI + MIP/PMI breakdown", "Amortization schedule included"].map((t) => (
              <span key={t} className="flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full text-white text-xs" style={{ background: "var(--ok-gradient)" }}>✓</span>
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <Calculator
        heading="Calculate your monthly payment"
        subheading="Adjust the sliders — your estimate updates instantly. Unlock your full breakdown free."
      />

      {/* Keyword variant section — targets "home loan calculator", "house payment calculator", etc. */}
      <section className="section-pad bg-sand" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
        <div className="container-shell max-w-4xl">
          <div className="grid gap-6 sm:grid-cols-3 text-center">
            {[
              { heading: "Home Loan Calculator", body: "Use this free home loan calculator to estimate your monthly mortgage payment. Supports FHA, VA, USDA, and conventional loans with full PITI breakdown." },
              { heading: "House Payment Calculator", body: "Figuring out house payments is easy — enter your home price, down payment, and rate. Your estimated house payment updates instantly including taxes and insurance." },
              { heading: "Loan Payment Estimator", body: "Not sure what your loan payment will be? This free mortgage loan calculator and payment estimator gives you an instant breakdown — no personal info required." },
            ].map((item) => (
              <div key={item.heading} className="rounded-2xl border border-line bg-white p-5">
                <h2 className="text-base font-extrabold text-ink">{item.heading}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Loan type links */}
      <section className="section-pad bg-white">
        <div className="container-shell max-w-4xl">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Loan-specific calculators</h2>
          <p className="mb-8 text-2xl font-extrabold text-ink">Calculate by loan type</p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LOAN_TYPES.map((lt) => (
              <Link
                key={lt.label}
                href={lt.href}
                className="block rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
              >
                <div className="font-bold text-ink">{lt.label}</div>
                <p className="mt-1 text-sm text-muted">{lt.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* State-specific calculators */}
      <section className="section-pad bg-sand">
        <div className="container-shell max-w-4xl">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">Mortgage calculator by state</h2>
          <p className="mb-6 text-2xl font-extrabold text-ink">Calculate with your state&apos;s tax rate</p>
          <div className="flex flex-wrap gap-3">
            {STATE_CALCULATORS.map((s) => (
              <Link
                key={s.label}
                href={s.href}
                className="rounded-xl border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-all hover:border-accent hover:text-accent"
              >
                {s.label} →
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-white">
        <div className="container-shell max-w-3xl">
          <h2 className="mb-8 text-2xl font-extrabold text-ink">Mortgage calculator — common questions</h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((faq) => (
              <div key={faq.name} className="rounded-2xl border border-line bg-white p-6">
                <h3 className="mb-3 font-bold text-ink">{faq.name}</h3>
                <p className="text-sm leading-7 text-muted">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
          <Disclosure variant="estimate" className="mt-8" />
        </div>
      </section>

      {/* CTA */}
      <section className="section-pad bg-sand">
        <div className="container-shell max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold text-ink lg:text-3xl">Ready for a real number?</h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted">
            Your calculator estimate is a starting point. A licensed HCMG loan officer will give you an exact rate and payment based on your actual profile — still no hard credit check.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/get-started" className="primary-button">
              Get my personalized estimate →
            </Link>
            <Link href="/contact" className="secondary-button">
              Talk to a loan officer
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
