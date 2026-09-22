-- ─────────────────────────────────────────────────────────────────────────────
-- HCMG U: Admin Guide — Creating & Managing Courses
-- Seeded as a real published course inside HCMG U
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  course_id   uuid := gen_random_uuid();
  admin_id    uuid := '736a599a-492a-4585-b845-74b264d0ac9e'; -- Darius James

  mod1_id     uuid := gen_random_uuid();
  mod2_id     uuid := gen_random_uuid();
  mod3_id     uuid := gen_random_uuid();

  l1_id uuid := gen_random_uuid();
  l2_id uuid := gen_random_uuid();
  l3_id uuid := gen_random_uuid();
  l4_id uuid := gen_random_uuid();
  l5_id uuid := gen_random_uuid();
  l6_id uuid := gen_random_uuid();
  l7_id uuid := gen_random_uuid();
  l8_id uuid := gen_random_uuid();
BEGIN

-- ── COURSE ───────────────────────────────────────────────────────────────────
INSERT INTO uni_courses (
  id, slug, title, description, short_description,
  category, difficulty, duration_label,
  pill_color, is_required, is_published, sort_order,
  content_status, audience, instructor_name, created_by
) VALUES (
  course_id,
  'hcmg-u-admin-guide',
  'Admin Guide: Creating & Managing Courses',
  'A complete step-by-step guide for HCMG U administrators and trainers. Learn how to build courses in the Course Studio, add lessons with video, text, audio, and quizzes, configure completion rules, and publish training to the team.',
  'How to build, configure, and publish training courses in HCMG U.',
  'operations',
  'beginner',
  '25 min',
  'blue',
  false,
  true,
  1000,
  'published',
  'Admins and Trainers',
  'HCMG U Team',
  admin_id
);

-- ── LEARNING OBJECTIVES ───────────────────────────────────────────────────────
INSERT INTO uni_course_objectives (id, course_id, objective, sort_order) VALUES
  (gen_random_uuid(), course_id, 'Navigate the Course Studio and understand its four main tabs', 1),
  (gen_random_uuid(), course_id, 'Create a new course with proper metadata, category, and thumbnail', 2),
  (gen_random_uuid(), course_id, 'Build a curriculum structure using chapters and lessons', 3),
  (gen_random_uuid(), course_id, 'Upload video content and configure lesson completion rules', 4),
  (gen_random_uuid(), course_id, 'Build knowledge check quizzes with multiple question types', 5),
  (gen_random_uuid(), course_id, 'Publish a course and assign it to team members', 6);

-- ── MODULE 1: Getting Started ─────────────────────────────────────────────────
INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active)
VALUES (mod1_id, course_id, 'Getting Started', 'Understanding the HCMG U admin tools and creating your first course.', 1, true);

-- Lesson 1: System Overview (text)
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct,
  duration_secs, duration_label, transcript
) VALUES (
  l1_id, course_id, mod1_id,
  'System Overview',
  'How HCMG U is structured — from the Course Studio to learner certificates.',
  'text', 1, 1, true, 'watch_pct', 80, 180, '3 min',
  E'HCMG U is the internal learning management platform for authorized HCMG team members.\n\n'
  '## How It Works\n\n'
  'The system flows in one direction:\n\n'
  '1. **Course Studio** — Admins and Trainers build courses here. You set the title, upload video, write lesson content, and configure completion rules.\n\n'
  '2. **Media Library** — All videos, images, and PDFs live here. You upload once and reuse across multiple lessons.\n\n'
  '3. **Assignments** — Once a course is published, you assign it to individuals, roles, org units, or the entire team.\n\n'
  '4. **Learner View** — Enrolled team members see the course on their HCMG U dashboard. They watch lessons, complete quizzes, and track their own progress.\n\n'
  '5. **Certificates** — When a learner completes all lessons, the system automatically issues a digital certificate they can share and verify.\n\n'
  '## Who Can Build Courses\n\n'
  '| Role | Create Courses | Publish | Assign | View Reports |\n'
  '|---|---|---|---|---|\n'
  '| **Admin** | ✓ | ✓ | ✓ | ✓ |\n'
  '| **Trainer** | ✓ | ✓ | ✓ | ✓ |\n'
  '| **Learner** | — | — | — | Own progress only |\n\n'
  '## Training Integrity\n\n'
  'HCMG U uses **server-side verification**. The client never self-reports completion. The server tracks:\n\n'
  '- **Video lessons**: Actual segments watched (not just time elapsed). Skipping or fast-forwarding does not count.\n'
  '- **Text lessons**: Dwell time + scroll depth. You must read the full page.\n'
  '- **Quizzes**: Must pass at the configured threshold (default 80%) before the lesson is marked complete.'
);

