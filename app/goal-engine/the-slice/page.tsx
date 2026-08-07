/**
 * /goal-engine/the-slice — THE SLICE · Live Company Display
 * Fullscreen TV mode. Light, modern, HCMG-branded.
 * Auto-refreshes every 60 seconds.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { SliceOfThePie, type PieSlice } from "@/components/goal-engine/SliceOfThePie";

const C = {
  bg:     "#F8FAFC",
  white:  "#ffffff",
  navy:   "#142850",
  orange: "#F37021",
  ink:    "#1A2B42",
  muted:  "#64748B",
  line:   "#E2E8F0",
  green:  "#16a34a",
  yellow: "#d97706",
  red:    "#dc2626",
};

const REFRESH_SEC = 60;

type SliceData = {
  goal:          Record<string, number | string | boolean | null> | null;
  summary:       Record<string, number> | null;
  leaderboard:   Array<Record<string, number | string | null>>;
  todayActivity: { funded: number; fundedUnits: number; apps: number; appUnits: number };
  topProducers:  Array<{ full_name: string; funded: number; funded_units: number }>;
};

function fmt$(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}
function fmtPct(n: number) { return `${Math.round(n)}%`; }

function PaceBar({ pct, label }: { pct: number; label: string }) {
  const c     = Math.min(100, Math.max(0, pct));
  const color = pct >= 90 ? C.green : pct >= 70 ? C.yellow : C.red;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.muted, textTransform:"uppercase", letterSpacing:".08em" }}>{label}</span>
        <span style={{ fontSize:13, fontWeight:900, color }}>{ fmtPct(c) }</span>
      </div>
      <div style={{ background:C.line, borderRadius:99, height:10, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${c}%`, background:color, borderRadius:99, transition:"width 1.2s ease" }} />
      </div>
    </div>
  );
}

function PaceDot({ pct }: { pct: number }) {
  const color = pct >= 90 ? C.green : pct >= 70 ? C.yellow : C.red;
  const label = pct >= 90 ? "On Pace" : pct >= 70 ? "Behind" : "Off Track";
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:99, fontSize:10, fontWeight:800,
      background: pct >= 90 ? "#dcfce7" : pct >= 70 ? "#fef9c3" : "#fee2e2",
      color,
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:color, display:"inline-block" }} />
      {label}
    </span>
  );
}

export default function TheSlicePage() {
  const [data,       setData]       = useState<SliceData | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [last,       setLast]       = useState("");
  const [counter,    setCounter]    = useState(REFRESH_SEC);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/goal-engine/war-room-data", { cache:"no-store" });
      if (r.ok) { setData(await r.json()); setLast(new Date().toLocaleTimeString()); }
    } catch { /* silent */ }
    setLoading(false);
    setCounter(REFRESH_SEC);
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

  useEffect(() => {
    function onFsChange() {
      const fs = !!document.fullscreenElement;
      setIsFullscreen(fs);
      if (fs) {
        document.body.classList.add("slice-fullscreen");
      } else {
        document.body.classList.remove("slice-fullscreen");
      }
    }
    document.addEventListener("fullscreenchange", onFsChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFsChange);
      document.body.classList.remove("slice-fullscreen");
    };
  }, []);

  const goal    = data?.goal;
  const summary = data?.summary;
  const board   = data?.leaderboard ?? [];
  const today   = data?.todayActivity ?? { funded:0, fundedUnits:0, apps:0, appUnits:0 };

  const goalVol  = Number(goal?.funded_volume_goal  ?? 0);
  const goalUnit = Number(goal?.funded_units_goal   ?? 0);
  const actVol   = Number(summary?.totalActualVolume ?? 0);
  const actUnit  = Number(summary?.totalActualUnits ?? 0);
  const volPct   = goalVol  > 0 ? (actVol  / goalVol)  * 100 : 0;
  const unitPct  = goalUnit > 0 ? (actUnit / goalUnit) * 100 : 0;

  const medals = ["🥇","🥈","🥉"];

  return (
    <div style={{
      minHeight:"100vh", background:C.bg,
      fontFamily:"Montserrat,'Helvetica Neue',system-ui,sans-serif",
      color:C.ink, display:"flex", flexDirection:"column",
    }}>
      {/* ── Top bar ── */}
      <header style={{
        background:C.white, borderBottom:`1px solid ${C.line}`,
        padding:"0 32px", height:68, display:"flex", alignItems:"center",
        justifyContent:"space-between", flexShrink:0,
        borderTop:`3px solid ${C.orange}`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <img src="/SLICE.png" alt="SLICE" style={{ height:48, width:"auto" }} />
          <div style={{ borderLeft:`1px solid ${C.line}`, paddingLeft:14 }}>
            <div style={{ fontSize:8, fontWeight:800, letterSpacing:".2em", textTransform:"uppercase", color:C.orange, lineHeight:1 }}>by</div>
            <img src="/hcmg-wordmark-on-light.svg" alt="HCMG" style={{ height:13, width:"auto", display:"block", marginTop:3 }} />
          </div>
          <div style={{ borderLeft:`1px solid ${C.line}`, paddingLeft:14, marginLeft:4 }}>
            <span style={{ fontSize:20, fontWeight:900, color:C.navy, letterSpacing:"-.3px" }}>THE SLICE</span>
            <span style={{ fontSize:10, fontWeight:700, color:C.muted, marginLeft:10, textTransform:"uppercase", letterSpacing:".1em" }}>
              Live Goal Board
            </span>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:20 }}>
          {goal && (
            <span style={{ fontSize:13, fontWeight:700, color:C.muted }}>
              {String(goal.month_label ?? "")}
            </span>
          )}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{
              width:8, height:8, borderRadius:"50%",
              background: counter > 10 ? C.green : C.orange,
              animation: "pulse 2s infinite",
            }} />
            <span style={{ fontSize:12, fontWeight:700, color:C.muted }}>
              {loading ? "Loading…" : `Live · refresh in ${counter}s`}
            </span>
          </div>
          <button onClick={load} style={{
            padding:"6px 14px", borderRadius:8, border:`1px solid ${C.line}`,
            background:C.white, fontSize:12, fontWeight:700, color:C.muted,
            cursor:"pointer", fontFamily:"inherit",
          }}>↻ Refresh</button>
          <button onClick={() => {
            const el = document.documentElement;
            if (!document.fullscreenElement) { el.requestFullscreen?.(); }
            else { document.exitFullscreen?.(); }
          }} style={{
            padding:"6px 14px", borderRadius:8, border:`1px solid ${C.line}`,
            background:C.white, fontSize:12, fontWeight:700, color:C.ink,
            cursor:"pointer", fontFamily:"inherit",
          }}>{isFullscreen ? "✕ Exit Fullscreen" : "⛶ Fullscreen"}</button>
          <a href="/goal-engine/dashboard" style={{
            padding:"6px 14px", borderRadius:8,
            background:C.navy, color:"#fff",
            fontSize:12, fontWeight:700, textDecoration:"none",
          }}>← Back to SLICE</a>
        </div>
      </header>

      {/* ── Body ── */}
      {loading ? (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:16 }}>🥧</div>
            <p style={{ fontSize:16, fontWeight:700, color:C.muted }}>Loading SLICE data…</p>
          </div>
        </div>
      ) : !goal ? (
        <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎯</div>
            <h2 style={{ margin:"0 0 8px", fontSize:24, fontWeight:900, color:C.navy }}>No Active Goal</h2>
            <p style={{ margin:0, fontSize:15, color:C.muted }}>Leadership will set the next monthly goal soon.</p>
          </div>
        </div>
      ) : (
        <div style={{ flex:1, display:"grid", gridTemplateColumns:"1fr 1fr", gridTemplateRows:"auto auto 1fr", gap:20, padding:"24px 28px 28px" }}>

          {/* ── Company Goal Card (top-left) ── */}
          <div style={{
            background:C.white, borderRadius:20, border:`1px solid ${C.line}`,
            padding:"28px 32px",
            boxShadow:"0 1px 8px rgba(20,40,80,0.06)",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:24 }}>
              <div>
                <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:800, letterSpacing:".18em", textTransform:"uppercase", color:C.orange }}>
                  Company Goal · {String(goal.month_label ?? "")}
                </p>
                <h2 style={{ margin:0, fontSize:28, fontWeight:900, color:C.navy }}>
                  {fmt$(goalVol)} Target
                </h2>
              </div>
              <PaceDot pct={volPct} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:24 }}>
              {[
                { l:"Funded Goal",   v:fmt$(goalVol),  accent:false },
                { l:"Funded Actual", v:fmt$(actVol),   accent:true  },
                { l:"Loan Goal",     v:`${goalUnit} loans`, accent:false },
                { l:"Funded Loans",  v:`${actUnit} loans`, accent:true  },
              ].map(s => (
                <div key={s.l} style={{
                  background: s.accent ? C.navy : C.bg,
                  borderRadius:12, padding:"14px 16px",
                  border:`1px solid ${s.accent ? "rgba(243,112,33,0.2)" : C.line}`,
                }}>
                  <p style={{ margin:"0 0 5px", fontSize:9, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color: s.accent ? "rgba(255,255,255,0.45)" : C.muted }}>
                    {s.l}
                  </p>
                  <p style={{ margin:0, fontSize:22, fontWeight:900, color: s.accent ? "#fff" : C.navy, lineHeight:1 }}>
                    {s.v}
                  </p>
                </div>
              ))}
            </div>

            <PaceBar pct={volPct}  label="Funded Volume" />
            <PaceBar pct={unitPct} label="Funded Units" />

            {goal.clo_message && (
              <div style={{ marginTop:20, padding:"14px 18px", borderRadius:12, background:`rgba(243,112,33,0.05)`, border:`1px solid rgba(243,112,33,0.15)` }}>
                <p style={{ margin:"0 0 4px", fontSize:9, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color:C.orange }}>From Darius</p>
                <p style={{ margin:0, fontSize:13, color:C.ink, lineHeight:1.7, fontStyle:"italic" }}>
                  &ldquo;{String(goal.clo_message)}&rdquo;
                </p>
              </div>
            )}
          </div>

          {/* ── Today's Activity (top-right) ── */}
          <div style={{
            background:C.white, borderRadius:20, border:`1px solid ${C.line}`,
            padding:"28px 32px",
            boxShadow:"0 1px 8px rgba(20,40,80,0.06)",
          }}>
            <p style={{ margin:"0 0 20px", fontSize:10, fontWeight:800, letterSpacing:".18em", textTransform:"uppercase", color:C.orange }}>
              Today&apos;s Activity
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:28 }}>
              {[
                { l:"Funded Today",    v:fmt$(today.funded),      sub:`${today.fundedUnits} loans`,   color:C.navy },
                { l:"Apps Today",      v:fmt$(today.apps),        sub:`${today.appUnits} apps`,        color:C.ink  },
                { l:"Team Members",    v:String(summary?.participationCount ?? 0), sub:"committed",   color:C.ink  },
                { l:"Participation",   v:fmtPct(summary?.participationCount && summary?.totalLOs ? (summary.participationCount / summary.totalLOs) * 100 : 0), sub:"of team",   color:C.orange },
              ].map(s => (
                <div key={s.l} style={{
                  background:C.bg, borderRadius:12, padding:"16px 18px",
                  border:`1px solid ${C.line}`,
                }}>
                  <p style={{ margin:"0 0 5px", fontSize:9, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color:C.muted }}>{s.l}</p>
                  <p style={{ margin:0, fontSize:28, fontWeight:900, color:s.color, lineHeight:1 }}>{s.v}</p>
                  <p style={{ margin:"4px 0 0", fontSize:11, color:C.muted }}>{s.sub}</p>
                </div>
              ))}
            </div>

            <p style={{ margin:"0 0 12px", fontSize:10, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color:C.muted }}>
              Month Progress
            </p>
            <div style={{ background:C.line, borderRadius:99, height:14, overflow:"hidden", marginBottom:6 }}>
              <div style={{
                height:"100%", borderRadius:99, transition:"width 1.2s ease",
                width:`${volPct}%`,
                background:`linear-gradient(90deg,${C.orange},#FF9847)`,
              }} />
            </div>
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, color:C.muted, fontWeight:600 }}>
                {fmt$(actVol)} funded
              </span>
              <span style={{ fontSize:11, fontWeight:800, color:C.navy }}>
                {fmtPct(volPct)} of goal
              </span>
            </div>
          </div>

          {/* ── Slice of the Pie (full width, between stats and leaderboard) ── */}
          <div style={{
            gridColumn:"1 / -1",
            background:"#fff", borderRadius:20, border:`1px solid ${C.line}`,
            padding:"24px 28px",
            boxShadow:"0 1px 8px rgba(20,40,80,0.06)",
          }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:20 }}>🥧</span>
                <div>
                  <p style={{ margin:0, fontSize:15, fontWeight:900, color:C.navy }}>Slice of the Pie</p>
                  <p style={{ margin:"2px 0 0", fontSize:11, color:C.muted }}>Funded commitment by LO · Inner arc = actual progress</p>
                </div>
              </div>
              <a href="/goal-engine/slice-visualization" style={{
                fontSize:12, fontWeight:800, color:C.orange, textDecoration:"none",
                padding:"5px 14px", borderRadius:8, border:`1px solid rgba(243,112,33,0.25)`,
                background:"rgba(243,112,33,0.05)",
              }}>View Full →</a>
            </div>
            {(() => {
              const pieSlices: PieSlice[] = board.map(row => ({
                profile_id:               String(row.profile_id ?? ""),
                full_name:                String(row.full_name  ?? ""),
                avatar_url:               row.avatar_url ? String(row.avatar_url) : null,
                funded_volume_commitment: Number(row.funded_volume_commitment ?? 0),
                funded_volume_actual:     Number(row.funded_volume_actual     ?? 0),
                funded_units_actual:      Number(row.funded_units_actual      ?? 0),
              }));
              return (
                <SliceOfThePie
                  goalVol={goalVol}
                  slices={pieSlices}
                  compact
                />
              );
            })()}
          </div>

          {/* ── Leaderboard (bottom — full width) ── */}
          <div style={{
            gridColumn:"1 / -1",
            background:C.white, borderRadius:20, border:`1px solid ${C.line}`,
            overflow:"hidden",
            boxShadow:"0 1px 8px rgba(20,40,80,0.06)",
          }}>
            <div style={{ padding:"20px 28px", borderBottom:`1px solid ${C.line}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <p style={{ margin:0, fontSize:16, fontWeight:900, color:C.navy }}>🏆 Leaderboard</p>
                <p style={{ margin:"2px 0 0", fontSize:12, color:C.muted }}>Funded volume · {String(goal.month_label ?? "")}</p>
              </div>
              {last && <span style={{ fontSize:11, color:C.muted }}>Updated {last}</span>}
            </div>

            {board.length === 0 ? (
              <p style={{ padding:"40px 28px", textAlign:"center", fontSize:14, color:C.muted }}>
                No commitments yet this month.
              </p>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:0 }}>
                {board.slice(0, 12).map((row, i) => {
                  const commit = Number(row.funded_volume_commitment ?? 0);
                  const actual = Number(row.funded_volume_actual ?? 0);
                  const pct    = commit > 0 ? (actual / commit) * 100 : 0;
                  const paceColor = pct >= 90 ? C.green : pct >= 70 ? C.yellow : C.red;
                  const name   = String(row.full_name ?? "");
                  const initials = name.split(" ").map((n: string) => n[0]).slice(0,2).join("");

                  return (
                    <div key={String(row.profile_id)} style={{
                      padding:"18px 22px",
                      borderRight:`1px solid ${C.line}`,
                      borderBottom:`1px solid ${C.line}`,
                    }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                        <span style={{ fontSize:16, width:22, textAlign:"center", flexShrink:0 }}>
                          {medals[i] ?? <span style={{ fontSize:11, fontWeight:800, color:C.muted }}>#{i+1}</span>}
                        </span>
                        {row.avatar_url ? (
                          <img src={String(row.avatar_url)} alt="" style={{ width:32, height:32, borderRadius:"50%", objectFit:"cover", flexShrink:0 }} />
                        ) : (
                          <div style={{ width:32, height:32, borderRadius:"50%", background:`linear-gradient(135deg,#FF9847,${C.orange})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:900, color:"#fff", flexShrink:0 }}>
                            {initials}
                          </div>
                        )}
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ margin:0, fontSize:13, fontWeight:800, color:C.navy, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name.split(" ")[0]}</p>
                          <p style={{ margin:"1px 0 0", fontSize:10, color:C.muted }}>{name.split(" ").slice(1).join(" ")}</p>
                        </div>
                      </div>
                      <p style={{ margin:"0 0 2px", fontSize:20, fontWeight:900, color:C.navy }}>{fmt$(actual)}</p>
                      <p style={{ margin:"0 0 8px", fontSize:10, color:C.muted }}>of {fmt$(commit)} · {Number(row.funded_units_actual ?? 0)} loans</p>
                      <div style={{ background:C.line, borderRadius:99, height:6, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${Math.min(100,pct)}%`, background:paceColor, borderRadius:99 }} />
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginTop:5 }}>
                        <span style={{ fontSize:10, color:C.muted }}>Pace</span>
                        <span style={{ fontSize:10, fontWeight:800, color:paceColor }}>{fmtPct(pct)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        @media(max-width:900px){
          .slice-grid { grid-template-columns:1fr !important; }
        }
        body.slice-fullscreen nav {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
