import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { learnArticles, getArticleBySlug, getRelatedArticles } from "@/data/learn";
import { seoPages } from "@/data/seo-pages";
import { glossaryTerms } from "@/data/glossary";

export const revalidate = 86400;

export function generateStaticParams() {
  return learnArticles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: `https://hcmgloans.com/learn/${slug}` },
    openGraph: {
      title: article.title,
      description: article.metaDescription,
      url: `https://hcmgloans.com/learn/${slug}`,
      type: "article",
      images: ["/hcmg-social.png"],
      publishedTime: article.publishedAt,
    },
  };
}

// Pick up to 4 SEO pages for the article's loan type (one per state)
function getLinkedSeoPages(loanType: string) {
  const matches = seoPages.filter((p) => p.loanType === loanType);
  const seen = new Set<string>();
  return matches
    .filter((p) => {
      if (seen.has(p.state)) return false;
      seen.add(p.state);
      return true;
    })
    .slice(0, 4);
}

// Build a map of term → slug for glossary auto-linking (first mention only)
const GLOSSARY_LINK_MAP: Record<string, string> = Object.fromEntries(
  glossaryTerms.map((t) => [t.term.toLowerCase(), t.slug])
);

/** Wrap the first occurrence of any glossary term in a paragraph with an anchor tag.
 *  Returns a React element array (mixed strings + anchors). */
function linkGlossaryTerms(text: string): React.ReactNode {
  // Sort longest first so "adjustable-rate mortgage" matches before "mortgage"
  const terms = Object.keys(GLOSSARY_LINK_MAP).sort((a, b) => b.length - a.length);
  for (const term of terms) {
    const idx = text.toLowerCase().indexOf(term);
    if (idx === -1) continue;
    const before = text.slice(0, idx);
    const match  = text.slice(idx, idx + term.length);
    const after  = text.slice(idx + term.length);
    return (
      <>
        {before}
        <a href={`/glossary/${GLOSSARY_LINK_MAP[term]}`} className="text-accent underline underline-offset-2 hover:no-underline">
          {match}
        </a>
        {after}
      </>
    );
  }
  return text;
}

export default async function LearnArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article);
  const linkedSeoPages = article.loanType ? getLinkedSeoPages(article.loanType) : [];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.headline,
    description: article.metaDescription,
    url: `https://hcmgloans.com/learn/${slug}`,
    datePublished: article.publishedAt,
    author: {
      "@type": "Organization",
      name: "Harris Capital Mortgage Group, LLC",
      url: "https://hcmgloans.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Harris Capital Mortgage Group, LLC",
      url: "https://hcmgloans.com",
      logo: {
        "@type": "ImageObject",
        url: "https://hcmgloans.com/hcmg-wordmark-on-light.svg",
      },
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://hcmgloans.com" },
      { "@type": "ListItem", position: 2, name: "Learn", item: "https://hcmgloans.com/learn" },
      {
        "@type": "ListItem",
        position: 3,
        name: article.title,
        item: `https://hcmgloans.com/learn/${slug}`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: article.faqs.map((faq) => ({
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 32 }}>
        <div className="container-shell max-w-3xl">
          {/* Breadcrumb */}
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <span aria-hidden>›</span>
            <Link href="/learn" className="hover:text-accent">
              Learn
            </Link>
            <span aria-hidden>›</span>
            <span className="text-ink">{article.title}</span>
          </nav>

          <SectionEyebrow>
            {article.category} · {article.readTime} min read
          </SectionEyebrow>
          <h1
            className="mt-3 font-extrabold tracking-tight text-ink"
            style={{ fontSize: "clamp(32px, 5vw, 52px)", lineHeight: 1.08 }}
          >
            {article.headline}
          </h1>
          <p className="mt-5 text-base leading-8 text-muted">{article.intro}</p>
        </div>
      </section>

      {/* Article body */}
      <section className="bg-white pb-16">
        <div className="container-shell max-w-3xl space-y-12">
          {article.sections.map((section, i) => (
            <div key={i}>
              <h2 className="mb-4 text-xl font-extrabold text-ink">{section.heading}</h2>
              <div className="space-y-4">
                {section.body.map((para, j) => (
                  <p key={j} className="text-base leading-8 text-ink/85">
                    {j === 0 ? linkGlossaryTerms(para) : para}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      {article.faqs.length > 0 && (
        <section className="bg-sand py-16">
          <div className="container-shell max-w-3xl">
            <h2 className="mb-6 text-2xl font-extrabold text-ink">Common Questions</h2>
            <div className="space-y-4">
              {article.faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl border border-line bg-white p-6">
                  <h3 className="mb-3 font-bold text-ink">{faq.q}</h3>
                  <p className="text-sm leading-7 text-muted">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contextual SEO links (if article has a loan type) */}
      {linkedSeoPages.length > 0 && (
        <section className="bg-white py-12">
          <div className="container-shell max-w-3xl">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Get a {article.loanType} in your state
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {linkedSeoPages.map((page) => (
                <Link
                  key={page.slug}
                  href={`/seo/${page.slug}`}
                  className="block rounded-2xl border border-line bg-white px-5 py-4 text-sm font-semibold text-ink transition-all hover:border-accent hover:text-accent"
                >
                  {page.loanType}s in {page.city}, {page.state}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related articles */}
      {related.length > 0 && (
        <section className="bg-sand py-12">
          <div className="container-shell max-w-3xl">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-muted">
              Related guides
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/learn/${r.slug}`}
                  className="block rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
                >
                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                    {r.category} · {r.readTime} min read
                  </div>
                  <h4 className="text-base font-bold text-ink">{r.title}</h4>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-white py-16">
        <div className="container-shell max-w-3xl text-center">
          <h2 className="text-2xl font-extrabold text-ink lg:text-3xl">
            Ready to take the next step?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted">
            A licensed HCMG loan officer will walk you through your exact scenario — your credit, income, down
            payment, and goals — and tell you what you qualify for, with no hard credit check.
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
