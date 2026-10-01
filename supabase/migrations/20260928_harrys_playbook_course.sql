-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Harry's Playbook
-- Complete course seed: 7 modules, 80+ lessons, all knowledge checks,
-- module quizzes, final exam (25 questions), action plan, certification.
--
-- VIDEO TRANSCRIPT NOTE:
-- Every lesson with a HeyGen video script is stored in the `transcript`
-- column. Administrators can copy the script directly from the LMS
-- lesson editor to produce the HeyGen avatar video, then attach the
-- published video URL to that lesson.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  -- ── Course & admin ─────────────────────────────────────────────────────
  v_course_id   uuid := gen_random_uuid();
  v_admin_id    uuid := '736a599a-492a-4585-b845-74b264d0ac9e';

  -- ── Modules ────────────────────────────────────────────────────────────
  v_mod0  uuid := gen_random_uuid();
  v_mod1  uuid := gen_random_uuid();
  v_mod2  uuid := gen_random_uuid();
  v_mod3  uuid := gen_random_uuid();
  v_mod4  uuid := gen_random_uuid();
  v_mod5  uuid := gen_random_uuid();
  v_mod6  uuid := gen_random_uuid();
  v_modf  uuid := gen_random_uuid();

  -- ── Module 0 lessons ───────────────────────────────────────────────────
  v_l0_1  uuid := gen_random_uuid();
  v_l0_2  uuid := gen_random_uuid();
  v_l0_3  uuid := gen_random_uuid();
  v_l0_4  uuid := gen_random_uuid();
  v_l0_5  uuid := gen_random_uuid();
  v_l0_q  uuid := gen_random_uuid();

  -- ── Module 1 lessons ───────────────────────────────────────────────────
  v_l1_1  uuid := gen_random_uuid();
  v_l1_2  uuid := gen_random_uuid();
  v_l1_3  uuid := gen_random_uuid();
  v_l1_4  uuid := gen_random_uuid();
  v_l1_5  uuid := gen_random_uuid();
  v_l1_6  uuid := gen_random_uuid();
  v_l1_7  uuid := gen_random_uuid();
  v_l1_8  uuid := gen_random_uuid();
  v_l1_9  uuid := gen_random_uuid();
  v_l1_10 uuid := gen_random_uuid();
  v_l1_11 uuid := gen_random_uuid();
  v_l1_12 uuid := gen_random_uuid();
  v_l1_13 uuid := gen_random_uuid();
  v_l1_14 uuid := gen_random_uuid();
  v_l1_15 uuid := gen_random_uuid();
  v_l1_16 uuid := gen_random_uuid();
  v_l1_17 uuid := gen_random_uuid();
  v_l1_18 uuid := gen_random_uuid();
  v_l1_19 uuid := gen_random_uuid();
  v_l1_20 uuid := gen_random_uuid();
  v_l1_21 uuid := gen_random_uuid();
  v_l1_22 uuid := gen_random_uuid();
  v_l1_23 uuid := gen_random_uuid();
  v_l1_24 uuid := gen_random_uuid();
  v_l1_25 uuid := gen_random_uuid();
  v_l1_q  uuid := gen_random_uuid();

  -- ── Module 2 lessons ───────────────────────────────────────────────────
  v_l2_1  uuid := gen_random_uuid();
  v_l2_2  uuid := gen_random_uuid();
  v_l2_3  uuid := gen_random_uuid();
  v_l2_4  uuid := gen_random_uuid();
  v_l2_5  uuid := gen_random_uuid();
  v_l2_6  uuid := gen_random_uuid();
  v_l2_7  uuid := gen_random_uuid();
  v_l2_8  uuid := gen_random_uuid();
  v_l2_9  uuid := gen_random_uuid();
  v_l2_10 uuid := gen_random_uuid();
  v_l2_11 uuid := gen_random_uuid();
  v_l2_12 uuid := gen_random_uuid();
  v_l2_13 uuid := gen_random_uuid();
  v_l2_14 uuid := gen_random_uuid();
  v_l2_15 uuid := gen_random_uuid();
  v_l2_16 uuid := gen_random_uuid();
  v_l2_q  uuid := gen_random_uuid();

  -- ── Module 3 lessons ───────────────────────────────────────────────────
  v_l3_1  uuid := gen_random_uuid();
  v_l3_2  uuid := gen_random_uuid();
  v_l3_3  uuid := gen_random_uuid();
  v_l3_4  uuid := gen_random_uuid();
  v_l3_5  uuid := gen_random_uuid();
  v_l3_6  uuid := gen_random_uuid();
  v_l3_7  uuid := gen_random_uuid();
  v_l3_8  uuid := gen_random_uuid();
  v_l3_9  uuid := gen_random_uuid();
  v_l3_10 uuid := gen_random_uuid();
  v_l3_11 uuid := gen_random_uuid();
  v_l3_12 uuid := gen_random_uuid();
  v_l3_13 uuid := gen_random_uuid();
  v_l3_q  uuid := gen_random_uuid();

  -- ── Module 4 lessons ───────────────────────────────────────────────────
  v_l4_1  uuid := gen_random_uuid();
  v_l4_2  uuid := gen_random_uuid();
  v_l4_3  uuid := gen_random_uuid();
  v_l4_4  uuid := gen_random_uuid();
  v_l4_5  uuid := gen_random_uuid();
  v_l4_6  uuid := gen_random_uuid();
  v_l4_7  uuid := gen_random_uuid();
  v_l4_8  uuid := gen_random_uuid();
  v_l4_9  uuid := gen_random_uuid();
  v_l4_10 uuid := gen_random_uuid();
  v_l4_11 uuid := gen_random_uuid();
  v_l4_12 uuid := gen_random_uuid();
  v_l4_13 uuid := gen_random_uuid();
  v_l4_14 uuid := gen_random_uuid();
  v_l4_q  uuid := gen_random_uuid();

  -- ── Module 5 lessons ───────────────────────────────────────────────────
  v_l5_1  uuid := gen_random_uuid();
  v_l5_2  uuid := gen_random_uuid();
  v_l5_3  uuid := gen_random_uuid();
  v_l5_4  uuid := gen_random_uuid();
  v_l5_5  uuid := gen_random_uuid();
  v_l5_6  uuid := gen_random_uuid();
  v_l5_7  uuid := gen_random_uuid();
  v_l5_8  uuid := gen_random_uuid();
  v_l5_9  uuid := gen_random_uuid();
  v_l5_10 uuid := gen_random_uuid();
  v_l5_11 uuid := gen_random_uuid();
  v_l5_12 uuid := gen_random_uuid();
  v_l5_13 uuid := gen_random_uuid();
  v_l5_14 uuid := gen_random_uuid();
  v_l5_15 uuid := gen_random_uuid();
  v_l5_16 uuid := gen_random_uuid();
  v_l5_17 uuid := gen_random_uuid();
  v_l5_18 uuid := gen_random_uuid();
  v_l5_19 uuid := gen_random_uuid();
  v_l5_20 uuid := gen_random_uuid();
  v_l5_q  uuid := gen_random_uuid();

  -- ── Module 6 lessons ───────────────────────────────────────────────────
  v_l6_1  uuid := gen_random_uuid();
  v_l6_2  uuid := gen_random_uuid();
  v_l6_3  uuid := gen_random_uuid();
  v_l6_4  uuid := gen_random_uuid();
  v_l6_5  uuid := gen_random_uuid();
  v_l6_6  uuid := gen_random_uuid();
  v_l6_7  uuid := gen_random_uuid();
  v_l6_8  uuid := gen_random_uuid();
  v_l6_9  uuid := gen_random_uuid();
  v_l6_10 uuid := gen_random_uuid();
  v_l6_11 uuid := gen_random_uuid();
  v_l6_12 uuid := gen_random_uuid();
  v_l6_13 uuid := gen_random_uuid();
  v_l6_14 uuid := gen_random_uuid();
  v_l6_15 uuid := gen_random_uuid();
  v_l6_16 uuid := gen_random_uuid();
  v_l6_17 uuid := gen_random_uuid();
  v_l6_18 uuid := gen_random_uuid();
  v_l6_19 uuid := gen_random_uuid();
  v_l6_q  uuid := gen_random_uuid();

  -- ── Final module lessons ───────────────────────────────────────────────
  v_lf_1  uuid := gen_random_uuid();
  v_lf_exam  uuid := gen_random_uuid();
  v_lf_action uuid := gen_random_uuid();

  -- ── Assessment IDs ─────────────────────────────────────────────────────
  v_mod0_assessment  uuid := gen_random_uuid();
  v_mod1_assessment  uuid := gen_random_uuid();
  v_mod2_assessment  uuid := gen_random_uuid();
  v_mod3_assessment  uuid := gen_random_uuid();
  v_mod4_assessment  uuid := gen_random_uuid();
  v_mod5_assessment  uuid := gen_random_uuid();
  v_mod6_assessment  uuid := gen_random_uuid();
  v_final_assessment uuid := gen_random_uuid();

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════
-- IDEMPOTENT: remove any previous run
-- ═══════════════════════════════════════════════════════════════════════════
DELETE FROM uni_courses WHERE slug = 'harrys-playbook';

-- ═══════════════════════════════════════════════════════════════════════════
-- COURSE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_courses (
  id, slug, title, short_description, description,
  category, difficulty, duration_label,
  pill_color, is_required, is_published, sort_order,
  content_status, audience, instructor_name,
  completion_rules, created_by
) VALUES (
  v_course_id,
  'harrys-playbook',
  'Harry''s Playbook',
  'Train. Learn. Close. Win.',
  E'Harry''s Playbook is the official HCMG Success training experience built around the principles, behaviors, systems, and standards that drive consistent performance at HCMG.\n\n'
  'This course teaches employees how to think, communicate, handle objections, create client-centered urgency, ask for the business, work as a team, manage activity, own outcomes, protect their time, manage leads, understand the loan workflow, and build the habits required for long-term performance.\n\n'
  'This is not a course about memorizing sales scripts.\n\n'
  'It is a course about developing a standard.',
  'sales',
  'intermediate',
  '4 hr',
  'orange',
  true,
  true,
  10,
  'published',
  'HCMG Employees',
  'Harry',
  '{"require_all_lessons": true, "require_assessment": true, "passing_score": 80}',
  v_admin_id
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LEARNING OBJECTIVES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_course_objectives (id, course_id, objective, sort_order) VALUES
  (gen_random_uuid(), v_course_id, 'Explain the HCMG Success Formula', 1),
  (gen_random_uuid(), v_course_id, 'Explain HCMG values and how they translate into behavior', 2),
  (gen_random_uuid(), v_course_id, 'Understand why objections should be treated as requests for greater certainty', 3),
  (gen_random_uuid(), v_course_id, 'Apply the HCMG objection-handling framework', 4),
  (gen_random_uuid(), v_course_id, 'Respond appropriately to common mortgage objections', 5),
  (gen_random_uuid(), v_course_id, 'Conduct meaningful discovery before attempting to close', 6),
  (gen_random_uuid(), v_course_id, 'Ask for the business confidently and professionally', 7),
  (gen_random_uuid(), v_course_id, 'Distinguish commitment from compliance', 8),
  (gen_random_uuid(), v_course_id, 'Demonstrate what "Decently Bold" means', 9),
  (gen_random_uuid(), v_course_id, 'Explain the difference between pressure and client-centered urgency', 10),
  (gen_random_uuid(), v_course_id, 'Create urgency without manufacturing pressure', 11),
  (gen_random_uuid(), v_course_id, 'Use discovery to understand what matters to a borrower', 12),
  (gen_random_uuid(), v_course_id, 'Understand the Five Whys', 13),
  (gen_random_uuid(), v_course_id, 'Explain accountability as ownership rather than blame', 14),
  (gen_random_uuid(), v_course_id, 'Use activity metrics to evaluate performance', 15),
  (gen_random_uuid(), v_course_id, 'Explain the HCMG Daily Success Scorecard', 16),
  (gen_random_uuid(), v_course_id, 'Understand the importance of consistency', 17),
  (gen_random_uuid(), v_course_id, 'Apply time-blocking principles', 18),
  (gen_random_uuid(), v_course_id, 'Explain HCMG lead-management standards', 19),
  (gen_random_uuid(), v_course_id, 'Explain CRM documentation expectations', 20),
  (gen_random_uuid(), v_course_id, 'Explain the HCMG loan workflow', 21),
  (gen_random_uuid(), v_course_id, 'Explain why cleaner files improve downstream execution', 22),
  (gen_random_uuid(), v_course_id, 'Understand the habits of high performers', 23),
  (gen_random_uuid(), v_course_id, 'Understand the HCMG activity model', 24),
  (gen_random_uuid(), v_course_id, 'Build a personal Championship Plan', 25),
  (gen_random_uuid(), v_course_id, 'Translate Harry''s principles into daily behavior', 26);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active) VALUES
  (v_mod0, v_course_id, 'Module 0: Welcome to Harry''s Playbook', 'An introduction to the purpose, structure, and standards of Harry''s Playbook.', 0, true),
  (v_mod1, v_course_id, 'Module 1: Harry Handles Objections', 'How to think about objections, apply the HCMG objection framework, and respond to the ten most common mortgage objections.', 1, true),
  (v_mod2, v_course_id, 'Module 2: Harry Closes as a Team', 'Asking for the sale, Decently Bold behavior, discovery, commitment vs. compliance, and teamwork in closing.', 2, true),
  (v_mod3, v_course_id, 'Module 3: Harry Creates Urgency', 'The difference between pressure and urgency, ethical urgency, the Five Whys, and connecting to borrower goals.', 3, true),
  (v_mod4, v_course_id, 'Module 4: Harry Owns the Outcome', 'Accountability as ownership, the daily scorecard, consistency, time management, and goal setting.', 4, true),
  (v_mod5, v_course_id, 'Module 5: HCMG Success OS', 'Lead management standards, CRM documentation, the HCMG loan workflow, and the cleaner file principle.', 5, true),
  (v_mod6, v_course_id, 'Module 6: Harry''s Championship Playbook', 'Top producer habits, the HCMG activity model, time blocking, and the personal Championship Plan.', 6, true),
  (v_modf, v_course_id, 'Final: Harry''s Playbook Certification', 'Final exam, action plan, and certification requirements.', 7, true);

-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 0: WELCOME TO HARRY'S PLAYBOOK
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Lesson 0.1 — Welcome to Harry's Playbook (VIDEO) ──────────────────────
-- 🎬 HEYGEN VIDEO: "Welcome to Harry's Playbook" — attach video URL after production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l0_1, v_course_id, v_mod0,
  'Welcome to Harry''s Playbook',
  'Harry introduces the purpose of the Playbook and what the course is designed to change.',
  'video', 1, 1, true, 'watch_pct', 80, 240, '4 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 0.1\n'
  '  Title: Welcome to Harry''s Playbook\n'
  '  Speaker: Harry (avatar)\n'
  '  Background: HCMG branded\n'
  '  On-screen text: Course title card at open\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Welcome to Harry''s Playbook.\n\n'
  'This course is about how we operate at HCMG.\n\n'
  'How we think.\n\n'
  'How we communicate.\n\n'
  'How we handle objections.\n\n'
  'How we create urgency.\n\n'
  'How we ask for the business.\n\n'
  'How we manage our leads.\n\n'
  'How we work our pipeline.\n\n'
  'And most importantly, how we take ownership of the outcome.\n\n'
  'This isn''t about memorizing a script.\n\n'
  'It''s about developing a standard.\n\n'
  'Because knowing what to do and consistently doing what you know are two different things.\n\n'
  'Throughout this course, we''re going to work on both.\n\n'
  'You''re going to learn the principles.\n\n'
  'You''re going to see the standards.\n\n'
  'You''re going to work through real-world situations.\n\n'
  'And you''re going to be challenged to think about how those principles apply to your own work.\n\n'
  'So don''t just watch this course.\n\n'
  'Participate in it.\n\n'
  'Think about it.\n\n'
  'Answer the questions honestly.\n\n'
  'And most importantly, apply it.\n\n'
  'Because the value of Harry''s Playbook isn''t what you know when you finish the course.\n\n'
  'The value is what you do differently after you finish it.\n\n'
  'Let''s get started.'
);

-- ── Lesson 0.2 — What This Course Will Change (VIDEO) ─────────────────────
-- 🎬 HEYGEN VIDEO: "What This Course Will Change" — attach video URL after production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l0_2, v_course_id, v_mod0,
  'What This Course Will Change',
  'The HCMG Success Formula: Mindset, Activity, Skill, and Accountability — and why all four must work together.',
  'video', 2, 2, true, 'watch_pct', 80, 180, '3 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 0.2\n'
  '  Title: What This Course Will Change\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen text: MINDSET + ACTIVITY + SKILL + ACCOUNTABILITY\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Successful people don''t just know what to do.\n\n'
  'They consistently do what they know.\n\n'
  'That''s what this Playbook is about.\n\n'
  'Mindset.\n\n'
  'Activity.\n\n'
  'Skill.\n\n'
  'Accountability.\n\n'
  'Those four things work together.\n\n'
  'If one is missing, performance suffers.\n\n'
  'You can have a great attitude and still fail to take enough action.\n\n'
  'You can be extremely active and still lack the skill to convert that activity into results.\n\n'
  'You can have the skill and the activity but refuse to take ownership when things don''t go your way.\n\n'
  'And you can understand accountability but never develop the mindset necessary to keep going.\n\n'
  'The goal is balance.\n\n'
  'Mindset gives you the foundation.\n\n'
  'Activity gives you opportunities.\n\n'
  'Skill helps you convert those opportunities.\n\n'
  'Accountability keeps you improving.\n\n'
  'So throughout this course, don''t just ask yourself:\n\n'
  '"Do I understand this?"\n\n'
  'Ask yourself:\n\n'
  '"Am I actually doing this?"\n\n'
  'That''s where the Playbook starts to become valuable.'
);

-- Written content for 0.2
INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (
  v_l0_2, v_course_id,
  'Which four components make up the HCMG Success Formula?',
  'multiple_choice',
  '[{"label":"Motivation, Talent, Luck, Timing","is_correct":false},{"label":"Mindset, Activity, Skill, Accountability","is_correct":true},{"label":"Sales, Marketing, Closing, Recruiting","is_correct":false},{"label":"Goals, Money, Leads, Technology","is_correct":false}]',
  'The HCMG Success Formula is Mindset + Activity + Skill + Accountability. Each component supports the others — removing any one weakens overall performance.',
  1
);

-- ── Lesson 0.3 — The HCMG Standard (VIDEO) ────────────────────────────────
-- 🎬 HEYGEN VIDEO: "The HCMG Standard" — attach video URL after production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l0_3, v_course_id, v_mod0,
  'The HCMG Standard',
  'HCMG values — Teamwork, Integrity, Innovation, Excellence, Community, Accountability — as behaviors and decisions.',
  'video', 3, 3, true, 'watch_pct', 80, 180, '3 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 0.3\n'
  '  Title: The HCMG Standard\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen text: "One Team. One Standard. Close to Perfection."\n'
  '═══════════════════════════════════════════════════════\n\n'
  'At HCMG, the standard is bigger than simply getting a loan closed.\n\n'
  'We care about how we get there.\n\n'
  'Teamwork.\n\n'
  'Integrity.\n\n'
  'Innovation.\n\n'
  'Excellence.\n\n'
  'Community.\n\n'
  'Accountability.\n\n'
  'Those aren''t just words.\n\n'
  'They''re behaviors.\n\n'
  'They''re decisions.\n\n'
  'They''re standards.\n\n'
  'Teamwork means we don''t operate like isolated individuals.\n\n'
  'Integrity means we do what we say we''re going to do and communicate honestly.\n\n'
  'Innovation means we''re willing to improve.\n\n'
  'Excellence means good enough isn''t the finish line.\n\n'
  'Community means we understand that what we do affects more than just ourselves.\n\n'
  'And accountability means we own our responsibilities and our actions.\n\n'
  'That''s the standard.\n\n'
  'One team.\n\n'
  'One standard.\n\n'
  'Close to perfection.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (
  v_l0_3, v_course_id,
  'Which statement best describes HCMG''s values?',
  'multiple_choice',
  '[{"label":"They are marketing slogans only","is_correct":false},{"label":"They describe behaviors and standards expected in the organization","is_correct":true},{"label":"They only apply to managers","is_correct":false},{"label":"They only apply when a loan is closing","is_correct":false}]',
  'HCMG values — Teamwork, Integrity, Innovation, Excellence, Community, and Accountability — are behavioral standards that apply to every employee in every interaction.',
  1
);

-- ── Lesson 0.4 — The HCMG Success Formula (VIDEO) ─────────────────────────
-- 🎬 HEYGEN VIDEO: "The HCMG Success Formula" — attach video URL after production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l0_4, v_course_id, v_mod0,
  'The HCMG Success Formula',
  'A deeper look at how Mindset, Activity, Skill, and Accountability work together — and what happens when one is missing.',
  'video', 4, 4, true, 'watch_pct', 80, 180, '3 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 0.4\n'
  '  Title: The HCMG Success Formula\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen visual: MINDSET + ACTIVITY + SKILL + ACCOUNTABILITY formula\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Let''s break down the formula.\n\n'
  'Mindset.\n\n'
  'Activity.\n\n'
  'Skill.\n\n'
  'Accountability.\n\n'
  'Mindset determines how you approach the work.\n\n'
  'Activity creates opportunities.\n\n'
  'Skill determines how effectively you handle those opportunities.\n\n'
  'Accountability determines whether you learn, adjust, and continue improving.\n\n'
  'Think about what happens when one piece is missing.\n\n'
  'Mindset without activity doesn''t create enough opportunities.\n\n'
  'Activity without skill creates wasted opportunities.\n\n'
  'Skill without accountability can lead to inconsistency.\n\n'
  'And accountability without action doesn''t produce results.\n\n'
  'The formula works together.\n\n'
  'That''s the foundation of the Playbook.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (
  v_l0_4, v_course_id,
  'A loan officer has strong sales skills but rarely follows up with leads. Which part of the Success Formula most directly needs attention?',
  'multiple_choice',
  '[{"label":"Activity","is_correct":true},{"label":"Skill","is_correct":false},{"label":"Mindset only","is_correct":false},{"label":"Product knowledge only","is_correct":false}]',
  'Skill without consistent activity means opportunities are being missed. Activity is what creates the opportunities that skill can then convert.',
  1
);

-- ── Lesson 0.5 — How to Use Harry's Playbook (VIDEO) ──────────────────────
-- 🎬 HEYGEN VIDEO: "How to Use Harry's Playbook" — attach video URL after production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l0_5, v_course_id, v_mod0,
  'How to Use Harry''s Playbook',
  'The mindset for getting the most out of this course — participation, honest reflection, and application.',
  'video', 5, 5, true, 'watch_pct', 80, 150, '2 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 0.5\n'
  '  Title: How to Use Harry''s Playbook\n'
  '  Speaker: Harry (avatar)\n'
  '═══════════════════════════════════════════════════════\n\n'
  'One last thing before we get into the Playbook.\n\n'
  'Don''t treat this like something you have to finish.\n\n'
  'Treat it like something you have to use.\n\n'
  'When you see a concept that applies to you, stop and think about it.\n\n'
  'When you answer a scenario question, don''t just look for the answer.\n\n'
  'Ask yourself what you would actually do.\n\n'
  'When you complete the action plan at the end, don''t write what sounds good.\n\n'
  'Write what you''re actually willing to change.\n\n'
  'The goal isn''t to complete training.\n\n'
  'The goal is to improve performance.\n\n'
  'Let''s get to work.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (
  v_l0_5, v_course_id,
  'What is the best way to approach Harry''s Playbook?',
  'multiple_choice',
  '[{"label":"Finish as quickly as possible","is_correct":false},{"label":"Memorize every sentence","is_correct":false},{"label":"Learn the principles and apply them to daily behavior","is_correct":true},{"label":"Focus only on passing the final exam","is_correct":false}]',
  'The Playbook''s value is in application, not completion. The goal is to change behavior — not just to accumulate a passing score.',
  1
);

-- ── Lesson 0.6 — Module 0 Welcome (written overview) ──────────────────────
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l0_q, v_course_id, v_mod0,
  'Module 0 Knowledge Check',
  'Review your understanding of the HCMG Success Formula and the purpose of Harry''s Playbook.',
  'knowledge_check', 6, 6, true, 'quiz_pass', 80, 600, '10 min',
  NULL
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l0_q, v_course_id,
 'What is Harry''s Playbook designed to develop?',
 'multiple_choice',
 '[{"label":"Individual sales scripts","is_correct":false},{"label":"A repeatable standard of mindset, skill, activity, and accountability","is_correct":true},{"label":"A list of approved responses to every objection","is_correct":false},{"label":"Product knowledge only","is_correct":false}]',
 'Harry''s Playbook is about developing a consistent HCMG standard — not memorizing scripts.',
 1),
