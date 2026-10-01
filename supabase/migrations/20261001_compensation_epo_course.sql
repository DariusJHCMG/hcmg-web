-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Loan Officer Compensation & EPO Training
-- Source: HCMG_University_Compensation_EPO_HeyGen_Course.pdf (2026-09-30)
--
-- Structure:
--   Course: Loan Officer Compensation & EPO Training
--   1 module (no sub-sections)
--   10 lessons (VIDEO 1–8 + Final Recap + Certification Quiz)
--   10-question certification quiz on the final knowledge-check lesson
--
-- Idempotent: deletes prior run by slug before re-inserting.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_course_id  uuid := gen_random_uuid();
  v_admin_id   uuid := '736a599a-492a-4585-b845-74b264d0ac9e';
  v_mod_id     uuid := gen_random_uuid();

  -- lesson IDs
  v_l1  uuid := gen_random_uuid();  -- Welcome to HCMG Compensation
  v_l2  uuid := gen_random_uuid();  -- Understanding Basis Points
  v_l3  uuid := gen_random_uuid();  -- HCMG Compensation Tiers
  v_l4  uuid := gen_random_uuid();  -- Let's Calculate a Commission
  v_l5  uuid := gen_random_uuid();  -- When Do I Get Paid?
  v_l6  uuid := gen_random_uuid();  -- What Is an EPO?
  v_l7  uuid := gen_random_uuid();  -- How an EPO Can Affect Compensation
  v_l8  uuid := gen_random_uuid();  -- Important Compensation Rules
  v_l9  uuid := gen_random_uuid();  -- The HCMG LO Mindset (final video)
  v_l10 uuid := gen_random_uuid();  -- Certification Quiz (knowledge check)

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════
-- IDEMPOTENT: remove any previous run
-- ═══════════════════════════════════════════════════════════════════════════
DELETE FROM uni_courses WHERE slug = 'lo-compensation-epo';

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
  'lo-compensation-epo',
  'Loan Officer Compensation & EPO Training',
  'Know your pay. Understand EPO. Protect your commissions.',
  E'This course breaks down how HCMG Loan Officers get paid — from basis points and compensation tiers to per-file fees, payroll dates, and the licensing rules that govern origination.\n\n'
  'More importantly, it explains Early Payoff (EPO): what it is, why it matters, and how an early payoff during the applicable investor period can affect a commission that has already been advanced.\n\n'
  'Based on the HCMG Loan Officer Employment Agreement effective July 1, 2026. Your signed agreement and current HCMG written policies govern actual compensation. This course is educational.',
  'operations',
  'beginner',
  '25–35 min',
  'gold',
  true,
  true,
  20,
  'published',
  'New and Existing HCMG Loan Officers',
  'Harry',
  '{"require_all_lessons": true, "require_assessment": true, "passing_score": 80}',
  v_admin_id
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LEARNING OBJECTIVES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_course_objectives (id, course_id, objective, sort_order) VALUES
  (gen_random_uuid(), v_course_id, 'Define basis points and convert them to a percentage', 1),
  (gen_random_uuid(), v_course_id, 'Identify the four HCMG compensation tiers by funded loan count', 2),
  (gen_random_uuid(), v_course_id, 'Calculate a gross commission and apply standard per-file fees', 3),
  (gen_random_uuid(), v_course_id, 'State the payroll schedule for HCMG commissions', 4),
  (gen_random_uuid(), v_course_id, 'Explain the difference between an advanced commission and an earned commission', 5),
  (gen_random_uuid(), v_course_id, 'Define EPO and explain why it matters to both HCMG and the Loan Officer', 6),
  (gen_random_uuid(), v_course_id, 'Describe how an EPO-related adjustment can affect unpaid commissions', 7),
  (gen_random_uuid(), v_course_id, 'Explain the Internal Referral Program (IRP) and its compensation split', 8),
  (gen_random_uuid(), v_course_id, 'State the dual-compensation and YSP rules', 9),
  (gen_random_uuid(), v_course_id, 'Understand licensing requirements for origination', 10);

-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active) VALUES
  (v_mod_id, v_course_id,
   'Loan Officer Compensation & EPO',
   'Basis points, compensation tiers, commission calculation, payroll dates, EPO rules, licensing, and key compliance requirements.',
   0, true);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 1 — Welcome to HCMG Compensation (VIDEO)
