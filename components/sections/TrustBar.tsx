"use client";

// States where HCMG is currently licensed (light up orange)
const LICENSED: string[] = ["FL", "TX", "GA", "NV", "CO", "VA", "DC", "MD"];

// States where licensing is pending (show blue)
const PENDING: string[] = [];

// Abbreviated US map — each state as an SVG path.
// Coordinates fit a 960×600 viewBox (standard Mercator-style US projection).
const STATE_PATHS: Record<string, string> = {
  AL: "M 569 353 L 577 355 L 580 393 L 574 397 L 563 396 L 558 388 L 558 356 Z",
  AK: "M 138 467 L 160 474 L 170 485 L 163 495 L 148 494 L 136 483 Z",
  AZ: "M 175 308 L 220 315 L 217 371 L 171 365 L 162 330 Z",
  AR: "M 535 328 L 560 326 L 561 355 L 535 358 Z",
  CA: "M 112 246 L 160 258 L 170 310 L 133 340 L 105 305 L 95 270 Z",
  CO: "M 258 257 L 335 253 L 337 307 L 260 309 Z",
  CT: "M 718 198 L 728 197 L 730 213 L 718 214 Z",
  DC: "M 683 247 L 688 243 L 692 248 L 687 252 Z",
  DE: "M 703 218 L 711 216 L 713 232 L 704 233 Z",
  FL: "M 586 393 L 636 390 L 650 420 L 633 457 L 613 465 L 594 446 L 580 415 Z",
  GA: "M 590 340 L 625 338 L 628 385 L 600 394 L 580 390 L 577 358 Z",
  HI: "M 280 500 L 295 498 L 300 510 L 288 513 Z",
  ID: "M 175 148 L 210 143 L 218 210 L 198 225 L 180 205 Z",
  IL: "M 541 240 L 563 238 L 566 298 L 542 302 Z",
  IN: "M 568 238 L 590 238 L 590 295 L 568 298 Z",
  IA: "M 487 213 L 538 210 L 540 250 L 488 252 Z",
  KS: "M 378 290 L 455 287 L 456 330 L 379 332 Z",
  KY: "M 578 290 L 636 283 L 640 315 L 579 323 Z",
  LA: "M 510 385 L 558 383 L 562 415 L 538 425 L 508 412 Z",
  ME: "M 748 145 L 768 140 L 775 168 L 752 173 Z",
  MD: "M 672 242 L 710 235 L 713 250 L 689 257 L 672 255 Z",
  MA: "M 718 185 L 748 178 L 752 196 L 720 198 Z",
  MI: "M 565 175 L 600 168 L 608 210 L 578 218 L 563 205 Z",
  MN: "M 463 145 L 515 140 L 518 205 L 465 210 Z",
  MS: "M 548 340 L 574 338 L 574 390 L 548 390 Z",
  MO: "M 489 265 L 543 260 L 547 318 L 490 322 Z",
  MT: "M 205 118 L 325 110 L 328 178 L 208 183 Z",
  NE: "M 370 232 L 455 225 L 458 268 L 373 273 Z",
  NV: "M 148 228 L 190 222 L 198 298 L 168 316 L 140 280 Z",
  NH: "M 730 168 L 745 165 L 748 195 L 732 197 Z",
  NJ: "M 700 210 L 714 207 L 717 233 L 703 235 Z",
  NM: "M 248 328 L 310 323 L 313 385 L 250 388 Z",
  NY: "M 667 178 L 718 168 L 722 208 L 695 215 L 668 205 Z",
  NC: "M 617 300 L 683 288 L 688 318 L 618 328 Z",
  ND: "M 380 143 L 462 138 L 463 178 L 381 182 Z",
  OH: "M 590 228 L 630 223 L 635 278 L 592 282 Z",
  OK: "M 368 320 L 463 314 L 465 357 L 370 360 Z",
  OR: "M 118 175 L 188 168 L 190 228 L 148 234 L 118 210 Z",
  PA: "M 638 207 L 698 200 L 700 235 L 640 241 Z",
  RI: "M 733 197 L 742 196 L 743 207 L 734 208 Z",
  SC: "M 617 325 L 655 318 L 660 355 L 625 362 Z",
  SD: "M 380 180 L 462 175 L 465 218 L 382 223 Z",
  TN: "M 557 310 L 635 300 L 638 328 L 559 338 Z",
  TX: "M 330 350 L 460 340 L 468 430 L 415 468 L 370 460 L 325 410 Z",
  UT: "M 210 248 L 260 243 L 262 308 L 212 312 Z",
  VT: "M 718 163 L 730 161 L 732 192 L 720 193 Z",
  VA: "M 635 255 L 695 242 L 698 270 L 668 282 L 637 278 Z",
  WA: "M 120 130 L 185 122 L 188 168 L 120 173 Z",
  WV: "M 630 250 L 660 243 L 665 278 L 638 285 Z",
  WI: "M 523 163 L 562 158 L 566 210 L 525 215 Z",
  WY: "M 260 185 L 342 178 L 345 243 L 262 248 Z",
};

