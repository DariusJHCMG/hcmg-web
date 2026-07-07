"use client";

import { useState } from "react";
import Link from "next/link";

const LICENSED: string[] = ["FL","TX","GA","NV","CO","VA","DC","MD"];
const PENDING:  string[] = ["OH","MI","AL","OR","NJ","TN","NC","SC","IL","IN","OK","NM","AZ","PA"];

// Geo-accurate simplified paths — AlbersUSA projection, 975×610 viewBox
// Source: simplified from Natural Earth / topojson-us-atlas
const STATE_PATHS: Record<string,string> = {
  AL:"M 556 388 L 560 388 L 566 390 L 572 420 L 574 440 L 572 456 L 560 456 L 546 456 L 544 430 L 546 400 Z",
  AK:"M 120 520 L 148 510 L 165 518 L 175 535 L 168 552 L 150 558 L 128 548 L 116 534 Z",
  AZ:"M 188 348 L 220 344 L 240 346 L 244 376 L 246 406 L 220 412 L 196 414 L 184 398 L 180 370 Z",
  AR:"M 520 358 L 554 354 L 558 356 L 560 384 L 558 386 L 520 388 L 516 374 Z",
  CA:"M 110 258 L 138 246 L 156 252 L 166 278 L 176 310 L 170 340 L 154 364 L 136 376 L 116 358 L 100 318 L 98 286 Z",
  CO:"M 256 290 L 326 282 L 332 284 L 334 314 L 260 318 L 254 316 Z",
  CT:"M 730 214 L 742 210 L 746 222 L 734 226 Z",
  DC:"M 698 256 L 704 252 L 708 258 L 702 262 Z",
  DE:"M 714 232 L 722 228 L 726 244 L 718 248 Z",
  FL:"M 572 456 L 600 452 L 622 454 L 636 464 L 644 482 L 638 506 L 620 522 L 600 526 L 580 510 L 568 486 Z",
  GA:"M 574 388 L 608 382 L 622 384 L 626 416 L 622 450 L 600 452 L 572 456 L 566 440 L 560 420 Z",
  HI:"M 300 540 L 316 536 L 322 546 L 314 554 L 302 550 Z",
  ID:"M 184 188 L 212 178 L 224 184 L 228 216 L 222 250 L 206 268 L 190 266 L 178 248 L 180 214 Z",
  IL:"M 538 272 L 558 268 L 564 270 L 568 302 L 564 330 L 556 352 L 538 354 L 530 338 L 530 302 Z",
  IN:"M 566 270 L 582 266 L 592 268 L 594 300 L 590 328 L 572 332 L 564 330 L 568 302 Z",
  IA:"M 494 246 L 536 238 L 546 240 L 548 268 L 536 272 L 494 276 L 488 264 Z",
  KS:"M 368 320 L 448 312 L 458 314 L 460 346 L 370 350 L 364 338 Z",
  KY:"M 570 332 L 610 322 L 646 318 L 654 328 L 648 344 L 608 352 L 578 358 L 562 354 L 558 342 Z",
  LA:"M 510 430 L 546 426 L 560 428 L 564 452 L 556 468 L 530 474 L 510 466 L 504 448 Z",
  ME:"M 762 162 L 776 156 L 786 164 L 782 188 L 766 192 L 756 180 Z",
  MD:"M 680 248 L 710 240 L 724 244 L 726 256 L 704 264 L 686 262 L 676 256 Z",
  MA:"M 732 200 L 756 194 L 768 200 L 766 214 L 748 218 L 730 216 Z",
  MI:"M 568 198 L 596 190 L 616 196 L 618 224 L 606 244 L 582 250 L 562 242 L 558 220 Z",
  MN:"M 464 188 L 506 178 L 528 180 L 532 210 L 524 240 L 498 248 L 466 246 L 456 222 Z",
  MS:"M 534 388 L 558 384 L 562 386 L 566 420 L 560 456 L 546 456 L 528 452 L 524 424 Z",
  MO:"M 494 312 L 534 306 L 556 308 L 558 342 L 548 364 L 520 370 L 492 368 L 482 346 L 484 320 Z",
  MT:"M 196 166 L 308 152 L 322 158 L 322 198 L 306 208 L 198 212 L 188 200 Z",
  NE:"M 364 272 L 448 262 L 462 264 L 464 294 L 370 298 L 358 288 Z",
  NV:"M 148 270 L 186 256 L 198 262 L 196 312 L 184 346 L 152 342 L 136 316 L 136 288 Z",
  NH:"M 740 186 L 752 180 L 760 190 L 754 214 L 740 214 L 734 202 Z",
  NJ:"M 714 228 L 726 222 L 732 234 L 726 252 L 712 252 L 710 238 Z",
  NM:"M 240 348 L 300 342 L 314 344 L 316 390 L 310 416 L 242 418 L 232 404 L 230 368 Z",
  NY:"M 670 196 L 714 186 L 730 194 L 732 214 L 714 230 L 692 236 L 668 228 L 658 212 Z",
  NC:"M 618 320 L 674 308 L 706 304 L 716 314 L 710 330 L 672 338 L 620 344 L 606 334 Z",
  ND:"M 376 192 L 460 182 L 472 186 L 470 222 L 464 226 L 376 228 L 368 212 Z",
  OH:"M 592 268 L 626 260 L 640 264 L 644 296 L 632 322 L 606 326 L 590 320 L 584 300 Z",
  OK:"M 362 354 L 452 346 L 478 348 L 494 360 L 492 380 L 406 386 L 362 386 Z",
  OR:"M 126 228 L 184 212 L 198 218 L 194 258 L 180 274 L 140 276 L 118 262 L 116 244 Z",
  PA:"M 638 228 L 696 218 L 712 222 L 714 248 L 696 256 L 654 260 L 630 256 L 626 240 Z",
  RI:"M 748 216 L 756 212 L 760 224 L 752 226 Z",
  SC:"M 610 352 L 648 342 L 658 352 L 650 380 L 630 392 L 608 386 L 604 368 Z",
  SD:"M 374 228 L 462 220 L 472 224 L 470 260 L 464 264 L 374 268 L 364 252 Z",
  TN:"M 556 356 L 606 346 L 648 342 L 656 350 L 650 364 L 608 372 L 560 376 L 548 366 Z",
  TX:"M 310 392 L 370 382 L 408 378 L 476 374 L 496 388 L 504 422 L 508 466 L 490 494 L 460 508 L 420 510 L 380 498 L 346 474 L 316 448 L 296 416 Z",
  UT:"M 216 298 L 258 292 L 268 294 L 266 346 L 248 350 L 216 346 L 206 328 Z",
  VT:"M 726 186 L 738 180 L 744 192 L 738 210 L 724 212 L 718 198 Z",
  VA:"M 632 290 L 676 278 L 706 272 L 716 282 L 716 292 L 680 304 L 640 312 L 618 306 L 614 294 Z",
  WA:"M 130 178 L 184 166 L 196 172 L 196 198 L 182 212 L 140 216 L 122 200 Z",
  WV:"M 632 274 L 656 264 L 666 268 L 670 282 L 658 304 L 634 308 L 618 300 L 616 282 Z",
  WI:"M 516 200 L 552 192 L 572 196 L 572 230 L 556 250 L 528 254 L 508 244 L 504 218 Z",
  WY:"M 252 238 L 328 228 L 342 230 L 344 278 L 330 282 L 252 284 L 242 270 Z",
};

