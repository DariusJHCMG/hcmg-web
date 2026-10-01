-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Welcome to HCMG: New Team Member Orientation
--
-- Audience  : All new HCMG team members (including Loan Officers)
-- Duration  : 60 minutes
-- Required  : Yes
-- Pass score: 80%
-- Certificate: Yes (existing HCMG U certificate workflow)
--
-- Structure:
--   9 modules × 1 video lesson each (HeyGen avatar scripts included)
--   9 per-lesson knowledge checks (1–3 questions each, inline on the lesson)
--   1 final assessment lesson (12 questions, knowledge_check type)
--   1 uni_assessments record (certification_exam, linked to final lesson)
--   1 uni_certificate_config record
--
-- Idempotent: deletes prior run by slug before re-inserting.
--
-- ⚠ CONFIGURATION TASKS — items requiring internal review before publication:
--   - Presenter names and confirmed titles
--   - Approved leadership video recordings (HeyGen or recorded)
--   - Harry the Bear artwork and voice asset approval
--   - Current internal org chart / reporting structure
--   - Verified internal system URLs (ARIVE, CRM, portal, help desk)
--   - Approved descriptions of HCMG ecosystem programs (SLICE, EPO, IRP)
--   - Escalation contacts and channels
--   - Current role-specific onboarding pathways
--   - Policy and compliance document references
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_course_id   uuid := gen_random_uuid();
  v_admin_id    uuid := '736a599a-492a-4585-b845-74b264d0ac9e';
  v_assessment_id uuid := gen_random_uuid();

  -- Module IDs
  v_mod1  uuid := gen_random_uuid();  -- Welcome to HCMG
  v_mod2  uuid := gen_random_uuid();  -- Who We Are
  v_mod3  uuid := gen_random_uuid();  -- How HCMG Is Organized
  v_mod4  uuid := gen_random_uuid();  -- The HCMG Ecosystem
  v_mod5  uuid := gen_random_uuid();  -- Freedom and Accountability
  v_mod6  uuid := gen_random_uuid();  -- Compliance and Professional Standards
  v_mod7  uuid := gen_random_uuid();  -- Technology and Resources
  v_mod8  uuid := gen_random_uuid();  -- Your Development Path
  v_mod9  uuid := gen_random_uuid();  -- The HCMG Standard and Commitment

  -- Lesson IDs (one video per module + final assessment lesson)
  v_l1    uuid := gen_random_uuid();  -- Module 1 video
  v_l2    uuid := gen_random_uuid();  -- Module 2 video
  v_l3    uuid := gen_random_uuid();  -- Module 3 video
  v_l4    uuid := gen_random_uuid();  -- Module 4 video
  v_l5    uuid := gen_random_uuid();  -- Module 5 video
  v_l6    uuid := gen_random_uuid();  -- Module 6 video
  v_l7    uuid := gen_random_uuid();  -- Module 7 video
  v_l8    uuid := gen_random_uuid();  -- Module 8 video
  v_l9    uuid := gen_random_uuid();  -- Module 9 video
  v_l10   uuid := gen_random_uuid();  -- Final assessment (knowledge_check)

BEGIN

-- ═══════════════════════════════════════════════════════════════════════════
-- IDEMPOTENT CLEANUP
-- ═══════════════════════════════════════════════════════════════════════════
DELETE FROM uni_courses WHERE slug = 'new-team-member-orientation';

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
  'new-team-member-orientation',
  'Welcome to HCMG: New Team Member Orientation',
  'Everything you need to know to start strong at HCMG.',
  E'This required orientation course introduces every new HCMG team member to who we are, how we operate, the tools and systems you will use, the standards we hold, and the development path ahead of you.\n\n'
  'Completing this course is your first step as an official member of the HCMG team.\n\n'
  'Nine modules. Sixty minutes. Everything you need to start strong.',
  'general',
  'beginner',
  '60 min',
  'orange',
  true,
  true,
  5,
  'published',
  'All New HCMG Team Members',
  'Harry',
  '{"require_all_lessons": true, "require_assessment": true, "passing_score": 80}',
  v_admin_id
);

-- ═══════════════════════════════════════════════════════════════════════════
-- LEARNING OBJECTIVES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_course_objectives (id, course_id, objective, sort_order) VALUES
  (gen_random_uuid(), v_course_id, 'Describe HCMG''s mission, values, and origin story', 1),
  (gen_random_uuid(), v_course_id, 'Identify the key roles and departments in the HCMG organization', 2),
  (gen_random_uuid(), v_course_id, 'Explain the HCMG ecosystem — programs, platforms, and partnerships', 3),
  (gen_random_uuid(), v_course_id, 'Understand the HCMG approach to freedom and accountability', 4),
  (gen_random_uuid(), v_course_id, 'Know the compliance and professional standards expected of every team member', 5),
  (gen_random_uuid(), v_course_id, 'Identify the core technology tools used at HCMG', 6),
  (gen_random_uuid(), v_course_id, 'Understand the HCMG development path and training framework', 7),
  (gen_random_uuid(), v_course_id, 'Affirm personal commitment to the HCMG Standard', 8);

