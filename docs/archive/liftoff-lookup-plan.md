# Lift Off — Quick Lookup Slide-Over Plan

## Overview

Add a **Quick Lookup** slide-over panel accessible from Pipeline, Ops Queue, and Help Desk Queue.
A "🔍 Quick Lookup" button in each page header opens a right-side drawer. The drawer has three
search modes — ARIVE loan number, borrower name, and by user — and renders compact result cards
that link to the detail page. No page navigation required to use it.

---

## UX Summary

```
[ Page header ]  ···  [ 🔍 Quick Lookup ]   ← button added to all 3 pages

Slide-over (right drawer, ~460px wide):
┌─────────────────────────────────────────────┐
│ 🔍 Quick Lookup                          ✕  │
│─────────────────────────────────────────────│
│  Search by: [ ARIVE # ] [ Borrower ] [ User ]│
│                                             │
│  [ input / dropdown ]   [ Search ]          │
│─────────────────────────────────────────────│
│  Results (scrollable)                       │
│  ┌──────────────────────────────────────┐   │
│  │ Marcus Thompson    HCMG-2025-4471    │   │
│  │ 🚀 Submission  ●  In Review          │   │
│  │ Aug 6 · Sarah Mitchell               │   │
│  └──────────────────────────────────────┘   │
│  ┌──────────────────────────────────────┐   │
│  │ ...                                  │   │
└─────────────────────────────────────────────┘
```

---

## Search Modes

| Mode | Input | Matches on |
|------|-------|-----------|
| **ARIVE #** | Text input | `arive_loan_number` exact match, case-insensitive, trimmed — must be the full stored value |
| **Borrower** | Text input | `borrower_first_name` OR `borrower_last_name` OR `co_borrower_first_name` OR `co_borrower_last_name` — full value, case-insensitive |
| **By User** | Dropdown | `submitter_id` (LOs) OR `claimed_by_id` (team members) |

## Page Context Scoping

Results are scoped to the page the lookup is opened from. A `context` prop is passed to `LookupSlideOver` and forwarded to the API as a query param.

| Page | `context` value | Types returned |
|------|----------------|----------------|
| Ops Queue | `ops` | All except `loan_help_desk` |
| Help Desk Queue | `helpdesk` | `loan_help_desk` only |
| Pipeline | `pipeline` | All types |

---

## Result Card

Each result shows:
- Borrower first + last name (bold)
- ARIVE loan number (mono, muted)
- Request type badge (icon + label)
- Status badge (colour-coded)
- Submitted date (short format)
- Submitter name (small, muted)

Clicking anywhere on the card opens `/liftoff/[id]` in a new tab.

---

## Sub-Tasks

---

### Sub-Task 1 — API Route: `/api/liftoff/lookup`

**Intent**
Server-side search endpoint. Accepts a query, runs the appropriate Supabase query,
returns matching `LiftOffRequest` rows. Doing this server-side keeps credentials
off the client and allows us to use Supabase's ilike operator cleanly.

**Expected Outcomes**
- `GET /api/liftoff/lookup?mode=arive&q=HCMG-2025-4471` → rows where `arive_loan_number` ilike query
- `GET /api/liftoff/lookup?mode=borrower&q=Thompson` → rows where any borrower name field ilike query
- `GET /api/liftoff/lookup?mode=user&q=<uuid>` → rows where `submitter_id = uuid` OR `claimed_by_id = uuid`
- Auth: must pass `canAccessLiftOffQueue` OR `canAccessHelpDeskQueue`
- Returns: array of `LiftOffRequest` (select `*`), max 50 rows, ordered by `created_at DESC`
- Returns 400 if mode or q is missing/invalid

**Todo List**
1. Create `app/api/liftoff/lookup/route.ts`
2. Validate `mode` (arive | borrower | user) and `q` (non-empty string)
3. Auth check: `canAccessLiftOffQueue || canAccessHelpDeskQueue`
4. Branch on mode:
   - `arive`: `.ilike("arive_loan_number", q.trim())`
   - `borrower`: `.or("borrower_first_name.ilike.{q},borrower_last_name.ilike.{q},co_borrower_first_name.ilike.{q},co_borrower_last_name.ilike.{q}")`
   - `user`: `.or("submitter_id.eq.{q},claimed_by_id.eq.{q}")`
5. `.select("*").order("created_at", { ascending: false }).limit(50)`
6. Return `NextResponse.json(data)`

**Relevant Context**
- `app/api/liftoff/team-members/route.ts` — auth pattern to mirror
- `lib/auth.ts` — `canAccessLiftOffQueue`, `canAccessHelpDeskQueue`
- `lib/supabase.ts` — `createServiceClient`

**Status** — `[ ] pending`

---

### Sub-Task 2 — `/api/liftoff/lookup-users` Route

**Intent**
Populate the "By User" dropdown. Returns a combined deduplicated list of:
- LOs who have submitted at least one request (`submitter_id`, `submitter_name`)
- Team members with liftoff roles (from `profiles` with `liftoff_roles != {}`)

Both sets merged by `id` + `full_name`, sorted alphabetically.

