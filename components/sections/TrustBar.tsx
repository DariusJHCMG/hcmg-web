"use client";

import { useState } from "react";
import Link from "next/link";
import { STATE_PATHS } from "@/lib/statePaths";

const LICENSED: string[] = ["FL","TX","GA","NV","CO","VA","DC","MD"];
const PENDING:  string[] = ["OH","MI","AL","OR","NJ","TN","NC","SC","IL","IN","OK","NM","AZ","PA"];

// Real centroids computed from us-atlas/states-albers-10m.json (975×610 Albers USA)
const CENTROIDS: Record<string,[number,number]> = {
  AK:[125,530], AL:[676,436], AR:[568,393], AZ:[203,385], CA:[91,284],
  CO:[330,289], CT:[887,193], DC:[828,268], DE:[854,257], FL:[742,529],
  GA:[738,425], HI:[319,588], IA:[542,229], ID:[202,123], IL:[611,276],
  IN:[666,272], KS:[456,308], KY:[682,317], LA:[586,478], MA:[901,171],
  MD:[823,265], ME:[924,98], MI:[687,180], MN:[538,129], MO:[562,312],
  MS:[614,440], MT:[285,97], NC:[791,351], ND:[430,103], NE:[436,238],
  NH:[895,134], NJ:[861,232], NM:[310,393], NV:[141,268], NY:[835,169],
  OH:[723,252], OK:[449,380], OR:[103,130], PA:[808,226], RI:[904,185],
  SC:[777,400], SD:[428,176], TN:[679,360], TX:[420,474], UT:[227,265],
  VA:[789,299], VT:[873,139], WA:[123,58], WI:[595,165], WV:[774,280],
  WY:[306,194],
};

function fillColor(s: string, hov: string|null, sel: string|null, licensed: string[], pending: string[]) {
  const isLic = licensed.includes(s);
  const isPen = pending.includes(s);
  if (s === sel)  return isLic ? "#c45213" : "#1d4ed8";
  if (s === hov)  return isLic ? "#e8651e" : "#2563eb";
  if (isLic) return "#F37021";
  if (isPen) return "#93c5fd";
  return "#dde3ea";
}

export function TrustBar() {
  const [hovered, setHovered] = useState<string|null>(null);
  const stateKeys = Object.keys(STATE_PATHS);

  return (
    <section className="bg-white border-y border-line py-20">
      <div className="container-shell max-w-7xl">

        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-accent">
            <span className="inline-block h-0.5 w-6 rounded bg-accent" />
            Where We Lend
          </p>
          <h2 className="text-4xl font-extrabold tracking-tight text-ink lg:text-5xl">
            Licensed across the country.<br />
            <span className="text-accent">Growing every quarter.</span>
          </h2>
          <p className="mt-4 text-base leading-7 text-muted">
            HCMG loan officers are licensed in {LICENSED.length} states with {PENDING.length} more
            pending approval. Every state we enter gets the same promise — a dedicated licensed loan
            officer, fast closings, and no surprises at the table.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_300px] lg:items-start">

          {/* Map */}
          <div className="relative">
            <svg viewBox="0 0 975 610" style={{ display:"block", width:"100%" }}
                 aria-label="US states where HCMG is licensed or pending">
              {stateKeys.map((abbr) => {
                const active = LICENSED.includes(abbr) || PENDING.includes(abbr);
                return (
                  <g key={abbr}>
                    <path
                      d={STATE_PATHS[abbr]}
                      fill={fillColor(abbr, hovered, null, LICENSED, PENDING)}
                      stroke="#fff"
                      strokeWidth={active ? 1.5 : 0.8}
                      strokeLinejoin="round"
                      onMouseEnter={() => active && setHovered(abbr)}
                      onMouseLeave={() => setHovered(null)}
                      style={{ cursor: active ? "pointer" : "default", transition:"fill 0.12s" }}
                    />
                    {active && CENTROIDS[abbr] && (
                      <text x={CENTROIDS[abbr][0]} y={CENTROIDS[abbr][1]}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={11} fontWeight="800" fill={LICENSED.includes(abbr) ? "#fff" : "#1e40af"}
                        style={{ pointerEvents:"none", userSelect:"none", letterSpacing:"0.04em" }}>
                        {abbr}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {hovered && (
              <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 z-10 rounded-xl border border-line bg-white px-4 py-2 shadow-card text-sm font-bold text-ink whitespace-nowrap">
                {hovered}
                {LICENSED.includes(hovered) && <span className="ml-2 text-accent">· Licensed &amp; Active</span>}
                {PENDING.includes(hovered)  && <span className="ml-2 text-blue-600">· Pending Approval</span>}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            {/* Legend */}
            <div className="rounded-2xl border border-line bg-sand p-5 space-y-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Map Key</p>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded" style={{background:"#F37021"}} />
                <div>
                  <p className="text-sm font-bold text-ink">Licensed &amp; Active</p>
                  <p className="text-xs text-muted">{LICENSED.length} states · taking applications now</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded bg-blue-300" />
                <div>
                  <p className="text-sm font-bold text-ink">Pending Approval</p>
                  <p className="text-xs text-muted">{PENDING.length} states · coming soon</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 h-4 w-4 flex-shrink-0 rounded" style={{background:"#dde3ea"}} />
                <div><p className="text-sm font-bold text-ink">Not yet available</p></div>
              </div>
            </div>

            {/* Active pills */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Active States</p>
              <div className="flex flex-wrap gap-1.5">
                {LICENSED.map((s) => (
                  <span key={s} className="inline-flex rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white" style={{background:"#F37021"}}>{s}</span>
                ))}
              </div>
            </div>

            {/* Pending pills */}
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Coming Soon</p>
              <div className="flex flex-wrap gap-1.5">
                {PENDING.map((s) => (
                  <span key={s} className="inline-flex rounded-lg bg-blue-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-blue-700">{s}</span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link href="/find-a-loan-officer"
              className="group flex items-center justify-between rounded-2xl border border-line bg-white p-5 transition-all hover:border-accent hover:shadow-soft">
              <div>
                <p className="font-bold text-ink group-hover:text-accent transition-colors">Find a loan officer near you</p>
                <p className="mt-0.5 text-xs text-muted">Browse LOs by state →</p>
              </div>
              <span className="text-accent text-xl">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