-- 🎬 HEYGEN VIDEO: attach URL after production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l1, v_course_id, v_mod_id,
  'Welcome to HCMG Compensation',
  'A course overview — what you will learn about basis points, compensation tiers, fees, payroll, licensing, and EPO.',
  'video', 1, 1, true, 'watch_pct', 80, 120, '2 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 1\n'
  '  Title: Welcome to HCMG Compensation\n'
  '  Speaker: Harry (avatar)\n'
  '  Background: HCMG branded\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Welcome to HCMG University.\n\n'
  'In this course, we''re going to break down one of the most important subjects for every HCMG Loan Officer: how you get paid.\n\n'
  'We''re going to explain basis points, compensation tiers, HCMG fees, payroll dates, licensing requirements, and one of the most important concepts every Loan Officer needs to understand: EPO — Early Payoff.\n\n'
  'By the end of this course, you should understand how your compensation works from the time you originate a loan through funding and commission payment.\n\n'
  'Remember: your employment agreement and HCMG''s current written policies control your actual compensation. This training is designed to help you understand those policies.\n\n'
  'Let''s get started.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 2 — Understanding Basis Points (VIDEO)
-- 🎬 HEYGEN VIDEO: attach URL after production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l2, v_course_id, v_mod_id,
  'Understanding Basis Points',
  'What basis points are, how to convert them to percentages, and how they translate to a gross commission dollar amount.',
  'video', 2, 2, true, 'watch_pct', 80, 150, '2.5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 2\n'
  '  Title: Understanding Basis Points\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen visuals: BPS conversion table\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Mortgage Loan Officer compensation is commonly expressed in basis points, also called BPS.\n\n'
  'One hundred basis points equals one percent.\n\n'
  '100 BPS = 1.00%\n'
  '150 BPS = 1.50%\n'
  '175 BPS = 1.75%\n'
  '200 BPS = 2.00%\n\n'
  'Here''s a simple example. If the loan amount is $400,000 and your compensation is 100 basis points, $400,000 multiplied by 1 percent equals $4,000 gross commission before applicable fees, deductions and payroll withholding.\n\n'
  'At 150 basis points, the same $400,000 loan would produce $6,000 before applicable fees, deductions and withholding. At 175 basis points, it would be $7,000.\n\n'
  'Understanding basis points makes understanding your HCMG compensation plan much easier.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l2, v_course_id,
  'How many basis points equal 1%?',
  'multiple_choice',
  '[{"label":"10","is_correct":false},{"label":"50","is_correct":false},{"label":"100","is_correct":true},{"label":"1000","is_correct":false}]',
  '100 basis points (BPS) = 1.00%. This conversion is foundational to reading any HCMG compensation schedule.',
  1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 3 — HCMG Compensation Tiers (VIDEO)
-- 🎬 HEYGEN VIDEO: attach URL after production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l3, v_course_id, v_mod_id,
  'HCMG Compensation Tiers',
  'The four quarterly production tiers — 1–11, 12–24, 25–35, 36+ funded loans — and the BPS rate and standard fees associated with each.',
  'video', 3, 3, true, 'watch_pct', 80, 180, '3 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 3\n'
  '  Title: HCMG Compensation Tiers\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen visual: compensation tier table\n'
  '═══════════════════════════════════════════════════════\n\n'
  'At HCMG, the compensation schedule in the Loan Officer Employment Agreement is based on the number of funded transactions during the quarter.\n\n'
  '1 through 11 funded loans: 100 basis points.\n\n'
  '12 through 24 funded loans: 150 basis points.\n\n'
  '25 through 35 funded loans: 175 basis points.\n\n'
  '36 or more funded loans: up to 200 basis points.\n\n'
  'For qualifying Branch Managers and Team Leads at 36 or more loans, compensation is governed by the applicable Branch Manager or Team Lead Compensation Agreement.\n\n'
  'The standard agreement also identifies a $395 processing fee and a $95 post-audit fee associated with each tier. That''s a total of $490 per file.\n\n'
  'Your individual compensation agreement and current HCMG policies should always be reviewed to determine the compensation applicable to you.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l3, v_course_id,
  'What is the compensation rate stated in the HCMG agreement for 12–24 funded loans in a quarter?',
  'multiple_choice',
  '[{"label":"100 BPS","is_correct":false},{"label":"150 BPS","is_correct":true},{"label":"175 BPS","is_correct":false},{"label":"200 BPS","is_correct":false}]',
  'The 12–24 funded-loans tier pays 150 BPS (1.50%) under the standard HCMG Loan Officer Employment Agreement.',
  1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 4 — Let's Calculate a Commission (VIDEO)
