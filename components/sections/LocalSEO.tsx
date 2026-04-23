import Link from "next/link";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";
import { featuredCities } from "@/data/seo-pages";

export function LocalSEO() {
  return (
    <section className="section-pad bg-white">
      <div className="container-shell grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <SectionEyebrow>Local Expertise</SectionEyebrow>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink lg:text-5xl">
            Serving buyers across 20+ markets
          </h2>
          <p className="mt-5 text-lg leading-8 text-muted">
            Harris Capital Mortgage Group is licensed in Florida, Texas, Georgia, Nevada, Colorado, Virginia,
            Washington DC, and Maryland. Find your city below.
          </p>
          <Link href={`/seo/${featuredCities[0].slug}`} className="primary-button mt-8 inline-flex">
            See all markets →
          </Link>
        </div>

        <div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {featuredCities.map((city) => (
              <Link
                key={city.slug}
                href={`/seo/${city.slug}`}
                className="rounded-2xl border border-line bg-white px-4 py-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-brand hover:shadow-soft"
              >
                <div className="text-sm font-bold text-ink">{city.city}</div>
                <div className="mt-0.5 text-xs text-muted">{city.state} · {city.loanType}</div>
              </Link>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Link href={`/seo/${featuredCities[0].slug}`} className="text-sm font-semibold text-brand hover:underline">
              View all 100 local pages →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
