/**
 * lib/rate-limit.ts
 *
 * Distributed rate limiter backed by Upstash Redis REST API.
 * Uses fetch() directly — zero npm dependencies beyond what we already have.
 *
 * WHY THIS MATTERS:
 *   The previous in-memory Map reset on every Vercel cold start. Vercel deploys
 *   many Lambda instances simultaneously — an attacker hitting 10 different
 *   regions could bypass the per-instance limit entirely.
 *   Upstash Redis is shared state across all instances, so the limit is global.
 *
 * LEGAL BASIS:
 *   FTC Safeguards Rule 16 CFR § 314.4(c) requires "technical safeguards" to
 *   protect against unauthorized access. Rate limiting on authentication
 *   endpoints prevents credential-stuffing attacks, which are the #1 vector
 *   for unauthorized access to NPI systems.
 *
 * SETUP:
 *   1. Sign up at https://upstash.com (free tier — 10,000 req/day)
 *   2. Create a Redis database
 *   3. Copy UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
 *   4. Add both to Vercel env vars (all environments) and .env.local
 *
 * If env vars are not set, the limiter falls back to ALLOW (never blocks).
 * This prevents breaking dev environments that haven't configured Upstash.
 */

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// ── Low-level Upstash REST helper ────────────────────────────────────────────

async function redisCommand<T>(command: unknown[]): Promise<T | null> {
  if (!REDIS_URL || !REDIS_TOKEN) return null;
  try {
    const res = await fetch(REDIS_URL, {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
      // 2-second timeout — never let Redis latency block user requests
      signal: AbortSignal.timeout(2_000),
    });
    if (!res.ok) return null;
    const json = await res.json() as { result: T };
    return json.result ?? null;
  } catch {
    // Redis unavailable → fail open (allow request)
    return null;
  }
}

// ── Public rate-limit API ────────────────────────────────────────────────────

export interface RateLimitResult {
  allowed:   boolean;
  remaining: number;
  resetAt:   Date;
}

/**
 * Sliding-window rate limiter.
 *
 * Uses a sorted set in Redis where each member is a unique timestamp,
 * score is that same timestamp. On each call:
 *   1. Remove all members older than the window
 *   2. Count remaining members
 *   3. If count >= limit → blocked
 *   4. Otherwise add current timestamp + set TTL
 *
 * @param key           Unique key per (user/ip + action), e.g. "login:1.2.3.4"
 * @param limit         Max requests allowed in the window
 * @param windowSeconds Rolling window size in seconds
 */
export async function checkRateLimit(
  key:           string,
  limit:         number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now       = Date.now();
  const windowMs  = windowSeconds * 1000;
  const rKey      = `ratelimit:${key}`;
  const resetAt   = new Date(now + windowMs);

  // If Redis is not configured → always allow (safe for local dev)
  if (!REDIS_URL || !REDIS_TOKEN) {
    return { allowed: true, remaining: limit, resetAt };
  }

  // Remove expired entries (older than the window start)
  const cutoff = now - windowMs;
  await redisCommand(["ZREMRANGEBYSCORE", rKey, "-inf", String(cutoff)]);

  // Count current entries
  const count = await redisCommand<number>(["ZCARD", rKey]);
  const current = count ?? 0;

  if (current >= limit) {
    // Find the oldest entry to compute exact reset time
    const oldest = await redisCommand<[string, string][]>([
      "ZRANGE", rKey, "0", "0", "WITHSCORES",
    ]);
    const oldestMs = oldest?.[0]?.[1] ? Number(oldest[0][1]) : now - windowMs;
    return {
      allowed:   false,
      remaining: 0,
      resetAt:   new Date(oldestMs + windowMs),
    };
  }

  // Add this request — use a unique member to allow multiple req in same ms
  const member = `${now}-${Math.random().toString(36).slice(2, 8)}`;
  await redisCommand(["ZADD", rKey, String(now), member]);
  // Set TTL so the key auto-expires (prevents Redis memory growth)
  await redisCommand(["EXPIRE", rKey, String(windowSeconds + 1)]);

  return {
    allowed:   true,
    remaining: limit - current - 1,
    resetAt,
  };
}