-- Lesson 2: Creating a New Course (text)
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct,
  duration_secs, duration_label, transcript
) VALUES (
  l2_id, course_id, mod1_id,
  'Creating a New Course',
  'Step-by-step: from the Courses list to having a live course shell ready to build.',
  'text', 2, 2, true, 'watch_pct', 80, 240, '4 min',
  E'## Step 1 — Navigate to Course Studio\n\n'
  'Go to **HCMG U → Admin → Training Studio → Courses**.\n\n'
  'You''ll see a list of all existing courses with their status, category, and lesson count. '
  'Use the search bar to find a specific course, or filter by status (Draft / Published).\n\n'
  '## Step 2 — Click "+ New Course"\n\n'
  'Click the orange **+ New Course** button in the top-right corner. A form appears with these fields:\n\n'
  '- **Course Title** — The name learners see on their dashboard (e.g. "New LO Fast Start"). Keep under 60 characters.\n'
  '- **Slug** — Auto-generated URL identifier. Only change if you need a custom URL (e.g. `new-lo-fast-start`).\n'
  '- **Description** — A 1–3 sentence overview of what the course covers.\n'
  '- **Category** — Choose from: General, New LO Fast Start, Sales & Conversion, Products & Guidelines, Systems & Operations, Compliance.\n\n'
  '## Step 3 — Click "Create Course"\n\n'
  'You''ll land directly in the **Course Studio**. The course starts as a **Draft** — completely invisible to learners until you publish it.\n\n'
  '> **Tip:** You can safely build and preview without affecting the team. Take your time getting the content right before publishing.\n\n'
  '## The Course Studio Has Four Tabs\n\n'
  '| Tab | What you do here |\n'
  '|---|---|\n'
  '| **Overview** | Title, thumbnail, description, category, objectives |\n'
  '| **Curriculum** | Build chapters and lessons |\n'
  '| **Assessments** | Standalone assessments (separate from lesson quizzes) |\n'
  '| **Settings** | Certificate, path tag, sort order |\n\n'
  '## Overview Tab Fields\n\n'
  '- **Thumbnail** — Pick from Media Library or upload new. Recommended: 16:9 ratio, minimum 800×450px.\n'
  '- **Difficulty** — Beginner / Intermediate / Advanced (optional but helps learners).\n'
  '- **Estimated Duration** — Total watch/read time in minutes. Shown on the course card.\n'
  '- **Pill Color** — Color accent on the course card. Orange = default HCMG brand.\n'
  '- **Learning Objectives** — Click "+ Add Objective" for each bullet-point outcome.\n'
  '- **Required Training** — Toggle on for mandatory courses. Required courses appear first in the learner dashboard.'
);

-- ── MODULE 2: Building Curriculum ────────────────────────────────────────────
INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active)
VALUES (mod2_id, course_id, 'Building Curriculum', 'Creating chapters, adding lessons, uploading content, and configuring completion rules.', 2, true);

