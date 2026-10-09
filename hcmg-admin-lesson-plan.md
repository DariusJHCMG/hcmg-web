# HCMG Admin Training — Full Presenter Lesson Plan

> **Delivery format:** Live screen-share, all 6 admins together  
> **System:** Live production — observe only; only mutate on safe, low-risk actions  
> **Structure:** 4 sessions × 2 modules  
> **Driver rotation:** Assign a different person to share their screen each module

---

## PRE-SESSION CHECKLIST (Do Before Every Session)

- [ ] Confirm all 6 admins are logged in at `hcmgloans.com/admin`
- [ ] Assign a screen driver for the first module
- [ ] Share this lesson plan on a secondary monitor for reference
- [ ] Confirm who has `admin` vs `developer` role before Session 4 (dev tools)
- [ ] Have the Handout document open to reference during questions

---

---

# SESSION 1 — Foundation

## MODULE 1 — Admin Portal Orientation & Access Control

**Session goal:** Every trainee understands how to get into the admin portal, what they can see, and why the permission system exists.

---

### OPENING (2 min)

Say:
> "The HCMG admin portal is the control center for everything — leads, team, loan operations, goals, training, and the public website. Today we are going to walk through every section so that nothing is a mystery. Let's start by talking about how access works."

---

### TOPIC 1 — How Login Works (5 min)

**[Screen: Sign-in page]**

Talk through:
- Login uses **Google OAuth only** — no username/password
- When you sign in with your Google account, the system checks your `role` field in the database
- If your role is `admin` or `developer`, you land on `/admin`
- If your role is `loan_officer`, you get redirected to `/portal` — the LO dashboard
- If your account is deactivated, access is denied entirely

Key point to emphasize:
> "There is no way to accidentally give yourself admin access. It has to be set in the system by someone who is already an admin."

---

### TOPIC 2 — The Admin Sidebar Tour (10 min)

**[Screen: `/admin` dashboard — sidebar visible]**

Walk down the sidebar top to bottom. For each item, click it briefly and describe in one sentence what it does:

| # | Section | One-line description |
|---|---------|----------------------|
| 1 | **Dashboard** | KPI cards: leads today/week/month + recent leads table |
| 2 | **Analytics** | GA4 funnel data, lead source attribution, Search Console |
| 3 | **HCMG U** | University — courses, learner progress, certificates |
| 4 | **Goal Engine** | Monthly production goals, commitments, leaderboard, awards |
| 5 | **Lift Off** | Loan ops queue — submissions, lock requests, help desk |
| 6 | **Leads** | All mortgage leads — search, filter, reassign to LOs |
| 7 | **Agent Partners** | Co-branded buyer leads grouped by realtor |
| 8 | **Corporate Benefits** | Employer/HR partnership inquiries |
| 9 | **Reviews** | Moderate team and company reviews |
| 10 | **Users** | Create, edit, deactivate team members |
| 11 | **Licenses** | Manage NMLS licenses by state on public site |
| 12 | **My Funnels** | LO-specific funnel links with click tracking |
| 13 | **Co-Branded** | Realtor co-branded landing pages |
| 14 | **Mobile App** | Push notification config |
| 15 | **Settings** | Company-wide settings, GA4 keys, alert emails |
| 16 | **Audit Log** | Every admin action in the last 200 entries |
| 17 | **Dev Tools** | Developer-only utilities — admins should not run these |
| 18 | **My Profile** | Your own profile settings |

Also point out the **bottom bar**:
- **View Site** — opens the public website in a new tab
- **Sign out** — logs you out

---

### TOPIC 3 — Role Matrix (8 min)

**[Screen: stay on sidebar]**

Explain the three portal roles:

| Role | Who Has It | What They Can Do |
|------|-----------|------------------|
| `admin` | 6 people currently | Everything in the portal |
| `developer` | Subset of admins | Everything + Dev Tools |
| `loan_officer` | 26 active LOs | Portal only — their own leads, LiftOff queue (if sub-role), goals |

Then explain **LiftOff sub-roles** — these are extra permissions on top of the main role:

| Sub-Role | What They Handle |
|----------|-----------------|
| `liftoff_admin` | Full LiftOff control |
| `liftoff_team` | Process requests in the queue |
| `lock_desk_admin` | Approve lock requests |
| `lock_desk_agent` | Work the lock desk queue |
| `ops_manager` | Assign requests, manage workflow |
| `help_desk_agent` | Help desk queue |
| `processor` | Loan processing |

Then explain **University roles** (stored per profile):

| University Role | What They Do |
|----------------|-------------|
| `university_admin` | Create courses, manage enrollments, issue certificates |
| `trainer` | Author courses, view learner progress |
| `manager` | View team progress, assign courses |
| `learner` | Default — take courses, earn certificates |

