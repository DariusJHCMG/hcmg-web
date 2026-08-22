# Lift Off — Incomplete + Assignment Plan

## Multi-role change (prerequisite for everything)

The current `liftoff_role text` column on `profiles` only allows one role per user.
This needs to become `liftoff_roles text[]` (a Postgres array) so a user can hold
e.g. both `ops_manager` and `liftoff_team` simultaneously.

This is a **breaking rename** — every place that reads or writes `liftoff_role` must
be updated to `liftoff_roles` (array). Sub-Task A1 handles this as part of the
migration and type update.

**Migration strategy**
- Add new `liftoff_roles text[]` column
- Copy existing data: `UPDATE profiles SET liftoff_roles = ARRAY[liftoff_role] WHERE liftoff_role IS NOT NULL`
- Drop old `liftoff_role` column
- All TypeScript references updated from `profile.liftoff_role` → `profile.liftoff_roles` (array)
- Auth helpers updated: `hasLiftOffRole(profile, role)` checks `liftoff_roles.includes(role)`

**Role UI change**
- Role management page changes from a single-select dropdown to a multi-select
  checkbox group — users can have any combination of roles
- Saving sends `liftoff_roles: string[]` instead of `liftoff_role: string | null`

## Overview

Two related ops-queue upgrades:

**Feature A — Incomplete Flow**
Ops team members can mark a request "Incomplete" from the queue. A 2-step modal
collects: (1) one or more predefined incomplete reasons for the request type, plus
optional custom reason, and (2) optional team notes. The request is pushed back to
the LO with status `action_needed`, SLA stops (is_sla_breached = true), and an email
fires to the submitter listing exactly what needs to be fixed. On the LO side, the
main `/liftoff` page surfaces a dedicated "Needs Attention" section. The LO opens the
request, confirms they have fixed each incomplete item, adds any notes, and
resubmits — which creates a new request row pre-linked to the original, flagged as a
resubmission, and sends it back to the ops queue for review.

**Feature B — Ops Manager Role + Assign / Reassign**
A new `ops_manager` liftoff role gets an Assign button next to Claim on every pending
card. Clicking it opens a modal listing all active liftoff_team members to assign to.
The assigned team member gets an email alert. If a request is already claimed/in
progress, Ops Managers see a Reassign button instead. All assignment metadata is
stored on the request row.

---

## New DB columns needed

```sql
-- ── Multi-role: replace liftoff_role (text) with liftoff_roles (text[]) ──────
alter table public.profiles
  add column if not exists liftoff_roles text[] not null default '{}';

-- Copy existing single-role data into the new array column
update public.profiles
  set liftoff_roles = array[liftoff_role]
  where liftoff_role is not null;

-- Drop old column and its index/constraint
drop index if exists profiles_liftoff_role_idx;
alter table public.profiles drop column if exists liftoff_role;

-- Index for array containment queries: WHERE liftoff_roles @> ARRAY['ops_manager']
create index if not exists profiles_liftoff_roles_idx
  on public.profiles using gin(liftoff_roles);

-- ── Feature A: incomplete + resubmission columns on lift_off_requests ────────
alter table public.lift_off_requests
  add column if not exists incomplete_reasons        jsonb,      -- string[]
  add column if not exists incomplete_notes          text,
  add column if not exists incomplete_at             timestamptz,
  add column if not exists incomplete_by_name        text,
  add column if not exists resubmission_of           uuid
    references public.lift_off_requests(id) on delete set null,
  add column if not exists has_resubmission          boolean not null default false,
  add column if not exists resubmission_notes        text,
  add column if not exists resubmission_confirmed_at timestamptz;

-- ── Feature B: assignment columns on lift_off_requests ───────────────────────
alter table public.lift_off_requests
  add column if not exists assigned_to_id   uuid
    references public.profiles(id) on delete set null,
  add column if not exists assigned_to_name text,
  add column if not exists assigned_at_ts   timestamptz,
  add column if not exists assigned_by_name text;
```

---

## Sub-Tasks

---

### Sub-Task A1 — DB migration + type updates

**Status:** `[x] done`

**Intent**
Add all new columns to the DB and extend TypeScript types so the rest of the
feature can be built against them.