-- ═══════════════════════════════════════════════════════════════════════════
-- MODULES
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_modules (id, course_id, title, description, sort_order, is_active) VALUES
  (v_mod1, v_course_id, 'Module 1: Welcome to HCMG',                      'A personal welcome from leadership and an overview of what this orientation will cover.', 1, true),
  (v_mod2, v_course_id, 'Module 2: Who We Are',                            'The HCMG story, mission, values, and what makes this team different.', 2, true),
  (v_mod3, v_course_id, 'Module 3: How HCMG Is Organized',                 'Team structure, key roles, departments, and how the organization operates day to day.', 3, true),
  (v_mod4, v_course_id, 'Module 4: The HCMG Ecosystem',                    'The programs, platforms, and partnerships that make the HCMG system work.', 4, true),
  (v_mod5, v_course_id, 'Module 5: How We Work — Freedom and Accountability', 'The HCMG operating philosophy: what freedom looks like here and what accountability means.', 5, true),
  (v_mod6, v_course_id, 'Module 6: Compliance and Professional Standards',  'The non-negotiable standards that every HCMG team member must uphold.', 6, true),
  (v_mod7, v_course_id, 'Module 7: Technology and Resources',               'The tools, systems, and resources you will use from day one.', 7, true),
  (v_mod8, v_course_id, 'Module 8: Your Development Path',                  'How HCMG invests in your growth — training, coaching, and progression.', 8, true),
  (v_mod9, v_course_id, 'Module 9: The HCMG Standard and Commitment',       'What the HCMG Standard means in practice and your personal commitment as a team member.', 9, true);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 1: WELCOME TO HCMG  (5 min)
-- ═══════════════════════════════════════════════════════════════════════════
-- 🎬 HEYGEN VIDEO — attach URL after production
-- ⚠ CONFIG: Confirm presenter name and title before publication
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l1, v_course_id, v_mod1,
  'Welcome to HCMG',
  'A personal welcome from leadership — who HCMG is, why this orientation matters, and what the next 60 minutes will cover.',
  'video', 1, 1, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Module 1\n'
  '  Title: Welcome to HCMG\n'
  '  Speaker: [PRESENTER NAME AND TITLE — CONFIRM BEFORE PRODUCTION]\n'
  '  Background: HCMG branded\n'
  '  On-screen: HCMG logo, "Welcome to the Team"\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Welcome to HCMG.\n\n'
  'I''m glad you''re here.\n\n'
  'Joining a new team is a big deal. And we don''t take lightly the fact that you chose to build your career here.\n\n'
  'This orientation is not a formality. It is the beginning of how we do things at HCMG.\n\n'
  'In the next 60 minutes, you are going to learn who we are, how we operate, what we expect, and what we are committed to providing you in return.\n\n'
  'You will learn about our mission, our values, and our story.\n\n'
  'You will learn how the organization is structured and who does what.\n\n'
  'You will learn the tools you will use, the standards you will be held to, and the development path that is in front of you.\n\n'
  'And at the end, you will have the opportunity to make your own commitment to this team.\n\n'
  'That commitment is not a checkbox.\n\n'
  'It is the foundation of everything we build together.\n\n'
  'Let''s get started.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l1, v_course_id,
 'What is the purpose of this orientation course?',
 'multiple_choice',
 '[{"label":"A formality required by HR","is_correct":false},{"label":"To introduce you to who HCMG is, how it operates, and what is expected of you","is_correct":true},{"label":"A product knowledge certification","is_correct":false},{"label":"An optional overview for new employees","is_correct":false}]',
 'This orientation is the beginning of how HCMG does things — not a formality. It establishes the foundation for your time here.',
 1);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 2: WHO WE ARE  (6 min)
-- ═══════════════════════════════════════════════════════════════════════════
-- 🎬 HEYGEN VIDEO — attach URL after production
-- ⚠ CONFIG: Confirm HCMG founding story details and approved company history before production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l2, v_course_id, v_mod2,
  'Who We Are',
  'The HCMG story, mission, core values — Teamwork, Integrity, Innovation, Excellence, Community, Accountability — and what makes this team different.',
  'video', 2, 1, true, 'watch_pct', 80, 360, '6 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Module 2\n'
  '  Title: Who We Are\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen: HCMG mission statement, values list\n'
  '  ⚠ CONFIG: Confirm founding story details and approved history before production\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Harris Capital Mortgage Group — HCMG — was built on a simple belief:\n\n'
  'That people deserve a mortgage experience that actually works for them.\n\n'
  'Not confusing. Not slow. Not impersonal.\n\n'
  'Transparent, responsive, and built around what the borrower actually needs.\n\n'
  'That belief drove everything from the beginning, and it still drives everything today.\n\n'
  'Our mission is to help families and individuals achieve homeownership and financial stability through the mortgage process — and to do it with the highest standard of professionalism and care.\n\n'
  'Our values are not a poster on the wall.\n\n'
  'They are the standard we hold ourselves to every day.\n\n'
  'Teamwork.\n\n'
  'We do not operate as isolated individuals. We win together.\n\n'
  'Integrity.\n\n'
  'We do what we say we are going to do. We communicate honestly, even when it is difficult.\n\n'
  'Innovation.\n\n'
  'We are always willing to improve. We do not hold on to the way things have always been done if a better way exists.\n\n'
  'Excellence.\n\n'
  'Good enough is not the finish line. We pursue a standard that most teams are not willing to work toward.\n\n'
  'Community.\n\n'
  'We understand that our work affects more than just ourselves. We take that responsibility seriously.\n\n'
  'Accountability.\n\n'
  'We own our responsibilities and our actions. We do not look for someone else to blame.\n\n'
  'That is who we are.\n\n'
  'That is what you are now part of.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l2, v_course_id,
 'Which of the following is one of HCMG''s core values?',
 'multiple_choice',
 '[{"label":"Competition","is_correct":false},{"label":"Integrity","is_correct":true},{"label":"Speed","is_correct":false},{"label":"Profit","is_correct":false}]',
 'HCMG''s six values are Teamwork, Integrity, Innovation, Excellence, Community, and Accountability. These are behavioral standards, not marketing slogans.',
 1),