Key point:
> "A loan officer can have a main role of `loan_officer` AND additional LiftOff sub-roles that give them queue access. These are set separately in the Users page."

---

### TOPIC 4 — Row-Level Security Concept (5 min)

**[Screen: stay on sidebar or go to leads page]**

Say:
> "LOs only ever see their own data. If an LO logs in, they see only their own leads, their own LiftOff requests, their own goals. This is enforced at the database level — it's called Row-Level Security. Even if an LO somehow got a direct database query, they still can't see another LO's data. As admins, we see everything."

---

### TOPIC 5 — When to Escalate to Developer (3 min)

Say:
> "Dev Tools are for developers only. If you think something needs to be backfilled or reset in the system, ask the developer before touching Dev Tools. Admins should use the Audit Log to investigate issues first."

---

### MODULE 1 WRAP-UP (2 min)

Ask the group:
- "Any sections in the sidebar you want to look at more closely today?"
- "Does anyone not have access to the admin portal? Let's fix that now if so."

---
---

## MODULE 2 — User & Team Management

**Session goal:** Every trainee can manage the full lifecycle of a team member account — create, edit, invite, deactivate, delete.

---

### OPENING (2 min)

Say:
> "User management is one of the most important admin tasks. When someone joins the team, you create their account here. When they leave, you deactivate it. When their licensing changes, you update it. Let's walk through all of it."

---

### TOPIC 1 — The Users Page Overview (5 min)

**[Screen: `/admin/users`]**

Point out the header stats:
- **X accounts** — total in system
- **X active** — currently active
- **X loan officers** — LOs
- **X admin/dev** — privileged accounts

The table is split into two sections: **Loan Officers** and **Admin & Dev**.

Walk through each column in the table:
| Column | What it shows |
|--------|--------------|
| **Member** | Avatar initials, full name, email |
| **Role** | Admin (orange), Developer (blue), Loan Officer (purple); ★ Leadership badge for senior titles |
| **NMLS / Slug** | Their NMLS number and `/go/[slug]` funnel URL |
| **Status** | Active (green) or Inactive (red) |
| **Last Seen** | Green = within 24h; Yellow = within 7 days; Red = over 7 days |
| **Website** | Whether they appear on the public team page |
| **Actions** | Edit, Deactivate/Activate, Send Invite, Delete |

---

### TOPIC 2 — Creating a New User (10 min)

**[Screen: `/admin/users` — click `+ Add user`]**

Walk through the create form fields:

| Field | Notes |
|-------|-------|
| **Full Name** * | Required — drives the auto-generated slug |
| **Role** * | Admin / Developer / Loan Officer — determines access level |
| **Job Title** | If it contains CEO, Founder, President, Chief, or National Director → gets a ★ Leadership badge |
| **Email** * | Their company Google email — this is their login |
| **Password** * | Minimum 8 characters — they can reset it after first login |
| **Phone** | For internal directory |
| **NMLS#** | Their personal NMLS number |
| **LO Slug** | Auto-generated from name (e.g., `john-smith`) — drives their funnel URL `/go/john-smith` |
| **Lead Notify Email** | Where lead alerts go — defaults to their login email |
| **Offices** | Comma-separated list of office locations |
| **Short Bio** | Shown on their public team page profile |

**Live demo**: Create a test user (use a test email like `training-test@hcmgloans.com`) — then immediately delete it after the demo.

Key points:
> "The LO slug is critical — it ties leads, funnels, and co-branded pages to this person. Once leads exist with a slug, be careful changing it."

> "Creating the account does NOT automatically send an invite. You have to click Send Invite separately."

---

### TOPIC 3 — Sending an Invite (3 min)

**[Screen: Users table — point to the Send Invite button]**

Explain:
- Click **Send Invite** next to a user
- They receive an email with a link to set up their account / first login
- Use this when a new hire joins and needs their first login link

---

### TOPIC 4 — Editing a User (8 min)

**[Screen: Click the Edit button for an existing user]**

Show the edit drawer that expands inline. Walk through the fields:
- **Full Name, Role, Phone, NMLS#, LO Slug, Lead Notify Email, LinkedIn URL**
- **Offices, Licensed States** (comma-separated)
- **Short Bio** (textarea)
- **Show on public team page** (checkbox — controls visibility on `/team`)

Live demo: Change a test user's job title. Click **Save changes**.

Point out:
> "Every edit is logged in the Audit Log. If you need to trace who changed what and when, that's where you look."

---

### TOPIC 5 — LiftOff Sub-Roles & University Role (5 min)

**[Screen: Edit drawer — scroll to role sections]**

Explain:
- LiftOff sub-roles are checkboxes in the edit drawer — you can assign multiple
- The University role is a single dropdown — `learner` is the default
- If someone joins the ops team, you add their LiftOff sub-roles here
- If someone becomes a trainer, you change their University role to `trainer`

