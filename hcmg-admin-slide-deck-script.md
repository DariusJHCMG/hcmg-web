# HCMG Admin Training — Slide Deck Script for ChatGPT

> **Instructions for ChatGPT:**  
> Please create a professional PowerPoint presentation from the slide outlines below.  
> - Brand colors: **Orange (#F97316)** as accent, **Dark Navy (#0F172A)** as backgrounds, **White (#FFFFFF)** as text on dark slides  
> - Font: Use a clean sans-serif — Montserrat or Inter preferred  
> - Each slide entry below shows: **SLIDE TITLE**, layout type, bullet content, and presenter notes  
> - Use icons/emojis where indicated  
> - Keep bullets short — max 7 words per bullet point  
> - Speaker notes go in the notes pane of each slide  
> - Total slides: approximately 85  

---

## SECTION 1 — TITLE & AGENDA

---

**SLIDE 1 — TITLE SLIDE**  
Layout: Full-bleed dark navy background, large centered text  
Content:
- Logo: HCMG (top left)
- Main title: **HCMG Admin Portal Training**
- Subtitle: Complete Administrator Guide
- Session date placeholder: [Date]

Notes: Opening slide — displayed while waiting for everyone to join.

---

**SLIDE 2 — WHO THIS IS FOR**  
Layout: Light background, two columns  
Content:
- Left column title: 👥 Audience
  - All 6 HCMG Administrators
  - Anyone with admin or developer role
- Right column title: 🎯 Goal
  - Confidently operate every admin feature
  - Nothing is a mystery
  - Know when to escalate

Notes: Set expectations — this covers everything end-to-end.

---

**SLIDE 3 — TODAY'S AGENDA**  
Layout: Dark navy, numbered list  
Content:
- **Session 1:** Foundation — Access & Team Management
- **Session 2:** Content — Leads, Reviews & Co-Branded
- **Session 3:** Operations — Goal Engine & LiftOff
- **Session 4:** University & System Governance

Notes: 4 sessions, 8 modules total. Rotate the screen driver each module.

---

**SLIDE 4 — GROUND RULES**  
Layout: Orange accent card layout  
Content:
- 🖥️ Live production system — observe carefully
- 🔄 Rotate screen driver each module
- ✋ Questions at end of each module
- 📖 Reference handout available after training

Notes: Stress that most demos are observe-only. Only safe changes (e.g., review approval, adding a license) will be done live.

---

---

## SECTION 2 — MODULE 1: ORIENTATION & ACCESS CONTROL

---

**SLIDE 5 — MODULE 1 HEADER**  
Layout: Full-bleed navy, large module number  
Content:
- Module 1
- **Admin Portal Orientation & Access Control**
- Foundation for everything that follows

Notes: First module. Assign a screen driver.

---

**SLIDE 6 — HOW LOGIN WORKS**  
Layout: 3-step horizontal flow  
Content:
- Step 1: Sign in with Google (Google logo icon)
- Step 2: System checks your role
- Step 3: Role = admin/developer → /admin portal
- Note below: Loan Officers → redirected to /portal

Notes: There is no username/password. Login is Google OAuth only. Role must be set by an existing admin.

---

**SLIDE 7 — THE THREE PORTAL ROLES**  
Layout: 3 cards side by side  
Content:
- 🟠 **Admin** — Full portal control (6 people today)
- 🔵 **Developer** — Admin + Dev Tools access
- 🟣 **Loan Officer** — Portal, LiftOff (if sub-role), Goals

Notes: Roles are set in the Users page. Cannot be self-assigned.

---

**SLIDE 8 — THE ADMIN SIDEBAR — 18 SECTIONS**  
Layout: Two columns of icons + labels  
Content:
- ⊞ Dashboard | 📊 Analytics
- 🎓 HCMG U | 🥧 Goal Engine
- 🚀 Lift Off | ✉ Leads
- 🤝 Agent Partners | ▦ Corporate Benefits
- ⭐ Reviews | 👥 Users
- ◈ Licenses | 🔗 My Funnels
- 🤝 Co-Branded | 📱 Mobile App
- ⚙ Settings | 📋 Audit Log
- 🛠 Dev Tools | 👤 My Profile

Notes: Walk through each one briefly on screen. This slide is a reference map.

---

**SLIDE 9 — LIFTOFF SUB-ROLES**  
Layout: Table  
Content:
| Sub-Role | Queue Access |
|----------|-------------|
| liftoff_admin | Full LiftOff control |
| liftoff_team | Process queue requests |
| lock_desk_admin | Approve lock requests |
| lock_desk_agent | Work lock desk queue |
| ops_manager | Assign & manage workflow |
| help_desk_agent | Help desk queue only |
| processor | Loan processing |

Notes: These are extra permissions on top of the main role. Set in Users → Edit → LiftOff Roles.

---

**SLIDE 10 — UNIVERSITY ROLES**  
Layout: 4-card grid  
Content:
- 🎓 **university_admin** — Create courses, manage all
- 📝 **trainer** — Author courses, view progress
- 👔 **manager** — View team progress, assign courses
- 📚 **learner** — Take courses, earn certificates (default)

Notes: Set per profile in Users → Edit → University Role dropdown.

---

**SLIDE 11 — ROW-LEVEL SECURITY**  
Layout: Split: LO view vs Admin view  
Content:
- Left (LO): Sees only their own leads, requests, goals
- Right (Admin): Sees everything across all LOs
- Bottom: Enforced at database level — cannot be bypassed

Notes: RLS is enforced by Supabase/PostgreSQL. Even if an LO gets a direct DB query, they still cannot see other LO data.

---

**SLIDE 12 — ESCALATION RULE**  
Layout: Orange callout box  
Content:
- ⚠️ Dev Tools = Developers Only
- If something needs a backfill or reset → ask the developer
- Use the Audit Log to investigate first
- Admins should never run Dev Tools

Notes: Hard rule — emphasize this clearly.

---

---

## SECTION 3 — MODULE 2: USER & TEAM MANAGEMENT

---

**SLIDE 13 — MODULE 2 HEADER**  
Layout: Full-bleed navy  
Content:
- Module 2
- **User & Team Management**
- Create · Edit · Deactivate · Invite · License

Notes: New module — swap screen driver.

---

**SLIDE 14 — THE USERS PAGE**  
Layout: Annotated screenshot description  
Content:
- Header stats: X accounts · X active · X loan officers · X admin/dev
- Two table sections: Loan Officers | Admin & Dev
- Columns: Member, Role, NMLS/Slug, Status, Last Seen, Website, Actions

Notes: Walk through the table on screen. Point out the color-coded Last Seen column.

---

**SLIDE 15 — CREATING A NEW USER**  
Layout: Form fields list (2 columns)  
Content:
- Required: Full Name, Role, Email, Password
- Optional: Phone, NMLS#, LO Slug, Job Title
- Also: Lead Notify Email, Offices, Short Bio

Notes: LO Slug is auto-generated from name. This drives the /go/[slug] funnel URL — critical to get right.

---

**SLIDE 16 — THE LO SLUG**  
Layout: Visual — name → slug → URL  
Content:
- John Smith → john-smith → hcmgloans.com/go/john-smith
- ⚠️ Once leads exist with this slug — be careful changing it
- Slug also used in: co-branded pages, leaderboard, LiftOff queue

Notes: The slug is the LO's unique identifier throughout the system. Consistency matters.

---

**SLIDE 17 — INVITE FLOW**  
Layout: 3-step flow  
Content:
- Step 1: Admin creates the account in Users
- Step 2: Admin clicks "Send Invite"
- Step 3: LO receives email → completes setup

Notes: Creating the account does NOT send the invite automatically. You must click Send Invite separately.

---

**SLIDE 18 — DEACTIVATE vs DELETE**  
Layout: Two-column comparison (green vs red)  
Content:
- 🟢 **Deactivate** (almost always right)
  - Cannot log in
  - All data preserved
  - Reversible
  - Use when someone leaves
- 🔴 **Delete** (permanent, rarely needed)
  - Removes: account, profile, funnel link, avatar
  - Cannot be undone
  - Requires typing "DELETE" to confirm
  - Only for accounts created in error

Notes: Deactivate is almost always the right choice. Protect historical data.

---

**SLIDE 19 — LIFTOFF & UNIVERSITY ROLES (IN EDIT DRAWER)**  
Layout: Screenshot description with callouts  
Content:
- Edit a user → expand the drawer
- LiftOff Roles = checkboxes (multiple allowed)
- University Role = single dropdown
- Save changes → logged in Audit Log

Notes: Show this live in the edit drawer.

---

**SLIDE 20 — STATE LICENSES**  
Layout: Map + list visual description  
Content:
- 🗺️ Left: US map — orange = Active, dark blue = Coming Soon, gray = Not Available
- 📋 Right: State list with 3-button toggle + license number input
- Bottom bar: Save & publish (goes live immediately) or Discard

Notes: This controls what states appear on the public licensing page. Not the same as the LO's personal NMLS# in their profile.

---

**SLIDE 21 — ALWAYS CHECK THE AUDIT LOG**  
Layout: Orange reminder card  
Content:
- After any change → go to /admin/audit
- Search by email or action name
- Columns: Time · User · Action · Details · IP
- Verify your change was recorded

Notes: Build this habit — everything is logged.

---

---

## SECTION 4 — MODULE 3: LEAD MANAGEMENT & ANALYTICS

---

**SLIDE 22 — MODULE 3 HEADER**  
Layout: Full-bleed navy  
Content:
- Module 3
- **Lead Management & Analytics**
- Find · Filter · Reassign · Report

Notes: New module — swap screen driver.

---

**SLIDE 23 — THE 5 LEAD SECTIONS**  
Layout: 5 color-coded cards  
Content:
- ⚡ **DSCR Leads** (Navy) — Investment loans, /dscr/[lo-slug]
- ⚠️ **Company Leads** (Amber) — No LO assigned — action required
- 📬 **Contact Form** (Orange) — /contact, general inquiries
- 💼 **Recruiting** (Blue) — /join and /careers
- ✅ **LO-Assigned** (White) — Already routed to an LO

Notes: The amber Company Leads section is the most important watchlist — these have no LO and need attention.

---

**SLIDE 24 — LEAD STATUS LIFECYCLE**  
Layout: Horizontal flow with color badges  
Content:
- 🔵 new → 🟡 contacted → 🟣 qualified → 🟢 closed
- Also: 🔴 lost (can happen from any stage)

Notes: As admin you can manually change a status. Most updates are done by the LO from their portal.

---

**SLIDE 25 — FINDING & REASSIGNING A LEAD**  
Layout: 3-step process  
Content:
- Step 1: Use search (name, email, phone) or filters (status, LO, section)
- Step 2: Click the lead to open detail
- Step 3: Change the Assigned LO field → save

Notes: Most common admin action on this page. Used when LO leaves, lead is misrouted, or borrower requests a change.

---

**SLIDE 26 — EXPORT CSV**  
Layout: Simple slide  
Content:
- Export CSV button on leads page
- Downloads current filtered view
- Use for reporting and data review

Notes: Point out the export button location.

---

**SLIDE 27 — AGENT & CORPORATE LEADS**  
Layout: Two cards  
Content:
- 🤝 **Agent Partner Leads** (/admin/agent-leads)
  - Real estate agents wanting to partner
  - Grouped by realtor
- 🏢 **Corporate Leads** (/admin/corporate-leads)
  - Employer/HR/benefits inquiries
  - Home buying benefit programs

Notes: These are different from co-branded leads — agents and employers asking to partner with HCMG.

---

**SLIDE 28 — ANALYTICS DASHBOARD**  
Layout: 3-section overview  
Content:
- 📈 GA4 Funnel Steps — how users move through /get-started
- 📍 Lead Source Attribution — which channels drive leads
- 🔍 Search Console Data — top search queries

Notes: Read-only proxy of Google data. If it's broken, check Settings → Google OAuth.

---

**SLIDE 29 — FUNNEL LINKS**  
Layout: Flow diagram description  
Content:
- LO gets slug: john-smith
- Link: hcmgloans.com/go/john-smith
- Lead clicks → auto-assigned to John
- Admin can: create, view clicks, activate/deactivate

Notes: If funnel page shows a warning about missing slug, fix the slug in Users first, then run backfill in Dev Tools (developer only).

---

---

## SECTION 5 — MODULE 4: REVIEWS, CO-BRANDED & FUNNELS

---

**SLIDE 30 — MODULE 4 HEADER**  
Layout: Full-bleed navy  
Content:
- Module 4
- **Reviews, Co-Branded Pages & Funnels**
- Moderate · Create · Track

Notes: New module — swap screen driver.

---

**SLIDE 31 — REVIEW MODERATION**  
Layout: Table + flow  
Content:
- 4 filter tabs: Pending | Approved | Rejected | All
- Pending reviews are NEVER public
- Approve → goes live immediately
- Reject → hidden permanently
- Delete → permanent, requires confirmation

Notes: Read the review content before approving — approving is instant and public.

---

**SLIDE 32 — REVIEW STATUS BADGES**  
Layout: 3 badge examples (colored boxes)  
Content:
- 🟡 **pending** — waiting for moderation
- 🟢 **approved** — live on public profile
- 🔴 **rejected** — hidden, not published

Notes: Color-coded in the table for quick scanning.

---

**SLIDE 33 — CO-BRANDED PAGES**  
Layout: Visual URL breakdown  
Content:
- URL: hcmgloans.com/co-branded/[lo-slug]/[realtor-slug]
- Shows: LO branding + Realtor branding together
- Realtor shares with their buyers
- Tracks: clicks, app clicks, call bookings, completed bookings

Notes: Admin needs an LO slug on their own profile to manage co-branded pages. Check Users if this page shows a warning.

---

**SLIDE 34 — CO-BRANDED STATS**  
Layout: 4 metric cards  
Content:
- 👁️ **Clicks** — Total page views
- 📋 **App Clicks** — Taps on mortgage application CTA
- 📞 **Book Call Clicks** — Taps to book a call
- ✅ **Bookings Completed** — Actual completed bookings

Notes: These stats update in real time as buyers interact with the co-branded page.

---

---

## SECTION 6 — MODULE 5: GOAL ENGINE ADMINISTRATION

---

**SLIDE 35 — MODULE 5 HEADER**  
Layout: Full-bleed navy  
Content:
- Module 5
- **Goal Engine Administration**
- Goals · Commitments · Leaderboard · Awards · Coaching

Notes: New module — swap screen driver.

---

**SLIDE 36 — WHAT IS THE GOAL ENGINE?**  
Layout: Overview with icons  
Content:
- 📅 Monthly production goal setting
- ✍️ LOs commit to their targets
- 📊 Arive syncs actual production (every 15 min)
- 🏆 End of month: awards + certificates
- 📝 Manager coaching notes

Notes: The Goal Engine is how we hold the team accountable and celebrate wins.

---

**SLIDE 37 — GOAL MONTH LIFECYCLE**  
Layout: 4-step horizontal flow  
Content:
- 📝 **draft** → admin building it, LOs can't see
- 📅 **scheduled** → visible but not collecting commitments yet
- 🟢 **published** → LOs can commit (⚠️ email sent to all LOs automatically)
- 🔒 **closed** → month over, awards can run

Notes: THE most important point — publishing sends an email to every active LO. Confirm numbers before publishing.

---

**SLIDE 38 — SETTING GOAL TARGETS**  
Layout: 4 metric cards  
Content:
- 💰 **Funded Volume Goal** — total funded loan $ target
- 🏠 **Funded Units Goal** — number of funded loans
- 📋 **App Volume Goal** — total application $ target
- 📝 **App Units Goal** — number of applications

Notes: These are company-wide targets. Individual LOs set their own commitments against these.

---

**SLIDE 39 — LO COMMITMENTS**  
Layout: Table example  
Content:
- Each LO submits: volume pledge + unit pledge + confidence %
- Low confidence % = coaching opportunity
- Admin can lock commitments (prevents editing)

Notes: Confidence percentage is a self-assessment. A 40% confidence on a big number is a red flag.

---

**SLIDE 40 — ARIVE PRODUCTION SYNC**  
Layout: Flow diagram  
Content:
- Arive LOS → Zapier webhook → HCMG system (every 15 min, automatic)
- No manual trigger needed
- If data looks stale → check with developer

Notes: The Zapier endpoint URL is shown on the Goal Engine admin page. That's the target where Arive pushes.

---

**SLIDE 41 — THE LEADERBOARD**  
Layout: Podium visual  
Content:
- Rankings by: funded volume (primary), funded units (secondary)
- Updates every 15 min with Arive sync
- Visible to all LOs from their portal

Notes: Live and transparent — all LOs see it.

---

**SLIDE 42 — RUNNING AWARDS**  
Layout: Trophy visual + process steps  
Content:
- When: Month is closed → awards become available
- Auto-runs: 1st of month, 2 AM ET (or manually from admin)
- Award types: TopGun, Most Improved, and others
- After running: certificates generated + award emails sent

Notes: Certificates are tied to the LO's profile and appear in their University section.

---

**SLIDE 43 — COACHING NOTES**  
Layout: 4 note type cards  
Content:
- 💬 **general** — check-ins, general observations
- 📊 **performance** — production numbers discussion
- 🌟 **encouragement** — positive reinforcement
- ⚡ **action_required** — LO must do something specific

Notes: Coaching notes are private — LOs cannot see them. Only managers and admins.

---

---

## SECTION 7 — MODULE 6: LIFTOFF LOAN OPERATIONS

---

**SLIDE 44 — MODULE 6 HEADER**  
Layout: Full-bleed navy  
Content:
- Module 6
- **LiftOff Loan Operations Queue**
- Queue · SLA · Workflow · Sub-Roles

Notes: New module — swap screen driver.

---

**SLIDE 45 — WHAT IS LIFTOFF?**  
Layout: Simple overview  
Content:
- Internal loan operations system
- LOs submit loans/requests here
- Ops team processes in the queue
- Admins have full visibility and control

Notes: This is our internal back-office — the interface between LOs and the ops team.

---

**SLIDE 46 — THE QUEUE — 5 STAT CARDS**  
Layout: 5 cards  
Content:
- All Requests (total)
- 🟡 Pending (orange if > 0)
- 🔵 In Review
- 🟠 Action Needed (orange if > 0)
- 🟢 Completed

Notes: Orange cards = items needing attention. Check this at the start of every day.

---

**SLIDE 47 — REQUEST TYPES & SLAS**  
Layout: Table  
Content:
| Request Type | SLA |
|-------------|-----|
| Register + Disclosure | 1 business hour |
| Disclosure Only | 1 business hour |
| Loan Help Desk | 4 business hours |
| Submission | 48 business hours |

Notes: Lock requests have the tightest SLA — 1 hour. These are the most urgent items in the queue.

---

**SLIDE 48 — SLA SCHEDULE RULES**  
Layout: Two-column comparison  
Content:
- **Lock Requests:** Windowed — Mon–Sat, 10 AM–7 PM ET only. Hours outside window don't count.
- **All Other Types:** Flat — Mon–Sat, all day. Sundays skipped.
- 🔴 Breached SLA = red row + ⚠️ indicator

Notes: Sunday is never counted for any request type. A lock request submitted at 9 AM doesn't start counting until 10 AM.

---

**SLIDE 49 — REQUEST STATUS LIFECYCLE**  
Layout: Horizontal flow  
Content:
- new → pending → in_review → completed
- Also: action_needed (can come from in_review) → back to in_review
- Also: cancelled (from any stage)

Notes: Action needed means the LO or processor needs to provide something before work can continue.

---

**SLIDE 50 — PRIORITY SCORES**  
Layout: Ranked list with scores  
Content:
- 🥇 Lock Request: 100 (+ 40 if breached, + 20 if warning)
- 🥈 Register + Disclosure: 80
- 🥉 Disclosure Only: 70
- Loan Help Desk: 65
- Submission: 50
- 🔴 HIGH badge = score ≥ 80

Notes: Priority score drives the RED HIGH badge on the borrower name. The higher the score, the more urgent.

---

**SLIDE 51 — PROCESSING A REQUEST**  
Layout: Checklist  
Content:
- Open borrower → request detail page
- Review borrower info and loan details
- Assign a processor (assigned_processor field)
- Move status through workflow
- Activity log at bottom tracks every action

Notes: Show on screen by clicking into a real request. Observe only — do not change status.

---

**SLIDE 52 — LIFTOFF SUB-ROLE MATRIX**  
Layout: Table  
Content:
| Sub-Role | Handles |
|----------|---------|
| liftoff_admin | Full control |
| liftoff_team | Process queue |
| lock_desk_admin | Approve locks |
| lock_desk_agent | Work lock queue |
| ops_manager | Assign & oversee |
| help_desk_agent | Help desk only |
| processor | Loan processing |

Notes: Set in Users → Edit → LiftOff Roles checkboxes. Multiple roles can be assigned.

---

**SLIDE 53 — STARTING NOW REFERRALS**  
Layout: Simple process  
Content:
- Credit repair referral from a LiftOff request
- Create directly on the request detail page
- Captures: borrower name, credit status, 3 bureau scores
- Triggers the credit repair workflow

Notes: Use this when a borrower's scores aren't ready yet and they need credit work before qualifying.

---

---

## SECTION 8 — MODULE 7: HCMG UNIVERSITY ADMIN

---

**SLIDE 54 — MODULE 7 HEADER**  
Layout: Full-bleed navy  
Content:
- Module 7
- **HCMG University Administration**
- Courses · Enrollments · Progress · Certificates

Notes: New module — swap screen driver.

---

**SLIDE 55 — WHAT IS HCMG UNIVERSITY?**  
Layout: 4-icon overview  
Content:
- 📚 Internal training platform
- 🎬 Video, text, audio, presentation lessons
- 📝 Quizzes and assessments
- 🏅 Certificates for completions

Notes: Every LO and admin has a learner account. Admins also manage the content.

---

**SLIDE 56 — COURSE LIFECYCLE**  
Layout: 4-step flow  
Content:
- 📝 **draft** → being built
- 🔍 **in_review** → ready for review
- ✅ **approved** → reviewed, not yet published
- 🟢 **published** → learners can see and enroll

Notes: Similar to goal month lifecycle — nothing is visible until published.

---

**SLIDE 57 — COURSE CATEGORIES**  
Layout: 6 cards  
Content:
- 🌐 **general** — All-team content
- 🚀 **start** — New hire onboarding
- 💰 **sales** — Sales techniques
- 🏠 **product** — Mortgage product knowledge
- ⚙️ **operations** — Ops processes
- ⚖️ **compliance** — Regulatory requirements

Notes: Categories help learners find relevant content and allow managers to filter team assignments.

---

**SLIDE 58 — LESSON TYPES**  
Layout: Table  
Content:
| Type | Description |
|------|-------------|
| video | Video + watch % tracking |
| text | Written content |
| audio | Audio lesson |
| presentation | Slide deck |
| resource | Downloadable file |
| knowledge_check | Inline quiz |
| assignment | Task to complete |

Notes: Video lessons track watch_pct — the LO must reach a minimum watch percentage to get credit.

---

**SLIDE 59 — ENROLLING LEARNERS**  
Layout: 3 key points  
Content:
- Individual: assign one course to one person
- Bulk: assign to multiple at once
- Set a due date (required for mandatory courses)
- Enrollment type: mandatory or optional

Notes: Due dates drive reminder notifications to learners.

---

**SLIDE 60 — TRACKING PROGRESS**  
Layout: Progress view description  
Content:
- Per learner: lessons complete, video watch %, overall completion
- Quiz scores: attempts, score %, passed/failed
- Filter by course or by learner

Notes: Managers can only see their team. university_admin sees everyone.

---

**SLIDE 61 — ASSESSMENTS**  
Layout: 4 cards  
Content:
- 💡 **knowledge_check** — Quick check, not formally graded
- 📝 **quiz** — Graded, has passing threshold
- 🎓 **final_assessment** — End-of-course exam
- 🏅 **certification_exam** — Required for certificate

Notes: Each has a passing_pct (e.g., 80%) and max_attempts. After max attempts, the learner is locked out.

---

**SLIDE 62 — CERTIFICATES**  
Layout: 3 certificate types + fields  
Content:
- 📄 **course** — Completed a single course
- 🛤️ **path** — Completed a learning path
- 🎓 **program** — Completed a full program
- Fields: issued_at, expires_at, verification_id

Notes: Compliance courses should have an expires_at. Verification ID allows external verification of the certificate.

---

**SLIDE 63 — UNIVERSITY AUDIT LOG**  
Layout: Simple callout  
Content:
- Separate from the main admin audit log
- Every university admin action recorded
- Required for compliance traceability

Notes: Keep this in mind for compliance reviews — all certificate issuances, revocations, and enrollment changes are logged.

---

---

## SECTION 9 — MODULE 8: SETTINGS, AUDIT LOG & DEV TOOLS

---

**SLIDE 64 — MODULE 8 HEADER**  
Layout: Full-bleed navy  
Content:
- Module 8
- **System Settings, Audit Log & Dev Tools**
- Configure · Investigate · Govern

Notes: Final module — swap screen driver.

---

**SLIDE 65 — COMPANY SETTINGS OVERVIEW**  
Layout: 3 sections  
Content:
- 📧 Lead alert emails (5 types)
- 📊 Google Analytics integration
- 🔍 Google Search Console integration

Notes: Settings page URL: /admin/settings

---

**SLIDE 66 — LEAD ALERT EMAILS**  
Layout: 5 color-coded rows  
Content:
- 🟡 Funnel Lead — /get-started, /team, /seo pages
- 🟢 Agent Lead — /agents (realtor partnerships)
- 🟣 Corporate Lead — /company-partners (employer/HR)
- 🟠 Contact Form — /contact (general inquiry)
- 🔵 Recruiting — /join and /careers

Notes: Each is separate. Leave blank to disable alerts for that type. Multiple admins can each have a different alert email.

---

**SLIDE 67 — GOOGLE ANALYTICS SETUP**  
Layout: 3 fields with hints  
Content:
- **GA4 Measurement ID** — G-XXXXXXXXXX format (from Data Streams)
- **GA4 Property ID** — numeric (from Property Settings)
- **Google OAuth** — Connect/Reconnect Google account for Analytics access

Notes: If analytics stop showing in the portal, check if the Google OAuth token has expired and reconnect.

---

**SLIDE 68 — GOOGLE SEARCH CONSOLE**  
Layout: One field + warning  
Content:
- **GSC Property URL** — must exactly match verified property
- Include https:// — no trailing slash
- Example: https://hcmgloans.com

Notes: This feeds the Search Console data into the Analytics dashboard in the admin portal.

---

**SLIDE 69 — THE AUDIT LOG**  
Layout: Table screenshot description  
Content:
- Every admin action — last 200 entries
- Columns: Time · User · Action · Details · IP
- Search by email or action name
- Common actions: user.created, lead.status_changed, settings.updated

Notes: The first tool to reach for when investigating an issue.

---

**SLIDE 70 — INVESTIGATION SCENARIO**  
Layout: Story format  
Content:
- Problem: "A lead was accidentally reassigned — who did it?"
- Step 1: Go to /admin/audit
- Step 2: Search for the LO email or lead ID
- Step 3: Find the lead.reassigned entry
- Step 4: See actor email, timestamp, IP address

Notes: Walk through this live by searching for a recent action.

---

**SLIDE 71 — DEV TOOLS — KNOW THE RULE**  
Layout: Red warning card  
Content:
- 🛑 **Admins do NOT run Dev Tools**
- Dev Tools available to: developer role only
- What they do: Backfill data, DB health, cache revalidation, test emails
- If you think you need them: ask the developer
- All runs are logged in the Audit Log

Notes: This is a governance boundary. Enforce it consistently.

---

---

## SECTION 10 — CLOSING

---

**SLIDE 72 — THE 7 ADMIN RULES**  
Layout: Orange numbered list  
Content:
1. Always deactivate — never delete
2. Check Audit Log before escalating
3. Never run Dev Tools yourself
4. Publishing a goal sends emails to all LOs
5. Lock SLA = 1 hour (10 AM–7 PM ET window)
6. Set lead alert emails in Settings
7. Approving a review makes it live instantly

Notes: Leave this slide up during Q&A as a summary.

---

**SLIDE 73 — QUICK REFERENCE — URL CHEAT SHEET**  
Layout: Two-column list  
Content:
- /admin — Dashboard
- /admin/leads — Leads
- /admin/users — Team management
- /admin/licenses — State licenses
- /admin/reviews — Review moderation
- /admin/co-branded — Co-branded pages
- /admin/analytics — Analytics
- /admin/settings — Company settings
- /admin/audit — Audit log
- /liftoff — LiftOff queue
- /goal-engine/admin — Goal Engine
- /university/admin — HCMG University

Notes: This is replicated in the handout.

---

**SLIDE 74 — WHO DOES WHAT**  
Layout: Role responsibility matrix  
Content:
| Task | Who |
|------|-----|
| Create / deactivate users | Admin |
| Update company settings | Admin |
| Moderate reviews | Admin |
| Run Dev Tools | Developer only |
| Process LiftOff queue | Ops sub-roles |
| Author courses | Trainer / Uni Admin |
| Issue certificates | University Admin |
| Run awards | Admin |

Notes: Quick reference for responsibility clarity.

---

**SLIDE 75 — QUESTIONS**  
Layout: Full-bleed orange, centered  
Content:
- **Questions?**
- Refer to your Handout for quick reference
- Audit Log is your first resource for issues
- Contact the developer for Dev Tools requests

Notes: Open Q&A. Keep the 7 rules slide visible if possible.

---

**SLIDE 76 — THANK YOU**  
Layout: Dark navy, centered  
Content:
- HCMG logo
- **Thank you**
- You now have full command of the HCMG Admin Portal
- Handout available: HCMG Admin Quick Reference

Notes: Closing slide. Distribute the handout.

---

> **Note to ChatGPT:** Please use consistent slide formatting throughout. Apply the orange (#F97316) and dark navy (#0F172A) brand palette. Use icons where indicated. Keep bullet text short. Put the full speaker notes in the PowerPoint notes pane. Total slide count should be approximately 76 slides.