(v_l2, v_course_id,
 'What does Accountability mean at HCMG?',
 'multiple_choice',
 '[{"label":"Finding someone to blame when things go wrong","is_correct":false},{"label":"Owning your responsibilities and actions","is_correct":true},{"label":"Reporting underperformers to management","is_correct":false},{"label":"Tracking metrics only","is_correct":false}]',
 'Accountability at HCMG means ownership — taking responsibility for your actions and your results, not assigning blame.',
 2);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 3: HOW HCMG IS ORGANIZED  (5 min)
-- ═══════════════════════════════════════════════════════════════════════════
-- 🎬 HEYGEN VIDEO — attach URL after production
-- ⚠ CONFIG: Confirm org chart, confirmed role titles, and reporting structure before production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l3, v_course_id, v_mod3,
  'How HCMG Is Organized',
  'Team structure, key roles — Loan Officers, Branch Managers, Operations, Processing, Compliance — and how they work together on every file.',
  'video', 3, 1, true, 'watch_pct', 80, 300, '5 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Module 3\n'
  '  Title: How HCMG Is Organized\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen: org chart visual — confirm before production\n'
  '  ⚠ CONFIG: Replace placeholder role descriptions with confirmed internal structure\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Understanding how HCMG is organized will help you know who to go to, when to go to them, and why the structure exists.\n\n'
  'At the center of everything is the loan file and the borrower.\n\n'
  'Every role in this organization exists to serve that outcome.\n\n'
  'Loan Officers originate. They are the front line of client relationships.\n\n'
  'Branch Managers and Team Leads lead the origination team. They are responsible for activity, culture, accountability, and development on their teams.\n\n'
  'Operations — including Processing and Closing — moves the loan from application to the closing table. They depend on clean files and clear communication from the origination side.\n\n'
  'Compliance ensures that every transaction meets the regulatory and policy standards we are required to uphold. This is not optional. It is non-negotiable.\n\n'
  'Leadership sets direction, removes obstacles, and holds the organization accountable to its standards.\n\n'
  'HCMG University supports your development across all roles.\n\n'
  'No department operates in isolation.\n\n'
  'Every handoff matters.\n\n'
  'Every role is responsible to the next one in the chain.\n\n'
  '⚠ [INSERT APPROVED ORG CHART REFERENCE OR VISUAL — confirm with leadership before publication]'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l3, v_course_id,
 'What is the primary responsibility of HCMG''s Operations team?',
 'multiple_choice',
 '[{"label":"Originating new loans","is_correct":false},{"label":"Moving loans from application to closing","is_correct":true},{"label":"Setting compensation policy","is_correct":false},{"label":"Managing HCMG University","is_correct":false}]',
 'Operations — including Processing and Closing — is responsible for moving the loan from application to the closing table. They rely on clean files and clear communication from origination.',
 1);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 4: THE HCMG ECOSYSTEM  (7 min)
-- ═══════════════════════════════════════════════════════════════════════════
-- 🎬 HEYGEN VIDEO — attach URL after production
-- ⚠ CONFIG: Confirm approved descriptions of all HCMG programs before production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l4, v_course_id, v_mod4,
  'The HCMG Ecosystem',
  'An overview of the programs, platforms, and partnerships that make the HCMG system work — including HCMG University, SLICE, and the employer benefit programs.',
  'video', 4, 1, true, 'watch_pct', 80, 420, '7 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Module 4\n'
  '  Title: The HCMG Ecosystem\n'
  '  Speaker: Harry (avatar)\n'
  '  ⚠ CONFIG: Confirm approved descriptions of all programs listed below before production\n'
  '═══════════════════════════════════════════════════════\n\n'
  'HCMG is more than a mortgage company.\n\n'
  'It is an ecosystem.\n\n'
  'Understanding the full system helps you serve borrowers better, open more conversations, and understand the business you are part of.\n\n'
  'Here is what makes up that ecosystem.\n\n'
  'HCMG University is your internal training platform. Everything you need to grow — from orientation to Harry''s Playbook to compensation training — lives here. Required training is assigned here. Your progress is tracked here. Your certificates are issued here.\n\n'
  'SLICE by HCMG is [⚠ CONFIG: insert approved SLICE program description].\n\n'
  'The Employer Benefit Programs allow HCMG to partner with employers to offer mortgage benefits directly to their employees. [⚠ CONFIG: insert approved program description and current program names].\n\n'
  'The Internal Referral Program — IRP — allows HCMG Loan Officers to refer transactions in states where they are not yet licensed to a licensed HCMG LO, with a defined compensation split. You learned about this in the Compensation course.\n\n'
  'Our lending platform and point-of-sale systems — [⚠ CONFIG: insert current confirmed system names] — are the tools you use to take applications, manage pipelines, and communicate with borrowers and the operations team.\n\n'
  'This ecosystem exists to give you everything you need to serve borrowers at the highest level.\n\n'
  'Know the tools. Use the resources. Ask when you are not sure.\n\n'
  'That is how you succeed here.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l4, v_course_id,
 'What is HCMG University?',
 'multiple_choice',
 '[{"label":"A public online school for mortgage professionals","is_correct":false},{"label":"HCMG''s internal training platform where required training, progress tracking, and certificates live","is_correct":true},{"label":"A compliance-only portal","is_correct":false},{"label":"A tool for managing borrower applications","is_correct":false}]',
 'HCMG University is the internal training platform for all HCMG team members — covering orientation, Harry''s Playbook, compensation training, and more. Progress and certificates are tracked here.',
 1),
