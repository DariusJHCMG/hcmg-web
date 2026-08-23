"use client";

import { useEffect, useState } from "react";

/**
 * Lock Desk Hours Card
 *
 * Hours: Monday–Saturday, 10:00 AM ET → 7:00 PM ET (9h open window).
 * Sunday is fully closed — countdown shows time to Monday 10:00 AM ET.
 */

function getEasternTime(): {
  hour: number; minute: number; second: number;
  display: string; dayOfWeek: number; /* 0=Sun … 6=Sat */
} {
  const now   = new Date();
  const fmt   = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "numeric", minute: "2-digit", second: "2-digit",
    hour12: true, weekday: "short",
  });
  const parts    = fmt.formatToParts(now);
  const get      = (t: string) => parts.find(p => p.type === t)?.value ?? "";
  const rawHour  = parseInt(get("hour"),   10);
  const minute   = parseInt(get("minute"), 10);
  const second   = parseInt(get("second"), 10);
  const period   = get("dayPeriod").toUpperCase();
  const hour24   = period === "AM"
    ? (rawHour === 12 ? 0  : rawHour)
    : (rawHour === 12 ? 12 : rawHour + 12);
  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const dayOfWeek = weekdays.indexOf(get("weekday"));
  const display  = `${get("hour")}:${get("minute")} ${period} ET`;
  return { hour: hour24, minute, second, display, dayOfWeek };
}

/** True when lock desk is currently open (Mon–Sat, 10:00 AM–6:59:59 PM ET). */
function isLockDeskOpen(hour24: number, dayOfWeek: number): boolean {
  if (dayOfWeek === 0) return false; // Sunday — always closed
  return hour24 >= 10 && hour24 < 19;
}

/**
 * Seconds until the lock desk next opens.
 * Accounts for Sunday → must wait until Monday 10 AM ET.
 */
function secondsUntilOpen(hour24: number, minute: number, second: number, dayOfWeek: number): number {
  // How many full days until the next Mon–Sat day?
  const daysAhead = dayOfWeek === 0 ? 1   // Sunday → Monday
                  : dayOfWeek === 6        // Saturday after 7PM → Monday (but Sat is open so this only triggers if after hours)
                    ? 2
                    : 0;                   // weekday — same day or next day handled by seconds math

  const secsToTodayOpen = (10 - hour24) * 3600 - minute * 60 - second;

  if (daysAhead === 0 && secsToTodayOpen > 0) return secsToTodayOpen; // before 10AM same day
  // Past 10AM on the target day (or Sunday/after-hours Saturday) → next eligible open day
  const extraDays = daysAhead > 0 ? daysAhead : 1;
  // Seconds remaining in today + full days + time to 10AM
  const secsLeftToday  = (24 - hour24) * 3600 - minute * 60 - second;
  return secsLeftToday + (extraDays - 1) * 86400 + 10 * 3600;
}

/** Seconds until lock desk closes (7 PM ET). */
function secondsUntilClose(hour24: number, minute: number, second: number): number {
  return (19 - hour24) * 3600 - minute * 60 - second;
}

function formatCountdown(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s.toString().padStart(2, "0")}s`;
  return `${s}s`;
}

export function LockDeskHoursCard() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const { hour, minute, second, display, dayOfWeek } = getEasternTime();
  const open      = isLockDeskOpen(hour, dayOfWeek);
  const secsUntil = open
    ? secondsUntilClose(hour, minute, second)
    : secondsUntilOpen(hour, minute, second, dayOfWeek);
  const countdown = formatCountdown(secsUntil);

  return (
    <div className={`rounded-2xl border-2 bg-white p-5 transition-colors ${
      open
        ? "border-green-300"
        : "border-orange-200"
    }`}>
      {/* Header row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔒</span>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted/70">Lock Desk Hours</p>
        </div>
        {/* Live status pill */}
        <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold border ${
          open
            ? "bg-green-50 border-green-200 text-green-700"
            : "bg-orange-50 border-orange-200 text-orange-700"
        }`}>
          <span className={`inline-block h-1.5 w-1.5 rounded-full ${open ? "bg-green-500 animate-pulse" : "bg-orange-400"}`} />
          {open ? "OPEN NOW" : "CLOSED"}
        </span>
      </div>

      {/* Hours */}
      <div className="space-y-1 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted/60 w-28">Mon – Sat</span>
          <span className="text-sm font-bold text-ink">10:00 AM – 7:00 PM ET</span>
        </div>
        <p className="text-[11px] text-muted/60 pl-[7.5rem]">Open 9 hours · Closed 7:00 PM – 10:00 AM ET · Sun closed</p>
      </div>

      {/* Divider */}
      <div className="h-px bg-line mb-3" />

      {/* Current ET time + countdown */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted/50">Current Time</p>
          <p className="text-sm font-bold text-ink tabular-nums">{display}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted/50">
            {open ? "Closes in" : "Opens in"}
          </p>
          <p className={`text-sm font-bold tabular-nums ${open ? "text-green-700" : "text-orange-600"}`}>
            {countdown}
          </p>
        </div>
      </div>
    </div>
  );
}
