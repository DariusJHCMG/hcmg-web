-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — New LO Fast Track
-- Course 1: The HCMG Loan Lift Cycle
--
-- Audience  : Newly hired loan officers and origination support team members
-- Duration  : 60–75 minutes
-- Required  : Yes
-- Pass score: 80%
-- Certificate: Yes (existing HCMG U certificate workflow)
-- Path tag  : start (New LO Fast Start)
-- Sort order: 30
--
-- Structure:
--   1 module ("The Loan Lift Cycle")
--   11 video lessons (Lessons 1–11, each with inline knowledge-check question)
--   1 knowledge_check lesson (Lesson 12 — Final Assessment, 12 questions)
--   1 text lesson (Lesson 13 — Job Aid)
--   1 uni_assessments record (certification_exam, linked to final lesson)
--   1 uni_certificate_config record
--
-- Content status: DRAFT — pending HCMG review before publication.
--
-- ⚠ CONFIGURATION TASKS — items requiring internal review before publication:
--   - Approved video recordings for each presenter (Darius James, Astrine Covington, Lamont Harris Jr.)
--   - HCMG's exact application workflow, required fields, secure document channels, and handoff checklist (Lesson 5)
--   - HCMG's approved wire-fraud warning and verification steps (Lesson 10)
--   - HCMG's exact clear-to-close authority and process confirmation method (Lesson 9)
--   - Verified internal system names and links (ARIVE, CRM, portal)
--   - Number of allowed assessment retakes
--
-- Idempotent: deletes prior run by slug before re-inserting.
-- ═══════════════════════════════════════════════════════════════════════════

DELETE FROM uni_courses WHERE slug = 'fast-track-loan-lift-cycle';

DO $$
DECLARE
  v_course_id     uuid := gen_random_uuid();
  v_admin_id      uuid := '736a599a-492a-4585-b845-74b264d0ac9e';
  v_mod_id        uuid := gen_random_uuid();
  v_assessment_id uuid := gen_random_uuid();

  -- Lesson IDs
  v_l1  uuid := gen_random_uuid();  -- Welcome to the Loan Lift Cycle
  v_l2  uuid := gen_random_uuid();  -- Discovery
  v_l3  uuid := gen_random_uuid();  -- Qualification
  v_l4  uuid := gen_random_uuid();  -- Loan Strategy
  v_l5  uuid := gen_random_uuid();  -- Application, documentation, and first handoff
  v_l6  uuid := gen_random_uuid();  -- Disclosures, estimates, and borrower understanding
  v_l7  uuid := gen_random_uuid();  -- Processing and underwriting
  v_l8  uuid := gen_random_uuid();  -- Conditions
  v_l9  uuid := gen_random_uuid();  -- Approval, clear to close, and limits of authority
  v_l10 uuid := gen_random_uuid();  -- Closing and follow-through
  v_l11 uuid := gen_random_uuid();  -- The Loan Lift handoff
  v_l12 uuid := gen_random_uuid();  -- Final Assessment (knowledge_check)
  v_l13 uuid := gen_random_uuid();  -- Job Aid (text)

  -- Assessment question IDs
  v_q1  uuid := gen_random_uuid();
  v_q2  uuid := gen_random_uuid();
  v_q3  uuid := gen_random_uuid();
  v_q4  uuid := gen_random_uuid();
  v_q5  uuid := gen_random_uuid();
  v_q6  uuid := gen_random_uuid();
  v_q7  uuid := gen_random_uuid();
  v_q8  uuid := gen_random_uuid();
  v_q9  uuid := gen_random_uuid();
  v_q10 uuid := gen_random_uuid();
  v_q11 uuid := gen_random_uuid();
  v_q12 uuid := gen_random_uuid();

BEGIN

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
  'fast-track-loan-lift-cycle',
  'The HCMG Loan Lift Cycle',
  'Understand the mortgage file from first conversation to closing.',
  E'This course teaches a new loan officer to understand the mortgage file from the first borrower conversation through closing — and to know what they own, what they coordinate, and when they must involve another HCMG team member.\n\n'
  'Eleven lessons. Twelve final-assessment questions. One job aid you will use every day.\n\n'
  'This course teaches the workflow and judgment expected of a loan officer. It does not replace current investor guidelines, compliance training, HCMG policies, or direction from underwriting and operations.',
  'operations',
  'beginner',
  '60–75 min',
  'blue',
  true,
  false,
  30,
  'draft',
  'Newly hired loan officers and origination support team members',
  'Darius James',
  '{"require_all_lessons": true, "require_assessment": true, "passing_score": 80}',
  v_admin_id
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LEARNING OBJECTIVES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_course_objectives (id, course_id, objective, sort_order) VALUES
  (gen_random_uuid(), v_course_id, 'Explain the eight stages of the Loan Lift Cycle', 1),
  (gen_random_uuid(), v_course_id, 'Distinguish what the loan officer owns from what requires a handoff to another team member', 2),
  (gen_random_uuid(), v_course_id, 'Identify the next responsible action when a file slows down', 3),
  (gen_random_uuid(), v_course_id, 'Describe borrower-reported, documented, reviewed, and determined information accurately', 4),
  (gen_random_uuid(), v_course_id, 'Explain the purpose of key disclosure documents including the Loan Estimate and Closing Disclosure', 5),
  (gen_random_uuid(), v_course_id, 'Manage conditions accurately without overstating file status', 6),
  (gen_random_uuid(), v_course_id, 'Use correct status language — conditional approval, conditions submitted, clear to close', 7),
  (gen_random_uuid(), v_course_id, 'Recognize wire fraud risk and follow the approved verification procedure', 8);

-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active) VALUES
  (v_mod_id, v_course_id,
   'The Loan Lift Cycle',
   'A complete walk-through of the mortgage file from first borrower conversation to closing and follow-through.',
   1, true);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 1 — Welcome to the Loan Lift Cycle
