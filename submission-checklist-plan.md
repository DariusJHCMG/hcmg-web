# Submission Document Checklist — Redesign Plan

## Overview

The current `submission` document checklist in the LiftOff Wizard shows 10 hardcoded items
for every submission regardless of borrower situation. Several of those items are wrong:
- **Appraisal** — not needed at initial submission
- **Title Order** — not needed at initial submission
- **HOI Binder** — not needed at initial submission
- **Tax Returns** — only needed for self-employed / 1099 borrowers
- **W-2s + Paystubs** — only needed for W-2/salaried borrowers (not self-employed)
- **Driver's License** — required but currently missing from the list

This plan corrects the checklist to only show documents that are actually required,
driven by a new **required** "Is any borrower self-employed or 1099?" Yes/No question
added to Step 2. Because the question is required, the LO cannot advance to Step 3
without answering it — so the checklist always has the correct context when it renders
and there is no "unknown/null" state to handle on Step 3.

It also adds a new per-item **N/A** state (with a required reason note) so LOs can
mark docs that genuinely don't apply, without blocking submission.

## Confirmed decisions

| Decision | Answer |
|---|---|
| Driver's License required for... | All submissions (purchase + refi) |
| What to show when employment type not yet answered | Never happens — question is required before Step 3 |
| Self-employed: are W-2s/Paystubs absent or pre-marked N/A? | Completely absent from the list |

---

## Sub-Tasks

---

### Sub-Task 1 — Add required `selfEmployed` Yes/No question to Step 2 of the wizard

**Intent**
The wizard needs to know the borrower's employment type so it can build the correct
document list. A simple Yes/No radio question ("Is any borrower self-employed or 1099?")
captures this with minimal friction. The question is **required** — the LO cannot click
"Continue" to Step 3 without answering it. This guarantees the checklist on Step 3 is
always built with the correct employment context.

**Placement**
End of Step 2 (loan info section), grouped after the Occupancy Type fields and
immediately before the Lock/Float preference block.

**Expected Outcomes**
- A `selfEmployed: boolean | null` state variable exists in `WizardInner`
- A Yes/No toggle/radio group is rendered in Step 2 for `submission` requests only
- The `next()` guard for `isSubmission` (currently line 627) includes:
  `if (selfEmployed === null) { setError("Please indicate if any borrower is self-employed or 1099."); return; }`
- The value correctly drives which income docs appear in Sub-Task 2
- `self_employed_borrower` is persisted in the DB for ops-team visibility

**Todo**
1. Add `const [selfEmployed, setSelfEmployed] = useState<boolean | null>(null)` in `WizardInner`
2. Render a styled Yes/No pill-button pair in the Step 2 `{isSubmission && ...}` block, immediately before the lock/float preference UI (matches the existing Yes/No pattern used for gift funds)
3. Add the `selfEmployed === null` guard to the `isSubmission` branch of `next()` at line ~628
4. Add `self_employed_borrower: boolean | null` to the `LiftOffRequest` interface in `lib/database.types.ts`
5. Include `self_employed_borrower: selfEmployed ?? null` in the submit payload in `handleSubmit`

**Relevant Context**
- State declarations: [`LiftOffWizard.tsx`](components/liftoff/LiftOffWizard.tsx:362)
- Step 2 `isSubmission` validation guard: [`LiftOffWizard.tsx`](components/liftoff/LiftOffWizard.tsx:627)
- Step 2 render block: search for `{isSubmission &&` around line 900–1100 in the wizard
- Submit payload assembly: [`LiftOffWizard.tsx`](components/liftoff/LiftOffWizard.tsx:673)
- Type definition: [`lib/database.types.ts`](lib/database.types.ts:89)

**Status** — `[ ] pending`

---

### Sub-Task 2 — Rebuild the submission `DOC_CHECKLISTS` entry to be correct and dynamic

**Intent**
Replace the static 10-item `submission` array with a function that builds the correct
list based on `selfEmployed`. Remove the three items never needed at submission time
(Appraisal, Title Order, HOI Binder) and add Driver's License to every submission.

**Correct doc list for W-2/Salaried borrower**
1. Driver's License
2. 1003 — All sections completed in ARIVE
3. Credit Report
4. W-2s (2 years)
5. Paystubs (30-day)
6. Purchase Agreement
7. Bank Statements (2 months)

**Correct doc list for Self-Employed / 1099 borrower**
1. Driver's License
2. 1003 — All sections completed in ARIVE
3. Credit Report
4. Tax Returns (2 years)
5. Purchase Agreement
6. Bank Statements (2 months)

**Expected Outcomes**
- `DOC_CHECKLISTS.submission` is replaced with a `buildSubmissionDocs(selfEmployed: boolean): DocItem[]` function
- Because `selfEmployed` is always answered before Step 3 (required field), the function signature is `boolean` not `boolean | null` — no null-path needed
- The returned list is used to compute `docItems` in `WizardInner`
- The progress counter reflects the correct item count for the borrower type

**Todo**
1. Remove the `submission: [...]` entry from `DOC_CHECKLISTS`
2. Write `function buildSubmissionDocs(selfEmployed: boolean): DocItem[]` above `DOC_CHECKLISTS` — returns the 7-item W-2 list or the 6-item self-employed list as shown above
3. Update the `docItems` derivation (currently line ~471) to call `buildSubmissionDocs(selfEmployed!)` when `isSubmission`, otherwise use `DOC_CHECKLISTS[requestType]`

