import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { getGlossaryByLetter, glossaryTerms } from "@/data/glossary";

export const metadata: Metadata = {
  title: "Mortgage Glossary — Plain-English Definitions of Home Loan Terms | HCMG",
  description: `Browse ${glossaryTerms.length}+ mortgage terms explained in plain English by Harris Capital Mortgage Group. Understand ARMs, APR, escrow, PITI, jumbo loans, and every other term you'll encounter when financing a home.`,
  alternates: { canonical: "https://getorangekey.com/glossary" },
  openGraph: {
    title: "Mortgage Glossary | HCMG",
    description: `${glossaryTerms.length}+ home loan terms defined in plain English. The complete reference for buyers, refinancers, and curious homeowners.`,
    url: "https://getorangekey.com/glossary",
    images: ["/hcmg-social-square.svg"],
  },
};

const glossarySchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: "HCMG Mortgage Glossary",
  description: `A comprehensive plain-English glossary of mortgage terms, definitions, and concepts maintained by Harris Capital Mortgage Group.`,
  url: "https://getorangekey.com/glossary",
  hasDefinedTerm: glossaryTerms.map((t) => ({
    "@type": "DefinedTerm",
    name: t.term,
    description: t.shortDef,
    url: `https://getorangekey.com/glossary/${t.slug}`,
    inDefinedTermSet: "https://getorangekey.com/glossary",
  })),
};

export default function GlossaryIndexPage() {
  const groups = getGlossaryByLetter();
  const letters = groups.map((g) => g.letter);

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(glossarySchema) }}
      />
      <NavBar />

      {/* Hero */}
      <section className="section-pad bg-white" style={{ paddingBottom: 32 }}>
        <div className="container-shell max-w-4xl">
          <SectionEyebrow>Mortgage Glossary</SectionEyebrow>
          <h1
            className="mt-3 font-extrabold tracking-tight text-ink"
            style={{ fontSize: "clamp(36px, 5.5vw, 60px)", lineHeight: 1.05 }}
          >
            The mortgage terms you&apos;ll actually run into, defined in plain English.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Buying or refinancing a home means wading through unfamiliar vocabulary. This glossary covers{" "}
            {glossaryTerms.length}+ of the terms HCMG&apos;s loan officers explain most often — written for
            humans, with the context you need to actually decide.
          </p>
        </div>
      </section>

      {/* A-Z nav */}
      <section className="bg-sand">
        <div className="container-shell max-w-5xl py-6">
          <div className="flex flex-wrap justify-center gap-2">
            {letters.map((l) => (
              <a
                key={l}
                href={`#letter-${l}`}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-sm font-bold text-ink transition hover:border-accent hover:bg-accent/5 hover:text-accent"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Groups */}
      <section className="section-pad bg-white">
        <div className="container-shell max-w-4xl space-y-14">
          {groups.map((group) => (
            <div key={group.letter} id={`letter-${group.letter}`} className="scroll-mt-28">
              <div className="mb-6 flex items-baseline gap-4 border-b border-line pb-3">
                <span
                  className="font-extrabold tracking-tight text-accent"
                  style={{ fontSize: 56, lineHeight: 1 }}
                >
                  {group.letter}
                </span>
                <span className="text-sm font-semibold uppercase tracking-[0.16em] text-muted">
                  {group.terms.length} {group.terms.length === 1 ? "term" : "terms"}
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {group.terms.map((t) => (
                  <Link
                    key={t.slug}
                    href={`/glossary/${t.slug}`}
                    className="group block rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-soft"
                  >
                    <div className="mb-2 text-base font-bold text-ink group-hover:text-accent transition-colors">
                      {t.term}
                    </div>
                    <p className="text-sm leading-6 text-muted">{t.shortDef}</p>
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
            Still have questions about a mortgage term?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-muted">
            Talk to a licensed HCMG loan officer who can walk you through any of these terms as they apply to
            your specific situation.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/get-started" className="primary-button">
              Get my estimate →
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