-- Presenter: Darius James, Chief Lending Officer
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l1, v_course_id, v_mod_id,
  'Welcome to the Loan Lift Cycle',
  'Darius James, Chief Lending Officer, introduces the eight-stage Loan Lift Cycle and the loan officer''s role in leading the borrower experience.',
  'video', 1, 1, false, 'watch_pct', 80, 240, '4 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 1\n'
  '  Title: Welcome to the Loan Lift Cycle\n'
  '  Presenter: Darius James, Chief Lending Officer\n'
  '  Suggested runtime: 3–4 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Welcome to HCMG, and welcome to the Loan Lift Cycle.\n\n'
  'If you are new to mortgage lending, it can feel like there are a hundred different things happening at once. You hear terms like application, disclosures, processing, underwriting, conditions, approval, clear to close, and closing. You may be working with a borrower, a real estate agent, a processor, an underwriter, and a closing team—all on the same transaction.\n\n'
  'The purpose of this course is to give you the map.\n\n'
  'A mortgage loan is not one conversation and it is not one approval. It is a sequence of decisions, documentation, reviews, and handoffs. Your responsibility as a loan officer is to help the borrower understand the journey, gather accurate information, set realistic expectations, and keep the right people informed.\n\n'
  'Here is the cycle we will use throughout this course:\n\n'
  'First, understand the borrower and the purpose of the loan.\n'
  'Second, gather and verify the information needed to evaluate the situation.\n'
  'Third, identify a loan strategy that fits the borrower''s goals and the available program requirements.\n'
  'Fourth, move the application through the required disclosures and internal workflow.\n'
  'Fifth, work with processing and underwriting as the file is reviewed.\n'
  'Sixth, understand the decision and help coordinate the resolution of outstanding conditions.\n'
  'Seventh, confirm that the authorized team has issued the required final approval and clear-to-close status.\n'
  'And finally, support a well-coordinated closing and follow-through.\n\n'
  'Notice what I did not say. I did not say that the loan officer personally approves the loan. I did not say that a promising conversation means the borrower is qualified. And I did not say that a file is clear to close because the loan officer believes all the conditions have been satisfied.\n\n'
  'Those distinctions matter.\n\n'
  'Your job is to lead the borrower experience without stepping outside your authority. Be accurate. Be responsive. Document what matters. Ask questions when something does not make sense. And never turn an estimate, an assumption, or an early conversation into a promise.\n\n'
  'By the end of this course, you should be able to explain the stages of a mortgage file, recognize the purpose of each handoff, and identify the next responsible action when a file slows down.\n\n'
  'That is how we lift a loan: one clear step, one accurate decision, and one accountable handoff at a time.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — The file is a journey, not a single event\n'
  '───────────────────────────────────────────────────────\n\n'
  'A mortgage transaction moves through connected stages. Each stage produces information or a decision that the next stage relies on.\n\n'
  'A loan officer should be able to answer three questions at every point:\n\n'
  'Where is the file now? Identify the current stage using the actual system status and the responsible team member''s update.\n\n'
  'What is needed next? Identify the missing information, decision, document, or action.\n\n'
  'Who owns the next step? Distinguish what you must do from what must be completed by the borrower, processor, underwriter, closing team, or another authorized party.\n\n'
  'A file can appear active while still being stalled. "I sent an email" is not the same as confirming that the right person received the information and knows what action is required.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l1, v_course_id,
 'A borrower asks, "Are we approved?" You have discussed a possible loan option, but the file has not completed underwriting. What is the most accurate response?',
 'multiple_choice',
 '[{"label":"A. \"Yes, based on what you told me.\"","is_correct":false},{"label":"B. \"You are approved as long as nothing changes.\"","is_correct":false},{"label":"C. \"We have discussed a possible direction, but the file still needs to go through the required review. I''ll explain the next step and keep you updated.\"","is_correct":true},{"label":"D. \"The processor will decide.\"","is_correct":false}]',
 'Answer C is accurate, does not overstate the file''s status, and gives the borrower a next step.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 2 — Discovery
-- Presenter: Darius James
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l2, v_course_id, v_mod_id,
  'Discovery: Understand the borrower before discussing a solution',
  'How to lead a strong discovery conversation — what to ask, how to record it, and what you must not promise.',
  'video', 2, 2, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 2\n'
  '  Title: Discovery: Understand the borrower before discussing a solution\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 5–6 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'The first stage of the Loan Lift Cycle is discovery.\n\n'
  'Discovery is not simply asking whether someone wants to buy a house. It is the process of understanding what the borrower is trying to accomplish, what facts may affect the transaction, and what information still needs to be verified.\n\n'
  'Start with the purpose. Is the borrower purchasing, refinancing, or exploring another type of financing? What is the expected timing? Is there a property under contract? What does the borrower believe they need from the loan?\n\n'
  'Then understand the broader situation. Ask about employment, income sources, existing obligations, available funds, property plans, and any concerns the borrower wants you to understand. Do not assume that a short answer tells the whole story. A borrower may say, "I make ninety thousand dollars," but that statement alone does not tell you how income will be evaluated for a specific loan.\n\n'
  'Your responsibility is to listen carefully, ask clear follow-up questions, and record information accurately in the approved system.\n\n'
  'Discovery is not underwriting. You are not making a final eligibility decision during the first conversation. You are identifying the facts that will help the team evaluate the file.\n\n'
  'Avoid promising an approval, rate, payment, cash-to-close amount, or closing date based only on an initial conversation. Estimates may change as property details, documentation, program requirements, pricing, and review results become known.\n\n'
  'A strong discovery conversation ends with shared understanding: what the borrower wants to accomplish, what information is known, what remains unknown, and what happens next.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — A useful discovery conversation\n'
  '───────────────────────────────────────────────────────\n\n'
  'Use open-ended questions, then clarify the answer.\n\n'
  'Goal — "What are you hoping to accomplish?" — Purchase, refinance, timing, priorities\n'
  'Property — "Do you have a property identified or under contract?" — Transaction stage and property facts\n'
  'Timing — "What dates are important to you?" — Contract dates, move plans, urgency\n'
  'Employment and income — "How are you paid, and are there any other income sources?" — Income structure—not final qualifying income\n'
  'Funds — "What funds do you expect to use?" — Potential down payment, closing funds, reserves\n'
  'Obligations — "What monthly obligations should we know about?" — Existing debts and possible liabilities\n'
  'Concerns — "What part of the process concerns you most?" — Communication needs and potential issues\n\n'
  'Record facts, not conclusions. For example:\n\n'
  'Better: "Borrower reports hourly employment and variable overtime."\n\n'
  'Not appropriate: "Borrower qualifies using overtime."\n\n'
  'The first records what was reported. The second makes a qualification conclusion that requires documentation and review.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l2, v_course_id,
 'A borrower says they have worked at the same company for five years and "make about $8,000 a month." What should you do?',
 'multiple_choice',
 '[{"label":"A. Enter $8,000 as verified qualifying income.","is_correct":false},{"label":"B. Ask how the borrower is paid, clarify the income components, and follow the approved documentation process.","is_correct":true},{"label":"C. Tell the borrower they should qualify.","is_correct":false},{"label":"D. Ignore the statement until underwriting asks.","is_correct":false}]',
 'A borrower''s description is useful discovery information, not verified qualifying income.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 3 — Qualification
