# HCMG Admin Training Plan

## Overview

This is a structured training curriculum for HCMG administrators covering every feature in the internal admin portal (`/admin`). The goal is to ensure all 6 admins can confidently operate the system end-to-end — from day-to-day lead management and team maintenance, through to running the Goal Engine and managing the LiftOff loan operations queue.

Training is broken into **6 modules** ordered from foundational to advanced. Each module can stand alone as a session.

---

## Module 1 — Admin Portal Orientation & Access Control

**Intent**: Establish a shared baseline. Trainees understand what the admin portal is, how to get in, and what access levels exist.

**Expected Outcomes**:
- Every trainee can log in via Google OAuth and land on `/admin`
- Trainees understand the difference between `admin` and `developer` roles
- Trainees know the 17 sidebar sections and what each one does at a high level
- Trainees understand LiftOff sub-roles (`liftoff_admin`, `lock_desk_admin`, `processor`, etc.) and University roles (`trainer`, `manager`, `university_admin`)

**Topics to Cover**:
1. How Google OAuth login works and what happens if role is not `admin` or `developer`
2. Walk through the Admin Sidebar — all 17 sections (Dashboard, Analytics, HCMG U, Goal Engine, Lift Off, Leads, Agent Partners, Corporate Benefits, Reviews, Users, Licenses, My Funnels, Co-Branded, Mobile App, Settings, Audit Log, Dev Tools)
3. Role matrix: what each role can and cannot do
4. Row-Level Security (RLS) concept — why LOs only see their own data
5. When to escalate to the developer role vs. admin role

**Relevant Context**:
- `app/admin/layout.tsx` — role check and redirect logic
- `components/admin/AdminSidebar.tsx` — all 17 nav items
- `lib/auth.ts` — `isAdmin()`, `hasLiftOffAccess()`, `canSeeLockRequests()` helpers

**Status**: [ ] pending

---

## Module 2 — User & Team Management

**Intent**: Admins can fully manage the team — create accounts, assign roles, deactivate users, send invites, and manage NMLS licenses.

**Expected Outcomes**:
- Trainee can create a new user profile end-to-end (invite → role → LiftOff sub-roles → University role)
- Trainee can deactivate a user and understand what that does to their data/access
- Trainee can update an LO's NMLS license by state
- Trainee knows where to find the audit log to verify changes

**Topics to Cover**:
1. `/admin/users` — viewing the team list, filtering active/inactive
2. Creating a new user: invite email flow, setting `role`, `lo_slug`, `nmls`, `employment_status`
3. Editing a user: updating role, activating/deactivating, changing LiftOff sub-roles and University role
4. Deleting/deactivating a user — what's preserved vs. removed
5. `/admin/licenses` — adding/editing NMLS license records by state
6. The invite email — what it sends, how the LO completes setup
7. Checking `/admin/audit` to confirm changes were logged

**Relevant Context**:
- `app/admin/users/page.tsx` — user list UI
- `app/api/admin/users/route.ts` — create user API
- `app/api/admin/users/[id]/route.ts` — update/delete user API
- `app/api/admin/users/[id]/invite/route.ts` — invite email trigger
- `app/admin/licenses/page.tsx` — license management
- `lib/auth.ts` — role definitions

**Status**: [ ] pending

---

## Module 3 — Lead Management & Analytics

**Intent**: Admins can track, filter, reassign, and report on all mortgage leads and partner leads coming into the system.

**Expected Outcomes**:
- Trainee can find any lead, view its full event history, and reassign it to a different LO
- Trainee understands the 3 lead channels: general leads, agent partner leads, and corporate leads
- Trainee can use the Analytics dashboard to interpret lead sources and funnel performance
- Trainee understands the lead status lifecycle (new → contacted → qualified → closed/lost)

**Topics to Cover**:
1. `/admin/leads` — searching, filtering by status/source/LO, viewing lead details
2. Reassigning a lead to a different LO — when and why to do it
3. Lead status lifecycle: `new`, `contacted`, `qualified`, `closed`, `lost`
4. `/admin/agent-leads` — co-branded buyer leads grouped by realtor
5. `/admin/corporate-leads` — employer/HR partnership inquiries
6. `/admin/analytics` — GA4 funnel steps, lead source attribution, Google Search Console data
7. Lead events log — understanding the journey from page view → funnel step → conversion
8. Funnel links (`/admin/my-funnels`) — how LO-specific URLs are created and tracked

