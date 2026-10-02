-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — New LO Fast Track: Course 4
-- Title   : Reading Credit Reports and Identifying Issues
-- Slug    : fast-track-reading-credit-reports
-- Audience: New loan officers
-- Duration: 35–45 min
-- Required: Yes | Pass: 80% | Certificate: Yes
-- path_tag: start  (New LO Fast Start section)
-- sort    : 45
--
-- Structure:
--   1 module
--   Lesson 1 : video  — Read the report before reacting (Darius James)
--   Lesson 2 : video  — Recognizing common credit issues (Darius James)
--   Lesson 3 : video  — Turn observations into a reviewable issue (Astrine Covington)
--              4 inline true/false knowledge checks on lesson 3
--   Lesson 4 : knowledge_check — Credit Reports Final Quiz (8 multiple-choice)
--   Lesson 5 : text   — Credit Report Observation Worksheet Job Aid
--   1 uni_assessments (certification_exam, 80%, unlimited retakes)
--   1 uni_certificate_config
--
-- Idempotent: DELETE by slug before re-inserting.
--
-- ⚠ CONTENT STATUS: draft — requires HCMG review before publication.
--   No HCMG-specific policies, contacts, or internal URLs are fabricated.
--   Educational references to agency guidance are for instructional context only;
--   current guidelines govern.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_course_id     uuid := gen_random_uuid();
  v_admin_id      uuid := '736a599a-492a-4585-b845-74b264d0ac9e';
  v_assessment_id uuid := gen_random_uuid();
  v_mod_id        uuid := gen_random_uuid();

  -- lesson IDs
  v_l1  uuid := gen_random_uuid();  -- Lesson 1: video  — Read the report before reacting
  v_l2  uuid := gen_random_uuid();  -- Lesson 2: video  — Recognizing common credit issues
  v_l3  uuid := gen_random_uuid();  -- Lesson 3: video  — Turn observations into a reviewable issue (4 KCs)
  v_l4  uuid := gen_random_uuid();  -- Lesson 4: knowledge_check — Final Quiz (8 questions)
  v_l5  uuid := gen_random_uuid();  -- Lesson 5: text   — Credit Report Observation Worksheet Job Aid

  -- assessment question IDs
  v_aq1 uuid := gen_random_uuid();
  v_aq2 uuid := gen_random_uuid();
  v_aq3 uuid := gen_random_uuid();
  v_aq4 uuid := gen_random_uuid();
  v_aq5 uuid := gen_random_uuid();
  v_aq6 uuid := gen_random_uuid();
  v_aq7 uuid := gen_random_uuid();
  v_aq8 uuid := gen_random_uuid();

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════
-- IDEMPOTENT CLEANUP
-- ═══════════════════════════════════════════════════════════════════════════
DELETE FROM uni_courses WHERE slug = 'fast-track-reading-credit-reports';

-- ═══════════════════════════════════════════════════════════════════════════
-- COURSE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_courses (
  id, slug, title, short_description, description,
  category, difficulty, duration_label,
  pill_color, is_required, is_published, sort_order,
  path_tag, content_status, audience, instructor_name,
  completion_rules) VALUES (
  v_course_id,
  'fast-track-reading-credit-reports',
  'Reading Credit Reports and Identifying Issues',
  'Recognize credit-report information and surface issues — without making unauthorized credit or underwriting determinations.',
  E'A credit report is a source of information — not a complete financial picture and not an underwriting decision.\n\n'
  'This course teaches new loan officers to read a credit report accurately, recognize common issues such as late payments, collections, disputed accounts, and high balances, and document observations in neutral, factual language that supports the review process.\n\n'
  'You will learn to distinguish what a report shows from what it means, to describe discrepancies without jumping to conclusions, and to route items for the authorized review rather than resolving them unilaterally.\n\n'
  '⚠ This course is a draft for HCMG review. No HCMG-specific policies, thresholds, or credit decisions are fabricated. Current investor guidelines, program requirements, and HCMG procedures govern all actual credit determinations.',
  'operations',
  'beginner',
  '35–45 min',
  'blue',
  true,
  false,   -- draft: not published until HCMG review complete
  45,
  'start',
  'draft',
  'New loan officers',
  'Darius James',
  '{"require_all_lessons": true, "require_assessment": true, "passing_score": 80}');

