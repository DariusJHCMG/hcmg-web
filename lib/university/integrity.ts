// Derive minimum required dwell time from the lesson's duration_secs.
// Rule: 50% of stated duration, clamped 60s–600s.
// If duration_secs is null (no admin value), default to 120s.
export function deriveMinDwellSecs(durationSecs: number | null): number {
  if (!durationSecs || durationSecs <= 0) return 120;
  return Math.max(60, Math.min(600, Math.round(durationSecs * 0.5)));
}
