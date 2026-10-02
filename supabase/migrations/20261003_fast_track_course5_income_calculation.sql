-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Fast Track Course 5: Income Calculation and Qualification
-- Status: DRAFT — pending HCMG review before publication
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_course_id   uuid := gen_random_uuid();
  v_admin_id    uuid := '736a599a-492a-4585-b845-74b264d0ac9e';
  v_mod_id      uuid := gen_random_uuid();
  v_assessment_id uuid := gen_random_uuid();
  v_l1  uuid := gen_random_uuid();
  v_l2  uuid := gen_random_uuid();
  v_l3  uuid := gen_random_uuid();
  v_l4  uuid := gen_random_uuid();
  v_l5  uuid := gen_random_uuid();
  v_l6  uuid := gen_random_uuid();
  v_l7  uuid := gen_random_uuid();
BEGIN

DELETE FROM uni_courses WHERE slug = 'fast-track-income-calculation';

INSERT INTO uni_courses (id, slug, title, short_description, description, category, difficulty, duration_label, pill_color, is_required, is_published, sort_order, content_status, audience, instructor_name, completion_rules, created_by)
VALUES (v_course_id, 'fast-track-income-calculation', 'Income Calculation and Qualification',
  'Understand income types and documentation — without independently declaring income eligible.',
  E'This course teaches loan officers to identify income sources, understand documentation requirements, and coordinate review — without prematurely treating borrower-reported income as verified qualifying income.\n\nThis course does not replace investor guidelines, HCMG underwriting policy, or direction from operations.',
  'operations', 'beginner', '45–55 min', 'blue', true, false, 50, 'draft',
  'New loan officers', 'Darius James',
  '{"require_all_lessons": true, "require_assessment": true, "passing_score": 80}',
  v_admin_id);

INSERT INTO uni_course_objectives (id, course_id, objective, sort_order) VALUES
  (gen_random_uuid(), v_course_id, 'Distinguish between income a borrower receives and income that may be used to qualify', 1),
  (gen_random_uuid(), v_course_id, 'Identify documentation requirements for salary, hourly, variable, and self-employment income', 2),
  (gen_random_uuid(), v_course_id, 'Recognize income red flags and apply the correct escalation process', 3),
  (gen_random_uuid(), v_course_id, 'Perform a preliminary income arithmetic calculation and label it correctly', 4),
  (gen_random_uuid(), v_course_id, 'Explain why one income formula does not apply to every program', 5);

INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active)
VALUES (v_mod_id, v_course_id, 'Income Calculation and Qualification', 'Income types, documentation, red flags, and the boundary between arithmetic and an underwriting decision.', 0, true);

-- Lesson 1
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1, v_course_id, v_mod_id,
  'Income received is not automatically qualifying income',
  'The critical distinction between what a borrower earns and what may be used to qualify — and why the documentation and review process determines the answer.',
  'video', 1, 1, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 1\n'
  '  Title: Income received is not automatically qualifying income\n'
  '  Speaker: Darius James, Chief Lending Officer\n'
  '  ⚠ DRAFT — pending HCMG review\n'
  '═══════════════════════════════════════════════════════\n\n'
  'One of the most important distinctions in mortgage lending is the difference between income a borrower receives and income that may be used to qualify.\n\n'
  'A borrower may receive salary, hourly wages, overtime, commission, bonus, self-employment income, retirement income, rental income, or another source. Each source may have different documentation and analysis requirements.\n\n'
  'The loan officer should not take a number from a conversation and automatically enter it as qualifying income. The source, amount, history, stability, and expected continuance may all matter.\n\n'
  'Fannie Mae''s guidance, for example, describes stable and predictable income as income with a documented history of receipt and a reasonable expectation of continuance. That is a Fannie Mae standard, not a universal statement that every program uses identical rules.\n\n'
  'Your role is to identify the income source, collect the required information through approved channels, and ensure the appropriate reviewer can understand how the income was derived.\n\n'
  '──────────────────────────────────────────────────────\n'
  'COMPANION ARTICLE — Income types overview\n'
  '──────────────────────────────────────────────────────\n\n'
  'Each income source may have different documentation requirements.\n\n'
  'Salary: typically documented through paystubs, W-2s, and employer verification.\n\n'
  'Hourly: rate and hours must be understood; variable hours require additional analysis.\n\n'
  'Overtime and bonus: history and continuance are relevant; do not assume last month''s amount qualifies.\n\n'
  'Commission: documentation and history requirements may vary by program.\n\n'
  'Self-employment: tax returns and business analysis; revenue is not personal qualifying income.\n\n'
  'Rental income: documentation and vacancy factors may apply under applicable program rules.\n\n'
  'Retirement and Social Security: continuance and documentation requirements vary.\n\n'
  'For every source: identify it, collect documentation through approved channels, and route for review.\n\n'
  'Do not apply a single formula to every income type.');

