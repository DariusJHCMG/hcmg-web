# Written Information Security Program (WISP)
**Harris Capital Mortgage Group, LLC**  
**NMLS# 1918223**  
**Effective Date:** January 27, 2026  
**Last Reviewed:** January 27, 2026  
**Next Review Due:** January 27, 2027  

> **CONFIDENTIAL — INTERNAL USE ONLY**  
> Do not distribute outside of HCMG management and legal counsel.  
> Store in encrypted Google Drive or private repository only.

---

## 1. Purpose and Legal Basis

This Written Information Security Program (WISP) is established pursuant to:

- **Gramm-Leach-Bliley Act (GLBA)** — 15 U.S.C. §§ 6801–6827
- **FTC Safeguards Rule** — 16 CFR Part 314 (effective June 9, 2023)
- **Regulation P** — 12 CFR Part 1016
- **Nevada Revised Statutes § 603A** (personal information protection)
- **Texas Business & Commerce Code § 521** (data breach notification)

The FTC Safeguards Rule (16 CFR § 314.4) requires all financial institutions to:
1. Designate a qualified individual responsible for the security program
2. Conduct a risk assessment
3. Implement safeguards to control identified risks
4. Regularly test and monitor the effectiveness of those safeguards
5. Oversee service providers with access to customer information
6. Maintain a written incident response plan
7. Periodically review and update the program

Failure to comply exposes HCMG to FTC enforcement actions, civil penalties up to **$50,120 per violation per day** under 15 U.S.C. § 45, and potential state AG enforcement in Nevada and Texas.

---

## 2. Scope

This program applies to all HCMG systems that collect, process, transmit, or store nonpublic personal information (NPI) of customers, including:

| System | Description | NPI Stored |
|---|---|---|
| **hcmgloans.com** | Public website + lead funnels | Prospect name, email, phone, income/credit ranges |
| **Liftoff Portal** (`/liftoff`) | Internal loan operations platform | Borrower name, loan amount, property address, income notes, credit notes, asset notes, ARIVE loan data, gift fund donor info |
| **SLICE Goal Engine** (`/goal-engine`) | LO performance tracking | LO name, NMLS, email, funded loan volumes |
| **Supabase database** | All persistent data | All of the above |
| **Resend** | Email delivery | Borrower name, loan number, submitter contact info |
| **Zapier** | ARIVE workflow automation | ARIVE loan number, borrower name, property address, loan amount (transient) |
| **Vercel** | Web hosting | IP addresses, HTTP logs |

---

## 3. Qualified Individual

Per 16 CFR § 314.4(a), a Qualified Individual must be designated to oversee the security program.

**Designated Qualified Individual:** ___________________________  
**Title:** ___________________________  
**Contact:** ___________________________  
**Date Designated:** ___________________________  

The Qualified Individual must report to the Board (or senior officer) at least annually on the status of the security program and any material risks or incidents.

---

## 4. Risk Assessment

### 4.1 Identified Risks

| Risk | Likelihood | Impact | Current Controls |
|---|---|---|---|
| Credential stuffing / brute-force login | Medium | High | Distributed rate limiting (Upstash Redis, 10 attempts/15 min per IP) |
| XSS attack stealing session cookies | Low | High | CSP headers, HttpOnly cookies, no dangerouslySetInnerHTML |
| Clickjacking | Low | Medium | X-Frame-Options: DENY, CSP frame-ancestors: none |
| SQL injection | Very Low | High | Supabase parameterized queries, no raw SQL in app code |
| Unauthorized NPI access via direct DB | Low | Critical | RLS enabled on all tables; service role key server-only |
| Zapier task log exposure | Low | Medium | Zapier SOC 2; NPI transient (not stored beyond task log TTL) |
| Insider threat (rogue LO) | Low | Medium | RLS — LOs see only their own submissions; audit log |
| Phishing / account takeover | Medium | High | (MFA — planned, see section 7) |
| Data breach via third-party | Low | Critical | Vendor management program (section 5) |
| Records destruction before retention period | Very Low | High | Soft-archive model with 2/7-year gates; no hard-delete route |

### 4.2 Residual Risks (Accepted)

| Risk | Reason Accepted |
|---|---|
| Application-level field encryption | Supabase AES-256 at-rest is sufficient for operational systems; field-level encryption adds significant complexity for marginal security gain |
| No MFA today | Planned implementation (see section 7); acceptable interim risk given rate limiting + session security |
| Zapier task logs | Zapier SOC 2 Type II; logs auto-expire; disclosed in privacy policy |

---

## 5. Vendor Management

Per 16 CFR § 314.4(f), we must oversee service providers with access to customer information. The following vendors have been assessed:

