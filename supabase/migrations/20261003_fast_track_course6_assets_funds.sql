-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Fast Track Course 6: Assets, Funds to Close & Reserves
-- Status: DRAFT — pending HCMG review before publication
-- ⚠ Before publishing: insert HCMG's approved asset-documentation checklist,
--   secure upload method, large-deposit workflow, gift-fund procedure,
--   and reserve requirements.
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_course_id     uuid := gen_random_uuid();
  v_admin_id      uuid := '736a599a-492a-4585-b845-74b264d0ac9e';
  v_mod_id        uuid := gen_random_uuid();
  v_assessment_id uuid := gen_random_uuid();
  v_l1  uuid := gen_random_uuid();
  v_l2  uuid := gen_random_uuid();
  v_l3  uuid := gen_random_uuid();
  v_l4  uuid := gen_random_uuid();
  v_l5  uuid := gen_random_uuid();
  v_l6  uuid := gen_random_uuid();
  v_l7  uuid := gen_random_uuid();
  v_l8  uuid := gen_random_uuid();
BEGIN

DELETE FROM uni_courses WHERE slug = 'fast-track-assets-funds';

INSERT INTO uni_courses (id, slug, title, short_description, description, category, difficulty, duration_label, pill_color, is_required, is_published, sort_order, content_status, audience, instructor_name, completion_rules, created_by)
VALUES (v_course_id, 'fast-track-assets-funds', 'Assets, Funds to Close & Reserves',
  'Understand the borrower''s available funds, identify documentation questions, and coordinate review without assuming every balance is eligible.',
  E'This course teaches loan officers to understand asset sources, identify documentation requirements, and coordinate review — without assuming that a reported balance is automatically eligible for a mortgage transaction.\n\n'
  'Before publishing, HCMG must insert the approved asset-documentation checklist, secure upload method, large-deposit workflow, gift-fund procedure, and reserve requirements.',
  'operations', 'beginner', '45–60 min', 'blue', true, false, 55, 'draft',
  'New loan officers and origination support team members', 'Darius James',
  '{"require_all_lessons": true, "require_assessment": true, "passing_score": 80}',
  v_admin_id);

INSERT INTO uni_course_objectives (id, course_id, objective, sort_order) VALUES
  (gen_random_uuid(), v_course_id, 'Distinguish reported funds from documented and accepted funds', 1),
  (gen_random_uuid(), v_course_id, 'Identify common asset sources and explain that they are not treated identically', 2),
  (gen_random_uuid(), v_course_id, 'Explain the difference between down payment, cash to close, and reserves', 3),
  (gen_random_uuid(), v_course_id, 'Recognize deposits and transfers that may require documentation', 4),
  (gen_random_uuid(), v_course_id, 'Distinguish a gift from a loan in a borrower assistance situation', 5),
  (gen_random_uuid(), v_course_id, 'Prepare a clean asset handoff note', 6);

INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active)
VALUES (v_mod_id, v_course_id, 'Assets, Funds to Close & Reserves',
  'Asset sources, documentation, deposits, gifts, reserves, and file quality — without making unauthorized eligibility determinations.', 0, true);