(v_l4, v_course_id,
 'What is the purpose of the Internal Referral Program (IRP)?',
 'multiple_choice',
 '[{"label":"To reward borrowers for referring other borrowers","is_correct":false},{"label":"To allow an LO to refer a transaction in a state where they are not licensed to a licensed HCMG LO","is_correct":true},{"label":"To fast-track applications for preferred clients","is_correct":false},{"label":"To share commission with branch managers","is_correct":false}]',
 'The IRP allows an LO without a state license to refer that transaction to a licensed HCMG LO, with a defined compensation split. This was covered in depth in the Compensation & EPO course.',
 2);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 5: HOW WE WORK — FREEDOM AND ACCOUNTABILITY  (8 min)
-- ═══════════════════════════════════════════════════════════════════════════
-- 🎬 HEYGEN VIDEO — attach URL after production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l5, v_course_id, v_mod5,
  'How We Work: Freedom and Accountability',
  'The HCMG operating philosophy — what autonomy looks like here, what accountability means in practice, and how the two work together.',
  'video', 5, 1, true, 'watch_pct', 80, 480, '8 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Module 5\n'
  '  Title: How We Work: Freedom and Accountability\n'
  '  Speaker: Harry (avatar)\n'
  '═══════════════════════════════════════════════════════\n\n'
  'HCMG gives its people real freedom.\n\n'
  'Freedom to build your book of business your way.\n\n'
  'Freedom to manage your schedule around the work that needs to get done.\n\n'
  'Freedom to develop your own client relationships.\n\n'
  'Freedom to run your own process within the HCMG system.\n\n'
  'That freedom is real. And it is earned.\n\n'
  'Here is what freedom at HCMG is not.\n\n'
  'It is not freedom from standards.\n\n'
  'It is not freedom from accountability.\n\n'
  'It is not freedom to leave borrowers without follow-up, or to skip the process when the pipeline gets busy.\n\n'
  'The HCMG model is built on a simple exchange:\n\n'
  'We give you the tools, the training, the brand, the system, and the support.\n\n'
  'You bring the work ethic, the standards, and the ownership.\n\n'
  'Accountability at HCMG is not about surveillance.\n\n'
  'It is about ownership.\n\n'
  'When a borrower has a bad experience, we do not ask who is to blame.\n\n'
  'We ask what happened and how we prevent it next time.\n\n'
  'When production is low, we do not accept excuses.\n\n'
  'We examine activity, skill, mindset, and process.\n\n'
  'When a file falls apart, we look at what we could have done differently.\n\n'
  'That is the culture.\n\n'
  'High freedom. High accountability.\n\n'
  'Both are required.\n\n'
  'Neither is optional.\n\n'
  'If you do the work — the real work — this is one of the best places you will ever build a career.\n\n'
  'If you are looking for a place where you can coast, this is not it.\n\n'
  'We are glad you are here.\n\n'
  'Now let''s build something.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l5, v_course_id,
 'How does HCMG describe the relationship between freedom and accountability?',
 'multiple_choice',
 '[{"label":"Freedom comes first; accountability applies only to managers","is_correct":false},{"label":"They are opposites — you have one or the other","is_correct":false},{"label":"High freedom and high accountability are both required and work together","is_correct":true},{"label":"Freedom is earned only after two years of employment","is_correct":false}]',
 'HCMG''s operating model is high freedom and high accountability together. The freedom to operate your business is paired with full ownership of your results.',
 1),
(v_l5, v_course_id,
 'What does accountability mean at HCMG when something goes wrong?',
 'multiple_choice',
 '[{"label":"Finding and documenting who is at fault","is_correct":false},{"label":"Examining what happened and how to prevent it next time","is_correct":true},{"label":"Issuing a formal warning to the team member","is_correct":false},{"label":"Transferring the file to another LO","is_correct":false}]',
 'Accountability is about ownership and improvement, not blame. The question is what happened and how to prevent it — not who is at fault.',
 2);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 6: COMPLIANCE AND PROFESSIONAL STANDARDS  (8 min)