-- Lesson 2
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2, v_course_id, v_mod_id,
  'Salary and hourly income',
  'How to identify pay structure, use arithmetic to understand a reported amount, and avoid treating a preliminary calculation as a final income determination.',
  'video', 2, 2, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 2\n'
  '  Title: Salary and hourly income\n'
  '  Speaker: Darius James\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Salary and hourly income may look straightforward, but you still need to understand the pay structure.\n\n'
  'For a salaried borrower, clarify the stated annual or periodic salary and identify whether the amount is changing. For an hourly borrower, understand the hourly rate and the hours worked. If hours vary, do not assume the borrower works the same schedule every week.\n\n'
  'A simple arithmetic conversion can help you understand the reported amount, but it does not establish qualifying income.\n\n'
  'For example, an hourly rate multiplied by reported hours can produce an estimated gross amount for a pay period. The applicable calculation must follow the program and documentation requirements.\n\n'
  'If paystubs, year-to-date earnings, or employer information do not align, do not choose the number you prefer. Identify the discrepancy and route it for review.');

-- Lesson 3
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3, v_course_id, v_mod_id,
  'Variable income',
  'Overtime, commission, and bonus income — why history and continuance matter and why last month''s amount is not automatically qualifying.',
  'video', 3, 3, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 3\n'
  '  Title: Variable income\n'
  '  Speaker: Darius James\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Variable income includes sources such as overtime, commission, bonus, or fluctuating hours.\n\n'
  'The important question is not simply how much the borrower received last month. The question is what the applicable program allows the lender to use, based on the history, documentation, and likelihood of continuance.\n\n'
  'A borrower may have earned a large bonus last year. That does not automatically mean the same amount can be used going forward. A borrower may have substantial overtime, but the file still needs the required analysis.\n\n'
  'Do not promise that variable income will count. Collect the required records and ask the appropriate reviewer to determine the treatment.');

-- Lesson 4
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4, v_course_id, v_mod_id,
  'Self-employment and other income',
  'Why business revenue is not the same as personal qualifying income — and how to approach rental, retirement, and other income sources.',
  'video', 4, 4, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 4\n'
  '  Title: Self-employment and other income\n'
  '  Speaker: Darius James\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Self-employment income requires careful analysis because business revenue is not the same as personal qualifying income.\n\n'
  'A business may have substantial deposits and still have expenses, obligations, or other factors that affect the amount available for qualification. Tax returns and other records may be used according to the applicable program requirements.\n\n'
  'Other income sources — such as retirement, Social Security, rental, support, or investment income — may have their own documentation and continuance rules.\n\n'
  'Do not apply one income formula to every source. Identify the source and use the correct current guide for the specific program.');

-- Lesson 5
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5, v_course_id, v_mod_id,
  'Income red flags and escalation',
  'How to recognize inconsistencies in income documentation and escalate correctly — without coaching the borrower or altering the file.',
  'video', 5, 5, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 5\n'
  '  Title: Income red flags and escalation\n'
  '  Speaker: Astrine Covington, President\n'
  '═══════════════════════════════════════════════════════\n\n'
  'When documents do not agree, stop and identify the issue.\n\n'
  'Examples include a paystub that does not align with the application, a change in employer, a gap in employment, unexplained variation in earnings, business income that differs from the borrower''s description, or a source that may not continue.\n\n'
  'A discrepancy is not automatically evidence of wrongdoing. It is a reason to ask questions and follow the review process.\n\n'
  'Keep your communication factual and respectful. Do not coach the borrower to change an answer to make the file appear stronger. Do not alter information without a documented basis and the required process.\n\n'
  '──────────────────────────────────────────────────────\n'
  'WORKED TRAINING EXAMPLE\n'
  '──────────────────────────────────────────────────────\n\n'
  'A fictional borrower reports:\n\n'
  'Hourly rate: $30\n'
  'Typical hours: 40 per week\n\n'
  'Simple gross arithmetic:\n'
  '$30 × 40 hours × 52 weeks ÷ 12 months = $5,200 average monthly gross\n\n'
  'Training result: $5,200 average monthly gross based on the stated assumptions.\n\n'
  'Not established: Whether the borrower''s actual schedule, documentation, income history, and applicable program requirements support that amount for qualification.\n\n'
  'This is a training calculation only. It is not a substitute for the approved qualification process.');

