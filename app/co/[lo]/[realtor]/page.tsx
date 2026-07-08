import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
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
  const title = `${page.realtor_name} & HCMG — Get Pre-Qualified`;
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

  // Fetch both in parallel — wrap in try/catch so a bad table name or missing
  // column never produces an unhandled server crash
  let pageData: Record<string, unknown> | null = null;
  let profileData: Record<string, unknown> | null = null;
  try {
    const [pageRes, profileRes] = await Promise.all([
      sb.from("co_branded_pages").select("*").eq("lo_slug", loSlug).eq("realtor_slug", realtorSlug).maybeSingle(),
      sb.from("profiles").select("*").eq("lo_slug", loSlug).eq("is_active", true).maybeSingle(),
    ]);
    pageData    = pageRes.data;
    profileData = profileRes.data;
  } catch {
    notFound();
  }

  if (!pageData || !pageData.is_active) notFound();
  if (!profileData) notFound();

  const p    = profileData as unknown as Profile;
  const page = pageData as unknown as {
    id: string; lo_slug: string; realtor_slug: string;
    realtor_name: string; realtor_company: string;
    realtor_phone: string | null; realtor_email: string | null;
    realtor_license: string | null; realtor_photo_url: string | null;
    realtor_logo_url: string | null; headline: string | null;
    is_active: boolean; clicks: number;
  };

  // Increment click counter (fire-and-forget)
  void sb.from("co_branded_pages")
    .update({ clicks: (page.clicks ?? 0) + 1 })
    .eq("id", page.id);

  const loName      = p.full_name;
  const loRole      = p.title ?? "Loan Officer";
  const loPhoto     = p.avatar_url ?? "/team/placeholder.svg";
  const loPhone     = p.phone ?? "";
  const loNmls      = p.nmls;
  const loFirst     = loName.replace(/['"()]/g, "").split(/\s+/)[0];
  const realtorFirst = page.realtor_name.split(/\s+/)[0];

  const funnelLo = { slug: loSlug, name: loName, nmls: loNmls };

  const headline = page.headline
    ?? `${realtorFirst} + ${loFirst}: Let's get your clients to the closing table.`;

  return (
    <main>
      <NavBar />

      {/* ── CO-BRAND HERO ──────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white" style={{ paddingTop: "clamp(60px, 8vw, 100px)", paddingBottom: "clamp(48px, 6vw, 80px)" }}>
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px] bg-hero-glow" />

        <div className="container-shell max-w-5xl">

          {/* Partnership badge */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex items-center gap-3 rounded-full border border-line bg-white px-5 py-2.5 shadow-soft">
              {/* LO logo / initials */}
              <div className="h-9 w-9 overflow-hidden rounded-full border border-line flex-shrink-0">
                <TeamPhoto photo={loPhoto} name={loName} aspect="1/1" className="h-full w-full" />
              </div>
              <span className="text-sm font-bold text-muted">partnered with</span>
              {/* Realtor logo / initials */}
              {page.realtor_logo_url ? (
                <img src={page.realtor_logo_url} alt={page.realtor_company}
                  className="h-9 w-auto max-w-[80px] rounded-lg object-contain flex-shrink-0" />
              ) : (
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-extrabold text-white"
                  style={{ background: "linear-gradient(135deg,#7c5cd8,#5b4bc4)" }}>
                  <Initials name={page.realtor_name} />
                </div>
              )}
            </div>
          </div>

          {/* Headline */}
          <h1 className="mb-4 text-center font-extrabold leading-[1.1] tracking-tight text-ink"
            style={{ fontSize: "clamp(32px, 5vw, 60px)" }}>
            {headline}
          </h1>
          <p className="mx-auto mb-10 max-w-xl text-center text-base leading-7 text-muted">
            No call centers. No runarounds. Get pre-qualified in 60 seconds — your file goes directly to {loFirst}.
          </p>

          {/* Two-up partner cards */}
          <div className="grid gap-4 sm:grid-cols-2 max-w-2xl mx-auto mb-10">

            {/* LO card */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft flex items-start gap-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-line shadow-soft">
                <TeamPhoto photo={loPhoto} name={loName} aspect="1/1" className="h-full w-full" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-accent mb-0.5">Your Loan Officer</p>
                <p className="font-extrabold text-ink leading-tight truncate">{loName}</p>
                <p className="text-xs text-muted">{loRole} · HCMG</p>
                {loNmls && <p className="mt-0.5 text-[11px] text-muted">NMLS# {loNmls}</p>}
                {loPhone && (
                  <a href={`tel:${loPhone.replace(/[^0-9+]/g, "")}`}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
                    📞 {loPhone}
                  </a>
                )}
              </div>
            </div>

            {/* Realtor card */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft flex items-start gap-4">
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-line shadow-soft">
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
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] mb-0.5" style={{ color: "#7c5cd8" }}>Your Realtor</p>
                <p className="font-extrabold text-ink leading-tight truncate">{page.realtor_name}</p>
                <p className="text-xs text-muted truncate">{page.realtor_company}</p>
                {page.realtor_license && <p className="mt-0.5 text-[11px] text-muted">Lic# {page.realtor_license}</p>}
                {page.realtor_phone && (
                  <a href={`tel:${page.realtor_phone.replace(/[^0-9+]/g, "")}`}
                    className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold hover:underline" style={{ color: "#7c5cd8" }}>
                    📞 {page.realtor_phone}
                  </a>
                )}
              </div>
            </div>

          </div>

          {/* Trust row */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {["No hard credit check", "Results in 60 seconds", "No commitment required", "File goes direct to " + loFirst].map(t => (
              <div key={t} className="flex items-center gap-2 text-sm font-semibold text-muted">
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-white text-xs" style={{ background: "var(--ok-gradient)" }}>✓</span>
                {t}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FUNNEL ──────────────────────────────────────────────────── */}
      <section id="funnel" className="bg-sand py-20 scroll-mt-20">
        <div className="container-shell max-w-3xl">
          <div className="mb-8 text-center">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">Start Here</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
              See what you qualify for in 60 seconds.
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-base text-muted">
              Purchase or refinance · No hard credit check · No commitment
            </p>
          </div>
          <FunnelFlow
            lo={funnelLo}
            source="co-brand"
          />
        </div>
      </section>

      {/* ── ABOUT THE PARTNERSHIP ───────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="container-shell max-w-5xl">
          <div className="grid gap-10 lg:grid-cols-2">

            {/* LO bio */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">Your Mortgage Partner</p>
              <div className="mb-4 flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-line shadow-soft">
                  <TeamPhoto photo={loPhoto} name={loName} aspect="1/1" className="h-full w-full" />
                </div>
                <div>
                  <p className="font-extrabold text-ink">{loName}</p>
                  <p className="text-sm text-muted">{loRole} · Harris Capital Mortgage Group</p>
                  {loNmls && <p className="text-xs text-muted">NMLS# {loNmls}</p>}
                </div>
              </div>
              <p className="text-sm leading-7 text-muted">
                {p.hero_bio ?? `${loFirst} is a licensed mortgage professional at Harris Capital Mortgage Group. HCMG has access to dozens of lenders and hundreds of loan programs — meaning ${loFirst} shops the market to find the deal that actually fits your situation.`}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {loPhone && (
                  <a href={`tel:${loPhone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink hover:border-accent hover:text-accent transition-all shadow-soft">
                    📞 {loPhone}
                  </a>
                )}
                {p.email && (
                  <a href={`mailto:${p.email}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink hover:border-accent hover:text-accent transition-all shadow-soft">
                    ✉️ Email {loFirst}
                  </a>
                )}
              </div>
            </div>

            {/* Realtor bio */}
            <div className="rounded-2xl border border-line bg-white p-6 shadow-soft">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "#7c5cd8" }}>Your Real Estate Partner</p>
              <div className="mb-4 flex items-center gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl border border-line shadow-soft">
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
                <div>
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
              <div className="mt-4 flex flex-wrap gap-2">
                {page.realtor_phone && (
                  <a href={`tel:${page.realtor_phone.replace(/[^0-9+]/g, "")}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition-all shadow-soft"
                    style={{ "--tw-border-opacity": 1 } as React.CSSProperties}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = "#7c5cd8")}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "")}>
                    📞 {page.realtor_phone}
                  </a>
                )}
                {page.realtor_email && (
                  <a href={`mailto:${page.realtor_email}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-2 text-xs font-semibold text-ink transition-all shadow-soft">
                    ✉️ Email {realtorFirst}
                  </a>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "linear-gradient(135deg,#7c5cd8,#F37021)" }}>
        <div className="container-shell max-w-3xl text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-white/60">Ready to move forward?</p>
          <h2 className="text-3xl font-extrabold text-white lg:text-4xl">
            Your dream home is one conversation away.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-white/80">
            {realtorFirst} will find the home. {loFirst} will get you the financing. Start your free estimate above — no credit check, no commitment.
          </p>
          <a href="#funnel"
            className="mt-8 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-white bg-white px-8 py-4 text-base font-bold text-accent transition hover:bg-white/90">
            Get my free estimate →
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