-- ═══════════════════════════════════════════════════════════════════════════
-- 🎬 HEYGEN VIDEO — attach URL after production
-- ⚠ CONFIG: Confirm current compliance references and policy document names before production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l6, v_course_id, v_mod6,
  'Compliance and Professional Standards',
  'The non-negotiable standards every HCMG team member must uphold — licensing, fair lending, RESPA, anti-discrimination, confidentiality, and professional conduct.',
  'video', 6, 1, true, 'watch_pct', 80, 480, '8 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Module 6\n'
  '  Title: Compliance and Professional Standards\n'
  '  Speaker: Harry (avatar)\n'
  '  ⚠ CONFIG: Confirm current compliance references and escalation contacts before production\n'
  '═══════════════════════════════════════════════════════\n\n'
  'Compliance is not optional at HCMG.\n\n'
  'It is not a department you only talk to when something goes wrong.\n\n'
  'It is a standard that every person on this team is responsible for, every day.\n\n'
  'Here are the areas you need to understand.\n\n'
  'LICENSING\n\n'
  'You must be properly licensed in every state where you originate. No exceptions. If you are not licensed in a state, you may not originate in that state. The Internal Referral Program exists for those situations. Originating without a license is a regulatory violation with serious consequences for you and for HCMG.\n\n'
  'FAIR LENDING\n\n'
  'Federal law — including the Equal Credit Opportunity Act and the Fair Housing Act — prohibits discrimination in lending based on race, color, religion, national origin, sex, familial status, disability, and other protected classes. Every borrower receives the same professional standard of service. No exceptions.\n\n'
  'RESPA\n\n'
  'The Real Estate Settlement Procedures Act governs how mortgage transactions are processed and how fees are disclosed. You are expected to understand the basics of RESPA compliance as it applies to your role.\n\n'
  'CONFIDENTIALITY\n\n'
  'Borrower information is private. You are not permitted to share, discuss, or disclose borrower information outside of what is required to process the loan. Treat all borrower data with strict confidentiality.\n\n'
  'PROFESSIONAL CONDUCT\n\n'
  'You represent HCMG in every interaction. Online and offline. With borrowers, referral partners, real estate agents, and the public. Your conduct reflects on this team and on every person who works here.\n\n'
  'Social media posts, public statements, and professional communications are all subject to HCMG standards.\n\n'
  'If you are ever unsure whether something is compliant, ask before you act.\n\n'
  '⚠ [CONFIG: Insert escalation contact or compliance channel — confirm with compliance team before publication]\n\n'
  'The cost of a compliance violation is never worth the shortcut.\n\n'
  'Know the rules. Follow them. Ask when you are not sure.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l6, v_course_id,
 'Which of the following is true regarding fair lending at HCMG?',
 'multiple_choice',
 '[{"label":"Fair lending rules apply only to underwriting decisions","is_correct":false},{"label":"Every borrower receives the same professional standard of service regardless of protected class","is_correct":true},{"label":"Fair lending is the compliance department''s responsibility, not the LO''s","is_correct":false},{"label":"Fair lending applies only to government loans","is_correct":false}]',
 'Fair lending is every team member''s responsibility. Federal law prohibits discrimination in any part of the mortgage transaction. Every borrower receives the same professional standard.',
 1),
(v_l6, v_course_id,
 'What should you do if you are unsure whether an action is compliant?',
 'multiple_choice',
 '[{"label":"Proceed and document it afterward","is_correct":false},{"label":"Ask a colleague who has been here longer","is_correct":false},{"label":"Ask before you act — consult the appropriate compliance channel","is_correct":true},{"label":"Skip the action if it seems risky","is_correct":false}]',
 'When in doubt about compliance, ask before you act. The cost of a compliance violation is never worth the shortcut.',
 2);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 7: TECHNOLOGY AND RESOURCES  (6 min)
-- ═══════════════════════════════════════════════════════════════════════════
-- 🎬 HEYGEN VIDEO — attach URL after production
-- ⚠ CONFIG: Confirm current system names, URLs, and support contacts before production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l7, v_course_id, v_mod7,
  'Technology and Resources',
  'The tools you will use from day one — LOS, CRM, portal, HCMG University, and where to get help.',
  'video', 7, 1, true, 'watch_pct', 80, 360, '6 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Module 7\n'
  '  Title: Technology and Resources\n'
  '  Speaker: Harry (avatar)\n'
  '  ⚠ CONFIG: Replace all [SYSTEM NAME] placeholders with confirmed current tools\n'
  '═══════════════════════════════════════════════════════\n\n'
  'HCMG equips its team with the tools needed to do the job at a high level.\n\n'
  'Here are the core systems you will use.\n\n'
  'LOAN ORIGINATION SYSTEM (LOS)\n\n'
  '[⚠ CONFIG: Insert confirmed LOS name and brief description of how LOs use it — confirm with IT or operations before publication]\n\n'
  'CRM\n\n'
  '[⚠ CONFIG: Insert confirmed CRM name and brief description — confirm with IT or operations before publication]\n\n'
  'HCMG TEAM PORTAL\n\n'
  '[⚠ CONFIG: Insert confirmed portal URL and description of what team members access there — confirm before publication]\n\n'
  'HCMG UNIVERSITY\n\n'
  'You are already here. HCMG U is where you complete required training, access the course library, track your progress, and earn certificates. Required courses are assigned automatically. You can also self-enroll in any published course in the library.\n\n'
  'HELP DESK\n\n'
  '[⚠ CONFIG: Insert confirmed help desk channel, ticketing system, or contact — confirm before publication]\n\n'
  'KNOWING YOUR TOOLS\n\n'
  'You are expected to learn the tools that support your role. If you are struggling with a system, ask your manager or reach out to IT support. Struggling in silence slows you and the team down.\n\n'
  'The resources are available. Use them.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l7, v_course_id,
 'What is HCMG University used for?',
 'multiple_choice',
 '[{"label":"Managing borrower applications","is_correct":false},{"label":"Completing required training, tracking progress, and earning certificates","is_correct":true},{"label":"Processing loan files","is_correct":false},{"label":"Communicating with referral partners","is_correct":false}]',
 'HCMG U is the internal training platform. Required training is assigned and tracked there; certificates are issued there.',
 1);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 8: YOUR DEVELOPMENT PATH  (7 min)
