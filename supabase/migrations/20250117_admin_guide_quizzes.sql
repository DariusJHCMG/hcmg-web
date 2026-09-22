-- ─────────────────────────────────────────────────────────────────────────────
-- Admin Guide: Knowledge Checks + Final Assessment
-- 1. Per-lesson knowledge check questions on 4 lessons
-- 2. Final Knowledge Check lesson (lesson_type=knowledge_check) at end
-- 3. Course-level Final Assessment with 15 questions
-- ─────────────────────────────────────────────────────────────────────────────

-- Known IDs (hardcoded to avoid PL/pgSQL ambiguity)
-- course:    9c6dfd6e-ecb2-4374-910e-90113b13de7b
-- module 3:  eaf95907-16c8-452c-93a2-8137962c9e3e
-- l_overview:   5415db43-e7b4-4070-8f61-a0a55f311712
-- l_chapters:   52901eef-4252-4f38-a067-bb67313b62b2
-- l_settings:   9f02e0b0-6f10-4ec4-931a-34e8cae06783
-- l_assign:     f0577b0e-3535-4b34-a4a7-7b72f283b463
-- l_final_quiz: a1b2c3d4-e5f6-7890-abcd-ef1234567890  (new)
-- assessment:   b2c3d4e5-f6a7-8901-bcde-f12345678901  (new)

-- ── 1. Per-lesson knowledge checks ──────────────────────────────────────────

-- ┌─ Lesson 1: System Overview — 3 questions ─────────────────────────────────
INSERT INTO uni_quiz_questions (id, lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order, points) VALUES

('11111111-0001-0001-0001-000000000001',
 '5415db43-e7b4-4070-8f61-a0a55f311712',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'HCMG U uses server-side verification for completions. What does this mean?',
 'multiple_choice',
 '[{"label":"The learner clicks a button to confirm they watched","is_correct":false},{"label":"The server tracks actual engagement and grants completion — the browser never self-reports","is_correct":true},{"label":"An admin manually marks each learner complete","is_correct":false},{"label":"Completion is automatic after 30 seconds on the page","is_correct":false}]',
 'The browser never tells the server "I am done." The server measures real engagement — video segments watched, dwell time, scroll depth — and grants completion only when thresholds are met.',
 1, 1),

('11111111-0001-0001-0001-000000000002',
 '5415db43-e7b4-4070-8f61-a0a55f311712',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Which of the following does the server track to verify a video lesson is complete?',
 'multiple_choice',
 '[{"label":"Total time the lesson page was open","is_correct":false},{"label":"Whether the learner clicked the play button","is_correct":false},{"label":"Exact segments of the video that were actually watched","is_correct":true},{"label":"The learner''s self-reported progress","is_correct":false}]',
 'The server tracks which exact portions of the video were watched. Rewinding and rewatching the same segment does not increase the verified watch total.',
 2, 1),

('11111111-0001-0001-0001-000000000003',
 '5415db43-e7b4-4070-8f61-a0a55f311712',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'True or False: A Trainer role in HCMG U can create and publish courses.',
 'true_false',
 '[{"label":"True","is_correct":true},{"label":"False","is_correct":false}]',
 'Both Admin and Trainer roles can create, edit, and publish courses. Learners can only consume content and track their own progress.',
 3, 1);

-- ┌─ Lesson 3: Building Chapters & Lessons — 3 questions ─────────────────────
INSERT INTO uni_quiz_questions (id, lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order, points) VALUES

('11111111-0003-0003-0003-000000000001',
 '52901eef-4252-4f38-a067-bb67313b62b2',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'What is the correct structure of a course in HCMG U?',
 'multiple_choice',
 '[{"label":"Lessons → Modules → Courses","is_correct":false},{"label":"Course → Chapters → Lessons","is_correct":true},{"label":"Course → Lessons → Quizzes","is_correct":false},{"label":"Sections → Units → Videos","is_correct":false}]',
 'A Course contains Chapters (also called Modules), and each Chapter contains one or more Lessons. This three-level hierarchy keeps content organized and scannable for learners.',
 1, 1),

