import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { seoPages, STATE_COPY, LOAN_TYPE_FAQS, CITY_DATA, AEO_FAQS } from "@/data/seo-pages";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Calculator } from "@/components/sections/Calculator";
import { Disclosure } from "@/components/ui/Disclosure";
import { isPrioritySeoPage } from "@/lib/seo-strategy";

export const revalidate = 86400;

export function generateStaticParams() {
  // Pre-render only pages selected for organic search. Legacy generated URLs
  // remain available on demand with noindex so existing links do not break.
  return seoPages.filter(isPrioritySeoPage).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = seoPages.find((p) => p.slug === slug);
  if (!page) return {};
  const isLasVegasArm = page.city === "Las Vegas" && page.loanType === "Adjustable Rate Mortgage";
  return {
    title: isLasVegasArm ? "Adjustable-Rate Mortgages in Las Vegas: ARM Caps & Options | HCMG" : `${page.loanType}s in ${page.city}, ${page.state} | HCMG Mortgage Lender`,
    description: isLasVegasArm ? "Compare adjustable-rate mortgage options in Las Vegas, including fixed periods, rate caps, payment planning, and questions to ask a licensed loan officer." : page.description,
    alternates: { canonical: `https://hcmgloans.com/seo/${slug}` },
    robots: isPrioritySeoPage(page) ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title: `${page.loanType}s in ${page.city}, ${page.state} | HCMG`,
      description: page.description,
      url: `https://hcmgloans.com/seo/${slug}`,
      images: ["/hcmg-social.png"],
    },
  };
}

