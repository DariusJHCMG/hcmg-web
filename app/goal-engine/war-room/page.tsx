/**
 * /goal-engine/war-room — Fullscreen TV Display Mode
 * Auto-refreshes every 60 seconds. No confidential data.
 * Shows company goals, leaderboard, milestones, and today's activity.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const C = { navy:"#0a1628", navyL:"#142850", orange:"#F37021", orangeL:"#FF9847", white:"#ffffff", muted:"rgba(255,255,255,0.45)", line:"rgba(255,255,255,0.1)" };
const REFRESH_SEC = 60;

type WarRoomData = {
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
function fmtPct(n: number): string { return `${Math.round(n)}%`; }

function BigBar({ pct, label }: { pct: number; label: string }) {
  const c = Math.min(100, Math.max(0, pct));
  const color = pct >= 90 ? "#22c55e" : pct >= 70 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
        <span style={{ fontSize:12, color:C.muted, fontWeight:700, textTransform:"uppercase", letterSpacing:".1em" }}>{label}</span>
        <span style={{ fontSize:14, fontWeight:900, color:"#fff" }}>{fmtPct(c)}</span>
      </div>
      <div style={{ background:"rgba(255,255,255,0.12)", borderRadius:99, height:12, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${c}%`, background:color, borderRadius:99, transition:"width 1s" }} />
      </div>
    </div>
  );
}

export default function WarRoomPage() {
  const [data,    setData]    = useState<WarRoomData | null>(null);
  const [loading, setLoading] = useState(true);
  const [last,    setLast]    = useState("");
  const [full,    setFull]    = useState(false);
  const [counter, setCounter] = useState(REFRESH_SEC);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch("/api/goal-engine/war-room-data");
      if (res.ok) { setData(await res.json()); setLast(new Date().toLocaleTimeString()); }
    } catch { /* silent */ }
    finally   { setLoading(false); setCounter(REFRESH_SEC); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh
  useEffect(() => {
    const t = setInterval(() => {
      setCounter(c => {
        if (c <= 1) { fetchData(); return REFRESH_SEC; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [fetchData]);

  const goal    = data?.goal;
  const summary = data?.summary;
  const board   = data?.leaderboard ?? [];
  const today   = data?.todayActivity ?? { funded:0, fundedUnits:0, apps:0, appUnits:0 };
  const medals  = ["🥇","🥈","🥉"];

  const volPct  = goal && summary ? (summary.totalActualVolume / Number(goal.funded_volume_goal)) * 100 : 0;
  const days    = goal ? Math.max(0, Math.ceil((new Date(goal.end_date as string).getTime() - Date.now()) / 86_400_000)) : 0;

  return (
    <div
      id="war-room"
      onClick={() => full && setFull(false)}
      style={{
        minHeight:"100vh", background:C.navy, color:"#fff",
        fontFamily:"Montserrat,system-ui,sans-serif",
        padding:"0",
      }}
    >
      {/* Nav bar */}
      <div style={{ background:C.navyL, padding:"12px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`2px solid ${C.orange}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <img src="/SLICE.png" alt="SLICE" style={{ height:40, width:"auto" }} />
          <span style={{ fontSize:10, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color:C.orange }}>War Room</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontSize:11, color:C.muted }}>Auto-refresh in {counter}s · Last: {last || "—"}</span>
          <button onClick={fetchData} style={{ padding:"5px 14px", borderRadius:8, border:`1px solid ${C.line}`, background:"transparent", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            ↻ Refresh
          </button>
          <button onClick={() => { const el = document.getElementById("war-room"); el?.requestFullscreen?.(); setFull(true); }} style={{ padding:"5px 14px", borderRadius:8, border:`1px solid ${C.line}`, background:"transparent", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>
            ⛶ Fullscreen
          </button>
          <Link href="/goal-engine/dashboard" style={{ fontSize:11, color:C.muted, textDecoration:"none" }}>← Exit</Link>
        </div>
      </div>

      {loading ? (
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"80vh" }}>
          <p style={{ fontSize:20, color:C.muted }}>Loading…</p>
        </div>
      ) : (
        <div style={{ padding:"28px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:20 }}>

          {/* ── Col 1: Company Goal ──────────────────────────────── */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Month + Goal */}
            <div style={{ background:C.navyL, border:`1px solid ${C.line}`, borderRadius:20, padding:24 }}>
              <p style={{ margin:"0 0 4px", fontSize:10, fontWeight:800, letterSpacing:".15em", textTransform:"uppercase", color:C.orange }}>
                {goal?.month_label as string ?? "No Active Goal"}
              </p>
              <p style={{ margin:"0 0 20px", fontSize:32, fontWeight:900, color:"#fff" }}>
                {goal ? fmt$(Number(goal.funded_volume_goal)) : "—"}
                <span style={{ fontSize:14, color:C.muted, fontWeight:400, marginLeft:8 }}>company goal</span>
              </p>
              {goal && summary && (
                <>
                  <BigBar pct={volPct} label="Funded Progress" />
                  <p style={{ margin:"14px 0 0", fontSize:22, fontWeight:900, color:C.orange }}>
                    {fmt$(summary.totalActualVolume)}
                    <span style={{ fontSize:13, color:C.muted, fontWeight:400, marginLeft:8 }}>funded to date</span>
                  </p>
                </>
              )}
            </div>

            {/* Days + Participation */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              {[
                { label:"Days Left",     value:days.toString()                     },
                { label:"Participation", value: summary ? `${summary.participationCount ?? 0}/${summary.totalLOs ?? 0}` : "—" },
                { label:"Today Funded",  value: fmt$(today.funded)                 },
                { label:"Today Apps",    value: fmt$(today.apps)                   },
              ].map(s => (
                <div key={s.label} style={{ background:C.navyL, border:`1px solid ${C.line}`, borderRadius:14, padding:"16px 18px" }}>
                  <p style={{ margin:0, fontSize:9, fontWeight:700, letterSpacing:".12em", textTransform:"uppercase", color:C.muted }}>{s.label}</p>
                  <p style={{ margin:"6px 0 0", fontSize:24, fontWeight:900, color:"#fff" }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Company Units */}
            {goal && summary && (
              <div style={{ background:C.navyL, border:`1px solid ${C.line}`, borderRadius:16, padding:20 }}>
                <p style={{ margin:"0 0 12px", fontSize:10, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:C.orange }}>Funded Units</p>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
                  <span style={{ fontSize:32, fontWeight:900, color:"#fff" }}>{summary.totalActualUnits ?? 0}</span>
                  <span style={{ fontSize:14, color:C.muted }}>of {goal.funded_units_goal} loans</span>
                </div>
                <BigBar pct={(summary.totalActualUnits / Number(goal.funded_units_goal)) * 100} label="" />
              </div>
            )}
          </div>

          {/* ── Col 2: Leaderboard ───────────────────────────────── */}
          <div style={{ background:C.navyL, border:`1px solid ${C.line}`, borderRadius:20, padding:24, overflowY:"auto", maxHeight:"80vh" }}>
            <p style={{ margin:"0 0 20px", fontSize:12, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:C.orange }}>
              Funded Volume Leaderboard
            </p>
            {board.length === 0
              ? <p style={{ color:C.muted, fontSize:14 }}>No commitments yet.</p>
              : board.slice(0, 12).map((row, i) => {
                  const pct = Number(row.funded_volume_commitment) > 0
                    ? (Number(row.funded_volume_actual) / Number(row.funded_volume_commitment)) * 100 : 0;
                  return (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:12, marginBottom:14, paddingBottom:14, borderBottom:`1px solid ${C.line}` }}>
                      <span style={{ fontSize:18, width:24, flexShrink:0 }}>{medals[i] ?? `#${i+1}`}</span>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:0, fontSize:13, fontWeight:800, color:"#fff", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" as const }}>
                          {row.full_name as string}
                        </p>
                        <div style={{ marginTop:4, background:"rgba(255,255,255,0.12)", borderRadius:99, height:4, overflow:"hidden" }}>
                          <div style={{ height:"100%", width:`${Math.min(100,pct)}%`, background: pct>=90?"#22c55e":pct>=70?"#f59e0b":"#ef4444" }} />
                        </div>
                      </div>
                      <div style={{ textAlign:"right", flexShrink:0 }}>
                        <p style={{ margin:0, fontSize:14, fontWeight:900, color:"#fff" }}>{fmt$(Number(row.funded_volume_actual))}</p>
                        <p style={{ margin:"1px 0 0", fontSize:10, color:C.muted }}>{Math.round(pct)}%</p>
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* ── Col 3: Applications + Recent Activity ──────────────── */}
          <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

            {/* Application tracking */}
            {goal && summary && (
              <div style={{ background:C.navyL, border:`1px solid ${C.line}`, borderRadius:20, padding:24 }}>
                <p style={{ margin:"0 0 12px", fontSize:10, fontWeight:800, letterSpacing:".12em", textTransform:"uppercase", color:C.orange }}>Application Pipeline</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                  {[
                    { l:"App Volume Goal",   v: fmt$(Number(goal.app_volume_goal)) },
                    { l:"Total Apps",        v: fmt$(summary.totalActualAppVolume ?? 0) },
                    { l:"App Units Goal",    v: String(goal.app_units_goal) },
                    { l:"Total App Units",   v: String(summary.totalActualAppUnits ?? 0) },
                  ].map(s => (
                    <div key={s.l}>
                      <p style={{ margin:0, fontSize:9, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", color:C.muted }}>{s.l}</p>
                      <p style={{ margin:"4px 0 0", fontSize:20, fontWeight:900, color:"#fff" }}>{s.v}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HCMG branding footer */}
            <div style={{ background:C.navyL, border:`1px solid ${C.line}`, borderRadius:20, padding:24, textAlign:"center", flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10 }}>
              <img src="/SLICE.png" alt="SLICE" style={{ height:60, width:"auto", opacity:0.9 }} />
              <p style={{ margin:0, fontSize:10, fontWeight:700, letterSpacing:".2em", textTransform:"uppercase", color:C.orange }}>by</p>
              <img src="/hcmg-wordmark-on-dark.svg" alt="HCMG" style={{ height:16, width:"auto", opacity:0.7 }} />
              <p style={{ margin:"16px 0 0", fontSize:11, color:C.muted, lineHeight:1.8 }}>
                Performance Operating System<br/>Harris Capital Mortgage Group
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