('11111111-0003-0003-0003-000000000002',
 '52901eef-4252-4f38-a067-bb67313b62b2',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Which lesson type is best for an annual compliance policy that requires reading and acknowledgment?',
 'multiple_choice',
 '[{"label":"Video","is_correct":false},{"label":"Audio","is_correct":false},{"label":"Text","is_correct":true},{"label":"Assignment","is_correct":false}]',
 'Text lessons are ideal for policy documents, SOPs, and written guides. Combined with watch_pct scroll mode, they ensure the learner actually reads the content.',
 2, 1),

('11111111-0003-0003-0003-000000000003',
 '52901eef-4252-4f38-a067-bb67313b62b2',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'When you drag lessons to reorder them in the Curriculum tab, when does the new order save?',
 'multiple_choice',
 '[{"label":"Only after you click the Save button","is_correct":false},{"label":"When you navigate away from the page","is_correct":false},{"label":"Immediately and automatically","is_correct":true},{"label":"After a 30-second auto-save timer","is_correct":false}]',
 'Reordering in the Curriculum tab saves immediately. There is no separate save step required for drag-and-drop reordering.',
 3, 1);

-- ┌─ Lesson 5: Completion Rules — 3 questions ────────────────────────────────
INSERT INTO uni_quiz_questions (id, lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order, points) VALUES

('11111111-0005-0005-0005-000000000001',
 '9f02e0b0-6f10-4ec4-931a-34e8cae06783',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'If you publish a course but forget to publish its individual lessons, what will learners see?',
 'multiple_choice',
 '[{"label":"All lessons, because the course is published","is_correct":false},{"label":"The course card in the catalog but no lessons inside it","is_correct":true},{"label":"Nothing — the course stays hidden","is_correct":false},{"label":"Only the first lesson automatically","is_correct":false}]',
 'Publishing a course and publishing its lessons are two separate actions. Learners will see the course card and can enroll, but find no lessons until each lesson is individually published.',
 1, 1),

('11111111-0005-0005-0005-000000000002',
 '9f02e0b0-6f10-4ec4-931a-34e8cae06783',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Which completion mode requires a learner to pass a quiz before the lesson counts as complete?',
 'multiple_choice',
 '[{"label":"watch_pct","is_correct":false},{"label":"dwell_time","is_correct":false},{"label":"manual","is_correct":false},{"label":"quiz_pass","is_correct":true}]',
 'quiz_pass mode requires the learner to achieve a passing score on the attached knowledge check before the server grants completion.',
 2, 1),

('11111111-0005-0005-0005-000000000003',
 '9f02e0b0-6f10-4ec4-931a-34e8cae06783',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'The HCMG U heartbeat system sends data to the server every how many seconds?',
 'multiple_choice',
 '[{"label":"1 second","is_correct":false},{"label":"5 seconds","is_correct":true},{"label":"30 seconds","is_correct":false},{"label":"60 seconds","is_correct":false}]',
 'Every 5 seconds while a learner is active, the browser sends a heartbeat with current position, visibility state, and scroll depth.',
 3, 1);

-- ┌─ Lesson 8: Assigning to Team — 2 questions ────────────────────────────────
INSERT INTO uni_quiz_questions (id, lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order, points) VALUES

('11111111-0008-0008-0008-000000000001',
 'f0577b0e-3535-4b34-a4a7-7b72f283b463',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'What is the difference between publishing a course and assigning it?',
 'multiple_choice',
 '[{"label":"They are the same thing","is_correct":false},{"label":"Publishing makes it visible in the catalog; assigning puts it on a specific learner''s dashboard with a progress tracker","is_correct":true},{"label":"Assigning makes it visible; publishing sends an email","is_correct":false},{"label":"Publishing is for admins; assigning is for trainers","is_correct":false}]',
 'Publishing is like putting a book on the shelf — anyone with HCMG U access can browse it. Assigning is like handing it directly to someone and tracking whether they read it.',
 1, 1),

