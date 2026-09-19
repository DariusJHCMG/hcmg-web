-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG University — Seed Courses
-- 3 courses, fully detailed with lessons:
--   1. Welcome to HCMG U                (team intro,    5 lessons)
--   2. How to Create Courses            (admin,         4 lessons)
--   3. How to Assign & Manage Training  (admin,         4 lessons)
-- Safe to re-run: uses ON CONFLICT DO UPDATE
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  c1_id UUID;
  c2_id UUID;
  c3_id UUID;
BEGIN

-- ────────────────────────────────────────────────────────────────────────────
-- COURSE 1: Welcome to HCMG U
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.uni_courses (
  slug, title, description, category, path_tag, pill_color,
  duration_label, is_required, is_published, sort_order
)
VALUES (
  'welcome-to-hcmg-u',
  'Welcome to HCMG U',
  'Your orientation to HCMG University — learn what it is, how it works, how to navigate the platform, and what training is available to you as an HCMG team member.',
  'general',
  'fast_start',
  'orange',
  '5 lessons · 28 min',
  TRUE,
  TRUE,
  0
)
ON CONFLICT (slug) DO UPDATE SET
  title          = EXCLUDED.title,
  description    = EXCLUDED.description,
  duration_label = EXCLUDED.duration_label,
  is_required    = EXCLUDED.is_required,
  is_published   = EXCLUDED.is_published,
  updated_at     = NOW()
RETURNING id INTO c1_id;

IF c1_id IS NULL THEN
  SELECT id INTO c1_id FROM public.uni_courses WHERE slug = 'welcome-to-hcmg-u';
END IF;

-- Delete existing lessons for clean re-seed
DELETE FROM public.uni_lessons WHERE course_id = c1_id;

INSERT INTO public.uni_lessons (course_id, title, description, duration_label, duration_secs, sort_order, is_published, transcript) VALUES

(c1_id,
 'What is HCMG U?',
 'A quick overview of the platform — why it exists, what you will learn here, and how it fits into the HCMG success system.',
 '4:30', 270, 0, TRUE,
 'Welcome to HCMG University — or as we call it, HCMG U.

HCMG U is your internal training platform, built exclusively for active HCMG team members. This is where you will find all the training you need to grow as a loan officer and a professional inside the Harris Capital Mortgage Group system.

Here is what HCMG U is NOT: it is not a generic mortgage training site. It is not a compliance-only portal. And it is definitely not something you complete once and forget about.

HCMG U is a living training environment built around the official HCMG success system — the same system Lamont Harris Jr. has used to build one of the fastest-growing mortgage teams in the country.

Everything here is short, practical, and field-ready. You will not find hour-long lectures. You will find focused video lessons you can apply the same day.

Here is how HCMG U is organized:
- Harry''s Playbook is our signature curriculum — the HCMG Standard broken into modules.
- New LO Fast Start is the path for anyone in their first 90 days.
- The Training Library covers sales, products, systems, and compliance.

Your progress is tracked automatically. You can stop a lesson and pick up exactly where you left off. Completion certificates are issued when you finish a full course.

This is your edge. Use it.'
),

(c1_id,
 'Navigating the Platform',
 'A visual walkthrough of the HCMG U interface — the dashboard, sidebar, library, search, and your personal progress view.',
 '5:15', 315, 1, TRUE,
 'Let me walk you through HCMG U so you know exactly where everything lives.

When you log in, you land on your Dashboard. This is your home base. At the top you will see the hero section with a Continue Watching card if you have a lesson in progress. Below that is your stats bar — lessons completed, time invested, and active courses.

The sidebar on the left is your main navigation. Here is what each section does:

DASHBOARD — your personal home, continue-watching, and progress summary.

HARRY''S PLAYBOOK — the signature HCMG curriculum. These are the must-watch lessons tied directly to how we operate and win at HCMG.

FAST START — if you are new to HCMG, start here. This seven-lesson path gets you up and running in your first 30 days.

LIBRARY — every published lesson in the system, searchable and filterable by category. Use the filter tabs at the top to narrow by Sales, Products, Operations, or Compliance.

CERTIFICATES — every certificate you have earned in one place.

At the bottom of the sidebar you will find two links: Back to Portal returns you to the main HCMG team portal, and Sign out logs you out completely.

Your progress is saved automatically. If you are halfway through a lesson and close the browser, you will see it in your Continue Watching card when you come back.

That is the full tour. Simple, clean, and focused on your development.'
),

