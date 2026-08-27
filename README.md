# HCMG Web Platform

Full-stack web application for Home Capital Mortgage Group. Three interconnected
sub-systems — a public-facing marketing site, an internal loan operations platform,
and a goal-tracking engine — all deployed as a single Next.js application.

---

## System overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         HCMG Web Platform                           │
│                                                                     │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │  Public Website  │  │  LiftOff (Ops)   │  │  Goal Engine     │  │
│  │                  │  │                  │  │                  │  │
│  │  Marketing site  │  │  Loan submission │  │  Monthly goals   │  │
│  │  Lead capture    │  │  Lock requests   │  │  Production data │  │
│  │  Co-branded LO   │  │  Help desk queue │  │  Leaderboard     │  │
│  │  pages           │  │  SLA tracking    │  │  Harry AI        │  │
│  │  Mortgage calc   │  │  Arive lookup    │  │  Zapier/Arive    │  │
│  │  SEO pages       │  │  Processor roles │  │  webhook sync    │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  LO Portal  ·  Admin  ·  PWA  ·  Push Notifications        │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
         │                    │                     │
      Supabase            Vercel Edge           Resend / Zapier
    (Postgres + Auth)      (hosting)            (email / webhooks)
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript 5.7 |
| Styling | Tailwind CSS 3.4 |
| Database | Supabase (PostgreSQL + Auth + RLS) |
| Deployment | Vercel (Edge + Cron) |
| Email | Resend |
| Analytics | PostHog + Google Analytics 4 + Google Search Console |
| Integrations | Zapier webhooks, Arive LOS |
| PWA | Web Push API (VAPID), Service Worker |

---

## Running locally

**Prerequisites:** Node.js 20+, a Supabase project, a `.env.local` file.

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # run unit tests (Vitest)
npm run build      # production build
npm run lint       # ESLint
```

### Required environment variables

Copy `.env.example` and fill in all values.

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only) |
| `RESEND_API_KEY` | Resend email API key |
| `CRON_SECRET` | Shared secret for Vercel Cron endpoints |
| `ZAPIER_WEBHOOK_SECRET` | Shared secret for Zapier inbound webhooks |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web Push VAPID keys |
| `GOAL_ENGINE_TEST_MODE` | Set to `"true"` to redirect all emails to test address |
| `GOAL_ENGINE_TEST_EMAIL` | Email address that receives all mail in test mode |

---

## Project structure

```
app/                    Next.js App Router pages and API routes
  api/                  API route handlers (93 routes)
    admin/              Admin-only endpoints (users, licenses, reviews, settings)
    analytics/          GA4 and Google Search Console proxy
    auth/               Google OAuth OIDC flow
    goal-engine/        Goal Engine data + cron + webhook endpoints
    liftoff/            LiftOff loan operations endpoints
    portal/             LO portal (profile, co-branded, leads)
    push/               Web Push subscription + VAPID key
  admin/                Admin portal pages
  goal-engine/          LO-facing goal engine pages
  liftoff/              LO-facing loan operations pages
  portal/               LO portal pages

components/             Shared React components
  admin/                Admin layout + sidebar
  goal-engine/          Goal Engine UI components
  liftoff/              LiftOff wizard, queue, pipeline, SLA components
  portal/               Portal sidebar, mobile nav, lead intel
  sections/             Public website sections (hero, calculator, FAQ…)
  ui/                   Shared UI (navbar, footer, logo, copy button…)

lib/                    Business logic (no React, importable anywhere)
  auth.ts               Auth helpers + role checks
  calculators.ts        Mortgage payment and amortization math
  goal-engine.ts        Goal Engine pure functions + DB queries
  goal-engine-server.ts Barrel re-export for API routes
  goal-engine-emails.ts Goal Engine email builders
  goal-engine-mailer.ts Goal Engine Resend sender
  liftoff-sla.ts        SLA deadline computation (pure TS, no deps)
  liftoff-mailer.ts     LiftOff Resend email sender
  supabase.ts           Server Supabase client factory
  supabase-browser.ts   Browser Supabase client factory
  database.types.ts     Generated Supabase type definitions

supabase/
  migrations/           46 versioned SQL migrations
  patches/              Manual one-off patches
  schema.sql            Full schema snapshot

tests/                  Vitest unit tests
  liftoff-sla.test.ts
  goal-engine.test.ts
  calculators.test.ts

docs/                   Operational documentation
  architecture.md       System architecture reference
  lead-spam-protection.md
  seo-operations.md
  archive/              Completed build plan documents
```

---

## Sub-systems

### 1. Public Website (`app/`)
Marketing site, SEO pages, mortgage calculator, team profiles, lead capture forms,
co-branded LO landing pages, DSCR landing page, glossary, guides, careers.

### 2. LiftOff — Loan Operations (`app/liftoff/`)
Internal workflow tool for loan submissions, lock requests, disclosures, and help
desk tickets. LOs submit requests through a multi-step wizard; processors claim and
work them in a queue. Includes SLA tracking, Arive LOS lookup, and role-based
routing (liftoff_admin, liftoff_team, lock_desk_admin, lock_desk_agent, processor,
help_desk_agent, ops_manager).

Key lib: [`lib/liftoff-sla.ts`](lib/liftoff-sla.ts) — pure TS SLA computation.

### 3. Goal Engine (`app/goal-engine/`)
Monthly production goal tracking for loan officers. Integrates with Arive (via
Zapier webhooks) to pull application and funded loan data automatically. Features
leaderboard, commitment forms, coaching notes, Harry AI insights, awards, and
automated weekly emails + cron-based reminders.

Key lib: [`lib/goal-engine.ts`](lib/goal-engine.ts) — pure functions for pacing
math, formatting, and DB queries.

---

## Cron jobs (Vercel)

| Route | Schedule | Purpose |
|---|---|---|
| `/api/goal-engine/weekly-email` | Mon 9 AM ET | Weekly progress emails to all LOs |
| `/api/goal-engine/commitment-reminder` | Daily 10 AM ET | Remind LOs who haven't committed |
| `/api/goal-engine/end-of-month` | 1st of month 2 AM ET | Close month, publish awards |
| `/api/goal-engine/arive-pull-cron` | Every 15 min | Pull new loans from Arive |
| `/api/goal-engine/loan-sync-cron` | Every 15 min | Sync updated loan statuses |
| `/api/liftoff/archive-old-requests` | Sun 2 AM ET | Archive stale LiftOff requests |

---

## Database

25 tables in Supabase PostgreSQL. All tables have Row Level Security enabled.
Schema is fully migration-driven — 46 versioned migrations in `supabase/migrations/`.

Key tables: `profiles`, `lift_off_requests`, `goal_months`, `goal_production`,
`goal_commitments`, `goal_leaderboard`, `leads`, `co_branded_pages`, `funnel_links`,
`webhook_log`, `audit_log`.

---

## Tests

```bash
npm test              # run all tests
npm test -- --watch   # watch mode
```

Tests live in `tests/` and cover the pure-TypeScript business logic in `lib/`:
- `liftoff-sla.test.ts` — SLA deadline math, business hours, severity, countdown
- `goal-engine.test.ts` — formatting, pacing, monthProgress, daysRemaining
- `calculators.test.ts` — mortgage payment math, amortization, MIP/PMI
