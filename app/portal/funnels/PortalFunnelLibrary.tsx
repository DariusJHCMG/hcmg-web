"use client";

import { useState, useMemo } from "react";
import { FUNNEL_FAMILIES, FUNNEL_CATALOG } from "@/lib/funnel-catalog";
import type { FunnelFamily, FunnelFamilyDef } from "@/lib/funnel-catalog";

interface Props {
  loSlug: string;
  loName: string;
  siteUrl: string;
}

// ── Copy button ───────────────────────────────────────────────────────────────
function CopyBtn({ text, size = "md" }: { text: string; size?: "sm" | "md" }) {
  const [state, setState] = useState<"idle" | "copied">("idle");
  async function copy() {
    await navigator.clipboard.writeText(text).catch(() => {});
    setState("copied");
    setTimeout(() => setState("idle"), 2200);
  }
  const base = size === "sm"
    ? "rounded-lg px-2.5 py-1 text-[10px]"
    : "rounded-xl px-3.5 py-1.5 text-xs";
  return (
    <button
      onClick={copy}
      className={`flex-shrink-0 font-bold transition-all duration-200 ${base}
        ${state === "copied"
          ? "border border-green-400/60 bg-green-500/15 text-green-400"
          : "border border-white/20 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
        }`}
    >
      {state === "copied" ? "✓ Copied!" : "Copy"}
    </button>
  );
}

// ── UTM presets ───────────────────────────────────────────────────────────────
const UTM_PRESETS = [
  { label: "Facebook Ad",     icon: "📘", source: "facebook",  medium: "paid-social" },
  { label: "Instagram Ad",    icon: "📸", source: "instagram", medium: "paid-social" },
  { label: "Google Ad",       icon: "🔍", source: "google",    medium: "cpc"         },
  { label: "Email",           icon: "✉️",  source: "email",     medium: "email"       },
  { label: "Text / SMS",      icon: "💬", source: "sms",       medium: "sms"         },
  { label: "TikTok",          icon: "🎵", source: "tiktok",    medium: "paid-social" },
  { label: "YouTube",         icon: "▶️",  source: "youtube",   medium: "video"       },
  { label: "Custom…",         icon: "✏️",  source: "",          medium: ""            },
];

