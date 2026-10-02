-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — New LO Fast Track: Course 3
-- Title   : Credit and Borrower Qualification
-- Slug    : fast-track-credit-qualification
-- Audience: New loan officers
-- Duration: 40–50 min
-- Required: Yes | Pass: 80% | Certificate: Yes
-- path_tag: start  (New LO Fast Start section)
-- sort    : 40
--
-- Structure:
--   1 module
--   Lesson 1 : video  — Credit is one part of the borrower's story (Darius James)
--   Lesson 2 : video  — Build the full qualification picture (Darius James)
--   Lesson 3 : video  — Communicating qualification responsibly (Astrine Covington)
--              3 inline knowledge checks on lesson 3
--   Lesson 4 : knowledge_check — Credit and Qualification Final Quiz (10 T/F)
--   Lesson 5 : text   — Qualification Vocabulary Job Aid
--   1 uni_assessments (certification_exam, 80%, unlimited retakes)
--   1 uni_certificate_config
--
-- Idempotent: DELETE by slug before re-inserting.
--
-- ⚠ CONTENT STATUS: draft — requires HCMG review before publication.
--   No HCMG-specific policies, contacts, or internal URLs are fabricated.
--   Fannie Mae references are to publicly available guidance and are cited
--   for educational context only; current guidelines govern.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_course_id     uuid := gen_random_uuid();
  v_admin_id      uuid := '736a599a-492a-4585-b845-74b264d0ac9e';
  v_assessment_id uuid := gen_random_uuid();
  v_mod_id        uuid := gen_random_uuid();

  -- lesson IDs
  v_l1  uuid := gen_random_uuid();  -- Lesson 1: video — Credit is one part of the story
  v_l2  uuid := gen_random_uuid();  -- Lesson 2: video — Build the full picture
  v_l3  uuid := gen_random_uuid();  -- Lesson 3: video — Communicating responsibly (3 KCs)
  v_l4  uuid := gen_random_uuid();  -- Lesson 4: knowledge_check — Final Quiz (10 T/F)
  v_l5  uuid := gen_random_uuid();  -- Lesson 5: text — Job Aid

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════
-- IDEMPOTENT CLEANUP
-- ═══════════════════════════════════════════════════════════════════════════
DELETE FROM uni_courses WHERE slug = 'fast-track-credit-qualification';

