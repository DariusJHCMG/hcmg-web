import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { Calculator } from "@/components/sections/Calculator";
import { Disclosure } from "@/components/ui/Disclosure";

// Licensed states with their default property-tax rates and display names
const STATE_DATA: Record<string, {
  name: string;
  abbr: string;
  taxRate: number;     // annual % of home value — used in page copy
  conformingLimit: number;
  blurb: string;
}> = {
  florida: {
    name: "Florida", abbr: "FL", taxRate: 0.83,
    conformingLimit: 766550,
    blurb: "Florida has no state income tax, which increases buying power for most buyers. Property tax rates average 0.83% of home value annually — lower than the national average. Down payment assistance is available through the Florida Housing Finance Corporation (Florida HLP) for eligible first-time buyers.",
  },
  texas: {
    name: "Texas", abbr: "TX", taxRate: 1.74,
    conformingLimit: 766550,
    blurb: "Texas has no state income tax, but property taxes are among the highest in the nation — averaging 1.74% of home value. Factor this into your payment estimate. County and city tax rates vary significantly; your actual tax escrow will be based on your specific property's assessed value.",
  },
  georgia: {
    name: "Georgia", abbr: "GA", taxRate: 0.92,
    conformingLimit: 766550,
    blurb: "Georgia's property taxes average 0.92% of home value. The GAHFA (Georgia Housing and Finance Authority) offers first-time homebuyer programs with down payment assistance. Atlanta metro prices have risen significantly — get pre-approved before you start shopping.",
  },
  nevada: {
    name: "Nevada", abbr: "NV", taxRate: 0.55,
    conformingLimit: 766550,
    blurb: "Nevada has no state income tax and some of the lowest property tax rates in the country at 0.55% average. Las Vegas and Henderson markets move quickly — having a pre-approval before you tour is essential in competitive price ranges.",
  },
  colorado: {
    name: "Colorado", abbr: "CO", taxRate: 0.51,
    conformingLimit: 766550,
    blurb: "Colorado has a low effective property tax rate of 0.51% but high home prices in Denver and Front Range markets. CHFA (Colorado Housing Finance Authority) offers below-market rates and down payment assistance for qualifying first-time buyers.",
  },
  virginia: {
    name: "Virginia", abbr: "VA", taxRate: 0.87,
    conformingLimit: 766550,
    blurb: "Virginia property taxes average 0.87% of home value. Northern Virginia near Washington DC commands premium pricing — many buyers in Fairfax, Arlington, and Loudoun counties need jumbo loans. Our loan officers specialize in this corridor.",
  },
  maryland: {
    name: "Maryland", abbr: "MD", taxRate: 1.09,
    conformingLimit: 766550,
    blurb: "Maryland property taxes average 1.09% of home value, varying by county. The Maryland Mortgage Program (MMP) provides competitive rates and down payment assistance. Proximity to DC affects pricing significantly in Montgomery, Prince George's, and Howard counties.",
  },
  california: {
    name: "California", abbr: "CA", taxRate: 0.73,
    conformingLimit: 1149825,
    blurb: "California has a higher conforming loan limit of up to $1,149,825 in many counties, meaning more buyers qualify for conventional rather than jumbo financing. Property taxes are capped at 1% of purchase price under Proposition 13, though special assessments add to the total. CalHFA offers down payment assistance for qualifying first-time buyers.",
  },
  mississippi: {
    name: "Mississippi", abbr: "MS", taxRate: 0.65,
    conformingLimit: 766550,
    blurb: "Mississippi consistently offers some of the most affordable home prices in the Southeast. Property taxes average 0.65% of home value. The Mississippi Home Corporation provides down payment assistance and first mortgage programs for eligible buyers.",
  },
  dc: {
    name: "Washington DC", abbr: "DC", taxRate: 0.55,
    conformingLimit: 766550,
    blurb: "Washington DC has some of the highest median home prices on the East Coast. DC's property tax rate is 0.55% — low by East Coast standards, but the high home values make absolute tax amounts significant. DC and Maryland offer first-time buyer programs that can meaningfully reduce upfront costs.",
  },
};

type StateSlug = keyof typeof STATE_DATA;

