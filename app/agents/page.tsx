import type { Metadata } from "next";
import Link from "next/link";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { AgentFunnelButton } from "@/components/agents/AgentFunnels";

export const metadata: Metadata = {
  title: "Mortgage Partnerships for Real Estate Agents | HCMG",
  description:
    "Give your buyers a clear, responsive path to financing with Harris Capital Mortgage Group. Built for real estate agents who value speed, communication, and reliable closings.",
  alternates: { canonical: "https://hcmgloans.com/agents" },
};

const BENEFITS = [
  {
    icon: "bolt",
    title: "Lightning-fast underwriting",
    body: "Direct communication and a focused underwriting process help eligible, complete files move without unnecessary delays.",
  },
  {
    icon: "key",
    title: "Close in as little as 10 days",
    body: "When the borrower, property, documentation, and program qualify, our team can work toward an accelerated closing timeline.",
  },
  {
    icon: "chat",
    title: "Pre-approvals in as little as 1 hour",
    body: "Qualified buyers with complete information can get fast answers and a stronger starting position before they shop or write an offer.",
  },
];

const STEPS = [
  ["01", "Make the introduction", "Send a warm intro or share your co-branded page. Your buyer gets a clear, secure way to begin."],
  ["02", "We qualify and strategize", "A licensed loan officer reviews the full picture, explains the options, and builds a financing plan for the offer."],
  ["03", "We move as one team", "You receive useful milestone updates while HCMG coordinates the financing details through closing."],
];