-- Presenter: Darius James
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l3, v_course_id, v_mod_id,
  'Qualification: Build a complete picture before choosing a path',
  'Why qualification requires a complete-file view — and how to handle conflicting information without choosing the version that looks better.',
  'video', 3, 3, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 3\n'
  '  Title: Qualification: Build a complete picture before choosing a path\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 5–6 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Qualification begins with a complete picture—not with a favorite loan program.\n\n'
  'A borrower''s ability to move forward can depend on multiple connected factors: income, assets, credit, liabilities, property, occupancy, transaction purpose, and the requirements of the specific loan program and investor.\n\n'
  'These factors do not operate in isolation. A change in one area may affect another. A new debt may affect the debt-to-income calculation. A different property value may affect the loan-to-value calculation. A change in employment or income documentation may require additional review.\n\n'
  'Your role is to gather accurate information, identify gaps, and coordinate the next review. You should not treat a single number—such as a credit score, income amount, or down payment—as the entire qualification decision.\n\n'
  'Ask yourself: What do we know? What is reported but not documented? What is documented but not reviewed? What needs an authorized decision?\n\n'
  'When information conflicts, do not choose the version that makes the file look better. Identify the conflict and ask the appropriate team member how it should be resolved.\n\n'
  'The right loan strategy comes after understanding the borrower''s goals and the relevant facts. It must also fit current program requirements, lender or investor rules, and HCMG''s approved process.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — Four levels of information\n'
  '───────────────────────────────────────────────────────\n\n'
  'Use these distinctions when discussing a file:\n\n'
  'Borrower-reported: Information the borrower has told you.\n\n'
  'Documented: Information supported by records or documents.\n\n'
  'Reviewed: Information examined by the appropriate person or system.\n\n'
  'Determined: A decision made by the authorized party under the applicable requirements.\n\n'
  'Do not move information from one level to another simply because it seems reasonable.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l3, v_course_id,
 'You notice that the borrower''s application lists a monthly debt that does not appear on the credit report. What is the appropriate action?',
 'multiple_choice',
 '[{"label":"A. Delete it because it is not on the report.","is_correct":false},{"label":"B. Leave it unaddressed because the credit report controls.","is_correct":false},{"label":"C. Document the discrepancy and follow the HCMG process for review.","is_correct":true},{"label":"D. Tell the borrower it will not affect the loan.","is_correct":false}]',
 'Differences between sources should be surfaced and reviewed, not silently resolved by the loan officer.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 4 — Loan Strategy
-- Presenter: Darius James
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l4, v_course_id, v_mod_id,
  'Loan Strategy: Match the borrower''s needs to a reviewed option',
  'How to explore loan options without overpromising — explaining tradeoffs and recognizing when more information is needed first.',
  'video', 4, 4, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 4\n'
  '  Title: Loan Strategy: Match the borrower''s needs to a reviewed option\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 5 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Once you understand the borrower''s goals and have gathered the relevant information, the next task is to explore a loan strategy.\n\n'
  'A loan strategy is more than selecting a product name. It means considering the borrower''s purpose, timeline, property, financial profile, and priorities alongside the requirements of the available programs.\n\n'
  'A borrower may focus on the monthly payment. Another may be most concerned about cash needed to close. Another may need to understand how mortgage insurance, rate structure, or a particular program feature affects the transaction.\n\n'
  'Your job is to explain options clearly and avoid presenting an unreviewed possibility as a guaranteed outcome.\n\n'
  'Use approved pricing and product tools. Follow HCMG''s process for reviewing product eligibility and pricing. When a question falls outside your knowledge or authority, bring in the appropriate subject-matter expert.\n\n'
  'Do not recommend a product solely because it appears to solve one issue. Consider the full transaction and explain tradeoffs in plain language.\n\n'
  'The goal is not to force a file into a product. The goal is to identify a supportable path—or to recognize that more information is needed before a path can be discussed responsibly.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — Explain options without overpromising\n'
  '───────────────────────────────────────────────────────\n\n'
  'A clear explanation includes:\n\n'
  'What the option is intended to accomplish.\n\n'
  'Which borrower facts appear relevant.\n\n'
  'What is still unverified.\n\n'
  'Which requirements must be reviewed.\n\n'
  'What costs, risks, or tradeoffs the borrower should understand.\n\n'
  'What the next step is.\n\n'
  'The Loan Estimate is a standardized document that communicates important loan terms and estimated costs. It is not an approval or denial. The CFPB explains that it is provided after an application and helps the borrower review the proposed terms and costs.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l4, v_course_id,
 'A borrower asks whether a particular program will definitely work. You have not reviewed all required information. Which response is appropriate?',
 'multiple_choice',
 '[{"label":"A. \"Yes, that program is designed for borrowers like you.\"","is_correct":false},{"label":"B. \"I believe so, and we can fix anything later.\"","is_correct":false},{"label":"C. \"It may be an option. I need to verify the relevant information and requirements before I can tell you whether it fits.\"","is_correct":true},{"label":"D. \"Only underwriting can speak with you.\"","is_correct":false}]',
 'Answer C keeps the conversation moving without making an unsupported promise.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 5 — Application, documentation, and the first handoff