-- ── Lesson 1 ────────────────────────────────────────────────────────────────
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l1, v_course_id, v_mod_id,
  'Available funds are not automatically eligible funds',
  'The three levels: reported funds, documented funds, and funds accepted for a transaction — and why you cannot skip from the first to the third.',
  'video', 1, 1, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 1\n'
  '  Title: Available funds are not automatically eligible funds\n'
  '  Speaker: Darius James, Chief Lending Officer\n'
  '  ⚠ DRAFT — pending HCMG review\n'
  '═══════════════════════════════════════════════════════\n\n'
  'When a borrower says, "I have the money," your next step is not to assume the funds are ready to use.\n\n'
  'In a mortgage transaction, we need to understand what funds the borrower has, where those funds are held, whether they are available, and whether they can be used for the purpose being discussed under the applicable loan requirements.\n\n'
  'A borrower may have money in a checking account, savings account, retirement account, investment account, or another source. Those sources are not necessarily treated the same way. Some funds may be readily accessible. Others may have restrictions, withdrawal consequences, documentation requirements, or other considerations.\n\n'
  'There are three important distinctions.\n\n'
  'First: reported funds. This is what the borrower tells you they have.\n\n'
  'Second: documented funds. This is information supported by records collected through the approved process.\n\n'
  'Third: funds accepted for the transaction. That determination must follow the applicable program requirements and authorized review.\n\n'
  'Do not skip from the first category to the third. A borrower''s statement is a useful starting point, but it is not the same as a reviewed asset.\n\n'
  'Your job is to ask clear questions, collect information through approved channels, identify anything unusual or inconsistent, and route it for review.\n\n'
  'The goal is to prevent surprises — not to make the borrower feel interrogated. Explain that the team needs to understand the source and availability of funds so the transaction can be evaluated accurately.\n\n'
  '──────────────────────────────────────────────────────\n'
  'COMPANION ARTICLE — The three questions behind every asset\n'
  '──────────────────────────────────────────────────────\n\n'
  'For each source of funds, ask:\n\n'
  'Where is it? Identify the account or source.\n\n'
  'Can it be accessed? Understand whether the funds are available and whether access may involve restrictions or consequences.\n\n'
  'What must be documented? Follow the applicable program and HCMG process.\n\n'
  'Do not tell a borrower that an asset is acceptable simply because the account statement shows a balance.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l1, v_course_id,
  'A borrower tells you they have $40,000 in savings. No documentation has been reviewed. What is the accurate description?',
  'multiple_choice',
  '[{"label":"The borrower has $40,000 in eligible funds","is_correct":false},{"label":"The borrower reports $40,000 in savings; documentation and review are still needed","is_correct":true},{"label":"The borrower has enough to close","is_correct":false},{"label":"The loan is approved","is_correct":false}]',
  'A borrower''s statement is useful starting information, but it is not the same as documented or accepted funds. Reported and accepted are not the same category.', 1);

-- ── Lesson 2 ────────────────────────────────────────────────────────────────
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l2, v_course_id, v_mod_id,
  'Understanding common asset sources',
  'Checking, savings, retirement, investment, and business accounts — and why each source may have different documentation and eligibility considerations.',
  'video', 2, 2, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 2\n'
  '  Title: Understanding common asset sources\n'
  '  Speaker: Darius James\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Borrowers may use different types of assets during a mortgage transaction.\n\n'
  'Common sources include checking and savings accounts, money market accounts, investment accounts, retirement accounts, and funds from other permitted sources.\n\n'
  'Your responsibility is to identify the source — not to assume that every source has the same rules.\n\n'
  'For example, a bank account may show funds that are readily available, while a retirement account may have withdrawal restrictions, taxes, penalties, or other considerations. An investment account may fluctuate in value. A business account may require additional review to understand whether funds can be used without affecting the business.\n\n'
  'These examples are reasons to ask questions and obtain the appropriate documentation. They are not decisions about eligibility.\n\n'
  'Ask the borrower to identify the source and explain whether the funds are intended for the down payment, closing costs, reserves, or another purpose. Then follow the approved process for documenting that source.\n\n'
  'Do not advise a borrower to move money between accounts simply to make the file appear cleaner. Transfers can create additional questions about where the funds originated. If a transfer has occurred, document the facts and route the issue for review.\n\n'
  '──────────────────────────────────────────────────────\n'
  'COMPANION ARTICLE — Asset-source conversation guide\n'
  '──────────────────────────────────────────────────────\n\n'
  '"The money is in my checking account." → "Is that the account you expect to use for the transaction?"\n\n'
  '"I have money in retirement." → "Are you considering using any of those funds? We''ll need to review the applicable requirements."\n\n'
  '"My business has the money." → "Is the money held in a business account, and what is its intended use?"\n\n'
  '"I moved money last week." → "Where did the funds move from and to?"\n\n'
  '"A family member is helping." → "Are you describing a gift or another type of assistance? We''ll review the applicable process."\n\n'
  'Do not promise that a source is acceptable before review.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l2, v_course_id,
  'A borrower says they plan to use funds from a retirement account. What should you do?',
  'multiple_choice',
  '[{"label":"Tell them to withdraw the funds immediately","is_correct":false},{"label":"Tell them retirement funds are never allowed","is_correct":false},{"label":"Identify the source and intended use, then follow the applicable documentation and review process","is_correct":true},{"label":"Count the account''s full balance as available cash","is_correct":false}]',
  'Retirement account funds may have access restrictions and program-specific requirements. Identify the source and follow the applicable process — do not assume or advise immediate withdrawal.', 1);

