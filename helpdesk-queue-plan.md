# Help Desk Queue Plan

## Overview

Add a dedicated **Help Desk Queue** for `loan_help_desk` requests.  
The queue lives at `/liftoff/helpdesk`, has its own nav link and page, and is powered by a new `HelpDeskQueueClient` component that mirrors `LiftOffQueueClient` but surfaces help-desk-specific fields (sub-type, description preview).

A new `help_desk_agent` LiftOff role is introduced — agents with this role see **only** the Help Desk queue (no Ops Queue, Pipeline, or SLA Tracker). Admins, `liftoff_admin`, and `ops_manager` can also access it.

`loan_help_desk` is removed from the existing Ops Queue so it no longer appears there.

---

## Roles & Access Matrix

| Page / Feature         | liftoff_team | ops_manager | liftoff_admin | lock_desk_admin | help_desk_agent | admin / developer |
|------------------------|:---:|:---:|:---:|:---:|:---:|:---:|
| Ops Queue              | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Pipeline               | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| SLA Tracker            | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| **Help Desk Queue**    | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Nav: Help Desk link    | ✗ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Nav: Ops Queue link    | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Nav: Pipeline / SLA    | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |

---

## Sub-Tasks

---

### Sub-Task 1 — Add `help_desk_agent` Role to Database & Types

**Intent**  
Introduce the `help_desk_agent` value into the `liftoff_role` constraint in the DB and into the `LiftOffRole` TypeScript type so the rest of the system can reference it.

**Expected Outcomes**
- Migration file adds `help_desk_agent` to the `CHECK` constraint on `profiles.liftoff_role` and `profiles.liftoff_roles`.
- `LiftOffRole` union type in `lib/database.types.ts` includes `"help_desk_agent"`.
- `getLiftOffRoleLabel` in `lib/auth.ts` maps `help_desk_agent` → `"Help Desk Agent"`.

**Todo List**
1. Create migration `supabase/migrations/<timestamp>_add_help_desk_agent_role.sql` that alters the check constraint on `profiles.liftoff_role` and updates the array check for `liftoff_roles` to include `help_desk_agent`.
2. In `lib/database.types.ts` add `"help_desk_agent"` to the `LiftOffRole` union.
3. In `lib/auth.ts` `getLiftOffRoleLabel` add entry: `help_desk_agent: "Help Desk Agent"`.

**Relevant Context**
- `lib/database.types.ts` — `LiftOffRole` type
- `lib/auth.ts` — `getLiftOffRoleLabel`
- Existing migration pattern: `supabase/migrations/20250812_*.sql`

**Status** — `[ ] pending`

---

### Sub-Task 2 — Add Auth Helper for Help Desk Access

**Intent**  
Add the `canAccessHelpDeskQueue` and `canSeeHelpDeskRequests` functions to `lib/auth.ts` so page components and API routes can gate access with a single call — consistent with existing patterns like `canSeeLockRequests`.