---

### TOPIC 6 — Deactivating vs. Deleting (5 min)

**[Screen: Users table — point to the Deactivate and Delete buttons]**

**Deactivate:**
- Sets `is_active = false`
- The person **cannot log in** but all their data is preserved
- Their leads, LiftOff requests, goals, etc. remain in the system
- You can reactivate at any time
- **Use this for departures** — almost always the right choice

**Delete (Permanent):**
- Click Delete → type the word `DELETE` to confirm
- Removes: their login account, their profile, their funnel link `/go/[slug]`, their avatar photo
- **Cannot be undone**
- Only use if the account was created in error

Say:
> "If someone leaves the company, always deactivate — never delete. You want to keep the history."

---

### TOPIC 7 — Managing NMLS Licenses (7 min)

**[Screen: `/admin/licenses`]**

Explain:
- This page controls what appears on the **public licensing page** on the website
- It does NOT affect the LO's personal NMLS# on their profile (that's in Users)
- This is about what states HCMG the company is licensed in

Walk through the three status types:
- **Licensed & Active** (orange on map) — state is live, license number shows publicly
- **Coming Soon** (dark blue) — we're working on it
- **Not Available** (gray) — we can't lend there

Show the map on the left + state list on the right.

**Live demo (safe to do):**
1. Find a state in the right panel
2. Click the 3-button toggle to cycle its status
3. If setting to Active — enter a license number in the field
4. Note the bottom bar changes to "You have unpublished changes"
5. Click **Save & publish** — changes go live immediately
6. Or click **Discard** to revert

---

### TOPIC 8 — Verifying with the Audit Log (3 min)

**[Screen: `/admin/audit`]**

Say:
> "Any time you make a change — create a user, deactivate someone, update settings — check the Audit Log to confirm it was recorded."

Show:
- The table: Time, User (who did it), Action (color-coded badge), Details (what changed), IP address
- Show a `user.created` or `user.role_changed` entry as an example
- The search field — search by email or action name

---

### MODULE 2 WRAP-UP (2 min)

Ask:
- "Any questions about creating users or setting roles?"
- "Does everyone know how to deactivate vs. delete and why it matters?"

---
---

# SESSION 2 — Content & Leads

## MODULE 3 — Lead Management & Analytics

**Session goal:** Every trainee can find, filter, reassign, and understand the status of every lead in the system, and can read the analytics dashboard.

---

### OPENING (2 min)

Say:
> "Leads are the lifeblood of the business. Every lead that comes through hcmgloans.com lands in this system. Your job as an admin is to make sure nothing falls through the cracks — that every lead is either assigned to an LO or actioned directly."

---

### TOPIC 1 — The Leads Page Overview (8 min)

**[Screen: `/admin/leads`]**

Point out the **header stat bars** at the top:
- Total, DSCR, Funnel, Contact, Recruiting, LO-assigned counts
- Alert badges in yellow/orange/blue for unworked leads that need attention

Explain the **View Switcher** (if the admin has an LO slug):
- **My Leads** — leads assigned specifically to you as an LO
- **Company View** — all company leads

Show the **Company View** sections and their color coding:
| Section | Color | Where it comes from |
|---------|-------|---------------------|
| ⚡ DSCR Leads | Navy/brand | hcmgloans.com/dscr/[lo-slug] — DSCR investment loans |
| ⚠ Company Leads | Amber | /get-started, /team, /seo pages — no LO assigned |
| Contact Form | Orange | /contact — general inquiry, no mortgage data |
| Employment/Recruiting | Blue | /join or /careers — job seekers |
| LO-Assigned | White | Already routed to a specific LO |

Key point:
> "The amber 'Company Leads' section is your most important watchlist. These came in but were not routed to any LO. Someone needs to assign them or call them."

---

### TOPIC 2 — Lead Status Lifecycle (5 min)

**[Screen: Leads table — Status column]**

Explain the 5 statuses and their color codes:
| Status | Badge Color | Meaning |
|--------|------------|---------|
| **new** | Blue | Just came in, nobody has touched it |
| **contacted** | Yellow | Reached out, waiting for response |
| **qualified** | Purple | Qualified for a mortgage, active pipeline |
| **closed** | Green | Deal funded |
| **lost** | Red | Did not proceed |

Say:
> "As an admin, you can manually change a lead's status. But most of the time, the LO updates this from their portal."

---

### TOPIC 3 — Searching, Filtering & Reassigning Leads (8 min)

**[Screen: Leads page — use filters]**

Show each filter:
- **Search box** — search by name, email, or phone number
- **Status dropdown** — filter to one status
- **LO Spotlight dropdown** — show only leads assigned to a specific LO
- **Section tabs** — All, DSCR, Funnel, Contact, Recruiting, LO-assigned