**Expected Outcomes**
- Migration file created and ready to run
- `LiftOffRequest` interface in `lib/database.types.ts` has all new fields
- `LiftOffRole` type updated to include `"ops_manager"`
- `lib/auth.ts` gets new helper: `isOpsManager(profile)` and `canAssignRequests(profile)`

**Todo List**
1. Create `supabase/migrations/YYYYMMDD_lift_off_incomplete_assign.sql` with all SQL above
2. Update `lib/database.types.ts`:
   - **Rename** `liftoff_role: LiftOffRole | null` → `liftoff_roles: LiftOffRole[]` on `Profile`
   - **Update** `LiftOffRole` union to add `"ops_manager"`
   - Add all Feature A fields to `LiftOffRequest`: `incomplete_reasons`, `incomplete_notes`,
     `incomplete_at`, `incomplete_by_name`, `resubmission_of`, `has_resubmission`,
     `resubmission_notes`, `resubmission_confirmed_at`
   - Add all Feature B fields to `LiftOffRequest`: `assigned_to_id`, `assigned_to_name`,
     `assigned_at_ts`, `assigned_by_name`
3. Update `lib/auth.ts` — **all helpers rewritten for array**:
   - `hasLiftOffAccess`: check `profile.liftoff_roles.length > 0` or is admin/developer
   - `canAccessLiftOffQueue`: same
   - `canSeeLockRequests`: check `liftoff_roles.includes("liftoff_admin") || liftoff_roles.includes("lock_desk_admin")`
   - `canSeeGeneralRequests`: check includes `"liftoff_admin"` or `"liftoff_team"` or `"ops_manager"`
   - Add `isOpsManager(profile)` — includes `"ops_manager"` or is admin/developer
   - Add `canAssignRequests(profile)` — same as isOpsManager
   - Update `getLiftOffRoleLabel` — takes array, returns comma-joined labels
4. Update `app/api/liftoff/users/[id]/role/route.ts`:
   - Accept `{ liftoff_roles: string[] }` instead of `{ liftoff_role: string | null }`
   - Validate each element is a valid role
   - Write `liftoff_roles` array to DB
5. Update demo objects in `app/liftoff/queue/page.tsx` to include new null fields
6. Fix any other TypeScript references to `profile.liftoff_role` across the codebase

**Relevant Context**
- `lib/database.types.ts` — existing `LiftOffRequest` interface and `LiftOffRole` type
- `lib/auth.ts` — existing role helper pattern
- `supabase/migrations/20250812_lift_off_roles_and_workflow.sql` — liftoff_role constraint pattern

---

### Sub-Task A2 — Incomplete reasons catalogue

**Status:** `[x] done`

**Intent**
Define the per-request-type incomplete reason options as a shared constant so both
the ops queue modal and the LO resubmission confirmation can use the same list.

**Incomplete reason options per type**
- `register_disclosure` / `disclosure_only`:
  - "Missing 1003 Application"
  - "Credit report not attached"
  - "Purchase agreement missing or expired"
  - "HOI binder missing or insufficient"
  - "Title order not placed"
  - "Borrower information incomplete or mismatched"
  - "ARIVE loan number not found"

- `submission`:
  - All of the above, plus:
  - "W-2s missing or incomplete (need 2 years)"
  - "Paystubs missing or outdated (need 30-day)"
  - "Tax returns missing (need 2 years)"
  - "Bank statements missing or insufficient"
  - "Appraisal not yet ordered or missing"
  - "IPAC notes incomplete"
  - "Loan does not match 1003"

- `restructure_suspense`:
  - "Exception letter missing"
  - "Supporting documents incomplete"
  - "Suspense reason not specified"
  - "Resolution unclear — needs clarification"

- `lock_request`:
  - "Pricing not confirmed in ARIVE"
  - "Loan not yet registered"
  - "Lock period not specified"
  - "Rate / price data missing or stale"
  - "Lender or product not specified"

**Expected Outcomes**
- `lib/liftoff-incomplete-reasons.ts` created — exports `INCOMPLETE_REASONS` map
  (`Record<LiftOffRequestType, string[]>`) and a `getReasons(requestType)` helper
