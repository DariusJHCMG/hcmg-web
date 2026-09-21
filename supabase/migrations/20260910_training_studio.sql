-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Training Studio Schema
-- Migration: 20260910_training_studio.sql
--
-- Adds:
--   1. uni_course_objectives  — structured learning objectives per course
--   2. uni_lessons extended   — lesson_type, completion_mode, thumbnail_url,
--                               caption_url, completion_threshold_pct
--   3. uni_assessments extended — assessment_type ('knowledge_check'|'quiz'|
--                               'final_assessment'|'certification_exam')
--   4. uni_certificate_config — per-course certificate settings
--   5. uni_lessons.module_id  — already exists, ensure index
-- ═══════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 1. uni_course_objectives — structured learning objectives
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_course_objectives (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  objective   TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_course_objectives ENABLE ROW LEVEL SECURITY;

-- Learners can read objectives for published courses
CREATE POLICY "uni_course_objectives_read" ON public.uni_course_objectives
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.uni_courses c
      WHERE c.id = uni_course_objectives.course_id
        AND (
          c.is_published = TRUE
          OR EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
          )
        )
    )
  );

-- Trainers/admins can write objectives
CREATE POLICY "uni_course_objectives_write" ON public.uni_course_objectives
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

CREATE INDEX IF NOT EXISTS uni_course_objectives_course_id_idx
  ON public.uni_course_objectives(course_id, sort_order);

-- ────────────────────────────────────────────────────────────────────────────
-- 2. uni_lessons extended columns
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.uni_lessons
  -- Lesson type: drives which editor is shown
  ADD COLUMN IF NOT EXISTS lesson_type TEXT NOT NULL DEFAULT 'video'
    CHECK (lesson_type IN ('video','text','presentation','resource','knowledge_check')),
  -- Thumbnail for the lesson card / video poster
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT,
  -- VTT captions file path
  ADD COLUMN IF NOT EXISTS caption_url TEXT,
  -- How the system marks this lesson complete for learners
  ADD COLUMN IF NOT EXISTS completion_mode TEXT NOT NULL DEFAULT 'watch_pct'
    CHECK (completion_mode IN ('watch_pct','manual','quiz_pass','any')),
  -- What watch percentage triggers completion (used when completion_mode='watch_pct')
  ADD COLUMN IF NOT EXISTS completion_threshold_pct SMALLINT NOT NULL DEFAULT 80
    CHECK (completion_threshold_pct BETWEEN 1 AND 100),
  -- Sort order within module (uses existing sort_order column for course-level)
  ADD COLUMN IF NOT EXISTS module_sort_order INTEGER NOT NULL DEFAULT 0;

-- Index for module-scoped lesson ordering
CREATE INDEX IF NOT EXISTS uni_lessons_module_id_sort_idx
  ON public.uni_lessons(module_id, module_sort_order)
  WHERE module_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. uni_assessments extended — assessment_type column
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.uni_assessments
  -- Assessment type differentiates knowledge checks from final exams
  ADD COLUMN IF NOT EXISTS assessment_type TEXT NOT NULL DEFAULT 'final_assessment'
    CHECK (assessment_type IN ('knowledge_check','quiz','final_assessment','certification_exam')),
  -- Which lesson this knowledge check belongs to (NULL for course-level assessments)
  ADD COLUMN IF NOT EXISTS lesson_id UUID REFERENCES public.uni_lessons(id) ON DELETE CASCADE,
  -- Instructions shown to learner before starting
  ADD COLUMN IF NOT EXISTS instructions TEXT,
  -- Whether to show correct answers after attempt
  ADD COLUMN IF NOT EXISTS show_answers_after BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS uni_assessments_lesson_id_idx
  ON public.uni_assessments(lesson_id)
  WHERE lesson_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 4. uni_certificate_config — per-course certificate configuration
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_certificate_config (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id             UUID UNIQUE NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  issue_certificate     BOOLEAN NOT NULL DEFAULT TRUE,
  -- NULL = never expires; positive integer = days until expiry
  validity_days         INTEGER,
  -- How renewal works when certificate expires
  renewal_mode          TEXT NOT NULL DEFAULT 'manual'
    CHECK (renewal_mode IN ('manual','auto_reassign')),
  -- Verification QR code
  include_verification  BOOLEAN NOT NULL DEFAULT TRUE,
  -- Which assessment must be passed to trigger certificate issuance
  trigger_assessment_id UUID REFERENCES public.uni_assessments(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_certificate_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_certificate_config_read" ON public.uni_certificate_config
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_access = TRUE AND p.is_active = TRUE
    )
  );

CREATE POLICY "uni_certificate_config_write" ON public.uni_certificate_config
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
-- 5. uni_courses — additional authoring fields
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.uni_courses
  -- Short tagline distinct from full description
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  -- Target audience description
  ADD COLUMN IF NOT EXISTS audience TEXT,
  -- Instructor / trainer name (display)
  ADD COLUMN IF NOT EXISTS instructor_name TEXT,
  -- Completion requirements stored as structured JSON
  -- e.g. {"require_all_lessons": true, "require_assessment": true, "passing_score": 80}
  ADD COLUMN IF NOT EXISTS completion_rules JSONB NOT NULL DEFAULT '{"require_all_lessons":true,"require_assessment":false}'::JSONB,
  -- Review/approval notes
  ADD COLUMN IF NOT EXISTS review_notes TEXT,
  -- Submitted for review by
  ADD COLUMN IF NOT EXISTS submitted_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS submitted_at TIMESTAMPTZ;

-- ────────────────────────────────────────────────────────────────────────────
-- 6. uni_quiz_questions — add course-level FK for reusable question bank
--    Questions can belong to a course (bank) independent of a lesson.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.uni_quiz_questions
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  -- Points value for this question
  ADD COLUMN IF NOT EXISTS points SMALLINT NOT NULL DEFAULT 1,
  -- Required for assessment completion
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS uni_quiz_questions_course_id_idx
  ON public.uni_quiz_questions(course_id)
  WHERE course_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Audit log: add content_status transition tracking
-- ────────────────────────────────────────────────────────────────────────────
-- No schema change needed — existing uni_audit_log.details JSONB supports it
-- action values: 'course_submitted_for_review' | 'course_approved' | 'course_published' | 'course_archived'