(v_l0_q, v_course_id,
 'What are the four parts of the HCMG Success Formula?',
 'multiple_choice',
 '[{"label":"Sales, Service, Speed, Systems","is_correct":false},{"label":"Mindset, Activity, Skill, Accountability","is_correct":true},{"label":"Goals, Plans, Results, Rewards","is_correct":false},{"label":"Leads, Calls, Applications, Closings","is_correct":false}]',
 'Mindset + Activity + Skill + Accountability is the HCMG Success Formula.',
 2),
(v_l0_q, v_course_id,
 'Why is accountability part of the formula?',
 'multiple_choice',
 '[{"label":"It is used to blame people","is_correct":false},{"label":"It keeps employees learning, adjusting, and improving","is_correct":true},{"label":"It guarantees production","is_correct":false},{"label":"It replaces skill","is_correct":false}]',
 'Accountability ensures that employees learn from what didn''t work and continuously improve.',
 3),
(v_l0_q, v_course_id,
 'Which HCMG value relates to owning responsibilities and actions?',
 'multiple_choice',
 '[{"label":"Excellence","is_correct":false},{"label":"Innovation","is_correct":false},{"label":"Accountability","is_correct":true},{"label":"Community","is_correct":false}]',
 'Accountability is the HCMG value that directly speaks to owning your responsibilities and your actions.',
 4),
(v_l0_q, v_course_id,
 'What does activity create?',
 'multiple_choice',
 '[{"label":"Guaranteed closings","is_correct":false},{"label":"Opportunities","is_correct":true},{"label":"Leads automatically","is_correct":false},{"label":"Perfect skills","is_correct":false}]',
 'Activity creates opportunities. Skill determines how effectively those opportunities are converted.',
 5),
(v_l0_q, v_course_id,
 'What does "One Team. One Standard." communicate?',
 'multiple_choice',
 '[{"label":"That everyone must say the same words","is_correct":false},{"label":"That HCMG operates with a shared behavioral standard, not individual preferences","is_correct":true},{"label":"That all employees do the same job","is_correct":false},{"label":"That management sets all standards without input","is_correct":false}]',
 'One Team. One Standard. means HCMG shares a behavioral commitment — the standard applies to everyone, not just certain roles.',
 6),
(v_l0_q, v_course_id,
 'Why isn''t the Playbook simply a script book?',
 'multiple_choice',
 '[{"label":"Scripts are illegal","is_correct":false},{"label":"Because consistent performance comes from developing a standard, not reciting memorized lines","is_correct":true},{"label":"Scripts are too long","is_correct":false},{"label":"Because customers dislike scripts","is_correct":false}]',
 'Scripts produce mechanical responses. The Playbook develops thinking, judgment, and consistent behavior.',
 7),
(v_l0_q, v_course_id,
 'What should learners ask themselves during training?',
 'multiple_choice',
 '[{"label":"How quickly can I finish this?","is_correct":false},{"label":"Am I actually doing this in my daily work?","is_correct":true},{"label":"How do I pass the quiz?","is_correct":false},{"label":"What is the minimum required?","is_correct":false}]',
 'The Playbook asks learners to move beyond understanding to application — "Am I actually doing this?"',
 8),
(v_l0_q, v_course_id,
 'What does skill help employees do?',
 'multiple_choice',
 '[{"label":"Create more activity","is_correct":false},{"label":"Convert opportunities into results","is_correct":true},{"label":"Set better goals","is_correct":false},{"label":"Avoid accountability","is_correct":false}]',
 'Skill converts the opportunities created by activity into actual results.',
 9),
(v_l0_q, v_course_id,
 'What is the purpose of the course?',
 'multiple_choice',
 '[{"label":"To give employees a memorizable list of responses","is_correct":false},{"label":"To develop a shared HCMG standard for performance","is_correct":true},{"label":"To teach mortgage product knowledge","is_correct":false},{"label":"To replace individual judgment entirely","is_correct":false}]',
 'Harry''s Playbook builds a shared standard — a way of thinking, communicating, and executing that is consistent across HCMG.',
 10);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 1: HARRY HANDLES OBJECTIONS
-- ═══════════════════════════════════════════════════════════════════════════

-- 🎬 HEYGEN VIDEO: "Why 'No' Feels Personal" — Lesson 1.1
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_1, v_course_id, v_mod1, 'Why "No" Feels Personal', 'Reframing objections: an objection is information, not rejection — and curiosity is the right first response.', 'video', 7, 1, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.1\n'
'  Title: Why "No" Feels Personal\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Let''s talk about objections.\n\n'
'Every salesperson hears them.\n\n'
'And if you''ve been in sales long enough, you''ve probably heard the same objections over and over.\n\n'
'Here''s the mistake.\n\n'
'People hear an objection and immediately feel like they have to defend themselves.\n\n'
'Slow down.\n\n'
'A borrower saying no to something doesn''t automatically mean they''re saying no to you.\n\n'
'They may be confused.\n\n'
'They may be afraid.\n\n'
'They may need more information.\n\n'
'They may have had a bad experience.\n\n'
'They may simply not understand what happens next.\n\n'
'Your job isn''t to fight the objection.\n\n'
'Your job is to understand it.\n\n'
'Because once you understand what''s underneath the objection, you have a much better opportunity to create certainty.\n\n'
'That''s the mindset we''re going to build in this module.');

-- 🎬 HEYGEN VIDEO: "Every Objection Is a Request for More Certainty" — Lesson 1.2
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_2, v_course_id, v_mod1, 'Every Objection Is a Request for More Certainty', 'The foundational idea: objections reveal what the borrower needs to feel certain — not that they want to say no.', 'video', 8, 2, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.2\n'
'  Title: Every Objection Is a Request for More Certainty\n'
'  Speaker: Harry (avatar)\n'
'  On-screen key phrase: "Every objection is a request for more certainty."\n'
'═══════════════════════════════════════════════════════\n\n'
'Here''s one of the most important ideas in the entire Playbook.\n\n'
'Every objection is simply a request for more certainty.\n\n'
'Think about that.\n\n'
'When someone says: "I want to think about it."\n\n'
'They''re telling you there''s something they''re not certain about.\n\n'
'When someone says: "Your rate is too high."\n\n'
'They''re telling you something about how they''re evaluating the opportunity.\n\n'
'When someone says: "I don''t trust lenders."\n\n'
'There''s a certainty problem.\n\n'
'When someone says: "I need to talk to my spouse."\n\n'
'There may be information they want to discuss before making a decision.\n\n'
'So don''t immediately try to overcome the words.\n\n'
'Understand the reason behind the words.\n\n'
'That''s the difference.\n\n'
'The best objection handlers aren''t the people who talk the fastest.\n\n'
'They''re the people who listen well enough to discover what''s really happening.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l1_2, v_course_id,
'A borrower says, "I want to think about it." According to Harry''s principle, what should the loan officer assume?',
'multiple_choice',
'[{"label":"The borrower definitely wants to say no","is_correct":false},{"label":"The borrower needs more certainty or clarification before deciding","is_correct":true},{"label":"The borrower is wasting time","is_correct":false},{"label":"The borrower should be pressured","is_correct":false}]',
'"I want to think about it" is not a no — it is a signal that something needs to become clearer. The loan officer''s job is to discover what that something is.',
1);

-- 🎬 HEYGEN VIDEO: "Never Fight the Borrower" — Lesson 1.3
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_3, v_course_id, v_mod1, 'Never Fight the Borrower', 'When someone pushes back, the goal is clarity — not conflict. Slow down, listen, and understand before responding.', 'video', 9, 3, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.3\n'
'  Title: Never Fight the Borrower\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'When somebody pushes back, your first reaction matters.\n\n'
'You can fight.\n\n'
'Or you can understand.\n\n'
'Slow down.\n\n'
'Listen.\n\n'
'Ask.\n\n'
'Understand.\n\n'
'Then respond.\n\n'
'Confidence doesn''t mean talking over somebody.\n\n'
'Confidence means you can stay calm when somebody challenges you.\n\n'
'If you become defensive, the borrower has to defend their position.\n\n'
'Now you have two people arguing instead of one person helping another person make a decision.\n\n'
'Your job is to create clarity.\n\n'
'Not conflict.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l1_3, v_course_id,
'Borrower: "I don''t think your company is right for me." What is the strongest first response?',
'multiple_choice',
'[{"label":"\"Why? We''ve helped plenty of people.\"","is_correct":false},{"label":"\"I think you''re making a mistake.\"","is_correct":false},{"label":"\"I understand. Can you tell me what concerns you most?\"","is_correct":true},{"label":"\"You should give us a chance.\"","is_correct":false}]',
'Slowing down and discovering the underlying concern — rather than becoming defensive — keeps the conversation productive and signals professionalism.',
1);

-- 🎬 HEYGEN VIDEO: "The HCMG Objection Framework" — Lesson 1.4
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_4, v_course_id, v_mod1, 'The HCMG Objection Framework', 'The seven-step framework: Listen → Clarify → Validate → Discover → Bridge → Ask → Close.', 'video', 10, 4, true, 'watch_pct', 80, 200, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.4\n'
'  Title: The HCMG Objection Framework\n'
'  Speaker: Harry (avatar)\n'
'  On-screen visual: LISTEN → CLARIFY → VALIDATE → DISCOVER → BRIDGE → ASK → CLOSE\n'
'═══════════════════════════════════════════════════════\n\n'
'Here''s the framework.\n\n'
'Listen.\n\n'
'Clarify.\n\n'
'Validate.\n\n'
'Discover.\n\n'
'Bridge.\n\n'
'Ask.\n\n'
'Close.\n\n'
'Seven steps.\n\n'
'And the order matters.\n\n'
'Listen before you answer.\n\n'
'Clarify what the borrower actually means.\n\n'
'Validate the concern.\n\n'
'Discover what''s underneath it.\n\n'
'Bridge from that concern to relevant information.\n\n'
'Ask for the next step.\n\n'
'Then close.\n\n'
'Don''t treat this like a magic script.\n\n'
'It''s a conversation framework.\n\n'
'The goal is to understand before you respond.');

-- 🎬 HEYGEN VIDEO: "Listen" — Lesson 1.5
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_5, v_course_id, v_mod1, 'Step 1: Listen', 'Why listening is harder than it sounds — and why you can''t clarify something you haven''t actually heard.', 'video', 11, 5, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.5\n'
'  Title: Step 1: Listen\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Step one is listen.\n\n'
'That sounds simple.\n\n'
'But it''s not always easy.\n\n'
'A lot of salespeople start preparing their answer while the borrower is still talking.\n\n'
'Don''t.\n\n'
'Listen for the actual concern.\n\n'
'Listen for the words.\n\n'
'Listen for the emotion.\n\n'
'Listen for what they''re not saying.\n\n'
'And most importantly, don''t interrupt just because you think you know where the conversation is going.\n\n'
'Let them finish.\n\n'
'You can''t clarify something you haven''t actually heard.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l1_5, v_course_id,
'Why is listening the first step in the objection framework?',
'multiple_choice',
'[{"label":"It gives you time to think of an answer","is_correct":false},{"label":"You need to understand the concern before you can respond appropriately","is_correct":true},{"label":"It makes the borrower feel pressured","is_correct":false},{"label":"It replaces the need to ask questions","is_correct":false}]',
'Responding without fully listening leads to addressing the wrong concern. The framework starts with listening because the response must be based on what was actually said.',
1);

-- 🎬 HEYGEN VIDEO: "Clarify" — Lesson 1.6
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_6, v_course_id, v_mod1, 'Step 2: Clarify', 'Turn a vague objection into something specific by asking — not assuming.', 'video', 12, 6, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.6\n'
'  Title: Step 2: Clarify\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Once you''ve listened, clarify.\n\n'
'Don''t assume.\n\n'
'Ask.\n\n'
'For example:\n\n'
'"When you say you''re concerned about the rate, what specifically are you comparing it to?"\n\n'
'Or:\n\n'
'"When you say you want to think about it, what part are you still considering?"\n\n'
'The purpose of clarification is to turn a vague objection into something specific.\n\n'
'Specific problems are easier to address than assumptions.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l1_6, v_course_id,
'Which question best demonstrates clarification?',
'multiple_choice',
'[{"label":"\"Why don''t you trust us?\"","is_correct":false},{"label":"\"What specifically are you still considering?\"","is_correct":true},{"label":"\"Can I explain why we''re right?\"","is_correct":false},{"label":"\"Would you like to move forward?\"","is_correct":false}]',
'Clarification turns a vague concern into a specific one. "What specifically are you still considering?" invites the borrower to define their uncertainty rather than assuming the loan officer already knows.',
1);

-- 🎬 HEYGEN VIDEO: "Validate" — Lesson 1.7
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_7, v_course_id, v_mod1, 'Step 3: Validate', 'Acknowledging a concern lowers defensiveness — you don''t have to agree, but you have to acknowledge.', 'video', 13, 7, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.7\n'
'  Title: Step 3: Validate\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Next, validate.\n\n'
'Validation doesn''t mean you agree with everything the borrower says.\n\n'
'It means you acknowledge that their concern is reasonable to discuss.\n\n'
'You can say:\n\n'
'"I understand why you''d want to look at that."\n\n'
'Or: "That makes sense."\n\n'
'Or: "I can understand why that''s important."\n\n'
'Validation lowers defensiveness.\n\n'
'The borrower feels heard.\n\n'
'And once people feel heard, they''re usually more willing to have a real conversation.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l1_7, v_course_id,
'What does validation mean in the context of objection handling?',
'multiple_choice',
'[{"label":"Agreeing with every borrower statement","is_correct":false},{"label":"Acknowledging the concern without necessarily agreeing with the conclusion","is_correct":true},{"label":"Ending the conversation","is_correct":false},{"label":"Giving a discount","is_correct":false}]',
'Validation says "I hear you and your concern is worth discussing" — not "you are right." This reduces defensiveness so a real conversation can happen.',
1);

-- 🎬 HEYGEN VIDEO: "Discover" — Lesson 1.8
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_8, v_course_id, v_mod1, 'Step 4: Discover', 'Asking underneath the objection — the first concern is often not the real concern.', 'video', 14, 8, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.8\n'
'  Title: Step 4: Discover\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Now we discover.\n\n'
'This is where you figure out what''s really underneath the objection.\n\n'
'Ask questions.\n\n'
'"When you say you''re not ready, what would need to happen for you to feel ready?"\n\n'
'"What concerns you most about moving forward?"\n\n'
'"What are you hoping to accomplish?"\n\n'
'"What''s most important to you?"\n\n'
'Discovery turns an objection into information.\n\n'
'Don''t rush through this part.\n\n'
'Sometimes the first objection isn''t the real objection.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l1_8, v_course_id,
'Borrower: "I''m not ready yet." Which response best follows the discovery step?',
'multiple_choice',
'[{"label":"\"Okay, call me when you''re ready.\"","is_correct":false},{"label":"\"You need to act now.\"","is_correct":false},{"label":"\"What would need to happen for you to feel ready?\"","is_correct":true},{"label":"\"There''s nothing to worry about.\"","is_correct":false}]',
'Discovery moves the conversation forward without pressure by inviting the borrower to define what readiness actually means to them.',
1);

-- 🎬 HEYGEN VIDEO: "Bridge" — Lesson 1.9
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_9, v_course_id, v_mod1, 'Step 5: Bridge', 'Connecting the borrower''s concern to the information that actually matters to them — not an information dump.', 'video', 15, 9, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.9\n'
'  Title: Step 5: Bridge\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Once you''ve discovered the concern, bridge.\n\n'
'The bridge connects what the borrower told you to information that actually matters to them.\n\n'
'Don''t dump information.\n\n'
'Don''t give a twenty-minute speech.\n\n'
'Give the information that addresses the concern.\n\n'
'If the borrower tells you what''s important, your response should connect to what''s important.\n\n'
'That''s what makes the conversation feel relevant.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l1_9, v_course_id,
'What is the purpose of the bridge step?',
'multiple_choice',
'[{"label":"To change the subject","is_correct":false},{"label":"To connect the borrower''s concern to relevant information or a solution","is_correct":true},{"label":"To overwhelm the borrower with information","is_correct":false},{"label":"To avoid asking questions","is_correct":false}]',
'The bridge step ensures the loan officer is responding to what matters to the borrower — not delivering a generic pitch.',
1);

-- 🎬 HEYGEN VIDEO: "Ask" — Lesson 1.10
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_10, v_course_id, v_mod1, 'Step 6: Ask', 'After addressing the concern, you must ask for the next step — don''t stop at explaining.', 'video', 16, 10, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.10\n'
'  Title: Step 6: Ask\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'After you''ve addressed the concern, ask.\n\n'
'This is where a lot of salespeople stop.\n\n'
'They explain.\n\n'
'They educate.\n\n'
'They answer questions.\n\n'
'And then they never ask for the next step.\n\n'
'Don''t make that mistake.\n\n'
'If the concern has been addressed, ask:\n\n'
'"Does that answer your question?"\n\n'
'"Would it make sense to move forward?"\n\n'
'"Are you comfortable taking the next step?"\n\n'
'"Let''s get your application started."\n\n'
'You can''t close what you don''t ask for.');

-- 🎬 HEYGEN VIDEO: "Close" — Lesson 1.11
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_11, v_course_id, v_mod1, 'Step 7: Close', 'Closing is helping someone make a clear decision — not forcing them. Leaving a borrower confused is the real mistake.', 'video', 17, 11, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.11\n'
'  Title: Step 7: Close\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Closing isn''t forcing somebody.\n\n'
'Closing is helping somebody make a clear decision about the next step.\n\n'
'If you''ve listened.\n\n'
'If you''ve clarified.\n\n'
'If you''ve validated.\n\n'
'If you''ve discovered.\n\n'
'If you''ve bridged.\n\n'
'And if you''ve answered the concern.\n\n'
'Then asking for the decision is part of serving the client.\n\n'
'Don''t be afraid of the close.\n\n'
'Be afraid of leaving a borrower confused about what happens next.');

-- 🎬 HEYGEN VIDEO: "The Top Mortgage Objections" — Lesson 1.12
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_12, v_course_id, v_mod1, 'The Top Mortgage Objections', 'An overview of the ten most common objections and the mindset for approaching all of them.', 'video', 18, 12, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.12\n'
'  Title: The Top Mortgage Objections\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: list of 10 objections\n'
'═══════════════════════════════════════════════════════\n\n'
'Let''s go through the objections you''re going to hear.\n\n'
'"I want to think about it."\n\n'
'"Your rate is too high."\n\n'
'"I need to talk to my spouse."\n\n'
'"I don''t want my credit pulled."\n\n'
'"I''m waiting for rates to drop."\n\n'
'"I''m not ready yet."\n\n'
'"I''m just shopping."\n\n'
'"I want more information."\n\n'
'"I don''t trust lenders."\n\n'
'"I don''t have enough money."\n\n'
'Notice something.\n\n'
'None of those statements tell you everything.\n\n'
'They''re starting points.\n\n'
'Your job is to discover what''s underneath them.\n\n'
'Don''t memorize ten perfect comebacks.\n\n'
'Learn the framework.\n\n'
'Listen. Clarify. Validate. Discover. Bridge. Ask. Close.\n\n'
'That framework gives you a way to think.');

-- Written lessons for each specific objection (text type — no video, content is written reference)
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES
(v_l1_13, v_course_id, v_mod1, '"I Want to Think About It"', 'How to respond with curiosity rather than pressure: "What specifically would you like to think through?"', 'text', 19, 13, true, 'watch_pct', 80, 180, '3 min',
E'## "I Want to Think About It."\n\n'
'Don''t panic. Don''t immediately say: "What is there to think about?"\n\n'
'Start with curiosity.\n\n'
'**Best response:** "Absolutely. What specifically would you like to think through?"\n\n'
'That question gives you information. Maybe it''s the rate. Maybe it''s the payment. Maybe it''s timing. Maybe it''s trust. Maybe they need to talk to somebody else.\n\n'
'You don''t know until you ask.\n\n'
'**Remember:** The objection isn''t the enemy. The uncertainty is what you need to understand.'),

(v_l1_14, v_course_id, v_mod1, '"Your Rate Is Too High"', 'Clarify the comparison before defending the rate: "Compared with what?"', 'text', 20, 14, true, 'watch_pct', 80, 180, '3 min',
E'## "Your Rate Is Too High."\n\n'
'When someone says your rate is too high, don''t immediately defend the rate.\n\n'
'**Ask:** "Compared with what?"\n\n'
'Then understand what they''re comparing.\n\n'
'- Are they comparing another lender?\n'
'- A different product?\n'
'- Something they saw online?\n'
'- Something they heard?\n\n'
'You need to know what the comparison actually is before you can respond intelligently.\n\n'
'Don''t guess. Don''t argue. Clarify. Then address the actual concern using accurate information.'),

(v_l1_15, v_course_id, v_mod1, '"I Need to Talk to My Spouse"', 'Respect the need — help the borrower prepare for the conversation rather than bypassing the spouse.', 'text', 21, 15, true, 'watch_pct', 80, 180, '3 min',
E'## "I Need to Talk to My Spouse."\n\n'
'If a borrower says they need to talk to their spouse, respect that.\n\n'
'Don''t make the spouse the enemy.\n\n'
'**Ask:** "Absolutely. What do you think they''ll want to know?"\n\n'
'Now you can help the borrower prepare for that conversation.\n\n'
'If appropriate, you can determine whether involving the spouse in the next conversation makes sense.\n\n'
'The goal is not to bypass the spouse. The goal is to make the decision clearer for everyone involved.'),

(v_l1_16, v_course_id, v_mod1, '"I Don''t Want My Credit Pulled"', 'Understand the concern, explain the actual HCMG process accurately, and never promise something you can''t guarantee.', 'text', 22, 16, true, 'watch_pct', 80, 180, '3 min',
E'## "I Don''t Want My Credit Pulled."\n\n'
'When a borrower is concerned about a credit pull, don''t dismiss the concern.\n\n'
'Ask why they''re concerned. Then explain the applicable HCMG process accurately.\n\n'
'**Never:**\n'
'- Promise something you can''t guarantee\n'
'- Make up a credit policy\n'
'- Tell a borrower something simply because you think it will keep the conversation moving\n\n'
'Trust comes from accuracy. If you don''t know the answer, get the right answer. That''s part of integrity.'),

(v_l1_17, v_course_id, v_mod1, '"I''m Waiting for Rates to Drop"', 'Don''t predict rates — discover decision criteria and educate based on the borrower''s actual goals.', 'text', 23, 17, true, 'watch_pct', 80, 180, '3 min',
E'## "I''m Waiting for Rates to Drop."\n\n'
'When someone says they''re waiting for rates to drop, don''t pretend you know what rates will do.\n\n'
'Don''t make predictions you can''t support.\n\n'
'**Ask:** "What are you hoping will happen before you feel comfortable moving forward?"\n\n'
'Now you can understand the decision criteria.\n\n'
'Maybe they''re focused on payment. Maybe affordability. Maybe timing. Maybe a particular financial event.\n\n'
'Understand the goal. Then educate. Don''t manufacture certainty about something you can''t control.'),

(v_l1_18, v_course_id, v_mod1, '"I''m Not Ready Yet"', 'Move the conversation forward without pressure: "What would need to happen for you to feel ready?"', 'text', 24, 18, true, 'watch_pct', 80, 150, '2 min',
E'## "I''m Not Ready Yet."\n\n'
'When somebody says they''re not ready, don''t automatically accept the words as the end of the conversation.\n\n'
'**Ask:** "What would need to happen for you to feel ready?"\n\n'
'That question moves the conversation forward without creating pressure.\n\n'
'Maybe they need more savings. More information. To sell another property. To understand their payment. Simply confidence.\n\n'
'Discover it. Then determine the appropriate next step.'),

(v_l1_19, v_course_id, v_mod1, '"I''m Just Shopping"', 'Shopping means they''re comparing — find out what matters to them and speak to those priorities.', 'text', 25, 19, true, 'watch_pct', 80, 150, '2 min',
E'## "I''m Just Shopping."\n\n'
'Shopping isn''t necessarily a problem. It tells you the borrower is comparing options. Respect that.\n\n'
'**Ask:** "Absolutely. What are the most important things you''re comparing?"\n\n'
'Now you understand what matters.\n\n'
'Rate? Payment? Service? Communication? Speed? Program? Experience?\n\n'
'Once you know what matters, you can explain how HCMG fits those priorities.'),

(v_l1_20, v_course_id, v_mod1, '"I Want More Information"', 'Ask what information would help — then provide relevant information, not everything.', 'text', 26, 20, true, 'watch_pct', 80, 150, '2 min',
E'## "I Want More Information."\n\n'
'When someone asks for more information, don''t overwhelm them.\n\n'
'**Ask:** "What information would help you feel comfortable making a decision?"\n\n'
'That question is powerful because it tells you what''s missing.\n\n'
'Then provide relevant information. Not everything.\n\n'
'More information isn''t always more clarity. Relevant information is.'),

