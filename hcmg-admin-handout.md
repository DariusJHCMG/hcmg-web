# HCMG Admin Portal — Quick Reference Handout

> **Keep this document handy during and after training.**  
> All URLs are relative to `hcmgloans.com`

---

## 1. THE ADMIN PORTAL AT A GLANCE

| Section | URL | What It Does |
|---------|-----|--------------|
| Dashboard | /admin | KPI cards + recent leads |
| Analytics | /admin/analytics | GA4 funnels, lead attribution, Search Console |
| HCMG University | /university/admin | Courses, enrollments, certificates |
| Goal Engine | /goal-engine/admin | Monthly goals, commitments, leaderboard, awards |
| Lift Off | /liftoff | Loan ops queue — submissions, lock requests, help desk |
| Leads | /admin/leads | All mortgage leads |
| Agent Partners | /admin/agent-leads | Realtor partnership leads |
| Corporate Benefits | /admin/corporate-leads | Employer/HR leads |
| Reviews | /admin/reviews | Moderate team reviews |
| Users | /admin/users | Create, edit, deactivate team members |
| Licenses | /admin/licenses | State license map for public website |
| My Funnels | /admin/my-funnels | LO funnel links + click stats |
| Co-Branded | /admin/co-branded | Realtor co-branded landing pages |
| Mobile App | /admin/mobile-app | Push notification config |
| Settings | /admin/settings | Alert emails, GA4 keys, Google OAuth |
| Audit Log | /admin/audit | Every admin action — last 200 entries |
| Dev Tools | /admin/dev | **Developer only — do not touch** |
| My Profile | /admin/profile | Your own profile settings |

---

## 2. ROLES & PERMISSIONS

### Portal Roles

| Role | Can Access | Who Has It |
|------|-----------|-----------|
| `admin` | Full admin portal | 6 people |
| `developer` | Admin portal + Dev Tools | Subset of admins |
| `loan_officer` | LO portal, own leads/goals | 26 active LOs |

### LiftOff Sub-Roles (set in Users → Edit → LiftOff Roles)

| Sub-Role | Handles |
|----------|---------|
| `liftoff_admin` | Full LiftOff control |
| `liftoff_team` | Process queue requests |
| `lock_desk_admin` | Approve lock requests |
| `lock_desk_agent` | Work lock desk queue |
| `ops_manager` | Assign & manage workflow |
| `help_desk_agent` | Help desk queue only |
| `processor` | Loan processing |

### University Roles (set in Users → Edit → University Role)

| Role | Can Do |
|------|--------|
| `university_admin` | Create courses, manage all enrollments, issue/revoke certificates |
| `trainer` | Author courses, view learner progress |
| `manager` | View team progress, assign courses |
| `learner` | Take courses, earn certificates (default) |

---

## 3. STATUS LIFECYCLES

### Lead Status

| Status | Badge | Meaning |
|--------|-------|---------|
| `new` | 🔵 Blue | Just came in, nobody has touched it |
| `contacted` | 🟡 Yellow | Reached out, awaiting response |
| `qualified` | 🟣 Purple | Active mortgage pipeline |
| `closed` | 🟢 Green | Loan funded |
| `lost` | 🔴 Red | Did not proceed |

### LiftOff Request Status

| Status | Badge | Meaning |
|--------|-------|---------|
| `new` | — | Just submitted |
| `pending` | 🟡 Yellow | Waiting to be picked up |
| `in_review` | 🔵 Blue | Being actively worked |
| `action_needed` | 🟠 Orange | Requires a response before continuing |
| `completed` | 🟢 Green | Done |
| `cancelled` | ⚫ Gray | Cancelled |

### Goal Month Status

| Status | Meaning |
|--------|---------|
| `draft` | Being built — LOs cannot see it |
| `scheduled` | Visible but not collecting commitments |
| `published` | ⚠️ LOs can commit — email sent to all LOs |
| `closed` | Month over — awards can be run |

### Course Status (HCMG University)

| Status | Meaning |
|--------|---------|
| `draft` | Being built — learners cannot see it |
| `in_review` | Ready for review |
| `approved` | Reviewed, not yet published |
| `published` | Live — learners can enroll |

### License Status (State Map)

| Status | Map Color | Meaning |
|--------|----------|---------|
| Licensed & Active | Orange | Published on public licensing page with license # |
| Coming Soon | Dark Blue | In progress |
| Not Available | Gray | Cannot lend in this state |

---

## 4. LIFTOFF SLA REFERENCE

| Request Type | SLA Window | Schedule |
|-------------|-----------|---------|
| Register + Disclosure | **1 business hour** | Mon–Sat, all day |
| Disclosure Only | **1 business hour** | Mon–Sat, all day |
| Loan Help Desk | **4 business hours** | Mon–Sat, all day |
| Submission | **48 business hours** | Mon–Sat, all day |

> **Lock Request SLA note:** Lock requests run on a windowed schedule — **Monday through Saturday, 10:00 AM – 7:00 PM ET only**. Hours outside this window do not count toward the SLA. Sundays are never counted for any request type.

**SLA Severity Colors in Queue:**
- 🔴 Red row + ⚠️ = SLA **breached** (critical)
- 🟠 Orange countdown = SLA **warning** (≤20% window remaining)
- Normal text = within SLA

**Priority Scores (drives HIGH badge on borrower name):**
- Lock Request: 100
- Register + Disclosure: 80 → HIGH badge threshold
- Disclosure Only: 70
- Loan Help Desk: 65
- Submission: 50
- +40 if critical (breached), +20 if warning

