/**
 * lib/liftoff-sla.ts
 *
 * SLA computation utilities for Lift Off requests.
 * Pure TypeScript — no external dependencies.
 * Safe to import from both server routes and client components.
 *
 * Business hours: Mon–Sun, 10:00 AM ET → 7:00 PM ET (9h open).
 * Closed window:  7:00 PM ET → 10:00 AM ET (15h dead zone).
 */

import type { LiftOffRequestType, LiftOffRequest } from "@/lib/database.types";

// ── SLA window map ────────────────────────────────────────────────────────────

/** Number of business hours allowed per request type. */
export const SLA_WINDOWS: Record<LiftOffRequestType, number> = {
  lock_request:        1,
  register_disclosure: 1,
  disclosure_only:     1,
  loan_help_desk:      4,
  submission:          48,
};

// ── ET helpers ────────────────────────────────────────────────────────────────

/** Return the ET hour (24h, 0–23) for a given Date. */
function etHour(d: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    hour12: false,
  }).formatToParts(d);
  const h = parts.find(p => p.type === "hour");
  return h ? parseInt(h.value, 10) : 0;
}

/** Return { year, month (1-based), day, hour, minute } in ET for a given Date. */
function etParts(d: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const p = fmt.formatToParts(d);
  const get = (type: string) => parseInt(p.find(x => x.type === type)?.value ?? "0", 10);
  return {
    year:   get("year"),
    month:  get("month"),
    day:    get("day"),
    hour:   get("hour"),
    minute: get("minute"),
  };
}

/**
 * Build a Date that represents the given ET wall-clock time.
 * Uses the ISO string trick: construct a "naive" ISO date string in ET,
 * then shift it to UTC by using the browser/Node's Intl offset detection.
 */
function etToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  // Build a candidate Date by formatting and parsing.
  // We construct a local-time string then anchor it to ET by binary-searching
  // the offset.  Simpler: use the fact that new Date(isoString) is UTC, and
  // compare what ET hour Intl reports back for that UTC.
  //
  // Practical approach: start with a UTC date built from the wall-clock digits,
  // then correct for the ET offset by iteration (at most 2 passes).
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  const isoGuess = `${pad(year, 4)}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00.000Z`;
  let candidate = new Date(isoGuess);

  // Adjust: compare ET hour of candidate to what we want
  for (let i = 0; i < 3; i++) {
    const p = etParts(candidate);
    const diffH = hour - p.hour;
    const diffM = minute - p.minute;
    const diffMs = (diffH * 60 + diffM) * 60 * 1000;
    if (diffMs === 0) break;
    candidate = new Date(candidate.getTime() - diffMs);
  }
  return candidate;
}

// ── addBusinessHours ──────────────────────────────────────────────────────────

/**
 * Advance `from` by `hours` business hours, skipping the 7:00 PM–10:00 AM ET dead zone.
 * Open window: 10:00 AM ET → 7:00 PM ET (9h).
 */
export function addBusinessHours(from: Date, hours: number): Date {
  let current = new Date(from.getTime());
  let remainingMinutes = hours * 60;

  // If we start inside the closed window (7 PM–10 AM ET), snap forward to 10:00 AM ET.
  const snapToOpen = (d: Date): Date => {
    const h = etHour(d);
    if (h >= 19 || h < 10) {
      const p = etParts(d);
      // If it's after 7 PM, snap to 10 AM the *next* day
      if (h >= 19) {
        const tomorrow = new Date(etToUtc(p.year, p.month, p.day, 0, 0).getTime() + 24 * 60 * 60 * 1000);
        const tp = etParts(tomorrow);
        return etToUtc(tp.year, tp.month, tp.day, 10, 0);
      }
      // Before 10 AM — snap to 10 AM same day
      return etToUtc(p.year, p.month, p.day, 10, 0);
    }
    return d;
  };

  current = snapToOpen(current);

  while (remainingMinutes > 0) {
    const p = etParts(current);
    // Minutes until 7:00 PM ET (19:00) — the close of the open window
    // Open window is 10:00–19:00 (9h = 540 min)
    const minutesUntilClose = (19 - p.hour) * 60 - p.minute;

    if (remainingMinutes <= minutesUntilClose) {
      // Fits before close — just advance
      current = new Date(current.getTime() + remainingMinutes * 60 * 1000);
      remainingMinutes = 0;
    } else {
      // Consume up to close (7:00 PM ET), skip the 15h gap, resume at 10:00 AM ET next day.
      current = new Date(current.getTime() + minutesUntilClose * 60 * 1000 + 15 * 60 * 60 * 1000);
      current = snapToOpen(current); // safety snap in case of DST edge
      remainingMinutes -= minutesUntilClose;
    }
  }

  return current;
}

