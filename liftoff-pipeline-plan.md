# Lift Off — Pipeline Dashboard Plan

## Overview

Build a `/liftoff/pipeline` page — a read-only visual overview of all active Lift Off
and Lock Desk requests. Accessible to all queue users (liftoff_admin, liftoff_team,
lock_desk_admin, admin, developer). Cards link to detail pages.

The page has three layers:
1. **Metric tiles** — counts and SLA health at a glance
2. **Kanban columns** — requests grouped by `request_status`
3. **Filter bar** — slice by request type, owner (claimed_by_name), and date range

Before the dashboard can show accurate SLA health, the submit route must write
`sla_deadline_at`, `sla_severity`, and `priority_score` at submission time.

Demo mode is supported — `/liftoff/pipeline?demo=1` uses the same 4 fake requests
already in the queue page, extended with SLA fields. A demo link is also added to
the main `/liftoff` page alongside the existing queue demo link.

---

## Sub-Tasks

---

### Sub-Task 1 — SLA computation at submit time

**Status:** `[x] done`

**Intent**
Populate `sla_deadline_at`, `sla_severity`, and `priority_score` in the DB at the
moment a request is submitted. This gives every row a live SLA clock that the
pipeline dashboard can read directly without any runtime calculation.

**SLA rules (business hours = Mon–Sun 10:00 AM–7:00 AM ET)**
- `lock_request`:         deadline = submitted_at + 1 business hour
- `register_disclosure`:  deadline = submitted_at + 1 business hour
- `disclosure_only`:      deadline = submitted_at + 1 business hour
- `restructure_suspense`: deadline = submitted_at + 24 business hours
- `submission`:           deadline = submitted_at + 48 business hours

**Severity logic (computed at submit; re-evaluated on read for live accuracy)**
- `normal`   — more than 20% of window remaining
- `warning`  — 0–20% of window remaining
- `critical` — deadline has passed

**Priority score** — higher number = show first in sorted lists
- lock_request:         base 100
- register_disclosure:  base 80
- disclosure_only:      base 70
- restructure_suspense: base 60
- submission:           base 50
- Add 20 if sla_severity is `warning`, add 40 if `critical`

**Expected Outcomes**
- Every new row written by `app/api/liftoff/submit/route.ts` has non-null
  `sla_deadline_at`, `sla_severity`, and `priority_score`
- A shared utility function in `lib/liftoff-sla.ts` owns the computation logic
  so it can be reused by the dashboard for live re-evaluation

**Todo List**
1. Create `lib/liftoff-sla.ts` — exports:
   - `SLA_WINDOWS` constant map (request_type → business hours)
   - `addBusinessHours(from: Date, hours: number): Date` — advances a timestamp
     by N business hours, skipping the closed window (07:00–10:00 ET)
   - `computeSla(requestType, submittedAt): { sla_deadline_at, sla_severity, priority_score }`
   - `liveSeverity(sla_deadline_at, sla_window_hours): SLASeverity` — re-evaluate
     severity at read time for live colour coding
2. In `app/api/liftoff/submit/route.ts`, call `computeSla` and merge the result
   into the insert payload before writing to the DB

**Relevant Context**
- `app/api/liftoff/submit/route.ts` — where the insert happens
- `components/liftoff/LockDeskHoursCard.tsx` — has the ET hour logic to reference
- `lib/database.types.ts` — `sla_deadline_at`, `is_sla_breached`, `sla_severity`,
  `priority_score` already exist on `LiftOffRequest`
- `supabase/migrations/20250809_lift_off_porchy_fields.sql` — confirms DB columns exist

---

### Sub-Task 2 — Pipeline page + server component

**Status:** `[ ] pending`

**Intent**
Create `app/liftoff/pipeline/page.tsx` — server component that fetches all
non-cancelled requests (or demo data), computes summary metrics, and passes
everything to the client component. Also adds the Pipeline nav link to the layout.

**Expected Outcomes**
- `/liftoff/pipeline` is accessible and renders without error
- Page is gated to `canAccessLiftOffQueue` users (redirects others to `/liftoff`)
- Demo mode works at `/liftoff/pipeline?demo=1`
- "Pipeline" nav link appears in `app/liftoff/layout.tsx` for queue users,
  positioned between "Ops Queue" and "Team & Roles"

**Todo List**
1. Add `Pipeline` nav link in `app/liftoff/layout.tsx` for `isQueueUser`,
   between Ops Queue and Team & Roles
2. Create `app/liftoff/pipeline/page.tsx`:
   - `export const dynamic = "force-dynamic"`
   - Auth gate: redirect to `/liftoff` if not a queue user
   - Real fetch: `select("*")` from `lift_off_requests` where
     `request_status != cancelled`, ordered by `priority_score desc`, limit 300
   - Demo mode: reuse the 4 DEMO_REQUESTS from the queue page (import or copy)
     and add `sla_deadline_at` / `sla_severity` / `priority_score` to each
   - Pass `requests`, `processorName`, `isDemo` to `LiftOffPipelineClient`

