"use client";

import { useEffect, useState } from "react";

/**
 * Lock Desk Hours Card
 *
 * Hours: Monday–Sunday, 10:00 AM ET → 7:00 PM ET (9h open window).
 *
 * "Open"   = current ET hour is 10–18 (10:00 AM–6:59:59 PM)
 * "Closed" = current ET hour is 19–23 or 0–9 (7:00 PM–9:59:59 AM)
 */

function getEasternHour(): number {
  // toLocaleString with timeZone gives us a formatted string; parse the hour from it.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone:    "America/New_York",
    hour:        "numeric",
    hour12:      false,
  }).formatToParts(new Date());
  const h = parts.find(p => p.type === "hour");
  return h ? parseInt(h.value, 10) : 0;
}

function getEasternTime(): { hour: number; minute: number; second: number; display: string; dayName: string } {
  const now = new Date();
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone:  "America/New_York",
    hour:      "numeric",
    minute:    "2-digit",
    second:    "2-digit",
    hour12:    true,
    weekday:   "long",
  });
  const parts = fmt.formatToParts(now);
  const get   = (type: string) => parts.find(p => p.type === type)?.value ?? "";

  const rawHour   = parseInt(parts.find(p => p.type === "hour")  ?.value ?? "0", 10);
  const minute    = parseInt(parts.find(p => p.type === "minute") ?.value ?? "0", 10);
  const second    = parseInt(parts.find(p => p.type === "second") ?.value ?? "0", 10);
  const dayPeriod = get("dayPeriod").toUpperCase();
  const hour24    = dayPeriod === "AM"
    ? (rawHour === 12 ? 0  : rawHour)
    : (rawHour === 12 ? 12 : rawHour + 12);

  const display = `${get("hour")}:${get("minute")} ${dayPeriod} ET`;

  return { hour: hour24, minute, second, dayName: get("weekday"), display };
}

/** True when lock desk is open (ET hour 10–18, i.e. 10:00 AM–6:59:59 PM) */
function isLockDeskOpen(hour24: number): boolean {
  return hour24 >= 10 && hour24 < 19;
}

/** Seconds until the next open or close transition */
function secondsUntil(targetHour: number, currentH: number, currentM: number, currentS: number): number {
  let delta = (targetHour - currentH) * 3600 - currentM * 60 - currentS;
  if (delta <= 0) delta += 86400; // next day
  return delta;
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

  const { hour, minute, second, display } = getEasternTime();
  const open        = isLockDeskOpen(hour);
  const closesAt    = 19;  // 7:00 PM ET
  const opensAt     = 10;  // 10:00 AM ET
  const secsUntil   = open
    ? secondsUntil(closesAt, hour, minute, second)
    : secondsUntil(opensAt,  hour, minute, second);
  const countdown   = formatCountdown(secsUntil);

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
          <span className="text-xs font-semibold text-muted/60 w-28">Mon – Sun</span>
          <span className="text-sm font-bold text-ink">10:00 AM – 7:00 PM ET</span>
        </div>
        <p className="text-[11px] text-muted/60 pl-[7.5rem]">Open 9 hours · Closed 7:00 PM – 10:00 AM ET</p>
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
