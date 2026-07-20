import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { seoPages } from "@/data/seo-pages";

const STATE_META: Record<string, {
  name: string;
  abbr: string;
  headline: string;
  intro: string;
  programs: string;
  googleMapUrl?: string;
}> = {
  nevada: {
    name: "Nevada", abbr: "NV",
    headline: "Mortgage Lender in Nevada: Las Vegas, Henderson, Reno & More",
    intro: "Harris Capital Mortgage Group (NMLS# 1918223) is headquartered in Las Vegas, NV. Nevada's no state income tax is a major draw for relocating buyers and investors. Clark County (Las Vegas, Henderson, North Las Vegas) and Washoe County (Reno, Sparks) are the two primary markets our loan officers serve daily.",
    programs: "Nevada does not have a statewide first-time buyer bond program, but the Nevada Rural Housing Authority and select county programs offer down payment assistance. HCMG's loan officers can walk you through every available option for your specific ZIP code.",
    googleMapUrl: "https://www.google.com/maps/search/harris+capital+mortgage+las+vegas",
  },
  texas: {
    name: "Texas", abbr: "TX",
    headline: "Mortgage Lender in Texas: Houston, Dallas, Austin, San Antonio & More",
    intro: "HCMG's Houston branch office at 9801 Westheimer Ave, Suite 300 serves the Texas market. Texas has no state income tax, but property taxes are among the highest in the nation — ranging from 1.6% in Collin County (Plano) to 1.9% in Bexar County (San Antonio). Your loan officer will build a precise payment estimate using the actual county rate.",
    programs: "The Texas State Affordable Housing Corporation (TSAHC) and Texas Department of Housing offer down payment assistance programs for qualifying first-time buyers and veterans. My First Texas Home and Homes for Texas Heroes are two programs frequently available in DFW, Houston, and Austin.",
    googleMapUrl: "https://www.google.com/maps/search/harris+capital+mortgage+houston",
  },
  florida: {
    name: "Florida", abbr: "FL",
    headline: "Mortgage Lender in Florida: Miami, Orlando, Tampa, Jacksonville & More",
    intro: "Florida has no state income tax, which increases monthly buying power for relocating buyers from high-tax states. Markets vary widely — Miami-Dade County carries some of the highest median home prices in the Southeast, while Jacksonville and Tallahassee offer more affordable entry points. FHA loan limits in Miami-Dade County are higher than the national baseline due to area median income thresholds.",
    programs: "The Florida Housing Finance Corporation (Florida HLP / Florida Housing) offers down payment assistance through programs like the Florida Assist Second Mortgage and Florida HFA Preferred Grants. Income and purchase price limits apply. HCMG's licensed loan officers in Florida can determine eligibility within minutes.",
  },
  colorado: {
    name: "Colorado", abbr: "CO",
    headline: "Mortgage Lender in Colorado: Denver, Colorado Springs, Aurora & More",
    intro: "Colorado home prices have risen sharply over the past decade. Denver County and the broader Front Range — including Aurora, Lakewood, and Fort Collins — remain highly competitive. Colorado's effective property tax rate is one of the lowest in the country at around 0.51%, which helps offset the high home prices.",
    programs: "CHFA (Colorado Housing Finance Authority) offers below-market first mortgage rates and down payment assistance for qualifying first-time buyers across the state. Fort Collins and Boulder have additional local programs. HCMG loan officers are certified CHFA lenders.",
  },
  georgia: {
    name: "Georgia", abbr: "GA",
    headline: "Mortgage Lender in Georgia: Atlanta, Savannah, Augusta & More",
    intro: "Georgia's real estate market is anchored by the Atlanta metro, which spans Fulton, DeKalb, Gwinnett, and Cobb counties. Rapidly growing suburbs like Sandy Springs and Roswell carry premium pricing, while Augusta, Macon, and Columbus remain among the most affordable markets in the Southeast.",
    programs: "Georgia Dream Homeownership Program (offered through GAHFA) provides down payment assistance of up to $10,000 for qualifying buyers. The program is income- and price-limited and requires a homebuyer education course. HCMG's Georgia-licensed loan officers are well-versed in Georgia Dream requirements.",
  },
  virginia: {
    name: "Virginia", abbr: "VA",
    headline: "Mortgage Lender in Virginia: Virginia Beach, Richmond, Norfolk & More",
    intro: "Virginia's housing market is shaped by two distinct corridors: Northern Virginia (close to Washington DC) commands some of the highest home prices east of California, while Hampton Roads (Virginia Beach, Norfolk, Chesapeake) and Richmond offer more moderate pricing. Northern Virginia buyers in Fairfax, Arlington, and Loudoun counties often require jumbo financing.",
    programs: "The Virginia Housing Development Authority (VHDA) offers down payment assistance and competitive first mortgage rates for qualifying buyers statewide. Military buyers purchasing near Virginia Beach, Norfolk, or Quantico frequently benefit from HCMG's VA loan expertise — zero down, no PMI.",
  },
  maryland: {
    name: "Maryland", abbr: "MD",
    headline: "Mortgage Lender in Maryland: Baltimore, Silver Spring, Rockville & More",
    intro: "Maryland's proximity to Washington DC makes Montgomery County (Silver Spring, Rockville, Gaithersburg) and Prince George's County (Bowie) highly sought-after markets. Property taxes in Maryland average 1.09% statewide but vary significantly by county — Baltimore City's effective rate is higher than suburban Montgomery County's.",
    programs: "The Maryland Mortgage Program (MMP) offers competitive interest rates and down payment assistance for first-time and repeat buyers in select circumstances. The SmartBuy program also helps buyers with student loan debt. HCMG loan officers serving Maryland are MMP-certified.",
  },
  california: {
    name: "California", abbr: "CA",
    headline: "Mortgage Lender in California: Los Angeles, San Diego, San Jose & More",
    intro: "California has some of the most competitive real estate markets in the nation. For 2026, the one-unit conforming ceiling in high-cost counties is $1,249,125, while the national baseline is $832,750. The exact limit depends on the property county and unit count.",
    programs: "CalHFA (California Housing Finance Agency) offers MyHome Assistance for down payment and closing cost help, and the CalHFA Zero Interest Program (ZIP) as a deferred second mortgage. CalVet Home Loans are available for eligible California veterans. HCMG's California-licensed loan officers can assess your eligibility quickly.",
  },
  dc: {
    name: "Washington DC", abbr: "DC",
    headline: "Mortgage Lender in Washington DC",
    intro: "Washington DC has some of the highest median home prices on the East Coast — often exceeding $640,000 — yet features a comparatively low property tax rate of 0.55%. The DC market is highly competitive, and buyers without pre-approval letters frequently lose out on offers in popular neighborhoods like Capitol Hill, Shaw, and Anacostia.",
    programs: "The DC Department of Housing and Community Development (DHCD) offers the Home Purchase Assistance Program (HPAP) for low-to-moderate income buyers. The Employer Assisted Housing Program (EAHP) and DC Open Doors are additional options. HCMG's loan officers serving DC can walk you through federal programs as well.",
  },
  mississippi: {
    name: "Mississippi", abbr: "MS",
    headline: "Mortgage Lender in Mississippi: Jackson, Gulfport, Hattiesburg & More",
    intro: "Mississippi consistently ranks among the most affordable housing markets in the country. Median home prices in Jackson and Hattiesburg are well below $200,000, and property tax rates average just 0.65%. For buyers with limited upfront capital, Mississippi is one of the best markets to leverage a low down payment FHA or USDA loan.",
    programs: "The Mississippi Home Corporation (MHC) offers the Smart6 mortgage program with below-market rates and the MHC Down Payment Assistance program. USDA loan eligibility is widespread across Mississippi's largely rural and suburban areas — many buyers qualify for 100% financing through USDA.",
  },
};

