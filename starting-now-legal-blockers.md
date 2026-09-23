# Starting Now — Legal / Operational Blockers

> ⚠️ READ ONLY — Do not modify this file.
> These items must be resolved BEFORE going live with Starting Now referrals.
> No SPA = GLBA violation the moment the first referral is sent.

---

## 1. Service Provider Agreement (SPA)

**Owner**: Compliance / Legal team  
**Blocker**: Yes — hard stop before any referral is sent

Get a signed agreement from Starting Now stating they will protect NPI under
GLBA Safeguards Rule standards (16 CFR § 314.4(f)(2)). This requires Starting Now
to contractually commit to implementing and maintaining appropriate safeguards for
any NPI HCMG shares with them.

---

## 2. Privacy Notice Update

**Owner**: Compliance / Legal + Engineering  
**File**: `app/privacy/page.tsx`  
**Blocker**: Yes — must be published before first referral is sent

Add Starting Now to the data sharing disclosures section:

> "We may share your contact information with Starting Now, a credit repair
> service provider, when you are referred for credit repair services."

---

## 3. Opt-Out Mechanism (GLBA Reg P)

**Owner**: Compliance / Legal + Product  
**Blocker**: Requires a decision before implementation is finalized

Decide how HCMG handles GLBA Regulation P opt-out rights for this sharing.
Starting Now already tracks opt-out on their side (the `opt_out` field comes back
on inbound webhook updates), but HCMG may need to collect opt-out preference from
the borrower **before** sending the referral — not after.

Options to evaluate:
- Certify checkbox in the wizard includes an explicit borrower consent statement
- Separate opt-out collection step in the wizard
- Rely on Starting Now's own opt-out tracking (may not satisfy Reg P pre-sharing requirement)

---

## 4. GLBA Annual Notice Update

**Owner**: Compliance / Legal  
**Blocker**: No — but must be included in the next scheduled annual notice cycle

If not already done, update the annual Regulation P notice to include the Starting Now
credit repair referral as a new sharing category.

---

*Recorded: during Starting Now integration planning session.*
*Do not delete or modify — this file is a compliance checkpoint.*
