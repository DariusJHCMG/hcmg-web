import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Mortgage Partnerships for Real Estate Agents | HCMG",
  description:
    "Give your buyers a clear, responsive path to financing with Harris Capital Mortgage Group. Built for real estate agents who value speed, communication, and reliable closings.",
  alternates: { canonical: "https://hcmgloans.com/agents" },
};

const BENEFITS = [
  {
    icon: "bolt",
    title: "Fast, useful answers",
    body: "Help buyers understand their options early, with a lending team that moves quickly when the right home appears.",
  },
  {
    icon: "chat",
    title: "Communication you can count on",
    body: "Get clear updates from application through closing, so you and your clients always know what comes next.",
  },
  {
    icon: "key",
    title: "Closings built around the client",
    body: "Every file gets practical guidance, careful coordination, and a team focused on reaching the closing table.",
  },
];

const STEPS = [
  ["01", "Connect us", "Introduce your buyer or send them to our secure online start page."],
  ["02", "We build the plan", "A licensed loan officer reviews goals, eligibility, and available loan options."],
  ["03", "You stay informed", "We coordinate milestones and keep the transaction moving toward closing."],
];

function FeatureIcon({ name }: { name: string }) {
  if (name === "chat") return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5 16.5 3.5 20l4.2-1.8A9 9 0 1 0 5 16.5Z"/><path d="M8 10h8M8 14h5"/>
    </svg>
  );
  if (name === "key") return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="8" cy="12" r="4"/><path d="m12 12 8-8m-3 3 3 3m-6 0 2 2"/>
    </svg>
  );
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/>
    </svg>
  );
}

export default function AgentsPage() {
  return (
    <main>
      <NavBar />

      <section className="relative overflow-hidden bg-brand-dark text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,rgba(243,112,33,0.42),transparent_34%),radial-gradient(circle_at_15%_85%,rgba(255,152,71,0.16),transparent_30%)]" />
        <div className="container-shell relative grid min-h-[650px] items-center gap-12 py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
          <div className="max-w-3xl">
            <p className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-accent-light">For real estate agents</p>
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Financing that keeps your deals moving.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
              Give your buyers a responsive mortgage partner, clear next steps, and a confident path from pre-qualification to closing.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/contact" className="primary-button min-w-52">Start a partnership <span aria-hidden="true">→</span></Link>
              <a href="tel:+18884413930" className="outline-white-button min-w-52">Call 888-441-3930</a>
            </div>
            <p className="mt-5 text-xs leading-5 text-white/50">Harris Capital Mortgage Group, LLC · NMLS# 1918223</p>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-8 rounded-full bg-accent/20 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-8 shadow-2xl backdrop-blur">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-light">The HCMG partner promise</p>
              <p className="mt-4 text-3xl font-bold leading-tight">One team. Clear updates. A smoother closing.</p>
              <div className="mt-8 space-y-4">
                {["Responsive loan guidance", "Options for a wide range of buyers", "Consistent milestone communication"].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-4 text-sm font-semibold">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white">✓</span>{item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-shell">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Why partner with HCMG?</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">A lending experience that reflects well on you.</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {BENEFITS.map((benefit) => (
              <article key={benefit.title} className="rounded-3xl border border-line bg-sand p-7 transition hover:-translate-y-1 hover:shadow-card">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent"><FeatureIcon name={benefit.icon} /></div>
                <h3 className="mt-6 text-xl font-extrabold text-ink">{benefit.title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted">{benefit.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-line bg-sand">
        <div className="container-shell grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">More ways to say yes</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">Help more buyers compete with confidence.</h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-muted">
              Every buyer is different. We take time to understand the full picture and identify financing paths that fit their goals—without losing sight of the contract timeline.
            </p>
            <Link href="/compare-loans" className="secondary-button mt-7">Explore loan options <span aria-hidden="true">→</span></Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[["10 + DC", "licensed markets"], ["1 team", "from intro to close"], ["Clear", "milestone updates"], ["Secure", "online start"]].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-line bg-white p-6 shadow-soft">
                <p className="text-2xl font-extrabold text-ink">{value}</p><p className="mt-2 text-sm text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container-shell">
          <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Simple by design</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">A clean handoff. A connected process.</h2>
              <p className="mt-5 text-base leading-8 text-muted">Bring us into the conversation at any stage. We’ll meet the buyer where they are and help everyone see the road ahead.</p>
            </div>
            <ol className="space-y-4">
              {STEPS.map(([number, title, body]) => (
                <li key={number} className="grid gap-4 rounded-3xl border border-line bg-sand p-6 sm:grid-cols-[56px_1fr]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand text-sm font-extrabold text-white">{number}</span>
                  <div><h3 className="font-extrabold text-ink">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{body}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="bg-brand px-5 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-light">Let’s work together</p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight lg:text-5xl">Ready to give your buyers a better lending experience?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70">Tell us about your business and the clients you serve. Our team will follow up to start the conversation.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link href="/contact" className="primary-button">Talk with our team <span aria-hidden="true">→</span></Link>
            <a href="mailto:info@hcmgloans.com" className="outline-white-button">Email HCMG</a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