-- ═══════════════════════════════════════════════════════════════════════════
-- COURSE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_courses (
  id, slug, title, short_description, description,
  category, difficulty, duration_label,
  pill_color, is_required, is_published, sort_order,
  path_tag, content_status, audience, instructor_name,
  completion_rules, created_by
) VALUES (
  v_course_id,
  'fast-track-credit-qualification',
  'Credit and Borrower Qualification',
  'Understand the role of credit in the complete borrower profile without reducing qualification to a score.',
  E'Credit is one piece of the puzzle — not the whole picture.\n\n'
  'This course teaches new loan officers to understand how credit fits into a complete borrower evaluation, how to communicate qualification status accurately, and how to handle credit questions and liabilities professionally.\n\n'
  'You will learn to describe what a credit score does and does not tell you, build a full qualification picture from multiple sources, and communicate with borrowers in language that is honest without being alarming.\n\n'
  '⚠ This course is a draft for HCMG review. No HCMG-specific policies or thresholds are represented here. Current investor guidelines, program requirements, and HCMG procedures govern all actual qualification decisions.',
  'operations',
  'beginner',
  '40–50 min',
  'blue',
  true,
  false,   -- draft: not published until HCMG review complete
  40,
  'start',
  'draft',
  'New loan officers',
  'Darius James',
  '{"require_all_lessons": true, "require_assessment": true, "passing_score": 80}',
  v_admin_id
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LEARNING OBJECTIVES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_course_objectives (id, course_id, objective, sort_order) VALUES
  (gen_random_uuid(), v_course_id, 'Explain why a credit score is one part of the borrower profile, not the whole qualification decision', 1),
  (gen_random_uuid(), v_course_id, 'Describe the four levels of information: reported, documented, reviewed, and determined', 2),
  (gen_random_uuid(), v_course_id, 'Identify what a credit score does not establish about income, property, or program eligibility', 3),
  (gen_random_uuid(), v_course_id, 'Communicate qualification status accurately without making unsupported promises', 4),
  (gen_random_uuid(), v_course_id, 'Recognize when a liability or credit concern must be documented and routed for review', 5),
  (gen_random_uuid(), v_course_id, 'Apply qualification vocabulary — reported, documented, reviewed, determined — to real file situations', 6);

-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active) VALUES
  (v_mod_id, v_course_id,
   'Credit and Borrower Qualification',
   'Three teaching videos, a 10-question final quiz, and a qualification vocabulary job aid.',
   1, true);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 1 — Credit is one part of the borrower's story (VIDEO)
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
  'Credit is one part of the borrower''s story',
  'Why a credit score is a starting point, not a final answer — and how to frame credit in the context of the complete borrower profile.',
  'video', 1, 1, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 1\n'
  '  Title: Credit is one part of the borrower''s story\n'
  '  Presenter: Darius James, Chief Lending Officer\n'
  '  Suggested runtime: 5 minutes\n'
  '  Status: Draft — for HCMG review\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Credit is important, but a credit score is not the borrower''s entire financial story and it is not a loan approval.\n\n'
  'A credit review can help the team understand payment history, current obligations, account status, and other information relevant to the transaction. But qualification also involves income, assets, property, occupancy, transaction details, program requirements, and the applicable underwriting process.\n\n'
  'Do not tell a borrower that a particular score guarantees approval. Do not assume that a score below a number you remember means the borrower cannot qualify. Requirements differ by program, underwriting method, investor, and lender overlays — and they can change.\n\n'
  'Your job is to gather accurate information, explain the next step, and avoid giving advice that is outside your training or authority.\n\n'
  'When a borrower raises a credit concern, listen without judgment. Ask what happened, when it happened, and whether there are documents or details that may help the appropriate team evaluate it.\n\n'
  'The right question is not, "Is this borrower''s score good enough?" The better question is, "What does the complete file show, and what requirements apply to this transaction?"\n\n'
  '─────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — What a credit score does not tell you\n'
  '─────────────────────────────────────────────────────\n\n'
  'A score alone does not establish:\n\n'
  '• Whether the borrower meets a specific program''s requirements.\n'
  '• Whether all liabilities have been identified.\n'
  '• Whether the borrower''s income is stable and documented.\n'
  '• Whether the property and transaction are eligible.\n'
  '• Whether an underwriting system or authorized reviewer will issue an acceptable decision.\n\n'
  'Fannie Mae''s current Selling Guide describes borrower evaluation as a broader review involving repayment capacity and verified income, assets, and liabilities. This is one example of how agencies approach qualification — current guidelines and HCMG''s approved process govern every actual transaction.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 2 — Build the full qualification picture (VIDEO)
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
  'Build the full qualification picture',
  'Qualification is a complete-file exercise — income, assets, credit, property, and program requirements all matter.',
  'video', 2, 2, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 2\n'
  '  Title: Build the full qualification picture\n'
  '  Presenter: Darius James, Chief Lending Officer\n'
  '  Suggested runtime: 5 minutes\n'
  '  Status: Draft — for HCMG review\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Qualification is a complete-file exercise.\n\n'
  'Start with the transaction: what is the borrower trying to do, what property is involved, and what is the timing? Then consider the borrower''s financial picture: income, assets, debts, credit history, and other facts relevant to the applicable program.\n\n'
  'A single strength does not erase every other concern. A strong income figure does not make an undisclosed debt disappear. A substantial asset balance does not automatically establish that funds are eligible and available. A favorable credit profile does not resolve a property issue.\n\n'
  'When information is missing, identify it. When documents conflict, surface the conflict. When a question requires an underwriting interpretation, route it to the authorized reviewer.\n\n'
  'The loan officer''s value is not pretending to know every answer. It is making sure the right facts reach the right person at the right time.\n\n'
  '─────────────────────────────────────────────────────\n'
  '  FOUR LEVELS OF INFORMATION\n'
  '─────────────────────────────────────────────────────\n\n'
  'Use these distinctions when discussing a file:\n\n'
  'Borrower-reported: Information the borrower has told you.\n\n'
  'Documented: Information supported by records or documents.\n\n'
  'Reviewed: Information examined by the appropriate person or system.\n\n'
  'Determined: A decision made by the authorized party under the applicable requirements.\n\n'
  'Do not move information from one level to another simply because it seems reasonable.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 3 — Communicating qualification responsibly (VIDEO)