(v_l1_21, v_course_id, v_mod1, '"I Don''t Trust Lenders"', 'Believe the concern, ask what happened, and remember: trust is demonstrated through transparency, consistency, and follow-through.', 'text', 27, 21, true, 'watch_pct', 80, 180, '3 min',
E'## "I Don''t Trust Lenders."\n\n'
'If somebody tells you they don''t trust lenders, believe the concern. Don''t argue with it.\n\n'
'**Ask:** "What happened that created that concern?"\n\n'
'Now you have context.\n\n'
'Maybe they had a bad experience. Maybe someone they know did. Maybe they don''t understand the mortgage process. Maybe they simply don''t know you yet.\n\n'
'Trust is built through transparency, consistency, accuracy, and follow-through.\n\n'
'You don''t talk someone into trusting you. You demonstrate that you''re trustworthy.'),

(v_l1_22, v_course_id, v_mod1, '"I Don''t Have Enough Money"', 'Don''t assume what "not enough money" means — find out which specific part concerns them before presenting options.', 'text', 28, 22, true, 'watch_pct', 80, 180, '3 min',
E'## "I Don''t Have Enough Money."\n\n'
'When a borrower says they don''t have enough money, don''t assume you know what they mean.\n\n'
'**Ask:** "When you say you don''t have enough money, what part are you most concerned about?"\n\n'
'Is it down payment? Closing costs? Cash reserves? Payment? Moving expenses?\n\n'
'Find out. Then provide accurate information about the options that actually apply to that borrower''s situation.\n\n'
'**Do not:**\n'
'- Promise eligibility\n'
'- Invent a program\n'
'- Tell somebody they qualify before the appropriate review\n\n'
'The goal is to replace uncertainty with accurate information.');

-- 🎬 HEYGEN VIDEO: "Using Third-Party Stories" — Lesson 1.23
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_23, v_course_id, v_mod1, 'Using Third-Party Stories', 'Stories build trust — but they must be true, accurate, and relevant. Never invent or exaggerate customer stories.', 'video', 29, 23, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.23\n'
'  Title: Using Third-Party Stories\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Stories can build trust.\n\n'
'Especially when you''re explaining something complicated.\n\n'
'A third-party story can help someone understand that another person faced a similar concern and found a path forward.\n\n'
'But there''s an important rule.\n\n'
'The story has to be true.\n\n'
'Don''t invent customer stories.\n\n'
'Don''t exaggerate results.\n\n'
'Don''t promise that because something happened to one borrower, it will happen to another.\n\n'
'Use stories to make concepts understandable.\n\n'
'Then bring the conversation back to the individual borrower.\n\n'
'Their situation is what matters.');

-- Lesson 1.24 — Objection Handling Scenario Assessment (knowledge check with 10 scenarios)
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_24, v_course_id, v_mod1, 'Objection Handling Scenarios', 'Ten scenario-based questions covering all major mortgage objections. Apply the framework to each situation.', 'knowledge_check', 30, 24, true, 'quiz_pass', 80, 900, '15 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l1_24, v_course_id, 'A borrower says, "I want to think about it." What is the best first response?', 'multiple_choice',
'[{"label":"\"There''s nothing to think about — rates move fast.\"","is_correct":false},{"label":"\"Absolutely. What specifically would you like to think through?\"","is_correct":true},{"label":"\"Let me know when you''re ready.\"","is_correct":false},{"label":"\"Why don''t you trust us?\"","is_correct":false}]',
'Curiosity, not pressure. "What specifically?" turns a vague objection into a specific conversation.', 1),

(v_l1_24, v_course_id, 'A borrower says, "Your rate is too high." What should you do first?', 'multiple_choice',
'[{"label":"Immediately offer a discount","is_correct":false},{"label":"Defend your rate","is_correct":false},{"label":"Ask \"Compared with what?\" to understand the comparison","is_correct":true},{"label":"End the call","is_correct":false}]',
'You cannot address a rate objection without knowing what the borrower is comparing it to. Clarify first.', 2),

(v_l1_24, v_course_id, 'A borrower says, "I need to talk to my spouse." What is the strongest response?', 'multiple_choice',
'[{"label":"\"Your spouse doesn''t need to be involved.\"","is_correct":false},{"label":"\"Absolutely. What do you think they''ll want to know?\"","is_correct":true},{"label":"\"You should decide on your own.\"","is_correct":false},{"label":"\"Call me back when they''re available.\"","is_correct":false}]',
'Helping the borrower prepare for the conversation with their spouse keeps the process moving and shows respect for the relationship.', 3),

(v_l1_24, v_course_id, 'A borrower says, "I don''t want my credit pulled." What is the correct approach?', 'multiple_choice',
'[{"label":"Tell them there''s nothing to worry about","is_correct":false},{"label":"Promise the pull won''t affect their score","is_correct":false},{"label":"Ask why they''re concerned, then explain the actual HCMG process accurately","is_correct":true},{"label":"Skip the credit discussion entirely","is_correct":false}]',
'Accuracy and honesty build trust. Never promise something you can''t guarantee. Find out the concern, then respond with accurate information.', 4),

(v_l1_24, v_course_id, 'A borrower says, "I''m waiting for rates to drop." What should you do?', 'multiple_choice',
'[{"label":"Promise rates will drop soon","is_correct":false},{"label":"Tell them rates will definitely rise","is_correct":false},{"label":"Ask what they''re hoping will happen and educate based on their actual goals","is_correct":true},{"label":"Agree to call them when rates drop","is_correct":false}]',
'Never predict rates. Discover what the borrower is waiting for, then educate based on their situation and decision criteria.', 5),

(v_l1_24, v_course_id, 'A borrower says, "I''m not ready yet." What is the best discovery question?', 'multiple_choice',
'[{"label":"\"You should be ready — rates won''t wait.\"","is_correct":false},{"label":"\"What would need to happen for you to feel ready?\"","is_correct":true},{"label":"\"Okay, I''ll call you next month.\"","is_correct":false},{"label":"\"Are you sure you''re not ready?\"","is_correct":false}]',
'This question moves the conversation forward without pressure by asking the borrower to define what readiness means to them.', 6),

(v_l1_24, v_course_id, 'A borrower says, "I''m just shopping around." What is the best response?', 'multiple_choice',
'[{"label":"\"We''re the best — stop shopping.\"","is_correct":false},{"label":"\"Absolutely. What are the most important things you''re comparing?\"","is_correct":true},{"label":"\"Shopping is a waste of time.\"","is_correct":false},{"label":"\"Let me know what they say.\"","is_correct":false}]',
'Shopping tells you the borrower is comparing options. Find out what matters to them so you can show how HCMG fits those priorities.', 7),

(v_l1_24, v_course_id, 'A borrower says, "I want more information." What is the most effective response?', 'multiple_choice',
'[{"label":"Send them a 30-page packet","is_correct":false},{"label":"\"What information would help you feel comfortable making a decision?\"","is_correct":true},{"label":"Tell them everything you know","is_correct":false},{"label":"Ask them to research it themselves","is_correct":false}]',
'Discovering which specific information is missing is more effective than overwhelming the borrower with everything you know.', 8),

(v_l1_24, v_course_id, 'A borrower says, "I don''t trust lenders." What is the correct first move?', 'multiple_choice',
'[{"label":"Argue that you''re different","is_correct":false},{"label":"Ask what happened that created that concern","is_correct":true},{"label":"Tell them all lenders are the same","is_correct":false},{"label":"Give up on the conversation","is_correct":false}]',
'Asking "what happened" gives you context and shows that you''re interested in their experience — not just in defending yourself.', 9),

(v_l1_24, v_course_id, 'A borrower says, "I don''t have enough money." What is the best clarifying question?', 'multiple_choice',
'[{"label":"\"How much do you have?\"","is_correct":false},{"label":"\"When you say you don''t have enough money, what part concerns you most?\"","is_correct":true},{"label":"\"Then you can''t buy right now.\"","is_correct":false},{"label":"\"I''ll get you approved anyway.\"","is_correct":false}]',
'"Not enough money" could mean many different things. Find out which specific part is the concern before presenting options.', 10);

-- 🎬 HEYGEN VIDEO: "Module 1 Review" — Lesson 1.25
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_25, v_course_id, v_mod1, 'Module 1 Review: Harry Handles Objections', 'Key takeaways from the module before the quiz.', 'video', 31, 25, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 1.25\n'
'  Title: Module 1 Review\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: LISTEN → CLARIFY → VALIDATE → DISCOVER → BRIDGE → ASK → CLOSE\n'
'═══════════════════════════════════════════════════════\n\n'
'Before you move on, remember the framework.\n\n'
'Listen.\n\n'
'Clarify.\n\n'
'Validate.\n\n'
'Discover.\n\n'
'Bridge.\n\n'
'Ask.\n\n'
'Close.\n\n'
'Don''t fight objections.\n\n'
'Understand them.\n\n'
'Don''t memorize ten perfect responses.\n\n'
'Learn how to think.\n\n'
'And remember:\n\n'
'Every objection is simply a request for more certainty.\n\n'
'That''s the standard.');

-- Module 1 Quiz
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1_q, v_course_id, v_mod1, 'Module 1 Quiz: Harry Handles Objections', 'Ten questions on the objection framework, mindset, and common mortgage objections. Passing score: 80%.', 'knowledge_check', 32, 26, true, 'quiz_pass', 80, 600, '10 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l1_q, v_course_id, 'According to Harry''s Playbook, every objection is best understood as:', 'multiple_choice',
'[{"label":"A final decision","is_correct":false},{"label":"A request for more certainty","is_correct":true},{"label":"A sign to give up","is_correct":false},{"label":"An attempt to get a discount","is_correct":false}]',
'Objections reveal what the borrower needs to feel certain about — they are not final answers.', 1),

(v_l1_q, v_course_id, 'What is the correct order of the HCMG Objection Framework?', 'multiple_choice',
'[{"label":"Close, Ask, Discover, Bridge, Validate, Clarify, Listen","is_correct":false},{"label":"Listen, Clarify, Validate, Discover, Bridge, Ask, Close","is_correct":true},{"label":"Ask, Listen, Validate, Close, Clarify, Bridge, Discover","is_correct":false},{"label":"Discover, Bridge, Close, Ask, Listen, Validate, Clarify","is_correct":false}]',
'The framework runs Listen → Clarify → Validate → Discover → Bridge → Ask → Close. The order matters because each step builds on the previous one.', 2),

(v_l1_q, v_course_id, 'A borrower says, "I want to think about it." The best first response is:', 'multiple_choice',
'[{"label":"\"There''s nothing to think about.\"","is_correct":false},{"label":"\"Absolutely. What specifically would you like to think through?\"","is_correct":true},{"label":"\"Call me when you''re ready.\"","is_correct":false},{"label":"\"I understand — we''ll drop the rate.\"","is_correct":false}]',
'Curiosity replaces defensiveness. "What specifically?" surfaces the real concern.', 3),

(v_l1_q, v_course_id, 'What does validation mean in objection handling?', 'multiple_choice',
'[{"label":"Agreeing with the borrower''s conclusion","is_correct":false},{"label":"Acknowledging the concern as reasonable to discuss without necessarily agreeing","is_correct":true},{"label":"Giving a concession","is_correct":false},{"label":"Ending the objection immediately","is_correct":false}]',
'Validation says the concern is worth discussing — not that the loan officer agrees with the borrower''s position.', 4),

(v_l1_q, v_course_id, 'What is the purpose of the Discovery step?', 'multiple_choice',
'[{"label":"To list all product features","is_correct":false},{"label":"To find out what is really underneath the objection","is_correct":true},{"label":"To close the borrower","is_correct":false},{"label":"To validate the rate","is_correct":false}]',
'Discovery turns surface-level objections into specific, actionable information.', 5),

(v_l1_q, v_course_id, 'What is the Bridge step designed to do?', 'multiple_choice',
'[{"label":"Change the subject away from the objection","is_correct":false},{"label":"Connect the borrower''s concern to information that actually matters to them","is_correct":true},{"label":"Give a full product presentation","is_correct":false},{"label":"Avoid asking questions","is_correct":false}]',
'The Bridge ensures the response is relevant to what the borrower told you — not a generic pitch.', 6),

(v_l1_q, v_course_id, 'Why must you Ask after bridging?', 'multiple_choice',
'[{"label":"To start over","is_correct":false},{"label":"Because you cannot close what you don''t ask for","is_correct":true},{"label":"To confuse the borrower","is_correct":false},{"label":"Because asking is optional","is_correct":false}]',
'Many salespeople stop after explaining. Asking for the next step is what moves the conversation forward.', 7),

(v_l1_q, v_course_id, 'A borrower says, "Your rate is too high." What should you do FIRST?', 'multiple_choice',
'[{"label":"Defend your rate","is_correct":false},{"label":"Immediately offer a lower rate","is_correct":false},{"label":"Ask \"Compared with what?\" to clarify the comparison","is_correct":true},{"label":"End the conversation","is_correct":false}]',
'You cannot address the rate objection without understanding what the borrower is comparing it to.', 8),

(v_l1_q, v_course_id, 'Why should third-party stories always be true?', 'multiple_choice',
'[{"label":"They are required by law","is_correct":false},{"label":"Inaccurate stories violate integrity and create false expectations","is_correct":true},{"label":"Stories don''t matter in mortgage sales","is_correct":false},{"label":"Stories are only for beginners","is_correct":false}]',
'Integrity requires that stories be accurate. Inventing stories or exaggerating results damages trust and creates misleading expectations.', 9),

(v_l1_q, v_course_id, 'What is the difference between confidence and defensiveness in objection handling?', 'multiple_choice',
'[{"label":"They are the same thing","is_correct":false},{"label":"Confidence stays calm and seeks to understand; defensiveness argues and creates conflict","is_correct":true},{"label":"Confidence means talking more","is_correct":false},{"label":"Defensiveness is a professional skill","is_correct":false}]',
'Confidence means you can hold steady when challenged. Defensiveness puts two people arguing instead of one helping the other make a decision.', 10);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 2: HARRY CLOSES AS A TEAM
-- ═══════════════════════════════════════════════════════════════════════════

-- 🎬 HEYGEN VIDEO: "The Close Starts Before the Close" — Lesson 2.1
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_1, v_course_id, v_mod2, 'The Close Starts Before the Close', 'Closing begins with trust, discovery, and certainty — not at the moment you ask for the decision.', 'video', 33, 1, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.1\n'
'  Title: The Close Starts Before the Close\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Closing doesn''t start when you say: "Are you ready?"\n\n'
'Closing starts much earlier.\n\n'
'It starts with trust.\n\n'
'It starts with discovery.\n\n'
'It starts with understanding the borrower''s goals.\n\n'
'It starts with answering questions.\n\n'
'It starts with creating certainty.\n\n'
'If you''ve done those things well, the close becomes much more natural.\n\n'
'You can''t close what you don''t understand.\n\n'
'So don''t wait until the end of the conversation to start thinking about the decision.\n\n'
'Understand the decision from the beginning.');

-- 🎬 HEYGEN VIDEO: "Asking for the Sale" — Lesson 2.2
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_2, v_course_id, v_mod2, 'Asking for the Sale', 'The simple truth that gets overlooked: you have to ask.', 'video', 34, 2, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.2\n'
'  Title: Asking for the Sale\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Here''s something simple that gets overlooked.\n\n'
'You have to ask.\n\n'
'You can have the right product.\n\n'
'You can have the right information.\n\n'
'You can build trust.\n\n'
'You can answer every question.\n\n'
'But if you never ask for the next step, you leave the decision hanging.\n\n'
'Closing isn''t forcing somebody.\n\n'
'Closing is helping somebody make a clear decision about the next step.\n\n'
'So ask.\n\n'
'"Would you like to move forward?"\n\n'
'"Are you comfortable taking the next step?"\n\n'
'"Let''s get your application started."\n\n'
'"Would it make sense to begin today?"\n\n'
'Be willing to ask.');

-- 🎬 HEYGEN VIDEO: "If You Don't Ask, You Don't Close" — Lesson 2.3
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_3, v_course_id, v_mod2, 'If You Don''t Ask, You Don''t Close', 'Avoiding the question doesn''t prevent rejection — it creates uncertainty. Every answer teaches you something.', 'video', 35, 3, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.3\n'
'  Title: If You Don''t Ask, You Don''t Close\n'
'  Speaker: Harry (avatar)\n'
'  On-screen key phrase: "You can''t close what you don''t ask for."\n'
'═══════════════════════════════════════════════════════\n\n'
'A lot of people are afraid to ask because they''re afraid of hearing no.\n\n'
'But avoiding the question doesn''t create a yes.\n\n'
'It creates uncertainty.\n\n'
'If the borrower is ready, asking gives them a path forward.\n\n'
'If they''re not ready, asking gives you an opportunity to discover why.\n\n'
'Either way, you learn something.\n\n'
'So don''t confuse avoiding rejection with creating success.\n\n'
'You have to ask.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l2_3, v_course_id,
'Why does the Playbook emphasize always asking for the next step?',
'multiple_choice',
'[{"label":"Because it pressures borrowers","is_correct":false},{"label":"Because avoiding the question creates uncertainty — not a yes","is_correct":true},{"label":"Because asking is legally required","is_correct":false},{"label":"Because silence means the borrower is ready","is_correct":false}]',
'Avoiding the close doesn''t make the borrower more likely to say yes — it leaves the conversation without a direction. Asking moves it forward regardless of the answer.',
1);

-- 🎬 HEYGEN VIDEO: "Closing Questions" — Lesson 2.4
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_4, v_course_id, v_mod2, 'Closing Questions', 'Ask clearly and directly — then stop talking and let the borrower answer.', 'video', 36, 4, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.4\n'
'  Title: Closing Questions\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Closing questions should be clear.\n\n'
'Don''t hide the question inside a long explanation.\n\n'
'Ask directly.\n\n'
'"Would you like to move forward?"\n\n'
'"Are you comfortable taking the next step?"\n\n'
'"Would it make sense to begin today?"\n\n'
'"Let''s get your application started."\n\n'
'Then stop talking.\n\n'
'Give the borrower space to answer.\n\n'
'Confidence isn''t filling every silence.\n\n'
'Confidence is being comfortable with the answer.');

-- 🎬 HEYGEN VIDEO: "Decently Bold" — Lesson 2.5
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_5, v_course_id, v_mod2, 'Decently Bold', 'What it means to be professional, confident, direct, helpful, and solution-focused — not aggressive or manipulative.', 'video', 37, 5, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.5\n'
'  Title: Decently Bold\n'
'  Speaker: Harry (avatar)\n'
'  On-screen key phrase: "Decently Bold"\n'
'═══════════════════════════════════════════════════════\n\n'
'Let''s talk about being decently bold.\n\n'
'Decently bold means you''re willing to ask the question other people avoid.\n\n'
'It means you''re professional.\n\n'
'Confident.\n\n'
'Direct.\n\n'
'Helpful.\n\n'
'Solution-focused.\n\n'
'It does not mean aggressive.\n\n'
'It does not mean manipulative.\n\n'
'It does not mean desperate.\n\n'
'It means you''re willing to lead the conversation when leadership is needed.\n\n'
'Sometimes the borrower needs somebody to say:\n\n'
'"Based on what you''ve told me, here''s what I recommend as the next step."\n\n'
'That''s being decently bold.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l2_5, v_course_id,
'What does "Decently Bold" mean according to Harry''s Playbook?',
'multiple_choice',
'[{"label":"Aggressive and persistent until the borrower agrees","is_correct":false},{"label":"Professional, confident, direct, helpful, and solution-focused","is_correct":true},{"label":"Manipulative use of urgency","is_correct":false},{"label":"Desperate to make a sale","is_correct":false}]',
'Decently Bold is about professional leadership — leading the conversation with the borrower''s interests in mind, not forcing an outcome.',
1);

-- 🎬 HEYGEN VIDEO: "Bold Without Being Pushy" — Lesson 2.6
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_6, v_course_id, v_mod2, 'Bold Without Being Pushy', 'Confidence gives the borrower clarity. Pressure takes the focus away from the borrower.', 'video', 38, 6, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.6\n'
'  Title: Bold Without Being Pushy\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'There is a difference between confidence and pressure.\n\n'
'Confidence says: "Here''s what I recommend."\n\n'
'Pressure says: "You need to do this because I need you to."\n\n'
'Confidence gives the borrower clarity.\n\n'
'Pressure takes the focus away from the borrower.\n\n'
'The goal is to lead.\n\n'
'Not manipulate.\n\n'
'Be willing to ask.\n\n'
'Be willing to recommend.\n\n'
'And be willing to respect the borrower''s decision.');

-- 🎬 HEYGEN VIDEO: "Commitment vs Compliance" — Lesson 2.7
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_7, v_course_id, v_mod2, 'Commitment vs Compliance', 'A borrower should move forward because they understand and want to — not because they were pressured.', 'video', 39, 7, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.7\n'
'  Title: Commitment vs Compliance\n'
'  Speaker: Harry (avatar)\n'
'  On-screen key phrase: "Commitment vs Compliance"\n'
'═══════════════════════════════════════════════════════\n\n'
'Compliance is: "Okay, fine."\n\n'
'Commitment is: "Yes. This is what I want to do."\n\n'
'We want commitment.\n\n'
'A borrower shouldn''t move forward simply because they felt pressured.\n\n'
'They should move forward because they understand the decision and believe it''s the right next step for them.\n\n'
'That''s why discovery matters.\n\n'
'That''s why certainty matters.\n\n'
'That''s why trust matters.\n\n'
'The goal isn''t to force agreement.\n\n'
'The goal is to create informed commitment.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l2_7, v_course_id,
'What is the difference between commitment and compliance?',
'multiple_choice',
'[{"label":"They mean the same thing","is_correct":false},{"label":"Commitment reflects informed willingness to move forward; compliance is reluctant agreement under pressure","is_correct":true},{"label":"Compliance is always better","is_correct":false},{"label":"Commitment means the loan officer pushed harder","is_correct":false}]',
'Compliance is "okay, fine." Commitment is "yes, this is the right step for me." The Playbook targets commitment — not pressure-driven compliance.',
1);

-- 🎬 HEYGEN VIDEO: "Discovery Wins Deals" — Lesson 2.8
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_8, v_course_id, v_mod2, 'Discovery Wins Deals', 'You can''t close what you don''t understand — discovery connects the conversation to what matters to the borrower.', 'video', 40, 8, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.8\n'
'  Title: Discovery Wins Deals\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'You can''t close what you don''t understand.\n\n'
'Before you try to close, understand the borrower.\n\n'
'Why now?\n\n'
'Why this home?\n\n'
'Why this move?\n\n'
'What happens if nothing changes?\n\n'
'What would success look like?\n\n'
'These questions help you understand the real reason behind the transaction.\n\n'
'And once you understand the reason, you can connect the mortgage conversation to something meaningful.\n\n'
'That''s what discovery does.');

-- 🎬 HEYGEN VIDEO: "The Five Discovery Questions" — Lesson 2.9
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_9, v_course_id, v_mod2, 'The Five Discovery Questions', 'Why now? Why this home? Why this move? What happens if nothing changes? What would success look like?', 'video', 41, 9, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.9\n'
'  Title: The Five Discovery Questions\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: The five questions displayed\n'
'═══════════════════════════════════════════════════════\n\n'
'Here are five questions worth remembering.\n\n'
'Why now?\n\n'
'Why this home?\n\n'
'Why this move?\n\n'
'What happens if nothing changes?\n\n'
'What would success look like?\n\n'
'Don''t treat these like a checklist you have to fire off mechanically.\n\n'
'Use them naturally.\n\n'
'The goal is to understand.\n\n'
'Because the better you understand the borrower, the more relevant your recommendation becomes.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l2_9, v_course_id,
'Which of the following is one of the Five Discovery Questions?',
'multiple_choice',
'[{"label":"\"What is your credit score?\"","is_correct":false},{"label":"\"What happens if nothing changes?\"","is_correct":true},{"label":"\"Can I close this today?\"","is_correct":false},{"label":"\"Do you trust me?\"","is_correct":false}]',
'The Five Discovery Questions help the loan officer understand the borrower''s real motivation: Why now? Why this home? Why this move? What happens if nothing changes? What would success look like?',
1);

-- 🎬 HEYGEN VIDEO: "Closing Psychology" — Lesson 2.10
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_10, v_course_id, v_mod2, 'Closing Psychology', 'Trust + Certainty + Emotion = Action. How the three elements of the decision combine.', 'video', 42, 10, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.10\n'
'  Title: Closing Psychology\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: TRUST + CERTAINTY + EMOTION = ACTION\n'
'═══════════════════════════════════════════════════════\n\n'
'People don''t make decisions because you talked longer.\n\n'
'They make decisions because they have enough trust, enough certainty, and enough emotional connection to act.\n\n'
'That''s why we use a simple framework:\n\n'
'Trust plus certainty plus emotion equals action.\n\n'
'Trust answers: "Do I believe you?"\n\n'
'Certainty answers: "Do I understand what happens next?"\n\n'
'Emotion answers: "Why does this matter to me?"\n\n'
'When those three come together, decisions become clearer.\n\n'
'Your job is not to manipulate emotion.\n\n'
'Your job is to understand what matters to the borrower and communicate clearly.');

