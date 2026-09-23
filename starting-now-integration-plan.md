# Starting Now Credit Repair Integration — Technical Implementation Plan

> **Confirmed Design Decisions**
> - `external_crm_contact_id`: pre-generate UUID via `crypto.randomUUID()` in the send route, insert with that ID, set `external_crm_contact_id` in the same single insert — one DB round-trip.
> - Credit score columns always visible on the referrals page — show "—" until scores arrive.
> - Wizard waits for Starting Now send to resolve before redirecting — shows "Sending to Starting Now..." loading state, then redirects with `?sn=sent` or `?sn=failed`.
> - `/liftoff/[id]` detail page shows a Starting Now status card inline (Sub-Task 9).

> **⚠️ Legal / Operational Blockers**
> Before going live, four non-code items must be resolved. They are tracked in
> [`starting-now-legal-blockers.md`](starting-now-legal-blockers.md) — read only, do not modify.
> The hardest stop is the **Service Provider Agreement** with Starting Now —
> no referral may be sent until it is signed.

## Overview

Add a **Starting Now credit repair referral** workflow to the HCMG Lift Off system in two phases:

- **Phase 1**: New `credit_repair_referral` request type in the LiftOff Wizard. After the standard `lift_off_requests` row is created, the system POSTs a consumer referral payload to Starting Now's Zoho CRM webhook and records the result in a new `starting_now_referrals` table.
- **Phase 2**: A new `/liftoff/starting-now` page (accessible to all LO users) showing the referral history with real-time status updates received via an inbound webhook from Starting Now.

**Tech stack**: Next.js 14 App Router, TypeScript, Supabase (service client pattern), Tailwind CSS.

---

## Implementation Order

1. Database schema + TypeScript types *(includes RLS + `archived_at` + archive cron update)*
2. Environment variables
3. Outbound send API route (`/api/liftoff/starting-now/send`)
4. Inbound webhook API route (`/api/liftoff/starting-now/webhook`)
5. Referrals GET API route (`/api/liftoff/starting-now/referrals`)
6. Wizard: add `credit_repair_referral` type + step flow + post-submit call
7. New page: `/liftoff/starting-now`
8. Nav update
9. Detail page: Starting Now status card on `/liftoff/[id]`

---

## Sub-Task 1 — Database Schema & TypeScript Types

**Status**: [ ] pending

### Intent

Create the `starting_now_referrals` table and add the necessary TypeScript types to `lib/database.types.ts`. This table is the central store for all Starting Now referral records — both the outbound send state and inbound status updates from Starting Now.

### Expected Outcomes

- A new Supabase migration file exists at `supabase/migrations/YYYYMMDD_starting_now_referrals.sql`
- The migration creates the `starting_now_referrals` table with all required columns
- `lib/database.types.ts` contains `StartingNowSendStatus`, `StartingNowReferral`, and `StartingNowStatusHistoryEntry` types
- `LiftOffRequestType` union includes `"credit_repair_referral"`

### Todo List

- [ ] Create migration file `supabase/migrations/YYYYMMDD_starting_now_referrals.sql`
- [ ] Add `"credit_repair_referral"` to `LiftOffRequestType` union in `lib/database.types.ts`
- [ ] Add `StartingNowSendStatus` type to `lib/database.types.ts`
- [ ] Add `StartingNowStatusHistoryEntry` interface to `lib/database.types.ts`
- [ ] Add `StartingNowReferral` interface to `lib/database.types.ts`

### Schema Definition