-- ── Lesson 3 ────────────────────────────────────────────────────────────────
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l3, v_course_id, v_mod_id,
  'Down payment, closing costs, prepaid items, and reserves',
  'Why "down payment" and "cash to close" are not the same thing — and why reserves are a separate category.',
  'video', 3, 3, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 3\n'
  '  Title: Down payment, closing costs, prepaid items, and reserves\n'
  '  Speaker: Darius James\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Borrowers often use the phrase "down payment" to describe all the money they need for a transaction. That can create confusion.\n\n'
  'The down payment is one component of the transaction. Cash to close may also include closing costs, prepaid items, escrow deposits, and adjustments, with applicable credits or deposits reducing the amount due.\n\n'
  'Reserves are different. Reserves generally refer to funds that may need to remain available after closing under the requirements of a particular program or transaction. Do not assume that funds used for closing can also be counted as funds remaining after closing.\n\n'
  'The important thing is to separate the categories.\n\n'
  'When a borrower asks, "How much money do I need?" make sure you know whether they mean down payment, estimated cash to close, or funds that must remain available after closing.\n\n'
  'Use current, approved figures. Explain what is included in an estimate. If you do not know whether a particular amount is required, do not guess. Ask the appropriate team member.\n\n'
  '──────────────────────────────────────────────────────\n'
  'COMPANION ARTICLE — Keep the categories separate\n'
  '──────────────────────────────────────────────────────\n\n'
  'Down payment: the borrower''s contribution toward the purchase price, as applicable.\n\n'
  'Closing costs: transaction costs associated with obtaining and closing the loan.\n\n'
  'Prepaid items: certain expenses paid in advance, depending on the transaction.\n\n'
  'Escrow deposits: funds collected for applicable future property expenses.\n\n'
  'Cash to close: estimated funds needed to complete the transaction after applicable credits and deposits.\n\n'
  'Reserves: funds that may be required to remain available after closing under applicable requirements.\n\n'
  'These are explanatory definitions. The transaction''s actual figures and eligibility treatment must come from the approved file and applicable requirements.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l3, v_course_id,
  'A borrower has enough money for the estimated down payment. Does that establish that they have enough funds to close?',
  'multiple_choice',
  '[{"label":"Yes, always","is_correct":false},{"label":"No. Other costs, prepaids, deposits, credits, and requirements may affect the amount","is_correct":true},{"label":"Yes, if the borrower has a good credit score","is_correct":false},{"label":"No, because down payments are not part of closing","is_correct":false}]',
  'Cash to close reflects the down payment plus closing costs, prepaids, and other items, adjusted for credits and deposits already paid. Having the down payment alone does not establish sufficiency.', 1);