-- ═══════════════════════════════════════════════════════════════════════════
-- LEARNING OBJECTIVES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_course_objectives (id, course_id, objective, sort_order) VALUES
  (gen_random_uuid(), v_course_id, 'Identify the key sections of a credit report and what each communicates', 1),
  (gen_random_uuid(), v_course_id, 'Recognize common credit issues including late payments, collections, disputes, and high balances', 2),
  (gen_random_uuid(), v_course_id, 'Describe credit observations using factual, neutral language rather than conclusions', 3),
  (gen_random_uuid(), v_course_id, 'Distinguish between describing a credit item and making an eligibility determination', 4),
  (gen_random_uuid(), v_course_id, 'Identify when a credit issue must be routed for authorized review', 5),
  (gen_random_uuid(), v_course_id, 'Complete a credit report observation worksheet accurately', 6);

-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active) VALUES
  (v_mod_id, v_course_id,
   'Reading Credit Reports and Identifying Issues',
   'Three teaching videos, four inline knowledge checks, an 8-question final quiz, and a credit report observation worksheet.',
   1, true);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 1 — Read the report before reacting (VIDEO)
-- Presenter: Darius James | 5 min | No inline knowledge check
-- 🎬 VIDEO: attach URL after HeyGen production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l1, v_course_id, v_mod_id,
  'Read the report before reacting',
  'What a credit report actually contains — and how to approach it as a source of information rather than a verdict.',
  'video', 1, 1, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 1\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 5 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'A credit report is a source of information. It is not a complete explanation of the borrower''s financial life, and it should not be treated as a score-only document.\n\n'
  'When reviewing a report, look at the identity information, account history, balances, payment patterns, public-record information where present, inquiries, and liabilities. Pay attention to whether an account is open, closed, current, delinquent, disputed, or otherwise identified.\n\n'
  'Do not assume that every item has the same treatment under every program. Your job is to recognize what is present, identify questions, and follow the approved process.\n\n'
  'If something looks inconsistent, do not edit the file to make it disappear. Ask for clarification and route the issue.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 2 — Recognizing common credit issues (VIDEO)
-- Presenter: Darius James | 5 min | No inline knowledge check
-- 🎬 VIDEO: attach URL after HeyGen production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l2, v_course_id, v_mod_id,
  'Recognizing common credit issues',
  'Late payments, collections, charge-offs, disputes, and high balances — what to look for and how to describe each one accurately.',
  'video', 2, 2, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 2\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 5 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Common credit-report questions include late payments, collections, charge-offs, judgments or other public records, disputed accounts, high revolving balances, recent inquiries, and accounts that may not belong to the borrower.\n\n'
  'The first step is to describe what you see accurately. The second is to understand the borrower''s explanation without treating that explanation as a final determination. The third is to obtain the documentation or review required by the applicable process.\n\n'
  'Avoid giving universal instructions such as ''pay this off,'' ''dispute that account,'' or ''open a new account.'' Those actions may have consequences for the file and should not be recommended casually.\n\n'
  'If the borrower believes an item is inaccurate, explain that there is an appropriate process for addressing credit-report inaccuracies. Do not promise that a dispute will produce a particular score or underwriting outcome.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 3 — Turn observations into a reviewable issue (VIDEO + 4 KCs)
