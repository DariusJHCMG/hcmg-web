"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { STATE_PATHS } from "@/lib/statePaths";

interface LOMember {
  slug: string; name: string; role: string; nmls: string | null;
  photo: string; shortBio: string; offices: string[];
  phone: string | null; email: string | null;
}

interface Props {
  teamMembers: LOMember[];
  licensedStates: string[];
  pendingStates: string[];
  stateNames: Record<string,string>;
  initialState?: string | null;
}

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

export function FindLOClient({ teamMembers, licensedStates, pendingStates, stateNames, initialState }: Props) {
  const [selected, setSelected] = useState<string | null>(initialState ?? null);
  const [hovered,  setHovered]  = useState<string | null>(null);
  const allActive = [...licensedStates, ...pendingStates];
  const states = Object.keys(STATE_PATHS);

  function fillColor(s: string) {
    const isLic = licensedStates.includes(s);
    const isPen = pendingStates.includes(s);
    if (s === selected) return isLic ? "#FF9847" : "#27406D";
    if (s === hovered)  return isLic ? "#FF9847" : "#27406D";
    if (isLic)          return "#F37021";
    if (isPen)          return "#142850";
    return "#CBD5E1";
  }

  // Filter LOs for selected state
  const filteredLOs = useMemo(() => {
    if (!selected) return [];
    const stateName = stateNames[selected] ?? selected;
    const los = teamMembers.filter((m) => {
      const r = m.role.toLowerCase();
      const isLO = r.includes("loan officer") || r.includes("originator") || r.includes("chief lending") || r.includes("chief production");
      if (!isLO) return false;
      if (!m.offices || m.offices.length === 0) return true;
      return m.offices.some((o) => o.includes(stateName.split(",")[0]) || o.includes(selected));
    });
    // If no office match, show all LOs for licensed states
    return los.length > 0 ? los : (licensedStates.includes(selected) ? teamMembers.filter(m => {
      const r = m.role.toLowerCase();
      return r.includes("loan officer") || r.includes("originator");
    }) : []);
  }, [selected, teamMembers, licensedStates, stateNames]);

  const isPending = selected ? pendingStates.includes(selected) : false;
  const isLicensed = selected ? licensedStates.includes(selected) : false;

  return (
    <section className="section-pad bg-sand">
      <div className="container-shell max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1fr_400px]">

          {/* Map */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted/70">
              {selected
                ? `Showing loan officers in ${stateNames[selected] ?? selected} — click another state or click again to clear`
                : "Click a state to find loan officers"}
            </p>
            <div className="relative overflow-hidden rounded-2xl border border-line bg-sand shadow-soft">
              {hovered && (
                <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 z-10
                                flex items-center gap-2 rounded-xl border border-line bg-white
                                px-4 py-2 shadow-card text-sm font-bold text-ink whitespace-nowrap">
                  <span className="h-2 w-2 rounded-full flex-shrink-0"
                    style={{ background: licensedStates.includes(hovered) ? "#F37021" : "#142850" }} />
                  {stateNames[hovered] ?? hovered}
                  {licensedStates.includes(hovered) && (
                    <span className="ml-1 rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">Licensed</span>
                  )}
                  {pendingStates.includes(hovered) && (
                    <span className="ml-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                          style={{ background:"rgba(20,40,80,0.1)", color:"#142850" }}>Coming Soon</span>
                  )}
                </div>
              )}
              <svg viewBox="0 0 975 610" style={{ display:"block", width:"100%", padding:"16px" }}
                   aria-label="Click a state to find loan officers">
                <defs>
                  <filter id="lo-glow-orange" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                  <filter id="lo-glow-navy" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                  </filter>
                </defs>
                {states.map((abbr) => {
                  const active  = allActive.includes(abbr);
                  const isLic   = licensedStates.includes(abbr);
                  const isHov   = hovered  === abbr;
                  const isSel   = selected === abbr;
                  const glowFilter = (isHov || isSel)
                    ? isLic ? "url(#lo-glow-orange)" : "url(#lo-glow-navy)"
                    : undefined;
                  return (
                    <g key={abbr} style={{ cursor: active ? "pointer" : "default" }}>
                      <path
                        d={STATE_PATHS[abbr]}
                        fill={fillColor(abbr)}
                        stroke="#fff"
                        strokeWidth={active ? 1.5 : 0.6}
                        strokeLinejoin="round"
                        filter={glowFilter}
                        style={{ transition:"fill 0.15s ease", opacity: active ? 1 : 0.85 }}
                        onClick={() => active && setSelected(selected === abbr ? null : abbr)}
                        onMouseEnter={() => active && setHovered(abbr)}
                        onMouseLeave={() => setHovered(null)}
                      />
                      {active && CENTROIDS[abbr] && (
                        <text x={CENTROIDS[abbr][0]} y={CENTROIDS[abbr][1]}
                          textAnchor="middle" dominantBaseline="middle"
                          fontSize={10} fontWeight="800" fill="#fff"
                          style={{ pointerEvents:"none", userSelect:"none", letterSpacing:"0.06em" }}>
                          {abbr}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{background:"#F37021"}} /> Licensed &amp; Active
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{background:"#142850"}} /> Pending Approval
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-line" /> Not yet available
              </span>
            </div>
          </div>

          {/* Results panel */}
          <div>
            {!selected && (
              <div className="rounded-2xl border border-line bg-white p-8 text-center">
                <div className="mb-3 text-4xl">📍</div>
                <p className="font-bold text-ink">Select your state</p>
                <p className="mt-2 text-sm text-muted">
                  Click any orange or blue state on the map to see available loan officers.
                </p>
                <div className="mt-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Active states</p>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {licensedStates.map((s) => (
                      <button key={s} onClick={() => setSelected(s)}
                        className="rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-80"
                        style={{background:"#F37021"}}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selected && isPending && (
              <div className="rounded-2xl border p-6" style={{ borderColor:"rgba(20,40,80,0.2)", background:"rgba(20,40,80,0.04)" }}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background:"#142850" }} />
                  <p className="text-xs font-bold uppercase tracking-[0.14em]" style={{ color:"#142850" }}>Coming Soon</p>
                </div>
                <h3 className="text-xl font-extrabold text-ink">{stateNames[selected]}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  HCMG is currently pursuing licensure in {stateNames[selected]}.
                  Get notified when we&apos;re active in your state — or start your application now
                  and one of our licensed LOs in an adjacent state will reach out.
                </p>
                <Link href="/get-started"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ background:"#142850" }}>
                  Get notified when we launch →
                </Link>
              </div>
            )}

            {selected && isLicensed && (
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Loan Officers in</p>
                    <h3 className="text-xl font-extrabold text-ink">{stateNames[selected]}</h3>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="text-xs font-bold text-muted hover:text-ink">✕ Clear</button>
                </div>

                {filteredLOs.length === 0 ? (
                  <div className="rounded-2xl border border-line bg-white p-6 text-center">
                    <p className="text-sm text-muted">No LOs listed for this state yet.</p>
                    <Link href="/contact" className="mt-3 inline-block text-sm font-bold text-accent hover:underline">
                      Contact us directly →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredLOs.map((lo) => (
                      <Link key={lo.slug} href={`/team/${lo.slug}`}
                        className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-soft">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                          <TeamPhoto photo={lo.photo} name={lo.name} aspect="1/1" className="h-full w-full" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-ink group-hover:text-accent transition-colors">{lo.name}</p>
                          <p className="text-xs text-muted">{lo.role}{lo.nmls ? ` · NMLS# ${lo.nmls}` : ""}</p>
                          {lo.offices.length > 0 && (
                            <p className="mt-0.5 text-[11px] text-muted/70">{lo.offices.join(" · ")}</p>
                          )}
                        </div>
                        <span className="flex-shrink-0 text-accent opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                      </Link>
                    ))}
                    <Link href="/get-started"
                      className="mt-2 flex items-center justify-center gap-2 rounded-2xl bg-accent py-3 text-sm font-bold text-white transition-opacity hover:opacity-90">
                      Get a free estimate →
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
