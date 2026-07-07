"use client";

// ── Licensed & pending state lists ───────────────────────────────────
const LICENSED: string[] = ["FL", "TX", "GA", "NV", "CO", "VA", "DC", "MD"];
const PENDING:  string[]  = [];

// ── Real simplified US state paths (960×600 Mercator viewBox) ────────
const STATE_PATHS: Record<string, string> = {
  AL: "M580,480 L595,478 L600,530 L592,540 L572,538 L568,518 Z",
  AK: "M152,550 L185,543 L200,560 L193,580 L165,582 L148,568 Z",
  AZ: "M193,435 L258,426 L256,502 L200,509 L185,474 Z",
  AR: "M552,438 L604,433 L607,470 L554,474 Z",
  CA: "M118,330 L182,318 L193,424 L160,461 L122,422 L105,375 Z",
  CO: "M278,350 L380,342 L383,408 L280,414 Z",
  CT: "M756,272 L774,269 L777,293 L756,295 Z",
  DC: "M714,325 L721,318 L726,325 L718,331 Z",
  DE: "M734,291 L748,287 L752,318 L735,320 Z",
  FL: "M607,528 L672,522 L692,564 L668,612 L638,622 L612,596 L596,560 Z",
  GA: "M606,454 L658,448 L663,516 L626,528 L598,522 L596,480 Z",
  HI: "M304,600 L326,596 L332,614 L316,618 Z",
  ID: "M192,200 L242,193 L252,298 L224,316 L200,294 Z",
  IL: "M565,320 L596,317 L600,400 L567,403 Z",
  IN: "M598,318 L628,315 L632,392 L600,396 Z",
  IA: "M508,287 L568,281 L571,337 L510,342 Z",
  KS: "M392,406 L490,399 L493,452 L394,457 Z",
  KY: "M606,400 L678,390 L683,432 L607,441 Z",
  LA: "M530,522 L589,517 L594,558 L562,570 L526,554 Z",
  ME: "M784,192 L812,185 L820,226 L788,230 Z",
  MD: "M706,320 L748,311 L753,336 L720,343 L706,336 Z",
  MA: "M754,248 L792,241 L796,268 L755,271 Z",
  MI: "M590,234 L636,226 L644,282 L610,290 L588,274 Z",
  MN: "M482,192 L548,184 L552,274 L484,279 Z",
  MS: "M562,470 L594,466 L598,530 L564,534 Z",
  MO: "M508,356 L570,349 L575,424 L510,429 Z",
  MT: "M218,158 L350,147 L355,242 L221,249 Z",
  NE: "M382,316 L488,307 L491,364 L385,371 Z",
  NV: "M158,306 L212,297 L222,400 L186,424 L150,376 Z",
  NH: "M768,225 L786,221 L790,262 L769,265 Z",
  NJ: "M732,282 L752,277 L756,314 L734,317 Z",
  NM: "M262,444 L336,437 L340,516 L264,521 Z",
  NY: "M696,234 L757,222 L762,278 L728,285 L698,270 Z",
  NC: "M646,404 L726,392 L731,430 L648,440 Z",
  ND: "M394,186 L492,176 L495,232 L397,238 Z",
  OH: "M620,302 L666,296 L671,374 L622,379 Z",
  OK: "M380,454 L494,445 L498,496 L382,502 Z",
  OR: "M124,236 L200,225 L210,307 L158,314 L122,278 Z",
  PA: "M668,274 L734,264 L738,304 L670,312 Z",
  RI: "M773,267 L784,264 L786,280 L774,281 Z",
  SC: "M644,444 L692,436 L697,486 L652,494 Z",
  SD: "M393,234 L491,225 L494,285 L396,291 Z",
  TN: "M572,432 L672,418 L677,454 L574,467 Z",
  TX: "M342,478 L498,465 L508,578 L444,626 L390,618 L336,556 Z",
  UT: "M220,336 L280,328 L284,414 L222,420 Z",
  VT: "M752,218 L770,214 L773,248 L752,251 Z",
  VA: "M664,342 L732,330 L738,368 L706,380 L665,374 Z",
  WA: "M124,172 L200,162 L204,228 L126,235 Z",
  WV: "M660,328 L696,320 L701,362 L663,370 Z",
  WI: "M540,220 L586,213 L590,289 L542,294 Z",
  WY: "M272,248 L376,238 L380,314 L274,322 Z",
};