-- ═══════════════════════════════════════════════════════════════════════════
-- 🎬 HEYGEN VIDEO — attach URL after production
-- ⚠ CONFIG: Confirm current onboarding pathway steps and role-specific tracks before production
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l8, v_course_id, v_mod8,
  'Your Development Path',
  'How HCMG invests in your growth — training tracks, coaching, HCMG University, and the progression from new team member to high performer.',
  'video', 8, 1, true, 'watch_pct', 80, 420, '7 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Module 8\n'
  '  Title: Your Development Path\n'
  '  Speaker: Harry (avatar)\n'
  '  ⚠ CONFIG: Confirm current role-specific onboarding tracks and progression criteria before production\n'
  '═══════════════════════════════════════════════════════\n\n'
  'HCMG is committed to your development.\n\n'
  'That is not a slogan.\n\n'
  'It is a structural commitment backed by training systems, coaching resources, and a platform — HCMG U — built specifically to support your growth.\n\n'
  'Here is what your development path looks like.\n\n'
  'ONBOARDING\n\n'
  'You are in it right now. This orientation is the first required step. After this, you will be assigned role-specific required training based on your position.\n\n'
  'For Loan Officers, that includes the Compensation and EPO course you may have already completed, and Harry''s Playbook — HCMG''s complete performance training program.\n\n'
  '[⚠ CONFIG: Confirm and insert current role-specific onboarding paths for non-LO roles before publication]\n\n'
  'COACHING\n\n'
  'Your manager is your primary development partner. Use your coaching sessions. Come prepared. Bring your numbers. Identify what you are working on.\n\n'
  'The coaching structure at HCMG is designed to help you grow — but only if you participate in it actively.\n\n'
  'HCMG UNIVERSITY\n\n'
  'Beyond required training, the HCMG U library gives you access to courses in sales, operations, products, and compliance. Required training will be assigned. Additional courses are available for self-enrollment.\n\n'
  'HIGH PERFORMANCE\n\n'
  'The path from new team member to high performer at HCMG is defined by activity, skill, accountability, and mindset. All four are required. All four are developed over time.\n\n'
  'The training is here.\n\n'
  'The coaching is here.\n\n'
  'The opportunity is here.\n\n'
  'What you do with it is up to you.'
);

INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l8, v_course_id,
 'What is the primary role of your manager in your development at HCMG?',
 'multiple_choice',
 '[{"label":"To approve your leave requests","is_correct":false},{"label":"To serve as your primary development partner through coaching","is_correct":true},{"label":"To assign all training courses directly","is_correct":false},{"label":"To evaluate your compliance violations","is_correct":false}]',
 'Your manager is your primary development partner. Coaching sessions are a key part of the HCMG development structure.',
 1),
(v_l8, v_course_id,
 'What four elements define the path to high performance at HCMG?',
 'multiple_choice',
 '[{"label":"Sales, Service, Speed, Systems","is_correct":false},{"label":"Goals, Leads, Calls, Closings","is_correct":false},{"label":"Activity, Skill, Accountability, and Mindset","is_correct":true},{"label":"Training, Compliance, Licensing, and Production","is_correct":false}]',
 'Activity, Skill, Accountability, and Mindset are the four elements of the HCMG Success Formula — the foundation of high performance at HCMG.',
 2);


-- ═══════════════════════════════════════════════════════════════════════════
-- MODULE 9: THE HCMG STANDARD AND COMMITMENT  (8 min)
-- ═══════════════════════════════════════════════════════════════════════════
-- 🎬 HEYGEN VIDEO — attach URL after production
-- NOTE: The multi-item commitment checklist from the spec is not supported by
-- an existing acknowledgment control in HCMG U. The commitment statements are
-- included in full in this lesson transcript and in the knowledge check below.
-- A single required knowledge-check question confirms acknowledgment.
-- ⚠ CONFIG: If a multi-item acknowledgment control is added to HCMG U in the
-- future, replace the single-question acknowledgment with that control.
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l9, v_course_id, v_mod9,
  'The HCMG Standard and Commitment',
  'What the HCMG Standard means in daily practice — and your personal commitment as a member of this team.',
  'video', 9, 1, true, 'watch_pct', 80, 480, '8 min',
  E'═══════════════════════════════════════════════════════\n'
  '  HEYGEN VIDEO SCRIPT — Module 9\n'
  '  Title: The HCMG Standard and Commitment\n'
  '  Speaker: Harry (avatar)\n'
  '  On-screen: HCMG Standard commitment statements\n'
  '═══════════════════════════════════════════════════════\n\n'
  'You have made it to the final module of this orientation.\n\n'
  'Before you complete the final assessment, I want to leave you with what the HCMG Standard actually means — not in the abstract, but in practice.\n\n'
  'The HCMG Standard is a set of commitments.\n\n'
  'Not rules handed down from above.\n\n'
  'Commitments you make to your team, to your borrowers, and to yourself.\n\n'
  'Here is what that looks like.\n\n'
  'I will conduct myself with integrity in every interaction — with borrowers, colleagues, referral partners, and the public.\n\n'
  'I will uphold all applicable laws, licensing requirements, and HCMG policies.\n\n'
  'I will treat every borrower with professionalism and respect, regardless of loan size, background, or circumstances.\n\n'
  'I will take ownership of my results. I will not make excuses. I will ask for help when I need it and act on the feedback I receive.\n\n'
  'I will complete all required training on time and engage with my development seriously.\n\n'
  'I will support my teammates. I will not undermine the team, hoard information, or operate in isolation when collaboration serves the borrower and the organization better.\n\n'
  'I will protect borrower data and handle all confidential information with care.\n\n'
  'I will represent HCMG professionally in all public and professional settings.\n\n'
  'These are not aspirational statements.\n\n'
  'They are the standard.\n\n'
  'One team.\n\n'
  'One standard.\n\n'
  'Close to perfection.\n\n'
  'Welcome to HCMG.\n\n'
  'Now go build something.\n\n'
  '─────────────────────────────────────────────────────\n'
  'LMS NOTE: The following commitment statements are presented as a required\n'
  'knowledge-check question below. A multi-item acknowledgment control does\n'
  'not currently exist in HCMG U. If that control is added in the future,\n'
  'replace the single-question approach with the full checklist.\n'
  '─────────────────────────────────────────────────────\n'
  'Commitment statements (for reference / future acknowledgment control):\n'
  '□ I will conduct myself with integrity in every interaction.\n'
  '□ I will uphold all applicable laws, licensing requirements, and HCMG policies.\n'
  '□ I will treat every borrower with professionalism and respect.\n'
  '□ I will take ownership of my results.\n'
  '□ I will complete all required training on time.\n'
  '□ I will support my teammates.\n'
  '□ I will protect borrower data and all confidential information.\n'
  '□ I will represent HCMG professionally in all settings.'
);