-- ── Lesson 4 ────────────────────────────────────────────────────────────────
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l4, v_course_id, v_mod_id,
  'Deposits, transfers, and unusual activity',
  'When account activity requires documentation — and how to ask neutral questions without coaching the borrower.',
  'video', 4, 4, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 4\n'
  '  Title: Deposits, transfers, and unusual activity\n'
  '  Speaker: Astrine Covington, President\n'
  '═══════════════════════════════════════════════════════\n\n'
  'When the funds in a borrower''s account change, the team may need to understand why.\n\n'
  'A deposit, transfer, or account change is not automatically a problem. But it may create a documentation question. The correct response is to identify what happened and follow the applicable process.\n\n'
  'For example, a borrower may transfer money from savings to checking. They may receive a payroll deposit, sell an asset, receive a gift, or deposit funds from another source. Those situations are not identical.\n\n'
  'Do not tell a borrower to create a paper trail after the fact or to describe a deposit inaccurately. Do not suggest that they move funds to avoid a question.\n\n'
  'Instead, ask neutral questions. Where did the money come from? When did it arrive? Was it transferred from another account? Is there documentation available? Then use the approved channel to provide the information for review.\n\n'
  'Our responsibility is to protect the integrity of the file. Accurate documentation helps the authorized reviewer understand the transaction.\n\n'
  '──────────────────────────────────────────────────────\n'
  'COMPANION ARTICLE — Neutral questions for an unexplained deposit\n'
  '──────────────────────────────────────────────────────\n\n'
  'Use language such as:\n\n'
  '"Can you help me understand where this deposit came from?"\n\n'
  '"Was this transferred from another account you own?"\n\n'
  '"Was it received from another person or organization?"\n\n'
  '"Do you have documentation that explains the source?"\n\n'
  '"I''ll submit the information through our approved process so the appropriate team can review it."\n\n'
  'Avoid language such as:\n\n'
  '"Just say it was savings."\n\n'
  '"Move the money back."\n\n'
  '"That deposit does not matter."\n\n'
  '"We can leave that off."');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l4, v_course_id,
  'A borrower has a recent deposit and says, "It was cash I had at home." What is the appropriate response?',
  'multiple_choice',
  '[{"label":"Tell the borrower to call it a transfer","is_correct":false},{"label":"Tell the borrower to withdraw it","is_correct":false},{"label":"Record the borrower''s explanation accurately and route it for review under the applicable process","is_correct":true},{"label":"Ignore it","is_correct":false}]',
  'Record what the borrower reports accurately and route it for review. Do not advise the borrower to change their description of the deposit''s source.', 1);

-- ── Lesson 5 ────────────────────────────────────────────────────────────────
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l5, v_course_id, v_mod_id,
  'Gifts and assistance from another person',
  'The difference between a gift and a loan, why it matters, and how to handle borrower assistance without misrepresenting the arrangement.',
  'video', 5, 5, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 5\n'
  '  Title: Gifts and assistance from another person\n'
  '  Speaker: Darius James\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Sometimes a borrower receives help from another person. The borrower may describe it as a gift, a loan, a contribution, or simply "money from my family."\n\n'
  'Those descriptions are not interchangeable.\n\n'
  'The source and terms of the funds matter. A gift may have specific eligibility and documentation requirements. A loan may create a repayment obligation. Assistance from an organization may follow a different process.\n\n'
  'Do not tell a borrower that family money automatically qualifies as a gift. Do not advise a borrower to describe repayable funds as a gift. And do not create or alter a gift document.\n\n'
  'Ask who is providing the funds, what the borrower understands the arrangement to be, whether repayment is expected, and what documentation is available. Then follow the applicable program requirements and HCMG process.\n\n'
  'If the borrower is unsure how to describe the arrangement, do not coach them toward a preferred answer. Explain that the information needs to be accurate and reviewed.\n\n'
  '──────────────────────────────────────────────────────\n'
  'COMPANION ARTICLE — Gift versus loan: the key distinction\n'
  '──────────────────────────────────────────────────────\n\n'
  'A gift and a loan differ in their repayment expectations and may be treated differently in underwriting.\n\n'
  'A loan generally creates an obligation to repay. A gift is represented as funds provided without an expectation of repayment, subject to applicable requirements and documentation.\n\n'
  'This lesson does not establish who may provide a gift, what documentation is required, or what percentage may be used. Those details vary by program and must be checked against current requirements.\n\n'
  '⚠ CONFIG: Insert HCMG''s approved gift-fund procedure and documentation requirements before publication.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l5, v_course_id,
  'A borrower says a relative is giving them money but expects repayment after closing. What should you do?',
  'multiple_choice',
  '[{"label":"Call it a gift because it comes from family","is_correct":false},{"label":"Tell the borrower not to mention repayment","is_correct":false},{"label":"Record the arrangement accurately and refer it for review","is_correct":true},{"label":"Count it as the borrower''s savings","is_correct":false}]',
  'An arrangement with an expectation of repayment is not a gift. The file must reflect the actual arrangement. Do not misrepresent funds.', 1);