('11111111-0008-0008-0008-000000000002',
 'f0577b0e-3535-4b34-a4a7-7b72f283b463',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Where would you go to see every employee''s training compliance status across the entire organization?',
 'multiple_choice',
 '[{"label":"Admin → Reports","is_correct":false},{"label":"Admin → Assignments","is_correct":false},{"label":"HR Overview (/university/hr)","is_correct":true},{"label":"Manager View (/university/manager)","is_correct":false}]',
 'The HR Overview gives a complete picture of every employee''s training status, flags non-compliance, and tracks new hire progress across the whole organization.',
 2, 1);

-- ── 2. Final Knowledge Check lesson ──────────────────────────────────────────
INSERT INTO uni_lessons (
  id, course_id, module_id,
  title, description, lesson_type,
  sort_order, module_sort_order,
  is_published, completion_mode, completion_threshold_pct,
  duration_secs, duration_label
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
  'eaf95907-16c8-452c-93a2-8137962c9e3e',
  'Final Knowledge Check',
  'Test your understanding of everything covered in this course — course creation, lesson types, completion rules, quizzes, and publishing.',
  'knowledge_check',
  9, 4,
  true, 'quiz_pass', 80,
  600, '10 min'
);

-- Final Quiz questions (10 questions)
INSERT INTO uni_quiz_questions (id, lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order, points) VALUES

('22222222-ffff-ffff-ffff-000000000001',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Which tab in the Course Studio is used to build chapters and add lessons?',
 'multiple_choice',
 '[{"label":"Overview","is_correct":false},{"label":"Curriculum","is_correct":true},{"label":"Settings","is_correct":false},{"label":"Assessments","is_correct":false}]',
 'The Curriculum tab is the command center for building course structure. Overview handles metadata, Settings handles certificates and configuration.',
 1, 1),

('22222222-ffff-ffff-ffff-000000000002',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'A learner fast-forwards through the last 3 minutes of a video they haven''t watched yet. Does this count toward their verified watch percentage?',
 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'No. The server tracks exact segments watched at normal speed. Fast-forwarding through unseen portions does not add to the verified total.',
 2, 1),

('22222222-ffff-ffff-ffff-000000000003',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Which of the following video sources can be used in a HCMG U video lesson? (Select all that apply)',
 'multiple_select',
 '[{"label":"Direct upload (.mp4, .mov, .avi, etc.)","is_correct":true},{"label":"HeyGen AI video embed URL","is_correct":true},{"label":"Media Library (previously uploaded files)","is_correct":true},{"label":"A YouTube watch URL (youtube.com/watch?v=...)","is_correct":false}]',
 'HCMG U supports direct uploads, Media Library files, and HeyGen embed URLs. Standard YouTube watch URLs are not supported.',
 3, 1),

('22222222-ffff-ffff-ffff-000000000004',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'What is the default completion threshold percentage for video lessons?',
 'multiple_choice',
 '[{"label":"50%","is_correct":false},{"label":"70%","is_correct":false},{"label":"80%","is_correct":true},{"label":"100%","is_correct":false}]',
 'The default completion threshold is 80%. A learner must watch at least 80% of the video in unique segments before the server grants completion.',
 4, 1),

('22222222-ffff-ffff-ffff-000000000005',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'You are building a compliance course that requires learners to demonstrate understanding. Which completion mode should you use?',
 'multiple_choice',
 '[{"label":"watch_pct","is_correct":false},{"label":"manual","is_correct":false},{"label":"any","is_correct":false},{"label":"quiz_pass","is_correct":true}]',
 'quiz_pass requires the learner to pass an attached knowledge check before the lesson counts as complete.',
 5, 1),