**Table: `starting_now_referrals`**

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | `uuid` | NOT NULL | PK, default `gen_random_uuid()` |
| `created_at` | `timestamptz` | NOT NULL | default `now()` |
| `updated_at` | `timestamptz` | NOT NULL | default `now()` |
| `lift_off_request_id` | `uuid` | nullable | FK → `lift_off_requests.id` ON DELETE SET NULL |
| `submitter_id` | `uuid` | NOT NULL | FK → `auth.users.id` (not enforced at DB level — use profile ID) |
| `submitter_name` | `text` | NOT NULL | |
| `arive_loan_number` | `text` | NOT NULL | |
| `borrower_first_name` | `text` | NOT NULL | |
| `borrower_last_name` | `text` | NOT NULL | |
| `borrower_email` | `text` | NOT NULL | |
| `borrower_phone` | `text` | NOT NULL | |
| `borrower_city` | `text` | nullable | |
| `borrower_state` | `text` | nullable | |
| `partner_notes` | `text` | nullable | |
| `startingnow_id` | `text` | nullable | ID assigned by Starting Now's CRM |
| `external_crm_contact_id` | `text` | nullable | Our `id` cast to string, echoed back to us |
| `sent_at` | `timestamptz` | nullable | When POST to Starting Now was fired |
| `send_status` | `text` | NOT NULL | CHECK IN ('pending','sent','failed'), default `'pending'` |
| `send_error` | `text` | nullable | Error message if send failed |
| `current_status` | `text` | nullable | Latest status from Starting Now |
| `follow_up_date` | `date` | nullable | |
| `experian` | `text` | nullable | Credit score |
| `equifax` | `text` | nullable | Credit score |
| `transunion` | `text` | nullable | Credit score |
| `latest_notes` | `text` | nullable | Latest notes from Starting Now |
| `opt_out` | `text[]` | nullable | |
| `last_update_at` | `timestamptz` | nullable | When last inbound webhook was received |
| `status_history_json` | `jsonb` | nullable | Array of `StartingNowStatusHistoryEntry` |

**Migration SQL structure:**
```sql
CREATE TABLE starting_now_referrals (
  id                      uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  archived_at             timestamptz,                              -- data retention soft-delete
  lift_off_request_id     uuid REFERENCES lift_off_requests(id) ON DELETE SET NULL,
  submitter_id            uuid NOT NULL,
  submitter_name          text NOT NULL,
  arive_loan_number       text NOT NULL,
  borrower_first_name     text NOT NULL,
  borrower_last_name      text NOT NULL,
  borrower_email          text NOT NULL,
  borrower_phone          text NOT NULL,
  borrower_city           text,
  borrower_state          text,
  partner_notes           text,
  startingnow_id          text,
  external_crm_contact_id text,
  sent_at                 timestamptz,
  send_status             text NOT NULL DEFAULT 'pending'
                            CHECK (send_status IN ('pending','sent','failed')),
  send_error              text,
  current_status          text,
  follow_up_date          date,
  experian                text,
  equifax                 text,
  transunion              text,
  latest_notes            text,
  opt_out                 text[],
  last_update_at          timestamptz,
  status_history_json     jsonb
);

-- Indexes for inbound webhook lookup (two supported match strategies)
CREATE INDEX ON starting_now_referrals (external_crm_contact_id);
CREATE INDEX ON starting_now_referrals (startingnow_id);
CREATE INDEX ON starting_now_referrals (submitter_id);

-- Retention indexes (mirrors lift_off_requests pattern)
CREATE INDEX ON starting_now_referrals (archived_at)  WHERE archived_at IS NOT NULL;
CREATE INDEX ON starting_now_referrals (created_at);

-- updated_at auto-update trigger
CREATE OR REPLACE FUNCTION update_starting_now_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_starting_now_updated_at
BEFORE UPDATE ON starting_now_referrals
FOR EACH ROW EXECUTE FUNCTION update_starting_now_updated_at();

-- ── GLBA Safeguards Rule 16 CFR § 314.4(c) ─────────────────────────────────
-- This table stores borrower NPI (name, email, phone, city, state) and
-- credit score data received from Starting Now. RLS enforces that LOs can
-- only access their own referrals. Admins can access all. Service role
-- (used by API routes) bypasses RLS per Supabase convention.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE starting_now_referrals ENABLE ROW LEVEL SECURITY;

-- LOs see and manage only their own referrals
CREATE POLICY "LOs see own referrals"
  ON starting_now_referrals FOR SELECT
  USING (submitter_id = auth.uid());

-- Admins and developers can manage all referrals
CREATE POLICY "Admins manage all referrals"
  ON starting_now_referrals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'developer')
    )
  );

-- Service role (API routes) bypasses RLS — same pattern as lift_off_requests
CREATE POLICY "Service role full access"
  ON starting_now_referrals FOR ALL
  USING (auth.role() = 'service_role');
```

**RLS**: Enabled — same three-tier policy as `lift_off_requests` (LO sees own, admin sees all, service role bypasses). All API routes use `createServiceClient()` which satisfies the service role policy.

### TypeScript Types