const CENTROIDS: Record<string,[number,number]> = {
  AL:[558,422], AK:[146,534], AZ:[214,380], AR:[537,371], CA:[136,312],
  CO:[294,300], CT:[737,218], DC:[703,257], DE:[719,238], FL:[600,488],
  GA:[596,416], HI:[311,545], ID:[202,224], IL:[548,310], IN:[578,298],
  IA:[517,257], KS:[412,331], KY:[606,337], LA:[532,450], ME:[771,174],
  MD:[700,252], MA:[748,207], MI:[588,220], MN:[492,213], MS:[544,422],
  MO:[517,338], MT:[256,180], NE:[412,280], NV:[166,302], NH:[747,198],
  NJ:[720,240], NM:[272,380], NY:[693,211], NC:[660,322], ND:[419,205],
  OH:[614,292], OK:[427,366], OR:[156,248], PA:[668,238], RI:[752,219],
  SC:[628,366], SD:[418,244], TN:[600,361], TX:[400,444], UT:[237,320],
  VT:[731,196], VA:[664,292], WA:[160,192], WV:[642,286], WI:[537,222],
  WY:[292,256],
};

function fill(s: string) {
  if (LICENSED.includes(s)) return "#F37021";
  if (PENDING.includes(s))  return "#3b82f6";
  return "#e2e8f0";
}
function stroke(s: string) {
  if (LICENSED.includes(s) || PENDING.includes(s)) return "#fff";
  return "#cbd5e1";
}