-- Presenter: Astrine Covington, President
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l5, v_course_id, v_mod_id,
  'Application, Documentation, and the First Handoff',
  'How to build a clean, accurate application file and hand it off so the receiving team can act without reconstructing the conversation.',
  'video', 5, 5, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 5\n'
  '  Title: Application, Documentation, and the First Handoff\n'
  '  Presenter: Astrine Covington, President\n'
  '  Suggested runtime: 5–6 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'A strong mortgage file begins with accurate information and a clean handoff.\n\n'
  'The application is not a formality. It is a structured record of the borrower, transaction, property, and financial information that will be used throughout the process. Errors or omissions can create confusion, delay review, and require rework.\n\n'
  'As you work with the borrower, explain what information is needed and why. Use only HCMG-approved systems and document channels. Protect borrower information. Do not ask a borrower to send sensitive information through an unapproved method.\n\n'
  'Before handing a file to the next team, review what you entered. Check that the information is internally consistent, that required fields are addressed, and that important facts or open questions are documented.\n\n'
  'A handoff should not force the next person to reconstruct the conversation. It should communicate the transaction, the borrower''s goals, what has been collected, what remains outstanding, and what needs attention.\n\n'
  'The receiving team may identify missing or inconsistent information. That is part of the process. The right response is to resolve the issue, not to treat the question as a personal criticism.\n\n'
  'Our standard is simple: accurate information, clear notes, secure handling, and accountable follow-through.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — The handoff note\n'
  '───────────────────────────────────────────────────────\n\n'
  'A useful handoff note should answer:\n\n'
  'What is the transaction and where does it stand?\n\n'
  'What has the borrower said they want to accomplish?\n\n'
  'What information has been collected?\n\n'
  'What documents or details remain outstanding?\n\n'
  'Are there inconsistencies or time-sensitive issues?\n\n'
  'What action is being requested from the receiving team?\n\n'
  'Who is responsible for communicating the next update?\n\n'
  '⚠ CONFIG: HCMG''s exact application workflow, required fields, secure document channels, and handoff checklist must be inserted from the approved internal procedure before publication.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l5, v_course_id,
 'You are ready to hand off a file, but you know that the borrower''s employment history is incomplete in the system. What should you do?',
 'multiple_choice',
 '[{"label":"A. Send it anyway and assume the next team will find it.","is_correct":false},{"label":"B. Enter an assumption to complete the field.","is_correct":false},{"label":"C. Follow the approved process to complete or clearly flag the missing information before handoff.","is_correct":true},{"label":"D. Tell the borrower the file is complete.","is_correct":false}]',
 'Do not invent information or conceal a known gap.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 6 — Disclosures, estimates, and borrower understanding
-- Presenter: Astrine Covington
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l6, v_course_id, v_mod_id,
  'Disclosures, Estimates, and Borrower Understanding',
  'How to help borrowers understand disclosure documents — and how to respond when a borrower raises a question about what they received.',
  'video', 6, 6, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 6\n'
  '  Title: Disclosures, Estimates, and Borrower Understanding\n'
  '  Presenter: Astrine Covington\n'
  '  Suggested runtime: 5 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Disclosures are part of the borrower''s understanding of the transaction. They are not simply documents to click through.\n\n'
  'The Loan Estimate gives the borrower important information about the loan they have requested, including estimated terms and costs. It does not mean the loan has been approved. The borrower should review it and ask questions when something does not match their understanding.\n\n'
  'As the transaction moves forward, information may change. If the borrower sees a difference between what was discussed and what appears in a disclosure, take the question seriously. Do not guess at the reason. Identify the difference and bring it to the appropriate team member.\n\n'
  'Later, the Closing Disclosure presents final loan terms and closing costs. The CFPB says borrowers must receive it at least three business days before scheduled closing for covered transactions.\n\n'
  'Your responsibility is to help the borrower understand what they are receiving, use the approved process for questions or corrections, and avoid explaining a legal or compliance issue beyond your training.\n\n'
  'Never tell a borrower to ignore a document because "it is just paperwork." If something appears incorrect, raise it promptly.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — How to respond to a disclosure question\n'
  '───────────────────────────────────────────────────────\n\n'
  'Use this sequence:\n\n'
  '1. Listen to the borrower''s question without dismissing it.\n\n'
  '2. Identify the exact document, section, and information they are asking about.\n\n'
  '3. Compare the information with the current approved file information.\n\n'
  '4. Do not alter, promise, or interpret beyond your authority.\n\n'
  '5. Route the issue through the approved HCMG process.\n\n'
  '6. Confirm who will follow up and when.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l6, v_course_id,
 'A borrower says the estimated cash to close on the Loan Estimate is different from what they expected. What should you do?',
 'multiple_choice',
 '[{"label":"A. Tell them the amount is final.","is_correct":false},{"label":"B. Explain that the Loan Estimate is an estimate and dismiss the concern.","is_correct":false},{"label":"C. Review what they are comparing, identify the question, and coordinate an explanation through the approved process.","is_correct":true},{"label":"D. Tell them to wait until closing.","is_correct":false}]',
 'The CFPB encourages borrowers to review the estimate and ask when something differs from expectations. Dismissing the concern or telling them to wait is not appropriate.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 7 — Processing and underwriting: Understand the review