-- Acknowledgment question — confirms the learner has reviewed and accepts the commitment
INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES
(v_l9, v_course_id,
 'By completing this module, you acknowledge the HCMG Standard commitment statements presented in this lesson. Which of the following best describes what those commitments require?',
 'multiple_choice',
 '[{"label":"They are aspirational guidelines that apply only when convenient","is_correct":false},{"label":"They apply only to Loan Officers, not operations staff","is_correct":false},{"label":"They are the behavioral standard every HCMG team member is expected to uphold — with integrity, ownership, professionalism, and compliance","is_correct":true},{"label":"They are optional until the 90-day review","is_correct":false}]',
 'The HCMG Standard commitments are the behavioral standard for every team member — not aspirational or optional. They cover integrity, ownership, professionalism, compliance, training, teamwork, confidentiality, and public representation.',
 1);


-- ═══════════════════════════════════════════════════════════════════════════
-- LESSON 10 — FINAL ASSESSMENT  (knowledge_check, 12 questions, 80% pass)
-- ═══════════════════════════════════════════════════════════════════════════
INSERT INTO uni_lessons (
  id, course_id, module_id, title, description, lesson_type,
  sort_order, module_sort_order, is_published,
  completion_mode, completion_threshold_pct, duration_secs, duration_label, transcript
) VALUES (
  v_l10, v_course_id, v_mod9,
  'New Team Member Orientation — Final Assessment',
  'Twelve questions covering all nine modules. Passing score: 80%. You may retake this assessment as many times as needed.',
  'knowledge_check', 10, 2, true, 'quiz_pass', 80, 720, '12 min',
  NULL
);

-- 12 Final Assessment Questions
INSERT INTO uni_quiz_questions (lesson_id, course_id, question_text, question_type, options_json, explanation, sort_order) VALUES

(v_l10, v_course_id,
 'What is the purpose of this New Team Member Orientation?',
 'multiple_choice',
 '[{"label":"A formality required by HR before payroll setup","is_correct":false},{"label":"To introduce every new team member to who HCMG is, how it operates, and what is expected","is_correct":true},{"label":"A product knowledge certification","is_correct":false},{"label":"An optional overview available to all employees","is_correct":false}]',
 'The orientation is the foundation of your time at HCMG — not a formality. It establishes who HCMG is, how it operates, and what is expected of every team member.',
 1),

(v_l10, v_course_id,
 'Which of the following is NOT one of HCMG''s six core values?',
 'multiple_choice',
 '[{"label":"Teamwork","is_correct":false},{"label":"Excellence","is_correct":false},{"label":"Competition","is_correct":true},{"label":"Accountability","is_correct":false}]',
 'HCMG''s six values are Teamwork, Integrity, Innovation, Excellence, Community, and Accountability. Competition is not one of them.',
 2),

(v_l10, v_course_id,
 'What is the primary responsibility of HCMG''s Operations team?',
 'multiple_choice',
 '[{"label":"Originating new loans","is_correct":false},{"label":"Moving loans from application to the closing table","is_correct":true},{"label":"Managing compliance reporting","is_correct":false},{"label":"Running HCMG University","is_correct":false}]',
 'Operations — Processing and Closing — moves loans from application to closing. They depend on clean files and clear communication from the origination side.',
 3),

(v_l10, v_course_id,
 'What is HCMG University?',
 'multiple_choice',
 '[{"label":"A public mortgage school","is_correct":false},{"label":"HCMG''s internal training platform for required training, progress tracking, and certificates","is_correct":true},{"label":"A compliance-only portal","is_correct":false},{"label":"A tool for processing borrower applications","is_correct":false}]',
 'HCMG U is the internal platform where required training is assigned, progress is tracked, and certificates are issued.',
 4),

(v_l10, v_course_id,
 'How does HCMG describe its operating philosophy regarding freedom and accountability?',
 'multiple_choice',
 '[{"label":"Freedom is given; accountability applies only after one year","is_correct":false},{"label":"Accountability replaces the need for management oversight","is_correct":false},{"label":"High freedom and high accountability are both required and work together","is_correct":true},{"label":"Freedom means you set your own standards","is_correct":false}]',
 'HCMG gives real freedom to operate your business, paired with full accountability for your results. Both are required.',
 5),