-- Lesson 3: Chapters & Lessons (text)
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct,
  duration_secs, duration_label, transcript
) VALUES (
  l3_id, course_id, mod2_id,
  'Building Chapters & Lessons',
  'How to structure your course curriculum using chapters (modules) and lessons.',
  'text', 3, 1, true, 'watch_pct', 80, 300, '5 min',
  E'## The Curriculum Structure\n\n'
  'Courses are organized like a book:\n\n'
  '- **Course** → contains Chapters\n'
  '- **Chapter** (also called a Module) → contains Lessons\n'
  '- **Lesson** → individual piece of content (video, text, quiz, etc.)\n\n'
  '## Adding a Chapter\n\n'
  '1. Click the **Curriculum** tab in the Course Studio.\n'
  '2. Click the **+ Add Chapter** button in the left sidebar.\n'
  '3. A new chapter called "Untitled" appears. Click on it to rename it inline.\n'
  '4. Optionally add a **Chapter Description** — visible to learners above that section''s lessons.\n\n'
  '> You can have as many chapters as needed. There''s no limit.\n\n'
  '## Adding a Lesson\n\n'
  '1. With a chapter selected, click **+ Add Content** inside that chapter on the right side.\n'
  '2. The **Add Content modal** appears — choose a lesson type (Text, Video, Audio, Quiz, or Assignment).\n'
  '3. The lesson is created and you''re taken to the **Lesson Editor**.\n'
  '4. Return to the Curriculum tab to see it listed under that chapter.\n\n'
  '## The Five Lesson Types\n\n'
  '| Type | Best for |\n'
  '|---|---|\n'
  '| **Video** | Demonstrations, walkthroughs, CEO messages, HeyGen AI videos |\n'
  '| **Text** | Policy docs, SOPs, written guides, reference material |\n'
  '| **Audio** | Podcast-style content, mobile learners on the go |\n'
  '| **Quiz** | Knowledge checks, compliance verification |\n'
  '| **Assignment** | Field tasks, offline activities the learner confirms completing |\n\n'
  '## Reordering\n\n'
  'Drag chapters up/down in the sidebar to reorder them. Drag lessons within a chapter to reorder them. '
  'The order is immediately saved.'
);

-- Lesson 4: Uploading Video Content (text)
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct,
  duration_secs, duration_label, transcript
) VALUES (
  l4_id, course_id, mod2_id,
  'Uploading Video Content',
  'How to add video to a lesson — direct upload, Media Library, or HeyGen embed.',
  'text', 4, 2, true, 'watch_pct', 80, 240, '4 min',
  E'## Creating a Video Lesson\n\n'
  '1. In the Curriculum tab, click **+ Add Content** under your chapter.\n'
  '2. Select **Video** from the Add Content modal.\n'
  '3. You''re taken to the **Lesson Editor**. Go to the **Media** tab.\n\n'
  '## Three Ways to Add Video\n\n'
  '### Option A — Upload from your computer\n'
  'Click **Select Video** and upload directly. Supported formats: .mp4, .mov, .avi, .mkv, .flv, .wmv, .webm.\n\n'
  '> **File size limit:** Large files (>50MB) must be uploaded through the Supabase Dashboard directly to the `uni-media` storage bucket under an `intro/` or `courses/` folder.\n\n'
  '### Option B — Pick from Media Library\n'
  'Click **Select from Media Library** to reuse a video already uploaded. '
  'This is the recommended approach when using the same video across multiple lessons.\n\n'
  '### Option C — HeyGen or External URL\n'
  'Paste a HeyGen embed URL directly:\n'
  '`https://app.heygen.com/embeds/YOUR_VIDEO_ID`\n\n'
  'The system supports any HTTPS video URL. The learner never sees the raw URL — '
  'it''s served through a signed, time-limited link.\n\n'
  '## Transcripts\n\n'
  'After adding video, go to the **Transcript** tab and paste the full text transcript. '
  'It appears as a collapsible section below the video for learners. '
  'Transcripts also help with accessibility and searchability.\n\n'
  '## Download Resources\n\n'
  'Use the **Settings panel** → **Download Resources** to attach PDFs, worksheets, or reference docs. '
  'Learners can download these directly from the lesson page.\n\n'
  '## Supported Audio Formats\n'
  'For Audio lessons: .mp3, .wav, .aac, .flac, .ogg, .m4a'
);