**Live demo — Reassigning a lead:**
1. Find a lead in the Company Leads (amber) section
2. Click to open the lead detail
3. Show the Assigned LO field
4. Explain: Change the LO slug to route it to a specific LO

> "Reassigning a lead is the most common admin action on this page. It happens when an LO leaves, when a lead was misrouted, or when a lead asks to switch LOs."

Show the **Export CSV** button — useful for reporting.

---

### TOPIC 4 — Agent Partner & Corporate Leads (5 min)

**[Screen: `/admin/agent-leads`, then `/admin/corporate-leads`]**

**Agent Partner Leads (`/admin/agent-leads`):**
- These come from `/agents` — real estate agent partnership inquiries
- Grouped by realtor
- Different from co-branded — these are agents asking to partner, not borrower leads

**Corporate Leads (`/admin/corporate-leads`):**
- Come from `/company-partners` — employer/HR/benefits teams
- These are employer partnership inquiries for home buying benefit programs

---

### TOPIC 5 — Analytics Dashboard (8 min)

**[Screen: `/admin/analytics`]**

Walk through the analytics dashboard sections:
- **GA4 funnel steps** — how many people entered each step of the /get-started funnel
- **Lead source attribution** — which source/medium/campaign is driving leads
- **Google Search Console data** — which search queries are bringing people to the site

Key points:
> "This is a read-only proxy of our Google Analytics and Search Console data. You can see what's performing without leaving the admin portal."

> "If the Google connection is expired, you'll see an error here. That gets fixed in Settings → Google OAuth Reconnect."

---

### TOPIC 6 — Funnel Links (5 min)

**[Screen: `/admin/my-funnels`]**

Explain:
- Every LO gets a personal funnel link — e.g., `/go/john-smith`
- When a lead comes through that link, it's automatically assigned to that LO
- You can create a funnel link here, view click counts, and activate/deactivate links

Note:
> "If an LO's slug is not set on their profile, the Funnels page will show a warning. You fix that in Users first, then run a backfill in Dev Tools."

---

### MODULE 3 WRAP-UP (3 min)

Ask:
- "Does everyone know how to find an unassigned lead and route it to an LO?"
- "Any questions about the different lead sections?"

---
---

## MODULE 4 — Reviews, Co-Branded Pages & Funnels

**Session goal:** Every trainee can moderate reviews, create co-branded realtor pages, and manage funnel links.

---

### OPENING (2 min)

Say:
> "Reviews and co-branded pages are part of how we manage our public brand and partner relationships. These tools are fairly simple but important to know."

---

### TOPIC 1 — Reviews Moderation (10 min)

**[Screen: `/admin/reviews`]**

Show the header stats: X total, X approved, X pending. If there's an amber alert badge, point it out — that means reviews are waiting for moderation.

Show the **4 filter tabs**: Pending, Approved, Rejected, All.

Walk through the table columns:
| Column | What it shows |
|--------|--------------|
| **Author** | Name of the reviewer |
| **Rating** | 1–5 orange stars |
| **Review** | Truncated review text |
| **LO / Scope** | Which LO it's about OR "Company" + whether it's personal or company scope |
| **Status** | pending (amber), approved (green), rejected (red) |
| **Date** | When it was submitted |
| **Actions** | Approve, Reject, Delete |

**Live demo (safe to do on a pending review if one exists):**
- Click **Approve** on a pending review — status changes to approved immediately, review appears publicly
- Or click **Reject** — status changes to rejected, does not appear publicly

Key points:
> "Pending reviews never show publicly. They only go live when you approve them."

> "If you click Delete — there is a confirmation prompt. Deletes are permanent."

---

### TOPIC 2 — Co-Branded Pages (10 min)

**[Screen: `/admin/co-branded`]**

Explain the concept:
> "A co-branded page is a custom landing page for a specific realtor and LO pair. For example, `hcmgloans.com/co-branded/john-smith/jane-realtor` shows both the LO and realtor's branding. The realtor shares this with their buyers. We track every click."

> "Note: this page will only show your co-branded management if your admin account has an LO slug set. If it shows a warning message, go to Users and set your LO slug."

Walk through the stats tracked per co-branded page:
| Stat | What it tracks |
|------|---------------|
| **clicks** | Total page views |
| **app_clicks** | Clicks on the mortgage application CTA |
| **book_call_clicks** | Clicks to book a call |
| **bookings_completed** | Actual completed bookings |

Show how to create a new co-branded page:
- LO slug (which LO it belongs to)
- Realtor slug (part of the URL — lowercase, hyphenated)
- Realtor name and company name

---

### TOPIC 3 — Funnel Links Recap (3 min)

**[Screen: `/admin/my-funnels`]**