-- Presenter: Astrine Covington | 5 min
-- 🎬 VIDEO: attach URL after HeyGen production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l3, v_course_id, v_mod_id,
  'Turn observations into a reviewable issue',
  'How to write factual, neutral file notes — and how to convert a credit observation into a documented, routable question.',
  'video', 3, 3, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 3\n'
  '  Presenter: Astrine Covington\n'
  '  Suggested runtime: 5 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'A useful file note is factual and neutral.\n\n'
  'Instead of writing, ''Borrower has bad credit,'' describe the issue: ''Report shows a collection account with a reported balance; borrower states the account is not recognized. Referred for review under the approved process.''\n\n'
  'Instead of writing, ''This late payment does not matter,'' write: ''Report reflects a late payment; applicable program treatment requires review.''\n\n'
  'The difference is important. The first statements make conclusions. The second records what is known and identifies the next action.\n\n'
  '────────────────────────────────────────────────────\n'
  'PRACTICE CASE\n'
  '────────────────────────────────────────────────────\n\n'
  'A credit report shows a revolving account with a high balance. The borrower says the balance was paid down last week.\n\n'
  'What is known: the report displays the stated balance as of its reporting date.\n\n'
  'What is reported: the borrower says the balance was paid down last week.\n\n'
  'To establish: whether updated documentation is acceptable and how the applicable program treats it.\n\n'
  'Next action: follow the approved HCMG process and route the information for review.'
);

-- ─────────────────────────────────────────────────
-- LESSON 3 — KNOWLEDGE CHECK 1 (true/false)
-- ─────────────────────────────────────────────────
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  gen_random_uuid(), v_l3,
  'A credit report is a complete explanation of a borrower''s finances.',
  'true_false',
  '[
    {"label": "True",  "is_correct": false},
    {"label": "False", "is_correct": true}
  ]'::jsonb,
  1,
  'A credit report is one source of information; it is not a complete picture of the borrower''s financial situation. Income, assets, property details, and program requirements are all evaluated separately.'
);

-- ─────────────────────────────────────────────────
-- LESSON 3 — KNOWLEDGE CHECK 2 (true/false)
-- ─────────────────────────────────────────────────
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  gen_random_uuid(), v_l3,
  'The LO should make a factual note rather than label the borrower.',
  'true_false',
  '[
    {"label": "True",  "is_correct": true},
    {"label": "False", "is_correct": false}
  ]'::jsonb,
  2,
  'Factual, neutral language describes what is observed without making conclusions that require authorized review. Labels like "bad credit" are conclusions, not observations.'
);

-- ─────────────────────────────────────────────────
-- LESSON 3 — KNOWLEDGE CHECK 3 (true/false)
-- ─────────────────────────────────────────────────
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  gen_random_uuid(), v_l3,
  'The LO should automatically advise a borrower to dispute an account.',
  'true_false',
  '[
    {"label": "True",  "is_correct": false},
    {"label": "False", "is_correct": true}
  ]'::jsonb,
  3,
  'Advising a borrower to dispute without proper basis could affect the file and produce unintended consequences. The LO should describe what is seen and route it for review through the approved process.'
);

-- ─────────────────────────────────────────────────
-- LESSON 3 — KNOWLEDGE CHECK 4 (true/false)
-- ─────────────────────────────────────────────────
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  gen_random_uuid(), v_l3,
  'A borrower''s explanation is important but may need documentation and review.',
  'true_false',
  '[
    {"label": "True",  "is_correct": true},
    {"label": "False", "is_correct": false}
  ]'::jsonb,
  4,
  'A borrower''s explanation provides useful context, but it does not constitute verified or reviewed information. Documentation and authorized review are still required.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 4 — Credit Reports Final Quiz (knowledge_check, 8 multiple-choice)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l4, v_course_id, v_mod_id,
  'Credit Reports — Final Quiz',
  'Eight questions covering credit-report reading, issue identification, file documentation, and appropriate routing.',
  'knowledge_check', 4, 4, false, 'quiz_pass', 80, 720, '12 min',
  E'Answer all 8 questions. Passing score: 80%.\n\n'
  'You may retake as many times as needed. Feedback is shown after each response.'
);

