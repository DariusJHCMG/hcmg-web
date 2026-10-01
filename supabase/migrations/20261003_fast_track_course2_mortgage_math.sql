-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Fast Track Course 2: Mortgage Math for Loan Officers
--
-- Audience  : New loan officers
-- Duration  : 45–60 minutes
-- Required  : Yes
-- Pass score: 80%
-- Path      : New LO Fast Start (path_tag = 'start')
-- Certificate: Yes (existing HCMG U certificate workflow)
--
-- Structure:
--   1 module: "Mortgage Math for Loan Officers"
--   7 video lessons (L1–L7)
--   1 knowledge_check lesson (L8) — 10-question final quiz
--   1 text lesson (L9) — Formula Job Aid
--   2 inline quiz questions (L2 DTI check, L5 basis-points check)
--   1 uni_assessments record (certification_exam, linked to L8)
--   1 uni_certificate_config record
--
-- Idempotent: deletes prior run by slug before re-inserting.
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM uni_courses WHERE slug = 'fast-track-mortgage-math';

DO $$
DECLARE
  v_course_id     uuid := gen_random_uuid();
  v_admin_id      uuid := '736a599a-492a-4585-b845-74b264d0ac9e';
  v_assessment_id uuid := gen_random_uuid();
  v_mod_id        uuid := gen_random_uuid();

  -- Lesson IDs
  v_l1  uuid := gen_random_uuid();  -- The numbers behind a mortgage
  v_l2  uuid := gen_random_uuid();  -- Debt-to-income ratio
  v_l3  uuid := gen_random_uuid();  -- Loan-to-value ratio
  v_l4  uuid := gen_random_uuid();  -- PITI and the monthly housing payment
  v_l5  uuid := gen_random_uuid();  -- Basis points
  v_l6  uuid := gen_random_uuid();  -- Cash to close
  v_l7  uuid := gen_random_uuid();  -- Integrated scenario
  v_l8  uuid := gen_random_uuid();  -- Final Quiz (knowledge_check)
  v_l9  uuid := gen_random_uuid();  -- Formula Job Aid (text)

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════
-- COURSE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_courses (
  id, slug, title, short_description,
  category, difficulty, duration_label,
  pill_color, is_required, is_published, sort_order,
  content_status, audience, instructor_name,
  completion_rules, path_tag, created_by
) VALUES (
  v_course_id,
  'fast-track-mortgage-math',
  'Mortgage Math for Loan Officers',
  'Calculate DTI, LTV, PITI, basis points, and cash to close — and explain what each number means.',
  'operations',
  'beginner',
  '45–60 min',
  'blue',
  true,
  true,
  35,
  'draft',
  'New loan officers',
  'Darius James',
  '{"require_all_lessons": true, "require_assessment": true, "passing_score": 80}',
  'start',
  v_admin_id
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LEARNING OBJECTIVES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_course_objectives (id, course_id, objective, sort_order) VALUES
  (gen_random_uuid(), v_course_id, 'Explain what each mortgage math metric measures and what it does not establish', 1),
  (gen_random_uuid(), v_course_id, 'Calculate DTI using qualifying gross monthly income and qualifying monthly obligations', 2),
  (gen_random_uuid(), v_course_id, 'Calculate LTV using loan amount and applicable property value', 3),
  (gen_random_uuid(), v_course_id, 'Define PITI and identify what may or may not be included in a housing payment estimate', 4),
  (gen_random_uuid(), v_course_id, 'Convert basis points to percentage points', 5),
  (gen_random_uuid(), v_course_id, 'Identify the components of a cash-to-close estimate', 6),
  (gen_random_uuid(), v_course_id, 'Apply calculation discipline: label inputs, results, and limitations accurately', 7);

-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active) VALUES
  (v_mod_id, v_course_id,
   'Mortgage Math for Loan Officers',
   'DTI, LTV, PITI, basis points, cash to close, and an integrated scenario — plus the habit of labeling every number accurately.',
   1, true);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 1 — The numbers behind a mortgage (VIDEO)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l1, v_course_id, v_mod_id,
  'The numbers behind a mortgage',
  'An overview of the key mortgage math metrics — what each one measures, where it comes from, and why labeling your numbers matters.',
  'video', 1, 1, true, 'watch_pct', 80, 240, '4 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 1\n'
  '  Title: The numbers behind a mortgage\n'
  '  Presenter: Darius James, Chief Lending Officer\n'
  '  Suggested runtime: 3–4 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Mortgage math is not about memorizing numbers so you can impress a borrower. It is about understanding what a number represents, where it comes from, and what it can — and cannot — tell you.\n\n'
  'A mortgage transaction includes several calculations. Debt-to-income compares qualifying monthly debt obligations with qualifying gross monthly income. Loan-to-value compares the loan amount with the applicable property value. PITI describes principal, interest, taxes, and insurance. Basis points are a way to express small changes in percentages. Cash to close estimates the funds a borrower may need to complete the transaction.\n\n'
  'Each calculation answers a different question. DTI is not LTV. LTV is not a credit score. A payment estimate is not a final approval. And cash to close is not necessarily the same as the down payment.\n\n'
  'The most important habit is to label your numbers. Say whether something is borrower-reported, estimated, calculated from current inputs, or confirmed through the approved process.\n\n'
  'When an input changes, the result may change. If income, debt, property value, taxes, insurance, rate, or fees change, do not continue repeating an old estimate as if it were current.\n\n'
  'You do not need to make every underwriting decision yourself. You do need to understand the math well enough to recognize when a number does not make sense, explain the basic calculation, and ask the right person to review the file.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — Calculation discipline\n'
  '───────────────────────────────────────────────────────\n\n'
  'Every calculation should include:\n\n'
  '  • The inputs used.\n'
  '  • The date or source of those inputs.\n'
  '  • The formula.\n'
  '  • The result.\n'
  '  • Whether the result is an estimate or an authorized determination.\n\n'
  'Do not use a training calculation as a substitute for the approved pricing, underwriting, or loan origination system.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 2 — Debt-to-income ratio (VIDEO)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l2, v_course_id, v_mod_id,
  'Debt-to-income ratio',
  'What DTI measures, how to calculate it using the basic formula, worked examples, and why a preliminary DTI is not an eligibility decision.',
  'video', 2, 2, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 2\n'
  '  Title: Debt-to-income ratio\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 5–6 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Debt-to-income ratio, commonly called DTI, compares qualifying monthly debt obligations with qualifying gross monthly income.\n\n'
  'The basic mathematical structure is:\n\n'
  '  DTI = (Qualifying monthly debt obligations ÷ Qualifying gross monthly income) × 100\n\n'
  'Suppose a fictional borrower has qualifying gross monthly income of $8,000. Suppose the qualifying monthly obligations used in this training example total $3,200.\n\n'
  'The calculation is $3,200 divided by $8,000, which equals 0.40. Multiply by 100, and the result is 40%.\n\n'
  'That tells us the ratio represented by those inputs. It does not, by itself, tell us whether the borrower qualifies. Applicable program rules, underwriting findings, documentation, lender requirements, and the complete borrower profile still matter.\n\n'
  'The most common mistakes are using the wrong income, leaving out an obligation, or treating a preliminary calculation as a final eligibility decision.\n\n'
  'For example, a borrower may tell you they earn $8,000 per month. That does not automatically establish $8,000 of qualifying income. The income must be evaluated and documented under the applicable requirements. Fannie Mae''s guidance describes stable and predictable income as income with a documented history and a reasonable expectation of continuance.\n\n'
  'A borrower may also have obligations that are not obvious from a first conversation. Do not assume that an item can be excluded simply because it is not visible where you expected it to be. Identify the obligation and follow the appropriate review process.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  PRACTICE CALCULATION (training scenario)\n'
  '───────────────────────────────────────────────────────\n\n'
  'Fictional example:\n'
  '  Qualifying gross monthly income: $7,500\n'
  '  Qualifying monthly obligations: $2,850\n\n'
  'Calculation:\n'
  '  $2,850 ÷ $7,500 = 0.38 = 38% DTI\n\n'
  'Answer: 38% DTI based on the stated training inputs.\n\n'
  'What this does NOT establish: Program eligibility, approval, or an acceptable maximum DTI.'
);