**Relevant Context**
- Current checklist definition: [`LiftOffWizard.tsx`](components/liftoff/LiftOffWizard.tsx:12)
- `docItems` derivation: [`LiftOffWizard.tsx`](components/liftoff/LiftOffWizard.tsx:471)
- `DocChecklist` render: [`LiftOffWizard.tsx`](components/liftoff/LiftOffWizard.tsx:1596)

**Status** — `[ ] pending`

---

### Sub-Task 3 — Add N/A state + inline modal to `DocChecklist` component

**Intent**
Each checklist item should have three states: **Pending** (unchecked), **In File** (checked),
and **N/A** (not applicable — requires a reason note). This lets LOs mark docs that don't
apply to a specific scenario without blocking submission.

**UX Flow**
- Each row shows a three-state control: checkbox for "In File", and an "N/A" button
- Clicking "N/A" opens a small modal/dialog: a text area for the reason, a "Confirm" button, and a "Cancel" button
- On confirm, the item shows a grey "N/A" badge with a truncated note visible on hover (tooltip)
- A doc is "resolved" if it is checked (In File) OR marked N/A with a non-empty note
- The checklist progress badge counts resolved items: "N of M resolved"
- Submission is only unblocked when ALL items are resolved

**Expected Outcomes**
- `docChecked` state shape expands: each entry stores `{ checked: boolean; na: boolean; naNote: string }`
- A modal component (`NaReasonModal`) renders over the page when an item's N/A button is clicked
- The `DocChecklist` `onToggle` prop is replaced with `onCheck(id)` and `onNa(id, note)` props
- The checklist "all resolved" check in the submit-gate validation uses the new resolved logic
- The progress display says "N of M resolved" instead of "N of M complete"

**Todo**
1. Define a `type DocState = { checked: boolean; na: boolean; naNote: string }` type
2. Change `docChecked` state from `Record<string, boolean>` to `Record<string, DocState>`
3. Build inline `NaReasonModal` — accepts `open`, `onConfirm(note)`, `onCancel` props; renders a semi-transparent overlay with a white card containing a textarea and two buttons
4. Update `DocChecklist` component to accept `onCheck` and `onNa` handlers, render the N/A button per row, and show the N/A badge with truncated note
5. Update `pendingDocs` / `checkedCount` derivation to use "resolved" logic (checked OR na-with-note)
6. Update the submit guard (anywhere `pendingDocs > 0` blocks submission) to use the new resolved logic
7. Update the raw checklist payload builder to include `na` and `naNote` per item

**Relevant Context**
- `DocChecklist` component: [`LiftOffWizard.tsx`](components/liftoff/LiftOffWizard.tsx:255)
- `docChecked` state: [`LiftOffWizard.tsx`](components/liftoff/LiftOffWizard.tsx:446)
- Progress / pending count: [`LiftOffWizard.tsx`](components/liftoff/LiftOffWizard.tsx:472)
- Submit payload: [`LiftOffWizard.tsx`](components/liftoff/LiftOffWizard.tsx:667)

**Status** — `[ ] pending`

---

### Sub-Task 4 — Update `doc_checklist_json` type + detail view to handle N/A state

**Intent**
The `doc_checklist_json` column shape needs to be expanded to accommodate the new
`na` and `naNote` fields. The detail page (`/liftoff/[id]`) and the type definition
must reflect this. The detail page should display N/A items with a distinct visual style
and show the LO's note so the ops team understands why a document was skipped.

**Expected Outcomes**
- `doc_checklist_json` type updated to `{ label: string; checked: boolean; na?: boolean; naNote?: string }[]`
- The detail page shows N/A items with a grey badge and the note beneath
- The "all resolved" check on the detail page badge uses `checked || (na && naNote)` logic
- Demo data in `queue/page.tsx` is updated to remove HOI Binder, Title Order, Appraisal from the sample checklist and to add Driver's License

**Todo**
1. Update the type in [`lib/database.types.ts`](lib/database.types.ts:89) to add optional `na` and `naNote` fields
2. Update the detail page `app/liftoff/[id]/page.tsx` lines 253–285 to render N/A items correctly
3. Update the demo data in `app/liftoff/queue/page.tsx` to use the corrected doc list
4. Create a Supabase patch migration file `supabase/patches/add_self_employed_borrower.sql` that adds the `self_employed_borrower boolean` column to `lift_off_requests` (the JSON column shape change requires no migration — it is already `jsonb`)

**Relevant Context**
- Type file: [`lib/database.types.ts`](lib/database.types.ts:89)
- Detail view: [`app/liftoff/[id]/page.tsx`](app/liftoff/[id]/page.tsx:253)
- Demo data: [`app/liftoff/queue/page.tsx`](app/liftoff/queue/page.tsx:55)
- Existing patch pattern: [`supabase/patches/`](supabase/patches/)

**Status** — `[ ] pending`

---

## Implementation Order

Sub-Tasks must be implemented in order — each one depends on the prior:
1 → adds employment type signal  
2 → uses that signal to build the correct list  
3 → adds N/A state to the list component  
4 → updates the persistence layer and display side  