('22222222-ffff-ffff-ffff-000000000006',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'True or False: When you publish a course, all of its lessons are automatically published too.',
 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'False. Publishing a course and publishing individual lessons are completely separate actions.',
 6, 1),

('22222222-ffff-ffff-ffff-000000000007',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Which of the following best describes the purpose of the "Assign" function vs. simply publishing a course?',
 'multiple_choice',
 '[{"label":"Assigning makes the course visible; publishing sends an email notification","is_correct":false},{"label":"Publishing makes it visible in the catalog; assigning puts it on a specific person''s dashboard with tracking","is_correct":true},{"label":"They are interchangeable — both do the same thing","is_correct":false},{"label":"Assigning is only for Required courses","is_correct":false}]',
 'Publishing is catalog visibility. Assigning is active enrollment — it creates a tracked record for the learner.',
 7, 1),

('22222222-ffff-ffff-ffff-000000000008',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'What happens to a learner''s progress data if you unpublish a course after they have already completed some lessons?',
 'multiple_choice',
 '[{"label":"Their progress is permanently deleted","is_correct":false},{"label":"They lose access to the course but their progress is preserved","is_correct":true},{"label":"Nothing changes — they can still access the course","is_correct":false},{"label":"Only their quiz scores are deleted","is_correct":false}]',
 'Unpublishing removes learner access immediately, but all progress data is preserved in the database. Re-publishing restores access and progress.',
 8, 1),

('22222222-ffff-ffff-ffff-000000000009',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'The HCMG U heartbeat system stops crediting a learner when: (Select all that apply)',
 'multiple_select',
 '[{"label":"The browser tab is hidden or minimized","is_correct":true},{"label":"The window loses focus","is_correct":true},{"label":"The learner pauses the video","is_correct":true},{"label":"The learner scrolls slowly","is_correct":false}]',
 'Credit stops when the tab is hidden, the window loses focus, or the video is paused. Scroll speed does not affect credit.',
 9, 1),

('22222222-ffff-ffff-ffff-000000000010',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'A digital certificate issued by HCMG U can be verified by external parties. Where does verification happen?',
 'multiple_choice',
 '[{"label":"Only inside HCMG U — requires a login","is_correct":false},{"label":"By emailing info@hcmgloans.com","is_correct":false},{"label":"At hcmgloans.com/university/verify/[id] — no login required","is_correct":true},{"label":"Certificates cannot be shared externally","is_correct":false}]',
 'Every certificate has a unique public verification URL. Anyone can verify a certificate without logging in.',
 10, 1);

-- ── 3. Final Course Assessment ────────────────────────────────────────────────
INSERT INTO uni_assessments (
  id, course_id,
  title, description, instructions,
  passing_pct, max_attempts, time_limit_mins,
  randomize_questions, questions_to_draw,
  is_required, is_active, assessment_type, show_answers_after
) VALUES (
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
  'HCMG U Admin Certification Assessment',
  'The final assessment for the Admin Guide course. Pass with 80% or higher to earn your HCMG U Administrator certification.',
  'This assessment covers all topics from the Admin Guide: Course Studio navigation, lesson types, completion rules, knowledge checks, publishing, and team assignments. You have unlimited attempts. 80% required to pass. Questions are randomized each attempt.',
  80, null, 20,
  true, 12,
  true, true, 'final_assessment', true
);

-- Assessment questions (15 questions — 12 drawn per attempt)
INSERT INTO uni_quiz_questions (id, lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order, points) VALUES

('33333333-aaaa-aaaa-aaaa-000000000001', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Which role in HCMG U has the ability to create courses, publish them, assign them to learners, AND view completion reports?',
 'multiple_choice',
 '[{"label":"Learner","is_correct":false},{"label":"Trainer","is_correct":false},{"label":"Admin","is_correct":false},{"label":"Both Admin and Trainer","is_correct":true}]',
 'Both Admin and Trainer roles can create, publish, and assign courses, and view reports. Admins additionally have platform configuration rights.',
 1, 1),

