-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Phase 1C Schema: Assessment Engine Expansion
-- Migration: 20260906_hcmg_u_assessment_engine.sql
--
-- Adds:
--   1. question_type column to uni_quiz_questions
--   2. passing_pct column to uni_quiz_questions (per-question weight, nullable)
--   3. uni_assessments — course-level configurable exam table
--   4. uni_assessment_questions — junction linking assessments to question bank
--   5. assessment_id nullable FK on uni_quiz_attempts for exam-level tracking
-- ═══════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Extend uni_quiz_questions with question_type and per-question weight
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.uni_quiz_questions
  ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'multiple_choice'
    CHECK (question_type IN ('multiple_choice','multiple_select','true_false','short_answer','matching','scenario')),
  ADD COLUMN IF NOT EXISTS passing_pct INTEGER; -- nullable per-question weight

-- ────────────────────────────────────────────────────────────────────────────
-- 2. uni_assessments — configurable course-level exams
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_assessments (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id           UUID NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  title               TEXT NOT NULL,
  description         TEXT,
  passing_pct         SMALLINT NOT NULL DEFAULT 70 CHECK (passing_pct BETWEEN 1 AND 100),
  max_attempts        SMALLINT,          -- NULL = unlimited
  time_limit_mins     SMALLINT,          -- NULL = no time limit
  randomize_questions BOOLEAN NOT NULL DEFAULT FALSE,
  questions_to_draw   SMALLINT,          -- NULL = use all questions
  is_required         BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_assessments ENABLE ROW LEVEL SECURITY;

-- Trainers/admins can read all assessments (incl. unpublished)
CREATE POLICY "uni_assessments_trainer_read" ON public.uni_assessments
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  );

-- Learners can read active assessments for courses they are enrolled in
CREATE POLICY "uni_assessments_learner_read" ON public.uni_assessments
  FOR SELECT TO authenticated
  USING (
    is_active = TRUE
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_access = TRUE AND p.is_active = TRUE
    )
    AND EXISTS (
      SELECT 1 FROM public.uni_enrollments e
      WHERE e.profile_id = auth.uid() AND e.course_id = uni_assessments.course_id
    )
  );

-- Only trainers/admins can write
CREATE POLICY "uni_assessments_trainer_write" ON public.uni_assessments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 3. uni_assessment_questions — links assessments to question bank entries
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_assessment_questions (
  assessment_id UUID NOT NULL REFERENCES public.uni_assessments(id) ON DELETE CASCADE,
  question_id   UUID NOT NULL REFERENCES public.uni_quiz_questions(id) ON DELETE CASCADE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (assessment_id, question_id)
);

ALTER TABLE public.uni_assessment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_assessment_questions_trainer_read" ON public.uni_assessment_questions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  );

CREATE POLICY "uni_assessment_questions_trainer_write" ON public.uni_assessment_questions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 4. uni_quiz_attempts — add assessment_id for course-level exam tracking
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.uni_quiz_attempts
  ADD COLUMN IF NOT EXISTS assessment_id UUID REFERENCES public.uni_assessments(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 5. Indexes
-- ────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS uni_assessments_course_id_idx
  ON public.uni_assessments(course_id);
CREATE INDEX IF NOT EXISTS uni_assessment_questions_assessment_idx
  ON public.uni_assessment_questions(assessment_id, sort_order);
CREATE INDEX IF NOT EXISTS uni_quiz_attempts_assessment_idx
  ON public.uni_quiz_attempts(assessment_id)
  WHERE assessment_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS uni_quiz_questions_type_idx
  ON public.uni_quiz_questions(question_type);