-- Inline KCs on lesson 5
INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l5, v_course_id, 'Is business revenue automatically personal qualifying income?', 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'Business revenue may reflect gross receipts before expenses; qualifying income is determined through the applicable program requirements and documentation.', 1),
(v_l5, v_course_id, 'Can a borrower''s reported monthly income be entered as verified without review?', 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'Reported income must be documented and reviewed under the applicable program before it can be treated as qualifying income.', 2),
(v_l5, v_course_id, 'Does one month of overtime automatically establish qualifying overtime income?', 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'Variable income such as overtime typically requires a history of receipt and analysis under the applicable program requirements.', 3),
(v_l5, v_course_id, 'What should you do when pay documents conflict?', 'multiple_choice',
 '[{"label":"Use the higher amount","is_correct":false},{"label":"Use the lower amount","is_correct":false},{"label":"Identify and route the discrepancy for review","is_correct":true},{"label":"Average the two amounts","is_correct":false}]',
 'Conflicting documents must be surfaced and reviewed — not resolved by the loan officer choosing one version.', 4),
(v_l5, v_course_id, 'Do all income types use the same documentation method?', 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'Different income sources — salary, overtime, self-employment, rental, retirement — may have different documentation and analysis requirements.', 5);

-- Lesson 6 — Final Quiz (knowledge_check)
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6, v_course_id, v_mod_id,
  'Income Calculation — Final Quiz',
  'Eight questions covering all five lessons. Passing score: 80%.',
  'knowledge_check', 6, 6, true, 'quiz_pass', 80, 720, '12 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l6, v_course_id, 'What is the difference between received income and qualifying income?',
 'multiple_choice',
 '[{"label":"They are the same thing","is_correct":false},{"label":"Received income is money the borrower receives; qualifying income is the amount determined under applicable requirements and documentation","is_correct":true},{"label":"Qualifying income is always higher","is_correct":false},{"label":"Received income is only salary","is_correct":false}]',
 'Received income is what the borrower earns; qualifying income is what can be used under the applicable program after documentation and review.', 1),
(v_l6, v_course_id, 'A borrower reports $30 per hour and 40 hours per week. What does the simple annualized calculation produce before review?',
 'multiple_choice',
 '[{"label":"$48,000 annually / $4,000 monthly","is_correct":false},{"label":"$62,400 annually / $5,200 monthly","is_correct":true},{"label":"$72,000 annually / $6,000 monthly","is_correct":false},{"label":"$36,000 annually / $3,000 monthly","is_correct":false}]',
 '$30 × 40 × 52 = $62,400 per year; $62,400 ÷ 12 = $5,200 per month. This is an arithmetic result only, not a qualifying income determination.', 2),
(v_l6, v_course_id, 'Does that annualized calculation establish qualifying income?',
 'multiple_choice',
 '[{"label":"Yes, if the borrower has worked there more than two years","is_correct":false},{"label":"Yes, always","is_correct":false},{"label":"No — it is a preliminary arithmetic result, not a qualifying income determination","is_correct":true},{"label":"Yes, if it matches the paystub","is_correct":false}]',
 'The arithmetic result tells you the reported amount. Qualifying income requires documentation, history review, and the applicable program analysis.', 3),
(v_l6, v_course_id, 'What should happen when income documents conflict?',
 'multiple_choice',
 '[{"label":"Use the most recent document","is_correct":false},{"label":"Use the most favorable amount","is_correct":false},{"label":"Document the discrepancy and route it for review","is_correct":true},{"label":"Ask the borrower which is correct and enter that","is_correct":false}]',
 'Conflicting documents must be identified, documented, and reviewed — not resolved by the loan officer choosing a preferred version.', 4),
(v_l6, v_course_id, 'Is self-employment revenue equivalent to qualifying personal income?',
 'multiple_choice',
 '[{"label":"Yes, if the business is profitable","is_correct":false},{"label":"Yes, if tax returns are provided","is_correct":false},{"label":"No — business revenue must be analyzed under applicable program requirements to determine qualifying income","is_correct":true},{"label":"Yes, after two years of self-employment","is_correct":false}]',
 'Business revenue reflects gross receipts; qualifying income is derived through analysis of tax returns and applicable program requirements.', 5),