-- Presenter: Astrine Covington
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l7, v_course_id, v_mod_id,
  'Processing and Underwriting: Understand the Review',
  'How to stay engaged during processing and underwriting — responding to requests accurately without trying to do the reviewer''s job.',
  'video', 7, 7, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 7\n'
  '  Title: Processing and Underwriting: Understand the Review\n'
  '  Presenter: Astrine Covington\n'
  '  Suggested runtime: 5–6 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'When a file moves into processing and underwriting, the work becomes more detailed. Information is organized, documentation is reviewed, and the file is evaluated against the requirements that apply to the transaction.\n\n'
  'Processing and underwriting are different functions, even though they work closely together. The exact division of responsibilities follows HCMG''s operating procedures.\n\n'
  'For a loan officer, the important lesson is this: a file being submitted does not mean the review is complete. A file being reviewed does not mean it is approved. And an automated finding does not eliminate the need to understand the full file and follow the applicable process.\n\n'
  'You should stay engaged without trying to perform another team''s job. Be available to clarify information, obtain borrower documents through approved channels, explain the status accurately, and respond to requests.\n\n'
  'When a question comes back, read it carefully. What is being requested? Who must provide it? Is there a deadline? Does the request raise a new question about the file? If you do not understand the request, ask the responsible team member before communicating a conclusion to the borrower.\n\n'
  'The goal is not to rush past review. The goal is to help the file become complete, accurate, and ready for the next decision.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — What a good response to a review request looks like\n'
  '───────────────────────────────────────────────────────\n\n'
  'A useful response should be:\n\n'
  'Specific: Address the actual question or document requested.\n\n'
  'Complete: Include all required information, not only the easiest portion.\n\n'
  'Traceable: Use the approved system and communication method.\n\n'
  'Timely: Follow the assigned priority and deadline.\n\n'
  'Accurate: Never change facts to make a response appear to fit.\n\n'
  'If the borrower''s new information conflicts with what is already in the file, disclose the conflict to the appropriate team member. Do not select whichever version appears more favorable.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l7, v_course_id,
 'Underwriting asks for clarification because two documents show different employment dates. What is the best response?',
 'multiple_choice',
 '[{"label":"A. Use the date that makes the borrower''s history look stronger.","is_correct":false},{"label":"B. Ask the borrower to choose one.","is_correct":false},{"label":"C. Identify the discrepancy, obtain clarification or documentation through the approved process, and route it for review.","is_correct":true},{"label":"D. Change the application without noting the reason.","is_correct":false}]',
 'The conflict must be resolved transparently and reviewed. Never select whichever version appears more favorable.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 8 — Conditions: Turn a decision into an organized action plan
-- Presenter: Darius James
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l8, v_course_id, v_mod_id,
  'Conditions: Turn a Decision into an Organized Action Plan',
  'How to read a condition, identify who provides what, submit correctly, and avoid the mistake of treating upload as clearance.',
  'video', 8, 8, false, 'watch_pct', 80, 360, '6 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 8\n'
  '  Title: Conditions: Turn a Decision into an Organized Action Plan\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 6–7 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Conditions are one of the most important parts of the loan officer''s coordination work.\n\n'
  'A condition is an item that must be addressed as part of the loan review. Conditions may request documents, explanations, updated information, corrections, or confirmation from another party.\n\n'
  'Do not treat a condition as a vague request to "send more paperwork." Read the wording. Understand what is being requested. Identify who can provide it. Determine whether the borrower needs an explanation, whether another HCMG team member must act, and how the response should be submitted.\n\n'
  'A common mistake is sending something that appears related but does not answer the actual condition. Another mistake is assuming that because a document was uploaded, the condition has been cleared. Uploading is an action. Review and acceptance are separate steps.\n\n'
  'Use the actual system status and the responsible team''s confirmation. Keep the borrower informed without promising that a submitted item will be accepted.\n\n'
  'If a condition is unclear, ask for clarification. If the borrower cannot provide the requested item, do not invent a substitute. Escalate through the approved process so the appropriate person can determine what alternatives, if any, are acceptable.\n\n'
  'Your job is to make the condition process organized, understandable, and accountable.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — The condition management method\n'
  '───────────────────────────────────────────────────────\n\n'
  'For every condition, identify:\n\n'
  'What exactly is requested? — Read the condition as written.\n\n'
  'Who can provide it? — Borrower, employer, third party, HCMG team, or another source.\n\n'
  'What makes the response complete? — Confirm the requested period, detail, format, or explanation.\n\n'
  'How is it submitted? — Use the approved system and workflow.\n\n'
  'Who confirms resolution? — The authorized reviewer or team—not the LO''s assumption.\n\n'
  'What happens if it cannot be met? — Escalate; do not create an unapproved workaround.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  TRAINING EXAMPLE (fictional)\n'
  '───────────────────────────────────────────────────────\n\n'
  'A condition requests an explanation and supporting documentation for a deposit. The borrower sends a screenshot of a bank balance. The screenshot may show the balance, but it may not answer the question about the deposit''s source.\n\n'
  'The correct action is not to declare the condition satisfied. The LO should compare the response with the condition, identify what remains unanswered, and ask the appropriate team member what documentation is acceptable.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l8, v_course_id,
 'A borrower uploads a document that you believe satisfies a condition. What should you tell them?',
 'multiple_choice',
 '[{"label":"A. \"That condition is cleared.\"","is_correct":false},{"label":"B. \"The document has been submitted. The reviewing team must confirm whether it satisfies the condition.\"","is_correct":true},{"label":"C. \"You are clear to close.\"","is_correct":false},{"label":"D. \"No further review is needed.\"","is_correct":false}]',
 'Submission is not the same as acceptance. Only the authorized reviewer can confirm a condition is cleared.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 9 — Approval, clear to close, and the limits of your authority
-- Presenter: Darius James
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l9, v_course_id, v_mod_id,
  'Approval, Clear to Close, and the Limits of Your Authority',
  'The difference between conditional approval, conditions cleared, and clear to close — and why only the authorized HCMG process can confirm CTC.',
  'video', 9, 9, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 9\n'
  '  Title: Approval, Clear to Close, and the Limits of Your Authority\n'
  '  Presenter: Darius James\n'
  '  Suggested runtime: 5–6 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Approval is an important milestone, but you must understand what the actual status means.\n\n'
  'A file may receive a decision that includes conditions. A conditional approval is not the same as final approval. A condition may require additional documents, updated information, or another review.\n\n'
  'The loan officer should read the actual decision, understand the remaining requirements, and coordinate the next actions. Do not summarize a conditional decision as "you are all set."\n\n'
  'Clear to close is a separate milestone in the transaction. It means the authorized process has reached the point where the file may proceed to closing under the applicable requirements. The loan officer must rely on the official HCMG status and confirmation—not a personal interpretation of the conditions.\n\n'
  'This distinction protects the borrower and the company. If you tell a borrower that they are clear to close before the authorized team has confirmed it, you may create expectations that the file cannot meet.\n\n'
  'If a borrower asks, "Are we clear to close?" and the official status has not been confirmed, say so plainly. Explain what remains and who is checking it. Then follow through.\n\n'
  'A strong loan officer is not the person who says "yes" fastest. A strong loan officer is the person who gives the borrower accurate information and keeps the transaction moving through the right process.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — Status language to use carefully\n'
  '───────────────────────────────────────────────────────\n\n'
  'Submitted — The file or item has been sent into a review process. It does not mean it has been accepted.\n\n'
  'In review — A review is underway. It does not mean a decision has been made.\n\n'
  'Conditional approval — A decision has been issued with requirements that still need to be addressed.\n\n'
  'Conditions submitted — Responses have been sent. It does not mean they have been cleared.\n\n'
  'Conditions cleared — The authorized team has confirmed the relevant conditions are resolved. Confirm the actual file status.\n\n'
  'Clear to close — Use only when the official HCMG process confirms this status.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l9, v_course_id,
 'The borrower has uploaded every document you requested. You have not received confirmation from the authorized team. What is the accurate status?',
 'multiple_choice',
 '[{"label":"A. Clear to close.","is_correct":false},{"label":"B. Approved.","is_correct":false},{"label":"C. Documents submitted; awaiting review or confirmation.","is_correct":true},{"label":"D. Closed.","is_correct":false}]',
 'Uploading documents is an action, not a status confirmation. Only the authorized team can confirm review results.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 10 — Closing and follow-through
