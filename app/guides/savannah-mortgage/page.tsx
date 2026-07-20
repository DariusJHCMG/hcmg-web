import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Savannah, GA Mortgage Guide: Loan Options & 2026 Limits | HCMG",
  description: "A practical Savannah mortgage guide covering conventional, FHA, VA, USDA, first-time buyer options, costs, and official 2026 national loan limits.",
  alternates: { canonical: "https://hcmgloans.com/guides/savannah-mortgage" },
};

const options = [
  ["Conventional", "Flexible primary-home, second-home, and investment-property financing with mortgage insurance generally required below 20% down."],
  ["FHA", "Government-insured financing that may offer flexible credit and down-payment requirements, subject to county loan limits."],
  ["VA", "Eligible service members, veterans, and surviving spouses may qualify for no-down-payment financing and no monthly mortgage insurance."],
  ["USDA", "Eligible properties outside dense urban areas may qualify for zero-down rural housing financing, subject to household income and property rules."],
];

export default function SavannahMortgageGuide() {
  return <main><NavBar /><section className="section-pad bg-white"><div className="container-shell max-w-5xl"><p className="text-xs font-black uppercase tracking-[.18em] text-accent">Savannah home financing</p><h1 className="mt-3 max-w-4xl text-4xl font-extrabold tracking-tight text-ink lg:text-6xl">A practical mortgage guide for Savannah, Georgia</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-muted">Compare financing paths, plan for ownership costs, and understand which details a lender will verify for a Savannah-area property.</p><div className="mt-8 flex flex-wrap gap-3"><Link className="primary-button" href="/get-started?source=seo&seoSlug=savannah-mortgage-guide">Get a personalized estimate →</Link><Link className="secondary-button" href="/areas-we-serve/georgia">Georgia lending overview</Link></div></div></section>
    <section className="section-pad border-y border-line bg-sand"><div className="container-shell grid max-w-5xl gap-5 md:grid-cols-2">{options.map(([name,body])=><article className="rounded-3xl border border-line bg-white p-6" key={name}><h2 className="text-xl font-extrabold text-ink">{name} loans</h2><p className="mt-3 text-sm leading-7 text-muted">{body}</p></article>)}</div></section>
    <section className="section-pad bg-white"><div className="container-shell grid max-w-5xl gap-10 lg:grid-cols-[1.3fr_.7fr]"><article><h2 className="text-3xl font-extrabold text-ink">What to budget beyond principal and interest</h2><p className="mt-5 leading-8 text-muted">A useful Savannah estimate includes property taxes, homeowners insurance, any flood insurance required for the property, homeowners association dues, mortgage insurance or program fees, and closing costs. Coastal and flood-zone considerations are property-specific, so confirm insurance and flood information before relying on a payment estimate.</p><h2 className="mt-10 text-3xl font-extrabold text-ink">2026 national limit context</h2><p className="mt-5 leading-8 text-muted">The 2026 baseline conforming limit for a one-unit property is $832,750. HUD’s 2026 FHA one-unit range is $541,287 to $1,249,125; the exact FHA limit depends on the county. Verify the property county and current program rules with official sources and your loan officer.</p></article><aside className="rounded-3xl border border-line bg-sand p-6"><h2 className="font-extrabold text-ink">Useful official sources</h2><ul className="mt-4 space-y-4 text-sm font-bold text-accent"><li><a href="https://www.hud.gov/LENDERS" target="_blank" rel="noreferrer">HUD FHA lender resources ↗</a></li><li><a href="https://www.fhfa.gov/news/news-release/fhfa-announces-conforming-loan-limit-values-for-2026" target="_blank" rel="noreferrer">FHFA 2026 limits ↗</a></li></ul><p className="mt-6 border-t border-line pt-5 text-xs leading-6 text-muted">Reviewed July 20, 2026. Educational information only. Programs, limits, rates, and eligibility may change.</p></aside></div></section><Footer /></main>;
}