('33333333-aaaa-aaaa-aaaa-000000000002', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'What is the maximum file size for direct video upload through the HCMG U in-app uploader?',
 'multiple_choice',
 '[{"label":"10 MB","is_correct":false},{"label":"25 MB","is_correct":false},{"label":"50 MB","is_correct":true},{"label":"100 MB","is_correct":false}]',
 'The in-app uploader supports files up to 50MB. Larger files must be uploaded through the Supabase Dashboard to the uni-media storage bucket.',
 2, 1),

('33333333-aaaa-aaaa-aaaa-000000000003', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'True or False: A learner who has the lesson page open in a background tab accumulates dwell-time credit.',
 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'The heartbeat system only credits dwell time when the tab is visible AND the window is focused. A background tab is detected via the Page Visibility API — no credit accumulates.',
 3, 1),

('33333333-aaaa-aaaa-aaaa-000000000004', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'In the Course Studio, which tab would you use to configure whether a completion certificate is issued?',
 'multiple_choice',
 '[{"label":"Overview","is_correct":false},{"label":"Curriculum","is_correct":false},{"label":"Assessments","is_correct":false},{"label":"Settings","is_correct":true}]',
 'Certificate configuration is in the Settings tab. You toggle on "Certificate on Completion," set the title, and optionally configure an expiry period.',
 4, 1),

('33333333-aaaa-aaaa-aaaa-000000000005', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'You have a 15-minute training video. With the default 80% threshold, how many minutes of unique content must a learner watch?',
 'multiple_choice',
 '[{"label":"10 minutes","is_correct":false},{"label":"12 minutes","is_correct":true},{"label":"14 minutes","is_correct":false},{"label":"15 minutes","is_correct":false}]',
 '80% of 15 minutes = 12 minutes. The learner must watch 12 minutes of unique segments. Rewinding the same section does not add to the verified total.',
 5, 1),

('33333333-aaaa-aaaa-aaaa-000000000006', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Which completion mode is most appropriate for a short "Welcome" video where learners just need to watch it without a quiz?',
 'multiple_choice',
 '[{"label":"quiz_pass","is_correct":false},{"label":"any","is_correct":false},{"label":"manual","is_correct":true},{"label":"watch_pct","is_correct":false}]',
 '"manual" mode lets learners click "Mark as Complete" after watching. This avoids watch percentage overhead for content where engagement verification is less critical.',
 6, 1),

('33333333-aaaa-aaaa-aaaa-000000000007', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'When building a quiz question, what is the purpose of the "Explanation" field?',
 'multiple_choice',
 '[{"label":"It is shown to the admin when grading","is_correct":false},{"label":"It is shown to the learner after they submit their answer","is_correct":true},{"label":"It replaces the question text for learners who get it wrong","is_correct":false},{"label":"It is only visible in the Course Studio","is_correct":false}]',
 'The explanation is shown immediately after the learner submits — regardless of right or wrong. This is the most effective learning moment in a quiz.',
 7, 1),

('33333333-aaaa-aaaa-aaaa-000000000008', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'You need to assign a new compliance course to every Loan Officer with a due date 30 days from today. Most efficient approach?',
 'multiple_choice',
 '[{"label":"Manually assign it to each Loan Officer one by one","is_correct":false},{"label":"Assign by Role: Loan Officer, with a due date set 30 days out","is_correct":true},{"label":"Publish the course and let learners self-enroll","is_correct":false},{"label":"Email each Loan Officer a link to the course","is_correct":false}]',
 'Assigning by Role automatically enrolls everyone with that role in one action. Setting a due date triggers compliance tracking — overdue learners appear in red on the HR Overview.',
 8, 1),

