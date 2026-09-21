-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Make quiz questions lesson_id nullable
-- Course-level assessment questions belong to a course, not a specific lesson.
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE public.uni_quiz_questions
  ALTER COLUMN lesson_id DROP NOT NULL;