-- ── Lesson 6 ────────────────────────────────────────────────────────────────
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l6, v_course_id, v_mod_id,
  'Asset documentation and file quality',
  'How to review asset documentation before handoff, what makes a file clean, and how to protect sensitive borrower information.',
  'video', 6, 6, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Lesson 6\n'
  '  Title: Asset documentation and file quality\n'
  '  Speaker: Astrine Covington\n'
  '  ⚠ CONFIG: Insert HCMG approved checklist and secure upload instructions\n'
  '═══════════════════════════════════════════════════════\n\n'
  'A clean asset file makes it easier for the appropriate team to understand the borrower''s funds.\n\n'
  'The loan officer should use the current HCMG checklist and approved document channels. Do not rely on memory or an old checklist. Requirements can vary by program and transaction.\n\n'
  'When reviewing the information you have collected, check whether the documents belong to the correct borrower, cover the requested period, are readable, and appear complete. If a document is missing pages or information, do not assume that the missing information is unimportant.\n\n'
  'If the borrower provides a document that does not answer the question, explain what remains outstanding and follow the approved process.\n\n'
  'Protect the borrower''s information. Do not store or transmit sensitive financial documents through personal email, personal storage, or another unapproved method.\n\n'
  'A good asset handoff explains what was received, what remains missing, and what question needs review.\n\n'
  '──────────────────────────────────────────────────────\n'
  'COMPANION ARTICLE — Asset file quality checklist\n'
  '──────────────────────────────────────────────────────\n\n'
  'Before handoff, confirm:\n\n'
  '☐ The source of funds is identified.\n'
  '☐ The correct borrower or account holder is identified.\n'
  '☐ Documents are readable and complete to the extent required.\n'
  '☐ The requested period is covered.\n'
  '☐ Transfers or deposits needing explanation are flagged.\n'
  '☐ Gift or third-party funds are identified accurately.\n'
  '☐ The approved secure document channel was used.\n'
  '☐ Any unresolved question is clearly noted.\n'
  '☐ The file has not been represented as approved or cleared without authorization.\n\n'
  '⚠ Internal insertion required: Add HCMG''s current asset-documentation checklist and secure upload instructions here.');

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order)
VALUES (v_l6, v_course_id,
  'A borrower uploads a statement, but several pages are missing. What should you do?',
  'multiple_choice',
  '[{"label":"Assume the missing pages are blank","is_correct":false},{"label":"Submit it as complete","is_correct":false},{"label":"Follow the approved process to obtain the required complete documentation","is_correct":true},{"label":"Recreate the missing pages","is_correct":false}]',
  'Follow the approved process to obtain complete documentation. Do not assume missing pages are unimportant or recreate documents.', 1);

-- ── Lesson 7 — Final Assessment ──────────────────────────────────────────────
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l7, v_course_id, v_mod_id,
  'Assets, Funds to Close & Reserves — Final Assessment',
  'Ten questions covering all six lessons. Passing score: 80%.',
  'knowledge_check', 7, 7, true, 'quiz_pass', 80, 900, '15 min', NULL);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l7, v_course_id, 'A borrower reports $25,000 in an account. What does that establish?',
 'multiple_choice',
 '[{"label":"Eligible funds","is_correct":false},{"label":"Approved funds","is_correct":false},{"label":"Reported funds","is_correct":true},{"label":"Clear to close","is_correct":false}]',
 'A reported balance is not automatically documented or accepted. Reported funds must be verified and reviewed before they can be treated as eligible.', 1),
