# Lock Request Updates Plan

## Top-Level Overview

Two targeted changes to the Liftoff lock request flow:

1. **ARIVE Pricing Confirmation Popup** — After a successful ARIVE lookup in the `LiftOffWizard` (lock_request path only), a blocking confirmation dialog asks whether the LO has priced the loan in ARIVE in the last 20 minutes. If "No" → navigate to `/dashboard`. If "Yes" → proceed. The `InlineLockSlideOver` sidebar gains its own live ARIVE lookup (using the loan number from the parent request), and the confirmation popup fires after that lookup succeeds.

2. **InlineLockSlideOver Field Sync** — Make the sidebar's lock request form mirror the wizard exactly. Remove APR %, Est. Monthly Pmt, and Requested Close Date (not in wizard). Add Channel Type and Compensation Type as read-only badges (sourced from the ARIVE lookup that now runs on open). Ensure ARIVE loan number from the parent request is attached to the submitted lock request.

---

## Key Architectural Notes (from code research)

### ARIVE Lookup Flow
- The wizard fires `POST /api/liftoff/arive-lookup` with `{ loanNumber }`, which triggers Zapier → ARIVE
- If Zapier is async, it returns `{ pending: true, requestId }` and the browser polls `GET /api/liftoff/arive-poll?id={requestId}` every 1.5s for up to 15s
- The result (`noteRate`, `discountPoints`, `lenderName`, `productName`, `channelType`, `compensationType`, etc.) is applied via `applyAriveData()`
- In the wizard, all pricing fields become **read-only** after a successful lookup (`ariveFieldsLocked = true`)

### InlineLockSlideOver Call Chain
- **Only one call site:** `LockPreferenceField.tsx` (line 272), which is rendered inside `LiftOffWizard.tsx` (line 1387)
- `prefill` flows: `LiftOffWizard state` → `LockPreferenceField props` → `InlineLockSlideOver props`
- `channelType` and `compensationType` are NOT currently in this chain — need to be threaded through all three

### Wizard Lock Fields — Source of Truth for Field List
In the wizard, all pricing fields are read-only (auto-filled from ARIVE):
- Rate %, Discount Points, Lender, Product, Channel Type (badge), Compensation Type (badge, broker only)
- Lock Period (LO selects), Notes to Lock Desk (LO types)
- Two required confirmation checkboxes
- Certification section (NMLS + LO Name) — **sidebar does NOT need this**

### Fields to Remove from Sidebar
- APR % — not in wizard
- Est. Monthly Pmt — not in wizard
- Requested Close Date — wizard has state but intentionally hides it, always sends null

---

## Sub-Task 1 — ARIVE Confirmation Popup in LiftOffWizard

**Intent**
After the ARIVE lookup succeeds in the main wizard for a `lock_request` type, show a blocking confirmation dialog asking: "Have you run pricing in ARIVE within the last 20 minutes?" This gates access to the lock pricing form. Only applies to `lock_request` — all other request types are unaffected.

**Expected Outcomes**
- After `ariveLookupStatus` → `"found"` on a `lock_request`, a confirmation dialog renders in place of the pricing form section.
- "Yes, pricing is current" → dialog closes, lock form fields appear, LO proceeds normally.
- "No, I need to price first" → brief message shown, then `router.replace("/dashboard")`.
- Other request types (submission, disclosure, etc.) are completely unaffected.
- The two existing confirmation checkboxes at bottom of Step 2 remain unchanged.

**Todo List**
1. Add `showAriveConfirmDialog` boolean state (default `false`) to `LiftOffWizard`.
2. In `applyAriveData()` (~line 593), after `setAriveLookupStatus("found")`, add: `if (isLockRequest) setShowAriveConfirmDialog(true)`.
3. In the Step 2 lock request JSX (around line 955), gate the entire pricing form section behind `!showAriveConfirmDialog`.
4. When `showAriveConfirmDialog === true`, render a dialog card in place of the form with:
   - Title: "ARIVE Pricing Check"
   - Message: "Have you run pricing in ARIVE within the last 20 minutes for this loan?"
   - Button: "✅ Yes, pricing is current" → `setShowAriveConfirmDialog(false)`
   - Button: "⚠️ No, I need to price first" → `router.replace("/dashboard")`