-- 🎬 HEYGEN VIDEO: attach URL after production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l4, v_course_id, v_mod_id,
  'Let''s Calculate a Commission',
  'A worked example: take a loan amount, apply a BPS rate, subtract the $490 in standard fees, and arrive at the pre-tax/pre-deduction amount.',
  'video', 4, 4, true, 'watch_pct', 80, 180, '3 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 4\n'
  '  Title: Let''s Calculate a Commission\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen visual: commission calculation table\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Let''s put this into real numbers.\n\n'
  'Suppose you close a $350,000 mortgage and your compensation tier is 150 basis points. That''s 1.5 percent.\n\n'
  'Multiply $350,000 by 1.5 percent. Your gross calculated commission is $5,250.\n\n'
  'Using the fees identified in the standard agreement, subtract the $395 processing fee and $95 post-audit fee, or $490 total.\n\n'
  '$5,250 minus $490 equals $4,760 before other applicable deductions and payroll taxes or withholding.\n\n'
  'The agreement also permits certain employer-incurred expenses to be deducted from commissions, including specified outstanding third-party invoices and other listed fees. This illustration is therefore not guaranteed take-home pay.\n\n'
  'On-screen reference table:\n'
  '100 BPS on $350,000 → $3,500 gross → $3,010 after $490 fees\n'
  '150 BPS on $350,000 → $5,250 gross → $4,760 after $490 fees\n'
  '175 BPS on $350,000 → $6,125 gross → $5,635 after $490 fees\n'
  '200 BPS on $350,000 → $7,000 gross → $6,510 after $490 fees'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l4, v_course_id,
  'What are the standard processing and post-audit fees identified in the HCMG agreement?',
  'multiple_choice',
  '[{"label":"$395 processing + $95 post-audit = $490 total","is_correct":true},{"label":"$250 processing + $95 post-audit = $345 total","is_correct":false},{"label":"$495 flat fee","is_correct":false},{"label":"No fees apply","is_correct":false}]',
  'The standard HCMG agreement identifies a $395 processing fee and a $95 post-audit fee per file — a combined $490.',
  1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 5 — When Do I Get Paid? (VIDEO)
-- 🎬 HEYGEN VIDEO: attach URL after production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l5, v_course_id, v_mod_id,
  'When Do I Get Paid?',
  'Payroll dates, the difference between funding and earning a commission, and why an advanced commission is not the same as a fully earned one.',
  'video', 5, 5, true, 'watch_pct', 80, 180, '3 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 5\n'
  '  Title: When Do I Get Paid?\n'
  '  Speaker: Harry (avatar)\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Now let''s talk about payday.\n\n'
  'Under the HCMG agreement, commissions are paid on the 10th and 25th of each month for loans funded during the applicable prior period.\n\n'
  'But there''s something important you need to understand. Funding a loan and ultimately earning a commission are not necessarily the same thing under the agreement.\n\n'
  'HCMG may advance a commission after a loan closes and funds. However, the agreement states that commissions are considered earned and payable once certain requirements are satisfied, including secondary-market sale and expiration of applicable early-payment-default or Early Payoff periods.\n\n'
  'If HCMG advances a commission and the commission later becomes unearnable because of an early payment default or payoff, the agreement provides that the advanced amount can be subtracted in calculating other commissions.\n\n'
  'And that brings us to an extremely important subject: EPO.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l5, v_course_id,
  'On what dates does the HCMG agreement state commissions are paid?',
  'multiple_choice',
  '[{"label":"1st and 15th of each month","is_correct":false},{"label":"10th and 25th of each month","is_correct":true},{"label":"Last day of each month","is_correct":false},{"label":"30 days after funding","is_correct":false}]',
  'The HCMG agreement specifies the 10th and 25th of each month as commission pay dates for loans funded in the prior applicable period.',
  1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 6 — What Is an EPO? (VIDEO)
