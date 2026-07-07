"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { STATE_PATHS } from "@/lib/statePaths";

const LICENSED: string[] = ["FL","TX","GA","NV","CO","VA","DC","MD"];
const PENDING:  string[] = ["OH","MI","AL","OR","NJ","TN","NC","SC","IL","IN","OK","NM","AZ","PA"];

const STATE_NAMES: Record<string,string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DC:"Washington D.C.",DE:"Delaware",FL:"Florida",GA:"Georgia",
  HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",
  LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",
  MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",
  NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",
  OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",
  WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

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

function getStateFill(s: string, hov: string|null, sel: string|null) {
  const isLic = LICENSED.includes(s);
  const isPen = PENDING.includes(s);
  if (s === sel)  return isLic ? "#FF9847" : "#27406D";
  if (s === hov)  return isLic ? "#FF9847" : "#27406D";
  if (isLic)      return "#F37021";
  if (isPen)      return "#142850";
  return "#CBD5E1";
}

export function TrustBar() {
  const router = useRouter();
  const [hovered, setHovered] = useState<string|null>(null);
  const [selected, setSelected] = useState<string|null>(null);
  const stateKeys = Object.keys(STATE_PATHS);

  function handleStateClick(abbr: string) {
    const isActive = LICENSED.includes(abbr) || PENDING.includes(abbr);
    if (!isActive) return;
    setSelected(abbr);
    router.push(`/find-a-loan-officer?state=${abbr}`);
  }

  return (
    <section className="bg-white border-y border-line py-20">
      <div className="container-shell max-w-7xl">

        {/* Header */}
        <div className="mb-12 max-w-2xl">
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
            pending approval. Click any highlighted state to find a loan officer near you.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">

          {/* ── Map card ── */}
          <div
            className="relative overflow-hidden rounded-3xl border border-line bg-sand"
            style={{ boxShadow: "0 20px 60px rgba(15,23,42,0.08)" }}
          >
            {/* subtle inner gradient */}
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background: "radial-gradient(ellipse 70% 60% at 50% 40%, rgba(243,112,33,0.04) 0%, transparent 70%)" }} />

            {/* hover tooltip */}
            {hovered && (
              <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 z-20
                              flex items-center gap-2 rounded-xl border border-line bg-white
                              px-4 py-2 shadow-card text-sm font-bold text-ink whitespace-nowrap">
                <span
                  className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                  style={{ background: LICENSED.includes(hovered) ? "#F37021" : "#142850" }}
                />
                <span>{STATE_NAMES[hovered] ?? hovered}</span>
                {LICENSED.includes(hovered) && (
                  <span className="ml-1 rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                    Licensed
                  </span>
                )}
                {PENDING.includes(hovered) && (
                  <span className="ml-1 rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: "rgba(20,40,80,0.1)", color: "#142850" }}>
                    Coming Soon
                  </span>
                )}
                <span className="ml-1 text-xs text-muted font-normal">· click to explore</span>
              </div>
            )}

            <svg
              viewBox="0 0 975 610"
              style={{ display: "block", width: "100%", padding: "24px" }}
              aria-label="US states where HCMG is licensed or pending"
            >
              <defs>
                {/* orange glow for licensed */}
                <filter id="glow-orange" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                {/* navy glow for pending */}
                <filter id="glow-navy" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {stateKeys.map((abbr) => {
                const isLic  = LICENSED.includes(abbr);
                const isPen  = PENDING.includes(abbr);
                const isActive = isLic || isPen;
                const isHov  = hovered  === abbr;
                const isSel  = selected === abbr;
                const glowFilter = (isHov || isSel)
                  ? isLic ? "url(#glow-orange)" : "url(#glow-navy)"
                  : undefined;

                return (
                  <g key={abbr} style={{ cursor: isActive ? "pointer" : "default" }}>
                    <path
                      d={STATE_PATHS[abbr]}
                      fill={getStateFill(abbr, hovered, selected)}
                      stroke="#fff"
                      strokeWidth={isActive ? 1.5 : 0.6}
                      strokeLinejoin="round"
                      filter={glowFilter}
                      onMouseEnter={() => isActive && setHovered(abbr)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => handleStateClick(abbr)}
                      style={{
                        transition: "fill 0.15s ease",
                        opacity: isActive ? 1 : 0.85,
                      }}
                    />
                    {isActive && CENTROIDS[abbr] && (
                      <text
                        x={CENTROIDS[abbr][0]}
                        y={CENTROIDS[abbr][1]}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={10}
                        fontWeight="800"
                        fill="#fff"
                        style={{ pointerEvents: "none", userSelect: "none", letterSpacing: "0.06em" }}
                      >
                        {abbr}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* bottom hint */}
            <p className="px-6 pb-5 text-center text-[11px] text-muted">
              Click any orange or navy state to find a loan officer
            </p>
          </div>

          {/* ── Right panel ── */}
          <div className="flex flex-col gap-5">

            {/* Legend card */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <p className="mb-4 text-[10px] font-black uppercase tracking-[0.18em] text-muted">Map Key</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 flex-shrink-0 rounded-sm" style={{ background: "#F37021" }} />
                  <div>
                    <p className="text-sm font-bold text-ink">Licensed &amp; Active</p>
                    <p className="text-xs text-muted">{LICENSED.length} states · taking applications now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 flex-shrink-0 rounded-sm" style={{ background: "#142850" }} />
                  <div>
                    <p className="text-sm font-bold text-ink">Pending Approval</p>
                    <p className="text-xs text-muted">{PENDING.length} states · coming soon</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 flex-shrink-0 rounded-sm bg-line" />
                  <p className="text-sm text-muted">Not yet available</p>
                </div>
              </div>
            </div>

            {/* Active states */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
                Active States
              </p>
              <div className="flex flex-wrap gap-1.5">
                {LICENSED.map((s) => (
                  <Link
                    key={s}
                    href={`/find-a-loan-officer?state=${s}`}
                    className="inline-flex rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-white
                               transition-all hover:scale-105 hover:shadow-orange"
                    style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
                  >
                    {s}
                  </Link>
                ))}
              </div>
            </div>

            {/* Pending states */}
            <div className="rounded-2xl border border-line bg-white p-5 shadow-soft">
              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.18em] text-muted">
                Coming Soon
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PENDING.map((s) => (
                  <span
                    key={s}
                    className="inline-flex rounded-lg px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.1em] text-white"
                    style={{ background: "#142850" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA card */}
            <Link
              href="/find-a-loan-officer"
              className="group flex items-center justify-between rounded-2xl border border-line bg-white p-5
                         transition-all duration-200 hover:border-accent hover:shadow-accent"
            >
              <div>
                <p className="font-bold text-ink transition-colors group-hover:text-accent">
                  Find a loan officer near you
                </p>
                <p className="mt-0.5 text-xs text-muted">Browse all LOs by state →</p>
              </div>
              <span
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-white transition-transform group-hover:scale-110"
                style={{ background: "linear-gradient(135deg,#FF9847,#F37021)" }}
              >
                →
              </span>
            </Link>

          </div>
        </div>
      </div>
    </section>
  );
}
