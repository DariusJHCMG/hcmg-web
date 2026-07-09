import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { seoPages, STATE_COPY, LOAN_TYPE_FAQS, CITY_DATA } from "@/data/seo-pages";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { Calculator } from "@/components/sections/Calculator";
import { Disclosure } from "@/components/ui/Disclosure";

export const revalidate = 86400;

export function generateStaticParams() {
  return seoPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = seoPages.find((p) => p.slug === slug);
  if (!page) return {};
  return {
    title: `${page.loanType}s in ${page.city}, ${page.state} | HCMG Mortgage Lender`,
    description: page.description,
    alternates: { canonical: `https://hcmgloans.com/seo/${slug}` },
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

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
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
              </div>
            );
          })()}
          <Disclosure variant="estimate" className="mt-6" />
        </div>
      </section>

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