**Expected Outcomes**
- `canAccessHelpDeskQueue(profile)` returns true for: `admin | developer | liftoff_admin | ops_manager | help_desk_agent`.
- `canSeeHelpDeskRequests` is an alias (same logic — kept separate in case they diverge later).
- Existing `canSeeGeneralRequests` does NOT include `help_desk_agent` (help desk agents can't see regular ops requests).
- `hasLiftOffAccess` still returns true for `help_desk_agent` (they have a liftoff_roles entry) so the layout guard passes.

**Todo List**
1. Add `canAccessHelpDeskQueue(profile)` to `lib/auth.ts`.
2. Add `canSeeHelpDeskRequests(profile)` as the same guard (alias).
3. Verify `hasLiftOffAccess` already covers `help_desk_agent` via `liftoff_roles.length > 0` — it does, no change needed.

**Relevant Context**
- `lib/auth.ts` — existing guard functions (lines 55–79)
- `canSeeGeneralRequests` must NOT change

**Status** — `[ ] pending`

---

### Sub-Task 3 — Remove `loan_help_desk` from Ops Queue

**Intent**  
Ensure `loan_help_desk` requests no longer appear in the existing Ops Queue, since they now have a dedicated home.

**Expected Outcomes**
- `getQueueRequests()` in `app/liftoff/queue/page.tsx` filters out `loan_help_desk` requests in addition to the existing `lock_request` / general split.
- The Ops Queue demo data does not include any `loan_help_desk` demo rows.
- The Ops Queue page header/subtitle continues to describe itself accurately (no mention of help desk).

**Todo List**
1. In `app/liftoff/queue/page.tsx` `getQueueRequests()`: add explicit exclusion of `request_type === "loan_help_desk"` from the returned rows.
2. Confirm no `loan_help_desk` demo rows exist in `DEMO_REQUESTS` in the queue page (they don't — confirm and note).

**Relevant Context**
- `app/liftoff/queue/page.tsx` lines 360–376 (`getQueueRequests`)

**Status** — `[ ] pending`

---

### Sub-Task 4 — Build `HelpDeskQueueClient` Component

**Intent**  
Create the client component that powers the Help Desk queue. It mirrors `LiftOffQueueClient` in structure (tabs, stats tiles, card rows, claim/start/complete/incomplete/assign actions) but is tailored to help desk context:
- Shows `help_desk_sub_type` as a prominent badge on each card.
- Shows a truncated `help_desk_description` preview (first ~120 chars) on each card.
- Uses help-desk-specific incomplete reasons from `getIncompleteReasons("loan_help_desk")`.
- Does not show lock-request-specific fields (rate, lender, lock period, lock pending badge).
- Does not show linked lock request badge.

**Expected Outcomes**
- New file `components/liftoff/HelpDeskQueueClient.tsx` exists.
- Component accepts: `initialRequests`, `processorName`, `isDemo`, `canAssign` — same signature as `LiftOffQueueClient`.
- Cards display: borrower name, ARIVE loan number, submitter info, sub-type badge, description preview, workflow badge, status badge, incomplete reasons (if any), claim/start/complete/incomplete/assign buttons.
- Tabs: Active / Completed / All (same pattern).
- Stats tiles: Awaiting Pickup / Active / Completed Today.
- Demo mode: client-side simulation, no API calls.
- All API calls use identical endpoints: `/api/liftoff/{id}/claim|start|complete|incomplete|assign`.

**Todo List**
1. Create `components/liftoff/HelpDeskQueueClient.tsx` by adapting `LiftOffQueueClient.tsx`.
2. Add a `SUB_TYPE_LABELS` map for all help desk sub-type values.
3. In the card, replace lock-specific fields with `help_desk_sub_type` badge and `help_desk_description` preview.
4. Use `getIncompleteReasons("loan_help_desk")` for the incomplete modal reason list.
5. Keep all workflow actions (claim, start, complete, incomplete, assign) identical.
6. Export as named export `HelpDeskQueueClient`.

**Relevant Context**
- `components/liftoff/LiftOffQueueClient.tsx` — template to mirror
- `lib/liftoff-incomplete-reasons.ts` — `getIncompleteReasons("loan_help_desk")`
- Sub-type values defined in `LiftOffWizard.tsx` lines 1242–1253:
  `aus_underwriting | suspense_conditions | restructure_loan | ptd_ptf_conditions | appraisal_issue | title_closing_issue | income_asset_question | credit_issue | exception_request | general_help`

**Status** — `[ ] pending`

---

### Sub-Task 5 — Build the Help Desk Queue Page

**Intent**  
Create the server-rendered Next.js page at `app/liftoff/helpdesk/page.tsx` that fetches `loan_help_desk` requests, enforces the new `canAccessHelpDeskQueue` guard, and passes data to `HelpDeskQueueClient`. Includes realistic demo data.

**Expected Outcomes**
- `app/liftoff/helpdesk/page.tsx` exists.
- Auth guard: redirect to `/liftoff` if `!canAccessHelpDeskQueue(profile)`.
- `getHelpDeskRequests()` fetches rows where `request_type = "loan_help_desk"` ordered by `created_at DESC`, limit 200.
- Demo data: 3–4 `loan_help_desk` rows covering pending / in_review / action_needed states with realistic sub-types and descriptions.
- Page header: "Help Desk Queue" with role label and total count badge — mirrors Ops Queue header pattern exactly.
- `canAssign` derived from `canAssignRequests(profile)` (ops_manager / liftoff_admin / admin can assign).
- Demo banner consistent with other queue pages.

**Todo List**
1. Create `app/liftoff/helpdesk/page.tsx`.
2. Add `getHelpDeskRequests()` server function scoped to `request_type = "loan_help_desk"`.
3. Build 3–4 realistic `DEMO_REQUESTS` for help desk scenarios.
4. Apply auth guard using `canAccessHelpDeskQueue`.
5. Render `<HelpDeskQueueClient>` with the same prop shape as the Ops Queue page.

**Relevant Context**
- `app/liftoff/queue/page.tsx` — page to mirror
- `lib/auth.ts` — `canAccessHelpDeskQueue` (added in Sub-Task 2)
- `components/liftoff/HelpDeskQueueClient` (added in Sub-Task 4)

**Status** — `[ ] pending`

---

### Sub-Task 6 — Update Nav & Layout Guards

**Intent**
Surface the Help Desk queue in the sidebar nav for users who can access it. Roles are additive — a user with `help_desk_agent` AND `liftoff_team` sees both the Help Desk link and the Ops Queue link. Only a user whose **sole** liftoff role is `help_desk_agent` will not see Ops Queue / Pipeline.

**Expected Outcomes**
- `LiftOffNav` receives an `isHelpDeskUser` prop and shows a `🛎 Help Desk` link when true.
- `isHelpDeskUser` is derived in `app/liftoff/layout.tsx` from `canAccessHelpDeskQueue(profile)`.
- `isQueueUser` (existing) is derived from `canAccessLiftOffQueue(profile)` — **no change to this function**. A user with both `help_desk_agent` and `liftoff_team` will have `isQueueUser = true` and see the Ops Queue link too. A user with only `help_desk_agent` will have `isQueueUser = true` (because `liftoff_roles.length > 0`) but will be blocked at the Ops Queue page level by `canSeeGeneralRequests` returning false.
- `app/liftoff/queue/page.tsx` already redirects if `!canAccessLiftOffQueue` — additionally redirect if the user can only see help desk (`canAccessHelpDeskQueue` but not `canSeeGeneralRequests` and not `canSeeLockRequests`) to `/liftoff/helpdesk`.
- No new auth helper functions needed beyond Sub-Task 2.

**Todo List**
1. Add `isHelpDeskUser` prop to `LiftOffNav` and add the `🛎 Help Desk` nav item (icon `🛎`, href `/liftoff/helpdesk`).
2. In `app/liftoff/layout.tsx` derive `isHelpDeskUser = canAccessHelpDeskQueue(profile)` and pass it to `LiftOffNav`.
3. In `app/liftoff/queue/page.tsx` add redirect: if user passes `canAccessLiftOffQueue` but fails both `canSeeGeneralRequests` and `canSeeLockRequests`, redirect to `/liftoff/helpdesk`.

**Relevant Context**
- `components/liftoff/LiftOffNav.tsx` — nav items (lines 30–36)
- `app/liftoff/layout.tsx` — layout guards (lines 24–36)
- `lib/auth.ts` — `canAccessLiftOffQueue`, `canSeeGeneralRequests`

**Status** — `[ ] pending`

---

### Sub-Task 7 — Admin: Expose `help_desk_agent` Role in Users Page

**Intent**  
The existing `/liftoff/users` admin page manages `liftoff_roles` assignments. `help_desk_agent` needs to appear as an assignable role there.

**Expected Outcomes**
- The users page role picker includes `help_desk_agent` as an option with label "Help Desk Agent".
- Selecting it adds it to the user's `liftoff_roles` array (existing save logic handles this automatically since it reads from the UI selection).

**Todo List**
1. Read `app/liftoff/users/page.tsx` and the associated client component to find where role labels/options are defined.
2. Add `help_desk_agent: "Help Desk Agent"` to the role options list there.

**Relevant Context**
- `app/liftoff/users/page.tsx`
- `lib/auth.ts` — `getLiftOffRoleLabel` (already updated in Sub-Task 1)

**Status** — `[ ] pending`

---

## Implementation Order

Sub-Tasks should be implemented in this order:

```
1 (DB + Types) → 2 (Auth helpers) → 3 (Remove from Ops Queue) → 4 (HelpDeskQueueClient) → 5 (Page) → 6 (Nav + Layout) → 7 (Admin users page)
```

Sub-Tasks 3 and 4 can be done in parallel after Sub-Task 2.