(v_l7, v_course_id, 'Which statement best describes reserves?',
 'multiple_choice',
 '[{"label":"Always the same as the down payment","is_correct":false},{"label":"Funds that may need to remain available after closing under applicable requirements","is_correct":true},{"label":"All closing costs","is_correct":false},{"label":"The borrower''s credit limit","is_correct":false}]',
 'Reserves are funds that may be required to remain available after the transaction closes under applicable program requirements — separate from funds used for down payment and closing.', 2),
(v_l7, v_course_id, 'A borrower transfers funds between two accounts. What should the LO do?',
 'multiple_choice',
 '[{"label":"Tell the borrower to reverse it","is_correct":false},{"label":"Ignore it","is_correct":false},{"label":"Identify the source and destination and follow the documentation process","is_correct":true},{"label":"Describe it as payroll","is_correct":false}]',
 'Fund transfers may create documentation questions about the origin of funds. Identify the facts and follow the approved process.', 3),
(v_l7, v_course_id, 'A borrower says a family member is providing money and expects repayment. What should the LO do?',
 'multiple_choice',
 '[{"label":"Label it a gift","is_correct":false},{"label":"Record the arrangement accurately and route it for review","is_correct":true},{"label":"Omit the repayment expectation","is_correct":false},{"label":"Count it as savings","is_correct":false}]',
 'An arrangement with a repayment expectation is not a gift. The file must reflect the actual arrangement accurately.', 4),
(v_l7, v_course_id, 'Is a retirement account balance automatically available for closing?',
 'multiple_choice',
 '[{"label":"Yes","is_correct":false},{"label":"No; access and applicable requirements must be reviewed","is_correct":true},{"label":"Only if the borrower is employed","is_correct":false},{"label":"Only if the borrower has no debt","is_correct":false}]',
 'Retirement accounts may have withdrawal restrictions, tax consequences, and program-specific rules. Access and eligibility must be reviewed.', 5),
(v_l7, v_course_id, 'Is the down payment always equal to cash to close?',
 'multiple_choice',
 '[{"label":"Yes","is_correct":false},{"label":"No — cash to close may include other items and adjustments","is_correct":true},{"label":"Only on FHA loans","is_correct":false},{"label":"Yes, if there are no closing costs","is_correct":false}]',
 'Cash to close may include closing costs, prepaids, escrow deposits, and other items, adjusted by credits and deposits already paid.', 6),
(v_l7, v_course_id, 'A borrower uploads an incomplete statement. What should happen?',
 'multiple_choice',
 '[{"label":"The LO should recreate the missing pages","is_correct":false},{"label":"The file should be marked complete","is_correct":false},{"label":"The required documentation should be obtained through the approved process","is_correct":true},{"label":"The borrower should be told the file is approved","is_correct":false}]',
 'Incomplete documentation must be flagged and complete records obtained through the approved channel. Do not recreate or assume.', 7),
(v_l7, v_course_id, 'Which statement is appropriate when an asset source is uncertain?',
 'multiple_choice',
 '[{"label":"\"It will be accepted.\"","is_correct":false},{"label":"\"We can call it savings.\"","is_correct":false},{"label":"\"We need to document the source and have it reviewed.\"","is_correct":true},{"label":"\"It does not matter.\"","is_correct":false}]',
 'Uncertain asset sources must be documented and reviewed under the applicable requirements — not assumed to be acceptable.', 8),