Quick recap (covered in Module 3):
- Each LO has a `/go/[slug]` link
- Creating a link here + setting the slug on their profile ties everything together
- Click counts update in real time

---

### MODULE 4 WRAP-UP (2 min)

Ask:
- "Does everyone feel comfortable approving and rejecting reviews?"
- "Any questions on co-branded pages?"

---
---

# SESSION 3 — Operations

## MODULE 5 — Goal Engine Administration

**Session goal:** Every trainee can create and publish a monthly goal, view LO commitments, read the leaderboard, run the awards process, and write coaching notes.

---

### OPENING (2 min)

Say:
> "The Goal Engine is our production accountability system. Every month, we set volume and unit targets, LOs commit to what they're going to do, and then we track their actual production from Arive. At the end of the month, we run the awards. Let's walk through how it works from the admin side."

---

### TOPIC 1 — Goal Engine Admin Overview (5 min)

**[Screen: `/goal-engine/admin`]**

Show the 4 quick stat cards:
- Total Goals created
- Active goals (green)
- Drafts (yellow)
- Zapier endpoint URL (dark box — this is where Arive sends production data)

Show the **Manager View** button — links to `/admin/goal-engine/dashboard` for a team-wide production view.

---

### TOPIC 2 — Goal Month Lifecycle (10 min)

**[Screen: Goal Engine admin — existing goals list]**

Explain the 4 stages a goal month goes through:

| Status | What it means |
|--------|--------------|
| **draft** | Being set up — LOs cannot see it yet |
| **scheduled** | Visible but not yet collecting commitments |
| **published** | LOs can see it and submit commitments. **An email goes out to all active LOs automatically when you publish.** |
| **closed** | Month is over — leaderboard is final, awards can be run |

Fields when creating a goal month:
- **funded_volume_goal** — target funded loan volume in dollars
- **funded_units_goal** — target funded loan count
- **app_volume_goal** — target application volume in dollars
- **app_units_goal** — target application count
- **Month label** (e.g., "January 2025")

Key point:
> "Publishing a goal automatically sends an announcement email to every active Loan Officer. Make sure the numbers are right before you hit publish."

---

### TOPIC 3 — Viewing LO Commitments (5 min)

**[Screen: A published goal month detail]**

Walk through:
- Each LO's commitment shows their volume pledge, unit pledge, and **confidence percentage**
- Confidence % is how confident they are they'll hit their commitment
- A low confidence number is a coaching opportunity
- Commitments can be locked by the admin (prevents the LO from editing further)

---

### TOPIC 4 — Arive Production Sync (5 min)

