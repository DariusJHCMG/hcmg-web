"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TeamPhoto } from "@/components/ui/TeamPhoto";
import { STATE_PATHS } from "@/lib/statePaths";

interface LOMember {
  slug: string; name: string; role: string; nmls: string | null;
  photo: string; shortBio: string; offices: string[];
  phone: string | null; email: string | null;
  licensed_states: string[];
}

interface Props {
  teamMembers: LOMember[];
  licensedStates: string[];
  pendingStates: string[];
  stateNames: Record<string,string>;
  initialState?: string | null;
}

// Real centroids — us-atlas Albers USA 975×610
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

  const filteredLOs = useMemo(() => {
    if (!selected) return [];
    // Primary filter: licensed_states array contains the selected state abbreviation
    const byLicensedStates = teamMembers.filter((m) =>
      m.licensed_states && m.licensed_states.includes(selected)
    );
    if (byLicensedStates.length > 0) return byLicensedStates;

    // Fallback: filter by offices text match (for members without licensed_states set)
    const stateName = stateNames[selected] ?? selected;
    const byOffices = teamMembers.filter((m) => {
      const r = m.role.toLowerCase();
      const isLO = r.includes("loan officer") || r.includes("originator") || r.includes("chief lending") || r.includes("chief production");
      if (!isLO) return false;
      if (!m.offices || m.offices.length === 0) return false;
      return m.offices.some((o) => o.includes(stateName.split(",")[0]) || o.includes(selected));
    });
    return byOffices;
  }, [selected, teamMembers, stateNames]);

  const isPending  = selected ? pendingStates.includes(selected)  : false;
  const isLicensed = selected ? licensedStates.includes(selected) : false;

  return (
    <section className="section-pad bg-sand">
      <div className="container-shell max-w-6xl">

        {/* ── Map ── */}
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-muted">
          {selected
            ? `Showing loan officers in ${stateNames[selected] ?? selected} — click the state again to clear`
            : "Click any state to find loan officers"}
        </p>

        <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
          {/* hover tooltip */}
          {hovered && (
            <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 z-10
                            flex items-center gap-2 rounded-xl border border-line bg-white
                            px-4 py-2 shadow-card text-sm font-bold text-ink whitespace-nowrap">
              <span className="h-2 w-2 flex-shrink-0 rounded-full"
                style={{ background: licensedStates.includes(hovered) ? "#F37021" : "#142850" }} />
              {stateNames[hovered] ?? hovered}
              {licensedStates.includes(hovered) && (
                <span className="ml-1 rounded-md bg-orange-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                  Licensed
                </span>
              )}
              {pendingStates.includes(hovered) && (
                <span className="ml-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                      style={{ background:"rgba(20,40,80,0.08)", color:"#142850" }}>
                  Coming Soon
                </span>
              )}
              <span className="ml-1 text-xs font-normal text-muted">· click to explore</span>
            </div>
          )}

          <svg viewBox="0 0 975 610" style={{ display:"block", width:"100%", padding:"20px" }}
               aria-label="Click a state to find loan officers">
            <defs>
              <filter id="lo-glow-orange" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="lo-glow-navy" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            {states.map((abbr) => {
              const active = allActive.includes(abbr);
              const isLic  = licensedStates.includes(abbr);
              const isHov  = hovered  === abbr;
              const isSel  = selected === abbr;
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
        <div className="mt-4 flex flex-wrap gap-5 text-xs font-semibold text-muted">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{background:"#F37021"}} />
            Licensed &amp; Active
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm" style={{background:"#142850"}} />
            Pending Approval
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-line" />
            Not yet available
          </span>
        </div>

        {/* ── Results panel — BELOW the map ── */}
        <div className="mt-10">

          {/* Empty state */}
          {!selected && (
            <div className="rounded-2xl border border-line bg-white p-10 text-center shadow-soft">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-sand text-2xl">
                📍
              </div>
              <p className="text-lg font-bold text-ink">Select a state on the map</p>
              <p className="mt-2 text-sm text-muted">
                Click any orange or navy state to see licensed loan officers in your area.
              </p>
              <div className="mt-8">
                <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted">Active states</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {licensedStates.map((s) => (
                    <button key={s} onClick={() => setSelected(s)}
                      className="rounded-lg px-4 py-2 text-[11px] font-black uppercase tracking-[0.1em] text-white
                                 transition-all hover:scale-105 hover:shadow-orange"
                      style={{ background:"linear-gradient(135deg,#FF9847,#F37021)" }}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Pending state */}
          {selected && isPending && (
            <div className="overflow-hidden rounded-2xl border shadow-soft"
                 style={{ borderColor:"rgba(20,40,80,0.15)" }}>
              <div className="px-8 py-6" style={{ background:"rgba(20,40,80,0.03)" }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white text-sm font-black"
                          style={{ background:"#142850" }}>
                      {selected}
                    </span>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color:"#142850" }}>
                        Coming Soon
                      </p>
                      <h3 className="text-2xl font-extrabold text-ink">{stateNames[selected]}</h3>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)}
                    className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted
                               hover:border-ink hover:text-ink transition-colors">
                    ✕ Clear
                  </button>
                </div>
                <p className="mt-5 text-sm leading-7 text-muted max-w-2xl">
                  HCMG is actively pursuing licensure in {stateNames[selected]}. Get in touch now
                  and one of our licensed LOs will reach out as soon as we launch in your state.
                </p>
                <Link href="/get-started"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold text-white
                             transition-opacity hover:opacity-90"
                  style={{ background:"#142850" }}>
                  Get notified when we launch →
                </Link>
              </div>
            </div>
          )}

          {/* Licensed state — LO grid */}
          {selected && isLicensed && (
            <div>
              {/* Section header */}
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-xs font-black"
                        style={{ background:"linear-gradient(135deg,#FF9847,#F37021)" }}>
                    {selected}
                  </span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-accent">Licensed &amp; Active</p>
                    <h3 className="text-2xl font-extrabold text-ink">{stateNames[selected]}</h3>
                  </div>
                </div>
                <button onClick={() => setSelected(null)}
                  className="rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-bold text-muted
                             hover:border-ink hover:text-ink transition-colors shadow-soft">
                  ✕ Clear
                </button>
              </div>

              {filteredLOs.length === 0 ? (
                <div className="rounded-2xl border border-line bg-white p-8 text-center shadow-soft">
                  <p className="text-sm text-muted">No LOs listed for this state yet.</p>
                  <Link href="/contact" className="mt-3 inline-block text-sm font-bold text-accent hover:underline">
                    Contact us directly →
                  </Link>
                </div>
              ) : (
                <>
                  {/* LO grid */}
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredLOs.map((lo) => (
                      <Link key={lo.slug} href={`/team/${lo.slug}`}
                        className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white
                                   shadow-soft transition-all duration-200
                                   hover:-translate-y-1 hover:border-accent hover:shadow-card">

                        {/* Photo banner */}
                        <div className="relative h-44 w-full overflow-hidden bg-sand">
                          <TeamPhoto
                            photo={lo.photo}
                            name={lo.name}
                            aspect="4/3"
                            className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                          />
                          {/* orange accent bar */}
                          <div className="absolute bottom-0 left-0 right-0 h-1"
                               style={{ background:"linear-gradient(90deg,#FF9847,#F37021)" }} />
                        </div>

                        {/* Info */}
                        <div className="flex flex-1 flex-col p-5">
                          <p className="text-base font-extrabold text-ink transition-colors group-hover:text-accent leading-tight">
                            {lo.name}
                          </p>
                          <p className="mt-1 text-xs font-semibold text-muted">{lo.role}</p>
                          {lo.nmls && (
                            <p className="mt-1 text-[11px] text-muted/70">NMLS# {lo.nmls}</p>
                          )}
                          {lo.offices.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {lo.offices.map((office, i) => (
                                <span key={i}
                                  className="inline-flex rounded-md bg-sand px-2 py-0.5 text-[10px] font-semibold text-muted">
                                  {office}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="mt-auto pt-4 flex items-center justify-between">
                            <span className="text-xs font-bold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                              View profile →
                            </span>
                            <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs text-white opacity-0 transition-all group-hover:opacity-100"
                                  style={{ background:"#F37021" }}>
                              →
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* CTA bar */}
                  <div className="mt-6 flex items-center justify-between rounded-2xl border border-line bg-white px-6 py-5 shadow-soft">
                    <div>
                      <p className="font-bold text-ink">Ready to get started in {stateNames[selected]}?</p>
                      <p className="mt-0.5 text-xs text-muted">Connect with a licensed loan officer today</p>
                    </div>
                    <Link href="/get-started"
                      className="flex-shrink-0 rounded-xl px-5 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                      style={{ background:"linear-gradient(135deg,#FF9847,#F37021)" }}>
                      Get a free estimate →
                    </Link>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>
    </section>
  );
}