-- 🎬 HEYGEN VIDEO: attach URL after production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l6, v_course_id, v_mod_id,
  'What Is an EPO?',
  'The definition of Early Payoff (EPO), why investors impose EPO periods, and why EPO matters to both HCMG and the Loan Officer.',
  'video', 6, 6, true, 'watch_pct', 80, 180, '3 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 6\n'
  '  Title: What Is an EPO?\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen key phrase: "EPO = Early Payoff"\n'
  '═══════════════════════════════════════════════════════\n\n'
  'EPO stands for Early Payoff.\n\n'
  'An EPO occurs when a mortgage loan is paid off during an investor''s applicable early-payoff period.\n\n'
  'Why does that matter? When HCMG originates and closes a mortgage, compensation and economics associated with that transaction may depend on the loan remaining outstanding for the applicable period.\n\n'
  'If the borrower pays the loan off too early, HCMG can potentially experience a financial loss or other compensation consequence associated with that loan.\n\n'
  'That''s why EPO matters to both HCMG and the Loan Officer.\n\n'
  'The HCMG agreement specifically identifies early payoffs, early payment defaults, repurchases, and unsalable loans among circumstances that can affect compensation.\n\n'
  'Important: The agreement used for this course does not specify one universal number of months for every EPO. The applicable investor and HCMG written policy should be consulted for the specific EPO period.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l6, v_course_id,
  'What does EPO stand for?',
  'multiple_choice',
  '[{"label":"Early Payment Option","is_correct":false},{"label":"Early Payoff","is_correct":true},{"label":"Extended Processing Order","is_correct":false},{"label":"Employee Payroll Offset","is_correct":false}]',
  'EPO = Early Payoff. It occurs when a borrower pays off a mortgage during the investor''s applicable early-payoff period.',
  1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 7 — How an EPO Can Affect Compensation (VIDEO)
-- 🎬 HEYGEN VIDEO: attach URL after production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l7, v_course_id, v_mod_id,
  'How an EPO Can Affect Compensation',
  'A step-by-step example of the EPO compensation sequence — from funding and advance to EPO event and commission adjustment.',
  'video', 7, 7, true, 'watch_pct', 80, 210, '3.5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 7\n'
  '  Title: How an EPO Can Affect Compensation\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen visual: EPO sequence diagram\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Let''s look at an example.\n\n'
  'Imagine you originate a mortgage that successfully closes and funds. HCMG advances your commission through payroll.\n\n'
  'Later, the borrower pays the mortgage off during the applicable EPO period.\n\n'
  'If that payoff causes the previously advanced commission to become unearnable under the agreement, HCMG may account for that amount against commissions that have not yet been paid.\n\n'
  'Think about the sequence this way:\n\n'
  '1. Loan closes and funds.\n'
  '2. Commission may be advanced.\n'
  '3. Borrower pays the loan off during the applicable EPO period.\n'
  '4. HCMG determines whether an EPO-related loss or adjustment applies.\n'
  '5. If applicable under the agreement, the advanced commission may be accounted for against unpaid commissions.\n\n'
  'The agreement also provides for minimum-production requirements following certain losses involving buybacks, repricing, early payoffs, or unpaid borrower fees before additional commissions become payable.\n\n'
  'That''s why an advanced commission is not necessarily the same thing as a commission that can never be subject to later adjustment.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l7, v_course_id,
  'If a borrower pays off a loan during the EPO period and the advanced commission becomes unearnable, what does the HCMG agreement allow?',
  'multiple_choice',
  '[{"label":"Nothing — the advanced commission is always final","is_correct":false},{"label":"HCMG may account for the advanced amount against future unpaid commissions","is_correct":true},{"label":"The Loan Officer must immediately write a personal check","is_correct":false},{"label":"The commission is automatically reversed the same day","is_correct":false}]',
  'Under the agreement, an advanced commission that becomes unearnable due to an EPO may be accounted for (offset) against commissions not yet paid to the Loan Officer.',
  1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 8 — Important Compensation Rules (VIDEO)
