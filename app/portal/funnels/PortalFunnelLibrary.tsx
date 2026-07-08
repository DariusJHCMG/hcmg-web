"use client";

import { useState, useMemo } from "react";
import { FUNNEL_FAMILIES, FUNNEL_CATALOG } from "@/lib/funnel-catalog";
import type { FunnelFamily } from "@/lib/funnel-catalog";

interface Props {
  loSlug: string;
  loName: string;
  siteUrl: string;
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all
        ${copied
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-line bg-white text-muted hover:border-accent hover:text-accent"
        }`}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

const UTM_PRESETS = [
  { label: "Facebook Ad", source: "facebook", medium: "paid-social" },
  { label: "Instagram Ad", source: "instagram", medium: "paid-social" },
  { label: "Email Campaign", source: "email", medium: "email" },
  { label: "Google Ad", source: "google", medium: "cpc" },
  { label: "Text Message", source: "sms", medium: "sms" },
  { label: "Custom…", source: "", medium: "" },
];

export function PortalFunnelLibrary({ loSlug, loName, siteUrl }: Props) {
  const [activeFamily, setActiveFamily] = useState<FunnelFamily | "all">("all");
  const [search, setSearch] = useState("");
  const [utmPreset, setUtmPreset] = useState(0);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("");
  const [utmCampaign, setUtmCampaign] = useState("");

  function buildUrl(funnelSlug: string) {
    const base = `${siteUrl}/go/${loSlug}/${funnelSlug}`;
    const src = utmPreset < UTM_PRESETS.length - 1 ? UTM_PRESETS[utmPreset].source : utmSource;
    const med = utmPreset < UTM_PRESETS.length - 1 ? UTM_PRESETS[utmPreset].medium : utmMedium;
    const params: string[] = [];
    if (src) params.push(`utm_source=${encodeURIComponent(src)}`);
    if (med) params.push(`utm_medium=${encodeURIComponent(med)}`);
    if (utmCampaign) params.push(`utm_campaign=${encodeURIComponent(utmCampaign)}`);
    return params.length ? `${base}?${params.join("&")}` : base;
  }

  const baseLink = `${siteUrl}/go/${loSlug}`;
  const baseLinkWithUtm = (() => {
    const src = utmPreset < UTM_PRESETS.length - 1 ? UTM_PRESETS[utmPreset].source : utmSource;
    const med = utmPreset < UTM_PRESETS.length - 1 ? UTM_PRESETS[utmPreset].medium : utmMedium;
    const params: string[] = [];
    if (src) params.push(`utm_source=${encodeURIComponent(src)}`);
    if (med) params.push(`utm_medium=${encodeURIComponent(med)}`);
    if (utmCampaign) params.push(`utm_campaign=${encodeURIComponent(utmCampaign)}`);
    return params.length ? `${baseLink}?${params.join("&")}` : baseLink;
  })();

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

  // Group by family for "all" view
  const grouped = useMemo(() => {
    if (activeFamily !== "all") return null;
    const map = new Map<FunnelFamily, typeof FUNNEL_CATALOG>();
    for (const f of filtered) {
      if (!map.has(f.family)) map.set(f.family, []);
      map.get(f.family)!.push(f);
    }
    return map;
  }, [activeFamily, filtered]);

  const isCustomUtm = utmPreset === UTM_PRESETS.length - 1;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <p className="ok-gradient-text text-xs font-bold uppercase tracking-[0.2em]">My Funnels</p>
        <h1 className="mt-1 text-2xl font-extrabold text-ink">Funnel Library</h1>
        <p className="mt-1 text-sm text-muted">
          {FUNNEL_CATALOG.length} funnel links — each is a trackable, branded URL you can share anywhere.
          When someone submits a lead, it routes directly to you.
        </p>
      </div>

      {/* Base link */}
      <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
        <div className="mb-1 flex items-center justify-between">
          <p className="text-sm font-bold text-ink">Your General Funnel Link</p>
          <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-700">Active</span>
        </div>
        <p className="mb-3 text-xs text-muted">The original catch-all link. Use this anywhere you want a general inquiry funnel.</p>
        <div className="flex items-center gap-2 rounded-xl border border-line bg-sand px-4 py-2.5">
          <code className="flex-1 break-all text-xs font-semibold text-accent">{baseLinkWithUtm}</code>
          <CopyBtn text={baseLinkWithUtm} />
        </div>
      </div>

      {/* UTM Builder */}
      <div className="rounded-2xl border border-line bg-white p-5">
        <p className="mb-1 text-sm font-bold text-ink">UTM Tracking — applies to all links below</p>
        <p className="mb-4 text-xs text-muted">
          Choose a preset or enter custom values. Every link you copy will include these UTM parameters
          so you can see exactly which campaign generated each lead.
        </p>

        {/* Preset pills */}
        <div className="mb-4 flex flex-wrap gap-2">
          {UTM_PRESETS.map((p, i) => (
            <button
              key={p.label}
              onClick={() => { setUtmPreset(i); if (i < UTM_PRESETS.length - 1) { setUtmSource(""); setUtmMedium(""); } }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all
                ${utmPreset === i
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line bg-white text-muted hover:border-accent/50 hover:text-ink"
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-muted">UTM Source</label>
            <input
              type="text"
              value={isCustomUtm ? utmSource : UTM_PRESETS[utmPreset].source}
              onChange={(e) => { if (isCustomUtm) setUtmSource(e.target.value); }}
              readOnly={!isCustomUtm}
              placeholder="e.g. facebook"
              className={`w-full rounded-xl border border-line bg-sand px-3 py-2 text-xs font-semibold text-ink placeholder:font-normal placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 ${!isCustomUtm ? "cursor-not-allowed opacity-60" : ""}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-muted">UTM Medium</label>
            <input
              type="text"
              value={isCustomUtm ? utmMedium : UTM_PRESETS[utmPreset].medium}
              onChange={(e) => { if (isCustomUtm) setUtmMedium(e.target.value); }}
              readOnly={!isCustomUtm}
              placeholder="e.g. paid-social"
              className={`w-full rounded-xl border border-line bg-sand px-3 py-2 text-xs font-semibold text-ink placeholder:font-normal placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 ${!isCustomUtm ? "cursor-not-allowed opacity-60" : ""}`}
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-bold uppercase tracking-[0.1em] text-muted">UTM Campaign</label>
            <input
              type="text"
              value={utmCampaign}
              onChange={(e) => setUtmCampaign(e.target.value)}
              placeholder="e.g. spring2025"
              className="w-full rounded-xl border border-line bg-sand px-3 py-2 text-xs font-semibold text-ink placeholder:font-normal placeholder:text-muted/40 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
            />
          </div>
        </div>
      </div>