5. Style using existing rounded-2xl / border-line / orange-accent Liftoff UI patterns.

**Relevant Context**
- File: `components/liftoff/LiftOffWizard.tsx`
- `applyAriveData()` function: lines 547-595
- `isLockRequest` boolean derived from `requestType`
- Lock form JSX: lines 955-1083 (inside `isLockRequest && step === 2` block)
- `router` already available via `useRouter`

**Status** — `[x] done`

---

## Sub-Task 2 — Add ARIVE Lookup + Confirmation Popup to InlineLockSlideOver

**Intent**
The sidebar currently has no ARIVE lookup — it receives pre-filled data via props. Per user requirement, when the sidebar opens it should use the ARIVE loan number from the parent request to fire a live ARIVE lookup (same Zapier flow as the wizard), auto-fill all pricing fields as read-only, and then show the "priced in last 20 minutes?" confirmation dialog after the lookup succeeds.

**Expected Outcomes**
- When the slide-over opens, it immediately fires an ARIVE lookup using `prefill.ariveLoanNumber`.
- While loading: a spinner/loading state is shown ("Looking up loan in ARIVE…").
- On success: the confirmation dialog appears ("Have you run pricing in ARIVE in the last 20 minutes?").
  - "Yes" → dialog dismissed, form fields shown with ARIVE data auto-filled as read-only.
  - "No" → dialog dismissed, slide-over closes (`onClose()`), LO stays on current page.
- On lookup failure/timeout: show an error message with option to close or retry.
- `arive_loan_number` from the parent request is attached to the submitted lock request (already done via `prefill.ariveLoanNumber` in the existing payload — verify this is correct).
- The two existing confirmation checkboxes remain at the bottom of the form, unchanged.

**Todo List**
1. Add state to `InlineLockSlideOver`:
   - `ariveLookupStatus: "idle" | "loading" | "found" | "error" | "not_found"` (default `"idle"`)
   - `ariveLookupMessage: string` (default `""`)
   - `showAriveConfirmDialog: boolean` (default `false`)
2. In the reset `useEffect` (lines 72-79), when `open === true`:
   - Reset all fields to empty/defaults (keep existing logic)
   - Set `ariveLookupStatus = "idle"`, then immediately call `doAriveLookup()` (trigger lookup on open)
3. Implement `doAriveLookup()` async function inside the component, mirroring the wizard's `handleAriveLookup()` exactly:
   - POST to `/api/liftoff/arive-lookup` with `{ loanNumber: prefill.ariveLoanNumber }`
   - Poll `/api/liftoff/arive-poll?id={requestId}` every 1.5s up to 15s
   - On success: call `applyAriveData(data)` and set `showAriveConfirmDialog = true`
   - On failure/timeout: set `ariveLookupStatus = "error"` with message
4. Implement `applyAriveData(data)` inside the component to set:
   - `rate` from `data.noteRate`
   - `price` from `data.discountPoints`
   - `lender` from `data.lenderName`
   - `product` from `data.productName`
   - `channelType` from `data.channelType` (new state var — see Sub-Task 3)
   - `compensationType` from `data.compensationType` (new state var — see Sub-Task 3)
   - `ariveLookupStatus = "found"`
5. While `ariveLookupStatus === "loading"` or `"idle"`: show a loading state in the form body ("Looking up loan in ARIVE…" with a spinner).
6. While `showAriveConfirmDialog === true`: show the same confirmation dialog pattern as Sub-Task 1 (title, message, two buttons).
   - "Yes" → `setShowAriveConfirmDialog(false)`
   - "No" → `setShowAriveConfirmDialog(false)` then `onClose()`
7. Only show the form fields when `ariveLookupStatus === "found"` AND `!showAriveConfirmDialog`.
8. On error: show error message with a "Close" button.
9. All pricing fields (`rate`, `price`, `lender`, `product`) become read-only after lookup (matching wizard `ariveFieldsLocked` behavior).

**Relevant Context**
- File: `components/liftoff/InlineLockSlideOver.tsx`
  - Reset useEffect: lines 72-79
  - Submit handler: lines 83-124
  - `prefill.ariveLoanNumber` already available
- File: `components/liftoff/LiftOffWizard.tsx`
  - `handleAriveLookup()`: lines 500-544 (exact pattern to mirror)
  - `applyAriveData()`: lines 547-595 (lock fields portion: lines 587-592)