-- Presenter: Astrine Covington | 5 min | 3 inline knowledge checks
-- 🎬 VIDEO: attach URL after HeyGen production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l3, v_course_id, v_mod_id,
  'Communicating qualification responsibly',
  'How to give accurate, honest answers without creating false expectations — and what language to use when the file is still under review.',
  'video', 3, 3, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 3\n'
  '  Title: Communicating qualification responsibly\n'
  '  Presenter: Astrine Covington, President\n'
  '  Suggested runtime: 5 minutes\n'
  '  Status: Draft — for HCMG review\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Borrowers deserve clear answers, but clear does not mean absolute when the file is still being reviewed.\n\n'
  'Avoid statements such as, "You are definitely approved," "That debt will not matter," or "We can use all of that income," unless the authorized process supports the statement.\n\n'
  'Use language that separates what is known from what remains under review.\n\n'
  'For example: "Based on what you have shared, this may be an option. We still need to review the supporting documentation and the program requirements before we can confirm whether it works."\n\n'
  'That is not evasive. It is accurate.\n\n'
  'When a borrower is disappointed by a question or document request, explain the purpose as clearly as you can. Do not blame another department. Do not make a promise to avoid an uncomfortable conversation. Bring the right team member into the discussion when needed.\n\n'
  '─────────────────────────────────────────────────────\n'
  '  COMMUNICATION EXAMPLES\n'
  '─────────────────────────────────────────────────────\n\n'
  'Instead of: "You qualify because your score is high."\n'
  'Use: "Your credit history is part of the review. We still need to look at the full picture before we can confirm a direction."\n\n'
  'Instead of: "That debt will not matter."\n'
  'Use: "I need to document that obligation and make sure the appropriate reviewer sees it."\n\n'
  'Instead of: "I''m sure we can use all of that income."\n'
  'Use: "Income needs to be reviewed and documented under the applicable requirements. I''ll make sure that process is started."'
);

-- Inline knowledge checks — Lesson 3
INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES
-- KC1
(v_l3, v_course_id,
 'A borrower says, "My score is 720, so I''m approved, right?" What is the best response?',
 'multiple_choice',
 '[{"label":"Agree — 720 is a strong score, so they are approved.","is_correct":false},{"label":"Explain that credit is one part of the full review and that the complete file still needs to be evaluated.","is_correct":true},{"label":"Tell them the score is irrelevant.","is_correct":false},{"label":"Guarantee the program they asked about.","is_correct":false}]',
 'A credit score is one input in a multi-factor qualification review. Agreeing to an approval based on the score alone is inaccurate and creates a false expectation.',
 1),

-- KC2
(v_l3, v_course_id,
 'You identify a liability that was not previously discussed. What is the appropriate action?',
 'multiple_choice',
 '[{"label":"Ignore it if it is not on the credit report.","is_correct":false},{"label":"Remove it from your notes since the borrower did not mention it.","is_correct":false},{"label":"Document the liability and route it for review under the approved process.","is_correct":true},{"label":"Tell the borrower it will not affect qualification.","is_correct":false}]',
 'Liabilities that may affect repayment capacity must be considered and documented. Fannie Mae guidance notes that obligations — including those that may not appear on a credit report — can be relevant to the qualification analysis. Route discovered liabilities for authorized review.',
 2),

-- KC3
(v_l3, v_course_id,
 'Which statement is appropriate when a borrower asks whether they qualify?',
 'multiple_choice',
 '[{"label":"\"You qualify because your score is high.\"","is_correct":false},{"label":"\"The loan is guaranteed if you send the documents.\"","is_correct":false},{"label":"\"We need to review the complete file against the applicable requirements before we can confirm a direction.\"","is_correct":true},{"label":"\"The underwriter will fix everything — don''t worry.\"","is_correct":false}]',
 'Accurate communication separates what is known from what is still under review. Promising approval or guaranteeing an outcome before the authorized process is complete is inaccurate and potentially harmful.',
 3);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 4 — Credit and Qualification Final Quiz (KNOWLEDGE CHECK)
-- 10 True/False questions | 12 min | 80% to pass
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l4, v_course_id, v_mod_id,
  'Credit and Qualification — Final Quiz',
  'Ten true/false questions covering the key concepts from this course. Passing score: 80%. You may retake as many times as needed.',
  'knowledge_check', 4, 4, false, 'quiz_pass', 80, 720, '12 min',
  E'Answer all 10 questions. You need 8 out of 10 correct (80%) to pass.\n\n'
  'You may retake this quiz as many times as needed.\n\n'
  'Each question will show the correct answer and an explanation after you submit your response.'
);

-- 10 True/False quiz questions for Lesson 4
INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES
-- Q1
(v_l4, v_course_id,
 'A credit score alone establishes mortgage approval.',
 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'False. Mortgage qualification involves income, assets, credit, property, occupancy, transaction details, and program requirements. A credit score is one input, not a complete qualification decision.',
 1),

-- Q2
(v_l4, v_course_id,
 'Qualification involves multiple parts of the borrower and transaction.',
 'true_false',
 '[{"label":"True","is_correct":true},{"label":"False","is_correct":false}]',
 'True. A complete qualification review considers the borrower''s income, assets, liabilities, credit history, the property, occupancy, transaction purpose, and the applicable program requirements.',
 2),