-- ─────────────────────────────────────────────────
-- ASSESSMENT (certification_exam linked to lesson 4)
-- ─────────────────────────────────────────────────
INSERT INTO uni_assessments (
  id, course_id, lesson_id,
  title, assessment_type,
  passing_pct, max_attempts, show_answers_after,
  is_required, instructions) VALUES (
  v_assessment_id, v_course_id, v_l4,
  'Credit Reports and Identifying Issues — Certification',
  'certification_exam',
  80, NULL, true,
  true,
  'Answer all 8 questions. Passing score: 80%. You may retake as many times as needed. Feedback is shown after each response.');

-- ─────────────────────────────────────────────────
-- ASSESSMENT QUESTIONS — Final Quiz
-- ─────────────────────────────────────────────────

-- Q1
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  v_aq1, v_l4,
  'What is the first step when you see an unfamiliar credit item?',
  'multiple_choice',
  '[
    {"label": "Make a qualification decision based on the item",           "is_correct": false},
    {"label": "Describe it accurately and identify the question — do not jump to a conclusion", "is_correct": true},
    {"label": "Delete the item from the file",                              "is_correct": false},
    {"label": "Tell the borrower it is an error",                           "is_correct": false}
  ]'::jsonb,
  1,
  'The first step is always to describe what you see accurately and identify what question it raises. Conclusions, deletions, and promises all require authorization that the LO does not have unilaterally.'
);

-- Q2
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  v_aq2, v_l4,
  'Should a loan officer promise that disputing an account will improve a credit score?',
  'multiple_choice',
  '[
    {"label": "Yes, if the dispute is valid",                               "is_correct": false},
    {"label": "Yes, if the score is below 620",                             "is_correct": false},
    {"label": "No — disputes may take time and do not guarantee a score change", "is_correct": true},
    {"label": "Yes, always",                                                "is_correct": false}
  ]'::jsonb,
  2,
  'Disputes go through a process that may take time, and the outcome is not guaranteed. Promising a score improvement could create expectations the process cannot meet.'
);

-- Q3
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  v_aq3, v_l4,
  'Which is better file language?',
  'multiple_choice',
  '[
    {"label": "''Bad credit'' — it is simpler",                             "is_correct": false},
    {"label": "Either is acceptable",                                       "is_correct": false},
    {"label": "''Report reflects a collection account; borrower disputes ownership'' — it records what is observed without conclusions", "is_correct": true},
    {"label": "Neither should be documented",                               "is_correct": false}
  ]'::jsonb,
  3,
  'Factual, neutral language records observations and identifies questions. Labeling the borrower''s credit as "bad" is a conclusion that requires authorized review — not a file note.'
);

-- Q4
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  v_aq4, v_l4,
  'Does a paid-down balance reported by the borrower automatically update the credit report?',
  'multiple_choice',
  '[
    {"label": "Yes, immediately",                                           "is_correct": false},
    {"label": "Yes, within 24 hours",                                       "is_correct": false},
    {"label": "No — follow the approved documentation and review process",  "is_correct": true},
    {"label": "Yes, if the payment is over $1,000",                         "is_correct": false}
  ]'::jsonb,
  4,
  'Credit reports reflect information as of their reporting date. A borrower''s statement that a balance was paid does not automatically change the report. Documentation must be obtained and reviewed through the approved process.'
);

-- Q5
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  v_aq5, v_l4,
  'What should you do when a credit item may affect program eligibility?',
  'multiple_choice',
  '[
    {"label": "Remove it from the application",                             "is_correct": false},
    {"label": "Ignore it if the overall score is acceptable",               "is_correct": false},
    {"label": "Route it to the appropriate reviewer",                       "is_correct": true},
    {"label": "Ask the borrower to explain it away",                        "is_correct": false}
  ]'::jsonb,
  5,
  'When an item may affect eligibility, the correct action is to surface it and route it to the authorized reviewer. Removing, ignoring, or coaching around the item is not appropriate.'
);