**Relevant Context**
- `app/liftoff/queue/page.tsx` — exact same auth + fetch pattern to follow
- `app/liftoff/layout.tsx` — nav link to add (lines 52–63)
- `lib/auth.ts` — `canAccessLiftOffQueue`, `canSeeLockRequests`, `canSeeGeneralRequests`

---

### Sub-Task 3 — Pipeline client component

**Status:** `[ ] pending`

**Intent**
Build `components/liftoff/LiftOffPipelineClient.tsx` — the full interactive
client-side view with metric tiles, filter bar, and kanban columns.

**Layout structure**
```
[ Metric tiles row ]
[ Filter bar ]
[ Kanban: Pending | In Review | Action Needed | Completed (collapsed) ]
```

**Metric tiles (top row)**
- Total Active (non-completed, non-cancelled)
- Lock Requests Pending
- SLA Warning (severity = warning)
- SLA Critical / Breached (severity = critical)
- Completed Today

**Filter bar**
- Request type multi-select: All / Lock / Register+Disc / Submission / Restructure / Disclosure Only
- Owner filter: All / Unclaimed / individual claimed_by_name values from the data
- Date range filter: preset buttons (Today / Last 7 days / Last 30 days) + custom
  from/to date inputs — filters by `created_at`; defaults to "all time"
- Clear filters button (resets all three filters)

**Kanban columns** — one per `request_status` value:
- Pending
- In Review
- Action Needed
- Completed — shows all time by default; today's completions are highlighted with a
  green left border accent; collapses/expands with a toggle; date range filter applies here too

**Pipeline card** (each card in a column)
- Borrower name + ARIVE # + request type icon + type label
- Submitter name
- SLA pill: green (normal) / amber (warning) / red (critical) — shows time remaining or "BREACHED"
- Lock pending badge if `linked_lock_request_id` and lock not completed
- Claimed by (or "Unclaimed" in muted style)
- Entire card is a `<Link href="/liftoff/{id}">` — no action buttons

**SLA display** — use `liveSeverity` from `lib/liftoff-sla.ts` for real-time colour;
show countdown like "42m left", "2h 15m left", or "⚠️ BREACHED 1h ago"

**Expected Outcomes**
- Kanban renders all columns with correct card counts
- Filters correctly reduce visible cards across all columns including Completed
- SLA pills show correct colour and time remaining based on live clock
- Clicking any card navigates to `/liftoff/{id}`
- Completed column is collapsed by default, expands on click
- Cards completed today have a green left-border accent regardless of column

**Todo List**
1. Create `components/liftoff/LiftOffPipelineClient.tsx` with:
   - State: `typeFilter` (string[]), `ownerFilter` (string), `completedExpanded` (boolean),
     `datePreset` ("today" | "7d" | "30d" | "custom" | "all"), `dateFrom` (string), `dateTo` (string)
   - Derive owner list from the requests data
   - Filter function applied before splitting into columns — applies type, owner, and
     date range (compare `created_at` against the active range)
   - `PipelineCard` sub-component — renders one card with SLA pill; applies
     green left-border accent when `completed_at` is today
   - `KanbanColumn` sub-component — renders a column header + card list
   - Metric tiles always reflect the full unfiltered dataset (not affected by filters)
   - Import and use `liveSeverity` from `lib/liftoff-sla.ts`
2. Add demo link to `app/liftoff/page.tsx` — same pattern as the existing queue demo link

**Relevant Context**
- `components/liftoff/LiftOffQueueClient.tsx` — card styling conventions, status
  badge styles, TYPE_LABELS / TYPE_ICONS maps to reuse
- `lib/liftoff-sla.ts` — created in Sub-Task 1, provides `liveSeverity`
- `lib/database.types.ts` — `LiftOffRequest`, `LiftOffRequestStatus`

---

## Role Access Summary

| Role | Sees Pipeline |
|---|---|
| `liftoff_admin` | ✅ all request types |
| `liftoff_team` | ✅ general requests only |
| `lock_desk_admin` | ✅ lock requests only |
| `admin` / `developer` | ✅ all request types |
| `loan_officer` (no liftoff_role) | ❌ redirected |

Same visibility rules as the queue page — apply `canSeeLockRequests` /
`canSeeGeneralRequests` to filter the fetched rows before passing to the client.

---

## Files Touched

```
lib/
  liftoff-sla.ts                          — NEW (SLA computation utility)

app/
  liftoff/
    layout.tsx                            — EDIT (add Pipeline nav link)
    page.tsx                              — EDIT (add Pipeline demo link)
    pipeline/
      page.tsx                            — NEW (server component + data fetch)

components/liftoff/
  LiftOffPipelineClient.tsx               — NEW (metric tiles + filter + kanban)
```

No DB migrations needed — all required columns already exist.