(c1_id,
 'Your First Assignment: Fast Start',
 'How required training works, what happens when you are assigned a course, and how to begin your New LO Fast Start path.',
 '4:00', 240, 2, TRUE,
 'When you join HCMG, you are automatically enrolled in required training. That means some courses will appear with a red Required badge — those are not optional.

Here is exactly what to expect.

Your manager or a training admin assigns a course to you. You will see it on your dashboard under your active courses. If it has a due date, that will show on the course card.

To begin, simply click the course card or the Continue button. You will be taken into the course overview, which lists every lesson and shows your progress on each one.

Your progress is tracked per lesson. A lesson is marked complete once you have watched at least 90 percent of the video. You cannot fake it — the system tracks actual watch time.

Once every lesson in a course is complete, the course shows as finished on your dashboard. If the course has a completion certificate, it will be issued automatically and appear under your Certificates tab.

The most important path for new loan officers is the New LO Fast Start. It is seven lessons. It covers your first 30 days, how to use ARIVE, how to structure your first call, how the HCMG system works, and how to hit the ground running.

Start there. Do it in order. Take notes. Your future self will thank you.

If you ever have a question about an assignment, reach out to your manager or contact info@hcmgloans.com.'
),

(c1_id,
 'Knowledge Checks and Certificates',
 'How quizzes work in HCMG U, what passing looks like, and how to download and share your completion certificates.',
 '3:45', 225, 3, TRUE,
 'Some lessons in HCMG U include a knowledge check at the end. This is a short quiz — usually three to five questions — designed to confirm that you understood the key points of the lesson.

Here is how it works.

After the video ends, you will see the quiz section appear below the player. Read each question carefully and select your answer. Once you have answered every question, the Submit button becomes active.

When you submit, the system scores your answers immediately on the server. You will see your score, which answers were correct, which were wrong, and a brief explanation for each question.

To pass, you need to score 80 percent or higher. If you do not pass, you can retake the quiz immediately. There is no penalty for retaking — this is about learning, not gatekeeping.

Completion certificates are issued at the course level, not the lesson level. Once every lesson in a course is complete AND any required quizzes are passed, your certificate is generated automatically.

To find your certificates, click Certificates in the left sidebar. You will see every certificate you have earned with the course name, completion date, and a way to download or print it.

Certificates are a real record of your professional development inside HCMG. Some required training certificates may be referenced during performance reviews or compliance audits.

Take the quizzes seriously. They are short. They are fair. And they prove you know your stuff.'
),