-- Q6
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  v_aq6, v_l4,
  'Is every credit issue treated identically across all loan programs?',
  'multiple_choice',
  '[
    {"label": "Yes",                                                        "is_correct": false},
    {"label": "No — program requirements differ and can change",            "is_correct": true},
    {"label": "Yes, for conventional loans",                                "is_correct": false},
    {"label": "Yes, after a certain credit score threshold is met",         "is_correct": false}
  ]'::jsonb,
  6,
  'Credit treatment varies by program, investor, and underwriting method. Requirements can also change. The LO should not assume one standard applies universally.'
);

-- Q7
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  v_aq7, v_l4,
  'Should the LO conceal a credit discrepancy to keep the file moving?',
  'multiple_choice',
  '[
    {"label": "Yes, if it seems minor",                                     "is_correct": false},
    {"label": "Yes, if the borrower asks",                                  "is_correct": false},
    {"label": "No — discrepancies must be surfaced and reviewed",           "is_correct": true},
    {"label": "Only if it involves a small balance",                        "is_correct": false}
  ]'::jsonb,
  7,
  'Concealing a discrepancy — regardless of how minor it appears — undermines file integrity. All conflicting information must be surfaced and routed through the approved review process.'
);

-- Q8
INSERT INTO uni_quiz_questions (
  id, lesson_id, question_text, question_type, options_json, sort_order, explanation
) VALUES (
  v_aq8, v_l4,
  'What is the purpose of the credit review taught in this course?',
  'multiple_choice',
  '[
    {"label": "To approve or deny the borrower",                            "is_correct": false},
    {"label": "To replace underwriting review",                             "is_correct": false},
    {"label": "To recognize and document issues, then route them for authorized review", "is_correct": true},
    {"label": "To determine the borrower''s maximum loan amount",           "is_correct": false}
  ]'::jsonb,
  8,
  'The LO''s role in credit review is to recognize, accurately describe, and route issues — not to make eligibility or approval decisions. Those determinations require the authorized review process.'
);