**In `lib/database.types.ts`:**

```typescript
// Add to LiftOffRequestType union:
export type LiftOffRequestType =
  | "register_disclosure"
  | "disclosure_only"
  | "submission"
  | "loan_help_desk"
  | "lock_request"
  | "credit_repair_referral"; // NEW

export type StartingNowSendStatus = "pending" | "sent" | "failed";

export interface StartingNowStatusHistoryEntry {
  status: string;
  updated_at: string; // ISO string
  experian?: string | null;
  equifax?: string | null;
  transunion?: string | null;
  notes?: string | null;
}

export interface StartingNowReferral {
  id: string;
  created_at: string;
  updated_at: string;
  lift_off_request_id: string | null;
  submitter_id: string;
  submitter_name: string;
  arive_loan_number: string;
  borrower_first_name: string;
  borrower_last_name: string;
  borrower_email: string;
  borrower_phone: string;
  borrower_city: string | null;
  borrower_state: string | null;
  partner_notes: string | null;
  startingnow_id: string | null;
  external_crm_contact_id: string | null;
  sent_at: string | null;
  send_status: StartingNowSendStatus;
  send_error: string | null;
  current_status: string | null;
  follow_up_date: string | null;
  experian: string | null;
  equifax: string | null;
  transunion: string | null;
  latest_notes: string | null;
  opt_out: string[] | null;
  last_update_at: string | null;
  status_history_json: StartingNowStatusHistoryEntry[] | null;
}
```

### Relevant Context

- Existing migrations in `supabase/migrations/` follow pattern `YYYYMMDD_<description>.sql`
- `lib/database.types.ts` holds `LiftOffRequestType`, `LiftOffRequest`, `LiftOffRequestStatus` — add new types nearby
- `createServiceClient()` from `lib/supabase.ts` is used in all API routes for DB access

---

## Sub-Task 2 — Environment Variables

**Status**: [ ] pending

### Intent

Document and add the two new environment variable keys needed for Starting Now integration. Both are secret server-only keys — never exposed to the client.

### Expected Outcomes

- `.env.example` contains `STARTING_NOW_API_KEY` and `STARTING_NOW_WEBHOOK_SECRET` with empty values and comments
- A comment in the plan file documents where these must be set in Vercel

### Todo List

- [ ] Add `STARTING_NOW_API_KEY=` to `.env.example` with a comment explaining its use
- [ ] Add `STARTING_NOW_WEBHOOK_SECRET=` to `.env.example` with a comment explaining its use

### Variable Definitions

| Variable | Purpose | Example Value |
|---|---|---|
| `STARTING_NOW_API_KEY` | Appended as `&zapikey=<KEY>` to Starting Now's Zoho webhook URL | `apikey_xxxxxxxx` |
| `STARTING_NOW_WEBHOOK_SECRET` | Bearer token checked on our inbound webhook endpoint | `whsec_xxxxxxxx` (generate with `openssl rand -hex 32`) |

**Full outbound URL constructed at runtime:**
```
https://www.zohoapis.com/crm/v7/functions/referral_partner_webhook/actions/execute?auth_type=apikey&zapikey=<STARTING_NOW_API_KEY>
```

---

## Sub-Task 3 — Outbound Send API Route

**Status**: [ ] pending

### Intent

Create `POST /api/liftoff/starting-now/send`. This is called by the LiftOff Wizard immediately after a successful `credit_repair_referral` submission. It inserts a `starting_now_referrals` row, fires the POST to Starting Now's Zoho webhook, and updates the row with the result.

### Expected Outcomes

- File `app/api/liftoff/starting-now/send/route.ts` exists
- Route requires authenticated user session (uses `getCurrentProfile()`)
- Route inserts a `starting_now_referrals` row with `send_status: 'pending'` first
- Route sets `external_crm_contact_id` to the row's `id` (cast to string) before sending
- Route POSTs to Starting Now webhook with correctly shaped payload
- On success: updates row to `send_status: 'sent'`, `sent_at: now()`
- On failure: updates row to `send_status: 'failed'`, `send_error: <message>`
- Returns `{ referral_id: string, send_status: StartingNowSendStatus }`
- Returns 401 if no session, 400 if body validation fails, 500 on unexpected error

### Request Body

