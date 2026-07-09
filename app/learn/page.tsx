import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { learnArticles, LEARN_CATEGORIES } from "@/data/learn";

export const metadata: Metadata = {
  title: "Mortgage Learning Center — Guides for Home Buyers | HCMG",
  description:
    "Plain-English guides on FHA loans, VA loans, first-time homebuyer programs, down payments, refinancing, and more. Written by Harris Capital Mortgage Group loan officers. NMLS# 1918223.",
  alternates: { canonical: "https://hcmgloans.com/learn" },
  openGraph: {
    title: "Mortgage Learning Center | HCMG",
    description:
      "Free guides on FHA loans, VA loans, first-time homebuyer programs, refinancing, PMI, and more. Harris Capital Mortgage Group · NMLS# 1918223.",
    url: "https://hcmgloans.com/learn",
    images: ["/hcmg-social.png"],
  },
};

const learnSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "HCMG Mortgage Learning Center",
  description:
    "Plain-English mortgage guides for home buyers, covering FHA loans, VA loans, down payment assistance, refinancing, PMI, and pre-approval.",
  url: "https://hcmgloans.com/learn",
  hasPart: learnArticles.map((a) => ({
    "@type": "Article",
    headline: a.headline,
    description: a.metaDescription,
    url: `https://hcmgloans.com/learn/${a.slug}`,
    author: {
      "@type": "Organization",
      name: "Harris Capital Mortgage Group, LLC",
      url: "https://hcmgloans.com",
    },
  })),
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Buying a Home": "Everything from affordability math to pre-approval and down payment programs.",
  "FHA Loans": "Requirements, mortgage insurance, and how FHA compares to conventional.",
  "VA Loans": "Eligibility, Certificate of Eligibility, the funding fee, and how to use your benefit.",
  "Refinance": "Break-even analysis, cash-out vs. rate/term, and when to stay put.",
};

export default function LearnIndexPage() {
  const categories = LEARN_CATEGORIES.map((cat) => ({
    name: cat,
    description: CATEGORY_DESCRIPTIONS[cat] ?? "",
    articles: learnArticles.filter((a) => a.category === cat),
  }));

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(learnSchema) }}
      />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 40 }}>
        <div className="container-shell max-w-4xl">
          <SectionEyebrow>Mortgage Learning Center</SectionEyebrow>
          <h1
            className="mt-3 font-extrabold tracking-tight text-ink"
            style={{ fontSize: "clamp(36px, 5.5vw, 60px)", lineHeight: 1.05 }}
          >
            Understand your mortgage before you sign anything.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            {learnArticles.length} plain-English guides written to answer the questions our loan officers hear every day.
            No jargon. No ads. Just the information you need to make a confident decision.
          </p>
        </div>
      </section>

      {/* Category sections */}
      <section className="section-pad bg-white" style={{ paddingTop: 0 }}>
        <div className="container-shell max-w-5xl space-y-16">
          {categories.map((cat) => (
            <div key={cat.name}>
              <div className="mb-8 border-b border-line pb-4">
                <h2 className="text-2xl font-extrabold tracking-tight text-ink">{cat.name}</h2>
                <p className="mt-1 text-sm text-muted">{cat.description}</p>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                {cat.articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/learn/${article.slug}`}
                    className="group block rounded-2xl border border-line bg-white p-6 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
                  >
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                      {article.category} · {article.readTime} min read
                    </div>
                    <h3 className="mb-2 text-lg font-extrabold text-ink group-hover:text-accent transition-colors">
                      {article.headline}
                    </h3>
                    <p className="text-sm leading-6 text-muted line-clamp-3">{article.intro}</p>
                    <div className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                      Read guide →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sand">
        <div className="container-shell max-w-3xl py-16 text-center">
          <h2 className="text-2xl font-extrabold text-ink lg:text-3xl">
            Ready to put this into practice?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted">
            A licensed HCMG loan officer will walk through your specific numbers — income, credit, down payment —
            and tell you exactly what you qualify for, with no hard credit check required.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/get-started" className="primary-button">
              Get my free estimate →
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
