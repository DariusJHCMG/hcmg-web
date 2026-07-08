import type { Metadata } from "next";
import { NavBar } from "@/components/ui/NavBar";
import { Footer } from "@/components/ui/Footer";
import { FunnelFlow } from "@/components/funnel/FunnelFlow";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { getTeamMemberBySlug } from "@/data/team";
import { createServiceClient } from "@/lib/supabase";
import { getFunnelBySlug } from "@/lib/funnel-catalog";

export const metadata: Metadata = {
  title: "Get Your Mortgage Estimate, HCMG",
  description:
    "See what you can afford in 60 seconds. No hard credit check. FHA, VA, Conventional, and Refinance options. Harris Capital Mortgage Group · NMLS# 1918223.",
  alternates: { canonical: "https://getorangekey.com/get-started" },
  robots: { index: true, follow: true },
};

interface LoContext {
  slug: string;
  name: string;
  nmls: string | null;
  role: string;
  photo: string | null;
}

// Resolve LO: try Supabase profiles first, fall back to data/team.ts
async function resolveLo(loSlug: string): Promise<LoContext | null> {
  try {
    const sb = createServiceClient();
    const { data } = await sb
      .from("profiles")
      .select("lo_slug, full_name, nmls, title, role, avatar_url")
      .eq("lo_slug", loSlug)
      .eq("is_active", true)
      .single();
    if (data) {
      return {
        slug:  data.lo_slug,
        name:  data.full_name,
        nmls:  data.nmls ?? null,
        role:  data.title ?? data.role.replace("_", " "),
        photo: data.avatar_url ?? null,
      };
    }
  } catch { /* fall through */ }

  // Fall back to static team data (covers pre-seeded LOs until patch 004 is run)
  const m = getTeamMemberBySlug(loSlug);
  if (m) {
    return { slug: m.slug, name: m.name, nmls: m.nmls, role: m.role, photo: m.photo };
  }
  return null;
}

export const dynamic = "force-dynamic";

export default async function GetStartedPage({
  searchParams,
}: {
  searchParams: Promise<{ lo?: string; source?: string; from?: string; funnel?: string }>;
}) {
  const { lo: loSlug, source, from: seoSlug, funnel: funnelSlug } = await searchParams;
  const lo = loSlug ? await resolveLo(loSlug) : null;
  const funnelLo = lo
    ? { slug: lo.slug, name: lo.name, nmls: lo.nmls }
    : undefined;
  // Determine effective source: explicit param > seo (when from= is present) > default
  const effectiveSource = source ?? (seoSlug ? "seo" : undefined);
  // Resolve funnel definition if a funnel slug was passed
  const funnelDef = funnelSlug ? getFunnelBySlug(funnelSlug) : undefined;

  return (
    <main className="min-h-screen overflow-x-hidden bg-sand pb-32 md:pb-0">
      <NavBar />

      <section className="section-pad">
        <div className="container-shell">
          {lo ? (
            <div className="mx-auto mb-10 max-w-xl">
              <div className="flex items-center gap-4 rounded-3xl border border-line bg-white p-4 shadow-soft sm:p-5">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-2xl">
                  <TeamPhoto
                    photo={lo.photo ?? "/team/placeholder.svg"}
                    name={lo.name}
                    aspect="1 / 1"
                    className="h-full w-full"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold uppercase tracking-[0.14em] text-accent">
                    You&apos;re starting with
                  </div>
                  <div className="truncate text-base font-bold text-ink">{lo.name}</div>
                  <div className="text-xs text-muted">
                    {lo.role}
                    {lo.nmls ? ` · NMLS# ${lo.nmls}` : ""}
                  </div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <h1 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
                  Find out what you can afford
                </h1>
                <p className="mt-3 text-base text-muted">
                  Under 60 seconds · No hard credit check · No commitment
                </p>
                <p className="mt-2 text-xs text-muted/70">
                  Your answers route directly to {lo.name.split(/\s+/)[0]}, no call center, no rep rotation.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-xl text-center mb-10">
              <div className="ok-gradient-text mb-3 text-xs font-bold uppercase tracking-[0.2em]">
                Harris Capital Mortgage Group · NMLS# 1918223
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-ink lg:text-4xl">
                Find out what you can afford
              </h1>
              <p className="mt-3 text-base text-muted">
                Under 60 seconds · No hard credit check · No commitment
              </p>
            </div>
          )}

          <FunnelFlow lo={funnelLo} source={effectiveSource} seoSlug={seoSlug} funnelType={funnelDef?.slug} funnelHeadline={funnelDef?.headline} funnelSubhead={funnelDef?.subhead} funnelBadge={funnelDef?.badge} />
        </div>
      </section>

      <Footer />
    </main>
  );
}