-- 🎬 HEYGEN VIDEO: "Trust + Certainty + Emotion = Action" — Lesson 2.11
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_11, v_course_id, v_mod2, 'Trust + Certainty + Emotion = Action', 'How trust, certainty, and emotion each contribute to the borrower''s decision — and how to build each one.', 'text', 43, 11, true, 'watch_pct', 80, 180, '3 min',
E'## Trust + Certainty + Emotion = Action\n\n'
'**Trust** is created through:\n'
'- Honesty\n'
'- Consistency\n'
'- Transparency\n'
'- Follow-through\n\n'
'**Certainty** is created through:\n'
'- Clear explanations\n'
'- Accurate information\n'
'- Defined next steps\n'
'- Preparation\n\n'
'**Emotion** is connected to:\n'
'- Goals\n'
'- Family\n'
'- Stability\n'
'- Opportunity\n'
'- Timing\n'
'- Personal priorities\n\n'
'The three work together. A borrower with high trust but low certainty may still hesitate. A borrower with certainty but no emotional reason to act may stall.\n\n'
'Understand all three and address whatever is missing.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l2_11, v_course_id,
'What does the "Certainty" element of the closing formula answer for the borrower?',
'multiple_choice',
'[{"label":"\"Do I trust you?\"","is_correct":false},{"label":"\"Do I understand what happens next?\"","is_correct":true},{"label":"\"Why does this matter to me?\"","is_correct":false},{"label":"\"Is the rate good?\"","is_correct":false}]',
'Certainty is created through clear explanations, accurate information, and defined next steps. It answers the borrower''s question: "Do I understand what I''m agreeing to?"',
1);

-- 🎬 HEYGEN VIDEO: "The Team Lead Advantage" — Lesson 2.12
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_12, v_course_id, v_mod2, 'The Team Lead Advantage', 'Knowing when to involve another person is a strength — not a sign of weakness.', 'video', 44, 12, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.12\n'
'  Title: The Team Lead Advantage\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'A strong team lead doesn''t just manage numbers.\n\n'
'A strong team lead develops people.\n\n'
'Sometimes the smartest move is knowing when to bring in another person.\n\n'
'A team lead can provide:\n\n'
'Experience.\n\n'
'Credibility.\n\n'
'Perspective.\n\n'
'Support.\n\n'
'The goal isn''t to make the original loan officer look weak.\n\n'
'The goal is to give the borrower the best possible experience.\n\n'
'Ask for help before you need help.\n\n'
'That''s a strength.');

-- 🎬 HEYGEN VIDEO: "Ask for Help Before You Need Help" — Lesson 2.13
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_13, v_course_id, v_mod2, 'Ask for Help Before You Need Help', 'Waiting until a situation becomes critical before asking for support is one of the fastest ways to create problems.', 'video', 45, 13, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.13\n'
'  Title: Ask for Help Before You Need Help\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'One of the fastest ways to create problems is waiting until a situation becomes difficult before asking for help.\n\n'
'If you see a potential issue, raise it.\n\n'
'If you don''t know something, ask.\n\n'
'If you need another perspective, involve the right person.\n\n'
'Teamwork isn''t: "I''ll figure everything out myself."\n\n'
'Teamwork is: "I know when to involve the right resource."\n\n'
'That''s how we protect the borrower.\n\n'
'That''s how we protect the file.\n\n'
'That''s how we protect the team.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l2_13, v_course_id,
'According to Harry''s Playbook, what does real teamwork mean?',
'multiple_choice',
'[{"label":"Figuring everything out yourself","is_correct":false},{"label":"Knowing when to involve the right resource","is_correct":true},{"label":"Never asking for help","is_correct":false},{"label":"Letting management handle all problems","is_correct":false}]',
'Teamwork is recognizing when a situation calls for involving someone else — not waiting until it''s a crisis.',
1);

-- 🎬 HEYGEN VIDEO: "The Perfect Turnover" — Lesson 2.14
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_14, v_course_id, v_mod2, 'The Perfect Turnover', 'When bringing in another team member, give them context — the borrower should never have to repeat their story.', 'video', 46, 14, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.14\n'
'  Title: The Perfect Turnover\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'When you bring another team member into a conversation, don''t make them start from zero.\n\n'
'Give them the context.\n\n'
'Who is the borrower?\n\n'
'What are they trying to accomplish?\n\n'
'What matters most?\n\n'
'What concerns have they raised?\n\n'
'What has already been discussed?\n\n'
'What do they need from us?\n\n'
'A good turnover creates continuity.\n\n'
'The borrower shouldn''t feel like they have to tell their story again.\n\n'
'That''s teamwork.');

-- Lesson 2.15 — Team Closing Scenarios
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_15, v_course_id, v_mod2, 'Team Closing Scenarios', 'Eight scenario questions covering: asking for help, turnover, commitment, discovery, Decently Bold, closing questions, trust, and teamwork.', 'knowledge_check', 47, 15, true, 'quiz_pass', 80, 720, '12 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l2_15, v_course_id, 'A loan officer has answered every question but hasn''t asked for the next step. What should they do?', 'multiple_choice',
'[{"label":"Wait for the borrower to ask to move forward","is_correct":false},{"label":"Ask directly: \"Would it make sense to move forward?\"","is_correct":true},{"label":"Send a follow-up email","is_correct":false},{"label":"Add more explanation","is_correct":false}]',
'You can''t close what you don''t ask for. After addressing concerns, ask clearly for the next step.', 1),

(v_l2_15, v_course_id, 'A borrower says "okay, fine" and moves forward reluctantly. This is an example of:', 'multiple_choice',
'[{"label":"Commitment","is_correct":false},{"label":"Compliance","is_correct":true},{"label":"Decently Bold behavior","is_correct":false},{"label":"Discovery","is_correct":false}]',
'Compliance is reluctant agreement. Commitment is informed willingness. The Playbook targets commitment.', 2),

(v_l2_15, v_course_id, 'A loan officer is bringing in their team lead to join a borrower conversation. What is the most important first step?', 'multiple_choice',
'[{"label":"Let the team lead take over completely","is_correct":false},{"label":"Brief the team lead on who the borrower is, what they need, and what''s been discussed","is_correct":true},{"label":"Start the conversation over from the beginning","is_correct":false},{"label":"Ask the borrower to repeat everything","is_correct":false}]',
'A proper turnover creates continuity. The borrower should not have to tell their story again.', 3),

(v_l2_15, v_course_id, 'Which of the following is a Decently Bold closing statement?', 'multiple_choice',
'[{"label":"\"You need to do this now.\"","is_correct":false},{"label":"\"Based on what you''ve told me, here''s what I recommend as the next step.\"","is_correct":true},{"label":"\"I''ll call you in six months.\"","is_correct":false},{"label":"\"It''s your decision, I don''t want to bother you.\"","is_correct":false}]',
'Decently Bold means leading with confidence and professional recommendation — not pressure, not avoidance.', 4),

(v_l2_15, v_course_id, 'Which is one of the Five Discovery Questions?', 'multiple_choice',
'[{"label":"\"What is your credit score?\"","is_correct":false},{"label":"\"What happens if nothing changes?\"","is_correct":true},{"label":"\"How much do you want to borrow?\"","is_correct":false},{"label":"\"Are you pre-approved?\"","is_correct":false}]',
'The Five Discovery Questions focus on motivation and timing, not loan details.', 5),

(v_l2_15, v_course_id, 'According to the Playbook, when should a loan officer ask for help from their team lead?', 'multiple_choice',
'[{"label":"Only when the situation has already become a crisis","is_correct":false},{"label":"Before the situation becomes difficult","is_correct":true},{"label":"Never — handle everything independently","is_correct":false},{"label":"Only when the borrower requests it","is_correct":false}]',
'Ask for help before you need help. Waiting until a crisis creates bigger problems for the borrower, the file, and the team.', 6),

(v_l2_15, v_course_id, 'What is the closing psychology formula from Harry''s Playbook?', 'multiple_choice',
'[{"label":"Rate + Product + Speed = Closing","is_correct":false},{"label":"Trust + Certainty + Emotion = Action","is_correct":true},{"label":"Skill + Activity + Goals = Results","is_correct":false},{"label":"Script + Practice + Persistence = Close","is_correct":false}]',
'Trust + Certainty + Emotion = Action. Decisions happen when all three are present.', 7),

(v_l2_15, v_course_id, 'A loan officer explains the entire loan process but never asks the borrower if they''re ready to apply. What is the problem?', 'multiple_choice',
'[{"label":"They explained too much","is_correct":false},{"label":"They never asked for the next step","is_correct":true},{"label":"They should have started with the close","is_correct":false},{"label":"There is no problem","is_correct":false}]',
'Explanation without asking leaves the decision hanging. Closing requires asking.', 8);

-- 🎬 HEYGEN VIDEO: "Module 2 Review" — Lesson 2.16
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_16, v_course_id, v_mod2, 'Module 2 Review: Harry Closes as a Team', 'Key takeaways on closing, discovery, Decently Bold, and teamwork.', 'video', 48, 16, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 2.16\n'
'  Title: Module 2 Review\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Remember:\n\n'
'You have to ask.\n\n'
'You can''t close what you don''t understand.\n\n'
'Commitment is different from compliance.\n\n'
'Being decently bold means leading professionally.\n\n'
'And teamwork means knowing when to bring in another resource.\n\n'
'The goal isn''t simply to close.\n\n'
'The goal is to help the borrower make a clear decision while delivering an excellent experience.');

-- Module 2 Quiz
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2_q, v_course_id, v_mod2, 'Module 2 Quiz: Harry Closes as a Team', 'Ten questions on closing, discovery, Decently Bold, and teamwork. Passing score: 80%.', 'knowledge_check', 49, 17, true, 'quiz_pass', 80, 600, '10 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l2_q, v_course_id, 'According to the Playbook, when does closing actually begin?', 'multiple_choice',
'[{"label":"When you ask \"Are you ready?\"","is_correct":false},{"label":"Much earlier — with trust, discovery, and creating certainty","is_correct":true},{"label":"After the borrower signs","is_correct":false},{"label":"After you present the rate","is_correct":false}]',
'Closing starts at the beginning of the relationship — with trust and understanding the borrower''s goals.', 1),
(v_l2_q, v_course_id, 'What is "Decently Bold"?', 'multiple_choice',
'[{"label":"Aggressive and persistent","is_correct":false},{"label":"Professional, confident, direct, helpful, and solution-focused","is_correct":true},{"label":"Manipulative urgency","is_correct":false},{"label":"Timid and non-committal","is_correct":false}]',
'Decently Bold is professional leadership — not pressure.', 2),
(v_l2_q, v_course_id, '"Compliance" in the context of the Playbook means:', 'multiple_choice',
'[{"label":"An informed decision","is_correct":false},{"label":"Reluctant agreement — \"okay, fine\"","is_correct":true},{"label":"Full commitment to the decision","is_correct":false},{"label":"A signed application","is_correct":false}]',
'Compliance is reluctant agreement. Commitment is informed willingness. The Playbook seeks commitment.', 3),
(v_l2_q, v_course_id, 'What is the Trust + Certainty + Emotion formula?', 'multiple_choice',
'[{"label":"A compliance checklist","is_correct":false},{"label":"The three elements that combine to produce a borrower''s decision to act","is_correct":true},{"label":"A closing script","is_correct":false},{"label":"A referral system","is_correct":false}]',
'Trust + Certainty + Emotion = Action. All three must be present for a borrower to make a clear decision.', 4),
(v_l2_q, v_course_id, 'Which is one of the Five Discovery Questions?', 'multiple_choice',
'[{"label":"\"What is your down payment?\"","is_correct":false},{"label":"\"Why now?\"","is_correct":true},{"label":"\"What is your rate target?\"","is_correct":false},{"label":"\"Can I close this?\"","is_correct":false}]',
'The Five Discovery Questions focus on motivation: Why now? Why this home? Why this move? What happens if nothing changes? What would success look like?', 5),
(v_l2_q, v_course_id, 'After bridging from a borrower''s concern, what must the loan officer do next?', 'multiple_choice',
'[{"label":"Start over","is_correct":false},{"label":"Ask for the next step","is_correct":true},{"label":"Give more information","is_correct":false},{"label":"Wait for the borrower to act","is_correct":false}]',
'You can''t close what you don''t ask for. After addressing the concern, ask.', 6),
(v_l2_q, v_course_id, 'A good team lead turnover ensures:', 'multiple_choice',
'[{"label":"The borrower starts over","is_correct":false},{"label":"Continuity — the borrower doesn''t have to repeat their story","is_correct":true},{"label":"The original loan officer disappears","is_correct":false},{"label":"The borrower meets management","is_correct":false}]',
'The borrower''s experience should be seamless. Context passes with the handoff.', 7),
(v_l2_q, v_course_id, 'What is the difference between confidence and pressure in a closing conversation?', 'multiple_choice',
'[{"label":"There is no difference","is_correct":false},{"label":"Confidence gives the borrower clarity; pressure removes the focus from the borrower","is_correct":true},{"label":"Pressure is a useful tool","is_correct":false},{"label":"Confidence means talking more","is_correct":false}]',
'Confidence says "here''s what I recommend." Pressure says "do this because I need you to." One serves the borrower, one serves the salesperson.', 8),
(v_l2_q, v_course_id, 'Why is it important to stop talking after asking a closing question?', 'multiple_choice',
'[{"label":"It''s a trick to make the borrower uncomfortable","is_correct":false},{"label":"The borrower needs space to answer — silence is a sign of confidence","is_correct":true},{"label":"It signals the end of the call","is_correct":false},{"label":"It doesn''t matter either way","is_correct":false}]',
'Confidence isn''t filling every silence. Give the borrower room to answer.', 9),
(v_l2_q, v_course_id, 'When should a loan officer ask for help from their team lead?', 'multiple_choice',
'[{"label":"Only when the deal is already lost","is_correct":false},{"label":"Before the situation becomes difficult","is_correct":true},{"label":"Only when the borrower complains","is_correct":false},{"label":"Never — ask only after exhausting all options","is_correct":false}]',
'Asking early protects the borrower, the file, and the team.', 10);

-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 3: HARRY CREATES URGENCY
-- ═══════════════════════════════════════════════════════════════════════════

-- 🎬 HEYGEN VIDEO: "Why Borrowers Wait" — Lesson 3.1
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_1, v_course_id, v_mod3, 'Why Borrowers Wait', 'Understanding the real reasons people delay — before trying to create urgency.', 'video', 50, 1, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.1\n'
'  Title: Why Borrowers Wait\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'People wait for a lot of reasons.\n\n'
'They''re uncertain.\n\n'
'They''re afraid.\n\n'
'They''re comparing options.\n\n'
'They''re waiting for something to change.\n\n'
'They''re overwhelmed.\n\n'
'They''re not convinced the timing matters.\n\n'
'Your job isn''t to make them feel rushed.\n\n'
'Your job is to understand why they''re waiting.\n\n'
'Because once you understand that, you can determine whether there is a legitimate reason to act now — or whether the right answer is simply to continue the conversation.\n\n'
'That''s the difference between urgency and pressure.');

-- 🎬 HEYGEN VIDEO: "Urgency vs Pressure" — Lesson 3.2
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_2, v_course_id, v_mod3, 'Urgency vs Pressure', 'Pressure serves the salesperson. Urgency serves the client. The distinction that defines ethical selling.', 'video', 51, 2, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.2\n'
'  Title: Urgency vs Pressure\n'
'  Speaker: Harry (avatar)\n'
'  On-screen key phrase: "Pressure serves the salesperson. Urgency serves the client."\n'
'═══════════════════════════════════════════════════════\n\n'
'Let''s make something very clear.\n\n'
'Pressure serves the salesperson.\n\n'
'Urgency serves the client.\n\n'
'Pressure says: "You need to do this because I need you to do it."\n\n'
'Urgency says: "Let''s understand what happens if you wait."\n\n'
'We don''t manufacture urgency.\n\n'
'We discover it.\n\n'
'We educate.\n\n'
'We help the borrower understand their situation.\n\n'
'Then they can make an informed decision.\n\n'
'That''s ethical urgency.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l3_2, v_course_id,
'What is the key difference between urgency and pressure, according to Harry''s Playbook?',
'multiple_choice',
'[{"label":"There is no difference","is_correct":false},{"label":"Pressure serves the salesperson; urgency serves the client","is_correct":true},{"label":"Urgency is aggressive; pressure is professional","is_correct":false},{"label":"Pressure is ethical; urgency is manipulative","is_correct":false}]',
'Pressure is manufactured for the benefit of the loan officer. Urgency is discovered and used to help the borrower understand the real consequences of waiting.',
1);

-- 🎬 HEYGEN VIDEO: "Create Clarity" — Lesson 3.3
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_3, v_course_id, v_mod3, 'Create Clarity', 'Clarity enables good decisions. Without it, urgency becomes pressure.', 'video', 52, 3, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.3\n'
'  Title: Create Clarity\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Before someone can make a good decision, they need clarity.\n\n'
'What are they trying to accomplish?\n\n'
'What''s stopping them?\n\n'
'What happens if they wait?\n\n'
'What happens if they move forward?\n\n'
'What information are they missing?\n\n'
'Clarity gives people something to make a decision about.\n\n'
'Without clarity, urgency becomes pressure.\n\n'
'With clarity, urgency can become service.');

-- 🎬 HEYGEN VIDEO: "Connect to Goals" — Lesson 3.4
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_4, v_course_id, v_mod3, 'Connect to Goals', 'Urgency is meaningful when it connects to something the borrower actually cares about — discover it, don''t invent it.', 'video', 53, 4, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.4\n'
'  Title: Connect to Goals\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Urgency becomes meaningful when it connects to something the borrower actually cares about.\n\n'
'Maybe they want a specific home.\n\n'
'Maybe they want more stability.\n\n'
'Maybe they need to move.\n\n'
'Maybe they want to stop renting.\n\n'
'Maybe they have a timeline.\n\n'
'The goal isn''t to invent a reason.\n\n'
'It''s to discover the reason that already exists.\n\n'
'Ask questions.\n\n'
'Listen.\n\n'
'Then connect the decision to the borrower''s actual goal.');

-- 🎬 HEYGEN VIDEO: "Emotional Urgency" — Lesson 3.5
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_5, v_course_id, v_mod3, 'Emotional Urgency', 'Mortgage decisions are financial AND personal — understanding what matters emotionally reveals why the transaction matters.', 'video', 54, 5, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.5\n'
'  Title: Emotional Urgency\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Mortgage decisions are financial decisions.\n\n'
'But they''re also personal decisions.\n\n'
'People buy homes because of family.\n\n'
'Security.\n\n'
'Opportunity.\n\n'
'Lifestyle.\n\n'
'Stability.\n\n'
'Change.\n\n'
'When you understand what matters emotionally, you understand why the transaction matters.\n\n'
'That doesn''t mean manipulating emotion.\n\n'
'It means recognizing that people are people.\n\n'
'Understand the reason behind the transaction.');

-- 🎬 HEYGEN VIDEO: "Product and Situation Urgency" — Lesson 3.6
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_6, v_course_id, v_mod3, 'Product and Situation Urgency', 'Real urgency comes from real deadlines and real circumstances — explain the actual consequence, never fake it.', 'video', 55, 6, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.6\n'
'  Title: Product and Situation Urgency\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Sometimes urgency comes from the situation.\n\n'
'A home has a deadline.\n\n'
'A transaction has a timeline.\n\n'
'Documents need to be completed.\n\n'
'A contract has requirements.\n\n'
'A borrower''s circumstances are changing.\n\n'
'That''s real urgency.\n\n'
'Explain the actual consequence.\n\n'
'Don''t exaggerate it.\n\n'
'Don''t invent a deadline.\n\n'
'Don''t create fake scarcity.\n\n'
'Tell the truth about what matters.');

-- 🎬 HEYGEN VIDEO: "The Cost of Waiting" — Lesson 3.7
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_7, v_course_id, v_mod3, 'The Cost of Waiting', '"What happens if you wait?" — the most useful urgency question, used after discovery.', 'video', 56, 7, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.7\n'
'  Title: The Cost of Waiting\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'One of the most useful urgency questions is:\n\n'
'"What happens if you wait?"\n\n'
'Not: "You need to act now."\n\n'
'Instead: "What happens if you wait?"\n\n'
'Maybe nothing significant happens.\n\n'
'Maybe the borrower needs more information.\n\n'
'Maybe they miss a real timeline.\n\n'
'Maybe the opportunity changes.\n\n'
'You don''t know until you ask.\n\n'
'That''s why discovery comes first.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l3_7, v_course_id,
'Why is "What happens if you wait?" more effective than "You need to act now"?',
'multiple_choice',
'[{"label":"It''s shorter to say","is_correct":false},{"label":"It invites the borrower to examine the real consequences rather than feeling pressured","is_correct":true},{"label":"It''s a required compliance statement","is_correct":false},{"label":"It closes faster","is_correct":false}]',
'The question puts the borrower in the thinking position. They discover the cost of waiting themselves — which is more persuasive and more ethical than being told what to do.',
1);

-- 🎬 HEYGEN VIDEO: "The Five Whys" — Lesson 3.8
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_8, v_course_id, v_mod3, 'The Five Whys', 'Ask why until you understand the real motivation — the first answer is rarely the deepest answer.', 'video', 57, 8, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.8\n'
'  Title: The Five Whys\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'When you need to understand motivation, ask why.\n\n'
'Why now?\n\n'
'Why this home?\n\n'
'Why this move?\n\n'
'Why is this important?\n\n'
'Why would waiting matter?\n\n'
'Keep going until you understand the real reason.\n\n'
'Sometimes the first answer isn''t the deepest answer.\n\n'
'The Five Whys helps you get underneath the surface.\n\n'
'And once you understand what''s underneath the surface, your communication becomes much more relevant.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l3_8, v_course_id,
'What is the purpose of the Five Whys technique?',
'multiple_choice',
'[{"label":"To pressure a borrower into deciding","is_correct":false},{"label":"To discover deeper motivation beneath the surface answer","is_correct":true},{"label":"To end conversations quickly","is_correct":false},{"label":"To replace listening","is_correct":false}]',
'The Five Whys helps you go past the first answer to find what''s really driving the borrower''s hesitation or motivation.',
1);

-- 🎬 HEYGEN VIDEO: "Fear of Loss" — Lesson 3.9
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_9, v_course_id, v_mod3, 'Fear of Loss', 'Fear of loss can be real and legitimate — but it must never be manufactured, faked, or exaggerated.', 'video', 58, 9, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.9\n'
'  Title: Fear of Loss\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Fear of loss can be real.\n\n'
'But we have to use it responsibly.\n\n'
'Don''t manufacture fear.\n\n'
'Don''t lie about scarcity.\n\n'
'Don''t create fake deadlines.\n\n'
'Instead, help the borrower understand legitimate consequences.\n\n'
'If waiting creates a real consequence, explain it.\n\n'
'If there isn''t a real consequence, don''t invent one.\n\n'
'Our job is to educate.\n\n'
'Not manipulate.');

-- 🎬 HEYGEN VIDEO: "Rent vs Own" — Lesson 3.10
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_10, v_course_id, v_mod3, 'Rent vs Own', 'Compare the borrower''s current situation with their goal using facts — never universal statements about renting being bad.', 'video', 59, 10, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.10\n'
'  Title: Rent vs Own\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Sometimes the cost of waiting is easier to understand when you compare the borrower''s current situation with their goal.\n\n'
'For example, a borrower may be paying rent while trying to determine whether buying makes sense.\n\n'
'The right conversation isn''t: "Renting is always bad."\n\n'
'The right conversation is: "Let''s understand what you''re trying to accomplish and what staying where you are means for you."\n\n'
'Use facts.\n\n'
'Use the borrower''s goals.\n\n'
'Use accurate information.\n\n'
'Then help them make an informed decision.');

