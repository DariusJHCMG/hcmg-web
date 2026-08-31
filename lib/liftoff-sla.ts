/**
 * lib/liftoff-sla.ts
 *
 * SLA computation utilities for Lift Off requests.
 * Pure TypeScript — no external dependencies.
 * Safe to import from both server routes and client components.
 *
 * Two SLA modes:
 *
 *   Lock requests (lock_request):
 *     Mon–Sat, 10:00 AM ET → 7:00 PM ET only.
 *     Hours outside that window do not count. Sunday is closed.
 *
 *   All other request types:
 *     Mon–Sat, any time of day. SLA is straight elapsed time — Sunday
 *     is the only day skipped. No open/close window restriction.
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

/** Only lock_request uses the 10AM–7PM window. */
const WINDOWED_TYPES = new Set<LiftOffRequestType>(["lock_request"]);

// ── ET helpers ────────────────────────────────────────────────────────────────

/** Return { year, month (1-based), day, hour, minute } in ET for a given Date. */
function etParts(d: Date): { year: number; month: number; day: number; hour: number; minute: number } {
  // Use separate formatters to avoid the hour12:false "24" bug in some Node/V8 versions
  const dateFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const dp = dateFmt.formatToParts(d);
  const tp = timeFmt.formatToParts(d);
  const getD = (type: string) => parseInt(dp.find(x => x.type === type)?.value ?? "0", 10);
  const getT = (type: string) => parseInt(tp.find(x => x.type === type)?.value ?? "0", 10);
  let hour = getT("hour");
  // Some runtimes return 24 for midnight — normalise to 0
  if (hour === 24) hour = 0;
  return { year: getD("year"), month: getD("month"), day: getD("day"), hour, minute: getT("minute") };
}

/** Build a UTC Date from ET wall-clock components (iterative offset correction). */
function etToUtc(year: number, month: number, day: number, hour: number, minute: number): Date {
  const pad = (n: number, w = 2) => String(n).padStart(w, "0");
  let candidate = new Date(`${pad(year, 4)}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00.000Z`);
  for (let i = 0; i < 3; i++) {
    const p = etParts(candidate);
    const diffMs = ((hour - p.hour) * 60 + (minute - p.minute)) * 60_000;
    if (diffMs === 0) break;
    candidate = new Date(candidate.getTime() - diffMs);
  }
  return candidate;
}

/** Return the ET day of week (0 = Sunday … 6 = Saturday). */
function etDayOfWeek(d: Date): number {
  const s = new Intl.DateTimeFormat("en-US", { timeZone: "America/New_York", weekday: "short" }).format(d);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(s);
}

/** Advance a Date by exactly one calendar day in ET, returning midnight UTC of that day. */
function nextEtDay(d: Date): Date {
  const p = etParts(d);
  const midnight = etToUtc(p.year, p.month, p.day, 0, 0);
  return new Date(midnight.getTime() + 24 * 60 * 60 * 1000);
}

// ── addBusinessHours ──────────────────────────────────────────────────────────

/**
 * Advance `from` by `hours` business hours according to the request type's mode:
 *
 *   Lock requests  → windowed: only 10AM–7PM ET counts; skip Sunday.
 *   All others     → flat: straight elapsed time Mon–Sat; skip Sunday only.
 */
export function addBusinessHours(from: Date, hours: number, requestType?: LiftOffRequestType): Date {
  const windowed = requestType ? WINDOWED_TYPES.has(requestType) : false;
  let current = new Date(from.getTime());
  let remainingMs = hours * 60 * 60 * 1000;

  if (windowed) {
    // ── Lock desk mode: 10AM–7PM ET window, skip Sunday ───────────────────────
    const snapToOpen = (d: Date): Date => {
      for (let guard = 0; guard < 10; guard++) {
        const dow = etDayOfWeek(d);
        if (dow === 0) {
          // Sunday → jump to Monday 10AM ET
          const p = etParts(nextEtDay(d));
          d = etToUtc(p.year, p.month, p.day, 10, 0);
          continue;
        }
        const p = etParts(d);
        if (p.hour >= 19) {
          // After 7PM → next day 10AM ET
          const np = etParts(nextEtDay(d));
          d = etToUtc(np.year, np.month, np.day, 10, 0);
          continue;
        }
        if (p.hour < 10) {
          // Before 10AM → same day 10AM ET
          d = etToUtc(p.year, p.month, p.day, 10, 0);
          continue;
        }
        break;
      }
      return d;
    };

    current = snapToOpen(current);

    while (remainingMs > 0) {
      const p = etParts(current);
      const msUntilClose = ((19 - p.hour) * 60 - p.minute) * 60_000 - (current.getTime() % 60_000);
      if (remainingMs <= msUntilClose) {
        current = new Date(current.getTime() + remainingMs);
        remainingMs = 0;
      } else {
        remainingMs -= msUntilClose;
        // Jump to next day 10AM ET
        const np = etParts(nextEtDay(current));
        current = snapToOpen(etToUtc(np.year, np.month, np.day, 10, 0));
      }
    }

  } else {
    // ── Flat mode: straight elapsed time, skip Sunday only ────────────────────
    while (remainingMs > 0) {
      // Skip Sunday entirely
      if (etDayOfWeek(current) === 0) {
        current = nextEtDay(current);
        continue;
      }
      // How many ms until the end of this calendar day in ET?
      // Use nextEtDay to safely handle month/year overflow (e.g. Aug 31 → Sep 1)
      const endOfDay = nextEtDay(current);
      const msUntilEndOfDay = endOfDay.getTime() - current.getTime();

      if (remainingMs <= msUntilEndOfDay) {
        current = new Date(current.getTime() + remainingMs);
        remainingMs = 0;
      } else {
        remainingMs -= msUntilEndOfDay;
        current = endOfDay;
      }
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
  const deadline = addBusinessHours(submittedAt, windowHours, requestType);
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