-- Inline knowledge check — Lesson 2
INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l2, v_course_id,
  'A borrower reports $7,500 in monthly income. You calculate a 38% DTI using that amount, but the income has not been reviewed. What is the correct way to describe the result?',
  'multiple_choice',
  '[{"label":"Your approved DTI is 38%.","is_correct":false},{"label":"Your final DTI is 38%.","is_correct":false},{"label":"Using the income and obligations currently provided, the preliminary calculation is 38%; qualifying income and liabilities still need review.","is_correct":true},{"label":"You qualify at 38%.","is_correct":false}]',
  'The calculation is only as reliable as its inputs, and the result is not an approval. A preliminary DTI is a useful starting point — not an eligibility determination.',
  1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 3 — Loan-to-value ratio (VIDEO)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l3, v_course_id, v_mod_id,
  'Loan-to-value ratio',
  'What LTV measures, the basic formula, worked examples, and why the denominator matters.',
  'video', 3, 3, true, 'watch_pct', 80, 240, '4 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 3\n'
  '  Title: Loan-to-value ratio\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 4 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Loan-to-value, or LTV, compares the loan amount with the value used for the applicable underwriting calculation.\n\n'
  'The basic formula is:\n\n'
  '  LTV = (Loan amount ÷ Applicable property value) × 100\n\n'
  'In a fictional purchase example, assume the loan amount is $270,000 and the applicable value for this training calculation is $300,000.\n\n'
  '$270,000 divided by $300,000 equals 0.90. The LTV is 90%.\n\n'
  'That does not automatically tell us the required down payment, mortgage insurance treatment, eligibility, or final loan structure. Those depend on the transaction and program requirements.\n\n'
  'Be careful about the denominator. Do not assume that every transaction uses the same property value for every calculation. Purchase price, appraised value, and other values may be treated differently under specific rules.\n\n'
  'Your responsibility is to understand the calculation and use the applicable value supplied or confirmed through the authorized process.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  PRACTICE CALCULATION (training scenario)\n'
  '───────────────────────────────────────────────────────\n\n'
  'Loan amount: $240,000\n'
  'Applicable value for the example: $320,000\n\n'
  '  $240,000 ÷ $320,000 = 0.75\n\n'
  'Answer: 75% LTV.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 4 — PITI and the monthly housing payment (VIDEO)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l4, v_course_id, v_mod_id,
  'PITI and the monthly housing payment',
  'The four components of PITI, what may or may not be included in a full housing payment, and how to communicate estimates without creating misleading expectations.',
  'video', 4, 4, true, 'watch_pct', 80, 240, '4 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 4\n'
  '  Title: PITI and the monthly housing payment\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 4 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'PITI stands for principal, interest, taxes, and insurance.\n\n'
  'Principal is the portion of the payment that reduces the loan balance. Interest is the cost of borrowing. Taxes are property taxes. Insurance generally refers to the applicable property insurance.\n\n'
  'A borrower''s full housing expense may include other items, depending on the property and transaction. Examples can include mortgage insurance, association dues, or other property-related assessments.\n\n'
  'That is why you should never tell a borrower that PITI necessarily represents every cost of owning the property.\n\n'
  'Principal and interest are affected by the loan amount, interest rate, and term. Taxes and insurance depend on the property and applicable coverage or assessment information. If any input is estimated, say so.\n\n'
  'When you discuss a payment, identify what is included and what is not included. A payment that excludes taxes, insurance, or other applicable charges can create a misleading expectation.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  PRACTICE CALCULATION (training scenario)\n'
  '───────────────────────────────────────────────────────\n\n'
  'A fictional monthly estimate shows:\n'
  '  Principal and interest: $1,650\n'
  '  Property taxes: $250\n'
  '  Homeowners insurance: $125\n\n'
  'PITI: $1,650 + $250 + $125 = $2,025\n\n'
  'Answer: $2,025 monthly PITI, excluding any other applicable charges not listed.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 5 — Basis points (VIDEO)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l5, v_course_id, v_mod_id,
  'Basis points',
  'What a basis point is, common conversions, and why a basis-point change is not automatically the same as a dollar change.',
  'video', 5, 5, true, 'watch_pct', 80, 180, '3 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 5\n'
  '  Title: Basis points\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 3 minutes\n'
  '  On-screen visual: basis-points conversion table\n'
  '═══════════════════════════════════════════════════════\n\n'
  'A basis point is one one-hundredth of one percentage point. One hundred basis points equal one percentage point.\n\n'
  'That means:\n\n'
  '  25 basis points  = 0.25 percentage points\n'
  '  50 basis points  = 0.50 percentage points\n'
  ' 100 basis points  = 1.00 percentage point\n\n'
  'Basis points are commonly used when discussing pricing adjustments, margins, or other percentage-based values.\n\n'
  'Do not confuse a basis-point change with a dollar amount. The dollar effect depends on what the percentage applies to and how the applicable calculation works.\n\n'
  'For example, 25 basis points of a $300,000 amount is $750 if the calculation is a simple 0.25% of that amount. But that does not mean every 25-basis-point pricing change produces a $750 borrower charge. The actual effect depends on the transaction and approved pricing.'
);