-- Q3
(v_l4, v_course_id,
 'A loan officer should ignore a liability that is absent from one information source.',
 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'False. A liability that may affect repayment capacity must be documented and reviewed. The fact that an obligation does not appear in one source does not mean it can be disregarded.',
 3),

-- Q4
(v_l4, v_course_id,
 'Conflicting information in a file should be surfaced and reviewed.',
 'true_false',
 '[{"label":"True","is_correct":true},{"label":"False","is_correct":false}]',
 'True. When documents or information sources conflict, the loan officer must identify the discrepancy and follow the approved review process. Choosing the more favorable version without review is not appropriate.',
 4),

-- Q5
(v_l4, v_course_id,
 'A borrower''s reported income is automatically qualifying income.',
 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'False. Reported income is a starting point. Qualifying income must be documented, evaluated for stability and continuance, and reviewed under the applicable program requirements.',
 5),

-- Q6
(v_l4, v_course_id,
 'Program requirements for credit and qualification can vary and change.',
 'true_false',
 '[{"label":"True","is_correct":true},{"label":"False","is_correct":false}]',
 'True. Requirements differ by program, investor, underwriting method, and lender overlays. They can also change. Always verify current guidelines.',
 6),

-- Q7
(v_l4, v_course_id,
 'A loan officer should promise approval to reassure a concerned borrower.',
 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'False. Promising approval before the authorized process is complete is inaccurate. Accurate, honest communication is more professional and protects both the borrower and the company.',
 7),

-- Q8
(v_l4, v_course_id,
 'The appropriate response to an uncertain underwriting question is to escalate it to the authorized reviewer.',
 'true_false',
 '[{"label":"True","is_correct":true},{"label":"False","is_correct":false}]',
 'True. When a question requires an underwriting interpretation, it must be routed to the authorized reviewer. The loan officer should not guess or make a determination outside their authority.',
 8),

-- Q9
(v_l4, v_course_id,
 'Credit concerns should be discussed with the borrower professionally and without judgment.',
 'true_false',
 '[{"label":"True","is_correct":true},{"label":"False","is_correct":false}]',
 'True. Borrowers may have complex credit histories. The loan officer''s role is to listen, gather accurate information, and route issues for review — not to judge the borrower or make assumptions.',
 9),

-- Q10
(v_l4, v_course_id,
 'A strong credit profile guarantees that a property and transaction are eligible.',
 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'False. A strong credit profile is one positive factor. Property eligibility, occupancy, transaction purpose, and program requirements are separate and independent considerations.',
 10);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 5 — Qualification Vocabulary Job Aid (TEXT)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l5, v_course_id, v_mod_id,
  'Qualification Vocabulary — Job Aid',
  'The five-level file-status vocabulary: Known / Reported / Documented / Reviewed / Determined. Keep this as a reference throughout your first transactions.',
  'text', 5, 5, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  JOB AID\n'
  '  Qualification Vocabulary: Known / Reported / Documented / Reviewed / Determined\n'
  '═══════════════════════════════════════════════════════\n\n'
  'One of the most important professional habits in mortgage lending is using precise language about what you actually know versus what you assume, hope, or have been told.\n\n'
  'Use these five levels when discussing any piece of information in a file:\n\n'
  '─────────────────────────────────────────────────────\n'
  '1. BORROWER-REPORTED\n'
  '─────────────────────────────────────────────────────\n'
  'The borrower has told you something. You have not yet confirmed it with documents or a review.\n\n'
  'Example: "Borrower reports gross monthly income of $8,000."\n\n'
  'What it does NOT mean: The income is verified or can be used to qualify.\n\n'
  '─────────────────────────────────────────────────────\n'
  '2. DOCUMENTED\n'
  '─────────────────────────────────────────────────────\n'
  'The information is supported by records collected through the approved process — paystubs, tax returns, bank statements, or other required documents.\n\n'
  'Example: "Borrower has provided two years of W-2s and recent paystubs."\n\n'
  'What it does NOT mean: The income has been evaluated or approved for use in qualification.\n\n'
  '─────────────────────────────────────────────────────\n'
  '3. REVIEWED\n'
  '─────────────────────────────────────────────────────\n'
  'The information has been examined by the appropriate person or system — a processor, underwriter, automated system, or other authorized reviewer.\n\n'
  'Example: "The file has been submitted for underwriting review."\n\n'
  'What it does NOT mean: A final decision has been made.\n\n'
  '─────────────────────────────────────────────────────\n'
  '4. DETERMINED\n'
  '─────────────────────────────────────────────────────\n'
  'An authorized decision has been made by the appropriate party under the applicable requirements.\n\n'
  'Example: "The underwriter has issued a conditional approval with three outstanding conditions."\n\n'
  'What it does NOT mean: The loan is clear to close or that all conditions are resolved.\n\n'
  '─────────────────────────────────────────────────────\n'
  '5. CONFIRMED / ACCEPTED\n'
  '─────────────────────────────────────────────────────\n'
  'The authorized reviewer has confirmed that a specific item satisfies the applicable requirement.\n\n'
  'Example: "The underwriter confirmed that the submitted letter of explanation satisfies the condition."\n\n'
  'What it does NOT mean: Use this only when you have received actual confirmation, not when you believe the item should satisfy the condition.\n\n'
  '─────────────────────────────────────────────────────\n'
  '  HOW TO USE THIS VOCABULARY\n'
  '─────────────────────────────────────────────────────\n\n'
  'WRONG: "The borrower''s income is $8,000." (This treats a reported number as a determined fact.)\n\n'
  'RIGHT: "The borrower reports $8,000 in gross monthly income. Documentation has been requested and is under review."\n\n'
  'WRONG: "I submitted the conditions, so we should be clear to close." (Submission is not acceptance.)\n\n'
  'RIGHT: "The condition responses have been submitted. I am waiting for confirmation from the reviewing team."\n\n'
  '─────────────────────────────────────────────────────\n'
  '  QUICK REFERENCE\n'
  '─────────────────────────────────────────────────────\n\n'
  'Borrower-reported  → Information the borrower told you. Not verified.\n'
  'Documented         → Supported by records. Not yet evaluated.\n'
  'Reviewed           → Examined by the appropriate reviewer. Not yet decided.\n'
  'Determined         → An authorized decision has been made. May still have conditions.\n'
  'Confirmed          → An authorized reviewer has accepted a specific item.\n\n'
  'Never move information forward in this chain without the corresponding action actually occurring.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FORMAL ASSESSMENT RECORD (uni_assessments)