const FAQS = [
  ["Why should I partner with HCMG?", "You get a responsive mortgage team focused on clear communication, practical financing guidance, and coordinated closings that support your client relationship."],
  ["What kinds of buyers can HCMG help?", "We work with buyers across a range of goals and financial profiles. Available programs and eligibility depend on the property, borrower, and licensed market."],
  ["How will I receive loan updates?", "Our team communicates key milestones and next steps so you can manage the transaction with fewer surprises. Specific updates remain subject to the buyer’s authorization and privacy requirements."],
  ["Does it cost anything to become an agent partner?", "There is no fee to start a partnership conversation, request a meeting, or request access to our Realtor Portal."],
  ["What is the Realtor Portal?", "The portal is HCMG’s partner workspace for approved real estate professionals. Request access and our team will confirm availability, eligibility, and onboarding details."],
  ["Where does HCMG lend?", "HCMG currently serves licensed markets across multiple states and Washington, D.C. Visit Areas We Serve for current market information, as licensing and program availability can change."],
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
              <AgentFunnelButton funnel="partnership" className="primary-button min-w-52">Start a partnership <span aria-hidden="true">→</span></AgentFunnelButton>
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

      <section className="section-pad border-t border-line bg-sand">
        <div className="container-shell">
          <div className="mx-auto max-w-2xl text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Choose your next step</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">Built for the way agents work.</h2><p className="mt-4 text-muted">Start a conversation, reserve time with our team, or request access to the partner workspace.</p></div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-3xl border border-line bg-white p-7 shadow-soft"><p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Partner</p><h3 className="mt-3 text-xl font-extrabold text-ink">Build an HCMG partnership</h3><p className="mt-3 min-h-20 text-sm leading-7 text-muted">Tell us about your market, brokerage, and the buyer experience you want to create.</p><AgentFunnelButton funnel="partnership" className="primary-button mt-6 w-full">Start a partnership →</AgentFunnelButton></div>
            <div className="rounded-3xl border border-line bg-white p-7 shadow-soft"><p className="text-xs font-bold uppercase tracking-[.16em] text-accent">Meet</p><h3 className="mt-3 text-xl font-extrabold text-ink">Schedule a conversation</h3><p className="mt-3 min-h-20 text-sm leading-7 text-muted">Share your preferred time and questions. Our team will confirm the meeting with you.</p><AgentFunnelButton funnel="meeting" className="secondary-button mt-6 w-full">Schedule a meeting →</AgentFunnelButton></div>
            <div className="rounded-3xl border border-brand/20 bg-brand p-7 text-white shadow-card"><p className="text-xs font-bold uppercase tracking-[.16em] text-accent-light">Portal</p><h3 className="mt-3 text-xl font-extrabold">Request Realtor Portal access</h3><p className="mt-3 min-h-20 text-sm leading-7 text-white/70">Ask for access to partner resources, loan milestones, and tools for your business.</p><AgentFunnelButton funnel="portal" className="outline-white-button mt-6 w-full">Request access →</AgentFunnelButton></div>
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
          <p className="mx-auto mt-6 max-w-3xl text-center text-xs leading-5 text-muted/70">Accelerated underwriting, pre-approval, and closing timelines are not guaranteed. Timing depends on complete documentation, borrower and property eligibility, appraisal and title requirements, program guidelines, and other third-party conditions.</p>
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
          <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:items-center">
            <div className="lg:sticky lg:top-36">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Simple by design</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">One introduction. One connected closing team.</h2>
              <p className="mt-5 text-base leading-8 text-muted">You keep the client relationship. We take ownership of the financing details and keep the right people informed from first conversation to keys.</p>
              <AgentFunnelButton funnel="meeting" className="secondary-button mt-7">Talk through the process →</AgentFunnelButton>
            </div>
            <ol className="relative space-y-5 before:absolute before:bottom-10 before:left-7 before:top-10 before:w-px before:bg-accent/25 sm:before:left-9">
              {STEPS.map(([number, title, body]) => (
                <li key={number} className="relative grid gap-5 rounded-3xl border border-line bg-sand p-6 shadow-sm sm:grid-cols-[64px_1fr] sm:p-7">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-sm font-extrabold text-white shadow-soft">{number}</span>
                  <div><h3 className="text-lg font-extrabold text-ink">{title}</h3><p className="mt-2 text-sm leading-7 text-muted">{body}</p></div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section-pad overflow-hidden border-y border-line bg-sand">
        <div className="container-shell grid items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Your brand + HCMG financing</p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">Give every buyer a page that looks like your partnership.</h2>
            <p className="mt-5 text-base leading-8 text-muted">Approved partners can receive a custom co-branded webpage featuring the agent, brokerage, and HCMG loan officer together—with a clear buyer call to action and trackable lead capture.</p>
            <ul className="mt-6 space-y-3 text-sm font-semibold text-ink">
              {["Your photo, brokerage, and contact information", "Your HCMG loan partner beside you", "A shareable buyer funnel with tracked inquiries"].map(item => <li key={item} className="flex items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent text-xs text-white">✓</span>{item}</li>)}
            </ul>
            <AgentFunnelButton funnel="cobrand" className="primary-button mt-8">Get yours today →</AgentFunnelButton>
          </div>

          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-accent/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-line bg-white shadow-card">
              <div className="flex items-center gap-2 border-b border-line bg-sand px-5 py-3"><span className="h-2.5 w-2.5 rounded-full bg-red-300"/><span className="h-2.5 w-2.5 rounded-full bg-amber-300"/><span className="h-2.5 w-2.5 rounded-full bg-emerald-300"/><span className="ml-3 flex-1 rounded-lg bg-white px-3 py-1 text-[10px] text-muted">hcmgloans.com/co/your-team</span></div>
              <div className="bg-brand-dark p-6 text-white sm:p-8">
                <div className="flex items-center justify-between"><div className="text-xl font-black tracking-tight">YOUR REALTY <span className="text-accent">+</span> HCMG</div><span className="rounded-full border border-white/25 px-3 py-1 text-[10px]">BUYER START</span></div>
                <div className="mt-10 grid gap-6 sm:grid-cols-[1fr_180px] sm:items-center"><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-accent-light">A better path home</p><p className="mt-2 text-3xl font-extrabold leading-tight">Your home search and financing, connected.</p><p className="mt-3 text-xs leading-5 text-white/65">Your trusted real estate and mortgage team—all in one place.</p><div className="mt-5 inline-flex rounded-xl bg-accent px-4 py-2.5 text-xs font-bold">Get pre-qualified →</div></div><div className="flex justify-center -space-x-5"><div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-white/10 text-2xl font-black">AG</div><div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white/20 bg-accent text-2xl font-black">LO</div></div></div>
              </div>
              <div className="grid grid-cols-3 gap-3 p-5 text-center text-[10px] font-bold text-ink"><div className="rounded-xl bg-sand p-3">Fast answers</div><div className="rounded-xl bg-sand p-3">Shared updates</div><div className="rounded-xl bg-sand p-3">One team</div></div>
            </div>
            <p className="mt-3 text-center text-xs text-muted/60">Illustrative partner-page preview. Final design and features may vary.</p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-line bg-white">
        <div className="container-shell max-w-4xl">
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Frequently asked questions</p><h2 className="mt-3 text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">Agent partnership FAQ</h2></div>
          <div className="mt-10 divide-y divide-line rounded-3xl border border-line bg-white px-6 shadow-soft sm:px-8">
            {FAQS.map(([question, answer]) => <details key={question} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-bold text-ink"><span>{question}</span><span className="text-xl text-accent transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl pr-8 text-sm leading-7 text-muted">{answer}</p></details>)}
          </div>
        </div>
      </section>

      <section className="bg-brand px-5 py-20 text-center text-white">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-light">Let’s work together</p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight lg:text-5xl">Ready to give your buyers a better lending experience?</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70">Tell us about your business and the clients you serve. Our team will follow up to start the conversation.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <AgentFunnelButton funnel="partnership" className="primary-button">Start a partnership <span aria-hidden="true">→</span></AgentFunnelButton>
            <AgentFunnelButton funnel="meeting" className="outline-white-button">Schedule a meeting</AgentFunnelButton>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