**Relevant Context**:
- `app/admin/leads/page.tsx` — main leads dashboard
- `app/admin/analytics/page.tsx` — analytics dashboard
- `app/admin/agent-leads/page.tsx` — agent partner leads
- `app/admin/corporate-leads/page.tsx` — corporate leads
- `app/api/admin/leads/[id]/route.ts` — reassign/update lead API

**Status**: [ ] pending

---

## Module 4 — Reviews, Co-Branded Pages & Public Content

**Intent**: Admins can moderate team reviews, manage realtor co-branded landing pages, and control the LO-facing funnel links and co-brand setup.

**Expected Outcomes**:
- Trainee can approve or reject a pending review
- Trainee can create a new co-branded realtor page and understand the stats it tracks
- Trainee understands how funnel links work and can create one for an LO

**Topics to Cover**:
1. `/admin/reviews` — moderation queue: pending, approve, reject, view approved reviews
2. Review statuses: `pending → approved / rejected`
3. `/admin/co-branded` — creating a co-branded page (LO slug, realtor slug, realtor company)
4. Co-branded page stats: `clicks`, `app_clicks`, `book_call_clicks`, `bookings_completed`
5. `/admin/my-funnels` — creating LO funnel links, viewing click counts, activating/deactivating
6. How co-branded and funnel pages appear on the public website

**Relevant Context**:
- `app/admin/reviews/page.tsx` — review moderation
- `app/api/admin/reviews/route.ts` and `[id]/route.ts` — review API
- `app/admin/co-branded/page.tsx` — co-branded management
- `app/admin/my-funnels/page.tsx` — funnel link management

**Status**: [ ] pending

---

## Module 5 — Goal Engine Administration

**Intent**: Admins can create monthly production goals, monitor LO commitments, view the leaderboard, run the awards process, and leave coaching notes.

**Expected Outcomes**:
- Trainee can create a new goal month (set volume/units targets, publish it)
- Trainee can view all LO commitments for a given month
- Trainee understands how actual production (from Arive) syncs into the goal engine
- Trainee can run the awards process (TopGun, Most Improved, etc.) and issue certificates
- Trainee can write a coaching note for an LO

**Topics to Cover**:
1. `/goal-engine/admin` — overview of the admin dashboard
2. Creating a goal month: `draft → scheduled → published → closed` lifecycle
3. Setting `funded_volume_goal`, `funded_units_goal`, `app_volume_goal`, `app_units_goal`
4. Viewing all LO commitments for a month and their confidence percentages
5. How Arive production sync works (Vercel cron every 15 min) and where to check it
6. The leaderboard — how rankings are calculated
7. Running the awards process — award types (TopGun, Most Improved, etc.), certificate generation, award emails
8. Coaching notes — adding notes by type: `general`, `performance`, `encouragement`, `action_required`
9. Goal notifications — how LOs are alerted to key events

**Relevant Context**:
- `app/goal-engine/admin/page.tsx` — admin dashboard
- `lib/goal-engine.ts` — business logic for production tracking
- `goal_months`, `goal_commitments`, `goal_production`, `goal_awards`, `goal_leaderboard` tables
- Vercel cron: 1st of month 2 AM ET runs month close + awards

**Status**: [ ] pending

---

## Module 6 — LiftOff Loan Operations Queue

**Intent**: Admins (and LiftOff sub-role users) can manage the loan operations workflow — process submissions, lock requests, help desk tickets, disclosures, and track SLA deadlines.

**Expected Outcomes**:
- Trainee can navigate the LiftOff queue and filter by request type and status
- Trainee understands every request type (loan submission, lock request, disclosure, help desk)
- Trainee can assign a request to a processor and move it through the workflow stages
- Trainee understands SLA deadlines and what happens when they are breached
- Trainee knows which LiftOff sub-role handles which queue

**Topics to Cover**:
1. `/liftoff` — the queue: filtering by `request_type`, `request_status`, `stage`, SLA
2. Request types: loan submission, lock request, disclosure, help desk ticket
3. Request status lifecycle: `new → in_progress → pending_review → completed / cancelled`
4. Lock desk workflow: `lock_desk_agent` works the queue; `lock_desk_admin` approves
5. SLA deadline calculation (`lib/liftoff-sla.ts`) — when SLA fires, breach escalation
6. Assigning a processor (`assigned_processor` field) and ops manager oversight
7. Help desk tickets and the SLA tracking for each
8. The LiftOff activity log — audit trail per request
9. Starting Now referrals — credit repair referral creation from a LiftOff request
10. LiftOff sub-role matrix — who can do what: `liftoff_admin`, `liftoff_team`, `lock_desk_admin`, `lock_desk_agent`, `ops_manager`, `help_desk_agent`, `processor`

