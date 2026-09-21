-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — End-to-End Test Course
-- Creates the complete "HCMG U Test Course" with:
--   Module 1: FHA Basics
--     Lesson 1.1 — Introduction to FHA (video)
--     Lesson 1.2 — Borrower Eligibility (text)
--     Knowledge Check (5 questions)
--   Module 2: FHA Guidelines
--     Lesson 2.1 — Income Requirements (video)
--     Lesson 2.2 — Credit Requirements (resource)
--     Knowledge Check (3 questions)
--   Final Assessment (multiple choice + multiple select + true/false)
--   Certificate Configuration
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_course_id         UUID;
  v_mod1_id           UUID;
  v_mod2_id           UUID;
  v_lesson1_id        UUID;
  v_lesson2_id        UUID;
  v_lesson3_id        UUID;
  v_lesson4_id        UUID;
  v_kc1_id            UUID;
  v_kc2_id            UUID;
  v_final_id          UUID;
  v_q1_id             UUID;
  v_q2_id             UUID;
  v_q3_id             UUID;
  v_q4_id             UUID;
  v_q5_id             UUID;
  v_fq1_id            UUID;
  v_fq2_id            UUID;
  v_fq3_id            UUID;
  v_fq4_id            UUID;
  v_fq5_id            UUID;
  v_fq6_id            UUID;
