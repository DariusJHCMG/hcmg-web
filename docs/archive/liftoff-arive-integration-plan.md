# Lift Off — ARIVE Integration Plan

## Overview

Two separate ARIVE integration points:

1. **On-demand Lookup** — LO types an ARIVE loan number in the wizard → clicks "Look up"
   → the server calls the ARIVE REST API directly → fields auto-fill.

2. **Push Triggers via Zapier** — ARIVE fires a webhook to Zapier when a loan is
   created/updated → Zapier POSTs to HCMG SLICE routes.
   *(Already in use for goal-engine / SLICE funding data — not changing.)*

This plan covers **only the on-demand lookup** (Item 1), which is what the Lift Off
wizard needs. The current stub already has the right shape but calls a Zapier Catch
Hook synchronously — that won't work. Zapier catch hooks are fire-and-forget.
We replace it with a direct ARIVE REST API call.

---

## Why NOT Zapier for the lookup

The current `ARIVE_ZAPIER_WEBHOOK_URL` pattern:
```
LO clicks "Look up"
  → POST /api/liftoff/arive-lookup  (15s timeout)
      → POST Zapier Catch Hook  ← Zapier responds 200 instantly, then processes async
          → Zapier queries ARIVE
          → Zapier POSTs back somewhere (no return path to the waiting browser)
```
There is no synchronous return path. The wizard would always time out.

The correct pattern:
```
LO clicks "Look up"
  → POST /api/liftoff/arive-lookup  (server-side, 8s timeout)
      → GET https://api.arive.com/api/loans?searchField=DISPLAY_ID&searchValue={loanNumber}
          (X-API-KEY: <ARIVE_API_KEY>)
      → map response fields → return JSON to browser
```

---

## ARIVE REST API — What We Need

### Authentication
```
Header: X-API-KEY: <your ARIVE API key>
```
Get the API Key from ARIVE Settings → API Integrations → "API Key" field.
Store as `ARIVE_API_KEY` in `.env.local` / Vercel env vars.

The `Client ID` and `Secret Key` shown on that screen are for **OAuth** — we don't
need OAuth for server-to-server calls. The API Key alone is sufficient.

### Endpoint Used
```
GET https://api.arive.com/api/loans
  ?searchField=DISPLAY_ID
  &searchValue={loanNumber}
  &limit=1
```
`DISPLAY_ID` maps to the `ariveLoanId` number shown in the ARIVE UI (e.g. `4471`).
If HCMG uses loan numbers like `HCMG-2025-4471` in the wizard, we strip the prefix
and send only the numeric part: `4471`.

Alternatively use `searchField=LENDER_LOAN_ID` if HCMG stores a custom loan ID in
ARIVE that matches the `HCMG-2025-XXXX` format — confirm with ops which field they
enter in the ARIVE "Lender Loan ID" field. **Start with `DISPLAY_ID`.**

### Search Response Shape (from `GET /api/loans`)
```json
{
  "count": 1,
  "rows": [
    {
      "ariveLoanId": 4471,
      "sysGUID": "abc-123",
      "loanPurpose": "Purchase",
      "mortgageType": "Conventional",
      "baseLoanAmount": 485000,
      "purchasePriceOrEstimatedValue": 545000,
      "loanOriginatorEmail": "sarah@hcmg.com",
      "lockStatus": 1,
      "loanBorrowers": [
        {
          "firstName": "Marcus",
          "lastName": "Thompson",
          "applicantType": "Borrower"
        },
        {
          "firstName": "Tanya",
          "lastName": "Thompson",
          "applicantType": "CoBorrower"
        }
      ],
      "subjectProperty": {
        "addressLineText": "412 Lakeside Blvd",
        "city": "Las Vegas",
        "state": "NV",
        "postalCode": "89120"
      },
      "modifiedDateTime": "2025-08-10T14:22:00Z"
    }
  ]
}
```

The search endpoint returns enough to fill the wizard. We do NOT need the full
`GET /api/loans/{id}` detail call for the lookup — save that for a later feature
(e.g. auto-filling the lock rate from `noteRate`).

### lockStatus field mapping (integer → our string)
ARIVE returns `lockStatus` as a number:
- `0` = floating / no lock
- `1` = locked
- `2` = lock expired
- `3` = lock requested (pending)

Map to our `LockStatus` type:
| ARIVE `lockStatus` | → our value |
|---|---|
| `1` | `"locked"` |
| `3` | `"lock_required"` |
| `0`, `2`, missing | `"floating"` |

### loanPurpose mapping
| ARIVE value | → our `loan_type` |
|---|---|
| `"Purchase"` | `"purchase"` |
| `"Refinance"` | `"refinance"` |

---

## Sub-Task 1 — Update `arive-lookup/route.ts`

**Status:** `[ ] todo`

**Intent**
Replace the Zapier-webhook approach with a direct ARIVE API call.
The response shape the wizard already consumes stays identical — only the
server-side implementation changes. No wizard changes needed.

**Expected Outcomes**
- `POST /api/liftoff/arive-lookup` calls ARIVE REST API directly
- Returns the same `AriveLoanData` JSON the wizard already reads
- `ARIVE_API_KEY` not set → returns `{ notConfigured: true, error: "..." }` (same as before)
- ARIVE returns 0 rows → returns `{ found: false }`
- Demo loan numbers (`HCMG-DEMO-001`, `HCMG-DEMO-002`) still short-circuit before any API call

