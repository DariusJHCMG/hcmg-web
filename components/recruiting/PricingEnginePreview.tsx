"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Load the Zeitro iframe client-only — server has nothing to render for it.
const ZeitroPricingEmbed = dynamic(() => import("@/components/zeitro/ZeitroPricingEmbed"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[640px] items-center justify-center rounded-2xl border border-line bg-white">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-line border-t-accent" />
        <p className="text-sm font-semibold text-muted">Loading pricing engine…</p>
      </div>
    </div>
  ),
});

// localStorage key — once an NMLS is captured, the gate stays unlocked on
// future visits. Captured NMLS is also exposed in the unlocked-by chip.
const STORAGE_KEY = "hcmg-pricing-unlocked-nmls";

export function PricingEnginePreview() {
  const [hydrated, setHydrated] = useState(false);
  const [unlockedNmls, setUnlockedNmls] = useState<string | null>(null);

  useEffect(() => {
    setHydrated(true);
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setUnlockedNmls(stored);
    } catch {
      /* localStorage unavailable — gate just stays up. */
    }
  }, []);

  function handleUnlock(nmls: string) {
    try {
      window.localStorage.setItem(STORAGE_KEY, nmls);
    } catch {
      /* ignore — still unlock for this session */
    }
    setUnlockedNmls(nmls);
    // ▶ Future: POST { nmls, source: "pricing-gate" } to a backend endpoint
    //   so recruiting can see who unlocked the engine. Currently frontend-only.
  }

  function handleReset() {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setUnlockedNmls(null);
  }

  const locked = !unlockedNmls;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-line bg-white shadow-card">
      {/* Navy top band */}
      <div className="bg-brand px-5 py-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent">
              HCMG Pricing Engine
            </div>
            <div className="mt-0.5 text-sm font-bold text-white">
              Lender rates, your comp grid, and net commission in one screen
            </div>
          </div>
          {hydrated && unlockedNmls && (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Unlocked · NMLS #{unlockedNmls}
              </span>
              <button
                onClick={handleReset}
                className="text-[11px] font-semibold text-white/60 underline hover:text-white"
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Body — Zeitro embed once unlocked, blurred placeholder while locked */}
      <div className="p-4 sm:p-6">
        {!locked && hydrated ? (
          <ZeitroPricingEmbed />
        ) : (
          // Placeholder dimensions matching the embed so the gate has the same
          // footprint as the live engine. Blurred to imply locked content.
          <div
            className="min-h-[640px] rounded-2xl border border-line bg-sand"
            aria-hidden
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, rgba(20,40,80,0.03) 0 16px, transparent 16px 32px), repeating-linear-gradient(0deg, rgba(20,40,80,0.03) 0 16px, transparent 16px 32px)",
            }}
          />
        )}

        <p className="mt-4 text-[11px] leading-relaxed text-muted/70">
          Pricing illustrations for licensed loan officers only. Rates, pricing, compensation, and investor
          availability vary by scenario, credit profile, property, state, and approval. Not a commitment to
          lend. Harris Capital Mortgage Group, LLC · NMLS# 1918223 · Equal Housing Lender.
        </p>
      </div>

      {/* NMLS gate overlay */}
      {locked && <NmlsGate onUnlock={handleUnlock} />}
    </div>
  );
}

function NmlsGate({ onUnlock }: { onUnlock: (nmls: string) => void }) {
  const [nmls, setNmls] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = nmls.trim();
    if (!/^\d{4,9}$/.test(trimmed)) {
      setError("Enter a valid NMLS ID (4 to 9 digits).");
      return;
    }
    onUnlock(trimmed);
  }

  return (
    <div className="absolute inset-x-0 top-[80px] bottom-0 z-10 flex items-start justify-center bg-brand/35 backdrop-blur-sm px-4 pt-10 pb-10 sm:items-center sm:pt-0">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-6 shadow-2xl sm:p-8">
        <div className="text-center">
          <div
            className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-accent"
            style={{ background: "var(--ok-gradient)" }}
            aria-hidden
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6 10V8a6 6 0 0 1 12 0v2m-2 0h-8a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h8a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-xl font-extrabold text-ink sm:text-2xl">Unlock the pricing engine.</h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            Enter your NMLS ID to load HCMG&apos;s pricing engine — lender rates, your comp grid, and net
            commission at every tier.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="nmls-gate-input"
            className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
          >
            NMLS ID
          </label>
          <div className="flex gap-2">
            <input
              id="nmls-gate-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={nmls}
              onChange={(e) => {
                setNmls(e.target.value.replace(/[^0-9]/g, ""));
                if (error) setError("");
              }}
              placeholder="e.g. 1234567"
              className={`h-12 flex-1 rounded-xl border bg-white px-4 text-base font-semibold text-ink outline-none transition focus:ring-2 ${
                error
                  ? "border-red-300 focus:border-red-400 focus:ring-red-200/40"
                  : "border-line focus:border-accent focus:ring-accent/20"
              }`}
              maxLength={9}
            />
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-5 text-sm font-bold text-white transition hover:bg-accent-dark"
            >
              Unlock →
            </button>
          </div>
          {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
          <p className="mt-4 text-[11px] leading-relaxed text-muted/70">
            By unlocking you consent to recruiting outreach from HCMG (NMLS# 1918223). Don&apos;t have an
            NMLS yet?{" "}
            <a href="#apply" className="font-semibold text-accent hover:underline">
              Skip to the application form
            </a>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