| Vendor | Service | NPI Access | Security Certification | DPA Status | Annual Review |
|---|---|---|---|---|---|
| **Supabase, Inc.** | Database + Auth | All NPI (stored) | SOC 2 Type II | Request at supabase.com/legal/dpa | Annual |
| **Resend, Inc.** | Email delivery | Borrower name, loan #, email | SOC 2 Type II | Request at resend.com/legal | Annual |
| **Zapier, Inc.** | Workflow automation | Loan #, borrower name (transient) | SOC 2 Type II | Available via Zapier Enterprise | Annual |
| **Vercel, Inc.** | Hosting | IP addresses, request logs | SOC 2 Type II, ISO 27001 | At vercel.com/legal/dpa | Annual |
| **PostHog, Inc.** | Analytics | Anonymized events only | SOC 2 Type II | At posthog.com/dpa | Annual |
| **Cloudflare, Inc.** | Bot protection | Browser fingerprint | ISO 27001, SOC 2 | At cloudflare.com/privacypolicy | Annual |
| **Resend, Inc.** | Email delivery | Borrower name, loan #, email | SOC 2 Type II | At resend.com/legal | Annual |

**Action required:** Request and execute Data Processing Agreements (DPAs) with Supabase, Resend, and Zapier. This formalizes the vendor's obligation to protect NPI under GLBA.

---

## 6. Technical Safeguards Implemented

### 6.1 Encryption

| Layer | Standard | Provider |
|---|---|---|
| In transit | TLS 1.3 (enforced) | Vercel CDN |
| At rest — database | AES-256 | Supabase managed PostgreSQL |
| At rest — backups | AES-256 | Supabase managed backups |

### 6.2 Access Control

| Control | Implementation | File/Location |
|---|---|---|
| Authentication | Supabase Auth (JWT) + HttpOnly cookies | `lib/supabase.ts`, `middleware.ts` |
| Session security | HttpOnly, SameSite=Strict, Secure=true in prod, 7-day expiry | `app/api/goal-engine/auth/signin/route.ts` |
| Role-based access | 7 Liftoff roles + 3 admin roles; RLS enforced at DB level | `lib/auth.ts` |
| Row-Level Security | Enabled on ALL tables with NPI | See migration files in `supabase/migrations/` |
| Service role key | Server-side only; never in browser bundle | `lib/supabase.ts` — `createServiceClient()` |
| Rate limiting | Upstash Redis distributed limiter | `lib/rate-limit.ts` |

### 6.3 Network Security

| Control | Implementation |
|---|---|
| Content-Security-Policy | Script, style, connect, frame, object all whitelisted | 
| Strict-Transport-Security | max-age=63072000; includeSubDomains; preload |
| X-Frame-Options | DENY |
| X-Content-Type-Options | nosniff |
| Referrer-Policy | strict-origin-when-cross-origin |
| Permissions-Policy | camera=(), microphone=(), geolocation=(self), payment=() |
| Zapier webhook | Bearer token authentication (ZAPIER_WEBHOOK_SECRET) |

### 6.4 Logging and Monitoring

| Log Type | Table | Retention |
|---|---|---|
| API authentication events | `audit_log` | 7 years |
| Webhook events (ARIVE data) | `webhook_log` | 7 years |
| Session creation/destruction | `slice_sessions` | 7 days (auto-expire) |
| ARIVE lookup transient data | `arive_lookup_results` | 120 seconds (auto-delete on read) |

---

## 7. Security Program Gaps and Remediation Timeline

### In Progress / Planned

| Gap | Priority | Target Date | Owner |
|---|---|---|---|
| **Multi-factor authentication (MFA)** | High | 90 days | Developer |
| **Annual penetration test** | High | 180 days | CFO (hire external vendor) |
| **DPAs with Supabase, Resend, Zapier** | High | 30 days | Legal / CFO |
| **Employee security training** | Medium | 60 days | Qualified Individual |
| **Upstash Redis provisioning** | High | 7 days | Developer |
| **RLS migration applied to live DB** | Critical | Immediate | Developer |
| **archived_at migration applied** | High | 7 days | Developer |

### MFA Implementation Plan

The FTC Safeguards Rule (16 CFR § 314.4(c)(5)) explicitly requires MFA for systems containing customer information. HCMG's Liftoff portal and SLICE goal engine do not currently enforce MFA.

**Plan:** Implement Supabase Auth TOTP-based MFA (Google Authenticator / Authy). Supabase provides native MFA APIs requiring no additional vendor. Implementation steps:
1. Enable TOTP MFA in Supabase Dashboard → Authentication → Settings
2. Add MFA enrollment screen shown after first login
3. Add `/api/goal-engine/auth/verify-mfa` endpoint
4. Enforce MFA verification before issuing session token

**Interim risk mitigation:** Distributed rate limiting (10 attempts/15 min) + account lockout on sustained failure + session security (HttpOnly, SameSite=Strict).

---

## 8. Data Inventory and Retention Schedule

