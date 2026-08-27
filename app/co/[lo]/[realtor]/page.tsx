import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { FunnelFlow } from "@/components/funnel/FunnelFlow";
import { createServiceClient } from "@/lib/supabase";
import type { Profile } from "@/lib/database.types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ lo: string; realtor: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lo, realtor } = await params;
  const sb = createServiceClient();
  const { data: page } = await sb
    .from("co_branded_pages")
    .select("realtor_name, realtor_company, headline")
    .eq("lo_slug", lo)
    .eq("realtor_slug", realtor)
    .eq("is_active", true)
    .maybeSingle();

  if (!page) return {};
  const title = `${page.realtor_name} & HCMG, Get Pre-Qualified`;
  return {
    title,
    description: page.headline ?? `${page.realtor_name} at ${page.realtor_company} partners with Harris Capital Mortgage Group to help you get pre-qualified fast.`,
  };
}

function Initials({ name }: { name: string }) {
  const w = name.trim().split(/\s+/);
  return <>{((w[0]?.[0] ?? "") + (w[1]?.[0] ?? "")).toUpperCase()}</>;
}

export default async function CoBrandedPublicPage({ params }: Props) {
  const { lo: loSlug, realtor: realtorSlug } = await params;
  const sb = createServiceClient();

  const [pageRes, profileRes] = await Promise.all([
    sb.from("co_branded_pages").select("*").eq("lo_slug", loSlug).eq("realtor_slug", realtorSlug).maybeSingle(),
    sb.from("profiles").select("*").eq("lo_slug", loSlug).eq("is_active", true).maybeSingle(),
  ]);

  // NOTE: never put notFound() inside a try/catch, Next.js throws NEXT_NOT_FOUND internally
  if (!pageRes.data || !pageRes.data.is_active) notFound();
  if (!profileRes.data) notFound();

  const p    = profileRes.data as unknown as Profile;
  const page = pageRes.data as unknown as {
    id: string; lo_slug: string; realtor_slug: string;
    realtor_name: string; realtor_company: string;
    realtor_phone: string | null; realtor_email: string | null;
    realtor_license: string | null; realtor_photo_url: string | null;
    realtor_logo_url: string | null; headline: string | null;
    application_url: string | null; calendar_url: string | null;
    is_active: boolean; clicks: number;
  };

  // Increment click counter (fire-and-forget, errors ignored)
  sb.from("co_branded_pages")
    .update({ clicks: (page.clicks ?? 0) + 1 })
    .eq("id", page.id)
    .then(() => {});

  const loName      = p.full_name;
  const loRole      = p.title ?? "Loan Officer";
  const loPhoto     = p.avatar_url ?? "/team/placeholder.svg";
  const loPhone     = p.phone ?? "";
  const loNmls      = p.nmls;
  const loFirst     = loName.replace(/['"()]/g, "").split(/\s+/)[0];
  const realtorFirst = page.realtor_name.split(/\s+/)[0];

  const funnelLo = { slug: loSlug, name: loName, nmls: loNmls };

  const headline = page.headline
    ?? `Your Next Move Starts With ${realtorFirst} and ${loFirst}`;

  return (
    <div className="min-h-screen bg-white">

      {/* ── LOCKED HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-shell flex h-14 max-w-5xl items-center justify-between px-4">

          {/* Stacked avatars + names */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center -space-x-2">
              <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white flex-shrink-0 z-10 shadow-sm">
                <TeamPhoto photo={loPhoto} name={loName} aspect="1/1" className="h-full w-full" />
              </div>
              <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white flex-shrink-0 shadow-sm">
                {page.realtor_photo_url ? (
                  <img src={page.realtor_photo_url} alt={page.realtor_name} className="h-full w-full object-cover object-top" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg,#7c5cd8,#5b4bc4)" }}>
                    <Initials name={page.realtor_name} />
                  </div>
                )}
              </div>
            </div>
            {/* Show names on all screen sizes, abbreviated on mobile */}
            <span className="text-xs font-bold text-ink leading-tight">
              <span className="sm:hidden">{loFirst} &amp; {realtorFirst}</span>
              <span className="hidden sm:inline">{loFirst} · {realtorFirst} &nbsp;·&nbsp; Harris Capital Mortgage Group</span>
            </span>
          </div>

          {/* CTA */}
          <a href="#funnel"
            className="rounded-xl px-3 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 whitespace-nowrap"
            style={{ background: "var(--ok-gradient)" }}>
            Get pre-qualified →
          </a>
        </div>
      </header>

      {/* ── CO-BRAND HERO ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white pt-10 pb-10 sm:pt-16 sm:pb-14 md:pt-20 md:pb-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-hero-glow" />

        <div className="container-shell max-w-5xl px-4">

          {/* Partnership badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white px-4 py-2 shadow-soft">
              <div className="h-8 w-8 overflow-hidden rounded-full border border-line flex-shrink-0">
                <TeamPhoto photo={loPhoto} name={loName} aspect="1/1" className="h-full w-full" />
              </div>
              <span className="text-xs font-bold text-muted">partnered with</span>
              {page.realtor_photo_url ? (
                <div className="h-8 w-8 overflow-hidden rounded-full border border-line flex-shrink-0">
                  <img src={page.realtor_photo_url} alt={page.realtor_name}
                    className="h-full w-full object-cover object-top" />
                </div>
              ) : (
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                  style={{ background: "linear-gradient(135deg,#7c5cd8,#5b4bc4)" }}>
                  <Initials name={page.realtor_name} />
                </div>
              )}
            </div>
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-center font-extrabold leading-[1.1] tracking-tight text-ink"
            style={{ fontSize: "clamp(26px, 6.5vw, 58px)" }}>
            {headline}
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-center text-[15px] leading-7 text-muted px-1">
            Get an initial idea of what you may qualify for with no hard credit check or commitment. {loFirst} will then contact you personally to review your options and help you complete your application and pre-approval.
          </p>

          {/* Two-up partner cards, full-width stacked on mobile */}
          <div className="grid gap-3 sm:grid-cols-2 max-w-2xl mx-auto mb-8">

            {/* LO card */}
            <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-soft flex items-center gap-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-line shadow-soft">
                <TeamPhoto photo={loPhoto} name={loName} aspect="1/1" className="h-full w-full" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent mb-0.5">Your Loan Officer</p>
                <p className="font-extrabold text-ink leading-tight">{loName}</p>
                <p className="text-xs text-muted">{loRole} · HCMG</p>
                {loNmls && <p className="mt-0.5 text-[11px] text-muted">NMLS# {loNmls}</p>}
                {loPhone && (
                  <a href={`tel:${loPhone.replace(/[^0-9+]/g, "")}`}
                    className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-accent">
                    📞 {loPhone}
                  </a>
                )}
              </div>
            </div>

            {/* Realtor card */}
            <div className="rounded-2xl border border-line bg-white p-4 sm:p-5 shadow-soft flex items-center gap-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-line shadow-soft">
                {page.realtor_photo_url ? (
                  <img src={page.realtor_photo_url} alt={page.realtor_name}
                    className="h-full w-full object-cover object-top" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xl font-extrabold text-white"
                    style={{ background: "linear-gradient(135deg,#7c5cd8,#5b4bc4)" }}>
                    <Initials name={page.realtor_name} />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-0.5" style={{ color: "#7c5cd8" }}>Your Realtor</p>
                <p className="font-extrabold text-ink leading-tight">{page.realtor_name}</p>
                <p className="text-xs text-muted">{page.realtor_company}</p>
                {page.realtor_license && <p className="mt-0.5 text-[11px] text-muted">Lic# {page.realtor_license}</p>}
                {page.realtor_phone && (
                  <a href={`tel:${page.realtor_phone.replace(/[^0-9+]/g, "")}`}
                    className="mt-2 flex items-center gap-1.5 text-sm font-semibold" style={{ color: "#7c5cd8" }}>
                    📞 {page.realtor_phone}
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Trust pills, 2-col grid on mobile, single row on larger */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-x-6 gap-y-3 max-w-sm sm:max-w-none mx-auto">
            {["No hard credit check", "Results in 60 seconds", "No commitment required", "File goes direct to " + loFirst].map(t => (
              <div key={t} className="flex items-center gap-2 text-sm font-semibold text-muted">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-white text-xs" style={{ background: "var(--ok-gradient)" }}>✓</span>
                {t}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FUNNEL ────────────────────────────────────────────────── */}
      <section id="funnel" className="bg-sand py-12 sm:py-20 scroll-mt-16">
        <div className="container-shell max-w-3xl px-4">
          <div className="mb-6 sm:mb-8 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">Find Out What You Can Afford</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink">
              Get pre-qualified in 60 seconds.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-muted">
              Home purchase · No hard credit check · No commitment
            </p>
          </div>
          <FunnelFlow
            lo={funnelLo}
            source="co-brand"
            coBrandedPageId={page.id}
            applicationUrl={page.application_url ?? undefined}
            calendarUrl={page.calendar_url ?? undefined}
            funnelConfig={{
              goalPreset: "buy",
              steps: [2, 3, 4, 5, 6],
              overrides: {
                2: { title: "What price range are you targeting?", sub: "Give us a range and we'll build a real payment estimate." },
                3: { title: "Where does your credit fall today?", sub: "No hard pull, just a ballpark to shape your options." },
                4: { title: "What's your approximate household income?", sub: "Used only to size your buying power estimate." },
                5: { ctaLabel: "Unlock my exact rate →" },
              },
              submitLabel: "Get my personalized rate →",
            }}
          />
          <p className="mt-6 text-center text-xs leading-5 text-muted/60 px-2">
            <strong className="font-semibold text-muted">Initial estimate only.</strong> This is not a loan approval. A completed application and credit check are required for pre-approval.
          </p>
        </div>
      </section>

      {/* ── ABOUT THE PARTNERSHIP ─────────────────────────────────── */}
      <section className="bg-white py-12 sm:py-20">
        <div className="container-shell max-w-5xl px-4">
          <div className="grid gap-5 lg:grid-cols-2">

            {/* LO bio */}
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Your Mortgage Partner</p>
              <div className="mb-4 flex items-center gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-line shadow-soft">
                  <TeamPhoto photo={loPhoto} name={loName} aspect="1/1" className="h-full w-full" />
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-ink">{loName}</p>
                  <p className="text-sm text-muted">{loRole} · Harris Capital Mortgage Group</p>
                  {loNmls && <p className="text-xs text-muted">NMLS# {loNmls}</p>}
                </div>
              </div>
              <p className="text-sm leading-7 text-muted">
                {p.hero_bio ?? `${loFirst} is a licensed mortgage professional at Harris Capital Mortgage Group. HCMG has access to dozens of lenders and hundreds of loan programs, meaning ${loFirst} shops the market to find the deal that actually fits your situation.`}
              </p>
              <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
                {loPhone && (
                  <a href={`tel:${loPhone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-accent hover:text-accent transition-all shadow-soft">
                    📞 {loPhone}
                  </a>
                )}
                {p.email && (
                  <a href={`mailto:${p.email}`}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-ink hover:border-accent hover:text-accent transition-all shadow-soft">
                    ✉️ Email {loFirst}
                  </a>
                )}
              </div>
            </div>

            {/* Realtor bio */}
            <div className="rounded-2xl border border-line bg-white p-5 sm:p-6 shadow-soft">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#7c5cd8" }}>Your Real Estate Partner</p>
              <div className="mb-4 flex items-center gap-4">
                <div className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-line shadow-soft">
                  {page.realtor_photo_url ? (
                    <img src={page.realtor_photo_url} alt={page.realtor_name}
                      className="h-full w-full object-cover object-top" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xl font-extrabold text-white"
                      style={{ background: "linear-gradient(135deg,#7c5cd8,#5b4bc4)" }}>
                      <Initials name={page.realtor_name} />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-ink">{page.realtor_name}</p>
                  <p className="text-sm text-muted">{page.realtor_company}</p>
                  {page.realtor_license && <p className="text-xs text-muted">Lic# {page.realtor_license}</p>}
                </div>
              </div>
              {page.realtor_logo_url && (
                <div className="mb-4">
                  <img src={page.realtor_logo_url} alt={page.realtor_company}
                    className="h-10 w-auto max-w-[140px] object-contain" />
                </div>
              )}
              <p className="text-sm leading-7 text-muted">
                {realtorFirst} at {page.realtor_company} partners with HCMG to give their buyer clients a seamless path from offer acceptance to closing. When you work with {realtorFirst}, you get a full team behind you.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-2">
                {page.realtor_phone && (
                  <a href={`tel:${page.realtor_phone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition-all shadow-soft hover:border-[#7c5cd8] hover:text-[#7c5cd8]">
                    📞 {page.realtor_phone}
                  </a>
                )}
                {page.realtor_email && (
                  <a href={`mailto:${page.realtor_email}`}
                    className="flex items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 py-3 text-sm font-semibold text-ink transition-all shadow-soft">
                    ✉️ Email {realtorFirst}
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="bg-sand py-12 sm:py-20">
        <div className="container-shell max-w-3xl px-4">

          <div className="mb-8 sm:mb-10 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">Common Questions</p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-ink">
              Think You Need Perfect Credit or 20% Down?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-7 text-muted">
              Let&apos;s clear that up. Most homebuyers have the same questions about credit, cash, debt, and qualification. Here are the answers you need before taking your next step.
            </p>
          </div>

          <div className="divide-y divide-line rounded-2xl border border-line bg-white overflow-hidden shadow-soft">
            {[
              {
                q: "Will checking my options hurt my credit?",
                a: "No. Completing this quick questionnaire does not require a credit check. A completed application and credit check are only required later if you decide to move forward with pre-approval.",
              },
              {
                q: "Do I really need 20% down?",
                a: "Not necessarily. Different loan programs have different down-payment requirements. Some eligible buyers may qualify for low or no down-payment options.",
              },
              {
                q: "My credit isn't perfect. Should I even start?",
                a: "Yes. You do not need perfect credit to understand your options. Eligibility depends on your complete financial situation and the loan program. Starting now can help you learn what may be possible and what steps could improve your position.",
              },
              {
                q: "I have student loans, car payments, or credit-card debt. Does that automatically rule me out?",
                a: "No. Having debt does not automatically prevent you from buying a home. Lenders review your monthly obligations compared with your income, along with the requirements of the loan program.",
              },
              {
                q: "How much money will I actually need?",
                a: "Your total may include a down payment, closing costs, and prepaid expenses such as property taxes and homeowners insurance. Credits or assistance programs may help eligible buyers reduce their upfront costs.",
              },
              {
                q: "How much home could I realistically afford?",
                a: "That depends on your income, monthly debts, available funds, credit profile, interest rate, property taxes, insurance, and any HOA dues. This questionnaire gives you an initial estimate based on the information you provide.",
              },
              {
                q: "Should I wait until I'm ready to buy?",
                a: "Not necessarily. Starting early gives you time to understand your options, build a plan, and address anything that could affect your approval before finding the right home.",
              },
              {
                q: `Why should I get pre-approved before looking at homes?`,
                a: `A pre-approval helps you understand your budget and shows sellers that your financing has been reviewed. It also helps ${realtorFirst} focus your home search on properties that fit your goals.`,
              },
              {
                q: "What happens after I complete the questionnaire?",
                a: `You'll receive an initial estimate by email. ${loFirst} will personally contact you within one business day to review your financing options. You can also continue directly to the full application or schedule a call. ${realtorFirst} is available to help with your home search, properties, showings, and neighborhoods.`,
              },
            ].map(({ q, a }) => (
              <details key={q} className="group px-5 py-4 sm:px-6 sm:py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-bold text-ink text-[15px]">
                  <span className="leading-snug">{q}</span>
                  <span className="flex-shrink-0 text-xl text-accent transition-transform group-open:rotate-45 mt-0.5">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-muted">{a}</p>
              </details>
            ))}
          </div>

          {/* CTA under FAQ */}
          <div className="mt-8 rounded-2xl border border-line bg-white p-6 sm:p-8 text-center shadow-soft">
            <h3 className="text-xl font-extrabold text-ink">You Don&apos;t Need Every Answer Today</h3>
            <p className="mt-2 text-[15px] text-muted">You just need to understand where you stand and what your next step could be.</p>
            <a href="#funnel"
              className="mt-5 flex w-full sm:inline-flex sm:w-auto items-center justify-center gap-2 rounded-xl px-7 py-4 text-sm font-bold text-white transition-opacity hover:opacity-90"
              style={{ background: "var(--ok-gradient)" }}>
              See Where I Stand →
            </a>
            <p className="mt-3 text-xs text-muted/60">Takes about 60 seconds · No credit check · No commitment</p>
          </div>

        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────── */}
      <section className="py-14 sm:py-16" style={{ background: "linear-gradient(135deg,#7c5cd8,#F37021)" }}>
        <div className="container-shell max-w-3xl px-4 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">Ready to move forward?</p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white">
            Your dream home is one conversation away.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-white/80">
            {realtorFirst} will find the home. {loFirst} will get you the financing. Start your free estimate above, no credit check, no commitment.
          </p>
          <a href="#funnel"
            className="mt-7 flex w-full sm:inline-flex sm:w-auto items-center justify-center gap-2 rounded-2xl border-2 border-white bg-white px-8 py-4 text-base font-bold text-accent transition hover:bg-white/90">
            Get my free estimate →
          </a>
        </div>
      </section>

      {/* ── LOCKED FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-line bg-white py-8">
        <div className="container-shell max-w-5xl px-4 text-center">
          <p className="text-xs text-muted leading-5">
            This page was created by {loName} (NMLS# {loNmls ?? "—"}) at Harris Capital Mortgage Group, LLC · NMLS# 1918223
          </p>
          <p className="mt-1 text-xs text-muted/60 leading-5">
            Initial estimate only. This is not a loan approval. A completed application and credit check are required for pre-approval. Not a commitment to lend. All loans subject to credit approval. Equal Housing Lender.
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-muted/50">
            <a href="/privacy" target="_blank" className="hover:text-muted transition-colors">Privacy Policy</a>
            <a href="/terms" target="_blank" className="hover:text-muted transition-colors">Terms of Use</a>
            <a href="/legal-disclaimer" target="_blank" className="hover:text-muted transition-colors">Legal Disclaimer</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
