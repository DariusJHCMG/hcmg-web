"use client";

/**
 * SliceOfThePie — Signature pie chart visualization for SLICE by HCMG.
 *
 * Shows:
 *  - Each LO's funded commitment as a named slice
 *  - Funded actual progress overlaid within each slice (inner ring)
 *  - Unclaimed company goal as a "ghost" slice
 *  - Hover / tap popover with full detail
 *  - Accessible <title> + <desc> + aria-label on every slice
 *  - Responsive: scales via viewBox, no hard pixel sizes
 *
 * Data contract (matches /api/goal-engine/war-room-data):
 *   goalVol        — total company funded volume goal
 *   totalCommitted — sum of all LO funded_volume_commitment
 *   slices         — array of LO commitment rows from goal_leaderboard
 */

import { useState, useCallback, useRef, useEffect } from "react";

// ── Design tokens ───────────────────────────────────────────────
const C = {
  navy:   "#142850",
  orange: "#F37021",
  ink:    "#1A2B42",
  muted:  "#64748B",
  line:   "#E2E8F0",
  sand:   "#F8FAFC",
  white:  "#ffffff",
  green:  "#16a34a",
  yellow: "#d97706",
  red:    "#dc2626",
};

// ── Palette for LO slices — 16 distinct but harmonious colours ──
const SLICE_PALETTE = [
  "#F37021","#142850","#3b82f6","#8b5cf6","#10b981",
  "#f59e0b","#ef4444","#06b6d4","#ec4899","#84cc16",
  "#6366f1","#14b8a6","#f97316","#a855f7","#22c55e","#0ea5e9",
];

// ── Types ───────────────────────────────────────────────────────
export interface PieSlice {
  profile_id:               string;
  full_name:                string;
  avatar_url?:              string | null;
  funded_volume_commitment: number;
  funded_volume_actual:     number;
  funded_units_actual:      number;
}

interface Props {
  goalVol:        number;
  slices:         PieSlice[];
  compact?:       boolean;   // smaller layout for embedding inside the-slice
  className?:     string;
}