export default async function SeoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = seoPages.find((p) => p.slug === slug);
  if (!page) notFound();

  const localCopy = STATE_COPY[page.state] ?? `Explore ${page.loanType.toLowerCase()} options in ${page.city}, ${page.state} with Harris Capital Mortgage Group.`;
  const faqs = LOAN_TYPE_FAQS[page.loanType] ?? LOAN_TYPE_FAQS["Conventional Loan"];
  const isLasVegasArm = page.city === "Las Vegas" && page.loanType === "Adjustable Rate Mortgage";

  const relatedPages = seoPages
    .filter((p) => p.slug !== slug && (p.state === page.state || p.loanType === page.loanType))
    .slice(0, 5);

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${page.loanType} in ${page.city}, ${page.state}`,
    description: page.description,
    url: `https://hcmgloans.com/seo/${slug}`,
    provider: {
      "@type": "MortgageLender",
      name: "Harris Capital Mortgage Group, LLC",
      alternateName: "HCMG",
      legalName: "Harris Capital Mortgage Group, LLC",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",     item: "https://hcmgloans.com" },
      { "@type": "ListItem", position: 2, name: "Mortgage Loans", item: "https://hcmgloans.com/get-started" },
      { "@type": "ListItem", position: 3, name: `${page.loanType} in ${page.city}, ${page.state}`, item: `https://hcmgloans.com/seo/${slug}` },
    ],
  };

  const aeoFaqsForSchema = AEO_FAQS[page.loanType]?.(page.city, page.state) ?? [];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      ...aeoFaqsForSchema.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
      ...faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: { "@type": "Answer", text: faq.a },
      })),
    ],
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 48 }}>
        <div className="container-shell max-w-4xl">
          <SectionEyebrow>{page.loanType}</SectionEyebrow>
          <h1
            className="mt-3 font-extrabold tracking-tight text-ink"
            style={{ fontSize: "clamp(32px, 5vw, 56px)", lineHeight: 1.1 }}
          >
            {page.loanType}s in {page.city}, {page.state}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">{page.description}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={`/get-started?source=seo&from=${page.slug}`} className="primary-button">
              Get my free estimate →
            </Link>
            <Link href="/#calculator" className="secondary-button">
              Try the calculator
            </Link>
          </div>
        </div>
      </section>

      {/* Calculator */}
      <Calculator seoSlug={page.slug} />

      {isLasVegasArm && <section className="border-y border-line bg-white py-12"><div className="container-shell grid max-w-4xl gap-5 md:grid-cols-3">{[
        ["Initial fixed period", "Ask how long the introductory rate is fixed and what index and margin determine later adjustments."],
        ["Adjustment caps", "Compare the initial, periodic, and lifetime caps—not only the starting rate or first payment."],
        ["Ownership horizon", "Stress-test the maximum permitted payment if you may still own the Las Vegas property after the fixed period."],
      ].map(([heading,body]) => <article key={heading} className="rounded-2xl border border-line bg-sand p-5"><h2 className="font-extrabold text-ink">{heading}</h2><p className="mt-3 text-sm leading-7 text-muted">{body}</p></article>)}</div></section>}

      {/* Local context */}
      <section className="section-pad bg-sand">
        <div className="container-shell max-w-4xl">
          <h2 className="mb-4 text-2xl font-extrabold text-ink">
            {page.loanType} Near {page.city}, {page.state}
          </h2>
          <p className="text-base leading-8 text-muted">{localCopy}</p>
          <p className="mt-4 text-base leading-8 text-muted">
            Harris Capital Mortgage Group (NMLS# 1918223) is a licensed mortgage lender near {page.city}, {page.state} serving buyers throughout the {page.state} market. Whether you&apos;re searching for a {page.loanType.toLowerCase()} near {page.city} or anywhere in {page.state}, our loan officers know the local market and will guide you through every step of the process.
          </p>
          {(() => {
            const cityInfo = CITY_DATA[page.city];
            if (!cityInfo) return null;
            return (
              <>
                {/* Market snapshot */}
                <div className="mt-5 rounded-2xl border border-line bg-white p-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted">{page.city} Market Snapshot</p>
                  <div className="grid gap-4 sm:grid-cols-3 text-sm">
                    <div>
                      <div className="font-extrabold text-lg text-ink">${cityInfo.medianHomePrice.toLocaleString()}</div>
                      <div className="text-muted">Median home price</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-lg text-ink">{cityInfo.propertyTaxRate}%</div>
                      <div className="text-muted">Avg. property tax rate</div>
                    </div>
                    <div>
                      <div className="font-extrabold text-lg text-ink">{cityInfo.county}</div>
                      <div className="text-muted">County</div>
                    </div>
                  </div>
                  {/* FHA loan limit row */}
                  {page.loanType === "FHA Loan" && (
                    <div className="mt-4 border-t border-line pt-4 grid gap-4 sm:grid-cols-2 text-sm">
                      <div>
                        <div className="font-extrabold text-lg text-ink">$541,287–$1,249,125</div>
                        <div className="text-muted">2026 FHA one-unit national range · county limit varies</div>
                      </div>
                      {cityInfo.dpaProgram && (
                        <div>
                          <div className="font-semibold text-sm text-ink mb-1">Down Payment Assistance</div>
                          <div className="text-xs leading-5 text-muted">{cityInfo.dpaProgram}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {/* Neighborhood context */}
                {cityInfo.neighborhoods && cityInfo.neighborhoods.length > 0 && (
                  <div className="mt-4 rounded-2xl border border-line bg-white p-5">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                      Areas within {page.city} we commonly serve
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {cityInfo.neighborhoods.map((n) => (
                        <span
                          key={n}
                          className="rounded-xl border border-line bg-sand px-3 py-1.5 text-xs font-semibold text-ink"
                        >
                          {n}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            );
          })()}
          <Disclosure variant="estimate" className="mt-6" />
        </div>
      </section>

      {/* AEO — high-intent conversational questions */}
      {(() => {
        const aeoFaqs = AEO_FAQS[page.loanType]?.(page.city, page.state) ?? [];
        if (aeoFaqs.length === 0) return null;
        return (
          <section className="section-pad bg-white" style={{ paddingBottom: 0 }}>
            <div className="container-shell max-w-4xl">
              <h2 className="mb-6 text-2xl font-extrabold text-ink">
                Frequently Asked Questions: {page.loanType} in {page.city}, {page.state}
              </h2>
              <div className="space-y-5">
                {aeoFaqs.map((faq) => (
                  <div key={faq.q} className="rounded-2xl border border-line bg-sand p-6">
                    <h3 className="mb-3 font-bold text-ink">{faq.q}</h3>
                    <p className="text-sm leading-7 text-muted">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })()}

      {/* FAQ */}
      <section className="section-pad bg-white">
        <div className="container-shell grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="mb-6 text-2xl font-extrabold text-ink">{page.loanType}, Common Questions</h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-line bg-white p-6">
                  <h3 className="mb-3 font-bold text-ink">{faq.q}</h3>
                  <p className="text-sm leading-7 text-muted">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Related */}
          <aside>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted">Related Pages</h3>
            <div className="space-y-3">
              {relatedPages.map((r) => (
                <Link
                  key={r.slug}
                  href={`/seo/${r.slug}`}
                  className="block rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold text-ink transition-all hover:border-accent hover:text-accent"
                >
                  {r.city}, {r.state}, {r.loanType}
                </Link>
              ))}
            </div>

            {/* CTA card */}
            <div className="mt-6 overflow-hidden rounded-3xl" style={{ background: "var(--ok-gradient)" }}>
              <div className="p-6">
                <p className="mb-4 text-base font-bold text-white">Ready to see your numbers?</p>
                <Link
                  href="/get-started"
                  className="block rounded-2xl bg-white px-5 py-3 text-center text-sm font-bold text-accent transition hover:scale-[1.02]"
                >
                  Get free estimate →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <Footer />
    </main>
  );
}
