import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { loanProducts } from "@/data/loan-products";

export const metadata: Metadata = {
  title: "Compare Mortgage Loan Types | FHA, VA, Conventional & More | HCMG",
  description: "Compare common mortgage options, typical strengths, and borrower fit before discussing your goals with a licensed HCMG loan officer.",
  alternates: { canonical: "https://hcmgloans.com/compare-loans" },
};

export default function CompareLoansPage() {
  return <main><NavBar />
    <section className="section-pad bg-white"><div className="container-shell max-w-5xl">
      <p className="text-xs font-black uppercase tracking-[.18em] text-accent">Mortgage comparison guide</p>
      <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink lg:text-6xl">Compare mortgage loan options</h1>
      <p className="mt-6 max-w-3xl text-lg leading-8 text-muted">The best program depends on the property, occupancy, down payment, credit profile, service history, location, and long-term plan. Use this guide as a starting point—not a rate quote or approval.</p>
    </div></section>
    <section className="section-pad border-y border-line bg-sand"><div className="container-shell grid max-w-6xl gap-5 md:grid-cols-2 lg:grid-cols-3">
      {loanProducts.map(product => <article key={product.slug} className="flex flex-col rounded-3xl border border-line bg-white p-6">
        <h2 className="text-xl font-extrabold text-ink">{product.name}</h2><p className="mt-3 flex-1 text-sm leading-7 text-muted">{product.summary}</p>
        <p className="mt-5 text-xs font-black uppercase tracking-wider text-accent">May fit</p><p className="mt-2 text-sm font-semibold text-ink">{product.bestFor[0]}</p>
        <Link href={`/loans/${product.slug}`} className="mt-5 font-bold text-accent">Explore {product.name} →</Link>
      </article>)}
    </div></section>
    <section className="section-pad bg-white"><div className="container-shell max-w-4xl rounded-3xl bg-ink p-8 text-white lg:p-12"><h2 className="text-3xl font-extrabold">Compare the numbers for your situation</h2><p className="mt-4 max-w-2xl leading-7 text-white/75">A licensed loan officer can compare estimated payment, cash to close, mortgage insurance, and eligibility using the same scenario.</p><Link href="/get-started?source=product&funnel=compare-loans" className="primary-button mt-7 inline-flex">Start your comparison →</Link></div></section>
    <Footer /></main>;
}