```typescript
{
  lift_off_request_id: string;       // UUID of the lift_off_requests row
  borrower_email: string;
  borrower_phone: string;
  borrower_first_name: string;
  borrower_last_name: string;
  borrower_city?: string | null;
  borrower_state?: string | null;
  arive_loan_number: string;
  partner_notes?: string | null;
}
```

### Starting Now Payload Construction

```typescript
{
  First_Name:         body.borrower_first_name,
  Last_Name:          body.borrower_last_name,
  Email:              body.borrower_email,
  Phone:              body.borrower_phone,
  Mobile:             body.borrower_phone,      // same field — Starting Now uses both
  City:               body.borrower_city ?? "",
  State:              body.borrower_state ?? "",
  Partner_First_Name: profile.full_name.split(" ")[0],
  Partner_Last_Name:  profile.full_name.split(" ").slice(1).join(" "),
  Partner_Email:      profile.email,
  Partner_Number:     profile.phone ?? "",
  Partner_Notes:      body.partner_notes ?? "",
  Source:             "HCMG",
}
```

### Implementation Logic

1. Authenticate via `getCurrentProfile()` — return 401 if missing
2. Validate required body fields — return 400 if missing
3. Insert row into `starting_now_referrals` with all fields, `send_status: 'pending'`
4. Update row to set `external_crm_contact_id = row.id` (the same insert or a follow-up update)
5. Build Starting Now payload using row data + profile
6. Construct URL: `https://www.zohoapis.com/crm/v7/functions/referral_partner_webhook/actions/execute?auth_type=apikey&zapikey=${process.env.STARTING_NOW_API_KEY}`
7. `fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })`
8. If response OK: update row `send_status: 'sent'`, `sent_at: now()`
9. If response not OK or fetch throws: update row `send_status: 'failed'`, `send_error: <message>`
10. Return `{ referral_id: row.id, send_status }` — always 200 (the wizard handles the warning state)

> **Design note**: The route does not throw a 5xx even if Starting Now returns an error. The wizard shows a warning instead of a hard failure, and the LO can see the failed referral in the Starting Now tab. This matches the non-blocking email pattern used in `app/api/liftoff/submit/route.ts`.

### Relevant Context

- Pattern: `app/api/liftoff/submit/route.ts` — authenticate, validate, insert with `createServiceClient()`, fire side-effects non-blocking
- `getCurrentProfile()` imported from profile utils
- `createServiceClient()` from `lib/supabase.ts`

---

## Sub-Task 4 — Inbound Webhook API Route

**Status**: [ ] pending

### Intent

Create `POST /api/liftoff/starting-now/webhook`. This is the public endpoint URL we give to Starting Now. It receives their status update payloads, authenticates via bearer token, finds the matching referral row, and writes the update.

### Expected Outcomes

- File `app/api/liftoff/starting-now/webhook/route.ts` exists
- Route is public (no user session required)
- Route validates `Authorization: Bearer <STARTING_NOW_WEBHOOK_SECRET>` header — returns 401 if missing or wrong
- Route parses incoming JSON payload (see schema below)
- Route looks up the referral by `external_crm_contact_id` first, then by `startingnow_id` as fallback
- Route updates the matching row: `current_status`, `follow_up_date`, `experian`, `equifax`, `transunion`, `latest_notes`, `opt_out`, `last_update_at`
- Route appends a new entry to `status_history_json` (append to array, do not overwrite)
- If `startingnow_id` on the row is null and the payload contains one, sets it
- Returns `{ received: true }` with 200
- Returns 404 if no matching row found
- Returns 401 if auth fails

### Incoming Payload Shape (from Starting Now)

```typescript
{
  external_crm_contact_id: string;  // our referral row ID
  startingnow_id: string;
  email: string;
  phone: string;
  status: string;
  follow_up_date: string | null;
  experian: string;
  equifax: string;
  transunion: string;
  notes: string;
  opt_out: string[];
}
```

### Status Values (known)

`Attempting Contact`, `Invalid Number`, `Not Interested`, `Follow Up`, `Evaluation Completed`, `Consumer Unreachable`, `Enrolled`, `On Hold`, `Milestone Reached`, `Goal Reached`, `Closed`

### Implementation Logic