// Centroid labels for licensed/pending states
const STATE_LABELS: Record<string, [number, number]> = {
  AL:[584,509], AK:[172,565], AZ:[224,467], AR:[580,452], CA:[150,390],
  CO:[331,378], CT:[765,282], DC:[719,324], DE:[743,303], FL:[637,575],
  GA:[630,487], HI:[318,607], ID:[222,255], IL:[582,360], IN:[614,355],
  IA:[538,309], KS:[441,428], KY:[644,415], LA:[560,540], ME:[800,208],
  MD:[729,328], MA:[774,255], MI:[614,258], MN:[516,232], MS:[578,500],
  MO:[540,388], MT:[284,196], NE:[436,338], NV:[186,360], NH:[778,243],
  NJ:[742,296], NM:[300,479], NY:[727,252], NC:[687,416], ND:[444,208],
  OH:[645,338], OK:[438,470], OR:[164,270], PA:[702,289], RI:[779,272],
  SC:[668,465], SD:[444,258], TN:[623,442], TX:[423,545], UT:[252,374],
  VT:[761,232], VA:[698,356], WA:[162,200], WV:[678,345], WI:[562,252],
  WY:[326,280],
};

function stateColor(s: string) {
  if (LICENSED.includes(s)) return "#F37021";
  if (PENDING.includes(s))  return "#3b82f6";
  return "#1e2a3a";
}
function stateOpacity(s: string) {
  return LICENSED.includes(s) || PENDING.includes(s) ? 1 : 0.7;
}

export function TrustBar() {
  const states = Object.keys(STATE_PATHS);

  return (
    <section style={{ background: "#0d1117" }} className="py-20">
      <div className="container-shell max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[420px_1fr] lg:items-center">

          {/* ── Left: copy ───────────────────────────────────── */}
          <div>
            <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em]"
               style={{ color: "#F37021" }}>
              <span style={{ display:"inline-block", width:24, height:2, background:"#F37021", borderRadius:2 }} />
              Our Reach
            </p>
            <h2 className="font-extrabold tracking-tight text-white"
                style={{ fontSize:"clamp(40px,5vw,60px)", lineHeight:1.05 }}>
              Helping borrowers<br />
              in every{" "}
              <em style={{ fontStyle:"italic", color:"#F37021" }}>neighborhood.</em>
            </h2>
            <p className="mt-6 text-base leading-7" style={{ color:"#8b9db0", maxWidth:400 }}>
              Harris Capital Mortgage Group is licensed and actively serving clients
              across {LICENSED.length} states — and growing. Every HCMG loan officer
              is held to the highest standard: best rate, fastest close, full transparency.
            </p>

            {/* Legend */}
            <div className="mt-8 flex items-center gap-6">
              <span className="flex items-center gap-2 text-xs font-semibold" style={{ color:"#8b9db0" }}>
                <span style={{ width:10, height:10, borderRadius:"50%", background:"#F37021", display:"inline-block" }} />
                Licensed &amp; Active
              </span>
              {PENDING.length > 0 && (
                <span className="flex items-center gap-2 text-xs font-semibold" style={{ color:"#8b9db0" }}>
                  <span style={{ width:10, height:10, borderRadius:"50%", border:"2px solid #3b82f6", display:"inline-block" }} />
                  Coming Soon
                </span>
              )}
            </div>

            {/* State pills */}
            <div className="mt-6 flex flex-wrap gap-2">
              {LICENSED.map((s) => (
                <span key={s}
                  className="inline-flex items-center justify-center rounded-lg text-xs font-bold uppercase tracking-[0.08em]"
                  style={{ background:"#1a2535", color:"#F37021", border:"1px solid #2a3a50", padding:"6px 12px", minWidth:44 }}>
                  {s}
                </span>
              ))}
              {PENDING.map((s) => (
                <span key={s}
                  className="inline-flex items-center justify-center rounded-lg text-xs font-bold uppercase tracking-[0.08em]"
                  style={{ background:"#1a2535", color:"#3b82f6", border:"1px solid #2a3a50", padding:"6px 12px", minWidth:44 }}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* ── Right: map ───────────────────────────────────── */}
          <div style={{ position:"relative" }}>
            <svg
              viewBox="100 140 870 510"
              style={{ display:"block", width:"100%", filter:"drop-shadow(0 4px 24px rgba(243,112,33,0.12))" }}
              aria-label="Map of US states where HCMG is licensed"
            >
              {states.map((abbr) => (
                <g key={abbr}>
                  <path
                    d={STATE_PATHS[abbr]}
                    fill={stateColor(abbr)}
                    opacity={stateOpacity(abbr)}
                    stroke="#0d1117"
                    strokeWidth={1.8}
                    strokeLinejoin="round"
                  />
                  {(LICENSED.includes(abbr) || PENDING.includes(abbr)) && STATE_LABELS[abbr] && (
                    <text
                      x={STATE_LABELS[abbr][0]}
                      y={STATE_LABELS[abbr][1]}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={10}
                      fontWeight="800"
                      fill="#fff"
                      style={{ pointerEvents:"none", userSelect:"none", letterSpacing:"0.06em" }}
                    >
                      {abbr}
                    </text>
                  )}
                </g>
              ))}
            </svg>
            <p className="mt-3 text-center text-xs font-semibold" style={{ color:"#3a4d62" }}>
              Orange = licensed &amp; active · Blue = coming soon
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