(v_l10, v_course_id,
 'Which federal law prohibits discrimination in lending based on protected class?',
 'multiple_choice',
 '[{"label":"RESPA only","is_correct":false},{"label":"The Equal Credit Opportunity Act and the Fair Housing Act","is_correct":true},{"label":"The SAFE Act only","is_correct":false},{"label":"The Truth in Lending Act only","is_correct":false}]',
 'The Equal Credit Opportunity Act (ECOA) and the Fair Housing Act (FHA) prohibit lending discrimination based on race, color, religion, national origin, sex, familial status, disability, and other protected classes.',
 6),

(v_l10, v_course_id,
 'What must you do if you are unsure whether an action is compliant?',
 'multiple_choice',
 '[{"label":"Proceed and document it afterward","is_correct":false},{"label":"Ask before you act — consult the appropriate compliance channel","is_correct":true},{"label":"Skip the action if it seems risky","is_correct":false},{"label":"Ask a colleague who has more experience","is_correct":false}]',
 'When in doubt about compliance, ask before you act. The cost of a compliance violation is never worth taking a shortcut.',
 7),

(v_l10, v_course_id,
 'A Loan Officer wants to originate a loan in a state where they do not have a license. What is the correct action?',
 'multiple_choice',
 '[{"label":"Originate the loan and apply for the license afterward","is_correct":false},{"label":"Ask the branch manager for a temporary waiver","is_correct":false},{"label":"Use the Internal Referral Program to refer the transaction to a licensed HCMG LO","is_correct":true},{"label":"Process the loan under a licensed colleague''s name","is_correct":false}]',
 'Originating without the proper state license is a regulatory violation. The IRP exists specifically to handle transactions in states where the originating LO is not licensed.',
 8),

(v_l10, v_course_id,
 'What is the correct way to handle confidential borrower information?',
 'multiple_choice',
 '[{"label":"Share it with referral partners to help close the deal","is_correct":false},{"label":"It may be discussed openly within the HCMG office","is_correct":false},{"label":"Protect it strictly — disclose only what is required to process the loan","is_correct":true},{"label":"It is only confidential after the loan closes","is_correct":false}]',
 'Borrower information is private at all times. You may only share it as required to process the loan. Unauthorized disclosure is a compliance violation.',
 9),

(v_l10, v_course_id,
 'Who is your primary development partner at HCMG?',
 'multiple_choice',
 '[{"label":"HCMG University","is_correct":false},{"label":"The compliance department","is_correct":false},{"label":"Your manager, through coaching","is_correct":true},{"label":"Your most experienced colleague","is_correct":false}]',
 'Your manager is your primary development partner. Coaching sessions are a core part of the HCMG growth structure.',
 10),

(v_l10, v_course_id,
 'What are the four elements of the HCMG Success Formula?',
 'multiple_choice',
 '[{"label":"Sales, Marketing, Closing, Recruiting","is_correct":false},{"label":"Activity, Skill, Accountability, and Mindset","is_correct":true},{"label":"Goals, Leads, Calls, and Closings","is_correct":false},{"label":"Speed, Accuracy, Volume, and Compliance","is_correct":false}]',
 'The HCMG Success Formula is Activity + Skill + Accountability + Mindset. All four are required for sustained high performance.',
 11),

(v_l10, v_course_id,
 'Which of the following best describes the HCMG Standard?',
 'multiple_choice',
 '[{"label":"A set of aspirational guidelines that apply when convenient","is_correct":false},{"label":"Rules that apply only to Loan Officers","is_correct":false},{"label":"The behavioral standard — covering integrity, ownership, compliance, professionalism, and teamwork — expected of every team member","is_correct":true},{"label":"A document that is reviewed only at the annual performance evaluation","is_correct":false}]',
 'The HCMG Standard is the behavioral expectation for every team member, every day — not aspirational and not role-specific.',
 12);


-- ═══════════════════════════════════════════════════════════════════════════
-- FORMAL ASSESSMENT RECORD  (uni_assessments)
-- Linked to the final lesson so the LMS can gate certification on pass
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
  v_l10,
  'New Team Member Orientation — Final Assessment',
  'Twelve questions covering all nine orientation modules. Passing score: 80%.',
  'certification_exam',
  80,
  true,
  true,
  NULL,    -- unlimited retakes
  false,   -- present in order
  true,    -- show correct answers after submission
  'Answer all 12 questions. You need 80% or higher to pass and receive your completion certificate. You may retake this assessment as many times as needed.'
);

-- Link all 12 quiz questions to the formal assessment record
INSERT INTO uni_assessment_questions (assessment_id, question_id, sort_order)
SELECT v_assessment_id, q.id, q.sort_order
FROM uni_quiz_questions q
WHERE q.lesson_id = v_l10
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
  COUNT(DISTINCT m.id)  AS module_count,
  COUNT(DISTINCT l.id)  AS lesson_count,
  COUNT(DISTINCT q.id)  AS total_questions,
  COUNT(DISTINCT a.id)  AS assessment_count,
  COUNT(DISTINCT cc.id) AS cert_config_count
FROM uni_courses c
LEFT JOIN uni_modules m  ON m.course_id = c.id
LEFT JOIN uni_lessons l  ON l.course_id = c.id
LEFT JOIN uni_quiz_questions q ON q.course_id = c.id
LEFT JOIN uni_assessments a ON a.course_id = c.id
LEFT JOIN uni_certificate_config cc ON cc.course_id = c.id
WHERE c.slug = 'new-team-member-orientation'
GROUP BY c.id, c.title, c.slug, c.is_published, c.is_required;