-- Inline knowledge check — Lesson 5
INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l5, v_course_id,
  'How many percentage points are 75 basis points?',
  'multiple_choice',
  '[{"label":"7.5%","is_correct":false},{"label":"0.075%","is_correct":false},{"label":"0.75%","is_correct":true},{"label":"75%","is_correct":false}]',
  '75 basis points = 0.75 percentage points. One basis point = 0.01 percentage points. 75 × 0.01 = 0.75.',
  1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 6 — Cash to close (VIDEO)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l6, v_course_id, v_mod_id,
  'Cash to close',
  'What cash to close is, why it is not the same as the down payment, and how to communicate an estimate without overpromising.',
  'video', 6, 6, true, 'watch_pct', 80, 240, '4 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 6\n'
  '  Title: Cash to close\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 4 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Cash to close is the estimated amount of funds the borrower needs to complete the transaction.\n\n'
  'It is not automatically the same as the down payment.\n\n'
  'The amount may reflect the down payment, closing costs, prepaid items, escrow deposits, credits, deposits already paid, and other transaction-specific adjustments.\n\n'
  'A borrower may say, "I have the down payment." That is an important fact, but it does not establish that the borrower has all funds needed to close.\n\n'
  'When reviewing a cash-to-close estimate, identify the source and date of the figures. Explain that the estimate may change as the transaction is reviewed and updated.\n\n'
  'If the borrower asks why the amount changed, do not guess. Identify the line items that changed and route questions through the approved process.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  PRACTICE CALCULATION (training scenario)\n'
  '───────────────────────────────────────────────────────\n\n'
  'Fictional example:\n'
  '  Down payment:                                $12,000\n'
  '  Estimated closing costs and prepaid items:   $6,500\n'
  '  Earnest money already paid:                 ($3,000)\n'
  '  Seller credit applied:                      ($2,000)\n\n'
  'Training calculation:\n'
  '  $12,000 + $6,500 − $3,000 − $2,000 = $13,500\n\n'
  'Answer: Estimated cash to close of $13,500 using only the listed assumptions.\n\n'
  'Reminder: This is a simplified training calculation, not a substitute for the transaction''s official figures.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 7 — Integrated scenario (VIDEO)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l7, v_course_id, v_mod_id,
  'Integrated scenario',
  'A single fictional borrower scenario that brings DTI, LTV, and payment estimates together — and reinforces the habit of updating inputs when facts change.',
  'video', 7, 7, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 7\n'
  '  Title: Integrated scenario\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 5 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Let''s bring the numbers together.\n\n'
  'A fictional borrower reports gross monthly income of $8,000. The current training worksheet shows $3,200 in qualifying monthly obligations. The proposed loan amount is $270,000, and the applicable value for this example is $300,000.\n\n'
  'The preliminary DTI calculation is 40%. The LTV calculation is 90%.\n\n'
  'Those two results tell us something about the relationship between the stated inputs. They do not tell us whether the loan is eligible or approved.\n\n'
  'Now imagine that the borrower reports a new monthly debt. The DTI input may need to change. Imagine that the property value used for the applicable calculation changes. The LTV may need to change. Imagine that taxes or insurance are updated. The housing payment estimate may change.\n\n'
  'The professional habit is to update the inputs, recalculate using the correct method, and make sure the file reflects the change.\n\n'
  'Mortgage math is useful when it makes the transaction clearer. It becomes dangerous when a preliminary calculation is presented as a promise.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  THE FIVE LABELING RULES\n'
  '───────────────────────────────────────────────────────\n\n'
  '1. Borrower-reported — information the borrower told you; not yet documented.\n'
  '2. Documented — supported by records; not yet reviewed by the authorized party.\n'
  '3. Reviewed — examined by the appropriate person or system.\n'
  '4. Determined — a decision made by the authorized party under the applicable requirements.\n'
  '5. Estimated — a calculation or projection based on current inputs; subject to change.\n\n'
  'Never move information from one level to another simply because it seems reasonable. Label it accurately and let the authorized process confirm the result.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 8 — Mortgage Math — Final Quiz (KNOWLEDGE CHECK)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l8, v_course_id, v_mod_id,
  'Mortgage Math — Final Quiz',
  'Ten questions covering DTI, LTV, PITI, basis points, cash to close, and calculation discipline. Passing score: 80%.',
  'knowledge_check', 8, 8, true, 'quiz_pass', 80, 720, '12 min',
  NULL
);