('33333333-aaaa-aaaa-aaaa-000000000009', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'True or False: The HeyGen tab in the Lesson Editor accepts both the full video page URL and the embed URL.',
 'true_false',
 '[{"label":"True","is_correct":true},{"label":"False","is_correct":false}]',
 'The studio automatically extracts the embed ID from either URL format. Paste either the share URL or the embed URL — it converts to the correct embed format before saving.',
 9, 1),

('33333333-aaaa-aaaa-aaaa-000000000010', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'What does the "Sort Order" field on a course control?',
 'multiple_choice',
 '[{"label":"The order lessons appear inside the course","is_correct":false},{"label":"The order the course appears in the catalog — lower number appears first","is_correct":true},{"label":"The priority of the course in compliance tracking","is_correct":false},{"label":"The order chapters appear within the course","is_correct":false}]',
 'Sort Order controls where the course appears in the catalog listing. A course with sort_order 1 appears before sort_order 100.',
 10, 1),

('33333333-aaaa-aaaa-aaaa-000000000011', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Which question type would you use for a scenario where there are three correct answers out of five options?',
 'multiple_choice',
 '[{"label":"Multiple Choice","is_correct":false},{"label":"Multiple Select","is_correct":true},{"label":"True / False","is_correct":false},{"label":"Short Answer","is_correct":false}]',
 'Multiple Select allows more than one correct answer. Multiple Choice restricts selection to one answer only.',
 11, 1),

('33333333-aaaa-aaaa-aaaa-000000000012', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'A compliance certificate is set to expire after 365 days. What happens when it expires?',
 'multiple_choice',
 '[{"label":"The certificate is permanently deleted","is_correct":false},{"label":"The certificate is automatically revoked and the learner must re-complete the course","is_correct":true},{"label":"The learner receives a warning but the certificate remains valid","is_correct":false},{"label":"An admin must manually expire it","is_correct":false}]',
 'When a certificate expires, it is automatically revoked. The learner needs to re-complete the course to earn a new certificate.',
 12, 1),

('33333333-aaaa-aaaa-aaaa-000000000013', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'Where in HCMG U would a manager see ONLY their direct reports'' training progress — not the entire organization?',
 'multiple_choice',
 '[{"label":"Admin → Reports","is_correct":false},{"label":"HR Overview","is_correct":false},{"label":"Manager View (/university/manager)","is_correct":true},{"label":"Admin → Assignments","is_correct":false}]',
 'The Manager View is scoped to a manager''s direct reports only. The HR Overview shows the entire organization.',
 13, 1),

('33333333-aaaa-aaaa-aaaa-000000000014', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'A learner''s progress bar is stuck at 45% even though they say they watched the whole video. Most likely causes? (Select all that apply)',
 'multiple_select',
 '[{"label":"They fast-forwarded through sections they hadn''t watched yet","is_correct":true},{"label":"They watched with the browser tab in the background","is_correct":true},{"label":"The completion threshold is set above 45%","is_correct":false},{"label":"They used the wrong browser","is_correct":false}]',
 'Fast-forwarding through unseen segments and watching with the tab hidden are the two most common causes of lower-than-expected verified watch percentages.',
 14, 1),

('33333333-aaaa-aaaa-aaaa-000000000015', null,
 '9c6dfd6e-ecb2-4374-910e-90113b13de7b',
 'True or False: Course objectives added in the Overview tab appear on the course detail page that learners see before enrolling.',
 'true_false',
 '[{"label":"True","is_correct":true},{"label":"False","is_correct":false}]',
 'Learning objectives help learners decide if a course is relevant to them. They appear on the course detail page alongside the description, duration, and difficulty level.',
 15, 1);

-- ── 4. Link assessment questions to the assessment ────────────────────────────
INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order)
SELECT
  'b2c3d4e5-f6a7-8901-bcde-f12345678901',
  id,
  sort_order
FROM uni_quiz_questions
WHERE course_id = '9c6dfd6e-ecb2-4374-910e-90113b13de7b'
  AND lesson_id IS NULL
ORDER BY sort_order;