Explain without going to the screen (there is no UI for this — it's automated):
> "Every 15 minutes, Vercel runs a background job that pulls funded and application data from Arive into the goal_production table. You do not trigger this manually. You can check if it's working by looking at the production numbers on the leaderboard — if they haven't updated for several hours, check with the developer."

> "The Zapier webhook endpoint shown on the admin page is where Arive pushes data. If data stops syncing, that endpoint is the first thing to check."

---

### TOPIC 5 — The Leaderboard (5 min)

**[Screen: Goal Engine leaderboard view]**

Explain:
- Rankings are calculated by funded volume (primary) and funded units (secondary)
- The leaderboard is live — it updates as Arive sync runs
- Every LO can see the leaderboard from their portal

---

### TOPIC 6 — Running Awards (8 min)

**[Screen: Goal Engine admin — awards section]**

Explain the process:
1. When a goal month is **closed**, the awards process becomes available
2. The system looks at production data and determines award recipients
3. Award types include: TopGun, Most Improved, and others
4. Running the awards:
   - Generates certificates (PDF) stored with a `cert_type` of `course`, `path`, or `program`
   - Sets `email_sent = true` when award emails are sent
   - Award email goes to the recipient

Key point:
> "The awards run automatically on the 1st of every month at 2 AM ET. But you can also trigger them manually from the admin dashboard if needed."

---

### TOPIC 7 — Coaching Notes (5 min)

**[Screen: Goal Engine — coaching notes section (or profile view)]**

Walk through:
- Coaching notes are private notes from a manager about an LO's performance
- LOs do not see coaching notes
- Four note types:

| Type | When to use |
|------|------------|
| **general** | General observations, check-ins |
| **performance** | Production numbers discussion |
| **encouragement** | Positive reinforcement |
| **action_required** | Something specific the LO needs to do |

---

### MODULE 5 WRAP-UP (3 min)

Ask:
- "Does everyone understand the goal month lifecycle — especially what happens when you publish?"
- "Any questions about how Arive data feeds into the system?"

---
---

## MODULE 6 — LiftOff Loan Operations Queue

**Session goal:** Every trainee can navigate the LiftOff queue, understand every request type and status, and knows which sub-role handles what.

---

### OPENING (2 min)

Say:
> "LiftOff is our internal loan operations system. LOs submit their loans here, and the ops team processes them. As an admin, you have visibility into the entire queue and can assign, move, and oversee any request."

---

### TOPIC 1 — The Queue Overview (8 min)

**[Screen: `/liftoff`]**

Show the 5 stat cards at the top:
- **Total** — all requests
- **Pending** — orange if > 0 (needs attention)
- **In Review** — currently being worked
- **Action Needed** — orange if > 0 (something requires a response)
- **Completed** — done

Walk through the request table columns:

| Column | What it shows |
|--------|--------------|
| **Borrower** | Name (click → goes to request detail); HIGH badge (red) if priority score ≥ 80 |
| **LO** | Who submitted it + their NMLS# |
| **Type** | Register + Disclosure, Disclosure Only, Submission, Loan Help Desk |
| **ARIVE #** | Loan number from Arive system |
| **Stage** | Where in the workflow process |
| **Status** | Badge: pending, in_review, action_needed, completed, cancelled |
| **SLA** | Countdown to deadline; red text ⚠ if breached |
| **Submitted** | Date/time submitted |

Point out **red-highlighted rows** — these have breached their SLA deadline.

---

### TOPIC 2 — Request Types Explained (8 min)

**[Screen: Queue — filter by each type]**

| Request Type | What it is | SLA |
|-------------|-----------|-----|
| **Register + Disclosure** | Full initial loan registration + disclosure package | 1 business hour |
| **Disclosure Only** | Just the disclosure docs | 1 business hour |
| **Submission** | Loan file submission to underwriting | 48 business hours |
| **Loan Help Desk** | General ops help request | 4 business hours |

> "Lock requests have the tightest SLA — 1 hour. These need to be actioned immediately when they come in."

---

### TOPIC 3 — Request Status Lifecycle (5 min)

**[Screen: Queue table — Status column]**

| Status | Badge Color | Meaning |
|--------|------------|---------|
| **new** | — | Just submitted |
| **pending** | Yellow | Waiting to be picked up |
| **in_review** | Blue | Being actively worked |
| **action_needed** | Orange | Something is required before work can continue |
| **completed** | Green | Done |
| **cancelled** | Gray | Cancelled by LO or admin |

---

### TOPIC 4 — SLA Deadlines Explained (8 min)

**[Screen: Queue — SLA column, point to a live countdown]**

Explain the SLA rules:

- **Lock requests** run on a windowed schedule: **Monday–Saturday, 10 AM – 7 PM ET only**. Hours outside that window don't count.
- **All other types** run on flat business hours: **Monday–Saturday, all day**. Sundays are skipped entirely.

Priority scores (how urgent a request is — drives the HIGH badge):

| Request Type | Base Score |
|-------------|-----------|
| Lock Request | 100 |
| Register + Disclosure | 80 |
| Disclosure Only | 70 |
| Loan Help Desk | 65 |
| Submission | 50 |

Score also goes up by +40 if SLA is critical (breached), +20 if warning (≤20% window left).

---

### TOPIC 5 — Processing a Request (8 min)

**[Screen: Click into a request from the queue]**

Walk through the request detail page:
- Borrower info: first name, last name, loan amount, property address, stage
- Lock status (for lock requests): lock fields and wire/adverse/incomplete flags
- **Assign Processor**: the `assigned_processor` field — who is responsible for this request
- Activity log at the bottom: every action taken on this request with actor + timestamp
- Action buttons: move status, add notes, flag for action_needed

Explain the role flow:
> "When a new request comes in, an `ops_manager` or `liftoff_admin` reviews it and assigns a processor. The processor works it. The `lock_desk_admin` approves lock requests. The `help_desk_agent` handles help desk tickets."

---

### TOPIC 6 — Starting Now Referrals (3 min)

**[Screen: A request detail — Starting Now section if visible]**

Explain:
- If a borrower's credit scores need work before they qualify, you can create a **Starting Now referral** directly from the LiftOff request
- It captures: borrower name, current credit status, Experian/Equifax/TransUnion scores
- This triggers the credit repair referral workflow

---

### TOPIC 7 — LiftOff Sub-Role Matrix (5 min)

Draw attention back to the sub-role matrix:

| Sub-Role | Can Do |
|----------|--------|
| `liftoff_admin` | Everything — full queue, all approvals |
| `liftoff_team` | Process requests in the queue |
| `lock_desk_admin` | Approve lock requests, see all lock desk queues |
| `lock_desk_agent` | Work the lock desk queue only |
| `ops_manager` | Assign requests, manage workflow, oversee processors |
| `help_desk_agent` | Help desk queue only |
| `processor` | Loan processing work |

Key point:
> "You assign these sub-roles in the Users page → Edit a user → LiftOff Roles checkboxes."

---

### MODULE 6 WRAP-UP (3 min)

Ask:
- "Does everyone understand the SLA rules and why the lock request window matters?"
- "Any questions about the queue filtering or request detail page?"

---
---

# SESSION 4 — University & Governance

## MODULE 7 — HCMG University Administration

**Session goal:** Every trainee understands how to manage courses, enroll learners, track progress, and issue certificates.

---

### OPENING (2 min)

Say:
> "HCMG University is our internal training platform. LOs and staff complete courses here. As admins, we create courses, assign them to learners, and track who has completed what. Let's walk through the admin side."

---

### TOPIC 1 — University Admin Overview (5 min)

**[Screen: `/university/admin`]**

Walk through what's visible:
- Course library — all courses by category and status
- Learner progress view — who is enrolled in what, and how far they are
- Certificate management — issued, expired, revoked
- University audit log — every admin action

---

### TOPIC 2 — Course Lifecycle (8 min)

**[Screen: University admin — courses list]**

Every course moves through 4 stages:

| Status | Meaning |
|--------|---------|
| **draft** | Being built — not visible to learners |
| **in_review** | Ready for review by a `university_admin` or `trainer` |
| **approved** | Approved but not yet published |
| **published** | Live — learners can see and enroll |

Course categories:
- `general` — All-team content
- `start` — Onboarding for new hires
- `sales` — Sales techniques
- `product` — Mortgage product knowledge
- `operations` — Ops processes
- `compliance` — Regulatory compliance

---

### TOPIC 3 — Lesson Types (5 min)

**[Screen: A course detail — lesson list]**

Every lesson has a type:

| Lesson Type | What it is |
|-------------|-----------|
| **video** | Video lesson with watch percentage tracking |
| **text** | Written content |
| **audio** | Audio lesson |
| **presentation** | Slide deck |
| **resource** | Downloadable file |
| **knowledge_check** | Inline quiz |
| **assignment** | Task to complete |

> "Watch percentage (`watch_pct`) is tracked for video lessons. An LO has to watch a minimum percentage to get credit for the lesson."

---

### TOPIC 4 — Enrolling Learners (8 min)

**[Screen: University admin — enrollment management]**

Explain enrollment:
- Individual enrollment: assign a specific course to a specific person
- Bulk enrollment: assign a course to multiple people at once
- When enrolling, you set a **due date** (optional but recommended for required courses)
- Enrollment type: what kind of assignment it is (mandatory, optional, etc.)

---

### TOPIC 5 — Tracking Progress (5 min)

**[Screen: Progress tracking view]**

Show what admins can see:
- Per learner: which lessons are complete, video watch %, overall course completion
- Quiz attempt scores — how many times they tried, what they scored
- Whether they passed (based on `passing_pct` threshold)

---

### TOPIC 6 — Assessments (5 min)

Assessment types in the system:

| Type | Description |
|------|-------------|
| **knowledge_check** | Quick inline check, not graded formally |
| **quiz** | Graded quiz with passing threshold |
| **final_assessment** | End-of-course exam |
| **certification_exam** | High-stakes, required for certificate issuance |

Each assessment has:
- `passing_pct` — minimum score to pass (e.g., 80%)
- `max_attempts` — how many times they can try before being locked out

---

### TOPIC 7 — Issuing Certificates (5 min)

**[Screen: Certificates section]**

Three certificate types:
- **course** — completed a single course
- **path** — completed a learning path (group of related courses)
- **program** — completed a full program

Each certificate has:
- `issued_at` — when it was issued
- `expires_at` — optional expiry (for compliance courses)
- `verification_id` — unique code that can be used to verify the certificate is authentic

Admins can:
- Issue certificates manually
- Revoke a certificate
- View all issued certificates and their expiry dates

---

### TOPIC 8 — University Roles & Audit Log (3 min)

Recap university roles:

| Role | Can Do |
|------|--------|
| `university_admin` | Create courses, manage all enrollments, issue/revoke certificates |
| `trainer` | Author courses, view learner progress |
| `manager` | View their team's progress, assign courses |
| `learner` | Take courses, earn certificates |

Point out the **University audit log** — every admin action is recorded separately from the main audit log, specifically for compliance traceability.

---

### MODULE 7 WRAP-UP (2 min)

Ask:
- "Does anyone expect to be creating courses or managing certificates regularly?"
- "Any questions about enrollments or the certificate lifecycle?"

---
---

## MODULE 8 — System Settings, Audit Log & Dev Tools

**Session goal:** Every trainee understands global settings, knows how to use the audit log to investigate issues, and understands the governance rule around Dev Tools.

---

### OPENING (2 min)

Say:
> "This is our final module — it covers how the system is configured globally, how to trace anything that goes wrong using the audit log, and what Dev Tools are for and who should touch them."

---

### TOPIC 1 — Company Settings (10 min)

**[Screen: `/admin/settings`]**

Walk through each section of the settings page:

**Lead Alert Emails (5 color-coded groups):**

| Group | Color | Leads from |
|-------|-------|-----------|
| Funnel Lead Alert | Amber | /get-started, /team, /seo pages (no LO assigned) |
| Agent Lead Alert | Emerald | /agents — real estate agent partnerships |
| Corporate Lead Alert | Violet | /company-partners — employer/HR |
| Contact Form Alert | Orange | /contact — general inquiries |
| Recruiting Alert | Blue | /join and /careers |

> "Each alert email is separate. If you want to be notified of contact form submissions, enter your email in the orange box. Leave blank to disable alerts for that type."

**Company Lead Display Label:**
> "This is the label shown in the Leads table for unassigned leads — e.g., 'HCMG Company'. You can change it here."

**Google OAuth Status:**
- Shows whether Google is connected for Analytics and Search Console access
- If the token expires, click **Reconnect** — re-authenticates with Google

**GA4 Measurement ID:**
- Format: `G-XXXXXXXXXX`
- Found in Google Analytics → Admin → Data Streams
- This is the tracking ID injected on every page of the website

**GA4 Property ID:**
- A numeric ID (different from the Measurement ID)
- Found in GA4 → Admin → Property Settings

**Google Search Console Property URL:**
- Must exactly match the verified property in GSC
- Include `https://` — no trailing slash

> "If Analytics data stops showing in the portal, the first thing to check is whether the Google OAuth token is still valid."

---

### TOPIC 2 — Mobile App / Push Notifications (3 min)

**[Screen: `/admin/mobile-app`]**

Brief overview:
- This page manages web push notification configuration
- Controls VAPID key setup and which profiles are subscribed
- You would use this if you need to send a push notification to all active users

---

### TOPIC 3 — The Audit Log (10 min)

**[Screen: `/admin/audit`]**

This is the most important tool for investigating anything that went wrong.

Walk through the table:
| Column | What it shows |
|--------|--------------|
| **Time** | Exact timestamp |
| **User** | Email of the admin who did it, or "system" for automated actions |
| **Action** | Color-coded badge — e.g., `user.created`, `lead.status_changed`, `settings.updated` |
| **Details** | JSON data showing exactly what changed |
| **IP** | IP address of the actor |

Show the **search field** — you can search by email or action name.

**Walk through an investigation scenario:**
> "Someone tells you a lead was accidentally reassigned and they don't know who did it. You go to Audit Log, search for that lead ID or the LO's email, find the `lead.status_changed` or `lead.reassigned` entry, and you can see exactly who changed it, when, and from what IP."

Common action types to know:
- `user.created` — new user added
- `user.role_changed` — role was changed
- `user.deactivated` — account deactivated
- `lead.created` — new lead came in
- `lead.status_changed` — lead status was updated
- `settings.updated` — settings page was saved
- `user.login` — login event

---

### TOPIC 4 — Dev Tools Governance (5 min)

**[Screen: `/admin/dev` — observe only, do not click anything]**

Show what's on the Dev Tools page:
- **Backfill funnels** — regenerates funnel links for all LOs
- **Backfill profiles** — re-syncs profile data
- **Database health check** — checks all table connections
- **Environment revalidation** — refreshes Next.js cached pages
- **Send sample emails** — tests the email delivery pipeline

The rule:
> "Admins should not run these. If you think one of these is needed, message the developer and ask them to run it. The Audit Log will show if something was run and by whom. These tools can have wide effects on live data."

Only `developer`-role users should run Dev Tools.

---

### TOPIC 5 — My Profile (2 min)

**[Screen: `/admin/profile`]**

Quick note:
- Your own profile settings live here
- Update your photo, bio, phone, LinkedIn
- Change your lead notification email

---

### MODULE 8 WRAP-UP + FINAL Q&A (5 min)

Final summary statements:

> "You now have a complete picture of the HCMG admin portal. Here is your quick-reference rule set:"

1. **Always deactivate, never delete** — when someone leaves
2. **Check the Audit Log first** — before escalating any issue
3. **Never run Dev Tools yourself** — ask the developer
4. **Publishing a goal month sends an email to all LOs** — make sure the numbers are right
5. **Lock request SLA is 1 hour, windowed 10 AM–7 PM ET** — treat them as urgent
6. **Lead alerts go to the email in Settings** — make sure those are set correctly
7. **Approving a review makes it go live instantly** — read the review before approving

Open Q&A — take any remaining questions.

---

## END OF TRAINING

Hand out the **HCMG Admin Handout** and let trainees know they can reference it after the session.