**Relevant Context**:
- `app/liftoff/page.tsx` — queue UI
- `app/liftoff/[id]/page.tsx` — request detail/workflow
- `lib/liftoff-sla.ts` — SLA deadline logic
- `lift_off_requests`, `lift_off_activity_log`, `starting_now_referrals` tables

**Status**: [ ] pending

---

## Module 7 — HCMG University Administration (Bonus)

**Intent**: Admins and University admins can create courses, manage learner enrollments, track progress, and issue certificates.

**Expected Outcomes**:
- Trainee can create a course and publish it through the `draft → in_review → approved → published` lifecycle
- Trainee can enroll an LO in a course and set a due date
- Trainee can track learner progress and quiz attempt scores
- Trainee can issue or revoke a certificate

**Topics to Cover**:
1. `/university/admin` — admin dashboard overview
2. Course lifecycle: `draft → in_review → approved → published`
3. Course categories: `general`, `start`, `sales`, `product`, `operations`, `compliance`
4. Lesson types: `video`, `text`, `audio`, `presentation`, `resource`, `knowledge_check`, `assignment`
5. Enrolling learners — individual vs. bulk enrollment, setting due dates
6. Tracking progress — `watch_pct`, completion status, quiz attempt scores
7. Assessments: `knowledge_check`, `quiz`, `final_assessment`, `certification_exam` — passing percentage, max attempts
8. Issuing certificates — `course`, `path`, `program` cert types, expiry dates
9. University audit log — compliance trail
10. University roles: `university_admin`, `trainer`, `manager`, `learner`

**Relevant Context**:
- `app/university/admin/page.tsx` — University admin
- `uni_courses`, `uni_lessons`, `uni_enrollments`, `uni_progress`, `uni_assessments`, `uni_quiz_attempts`, `uni_certificates`, `uni_audit_log` tables

**Status**: [ ] pending

---

## Module 8 — System Settings, Audit Log & Dev Tools

**Intent**: Admins understand how to manage global settings, review the audit trail, and (for developers) use the dev tools safely.

**Expected Outcomes**:
- Trainee can update company-wide settings (notification emails, GA4/GSC keys, Google OAuth tokens)
- Trainee can read the audit log to investigate any admin action
- Developer trainees understand the dev tools (backfill, DB health, env revalidation, sample emails) and when to use them

**Topics to Cover**:
1. `/admin/settings` — notification email addresses, Google Analytics 4 measurement ID, GSC property URL, Google OAuth access/refresh tokens
2. Mobile App (`/admin/mobile-app`) — push notification configuration
3. `/admin/audit` — reading the last 200 admin actions: actor, action, timestamp, IP, details
4. How to investigate a suspicious or unexpected change using the audit log
5. `/admin/dev` — Dev Tools: what each endpoint does, when it's safe to run
   - Backfill funnels / profiles
   - Database health check
   - Environment revalidation
   - Send sample emails
6. Rule: only developers should run dev tools; admins should request dev to run them

**Relevant Context**:
- `app/admin/settings/page.tsx` — settings
- `app/admin/audit/page.tsx` — audit log
- `app/admin/dev/page.tsx` — dev tools
- `app/api/admin/settings/route.ts` — settings API
- `app/api/admin/dev/*` — dev-only endpoints
- `audit_log` table

**Status**: [ ] pending

---

## Suggested Delivery Order

```
Module 1 → Module 2 → Module 3 → Module 4 → Module 5 → Module 6 → (Module 7) → Module 8
```

- **Modules 1–4** cover the core admin portal used daily by all admins.
- **Modules 5–6** cover the operational sub-systems (Goal Engine + LiftOff).
- **Module 7** is optional / bonus for those who will manage HCMG University.
- **Module 8** is a closing session on system health and governance.

---

## Audience & Prerequisites

| Audience | Required Modules |
|----------|-----------------|
| All new admins | 1, 2, 3, 4, 8 |
| Goal Engine operators | + Module 5 |
| LiftOff operators | + Module 6 |
| University admins / trainers | + Module 7 |
| Developers | All modules |

---

## Supporting Materials to Prepare Before Training

- [ ] Screen recording walkthrough for each module
- [ ] A sandbox/staging environment for hands-on exercises
- [ ] Role matrix reference card (one-pager PDF)
- [ ] Cheat sheet: Lead status lifecycle, Request status lifecycle, Goal month lifecycle, Course lifecycle
- [ ] List of real scenarios to walk through in each module (use staging data)
