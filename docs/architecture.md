# HCMG Platform — Architecture Reference

## High-level system map

```
                       ┌──────────────────────┐
                       │   Vercel (Edge CDN)  │
                       │   Next.js 15 App     │
                       └──────────┬───────────┘
                                  │
              ┌───────────────────┼───────────────────┐
              ▼                   ▼                   ▼
     ┌────────────────┐  ┌───────────────┐  ┌────────────────┐
     │  Public Site   │  │  LO Portal /  │  │  Admin Portal  │
     │  /             │  │  /portal      │  │  /admin        │
     │  /co/:slug     │  │  /liftoff     │  │                │
     │  /go/:slug     │  │  /goal-engine │  │                │
     └────────┬───────┘  └───────┬───────┘  └───────┬────────┘
              │                  │                   │
              └──────────────────┼───────────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │   Supabase (PostgreSQL)  │
                    │   Auth (JWT / cookies)   │
                    │   Row Level Security     │
                    └────────────┬─────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
       ┌────────────┐    ┌──────────────┐    ┌──────────────┐
       │   Resend   │    │    Zapier    │    │  Arive LOS   │
       │  (email)   │    │  (webhooks) │    │  (lookup)    │
       └────────────┘    └──────────────┘    └──────────────┘
```

---

## Authentication flow

All authenticated routes use Supabase Auth (JWT stored in HTTP-only cookies via
`@supabase/ssr`). The middleware at [`middleware.ts`](../middleware.ts) refreshes
the session on every request.

Role-based access is enforced by the `getCurrentProfile()` helper in
[`lib/auth.ts`](../lib/auth.ts) which reads the `profiles` table after verifying
the JWT. Role checks (`isAdmin()`, `canAccessLiftOffQueue()`, etc.) are called at
the top of every API route handler.

```
Browser request
  → middleware.ts (refresh session cookie)
  → page/route handler
    → getCurrentProfile()     reads profiles table
    → isAdmin() / role check  gate the response
```

---

## Data flow: LiftOff loan submission

```
LO fills wizard (LiftOffWizard.tsx)
  → POST /api/liftoff/submit
    → computeSla()                 lib/liftoff-sla.ts
    → insert lift_off_requests
    → sendLiftOffNotification()    lib/liftoff-mailer.ts → Resend
    → sendLiftOffConfirmation()    lib/liftoff-mailer.ts → Resend

Processor opens queue (/liftoff/queue)
  → claims request (POST /api/liftoff/[id]/claim)
  → starts work  (POST /api/liftoff/[id]/start)
  → completes    (POST /api/liftoff/[id]/complete)
    → sendLiftOffCompleted()       → Resend → LO email
```

SLA is computed once at submission time using [`lib/liftoff-sla.ts`](../lib/liftoff-sla.ts)
and stored in `sla_deadline_at`. Live severity is re-evaluated at read time with
`liveSeverity()` so no cron is needed to update SLA status.

---

## Data flow: Goal Engine production sync

```
Arive LOS loan event
  → Zapier zap fires
    → POST /api/goal-engine/arive-webhook     (native Arive events)
    → POST /api/goal-engine/zapier            (Zapier-formatted events)
      → match LO by NMLS / email
      → upsert goal_production
      → upsert goal_leaderboard
      → write webhook_log entry

Vercel Cron (every 15 min)
  → GET /api/goal-engine/arive-pull-cron
    → pull recent loans from Arive API
    → same upsert pipeline
```

---

## Data flow: Arive LOS lookup (LiftOff)

LO can look up a loan in Arive before submitting, using an async Zapier polling
pattern to avoid timeout limits:

```
LO clicks "Look up in Arive" (LookupButton.tsx)
  → POST /api/liftoff/arive-lookup
    → writes arive_lookup_results row (status: pending)
    → triggers Zapier webhook
      → Zapier calls Arive API
      → POST /api/liftoff/arive-result  (Zapier callback)
        → updates arive_lookup_results (status: found / not_found)

Browser polls every 1.5s
  → GET /api/liftoff/arive-poll?id={requestId}
    → returns result when status changes
```

---

## Role model

| Role | Access |
|---|---|
| `admin` | Full admin portal, all data, user management |
| `loan_officer` | LO portal, LiftOff wizard (submit only), goal engine (own data) |
| `liftoff_admin` | LiftOff queue + admin actions |
| `liftoff_team` | LiftOff queue (claim + work requests) |
| `lock_desk_admin` | Lock desk queue + admin actions |
| `lock_desk_agent` | Lock desk queue (claim + work lock requests) |
| `ops_manager` | Read-only pipeline view across all request types |
| `help_desk_agent` | Help desk queue only |
| `processor` | Assigned processor on submissions |
| `developer` | Admin portal + dev tools |

Roles are stored in `profiles.role`. Supabase RLS policies enforce data isolation
so a `loan_officer` can only read their own rows even if they call the API directly.

---

## Email system

All transactional email goes through [Resend](https://resend.com).

| System | Sender lib | Recipients |
|---|---|---|
| Lead capture | `lib/email-templates.ts` | LO + lead confirmation |
| LiftOff | `lib/liftoff-mailer.ts` | `lockdesk@hcmgloans.com` or `processing@hcmgloans.com` |
| Goal Engine | `lib/goal-engine-mailer.ts` | All active LOs |

**Test mode:** Set `GOAL_ENGINE_TEST_MODE=true` and `GOAL_ENGINE_TEST_EMAIL` to
redirect all mail to a single inbox without hitting real LO addresses. LiftOff has
its own equivalent test mode flag checked in `lib/liftoff-mailer.ts`.

---

## PWA / Push notifications

The app is a full Progressive Web App:
- Manifest at `app/manifest.ts`
- Service worker registered by `components/PwaInit.tsx`
- Web Push via VAPID keys — subscriptions stored in `push_subscriptions` table
- `NotificationCenter.tsx` shows in-app notification bell in the LO portal

---

## Cron endpoints

All cron routes are protected by a `CRON_SECRET` header check. The schedule is
defined in [`vercel.json`](../vercel.json).

---

## Key pure-TS libraries (fully testable, no DB deps)

| File | What it does |
|---|---|
| `lib/liftoff-sla.ts` | SLA deadline math, business hours, severity, countdown |
| `lib/goal-engine.ts` | Pacing math, formatting helpers, date utilities |
| `lib/calculators.ts` | Mortgage payment, amortization, MIP/PMI |
| `lib/liftoff-incomplete-reasons.ts` | Incomplete reason codes and labels |
| `lib/format.ts` | General number and date formatters |

---

## Environment variable reference

See the [README](../README.md#required-environment-variables) for the full list.