function getColor(state: string) {
  if (LICENSED.includes(state)) return "var(--color-accent, #F37021)";
  if (PENDING.includes(state))  return "#3b82f6";
  return "#d1d8e0";
}

function getOpacity(state: string) {
  if (LICENSED.includes(state) || PENDING.includes(state)) return 1;
  return 0.55;
}

export function TrustBar() {
  const allStates = Object.keys(STATE_PATHS);

  return (
    <div className="border-y border-line bg-sand py-6">
      <div className="container-shell max-w-5xl">
        {/* Legend */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <span className="text-muted/60">HCMG Licensed States</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "var(--color-accent, #F37021)" }} />
            <span className="text-ink">Licensed</span>
          </span>
          {PENDING.length > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-3 w-3 rounded-sm bg-blue-500" />
              <span className="text-ink">Pending</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: "#d1d8e0" }} />
            <span className="text-muted/60">Not licensed</span>
          </span>
        </div>

        {/* Map */}
        <div className="w-full overflow-hidden rounded-2xl border border-line bg-white p-2">
          <svg
            viewBox="80 110 880 500"
            className="w-full"
            style={{ display: "block", maxHeight: 340 }}
            aria-label="Map of US states where HCMG is licensed"
          >
            {allStates.map((abbr) => (
              <g key={abbr}>
                <path
                  d={STATE_PATHS[abbr]}
                  fill={getColor(abbr)}
                  opacity={getOpacity(abbr)}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
                {/* State label — only show on licensed/pending to avoid clutter */}
                {(LICENSED.includes(abbr) || PENDING.includes(abbr)) && (() => {
                  const parts = STATE_PATHS[abbr].replace(/[MLZ]/g, " ").trim().split(/\s+/);
                  const xs: number[] = [], ys: number[] = [];
                  for (let i = 0; i < parts.length - 1; i += 2) {
                    const x = parseFloat(parts[i]), y = parseFloat(parts[i + 1]);
                    if (!isNaN(x) && !isNaN(y)) { xs.push(x); ys.push(y); }
                  }
                  const cx = xs.reduce((a, b) => a + b, 0) / xs.length;
                  const cy = ys.reduce((a, b) => a + b, 0) / ys.length;
                  return (
                    <text
                      x={cx} y={cy + 1}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={9}
                      fontWeight="700"
                      fill="#fff"
                      style={{ pointerEvents: "none", userSelect: "none" }}
                    >
                      {abbr}
                    </text>
                  );
                })()}
              </g>
            ))}
          </svg>
        </div>

        {/* State pills below map */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {LICENSED.map((s) => (
            <span key={s}
              className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white"
              style={{ background: "var(--color-accent, #F37021)" }}
            >
              {s}
            </span>
          ))}
          {PENDING.map((s) => (
            <span key={s}
              className="inline-flex items-center rounded-full bg-blue-500 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white"
            >
              {s} <span className="ml-1 opacity-80">·pending</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