**Expected Outcomes**
- `GET /api/liftoff/lookup-users` returns `{ id, full_name, type: "lo" | "team" }[]`
- LOs sourced from `lift_off_requests` distinct `submitter_id, submitter_name`
- Team members sourced from `profiles` where `liftoff_roles != {}`
- Auth: `canAccessLiftOffQueue || canAccessHelpDeskQueue`

**Todo List**
1. Create `app/api/liftoff/lookup-users/route.ts`
2. Query distinct `submitter_id, submitter_name` from `lift_off_requests`
3. Query `id, full_name` from `profiles` where `liftoff_roles != {}`
4. Merge + deduplicate by id, sort by full_name
5. Return `{ id, full_name, type }[]`

**Relevant Context**
- `app/api/liftoff/team-members/route.ts` — pattern for profiles query

**Status** — `[ ] pending`

---

### Sub-Task 3 — `LookupSlideOver` Client Component

**Intent**
The reusable slide-over drawer component. Manages its own open/close state
(controlled by a prop), search mode, query input, user dropdown, loading,
results, and errors.

**Expected Outcomes**
- `components/liftoff/LookupSlideOver.tsx` exists and exports `LookupSlideOver`
- Props: `{ open: boolean; onClose: () => void }`
- Three mode tabs: ARIVE # / Borrower / By User
- ARIVE # and Borrower modes: text input + Search button (or Enter key)
- By User mode: dropdown (populated from `/api/liftoff/lookup-users` on first open) + Search button
- Loading spinner while fetching
- Error state (red text)
- Empty state: "No results found"
- Results: scrollable list of `LookupResultCard` components (max 50)
- Slide-over uses fixed overlay + right-side panel, z-50, transition slide-in from right
- Clicking outside (overlay) closes the panel
- Esc key closes the panel

**Result card shows:**
- Borrower name (bold) + co-borrower indicator
- ARIVE # (mono, muted)
- Type badge (icon + label, sand background)
- Status badge (colour-coded, same STATUS_STYLES as queue)
- Submitted date
- Submitter name (muted)
- Full card is an `<a href="/liftoff/[id]" target="_blank">` link

**Todo List**
1. Create `components/liftoff/LookupSlideOver.tsx`
2. Mode tab UI (ARIVE # | Borrower | By User)
3. Input / dropdown per mode
4. `doSearch()` async function: calls `/api/liftoff/lookup?mode=&q=`
5. Load user list on first open from `/api/liftoff/lookup-users`
6. Result card component inline
7. Overlay + panel layout with Esc/outside-click close
8. Export `LookupSlideOver`

**Relevant Context**
- `components/liftoff/InlineLockSlideOver.tsx` — existing slide-over pattern to mirror for animation/layout
- `components/liftoff/LiftOffQueueClient.tsx` — STATUS_STYLES, TYPE_LABELS, TYPE_ICONS constants

**Status** — `[ ] pending`

---

### Sub-Task 4 — Wire Button into Pipeline, Ops Queue, Help Desk Queue

**Intent**
Add the "🔍 Quick Lookup" button to the page header of all three pages.
Each page manages the `open` boolean state and passes it to `LookupSlideOver`.

**Expected Outcomes**
- `app/liftoff/pipeline/page.tsx` — button + `LookupSlideOver` wired (client wrapper needed since page is a server component)
- `app/liftoff/queue/page.tsx` — same
- `app/liftoff/helpdesk/page.tsx` — same
- Button placement: top-right of the page header, alongside the existing total/count badge
- Button style: `rounded-full border border-line bg-white px-3 py-1.5 text-xs font-bold` — consistent with existing badges

**Implementation note:**
The three pages are server components. The button + slide-over state must live in the client
layer. Two approaches:
1. Move the header into the existing `*Client` component (simplest — no new files)
2. Create a thin `LookupButton` client component that renders just the button + slide-over

Approach 2 is cleaner — a `LookupButton` client component drops into the server page header
with zero changes to the existing client queue components.

**Todo List**
1. Create `components/liftoff/LookupButton.tsx` — client component, renders button + `LookupSlideOver`
2. In `app/liftoff/queue/page.tsx` header: add `<LookupButton />` next to the total badge
3. In `app/liftoff/helpdesk/page.tsx` header: same
4. In `app/liftoff/pipeline/page.tsx` header: same

**Relevant Context**
- `app/liftoff/queue/page.tsx` lines 424–439 — current header layout
- `app/liftoff/helpdesk/page.tsx` lines 220–234 — current header layout
- `app/liftoff/pipeline/page.tsx` lines 193–206 — current header layout

**Status** — `[ ] pending`

---

## Implementation Order

```
1 (API: lookup) → 2 (API: lookup-users) → 3 (SlideOver component) → 4 (Wire into pages)
```

Sub-Tasks 1 and 2 can be built in parallel.
Sub-Task 3 depends on both APIs existing.
Sub-Task 4 depends on Sub-Task 3.

---

## Access Control

The lookup API gates on `canAccessLiftOffQueue || canAccessHelpDeskQueue`.
This means:
- All ops team members, lock desk, liftoff_admin, ops_manager → can search everything
- `help_desk_agent` → can also use lookup (they have queue access)
- Regular LOs → cannot access the lookup (they don't have queue access)
