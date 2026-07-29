"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitLead, utmsToPayload } from "@/lib/lead";
import { getStoredUtms } from "@/lib/utm";
import { getSessionMeta } from "@/lib/tracker";

// ── Types ────────────────────────────────────────────────────────────────────
type PropertyType = "single-family" | "2-4-unit" | "5-plus-unit" | "commercial" | "";
type PropertyUse = "long-term" | "short-term" | "fix-and-flip" | "";
type TransactionType = "purchase" | "rate-term-refi" | "cash-out-refi" | "";
type CreditRange = "760-plus" | "720-759" | "680-719" | "640-679" | "620-639" | "below-620" | "";
type Timeline = "ready-now" | "1-3-months" | "just-researching" | "";
type PropertyValue = "under-250k" | "250-500k" | "500-750k" | "750k-1m" | "1m-plus" | "";
type LoanAmount = "under-200k" | "200-400k" | "400-600k" | "600k-plus" | "";

interface DscrFormState {
  propertyType: PropertyType;
  propertyUse: PropertyUse;
  transactionType: TransactionType;
  propertyLocation: string;
  propertyValue: PropertyValue;
  monthlyRentalIncome: string;
  loanAmount: LoanAmount;
  creditRange: CreditRange;
  timeline: Timeline;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  smsConsent: boolean;
}

type FormStep = number | "disqualified";

interface LoContext {
  slug: string;
  name: string;
  nmls: string | null;
  role: string;
  phone?: string | null;
  avatar?: string | null;
}

// ── Static FAQs ──────────────────────────────────────────────────────────────
const FAQS = [
  {
    q: "Is it harder to get approved for a DSCR loan as a real estate investor?",
    a: "Not with our specialized DSCR programs! While traditional lenders focus heavily on personal income verification, DSCR (Debt Service Coverage Ratio) loans are specifically designed for real estate investors like you. We qualify you based on the rental income potential of your investment property, not your personal W-2s or tax returns. This makes the process much simpler for investors who want to grow their portfolio without the hassle of income documentation. With a 680+ credit score and 20-25% down payment, you're already in our preferred investor tier for the most competitive terms.",
  },
  {
    q: "What credit score do I need for a DSCR loan?",
    a: "With your 680+ credit score, you're well-positioned for our competitive DSCR loan rates and terms. We offer our best pricing to investors with credit scores of 680 or higher, which unlocks premium financing options with favorable rates and flexible terms. This credit tier is ideal for serious real estate investors looking to scale their portfolios efficiently. If you're above 720, you'll qualify for our absolute lowest rates. Our DSCR programs are available down to 620 credit scores, but your 680+ score puts you in the optimal range for investment property financing.",
  },
  {
    q: "What down payment is required for DSCR loans?",
    a: "For qualified investors with 680+ credit scores, we offer DSCR loans with down payments starting at 20%, which aligns perfectly with your investment strategy. This down payment range is standard for investment property financing and helps ensure strong loan performance while preserving your capital for additional deals. With 25% equity in refinance scenarios, you can access competitive rates and terms. These requirements are designed specifically for real estate investors who understand that investment properties require higher down payments than primary residences, but the rental income qualification makes it worthwhile.",
  },
  {
    q: "How long does the DSCR loan approval process take?",
    a: "Our DSCR loan process is significantly faster than traditional investment property loans because we don't require extensive income documentation. We typically close DSCR loans in 7-21 days from application to funding. Since we're qualifying based on the property's rental income potential rather than your personal financial documents, the underwriting process is streamlined. We can often provide pre-approval within 48 hours once we have your credit report and basic property information. This speed gives you a competitive advantage when making offers on investment properties, and sellers appreciate our reputation for reliable, on-time closings.",
  },
  {
    q: "Can I qualify for a DSCR loan without showing personal income?",
    a: "Absolutely! That's the primary advantage of DSCR loans for real estate investors. We qualify you based on the debt service coverage ratio — essentially whether the property's rental income can cover the mortgage payment plus taxes and insurance. With your 680+ credit score and 20-25% down payment, we don't need to see your personal W-2s, tax returns, or employment verification. This is perfect for investors who maximize tax write-offs and show reduced income on paper, self-employed business owners with complex income structures, and investors with multiple properties who exceed conventional loan limits.",
  },
];