-- Presenter: Astrine Covington
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l10, v_course_id, v_mod_id,
  'Closing and Follow-Through',
  'How to support a well-coordinated closing, protect against wire fraud, and complete post-closing responsibilities.',
  'video', 10, 10, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 10\n'
  '  Title: Closing and Follow-Through\n'
  '  Presenter: Astrine Covington\n'
  '  Suggested runtime: 5 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'The closing stage is where the borrower''s work and the team''s work come together. It is also where careful communication matters.\n\n'
  'Do not treat "clear to close," signing, funding, and recording as interchangeable terms. They describe different events. The exact sequence and responsibilities depend on the transaction, jurisdiction, and HCMG''s closing process.\n\n'
  'Your role is to help the borrower know what to expect, coordinate questions to the correct team, and avoid giving instructions that conflict with the closing team''s direction.\n\n'
  'If the borrower has a question about the final terms or costs, take it seriously. The Closing Disclosure provides final details about the loan terms and closing costs. For covered transactions, the borrower must receive it at least three business days before closing. The borrower should review it and raise questions promptly.\n\n'
  'If something changes close to closing—such as a financial change, property issue, document concern, or timing problem—do not assume it is harmless. Notify the appropriate team through the approved process.\n\n'
  'After closing, complete the HCMG follow-through required for your role. Make sure the borrower knows whom to contact for questions, and maintain the professional relationship. A closed loan is a milestone, not the end of the borrower relationship.\n\n'
  '───────────────────────────────────────────────────────\n'
  '  COMPANION ARTICLE — Closing communication checklist\n'
  '───────────────────────────────────────────────────────\n\n'
  'Before communicating a closing update, confirm:\n\n'
  'The current official file status.\n\n'
  'The date and time confirmed by the responsible closing party.\n\n'
  'Whether the borrower has received the required documents.\n\n'
  'Whether there are open questions or changes requiring attention.\n\n'
  'Which party is responsible for the next communication.\n\n'
  'Whether the borrower has been directed to use verified payment or wire instructions.\n\n'
  '⚠ CONFIG (WIRE FRAUD WARNING): Never tell a borrower to rely on changed wire instructions received by email without following the company''s approved verification procedure. Insert HCMG''s exact wire-fraud warning and verification steps before publishing this lesson.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l10, v_course_id,
 'A borrower emails you new wire instructions they say came from the title company. What should you do?',
 'multiple_choice',
 '[{"label":"A. Forward them to the borrower and say they look correct.","is_correct":false},{"label":"B. Tell the borrower to use them if the email has the title company''s logo.","is_correct":false},{"label":"C. Follow HCMG''s approved verification procedure and direct the borrower to the authorized closing contact.","is_correct":true},{"label":"D. Ignore the message.","is_correct":false}]',
 'Wire fraud is a serious risk in mortgage closings. Always follow HCMG''s approved verification procedure before acting on changed wire instructions, regardless of how legitimate they appear.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 11 — The Loan Lift handoff: Own your part, respect the next role