-- Lesson 5: Completion Rules (text)
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct,
  duration_secs, duration_label, transcript
) VALUES (
  l5_id, course_id, mod2_id,
  'Lesson Settings & Completion Rules',
  'Configure how and when a lesson counts as complete for the learner.',
  'text', 5, 3, true, 'watch_pct', 80, 300, '5 min',
  E'## The Settings Panel\n\n'
  'Every lesson has a **Settings panel** on the right side of the Lesson Editor. '
  'Open any lesson → look for the gear icon (⚙ Settings) on the right column.\n\n'
  '## Visibility: Draft vs Published\n\n'
  '- **Draft** — Hidden from learners. Only admins/trainers can preview.\n'
  '- **Published** — Visible to all enrolled learners in this course.\n\n'
  '> **Important:** Publishing the course does NOT automatically publish its lessons. '
  'You must publish each lesson individually from the Settings panel.\n\n'
  '## Completion Mode\n\n'
  'This is the most important setting. It determines **when the server grants completion**:\n\n'
  '| Mode | When complete | Best for |\n'
  '|---|---|---|\n'
  '| **watch_pct** | Server verifies ≥ threshold% of video watched | Video lessons |\n'
  '| **quiz_pass** | Learner must pass the attached knowledge check | Compliance, policy |\n'
  '| **manual** | Learner clicks "Mark as Complete" | Short informational videos |\n'
  '| **dwell_time** | Server verifies minimum read time + 80% scroll depth | Text/assignment |\n\n'
  '## Completion Threshold\n\n'
  'Default is **80%** for video. For example, if a video is 10 minutes, the learner must watch at least 8 minutes of unique content (not the same 8 minutes rewound).\n\n'
  '## Other Settings\n\n'
  '- **Allow Lesson Preview** — Non-enrolled visitors can see this lesson without enrolling. Use for free preview lessons.\n'
  '- **Prerequisites** — Require a previous lesson to be completed first before this one unlocks.\n'
  '- **Duration (secs)** — Set the expected reading or watch time. For text lessons, this drives the minimum dwell time calculation (50% of duration, clamped 60–600 seconds).\n\n'
  '## How Training Integrity Works\n\n'
  'The system sends a "heartbeat" to the server every 5 seconds while a learner is watching or reading:\n\n'
  '- For **video**: The server tracks exact segments watched. Rewinding and rewatching the same segment does not add to the verified total.\n'
  '- For **text/assignment**: The server tracks active reading time (tab must be visible and focused) plus scroll depth.\n'
  '- The browser **never** tells the server "I completed this." Only the server makes that decision.'
);

-- ── MODULE 3: Quizzes, Publishing & Assigning ────────────────────────────────
INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active)
VALUES (mod3_id, course_id, 'Quizzes, Publishing & Assigning', 'Build knowledge checks, publish your course, and get it in front of the team.', 3, true);

-- Lesson 6: Building Quizzes (text)
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct,
  duration_secs, duration_label, transcript
) VALUES (
  l6_id, course_id, mod3_id,
  'Building Knowledge Checks (Quizzes)',
  'Add questions to any lesson to require a passing grade for completion.',
  'text', 6, 1, true, 'watch_pct', 80, 240, '4 min',
  E'## What Are Knowledge Checks?\n\n'
  'Quizzes (called Knowledge Checks in HCMG U) can be attached to **any lesson** — not just Quiz-type lessons. '
  'You can add questions to a Video lesson, Text lesson, or create a standalone Quiz lesson.\n\n'
  '## Adding Questions to a Lesson\n\n'
  '1. Open the lesson in the Lesson Editor.\n'
  '2. Click the **Knowledge Check** tab (or **Questions** tab depending on lesson type).\n'
  '3. Click **+ Add Question**.\n'
  '4. Select the question type from the dropdown.\n'
  '5. Type your question text.\n'
  '6. Add answer options. Click the circle next to the correct answer(s) to mark them green.\n'
  '7. Optionally add an **Explanation** — shown to the learner after they answer.\n'
  '8. Click **Save Question**.\n\n'
  '## Question Types\n\n'
  '| Type | Description |\n'
  '|---|---|\n'
  '| **Multiple Choice** | One correct answer from 2–8 options. Most common type. |\n'
  '| **Multiple Select** | More than one correct answer. "Select all that apply." |\n'
  '| **True / False** | Simple two-option question. True/False auto-populated. |\n'
  '| **Short Answer** | Open text response. Not auto-graded — used for reflection. |\n\n'
  '## Setting the Pass Threshold\n\n'
  'The default passing score is **80%**. To require a quiz pass for lesson completion:\n\n'
  '1. Go to the lesson''s **Settings panel** (right side).\n'
  '2. Set **Completion Mode** to `quiz_pass`.\n'
  '3. Set **Completion Threshold** to your desired percentage (e.g. 80%).\n\n'
  'The lesson will not count as complete until the learner achieves that score.\n\n'
  '## Tips for Good Quiz Questions\n\n'
  '- Keep questions focused on one concept each.\n'
  '- Use 4 answer options for multiple choice (reduces guessing).\n'
  '- Add explanations — they''re the most effective learning moment in the whole quiz.\n'
  '- For compliance courses, use quiz_pass mode to ensure real comprehension.\n'
  '- Avoid trick questions — the goal is to verify learning, not to fail people.'
);

