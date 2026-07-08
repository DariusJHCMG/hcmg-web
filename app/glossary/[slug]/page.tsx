import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { glossaryTerms, getTermBySlug, getRelatedTerms } from "@/data/glossary";

export const revalidate = 86400;

export function generateStaticParams() {
  return glossaryTerms.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) return {};
  return {
    title: `${term.term}, Mortgage Term Definition | HCMG`,
    description: term.shortDef,
    alternates: { canonical: `https://hcmgloans.com/glossary/${slug}` },
    openGraph: {
      title: `${term.term}, Defined`,
      description: term.shortDef,
      url: `https://hcmgloans.com/glossary/${slug}`,
      images: ["/hcmg-social-square.svg"],
    },
  };
}

export default async function GlossaryTermPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const term = getTermBySlug(slug);
  if (!term) notFound();

  const related = getRelatedTerms(term);

  const termSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.shortDef,
    url: `https://hcmgloans.com/glossary/${slug}`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "HCMG Mortgage Glossary",
      url: "https://hcmgloans.com/glossary",
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://hcmgloans.com" },
      { "@type": "ListItem", position: 2, name: "Glossary", item: "https://hcmgloans.com/glossary" },
      {
        "@type": "ListItem",
        position: 3,
        name: term.term,
        item: `https://hcmgloans.com/glossary/${slug}`,
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <NavBar />

      <section className="section-pad bg-white" style={{ paddingBottom: 32 }}>
        <div className="container-shell max-w-3xl">
          {/* Breadcrumb */}
          <nav className="mb-6 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            <Link href="/" className="hover:text-accent">
              Home
            </Link>
            <span aria-hidden>›</span>
            <Link href="/glossary" className="hover:text-accent">
              Glossary
            </Link>
            <span aria-hidden>›</span>
            <span className="text-ink">{term.term}</span>
          </nav>

          <SectionEyebrow>{term.category}</SectionEyebrow>
          <h1
            className="mt-3 font-extrabold tracking-tight text-ink"
            style={{ fontSize: "clamp(34px, 5vw, 54px)", lineHeight: 1.05 }}
          >
            {term.term}
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted">{term.shortDef}</p>
        </div>
      </section>

      {/* Long definition */}
      <section className="bg-white pb-16">
        <div className="container-shell max-w-3xl">
          <div className="prose prose-lg max-w-none">
            {term.longDef.map((para, i) => (
              <p key={i} className="mb-5 text-base leading-8 text-ink/85">
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Related terms */}
      {related.length > 0 && (
        <section className="bg-sand py-16">
          <div className="container-shell max-w-3xl">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
              Related terms
            </h2>
            <p className="mb-6 text-2xl font-extrabold text-ink">
              Other terms you&apos;ll see alongside {term.term.replace(/\s*\([^)]*\)/, "")}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/glossary/${r.slug}`}
                  className="block rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
                >
                  <div className="text-base font-bold text-ink">{r.term}</div>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{r.shortDef}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-white">
        <div className="container-shell max-w-3xl py-16 text-center">
          <h2 className="text-2xl font-extrabold text-ink lg:text-3xl">
            Want to apply {term.term.replace(/\s*\([^)]*\)/, "")} to your real numbers?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted">
            Get a personalized estimate in under a minute, or talk to a licensed HCMG loan officer about how
            this affects your specific situation.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/get-started" className="primary-button">
              See what I qualify for →
            </Link>
            <Link href="/glossary" className="secondary-button">
              Back to glossary
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