(v_l6, v_course_id, 'What should a loan officer do with variable income?',
 'multiple_choice',
 '[{"label":"Enter the last month''s amount as qualifying","is_correct":false},{"label":"Average the last two months","is_correct":false},{"label":"Identify the source, gather required documentation, and follow the applicable review process","is_correct":true},{"label":"Ignore it if the base salary qualifies","is_correct":false}]',
 'Variable income requires history, documentation, and program-specific analysis before it can be treated as qualifying income.', 6),
(v_l6, v_course_id, 'Can Fannie Mae rules be applied automatically to every loan program?',
 'multiple_choice',
 '[{"label":"Yes","is_correct":false},{"label":"Yes, for all conventional programs","is_correct":false},{"label":"No — program requirements vary and must be checked against the applicable current guide","is_correct":true},{"label":"Yes, if the loan is sold to Fannie Mae","is_correct":false}]',
 'Different programs — FHA, VA, conventional, non-QM, and others — may have different income documentation and analysis requirements.', 7),
(v_l6, v_course_id, 'What is the professional standard when income is uncertain?',
 'multiple_choice',
 '[{"label":"Estimate and disclose later","is_correct":false},{"label":"Use the highest defensible amount","is_correct":false},{"label":"Do not guess or promise; escalate and communicate accurately","is_correct":true},{"label":"Wait until closing to resolve","is_correct":false}]',
 'When income is uncertain, the professional standard is to be accurate — not to promise a favorable result and fix it later.', 8);

-- Formal assessment record
INSERT INTO uni_assessments (id, course_id, lesson_id, title, description, assessment_type, passing_pct, is_required, is_active, max_attempts, randomize_questions, show_answers_after, instructions)
VALUES (v_assessment_id, v_course_id, v_l6,
  'Income Calculation — Final Quiz',
  'Eight questions covering income types, documentation, red flags, and qualification principles.',
  'certification_exam', 80, true, true, NULL, false, true,
  'Answer all 8 questions. Passing score: 80%. You may retake this assessment as many times as needed.');

INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order)
SELECT v_assessment_id, q.id, q.sort_order FROM uni_quiz_questions q WHERE q.lesson_id = v_l6 ORDER BY q.sort_order;

INSERT INTO uni_certificate_config (course_id, issue_certificate, renewal_mode, include_verification, trigger_assessment_id)
VALUES (v_course_id, true, 'manual', true, v_assessment_id);

-- Lesson 7 — Job Aid
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l7, v_course_id, v_mod_id,
  'Income-Source Intake Sheet — Job Aid',
  'Reference worksheet for documenting income sources during the discovery and application stages.',
  'text', 7, 7, true, 'watch_pct', 80, 300, '5 min',
  E'## Income-Source Intake Sheet\n\n'
  'For each income source, complete one row:\n\n'
  '| Source | Pay structure | Reported amount | Documentation received | Discrepancy (Y/N) | Applicable program | Assigned reviewer | Status |\n'
  '|--------|--------------|----------------|----------------------|------------------|-------------------|-------------------|--------|\n'
  '| Example: Hourly employment | $30/hr, 40 hrs/wk | $5,200/mo (arithmetic) | Paystubs, W-2 requested | No | Confirm with reviewer | Processor | Pending review |\n\n'
  '**Instructions:**\n\n'
  '- Record what the borrower reports. Do not enter reported amounts as verified.\n'
  '- Identify each income source separately.\n'
  '- Flag any discrepancy between what the borrower reported and what documentation shows.\n'
  '- Route outstanding items to the appropriate reviewer.\n\n'
  '**Never:**\n\n'
  '- Enter a borrower''s reported number as verified qualifying income without review.\n'
  '- Coach the borrower to change an answer.\n'
  '- Apply one income formula to every income type.\n'
  '- Promise that a variable income source will qualify.\n\n'
  '**Income types that require separate analysis:** salary, hourly, overtime, commission, bonus, self-employment, rental, retirement, Social Security, support, investment.\n\n'
  'This job aid is a training reference only. Follow HCMG''s current approved procedures and applicable program requirements.');

END $$;

SELECT c.title, c.slug, c.content_status, c.is_published,
       COUNT(DISTINCT l.id) AS lessons,
       COUNT(DISTINCT q.id) AS questions
FROM uni_courses c
LEFT JOIN uni_lessons l ON l.course_id = c.id
LEFT JOIN uni_quiz_questions q ON q.course_id = c.id
WHERE c.slug = 'fast-track-income-calculation'
GROUP BY c.id, c.title, c.slug, c.content_status, c.is_published;