1. Read `Authorization` header — return 401 if not `Bearer <STARTING_NOW_WEBHOOK_SECRET>`
2. Parse JSON body
3. Look up: `SELECT * FROM starting_now_referrals WHERE external_crm_contact_id = $1 LIMIT 1`
   - If not found: try `WHERE startingnow_id = $1`
   - If still not found: return 404 `{ error: "referral not found" }`
4. Build new history entry: `{ status, updated_at: now(), experian, equifax, transunion, notes }`
5. Update row: merge new fields + append history entry
   ```sql
   UPDATE starting_now_referrals SET
     current_status = $1,
     follow_up_date = $2,
     experian = $3,
     equifax = $4,
     transunion = $5,
     latest_notes = $6,
     opt_out = $7,
     last_update_at = now(),
     startingnow_id = COALESCE(startingnow_id, $8),
     status_history_json = COALESCE(status_history_json, '[]'::jsonb) || $9::jsonb
   WHERE id = $10
   ```
6. Return `{ received: true }` with 200

### Relevant Context

- This route does NOT use `getCurrentProfile()` — no user session
- Uses `createServiceClient()` for DB access
- The `STARTING_NOW_WEBHOOK_SECRET` env var must match on both sides
- Use `||` jsonb concatenation operator to append one item (wrap new entry in `jsonb_build_array()`)

---

## Sub-Task 5 — Referrals GET API Route

**Status**: [ ] pending

### Intent

Create `GET /api/liftoff/starting-now/referrals`. Used by the `/liftoff/starting-now` page (via server component fetch or client-side). Returns referrals for the current user or all referrals for admins.

### Expected Outcomes

- File `app/api/liftoff/starting-now/referrals/route.ts` exists
- Route requires authenticated user session
- Regular users see only their own referrals (`submitter_id = profile.id`)
- Admin/developer users see all referrals when `?all=true` query param is present
- Results ordered by `created_at DESC`
- Returns `{ referrals: StartingNowReferral[] }`

### Implementation Logic

1. Authenticate via `getCurrentProfile()` — return 401 if missing
2. Check `isAdmin = profile.role === 'admin' || profile.role === 'developer'`
3. Check query param `all` — only respect it if `isAdmin`
4. Query `starting_now_referrals`:
   - If `isAdmin && all === 'true'`: no filter
   - Otherwise: `WHERE submitter_id = profile.id`
5. Order by `created_at DESC`
6. Return `{ referrals }`

---

## Sub-Task 6 — Wizard Integration

**Status**: [ ] pending

### Intent

Add the `credit_repair_referral` request type to `LiftOffWizard`. This includes the type card, a 2-step flow (pick type → borrower details + certify), and the post-submit call to `/api/liftoff/starting-now/send` with a secondary success/warning UI.

### Expected Outcomes

- `components/liftoff/LiftOffWizard.tsx` has a new entry in `REQUEST_TYPES` array
- `FILE_STATUS_STEPS` includes `credit_repair_referral`
- Step progression for `credit_repair_referral` is 2 steps
- Step 2 renders fields: ARIVE loan number (with ARIVE lookup), borrower email, borrower phone, borrower city/state (auto-filled from ARIVE), partner notes (optional), certify + NMLS
- After successful wizard submit, calls `POST /api/liftoff/starting-now/send`
- Wizard shows a secondary success state: "✅ Sent to Starting Now" or "⚠️ Starting Now send failed — you can retry from the Starting Now tab" below the main confirmation
- The wizard redirect to `/liftoff/{id}?submitted=1` still happens regardless of Starting Now send result

### Changes Required in `LiftOffWizard.tsx`

#### 1. Add to `FILE_STATUS_STEPS`

```typescript
credit_repair_referral: ["Request Submitted", "Sent to Starting Now", "In Credit Repair"],
```

#### 2. Add to `REQUEST_TYPES` array

```typescript
{
  type: "credit_repair_referral",
  label: "Credit Repair Referral",
  description: "Refer a borrower to Starting Now for credit repair. Their info will be sent directly from ARIVE.",
  tags: ["CREDIT REPAIR", "REFERRAL"],
  lockRequired: false,
  icon: "🛠️",
},
```

#### 3. Step Progression

In the step count logic where `loan_help_desk` and `lock_request` get 2-step flow, add `credit_repair_referral` to the same 2-step branch.

#### 4. Step 2 Rendering for `credit_repair_referral`