-- 10 final quiz questions
INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES

(v_l8, v_course_id,
 'DTI compares qualifying monthly obligations with:',
 'multiple_choice',
 '[{"label":"Purchase price","is_correct":false},{"label":"Qualifying gross monthly income","is_correct":true},{"label":"Loan amount","is_correct":false},{"label":"Appraised value","is_correct":false}]',
 'DTI = qualifying monthly obligations ÷ qualifying gross monthly income. It does not use the loan amount or property value.',
 1),

(v_l8, v_course_id,
 'A $3,000 monthly obligation total divided by $10,000 qualifying gross monthly income equals:',
 'multiple_choice',
 '[{"label":"3%","is_correct":false},{"label":"30%","is_correct":true},{"label":"33%","is_correct":false},{"label":"300%","is_correct":false}]',
 '$3,000 ÷ $10,000 = 0.30 = 30% DTI.',
 2),

(v_l8, v_course_id,
 'A $225,000 loan divided by an applicable value of $300,000 equals:',
 'multiple_choice',
 '[{"label":"65% LTV","is_correct":false},{"label":"70% LTV","is_correct":false},{"label":"75% LTV","is_correct":true},{"label":"80% LTV","is_correct":false}]',
 '$225,000 ÷ $300,000 = 0.75 = 75% LTV.',
 3),

