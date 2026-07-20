import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { loanProducts, getLoanProduct } from "@/data/loan-products";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { Calculator } from "@/components/sections/Calculator";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export function generateStaticParams() { return loanProducts.map(p => ({ slug:p.slug })); }

export async function generateMetadata({ params }: { params:Promise<{slug:string}> }): Promise<Metadata> {
  const product=getLoanProduct((await params).slug); if(!product) return {};
  return { title:product.title, description:product.description, alternates:{canonical:`https://hcmgloans.com/loans/${product.slug}`}, openGraph:{title:product.title,description:product.description,url:`https://hcmgloans.com/loans/${product.slug}`} };
}

export default async function LoanProductPage({ params }: { params:Promise<{slug:string}> }) {
  const product=getLoanProduct((await params).slug); if(!product) notFound();
  const schema={"@context":"https://schema.org","@type":"FinancialProduct",name:product.name,description:product.description,provider:{"@type":"MortgageLender",name:"Harris Capital Mortgage Group, LLC",identifier:"NMLS# 1918223"}};
  const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:product.faqs.map(f=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
  return <main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema)}}/><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(faqSchema)}}/><NavBar/>
    <section className="section-pad bg-white"><div className="container-shell max-w-5xl"><SectionEyebrow>{product.eyebrow}</SectionEyebrow><h1 className="mt-3 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight text-ink lg:text-6xl">{product.title}</h1><p className="mt-6 max-w-3xl text-lg leading-8 text-muted">{product.summary}</p><div className="mt-8 flex flex-wrap gap-3"><Link href={`/get-started?source=product&funnel=${product.slug}`} className="primary-button">Get a personalized estimate →</Link><Link href="/find-a-loan-officer" className="secondary-button">Talk to a loan officer</Link></div></div></section>
    <section className="border-y border-line bg-sand py-10"><div className="container-shell grid max-w-5xl gap-4 sm:grid-cols-3">{product.facts.map(f=><div key={f.label} className="rounded-2xl border border-line bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-muted">{f.label}</p><p className="mt-2 text-xl font-extrabold text-ink">{f.value}</p></div>)}</div></section>
    <section className="section-pad bg-white"><div className="container-shell grid max-w-5xl gap-10 lg:grid-cols-[1.4fr_.6fr]"><div className="space-y-10">{product.sections.map(s=><article key={s.heading}><h2 className="text-2xl font-extrabold text-ink">{s.heading}</h2><p className="mt-4 text-base leading-8 text-muted">{s.body}</p></article>)}</div><aside className="rounded-3xl border border-line bg-sand p-6"><p className="text-xs font-black uppercase tracking-wider text-accent">Often considered by</p><ul className="mt-4 space-y-3">{product.bestFor.map(x=><li key={x} className="flex gap-3 text-sm font-semibold text-ink"><span className="text-accent">✓</span>{x}</li>)}</ul><p className="mt-6 border-t border-line pt-5 text-xs leading-6 text-muted">Reviewed July 20, 2026. Program availability and qualification vary. This is educational information, not a commitment to lend.</p></aside></div></section>
    {product.slug==="fha"&&<section className="bg-sand py-8"><div className="container-shell max-w-5xl rounded-2xl border border-line bg-white p-6 text-sm leading-7 text-muted"><strong className="text-ink">Official 2026 limits:</strong> HUD sets the FHA one-unit floor at $541,287 and ceiling at $1,249,125. County limits vary. The FHFA baseline conforming limit is $832,750. <a className="font-bold text-accent underline" href="https://www.hud.gov/LENDERS" target="_blank" rel="noreferrer">Verify with HUD</a>.</div></section>}
    <Calculator heading={`${product.name} payment estimate`} subheading="Adjust the assumptions, compare the payment components, and connect with a licensed loan officer when you are ready."/>
    <section className="section-pad bg-sand"><div className="container-shell max-w-4xl"><h2 className="text-3xl font-extrabold text-ink">Common questions</h2><div className="mt-6 space-y-4">{product.faqs.map(f=><div key={f.q} className="rounded-2xl border border-line bg-white p-6"><h3 className="font-bold text-ink">{f.q}</h3><p className="mt-3 text-sm leading-7 text-muted">{f.a}</p></div>)}</div></div></section><Footer/></main>;
}