-- Linked to the final quiz lesson (v_l4) for LMS certification gating
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_assessments (
  id, course_id, lesson_id,
  title, description,
  assessment_type, passing_pct, is_required, is_active,
  max_attempts, randomize_questions, show_answers_after,
  instructions
) VALUES (
  v_assessment_id,
  v_course_id,
  v_l4,
  'Credit and Borrower Qualification — Final Assessment',
  'Ten true/false questions covering credit, qualification vocabulary, and communication standards. Passing score: 80%.',
  'certification_exam',
  80,
  true,
  true,
  NULL,   -- unlimited retakes
  false,  -- present in order
  true,   -- show correct answers and explanation after each submission
  'Answer all 10 true/false questions. You need 8 out of 10 correct (80% or higher) to pass and earn your completion certificate. You may retake this assessment as many times as needed.'
);

-- Link all 10 quiz questions to the formal assessment record
INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order)
SELECT v_assessment_id, q.id, q.sort_order
FROM uni_quiz_questions q
WHERE q.lesson_id = v_l4
ORDER BY q.sort_order;

-- ═══════════════════════════════════════════════════════════════════════════
-- CERTIFICATE CONFIGURATION
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_certificate_config (
  course_id,
  issue_certificate,
  renewal_mode,
  include_verification,
  trigger_assessment_id
) VALUES (
  v_course_id,
  true,
  'manual',
  true,
  v_assessment_id
);

END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- QA SUMMARY CHECK
-- ═══════════════════════════════════════════════════════════════════════════
SELECT
  c.title,
  c.slug,
  c.is_published,
  c.is_required,
  c.sort_order,
  c.path_tag,
  COUNT(DISTINCT m.id)  AS module_count,
  COUNT(DISTINCT l.id)  AS lesson_count,
  COUNT(DISTINCT q.id)  AS total_questions,
  COUNT(DISTINCT a.id)  AS assessment_count,
  COUNT(DISTINCT cc.id) AS cert_config_count
FROM uni_courses c
LEFT JOIN uni_modules m   ON m.course_id = c.id
LEFT JOIN uni_lessons l   ON l.course_id = c.id
LEFT JOIN uni_quiz_questions q ON q.course_id = c.id
LEFT JOIN uni_assessments a   ON a.course_id = c.id
LEFT JOIN uni_certificate_config cc ON cc.course_id = c.id
WHERE c.slug = 'fast-track-credit-qualification'
GROUP BY c.id, c.title, c.slug, c.is_published, c.is_required, c.sort_order, c.path_tag;
