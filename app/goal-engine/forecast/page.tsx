"use client";

/**
 * /goal-engine/forecast — SLICE Forecast Center
 * Executive-grade forecasting dashboard for CLO / admin.
 * Phase 1: pace-based linear projection.
 * Designed to answer "Are we going to hit goal?" in < 5 seconds.
 */

import { useState, useEffect, useCallback, useRef } from "react";

// ── Design tokens ─────────────────────────────────────────────────
const C = {
  navy:    "#142850",
  orange:  "#F37021",
  ink:     "#1A2B42",
  muted:   "#64748B",
  line:    "#E2E8F0",
  sand:    "#F8FAFC",
  white:   "#ffffff",
  green:   "#16a34a",
  greenBg: "#dcfce7",
  yellow:  "#d97706",
  yellowBg:"#fef9c3",
  red:     "#dc2626",
  redBg:   "#fee2e2",
};

// ── Helpers ───────────────────────────────────────────────────────
function fmt$(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000)     return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
}
function fmt$short(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}$${Math.round(abs / 1_000)}K`;
  return `${sign}$${Math.round(abs)}`;
}

type ConfidenceTier = "high" | "medium" | "low";
function tierColor(tier: ConfidenceTier): string {
  return tier === "high" ? C.green : tier === "medium" ? C.yellow : C.red;
}
function tierBg(tier: ConfidenceTier): string {
  return tier === "high" ? C.greenBg : tier === "medium" ? C.yellowBg : C.redBg;
}
function paceColor(pct: number): string {
  return pct >= 100 ? C.green : pct >= 80 ? C.yellow : C.red;
}
function paceBg(pct: number): string {
  return pct >= 100 ? C.greenBg : pct >= 80 ? C.yellowBg : C.redBg;
}

// ── Animated number counter ───────────────────────────────────────
function useCountUp(target: number, duration = 900): number {
  const [val, setVal] = useState(0);
  const frame = useRef<number | null>(null);
  const start = useRef<number | null>(null);
  const from  = useRef(0);

  useEffect(() => {
    from.current = val;
    start.current = null;
    function animate(ts: number) {
      if (!start.current) start.current = ts;
      const elapsed = ts - start.current;
      const progress = Math.min(1, elapsed / duration);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setVal(Math.round(from.current + (target - from.current) * ease));
      if (progress < 1) frame.current = requestAnimationFrame(animate);
    }
    frame.current = requestAnimationFrame(animate);
    return () => { if (frame.current) cancelAnimationFrame(frame.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return val;
}

// ── Types ─────────────────────────────────────────────────────────
interface LOForecast {
  profile_id: string;
  full_name: string;
  avatar_url: string | null;
  funded_volume_commitment: number;
  funded_volume_actual: number;
  funded_units_actual: number;
  forecast_volume: number;
  forecast_gap: number;
  forecast_pct: number;
  pace_pct: number;
  relative_pace: number;
  confidence: number;
  confidence_tier: ConfidenceTier;
}

interface ForecastData {
  goal_month_id: string;
  month_label: string;
  start_date: string;
  end_date: string;
  goal_vol: number;
  goal_units: number;
  actual_vol: number;
  actual_units: number;
  committed_vol: number;
  forecast_vol: number;
  forecast_units: number;
  forecast_gap: number;
  loans_to_close_gap: number;
  avg_loan_size: number;
  elapsed_pct: number;
  days_elapsed: number;
  days_total: number;
  days_remaining: number;
  company_pace: number;
  required_pct: number;
  actual_pct: number;
  confidence: number;
  confidence_tier: ConfidenceTier;
  confidence_color: string;
  app_vol_actual: number;
  app_units_actual: number;
  app_vol_goal: number;
  app_unit_goal: number;
  forecast_app_vol: number;
  forecast_app_units: number;
  avg_revenue_bps: number;
  projected_revenue: number;
  projected_net: number;
  participation_count: number;
  total_los: number;
  participation_pct: number;
  top_risk: LOForecast | null;
  top_opportunity: LOForecast | null;
  trend_days: Array<{ date: string; daily: number; cumulative: number; goal: number }>;
}

// ── Small atoms ───────────────────────────────────────────────────
function Avatar({ name, url, size = 36 }: { name: string; url?: string | null; size?: number }) {
  return url
    ? <img src={url} alt={name} style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0, border: `2px solid ${C.line}` }} />
    : <div style={{ width: size, height: size, borderRadius: "50%", background: `linear-gradient(135deg,#FF9847,${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.33, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
        {name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join("").toUpperCase()}
      </div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: "0 0 16px", fontSize: 10, fontWeight: 800, letterSpacing: ".2em", textTransform: "uppercase", color: C.muted }}>{children}</p>;
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: C.white,
      border: `1px solid ${C.line}`,
      borderRadius: 20,
      boxShadow: "0 2px 12px rgba(15,23,42,0.06)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// Thin bar with animated fill
