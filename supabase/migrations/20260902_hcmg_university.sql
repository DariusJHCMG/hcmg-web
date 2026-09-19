-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG University — full schema migration
-- Applies: profiles extension + 8 university tables + RLS policies
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Extend profiles ───────────────────────────────────────────────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS employment_status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS university_access BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS university_role   TEXT NOT NULL DEFAULT 'learner',
  ADD COLUMN IF NOT EXISTS department        TEXT;

-- Backfill: existing admins/devs become university_admin
UPDATE public.profiles
SET university_access = TRUE, university_role = 'university_admin'
WHERE role IN ('admin', 'developer');

-- Backfill: existing active LOs become learners
UPDATE public.profiles
SET university_access = TRUE, university_role = 'learner'
WHERE role = 'loan_officer' AND is_active = TRUE;

-- ── 2. uni_courses ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_courses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          TEXT UNIQUE NOT NULL,
  title         TEXT NOT NULL,
  description   TEXT,
  thumbnail_url TEXT,
  category      TEXT NOT NULL DEFAULT 'general',
  path_tag      TEXT,         -- 'harrys_playbook' | 'fast_start' | 'sales' | 'product' | 'operations' | 'compliance'
  is_required   BOOLEAN NOT NULL DEFAULT FALSE,
  is_published  BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  duration_label TEXT,        -- e.g. "7 modules · 1.4 hours"
  pill_color    TEXT,         -- 'orange' | 'blue' | 'gold' | 'green' | 'red'
  created_by    UUID REFERENCES public.profiles(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.uni_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_courses_read" ON public.uni_courses
  FOR SELECT TO authenticated
  USING (
    is_published = TRUE
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.university_role IN ('trainer','university_admin')
    )
  );

CREATE POLICY "uni_courses_write" ON public.uni_courses
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.university_role IN ('trainer','university_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.university_role IN ('trainer','university_admin')
    )
  );

-- ── 3. uni_lessons ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_lessons (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id      UUID NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  description    TEXT,
  video_token    TEXT,        -- opaque token; real URL resolved server-side only
  transcript     TEXT,
  resources_json JSONB,       -- [{label, storage_path}]
  sort_order     INTEGER NOT NULL DEFAULT 0,
  duration_secs  INTEGER,
  duration_label TEXT,        -- e.g. "12:18"
  is_published   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.uni_lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_lessons_read" ON public.uni_lessons
  FOR SELECT TO authenticated
  USING (
    is_published = TRUE
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.university_access = TRUE
        AND p.employment_status = 'active'
    )
  );

CREATE POLICY "uni_lessons_admin_write" ON public.uni_lessons
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.university_role IN ('trainer','university_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.university_role IN ('trainer','university_admin')
    )
  );

-- ── 4. uni_enrollments ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_enrollments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  assigned_by     UUID REFERENCES public.profiles(id),
  assignment_type TEXT NOT NULL DEFAULT 'self',
  due_date        DATE,
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, course_id)
);
ALTER TABLE public.uni_enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_enrollments_own" ON public.uni_enrollments
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.university_role = 'university_admin'
          OR (p.university_role = 'manager' AND EXISTS (
            SELECT 1 FROM public.profiles emp WHERE emp.id = uni_enrollments.profile_id AND emp.manager_id = p.id
          ))
        )
    )
  );

CREATE POLICY "uni_enrollments_admin_write" ON public.uni_enrollments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.university_role = 'university_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.university_role = 'university_admin'
    )
  );

-- ── 5. uni_progress ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_progress (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id       UUID NOT NULL REFERENCES public.uni_lessons(id) ON DELETE CASCADE,
  course_id       UUID NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  watch_pct       SMALLINT NOT NULL DEFAULT 0 CHECK (watch_pct BETWEEN 0 AND 100),
  completed       BOOLEAN NOT NULL DEFAULT FALSE,
  completed_at    TIMESTAMPTZ,
  last_watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(profile_id, lesson_id)
);
ALTER TABLE public.uni_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_progress_own" ON public.uni_progress
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (
          p.university_role = 'university_admin'
          OR (p.university_role = 'manager' AND EXISTS (
            SELECT 1 FROM public.profiles emp WHERE emp.id = uni_progress.profile_id AND emp.manager_id = p.id
          ))
        )
    )
  );

CREATE POLICY "uni_progress_own_write" ON public.uni_progress
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

CREATE POLICY "uni_progress_own_update" ON public.uni_progress
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- ── 6. uni_quiz_questions ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_quiz_questions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id     UUID NOT NULL REFERENCES public.uni_lessons(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  options_json  JSONB NOT NULL,  -- [{label, is_correct}]
  explanation   TEXT,
  sort_order    INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.uni_quiz_questions ENABLE ROW LEVEL SECURITY;

-- Only trainers/admins can see questions (learners get them via API which strips is_correct)
CREATE POLICY "uni_quiz_questions_admin" ON public.uni_quiz_questions
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.university_role IN ('trainer','university_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.university_role IN ('trainer','university_admin')
    )
  );

-- ── 7. uni_quiz_attempts ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_quiz_attempts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lesson_id    UUID NOT NULL REFERENCES public.uni_lessons(id) ON DELETE CASCADE,
  score_pct    SMALLINT NOT NULL DEFAULT 0,
  passed       BOOLEAN NOT NULL DEFAULT FALSE,
  answers_json JSONB,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.uni_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_quiz_attempts_own" ON public.uni_quiz_attempts
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_role = 'university_admin'
    )
  );

CREATE POLICY "uni_quiz_attempts_own_insert" ON public.uni_quiz_attempts
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- ── 8. uni_certificates ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_certificates (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id  UUID NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,
  issued_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  issued_by  UUID REFERENCES public.profiles(id),
  UNIQUE(profile_id, course_id)
);
ALTER TABLE public.uni_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_certificates_own" ON public.uni_certificates
  FOR SELECT TO authenticated
  USING (
    profile_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_role = 'university_admin'
    )
  );

CREATE POLICY "uni_certificates_admin_write" ON public.uni_certificates
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_role = 'university_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_role = 'university_admin'
    )
  );

-- ── 9. uni_audit_log ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_audit_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    UUID REFERENCES public.profiles(id),
  actor_email TEXT,
  action      TEXT NOT NULL,
  entity_type TEXT,
  entity_id   UUID,
  details     JSONB,
  ip_address  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.uni_audit_log ENABLE ROW LEVEL SECURITY;

-- Only university_admin can read audit log; inserts done via service role in API routes
CREATE POLICY "uni_audit_log_admin_read" ON public.uni_audit_log
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.university_role = 'university_admin'
    )
  );