// ── Main component ────────────────────────────────────────────────────────────
export function PortalFunnelLibrary({ loSlug, loName: _loName, siteUrl }: Props) {
  const [activeFamily, setActiveFamily]   = useState<FunnelFamily | "all">("all");
  const [search, setSearch]               = useState("");
  const [utmPreset, setUtmPreset]         = useState(0);
  const [utmSource, setUtmSource]         = useState("");
  const [utmMedium, setUtmMedium]         = useState("");
  const [utmCampaign, setUtmCampaign]     = useState("");
  const [utmContent, setUtmContent]       = useState("");

  const isCustom = utmPreset === UTM_PRESETS.length - 1;
  const activeSrc = isCustom ? utmSource : UTM_PRESETS[utmPreset].source;
  const activeMed = isCustom ? utmMedium : UTM_PRESETS[utmPreset].medium;

  function buildUtmSuffix() {
    const p: string[] = [];
    if (activeSrc)   p.push(`utm_source=${encodeURIComponent(activeSrc)}`);
    if (activeMed)   p.push(`utm_medium=${encodeURIComponent(activeMed)}`);
    if (utmCampaign) p.push(`utm_campaign=${encodeURIComponent(utmCampaign)}`);
    if (utmContent)  p.push(`utm_content=${encodeURIComponent(utmContent)}`);
    return p.length ? `?${p.join("&")}` : "";
  }

  function buildUrl(funnelSlug: string) {
    return `${siteUrl}/go/${loSlug}/${funnelSlug}${buildUtmSuffix()}`;
  }

  const baseUrl = `${siteUrl}/go/${loSlug}${buildUtmSuffix()}`;

  const filtered = useMemo(() => {
    let list = FUNNEL_CATALOG;
    if (activeFamily !== "all") list = list.filter((f) => f.family === activeFamily);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((f) =>
        f.label.toLowerCase().includes(q) ||
        f.headline.toLowerCase().includes(q) ||
        f.subhead.toLowerCase().includes(q) ||
        (f.badge ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeFamily, search]);

  const grouped = useMemo(() => {
    if (activeFamily !== "all") return null;
    if (search.trim()) return null; // flat view when searching
    const map = new Map<FunnelFamily, typeof FUNNEL_CATALOG>();
    for (const f of filtered) {
      if (!map.has(f.family)) map.set(f.family, []);
      map.get(f.family)!.push(f);
    }
    return map;
  }, [activeFamily, filtered, search]);

  return (
    <div className="min-h-screen bg-[#0d0f14]">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/8"
        style={{ background: "linear-gradient(135deg,#0f1923 0%,#142035 50%,#0f1923 100%)" }}>
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle,#F37021 0%,transparent 70%)" }} />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle,#FF9847 0%,transparent 70%)" }} />

        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          <div className="mb-1 flex items-center gap-2">
            <span className="h-1.5 w-6 rounded-full" style={{ background: "linear-gradient(90deg,#FF9847,#F37021)" }} />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">Funnel Library</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            Your Personal<br />
            <span style={{ background: "linear-gradient(90deg,#FF9847,#F37021)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Funnel Links
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/50">
            {FUNNEL_CATALOG.length} trackable links across {FUNNEL_FAMILIES.length} categories.
            Every submission routes directly to you with an instant notification.
          </p>

          {/* Stats row */}
          <div className="mt-6 flex flex-wrap gap-3">
            {FUNNEL_FAMILIES.map((fam) => (
              <button
                key={fam.key}
                onClick={() => { setActiveFamily(fam.key); setSearch(""); }}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all
                  ${activeFamily === fam.key
                    ? "border-orange-500/60 bg-orange-500/20 text-orange-300"
                    : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
                  }`}
              >
                <span>{fam.icon}</span>
                <span>{fam.label}</span>
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold
                  ${activeFamily === fam.key ? "bg-orange-500/30 text-orange-200" : "bg-white/8 text-white/40"}`}>
                  {FUNNEL_CATALOG.filter((f) => f.family === fam.key).length}
                </span>
              </button>
            ))}
            <button
              onClick={() => { setActiveFamily("all"); setSearch(""); }}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all
                ${activeFamily === "all" && !search
                  ? "border-white/30 bg-white/10 text-white"
                  : "border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white/80"
                }`}
            >
              All · {FUNNEL_CATALOG.length}
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-6">

        {/* ── General funnel link ──────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-white/10"
          style={{ background: "linear-gradient(135deg,#1a2235,#1e2840)" }}>
          <div className="px-5 py-4 sm:px-6">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/40">General Funnel Link</p>
                <p className="mt-0.5 text-sm font-bold text-white">Your catch-all personal link</p>
              </div>
              <span className="rounded-full border border-green-500/30 bg-green-500/15 px-2.5 py-0.5 text-[10px] font-bold text-green-400">
                ● Active
              </span>
            </div>
            {/* Full URL display */}
            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-semibold text-orange-300">{baseUrl}</p>
              </div>
              <CopyBtn text={baseUrl} />
            </div>
            <p className="mt-2 text-[11px] text-white/30">
              Share anywhere. UTM parameters below are automatically appended to every link you copy.
            </p>
          </div>
          <div className="h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(243,112,33,.4),transparent)" }} />
        </div>

        {/* ── UTM Builder ──────────────────────────────────────────────────── */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#141820]">
          <div className="border-b border-white/8 px-5 py-4 sm:px-6">
            <p className="text-sm font-bold text-white">UTM Tracking</p>
            <p className="mt-0.5 text-xs text-white/40">
              Select a platform preset — all URLs you copy below will include these tracking parameters.
            </p>
          </div>

          <div className="px-5 py-5 sm:px-6 space-y-4">
            {/* Preset grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {UTM_PRESETS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => {
                    setUtmPreset(i);
                    if (i < UTM_PRESETS.length - 1) { setUtmSource(""); setUtmMedium(""); }
                  }}
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all text-left
                    ${utmPreset === i
                      ? "border-orange-500/50 bg-orange-500/15 text-orange-300"
                      : "border-white/8 bg-white/5 text-white/50 hover:border-white/15 hover:text-white/80"
                    }`}
                >
                  <span className="text-sm">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              ))}
            </div>

            {/* Fields */}
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { label: "Source",   value: activeSrc,    set: (v: string) => { if (isCustom) setUtmSource(v); },   placeholder: "facebook"   },
                { label: "Medium",   value: activeMed,    set: (v: string) => { if (isCustom) setUtmMedium(v); },   placeholder: "paid-social" },
                { label: "Campaign", value: utmCampaign,  set: setUtmCampaign,  placeholder: "spring2025",  editable: true },
                { label: "Content",  value: utmContent,   set: setUtmContent,   placeholder: "va-ad-v1",    editable: true },
              ].map((f) => {
                const editable = "editable" in f ? f.editable : isCustom;
                return (
                  <div key={f.label}>
                    <label className="mb-1 block text-[10px] font-bold uppercase tracking-[0.1em] text-white/30">
                      utm_{f.label.toLowerCase()}
                    </label>
                    <input
                      type="text"
                      value={f.value}
                      onChange={(e) => f.set(e.target.value)}
                      readOnly={!editable}
                      placeholder={f.placeholder}
                      className={`w-full rounded-xl border bg-black/20 px-3 py-2 font-mono text-xs text-white/80
                        placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500/30 transition-all
                        ${editable ? "border-white/10 focus:border-orange-500/40" : "cursor-not-allowed border-white/5 opacity-50"}`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Live preview */}
            {buildUtmSuffix() && (
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 px-4 py-2.5">
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-orange-400/60">
                  UTM suffix applied to all links
                </p>
                <p className="font-mono text-xs text-orange-300/80 break-all">{buildUtmSuffix()}</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Search bar ───────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-sm">🔍</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search funnels — VA, FHA, DSCR, first-time buyer…"
              className="w-full rounded-xl border border-white/10 bg-[#141820] py-3 pl-10 pr-4 text-sm text-white/80
                placeholder:text-white/25 focus:border-orange-500/40 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
          <div className="flex-shrink-0 rounded-xl border border-white/10 bg-[#141820] px-4 py-3 text-xs font-bold text-white/40">
            {filtered.length} funnels
          </div>
        </div>

        {/* ── No results ───────────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-white/8 bg-[#141820] py-16 text-center">
            <p className="text-3xl mb-3">🔍</p>
            <p className="text-sm font-semibold text-white/40">No funnels match &ldquo;{search}&rdquo;</p>
            <button onClick={() => setSearch("")}
              className="mt-3 text-xs font-semibold text-orange-400 hover:text-orange-300">
              Clear search
            </button>
          </div>
        )}

        {/* ── Grouped view (all families, no search) ───────────────────────── */}
        {grouped && filtered.length > 0 && (
          <div className="space-y-10">
            {FUNNEL_FAMILIES.map((fam) => {
              const funnels = grouped.get(fam.key);
              if (!funnels || funnels.length === 0) return null;
              return (
                <FamilySection
                  key={fam.key}
                  fam={fam}
                  funnels={funnels}
                  buildUrl={buildUrl}
                  onFamilyClick={() => setActiveFamily(fam.key)}
                />
              );
            })}
          </div>
        )}

        {/* ── Single family or search results — flat grid ───────────────────── */}
        {!grouped && filtered.length > 0 && (() => {
          const fam = FUNNEL_FAMILIES.find((f) => f.key === activeFamily) ?? FUNNEL_FAMILIES[0];
          return <FunnelGrid funnels={filtered} buildUrl={buildUrl} fam={fam} />;
        })()}
      </div>
    </div>
  );
}

// ── Family section with header ─────────────────────────────────────────────
function FamilySection({
  fam, funnels, buildUrl, onFamilyClick,
}: {
  fam: FunnelFamilyDef;
  funnels: typeof FUNNEL_CATALOG;
  buildUrl: (slug: string) => string;
  onFamilyClick: () => void;
}) {
  return (
    <div>
      {/* Section header */}
      <button
        onClick={onFamilyClick}
        className="group mb-4 flex w-full items-center justify-between rounded-2xl border border-white/8 bg-[#141820] px-5 py-4 text-left transition-all hover:border-white/15"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{fam.icon}</span>
          <div>
            <p className="text-sm font-extrabold text-white">{fam.label}</p>
            <p className="text-xs text-white/40">{fam.description} · {funnels.length} funnels</p>
          </div>
        </div>
        <span className="text-xs font-semibold text-white/30 group-hover:text-orange-400 transition-colors">
          View all →
        </span>
      </button>
      <FunnelGrid funnels={funnels} buildUrl={buildUrl} fam={fam} />
    </div>
  );
}

// ── Funnel card grid ───────────────────────────────────────────────────────
function FunnelGrid({
  funnels,
  buildUrl,
  fam,
}: {
  funnels: typeof FUNNEL_CATALOG;
  buildUrl: (slug: string) => string;
  fam: FunnelFamilyDef;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {funnels.map((f) => {
        const url = buildUrl(f.slug);
        return <FunnelCard key={f.slug} f={f} url={url} fam={fam} />;
      })}
    </div>
  );
}

// ── Individual funnel card ─────────────────────────────────────────────────
function FunnelCard({
  f, url, fam,
}: {
  f: typeof FUNNEL_CATALOG[number];
  url: string;
  fam: FunnelFamilyDef;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#141820] transition-all duration-200 hover:border-white/15 hover:bg-[#181e2a]"
    >
      {/* Top accent line per family */}
      <div className="h-0.5 w-full flex-shrink-0" style={{ background: FAMILY_GRADIENT[fam.key] }} />

      <div className="flex flex-1 flex-col p-4">
        {/* Title + badge */}
        <div className="mb-2 flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold text-white leading-snug">{f.label}</span>
              {f.badge && (
                <span className="inline-flex flex-shrink-0 items-center rounded-full border border-white/15 bg-white/8 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white/60">
                  {f.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] leading-relaxed text-white/40 line-clamp-2">{f.subhead}</p>
          </div>
        </div>

        {/* Expand toggle for headline */}
        {expanded && (
          <div className="mb-3 rounded-xl border border-white/8 bg-black/20 px-3 py-2.5">
            <p className="text-[11px] font-semibold text-orange-300/80">&ldquo;{f.headline}&rdquo;</p>
            <p className="mt-0.5 text-[10px] text-white/30">Shown to visitor at top of funnel</p>
          </div>
        )}

        {/* Full URL — always visible */}
        <div className="mt-auto space-y-1.5">
          <div className="flex items-center gap-1.5 rounded-xl border border-white/8 bg-black/25 px-3 py-2">
            <code className="flex-1 truncate font-mono text-[11px] text-orange-300/90">{url}</code>
            <CopyBtn text={url} size="sm" />
          </div>

          {/* Action row */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex-1 rounded-lg border border-white/8 bg-white/4 py-1.5 text-center text-[10px] font-semibold text-white/40 transition-all hover:border-white/15 hover:text-white/70"
            >
              {expanded ? "↑ Less" : "Preview funnel hook"}
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-[10px] font-semibold text-white/40 transition-all hover:border-orange-500/30 hover:text-orange-400"
            >
              Open ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Per-family gradient top accent ─────────────────────────────────────────
const FAMILY_GRADIENT: Record<string, string> = {
  purchase:    "linear-gradient(90deg,#f59e0b,#d97706)",
  va:          "linear-gradient(90deg,#3b82f6,#1d4ed8)",
  fha:         "linear-gradient(90deg,#22c55e,#16a34a)",
  "first-time":"linear-gradient(90deg,#8b5cf6,#6d28d9)",
  refinance:   "linear-gradient(90deg,#f97316,#ea580c)",
  investor:    "linear-gradient(90deg,#64748b,#475569)",
  credit:      "linear-gradient(90deg,#f43f5e,#e11d48)",
  calculator:  "linear-gradient(90deg,#14b8a6,#0d9488)",
};