-- 🎬 HEYGEN VIDEO: attach URL after production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l8, v_course_id, v_mod_id,
  'Important Compensation Rules',
  'Licensing requirements, the Internal Referral Program (IRP), dual-compensation prohibition, YSP rules, and compensation-change documentation.',
  'video', 8, 8, true, 'watch_pct', 80, 210, '3.5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 8\n'
  '  Title: Important Compensation Rules\n'
  '  Speaker: Harry (avatar)\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Before completing this course, let''s cover several important HCMG compensation rules.\n\n'
  'First, licensing matters. You must be properly licensed to originate in the applicable state. If you aren''t licensed in that state, HCMG''s Internal Referral Program may allow you to refer the transaction to an appropriately licensed HCMG Loan Officer.\n\n'
  'The agreement states that an IRP transaction pays the referring Loan Officer 75 basis points and the licensed Loan Officer 75 basis points.\n\n'
  'Second, there is no dual compensation. A Loan Officer may not receive compensation from both the borrower and lender on the same transaction.\n\n'
  'Third, lender-paid compensation or YSP is paid to HCMG rather than directly to the Loan Officer or affiliate.\n\n'
  'Finally, compensation exceptions cannot be based on loan terms and compensation changes must be documented and approved as required by HCMG policy.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l8, v_course_id,
  'Under the HCMG Internal Referral Program (IRP), how is compensation split?',
  'multiple_choice',
  '[{"label":"100 BPS to the referring LO, 0 to the licensed LO","is_correct":false},{"label":"75 BPS to the referring LO and 75 BPS to the licensed LO","is_correct":true},{"label":"50 BPS to each LO","is_correct":false},{"label":"150 BPS split evenly at management discretion","is_correct":false}]',
  'The HCMG IRP pays 75 BPS to the referring Loan Officer and 75 BPS to the licensed Loan Officer who handles the transaction.',
  1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 9 — The HCMG LO Mindset (FINAL VIDEO)
-- 🎬 HEYGEN VIDEO: attach URL after production
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l9, v_course_id, v_mod_id,
  'The HCMG LO Mindset',
  'A closing recap of the seven things every HCMG LO must know about compensation — and the mindset required to own the full loan lifecycle.',
  'video', 9, 9, true, 'watch_pct', 80, 180, '3 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 9 (Final Video)\n'
  '  Title: The HCMG LO Mindset\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen: recap bullet list\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Congratulations. You''ve completed HCMG University''s course on Loan Officer Compensation and EPOs.\n\n'
  'Here are the key things we want you to remember.\n\n'
  'Know your compensation tier.\n\n'
  'Know your basis points.\n\n'
  'Understand your per-file fees.\n\n'
  'Know your payroll schedule.\n\n'
  'Maintain the licenses required for the states where you originate.\n\n'
  'Understand the difference between an advanced commission and a commission that has satisfied all requirements under the agreement.\n\n'
  'Understand EPO exposure.\n\n'
  'A great HCMG Loan Officer doesn''t just know how to originate a loan. They understand the entire lifecycle of that loan — from application, to approval, to closing, to funding, to compensation, and ultimately to loan performance.\n\n'
  'Welcome to HCMG. Let''s build your business.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 10 — Certification Quiz (KNOWLEDGE CHECK)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l10, v_course_id, v_mod_id,
  'Compensation & EPO Certification Quiz',
  'Ten-question certification quiz. Passing score: 80%. Review your signed employment agreement and HCMG policies for authoritative compensation terms.',
  'knowledge_check', 10, 10, true, 'quiz_pass', 80, 600, '10 min',
  NULL
);

-- 10 certification quiz questions (from the PDF quiz section)
INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES

(v_l10, v_course_id,
 'How many basis points equal 1%?',
 'multiple_choice',
 '[{"label":"10","is_correct":false},{"label":"100","is_correct":true},{"label":"200","is_correct":false},{"label":"1000","is_correct":false}]',
 '100 BPS = 1.00%. This is the fundamental conversion for reading any compensation schedule expressed in basis points.',
 1),

(v_l10, v_course_id,
 'What is the compensation tier stated in the HCMG agreement for 12–24 funded loans per quarter?',
 'multiple_choice',
 '[{"label":"100 BPS","is_correct":false},{"label":"125 BPS","is_correct":false},{"label":"150 BPS","is_correct":true},{"label":"175 BPS","is_correct":false}]',
 '12–24 funded loans per quarter = 150 BPS (1.50%) under the standard HCMG Loan Officer Employment Agreement.',
 2),

(v_l10, v_course_id,
 'What does EPO stand for?',
 'multiple_choice',
 '[{"label":"Early Payment Option","is_correct":false},{"label":"Early Payoff","is_correct":true},{"label":"Extended Processing Order","is_correct":false},{"label":"Employee Payroll Offset","is_correct":false}]',
 'EPO = Early Payoff — when a borrower pays off a mortgage during the investor''s applicable early-payoff period.',
 3),