      {/* Search + family filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search funnels…"
          className="flex-1 rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
        />
        <p className="flex-shrink-0 text-xs text-muted">{filtered.length} funnel{filtered.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Family tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFamily("all")}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all
            ${activeFamily === "all"
              ? "border-ink bg-ink text-white"
              : "border-line bg-white text-muted hover:border-ink/30 hover:text-ink"
            }`}
        >
          All families
        </button>
        {FUNNEL_FAMILIES.map((fam) => {
          const count = FUNNEL_CATALOG.filter((f) => f.family === fam.key).length;
          return (
            <button
              key={fam.key}
              onClick={() => setActiveFamily(fam.key)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-all
                ${activeFamily === fam.key
                  ? `${fam.borderColor} ${fam.bgColor} ${fam.textColor}`
                  : "border-line bg-white text-muted hover:border-line/80 hover:text-ink"
                }`}
            >
              {fam.icon} {fam.label}
              <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold
                ${activeFamily === fam.key ? fam.bgColor : "bg-sand text-muted"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-line bg-white py-12 text-center">
          <p className="text-sm text-muted">No funnels match your search.</p>
        </div>
      )}

      {/* All view — grouped by family */}
      {grouped && (
        <div className="space-y-8">
          {FUNNEL_FAMILIES.map((fam) => {
            const funnels = grouped.get(fam.key);
            if (!funnels || funnels.length === 0) return null;
            return (
              <div key={fam.key}>
                <div className={`mb-3 flex items-center gap-3 rounded-2xl border ${fam.borderColor} ${fam.bgColor} px-5 py-3`}>
                  <span className="text-lg">{fam.icon}</span>
                  <div>
                    <p className={`text-sm font-extrabold ${fam.textColor}`}>{fam.label}</p>
                    <p className={`text-[11px] ${fam.textColor} opacity-70`}>{fam.description} · {funnels.length} funnels</p>
                  </div>
                </div>
                <FunnelGrid funnels={funnels} buildUrl={buildUrl} fam={fam} />
              </div>
            );
          })}
        </div>
      )}

      {/* Single-family view — flat grid */}
      {!grouped && filtered.length > 0 && (() => {
        const fam = FUNNEL_FAMILIES.find((f) => f.key === activeFamily)!;
        return <FunnelGrid funnels={filtered} buildUrl={buildUrl} fam={fam} />;
      })()}
    </div>
  );
}

function FunnelGrid({
  funnels,
  buildUrl,
  fam,
}: {
  funnels: typeof FUNNEL_CATALOG;
  buildUrl: (slug: string) => string;
  fam: (typeof FUNNEL_FAMILIES)[number];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {funnels.map((f) => {
        const url = buildUrl(f.slug);
        return (
          <div key={f.slug}
            className="group flex flex-col rounded-2xl border border-line bg-white p-4 transition-all hover:border-accent/40 hover:shadow-soft">
            {/* Top row */}
            <div className="mb-2 flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-sm font-bold text-ink leading-snug">{f.label}</span>
                  {f.badge && (
                    <span className={`inline-flex flex-shrink-0 rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${fam.badgeClass}`}>
                      {f.badge}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-[11px] text-muted line-clamp-2">{f.subhead}</p>
              </div>
            </div>

            {/* URL row */}
            <div className="mt-auto flex items-center gap-2 rounded-xl border border-line bg-sand px-3 py-2">
              <code className="flex-1 truncate text-[11px] font-semibold text-accent">{url}</code>
              <CopyBtn text={url} />
            </div>

            {/* Preview link */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1.5 text-center text-[10px] font-semibold text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-accent"
            >
              Preview ↗
            </a>
          </div>
        );
      })}
    </div>
  );
}
