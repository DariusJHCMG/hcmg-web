"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FUNNEL_FAMILIES, FUNNEL_CATALOG } from "@/lib/funnel-catalog";
import type { FunnelFamily, FunnelFamilyDef } from "@/lib/funnel-catalog";

interface Props {
  loSlug: string;
  loName: string;
  siteUrl: string;
  /** Base path for the Analytics → link on each card. Defaults to /portal/funnels. */
  analyticsBasePath?: string;
}

// ── Copy button ────────────────────────────────────────────────────────────────
function CopyBtn({ text, variant = "default" }: { text: string; variant?: "default" | "accent" }) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  async function copy() {
    await navigator.clipboard.writeText(text).catch(() => {});
    setState("copied");
    setTimeout(() => setState("idle"), 2200);
  }

  if (variant === "accent") {
    return (
      <button
        onClick={copy}
        className={`flex-shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all
          ${state === "copied"
            ? "bg-green-500 text-white"
            : "bg-accent text-white hover:bg-accent-dark active:scale-95"
          }`}
      >
        {state === "copied" ? "✓ Copied!" : "Copy link"}
      </button>
    );
  }

  return (
    <button
      onClick={copy}
      className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-[11px] font-bold transition-all
        ${state === "copied"
          ? "border-green-300 bg-green-50 text-green-700"
          : "border-line bg-white text-muted hover:border-accent hover:text-accent"
        }`}
    >
      {state === "copied" ? "✓ Copied" : "Copy"}
    </button>
  );
}

// ── Family accent color map ────────────────────────────────────────────────────
const FAMILY_ACCENT: Record<string, string> = {
  purchase:     "#f59e0b",
  va:           "#3b82f6",
  fha:          "#22c55e",
  "first-time": "#8b5cf6",
  refinance:    "#f97316",
  investor:     "#64748b",
  credit:       "#f43f5e",
  calculator:   "#14b8a6",
};

// ── Main component ─────────────────────────────────────────────────────────────
export function PortalFunnelLibrary({ loSlug, siteUrl: _siteUrl, analyticsBasePath = "/portal/funnels" }: Props) {
  const [activeFamily, setActiveFamily] = useState<FunnelFamily | "all">("all");
  const [search,       setSearch]       = useState("");

  // Always derive the origin from the browser — never trust the env var which may be
  // localhost or wrong. typeof window check makes SSR safe.
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  const baseUrl = `${origin}/go/${loSlug}`;

  function buildUrl(slug: string) {
    return `${origin}/go/${loSlug}/${slug}`;
  }

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
    if (activeFamily !== "all" || search.trim()) return null;
    const map = new Map<FunnelFamily, typeof FUNNEL_CATALOG>();
    for (const f of filtered) {
      if (!map.has(f.family)) map.set(f.family, []);
      map.get(f.family)!.push(f);
    }
    return map;
  }, [activeFamily, filtered, search]);

  return (
    <div className="space-y-6">

      {/* ── Hero header (light version) ──────────────────────────────────────── */}
      <div className="relative -mx-6 -mt-8 mb-2 overflow-hidden border-b border-line bg-white sm:-mx-8">
        {/* Subtle warm glow — replaces the dark blob */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #FF9847 0%, transparent 70%)" }}
        />
        <div
          className="pointer-events-none absolute -left-8 bottom-0 h-40 w-40 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, #F37021 0%, transparent 70%)" }}
        />

        <div className="relative px-6 py-8 sm:px-8 sm:py-10">
          {/* Eyebrow — orange bar + label, same as screenshot */}
          <div className="mb-3 flex items-center gap-2">
            <span
              className="h-[5px] w-7 rounded-full"
              style={{ background: "linear-gradient(90deg,#FF9847,#F37021)" }}
            />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
              Funnel Library
            </span>
          </div>

          {/* Headline — two-line like the screenshot */}
          <h1 className="text-3xl font-extrabold leading-tight text-ink sm:text-4xl">
            Your Personal
            <br />
            <span className="ok-gradient-text">Funnel Links</span>
          </h1>

          <p className="mt-2 max-w-lg text-sm text-muted">
            {FUNNEL_CATALOG.length} trackable links across {FUNNEL_FAMILIES.length} categories.
            Every submission routes directly to you with an instant notification.
          </p>

          {/* Category pills row — same layout as screenshot */}
          <div className="mt-6 flex flex-wrap gap-2">
            {FUNNEL_FAMILIES.map((fam) => {
              const count  = FUNNEL_CATALOG.filter((f) => f.family === fam.key).length;
              const active = activeFamily === fam.key;
              return (
                <button
                  key={fam.key}
                  onClick={() => { setActiveFamily(fam.key); setSearch(""); }}
                  style={active ? {
                    borderColor: "#F37021",
                    background:  "linear-gradient(135deg,#FF9847,#F37021)",
                    color:       "#fff",
                  } : {}}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all
                    ${!active
                      ? "border-line bg-white text-muted hover:border-accent/40 hover:text-ink"
                      : ""
                    }`}
                >
                  <span>{fam.icon}</span>
                  <span>{fam.label}</span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-bold"
                    style={active ? { background: "rgba(255,255,255,0.25)", color: "#fff" } : { background: "#F3F4F6", color: "#6B7280" }}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
            <button
              onClick={() => { setActiveFamily("all"); setSearch(""); }}
              className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all
                ${activeFamily === "all" && !search
                  ? "border-ink bg-ink text-white"
                  : "border-line bg-white text-muted hover:border-ink/30 hover:text-ink"
                }`}
            >
              All · {FUNNEL_CATALOG.length}
            </button>
          </div>
        </div>
      </div>

      {/* ── Your base funnel link ─────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
        {/* Orange top bar */}
        <div className="h-1 w-full ok-gradient-bg" />
        <div className="p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold text-ink">Your Personal Funnel Link</p>
              <p className="mt-0.5 text-xs text-muted">
                General catch-all — works for any campaign. Share on social, email, or bio.
              </p>
            </div>
            <span className="flex-shrink-0 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-[10px] font-bold text-green-700">
              Active
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-line bg-sand px-4 py-3">
            <code className="flex-1 min-w-0 break-all text-sm font-semibold text-accent">{baseUrl}</code>
            <CopyBtn text={baseUrl} variant="accent" />
          </div>

          <p className="mt-2 text-[11px] text-muted/60">
            UTM tracking is added automatically when this link is clicked.
          </p>
        </div>
      </div>

      {/* ── Search ───────────────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="relative">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (e.target.value) setActiveFamily("all"); }}
            placeholder="Search — VA loan, DSCR, first-time buyer, cash-out…"
            className="w-full rounded-xl border border-line bg-white py-3 pl-11 pr-10 text-sm text-ink
              placeholder:text-muted/50 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/10 shadow-soft"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-muted hover:text-ink"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-xs text-muted">
          {search
            ? `${filtered.length} result${filtered.length !== 1 ? "s" : ""} for "${search}"`
            : `${filtered.length} funnels`}
        </p>
      </div>

      {/* ── No results ───────────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <div className="rounded-2xl border border-line bg-white py-14 text-center shadow-soft">
          <p className="text-2xl">🔍</p>
          <p className="mt-2 text-sm font-semibold text-ink">No funnels match &ldquo;{search}&rdquo;</p>
          <button onClick={() => setSearch("")}
            className="mt-2 text-xs font-semibold text-accent hover:underline">
            Clear search
          </button>
        </div>
      )}

      {/* ── Grouped (all families, no search) ────────────────────────────────── */}
      {grouped && filtered.length > 0 && (
        <div className="space-y-10">
          {FUNNEL_FAMILIES.map((fam) => {
            const funnels = grouped.get(fam.key);
            if (!funnels || funnels.length === 0) return null;
            return (
              <section key={fam.key}>
                {/* Section header */}
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-base"
                      style={{ background: FAMILY_ACCENT[fam.key] + "18" }}
                    >
                      {fam.icon}
                    </span>
                    <div>
                      <p className="text-sm font-extrabold text-ink">{fam.label}</p>
                      <p className="text-[11px] text-muted">{fam.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveFamily(fam.key)}
                    className="text-xs font-semibold text-accent hover:underline"
                  >
                    View all {funnels.length} →
                  </button>
                </div>
                <FunnelGrid funnels={funnels} buildUrl={buildUrl} fam={fam} analyticsBasePath={analyticsBasePath} />
              </section>
            );
          })}
        </div>
      )}

      {/* ── Single family or search — flat grid ─────────────────────────────── */}
      {!grouped && filtered.length > 0 && (() => {
        const fam = FUNNEL_FAMILIES.find((f) => f.key === activeFamily) ?? FUNNEL_FAMILIES[0];
        return (
          <div>
            {search && (
              <p className="mb-4 text-xs font-semibold text-muted">
                Showing results across all categories
              </p>
            )}
            <FunnelGrid funnels={filtered} buildUrl={buildUrl} fam={fam} analyticsBasePath={analyticsBasePath} />
          </div>
        );
      })()}
    </div>
  );
}

// ── Card grid ──────────────────────────────────────────────────────────────────
function FunnelGrid({
  funnels, buildUrl, fam, analyticsBasePath,
}: {
  funnels: typeof FUNNEL_CATALOG;
  buildUrl: (slug: string) => string;
  fam: FunnelFamilyDef;
  analyticsBasePath: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {funnels.map((f) => (
        <FunnelCard key={f.slug} f={f} url={buildUrl(f.slug)} fam={fam} analyticsBasePath={analyticsBasePath} />
      ))}
    </div>
  );
}

// ── Individual card ────────────────────────────────────────────────────────────
function FunnelCard({
  f, url, fam, analyticsBasePath,
}: {
  f: typeof FUNNEL_CATALOG[number];
  url: string;
  fam: FunnelFamilyDef;
  analyticsBasePath: string;
}) {
  const [preview, setPreview] = useState(false);
  const accent = FAMILY_ACCENT[fam.key] ?? "#F37021";

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-soft transition-all hover:border-accent/30 hover:shadow-card">
      {/* Top color stripe */}
      <div className="h-[3px] w-full flex-shrink-0" style={{ background: accent }} />

      <div className="flex flex-1 flex-col p-4">
        {/* Title + badge */}
        <div className="mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-sm font-extrabold text-ink leading-snug">{f.label}</span>
            {f.badge && (
              <span
                className="inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                style={{ borderColor: accent + "40", background: accent + "12", color: accent }}
              >
                {f.badge}
              </span>
            )}
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-muted line-clamp-2">{f.subhead}</p>
        </div>

        {/* Preview hook */}
        {preview && (
          <div className="mb-3 rounded-xl border border-line bg-sand px-3 py-2.5">
            <p className="mb-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted/60">
              What visitors see
            </p>
            <p className="text-xs font-semibold text-ink">&ldquo;{f.headline}&rdquo;</p>
          </div>
        )}

        {/* Full URL */}
        <div className="mt-auto space-y-2">
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-sand px-3 py-2.5">
            <code className="break-all text-[11px] font-semibold leading-relaxed text-accent">{url}</code>
            <div className="flex items-center justify-end">
              <CopyBtn text={url} />
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPreview((v) => !v)}
              className="rounded-xl border border-line bg-white px-3 py-2 text-[11px] font-semibold text-muted transition-all hover:border-accent/30 hover:text-accent"
            >
              {preview ? "Hide ↑" : "Preview ↓"}
            </button>
            <Link
              href={`${analyticsBasePath}/${f.slug}`}
              className="flex-1 rounded-xl border py-2 text-center text-[11px] font-bold transition-all hover:opacity-90"
              style={{ borderColor: accent + "50", background: accent + "12", color: accent }}
            >
              Analytics →
            </Link>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-line bg-white px-3 py-2 text-[11px] font-semibold text-muted transition-all hover:border-accent/30 hover:text-accent"
            >
              Open ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
