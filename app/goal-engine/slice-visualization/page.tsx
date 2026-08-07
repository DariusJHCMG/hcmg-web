/**
 * /goal-engine/slice-visualization — THE SLICE of the Pie
 * Dedicated page for the signature pie chart visualization.
 * Data fetched client-side from /api/goal-engine/war-room-data so it auto-refreshes.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { SliceOfThePie, type PieSlice } from "@/components/goal-engine/SliceOfThePie";

const C = {
  navy:   "#142850",
  orange: "#F37021",
  ink:    "#1A2B42",
  muted:  "#64748B",
  line:   "#E2E8F0",
  sand:   "#F8FAFC",
  white:  "#ffffff",
};

const REFRESH_SEC = 60;

function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export default function SliceVisualizationPage() {
  const [goalVol,    setGoalVol]    = useState(0);
  const [slices,     setSlices]     = useState<PieSlice[]>([]);
  const [monthLabel, setMonthLabel] = useState("");
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState("");
  const [counter,    setCounter]    = useState(REFRESH_SEC);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/goal-engine/war-room-data", { cache: "no-store" });
      if (!r.ok) { setError("Failed to load data."); return; }
      const d = await r.json();

      if (!d.goal) { setError("No active goal this month."); setLoading(false); return; }

      setGoalVol(Number(d.goal.funded_volume_goal ?? 0));
      setMonthLabel(String(d.goal.month_label ?? ""));
      // Only pass LOs who have committed to the pie chart —
      // zero-commitment rows have a 0° arc and pollute the legend.
      const allRows = (d.leaderboard ?? []).map((row: Record<string, unknown>) => ({
        profile_id:               String(row.profile_id ?? ""),
        full_name:                String(row.full_name  ?? ""),
        avatar_url:               row.avatar_url ? String(row.avatar_url) : null,
        funded_volume_commitment: Number(row.funded_volume_commitment ?? 0),
        funded_volume_actual:     Number(row.funded_volume_actual     ?? 0),
        funded_units_actual:      Number(row.funded_units_actual      ?? 0),
      }));
      setSlices(allRows.filter((r: PieSlice) => r.funded_volume_commitment > 0));
      setLastUpdate(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
      setError(null);
    } catch {
      setError("Network error — could not load pie data.");
    } finally {
      setLoading(false);
      setCounter(REFRESH_SEC);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setInterval(() => {
      setCounter(c => {
        if (c <= 1) { load(); return REFRESH_SEC; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <div style={{
      minHeight: "100vh",
      background: C.sand,
      fontFamily: "Montserrat,'Helvetica Neue',system-ui,sans-serif",
      color: C.ink,
    }}>

      {/* ── Page header ── */}
      <div style={{
        background: C.white,
        borderBottom: `1px solid ${C.line}`,
        padding: "0 32px",
        height: 68,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderTop: `3px solid ${C.orange}`,
        position: "sticky", top: 0, zIndex: 20,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Icon block */}
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: `linear-gradient(135deg, ${C.orange}, #FF9847)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 22, flexShrink: 0,
            boxShadow: "0 4px 14px rgba(243,112,33,0.35)",
          }}>
            🥧
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 900, color: C.navy, letterSpacing: "-.3px", lineHeight: 1.1 }}>
              Slice of the Pie
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted, fontWeight: 600 }}>
              {monthLabel || "Loading…"} · Each LO&apos;s funded commitment visualized
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastUpdate && (
            <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>
              Updated {lastUpdate} · refresh in {counter}s
            </span>
          )}
          <button
            onClick={load}
            style={{
              padding: "7px 16px", borderRadius: 10,
              border: `1px solid ${C.line}`,
              background: C.white, color: C.muted,
              fontSize: 12, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            ↻ Refresh
          </button>
          <a href="/goal-engine/dashboard" style={{
            padding: "7px 16px", borderRadius: 10, textDecoration: "none",
            background: C.navy, color: "#fff",
            fontSize: 12, fontWeight: 700,
          }}>
            ← Dashboard
          </a>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 64px" }}>

        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🥧</div>
            <p style={{ fontSize: 16, fontWeight: 700, color: C.muted }}>Loading the pie…</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: C.navy }}>{error}</h2>
            <p style={{ margin: "0 0 24px", fontSize: 14, color: C.muted }}>Leadership will set the next monthly goal soon.</p>
            <button onClick={load} style={{
              padding: "10px 22px", borderRadius: 12,
              background: C.orange, color: "#fff",
              border: "none", fontSize: 13, fontWeight: 800,
              cursor: "pointer", fontFamily: "inherit",
            }}>Try again</button>
          </div>
        ) : slices.length === 0 ? (
          /* ── No commitments yet ── */
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🥧</div>
            <h2 style={{ margin: "0 0 8px", fontSize: 24, fontWeight: 900, color: C.navy }}>
              The Pie Is Unclaimed
            </h2>
            <p style={{ margin: "0 0 8px", fontSize: 15, color: C.muted, lineHeight: 1.8, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>
              No Loan Officers have submitted their commitment yet for {monthLabel}.
              The full <strong style={{ color: C.navy }}>{fmt$(goalVol)}</strong> goal is available.
            </p>
            <p style={{ margin: "0 0 28px", fontSize: 14, color: C.muted }}>
              Be the first — claim your slice.
            </p>
            <a href="/goal-engine/commit" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 30px", borderRadius: 14, textDecoration: "none",
              background: `linear-gradient(135deg, #FF9847, ${C.orange})`,
              color: "#fff", fontSize: 15, fontWeight: 800,
              boxShadow: "0 8px 28px rgba(243,112,33,0.4)",
            }}>
              🥧 Claim My Slice
            </a>
          </div>
        ) : (
          <>
            {/* ── Intro banner ── */}
            <div style={{
              background: C.navy,
              borderRadius: 20,
              padding: "28px 32px",
              marginBottom: 28,
              display: "flex", alignItems: "center", justifyContent: "space-between",
              flexWrap: "wrap", gap: 20,
              boxShadow: "0 8px 40px rgba(20,40,80,0.2)",
            }}>
              <div>
                <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: C.orange }}>
                  {monthLabel} · Slice of the Pie
                </p>
                <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
                  Every Slice Matters
                </h2>
                <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: 520 }}>
                  The full pie represents our {fmt$(goalVol)} company goal. Each LO&apos;s commitment is a slice.
                  The inner ring fills green as loans fund. Hover or tap any slice to see detail.
                </p>
              </div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <a href="/goal-engine/commit" style={{
                  padding: "10px 22px", borderRadius: 12,
                  background: `linear-gradient(135deg, #FF9847, ${C.orange})`,
                  color: "#fff", fontSize: 13, fontWeight: 800,
                  textDecoration: "none",
                  boxShadow: "0 4px 16px rgba(243,112,33,0.4)",
                }}>
                  🥧 My Commitment
                </a>
                <a href="/goal-engine/the-slice" style={{
                  padding: "10px 22px", borderRadius: 12,
                  border: "1.5px solid rgba(255,255,255,0.2)",
                  color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: 700,
                  textDecoration: "none",
                }}>
                  📺 Live Board
                </a>
              </div>
            </div>

            {/* ── The main visualization ── */}
            <div style={{
              background: C.white,
              borderRadius: 24,
              border: `1px solid ${C.line}`,
              padding: "32px 28px",
              boxShadow: "0 2px 16px rgba(15,23,42,0.07)",
            }}>
              {/* Section label */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 24 }}>🥧</span>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 900, color: C.navy, letterSpacing: "-.3px" }}>
                      Slice of the Pie
                    </h2>
                    <span style={{
                      padding: "3px 10px", borderRadius: 99,
                      background: "rgba(243,112,33,0.1)", color: C.orange,
                      fontSize: 10, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase",
                    }}>
                      {slices.length} LO{slices.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                    Outer ring = funded commitment · Inner arc = actual funded progress ·{" "}
                    <span style={{ color: "#22c55e", fontWeight: 700 }}>Green</span> on-pace ·{" "}
                    <span style={{ color: "#f59e0b", fontWeight: 700 }}>Amber</span> behind ·{" "}
                    <span style={{ color: "#ef4444", fontWeight: 700 }}>Red</span> off-track
                  </p>
                </div>
              </div>

              <SliceOfThePie goalVol={goalVol} slices={slices} />
            </div>

            {/* ── Contextual note ── */}
            <div style={{
              marginTop: 20,
              padding: "16px 20px",
              borderRadius: 14,
              background: "rgba(243,112,33,0.05)",
              border: "1px solid rgba(243,112,33,0.15)",
              display: "flex", gap: 14, alignItems: "flex-start",
            }}>
              <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.3 }}>💡</span>
              <p style={{ margin: 0, fontSize: 13, color: C.ink, lineHeight: 1.7 }}>
                <strong>How to read this chart:</strong> The outer donut ring shows each LO&apos;s{" "}
                <em>committed</em> funded volume as a slice of the company goal. The inner arc inside each slice
                shows how much has <em>actually funded</em> so far — filling up from the left edge of their slice.
                The dashed grey area is unclaimed company goal that no LO has committed to yet.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