-- 🎬 HEYGEN VIDEO: "Ethical Urgency" — Lesson 3.11
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_11, v_course_id, v_mod3, 'Ethical Urgency', 'The HCMG standard: never manufacture urgency. Create clarity, connect to goals, explain legitimate consequences, and ask for action.', 'video', 60, 11, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.11\n'
'  Title: Ethical Urgency\n'
'  Speaker: Harry (avatar)\n'
'  On-screen key phrase: "Pressure serves the salesperson. Urgency serves the client."\n'
'═══════════════════════════════════════════════════════\n\n'
'Here''s the standard.\n\n'
'Never manufacture urgency.\n\n'
'Never fake scarcity.\n\n'
'Never make unsupported predictions.\n\n'
'Never pressure someone simply because you need the production.\n\n'
'Instead:\n\n'
'Create clarity.\n\n'
'Connect to goals.\n\n'
'Explain legitimate consequences.\n\n'
'Educate.\n\n'
'Then ask for action.\n\n'
'Pressure serves the salesperson.\n\n'
'Urgency serves the client.\n\n'
'Remember that.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l3_11, v_course_id,
'Which of the following is an example of ethical urgency?',
'multiple_choice',
'[{"label":"Inventing a rate deadline","is_correct":false},{"label":"Telling a borrower rates will definitely rise","is_correct":false},{"label":"Explaining the real consequence of missing a contract deadline","is_correct":true},{"label":"Threatening the borrower with losing their spot","is_correct":false}]',
'Ethical urgency is based on real consequences — not manufactured fear. Explaining an actual contract deadline is ethical urgency.',
1);

-- Lesson 3.12 — Urgency Scenarios
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_12, v_course_id, v_mod3, 'Urgency Scenarios', 'Ten scenario questions covering urgency, pressure, the Five Whys, cost of waiting, ethical vs manipulative urgency, and emotional motivation.', 'knowledge_check', 61, 12, true, 'quiz_pass', 80, 900, '15 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l3_12, v_course_id, 'A borrower says they''re waiting for rates to drop. You don''t know what rates will do. What is the correct response?', 'multiple_choice',
'[{"label":"\"Rates are definitely going up.\"","is_correct":false},{"label":"\"What are you hoping will happen before you feel comfortable moving forward?\"","is_correct":true},{"label":"\"Rates will drop in 3 months.\"","is_correct":false},{"label":"\"You should buy right now.\"","is_correct":false}]',
'Never predict rates. Discover the borrower''s actual decision criteria.', 1),

(v_l3_12, v_course_id, 'A loan officer tells a borrower there are "only 2 homes left in that neighborhood" when this isn''t true. This is:', 'multiple_choice',
'[{"label":"Ethical urgency","is_correct":false},{"label":"Manufactured pressure — a violation of HCMG standards","is_correct":true},{"label":"A useful closing technique","is_correct":false},{"label":"A legal requirement","is_correct":false}]',
'Fake scarcity is manipulative and unethical. It violates integrity standards.', 2),

(v_l3_12, v_course_id, 'A borrower says, "I need to think about it." Using the Five Whys approach, what is the most useful next question?', 'multiple_choice',
'[{"label":"\"How long will you think about it?\"","is_correct":false},{"label":"\"What specifically are you thinking through?\"","is_correct":true},{"label":"\"You''ve been thinking too long.\"","is_correct":false},{"label":"\"Let me send you a brochure.\"","is_correct":false}]',
'The Five Whys gets underneath the surface. "What specifically?" invites the borrower to define their concern.', 3),

(v_l3_12, v_course_id, 'A borrower is renting and wants to buy. The right urgency conversation starts with:', 'multiple_choice',
'[{"label":"\"Renting is always throwing money away.\"","is_correct":false},{"label":"\"Let''s understand what you''re trying to accomplish and what staying in your current situation means for you.\"","is_correct":true},{"label":"\"You need to buy now.\"","is_correct":false},{"label":"\"Renting is fine — let''s talk again later.\"","is_correct":false}]',
'The comparison conversation uses the borrower''s own goals — not universal statements about renting being bad.', 4),

(v_l3_12, v_course_id, 'A borrower has a real contract deadline in 30 days. Explaining this deadline is:', 'multiple_choice',
'[{"label":"Pressure","is_correct":false},{"label":"Ethical urgency based on a real situation","is_correct":true},{"label":"Manipulation","is_correct":false},{"label":"Against HCMG standards","is_correct":false}]',
'A real deadline is real urgency. Explaining it to the borrower is serving them — not pressuring them.', 5),

(v_l3_12, v_course_id, 'A borrower says they''re buying because they want their children to grow up in a stable neighborhood. This is:', 'multiple_choice',
'[{"label":"Irrelevant","is_correct":false},{"label":"Emotional urgency that connects the transaction to a personal goal","is_correct":true},{"label":"Pressure","is_correct":false},{"label":"A compliance issue","is_correct":false}]',
'Emotional urgency is not manipulation — it''s understanding why the transaction matters to this borrower.', 6),

(v_l3_12, v_course_id, 'After discovering a borrower''s goals, what is the purpose of asking "What happens if you wait?"', 'multiple_choice',
'[{"label":"To pressure them","is_correct":false},{"label":"To help the borrower examine the real consequences of delaying","is_correct":true},{"label":"To end the conversation","is_correct":false},{"label":"To lock in a rate","is_correct":false}]',
'The question invites the borrower to think through the cost of inaction — not forces them to decide.', 7),

(v_l3_12, v_course_id, 'What does HCMG define as the standard for ethical urgency?', 'multiple_choice',
'[{"label":"Use any technique that creates movement","is_correct":false},{"label":"Create clarity, connect to goals, explain legitimate consequences, educate, then ask for action","is_correct":true},{"label":"Pressure if necessary","is_correct":false},{"label":"Never discuss urgency","is_correct":false}]',
'Ethical urgency is a service — it helps borrowers understand their situation and make informed decisions.', 8),

(v_l3_12, v_course_id, 'A borrower says they''re overwhelmed. The best first step is:', 'multiple_choice',
'[{"label":"Push them to decide faster","is_correct":false},{"label":"Create clarity by understanding what they''re trying to accomplish and what''s stopping them","is_correct":true},{"label":"Stop the conversation","is_correct":false},{"label":"Give them more information","is_correct":false}]',
'Clarity reduces overwhelm. Understand their goal and what''s in the way before adding more information.', 9),

(v_l3_12, v_course_id, 'The phrase "Pressure serves the salesperson. Urgency serves the client." means:', 'multiple_choice',
'[{"label":"They are interchangeable tactics","is_correct":false},{"label":"Pressure is about the salesperson''s needs; urgency is about the borrower''s real interests","is_correct":true},{"label":"Urgency is always wrong","is_correct":false},{"label":"Pressure is the ethical approach","is_correct":false}]',
'The standard draws a clear line. Urgency exists to help the borrower. Pressure exists to help the salesperson.', 10);

-- 🎬 HEYGEN VIDEO: "Module 3 Review" — Lesson 3.13
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_13, v_course_id, v_mod3, 'Module 3 Review: Harry Creates Urgency', 'Key takeaways on urgency, pressure, discovery, and ethical practice.', 'video', 62, 13, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 3.13\n'
'  Title: Module 3 Review\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: "Pressure serves the salesperson. Urgency serves the client."\n'
'═══════════════════════════════════════════════════════\n\n'
'Urgency isn''t about making people uncomfortable.\n\n'
'It''s about helping people understand.\n\n'
'Understand their goals.\n\n'
'Understand their options.\n\n'
'Understand the consequences of waiting.\n\n'
'And understand what the next step actually is.\n\n'
'Pressure serves the salesperson.\n\n'
'Urgency serves the client.\n\n'
'That''s the standard.');

-- Module 3 Quiz
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3_q, v_course_id, v_mod3, 'Module 3 Quiz: Harry Creates Urgency', 'Ten questions on urgency, pressure, the Five Whys, ethical urgency, and borrower goals. Passing score: 80%.', 'knowledge_check', 63, 14, true, 'quiz_pass', 80, 600, '10 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l3_q, v_course_id, 'What does "Pressure serves the salesperson" mean?', 'multiple_choice',
'[{"label":"Pressure is a useful sales tool","is_correct":false},{"label":"Pressure is motivated by the salesperson''s need to produce — not the borrower''s interest","is_correct":true},{"label":"Pressure always results in a close","is_correct":false},{"label":"Pressure is required","is_correct":false}]',
'Pressure is not client-centered. It is driven by the salesperson''s production goals, not the borrower''s situation.', 1),
(v_l3_q, v_course_id, 'What is the HCMG definition of ethical urgency?', 'multiple_choice',
'[{"label":"Creating fear to motivate action","is_correct":false},{"label":"Creating clarity, connecting to goals, explaining legitimate consequences, educating, and asking for action","is_correct":true},{"label":"Inventing a deadline","is_correct":false},{"label":"Pressuring the borrower with fake scarcity","is_correct":false}]',
'Ethical urgency is grounded in the borrower''s actual situation and real consequences — never manufactured.', 2),
(v_l3_q, v_course_id, 'What is the purpose of the Five Whys?', 'multiple_choice',
'[{"label":"To pressure someone","is_correct":false},{"label":"To discover deeper motivation","is_correct":true},{"label":"To end conversations","is_correct":false},{"label":"To replace listening","is_correct":false}]',
'The Five Whys gets beneath surface answers to understand the real motivation.', 3),
(v_l3_q, v_course_id, 'A borrower says, "I''m waiting for rates to drop." What should you NOT do?', 'multiple_choice',
'[{"label":"Ask what they are hoping to happen","is_correct":false},{"label":"Promise rates will definitely drop","is_correct":true},{"label":"Discover their decision criteria","is_correct":false},{"label":"Educate them about their specific situation","is_correct":false}]',
'Never make rate predictions you cannot support. Always discover what the borrower is actually waiting for.', 4),
(v_l3_q, v_course_id, 'Why does clarity matter before creating urgency?', 'multiple_choice',
'[{"label":"It replaces urgency entirely","is_correct":false},{"label":"Without clarity, urgency becomes pressure","is_correct":true},{"label":"It automatically creates a close","is_correct":false},{"label":"It prevents the borrower from making decisions","is_correct":false}]',
'A borrower who doesn''t have clarity about their situation will experience urgency as pressure rather than service.', 5),
(v_l3_q, v_course_id, 'Which is an example of manufactured urgency?', 'multiple_choice',
'[{"label":"Explaining a real contract deadline","is_correct":false},{"label":"Telling a borrower there are only 2 homes left when it''s not true","is_correct":true},{"label":"Asking what happens if they wait","is_correct":false},{"label":"Connecting the decision to the borrower''s family goals","is_correct":false}]',
'Fake scarcity is manufactured urgency — it violates integrity and HCMG standards.', 6),
(v_l3_q, v_course_id, 'Fear of loss is acceptable in the Playbook when:', 'multiple_choice',
'[{"label":"You need to close quickly","is_correct":false},{"label":"There is a real, legitimate consequence to explain honestly","is_correct":true},{"label":"The borrower is very hesitant","is_correct":false},{"label":"You invent a risk to motivate action","is_correct":false}]',
'Fear of loss is only ethical when it is based on real consequences. Never manufacture it.', 7),
(v_l3_q, v_course_id, 'What is the best question to use when discovering a borrower''s actual reason for waiting?', 'multiple_choice',
'[{"label":"\"You should decide now.\"","is_correct":false},{"label":"\"What happens if you wait?\"","is_correct":true},{"label":"\"Stop waiting.\"","is_correct":false},{"label":"\"I can''t help you if you wait.\"","is_correct":false}]',
'"What happens if you wait?" invites the borrower to examine the cost of inaction themselves — without pressure.', 8),
(v_l3_q, v_course_id, 'What does emotional urgency refer to in Harry''s Playbook?', 'multiple_choice',
'[{"label":"Manipulating the borrower''s feelings","is_correct":false},{"label":"Understanding the personal reasons behind the transaction — family, stability, opportunity","is_correct":true},{"label":"Creating false emotional pressure","is_correct":false},{"label":"Avoiding emotional topics","is_correct":false}]',
'Emotional urgency is recognizing and connecting to the real personal reasons behind the borrower''s decision.', 9),
(v_l3_q, v_course_id, 'Urgency serves the client means:', 'multiple_choice',
'[{"label":"The client is pressured to act","is_correct":false},{"label":"Urgency is grounded in the borrower''s actual goals and real consequences","is_correct":true},{"label":"Urgency always closes the deal","is_correct":false},{"label":"The client should feel rushed","is_correct":false}]',
'Serving the client means helping them understand their situation so they can make an informed decision.', 10);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 4: HARRY OWNS THE OUTCOME
-- ═══════════════════════════════════════════════════════════════════════════

-- 🎬 HEYGEN VIDEO: "The Accountability Mindset" — Lesson 4.1
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_1, v_course_id, v_mod4, 'The Accountability Mindset', 'The shift from blame to ownership — "What could I have done differently?"', 'video', 64, 1, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 4.1\n'
'  Title: The Accountability Mindset\n'
'  Speaker: Harry (avatar)\n'
'  On-screen key phrase: "What could I have done differently?"\n'
'═══════════════════════════════════════════════════════\n\n'
'Accountability is one of the biggest differences between average performers and high performers.\n\n'
'Average performers ask: "Whose fault was it?"\n\n'
'High performers ask: "What could I have done differently?"\n\n'
'That''s ownership.\n\n'
'Ownership doesn''t mean everything is your fault.\n\n'
'It means you''re responsible for controlling what you can control.\n\n'
'You control your preparation.\n\n'
'Your activity.\n\n'
'Your attitude.\n\n'
'Your follow-up.\n\n'
'Your communication.\n\n'
'Your effort.\n\n'
'Your willingness to ask for help.\n\n'
'You don''t control everything.\n\n'
'But you control more than you think.');

-- 🎬 HEYGEN VIDEO: "Winners Own Outcomes" — Lesson 4.2
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_2, v_course_id, v_mod4, 'Winners Own Outcomes', 'How high performers respond when things go wrong — they look for what they could learn and do differently.', 'video', 65, 2, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 4.2\n'
'  Title: Winners Own Outcomes\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'When something doesn''t go your way, you have a choice.\n\n'
'You can explain why it wasn''t your fault.\n\n'
'Or you can ask what you can learn from it.\n\n'
'Maybe the lead wasn''t good.\n\n'
'Maybe the borrower changed their mind.\n\n'
'Maybe the market changed.\n\n'
'Maybe another lender won.\n\n'
'Those things happen.\n\n'
'Accountability doesn''t mean pretending external factors don''t exist.\n\n'
'It means asking:\n\n'
'"What was within my control?"\n\n'
'"What could I have done better?"\n\n'
'"What will I do differently next time?"\n\n'
'That''s how people improve.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l4_2, v_course_id,
'A loan officer loses a deal to another lender. What is the accountability-minded response?',
'multiple_choice',
'[{"label":"\"The lead was bad anyway.\"","is_correct":false},{"label":"\"What was within my control, and what could I have done differently?\"","is_correct":true},{"label":"\"The borrower made the wrong choice.\"","is_correct":false},{"label":"\"My manager should have helped more.\"","is_correct":false}]',
'Accountability is about learning and improving — not assigning blame for what went wrong.',
1);

-- Lesson 4.3 — Stop Blaming, Start Owning (text)
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_3, v_course_id, v_mod4, 'Stop Blaming, Start Owning', 'The one question that shifts focus from excuses to improvement: "What could I have done differently?"', 'text', 66, 3, true, 'watch_pct', 80, 120, '2 min',
E'## Stop Blaming, Start Owning\n\n'
'Accountability is not blame.\n\n'
'Accountability is ownership.\n\n'
'The most powerful accountability question is:\n\n'
'**"What could I have done differently?"**\n\n'
'This question shifts focus from excuses to improvement.\n\n'
'It does not require that everything was your fault.\n\n'
'It requires that you identify what was within your control — and what you could improve next time.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l4_3, v_course_id,
'Which question best reflects the accountability mindset?',
'multiple_choice',
'[{"label":"\"Whose fault is this?\"","is_correct":false},{"label":"\"What could I have done differently?\"","is_correct":true},{"label":"\"Why did this happen to me?\"","is_correct":false},{"label":"\"Who should fix this?\"","is_correct":false}]',
'"What could I have done differently?" focuses attention on learning and improvement — not blame.',
1);

-- 🎬 HEYGEN VIDEO: "Hope Is Not a Strategy" — Lesson 4.4
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_4, v_course_id, v_mod4, 'Hope Is Not a Strategy', 'Action creates possibilities. Accountability creates consistency. Waiting and hoping are not strategies.', 'video', 67, 4, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 4.4\n'
'  Title: Hope Is Not a Strategy\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Hope is not a strategy.\n\n'
'You can hope a lead calls back.\n\n'
'Or you can follow up.\n\n'
'You can hope the pipeline improves.\n\n'
'Or you can create more activity.\n\n'
'You can hope the next borrower appears.\n\n'
'Or you can prospect.\n\n'
'You can hope the file moves.\n\n'
'Or you can make sure your part of the file is prepared.\n\n'
'Hope isn''t bad.\n\n'
'But hope without action isn''t a strategy.\n\n'
'Action creates possibilities.\n\n'
'Accountability creates consistency.');

-- 🎬 HEYGEN VIDEO: "Action + Accountability = Results" — Lesson 4.5
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_5, v_course_id, v_mod4, 'Action + Accountability = Results', 'The improvement cycle: take action, measure, look at what worked, adjust, repeat.', 'video', 68, 5, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 4.5\n'
'  Title: Action + Accountability = Results\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: Action → Accountability → Adjustment → Execution → Repeat\n'
'═══════════════════════════════════════════════════════\n\n'
'Action alone isn''t enough.\n\n'
'You can be busy and still be ineffective.\n\n'
'That''s why accountability matters.\n\n'
'Take action.\n\n'
'Measure what happened.\n\n'
'Look at what worked.\n\n'
'Look at what didn''t.\n\n'
'Adjust.\n\n'
'Then take action again.\n\n'
'That''s the cycle.\n\n'
'Action.\n\n'
'Accountability.\n\n'
'Adjustment.\n\n'
'Execution.\n\n'
'Repeat.');

-- 🎬 HEYGEN VIDEO: "The HCMG Daily Success Scorecard" — Lesson 4.6
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_6, v_course_id, v_mod4, 'The HCMG Daily Success Scorecard', 'Why you can''t improve what you refuse to measure — and what the scorecard tracks.', 'video', 69, 6, true, 'watch_pct', 80, 200, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 4.6\n'
'  Title: The HCMG Daily Success Scorecard\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: Scorecard categories listed\n'
'═══════════════════════════════════════════════════════\n\n'
'You can''t improve what you refuse to measure.\n\n'
'That''s why the Playbook uses a daily scorecard.\n\n'
'Calls Made.\n\n'
'Conversations.\n\n'
'Applications Started.\n\n'
'Applications Completed.\n\n'
'Referrals Requested.\n\n'
'Follow-Ups.\n\n'
'Pre-Approvals Issued.\n\n'
'Loans Submitted.\n\n'
'The purpose of a scorecard isn''t punishment.\n\n'
'It''s visibility.\n\n'
'You should be able to look at your activity and understand what you''re actually doing.\n\n'
'Because if the results aren''t where you want them to be, the first question should be:\n\n'
'"What does the activity tell me?"');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l4_6, v_course_id,
'What is the primary purpose of the HCMG Daily Success Scorecard?',
'multiple_choice',
'[{"label":"Punishment for underperformance","is_correct":false},{"label":"Visibility into what you are actually doing daily","is_correct":true},{"label":"Replacing coaching","is_correct":false},{"label":"Guaranteeing production","is_correct":false}]',
'The scorecard creates visibility — so employees can see their actual activity and understand what needs to change.',
1);

-- Lesson 4.7 — What Gets Measured Gets Improved (text)
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_7, v_course_id, v_mod4, 'What Gets Measured Gets Improved', 'The principle behind the scorecard — measurement creates visibility, and visibility creates improvement.', 'text', 70, 7, true, 'watch_pct', 80, 120, '2 min',
E'## What Gets Measured Gets Improved\n\n'
'The HCMG Daily Success Scorecard tracks:\n\n'
'- Calls Made\n'
'- Conversations\n'
'- Applications Started\n'
'- Applications Completed\n'
'- Referrals Requested\n'
'- Follow-Ups\n'
'- Pre-Approvals Issued\n'
'- Loans Submitted\n\n'
'The purpose is **visibility**, not punishment.\n\n'
'When results are below expectations, the first question is: "What does the activity tell me?"\n\n'
'You cannot improve what you refuse to measure.');

-- 🎬 HEYGEN VIDEO: "The Power of Consistency" — Lesson 4.8
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_8, v_course_id, v_mod4, 'The Power of Consistency', 'One great day doesn''t build a career. Small behaviors repeated over time create large differences.', 'video', 71, 8, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 4.8\n'
'  Title: The Power of Consistency\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'One great day doesn''t build a career.\n\n'
'Consistency does.\n\n'
'You don''t prospect once.\n\n'
'You prospect repeatedly.\n\n'
'You don''t follow up once.\n\n'
'You follow up consistently.\n\n'
'You don''t study once.\n\n'
'You keep learning.\n\n'
'You don''t improve one week.\n\n'
'You build habits.\n\n'
'That''s why consistency matters.\n\n'
'Small behaviors repeated over time create large differences.');

-- 🎬 HEYGEN VIDEO: "Time Management" — Lesson 4.9
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_9, v_course_id, v_mod4, 'Time Management', 'Time is one of the few things you can''t get back — protect it by planning your day and executing the plan.', 'video', 72, 9, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 4.9\n'
'  Title: Time Management\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Time is one of the few things you can''t get back.\n\n'
'So protect it.\n\n'
'If prospecting matters, put it on the calendar.\n\n'
'If follow-up matters, put it on the calendar.\n\n'
'If borrower consultations matter, protect that time.\n\n'
'If pipeline management matters, give it a block.\n\n'
'Don''t let your entire day become reactive.\n\n'
'Plan your day.\n\n'
'Then execute your plan.');

-- Lesson 4.10 — Every Hour Needs a Purpose (text)
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_10, v_course_id, v_mod4, 'Every Hour Needs a Purpose', 'The HCMG time-blocking structure — an example schedule for protecting productive activity.', 'text', 73, 10, true, 'watch_pct', 80, 150, '2 min',
E'## Every Hour Needs a Purpose\n\n'
'Example HCMG time-blocking structure:\n\n'
'| Time | Activity |\n'
'|---|---|\n'
'| 8–9 am | Power Hour Prospecting |\n'
'| 9–11 am | Lead Follow-Up |\n'
'| 11–12 pm | Applications |\n'
'| 12–1 pm | Lunch |\n'
'| 1–3 pm | Borrower Consultations |\n'
'| 3–4 pm | Referral Partner Outreach |\n'
'| 4–5 pm | Pipeline Management |\n\n'
'The exact schedule may change based on business requirements.\n\n'
'The principle does not:\n\n'
'**Every hour needs a purpose.**');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l4_10, v_course_id,
'What does "Every hour needs a purpose" mean?',
'multiple_choice',
'[{"label":"Every hour must be filled with activity","is_correct":false},{"label":"Intentional planning prevents reactive, unproductive days","is_correct":true},{"label":"Lunch breaks are not allowed","is_correct":false},{"label":"The schedule never changes","is_correct":false}]',
'The time-blocking principle is about protecting important activities by assigning them specific times — so reactive interruptions don''t consume the day.',
1);

-- 🎬 HEYGEN VIDEO: "Winning Habits" — Lesson 4.11
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_11, v_course_id, v_mod4, 'Winning Habits', 'Champions depend on standards, not motivation. The seven habits that high performers build.', 'video', 74, 11, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 4.11\n'
'  Title: Winning Habits\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Winning habits aren''t complicated.\n\n'
'Review your goals.\n\n'
'Prospect every day.\n\n'
'Follow up relentlessly.\n\n'
'Ask for referrals.\n\n'
'Protect prospecting time.\n\n'
'Study the craft.\n\n'
'Stay coachable.\n\n'
'Those behaviors aren''t exciting every day.\n\n'
'That''s the point.\n\n'
'Champions don''t depend on motivation.\n\n'
'They depend on standards.');

-- 🎬 HEYGEN VIDEO: "Goal Setting" — Lesson 4.12
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_12, v_course_id, v_mod4, 'Goal Setting', 'Dream + Detail + Deadline = Goal. A goal without action is just a statement.', 'video', 75, 12, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 4.12\n'
'  Title: Goal Setting\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: DREAM + DETAIL + DEADLINE = GOAL\n'
'═══════════════════════════════════════════════════════\n\n'
'A goal becomes more useful when it has detail and a deadline.\n\n'
'The Playbook gives us a simple formula:\n\n'
'Dream plus Detail plus Deadline equals Goal.\n\n'
'Dream tells you what you want.\n\n'
'Detail tells you what it actually means.\n\n'
'Deadline tells you when you''re going to accomplish it.\n\n'
'Then you need action.\n\n'
'A goal without action is just a statement.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l4_12, v_course_id,
'According to the Playbook, what makes a goal useful?',
'multiple_choice',
'[{"label":"Being ambitious","is_correct":false},{"label":"Having a dream, detail, and a deadline — plus action","is_correct":true},{"label":"Writing it down","is_correct":false},{"label":"Telling others about it","is_correct":false}]',
'Dream + Detail + Deadline = Goal. Without action attached, it remains a statement — not a real goal.',
1);