(c1_id,
 'The HCMG Success Formula',
 'An introduction to the four pillars of the HCMG Success OS — Mindset, Activity, Skill, and Accountability — and how HCMG U trains each one.',
 '6:00', 360, 4, TRUE,
 'Everything at HCMG runs on four pillars. You will see them everywhere in this platform. They are the foundation of Harry''s Playbook and the core of how we train.

Mindset. Activity. Skill. Accountability.

Let me break each one down.

MINDSET is the foundation. Without the right mindset, skills do not stick and activity does not compound. The mindset training in HCMG U will show you how Lamont Harris Jr. thinks about the business, about borrowers, and about building a team. It is not motivational fluff — it is operational thinking that produces results.

ACTIVITY is the engine. Mindset without activity is just positive thinking. Activity training covers how many conversations to have, how to manage your pipeline, how to follow up, and how to stay consistent even when the market is hard. Volume creates opportunity. HCMG U teaches you how to build the right habits.

SKILL is the differentiator. Activity gets you in the room. Skill closes the deal. The skill training in HCMG U covers how to structure a call, how to turn a rate shopper into a committed borrower, how to explain products with confidence, and how to guide a borrower from application to closing without losing them.

ACCOUNTABILITY is the multiplier. Every module in HCMG U is designed to be discussed with your manager. Use the language from these lessons in your coaching sessions. Commit to specific numbers. Track your progress against those commitments.

Mindset plus Activity plus Skill plus Accountability equals Success. That is not a tagline. That is the formula.

Welcome to HCMG U. Let''s get to work.');


-- ────────────────────────────────────────────────────────────────────────────
-- COURSE 2: How to Create Courses (Admin)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.uni_courses (
  slug, title, description, category, path_tag, pill_color,
  duration_label, is_required, is_published, sort_order
)
VALUES (
  'admin-how-to-create-courses',
  'Admin Guide: Creating and Managing Courses',
  'A step-by-step guide for HCMG U administrators and trainers on how to build a course, add lessons with video, set categories and learning paths, and publish training to the team.',
  'operations',
  NULL,
  'blue',
  '4 lessons · 22 min',
  FALSE,
  TRUE,
  10
)
ON CONFLICT (slug) DO UPDATE SET
  title          = EXCLUDED.title,
  description    = EXCLUDED.description,
  duration_label = EXCLUDED.duration_label,
  is_published   = EXCLUDED.is_published,
  updated_at     = NOW()
RETURNING id INTO c2_id;

IF c2_id IS NULL THEN
  SELECT id INTO c2_id FROM public.uni_courses WHERE slug = 'admin-how-to-create-courses';
END IF;

DELETE FROM public.uni_lessons WHERE course_id = c2_id;

INSERT INTO public.uni_lessons (course_id, title, description, duration_label, duration_secs, sort_order, is_published, transcript) VALUES

(c2_id,
 'Course Builder Overview',
 'A tour of the Course Builder — tabs, fields, status controls, and how the editor is structured.',
 '5:30', 330, 0, TRUE,
 'Welcome to the HCMG U Course Builder. This is where all training content is created and managed by administrators and trainers.

To access the course builder, navigate to the Admin section in your sidebar — you will only see this if your account has the university_admin or trainer role. Then click Courses.

The Courses list shows every course in the system — published and draft — with the category, required status, and an Edit button for each one.

To create a new course, click the New Course button in the top right corner.

The Course Builder has three tabs across the top:

DETAILS — this is where you set everything about the course itself. Title, slug, description, thumbnail, duration label, category, learning path, badge color, and the published and required toggles.

LESSONS — this is where you add and manage the individual video lessons inside the course. You can add, edit, delete, and drag to reorder lessons all from this tab without leaving the page.

SETTINGS — this has the published and required toggles again for quick access, plus the danger zone option to archive a course if needed.

The Save button is always visible in the top right of the tab bar. When you click it, changes are saved immediately via the API and you will see a green checkmark confirmation. There is no page reload.

One important rule: you must save the course in the Details tab before you can add lessons. A new unsaved course does not have an ID yet, so the Lessons tab will prompt you to save first.

Let''s walk through creating a course from start to finish.'
),

(c2_id,
 'Setting Up Course Details',
 'How to fill in title, slug, description, thumbnail, category, learning path, and badge color correctly.',
 '5:00', 300, 1, TRUE,
 'Let''s walk through the Details tab field by field.

COURSE TITLE — this is what learners see on the course card and at the top of the course page. Make it clear and specific. Good example: "Harry''s Playbook: The HCMG Standard." Avoid vague titles like "Module 3."

URL SLUG — this is the unique URL identifier for the course. It is auto-generated from the title as you type — so if you type "How to Structure the First Call," the slug becomes "how-to-structure-the-first-call." You can override it manually. The slug must be unique across all courses. If you try to save a duplicate slug, you will get a 409 error. Use hyphens, lowercase only.

DESCRIPTION — two to three sentences explaining what the learner will gain. This shows on the course overview page. Be specific about outcomes, not just topics.

THUMBNAIL URL — paste a direct image URL here. As soon as you paste a valid URL, a preview appears below the field so you can confirm it looks right before saving. Recommended size: 1200 by 675 pixels, 16:9 ratio.

DURATION LABEL — this is a display-only text field. Format it consistently: "7 modules · 1.4 hours" or "4 lessons · 22 min." This shows on the course card.

CATEGORY — select the category that best describes the content. This controls which filter tab the course appears under in the library.

LEARNING PATH — if this course belongs to a named path (Harry''s Playbook, Fast Start, etc.), select it here. This controls which sidebar link surfaces the course.

BADGE COLOR — this is the colored pill that appears on the course card. Pick the color that matches the category convention: orange for Fast Start, blue for Operations, gold for Products, green for Sales, red for Compliance.

REQUIRED — toggle this on if the course must be completed by all assigned team members. Required courses show a red badge and appear at the top of learner dashboards.

Hit Save. You are ready to add lessons.'
),

(c2_id,
 'Adding and Managing Lessons',
 'How to add lessons, fill in video URLs, transcripts, and resources, set sort order, and drag to reorder the lesson list.',
 '6:30', 390, 2, TRUE,
 'Once your course is saved, click the Lessons tab. This is where all the actual content lives.

To add a lesson, click the Add Lesson button. A panel slides up with the following fields:

LESSON TITLE — what learners see in the course lesson list and at the top of the lesson player page. Keep it descriptive and active: "Structuring the First Call," not "Lesson 4."

SHORT DESCRIPTION — one sentence shown on the course overview page below the lesson title. Optional but recommended.

VIDEO URL / HEYGEN TOKEN — paste the full HeyGen share URL here (e.g. https://share.heygen.com/...) or a Supabase storage path for a hosted video. This value is stored securely on the server and is never exposed to learners directly. When a learner clicks play, the server exchanges this token for a short-lived URL and returns it to the player. That is why you can use real share links safely.

DURATION LABEL — the display duration shown on the lesson row: "12:18" format.

SORT ORDER — the numeric position of this lesson in the course. Lessons are sorted by this number. The easiest way to manage order is to use the drag handle on the lesson list — dragging automatically updates the sort order for you.

TRANSCRIPT — paste the full lesson transcript here. This shows in a collapsible section below the video player for learners who prefer to read. It also improves searchability.

PUBLISHED TOGGLE — lessons default to Draft. Toggle this to Published only when the lesson is ready for learners to see. A course can be published while some of its lessons are still in draft — only published lessons are visible to learners.

Click Add Lesson to save it. The lesson appears in the list immediately.

To reorder lessons, grab the drag handle on the left side of any lesson row and drag it to the new position. Sort order updates are saved automatically in the background.

To edit an existing lesson, click the Edit button on the right side of the lesson row. The same panel slides up with all the current values populated.

To delete a lesson, open it for editing and click Delete Lesson at the bottom. You will be asked to confirm before the deletion happens. Deleting a lesson also removes all learner progress records for that lesson.'
),

(c2_id,
 'Publishing and Reviewing Your Course',
 'How to preview the course as a learner, use the published toggle, and what to check before going live.',
 '5:00', 300, 3, TRUE,
 'Before you publish a course to the full team, there are a few things to check.

PREVIEW — the Preview button in the top right of the editor opens the learner-facing course page in a new tab. Use this to see exactly what learners will see: the course hero, the lesson list, the progress ring, and the CTA buttons. Preview works even when the course is in Draft mode, so you can review it before anyone else sees it.

LESSON COMPLETENESS — go to the Lessons tab and confirm that every lesson you want live has the Published toggle turned on. A course can have some lessons published and some in draft. Only published lessons count toward course completion.

VIDEO CHECK — make sure every published lesson has a video URL in the Video URL field. The player will show a placeholder if the field is empty, but learners expect video. If you are still waiting on a HeyGen recording, leave the lesson in Draft.

DURATION LABEL — double-check that the course-level duration label in the Details tab is accurate. Learners use this to decide whether to start a course now or later.

REQUIRED FLAG — if this course needs to be completed by all assigned team members, make sure the Required toggle is on in Settings. Required courses show a red badge and are surfaced prominently in learner dashboards.

PUBLISH — when everything looks right, go to the Details tab and toggle the Published switch to on. Save. The course immediately appears in the library and on learner dashboards for anyone enrolled.

If you need to take a course offline quickly, toggle Published to off and save. It disappears from all learner views immediately but all progress records are preserved.

To archive a course permanently, use the Archive option in the Settings tab danger zone. Archiving sets it to unpublished and removes it from the course list — but again, all progress data is preserved.'
);


-- ────────────────────────────────────────────────────────────────────────────
-- COURSE 3: How to Assign and Manage Training (Admin)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO public.uni_courses (
  slug, title, description, category, path_tag, pill_color,
  duration_label, is_required, is_published, sort_order
)
VALUES (
  'admin-how-to-assign-training',
  'Admin Guide: Assigning and Managing Team Training',
  'How to assign courses to individual team members, groups, or the whole company — and how to use the Reports and Users pages to monitor progress, handle access issues, and stay on top of required training compliance.',
  'operations',
  NULL,
  'blue',
  '4 lessons · 24 min',
  FALSE,
  TRUE,
  11
)
ON CONFLICT (slug) DO UPDATE SET
  title          = EXCLUDED.title,
  description    = EXCLUDED.description,
  duration_label = EXCLUDED.duration_label,
  is_published   = EXCLUDED.is_published,
  updated_at     = NOW()
RETURNING id INTO c3_id;

IF c3_id IS NULL THEN
  SELECT id INTO c3_id FROM public.uni_courses WHERE slug = 'admin-how-to-assign-training';
END IF;

DELETE FROM public.uni_lessons WHERE course_id = c3_id;

INSERT INTO public.uni_lessons (course_id, title, description, duration_label, duration_secs, sort_order, is_published, transcript) VALUES

(c3_id,
 'How Assignments Work',
 'The difference between self-enrollment and admin assignment, what happens when you assign a course, and how due dates work.',
 '5:00', 300, 0, TRUE,
 'When a learner visits the HCMG U library and clicks Start Course, they self-enroll. That is fine for optional training. But for required training — onboarding, compliance, performance improvement plans — you as an administrator need to assign courses directly.

Here is the difference.

SELF-ENROLLMENT: the learner finds the course in the library and starts it themselves. No due date. No required flag unless the course itself is marked required. Completion is tracked and reported the same way.

ADMIN ASSIGNMENT: you select the course and the target audience, set an optional due date, and the system creates enrollment records for everyone in the target group. The course shows up on their dashboard with the assigned badge and due date if you set one.

Here is what happens after you assign:
- Each person in the target group gets an enrollment record in the system.
- The course appears on their dashboard.
- If the course has is_required set to true, it shows with a red Required badge.
- If you set a due date and a learner has not completed the course by that date, the course shows as Overdue in your Reports view.

Assignments do not send email notifications automatically in the current version. If you want learners to know they have been assigned something, reach out directly or use the team portal announcement tools.

One important note: assigning a course to someone who is already enrolled does nothing — the system uses upsert logic and ignores duplicates. So it is safe to run a companywide assignment even if some people are already enrolled.'
),

(c3_id,
 'Assigning Courses Step by Step',
 'A walkthrough of the Assignments page — how to select a course, choose a target, set a due date, and submit.',
 '6:30', 390, 1, TRUE,
 'Let''s walk through the Assignments page step by step.

Navigate to Admin in the sidebar, then click Assignments.

You will see a form with four fields.

STEP 1 — COURSE: select the course you want to assign from the dropdown. Only published courses appear here. If you do not see a course you expected, check that it is published in the course editor.

STEP 2 — ASSIGN TO: this controls who gets the assignment.

- "All active HCMG U members" assigns the course to everyone who currently has university_access set to true. Use this for company-wide required training like compliance or new policy announcements.
- "Individual user" lets you pick one specific person from the dropdown below. Use this for targeted assignments — a new hire, a performance improvement plan, or a specific skill gap.
- "By role" assigns to everyone with a specific portal role (loan officer, manager, etc.). Use this for role-specific training.
- "By department" assigns to everyone in a specific department. Use this if you have departments set up in your team profiles.

STEP 3 — USER: if you selected "Individual user" in step 2, pick the person from this dropdown. The dropdown shows all active team members with university_access enabled. If someone is not showing up, check their profile — their university_access may be off or their account may be inactive.

STEP 4 — DUE DATE: optional. If you set a due date, any learner who has not completed the course by that date will show as Overdue in your reports. Leave this blank for optional courses or if there is no deadline pressure.

Click Assign Course. The system creates enrollment records immediately. You will be returned to the assignments page with a success confirmation.

To verify the assignment worked, go to Reports and filter by the course name. You should see the enrolled learners with zero percent progress.'
),

(c3_id,
 'Using Reports to Track Progress',
 'How to read the completion report table, filter by course or team member, spot overdue learners, and export to CSV.',
 '6:30', 390, 2, TRUE,
 'The Reports page is your visibility into how the team is progressing through their training.

Navigate to Admin, then Reports.

The table shows every enrollment record in the system with the following columns:

EMPLOYEE — the team member''s name and email.
COURSE — the course they are enrolled in.
REQUIRED — whether the course is marked required.
DUE DATE — the due date if one was set. Shows in red with an OVERDUE label if the date has passed and the course is not complete.
PROGRESS — a visual progress bar plus a percentage. 0% means not started. 100% means every published lesson is complete.
LAST ACTIVE — the date the learner last watched any lesson in this course.
CERTIFICATE — shows "Issued" in green if a completion certificate has been issued for this course.

FILTERING: use your browser''s built-in search (Ctrl+F or Cmd+F) to filter by name or course title. A full filter UI is on the roadmap.

OVERDUE: any row with a red OVERDUE label needs your attention. Reach out to that team member directly. If the due date was unrealistic, you can update it by reassigning the course with a new due date.

EXPORT: click the Export CSV button in the top right. This downloads a spreadsheet with every column from the table. Use this for compliance reporting, performance reviews, or sharing with leadership.

CERTIFICATE ISSUANCE: if a learner has completed a course but the certificate was not issued automatically (e.g. the course did not have auto-certificate enabled), you can issue it manually. Navigate to the learner''s row, then use the certificate API — or contact your developer to add the manual issue button to this page. That UI is on the enhancement list.

Check this page weekly. Required training compliance is a real obligation, especially for any courses that touch fair lending, SAFE Act, or company policy.'
),

(c3_id,
 'Managing User Access',
 'How to grant or revoke HCMG U access, change a team member''s university role, and what happens when an employee leaves.',
 '6:00', 360, 3, TRUE,
 'The Users page under Admin gives you a full view of every team member and their HCMG U access status.

Navigate to Admin, then User Access.

The table shows every profile in the system with these columns: name, email, profile role, account status (Active/Inactive), employment status, university access (Yes/No), university role, and last login date.

GRANTING UNIVERSITY ACCESS: if a new team member does not have HCMG U access, their University Access column will show No. To grant access, you have two options:
1. Go to the main Admin → Users panel and update the university_access field to true and set university_role to the appropriate level.
2. Or update the profile directly in Supabase if you need to do it quickly.

Changes take effect immediately — the next time that person loads any HCMG U page, the server re-queries their profile and will let them in.

UNIVERSITY ROLES:
- learner — standard team member. Can access assigned and self-enrolled courses only.
- manager — can see their direct reports'' progress in reports. Cannot create courses.
- trainer — can create, edit, and publish courses. Cannot manage users or access.
- university_admin — full access to everything. Use this for HR, training managers, and designated admins.

Note: any profile with the main portal role of admin or developer automatically gets university_admin access regardless of the university_role field.

REVOKING ACCESS: set university_access to false. That team member will be blocked from HCMG U immediately — even if their browser session is still active. The next page load will show the Access Required screen instead of their dashboard.

OFFBOARDING: when a team member leaves HCMG, the standard offboarding process should include:
1. Set is_active to false in their profile.
2. Set employment_status to inactive.
3. Set university_access to false.

Any of these three steps alone will block HCMG U access. Doing all three ensures there is no gap. The Access Required screen shows a support contact for anyone who believes this is an error.

All access grants and revocations are written to the uni_audit_log table for compliance purposes.');

END $$;

SELECT
  c.title,
  c.slug,
  c.is_published,
  COUNT(l.id) AS lesson_count
FROM public.uni_courses c
LEFT JOIN public.uni_lessons l ON l.course_id = c.id
GROUP BY c.id, c.title, c.slug, c.is_published
ORDER BY c.sort_order;