(v_l8, v_course_id,
 'PITI includes:',
 'multiple_choice',
 '[{"label":"Principal, interest, taxes, insurance","is_correct":true},{"label":"Principal, income, taxes, interest","is_correct":false},{"label":"Payment, interest, title, insurance","is_correct":false},{"label":"Principal, insurance, title, income","is_correct":false}]',
 'PITI = Principal, Interest, Taxes, Insurance. It does not automatically include mortgage insurance, HOA dues, or other charges.',
 4),

(v_l8, v_course_id,
 'One hundred basis points equal:',
 'multiple_choice',
 '[{"label":"0.1 percentage points","is_correct":false},{"label":"0.5 percentage points","is_correct":false},{"label":"1 percentage point","is_correct":true},{"label":"10 percentage points","is_correct":false}]',
 '100 basis points = 1 percentage point. 1 basis point = 0.01 percentage points.',
 5),

(v_l8, v_course_id,
 'Cash to close is:',
 'multiple_choice',
 '[{"label":"Always the down payment","is_correct":false},{"label":"Always the loan amount","is_correct":false},{"label":"A transaction estimate that can include multiple items and credits","is_correct":true},{"label":"Always the same as the Loan Estimate total","is_correct":false}]',
 'Cash to close may include the down payment, closing costs, prepaids, escrow deposits, minus credits and deposits already paid. It is not simply the down payment.',
 6),