-- Lesson 4.13 — Personal Accountability Scenarios
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_13, v_course_id, v_mod4, 'Personal Accountability Scenarios', 'Ten scenario questions on missed follow-up, low activity, lost opportunities, time management, scorecard interpretation, and ownership.', 'knowledge_check', 76, 13, true, 'quiz_pass', 80, 900, '15 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l4_13, v_course_id, 'A loan officer had 3 conversations this week but submitted no applications. The most useful accountability question is:', 'multiple_choice',
'[{"label":"\"Why are the leads so bad?\"","is_correct":false},{"label":"\"What happened in those conversations that didn''t result in an application?\"","is_correct":true},{"label":"\"The borrowers weren''t serious.\"","is_correct":false},{"label":"\"I need better leads.\"","is_correct":false}]',
'Accountability asks what was within your control. Examining the conversations reveals what could improve.', 1),

(v_l4_13, v_course_id, 'A loan officer''s pipeline is empty. Their scorecard shows 2 calls per day over the last month. The root cause is most likely:', 'multiple_choice',
'[{"label":"Bad luck","is_correct":false},{"label":"Insufficient activity","is_correct":true},{"label":"Bad leads","is_correct":false},{"label":"Poor market conditions","is_correct":false}]',
'Activity creates pipeline. Low activity creates an empty pipeline. The scorecard reveals the root cause.', 2),

(v_l4_13, v_course_id, 'Which best describes the accountability mindset?', 'multiple_choice',
'[{"label":"Assigning blame to the right person","is_correct":false},{"label":"Asking what was within your control and what you could improve","is_correct":true},{"label":"Never accepting criticism","is_correct":false},{"label":"Attributing failure to external factors","is_correct":false}]',
'Accountability is ownership — not blame. High performers focus on what they can control and improve.', 3),

(v_l4_13, v_course_id, 'A loan officer spends the morning responding to emails instead of prospecting. What principle did they violate?', 'multiple_choice',
'[{"label":"Sales ethics","is_correct":false},{"label":"Every hour needs a purpose — prospecting time should be protected","is_correct":true},{"label":"CRM standards","is_correct":false},{"label":"Follow-up standards","is_correct":false}]',
'Allowing reactive work to replace protected prospecting time is a time management failure.', 4),

(v_l4_13, v_course_id, 'A loan officer lost a deal and says, "The borrower was never serious." What is missing from this response?', 'multiple_choice',
'[{"label":"Nothing — external factors can cause lost deals","is_correct":false},{"label":"An accountability-minded review of what was within their control","is_correct":true},{"label":"More product knowledge","is_correct":false},{"label":"A better rate","is_correct":false}]',
'"The borrower was never serious" deflects ownership. Accountability asks what the loan officer could have done differently.', 5),

(v_l4_13, v_course_id, 'What does the HCMG Daily Scorecard help a loan officer understand?', 'multiple_choice',
'[{"label":"How to guarantee closings","is_correct":false},{"label":"Their actual daily activity level and where to improve","is_correct":true},{"label":"Their personal worth","is_correct":false},{"label":"What management thinks of them","is_correct":false}]',
'The scorecard creates visibility — making it possible to see what''s actually happening and what needs to change.', 6),

(v_l4_13, v_course_id, 'Which statement best reflects the Playbook''s teaching on consistency?', 'multiple_choice',
'[{"label":"One great week can compensate for months of low activity","is_correct":false},{"label":"Small behaviors repeated over time create large differences","is_correct":true},{"label":"Consistency only matters for high producers","is_correct":false},{"label":"Motivation drives consistency","is_correct":false}]',
'Consistency — not occasional peaks — is what builds a sustainable career. Champions depend on standards, not motivation.', 7),

(v_l4_13, v_course_id, 'The formula Dream + Detail + Deadline produces:', 'multiple_choice',
'[{"label":"A daily task list","is_correct":false},{"label":"A goal with meaning and a deadline — plus action","is_correct":true},{"label":"A product pitch","is_correct":false},{"label":"A CRM entry","is_correct":false}]',
'Dream + Detail + Deadline creates a real goal. Without action, it remains just a statement.', 8),

(v_l4_13, v_course_id, 'A loan officer gets good results on some days but does not prospect or follow up on others. What is the real problem?', 'multiple_choice',
'[{"label":"Lack of skill","is_correct":false},{"label":"Lack of consistency","is_correct":true},{"label":"Lack of leads","is_correct":false},{"label":"Lack of technology","is_correct":false}]',
'Inconsistency creates an unreliable pipeline. Consistent daily habits are what build sustainable performance.', 9),

(v_l4_13, v_course_id, '"Hope is not a strategy" means:', 'multiple_choice',
'[{"label":"Hope is useless","is_correct":false},{"label":"Hope without action does not create results","is_correct":true},{"label":"Strategy is more important than attitude","is_correct":false},{"label":"Goals are better than hope","is_correct":false}]',
'Hope is fine — but action and accountability are what create actual results. Waiting and hoping are not substitutes for activity.', 10);

-- 🎬 HEYGEN VIDEO: "Module 4 Review" — Lesson 4.14
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_14, v_course_id, v_mod4, 'Module 4 Review: Harry Owns the Outcome', 'Key takeaways on accountability, the scorecard, consistency, time management, and goal setting.', 'video', 77, 14, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 4.14\n'
'  Title: Module 4 Review\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Accountability means ownership.\n\n'
'Measure the activity.\n\n'
'Protect your time.\n\n'
'Build consistency.\n\n'
'Set goals.\n\n'
'And when something doesn''t work, ask:\n\n'
'"What could I have done differently?"\n\n'
'That''s how you improve.');

-- Module 4 Quiz
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4_q, v_course_id, v_mod4, 'Module 4 Quiz: Harry Owns the Outcome', 'Ten questions on accountability, the scorecard, consistency, time management, and goal setting. Passing score: 80%.', 'knowledge_check', 78, 15, true, 'quiz_pass', 80, 600, '10 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l4_q, v_course_id, 'What question best reflects accountability?', 'multiple_choice',
'[{"label":"\"Whose fault was it?\"","is_correct":false},{"label":"\"What could I have done differently?\"","is_correct":true},{"label":"\"Why did this happen to me?\"","is_correct":false},{"label":"\"Who should fix this?\"","is_correct":false}]', 'Accountability is ownership — asking what you could improve, not who to blame.', 1),
(v_l4_q, v_course_id, 'What is the purpose of the HCMG Daily Scorecard?', 'multiple_choice',
'[{"label":"Punishment","is_correct":false},{"label":"Visibility into actual daily activity","is_correct":true},{"label":"Replacing coaching","is_correct":false},{"label":"Guaranteeing closings","is_correct":false}]', 'Visibility creates the ability to improve. The scorecard shows what''s actually happening.', 2),
(v_l4_q, v_course_id, 'What does consistency create?', 'multiple_choice',
'[{"label":"Luck","is_correct":false},{"label":"Sustainable performance over time","is_correct":true},{"label":"Guaranteed production","is_correct":false},{"label":"Automatic leads","is_correct":false}]', 'Small behaviors repeated over time create large differences. Consistency builds careers.', 3),
(v_l4_q, v_course_id, 'What does "Every hour needs a purpose" mean?', 'multiple_choice',
'[{"label":"Work without breaks","is_correct":false},{"label":"Plan your most important activities so reactive work doesn''t consume the day","is_correct":true},{"label":"Track every minute","is_correct":false},{"label":"Never check email","is_correct":false}]', 'Time blocking protects priority activities from being replaced by reactive interruptions.', 4),
(v_l4_q, v_course_id, 'Hope without action is:', 'multiple_choice',
'[{"label":"A valid strategy","is_correct":false},{"label":"Not a strategy","is_correct":true},{"label":"A form of accountability","is_correct":false},{"label":"A good attitude","is_correct":false}]', 'Hope is fine, but action is what creates results.', 5),
(v_l4_q, v_course_id, 'The improvement cycle is:', 'multiple_choice',
'[{"label":"Hope → Wait → Hope Again","is_correct":false},{"label":"Action → Accountability → Adjustment → Execution → Repeat","is_correct":true},{"label":"Lead → Application → Closing","is_correct":false},{"label":"Train → Test → Certify","is_correct":false}]', 'The cycle requires measuring what happened, adjusting, and repeating.', 6),
(v_l4_q, v_course_id, 'The goal formula in Harry''s Playbook is:', 'multiple_choice',
'[{"label":"Goals + Plans + Rewards","is_correct":false},{"label":"Dream + Detail + Deadline + Action","is_correct":true},{"label":"Hope + Effort + Timing","is_correct":false},{"label":"Skill + Activity + Attitude","is_correct":false}]', 'Dream + Detail + Deadline = Goal. Add action to make it real.', 7),
(v_l4_q, v_course_id, 'What is accountability — as defined in the Playbook?', 'multiple_choice',
'[{"label":"Blame","is_correct":false},{"label":"Ownership of what is within your control","is_correct":true},{"label":"Punishment","is_correct":false},{"label":"External review","is_correct":false}]', 'Accountability is taking ownership — not blaming others for outcomes.', 8),
(v_l4_q, v_course_id, 'Champions depend on:', 'multiple_choice',
'[{"label":"Motivation","is_correct":false},{"label":"Standards and consistent habits","is_correct":true},{"label":"Luck","is_correct":false},{"label":"Perfect leads","is_correct":false}]', 'Standards — not motivation — drive consistent performance.', 9),
(v_l4_q, v_course_id, 'Which scorecard item directly reflects the first stage of the HCMG sales process?', 'multiple_choice',
'[{"label":"Loans Submitted","is_correct":false},{"label":"Calls Made","is_correct":true},{"label":"Pre-Approvals Issued","is_correct":false},{"label":"Closings","is_correct":false}]', 'Calls Made is the activity that initiates the entire process — creating conversations from which everything else flows.', 10);

-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 5: HCMG SUCCESS OS
-- ═══════════════════════════════════════════════════════════════════════════

-- 🎬 HEYGEN VIDEO: "Great Loan Officers Have Systems" — Lesson 5.1
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_1, v_course_id, v_mod5, 'Great Loan Officers Have Systems', 'Goals tell you where to go. Systems tell you what to do repeatedly to get there.', 'video', 79, 1, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.1\n'
'  Title: Great Loan Officers Have Systems\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Great loan officers have goals.\n\n'
'Elite loan officers have systems.\n\n'
'A goal tells you where you''re going.\n\n'
'A system tells you what you''re going to do repeatedly to get there.\n\n'
'That''s what the HCMG Success OS is about.\n\n'
'Consistent activity.\n\n'
'Consistent follow-up.\n\n'
'Consistent documentation.\n\n'
'Consistent communication.\n\n'
'Consistent pipeline management.\n\n'
'You don''t want to reinvent your day every day.\n\n'
'You want a system.');

-- 🎬 HEYGEN VIDEO: "The HCMG Daily Success Formula" — Lesson 5.2
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_2, v_course_id, v_mod5, 'The HCMG Daily Success Formula', 'Start with mindset. Create activity. Develop skill. Stay accountable. Repeat.', 'video', 80, 2, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.2\n'
'  Title: The HCMG Daily Success Formula\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'The daily formula is simple.\n\n'
'Start with mindset.\n\n'
'Create activity.\n\n'
'Develop skill.\n\n'
'Stay accountable.\n\n'
'Then repeat.\n\n'
'Don''t wait for the perfect day.\n\n'
'Win today.\n\n'
'Then do it again tomorrow.\n\n'
'That''s how consistency is built.');

-- Lesson 5.3 — Win Today written
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_3, v_course_id, v_mod5, 'Win Today, Then Do It Again Tomorrow', 'The HCMG system is built around repeatable behaviors — not occasional exceptional effort.', 'text', 81, 3, true, 'watch_pct', 80, 120, '2 min',
E'## Win Today, Then Do It Again Tomorrow\n\n'
'The HCMG system is designed around repeatable behaviors.\n\n'
'The objective is not one exceptional day.\n\n'
'The objective is a sustainable standard.\n\n'
'Every day:\n'
'- Start with mindset\n'
'- Create activity\n'
'- Develop skill\n'
'- Stay accountable\n\n'
'Then repeat.');

-- 🎬 HEYGEN VIDEO: "The HCMG Morning Routine" — Lesson 5.4
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_4, v_course_id, v_mod5, 'The HCMG Morning Routine', 'Starting the day intentionally: review goals, review priorities, know who needs follow-up.', 'video', 82, 4, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.4\n'
'  Title: The HCMG Morning Routine\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'How you start the day matters.\n\n'
'Review your goals.\n\n'
'Review your priorities.\n\n'
'Know who needs follow-up.\n\n'
'Know what applications need attention.\n\n'
'Know what pipeline items need movement.\n\n'
'Then protect your most important activity.\n\n'
'Don''t start every morning reacting to whatever happens to appear first.\n\n'
'Start intentionally.');

-- 🎬 HEYGEN VIDEO: "Prospecting" — Lesson 5.5
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_5, v_course_id, v_mod5, 'Prospecting', 'Prospecting needs protected time — don''t wait until you have nothing else to do.', 'video', 83, 5, true, 'watch_pct', 80, 120, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.5\n'
'  Title: Prospecting\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Prospecting creates opportunities.\n\n'
'If you stop prospecting because you''re busy, eventually the pipeline feels it.\n\n'
'That''s why prospecting needs protected time.\n\n'
'Don''t wait until you have nothing else to do.\n\n'
'Make it part of the system.');

-- 🎬 HEYGEN VIDEO: "Lead Management" — Lesson 5.6
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_6, v_course_id, v_mod5, 'Lead Management', 'A lead is an opportunity that requires action — review it, contact it, document it, follow up, advance it.', 'video', 84, 6, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.6\n'
'  Title: Lead Management\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'A lead isn''t a name.\n\n'
'A lead is an opportunity that requires action.\n\n'
'Review it.\n\n'
'Contact it.\n\n'
'Document it.\n\n'
'Follow up.\n\n'
'Advance it.\n\n'
'That''s the standard.\n\n'
'No lead left behind.');

-- Lesson 5.7 — No Lead Left Behind (text)
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_7, v_course_id, v_mod5, 'No Lead Left Behind', 'HCMG lead management standards — contact, follow-up, CRM, and documentation expectations.', 'text', 85, 7, true, 'watch_pct', 80, 150, '2 min',
E'## No Lead Left Behind\n\n'
'HCMG lead management standards:\n\n'
'- **New lead contact:** Within five minutes\n'
'- **Daily follow-up attempts:** Minimum ten\n'
'- **CRM update rate:** 100%\n'
'- **Lead notes:** Required on every lead\n\n'
'Every lead is an opportunity. Treat it accordingly.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l5_7, v_course_id,
'What is the HCMG standard for contacting a new lead?',
'multiple_choice',
'[{"label":"Within 24 hours","is_correct":false},{"label":"Within five minutes","is_correct":true},{"label":"Within one hour","is_correct":false},{"label":"At the end of the day","is_correct":false}]',
'HCMG''s lead standard requires contact within five minutes — speed of response significantly affects conversion.',
1);

-- 🎬 HEYGEN VIDEO: "CRM Expectations" — Lesson 5.8
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_8, v_course_id, v_mod5, 'CRM Expectations', 'The CRM is not a diary — it''s a business system. Every interaction should be documented with context and next actions.', 'video', 86, 8, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.8\n'
'  Title: CRM Expectations\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Your CRM is not a diary.\n\n'
'It''s a business system.\n\n'
'If you spoke to a borrower, document it.\n\n'
'If you learned something important, document it.\n\n'
'If there''s a next action, schedule it.\n\n'
'If another team member opened this lead tomorrow, they should understand what happened.\n\n'
'Good documentation protects the borrower.\n\n'
'It protects the team.\n\n'
'And it protects the business.');

-- Lesson 5.9 — Document the Conversation (scenario)
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_9, v_course_id, v_mod5, 'Document the Conversation', 'What a useful CRM note looks like vs. what a useless one looks like.', 'knowledge_check', 87, 9, true, 'quiz_pass', 80, 180, '3 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l5_9, v_course_id,
'Which CRM note is most useful?',
'multiple_choice',
'[{"label":"\"Talked to borrower.\"","is_correct":false},{"label":"\"Good call.\"","is_correct":false},{"label":"\"Borrower wants to purchase within approx. 60 days, concerned about payment, plans to review options with spouse tonight. Follow-up scheduled for tomorrow morning.\"","is_correct":true},{"label":"\"Follow up later.\"","is_correct":false}]',
'A useful CRM note records what was learned, the borrower''s concerns, their timeline, and the next action — so any team member can continue the conversation.',
1);

-- 🎬 HEYGEN VIDEO: "Follow-Up Standards" — Lesson 5.10
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_10, v_course_id, v_mod5, 'Follow-Up Standards', 'Relentless doesn''t mean annoying — it means consistent, useful, and professional.', 'video', 88, 10, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.10\n'
'  Title: Follow-Up Standards\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Follow-up is where opportunities are often won or lost.\n\n'
'Don''t assume silence means no.\n\n'
'Don''t assume busy means uninterested.\n\n'
'Follow up.\n\n'
'Be useful.\n\n'
'Bring information.\n\n'
'Ask questions.\n\n'
'Move the conversation forward.\n\n'
'Relentless doesn''t mean annoying.\n\n'
'It means consistent.');

-- 🎬 HEYGEN VIDEO: "HCMG Loan Workflow" — Lesson 5.11
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_11, v_course_id, v_mod5, 'The HCMG Loan Workflow', 'A full walkthrough of the loan workflow stages from Lead through Post-Close Follow-Up.', 'video', 89, 11, true, 'watch_pct', 80, 300, '5 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.11\n'
'  Title: The HCMG Loan Workflow\n'
'  Speaker: Harry (avatar)\n'
'  On-screen visual: Workflow stages flowing downward\n'
'    LEAD → CONSULTATION → APPLICATION → SET UP → REVIEW FILE\n'
'    → PREPARE DISCLOSURES → SEND DISCLOSURES → TRACK EXECUTION\n'
'    → PREPARE FOR PROCESSING → PROCESSING → UNDERWRITING\n'
'    → CONDITIONAL APPROVAL → CLEAR TO CLOSE → CLOSING\n'
'    → FUNDING → POST-CLOSE FOLLOW-UP\n'
'═══════════════════════════════════════════════════════\n\n'
'Let''s walk through the HCMG workflow.\n\n'
'Lead.\n\n'
'Consultation.\n\n'
'Application.\n\n'
'Set Up.\n\n'
'Review File.\n\n'
'Prepare Disclosures.\n\n'
'Send Disclosures.\n\n'
'Track Execution.\n\n'
'Prepare for Processing.\n\n'
'Processing.\n\n'
'Underwriting.\n\n'
'Conditional Approval.\n\n'
'Clear to Close.\n\n'
'Closing.\n\n'
'Funding.\n\n'
'Post-Close Follow-Up.\n\n'
'Every stage matters.\n\n'
'And every person involved affects the next stage.\n\n'
'That''s why preparation matters.\n\n'
'That''s why communication matters.\n\n'
'That''s why ownership matters.');

-- Lessons 5.12–5.16 written workflow lessons
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES
(v_l5_12, v_course_id, v_mod5, 'The Early Stages: Lead to Set Up', 'The first four stages of the workflow and the objective of building a strong foundation.', 'text', 90, 12, true, 'watch_pct', 80, 180, '3 min',
E'## The Early Stages\n\n'
'**Lead → Consultation → Application → Set Up**\n\n'
'The objective of the early stages is to create a strong foundation for everything that follows.\n\n'
'- **Lead:** An opportunity that requires immediate action\n'
'- **Consultation:** Understanding the borrower''s goals and situation\n'
'- **Application:** Gathering the required information accurately\n'
'- **Set Up:** Preparing the file properly before submission\n\n'
'The quality of the early stages affects every stage that follows.'),

(v_l5_13, v_course_id, v_mod5, 'Review File', 'Preparation is part of production — know what''s in the file, what''s missing, and what could create a problem downstream.', 'video', 91, 13, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.13\n'
'  Title: Review File\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Reviewing the file means understanding what you''re submitting.\n\n'
'Don''t assume somebody else will catch everything.\n\n'
'Know what is in the file.\n\n'
'Know what is missing.\n\n'
'Know what needs clarification.\n\n'
'Know what could create a problem downstream.\n\n'
'Preparation is part of production.'),

(v_l5_14, v_course_id, v_mod5, 'Disclosures', 'Accuracy, communication, and execution are the standards for the disclosure stage.', 'video', 92, 14, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.14\n'
'  Title: Disclosures\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Disclosures are another important stage in the process.\n\n'
'The standard is accuracy.\n\n'
'The standard is communication.\n\n'
'The standard is execution.\n\n'
'Don''t treat disclosures like paperwork that somebody else will handle.\n\n'
'Understand where they fit in the workflow and make sure your responsibilities are completed accurately and on time.'),

(v_l5_15, v_course_id, v_mod5, 'Processing and Underwriting', 'Staying engaged during processing and underwriting — your responsibility for communication doesn''t end when the file moves.', 'video', 93, 15, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.15\n'
'  Title: Processing and Underwriting\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Once the file moves into processing and underwriting, your job doesn''t disappear.\n\n'
'You still have responsibility for communication.\n\n'
'You still have responsibility for follow-up.\n\n'
'You still have responsibility for helping solve issues.\n\n'
'The file is moving through a team process.\n\n'
'Stay engaged.'),

(v_l5_16, v_course_id, v_mod5, 'Clear to Close, Closing and Funding', 'The finish line isn''t Clear to Close — finish strong through funding and post-close follow-up.', 'video', 94, 16, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.16\n'
'  Title: Clear to Close, Closing and Funding\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'The finish line isn''t just Clear to Close.\n\n'
'There''s still closing.\n\n'
'Then funding.\n\n'
'Then post-close follow-up.\n\n'
'The borrower experience continues.\n\n'
'Don''t disappear after the approval.\n\n'
'Finish strong.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l5_16, v_course_id,
'Which comes after Underwriting in the HCMG loan workflow?',
'multiple_choice',
'[{"label":"Lead","is_correct":false},{"label":"Consultation","is_correct":false},{"label":"Conditional Approval","is_correct":true},{"label":"Set Up","is_correct":false}]',
'After Underwriting comes Conditional Approval, then Clear to Close, Closing, Funding, and Post-Close Follow-Up.',
1);

-- 🎬 HEYGEN VIDEO: "The Cleaner File Principle" — Lesson 5.17
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_17, v_course_id, v_mod5, 'The Cleaner File Principle', 'The cleaner the file submitted to Set Up, the faster it can move. Preparation helps everyone downstream.', 'video', 95, 17, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.17\n'
'  Title: The Cleaner File Principle\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Here''s a simple principle.\n\n'
'The cleaner the file submitted to Set Up, the faster the file can move through the process.\n\n'
'That doesn''t mean every file will move at the same speed.\n\n'
'It means preparation matters.\n\n'
'Complete information.\n\n'
'Clear documentation.\n\n'
'Known issues.\n\n'
'Accurate details.\n\n'
'The more prepared the file is, the easier it is for the next person to do their job.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l5_17, v_course_id,
'Why does a cleaner file matter?',
'multiple_choice',
'[{"label":"It guarantees approval","is_correct":false},{"label":"It eliminates underwriting","is_correct":false},{"label":"It improves preparation for downstream workflow and makes the next person''s job easier","is_correct":true},{"label":"It guarantees funding","is_correct":false}]',
'A well-prepared file makes processing faster and reduces downstream issues. It doesn''t guarantee any specific outcome.',
1);

-- 🎬 HEYGEN VIDEO: "Borrower Experience" — Lesson 5.18
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_18, v_course_id, v_mod5, 'Borrower Experience', 'The borrower doesn''t see departments — they see HCMG. Every interaction contributes to the experience.', 'video', 96, 18, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.18\n'
'  Title: Borrower Experience\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'The borrower doesn''t see every department.\n\n'
'They see HCMG.\n\n'
'That''s why teamwork matters.\n\n'
'When communication breaks down internally, the borrower feels it.\n\n'
'When the team communicates well, the borrower feels that too.\n\n'
'Every interaction contributes to the experience.\n\n'
'Make it count.');

-- Lesson 5.19 — Success OS Scenarios
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_19, v_course_id, v_mod5, 'HCMG Success OS Scenarios', 'Ten scenario questions on lead response, CRM notes, follow-up, workflow sequencing, file preparation, and communication.', 'knowledge_check', 97, 19, true, 'quiz_pass', 80, 900, '15 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l5_19, v_course_id, 'A new lead comes in. According to HCMG standards, when should first contact occur?', 'multiple_choice',
'[{"label":"Within 24 hours","is_correct":false},{"label":"Within five minutes","is_correct":true},{"label":"By end of business","is_correct":false},{"label":"Within one hour","is_correct":false}]',
'HCMG''s lead standard is contact within five minutes.', 1),