BEGIN

  -- ── Idempotent: delete existing test course data ──────────────────────────
  DELETE FROM uni_courses WHERE slug = 'hcmg-u-test-course';

  -- ── Course ─────────────────────────────────────────────────────────────────
  INSERT INTO uni_courses (
    slug, title, short_description, description,
    category, is_required, is_published, content_status,
    sort_order, pill_color, duration_label, difficulty,
    audience, instructor_name,
    completion_rules,
    thumbnail_url
  ) VALUES (
    'hcmg-u-test-course',
    'FHA Fundamentals',
    'Learn the essentials of FHA lending from eligibility to approval.',
    'This comprehensive course covers FHA loan requirements, borrower eligibility, income guidelines, and credit requirements. Designed for new loan officers entering the mortgage industry.',
    'product',
    true,
    true,
    'published',
    999,
    'orange',
    '35 min',
    'beginner',
    'New Loan Officers',
    'HCMG Training Team',
    '{"require_all_lessons": true, "require_assessment": true, "passing_score": 80}'::jsonb,
    null
  )
  RETURNING id INTO v_course_id;

  -- ── Learning Objectives ────────────────────────────────────────────────────
  INSERT INTO uni_course_objectives (course_id, objective, sort_order) VALUES
    (v_course_id, 'Understand FHA basic eligibility requirements', 0),
    (v_course_id, 'Identify qualifying income for FHA borrowers', 1),
    (v_course_id, 'Explain FHA credit score requirements', 2),
    (v_course_id, 'Calculate FHA debt-to-income ratios', 3);

  -- ── Module 1 ───────────────────────────────────────────────────────────────
  INSERT INTO uni_modules (course_id, title, description, sort_order, is_active)
  VALUES (v_course_id, 'Module 1 — FHA Basics', 'Introduction to FHA lending fundamentals', 1, true)
  RETURNING id INTO v_mod1_id;

  -- ── Module 2 ───────────────────────────────────────────────────────────────
  INSERT INTO uni_modules (course_id, title, description, sort_order, is_active)
  VALUES (v_course_id, 'Module 2 — FHA Guidelines', 'Detailed FHA income and credit guidelines', 2, true)
  RETURNING id INTO v_mod2_id;

  -- ── Lesson 1.1: Introduction to FHA (Video) ───────────────────────────────
  INSERT INTO uni_lessons (
    course_id, module_id, title, description, lesson_type,
    video_token, transcript, sort_order, module_sort_order,
    duration_label, duration_secs,
    completion_mode, completion_threshold_pct, is_published
  ) VALUES (
    v_course_id, v_mod1_id,
    'Introduction to FHA',
    'A comprehensive overview of the Federal Housing Administration loan program and its benefits.',
    'video',
    'https://share.heygen.com/demo-fha-intro',
    E'00:00\nWelcome to HCMG University''s FHA Fundamentals course.\n\n00:14\nThe Federal Housing Administration, or FHA, was created in 1934 to help stimulate the housing market.\n\n01:05\nFHA loans are government-backed mortgages that allow lower down payments and more flexible qualification criteria.\n\n02:30\nIn this lesson, we''ll cover what makes FHA loans unique and when they''re the right choice for your clients.',
    1, 1,
    '12 min', 720,
    'watch_pct', 80, true
  )
  RETURNING id INTO v_lesson1_id;

  -- ── Lesson 1.2: Borrower Eligibility (Text) ───────────────────────────────
  INSERT INTO uni_lessons (
    course_id, module_id, title, description, lesson_type,
    transcript, sort_order, module_sort_order,
    duration_label, duration_secs,
    completion_mode, completion_threshold_pct, is_published
  ) VALUES (
    v_course_id, v_mod1_id,
    'Borrower Eligibility',
    'Learn who qualifies for an FHA loan and what documentation is required.',
    'text',
    E'BORROWER ELIGIBILITY REQUIREMENTS\n\nTo qualify for an FHA loan, borrowers must meet the following requirements:\n\n1. CREDIT SCORE\nMinimum 580 for 3.5% down payment\nMinimum 500-579 for 10% down payment\n\n2. DOWN PAYMENT\nMinimum 3.5% with credit score 580+\nMinimum 10% with credit score 500-579\n\n3. DEBT-TO-INCOME RATIO\nFront-end: 31% maximum\nBack-end: 43% maximum (exceptions possible)\n\n4. EMPLOYMENT\nTwo-year employment history required\nSelf-employed: two years of tax returns\n\n5. PROPERTY REQUIREMENTS\nMust be primary residence\nMust meet FHA minimum property standards',
    2, 2,
    '8 min', 480,
    'manual', 80, true
  )
  RETURNING id INTO v_lesson2_id;

  -- ── Knowledge Check 1 (attached to Module 1 lessons) ─────────────────────
  INSERT INTO uni_assessments (
    course_id, lesson_id, title, description, instructions,
    assessment_type, passing_pct, max_attempts,
    time_limit_mins, randomize_questions, questions_to_draw,
    show_answers_after, is_required, is_active
  ) VALUES (
    v_course_id, v_lesson2_id,
    'Module 1 Knowledge Check',
    'Test your understanding of FHA basics and borrower eligibility.',
    'Answer all questions. You need 80% to pass. You have 2 attempts.',
    'knowledge_check', 80, 2,
    10, false, null,
    true, true, true
  )
  RETURNING id INTO v_kc1_id;

  -- KC1 Questions
  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (v_lesson2_id, v_course_id,
    'What is the minimum credit score required for a 3.5% down payment FHA loan?',
    'multiple_choice',
    '[{"label":"500","is_correct":false},{"label":"580","is_correct":true},{"label":"620","is_correct":false},{"label":"640","is_correct":false}]'::jsonb,
    'FHA allows a minimum 3.5% down payment with a credit score of 580 or higher.',
    1
  ) RETURNING id INTO v_q1_id;

  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (v_lesson2_id, v_course_id,
    'What is the maximum back-end debt-to-income ratio typically allowed for FHA loans?',
    'multiple_choice',
    '[{"label":"36%","is_correct":false},{"label":"41%","is_correct":false},{"label":"43%","is_correct":true},{"label":"50%","is_correct":false}]'::jsonb,
    'FHA generally allows a back-end DTI up to 43%, though exceptions can be made.',
    2
  ) RETURNING id INTO v_q2_id;

  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (v_lesson2_id, v_course_id,
    'FHA loans can be used to purchase investment properties.',
    'true_false',
    '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]'::jsonb,
    'FHA loans require the property to be the borrower''s primary residence. They cannot be used for investment properties.',
    3
  ) RETURNING id INTO v_q3_id;

  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (v_lesson2_id, v_course_id,
    'Which of the following are required for FHA borrower eligibility? (Select all that apply)',
    'multiple_select',
    '[{"label":"Two-year employment history","is_correct":true},{"label":"Minimum credit score of 500","is_correct":true},{"label":"20% down payment","is_correct":false},{"label":"Primary residence use","is_correct":true}]'::jsonb,
    'FHA requires a two-year employment history, minimum 500 credit score (with higher down payment), and the property must be a primary residence.',
    4
  ) RETURNING id INTO v_q4_id;

  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (v_lesson2_id, v_course_id,
    'A borrower with a 560 credit score must put down at least what percentage for an FHA loan?',
    'multiple_choice',
    '[{"label":"3.5%","is_correct":false},{"label":"5%","is_correct":false},{"label":"10%","is_correct":true},{"label":"20%","is_correct":false}]'::jsonb,
    'Borrowers with credit scores between 500 and 579 must put down a minimum of 10% for FHA loans.',
    5
  ) RETURNING id INTO v_q5_id;

  -- Link KC1 questions to KC1 assessment
  INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order) VALUES
    (v_kc1_id, v_q1_id, 1),
    (v_kc1_id, v_q2_id, 2),
    (v_kc1_id, v_q3_id, 3),
    (v_kc1_id, v_q4_id, 4),
    (v_kc1_id, v_q5_id, 5);

  -- ── Lesson 2.1: Income Requirements (Video) ───────────────────────────────
  INSERT INTO uni_lessons (
    course_id, module_id, title, description, lesson_type,
    video_token, transcript, sort_order, module_sort_order,
    duration_label, duration_secs,
    completion_mode, completion_threshold_pct, is_published
  ) VALUES (
    v_course_id, v_mod2_id,
    'Income Requirements',
    'How to calculate and document qualifying income for FHA loans.',
    'video',
    'https://share.heygen.com/demo-fha-income',
    E'00:00\nIn this lesson, we''ll cover how to calculate qualifying income for FHA loans.\n\n00:22\nFHA uses gross monthly income as the basis for qualification.\n\n01:15\nEmployment income must be documented with W-2s and pay stubs.\n\n02:45\nSelf-employment income requires two years of tax returns and a year-to-date profit and loss statement.',
    3, 1,
    '10 min', 600,
    'watch_pct', 80, true
  )
  RETURNING id INTO v_lesson3_id;

  -- ── Lesson 2.2: Credit Requirements (Resource) ────────────────────────────
  INSERT INTO uni_lessons (
    course_id, module_id, title, description, lesson_type,
    resources_json, sort_order, module_sort_order,
    duration_label, duration_secs,
    completion_mode, completion_threshold_pct, is_published
  ) VALUES (
    v_course_id, v_mod2_id,
    'Credit Requirements',
    'Understanding FHA credit standards including tri-merge reports and tradeline requirements.',
    'resource',
    '[{"label":"FHA Credit Guidelines Reference Sheet","storage_path":"documents/fha-credit-guidelines.pdf"},{"label":"Credit Score Chart","storage_path":"documents/fha-credit-score-chart.pdf"}]'::jsonb,
    4, 2,
    '5 min', 300,
    'manual', 80, true
  )
  RETURNING id INTO v_lesson4_id;

  -- ── Knowledge Check 2 ─────────────────────────────────────────────────────
  INSERT INTO uni_assessments (
    course_id, lesson_id, title, description, instructions,
    assessment_type, passing_pct, max_attempts,
    time_limit_mins, randomize_questions, questions_to_draw,
    show_answers_after, is_required, is_active
  ) VALUES (
    v_course_id, v_lesson4_id,
    'Module 2 Knowledge Check',
    'Test your understanding of FHA income and credit requirements.',
    'Answer all questions to proceed to the Final Assessment.',
    'knowledge_check', 80, 3,
    10, false, null,
    true, true, true
  )
  RETURNING id INTO v_kc2_id;

  -- KC2 Questions
  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (v_lesson4_id, v_course_id,
    'FHA uses which income basis for qualification calculations?',
    'multiple_choice',
    '[{"label":"Net monthly income","is_correct":false},{"label":"Gross monthly income","is_correct":true},{"label":"Annual income divided by 12","is_correct":false},{"label":"Take-home pay","is_correct":false}]'::jsonb,
    'FHA qualification is based on gross monthly income — income before taxes and deductions.',
    1
  ) RETURNING id INTO v_fq1_id;

  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (v_lesson4_id, v_course_id,
    'Self-employed borrowers must provide which documents for income verification?',
    'multiple_select',
    '[{"label":"Two years of tax returns","is_correct":true},{"label":"Year-to-date P&L statement","is_correct":true},{"label":"Social Security statement","is_correct":false},{"label":"Bank statements (optional)","is_correct":false}]'::jsonb,
    'FHA requires self-employed borrowers to provide two years of personal and business tax returns and a year-to-date profit and loss statement.',
    2
  ) RETURNING id INTO v_fq2_id;

  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (v_lesson4_id, v_course_id,
    'A borrower with a 620 credit score automatically qualifies for an FHA loan.',
    'true_false',
    '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]'::jsonb,
    'Meeting the minimum credit score is one requirement but not the only one. DTI, employment history, and other factors must also be satisfied.',
    3
  ) RETURNING id INTO v_fq3_id;

  -- Link KC2 questions
  INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order) VALUES
    (v_kc2_id, v_fq1_id, 1),
    (v_kc2_id, v_fq2_id, 2),
    (v_kc2_id, v_fq3_id, 3);

  -- ── Final Assessment ───────────────────────────────────────────────────────
  INSERT INTO uni_assessments (
    course_id, lesson_id, title, description, instructions,
    assessment_type, passing_pct, max_attempts,
    time_limit_mins, randomize_questions, questions_to_draw,
    show_answers_after, is_required, is_active
  ) VALUES (
    v_course_id, null,
    'FHA Fundamentals — Final Assessment',
    'Comprehensive assessment covering all FHA Fundamentals course material.',
    'This assessment has 6 questions. You must score at least 80% to pass and earn your certificate. You have 2 attempts.',
    'final_assessment', 80, 2,
    30, false, null,
    true, true, true
  )
  RETURNING id INTO v_final_id;

  -- Final Assessment Questions
  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (null, v_course_id,
    'What government agency backs FHA loans?',
    'multiple_choice',
    '[{"label":"FHFA","is_correct":false},{"label":"CFPB","is_correct":false},{"label":"HUD / FHA","is_correct":true},{"label":"Fannie Mae","is_correct":false}]'::jsonb,
    'FHA loans are backed by the Federal Housing Administration, which is part of HUD (Housing and Urban Development).',
    1
  ) RETURNING id INTO v_fq4_id;

  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (null, v_course_id,
    'What is the minimum down payment for a borrower with a 600 credit score on an FHA loan?',
    'multiple_choice',
    '[{"label":"3.5%","is_correct":true},{"label":"5%","is_correct":false},{"label":"10%","is_correct":false},{"label":"20%","is_correct":false}]'::jsonb,
    'A borrower with a 600 credit score qualifies for the 3.5% minimum down payment because 600 is above the 580 threshold.',
    2
  ) RETURNING id INTO v_fq5_id;

  INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
  VALUES (null, v_course_id,
    'Which of the following are FHA loan requirements? (Select all that apply)',
    'multiple_select',
    '[{"label":"Primary residence only","is_correct":true},{"label":"Mortgage insurance required","is_correct":true},{"label":"Minimum 20% down payment","is_correct":false},{"label":"Government-backed loan","is_correct":true}]'::jsonb,
    'FHA loans require: primary residence use, mortgage insurance (MIP), and are government-backed. They do NOT require 20% down.',
    3
  ) RETURNING id INTO v_fq6_id;

  -- Link all final assessment questions
  INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order) VALUES
    (v_final_id, v_fq4_id, 1),
    (v_final_id, v_fq5_id, 2),
    (v_final_id, v_fq6_id, 3),
    (v_final_id, v_q1_id, 4),  -- Reuse KC1 questions in final
    (v_final_id, v_q2_id, 5),
    (v_final_id, v_q3_id, 6);

  -- ── Certificate Configuration ──────────────────────────────────────────────
  INSERT INTO uni_certificate_config (
    course_id, issue_certificate, validity_days,
    renewal_mode, include_verification, trigger_assessment_id
  ) VALUES (
    v_course_id, true, 365,
    'manual', true, v_final_id
  );

  -- ── Verify created ─────────────────────────────────────────────────────────
  RAISE NOTICE 'Test course created: % (ID: %)', 'FHA Fundamentals', v_course_id;
  RAISE NOTICE 'Module 1 ID: %', v_mod1_id;
  RAISE NOTICE 'Module 2 ID: %', v_mod2_id;
  RAISE NOTICE 'Lessons: %, %, %, %', v_lesson1_id, v_lesson2_id, v_lesson3_id, v_lesson4_id;
  RAISE NOTICE 'KC1 ID: %, KC2 ID: %, Final ID: %', v_kc1_id, v_kc2_id, v_final_id;

END $$;

-- Verify the data
SELECT
  c.title,
  c.slug,
  c.content_status,
  c.is_published,
  (SELECT COUNT(*) FROM uni_modules WHERE course_id = c.id) AS module_count,
  (SELECT COUNT(*) FROM uni_lessons WHERE course_id = c.id AND is_published = true) AS lesson_count,
  (SELECT COUNT(*) FROM uni_assessments WHERE course_id = c.id AND is_active = true) AS assessment_count,
  (SELECT COUNT(*) FROM uni_course_objectives WHERE course_id = c.id) AS objective_count
FROM uni_courses c
WHERE c.slug = 'hcmg-u-test-course';