// ── Geometry helpers ────────────────────────────────────────────
function polar(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arcPath(
  cx: number, cy: number,
  outerR: number, innerR: number,
  startDeg: number, endDeg: number
): string {
  // clamp sweep to avoid full-circle degenerate arcs
  const sweep = Math.min(endDeg - startDeg, 359.999);
  const o1 = polar(cx, cy, outerR, startDeg);
  const o2 = polar(cx, cy, outerR, startDeg + sweep);
  const i1 = polar(cx, cy, innerR, startDeg + sweep);
  const i2 = polar(cx, cy, innerR, startDeg);
  const large = sweep > 180 ? 1 : 0;
  return [
    `M ${o1.x} ${o1.y}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
    `L ${i1.x} ${i1.y}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x} ${i2.y}`,
    "Z",
  ].join(" ");
}

function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}
function fmt$short(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

// ── Popover component ────────────────────────────────────────────
interface PopoverProps {
  slice: PieSlice & { color: string; pct: number; actualPct: number; goalPct: number };
  rank: number;
  onClose: () => void;
  anchorX: number;
  anchorY: number;
  containerW: number;
  containerH: number;
}

function SlicePopover({ slice, rank, onClose, anchorX, anchorY, containerW, containerH }: PopoverProps) {
  const W = 240;
  const H = 220;
  // Flip horizontally if too close to right edge
  const left = anchorX + 16 + W > containerW ? anchorX - W - 16 : anchorX + 16;
  const top  = Math.min(Math.max(anchorY - 60, 8), containerH - H - 8);

  const paceColor = slice.actualPct >= 90 ? C.green : slice.actualPct >= 60 ? C.yellow : C.red;
  const paceLabel = slice.actualPct >= 100 ? "On Pace 🟢" : slice.actualPct >= 60 ? "Behind 🟡" : "Off Track 🔴";

  return (
    <div
      role="tooltip"
      style={{
        position: "absolute",
        left, top,
        width: W,
        background: C.white,
        border: `2px solid ${slice.color}`,
        borderRadius: 16,
        boxShadow: "0 12px 40px rgba(15,23,42,0.18)",
        zIndex: 100,
        pointerEvents: "auto",
        fontFamily: "Montserrat,'Helvetica Neue',system-ui,sans-serif",
        overflow: "hidden",
      }}
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{ background: slice.color, padding: "14px 16px 12px", position: "relative" }}>
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute", top: 8, right: 8,
            background: "rgba(255,255,255,0.2)", border: "none",
            borderRadius: "50%", width: 22, height: 22,
            cursor: "pointer", color: "#fff", fontSize: 11, fontWeight: 900,
            display: "flex", alignItems: "center", justifyContent: "center",
            lineHeight: 1,
          }}
        >✕</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
            background: "rgba(255,255,255,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 900, color: "#fff",
            border: "2px solid rgba(255,255,255,0.4)",
          }}>
            {slice.full_name.split(" ").map(n => n[0]).slice(0, 2).join("")}
          </div>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>
              {slice.full_name.split(" ")[0]}
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.7)", lineHeight: 1 }}>
              {slice.full_name.split(" ").slice(1).join(" ")} · #{rank}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px" }}>
        {/* Commitment */}
        <div style={{ marginBottom: 10 }}>
          <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: C.muted }}>
            Committed
          </p>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 900, color: C.navy, lineHeight: 1 }}>
            {fmt$(slice.funded_volume_commitment)}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted }}>
            {slice.pct.toFixed(1)}% of company goal
          </p>
        </div>

        {/* Funded */}
        <div style={{ marginBottom: 12, padding: "10px 12px", background: C.sand, borderRadius: 10, border: `1px solid ${C.line}` }}>
          <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: C.muted }}>
            Funded
          </p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <p style={{ margin: 0, fontSize: 17, fontWeight: 900, color: paceColor, lineHeight: 1 }}>
              {fmt$(slice.funded_volume_actual)}
            </p>
            <span style={{ fontSize: 11, fontWeight: 800, color: paceColor }}>{slice.actualPct.toFixed(0)}%</span>
          </div>
          <p style={{ margin: "3px 0 0", fontSize: 10, color: C.muted }}>
            {slice.funded_units_actual} loans funded
          </p>
          {/* mini progress */}
          <div style={{ marginTop: 8, height: 6, borderRadius: 99, background: C.line, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, slice.actualPct)}%`, background: paceColor, borderRadius: 99, transition: "width .6s" }} />
          </div>
        </div>

        {/* Pace badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "4px 10px", borderRadius: 99,
          fontSize: 11, fontWeight: 700,
          background: slice.actualPct >= 90 ? "#dcfce7" : slice.actualPct >= 60 ? "#fef9c3" : "#fee2e2",
          color: paceColor,
          border: `1px solid ${slice.actualPct >= 90 ? "#bbf7d0" : slice.actualPct >= 60 ? "#fde047" : "#fecaca"}`,
        }}>
          {paceLabel}
        </div>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export function SliceOfThePie({ goalVol, slices, compact = false }: Props) {
  // hovered = slice under mouse (SVG pointer events only — no translate)
  // popover = clicked slice (sticky until dismissed)
  const [hovered,  setHovered]  = useState<string | null>(null);
  const [popover,  setPopover]  = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const r = containerRef.current.getBoundingClientRect();
        setContainerSize({ w: r.width, h: r.height });
      }
    }
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Close popover on outside click
  useEffect(() => {
    function onDoc() { setPopover(null); }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  // ── Compute layout ────────────────────────────────────────────
  const cx = 250, cy = 250;  // SVG viewBox centre (500×500 viewBox)
  const OR = 200;   // outer radius
  const IR = 110;   // inner radius (donut hole)
  const AR = 155;   // actual funded arc radius (between IR and OR)

  // Sort slices by commitment desc so biggest slice comes first
  const sorted = [...slices].sort((a, b) => b.funded_volume_commitment - a.funded_volume_commitment);
  const totalCommitted = sorted.reduce((s, r) => s + r.funded_volume_commitment, 0);
  const unclaimed      = Math.max(0, goalVol - totalCommitted);
  const totalPie       = goalVol; // full pie = company goal (never shrinks even if over-committed)

  // Build angle ranges
  interface ArcData {
    id:         string;
    slice:      PieSlice | null;  // null = unclaimed
    color:      string;
    startDeg:   number;
    endDeg:     number;
    midDeg:     number;
    pct:        number;           // pct of goalVol
    actualPct:  number;           // actual funded / commitment * 100
    goalPct:    number;           // actual funded / goalVol * 100
    rank:       number;
  }

  const arcs: ArcData[] = [];
  let cursor = 0;

  sorted.forEach((s, i) => {
    const deg  = (s.funded_volume_commitment / totalPie) * 360;
    const pct  = (s.funded_volume_commitment / goalVol) * 100;
    const actualPct = s.funded_volume_commitment > 0
      ? (s.funded_volume_actual / s.funded_volume_commitment) * 100 : 0;
    const goalPct = (s.funded_volume_actual / goalVol) * 100;
    arcs.push({
      id: s.profile_id, slice: s,
      color: SLICE_PALETTE[i % SLICE_PALETTE.length],
      startDeg: cursor, endDeg: cursor + deg, midDeg: cursor + deg / 2,
      pct, actualPct, goalPct, rank: i + 1,
    });
    cursor += deg;
  });

  // Unclaimed arc
  if (unclaimed > 0) {
    const deg = (unclaimed / totalPie) * 360;
    arcs.push({
      id: "__unclaimed__", slice: null,
      color: C.line,
      startDeg: cursor, endDeg: cursor + deg, midDeg: cursor + deg / 2,
      pct: (unclaimed / goalVol) * 100, actualPct: 0, goalPct: 0, rank: 0,
    });
  }

  // Overall goal metric
  const totalActualVol = sorted.reduce((s, r) => s + r.funded_volume_actual, 0);
  const overallPct     = goalVol > 0 ? (totalActualVol / goalVol) * 100 : 0;
  const commitPct      = goalVol > 0 ? (totalCommitted / goalVol) * 100 : 0;

  // ── Centre label ──────────────────────────────────────────────
  const centreLines = [
    { text: fmt$short(totalActualVol), size: 30, weight: 900, color: C.navy,   dy: 4  },
    { text: "of " + fmt$short(goalVol), size: 12, weight: 700, color: C.muted, dy: 24 },
    { text: `${overallPct.toFixed(0)}% funded`, size: 14, weight: 800, color: C.orange, dy: 44 },
  ];

  // Label placement — only show if arc is big enough (>5 deg)
  function labelAnchor(arc: ArcData): { x: number; y: number } | null {
    const sweep = arc.endDeg - arc.startDeg;
    if (sweep < 8) return null;
    const r = OR + 22;
    return polar(cx, cy, r, arc.midDeg);
  }

  // ── Accessible text description ───────────────────────────────
  const a11yDesc = [
    `Company funded goal: ${fmt$(goalVol)}.`,
    ...sorted.map((s, i) =>
      `${s.full_name} is slice ${i+1}, committed ${fmt$(s.funded_volume_commitment)} (${((s.funded_volume_commitment/goalVol)*100).toFixed(1)}% of goal), funded ${fmt$(s.funded_volume_actual)}.`
    ),
    unclaimed > 0 ? `Unclaimed: ${fmt$(unclaimed)} (${((unclaimed/goalVol)*100).toFixed(1)}%).` : "",
  ].filter(Boolean).join(" ");

  const activeArc = arcs.find(a => a.id === (popover ?? hovered));

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        fontFamily: "Montserrat,'Helvetica Neue',system-ui,sans-serif",
        userSelect: "none",
      }}
      onMouseMove={handleMouseMove}
      onClick={() => setPopover(null)}
    >
      {/* ── Header metrics row ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: compact ? 10 : 14,
        marginBottom: compact ? 16 : 24,
      }}
        className="sop-metrics-grid"
      >
        {[
          { l: "Company Goal",     v: fmt$short(goalVol),        sub: "funded volume target" },
          { l: "Total Committed",  v: fmt$short(totalCommitted), sub: `${commitPct.toFixed(0)}% of goal`, accent: true },
          { l: "Total Funded",     v: fmt$short(totalActualVol), sub: `${overallPct.toFixed(0)}% achieved` },
          { l: "LOs Committed",    v: String(sorted.length),     sub: "slices of the pie" },
        ].map(m => (
          <div key={m.l} style={{
            background: m.accent ? C.navy : C.white,
            border: `1px solid ${m.accent ? "transparent" : C.line}`,
            borderRadius: 14,
            padding: compact ? "12px 14px" : "16px 18px",
            boxShadow: m.accent ? "0 6px 20px rgba(20,40,80,0.18)" : "0 1px 4px rgba(15,23,42,0.05)",
          }}>
            <p style={{ margin: "0 0 6px", fontSize: 9, fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase", color: m.accent ? "rgba(255,255,255,0.5)" : C.muted }}>
              {m.l}
            </p>
            <p style={{ margin: "0 0 2px", fontSize: compact ? 18 : 22, fontWeight: 900, color: m.accent ? "#fff" : C.ink, lineHeight: 1 }}>
              {m.v}
            </p>
            <p style={{ margin: 0, fontSize: 10, color: m.accent ? "rgba(255,255,255,0.45)" : C.muted }}>
              {m.sub}
            </p>
          </div>
        ))}
      </div>

      {/* ── Main visual area: pie + legend ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: compact ? "1fr 1fr" : "minmax(0,1.1fr) minmax(0,0.9fr)",
        gap: compact ? 16 : 24,
        alignItems: "start",
      }}
        className="sop-main-grid"
      >
        {/* SVG Pie */}
        <div style={{ position: "relative" }}>
          <svg
            viewBox="0 0 500 500"
            style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }}
            aria-label="Slice of the Pie chart"
            role="img"
          >
            <title>Slice of the Pie — {String(new Date().toLocaleString("en-US", { month: "long", year: "numeric" }))}</title>
            <desc id="pie-desc">{a11yDesc}</desc>

            {/* Subtle radial glow behind the chart */}
            <defs>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%"   stopColor={C.orange} stopOpacity="0.06" />
                <stop offset="100%" stopColor={C.navy}   stopOpacity="0" />
              </radialGradient>
              <filter id="drop" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.12" />
              </filter>
              <filter id="glow-f" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            <circle cx={cx} cy={cy} r={OR + 40} fill="url(#glow)" />

            {/* ── Commitment arcs (outer ring) ── */}
            {/* IMPORTANT: slices NEVER translate/move — doing so causes a hover loop
                because the path physically leaves the cursor, firing onMouseLeave,
                then snapping back and re-firing onMouseEnter infinitely.
                Active state is shown via a separate highlight ring drawn on top. */}
            {arcs.map(arc => {
              const isActive    = hovered === arc.id || popover === arc.id;
              const isUnclaimed = arc.id === "__unclaimed__";
              const sweep       = arc.endDeg - arc.startDeg;
              if (sweep < 0.05) return null;

              return (
                <g
                  key={arc.id}
                  style={{ cursor: isUnclaimed ? "default" : "pointer" }}
                  role="img"
                  aria-label={
                    isUnclaimed
                      ? `Unclaimed: ${fmt$(unclaimed)} (${((unclaimed/goalVol)*100).toFixed(1)}%)`
                      : `${arc.slice!.full_name}: committed ${fmt$(arc.slice!.funded_volume_commitment)}, funded ${fmt$(arc.slice!.funded_volume_actual)}`
                  }
                  onMouseEnter={() => { if (!isUnclaimed) setHovered(arc.id); }}
                  onMouseLeave={() => setHovered(null)}
                  onClick={e => {
                    if (isUnclaimed) return;
                    e.stopPropagation();
                    setPopover(p => p === arc.id ? null : arc.id);
                  }}
                >
                  {/* Base commitment arc — never moves */}
                  <path
                    d={arcPath(cx, cy, OR, IR, arc.startDeg, arc.endDeg)}
                    fill={isUnclaimed ? C.line : arc.color}
                    opacity={isUnclaimed ? 0.5 : isActive ? 1 : (hovered || popover) ? 0.65 : 0.9}
                    strokeWidth={1.5}
                    stroke="#fff"
                    style={{ transition: "opacity .15s" }}
                  />

                  {/* Active highlight: slightly wider outer ring drawn on top — no movement */}
                  {isActive && !isUnclaimed && (
                    <path
                      d={arcPath(cx, cy, OR + 10, OR, arc.startDeg, arc.endDeg)}
                      fill={arc.color}
                      opacity={0.35}
                      strokeWidth={0}
                      style={{ pointerEvents: "none" }}
                    />
                  )}

                  {/* Funded-actual inner arc overlay */}
                  {!isUnclaimed && arc.slice!.funded_volume_actual > 0 && (
                    <path
                      d={arcPath(
                        cx, cy,
                        AR, IR + 4,
                        arc.startDeg,
                        arc.startDeg + (arc.endDeg - arc.startDeg) * Math.min(1, arc.actualPct / 100)
                      )}
                      fill={arc.actualPct >= 90 ? "#22c55e" : arc.actualPct >= 60 ? "#f59e0b" : "#ef4444"}
                      opacity={0.9}
                      stroke="#fff"
                      strokeWidth={1}
                      style={{ pointerEvents: "none" }}
                    />
                  )}

                  {/* Outer name label — pointer-events none so it doesn't interfere */}
                  {(() => {
                    const anchor = labelAnchor(arc);
                    if (!anchor) return null;
                    return (
                      <text
                        x={anchor.x} y={anchor.y}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={11}
                        fontWeight={isActive ? 900 : 700}
                        fill={isUnclaimed ? C.muted : arc.color}
                        style={{ pointerEvents: "none" }}
                      >
                        {isUnclaimed
                          ? `${arc.pct.toFixed(0)}%`
                          : arc.slice!.full_name.split(" ")[0]
                        }
                      </text>
                    );
                  })()}
                </g>
              );
            })}

            {/* ── Centre donut hole ── */}
            <circle cx={cx} cy={cy} r={IR - 2} fill={C.white} />

            {/* Centre content — changes when hovering */}
            {activeArc && activeArc.slice ? (
              <g style={{ pointerEvents: "none" }}>
                <text x={cx} y={cy - 26} textAnchor="middle" fontSize={11} fontWeight={800} fill={activeArc.color} letterSpacing="1">
                  {activeArc.slice.full_name.split(" ")[0].toUpperCase()}
                </text>
                <text x={cx} y={cy - 8}  textAnchor="middle" fontSize={24} fontWeight={900} fill={C.navy}>
                  {fmt$short(activeArc.slice.funded_volume_commitment)}
                </text>
                <text x={cx} y={cy + 14} textAnchor="middle" fontSize={11} fontWeight={700} fill={C.muted}>
                  committed
                </text>
                <text x={cx} y={cy + 34} textAnchor="middle" fontSize={13} fontWeight={900}
                  fill={activeArc.actualPct >= 90 ? "#16a34a" : activeArc.actualPct >= 60 ? "#d97706" : "#dc2626"}>
                  {fmt$short(activeArc.slice.funded_volume_actual)} funded
                </text>
              </g>
            ) : (
              <g style={{ pointerEvents: "none" }}>
                {/* SLICE logo centred in the donut hole */}
                <image
                  href="/SLICE.png"
                  x={cx - 38} y={cy - 88}
                  width={76} height={76}
                  style={{ imageRendering: "auto" }}
                />
                {centreLines.map((l, i) => (
                  <text key={i} x={cx} y={cy + l.dy}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={l.size} fontWeight={l.weight} fill={l.color}
                  >
                    {l.text}
                  </text>
                ))}
              </g>
            )}

            {/* ── Inner ring "actual funded" progress arc for entire company ── */}
            {/* Thin track inside the donut hole */}
            <circle cx={cx} cy={cy} r={IR - 14} fill="none" stroke={C.line} strokeWidth={10} />
            {overallPct > 0 && (
              <path
                d={arcPath(cx, cy, IR - 9, IR - 19, 0, Math.min(359.999, overallPct / 100 * 360))}
                fill="none"
                stroke={overallPct >= 90 ? "#22c55e" : overallPct >= 60 ? "#f59e0b" : "#ef4444"}
              />
            )}
          </svg>
        </div>

        {/* ── Legend / LO List ── */}
        <div>
          <p style={{ margin: "0 0 12px", fontSize: 10, fontWeight: 800, letterSpacing: ".15em", textTransform: "uppercase", color: C.muted }}>
            Commitment Legend
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {sorted.map((s, i) => {
              const arc      = arcs.find(a => a.id === s.profile_id)!;
              const isActive = hovered === s.profile_id || popover === s.profile_id;
              const pct      = s.funded_volume_commitment > 0 ? (s.funded_volume_actual / s.funded_volume_commitment) * 100 : 0;
              const paceC    = pct >= 90 ? C.green : pct >= 60 ? C.yellow : C.red;

              return (
                <div
                  key={s.profile_id}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: compact ? "8px 10px" : "10px 12px",
                    borderRadius: 12,
                    background: isActive ? `${arc.color}12` : C.white,
                    border: `1.5px solid ${isActive ? arc.color : C.line}`,
                    cursor: "pointer",
                    transition: "background .15s, border-color .15s",
                  }}
                  onMouseEnter={() => setHovered(s.profile_id)}
                  onMouseLeave={() => setHovered(null)}
                  onClick={e => { e.stopPropagation(); setPopover(p => p === s.profile_id ? null : s.profile_id); }}
                  role="button"
                  tabIndex={0}
                  aria-label={`${s.full_name}: committed ${fmt$(s.funded_volume_commitment)}, funded ${fmt$(s.funded_volume_actual)}`}
                  onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.stopPropagation(); setPopover(p => p === s.profile_id ? null : s.profile_id); }}}
                >
                  {/* Colour swatch */}
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: arc.color, flexShrink: 0 }} />

                  {/* Rank */}
                  <span style={{ fontSize: 10, fontWeight: 800, color: C.muted, width: 18, textAlign: "center", flexShrink: 0 }}>
                    #{i + 1}
                  </span>

                  {/* Name */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: isActive ? arc.color : C.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {s.full_name}
                    </p>
                    {/* mini bar */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                      <div style={{ flex: 1, height: 4, borderRadius: 99, background: C.line, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${Math.min(100, pct)}%`, background: paceC, borderRadius: 99, transition: "width .6s" }} />
                      </div>
                      <span style={{ fontSize: 9, fontWeight: 800, color: paceC, flexShrink: 0 }}>{pct.toFixed(0)}%</span>
                    </div>
                  </div>

                  {/* Volume */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: C.navy }}>{fmt$short(s.funded_volume_commitment)}</p>
                    <p style={{ margin: "1px 0 0", fontSize: 9, color: paceC, fontWeight: 700 }}>{fmt$short(s.funded_volume_actual)} funded</p>
                  </div>
                </div>
              );
            })}

            {/* Unclaimed */}
            {unclaimed > 0 && (
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: compact ? "8px 10px" : "10px 12px",
                borderRadius: 12,
                background: C.sand,
                border: `1.5px dashed ${C.line}`,
              }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.line, border: `1.5px dashed ${C.muted}`, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.muted }}>Unclaimed</p>
                  <p style={{ margin: "1px 0 0", fontSize: 9, color: C.muted }}>{((unclaimed / goalVol) * 100).toFixed(1)}% of goal unspoken for</p>
                </div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 900, color: C.muted }}>{fmt$short(unclaimed)}</p>
              </div>
            )}
          </div>

          {/* ── Legend key ── */}
          <div style={{
            marginTop: 16, padding: "12px 14px",
            borderRadius: 12, background: C.sand, border: `1px solid ${C.line}`,
          }}>
            <p style={{ margin: "0 0 8px", fontSize: 9, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", color: C.muted }}>
              Colour Key
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { color: "#22c55e", label: "On pace (≥ 90% of commitment)" },
                { color: "#f59e0b", label: "Behind (60–89%)" },
                { color: "#ef4444", label: "Off track (< 60%)" },
                { color: C.line,   label: "Unclaimed — no commitment yet" },
              ].map(k => (
                <div key={k.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: k.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 10, color: C.muted }}>{k.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Popover ── */}
      {popover && (() => {
        const arc = arcs.find(a => a.id === popover);
        if (!arc || !arc.slice) return null;
        return (
          <SlicePopover
            slice={{ ...arc.slice, color: arc.color, pct: arc.pct, actualPct: arc.actualPct, goalPct: arc.goalPct }}
            rank={arc.rank}
            onClose={() => setPopover(null)}
            anchorX={mousePos.x}
            anchorY={mousePos.y}
            containerW={containerSize.w}
            containerH={containerSize.h}
          />
        );
      })()}

      {/* ── Accessible text table (screen readers, below chart) ── */}
      <details style={{ marginTop: 16 }}>
        <summary style={{ cursor: "pointer", fontSize: 11, color: C.muted, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
          Accessible data table
        </summary>
        <div style={{ overflowX: "auto", marginTop: 8 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }} aria-label="Slice of the Pie data table">
            <thead>
              <tr style={{ borderBottom: `2px solid ${C.line}` }}>
                {["Rank", "Loan Officer", "Committed", "% of Goal", "Funded", "Loans", "Pace"].map(h => (
                  <th key={h} scope="col" style={{ padding: "6px 10px", textAlign: "left", fontWeight: 800, color: C.muted, fontSize: 10, letterSpacing: ".12em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s, i) => {
                const pct = s.funded_volume_commitment > 0 ? (s.funded_volume_actual / s.funded_volume_commitment) * 100 : 0;
                return (
                  <tr key={s.profile_id} style={{ borderBottom: `1px solid ${C.line}` }}>
                    <td style={{ padding: "8px 10px", fontWeight: 800, color: C.muted }}>#{i+1}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 700, color: C.ink }}>{s.full_name}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 900, color: C.navy }}>{fmt$(s.funded_volume_commitment)}</td>
                    <td style={{ padding: "8px 10px", color: C.muted }}>{((s.funded_volume_commitment/goalVol)*100).toFixed(1)}%</td>
                    <td style={{ padding: "8px 10px", fontWeight: 700, color: C.ink }}>{fmt$(s.funded_volume_actual)}</td>
                    <td style={{ padding: "8px 10px", color: C.muted }}>{s.funded_units_actual}</td>
                    <td style={{ padding: "8px 10px", fontWeight: 800, color: pct >= 90 ? C.green : pct >= 60 ? C.yellow : C.red }}>
                      {pct.toFixed(0)}%
                    </td>
                  </tr>
                );
              })}
              {unclaimed > 0 && (
                <tr style={{ borderBottom: `1px solid ${C.line}`, opacity: 0.6 }}>
                  <td style={{ padding: "8px 10px" }}>—</td>
                  <td style={{ padding: "8px 10px", color: C.muted, fontStyle: "italic" }}>Unclaimed</td>
                  <td style={{ padding: "8px 10px", color: C.muted }}>{fmt$(unclaimed)}</td>
                  <td style={{ padding: "8px 10px", color: C.muted }}>{((unclaimed/goalVol)*100).toFixed(1)}%</td>
                  <td colSpan={3} style={{ padding: "8px 10px", color: C.muted }}>—</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </details>

      <style>{`
        @media (max-width: 680px) {
          .sop-metrics-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .sop-main-grid    { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 380px) {
          .sop-metrics-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