(v_l10, v_course_id,
 'What are the standard processing and post-audit fees identified in the HCMG agreement?',
 'multiple_choice',
 '[{"label":"$395 processing + $95 post-audit ($490 total)","is_correct":true},{"label":"$495 flat fee per file","is_correct":false},{"label":"$250 processing only","is_correct":false},{"label":"No standard fees apply","is_correct":false}]',
 'The standard agreement identifies $395 processing + $95 post-audit = $490 total per file.',
 4),

(v_l10, v_course_id,
 'On what dates does the HCMG agreement state commissions are paid?',
 'multiple_choice',
 '[{"label":"1st and 15th of each month","is_correct":false},{"label":"10th and 25th of each month","is_correct":true},{"label":"Last day of each month","is_correct":false},{"label":"30 days after funding","is_correct":false}]',
 'The HCMG agreement specifies commission payment on the 10th and 25th of each month.',
 5),

(v_l10, v_course_id,
 'Can a Loan Officer originate a loan in a state where they are not properly licensed?',
 'multiple_choice',
 '[{"label":"Yes, with manager approval","is_correct":false},{"label":"No — proper state licensing is required to originate in that state","is_correct":true},{"label":"Yes, as long as a licensed LO countersigns","is_correct":false},{"label":"Yes, within 90 days of submitting an application","is_correct":false}]',
 'A Loan Officer must be properly licensed in the applicable state. Unlicensed transactions may be handled through HCMG''s Internal Referral Program by a licensed LO.',
 6),

(v_l10, v_course_id,
 'What is HCMG''s Internal Referral Program (IRP)?',
 'multiple_choice',
 '[{"label":"A program that allows borrowers to refer other borrowers for a reward","is_correct":false},{"label":"A program that allows an unlicensed-state LO to refer to a licensed HCMG LO, splitting compensation 75/75 BPS","is_correct":true},{"label":"A manager-approval process for large loan amounts","is_correct":false},{"label":"An accelerated payroll program for top producers","is_correct":false}]',
 'The HCMG IRP allows an LO without the applicable state license to refer the transaction to a licensed HCMG LO. Each receives 75 BPS under the agreement.',
 7),

(v_l10, v_course_id,
 'Can a Loan Officer receive compensation from both the borrower and the lender on the same transaction?',
 'multiple_choice',
 '[{"label":"Yes, with written disclosure","is_correct":false},{"label":"Yes, if the borrower consents","is_correct":false},{"label":"No — dual compensation is prohibited","is_correct":true},{"label":"Yes, for refinance transactions only","is_correct":false}]',
 'Dual compensation — receiving payment from both the borrower and the lender on a single transaction — is prohibited.',
 8),

(v_l10, v_course_id,
 'Why can an advanced commission potentially be adjusted after funding?',
 'multiple_choice',
 '[{"label":"Because HCMG recalculates pay monthly","is_correct":false},{"label":"Because an advanced commission is not considered fully earned until applicable EPO periods expire and other requirements are met","is_correct":true},{"label":"Because all payroll is subject to a 90-day review window","is_correct":false},{"label":"Because basis points can change after closing","is_correct":false}]',
 'An advanced commission may become unearnable if the loan experiences an early payoff or default during the applicable period. The agreement permits HCMG to offset that amount against future commissions.',
 9),

(v_l10, v_course_id,
 'What should a Loan Officer do if they have a question or dispute regarding compensation?',
 'multiple_choice',
 '[{"label":"Post publicly on social media","is_correct":false},{"label":"Refer to their signed employment agreement and current HCMG written policies, and contact their manager or appropriate HCMG personnel","is_correct":true},{"label":"Stop originating loans until resolved","is_correct":false},{"label":"Submit a formal complaint to the CFPB immediately","is_correct":false}]',
 'Compensation questions should be resolved by reviewing the signed employment agreement and HCMG''s current written policies. Disputes should be escalated through proper HCMG channels.',
 10);


-- ═══════════════════════════════════════════════════════════════════════════
-- SUMMARY CHECK
-- ═══════════════════════════════════════════════════════════════════════════
SELECT
  c.title,
  c.slug,
  c.is_published,
  COUNT(l.id) AS lesson_count
FROM uni_courses c
LEFT JOIN uni_lessons l ON l.course_id = c.id
WHERE c.slug = 'lo-compensation-epo'
GROUP BY c.id, c.title, c.slug, c.is_published;

END $$;