**Loan number normalisation**
The wizard sends strings like `HCMG-2025-4471`. ARIVE `DISPLAY_ID` expects a number.
Extract the last segment after the final `-` and parse as integer.
If the whole string is already numeric, use it as-is.
If normalisation fails (no numeric part), skip `DISPLAY_ID` and try `LENDER_LOAN_ID`
with the raw string.

**Todo List**
1. In [`app/api/liftoff/arive-lookup/route.ts`](app/api/liftoff/arive-lookup/route.ts):
   - Remove `ARIVE_ZAPIER_WEBHOOK_URL` check
   - Add `ARIVE_API_KEY` env var check → return `notConfigured` if missing
   - Add `normalizeLoanNumber(raw: string): { displayId?: number; lenderLoanId?: string }`
     helper at top of file
   - Call `GET https://api.arive.com/api/loans` with appropriate `searchField` + `searchValue`
   - Map `rows[0]` → `AriveLoanData` response shape
   - Keep demo loan short-circuit unchanged

**Field mapping table (ARIVE → AriveLoanData response)**

| ARIVE field | AriveLoanData key | Notes |
|---|---|---|
| `loanBorrowers[applicantType=Borrower].firstName` | `borrowerFirstName` | |
| `loanBorrowers[applicantType=Borrower].lastName` | `borrowerLastName` | |
| `loanBorrowers[applicantType=CoBorrower].firstName` | `coBorrowerFirstName` | null if none |
| `loanBorrowers[applicantType=CoBorrower].lastName` | `coBorrowerLastName` | null if none |
| `loanPurpose` lowercased | `loanType` | "Purchase"→"purchase", "Refinance"→"refinance" |
| `baseLoanAmount` | `loanAmount` | |
| `purchasePriceOrEstimatedValue` | `purchasePrice` | null if refinance |
| `subjectProperty.addressLineText` | `propertyAddress` | |
| `subjectProperty.city` | `propertyCity` | |
| `subjectProperty.state` | `propertyState` | |
| `subjectProperty.postalCode` | `propertyZip` | |
| `keyDates.estimatedFundingDate` or `subjectProperty.salesContractAmt` date | `targetCloseDate` | best effort |
| `lockStatus` mapped via table above | `lockStatus` | |
| `true` (always when row found) | `found` | |

**Note on `targetCloseDate`:** The search endpoint (`GET /api/loans`) does not return
`keyDates`. Use the detail endpoint `GET /api/loans/{sysGUID}` in a second call only
if `sysGUID` is present in the search result. If the second call fails, omit
`targetCloseDate` — the LO can fill it manually.

**Env var**
```
ARIVE_API_KEY=<from ARIVE Settings → API Integrations → API Key>
```
Remove `ARIVE_ZAPIER_WEBHOOK_URL` from env (no longer used by this route).

---

## Sub-Task 2 — (Optional, later) Extended detail fetch

**Status:** `[ ] future`

When we want to also pre-fill `noteRate`, `lockDate`, `lockExpirationDate`, and
`targetCloseDate` — use `GET /api/loans/{sysGUID}` after the search call. The search
returns `sysGUID` which is the path parameter `id` for the detail endpoint.

Fields available in detail but not in search:
- `noteRate` → `lockRate` pre-fill (with a warning to confirm in ARIVE)
- `keyDates.estimatedFundingDate` → `targetCloseDate`
- `keyDates.tridDate` → for `registered_at`
- `lockDate`, `lockExpirationDate` → informational
- `lenderName` → `lock_requested_lender` hint
- `lenderProductName` → `lock_requested_product` hint

---

## Files Touched

```
app/api/liftoff/
  arive-lookup/route.ts   — EDIT (replace Zapier hook with direct ARIVE REST call)

.env.local (not committed)
  ARIVE_API_KEY=...       — ADD
  # ARIVE_ZAPIER_WEBHOOK_URL — REMOVE (no longer needed for lookup)
```

No wizard changes. No DB changes. No migration needed.

---

## Zapier Trigger Zaps (reference only — already working)

The screenshots show ARIVE Zapier has these trigger events:
- **New Loan in ARIVE** — fires when a loan is created
- **Loan Application submitted in POS** — fires when submitted via POS
- **Loan Date Updated in ARIVE** — fires on date changes
- **Loan Archived in ARIVE** — fires on archive

These are used by the existing `goal-engine` Zaps (applications + fundings). They
are **not** relevant to the Lift Off lookup and should not be changed.

The ARIVE Zapier app uses **3 credentials** (Client ID + Secret Key + API Key) — all
available from ARIVE Settings → API Integrations screen. The API Key alone is what
we need for direct REST calls.

---

## Implementation Notes

- ARIVE API base URL: `https://api.arive.com`
- The API is "Invite Only" on Zapier but the REST endpoint is a standard API —
  no invite needed to call it directly with an API key.
- 8-second server-side timeout is appropriate (faster than the current 15s).
- Rate limiting: the search is called only when an LO clicks "Look up" — very low
  volume, no throttling concern.
- The route already has good error handling shape (`notConfigured`, `error`,
  `found: false`) — keep those exactly as-is.