// ── SLA types and functions ───────────────────────────────────────────────────

export type SLASeverity = "normal" | "warning" | "critical";

const BASE_SCORES: Record<LiftOffRequestType, number> = {
  lock_request:        100,
  register_disclosure: 80,
  disclosure_only:     70,
  loan_help_desk:      65,
  submission:          50,
};

/** Re-evaluate severity at read time for live colour coding. */
export function liveSeverity(slaDeadlineAt: string, windowHours: number): SLASeverity {
  const now = Date.now();
  const deadline = new Date(slaDeadlineAt).getTime();
  if (now >= deadline) return "critical";
  const totalMs = windowHours * 60 * 60 * 1000;
  const remainingMs = deadline - now;
  if (remainingMs <= totalMs * 0.2) return "warning";
  return "normal";
}

/** Compute SLA fields for a new request at submit time. */
export function computeSla(
  requestType: LiftOffRequestType,
  submittedAt: Date,
): { sla_deadline_at: string; sla_severity: SLASeverity; priority_score: number } {
  const windowHours = SLA_WINDOWS[requestType];
  const deadline = addBusinessHours(submittedAt, windowHours);
  const sla_deadline_at = deadline.toISOString();
  const sla_severity = liveSeverity(sla_deadline_at, windowHours);
  const base = BASE_SCORES[requestType];
  const bonus = sla_severity === "critical" ? 40 : sla_severity === "warning" ? 20 : 0;
  return {
    sla_deadline_at,
    sla_severity,
    priority_score: base + bonus,
  };
}

/** Human-readable countdown: "42m left", "2h 15m left", "BREACHED 1h ago" */
export function formatSlaCountdown(slaDeadlineAt: string): string {
  const diffMs = new Date(slaDeadlineAt).getTime() - Date.now();
  const absSec = Math.floor(Math.abs(diffMs) / 1000);
  const h = Math.floor(absSec / 3600);
  const m = Math.floor((absSec % 3600) / 60);
  const label = h > 0 ? `${h}h ${m}m` : `${m}m`;
  if (diffMs < 0) return `BREACHED ${label} ago`;
  return `${label} left`;
}

// ── SLA Tracker helpers ───────────────────────────────────────────────────────

/**
 * Returns true if the request has breached SLA.
 * - Completed: completed_at > sla_deadline_at
 * - Active:    now > sla_deadline_at
 */
export function isSlaBreached(r: LiftOffRequest): boolean {
  if (!r.sla_deadline_at) return false;
  const deadline = new Date(r.sla_deadline_at).getTime();
  const end = r.completed_at ? new Date(r.completed_at).getTime() : Date.now();
  return end > deadline;
}

/**
 * Calendar minutes from submission to first claim (response time).
 * Returns null if the request has never been claimed.
 */
export function computeResponseMinutes(r: LiftOffRequest): number | null {
  if (!r.claimed_at) return null;
  return Math.round(
    (new Date(r.claimed_at).getTime() - new Date(r.created_at).getTime()) / 60_000,
  );
}

/**
 * Actual work minutes from Start to Complete.
 * Returns null if the request has not been started or not yet completed.
 */
export function computeActualHandleMinutes(r: LiftOffRequest): number | null {
  if (!r.started_at || !r.completed_at) return null;
  return Math.round(
    (new Date(r.completed_at).getTime() - new Date(r.started_at).getTime()) / 60_000,
  );
}

/**
 * Format a minute count as a compact human label: "5m", "1h 12m", "2h 30m".
 */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