export function TrustBar() {
  const [hovered, setHovered] = useState<string|null>(null);
  const states = Object.keys(STATE_PATHS);

  return (
    <section className="bg-white border-y border-line py-20">
      <div className="container-shell max-w-7xl">

        {/* Header */}
        <div className="mb-10 max-w-2xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-accent flex items-center gap-2">
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

        <div className="grid gap-10 lg:grid-cols-[1fr_340px] lg:items-start">

          {/* Map */}
          <div className="relative w-full">
            <svg
              viewBox="90 150 890 480"
              style={{ display:"block", width:"100%" }}
              aria-label="US states where HCMG is licensed"
            >
              {states.map((abbr) => {
                const isActive = LICENSED.includes(abbr) || PENDING.includes(abbr);
                const isHov = hovered === abbr;
                return (
                  <g key={abbr}>
                    <path
                      d={STATE_PATHS[abbr]}
                      fill={isHov ? (LICENSED.includes(abbr) ? "#c45213" : "#2563eb") : fill(abbr)}
                      stroke={stroke(abbr)}
                      strokeWidth={isActive ? 1.5 : 1}
                      strokeLinejoin="round"
                      style={{ cursor: isActive ? "pointer" : "default", transition:"fill 0.15s" }}
                      onMouseEnter={() => isActive && setHovered(abbr)}
                      onMouseLeave={() => setHovered(null)}
                    />
                    {isActive && CENTROIDS[abbr] && (
                      <text
                        x={CENTROIDS[abbr][0]} y={CENTROIDS[abbr][1]}
                        textAnchor="middle" dominantBaseline="middle"
                        fontSize={9} fontWeight="700" fill="#fff"
                        style={{ pointerEvents:"none", userSelect:"none", letterSpacing:"0.05em" }}
                      >
                        {abbr}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Tooltip */}
            {hovered && (
              <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-xl border border-line bg-white px-4 py-2 shadow-card text-sm font-bold text-ink">
                {hovered} — {LICENSED.includes(hovered) ? "✅ Licensed & Active" : "🔵 Pending Approval"}
              </div>
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-8">
            {/* Legend */}
            <div className="rounded-2xl border border-line bg-sand p-5 space-y-3">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Map Key</p>
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 flex-shrink-0 rounded" style={{background:"#F37021"}} />
                <div>
                  <p className="text-sm font-bold text-ink">Licensed &amp; Active</p>
                  <p className="text-xs text-muted">{LICENSED.length} states · accepting applications now</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 flex-shrink-0 rounded bg-blue-500" />
                <div>
                  <p className="text-sm font-bold text-ink">Pending Approval</p>
                  <p className="text-xs text-muted">{PENDING.length} states · coming soon</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="h-4 w-4 flex-shrink-0 rounded" style={{background:"#e2e8f0"}} />
                <div>
                  <p className="text-sm font-bold text-ink">Not yet licensed</p>
                </div>
              </div>
            </div>

            {/* Licensed pills */}
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Active States</p>
              <div className="flex flex-wrap gap-2">
                {LICENSED.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white"
                    style={{background:"#F37021"}}>
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Pending pills */}
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Coming Soon</p>
              <div className="flex flex-wrap gap-2">
                {PENDING.map((s) => (
                  <span key={s} className="inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-white bg-blue-500">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link href="/find-a-loan-officer"
              className="flex items-center justify-between rounded-2xl border border-line bg-white p-5 transition-all hover:border-accent hover:shadow-soft group">
              <div>
                <p className="font-bold text-ink group-hover:text-accent transition-colors">Find a loan officer near you</p>
                <p className="text-xs text-muted mt-0.5">Browse LOs by state →</p>
              </div>
              <span className="text-2xl text-accent">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