-- Presenter: Lamont Harris Jr., CEO
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l11, v_course_id, v_mod_id,
  'The Loan Lift Handoff: Own Your Part, Respect the Next Role',
  'CEO Lamont Harris Jr. on accountability, team handoffs, and why how you transfer a file is as important as what you put in it.',
  'video', 11, 11, false, 'watch_pct', 80, 180, '3 min',
  E'═══════════════════════════════════════════════════════\n'
  '  VIDEO SCRIPT — Lesson 11\n'
  '  Title: The Loan Lift Handoff: Own Your Part, Respect the Next Role\n'
  '  Presenter: Lamont Harris Jr., CEO\n'
  '  Suggested runtime: 3–4 minutes\n'
  '═══════════════════════════════════════════════════════\n\n'
  'At HCMG, every loan is supported by people who have different responsibilities. The borrower may experience one company, but the work is shared across a team.\n\n'
  'That means our handoffs matter.\n\n'
  'A handoff is not simply moving a file from one person''s queue to another. It is transferring accurate information, identifying what remains open, and making sure the next person understands what is needed.\n\n'
  'Respect the expertise of the people working beside you. Ask questions when you do not understand a process. Raise issues early. Do not hide a problem because you are worried about how it will look.\n\n'
  'Accountability means owning your next action. It does not mean taking over every role or making decisions outside your authority.\n\n'
  'Our standard is to communicate clearly, treat borrowers and teammates professionally, and protect the integrity of the file. When you see a problem, surface it. When you make a mistake, correct it through the proper process. When you make a commitment, follow through.\n\n'
  'The Loan Lift Cycle works when each person does their part and the team can trust the information being handed forward.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l11, v_course_id,
 'A file is delayed because you did not complete a promised follow-up. What is the accountable response?',
 'multiple_choice',
 '[{"label":"A. Wait until someone asks.","is_correct":false},{"label":"B. Blame the next department.","is_correct":false},{"label":"C. Acknowledge the missed action, complete or escalate it, and communicate the updated next step.","is_correct":true},{"label":"D. Change the file notes to make the follow-up appear complete.","is_correct":false}]',
 'Accountability means owning your next action and following through. Concealing a missed step or blaming others is not acceptable.',
 1);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 12 — Final Assessment (knowledge_check)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l12, v_course_id, v_mod_id,
  'Loan Lift Cycle — Final Assessment',
  'Twelve questions covering all stages of the Loan Lift Cycle. Passing score: 80%. Feedback is shown after each response.',
  'knowledge_check', 12, 12, false, 'quiz_pass', 80, 900, '15 min',
  NULL
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 13 — Job Aid (text)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l13, v_course_id, v_mod_id,
  'Loan Lift Cycle — Job Aid',
  'A one-page reference: the 10-stage file map, the five rules to remember, and CFPB source links.',
  'text', 13, 13, false, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  JOB AID — Loan Lift Cycle at a Glance\n'
  '═══════════════════════════════════════════════════════\n\n'
  'THE 10-STAGE FILE MAP\n\n'
  '1. Discover — Understand goals, timing, and borrower-reported facts.\n\n'
  '2. Build the picture — Gather information and identify gaps or conflicts.\n\n'
  '3. Explore strategy — Discuss supportable options; verify before promising.\n\n'
  '4. Complete the application — Enter accurate information through approved systems.\n\n'
  '5. Handoff — Communicate status, open items, and requested action.\n\n'
  '6. Review — Coordinate with processing and underwriting; respond to questions.\n\n'
  '7. Resolve conditions — Match each response to the actual request; await confirmation.\n\n'
  '8. Confirm final status — Rely on the authorized HCMG clear-to-close confirmation.\n\n'
  '9. Coordinate closing — Keep communication accurate and route issues promptly.\n\n'
  '10. Follow through — Complete assigned post-closing actions and maintain the relationship.\n\n'
  '═══════════════════════════════════════════════════════\n'
  '  THE FIVE RULES TO REMEMBER\n'
  '═══════════════════════════════════════════════════════\n\n'
  '1. Do not turn an estimate into a promise.\n\n'
  '2. Do not turn borrower-reported information into verified information.\n\n'
  '3. Do not treat submission as acceptance.\n\n'
  '4. Do not declare approval or clear to close without the authorized status.\n\n'
  '5. Do not hide a discrepancy—surface it and follow the process.\n\n'
  '═══════════════════════════════════════════════════════\n'
  '  SOURCES FOR LEARNER REFERENCE\n'
  '═══════════════════════════════════════════════════════\n\n'
  'CFPB — What is a Loan Estimate?\n'
  'https://www.consumerfinance.gov/ask-cfpb/what-is-a-loan-estimate-en-1995/\n\n'
  'CFPB — Loan Estimate Explainer\n'
  'https://www.consumerfinance.gov/owning-a-home/loan-estimate/\n\n'
  'CFPB — Closing Disclosure Explainer\n'
  'https://www.consumerfinance.gov/owning-a-home/closing-disclosure/'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FINAL ASSESSMENT QUESTIONS (12 questions, uni_quiz_questions for lesson 12)
-- These are also linked to uni_assessments via uni_assessment_questions
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_quiz_questions (id, lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_q1, v_l12, v_course_id,
 'What is the primary purpose of discovery?',
 'multiple_choice',
 '[{"label":"A. To approve the borrower","is_correct":false},{"label":"B. To understand the borrower''s goals and gather relevant facts","is_correct":true},{"label":"C. To select a product before reviewing the file","is_correct":false},{"label":"D. To promise a closing date","is_correct":false}]',
 'Discovery establishes the borrower''s goals and the facts that need to be evaluated. It is not underwriting and it does not produce an approval.',
 1),

(v_q2, v_l12, v_course_id,
 'Which statement best describes borrower-reported information?',
 'multiple_choice',
 '[{"label":"A. It is automatically verified.","is_correct":false},{"label":"B. It is a final underwriting decision.","is_correct":false},{"label":"C. It is information provided by the borrower that may require documentation and review.","is_correct":true},{"label":"D. It should not be recorded.","is_correct":false}]',
 'Borrower-reported information is the starting point. It must be documented, then reviewed and determined through the appropriate process before it can be relied upon for qualification.',
 2),

(v_q3, v_l12, v_course_id,
 'A borrower asks whether they are approved before underwriting review is complete. What should you do?',
 'multiple_choice',
 '[{"label":"A. Give a conditional yes.","is_correct":false},{"label":"B. Explain the current status and next step accurately.","is_correct":true},{"label":"C. Tell them to ask the processor.","is_correct":false},{"label":"D. Avoid answering.","is_correct":false}]',
 'The loan officer''s job is to give the borrower accurate information. A conditional or evasive answer is not appropriate. Explain the current stage and what happens next.',
 3),

(v_q4, v_l12, v_course_id,
 'What should a useful handoff communicate?',
 'multiple_choice',
 '[{"label":"A. Only the borrower''s name","is_correct":false},{"label":"B. Only the documents received","is_correct":false},{"label":"C. Transaction status, known facts, open items, requested action, and ownership","is_correct":true},{"label":"D. The LO''s personal opinion of approval","is_correct":false}]',
 'A handoff transfers accurate information and identifies what remains open. The receiving team must be able to act without reconstructing the conversation.',
 4),

(v_q5, v_l12, v_course_id,
 'What does a Loan Estimate communicate?',
 'multiple_choice',
 '[{"label":"A. Final approval","is_correct":false},{"label":"B. Important loan terms and estimated costs","is_correct":true},{"label":"C. Clear-to-close status","is_correct":false},{"label":"D. Guaranteed cash to close","is_correct":false}]',
 'The CFPB states that a Loan Estimate is not an approval or denial. It communicates important information about the loan terms and estimated costs and helps the borrower review the proposed transaction.',
 5),

(v_q6, v_l12, v_course_id,
 'A condition response has been uploaded. What must happen before you say the condition is cleared?',
 'multiple_choice',
 '[{"label":"A. The borrower confirms upload.","is_correct":false},{"label":"B. The LO reviews the filename.","is_correct":false},{"label":"C. The authorized reviewer confirms the response satisfies the condition.","is_correct":true},{"label":"D. The document appears in the system.","is_correct":false}]',
 'Submission is not acceptance. Only the authorized reviewer or team can confirm a condition is cleared.',
 6),

