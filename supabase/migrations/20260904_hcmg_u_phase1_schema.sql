-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Phase 1 Schema: Enterprise LMS Foundation
-- Migration: 20260904_hcmg_u_phase1_schema.sql
--
-- Adds:
--   1.  uni_org_units          — HCMG organizational hierarchy (division/dept/branch/team)
--   2.  profiles.org_unit_id   — FK to replace free-text department
--   3.  uni_programs           — Top-level enrollment initiatives (onboarding, compliance, etc.)
--   4.  uni_paths              — Formal learning paths (replaces path_tag enum)
--   5.  uni_path_courses       — Ordered course sequence within a path
--   6.  uni_path_enrollments   — Learner enrollment in a path
--   7.  uni_modules            — Optional lesson grouping within a course
--   8.  uni_activities         — Typed content items (video/pdf/audio/link/embed)
--   9.  uni_cohorts            — Named enrollment groups
--   10. uni_cohort_members     — Cohort membership
--   11. uni_courses upgrades   — recert_interval_days, grace_period_days, difficulty,
--                                 tags, skills, expires_at, content_status
--   12. uni_certificates upgrades — expires_at, verification_id, cert_type, revoked_by
--   13. uni_course_versions    — Content version history / snapshot
--   14. uni_cert_exemptions    — HR-managed exemptions with justification
--
-- Backward compatible: all new columns have defaults or are nullable.
-- Existing data is untouched.
-- ═══════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 1. uni_org_units — configurable HCMG organizational hierarchy
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_org_units (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  -- type is freeform text — admins configure their own taxonomy
  -- suggested values: 'division' | 'department' | 'branch' | 'team' | 'location'
  unit_type   TEXT NOT NULL DEFAULT 'department',
  parent_id   UUID REFERENCES public.uni_org_units(id) ON DELETE SET NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_org_units ENABLE ROW LEVEL SECURITY;

-- All authenticated university users can read org units (needed for dropdowns)
CREATE POLICY "uni_org_units_read"
  ON public.uni_org_units FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_access = TRUE AND p.is_active = TRUE
    )
  );

-- Only university_admin can manage org units
CREATE POLICY "uni_org_units_admin_write"
  ON public.uni_org_units FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin', 'developer'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin', 'developer'))
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 2. profiles.org_unit_id — FK to organizational hierarchy
--    Keeps the free-text department column for backward compatibility during
--    the transition. Both columns coexist; org_unit_id is the future standard.
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS org_unit_id UUID REFERENCES public.uni_org_units(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS profiles_org_unit_id_idx ON public.profiles(org_unit_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 3. uni_programs — structured training initiatives
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_programs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  description     TEXT,
  -- auto_assign_rules: JSON array of rules e.g. [{"field":"role","value":"loan_officer"}]
  auto_assign_rules JSONB DEFAULT '[]'::JSONB,
  due_days        INTEGER,          -- days from enrollment to due date (NULL = no deadline)
  is_required     BOOLEAN NOT NULL DEFAULT FALSE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_programs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_programs_read" ON public.uni_programs
  FOR SELECT TO authenticated
  USING (
    is_active = TRUE
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin', 'developer'))
    )
  );

CREATE POLICY "uni_programs_admin_write" ON public.uni_programs
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin', 'developer'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin', 'developer'))
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 4. uni_paths — formal learning paths replacing path_tag enum
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_paths (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                  TEXT UNIQUE NOT NULL,
  title                 TEXT NOT NULL,
  description           TEXT,
  thumbnail_url         TEXT,
  -- legacy_tag mirrors the old path_tag for data continuity during migration
  legacy_tag            TEXT,
  is_required           BOOLEAN NOT NULL DEFAULT FALSE,
  is_published          BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order            INTEGER NOT NULL DEFAULT 0,
  -- certificate on path completion
  issues_certificate    BOOLEAN NOT NULL DEFAULT FALSE,
  -- expiration / recertification
  recert_interval_days  INTEGER,      -- NULL = never expires
  -- program this path belongs to (optional)
  program_id            UUID REFERENCES public.uni_programs(id) ON DELETE SET NULL,
  created_by            UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_paths ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_paths_read" ON public.uni_paths
  FOR SELECT TO authenticated
  USING (
    is_published = TRUE
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  );

CREATE POLICY "uni_paths_admin_write" ON public.uni_paths
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
-- 5. uni_path_courses — ordered course sequence within a learning path
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_path_courses (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id               UUID NOT NULL REFERENCES public.uni_paths(id) ON DELETE CASCADE,
  course_id             UUID NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  position              INTEGER NOT NULL DEFAULT 0,
  is_required           BOOLEAN NOT NULL DEFAULT TRUE,
  -- prerequisite_course_id: this course is locked until the prerequisite is completed
  prerequisite_course_id UUID REFERENCES public.uni_courses(id) ON DELETE SET NULL,
  UNIQUE(path_id, course_id)
);

ALTER TABLE public.uni_path_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_path_courses_read" ON public.uni_path_courses
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_access = TRUE AND p.is_active = TRUE
    )
  );