(v_l7, v_course_id, 'A business account has funds the borrower wants to use. What should the LO do?',
 'multiple_choice',
 '[{"label":"Count the full balance automatically","is_correct":false},{"label":"Identify the account and intended use, then follow the applicable review process","is_correct":true},{"label":"Tell the borrower to transfer it to a personal account","is_correct":false},{"label":"Ignore the account","is_correct":false}]',
 'Business funds are not automatically available for personal use in a mortgage transaction. Identify the account, understand the intended use, and follow the review process.', 9),
(v_l7, v_course_id, 'Which is the correct file standard?',
 'multiple_choice',
 '[{"label":"Use whichever documents make the file easiest","is_correct":false},{"label":"Keep unresolved questions out of the notes","is_correct":false},{"label":"Record facts accurately, protect documents, and identify open questions","is_correct":true},{"label":"Mark funds as approved when uploaded","is_correct":false}]',
 'The file standard is accuracy, document security, and transparency about unresolved questions. Do not conceal issues or misrepresent status.', 10);

-- Formal assessment record
INSERT INTO uni_assessments (id, course_id, lesson_id, title, description, assessment_type, passing_pct, is_required, is_active, max_attempts, randomize_questions, show_answers_after, instructions)
VALUES (v_assessment_id, v_course_id, v_l7,
  'Assets, Funds to Close & Reserves — Final Assessment',
  'Ten questions covering asset documentation, fund categories, deposits, gifts, and file quality.',
  'certification_exam', 80, true, true, NULL, false, true,
  'Answer all 10 questions. Passing score: 80%. You may retake this assessment as many times as needed.');

INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order)
SELECT v_assessment_id, q.id, q.sort_order FROM uni_quiz_questions q WHERE q.lesson_id = v_l7 ORDER BY q.sort_order;

INSERT INTO uni_certificate_config (course_id, issue_certificate, renewal_mode, include_verification, trigger_assessment_id)
VALUES (v_course_id, true, 'manual', true, v_assessment_id);

-- ── Lesson 8 — Job Aid ──────────────────────────────────────────────────────
INSERT INTO uni_lessons (id, course_id, module_id, title, description, lesson_type, sort_order, module_sort_order, is_published, completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript)
VALUES (v_l8, v_course_id, v_mod_id,
  'Asset Conversation and Handoff — Job Aid',
  'Reference guide for the asset conversation, documentation, and handoff note.',
  'text', 8, 8, true, 'watch_pct', 80, 300, '5 min',
  E'## Asset Conversation and Handoff — Job Aid\n\n'
  '### ASK\n\n'
  '- What account or source will the funds come from?\n'
  '- Are the funds already in that account?\n'
  '- Have any funds recently been deposited or transferred?\n'
  '- Is another person or organization contributing funds?\n'
  '- Is repayment expected?\n'
  '- Are any funds restricted or not immediately accessible?\n\n'
  '### RECORD\n\n'
  '- Borrower''s explanation.\n'
  '- Documents received.\n'
  '- Outstanding information.\n'
  '- Potential discrepancy.\n'
  '- Who needs to review it.\n'
  '- Next action and owner.\n\n'
  '### NEVER\n\n'
  '- Invent a source.\n'
  '- Coach a borrower to misrepresent funds.\n'
  '- Promise acceptance.\n'
  '- Treat upload as approval.\n'
  '- Use an unapproved channel for sensitive documents.\n\n'
  '⚠ Before publishing: insert HCMG''s approved asset-documentation checklist, large-deposit workflow, gift-fund procedure, secure upload method, and reserve requirements.');

END $$;

SELECT c.title, c.slug, c.content_status, c.is_published,
       COUNT(DISTINCT l.id) AS lessons,
       COUNT(DISTINCT q.id) AS questions
FROM uni_courses c
LEFT JOIN uni_lessons l ON l.course_id = c.id
LEFT JOIN uni_quiz_questions q ON q.course_id = c.id
WHERE c.slug = 'fast-track-assets-funds'
GROUP BY c.id, c.title, c.slug, c.content_status, c.is_published;