-- Lesson 7: Publishing & Course Settings (text)
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct,
  duration_secs, duration_label, transcript
) VALUES (
  l7_id, course_id, mod3_id,
  'Course Settings & Publishing',
  'Configure certificates, then publish the course so learners can see it.',
  'text', 7, 2, true, 'watch_pct', 80, 180, '3 min',
  E'## The Settings Tab\n\n'
  'Click the **Settings** tab in the Course Studio to configure course-level rules.\n\n'
  '| Setting | Description |\n'
  '|---|---|\n'
  '| **Path Tag** | Internal identifier linking this course to a Learning Path (e.g. `harrys_playbook`). Leave blank unless intentional. |\n'
  '| **Certificate on Completion** | Toggle on to issue a digital certificate when learner completes all lessons. |\n'
  '| **Certificate Title** | The name printed on the certificate (e.g. "New LO Fast Start"). |\n'
  '| **Expiry** | Optional: certificates expire after X days. Used for compliance re-certification. |\n'
  '| **CEUs / Credit Hours** | If this course carries continuing education credit, enter the number here. |\n'
  '| **Sort Order** | Controls position in the course library. Lower number = appears first. |\n\n'
  '## Publishing the Course\n\n'
  '**Pre-publish checklist:**\n\n'
  '- [ ] Course title and description filled out\n'
  '- [ ] Thumbnail uploaded\n'
  '- [ ] At least one chapter with at least one lesson\n'
  '- [ ] All lessons are individually **Published** (not just the course)\n'
  '- [ ] Video uploaded or URL set on video lessons\n'
  '- [ ] Completion mode set on each lesson\n\n'
  '**To publish:**\n\n'
  '1. Return to the Course Studio (any tab).\n'
  '2. Click the **Publish** button in the top-right corner.\n'
  '3. Status changes from Draft → Published.\n'
  '4. The course is now visible to enrolled learners on their dashboard.\n\n'
  '> **Certificates:** When issued, learners receive an email with a verification link. '
  'Anyone can verify a certificate at `hcmgloans.com/university/verify/[id]` — no login required.'
);

-- Lesson 8: Assigning to the Team (text)
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct,
  duration_secs, duration_label, transcript
) VALUES (
  l8_id, course_id, mod3_id,
  'Assigning Training to the Team',
  'Enroll individuals, roles, org units, or the whole team in a published course.',
  'text', 8, 3, true, 'watch_pct', 80, 180, '3 min',
  E'## Assignments vs Enrollment\n\n'
  '**Publishing** a course makes it visible. '
  '**Assigning** it enrolls specific people so it appears on their dashboard with a progress tracker.\n\n'
  '## How to Assign a Course\n\n'
  '1. Go to **Admin → Assignments**.\n'
  '2. Click **+ New Assignment**.\n'
  '3. Select the course from the dropdown.\n'
  '4. Choose who to assign it to:\n\n'
  '| Target | Who gets enrolled |\n'
  '|---|---|\n'
  '| **Individual** | One specific person by name |\n'
  '| **Role** | All Loan Officers, all Processors, etc. |\n'
  '| **Org Unit** | A specific branch, department, or team |\n'
  '| **Everyone** | All active HCMG U users |\n\n'
  '5. Set an optional **Due Date** — overdue assignments appear in red on the HR Overview and trigger notifications.\n'
  '6. Click **Assign** — enrolled learners see the course on their dashboard immediately.\n\n'
  '## Monitoring Progress\n\n'
  '- **Reports** (`/university/admin/reports`) — Completion rates, overdue tracking, quiz performance.\n'
  '- **HR Overview** (`/university/hr`) — Employee training status, non-compliance, new hire tracking.\n'
  '- **Manager View** (`/university/manager`) — Managers see their direct reports'' progress.\n\n'
  '## Quick Reference — Admin Navigation\n\n'
  '| Where to go | URL |\n'
  '|---|---|\n'
  '| All courses | `/university/admin/courses` |\n'
  '| New course | `/university/admin/courses/new` |\n'
  '| Course Studio | `/university/admin/studio/[courseId]` |\n'
  '| Media Library | `/university/admin/media` |\n'
  '| Assignments | `/university/admin/assignments` |\n'
  '| Reports | `/university/admin/reports` |\n'
  '| HR Overview | `/university/hr` |\n'
  '| Audit Log | `/university/admin/audit-log` |'
);

END $$;