Fields to collect (new local state for this type):
- `arive_loan_number` (re-uses existing ARIVE lookup state)
- `borrowerEmail: string` 
- `borrowerPhone: string`
- `borrowerCity: string` (auto-filled from ARIVE, editable)
- `borrowerState: string` (auto-filled from ARIVE, editable)
- `partnerNotes: string` (optional)
- Certify checkbox + NMLS (same pattern as other types)

ARIVE lookup auto-fills: `borrower_first_name`, `borrower_last_name`, `borrower_city`, `borrower_state` (from `property_city`, `property_state`).

Validation before submit:
- `borrower_first_name` and `borrower_last_name` (from ARIVE lookup) — require ARIVE lookup completed
- `borrowerEmail` — required, basic format check
- `borrowerPhone` — required
- Certify checkbox + NMLS — same as other types

#### 5. Submit Payload for `credit_repair_referral`

When `request_type === 'credit_repair_referral'`, the payload sent to `/api/liftoff/submit` includes:
```typescript
{
  request_type: "credit_repair_referral",
  arive_loan_number,
  arive_lookup_raw,
  borrower_first_name,
  borrower_last_name,
  certified_at,
  certified_by_name,
  submitter_nmls,
  // NOTE: borrower_email, borrower_phone, city, state, partner_notes
  // are NOT in LiftOffRequest — they are passed to the Starting Now send route directly
}
```

#### 6. Post-Submit Hook

After receiving `{ id }` from `/api/liftoff/submit`, if `requestType === 'credit_repair_referral'`:

```typescript
const sendResult = await fetch("/api/liftoff/starting-now/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    lift_off_request_id: id,
    borrower_email: borrowerEmail,
    borrower_phone: borrowerPhone,
    borrower_first_name,
    borrower_last_name,
    borrower_city: borrowerCity,
    borrower_state: borrowerState,
    arive_loan_number,
    partner_notes: partnerNotes,
  }),
});
const sendData = await sendResult.json();
setStartingNowSendStatus(sendData.send_status); // "sent" | "failed"
```

Then navigate to `/liftoff/${id}?submitted=1&sn=${sendData.send_status}`.

The success screen (or success banner) checks `searchParams.sn` and shows the secondary message.

#### 7. New Local State

```typescript
const [borrowerEmail, setBorrowerEmail] = useState("");
const [borrowerPhone, setBorrowerPhone] = useState("");
const [borrowerCity, setBorrowerCity] = useState("");
const [borrowerState, setBorrowerState] = useState("");
const [partnerNotes, setPartnerNotes] = useState("");
```

When ARIVE lookup populates `arivedData`, also set `setBorrowerCity(arivedData.propertyCity ?? "")` and `setBorrowerState(arivedData.propertyState ?? "")`.

### Relevant Context

- `components/liftoff/LiftOffWizard.tsx` — `REQUEST_TYPES` at lines 85-132, `FILE_STATUS_STEPS` at lines 53-59, submit handler at lines 747-884
- ARIVE lookup auto-fill: look for where `ariveData` fields are read and `borrowerFirstName` etc. are set — replicate pattern for city/state
- Idempotency pattern already in place — no changes needed there
- Do not change the `lift_off_requests` table or submit API for city/state/email/phone — those fields live only in `starting_now_referrals`

---

## Sub-Task 7 — Starting Now Page

**Status**: [ ] pending

### Intent

Create `/liftoff/starting-now/page.tsx` — a server component page that shows a table of Starting Now referrals. Admins see all; LOs see their own.

### Expected Outcomes

- File `app/liftoff/starting-now/page.tsx` exists
- Page is a server component that fetches referrals server-side via Supabase service client (not via the GET API route — direct DB query is simpler in a server component)
- Page redirects to `/login?next=/liftoff/starting-now` if no session
- Shows a styled table with columns: Borrower Name, ARIVE Loan #, Submitted, Status, Scores, Sent Status, LO Name (admin only)
- Status shown as a colored badge (use existing badge/pill pattern from other Lift Off pages)
- Credit scores (Experian / Equifax / TransUnion) shown if available, otherwise "—"
- Each row links to the associated lift_off_requests detail page if `lift_off_request_id` is set
- Empty state: "No Starting Now referrals yet. Submit a Credit Repair Referral to get started." with a link to `/liftoff/new`
- Admin sees all rows; non-admin sees only their own