(v_l5_19, v_course_id, 'A loan officer has spoken with 12 borrowers this week but the CRM notes say "called" on each. What''s the problem?', 'multiple_choice',
'[{"label":"The CRM doesn''t need detail","is_correct":false},{"label":"The notes provide no useful context for the borrower or the team","is_correct":true},{"label":"Notes are optional","is_correct":false},{"label":"That''s acceptable documentation","is_correct":false}]',
'CRM notes must capture what was learned, the borrower''s situation, and the next action — not just that contact occurred.', 2),

(v_l5_19, v_course_id, 'After the Underwriting stage, what is the next step in the HCMG workflow?', 'multiple_choice',
'[{"label":"Set Up","is_correct":false},{"label":"Conditional Approval","is_correct":true},{"label":"Application","is_correct":false},{"label":"Lead","is_correct":false}]',
'After Underwriting: Conditional Approval → Clear to Close → Closing → Funding → Post-Close Follow-Up.', 3),

(v_l5_19, v_course_id, 'A loan officer submits a file with missing income documentation. What principle did they violate?', 'multiple_choice',
'[{"label":"No principle — that''s the processor''s job","is_correct":false},{"label":"The cleaner file principle — preparation is part of production","is_correct":true},{"label":"Disclosure standards","is_correct":false},{"label":"CRM standards","is_correct":false}]',
'Reviewing the file before submission is the loan officer''s responsibility. Missing documentation creates downstream delays.', 4),

(v_l5_19, v_course_id, 'A borrower stopped responding after the initial call. How many daily follow-up attempts does HCMG expect before moving on?', 'multiple_choice',
'[{"label":"1–2","is_correct":false},{"label":"10 minimum","is_correct":true},{"label":"5","is_correct":false},{"label":"As many as possible","is_correct":false}]',
'HCMG''s lead standard calls for at least 10 daily follow-up attempts per lead before moving to a lower cadence.', 5),

(v_l5_19, v_course_id, 'A loan officer is so busy closing loans that they stop prospecting. What will eventually happen?', 'multiple_choice',
'[{"label":"Nothing — past closings sustain the pipeline","is_correct":false},{"label":"The pipeline will thin and new opportunities will decline","is_correct":true},{"label":"The referral system compensates automatically","is_correct":false},{"label":"Production stays flat","is_correct":false}]',
'Stopping prospecting when busy creates a future pipeline gap. Prospecting must continue consistently.', 6),

(v_l5_19, v_course_id, 'After the file moves to processing, what is the loan officer''s responsibility?', 'multiple_choice',
'[{"label":"Nothing — it''s entirely the processor''s job now","is_correct":false},{"label":"Continue communicating, following up, and helping resolve issues","is_correct":true},{"label":"Move to the next lead exclusively","is_correct":false},{"label":"Wait for the approval","is_correct":false}]',
'Ownership doesn''t stop when the file moves. The loan officer is responsible for communication and issue resolution throughout the process.', 7),

(v_l5_19, v_course_id, 'Why does the borrower experience feel inconsistent when internal communication breaks down?', 'multiple_choice',
'[{"label":"Borrowers don''t care about internal processes","is_correct":false},{"label":"The borrower sees HCMG — not departments — so internal failures become borrower-facing problems","is_correct":true},{"label":"Processing is unrelated to the borrower experience","is_correct":false},{"label":"It only affects closing speed","is_correct":false}]',
'The borrower doesn''t see departments. They see HCMG. Internal communication failures become external experience failures.', 8),

(v_l5_19, v_course_id, 'What is the difference between a goal and a system?', 'multiple_choice',
'[{"label":"They are the same","is_correct":false},{"label":"A goal is where you''re going; a system is what you do repeatedly to get there","is_correct":true},{"label":"Goals are more important","is_correct":false},{"label":"Systems are optional for experienced employees","is_correct":false}]',
'Goals set direction. Systems create the repeatable behaviors that actually get you there.', 9),

(v_l5_19, v_course_id, 'A team member opens a CRM lead and the note reads: "Called. Will try again." What is most useful to add?', 'multiple_choice',
'[{"label":"Nothing — the note is sufficient","is_correct":false},{"label":"What was learned, the borrower''s timeline and concerns, and the scheduled next action","is_correct":true},{"label":"The borrower''s full credit profile","is_correct":false},{"label":"A rating of the call quality","is_correct":false}]',
'Useful CRM notes capture context — not just activity. Another team member should be able to pick up exactly where the last conversation left off.', 10);

-- 🎬 HEYGEN VIDEO: "Module 5 Review" — Lesson 5.20
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_20, v_course_id, v_mod5, 'Module 5 Review: HCMG Success OS', 'Key takeaways on systems, lead management, CRM, workflow, and file preparation.', 'video', 98, 20, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 5.20\n'
'  Title: Module 5 Review\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Systems create consistency.\n\n'
'Contact.\n\n'
'Document.\n\n'
'Follow up.\n\n'
'Advance.\n\n'
'No lead left behind.\n\n'
'Understand the workflow.\n\n'
'Prepare the file.\n\n'
'Communicate with the team.\n\n'
'Stay accountable.\n\n'
'That''s the HCMG Success OS.');

-- Module 5 Quiz
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5_q, v_course_id, v_mod5, 'Module 5 Quiz: HCMG Success OS', 'Ten questions on lead management, CRM, workflow, file preparation, and systems. Passing score: 80%.', 'knowledge_check', 99, 21, true, 'quiz_pass', 80, 600, '10 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l5_q, v_course_id, 'What distinguishes an elite loan officer from a good one, according to the Playbook?', 'multiple_choice',
'[{"label":"More talent","is_correct":false},{"label":"A system — repeatable behaviors that consistently create results","is_correct":true},{"label":"Better leads","is_correct":false},{"label":"Harder work on certain days","is_correct":false}]', 'Great LOs have goals. Elite LOs have systems — repeatable behavior that runs every day.', 1),
(v_l5_q, v_course_id, 'HCMG expects new leads to be contacted within:', 'multiple_choice',
'[{"label":"One hour","is_correct":false},{"label":"Five minutes","is_correct":true},{"label":"Same business day","is_correct":false},{"label":"24 hours","is_correct":false}]', 'Five-minute contact is the HCMG standard for new lead response.', 2),
(v_l5_q, v_course_id, 'What is the CRM standard at HCMG?', 'multiple_choice',
'[{"label":"Optional for experienced employees","is_correct":false},{"label":"Updated to 100% with useful context and next actions","is_correct":true},{"label":"Updated at closing only","is_correct":false},{"label":"Updated weekly","is_correct":false}]', 'CRM documentation must be complete, useful, and current — so any team member can continue the conversation.', 3),
(v_l5_q, v_course_id, 'What happens after Clear to Close in the HCMG workflow?', 'multiple_choice',
'[{"label":"Processing","is_correct":false},{"label":"Underwriting","is_correct":false},{"label":"Closing → Funding → Post-Close Follow-Up","is_correct":true},{"label":"Application","is_correct":false}]', 'After Clear to Close: Closing → Funding → Post-Close Follow-Up.', 4),
(v_l5_q, v_course_id, 'Why should the loan officer still be engaged during processing and underwriting?', 'multiple_choice',
'[{"label":"They should not — it is entirely the processor''s job","is_correct":false},{"label":"Because they still have responsibility for communication, follow-up, and issue resolution","is_correct":true},{"label":"To monitor the processor","is_correct":false},{"label":"To speed up the process","is_correct":false}]', 'Ownership continues through the entire workflow. The loan officer remains accountable for communication.', 5),
(v_l5_q, v_course_id, 'What does the cleaner file principle state?', 'multiple_choice',
'[{"label":"Files should never be submitted with conditions","is_correct":false},{"label":"A well-prepared file enables the downstream process to move more efficiently","is_correct":true},{"label":"The processor is responsible for file quality","is_correct":false},{"label":"Files only need to be clean at closing","is_correct":false}]', 'Preparation is part of production. A better-prepared file creates a better experience for everyone downstream.', 6),
(v_l5_q, v_course_id, 'What does "No lead left behind" mean?', 'multiple_choice',
'[{"label":"Every lead closes","is_correct":false},{"label":"Every lead receives consistent action, follow-up, and documentation","is_correct":true},{"label":"Leads are never archived","is_correct":false},{"label":"Leads are always assigned to the same person","is_correct":false}]', 'No lead left behind is a commitment to consistent action on every opportunity — not passivity or selective follow-up.', 7),
(v_l5_q, v_course_id, 'The borrower''s experience of HCMG is shaped by:', 'multiple_choice',
'[{"label":"Only the loan officer","is_correct":false},{"label":"Every team member''s communication and preparation throughout the workflow","is_correct":true},{"label":"Only the closing department","is_correct":false},{"label":"The rate alone","is_correct":false}]', 'Borrowers see HCMG — not departments. Every team member contributes to the experience.', 8),
(v_l5_q, v_course_id, 'How should a loan officer start each morning?', 'multiple_choice',
'[{"label":"By checking email and responding to whatever appears first","is_correct":false},{"label":"By reviewing goals, priorities, and protecting their most important activity","is_correct":true},{"label":"By waiting for leads to come in","is_correct":false},{"label":"By attending meetings","is_correct":false}]', 'An intentional start protects priority activity. Reacting to what appears first is not a system.', 9),
(v_l5_q, v_course_id, 'Relentless follow-up means:', 'multiple_choice',
'[{"label":"Calling every 10 minutes","is_correct":false},{"label":"Consistent, useful, professional follow-up until a clear answer is received","is_correct":true},{"label":"Following up only once","is_correct":false},{"label":"Leaving a message and waiting","is_correct":false}]', 'Relentless means consistent — not annoying. Bring value in every touch.', 10);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 6: HARRY'S CHAMPIONSHIP PLAYBOOK
-- ═══════════════════════════════════════════════════════════════════════════

-- 🎬 HEYGEN VIDEO: "Champions Prepare Differently" — Lesson 6.1
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_1, v_course_id, v_mod6, 'Champions Prepare Differently', 'Champions prepare before the opportunity arrives. Talent helps, but preparation creates consistency.', 'video', 100, 1, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.1\n'
'  Title: Champions Prepare Differently\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Champions don''t wait until game day to prepare.\n\n'
'They prepare before the opportunity arrives.\n\n'
'They know their goals.\n\n'
'They know their numbers.\n\n'
'They protect their time.\n\n'
'They study.\n\n'
'They practice.\n\n'
'They ask for feedback.\n\n'
'And they stay coachable.\n\n'
'Talent helps.\n\n'
'But preparation creates consistency.');

-- 🎬 HEYGEN VIDEO: "Top Producer Habits" — Lesson 6.2
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_2, v_course_id, v_mod6, 'Top Producer Habits', 'The seven habits that high performers build — none of them complicated, all of them consistent.', 'video', 101, 2, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.2\n'
'  Title: Top Producer Habits\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'The Playbook identifies several habits that high performers build.\n\n'
'Review goals.\n\n'
'Prospect daily.\n\n'
'Follow up relentlessly.\n\n'
'Ask for referrals.\n\n'
'Protect prospecting time.\n\n'
'Study the craft.\n\n'
'Stay coachable.\n\n'
'None of these are complicated.\n\n'
'The difference is consistency.');

-- 🎬 HEYGEN VIDEO: "Prospect Every Day" — Lesson 6.3
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_3, v_course_id, v_mod6, 'Prospect Every Day', 'Prospecting isn''t something you do only when the pipeline is empty — it''s what keeps the pipeline healthy.', 'video', 102, 3, true, 'watch_pct', 80, 120, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.3\n'
'  Title: Prospect Every Day\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Prospecting isn''t something you do only when the pipeline is empty.\n\n'
'You prospect because you want the pipeline to stay healthy.\n\n'
'Protect the time.\n\n'
'Do the work.\n\n'
'Measure the activity.\n\n'
'Then do it again tomorrow.');

-- 🎬 HEYGEN VIDEO: "Follow Up Relentlessly" — Lesson 6.4
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_4, v_course_id, v_mod6, 'Follow Up Relentlessly', 'Follow-up is staying engaged — useful, professional, consistent. Don''t disappear.', 'video', 103, 4, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.4\n'
'  Title: Follow Up Relentlessly\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Follow-up is not chasing people.\n\n'
'It''s staying engaged.\n\n'
'Be useful.\n\n'
'Be professional.\n\n'
'Be consistent.\n\n'
'If the borrower needs time, respect that.\n\n'
'But don''t disappear.\n\n'
'If there''s a next step, make sure you follow through.');

-- 🎬 HEYGEN VIDEO: "Ask for Referrals" — Lesson 6.5
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_5, v_course_id, v_mod6, 'Ask for Referrals', 'Referrals don''t happen by accident — you have to ask. The request should feel natural and professional.', 'video', 104, 5, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.5\n'
'  Title: Ask for Referrals\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'If you''ve provided value, ask for the opportunity to help somebody else.\n\n'
'Referrals don''t happen by accident.\n\n'
'You have to ask.\n\n'
'The request should feel natural and professional.\n\n'
'"Who do you know who might benefit from the same kind of guidance?"\n\n'
'That''s how relationships grow.');

-- 🎬 HEYGEN VIDEO: "Protect Prospecting Time" — Lesson 6.6
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_6, v_course_id, v_mod6, 'Protect Prospecting Time', 'Your calendar shows your priorities. If prospecting matters, protect the time.', 'video', 105, 6, true, 'watch_pct', 80, 120, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.6\n'
'  Title: Protect Prospecting Time\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Your calendar shows your priorities.\n\n'
'If prospecting matters, protect the time.\n\n'
'Don''t allow every interruption to consume the hours that create future business.\n\n'
'Every hour needs a purpose.');

-- 🎬 HEYGEN VIDEO: "Study the Craft" — Lesson 6.7
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_7, v_course_id, v_mod6, 'Study the Craft', 'The mortgage business changes — the best professionals never decide they''re finished learning.', 'video', 106, 7, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.7\n'
'  Title: Study the Craft\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'The mortgage business changes.\n\n'
'Borrower needs change.\n\n'
'Products change.\n\n'
'Processes change.\n\n'
'Your skill has to keep developing.\n\n'
'Study.\n\n'
'Ask questions.\n\n'
'Learn from people around you.\n\n'
'Review your mistakes.\n\n'
'Stay curious.\n\n'
'The best professionals never decide they''re finished learning.');

-- 🎬 HEYGEN VIDEO: "Stay Coachable" — Lesson 6.8
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_8, v_course_id, v_mod6, 'Stay Coachable', 'Being coachable means being willing to listen, consider feedback, and improve — protect growth over ego.', 'video', 107, 8, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.8\n'
'  Title: Stay Coachable\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Being coachable doesn''t mean you have to agree with everything.\n\n'
'It means you''re willing to listen.\n\n'
'You''re willing to consider feedback.\n\n'
'You''re willing to test a better approach.\n\n'
'You''re willing to improve.\n\n'
'Protect your ego less.\n\n'
'Protect your growth more.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l6_8, v_course_id,
'What does it mean to be coachable?',
'multiple_choice',
'[{"label":"Agreeing with everything your manager says","is_correct":false},{"label":"Being willing to listen, consider feedback, and improve","is_correct":true},{"label":"Admitting you know nothing","is_correct":false},{"label":"Never questioning feedback","is_correct":false}]',
'Coachability is about openness to improvement — not blind agreement. The goal is growth.',
1);

-- 🎬 HEYGEN VIDEO: "The Activity Model" — Lesson 6.9
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_9, v_course_id, v_mod6, 'The Activity Model', 'The HCMG activity model — not a guarantee, but a framework for thinking about activity, conversion, and production.', 'video', 108, 9, true, 'watch_pct', 80, 240, '4 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.9\n'
'  Title: The Activity Model\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: 100+ CONVERSATIONS → 40 APPLICATIONS → 20 PRE-APPROVALS\n'
'              → 10 CLOSINGS → $1M+ PRODUCTION\n'
'  Label: ACTIVITY MODEL — NOT A GUARANTEE\n'
'═══════════════════════════════════════════════════════\n\n'
'Let''s talk activity.\n\n'
'The Playbook uses an activity model:\n\n'
'One hundred plus conversations.\n\n'
'Forty applications.\n\n'
'Twenty pre-approvals.\n\n'
'Ten closings.\n\n'
'One million dollars or more in production.\n\n'
'Understand what that is.\n\n'
'It''s an activity model.\n\n'
'It is not a promise.\n\n'
'It is not a guarantee.\n\n'
'Actual results depend on many factors.\n\n'
'The lesson is simple:\n\n'
'Results come from activity.\n\n'
'Activity needs to be measured.\n\n'
'If you want to improve your results, start by understanding your activity.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l6_9, v_course_id,
'What is the purpose of the HCMG activity model?',
'multiple_choice',
'[{"label":"To guarantee $1M+ production for all employees","is_correct":false},{"label":"To provide a framework for understanding the relationship between activity, conversion, and production","is_correct":true},{"label":"To replace individual performance tracking","is_correct":false},{"label":"To predict exactly what each employee will produce","is_correct":false}]',
'The activity model is a framework — not a promise. It shows the relationship between activity volume and production outcomes.',
1);

-- Activity model lessons 6.10–6.14 (written/video)
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES
(v_l6_10, v_course_id, v_mod6, '100+ Conversations', 'The activity model begins with conversations — the purpose is to demonstrate that production begins with activity.', 'text', 109, 10, true, 'watch_pct', 80, 120, '2 min',
E'## 100+ Conversations\n\n'
'The model begins with conversations.\n\n'
'The purpose is not to treat a number as a guaranteed outcome.\n\n'
'The purpose is to demonstrate that meaningful production begins with meaningful activity.\n\n'
'**Activity Model — Not a Guarantee.**'),

(v_l6_11, v_course_id, v_mod6, '40 Applications', 'The model connects activity to applications — measure volume and conversion, not just effort.', 'video', 110, 11, true, 'watch_pct', 80, 120, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.11\n'
'  Title: 40 Applications\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: Activity model with "40 Applications" highlighted\n'
'  Label: ACTIVITY MODEL — NOT A GUARANTEE\n'
'═══════════════════════════════════════════════════════\n\n'
'The next step in the activity model is applications.\n\n'
'The model connects activity to opportunities.\n\n'
'Again, this is not a guarantee.\n\n'
'It''s a framework for thinking about volume and conversion.\n\n'
'Measure what you''re doing.\n\n'
'Understand where opportunities are being created.\n\n'
'Then improve the process.'),

(v_l6_12, v_course_id, v_mod6, '20 Pre-Approvals', 'Pre-approvals represent another stage — understand the relationship between activity and progression.', 'video', 111, 12, true, 'watch_pct', 80, 120, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.12\n'
'  Title: 20 Pre-Approvals\n'
'  Speaker: Harry (avatar)\n'
'  Label: ACTIVITY MODEL — NOT A GUARANTEE\n'
'═══════════════════════════════════════════════════════\n\n'
'Pre-approvals represent another stage in the model.\n\n'
'The point is to understand the relationship between activity and progression.\n\n'
'Don''t just count activity.\n\n'
'Understand what happens as opportunities move forward.'),

(v_l6_13, v_course_id, v_mod6, '10 Closings', 'The model connects activity to closings — use your actual numbers to identify where to improve.', 'video', 112, 13, true, 'watch_pct', 80, 120, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.13\n'
'  Title: 10 Closings\n'
'  Speaker: Harry (avatar)\n'
'  Label: ACTIVITY MODEL — NOT A GUARANTEE\n'
'═══════════════════════════════════════════════════════\n\n'
'The model eventually connects activity to closings.\n\n'
'But remember:\n\n'
'The model isn''t a promise.\n\n'
'It is a way to think about the relationship between activity, opportunity, conversion, and production.\n\n'
'Use your actual numbers.\n\n'
'Measure your actual performance.\n\n'
'Then identify where you can improve.'),

(v_l6_14, v_course_id, v_mod6, '$1M+ Production', 'The model''s conclusion — not a guarantee, but a demonstration that consistent activity creates production.', 'video', 113, 14, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.14\n'
'  Title: $1M+ Production\n'
'  Speaker: Harry (avatar)\n'
'  Label: ACTIVITY MODEL — NOT A GUARANTEE\n'
'═══════════════════════════════════════════════════════\n\n'
'The model concludes with one million dollars or more in production.\n\n'
'Again:\n\n'
'Not a guarantee.\n\n'
'Not a promise.\n\n'
'Not an automatic outcome.\n\n'
'It''s the production level represented in the Playbook''s activity model.\n\n'
'The lesson is not: "Do these numbers and you''re guaranteed this result."\n\n'
'The lesson is: "Measure activity, understand conversion, and build repeatable behaviors."');

-- 🎬 HEYGEN VIDEO: "Every Hour Needs a Purpose" — Lesson 6.15
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_15, v_course_id, v_mod6, 'Every Hour Needs a Purpose (Championship)', 'The HCMG time-blocking structure from the Championship Playbook perspective.', 'video', 114, 15, true, 'watch_pct', 80, 200, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.15\n'
'  Title: Every Hour Needs a Purpose\n'
'  Speaker: Harry (avatar)\n'
'  On-screen: Time-blocking schedule displayed\n'
'═══════════════════════════════════════════════════════\n\n'
'Here''s the time-blocking example from the Playbook.\n\n'
'Eight to nine:\n\n'
'Power Hour Prospecting.\n\n'
'Nine to eleven:\n\n'
'Lead Follow-Up.\n\n'
'Eleven to twelve:\n\n'
'Applications.\n\n'
'Twelve to one:\n\n'
'Lunch.\n\n'
'One to three:\n\n'
'Borrower Consultations.\n\n'
'Three to four:\n\n'
'Referral Partner Outreach.\n\n'
'Four to five:\n\n'
'Pipeline Management.\n\n'
'Your schedule may change.\n\n'
'Your responsibilities may change.\n\n'
'But the principle stays the same.\n\n'
'Every hour needs a purpose.');

-- 🎬 HEYGEN VIDEO: "Goal Tracking" — Lesson 6.16
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_16, v_course_id, v_mod6, 'Goal Tracking', 'A goal isn''t finished when you write it down — track it, review it, measure progress, adjust, and keep going.', 'video', 115, 16, true, 'watch_pct', 80, 150, '2 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.16\n'
'  Title: Goal Tracking\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'A goal isn''t finished when you write it down.\n\n'
'Track it.\n\n'
'Review it.\n\n'
'Measure progress.\n\n'
'Adjust your activity.\n\n'
'And keep going.\n\n'
'You should know where you are.\n\n'
'You should know where you''re going.\n\n'
'And you should know what actions are required to close the gap.');

-- Lesson 6.17 — Personal Championship Plan (short answer/reflection)
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_17, v_course_id, v_mod6, 'Personal Championship Plan', 'Ten written reflection questions to build your personal Championship Plan — your commitment to applying the Playbook.', 'text', 116, 17, true, 'manual', 80, 600, '10 min',
E'## Personal Championship Plan\n\n'
'Answer each of the following questions honestly.\n\n'
'This is your personal commitment to executing the Playbook.\n\n'
'1. What is your most important professional goal?\n'
'2. What activity will support that goal?\n'
'3. What skill do you need to improve?\n'
'4. What behavior do you need to become more consistent with?\n'
'5. What will you measure?\n'
'6. What is one habit you will start?\n'
'7. What is one habit you will stop?\n'
'8. What is one habit you will improve?\n'
'9. Who will hold you accountable?\n'
'10. What will you do differently tomorrow?\n\n'
'Write what you''re actually willing to change — not what sounds good.\n\n'
'The value of this plan is in its execution.');

-- Lesson 6.18 — Championship Scenarios
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_18, v_course_id, v_mod6, 'Championship Scenarios', 'Ten scenario questions on prospecting, follow-up, referrals, time blocking, coachability, activity, goals, accountability, consistency, and preparation.', 'knowledge_check', 117, 18, true, 'quiz_pass', 80, 900, '15 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l6_18, v_course_id, 'A loan officer only prospects when the pipeline is empty. What is the problem?', 'multiple_choice',
'[{"label":"There is no problem","is_correct":false},{"label":"This creates boom-and-bust cycles — prospecting must be consistent to maintain a healthy pipeline","is_correct":true},{"label":"Prospecting is only needed for new employees","is_correct":false},{"label":"Empty pipeline is normal","is_correct":false}]',
'Prospecting when the pipeline is empty means there''s always a delay. Consistent daily prospecting keeps the pipeline healthy.', 1),

(v_l6_18, v_course_id, 'A borrower hasn''t returned calls in two weeks. What should the loan officer do?', 'multiple_choice',
'[{"label":"Remove them from the pipeline","is_correct":false},{"label":"Continue consistent, professional follow-up — silence doesn''t mean no","is_correct":true},{"label":"Assume they chose another lender","is_correct":false},{"label":"Wait for them to call back","is_correct":false}]',
'Relentless follow-up means consistent engagement. Silence is not a final answer.', 2),