| Data Type | System | Retention Period | Legal Authority | Disposal Method |
|---|---|---|---|---|
| FHA/VA loan operation records | `lift_off_requests` | 2 years post-close | HUD Handbook 4000.1; VA Lender Handbook Ch. 2 | Soft-archive via `archive-old-requests` cron; hard delete after +1 year |
| Conventional/other loan records | `lift_off_requests` | 7 years post-close | GLBA 16 CFR § 314; NV Rev. Stat. § 645B; TX Fin. Code § 157 | Same as above |
| Lead/prospect inquiries | `leads` | 7 years from last contact, or until deletion request | GLBA | Hard delete after 7 years |
| ARIVE lookup transient data | `arive_lookup_results` | 120 seconds | N/A | Auto-delete on read; cron cleanup |
| Session tokens | `slice_sessions` | 7 days | N/A | Auto-expire via `expires_at` |
| Audit logs | `audit_log`, `webhook_log` | 7 years | GLBA | Archival to cold storage after 2 years |
| SLICE performance data | `goal_production` | Duration of employment + 7 years | Employment records law | Manual deletion on offboarding |

---

## 9. Incident Response Plan

Per 16 CFR § 314.4(h), we maintain a written incident response plan. The FTC's amended Safeguards Rule (effective May 2024) requires notification to the FTC within **30 days** of discovering a breach affecting **500 or more customers**.

### 9.1 Incident Classification

| Level | Definition | Example |
|---|---|---|
| **P0 — Critical** | NPI exposed or likely exposed externally | Database credentials leaked; unauthorized DB export confirmed |
| **P1 — High** | Potential NPI exposure under investigation | Unusual API access pattern; unrecognized login from foreign IP |
| **P2 — Medium** | Internal policy violation; no external exposure | Staff accessed records outside their role |
| **P3 — Low** | Failed attack attempt; no breach | Brute-force login attempt blocked by rate limiter |

### 9.2 Response Procedure

| Timeline | Action | Responsible Party |
|---|---|---|
| **Immediately** | Contain the incident (revoke credentials, disable endpoints as needed) | Developer / Qualified Individual |
| **Within 2 hours** | Notify Qualified Individual and senior leadership | Developer |
| **Within 24 hours** | Determine scope: how many records? what NPI categories? | Qualified Individual + Developer |
| **Within 72 hours** | If breach, begin preparing FTC notification (500+ consumers) | Qualified Individual + Legal |
| **Within 30 days** | FTC notification at ftc.gov/DataBreach (if 500+ consumers affected) | Qualified Individual |
| **Within 30–60 days** | State breach notification: Nevada (NRS § 603A.220), Texas (Tex. Bus. & Com. Code § 521.053) | Legal |
| **Within 60 days** | Consumer notification by email or mail | Qualified Individual |
| **Post-incident** | Root cause analysis + update WISP | Developer + Qualified Individual |

### 9.3 Breach Notification Requirements

| Jurisdiction | Law | Trigger | Deadline |
|---|---|---|---|
| Federal (FTC) | 16 CFR § 314.4(h) | 500+ consumers affected | 30 days |
| Nevada | NRS § 603A.220 | Any Nevada consumer affected | Expedient / most cases within 60 days |
| Texas | Tex. Bus. & Com. Code § 521.053 | Any Texas consumer affected | 60 days |
| California | Cal. Civ. Code § 1798.82 | Any California consumer affected | Expedient |

---

## 10. Employee Security Training

Per 16 CFR § 314.4(e), all staff with access to customer information must receive regular security training.

### 10.1 Training Curriculum (Annual)

1. **Phishing awareness** — How to identify and report phishing emails (30 min)
2. **Password hygiene** — Password managers, no reuse, HCMG password policy (15 min)
3. **GLBA and NPI** — What NPI is, why it's protected, what to do if you see a breach (20 min)
4. **Social engineering** — Phone-based attacks targeting mortgage company staff (15 min)
5. **Incident reporting** — How to report a suspected breach or policy violation (10 min)

### 10.2 Training Records

All training completions are logged in the employee record. Training must be completed within 30 days of hire and annually thereafter.

---

## 11. Physical Safeguards

| Safeguard | Status | Notes |
|---|---|---|
| Clean desk policy | Required | No NPI documents left unattended |
| Screen lock | Required | Auto-lock after 5 minutes of inactivity |
| Secure disposal | Required | Paper shredding for physical NPI; secure wipe for digital media |
| Access to office | Controlled | Key/badge required; no unescorted visitor access to work areas |

---

## 12. Annual Review Checklist

Complete annually on or before the anniversary of this WISP's effective date:

- [ ] Review and update data inventory (new systems, new NPI categories)
- [ ] Review vendor list — any new vendors accessing NPI?
- [ ] Verify all DPAs are current and signed
- [ ] Review incident log from past year — any P0/P1 incidents?
- [ ] Confirm RLS policies are still correct for current role structure
- [ ] Confirm rate limiting is active (check Upstash Redis dashboard)
- [ ] Run Mozilla Observatory scan (target: A+ rating)
- [ ] Review penetration test findings from past year
- [ ] Update employee training materials
- [ ] Confirm Qualified Individual designation is current
- [ ] Report to senior leadership / board

**Qualified Individual signature:** ___________________________  
**Date reviewed:** ___________________________  
**Next review due:** ___________________________  

---

## Document History

| Date | Version | Change | Author |
|---|---|---|---|
| January 27, 2026 | 1.0 | Initial creation | HCMG Technology Team |

---

*This document is the property of Harris Capital Mortgage Group, LLC. Unauthorized distribution is prohibited.*