- API: `POST /api/liftoff/arive-lookup` and `GET /api/liftoff/arive-poll?id=` already exist

**Status** — `[x] done`

---

## Sub-Task 3 — Sync InlineLockSlideOver Fields to Match the Wizard

**Intent**
Make the sidebar's lock form an exact mirror of what the wizard shows. Remove fields not in the wizard. Add Channel Type and Compensation Type as read-only display badges (populated from the ARIVE lookup added in Sub-Task 2). Thread `channelType` and `compensationType` through the prop chain so they are submitted in the payload.

**Field Changes Required**

| Action | Field | Reason |
|--------|-------|--------|
| REMOVE | APR % | Not in wizard |
| REMOVE | Est. Monthly Pmt | Not in wizard |
| REMOVE | Requested Close Date | Wizard hides this; always sends null |
| ADD state | `channelType`, `compensationType` | Populated from ARIVE lookup in Sub-Task 2 |
| ADD display | Channel Type badge (read-only) | Matches wizard lines 1001-1022 |
| ADD display | Compensation Type badge (read-only, only when channel = "broker") | Matches wizard line 1013 condition |
| ADD payload | `channel_type`, `compensation_type` | Already accepted by `/api/liftoff/submit` and DB |
| REMOVE payload | `lock_requested_apr`, `lock_requested_monthly_pmt`, `lock_requested_close_date` | Removed from form |

**Expected Outcomes**
- Sidebar form fields match wizard exactly: Rate %, Discount Points, Lender, Product (all read-only after ARIVE lookup), Channel/Compensation badges, Lock Period (LO selects), Notes, two confirmation checkboxes.
- APR, Monthly Pmt, and Close Date no longer appear in the form or payload.
- `channel_type` and `compensation_type` are submitted with the lock request.

**Todo List**
1. Add `channelType` and `compensationType` state variables to `InlineLockSlideOver` (set by `applyAriveData()` in Sub-Task 2).
2. Remove state variables: `apr`/`setApr`, `monthlyPmt`/`setMonthlyPmt`, `closeDate`/`setCloseDate`.
3. Remove those three from the reset `useEffect`.
4. Remove APR %, Est. Monthly Pmt, and Requested Close Date form field JSX.
5. Make Rate %, Discount Points, Lender, and Product inputs read-only after lookup (add `readOnly` + `bg-sand text-muted cursor-not-allowed` styling when `ariveLookupStatus === "found"`).
6. Add Channel Type + Compensation Type badge display after Lender/Product row, using the exact same badge styling as wizard lines 1001-1022:
   - Channel badge: purple (broker) or blue (non-broker)
   - Compensation badge: amber, only when `channelType.toLowerCase() === "broker"` and `compensationType` is present
7. Remove `lock_requested_apr`, `lock_requested_monthly_pmt`, `lock_requested_close_date` from submit payload.
8. Add `channel_type: channelType || null` and `compensation_type: compensationType || null` to submit payload.
9. Update `canSubmit` — remove any reference to removed fields.

**Note on `prefill` prop chain:** `channelType`/`compensationType` will now come from the live ARIVE lookup within the sidebar itself (Sub-Task 2), so they do **not** need to be threaded through `LiftOffWizard` → `LockPreferenceField` → `InlineLockSlideOver` as `prefill` fields.

**Relevant Context**
- File: `components/liftoff/InlineLockSlideOver.tsx`
  - State variables: lines 58-70
  - Reset useEffect: lines 72-79
  - Form layout: lines 173-228
  - Submit payload: lines 87-115
- File: `components/liftoff/LiftOffWizard.tsx`
  - Channel/Compensation badge UI: lines 1000-1022 (exact HTML to reuse)

**Status** — `[x] done`

---

## Implementation Order

Sub-Tasks 2 and 3 are tightly coupled (Sub-Task 3 depends on the ARIVE state added in Sub-Task 2) — implement together in one pass.

Sub-Task 1 (wizard popup) is independent — implement before or after 2+3.

## No Database or API Changes Needed

- All required DB columns already exist (`channel_type`, `compensation_type`)
- `/api/liftoff/submit` already handles both fields
- ARIVE lookup and poll API routes already exist
- No new endpoints needed