(v_l8, v_course_id,
 'A borrower-reported income figure should be treated as:',
 'multiple_choice',
 '[{"label":"Verified qualifying income","is_correct":false},{"label":"A fact to document and review","is_correct":true},{"label":"An approval","is_correct":false},{"label":"A guaranteed payment","is_correct":false}]',
 'Borrower-reported income is a starting point — it must be documented and evaluated under the applicable program requirements before it can be used as qualifying income.',
 7),

(v_l8, v_course_id,
 'If an input changes, the loan officer should:',
 'multiple_choice',
 '[{"label":"Keep using the original estimate","is_correct":false},{"label":"Update the relevant information through the approved process","is_correct":true},{"label":"Ignore it until closing","is_correct":false},{"label":"Promise the borrower the result will not change","is_correct":false}]',
 'When an input changes, the calculation may change. Update the information through the approved process and make sure the file reflects the current facts.',
 8),

(v_l8, v_course_id,
 'A 40% DTI automatically means a borrower qualifies.',
 'true_false',
 '[{"label":"True","is_correct":false},{"label":"False","is_correct":true}]',
 'False. A DTI calculation is only as reliable as its inputs. DTI is one factor in a larger review — program rules, documentation, underwriting findings, and other file details still apply.',
 9),

(v_l8, v_course_id,
 'The best way to explain a preliminary calculation is to:',
 'multiple_choice',
 '[{"label":"Call it final","is_correct":false},{"label":"Explain the inputs, result, and limitations","is_correct":true},{"label":"Avoid discussing it with the borrower","is_correct":false},{"label":"Guarantee the result","is_correct":false}]',
 'A preliminary calculation should always be labeled as such — explain the inputs used, the result, and that the number is subject to change as documentation and review progress.',
 10);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 9 — Mortgage Math — Formula Job Aid (TEXT)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label,
  transcript
) VALUES (
  v_l9, v_course_id, v_mod_id,
  'Mortgage Math — Formula Job Aid',
  'A one-page reference sheet: DTI, LTV, PITI, basis-points conversion, and cash-to-close components. All figures are training scenarios only.',
  'text', 9, 9, true, 'watch_pct', 80, NULL, NULL,
  E'═══════════════════════════════════════════════════════\n'
  '  MORTGAGE MATH — FORMULA REFERENCE SHEET\n'
  '  HCMG University | New LO Fast Track — Course 2\n'
  '  All examples are fictional training scenarios only.\n'
  '  Do not use these calculations as a substitute for\n'
  '  the approved LOS, pricing system, or underwriting.\n'
  '═══════════════════════════════════════════════════════\n\n'
  '──────────────────────────────────────\n'
  '  1. DEBT-TO-INCOME RATIO (DTI)\n'
  '──────────────────────────────────────\n\n'
  'Formula:\n'
  '  DTI = (Qualifying monthly obligations ÷ Qualifying gross monthly income) × 100\n\n'
  'Training example:\n'
  '  Obligations: $2,850  |  Income: $7,500\n'
  '  $2,850 ÷ $7,500 = 0.38 = 38% DTI\n\n'
  'Reminders:\n'
  '  • Use qualifying income — not borrower-reported income — after review.\n'
  '  • Include all qualifying monthly obligations.\n'
  '  • A preliminary DTI is not an eligibility decision.\n\n'
  '──────────────────────────────────────\n'
  '  2. LOAN-TO-VALUE RATIO (LTV)\n'
  '──────────────────────────────────────\n\n'
  'Formula:\n'
  '  LTV = (Loan amount ÷ Applicable property value) × 100\n\n'
  'Training example:\n'
  '  Loan: $240,000  |  Value: $320,000\n'
  '  $240,000 ÷ $320,000 = 0.75 = 75% LTV\n\n'
  'Reminders:\n'
  '  • The applicable value depends on the transaction type and program.\n'
  '  • LTV alone does not determine eligibility or mortgage insurance.\n\n'
  '──────────────────────────────────────\n'
  '  3. PITI — MONTHLY HOUSING PAYMENT\n'
  '──────────────────────────────────────\n\n'
  'Components:\n'
  '  P — Principal (reduces loan balance)\n'
  '  I — Interest (cost of borrowing)\n'
  '  T — Taxes (property taxes)\n'
  '  I — Insurance (applicable property insurance)\n\n'
  'May also include: mortgage insurance, HOA dues, assessments\n\n'
  'Training example:\n'
  '  P&I: $1,650 | Taxes: $250 | Insurance: $125\n'
  '  PITI = $2,025 (excluding other applicable charges)\n\n'
  '──────────────────────────────────────\n'
  '  4. BASIS POINTS CONVERSION TABLE\n'
  '──────────────────────────────────────\n\n'
  '   1 basis point  = 0.01 percentage points\n'
  '  25 basis points = 0.25 percentage points\n'
  '  50 basis points = 0.50 percentage points\n'
  '  75 basis points = 0.75 percentage points\n'
  ' 100 basis points = 1.00 percentage point\n'
  ' 150 basis points = 1.50 percentage points\n'
  ' 200 basis points = 2.00 percentage points\n\n'
  '  Dollar effect depends on the base amount and the applicable calculation.\n\n'
  '──────────────────────────────────────\n'
  '  5. CASH TO CLOSE — COMPONENTS\n'
  '──────────────────────────────────────\n\n'
  'May include (as applicable):\n'
  '  + Down payment\n'
  '  + Closing costs\n'
  '  + Prepaid items (e.g., prepaid interest, initial insurance premium)\n'
  '  + Escrow deposits\n'
  '  − Earnest money already paid\n'
  '  − Seller or lender credits\n'
  '  − Other applicable credits\n\n'
  'Training example:\n'
  '  $12,000 + $6,500 − $3,000 − $2,000 = $13,500 estimated cash to close\n\n'
  '  This is a simplified training scenario. Actual figures come from the\n'
  '  approved Loan Estimate and Closing Disclosure.\n\n'
  '═══════════════════════════════════════════════════════\n'
  '  LABELING DISCIPLINE — USE EVERY TIME\n'
  '═══════════════════════════════════════════════════════\n\n'
  'For every number, identify:\n'
  '  1. The inputs used and their source.\n'
  '  2. The formula applied.\n'
  '  3. The result.\n'
  '  4. Whether it is borrower-reported, estimated, or authorized/confirmed.\n\n'
  'Do not use a training calculation as a substitute for the approved system.'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FORMAL ASSESSMENT RECORD (uni_assessments)
-- Linked to the final quiz lesson (L8)
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
  v_l8,
  'Mortgage Math for Loan Officers — Final Quiz',
  'Ten questions covering DTI, LTV, PITI, basis points, cash to close, and calculation discipline. Passing score: 80%.',
  'certification_exam',
  80,
  true,
  true,
  NULL,   -- unlimited retakes
  false,  -- present in written order
  true,   -- show correct answers after submission
  'Answer all 10 questions. You need 80% or higher (8 out of 10) to pass and receive your completion certificate. You may retake this quiz as many times as needed. Explanations are shown after you submit.'
);

-- Link all 10 final-quiz questions to the formal assessment record
INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order)
SELECT v_assessment_id, q.id, q.sort_order
FROM uni_quiz_questions q
WHERE q.lesson_id = v_l8
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
LEFT JOIN uni_modules m          ON m.course_id = c.id
LEFT JOIN uni_lessons l          ON l.course_id = c.id
LEFT JOIN uni_quiz_questions q   ON q.course_id = c.id
LEFT JOIN uni_assessments a      ON a.course_id = c.id
LEFT JOIN uni_certificate_config cc ON cc.course_id = c.id
WHERE c.slug = 'fast-track-mortgage-math'
GROUP BY c.id, c.title, c.slug, c.is_published, c.is_required, c.sort_order, c.path_tag;