(v_q7, v_l12, v_course_id,
 'You find conflicting information in two documents. What is the correct action?',
 'multiple_choice',
 '[{"label":"A. Use the more favorable information.","is_correct":false},{"label":"B. Delete one document.","is_correct":false},{"label":"C. Surface the discrepancy and follow the approved review process.","is_correct":true},{"label":"D. Wait for the borrower to notice.","is_correct":false}]',
 'Conflicts between sources must be identified and reviewed. Never choose the version that makes the file look better or conceal a discrepancy.',
 7),

(v_q8, v_l12, v_course_id,
 'Which statement about conditional approval is accurate?',
 'multiple_choice',
 '[{"label":"A. It means the loan is closed.","is_correct":false},{"label":"B. It means no additional documents are needed.","is_correct":false},{"label":"C. It includes requirements that must still be addressed.","is_correct":true},{"label":"D. It is the same as clear to close.","is_correct":false}]',
 'A conditional approval is not final approval. It means a decision has been issued but specific requirements must still be addressed before the file can proceed.',
 8),

(v_q9, v_l12, v_course_id,
 'Who confirms HCMG''s official clear-to-close status?',
 'multiple_choice',
 '[{"label":"A. Any team member who believes the file is ready","is_correct":false},{"label":"B. The borrower","is_correct":false},{"label":"C. The authorized HCMG process and responsible team","is_correct":true},{"label":"D. The real estate agent","is_correct":false}]',
 'Clear to close must come from the authorized HCMG process. The loan officer must not declare CTC based on a personal interpretation of the conditions.',
 9),

(v_q10, v_l12, v_course_id,
 'A borrower questions a difference between the Loan Estimate and Closing Disclosure. What should you do?',
 'multiple_choice',
 '[{"label":"A. Tell them the difference is normal.","is_correct":false},{"label":"B. Tell them to sign anyway.","is_correct":false},{"label":"C. Identify the question and route it through the approved process for explanation or correction.","is_correct":true},{"label":"D. Change the figures yourself.","is_correct":false}]',
 'The CFPB advises borrowers to review the Closing Disclosure and raise questions about differences from the Loan Estimate. Take the concern seriously and route it through the correct process.',
 10),

(v_q11, v_l12, v_course_id,
 'A borrower sends changed wire instructions by email. What is the correct response?',
 'multiple_choice',
 '[{"label":"A. Accept them if the sender''s email looks familiar.","is_correct":false},{"label":"B. Follow HCMG''s verification procedure and use an authorized closing contact.","is_correct":true},{"label":"C. Forward them without comment.","is_correct":false},{"label":"D. Tell the borrower to decide.","is_correct":false}]',
 'Wire fraud is a serious risk. Always follow HCMG''s approved verification procedure and direct the borrower to an authorized closing contact before acting on any changed wire instructions.',
 11),

(v_q12, v_l12, v_course_id,
 'What does accountability mean in a team handoff?',
 'multiple_choice',
 '[{"label":"A. Doing every department''s work","is_correct":false},{"label":"B. Owning your action, communicating clearly, and respecting role authority","is_correct":true},{"label":"C. Avoiding escalation","is_correct":false},{"label":"D. Keeping problems private","is_correct":false}]',
 'Accountability means owning your next action, communicating clearly, and respecting the roles of other team members. It does not mean taking over other functions or hiding problems.',
 12);

-- ═══════════════════════════════════════════════════════════════════════════
-- ASSESSMENT RECORD
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_assessments (
  id, course_id, lesson_id,
  title, description, assessment_type,
  passing_pct, is_required, is_active,
  max_attempts, randomize_questions, show_answers_after,
  instructions
) VALUES (
  v_assessment_id,
  v_course_id,
  v_l12,
  'Loan Lift Cycle — Certification Assessment',
  'Twelve questions covering all stages of the Loan Lift Cycle. You must answer at least 10 of 12 questions correctly to pass.',
  'certification_exam',
  80,
  true,
  true,
  NULL,
  false,
  true,
  E'This assessment covers all 11 lessons of The HCMG Loan Lift Cycle.\n\n'
  'Passing score: 80% (10 of 12 questions correct).\n\n'
  'You must complete all lessons before taking this assessment.\n\n'
  'Feedback is shown after each response.\n\n'
  'Number of allowed attempts: ⚠ CONFIG — HCMG to configure before publication.\n\n'
  'This assessment tests the workflow and judgment expected of a loan officer. It does not replace current investor guidelines, compliance training, HCMG policies, or direction from underwriting and operations.'
);

INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order) VALUES
  (v_assessment_id, v_q1,  1),
  (v_assessment_id, v_q2,  2),
  (v_assessment_id, v_q3,  3),
  (v_assessment_id, v_q4,  4),
  (v_assessment_id, v_q5,  5),
  (v_assessment_id, v_q6,  6),
  (v_assessment_id, v_q7,  7),
  (v_assessment_id, v_q8,  8),
  (v_assessment_id, v_q9,  9),
  (v_assessment_id, v_q10, 10),
  (v_assessment_id, v_q11, 11),
  (v_assessment_id, v_q12, 12);

-- ═══════════════════════════════════════════════════════════════════════════
-- CERTIFICATE CONFIG
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_certificate_config (
  course_id, issue_certificate, renewal_mode,
  include_verification, trigger_assessment_id
) VALUES (
  v_course_id,
  true,
  'manual',
  true,
  v_assessment_id
);

END $$;

-- ═══════════════════════════════════════════════════════════════════════════
-- QA SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════
SELECT
  c.title,
  c.slug,
  c.content_status,
  c.sort_order,
  COUNT(DISTINCT l.id) AS lessons,
  COUNT(DISTINCT q.id) AS quiz_questions
FROM uni_courses c
LEFT JOIN uni_lessons l ON l.course_id = c.id
LEFT JOIN uni_quiz_questions q ON q.course_id = c.id
WHERE c.slug = 'fast-track-loan-lift-cycle'
GROUP BY c.id, c.title, c.slug, c.content_status, c.sort_order;
