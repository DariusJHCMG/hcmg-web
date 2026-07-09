import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { seoPages } from "@/data/seo-pages";

export const metadata: Metadata = {
  title: "Areas We Serve — Mortgage Lender Near You | HCMG",
  description:
    "Harris Capital Mortgage Group (NMLS# 1918223) is licensed in FL, TX, GA, NV, CO, VA, DC, MD, CA & MS. Browse state and city mortgage pages to find a licensed loan officer near you.",
  alternates: { canonical: "https://hcmgloans.com/areas-we-serve" },
};

const STATE_GROUPS: { state: string; abbr: string; slug: string; blurb: string }[] = [
  { state: "Nevada",         abbr: "NV", slug: "nevada",       blurb: "No state income tax. Las Vegas, Henderson, Reno & more." },
  { state: "Texas",          abbr: "TX", slug: "texas",        blurb: "Zero income tax, competitive markets. Houston, Dallas, Austin & more." },
  { state: "Florida",        abbr: "FL", slug: "florida",      blurb: "Down payment assistance via FL Housing. Miami, Orlando, Tampa & more." },
  { state: "Colorado",       abbr: "CO", slug: "colorado",     blurb: "CHFA programs available. Denver, Colorado Springs & more." },
  { state: "Georgia",        abbr: "GA", slug: "georgia",      blurb: "GAHFA first-time buyer programs. Atlanta, Savannah & more." },
  { state: "Virginia",       abbr: "VA", slug: "virginia",     blurb: "Strong job markets. Virginia Beach, Richmond & more." },
  { state: "Maryland",       abbr: "MD", slug: "maryland",     blurb: "Maryland Mortgage Program available. Baltimore, Silver Spring & more." },
  { state: "California",     abbr: "CA", slug: "california",   blurb: "CalHFA down payment assistance. Los Angeles, San Diego & more." },
  { state: "Washington DC",  abbr: "DC", slug: "dc",           blurb: "DC & MD first-time buyer programs. High-value market specialists." },
  { state: "Mississippi",    abbr: "MS", slug: "mississippi",  blurb: "Affordable home prices. Jackson, Gulfport & more." },
];

export default function AreasWeServePage() {
  const totalCities = [...new Set(seoPages.map((p) => `${p.city}-${p.state}`))].length;

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",          item: "https://hcmgloans.com" },
      { "@type": "ListItem", position: 2, name: "Areas We Serve", item: "https://hcmgloans.com/areas-we-serve" },
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 40 }}>
        <div className="container-shell max-w-4xl">
          <SectionEyebrow>Local Mortgage Lender</SectionEyebrow>
          <h1
            className="mt-3 font-extrabold tracking-tight text-ink"
            style={{ fontSize: "clamp(30px, 5vw, 52px)", lineHeight: 1.1 }}
          >
            Areas We Serve
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            Harris Capital Mortgage Group (NMLS# 1918223) is a licensed mortgage lender serving {totalCities}+ cities
            across 10 states. Select your state to browse FHA, VA, Conventional, and other loan options near you.
          </p>
        </div>
      </section>

      {/* State grid */}
      <section className="section-pad bg-sand" style={{ paddingTop: 40 }}>
        <div className="container-shell max-w-5xl">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {STATE_GROUPS.map((s) => (
              <Link
                key={s.slug}
                href={`/areas-we-serve/${s.slug}`}
                className="group rounded-2xl border border-line bg-white p-6 transition-all hover:border-accent hover:shadow-soft"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-ink group-hover:text-accent transition-colors">
                    {s.state}
                  </span>
                  <span className="rounded-lg bg-sand px-2.5 py-1 text-xs font-bold text-muted">
                    {s.abbr}
                  </span>
                </div>
                <p className="text-sm leading-6 text-muted">{s.blurb}</p>
                <span className="mt-3 block text-xs font-semibold text-accent">
                  View {s.state} cities →
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-line bg-white p-8">
            <h2 className="mb-3 text-xl font-extrabold text-ink">
              Not sure which loan is right for you?
            </h2>
            <p className="mb-5 text-base text-muted">
              Our licensed loan officers know the local market in every city we serve. Get a free
              estimate — no hard credit check, no commitment.
            </p>
            <Link href="/get-started" className="primary-button">
              Get my free estimate →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