// ── FAQ item — always open, no collapse ──────────────────────────────────────
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-6 py-5">
      <h3 className="font-bold text-brand text-base mb-3">{q}</h3>
      <p className="text-sm leading-7 text-muted">{a}</p>
    </div>
  );
}

// ── Barrett-style full-width option button ────────────────────────────────────
function Option({
  selected, onClick, children,
}: { value: string; selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg px-6 py-4 text-center text-base font-semibold transition-all duration-150 ${
        selected
          ? "bg-brand/80 text-white ring-2 ring-brand ring-offset-2"
          : "bg-brand text-white hover:bg-brand-light active:bg-brand-dark"
      }`}
    >
      {children}
    </button>
  );
}

// ── Bottom progress bar with social proof ─────────────────────────────────────
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full">
      <div className="h-2.5 w-full rounded-full bg-line overflow-hidden">
        <div
          className="h-full rounded-full bg-brand transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-center text-xs font-semibold text-green-600">
        2,931 Investors Checked Their Eligibility!
      </p>
    </div>
  );
}

// ── Stars ─────────────────────────────────────────────────────────────────────
function Stars({ count = 5 }: { count?: number }) {
  return (
    <span className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function DscrLandingPage({ lo }: { lo: LoContext }) {
  const router = useRouter();
  const TOTAL_STEPS = 9; // steps 1-9 are questions (contact = steps 10-13 combined)
  const [formStep, setFormStep] = useState<FormStep>(0); // 0 = not started / shown inline
  const [form, setForm] = useState<DscrFormState>({
    propertyType: "", propertyUse: "", transactionType: "",
    propertyLocation: "", propertyValue: "", monthlyRentalIncome: "",
    loanAmount: "", creditRange: "", timeline: "",
    firstName: "", lastName: "", email: "", phone: "", smsConsent: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof DscrFormState | "form", string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  function set<K extends keyof DscrFormState>(k: K, v: DscrFormState[K]) {
    setForm((s) => ({ ...s, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function startForm() {
    setFormStep(1);
    setTimeout(scrollToForm, 100);
  }

  function goStep(n: FormStep) {
    setFormStep(n);
    setTimeout(scrollToForm, 80);
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    const e: typeof errors = {};
    if (!form.firstName.trim()) e.firstName = "Enter your first name.";
    if (!form.lastName.trim()) e.lastName = "Enter your last name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email.";
    if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a 10-digit phone number.";
    if (!form.smsConsent) e.smsConsent = "Consent is required to continue.";
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    const utms = getStoredUtms();
    const meta = getSessionMeta();
    const result = await submitLead({
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      smsConsent: form.smsConsent,
      smsConsentText: "By submitting this form, I agree to be contacted by Harris Capital Mortgage Group, LLC (NMLS# 1918223). I consent to receive calls, texts, and emails. Message and data rates may apply. Reply STOP to opt out.",
      smsConsentTimestamp: new Date().toISOString(),
      source: "dscr-landing",
      funnelType: "dscr-purchase",
      loSlug: lo.slug,
      loName: lo.name,
      loNmls: lo.nmls,
      notes: [
        `Property Type: ${form.propertyType}`,
        `Property Use: ${form.propertyUse}`,
        `Transaction: ${form.transactionType}`,
        `Location: ${form.propertyLocation}`,
        `Property Value: ${form.propertyValue}`,
        `Monthly Rental Income: ${form.monthlyRentalIncome}`,
        `Loan Amount: ${form.loanAmount}`,
        `Credit Range: ${form.creditRange}`,
        `Timeline: ${form.timeline}`,
      ].filter((l) => !l.endsWith(": ")).join(" | "),
      goal: form.transactionType === "purchase" ? "buy" : "refinance",
      creditRange: form.creditRange,
      sessionId: meta.sessionId,
      entryPage: meta.entryPage,
      referrer: meta.referrer,
      device: meta.device,
      ...utmsToPayload(utms),
    });
    setSubmitting(false);
    if (result.success) {
      router.push(`/dscr/${lo.slug}/thank-you`);
    } else {
      setErrors({ form: result.error ?? "Submission failed. Please try again." });
    }
  }

  // ── Phone formatter ─────────────────────────────────────────────────────────
  function fmtPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  const isQuestionStep = typeof formStep === "number" && formStep >= 1 && formStep <= TOTAL_STEPS;
  const isContactStep = typeof formStep === "number" && formStep === TOTAL_STEPS + 1;
  const showForm = formStep !== 0;

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-white border-b border-line shadow-sm">
        <div className="container-shell flex items-center justify-between h-16">
          <div className="flex items-center gap-2 select-none">
            <span className="text-lg font-extrabold text-brand tracking-tight">HCMG</span>
            <span className="hidden sm:block text-xs text-muted border-l border-line pl-2">Harris Capital Mortgage Group</span>
          </div>
          <a
            href={`tel:${lo.phone ?? "7027659800"}`}
            className="text-brand font-bold text-sm hover:text-accent transition-colors"
          >
            {lo.phone ?? "(702) 765-9800"}
          </a>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative bg-brand overflow-hidden">
        {/* Faint house silhouette overlay — mirrors the Barrett reference */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,255,255,0.06),transparent)]" />
        <div className="container-shell relative py-14 lg:py-18">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Top DSCR Lender For Real Estate Investors
            </h1>
            {/* ── Credential card ── */}
            <div className="mt-8 mx-auto max-w-2xl bg-white rounded-2xl shadow-card text-left overflow-hidden">
              <div className="flex flex-col sm:flex-row items-stretch">

                {/* Left — logo + stars */}
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-5 sm:border-r border-b sm:border-b-0 border-line bg-white min-w-[140px]">
                  <div className="flex flex-col items-center">
                    <span className="text-3xl font-extrabold text-brand tracking-tight leading-none">HCMG</span>
                    <span className="text-[10px] font-bold text-muted uppercase tracking-widest mt-0.5">Financial Group</span>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map((i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>

                {/* Middle — name + checklist */}
                <div className="flex-1 px-5 py-4">
                  <p className="font-bold text-sm text-ink">Harris Capital Mortgage Group | NMLS #{lo.nmls ?? "1918223"}</p>
                  <p className="text-xs text-muted mb-3">Top Rated Private Mortgage Lender</p>
                  <ul className="space-y-1.5">
                    {[
                      "DSCR Purchase and Cash Out Options",
                      "Short / Long Term Rentals & Fix and Flips",
                      "We Offer Rates From 100+ Lenders",
                      "Same Day Approvals & Streamlined Fundings",
                      "No Tax Returns Required!",
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs text-ink">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Right — CTA + phone */}
                <div className="flex flex-col items-center justify-center gap-3 px-5 py-5 sm:border-l border-t sm:border-t-0 border-line bg-sand min-w-[150px]">
                  <button
                    onClick={startForm}
                    className="w-full rounded-xl bg-accent px-4 py-3 text-sm font-bold text-white hover:bg-accent-dark transition-colors whitespace-nowrap shadow-accent"
                  >
                    Check Eligibility
                  </button>
                  <a
                    href={`tel:${(lo.phone ?? "8554321557").replace(/\D/g, "")}`}
                    className="text-xs font-bold text-brand hover:text-accent transition-colors"
                  >
                    {lo.phone ?? "(855) 432-1557"}
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LO Trust Section ── */}
      <section className="bg-white py-12 border-b border-line">
        <div className="container-shell max-w-3xl">
          <div className="flex flex-col sm:flex-row items-center gap-8">

            {/* Photo */}
            <div className="flex-shrink-0">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-line shadow-soft bg-sand">
                {lo.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={lo.avatar}
                    alt={lo.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-brand/10">
                    <span className="text-3xl font-extrabold text-brand">
                      {lo.name.split(" ").map((n: string) => n[0]).join("")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-accent mb-1">
                Your DSCR Specialist
              </p>
              <h2 className="text-2xl font-extrabold text-ink">{lo.name}</h2>
              <p className="text-sm text-muted mt-0.5">
                {lo.role}{lo.nmls ? ` · NMLS# ${lo.nmls}` : ""}
              </p>

              {/* Stat badge */}
              <div className="mt-4 inline-flex items-center gap-2 rounded-xl bg-brand/5 border border-brand/10 px-4 py-2.5">
                <svg className="w-5 h-5 text-brand flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span className="text-sm font-bold text-brand">Closed $45M in DSCR loans in 2025</span>
              </div>

              <p className="mt-4 text-sm text-muted leading-relaxed">
                Darius specializes exclusively in investor financing — DSCR, Non-QM, and portfolio lending.
                When you submit this form, it goes directly to him. No call center. No rep rotation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why Choose Section ── */}
      <section className="bg-brand-dark py-14 lg:py-16">
        <div className="container-shell">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-center mb-10">
            Why Choose Our DSCR Investor Loans?
          </h2>
          <div className="grid sm:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              {
                icon: (
                  <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
                title: "No Tax Returns or W-2s Required",
                body: "Qualify based on rental income from the property. Perfect for the real estate investor who maximizes tax write-offs.",
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Fast, Streamlined Closings",
                body: "We move fast. Our investor loan team knows exactly what to ask for and what to ignore. You close in days, not weeks.",
              },
              {
                icon: (
                  <svg className="w-10 h-10 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
                title: "Scale Without Hitting a Ceiling",
                body: "There's no limit on your personal debt. That means you can keep buying, refinancing, and growing your portfolio.",
              },
            ].map(({ icon, title, body }) => (
              <div key={title} className="rounded-2xl bg-white/10 border border-white/10 p-6 text-center">
                <div className="flex justify-center mb-4">{icon}</div>
                <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
                <p className="text-xs text-white/70 leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Google Reviews ── */}
      <section className="bg-sand py-12 border-y border-line">
        <div className="container-shell max-w-5xl">
          <div className="text-center mb-6">
            <p className="text-sm font-semibold text-muted">Google Reviews</p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-2xl font-extrabold text-ink">4.9</span>
              <Stars />
              <span className="text-sm text-muted">(4,203)</span>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Ezroy Thompson", ago: "2 weeks ago", text: "Darius was very helpful and stuck with me through the entire process. He made sure I understood every step of my DSCR loan and got me closed faster than I expected. Highly recommend for any investor." },
              { name: "Marcus Rivera", ago: "1 month ago", text: "I've done 4 DSCR deals with Harris Capital. Darius knows this product better than anyone I've worked with. No income docs, no hassle. My properties cash flow and the process was smooth every time." },
              { name: "Tamika Johnson", ago: "3 weeks ago", text: "As a self-employed investor, traditional lenders always turned me away. Darius at HCMG got my rental property financed using only the lease agreement. Closed in 18 days. This team is incredible." },
              { name: "Robert Chen", ago: "1 month ago", text: "HCMG made my first DSCR purchase so easy. Darius walked me through the DSCR ratio, helped me understand what qualified, and delivered exactly what he promised. Already planning my next deal with him." },
            ].map(({ name, ago, text }) => (
              <div key={name} className="rounded-2xl border border-line bg-white p-4 shadow-soft">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-brand">{name.split(" ").map((n) => n[0]).join("")}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ink">{name} <span className="text-brand">✓</span></p>
                    <p className="text-xs text-muted">{ago}</p>
                  </div>
                </div>
                <Stars count={5} />
                <p className="mt-2 text-xs text-muted leading-relaxed">{text}</p>
                <button className="mt-1 text-xs text-brand font-semibold hover:underline">Read more</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Qualification Form ── */}
      <section ref={formRef} className="bg-white py-14 lg:py-16">
        <div className="container-shell max-w-lg">

          {/* Persistent heading above every state */}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-brand text-center mb-8 leading-tight">
            DSCR and Investment Property<br />Loans for Real Estate Investors
          </h2>

          {!showForm && (
            <div className="text-center">
              <p className="text-muted mb-6 text-sm">
                Check your eligibility in 2 minutes. No hard credit pull. No obligation.
              </p>
              <button onClick={startForm} className="w-full rounded-lg bg-brand px-6 py-4 text-base font-bold text-white hover:bg-brand-light transition-colors">
                Check My Eligibility →
              </button>
              <p className="mt-3 text-xs font-semibold text-green-600">2,931 Investors Checked Their Eligibility!</p>
            </div>
          )}

          {/* ── Active form steps ── */}
          {isQuestionStep && (
            <FormStepView
              step={formStep as number}
              totalSteps={TOTAL_STEPS}
              form={form}
              set={set}
              onNext={(next, selectedValue) => {
                // Credit score filter — anything below 640 is disqualified.
                // selectedValue is passed directly from the click so we never
                // read stale state from form.creditRange.
                if (formStep === 8) {
                  const val = selectedValue ?? form.creditRange;
                  if (val === "below-620" || val === "620-639") {
                    goStep("disqualified");
                    return;
                  }
                }
                goStep(next ?? (formStep as number) + 1);
              }}
              onBack={() => goStep(Math.max(1, (formStep as number) - 1))}
            />
          )}

          {isContactStep && (
            <ContactStepView
              form={form}
              set={set}
              errors={errors}
              submitting={submitting}
              onBack={() => goStep(TOTAL_STEPS)}
              onSubmit={handleSubmit}
              loName={lo.name}
            />
          )}

          {formStep === "disqualified" && (
            <div className="text-center py-4">
              {/* Green checkmark — matches Barrett screenshot exactly */}
              <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-base font-bold text-ink mb-8 max-w-sm mx-auto leading-snug">
                It Looks Like Your Score Does Not Meet Our<br />Minimum Requirement At This Time.
              </p>
              <button
                onClick={() => { setForm((s) => ({ ...s, creditRange: "" })); goStep(8); }}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-bold text-white hover:bg-brand transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                CLOSE
              </button>
            </div>
          )}

          {/* Global form error */}
          {errors.form && (
            <p className="mt-4 text-center text-sm text-red-600">{errors.form}</p>
          )}
        </div>
      </section>

      {/* ── FAQs ── */}
      <section className="bg-sand py-14 lg:py-16 border-t border-line">
        <div className="container-shell max-w-3xl">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {FAQS.map((faq) => <FaqItem key={faq.q} {...faq} />)}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-brand py-12">
        <div className="container-shell text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">Ready to Qualify on Rental Income?</h2>
          <p className="text-white/75 text-sm mb-6">No tax returns. No W-2s. Close in as little as 7 days.</p>
          <button onClick={startForm} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-8 py-4 text-base font-bold text-white hover:bg-accent-dark transition-colors">
            Check My Eligibility →
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-line py-8">
        <div className="container-shell text-center">
          <p className="text-xs text-muted leading-relaxed max-w-3xl mx-auto">
            Harris Capital Mortgage Group, LLC · NMLS# 1918223 ·{" "}
            <strong className="text-ink">{lo.name}</strong>{lo.nmls ? ` · NMLS# ${lo.nmls}` : ""} ·
            Licensed in FL, TX, GA, NV, CO, VA, DC, MD, CA, MS.
            This is not a commitment to lend. Rates and terms subject to change. Program availability varies by state.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-xs">
            <Link href="/privacy" className="text-muted hover:text-ink">Privacy Policy</Link>
            <Link href="/terms" className="text-muted hover:text-ink">Terms</Link>
            <Link href="/licensing" className="text-muted hover:text-ink">Licensing</Link>
            <Link href="/legal-disclaimer" className="text-muted hover:text-ink">Legal</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Form Steps Component — Barrett style
// ─────────────────────────────────────────────────────────────────────────────

interface StepProps {
  step: number;
  totalSteps: number;
  form: DscrFormState;
  set: <K extends keyof DscrFormState>(k: K, v: DscrFormState[K]) => void;
  onNext: (next?: number, selectedValue?: string) => void;
  onBack: () => void;
}

// Slider value → display label
function fmtPrice(v: number) {
  if (v >= 2000000) return "$2,000,000+";
  return `$${(v / 1000).toFixed(0)}k`.replace("000k", "M");
}

function FormStepView({ step, totalSteps, form, set, onNext, onBack }: StepProps) {
  const isFirst = step === 1;

  // Local slider state (string → number for display)
  const priceVal = form.propertyValue
    ? (form.propertyValue === "1m-plus" ? 2000000
      : form.propertyValue === "750k-1m" ? 875000
      : form.propertyValue === "500-750k" ? 625000
      : form.propertyValue === "250-500k" ? 375000
      : 200000)
    : 150000;

  function canProceed(): boolean {
    switch (step) {
      case 1: return !!form.propertyType;
      case 2: return !!form.propertyUse;
      case 3: return !!form.transactionType;
      case 4: return form.propertyLocation.trim().length >= 2;
      case 5: return !!form.propertyValue;
      case 6: return form.monthlyRentalIncome.trim().length >= 1;
      case 7: return !!form.loanAmount;
      case 8: return !!form.creditRange;
      case 9: return !!form.timeline;
      default: return true;
    }
  }

  // Slider → PropertyValue bucket
  function sliderToPropertyValue(n: number): PropertyValue {
    if (n >= 2000000) return "1m-plus";
    if (n >= 750000)  return "750k-1m";
    if (n >= 500000)  return "500-750k";
    if (n >= 250000)  return "250-500k";
    return "under-250k";
  }

  return (
    <div className="text-center">

      {/* Question */}
      <div className="mb-6">
        {step === 1 && <p className="text-base font-bold text-ink">What are you looking to do?</p>}
        {step === 2 && <p className="text-base font-bold text-ink">How will this property be used?</p>}
        {step === 3 && <p className="text-base font-bold text-ink">What are you looking to do?</p>}
        {step === 4 && <p className="text-base font-bold text-ink">Where is the property located?</p>}
        {step === 5 && (
          <>
            <p className="text-base font-bold text-ink">What&apos;s the estimated purchase price?</p>
          </>
        )}
        {step === 6 && (
          <>
            <p className="text-base font-bold text-ink">Please estimate your down payment</p>
            <p className="text-sm font-semibold text-green-600">(Minimum 20% for purchases)</p>
          </>
        )}
        {step === 7 && <p className="text-base font-bold text-ink">Estimated monthly rental income?</p>}
        {step === 8 && (
          <>
            <p className="text-base font-bold text-ink">
              What&apos;s the highest score between you, your spouse<br className="hidden sm:block" /> or your business partner if applicable.
            </p>
            <p className="text-sm font-semibold text-green-600">(Minimum 640 Required)</p>
          </>
        )}
        {step === 9 && <p className="text-base font-bold text-ink">When are you looking to move forward?</p>}
      </div>

      {/* Options */}
      <div className="space-y-3 max-w-sm mx-auto">

        {step === 1 && ([
          ["single-family", "Single Family Home"],
          ["2-4-unit", "2–4 Unit (Small Multifamily)"],
          ["5-plus-unit", "5+ Unit"],
          ["commercial", "Commercial"],
        ] as [PropertyType, string][]).map(([v, label]) => (
          <Option key={v} value={v} selected={form.propertyType === v} onClick={() => { set("propertyType", v); onNext(); }}>{label}</Option>
        ))}

        {step === 2 && ([
          ["long-term", "Long-Term Rental"],
          ["short-term", "Short-Term / Airbnb"],
          ["fix-and-flip", "Fix and Hold/Flip"],
        ] as [PropertyUse, string][]).map(([v, label]) => (
          <Option key={v} value={v} selected={form.propertyUse === v} onClick={() => { set("propertyUse", v); onNext(); }}>{label}</Option>
        ))}

        {step === 3 && ([
          ["purchase", "Purchase"],
          ["fix-and-flip", "Fix and Hold/Flip"],
          ["cash-out-refi", "Cash Out Refinance"],
        ] as [TransactionType, string][]).map(([v, label]) => (
          <Option key={v} value={v} selected={form.transactionType === v} onClick={() => { set("transactionType", v); onNext(); }}>{label}</Option>
        ))}

        {step === 4 && (
          <div className="text-left">
            <input
              className="input-base text-center"
              placeholder="State, city, or zip code"
              value={form.propertyLocation}
              onChange={(e) => set("propertyLocation", e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && canProceed()) onNext(); }}
              autoFocus
            />
          </div>
        )}

        {/* Step 5 — price slider */}
        {step === 5 && (
          <div className="px-2">
            <p className="text-2xl font-extrabold text-ink mb-4">{fmtPrice(priceVal)}</p>
            <input
              type="range"
              min={150000}
              max={2000000}
              step={50000}
              value={priceVal}
              onChange={(e) => set("propertyValue", sliderToPropertyValue(Number(e.target.value)))}
              className="range-brand w-full"
            />
            <div className="flex justify-between text-xs text-muted font-semibold mt-1">
              <span>$150,000</span><span>$2,000,000+</span>
            </div>
          </div>
        )}

        {/* Step 6 — down payment slider (reusing monthlyRentalIncome field for now, label only) */}
        {step === 6 && (
          <div className="px-2">
            <p className="text-2xl font-extrabold text-ink mb-4">
              {form.monthlyRentalIncome ? `${form.monthlyRentalIncome}%` : "20%"}
            </p>
            <input
              type="range"
              min={20}
              max={50}
              step={5}
              value={form.monthlyRentalIncome ? Number(form.monthlyRentalIncome) : 20}
              onChange={(e) => set("monthlyRentalIncome", e.target.value)}
              className="range-brand w-full"
            />
            <div className="flex justify-between text-xs text-muted font-semibold mt-1">
              <span>20%</span><span>+50%</span>
            </div>
          </div>
        )}

        {step === 7 && ([
          ["under-1500",  "Under $1,500 / mo"],
          ["1500-2500",   "$1,500 – $2,500 / mo"],
          ["2500-4000",   "$2,500 – $4,000 / mo"],
          ["4000-plus",   "$4,000+ / mo"],
        ] as [string, string][]).map(([v, label]) => (
          <Option key={v} value={v} selected={form.monthlyRentalIncome === v} onClick={() => { set("monthlyRentalIncome", v); onNext(); }}>{label}</Option>
        ))}

        {/* Step 8 — credit score. Value passed to onNext so parent checks it
            before React re-renders (avoids stale closure on form.creditRange). */}
        {step === 8 && ([
          ["760-plus",  "720+"],
          ["680-719",   "680-719"],
          ["640-679",   "640-679"],
          ["620-639",   "620-639"],
          ["below-620", "619 or less"],
        ] as [CreditRange, string][]).map(([v, label]) => (
          <Option key={v} value={v} selected={form.creditRange === v} onClick={() => { set("creditRange", v); onNext(undefined, v); }}>{label}</Option>
        ))}

        {step === 9 && ([
          ["ready-now",        "Ready Now"],
          ["1-3-months",       "1–3 Months"],
          ["just-researching", "Just Researching"],
        ] as [Timeline, string][]).map(([v, label]) => (
          <Option key={v} value={v} selected={form.timeline === v} onClick={() => { set("timeline", v); onNext(totalSteps + 1); }}>{label}</Option>
        ))}

      </div>

      {/* Next button for slider/text steps */}
      {(step === 4 || step === 5 || step === 6) && (
        <button
          onClick={() => canProceed() && onNext()}
          disabled={!canProceed()}
          className="mt-6 w-full max-w-sm mx-auto block rounded-lg bg-brand px-6 py-4 text-base font-bold text-white hover:bg-brand-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
        </button>
      )}

      {/* Back link */}
      {!isFirst && (
        <div className="mt-4">
          <button onClick={onBack} className="text-sm font-semibold text-muted hover:text-ink transition-colors">
            ← Back
          </button>
        </div>
      )}

      {/* Progress bar at bottom */}
      <div className="mt-8">
        <ProgressBar step={step} total={totalSteps + 1} />
      </div>
    </div>
  );
}

// ── Step shell wrapper — kept for ContactStepView compatibility ───────────────
function StepShell({
  sub, children,
}: { label?: string; sub: string; highlight?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-base font-bold text-ink mb-4 leading-snug text-center">{sub}</p>
      {children}
    </div>
  );
}

// ── Contact step ──────────────────────────────────────────────────────────────
function ContactStepView({
  form, set, errors, submitting, onBack, onSubmit, loName,
}: {
  form: DscrFormState;
  set: <K extends keyof DscrFormState>(k: K, v: DscrFormState[K]) => void;
  errors: Partial<Record<keyof DscrFormState | "form", string>>;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
  loName: string;
}) {
  function fmtPhone(v: string) {
    const d = v.replace(/\D/g, "").slice(0, 10);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  }

  return (
    <div className="text-center">
      <p className="text-base font-bold text-ink mb-6">
        Where should {loName.split(" ")[0]} send your DSCR eligibility results?
      </p>

      <div className="space-y-3 max-w-sm mx-auto text-left">
        <div>
          <input className={`input-base ${errors.firstName ? "border-red-400" : ""}`} placeholder="First Name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
          {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
        </div>
        <div>
          <input className={`input-base ${errors.lastName ? "border-red-400" : ""}`} placeholder="Last Name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
          {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
        </div>
        <div>
          <input className={`input-base ${errors.email ? "border-red-400" : ""}`} type="email" placeholder="Email Address" value={form.email} onChange={(e) => set("email", e.target.value)} />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <input className={`input-base ${errors.phone ? "border-red-400" : ""}`} type="tel" placeholder="Phone Number" value={form.phone} onChange={(e) => set("phone", fmtPhone(e.target.value))} />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>
      </div>

      <div className={`mt-4 max-w-sm mx-auto flex items-start gap-3 rounded-xl border p-3 text-left ${errors.smsConsent ? "border-red-300 bg-red-50" : "border-line bg-sand"}`}>
        <input
          id="sms-consent"
          type="checkbox"
          className="mt-0.5 h-4 w-4 cursor-pointer accent-brand"
          checked={form.smsConsent}
          onChange={(e) => set("smsConsent", e.target.checked)}
        />
        <label htmlFor="sms-consent" className="text-xs leading-relaxed text-muted cursor-pointer">
          By submitting this form, I agree to be contacted by Harris Capital Mortgage Group, LLC (NMLS# 1918223)
          regarding my mortgage inquiry. I consent to receive calls, texts, and emails. Message and data rates
          may apply. Reply STOP to opt out of texts at any time.
        </label>
      </div>
      {errors.smsConsent && <p className="mt-1 text-xs text-red-500 text-center">{errors.smsConsent}</p>}

      <div className="mt-5 max-w-sm mx-auto">
        <button
          onClick={onSubmit}
          disabled={submitting}
          className="w-full rounded-lg bg-brand px-6 py-4 text-base font-bold text-white hover:bg-brand-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Submitting…" : "Get My DSCR Results →"}
        </button>
      </div>

      <div className="mt-4">
        <button onClick={onBack} className="text-sm font-semibold text-muted hover:text-ink transition-colors">
          ← Back
        </button>
      </div>

      <div className="mt-8">
        <ProgressBar step={10} total={10} />
      </div>
    </div>
  );
}