### Status Badge Color Mapping

| Status | Color |
|---|---|
| `Enrolled` | green |
| `Goal Reached` | green |
| `Milestone Reached` | blue |
| `Evaluation Completed` | blue |
| `Follow Up` | yellow |
| `Attempting Contact` | yellow |
| `On Hold` | orange |
| `Not Interested` | red |
| `Invalid Number` | red |
| `Consumer Unreachable` | red |
| `Closed` | gray |
| `null` / pending | gray ("Pending") |

### Page Layout

```
/liftoff/starting-now

[ Starting Now Referrals ]            [ "New Referral" button → /liftoff/new ]

┌─────────────┬───────────┬──────────┬────────────┬──────────────┬───────────┐
│ Borrower    │ ARIVE #   │ Submitted│ Status     │ Credit Scores│ Send      │
├─────────────┼───────────┼──────────┼────────────┼──────────────┼───────────┤
│ John Smith  │ 12345     │ Jan 1    │ [Enrolled] │ EX: 720      │ ✅ Sent   │
│             │           │          │            │ EQ: 715      │           │
│             │           │          │            │ TU: 710      │           │
└─────────────┴───────────┴──────────┴────────────┴──────────────┴───────────┘
```

### Relevant Context

- Look at `app/liftoff/queue/page.tsx` or `app/liftoff/pipeline/page.tsx` for the server component + table pattern
- Look at `app/liftoff/layout.tsx` for the auth guard pattern (`getCurrentProfile()` → redirect)
- Use `createServiceClient()` for the DB query

---

## Sub-Task 8 — Nav Update

**Status**: [ ] pending

### Intent

Add "Starting Now" to the Lift Off sidebar nav and mobile bottom tabs so all authenticated LO users can navigate to the new page.

### Expected Outcomes

- `components/liftoff/LiftOffNav.tsx` shows "Starting Now" link in the sidebar for all users
- The nav item uses `href: "/liftoff/starting-now"`, `label: "Starting Now"`, `icon: "🛠️"`
- The item appears after "New Request" and before any role-gated items
- Mobile bottom tabs: add "Starting Now" to the "More" sheet (not a primary tab — there are only 4 primary tab slots and they are already used)
- `app/liftoff/layout.tsx` requires no changes (the nav item is not role-gated)

### Changes Required in `LiftOffNav.tsx`

In the `navItems` array construction, add after the "New Request" entry:

```typescript
{ href: "/liftoff/starting-now", label: "Starting Now", icon: "🛠️" },
```

This item is unconditional (visible to all authenticated users), so it does not use the spread+conditional pattern used by role-gated items.

For mobile: the existing "More" sheet lists items that don't fit in primary tabs. Add it there — no primary tab change needed.

### Relevant Context

- `components/liftoff/LiftOffNav.tsx` — `navItems` array at lines ~43-52, mobile primary tabs at lines ~55-63
- No new props to `LiftOffNav` needed
- No changes to `app/liftoff/layout.tsx` needed

---

## API Contract Summary

### `POST /api/liftoff/starting-now/send`

**Auth**: User session (cookie-based, `getCurrentProfile()`)

**Request:**
```json
{
  "lift_off_request_id": "uuid",
  "borrower_first_name": "string",
  "borrower_last_name": "string",
  "borrower_email": "string",
  "borrower_phone": "string",
  "borrower_city": "string | null",
  "borrower_state": "string | null",
  "arive_loan_number": "string",
  "partner_notes": "string | null"
}
```

**Response (200):**
```json
{ "referral_id": "uuid", "send_status": "sent | failed" }
```

---

### `POST /api/liftoff/starting-now/webhook`

**Auth**: `Authorization: Bearer <STARTING_NOW_WEBHOOK_SECRET>` header

**Request (from Starting Now):**
```json
{
  "external_crm_contact_id": "string",
  "startingnow_id": "string",
  "email": "string",
  "phone": "string",
  "status": "string",
  "follow_up_date": "string | null",
  "experian": "string",
  "equifax": "string",
  "transunion": "string",
  "notes": "string",
  "opt_out": []
}
```

**Response (200):**
```json
{ "received": true }
```

---

### `GET /api/liftoff/starting-now/referrals`

**Auth**: User session

**Query params**: `?all=true` (admin only)