CREATE POLICY "uni_path_courses_admin_write" ON public.uni_path_courses
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
-- 6. uni_path_enrollments — learner enrollment in a learning path
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_path_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  path_id         UUID NOT NULL REFERENCES public.uni_paths(id) ON DELETE CASCADE,
  assigned_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date        DATE,
  completed_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ,   -- set from path.recert_interval_days on completion
  UNIQUE(profile_id, path_id)
);

ALTER TABLE public.uni_path_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_path_enrollments_own" ON public.uni_path_enrollments
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.university_role = 'university_admin'
          OR p.role IN ('admin','developer')
          OR (p.university_role = 'manager' AND EXISTS (
            SELECT 1 FROM public.profiles emp
            WHERE emp.id = uni_path_enrollments.profile_id AND emp.manager_id = p.id
          ))
        )
    )
  );

CREATE POLICY "uni_path_enrollments_admin_write" ON public.uni_path_enrollments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 7. uni_modules — optional lesson grouping within a course
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   UUID NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_modules_read" ON public.uni_modules
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_access = TRUE AND p.is_active = TRUE
    )
  );

CREATE POLICY "uni_modules_trainer_write" ON public.uni_modules
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

-- Add optional module_id FK to uni_lessons (nullable — backward compatible)
ALTER TABLE public.uni_lessons
  ADD COLUMN IF NOT EXISTS module_id UUID REFERENCES public.uni_modules(id) ON DELETE SET NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 8. uni_activities — typed content items attached to lessons
--    Replaces the single video_token + resources_json pattern with a proper
--    typed table. Existing video_token stays on uni_lessons for backward compat
--    during the transition.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_activities (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     UUID NOT NULL REFERENCES public.uni_lessons(id) ON DELETE CASCADE,
  -- activity_type: 'video' | 'pdf' | 'audio' | 'link' | 'embed' | 'document' | 'interactive'
  activity_type TEXT NOT NULL DEFAULT 'video',
  title         TEXT,
  -- storage_path: Supabase Storage path (for video/pdf/audio/document)
  storage_path  TEXT,
  -- token: opaque server-side token (for video — resolved to signed URL server-side)
  token         TEXT,
  -- external_url: for link / embed types
  external_url  TEXT,
  -- duration_secs: for video/audio
  duration_secs INTEGER,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  is_required   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uni_activities_type_check
    CHECK (activity_type IN ('video','pdf','audio','link','embed','document','interactive','survey'))
);

ALTER TABLE public.uni_activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_activities_read" ON public.uni_activities
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_access = TRUE AND p.is_active = TRUE
    )
  );

CREATE POLICY "uni_activities_trainer_write" ON public.uni_activities
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
-- 9. uni_cohorts + 10. uni_cohort_members
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_cohorts (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  org_unit_id UUID REFERENCES public.uni_org_units(id) ON DELETE SET NULL,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_by  UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_cohorts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_cohorts_read" ON public.uni_cohorts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_access = TRUE AND p.is_active = TRUE
    )
  );

CREATE POLICY "uni_cohorts_admin_write" ON public.uni_cohorts
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );

CREATE TABLE IF NOT EXISTS public.uni_cohort_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort_id   UUID NOT NULL REFERENCES public.uni_cohorts(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  added_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  added_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cohort_id, profile_id)
);

ALTER TABLE public.uni_cohort_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_cohort_members_read" ON public.uni_cohort_members
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );

CREATE POLICY "uni_cohort_members_admin_write" ON public.uni_cohort_members
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 11. uni_courses upgrades — enterprise course metadata
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.uni_courses
  -- Content lifecycle status (replaces binary is_published)
  ADD COLUMN IF NOT EXISTS content_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (content_status IN ('draft','in_review','approved','published','archived')),
  -- Recertification: how many days until certificate expires after completion
  ADD COLUMN IF NOT EXISTS recert_interval_days INTEGER,
  -- Grace period: days after due date before escalation begins
  ADD COLUMN IF NOT EXISTS grace_period_days INTEGER NOT NULL DEFAULT 7,
  -- Course-level difficulty
  ADD COLUMN IF NOT EXISTS difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  -- Freeform tags array for search/filtering
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}',
  -- Skills mapped to this course (text array — will link to uni_skills in Phase 5)
  ADD COLUMN IF NOT EXISTS skill_tags TEXT[] NOT NULL DEFAULT '{}',
  -- Reviewer who approved content
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  -- Auto-archive date
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- Backfill content_status from is_published for existing courses
UPDATE public.uni_courses
SET content_status = CASE
  WHEN is_published = TRUE THEN 'published'
  ELSE 'draft'
END
WHERE content_status = 'draft';

-- ────────────────────────────────────────────────────────────────────────────
-- 12. uni_certificates upgrades — expiration, verification, cert type
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.uni_certificates
  -- Expiration driven by recert_interval_days on the course
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  -- Unique public verification token (used in verify endpoint + PDF QR code)
  ADD COLUMN IF NOT EXISTS verification_id UUID NOT NULL DEFAULT gen_random_uuid(),
  -- Whether this is a course cert, path cert, or program cert
  ADD COLUMN IF NOT EXISTS cert_type TEXT NOT NULL DEFAULT 'course'
    CHECK (cert_type IN ('course','path','program')),
  -- Path or program reference (NULL for course certs)
  ADD COLUMN IF NOT EXISTS path_id UUID REFERENCES public.uni_paths(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS program_id UUID REFERENCES public.uni_programs(id) ON DELETE SET NULL,
  -- Revocation metadata
  ADD COLUMN IF NOT EXISTS revoked_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS revocation_reason TEXT,
  -- Renewal: the previous certificate this one renews
  ADD COLUMN IF NOT EXISTS renewed_from UUID REFERENCES public.uni_certificates(id) ON DELETE SET NULL;

-- Unique index on verification_id for fast lookup
CREATE UNIQUE INDEX IF NOT EXISTS uni_certificates_verification_id_idx
  ON public.uni_certificates(verification_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 13. uni_course_versions — content version history
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_course_versions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id       UUID NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  version_number  INTEGER NOT NULL,
  -- JSON snapshot of the course row + lessons at time of publish
  snapshot        JSONB NOT NULL DEFAULT '{}'::JSONB,
  change_summary  TEXT,
  published_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, version_number)
);

ALTER TABLE public.uni_course_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_course_versions_admin_read" ON public.uni_course_versions
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  );

CREATE POLICY "uni_course_versions_admin_write" ON public.uni_course_versions
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 14. uni_cert_exemptions — HR-managed exemptions with required justification
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_cert_exemptions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id     UUID NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  justification TEXT NOT NULL,
  granted_by    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  granted_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- Exemptions can expire
  expires_at    TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ,
  UNIQUE(profile_id, course_id)
);

ALTER TABLE public.uni_cert_exemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_cert_exemptions_admin" ON public.uni_cert_exemptions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );

-- Own exemptions are visible to the learner
CREATE POLICY "uni_cert_exemptions_own_read" ON public.uni_cert_exemptions
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- ────────────────────────────────────────────────────────────────────────────
-- 15. Useful indexes
-- ────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS uni_path_courses_path_id_idx       ON public.uni_path_courses(path_id);
CREATE INDEX IF NOT EXISTS uni_path_courses_course_id_idx     ON public.uni_path_courses(course_id);
CREATE INDEX IF NOT EXISTS uni_path_enrollments_profile_idx   ON public.uni_path_enrollments(profile_id);
CREATE INDEX IF NOT EXISTS uni_path_enrollments_path_idx      ON public.uni_path_enrollments(path_id);
CREATE INDEX IF NOT EXISTS uni_activities_lesson_id_idx       ON public.uni_activities(lesson_id);
CREATE INDEX IF NOT EXISTS uni_modules_course_id_idx          ON public.uni_modules(course_id);
CREATE INDEX IF NOT EXISTS uni_cohort_members_profile_idx     ON public.uni_cohort_members(profile_id);
CREATE INDEX IF NOT EXISTS uni_certificates_verification_idx  ON public.uni_certificates(verification_id);
CREATE INDEX IF NOT EXISTS uni_cert_exemptions_profile_idx    ON public.uni_cert_exemptions(profile_id);
CREATE INDEX IF NOT EXISTS uni_courses_content_status_idx     ON public.uni_courses(content_status);
CREATE INDEX IF NOT EXISTS uni_courses_tags_idx               ON public.uni_courses USING GIN(tags);