- Imported wherever the modal and LO confirmation page need it

**Relevant Context**
- `lib/database.types.ts` — `LiftOffRequestType`

---

### Sub-Task A3 — Incomplete API route

**Status:** `[x] done`

**Intent**
`PATCH /api/liftoff/[id]/incomplete` — marks the request as incomplete, stores
reasons + notes, sets `request_status = "action_needed"`, stops the SLA clock
(`is_sla_breached = true`), and fires the incomplete email to the LO.

**Expected Outcomes**
- Route rejects non-queue-users with 403
- Route stores `incomplete_reasons` (array), `incomplete_notes`, `incomplete_at`,
  `incomplete_by_name`, sets `request_status = "action_needed"`, `is_sla_breached = true`
- Non-blocking email fired to `submitter_email` with the reasons list and notes
- Returns `{ ok: true, incomplete_at }`

**Todo List**
1. Create `app/api/liftoff/[id]/incomplete/route.ts`
2. Add `sendLiftOffIncomplete` to `lib/liftoff-mailer.ts` — email to LO listing:
   - Which request (type, borrower, ARIVE #)
   - List of incomplete reasons (bulleted)
   - Team notes (if any)
   - CTA button → view the request at `/liftoff/{id}`
   - Subject: `⚠️ Action Required: {type} — {borrower}`

**Relevant Context**
- `app/api/liftoff/[id]/complete/route.ts` — same structure to follow
- `lib/liftoff-mailer.ts` — `sendLiftOffCompleted` as the email pattern to follow
- `lib/auth.ts` — `canAccessLiftOffQueue`

---

### Sub-Task A4 — Incomplete modal in queue client

**Status:** `[ ] pending`

**Intent**
Add an "Incomplete" button to each active queue card. Clicking it opens a 2-step
inline modal: Step 1 = reason selection (checkboxes + custom text input), Step 2 =
optional notes. Confirming fires the API route and updates the card state.

**Modal flow**
- Step 1 header: "What needs to be fixed?" — shows checkboxes for all reasons for
  this request type; "Other / Custom" checkbox reveals a text input
- Step 2 header: "Add notes for the LO (optional)" — textarea
- Footer: Back / Cancel / "Send to LO" button
- After submit: card status badge → "Action Needed", Incomplete button disappears,
  a red "⚠️ Sent Back to LO" badge appears on the card

**Demo mode**
- In demo, clicking the button goes through the modal and simulates client-side
  state update without any API call

**Expected Outcomes**
- Button appears on all claimed, non-completed, non-action_needed cards
- Modal renders correct reasons for the specific request type
- Submitting updates card status to `action_needed` client-side
- API call fires correctly in non-demo mode

**Todo List**
1. In `components/liftoff/LiftOffQueueClient.tsx`:
   - Import `INCOMPLETE_REASONS` from `lib/liftoff-incomplete-reasons.ts`
   - Add state: `showIncomplete` (bool), `incompleteStep` (1|2), `selectedReasons`
     (string[]), `customReason` (string), `incompleteNotes` (string)
   - Add `canIncomplete` — true when request is claimed, not completed, not cancelled,
     not already action_needed
   - Add the modal JSX (fixed overlay, same dark-border style as other modals)
   - Add `doIncomplete()` async function — calls PATCH incomplete route, updates card
   - Show a red "⚠️ Action Needed — Sent to LO" badge when `request_status === "action_needed"`
     and `incomplete_at` is set

**Relevant Context**
- `components/liftoff/LiftOffQueueClient.tsx` — existing modal and action patterns
- `lib/liftoff-incomplete-reasons.ts` — created in Sub-Task A2

---

### Sub-Task A5 — LO "Needs Attention" section + resubmit flow

**Status:** `[ ] pending`

**Intent**
On the main `/liftoff` page, surface a prominent "Needs Attention" section above
"My Requests" whenever the LO has requests with `request_status === "action_needed"`.
Each card links to the detail page where the LO can review the incomplete reasons and
resubmit. The resubmit action creates a new request row (pre-filled from the original)
flagged as a resubmission, and sends it back to the ops queue.

**"Needs Attention" card (on /liftoff page)**
- Orange/red left border accent
- Shows: borrower name, request type, ARIVE #, incomplete reasons list, team notes,
  submitted-at, and a prominent "Review & Fix →" link

**Resubmit flow (on /liftoff/[id] detail page)**
- A "Re-submit" call-to-action section appears when `request_status === "action_needed"`
  and `resubmission_of` is null (not already a resubmission)
- LO sees a checklist: each incomplete reason as a checkbox they must confirm they have fixed
- LO can add resubmission notes
- On submit: POST `/api/liftoff/resubmit` which:
  - Creates a new `lift_off_requests` row copying all original fields
  - Sets `resubmission_of = original_id`, `request_status = "pending"`,
    `resubmission_notes = notes`, `resubmission_confirmed_at = now`
  - Sets `has_resubmission = true` on the original row
  - Fires submission email to ops queue flagged as a resubmission

**Expected Outcomes**
- "Needs Attention" section visible on `/liftoff` when there are action_needed requests
- Each card shows the incomplete reasons clearly
- LO can confirm fixes and resubmit from the detail page
- New resubmission row appears in ops queue with a "↩ Resubmission" badge
- Original row shows "Resubmission sent" badge

**Todo List**
1. Update `app/liftoff/page.tsx`:
   - Filter `actionNeededRequests = requests.filter(r => r.request_status === "action_needed")`
   - Add "Needs Attention" section above the requests table when array is non-empty
   - Each card: orange border, reasons list, notes, "Review & Fix →" link
2. Update `app/liftoff/[id]/page.tsx`:
   - Add resubmit CTA section when `action_needed` and no resubmission yet
   - Confirm-fixes checklist + notes textarea
   - Calls `POST /api/liftoff/resubmit` with `{ original_id, notes, confirmed_reasons }`
3. Create `app/api/liftoff/resubmit/route.ts`:
   - Auth: must be the original submitter
   - Copies the original row, overrides status fields, sets resubmission linkage
   - Updates `has_resubmission = true` on original
   - Non-blocking email to ops queue: `sendLiftOffResubmission`
4. Add `sendLiftOffResubmission` to `lib/liftoff-mailer.ts`:
   - To: processing@hcmgloans.com (or lockdesk if lock_request)
   - Subject: `↩ Resubmission: {type} — {borrower}`
   - Body: same as submission email but with a "RESUBMISSION" banner + resubmission notes

**Relevant Context**
- `app/liftoff/page.tsx` — existing request list to add section above
- `app/liftoff/[id]/page.tsx` — detail page where resubmit CTA goes
- `app/api/liftoff/submit/route.ts` — resubmit route follows same insert pattern
- `lib/liftoff-mailer.ts` — `sendLiftOffNotification` as email pattern

---

### Sub-Task B1 — Assign API route + team member lookup

**Status:** `[ ] pending`

**Intent**
`PATCH /api/liftoff/[id]/assign` — allows an ops_manager (or admin) to assign a
request to a specific liftoff_team member. Stores assignment metadata on the row
and fires an email to the assignee.

Also create `GET /api/liftoff/team-members` — returns all profiles where
`liftoff_roles` array is non-empty so the assign modal can populate its list.

**Expected Outcomes**
- `PATCH /api/liftoff/[id]/assign` accepts `{ assignee_id: string }`, updates
  `assigned_to_id`, `assigned_to_name`, `assigned_at_ts`, `assigned_by_name`,
  sets `claimed_by_id = assignee_id`, `claimed_by_name = assignee_name`,
  `claimed_at = now`, `request_status = "in_review"`
- `GET /api/liftoff/team-members` returns `[{ id, full_name, liftoff_roles }]`
- Non-blocking email to assignee: "You've been assigned a Lift Off request"

**Todo List**
1. Create `app/api/liftoff/[id]/assign/route.ts`
2. Create `app/api/liftoff/team-members/route.ts`
3. Add `sendLiftOffAssigned` to `lib/liftoff-mailer.ts` — email to assignee with
   request details and a "View Request →" CTA

**Relevant Context**
- `app/api/liftoff/[id]/claim/route.ts` — same pattern, assign extends it
- `lib/auth.ts` — `canAssignRequests` added in Sub-Task A1

---

### Sub-Task B2 — Assign / Reassign buttons in queue client

**Status:** `[ ] pending`

**Intent**
Ops managers see an "Assign →" button next to Claim on pending unclaimed cards,
and a "Reassign →" button on claimed/in-progress cards. Clicking either opens a
modal listing all liftoff_team members fetched from the team-members endpoint.

**Modal**
- Header: "Assign to team member" / "Reassign to team member"
- List of team member buttons — avatar initial + name + roles label (comma-joined)
- Selecting one highlights it; "Confirm Assignment" button fires the API
- After success: card shows "Assigned to {name}" replacing "Unclaimed"

**Expected Outcomes**
- Assign button visible to ops_manager on pending unclaimed cards
- Reassign button visible to ops_manager on claimed/in-progress cards
- Modal fetches team members on open (cached for session)
- Assignment persists via API call; card updates client-side

**Todo List**
1. Pass `currentUserRoles` (the viewer's `liftoff_roles` array) into `LiftOffQueueClient`
   and down to `RequestRow` so it can conditionally render Assign/Reassign
2. Add state: `showAssign` (bool), `assigneeList` (fetched), `selectedAssignee` (id)
3. Add `fetchTeamMembers()` — calls `/api/liftoff/team-members`; cached in component state
4. Add assign/reassign modal JSX — show each member's roles as comma-joined pills
5. Add `doAssign()` — calls `PATCH /api/liftoff/{id}/assign`; updates card state
6. Update `LiftOffQueueClient` props to include `currentUserRoles: LiftOffRole[]`;
   update queue page to pass `profile.liftoff_roles`
7. Update `LiftOffRolesClient.tsx` — change from single-select dropdown to multi-select
   checkbox group; show all 4 roles as checkboxes; saving sends `liftoff_roles` array

**Relevant Context**
- `components/liftoff/LiftOffQueueClient.tsx` — existing action button + modal pattern
- `app/liftoff/queue/page.tsx` — passes `processorName`; needs to also pass role
- `components/liftoff/LiftOffRolesClient.tsx` — role dropdown to update

---

## Role Access Summary (updated)

Users can hold **multiple roles simultaneously** via `liftoff_roles text[]`.
Access is granted if the array **includes** the relevant role.

| Role | Incomplete | Assign | Reassign | See Queue | See Lock |
|---|---|---|---|---|---|
| `liftoff_admin` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `ops_manager` | ✅ | ✅ | ✅ | ✅ | ❌ (unless also `lock_desk_admin`) |
| `liftoff_team` | ✅ | ❌ | ❌ | ✅ | ❌ |
| `lock_desk_admin` | ✅ | ❌ | ❌ | ✅ (lock only) | ✅ |
| `admin` / `developer` | ✅ | ✅ | ✅ | ✅ | ✅ |

Example multi-role user: `["ops_manager", "lock_desk_admin"]` → can assign AND see lock requests.

---

## Files Touched

```
supabase/migrations/
  YYYYMMDD_lift_off_incomplete_assign.sql  — NEW (liftoff_roles array + all new columns)

lib/
  database.types.ts    — EDIT (liftoff_roles array, ops_manager, new LiftOffRequest fields)
  auth.ts              — EDIT (all helpers updated for array + isOpsManager/canAssignRequests)
  liftoff-incomplete-reasons.ts            — NEW (reason catalogue per request type)
  liftoff-mailer.ts    — EDIT (incomplete + assigned + resubmit emails)

app/
  api/liftoff/
    [id]/incomplete/route.ts               — NEW
    [id]/assign/route.ts                   — NEW
    resubmit/route.ts                      — NEW
    team-members/route.ts                  — NEW
    users/[id]/role/route.ts               — EDIT (accept liftoff_roles array)
  liftoff/
    page.tsx                               — EDIT (Needs Attention section)
    [id]/page.tsx                          — EDIT (resubmit CTA section)

components/liftoff/
  LiftOffQueueClient.tsx  — EDIT (Incomplete modal + Assign/Reassign + currentUserRoles prop)
  LiftOffRolesClient.tsx  — EDIT (multi-select checkbox group replacing dropdown)
```

No changes needed to the wizard or lock preference flow.