**Response (200):**
```json
{ "referrals": [ ...StartingNowReferral[] ] }
```

---

## Sub-Task 9 — Detail Page Starting Now Card

**Status**: [ ] pending

### Intent

Edit the existing `/liftoff/[id]` request detail page to show a "Starting Now" status card when the request type is `credit_repair_referral`. This gives LOs a complete view of the referral status without navigating away.

### Expected Outcomes

- `app/liftoff/[id]/page.tsx` queries `starting_now_referrals` for a row where `lift_off_request_id = params.id` when `request.request_type === 'credit_repair_referral'`
- If a referral row exists, renders a "Starting Now" card below the main request info
- Card shows: send status badge, current credit repair status badge, credit scores (EX / EQ / TU or "—"), latest notes, follow-up date if set
- If `send_status === 'failed'`, card shows a warning: "Starting Now send failed — check the Starting Now tab"
- If no referral row found (guard case), shows a muted "Starting Now referral not found" message
- Card is only rendered when `request_type === 'credit_repair_referral'`

### Card Content Layout

```
┌─────────────────────────────────────────────────┐
│ 🛠️  Starting Now Credit Repair                   │
│                                                  │
│  Send Status:    [✅ Sent]  or  [⚠️ Failed]       │
│  Credit Status:  [Enrolled]                      │
│  Experian: 720   Equifax: 715   TransUnion: 710  │
│  Notes:     "Enrolled, working on tradelines"    │
│  Follow-up: Jan 15, 2026                         │
└─────────────────────────────────────────────────┘
```

### Implementation Logic

1. After fetching the `lift_off_requests` row, check `request.request_type === 'credit_repair_referral'`
2. If yes: `SELECT * FROM starting_now_referrals WHERE lift_off_request_id = $1 LIMIT 1` using `createServiceClient()`
3. Pass `referral` (or `null`) to the page render
4. Render the card conditionally using the same status badge color mapping from Sub-Task 7

### Relevant Context

- `app/liftoff/[id]/page.tsx` — existing server component; check how it fetches and structures the page
- Re-use status badge color mapping from Sub-Task 7 (inline it or extract to `lib/starting-now-utils.ts` if both files need it)
- `createServiceClient()` for the DB query

---

## File Change Map

| File | Change Type | Sub-Task |
|---|---|---|
| `supabase/migrations/YYYYMMDD_starting_now_referrals.sql` | **Create** | 1 |
| `lib/database.types.ts` | **Edit** | 1 |
| `.env.example` | **Edit** | 2 |
| `app/api/liftoff/starting-now/send/route.ts` | **Create** | 3 |
| `app/api/liftoff/starting-now/webhook/route.ts` | **Create** | 4 |
| `app/api/liftoff/starting-now/referrals/route.ts` | **Create** | 5 |
| `components/liftoff/LiftOffWizard.tsx` | **Edit** | 6 |
| `app/liftoff/starting-now/page.tsx` | **Create** | 7 |
| `components/liftoff/LiftOffNav.tsx` | **Edit** | 8 |
| `app/liftoff/[id]/page.tsx` | **Edit** | 9 |

---

## Notes & Decisions

1. **`external_crm_contact_id` strategy**: Pre-generate UUID with `crypto.randomUUID()` in the send route, insert with that `id`, set `external_crm_contact_id = id` in the same insert — single DB round-trip. No follow-up update needed.

2. **No retry UI in v1**: The wizard shows a warning if Starting Now send fails, and the Starting Now page shows `send_status: 'failed'`. A retry button on the Starting Now page is a natural follow-on but is out of scope for this plan.

3. **borrower_email/phone not in `lift_off_requests`**: These fields are Starting Now-specific. They are collected in the wizard step and passed directly to the send API. They are NOT added to the `lift_off_requests` table or the submit API — keeping the schema change minimal.

4. **Page fetches directly via service client**: The `/liftoff/starting-now` page is a server component. It queries `starting_now_referrals` directly using `createServiceClient()` rather than calling the GET API route. The GET route exists for future client-side use (e.g., auto-refresh on status updates).

5. **Webhook URL to give Starting Now**: `https://hcmgloans.com/api/liftoff/starting-now/webhook` (production). Set `STARTING_NOW_WEBHOOK_SECRET` on Vercel and share it with Starting Now to configure on their side.