(v_l6_18, v_course_id, 'After helping a borrower close, when is the right time to ask for a referral?', 'multiple_choice',
'[{"label":"You should never ask","is_correct":false},{"label":"When you have provided value and the relationship supports it","is_correct":true},{"label":"Only after 6 months","is_correct":false},{"label":"Only via email","is_correct":false}]',
'Referrals are earned through value delivered. Ask professionally at the right moment.', 3),

(v_l6_18, v_course_id, 'A loan officer consistently reschedules their morning prospecting block for other meetings. What will happen over time?', 'multiple_choice',
'[{"label":"Nothing — other activities compensate","is_correct":false},{"label":"The pipeline will gradually thin as prospecting is consistently deprioritized","is_correct":true},{"label":"It improves relationships","is_correct":false},{"label":"It is an acceptable trade-off","is_correct":false}]',
'Prospecting that is consistently rescheduled is prospecting that doesn''t happen. The pipeline will reflect that over time.', 4),

(v_l6_18, v_course_id, 'A manager gives feedback that a loan officer''s discovery questions are weak. The coachable response is:', 'multiple_choice',
'[{"label":"\"I''ve been doing this for years — I''m fine.\"","is_correct":false},{"label":"\"Thank you — what specific questions would you recommend?\"","is_correct":true},{"label":"\"The borrowers are just difficult.\"","is_correct":false},{"label":"\"I''ll think about it.\"","is_correct":false}]',
'Coachability is being willing to listen, consider feedback, and improve. Openness to specific guidance is the right response.', 5),

(v_l6_18, v_course_id, 'The activity model shows 100+ conversations leading to 10 closings. This means:', 'multiple_choice',
'[{"label":"Every 10 conversations will produce 1 closing","is_correct":false},{"label":"That production begins with activity volume — the specific numbers are a framework, not a guarantee","is_correct":true},{"label":"100 conversations is the minimum required each month","is_correct":false},{"label":"Results are guaranteed at this activity level","is_correct":false}]',
'The activity model is a framework for thinking about activity and conversion — not a guaranteed formula.', 6),

(v_l6_18, v_course_id, 'A loan officer has a goal but hasn''t reviewed it in 3 weeks. What does the Playbook recommend?', 'multiple_choice',
'[{"label":"That is fine — annual review is enough","is_correct":false},{"label":"Track, review, and measure progress on goals consistently","is_correct":true},{"label":"Rewrite the goal","is_correct":false},{"label":"Goals don''t require review","is_correct":false}]',
'Goal tracking requires regular review, progress measurement, and adjustment — not just writing it down once.', 7),

(v_l6_18, v_course_id, 'Which best describes the top producer''s relationship with motivation?', 'multiple_choice',
'[{"label":"They are always motivated","is_correct":false},{"label":"They don''t depend on motivation — they depend on standards","is_correct":true},{"label":"They get motivated by recognition","is_correct":false},{"label":"Motivation drives everything they do","is_correct":false}]',
'Champions depend on standards, not motivation. Habits run regardless of how they feel on a given day.', 8),

(v_l6_18, v_course_id, 'A loan officer is too busy to study or improve their craft. Over time, this will:', 'multiple_choice',
'[{"label":"Have no effect","is_correct":false},{"label":"Create skill stagnation as the market and client needs evolve","is_correct":true},{"label":"Make them more efficient","is_correct":false},{"label":"Be compensated by experience alone","is_correct":false}]',
'The mortgage business changes. Skills must keep developing. Stopping learning is falling behind.', 9),

(v_l6_18, v_course_id, 'A championship-level loan officer''s calendar would show:', 'multiple_choice',
'[{"label":"Mostly reactive meetings and email time","is_correct":false},{"label":"Protected blocks for prospecting, follow-up, consultations, referrals, and pipeline management","is_correct":true},{"label":"No scheduled time for prospecting","is_correct":false},{"label":"One large block of unstructured work time","is_correct":false}]',
'A championship calendar is intentional — every major activity is protected and given a dedicated block.', 10);

-- 🎬 HEYGEN VIDEO: "Module 6 Review" — Lesson 6.19
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_19, v_course_id, v_mod6, 'Module 6 Review: Harry''s Championship Playbook', 'Key takeaways from the Championship Playbook before the final exam.', 'video', 118, 19, true, 'watch_pct', 80, 180, '3 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Lesson 6.19\n'
'  Title: Module 6 Review: Harry''s Championship Playbook\n'
'  Speaker: Harry (avatar)\n'
'═══════════════════════════════════════════════════════\n\n'
'Champions prepare differently.\n\n'
'They prospect.\n\n'
'They follow up.\n\n'
'They ask for referrals.\n\n'
'They protect their time.\n\n'
'They study.\n\n'
'They stay coachable.\n\n'
'They measure activity.\n\n'
'They track goals.\n\n'
'And they understand that consistency beats occasional effort.\n\n'
'That''s the Championship Playbook.');

-- Module 6 Quiz
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6_q, v_course_id, v_mod6, 'Module 6 Quiz: Harry''s Championship Playbook', 'Ten questions on top producer habits, the activity model, coachability, time blocking, and the Championship Plan. Passing score: 80%.', 'knowledge_check', 119, 20, true, 'quiz_pass', 80, 600, '10 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l6_q, v_course_id, 'What is the key differentiator between great and elite loan officers?', 'multiple_choice',
'[{"label":"Talent","is_correct":false},{"label":"A system — repeatable behaviors executed consistently","is_correct":true},{"label":"Better leads","is_correct":false},{"label":"More experience","is_correct":false}]', 'Great LOs have goals. Elite LOs have systems.', 1),
(v_l6_q, v_course_id, 'Which of the following is one of the top producer habits?', 'multiple_choice',
'[{"label":"Prospect only when needed","is_correct":false},{"label":"Study the craft","is_correct":true},{"label":"Avoid coaching","is_correct":false},{"label":"Focus on activities you enjoy","is_correct":false}]', 'Study the craft is one of the seven top producer habits.', 2),
(v_l6_q, v_course_id, 'What does the HCMG activity model represent?', 'multiple_choice',
'[{"label":"A production guarantee","is_correct":false},{"label":"A framework for thinking about activity, conversion, and production — not a promise","is_correct":true},{"label":"The minimum required production","is_correct":false},{"label":"A compliance standard","is_correct":false}]', 'The activity model is a framework — not a guarantee. Actual results depend on many factors.', 3),
(v_l6_q, v_course_id, 'What does "Stay Coachable" require?', 'multiple_choice',
'[{"label":"Agreeing with all feedback","is_correct":false},{"label":"Being willing to listen, consider feedback, and improve","is_correct":true},{"label":"Never having opinions","is_correct":false},{"label":"Implementing every suggestion immediately","is_correct":false}]', 'Coachability is openness to improvement — not blind agreement.', 4),
(v_l6_q, v_course_id, 'A championship calendar protects time for which activities?', 'multiple_choice',
'[{"label":"Email and administrative work only","is_correct":false},{"label":"Prospecting, follow-up, consultations, referral outreach, and pipeline management","is_correct":true},{"label":"Sales training only","is_correct":false},{"label":"Whatever the most urgent task is","is_correct":false}]', 'A championship calendar is intentional — major activities are protected and scheduled.', 5),
(v_l6_q, v_course_id, 'Champions don''t depend on motivation. They depend on:', 'multiple_choice',
'[{"label":"Perfect days","is_correct":false},{"label":"Standards and consistent habits","is_correct":true},{"label":"Luck","is_correct":false},{"label":"Recognition","is_correct":false}]', 'Standards run regardless of how you feel. Habits create consistency.', 6),
(v_l6_q, v_course_id, 'Why must prospecting continue even when the pipeline is full?', 'multiple_choice',
'[{"label":"It doesn''t need to","is_correct":false},{"label":"Stopping prospecting creates a future gap when current deals close","is_correct":true},{"label":"It is a compliance requirement","is_correct":false},{"label":"Management requires it","is_correct":false}]', 'Today''s prospecting is tomorrow''s pipeline. Stopping creates future gaps.', 7),
(v_l6_q, v_course_id, 'What does the Personal Championship Plan ask the learner to commit to?', 'multiple_choice',
'[{"label":"Production numbers","is_correct":false},{"label":"Specific behaviors they will start, stop, and improve","is_correct":true},{"label":"Memorizing the Playbook","is_correct":false},{"label":"Following management instructions","is_correct":false}]', 'The Championship Plan is a personal behavioral commitment — what will you actually change tomorrow?', 8),
(v_l6_q, v_course_id, 'Goal tracking means:', 'multiple_choice',
'[{"label":"Writing down a goal once","is_correct":false},{"label":"Regularly reviewing progress, adjusting activity, and maintaining focus on the goal","is_correct":true},{"label":"Telling others about your goals","is_correct":false},{"label":"Tracking only monthly","is_correct":false}]', 'Goals require ongoing attention — review, measure, adjust, and keep going.', 9),
(v_l6_q, v_course_id, 'What is the best definition of being "relentless" in follow-up?', 'multiple_choice',
'[{"label":"Calling every 10 minutes","is_correct":false},{"label":"Consistent, professional, value-driven contact until a clear answer is received","is_correct":true},{"label":"Never stopping until a yes","is_correct":false},{"label":"Sending emails only","is_correct":false}]', 'Relentless means consistent and useful — not annoying. Every touch should bring value.', 10);

-- ═══════════════════════════════════════════════════════════════════════════
-- FINAL: HARRY'S PLAYBOOK CERTIFICATION
-- ═══════════════════════════════════════════════════════════════════════════

-- 🎬 HEYGEN VIDEO: "You've Made It to the End" — Final Lesson
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_lf_1, v_course_id, v_modf, 'You''ve Made It to the End', 'Harry''s final message — the course is finished. Now comes the part that matters: execution.', 'video', 120, 1, true, 'watch_pct', 80, 300, '5 min',
E'═══════════════════════════════════════════════════════\n'
'  HEYGEN VIDEO SCRIPT — Final Lesson\n'
'  Title: You''ve Made It to the End\n'
'  Speaker: Harry (avatar)\n'
'  On-screen at end: TRAIN. LEARN. CLOSE. WIN.\n'
'                    GO EXECUTE.\n'
'═══════════════════════════════════════════════════════\n\n'
'You''ve made it to the end of Harry''s Playbook.\n\n'
'But finishing the course isn''t the accomplishment.\n\n'
'Applying it is.\n\n'
'You learned the framework.\n\n'
'You learned how to handle objections.\n\n'
'You learned how to create certainty.\n\n'
'You learned how to ask for the business.\n\n'
'You learned the difference between pressure and urgency.\n\n'
'You learned accountability.\n\n'
'You learned the importance of activity.\n\n'
'You learned the HCMG Success OS.\n\n'
'You learned the habits of high performers.\n\n'
'Now comes the part that matters.\n\n'
'Execution.\n\n'
'When the borrower says: "I want to think about it."\n\n'
'Listen. Clarify. Validate. Discover. Bridge. Ask. Close.\n\n'
'When you feel uncomfortable asking for the business:\n\n'
'Be decently bold.\n\n'
'When you need help:\n\n'
'Ask for it.\n\n'
'When something doesn''t go your way:\n\n'
'Ask what you could have done differently.\n\n'
'When the pipeline gets quiet:\n\n'
'Prospect.\n\n'
'When you have an opportunity:\n\n'
'Follow up.\n\n'
'When you have a goal:\n\n'
'Measure it.\n\n'
'When you''re busy:\n\n'
'Protect your priorities.\n\n'
'And when you finish one day:\n\n'
'Do it again tomorrow.\n\n'
'Train.\n\n'
'Learn.\n\n'
'Close.\n\n'
'Win.\n\n'
'Now go execute.');

-- ── Final Exam (25 questions, linked to course-level assessment) ────────────
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_lf_exam, v_course_id, v_modf, 'Harry''s Playbook Certification Exam', '25 questions covering all modules. Passing score: 80%. This exam must be passed to receive your certificate.', 'knowledge_check', 121, 2, true, 'quiz_pass', 80, 1800, '30 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_lf_exam, v_course_id, 'What are the four components of the HCMG Success Formula?', 'multiple_choice',
'[{"label":"Sales, Marketing, Technology, Recruiting","is_correct":false},{"label":"Mindset, Activity, Skill, Accountability","is_correct":true},{"label":"Goals, Money, Leads, Closing","is_correct":false},{"label":"Motivation, Talent, Luck, Timing","is_correct":false}]',
'The HCMG Success Formula is Mindset + Activity + Skill + Accountability.', 1),

(v_lf_exam, v_course_id, 'What is the purpose of HCMG values?', 'multiple_choice',
'[{"label":"Marketing","is_correct":false},{"label":"Employee evaluation only","is_correct":false},{"label":"Behavioral standards that apply across all roles and situations","is_correct":true},{"label":"Customer advertising","is_correct":false}]',
'HCMG values define expected behaviors — not marketing slogans.', 2),

(v_lf_exam, v_course_id, 'What question reflects the accountability mindset?', 'multiple_choice',
'[{"label":"Who caused this?","is_correct":false},{"label":"Why did this happen to me?","is_correct":false},{"label":"What could I have done differently?","is_correct":true},{"label":"Who should fix it?","is_correct":false}]',
'Accountability asks what was within your control and what you can improve.', 3),

(v_lf_exam, v_course_id, 'Why is consistency important?', 'multiple_choice',
'[{"label":"It eliminates all risk","is_correct":false},{"label":"It creates repeatable behavior that builds sustainable performance","is_correct":true},{"label":"It guarantees production","is_correct":false},{"label":"It replaces skill","is_correct":false}]',
'Consistency creates the repeatable standard that builds careers over time.', 4),

(v_lf_exam, v_course_id, 'What is the primary purpose of Harry''s Playbook?', 'multiple_choice',
'[{"label":"Memorizing scripts","is_correct":false},{"label":"Developing a repeatable HCMG standard for performance","is_correct":true},{"label":"Replacing coaching","is_correct":false},{"label":"Guaranteeing production","is_correct":false}]',
'Harry''s Playbook develops a standard — not a collection of scripts.', 5),

(v_lf_exam, v_course_id, 'A borrower says, "I want to think about it." What is the best response?', 'multiple_choice',
'[{"label":"\"There''s nothing to think about.\"","is_correct":false},{"label":"\"Absolutely. What specifically would you like to think through?\"","is_correct":true},{"label":"\"You need to decide today.\"","is_correct":false},{"label":"\"Why are you wasting my time?\"","is_correct":false}]',
'Curiosity replaces pressure. "What specifically?" discovers the real concern.', 6),

(v_lf_exam, v_course_id, 'What is the first step in the HCMG Objection Framework?', 'multiple_choice',
'[{"label":"Bridge","is_correct":false},{"label":"Close","is_correct":false},{"label":"Listen","is_correct":true},{"label":"Ask","is_correct":false}]',
'You must understand the concern before responding. Listen first.', 7),

(v_lf_exam, v_course_id, 'A borrower says, "Your rate is too high." What should the loan officer do first?', 'multiple_choice',
'[{"label":"Argue","is_correct":false},{"label":"Immediately discount","is_correct":false},{"label":"Clarify the comparison: \"Compared with what?\"","is_correct":true},{"label":"End the call","is_correct":false}]',
'You cannot address a rate objection without understanding what the borrower is comparing it to.', 8),

(v_lf_exam, v_course_id, 'What does validation mean in objection handling?', 'multiple_choice',
'[{"label":"Agreeing with everything","is_correct":false},{"label":"Acknowledging the concern without necessarily agreeing with the conclusion","is_correct":true},{"label":"Giving the borrower a concession","is_correct":false},{"label":"Ending the conversation","is_correct":false}]',
'Validation says the concern is worth discussing — not that the borrower is right.', 9),

(v_lf_exam, v_course_id, 'Why shouldn''t an employee invent an answer about credit requirements?', 'multiple_choice',
'[{"label":"It wastes time","is_correct":false},{"label":"It creates unnecessary conversation","is_correct":false},{"label":"Accuracy and integrity are part of the HCMG standard","is_correct":true},{"label":"Borrowers don''t care","is_correct":false}]',
'Integrity requires accuracy. Inventing answers damages trust and creates false expectations.', 10),

(v_lf_exam, v_course_id, '"If you don''t ask, you don''t close" means:', 'multiple_choice',
'[{"label":"Pressure people","is_correct":false},{"label":"You must ask for the next step — the decision won''t make itself","is_correct":true},{"label":"Never explain anything","is_correct":false},{"label":"Close every conversation immediately","is_correct":false}]',
'Avoiding the ask doesn''t create a yes — it creates uncertainty. You must ask.', 11),

(v_lf_exam, v_course_id, 'What does "Decently Bold" mean?', 'multiple_choice',
'[{"label":"Aggressive","is_correct":false},{"label":"Manipulative","is_correct":false},{"label":"Professional, confident, direct, helpful, and solution-focused","is_correct":true},{"label":"Pushy","is_correct":false}]',
'Decently Bold is professional leadership — not manipulation or aggression.', 12),

(v_lf_exam, v_course_id, 'What is the difference between commitment and compliance?', 'multiple_choice',
'[{"label":"They mean the same thing","is_correct":false},{"label":"Commitment reflects informed willingness; compliance is reluctant \"okay, fine\"","is_correct":true},{"label":"Compliance is always better","is_correct":false},{"label":"Commitment means pressure was applied","is_correct":false}]',
'Commitment is what the Playbook targets — informed, willing agreement to move forward.', 13),

(v_lf_exam, v_course_id, 'Which is a discovery question?', 'multiple_choice',
'[{"label":"\"Can I close this today?\"","is_correct":false},{"label":"\"Why now?\"","is_correct":true},{"label":"\"Can you sign?\"","is_correct":false},{"label":"\"Do you trust me?\"","is_correct":false}]',
'"Why now?" is one of the Five Discovery Questions that reveals real motivation.', 14),

(v_lf_exam, v_course_id, 'What does the Playbook teach about pressure?', 'multiple_choice',
'[{"label":"Pressure serves the salesperson — not the client","is_correct":true},{"label":"Pressure serves the client","is_correct":false},{"label":"Pressure is acceptable when needed","is_correct":false},{"label":"Fake urgency is acceptable","is_correct":false}]',
'Pressure is motivated by the salesperson''s production need — not by the borrower''s interests.', 15),

(v_lf_exam, v_course_id, 'What should an employee do when a borrower says they are waiting for rates to drop?', 'multiple_choice',
'[{"label":"Promise rates will fall","is_correct":false},{"label":"Tell them rates will definitely rise","is_correct":false},{"label":"Discover their actual decision criteria and educate accurately","is_correct":true},{"label":"Create a fake deadline","is_correct":false}]',
'Never predict rates. Discover what the borrower is waiting for and educate based on their situation.', 16),

(v_lf_exam, v_course_id, 'Which is ethical urgency?', 'multiple_choice',
'[{"label":"Fake scarcity","is_correct":false},{"label":"Unsupported rate predictions","is_correct":false},{"label":"Explaining a real consequence of waiting based on actual circumstances","is_correct":true},{"label":"Threatening consequences","is_correct":false}]',
'Ethical urgency is grounded in real situations and real consequences — not manufactured pressure.', 17),

(v_lf_exam, v_course_id, 'What is the purpose of the Five Whys?', 'multiple_choice',
'[{"label":"To pressure someone","is_correct":false},{"label":"To discover deeper motivation beneath the surface answer","is_correct":true},{"label":"To end conversations","is_correct":false},{"label":"To replace listening","is_correct":false}]',
'The Five Whys gets past the first answer to find what''s really driving the borrower.', 18),

(v_lf_exam, v_course_id, 'Which question best demonstrates accountability?', 'multiple_choice',
'[{"label":"\"Whose fault is this?\"","is_correct":false},{"label":"\"Why didn''t they do their job?\"","is_correct":false},{"label":"\"What could I have done differently?\"","is_correct":true},{"label":"\"Who should I blame?\"","is_correct":false}]',
'Accountability is ownership — not blame assignment.', 19),

(v_lf_exam, v_course_id, 'What is the purpose of the daily scorecard?', 'multiple_choice',
'[{"label":"Punishment","is_correct":false},{"label":"Visibility into actual activity and performance so you can improve","is_correct":true},{"label":"Replacing coaching","is_correct":false},{"label":"Guaranteeing production","is_correct":false}]',
'The scorecard creates visibility. You can''t improve what you don''t measure.', 20),

(v_lf_exam, v_course_id, 'Which statement best describes the HCMG CRM standard?', 'multiple_choice',
'[{"label":"It is a diary","is_correct":false},{"label":"It is optional","is_correct":false},{"label":"It is a business system containing useful borrower context and follow-up information","is_correct":true},{"label":"It only needs updates at closing","is_correct":false}]',
'The CRM is a business system — not a diary. Every interaction should be documented with context and next actions.', 21),

(v_lf_exam, v_course_id, 'Which comes after Underwriting in the HCMG workflow?', 'multiple_choice',
'[{"label":"Lead","is_correct":false},{"label":"Consultation","is_correct":false},{"label":"Conditional Approval","is_correct":true},{"label":"Application","is_correct":false}]',
'After Underwriting: Conditional Approval → Clear to Close → Closing → Funding → Post-Close Follow-Up.', 22),

(v_lf_exam, v_course_id, 'Why does a cleaner file matter?', 'multiple_choice',
'[{"label":"It guarantees approval","is_correct":false},{"label":"It eliminates underwriting","is_correct":false},{"label":"It improves preparation for the downstream workflow and makes everyone''s job easier","is_correct":true},{"label":"It guarantees funding","is_correct":false}]',
'A well-prepared file enables faster, cleaner processing — it doesn''t guarantee any specific outcome.', 23),

(v_lf_exam, v_course_id, 'Which is part of the top producer habits?', 'multiple_choice',
'[{"label":"Prospect only when the pipeline is empty","is_correct":false},{"label":"Avoid coaching","is_correct":false},{"label":"Study the craft","is_correct":true},{"label":"Ignore activity metrics","is_correct":false}]',
'Studying the craft is one of the seven top producer habits. The best professionals never stop learning.', 24),

(v_lf_exam, v_course_id, 'What is the purpose of the activity model?', 'multiple_choice',
'[{"label":"Guaranteeing production","is_correct":false},{"label":"Providing a framework for understanding activity, conversion, and production","is_correct":true},{"label":"Predicting each individual''s exact results","is_correct":false},{"label":"Replacing individual performance measurement","is_correct":false}]',
'The activity model is a framework — not a prediction or promise. Use your actual numbers to measure and improve.', 25);

-- ── Final Action Plan (10 short-answer reflection questions) ─────────────
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_lf_action, v_course_id, v_modf, 'Final Action Plan', 'Ten written reflection questions — your personal commitment to executing Harry''s Playbook. Required for certification.', 'text', 122, 3, true, 'manual', 80, 900, '15 min',
E'## Final Action Plan\n\n'
'Complete all ten questions. Your responses are saved and visible to your manager.\n\n'
'Write what you''re actually going to change — not what sounds good.\n\n'
'---\n\n'
'**1.** What is the single most important lesson you learned from Harry''s Playbook?\n\n'
'**2.** Which HCMG standard do you personally need to improve most?\n\n'
'**3.** What will you change about how you handle objections?\n\n'
'**4.** What will you change about your discovery conversations?\n\n'
'**5.** What will you change about your closing behavior?\n\n'
'**6.** What will you change about your follow-up?\n\n'
'**7.** Which activity metric will you pay closer attention to?\n\n'
'**8.** What habit will you start?\n\n'
'**9.** What habit will you stop?\n\n'
'**10.** What will you execute differently tomorrow?\n\n'
'---\n\n'
'**TRAIN. LEARN. CLOSE. WIN.**\n\n'
'**NOW GO EXECUTE.**');

-- ═══════════════════════════════════════════════════════════════════════════
-- COURSE-LEVEL FINAL ASSESSMENT
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_assessments (
  id, course_id, lesson_id,
  title, description, instructions,
  passing_pct, max_attempts, time_limit_mins,
  randomize_questions, questions_to_draw,
  is_required, is_active, assessment_type, show_answers_after
) VALUES (
  v_final_assessment,
  v_course_id,
  v_lf_exam,
  'Harry''s Playbook Certification Exam',
  'The official Harry''s Playbook certification assessment. Pass with 80% or higher to earn your HCMG University certificate.',
  'This exam covers all seven modules of Harry''s Playbook. 25 questions. Passing score: 80%. You have unlimited attempts. Questions are presented in order.',
  80, null, 45,
  false, 25,
  true, true, 'certification_exam', true
);

-- Link all 25 exam questions to the assessment
INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order)
SELECT
  v_final_assessment,
  id,
  sort_order
FROM uni_quiz_questions
WHERE lesson_id = v_lf_exam
ORDER BY sort_order;

END $$;
