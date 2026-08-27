/**
 * tests/goal-engine.test.ts
 *
 * Unit tests for the pure-TypeScript helpers in lib/goal-engine.ts.
 * Covers formatting, pacing calculations, and date math.
 * No DB calls — all tested functions have zero external dependencies.
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  fmt$,
  fmtPct,
  paceColor,
  paceLabel,
  monthProgress,
  daysRemaining,
  requiredPace,
  calcPace,
} from "../lib/goal-engine";

// ── fmt$ ──────────────────────────────────────────────────────────────────────

describe("fmt$", () => {
  it("formats values under $1k with no suffix", () => {
    expect(fmt$(0)).toBe("$0");
    expect(fmt$(500)).toBe("$500");
    expect(fmt$(999)).toBe("$999");
  });

  it("formats thousands as $Xk (no decimal)", () => {
    expect(fmt$(1000)).toBe("$1K");
    expect(fmt$(1500)).toBe("$2K");   // toFixed(0) rounds
    expect(fmt$(850000)).toBe("$850K");
    expect(fmt$(999999)).toBe("$1000K");
  });

  it("formats millions as $X.XM", () => {
    expect(fmt$(1_000_000)).toBe("$1.0M");
    expect(fmt$(1_500_000)).toBe("$1.5M");
    expect(fmt$(10_000_000)).toBe("$10.0M");
  });
});

// ── fmtPct ────────────────────────────────────────────────────────────────────

describe("fmtPct", () => {
  it("rounds and appends %", () => {
    expect(fmtPct(0)).toBe("0%");
    expect(fmtPct(75)).toBe("75%");
    expect(fmtPct(100)).toBe("100%");
    expect(fmtPct(33.7)).toBe("34%");
    expect(fmtPct(99.4)).toBe("99%");
  });
});

// ── paceColor ─────────────────────────────────────────────────────────────────

describe("paceColor", () => {
  it("returns green at 90% and above", () => {
    expect(paceColor(90)).toBe("green");
    expect(paceColor(100)).toBe("green");
    expect(paceColor(150)).toBe("green");
  });

  it("returns yellow between 70% and 89%", () => {
    expect(paceColor(70)).toBe("yellow");
    expect(paceColor(80)).toBe("yellow");
    expect(paceColor(89)).toBe("yellow");
  });

  it("returns red below 70%", () => {
    expect(paceColor(0)).toBe("red");
    expect(paceColor(50)).toBe("red");
    expect(paceColor(69)).toBe("red");
  });
});

// ── paceLabel ─────────────────────────────────────────────────────────────────

describe("paceLabel", () => {
  it("returns On Pace at 100% and above", () => {
    expect(paceLabel(100)).toContain("On Pace");
    expect(paceLabel(120)).toContain("On Pace");
  });

  it("returns Slightly Behind between 80–99%", () => {
    expect(paceLabel(80)).toContain("Slightly Behind");
    expect(paceLabel(99)).toContain("Slightly Behind");
  });

  it("returns Off Track below 80%", () => {
    expect(paceLabel(0)).toContain("Off Track");
    expect(paceLabel(79)).toContain("Off Track");
  });
});

// ── monthProgress ─────────────────────────────────────────────────────────────

describe("monthProgress", () => {
  afterEach(() => vi.useRealTimers());

  it("returns 0 before the goal period starts", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-31T12:00:00.000Z"));
    expect(monthProgress("2026-08-01", "2026-08-31")).toBe(0);
  });

  it("returns 1 after the goal period ends", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T12:00:00.000Z"));
    expect(monthProgress("2026-08-01", "2026-08-31")).toBe(1);
  });

  it("returns correct fraction mid-month (Aug 7 of 31 days)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-07T12:00:00.000Z"));
    const progress = monthProgress("2026-08-01", "2026-08-31");
    // Day 7 of 31 = 7/31 ≈ 0.2258
    expect(progress).toBeCloseTo(7 / 31, 3);
  });

  it("returns 1 on the last day of the period", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-31T12:00:00.000Z"));
    expect(monthProgress("2026-08-01", "2026-08-31")).toBe(1);
  });
});

// ── daysRemaining ─────────────────────────────────────────────────────────────

describe("daysRemaining", () => {
  afterEach(() => vi.useRealTimers());

  it("returns 0 after the end date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-01T00:00:00.000Z"));
    expect(daysRemaining("2026-08-31")).toBe(0);
  });

  it("returns correct days remaining mid-month", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-07T12:00:00.000Z"));
    // Aug 7 → Aug 31: 24 full days left after today
    expect(daysRemaining("2026-08-31")).toBe(24);
  });
});

// ── requiredPace + calcPace ───────────────────────────────────────────────────

describe("requiredPace and calcPace", () => {
  afterEach(() => vi.useRealTimers());

  it("requiredPace returns monthProgress * 100", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-07T12:00:00.000Z"));
    const rp = requiredPace("2026-08-01", "2026-08-31");
    expect(rp).toBeCloseTo((7 / 31) * 100, 1);
  });

  it("calcPace returns 0 when commitment is 0", () => {
    expect(calcPace(5, 0)).toBe(0);
  });

  it("calcPace computes actual/commitment * 100", () => {
    expect(calcPace(3, 10)).toBeCloseTo(30);
    expect(calcPace(10, 10)).toBeCloseTo(100);
    expect(calcPace(12, 10)).toBeCloseTo(120);
  });
});