---

## 5. KEY SETTINGS

### Lead Alert Emails — What Goes Where

| Email Field | Leads From |
|-------------|-----------|
| Funnel Lead Alert | /get-started, /team, /seo pages (no LO assigned) |
| Agent Lead Alert | /agents — real estate agent partnerships |
| Corporate Lead Alert | /company-partners — employer/HR |
| Contact Form Alert | /contact — general inquiries |
| Recruiting Alert | /join and /careers |

> Leave any field blank to disable that alert type.

### Google Analytics Fields

| Field | Where to Find It |
|-------|-----------------|
| GA4 Measurement ID | GA4 → Admin → Data Streams (format: G-XXXXXXXXXX) |
| GA4 Property ID | GA4 → Admin → Property Settings (numeric) |
| GSC Property URL | Must match verified property exactly (e.g., https://hcmgloans.com) |

> If analytics stop loading → Settings → reconnect Google OAuth.

---

## 6. USER MANAGEMENT QUICK GUIDE

### Creating a New User
1. Go to **/admin/users** → click **+ Add user**
2. Fill: Full Name, Role, Email, Password (required)
3. Optional: NMLS#, LO Slug, Phone, Job Title, Short Bio
4. Click **Create user**
5. Then click **Send Invite** to email them their login link

### Editing a User
1. Click **Edit** next to the user
2. Update fields in the drawer
3. Set LiftOff Roles (checkboxes) and University Role (dropdown) if needed
4. Click **Save changes**

### Deactivating a User (when someone leaves)
1. Click **Deactivate** next to the user
2. Their account is locked — they cannot log in
3. All their data is preserved
4. Can be reactivated at any time

### Deleting a User (created in error only)
1. Click **Delete**
2. Type the word **DELETE** to confirm
3. ⚠️ Permanently removes: account, profile, funnel link, avatar
4. **Cannot be undone — use deactivate instead**

### Updating State Licenses
1. Go to **/admin/licenses**
2. Find the state in the right panel or click on the map
3. Toggle the status: Active / Coming Soon / Not Available
4. If Active: enter the license number in the field
5. Click **Save & publish** at the bottom

---

## 7. REVIEWS QUICK GUIDE

| Action | What Happens |
|--------|-------------|
| Approve | Review goes live on public profile immediately |
| Reject | Review is hidden — does not appear publicly |
| Delete | Permanently removed — confirmation required |

> Pending reviews are **never** visible publicly. They only go live when you approve them.

---

## 8. GOAL ENGINE ADMIN QUICK GUIDE

### Starting a New Goal Month
1. Go to **/goal-engine/admin**
2. Click **Create New Monthly Goal**
3. Enter: month label, funded/app volume + unit targets
4. Status starts as `draft`
5. When ready: move to `scheduled`, then `published`
6. ⚠️ **Publishing automatically sends an announcement email to all active LOs**

### Running Awards
1. Close the goal month (status → `closed`)
2. From the admin dashboard, trigger the awards process
3. Awards run automatically on the **1st of each month at 2 AM ET**
4. Certificates and award emails are generated automatically

### Coaching Notes
- Go to an LO's profile or the Goal Engine admin view
- Add a note with type: general / performance / encouragement / action_required
- Notes are **private** — LOs cannot see them

---

## 9. LIFTOFF QUICK GUIDE

### Working the Queue
1. Go to **/liftoff**
2. Check stat cards — orange cards = urgent
3. Filter by request type or status
4. Click a borrower name to open the request detail
5. Assign a processor → move status → log activity

### Lock Request Checklist
- SLA: 1 hour (within 10 AM–7 PM ET window)
- `lock_desk_agent` works the queue
- `lock_desk_admin` approves the request
- Check SLA countdown — red = already breached

### Starting Now Referral
1. Open the LiftOff request detail
2. Find the Starting Now section
3. Enter borrower credit info and bureau scores
4. Submit to trigger the credit repair workflow

---

## 10. AUDIT LOG — HOW TO INVESTIGATE

**Common action types to search for:**

| Action | What it means |
|--------|--------------|
| `user.created` | New user account added |
| `user.role_changed` | Role was changed |
| `user.deactivated` | Account deactivated |
| `lead.created` | New lead came in |
| `lead.status_changed` | Lead status updated or reassigned |
| `settings.updated` | Settings page saved |
| `user.login` | Login event |

**To investigate an issue:**
1. Go to **/admin/audit**
2. Search by email address or action name
3. Click the Details column to see exactly what changed
4. Note the actor email and IP address

---

## 11. THE 7 ADMIN RULES

1. **Always deactivate — never delete** when someone leaves
2. **Check the Audit Log first** before escalating any issue
3. **Never run Dev Tools yourself** — ask the developer
4. **Publishing a goal sends an email to all LOs** — confirm numbers first
5. **Lock request SLA = 1 hour**, windowed 10 AM–7 PM ET
6. **Set lead alert emails in Settings** — keep them current
7. **Approving a review makes it live instantly** — read it before approving

---

## 12. ESCALATION CONTACTS

| Issue | Who to Contact |
|-------|---------------|
| System bug, data corruption | Developer |
| Dev Tools needed (backfill, revalidation) | Developer |
| Analytics not loading | Developer (check Google OAuth first) |
| New user needs admin access | Existing admin |
| LiftOff queue issue (SLA breach) | ops_manager / liftoff_admin |
| Certificate not generating | university_admin |

---

*HCMG Admin Training — Internal Reference Document*