export function generateStaticParams() {
  return Object.keys(STATE_DATA).map((state) => ({ state }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>;
}): Promise<Metadata> {
  const { state } = await params;
  const data = STATE_DATA[state as StateSlug];
  if (!data) return {};
  return {
    title: `${data.name} Mortgage Calculator — Estimate Your Payment | HCMG`,
    description: `Free ${data.name} mortgage calculator — estimate your monthly payment with ${data.name}'s property tax rates pre-filled. Includes FHA, VA, USDA & conventional. HCMG · NMLS# 1918223.`,
    alternates: { canonical: `https://hcmgloans.com/mortgage-calculator/${state}` },
    openGraph: {
      title: `${data.name} Mortgage Calculator | HCMG`,
      description: `Calculate your ${data.name} mortgage payment with local tax rates. FHA, VA, USDA, conventional. Free — no credit check.`,
      url: `https://hcmgloans.com/mortgage-calculator/${state}`,
      images: ["/hcmg-social.png"],
    },
  };
}

export default async function StateMortgageCalculatorPage({
  params,
}: {
  params: Promise<{ state: string }>;
}) {
  const { state } = await params;
  const data = STATE_DATA[state as StateSlug];
  if (!data) notFound();

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the property tax rate in ${data.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `${data.name}'s average effective property tax rate is approximately ${data.taxRate}% of home value annually. Tax rates vary by county — your actual property tax will be based on the specific county and municipality where you buy. Your HCMG loan officer will give you an estimate based on the actual property.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the conforming loan limit in ${data.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The 2024 conforming loan limit in most of ${data.name} is $${data.conformingLimit.toLocaleString()}. Loans below this amount qualify for conventional (Fannie/Freddie) financing. Amounts above this limit are jumbo loans and have different qualification requirements.`,
        },
      },
      {
        "@type": "Question",
        name: `Does HCMG lend in ${data.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Yes. Harris Capital Mortgage Group (NMLS# 1918223) is licensed to lend in ${data.name}. Our loan officers are familiar with ${data.name}'s local market, property tax structure, and available assistance programs.`,
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
      { "@type": "ListItem", position: 3, name: `${data.name} Mortgage Calculator`, item: `https://hcmgloans.com/mortgage-calculator/${state}` },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 0 }}>
        <div className="container-shell max-w-4xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Free Tool · No Credit Check · {data.name} ({data.abbr})
          </p>
          <h1
            className="font-extrabold tracking-tight text-ink"
            style={{ fontSize: "clamp(30px, 5vw, 56px)", lineHeight: 1.08 }}
          >
            {data.name} Mortgage Calculator
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted">
            Estimate your monthly mortgage payment in {data.name} — with local property tax rates
            pre-filled. Includes FHA, VA, USDA, and conventional loans, full PITI breakdown,
            and amortization schedule. No credit check. No sign-up.
          </p>
        </div>
      </section>

      {/* Calculator */}
      <Calculator
        heading={`Calculate your ${data.name} mortgage payment`}
        subheading={`Defaults use ${data.name}'s average property tax rate of ${data.taxRate}%. Adjust to your specific area.`}
      />

      {/* State context */}
      <section className="section-pad bg-sand">
        <div className="container-shell max-w-4xl">
          <h2 className="mb-4 text-2xl font-extrabold text-ink">
            Buying a Home in {data.name}
          </h2>
          <p className="text-base leading-8 text-muted">{data.blurb}</p>
          <p className="mt-4 text-base leading-8 text-muted">
            Harris Capital Mortgage Group (NMLS# 1918223) is a licensed mortgage lender serving {data.name}.
            Our loan officers know the {data.name} market and can give you a precise payment estimate
            based on the actual property and your credit profile — not just a calculator estimate.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/get-started" className="primary-button">
              Get my personalized estimate →
            </Link>
            <Link href="/mortgage-calculator" className="secondary-button">
              ← Back to main calculator
            </Link>
          </div>
          <Disclosure variant="estimate" className="mt-6" />
        </div>
      </section>

      {/* FAQ */}
      <section className="section-pad bg-white">
        <div className="container-shell max-w-3xl">
          <h2 className="mb-8 text-2xl font-extrabold text-ink">{data.name} Mortgage — Common Questions</h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((faq) => (
              <div key={faq.name} className="rounded-2xl border border-line bg-white p-6">
                <h3 className="mb-3 font-bold text-ink">{faq.name}</h3>
                <p className="text-sm leading-7 text-muted">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Links to other state calculators */}
      <section className="section-pad bg-sand">
        <div className="container-shell max-w-4xl">
          <h2 className="mb-6 text-lg font-extrabold text-ink">Mortgage calculators by state</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(STATE_DATA)
              .filter(([slug]) => slug !== state)
              .map(([slug, s]) => (
                <Link
                  key={slug}
                  href={`/mortgage-calculator/${slug}`}
                  className="rounded-xl border border-line bg-white px-4 py-2 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent"
                >
                  {s.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