/** Loan types highlighted on state pages (same order as seoPages) */
const FEATURED_LOAN_TYPES = ["FHA Loan", "VA Loan", "Conventional Loan", "Down Payment Assistance", "Refinance", "First-Time Buyer"];

export function generateStaticParams() {
  return Object.keys(STATE_META).map((state) => ({ state }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const { state } = await params;
  const data = STATE_META[state];
  if (!data) return {};
  return {
    title: `${data.headline} | HCMG`,
    description: `Harris Capital Mortgage Group is a licensed mortgage lender in ${data.name}. Browse FHA, VA, Conventional, and Down Payment Assistance options by city. NMLS# 1918223.`,
    alternates: { canonical: `https://hcmgloans.com/areas-we-serve/${state}` },
    openGraph: {
      title: `Mortgage Lender in ${data.name} | HCMG`,
      description: `Browse local mortgage options for every city in ${data.name}. FHA, VA, Conventional, and more.`,
      url: `https://hcmgloans.com/areas-we-serve/${state}`,
      images: ["/hcmg-social.png"],
    },
  };
}

export default async function StateAreaPage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const data = STATE_META[state];
  if (!data) notFound();

  // All cities for this state (seoPages uses state abbreviation in the `state` field)
  const stateCities = [...new Set(
    seoPages.filter((p) => p.state === data.abbr).map((p) => p.city)
  )];

  // Pages grouped by city
  const cityPages = stateCities.map((city) => {
    const featured = FEATURED_LOAN_TYPES.map((lt) =>
      seoPages.find((p) => p.city === city && p.loanType === lt)
    ).filter(Boolean) as typeof seoPages;
    return { city, pages: featured };
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",           item: "https://hcmgloans.com" },
      { "@type": "ListItem", position: 2, name: "Areas We Serve", item: "https://hcmgloans.com/areas-we-serve" },
      { "@type": "ListItem", position: 3, name: data.name,        item: `https://hcmgloans.com/areas-we-serve/${state}` },
    ],
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": ["MortgageLender", "LocalBusiness"],
    name: "Harris Capital Mortgage Group, LLC",
    url: "https://hcmgloans.com",
    telephone: "+18884413930",
    areaServed: data.name,
    description: `Harris Capital Mortgage Group (NMLS# 1918223) is a licensed mortgage lender offering FHA, VA, Conventional, and Refinance loans in ${data.name}.`,
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 40 }}>
        <div className="container-shell max-w-4xl">
          {/* Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-xs text-muted" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-accent">Home</Link>
            <span>/</span>
            <Link href="/areas-we-serve" className="hover:text-accent">Areas We Serve</Link>
            <span>/</span>
            <span className="font-semibold text-ink">{data.name}</span>
          </nav>
          <SectionEyebrow>Mortgage Lender · {data.abbr}</SectionEyebrow>
          <h1
            className="mt-3 font-extrabold tracking-tight text-ink"
            style={{ fontSize: "clamp(28px, 5vw, 50px)", lineHeight: 1.1 }}
          >
            {data.headline}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-muted">{data.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/get-started" className="primary-button">Get my free estimate →</Link>
            <Link href={`/mortgage-calculator/${state === "dc" ? "dc" : state}`} className="secondary-button">
              {data.name} mortgage calculator
            </Link>
          </div>
        </div>
      </section>

      {/* Down Payment / Programs */}
      <section className="bg-sand py-10">
        <div className="container-shell max-w-4xl">
          <h2 className="mb-3 text-xl font-extrabold text-ink">
            Down Payment Assistance &amp; Programs in {data.name}
          </h2>
          <p className="text-base leading-8 text-muted">{data.programs}</p>
        </div>
      </section>

      {/* City grid — every city links to its own loan pages */}
      <section className="section-pad bg-white">
        <div className="container-shell max-w-5xl">
          <h2 className="mb-8 text-2xl font-extrabold text-ink">
            {data.name} Cities We Serve
          </h2>
          <div className="space-y-8">
            {cityPages.map(({ city, pages }) => (
              <div key={city} className="rounded-2xl border border-line bg-white p-6">
                <h3 className="mb-4 text-lg font-extrabold text-ink">
                  {city}, {data.abbr}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {pages.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/seo/${p.slug}`}
                      className="rounded-xl border border-line bg-sand px-4 py-2 text-xs font-semibold text-ink transition hover:border-accent hover:text-accent"
                    >
                      {p.loanType}
                    </Link>
                  ))}
                  <Link
                    href={`/seo/${seoPages.find((p) => p.city === city)?.slug ?? ""}`}
                    className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-2 text-xs font-semibold text-accent transition hover:border-accent"
                  >
                    All {city} loans →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Business Profile link */}
      {data.googleMapUrl && (
        <section className="bg-sand py-8">
          <div className="container-shell max-w-4xl">
            <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-6">
              <div className="flex-1">
                <p className="font-bold text-ink">Find us on Google Maps</p>
                <p className="text-sm text-muted">
                  Search for HCMG loan officers near you and link directly to our {data.name} regional page.
                </p>
              </div>
              <a
                href={data.googleMapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-button"
              >
                View on Google Maps →
              </a>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