function Bar({ pct, color, height = 8 }: { pct: number; color: string; height?: number }) {
  const c = Math.min(100, Math.max(0, pct));
  return (
    <div style={{ background: C.line, borderRadius: 99, height, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${c}%`, background: color, borderRadius: 99, transition: "width 1s cubic-bezier(.4,0,.2,1)" }} />
    </div>
  );
}

// Confidence arc (SVG semicircle gauge)
function ConfidenceGauge({ score, tier }: { score: number; tier: ConfidenceTier }) {
  const color = tierColor(tier);
  const r = 54, cx = 70, cy = 70;
  const circumference = Math.PI * r; // semicircle
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg viewBox="0 0 140 80" style={{ width: 140, height: 80, overflow: "visible" }}>
        {/* Track */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={C.line} strokeWidth={10} strokeLinecap="round" />
        {/* Fill */}
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
          fill="none" stroke={color} strokeWidth={10} strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)" }} />
        {/* Label */}
        <text x={cx} y={cy - 8} textAnchor="middle" fontSize={24} fontWeight={900} fill={C.navy}>{score}%</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.muted} letterSpacing="1">
          {tier.toUpperCase()}
        </text>
      </svg>
    </div>
  );
}

// Sparkline SVG from trend_days
function Sparkline({ data, color = C.orange, height = 40 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return <div style={{ height }} />;
  const max = Math.max(...data, 1);
  const w = 120;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = height - (v / max) * (height - 6) - 3;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${height}`} style={{ width: "100%", maxWidth: 120, height }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// What-If simulator row
function SimRow({ label, delta, base, goal }: { label: string; delta: number; base: number; goal: number }) {
  const sim = base + delta;
  const newPct = goal > 0 ? Math.round((sim / goal) * 100) : 0;
  const diff = sim - base;
  return (
    <button style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "11px 14px", borderRadius: 12,
      border: `1.5px solid ${C.line}`,
      background: C.white, cursor: "pointer", fontFamily: "inherit",
      width: "100%", textAlign: "left",
      transition: "border-color .15s, background .15s",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.orange; (e.currentTarget as HTMLButtonElement).style.background = "rgba(243,112,33,0.04)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = C.line; (e.currentTarget as HTMLButtonElement).style.background = C.white; }}
    >
      <span style={{ fontSize: 13, fontWeight: 700, color: C.ink }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 12, color: C.muted }}>→ {fmt$short(sim)}</span>
        <span style={{ fontSize: 12, fontWeight: 800, color: newPct >= 100 ? C.green : C.yellow }}>{newPct}%</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: diff > 0 ? C.green : C.red }}>
          {diff > 0 ? "+" : ""}{fmt$short(diff)}
        </span>
      </div>
    </button>
  );
}

// ── Main page ─────────────────────────────────────────────────────
export default function ForecastCenterPage() {
  const [forecast,     setForecast]     = useState<ForecastData | null>(null);
  const [loForecasts,  setLoForecasts]  = useState<LOForecast[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState<string | null>(null);
  const [lastUpdate,   setLastUpdate]   = useState("");
  const [sortLO,       setSortLO]       = useState<"forecast" | "pct" | "volume" | "risk">("forecast");
  const [simMode,      setSimMode]      = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/goal-engine/forecast", { cache: "no-store" });
      const d = await r.json();
      if (!r.ok) { setError(d.error ?? "Failed to load forecast."); return; }
      if (!d.forecast) { setError(d.message ?? "No active goal."); return; }
      setForecast(d.forecast);
      setLoForecasts(d.lo_forecasts ?? []);
      setLastUpdate(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
      setError(null);
    } catch { setError("Network error."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Animated counters
  const animForecast = useCountUp(forecast?.forecast_vol    ?? 0);
  const animActual   = useCountUp(forecast?.actual_vol      ?? 0);
  const animGap      = useCountUp(Math.abs(forecast?.forecast_gap ?? 0));
  const animConf     = useCountUp(forecast?.confidence      ?? 0, 1200);

  // Sorted LO list
  const sortedLOs = [...loForecasts].sort((a, b) => {
    if (sortLO === "pct")     return b.forecast_pct   - a.forecast_pct;
    if (sortLO === "volume")  return b.forecast_volume - a.forecast_volume;
    if (sortLO === "risk")    return a.forecast_pct   - b.forecast_pct;
    return b.forecast_volume - a.forecast_volume;
  });

  // Trend sparkline (cumulative daily funded)
  const sparkData = forecast?.trend_days.map(d => d.cumulative) ?? [];

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontFamily: "Montserrat,system-ui,sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <p style={{ fontSize: 15, fontWeight: 700, color: C.muted }}>Building forecast…</p>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10 }}>
          {[1,2,3].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: C.orange, animation: `pulse 1.4s ${i*0.2}s infinite` }} />)}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}`}</style>
    </div>
  );

  if (error || !forecast) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", fontFamily: "Montserrat,system-ui,sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 22, fontWeight: 900, color: C.navy }}>{error ?? "No active goal"}</h2>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: C.muted }}>Forecast requires a published monthly goal.</p>
        <a href="/goal-engine/admin" style={{ padding: "11px 24px", borderRadius: 12, textDecoration: "none", background: C.orange, color: "#fff", fontSize: 13, fontWeight: 800 }}>Create Goal →</a>
      </div>
    </div>
  );

  const fc          = forecast;
  const gapPositive = fc.forecast_gap >= 0;
  const paceColor_v = paceColor(fc.company_pace);
  const confTier    = fc.confidence_tier;

  return (
    <div style={{ fontFamily: "Montserrat,'Helvetica Neue',system-ui,sans-serif", color: C.ink, maxWidth: 1280, margin: "0 auto", padding: "28px 24px 80px" }}>
      <style>{`
        @keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fc-hero{display:grid;grid-template-columns:repeat(7,1fr);gap:14px}
        .fc-mid{display:grid;grid-template-columns:2fr 1fr;gap:20px}
        .fc-lo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
        @media(max-width:1200px){.fc-hero{grid-template-columns:repeat(4,1fr)!important}}
        @media(max-width:860px){.fc-mid{grid-template-columns:1fr!important}.fc-hero{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:500px){.fc-hero{grid-template-columns:1fr!important}}
        .lo-card:hover{border-color:${C.orange}!important;box-shadow:0 4px 20px rgba(243,112,33,0.12)!important}
        .sim-disclaimer{animation:fadeIn .3s ease}
      `}</style>

      {/* ── Page header ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <a href="/goal-engine/admin/dashboard" style={{ fontSize: 12, fontWeight: 700, color: C.muted, textDecoration: "none" }}>← Manager Dashboard</a>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10 }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${C.navy}, #1e3a5f)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: "0 4px 16px rgba(20,40,80,0.25)" }}>
              📈
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: C.navy, letterSpacing: "-.4px", lineHeight: 1.1 }}>
                Forecast Center
              </h1>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: C.muted, fontWeight: 600 }}>
                {fc.month_label} · Phase 1 — Pace-based projection · Updated {lastUpdate}
              </p>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            onClick={() => setSimMode(s => !s)}
            style={{
              padding: "9px 18px", borderRadius: 12,
              border: `1.5px solid ${simMode ? C.orange : C.line}`,
              background: simMode ? "rgba(243,112,33,0.07)" : C.white,
              color: simMode ? C.orange : C.muted,
              fontSize: 12, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            {simMode ? "✓ Sim Mode ON" : "What-If Simulator"}
          </button>
          <button onClick={load} style={{ padding: "9px 16px", borderRadius: 12, border: `1px solid ${C.line}`, background: C.white, color: C.muted, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            ↻ Refresh
          </button>
          <a href="/goal-engine/admin/production" style={{ padding: "9px 16px", borderRadius: 12, background: C.navy, color: "#fff", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            🔧 Corrections
          </a>
        </div>
      </div>

      {/* ── HERO KPI cards ── */}
      <div className="fc-hero" style={{ marginBottom: 24 }}>
        {[
          {
            label:   "Company Goal",
            value:   fmt$(fc.goal_vol),
            sub:     `${fc.goal_units} loans`,
            bg:      C.navy,
            dark:    true,
          },
          {
            label:   "Forecast Finish",
            value:   fmt$short(animForecast),
            sub:     `${Math.round((fc.forecast_vol / fc.goal_vol) * 100)}% of goal`,
            accent:  !gapPositive,
          },
          {
            label:   gapPositive ? "Forecast Surplus" : "Forecast Gap",
            value:   (gapPositive ? "+" : "-") + fmt$short(animGap),
            sub:     fc.loans_to_close_gap > 0 ? `≈ ${fc.loans_to_close_gap} avg loans needed` : "On track to exceed goal",
            green:   gapPositive,
            red:     !gapPositive,
          },
          {
            label:   "Forecast Confidence",
            value:   `${animConf}%`,
            sub:     confTier === "high" ? "High Confidence" : confTier === "medium" ? "Moderate Confidence" : "Low Confidence",
            conf:    confTier,
          },
          {
            label:   "Days Remaining",
            value:   fc.days_remaining.toString(),
            sub:     `${fc.days_elapsed} of ${fc.days_total} days elapsed`,
          },
          {
            label:   "Company Pace",
            value:   `${fc.company_pace}%`,
            sub:     fc.company_pace >= 100 ? "Ahead of schedule" : fc.company_pace >= 80 ? "Slightly behind" : "Needs acceleration",
            pace:    fc.company_pace,
          },
          {
            label:   "App Volume Pace",
            value:   fc.app_vol_goal > 0 ? `${Math.round((fc.app_vol_actual / fc.app_vol_goal) * 100)}%` : "—",
            sub:     fc.app_vol_goal > 0 ? `${fmt$short(fc.app_vol_actual)} of ${fmt$short(fc.app_vol_goal)}` : "No app goal set",
            pace:    fc.app_vol_goal > 0 ? Math.round((fc.app_vol_actual / fc.app_vol_goal) * 100) : null as unknown as number,
          },
        ].map((card, i) => (
          <div key={i} style={{
            background: card.dark ? C.navy : C.white,
            border: `1px solid ${card.dark ? "rgba(243,112,33,0.2)" : C.line}`,
            borderRadius: 20,
            padding: "22px 20px",
            boxShadow: card.dark ? "0 8px 32px rgba(20,40,80,0.25)" : "0 2px 8px rgba(15,23,42,0.05)",
            animation: `fadeIn .4s ${i * 0.06}s both`,
            position: "relative", overflow: "hidden",
          }}>
            {/* Subtle top accent line */}
            {!card.dark && (
              <div style={{ position: "absolute", top: 0, left: 20, right: 20, height: 3, borderRadius: "0 0 3px 3px", background: card.conf ? tierColor(card.conf as ConfidenceTier) : card.pace != null ? paceColor(card.pace) : card.green ? C.green : card.red ? C.red : C.orange, opacity: 0.6 }} />
            )}
            <p style={{ margin: "0 0 8px", fontSize: 9, fontWeight: 800, letterSpacing: ".18em", textTransform: "uppercase", color: card.dark ? "rgba(255,255,255,0.45)" : C.muted }}>
              {card.label}
            </p>
            <p style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 900, lineHeight: 1, color: card.dark ? "#fff" : card.conf ? tierColor(card.conf as ConfidenceTier) : card.pace != null ? paceColor(card.pace) : card.green ? C.green : card.red ? C.red : C.ink }}>
              {card.value}
            </p>
            <p style={{ margin: 0, fontSize: 11, color: card.dark ? "rgba(255,255,255,0.4)" : C.muted, lineHeight: 1.5 }}>
              {card.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Forecast progress visualization ── */}
      <Card style={{ padding: "28px 32px", marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <SectionLabel>Forecast Progress</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 5,
                padding: "4px 12px", borderRadius: 99,
                background: paceBg(fc.company_pace),
                color: paceColor(fc.company_pace),
                fontSize: 11, fontWeight: 800,
                border: `1px solid ${paceColor(fc.company_pace)}40`,
              }}>
                {fc.company_pace >= 100 ? "🟢" : fc.company_pace >= 80 ? "🟡" : "🔴"} {fc.company_pace >= 100 ? "On Pace" : fc.company_pace >= 80 ? "Slightly Behind" : "Off Track"} · {fc.company_pace}%
              </span>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>
                {fc.elapsed_pct}% of month elapsed
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {[
              { label: "Goal", color: C.navy },
              { label: "Actual", color: C.orange },
              { label: "Forecast", color: gapPositive ? C.green : C.red },
              { label: "Committed", color: "#3b82f6" },
            ].map(l => (
              <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main stacked bar visualization */}
        <div style={{ position: "relative", marginBottom: 12 }}>
          {/* Label row */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.muted }}>$0</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: C.navy }}>{fmt$short(fc.goal_vol)}</span>
          </div>

          {/* Goal track */}
          <div style={{ position: "relative", height: 44, background: C.sand, borderRadius: 12, border: `1px solid ${C.line}`, overflow: "hidden", marginBottom: 10 }}>
            {/* Committed bar (blue) */}
            <div style={{
              position: "absolute", top: 0, left: 0, height: "100%",
              width: `${Math.min(100, (fc.committed_vol / fc.goal_vol) * 100)}%`,
              background: "linear-gradient(90deg, #3b82f6, #60a5fa)",
              opacity: 0.25,
              transition: "width 1s ease",
            }} />
            {/* Actual funded bar (orange) */}
            <div style={{
              position: "absolute", top: 0, left: 0, height: "100%",
              width: `${Math.min(100, (fc.actual_vol / fc.goal_vol) * 100)}%`,
              background: `linear-gradient(90deg, ${C.orange}, #FF9847)`,
              transition: "width 1.2s ease",
              display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 10,
            }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: "#fff", whiteSpace: "nowrap" }}>
                {fmt$short(fc.actual_vol)}
              </span>
            </div>
            {/* Forecast projection (dashed extension) */}
            {fc.forecast_vol > fc.actual_vol && (
              <div style={{
                position: "absolute", top: "25%", height: "50%",
                left: `${Math.min(99, (fc.actual_vol / fc.goal_vol) * 100)}%`,
                width: `${Math.min(100 - (fc.actual_vol / fc.goal_vol) * 100, ((fc.forecast_vol - fc.actual_vol) / fc.goal_vol) * 100)}%`,
                borderTop: `2px dashed ${gapPositive ? C.green : C.red}`,
                borderBottom: `2px dashed ${gapPositive ? C.green : C.red}`,
                background: gapPositive ? "rgba(22,163,74,0.08)" : "rgba(220,38,38,0.07)",
                transition: "width 1s ease",
              }} />
            )}
            {/* Goal marker line */}
            <div style={{ position: "absolute", top: 0, right: 0, width: 3, height: "100%", background: C.navy, opacity: 0.5 }} />
          </div>

          {/* Three-row label */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Actual Vol",    value: fmt$short(fc.actual_vol),     pct: fc.actual_pct,    color: C.orange },
              { label: "Funded Units",  value: `${fc.actual_units} loans`,   pct: fc.goal_units > 0 ? Math.round((fc.actual_units / fc.goal_units) * 100) : null, color: C.navy },
              { label: "Forecast",      value: fmt$short(fc.forecast_vol),   pct: Math.round((fc.forecast_vol / fc.goal_vol) * 100), color: gapPositive ? C.green : C.red },
              { label: "Committed",     value: fmt$short(fc.committed_vol),  pct: Math.round((fc.committed_vol / fc.goal_vol) * 100), color: "#3b82f6" },
              { label: "Still Need",    value: fmt$short(Math.max(0, fc.goal_vol - fc.actual_vol)), pct: null, color: C.muted },
            ].map(r => (
              <div key={r.label} style={{ padding: "10px 14px", borderRadius: 10, background: C.sand, border: `1px solid ${C.line}` }}>
                <p style={{ margin: "0 0 3px", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted }}>{r.label}</p>
                <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: r.color, lineHeight: 1 }}>{r.value}</p>
                {r.pct != null && <p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted }}>{r.pct}% of goal</p>}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Middle row: Confidence + Forecast Gap + Revenue ── */}
      <div className="fc-mid" style={{ marginBottom: 20 }}>

        {/* Left: Confidence + Applications + Revenue */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Confidence card */}
          <Card style={{ padding: "24px 28px" }}>
            <SectionLabel>Forecast Confidence</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
              <ConfidenceGauge score={fc.confidence} tier={confTier} />
              <div style={{ flex: 1, minWidth: 180 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Month elapsed",   val: `${fc.elapsed_pct}%`,     w: fc.elapsed_pct },
                    { label: "Team committed",   val: `${fc.participation_pct}%`, w: fc.participation_pct },
                    { label: "Overall pace",     val: `${fc.company_pace}%`,    w: Math.min(100, fc.company_pace) },
                  ].map(row => (
                    <div key={row.label}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 10, color: C.muted, fontWeight: 700 }}>{row.label}</span>
                        <span style={{ fontSize: 10, fontWeight: 800, color: C.ink }}>{row.val}</span>
                      </div>
                      <Bar pct={row.w} color={tierColor(confTier)} height={5} />
                    </div>
                  ))}
                </div>
                <p style={{ margin: "12px 0 0", fontSize: 10, color: C.muted, lineHeight: 1.6 }}>
                  Confidence increases as the month progresses and more LOs commit.
                  Phase 2 will incorporate pipeline stage data for higher accuracy.
                </p>
              </div>
            </div>
          </Card>

          {/* Applications forecast — always shown */}
          <Card style={{ padding: "20px 24px" }}>
            <SectionLabel>Application Forecast</SectionLabel>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { l: "App Goal",       v: fc.app_vol_goal > 0 ? fmt$short(fc.app_vol_goal)    : "Not set",  sub: fc.app_unit_goal > 0 ? `${fc.app_unit_goal} apps` : "" },
                { l: "Apps Filed",     v: fmt$short(fc.app_vol_actual),                                       sub: `${fc.app_units_actual} apps` },
                { l: "App Forecast",   v: fc.app_vol_goal > 0 ? fmt$short(fc.forecast_app_vol) : "—",        sub: fc.app_vol_goal > 0 ? `${fc.forecast_app_units} projected` : "Set app goal to enable", accent: true },
              ].map(s => (
                <div key={s.l} style={{ padding: "10px 12px", borderRadius: 10, background: (s as {accent?:boolean}).accent ? C.navy : C.sand, border: `1px solid ${(s as {accent?:boolean}).accent ? "transparent" : C.line}` }}>
                  <p style={{ margin: "0 0 3px", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: (s as {accent?:boolean}).accent ? "rgba(255,255,255,0.45)" : C.muted }}>{s.l}</p>
                  <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: (s as {accent?:boolean}).accent ? "#fff" : C.navy }}>{s.v}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 10, color: (s as {accent?:boolean}).accent ? "rgba(255,255,255,0.4)" : C.muted }}>{s.sub}</p>
                </div>
              ))}
            </div>
            {/* App Vol progress bar */}
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>App Volume</span>
                <span style={{ fontSize: 10, fontWeight: 800, color: C.navy }}>
                  {fc.app_vol_goal > 0 ? `${Math.round((fc.app_vol_actual / fc.app_vol_goal) * 100)}%` : "—"}
                </span>
              </div>
              <Bar pct={fc.app_vol_goal > 0 ? (fc.app_vol_actual / fc.app_vol_goal) * 100 : 0} color={C.navy} height={6} />
            </div>
            {/* App Units progress bar */}
            {fc.app_unit_goal > 0 && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: C.muted }}>App Units ({fc.app_units_actual} / {fc.app_unit_goal})</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: C.navy }}>
                    {Math.round((fc.app_units_actual / fc.app_unit_goal) * 100)}%
                  </span>
                </div>
                <Bar pct={(fc.app_units_actual / fc.app_unit_goal) * 100} color={C.orange} height={6} />
              </div>
            )}
          </Card>
        </div>

        {/* Right: Gap + Revenue + Risk/Opportunity */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Forecast Gap */}
          <Card style={{ padding: "24px 28px" }}>
            <SectionLabel>Forecast Gap</SectionLabel>
            <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
              <p style={{ margin: 0, fontSize: 42, fontWeight: 900, lineHeight: 1, color: gapPositive ? C.green : C.red }}>
                {gapPositive ? "+" : "-"}{fmt$short(Math.abs(fc.forecast_gap))}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12, color: C.muted }}>vs company goal</p>
            </div>
            {!gapPositive && fc.loans_to_close_gap > 0 && (
              <div style={{ padding: "14px 16px", borderRadius: 12, background: "rgba(243,112,33,0.06)", border: "1px solid rgba(243,112,33,0.2)" }}>
                <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.orange }}>To Close the Gap</p>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: C.navy, lineHeight: 1.2 }}>
                  {fc.loans_to_close_gap} Loan{fc.loans_to_close_gap !== 1 ? "s" : ""}
                </p>
                <p style={{ margin: "3px 0 0", fontSize: 11, color: C.muted }}>at avg size {fmt$short(fc.avg_loan_size)}</p>
              </div>
            )}
            {gapPositive && (
              <div style={{ padding: "12px 14px", borderRadius: 12, background: C.greenBg, border: "1px solid #bbf7d0" }}>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.green }}>
                  🎯 On track to exceed goal by {fmt$short(fc.forecast_gap)}
                </p>
              </div>
            )}
          </Card>

          {/* Revenue forecast */}
          <Card style={{ padding: "20px 24px" }}>
            <SectionLabel>Revenue Forecast</SectionLabel>
            {[
              { l: "Projected Funded",  v: fmt$short(fc.forecast_vol),      highlight: false },
              { l: "Avg Revenue (2.25%)", v: fmt$short(fc.projected_revenue), highlight: false },
              { l: "Projected Net",     v: fmt$short(fc.projected_net),      highlight: true  },
            ].map(s => (
              <div key={s.l} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${C.line}` }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>{s.l}</span>
                <span style={{ fontSize: s.highlight ? 18 : 14, fontWeight: 900, color: s.highlight ? C.green : C.ink }}>{s.v}</span>
              </div>
            ))}
            <p style={{ margin: "8px 0 0", fontSize: 9, color: C.muted, lineHeight: 1.5 }}>
              Revenue = projected funded × 2.25%. Net = revenue × 36.7%. Phase 2 will use actual pull-through rates.
            </p>
          </Card>

          {/* Risk / Opportunity */}
          {(fc.top_risk || fc.top_opportunity) && (
            <Card style={{ padding: "20px 24px" }}>
              <SectionLabel>Risk & Opportunity</SectionLabel>
              {fc.top_risk && (
                <div style={{ marginBottom: 12, padding: "12px 14px", borderRadius: 12, background: "#fff5f5", border: "1px solid #fecaca" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.red }}>🔴 Top Risk</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={fc.top_risk.full_name} url={fc.top_risk.avatar_url} size={32} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.ink }}>{fc.top_risk.full_name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Forecast: {fc.top_risk.forecast_pct}% of commitment</p>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 900, color: C.red }}>{fmt$short(fc.top_risk.forecast_gap)}</span>
                  </div>
                  <p style={{ margin: "8px 0 0", fontSize: 11, color: "#991b1b", fontWeight: 600, lineHeight: 1.5 }}>
                    Recommended: coaching conversation this week
                  </p>
                </div>
              )}
              {fc.top_opportunity && (
                <div style={{ padding: "12px 14px", borderRadius: 12, background: C.greenBg, border: "1px solid #bbf7d0" }}>
                  <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.green }}>🚀 Top Opportunity</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Avatar name={fc.top_opportunity.full_name} url={fc.top_opportunity.avatar_url} size={32} />
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.ink }}>{fc.top_opportunity.full_name}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>Forecast: {fc.top_opportunity.forecast_pct}% of commitment</p>
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 900, color: C.green }}>+{fmt$short(Math.abs(fc.top_opportunity.forecast_gap))}</span>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>

      {/* ── HARRY AI Forecast Card ── */}
      <Card style={{ padding: "28px 32px", marginBottom: 20, borderLeft: `4px solid ${C.orange}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 18, flexWrap: "wrap" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: `linear-gradient(135deg, #FF9847, ${C.orange})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
            H
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 900, color: C.navy }}>HARRY AI</p>
              <span style={{ padding: "2px 8px", borderRadius: 99, background: "rgba(243,112,33,0.1)", color: C.orange, fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase" }}>Forecast Intelligence</span>
            </div>
            <p style={{ margin: "0 0 14px", fontSize: 13, color: C.muted, lineHeight: 1.5 }}>
              Based on current production, HCMG is projected to finish at{" "}
              <strong style={{ color: C.navy }}>{fmt$short(fc.forecast_vol)}</strong>,{" "}
              {gapPositive
                ? <span style={{ color: C.green }}>approximately <strong>{fmt$short(fc.forecast_gap)} above</strong> the company goal.</span>
                : <span style={{ color: C.red }}>approximately <strong>{fmt$short(Math.abs(fc.forecast_gap))} below</strong> the company goal.</span>
              }
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }} className="fc-harry-grid">
              {[
                {
                  label: "Forecast",
                  value: fmt$short(fc.forecast_vol),
                  color: gapPositive ? C.green : C.red,
                },
                {
                  label: "Confidence",
                  value: `${fc.confidence}%`,
                  color: tierColor(confTier),
                },
                {
                  label: "Days Left",
                  value: fc.days_remaining.toString(),
                  color: C.navy,
                },
              ].map(s => (
                <div key={s.label} style={{ padding: "10px 14px", borderRadius: 10, background: C.sand, border: `1px solid ${C.line}` }}>
                  <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 800, letterSpacing: ".12em", textTransform: "uppercase", color: C.muted }}>{s.label}</p>
                  <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {fc.top_risk && fc.top_opportunity && (
              <div style={{ padding: "12px 16px", borderRadius: 12, background: "rgba(243,112,33,0.05)", border: "1px solid rgba(243,112,33,0.15)" }}>
                <p style={{ margin: 0, fontSize: 12, color: C.ink, lineHeight: 1.7 }}>
                  <strong style={{ color: C.orange }}>Recommendation:</strong>{" "}
                  {fc.top_risk.full_name.split(" ")[0]} is the highest risk ({fc.top_risk.forecast_pct}% pace).
                  A 30-minute coaching conversation this week could recover{" "}
                  <strong>{fmt$short(Math.abs(fc.top_risk.forecast_gap) * 0.4)}</strong>{" "}
                  of the projected shortfall.{" "}
                  {fc.top_opportunity.full_name.split(" ")[0]} is carrying strong momentum at{" "}
                  {fc.top_opportunity.forecast_pct}% pace — celebrate publicly to reinforce behavior.
                </p>
              </div>
            )}
          </div>

          {sparkData.length > 2 && (
            <div style={{ alignSelf: "center", flexShrink: 0 }}>
              <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 700, color: C.muted, letterSpacing: ".1em", textTransform: "uppercase" }}>Funded Trend</p>
              <Sparkline data={sparkData} color={C.orange} height={50} />
            </div>
          )}
        </div>
      </Card>

      {/* ── What-If Simulator ── */}
      {simMode && (
        <Card style={{ padding: "24px 28px", marginBottom: 20, border: `2px solid ${C.orange}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <SectionLabel>What-If Simulator</SectionLabel>
            <span style={{ padding: "2px 8px", borderRadius: 99, background: "rgba(243,112,33,0.12)", color: C.orange, fontSize: 9, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 16 }}>
              Simulation Mode — Live data unchanged
            </span>
          </div>
          <p className="sim-disclaimer" style={{ margin: "0 0 16px", fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
            Select a scenario to see its impact on the forecast. <strong>No live data is modified.</strong>
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { label: "+1 Average Loan",                delta: fc.avg_loan_size * 1  },
              { label: "+2 Average Loans",               delta: fc.avg_loan_size * 2  },
              { label: "+3 Average Loans",               delta: fc.avg_loan_size * 3  },
              { label: "+$250K production",              delta: 250_000               },
              { label: "+$500K production",              delta: 500_000               },
              { label: "+$1M production",                delta: 1_000_000             },
              { label: "Team closes 5 extra apps (25% rate)", delta: fc.avg_loan_size * 5 * 0.25 },
              { label: "Best LO doubles remaining pace",  delta: fc.top_opportunity ? Math.max(0, fc.top_opportunity.funded_volume_commitment - fc.top_opportunity.funded_volume_actual) * 0.5 : 0 },
            ].map(s => (
              <SimRow key={s.label} label={s.label} delta={s.delta} base={fc.forecast_vol} goal={fc.goal_vol} />
            ))}
          </div>
        </Card>
      )}

      {/* ── LO Forecast Heat Map ── */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <SectionLabel>Loan Officer Forecast</SectionLabel>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { id: "forecast" as const, label: "Volume" },
              { id: "pct"      as const, label: "Forecast %" },
              { id: "risk"     as const, label: "Most At-Risk" },
            ].map(s => (
              <button key={s.id} onClick={() => setSortLO(s.id)} style={{
                padding: "6px 12px", borderRadius: 8,
                border: `1.5px solid ${sortLO === s.id ? C.orange : C.line}`,
                background: sortLO === s.id ? "rgba(243,112,33,0.07)" : C.white,
                color: sortLO === s.id ? C.orange : C.muted,
                fontSize: 11, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              }}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {loForecasts.length === 0 ? (
          <Card style={{ padding: "48px 24px", textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 14, color: C.muted }}>No LO commitments yet. Forecast populates once LOs submit their slice.</p>
          </Card>
        ) : (
          <div className="fc-lo-grid">
            {sortedLOs.map((lo, i) => {
              const forecastPct = lo.forecast_pct;
              const tier        = lo.confidence_tier;
              const barColor    = paceColor(forecastPct);
              return (
                <div key={lo.profile_id} className="lo-card" style={{
                  background: C.white,
                  border: `1.5px solid ${C.line}`,
                  borderRadius: 16,
                  padding: "18px 20px",
                  boxShadow: "0 1px 6px rgba(15,23,42,0.05)",
                  transition: "border-color .15s, box-shadow .15s",
                  animation: `fadeIn .35s ${i * 0.04}s both`,
                  position: "relative", overflow: "hidden",
                }}>
                  {/* Status indicator top strip */}
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: paceColor(forecastPct) }} />

                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                    <Avatar name={lo.full_name} url={lo.avatar_url} size={38} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {lo.full_name}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <span style={{
                          padding: "2px 7px", borderRadius: 99,
                          background: paceBg(forecastPct),
                          color: paceColor(forecastPct),
                          fontSize: 9, fontWeight: 800, letterSpacing: ".08em",
                        }}>
                          {forecastPct >= 100 ? "🟢" : forecastPct >= 80 ? "🟡" : "🔴"} {forecastPct}% forecast
                        </span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: C.navy }}>{fmt$short(lo.forecast_volume)}</p>
                      <p style={{ margin: "1px 0 0", fontSize: 9, color: C.muted }}>projected finish</p>
                    </div>
                  </div>

                  {/* Progress bar — actual vs commitment */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, color: C.muted }}>Funded {fmt$short(lo.funded_volume_actual)}</span>
                      <span style={{ fontSize: 10, color: C.muted }}>Committed {fmt$short(lo.funded_volume_commitment)}</span>
                    </div>
                    <div style={{ position: "relative", height: 8, background: C.line, borderRadius: 99, overflow: "hidden" }}>
                      {/* Actual funded */}
                      <div style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${Math.min(100, lo.pace_pct)}%`, background: barColor, borderRadius: 99, transition: "width .8s ease" }} />
                      {/* Forecast extension (lighter) */}
                      {lo.forecast_pct > lo.pace_pct && (
                        <div style={{ position: "absolute", top: 0, left: `${Math.min(99, lo.pace_pct)}%`, height: "100%", width: `${Math.min(100 - lo.pace_pct, lo.forecast_pct - lo.pace_pct)}%`, background: barColor, opacity: 0.25, borderRadius: 99 }} />
                      )}
                    </div>
                  </div>

                  {/* Data row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                    {[
                      { l: "Actual",     v: `${lo.pace_pct}%`,    c: paceColor(lo.pace_pct) },
                      { l: "Forecast",   v: `${lo.forecast_pct}%`, c: paceColor(lo.forecast_pct) },
                      { l: "Confidence", v: `${lo.confidence}%`,   c: tierColor(tier) },
                    ].map(s => (
                      <div key={s.l} style={{ padding: "6px 8px", borderRadius: 8, background: C.sand, border: `1px solid ${C.line}` }}>
                        <p style={{ margin: "0 0 1px", fontSize: 8, fontWeight: 800, letterSpacing: ".1em", textTransform: "uppercase", color: C.muted }}>{s.l}</p>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: s.c }}>{s.v}</p>
                      </div>
                    ))}
                  </div>

                  {/* Gap */}
                  <div style={{ marginTop: 10, padding: "7px 10px", borderRadius: 8, background: lo.forecast_gap >= 0 ? C.greenBg : "#fff5f5", border: `1px solid ${lo.forecast_gap >= 0 ? "#bbf7d0" : "#fca5a5"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 10, color: lo.forecast_gap >= 0 ? C.green : C.red, fontWeight: 700 }}>
                      {lo.forecast_gap >= 0 ? "Projected surplus" : "Projected shortfall"}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 900, color: lo.forecast_gap >= 0 ? C.green : C.red }}>
                      {lo.forecast_gap >= 0 ? "+" : ""}{fmt$short(lo.forecast_gap)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Historical accuracy (Phase 2 stub) ── */}
      <Card style={{ padding: "24px 28px" }}>
        <SectionLabel>Historical Forecast Accuracy</SectionLabel>
        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", background: C.sand, borderRadius: 14, border: `1px solid ${C.line}` }}>
          <div style={{ fontSize: 32, flexShrink: 0 }}>📊</div>
          <div>
            <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 800, color: C.ink }}>Forecast accuracy tracking begins next month</p>
            <p style={{ margin: 0, fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
              After the first month closes, SLICE will track mid-month forecast accuracy against actual results.
              This data builds the historical table shown to leadership — Month, Forecast at Day 15, Actual, Accuracy %.
              Phase 3 will use this data to improve the forecast model automatically.
            </p>
          </div>
        </div>
      </Card>

      <style>{`
        @media(max-width:680px){
          .fc-harry-grid{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}
