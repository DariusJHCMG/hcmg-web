import { redirect, notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createServiceClient } from "@/lib/supabase";
import { getFunnelBySlug, getFamilyDef } from "@/lib/funnel-catalog";
import Link from "next/link";
import type { Lead } from "@/lib/database.types";
import { FunnelDetailClient } from "./FunnelDetailClient";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getFunnelLeads(loSlug: string, funnelSlug: string): Promise<Lead[]> {
  const sb = createServiceClient();

  // Leads that came through this specific funnel are identified two ways:
  // 1. notes field contains "Funnel: <slug>" (set by /api/lead when funnelType is passed)
  // 2. entry_page matches /go/<lo>/<slug>
  const { data } = await sb
    .from("leads")
    .select("*")
    .eq("lo_slug", loSlug)
    .or(`notes.ilike.%Funnel: ${funnelSlug}%,entry_page.ilike.%/go/${loSlug}/${funnelSlug}%`)
    .order("created_at", { ascending: false });

  return (data ?? []) as Lead[];
}

// ── Stat helpers ──────────────────────────────────────────────────────────────
function calcStats(leads: Lead[]) {
  const total       = leads.length;
  const newLeads    = leads.filter((l) => l.status === "new").length;
  const qualified   = leads.filter((l) => l.status === "qualified").length;
  const closed      = leads.filter((l) => l.status === "closed").length;
  const withUtm     = leads.filter((l) => l.utm_source).length;
  const convRate    = total > 0 ? Math.round((closed / total) * 100) : 0;

  // UTM source breakdown
  const utmMap: Record<string, number> = {};
  for (const l of leads) {
    const src = l.utm_source ?? "direct";
    utmMap[src] = (utmMap[src] ?? 0) + 1;
  }

  // Goal breakdown
  const goalMap: Record<string, number> = {};
  for (const l of leads) {
    const g = l.goal ?? "not specified";
    goalMap[g] = (goalMap[g] ?? 0) + 1;
  }

  // Leads per day (last 30 days)
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const recentLeads = leads.filter((l) => now - new Date(l.created_at).getTime() < thirtyDays).length;

  return { total, newLeads, qualified, closed, withUtm, convRate, utmMap, goalMap, recentLeads };
}

export default async function FunnelDetailPage({ params }: Props) {
  const { slug } = await params;

  // Validate funnel exists in catalog
  const funnelDef = getFunnelBySlug(slug);
  if (!funnelDef) notFound();

  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (!profile.lo_slug) redirect("/portal/funnels");

  const family = getFamilyDef(funnelDef.family);
  const leads  = await getFunnelLeads(profile.lo_slug, slug);
  const stats  = calcStats(leads);

  // Build the accent color from the family
  const FAMILY_ACCENT: Record<string, string> = {
    purchase: "#f59e0b", va: "#3b82f6", fha: "#22c55e",
    "first-time": "#8b5cf6", refinance: "#f97316",
    investor: "#64748b", credit: "#f43f5e", calculator: "#14b8a6",
  };
  const accent = FAMILY_ACCENT[funnelDef.family] ?? "#F37021";

  return (
    <div className="space-y-6">

      {/* ── Back nav ── */}
      <div>
        <Link
          href="/portal/funnels"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-accent transition-colors"
        >
          ← Back to Funnel Library
        </Link>
      </div>

      {/* ── Funnel hero card ── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        <div className="h-1 w-full" style={{ background: accent }} />
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                  {family?.icon} {family?.label}
                </span>
                {funnelDef.badge && (
                  <span
                    className="rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase"
                    style={{ borderColor: accent + "40", background: accent + "12", color: accent }}
                  >
                    {funnelDef.badge}
                  </span>
                )}
              </div>
              <h1 className="mt-1 text-2xl font-extrabold text-ink">{funnelDef.label}</h1>
              <p className="mt-1 text-sm text-muted max-w-xl">{funnelDef.subhead}</p>
            </div>
            <div className="flex-shrink-0 rounded-2xl border border-line bg-sand px-4 py-3 text-center">
              <p className="text-2xl font-extrabold ok-gradient-text">{stats.total}</p>
              <p className="text-[11px] font-semibold text-muted">Total leads</p>
            </div>
          </div>

          {/* Funnel headline preview */}
          <div className="mt-4 rounded-xl border border-line bg-sand px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted/60 mb-0.5">
              What visitors see when they land
            </p>
            <p className="text-sm font-semibold text-ink">&ldquo;{funnelDef.headline}&rdquo;</p>
          </div>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "New / Unworked", value: stats.newLeads,   color: "text-blue-600"  },
          { label: "Qualified",      value: stats.qualified,  color: "text-purple-600" },
          { label: "Closed",         value: stats.closed,     color: "text-green-600" },
          { label: "Last 30 days",   value: stats.recentLeads,color: "ok-gradient-text"},
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-white p-4 shadow-soft text-center">
            <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="mt-1 text-[11px] font-semibold text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Analytics panels ── */}
      {stats.total > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">

          {/* UTM sources */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <p className="mb-4 text-sm font-extrabold text-ink">Traffic Sources</p>
            {Object.keys(stats.utmMap).length === 0 ? (
              <p className="text-xs text-muted">No UTM data yet.</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(stats.utmMap)
                  .sort(([, a], [, b]) => b - a)
                  .map(([src, count]) => {
                    const pct = Math.round((count / stats.total) * 100);
                    return (
                      <div key={src}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink capitalize">{src}</span>
                          <span className="text-xs font-bold text-muted">{count} · {pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: accent }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Goal breakdown */}
          <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
            <p className="mb-4 text-sm font-extrabold text-ink">Lead Goals</p>
            {Object.keys(stats.goalMap).length === 0 ? (
              <p className="text-xs text-muted">No goal data yet.</p>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(stats.goalMap)
                  .sort(([, a], [, b]) => b - a)
                  .map(([goal, count]) => {
                    const pct = Math.round((count / stats.total) * 100);
                    return (
                      <div key={goal}>
                        <div className="mb-1 flex items-center justify-between">
                          <span className="text-xs font-semibold text-ink capitalize">{goal}</span>
                          <span className="text-xs font-bold text-muted">{count} · {pct}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, background: accent }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Leads table ── */}
      <FunnelDetailClient
        leads={leads}
        funnelLabel={funnelDef.label}
        loSlug={profile.lo_slug}
        funnelSlug={slug}
      />
    </div>
  );
}