-- ─────────────────────────────────────────────────
-- Link assessment questions to assessment
-- ─────────────────────────────────────────────────
INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order) VALUES
  (v_assessment_id, v_aq1, 1),
  (v_assessment_id, v_aq2, 2),
  (v_assessment_id, v_aq3, 3),
  (v_assessment_id, v_aq4, 4),
  (v_assessment_id, v_aq5, 5),
  (v_assessment_id, v_aq6, 6),
  (v_assessment_id, v_aq7, 7),
  (v_assessment_id, v_aq8, 8);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 5 — Credit Report Observation Worksheet (Job Aid, text)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l5, v_course_id, v_mod_id,
  'Credit Report Observation Worksheet — Job Aid',
  'A structured worksheet for documenting credit-report observations, borrower statements, and next actions.',
  'text', 5, 5, false, 'watch_pct', 80, NULL, NULL,
  E'═══════════════════════════════════════════════════════\n'
  '  JOB AID — Credit Report Observation Worksheet\n'
  '═══════════════════════════════════════════════════════\n\n'
  'PURPOSE\n'
  '───────\n'
  'Use this worksheet to document each credit-report item that requires attention. Record facts, not conclusions. Route the completed worksheet to the appropriate reviewer.\n\n'
  'HOW TO USE\n'
  '──────────\n'
  'For each credit item that requires attention, complete one row using the columns below. Use factual, neutral language. Do not record conclusions in place of observations. Route the completed worksheet to the appropriate reviewer.\n\n'
  '─────────────────────────────────────────────────────────────────────────────\n'
  'COLUMN          | WHAT TO ENTER\n'
  '─────────────────────────────────────────────────────────────────────────────\n'
  'Account / Item  | Name of account, creditor, or public-record item as shown\n'
  '                | on the report\n'
  '─────────────────────────────────────────────────────────────────────────────\n'
  'Report Status   | What the report shows: open, closed, delinquent, disputed,\n'
  '                | collection, charge-off, public record, or other status as\n'
  '                | listed\n'
  '─────────────────────────────────────────────────────────────────────────────\n'
  'Borrower        | What the borrower said about this item — record their words,\n'
  'Statement       | not your interpretation\n'
  '─────────────────────────────────────────────────────────────────────────────\n'
  'Evidence        | Documents, letters, or records the borrower provided\n'
  'Received        |\n'
  '─────────────────────────────────────────────────────────────────────────────\n'
  'Question to     | The specific question this item raises for program review:\n'
  'Resolve         | e.g., "Does the reported collection balance need to be paid\n'
  '                | under this program?"\n'
  '─────────────────────────────────────────────────────────────────────────────\n'
  'Reviewer        | Name or role of the team member responsible for evaluating\n'
  '                | this item\n'
  '─────────────────────────────────────────────────────────────────────────────\n'
  'Next Action     | Specific next step, who owns it, and any deadline\n'
  '─────────────────────────────────────────────────────────────────────────────\n\n'
  'LANGUAGE REMINDERS\n'
  '──────────────────\n\n'
  'WRITE THIS:\n'
  '  "Report shows a collection account with a $1,200 reported balance;\n'
  '   borrower states the debt is not recognized. Routed for review."\n\n'
  'NOT THIS:\n'
  '  "Borrower has bad credit."\n\n'
  'WRITE THIS:\n'
  '  "Report reflects a 30-day late payment on an auto loan 14 months ago;\n'
  '   applicable program treatment requires review."\n\n'
  'NOT THIS:\n'
  '  "This late payment does not matter."\n\n'
  'WRITE THIS:\n'
  '  "Borrower reports revolving balance was paid down last week;\n'
  '   documentation and updated review are pending."\n\n'
  'NOT THIS:\n'
  '  "The balance is paid — we are good."\n\n'
  'NEVER\n'
  '─────\n'
  '• Make a qualification decision in the notes.\n'
  '• Promise the borrower that an item will be cleared.\n'
  '• Remove or alter an item to make the file look cleaner.\n'
  '• Advise the borrower to dispute an account without routing it for review.\n'
  '• Treat a borrower''s explanation as resolved documentation.\n\n'
  '⚠ CONFIGURATION REQUIRED BEFORE PUBLICATION\n'
  '─────────────────────────────────────────────\n'
  'Insert HCMG''s approved credit-review workflow, condition-routing steps,\n'
  'and any program-specific documentation requirements before publishing\n'
  'this job aid to learners.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- CERTIFICATE CONFIG
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_certificate_config (
  id, course_id,
  certificate_title,
  issue_certificate,
  trigger_assessment_id) VALUES (
  gen_random_uuid(), v_course_id,
  'Reading Credit Reports and Identifying Issues',
  true,
  v_assessment_id);

END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY — confirm seeded records
-- ═══════════════════════════════════════════════════════════════════════════
SELECT
  c.slug,
  c.title,
  c.sort_order,
  c.path_tag,
  c.content_status,
  c.is_published,
  (SELECT COUNT(*) FROM uni_modules       m WHERE m.course_id = c.id)            AS modules,
  (SELECT COUNT(*) FROM uni_lessons       l WHERE l.course_id = c.id)            AS lessons,
  (SELECT COUNT(*) FROM uni_quiz_questions q
     JOIN uni_lessons l ON l.id = q.lesson_id
    WHERE l.course_id = c.id)                                                    AS quiz_questions,
  (SELECT COUNT(*) FROM uni_assessments   a WHERE a.course_id = c.id)            AS assessments,
  (SELECT COUNT(*) FROM uni_assessment_questions aq
     JOIN uni_assessments a ON a.id = aq.assessment_id
    WHERE a.course_id = c.id)                                                    AS assessment_questions,
  (SELECT COUNT(*) FROM uni_certificate_config cc WHERE cc.course_id = c.id)     AS certificate_configs
FROM uni_courses c
WHERE c.slug = 'fast-track-reading-credit-reports';
