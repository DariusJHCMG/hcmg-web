-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Phase 3+4 Schema: Notifications + Analytics Events
-- Migration: 20260905_hcmg_u_notifications_events.sql
-- ═══════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 1. uni_notifications — centralized notification queue
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- notification_type: assignment | due_date | overdue | completion | cert_issued |
  --   cert_expiring | cert_expired | cert_renewed | new_course | approval_request |
  --   content_approved | content_rejected | manager_escalation | hr_escalation |
  --   new_hire_welcome
  notification_type TEXT NOT NULL,
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  -- Channels sent on: JSON array e.g. ["email","in_app"]
  channels        TEXT[] NOT NULL DEFAULT '{in_app}',
  -- Contextual entity
  entity_type     TEXT,   -- 'course' | 'path' | 'certificate' | 'program'
  entity_id       UUID,
  -- In-app read state
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  read_at         TIMESTAMPTZ,
  -- Email delivery tracking
  email_sent_at   TIMESTAMPTZ,
  email_message_id TEXT,
  -- Scheduled delivery (for cron-generated future notifications)
  scheduled_for   TIMESTAMPTZ,
  -- Error tracking for failed delivery
  error           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_notifications ENABLE ROW LEVEL SECURITY;

-- Learners read only their own notifications
CREATE POLICY "uni_notifications_own_read" ON public.uni_notifications
  FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

-- Learners can mark their own as read
CREATE POLICY "uni_notifications_own_update" ON public.uni_notifications
  FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Admins can read all notifications (for debugging)
CREATE POLICY "uni_notifications_admin_read" ON public.uni_notifications
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );

-- Service role (cron / API routes) inserts notifications
CREATE POLICY "uni_notifications_service_insert" ON public.uni_notifications
  FOR INSERT TO authenticated
  WITH CHECK (TRUE);

CREATE INDEX IF NOT EXISTS uni_notifications_profile_idx
  ON public.uni_notifications(profile_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS uni_notifications_scheduled_idx
  ON public.uni_notifications(scheduled_for)
  WHERE scheduled_for IS NOT NULL AND email_sent_at IS NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. uni_notification_rules — admin-configurable notification triggers
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_notification_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type      TEXT NOT NULL,     -- matches uni_notifications.notification_type
  -- audience: 'learner' | 'manager' | 'hr_admin' | 'training_admin' | 'lms_admin'
  audience        TEXT NOT NULL DEFAULT 'learner',
  -- channels: which channels this rule activates
  channels        TEXT[] NOT NULL DEFAULT '{in_app,email}',
  is_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  -- email_template_id: optional Resend template override
  email_template_id TEXT,
  created_by      UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_notification_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_notification_rules_admin" ON public.uni_notification_rules
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

-- Seed sensible default rules
INSERT INTO public.uni_notification_rules (event_type, audience, channels, is_enabled)
VALUES
  ('assignment',          'learner',         '{in_app,email}',  TRUE),
  ('due_date',            'learner',         '{in_app,email}',  TRUE),
  ('overdue',             'learner',         '{in_app,email}',  TRUE),
  ('overdue',             'manager',         '{email}',         TRUE),
  ('completion',          'learner',         '{in_app}',        TRUE),
  ('cert_issued',         'learner',         '{in_app,email}',  TRUE),
  ('cert_expiring',       'learner',         '{in_app,email}',  TRUE),
  ('cert_expiring',       'manager',         '{email}',         TRUE),
  ('cert_expired',        'learner',         '{in_app,email}',  TRUE),
  ('manager_escalation',  'manager',         '{email}',         TRUE),
  ('hr_escalation',       'hr_admin',        '{email}',         TRUE),
  ('approval_request',    'training_admin',  '{in_app,email}',  TRUE),
  ('content_approved',    'learner',         '{in_app}',        FALSE),
  ('new_hire_welcome',    'learner',         '{email}',         TRUE)
ON CONFLICT DO NOTHING;

-- ────────────────────────────────────────────────────────────────────────────
-- 3. uni_events — append-only analytics event stream
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- event_type: see list of tracked events in audit spec
  event_type   TEXT NOT NULL,
  entity_type  TEXT,    -- 'course' | 'lesson' | 'path' | 'certificate' | 'assessment'
  entity_id    UUID,
  -- numeric value (e.g. watch_seconds, score_pct)
  value        NUMERIC,
  -- additional context (course_id for lesson events, etc.)
  metadata     JSONB DEFAULT '{}'::JSONB,
  session_id   TEXT,
  ip_address   TEXT,
  user_agent   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_events ENABLE ROW LEVEL SECURITY;

-- Only admins can query events directly (reports go through API)
CREATE POLICY "uni_events_admin_read" ON public.uni_events
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );

-- Any authenticated university user can insert their own events
CREATE POLICY "uni_events_own_insert" ON public.uni_events
  FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- Indexes for time-series reporting queries
CREATE INDEX IF NOT EXISTS uni_events_profile_time_idx
  ON public.uni_events(profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS uni_events_type_time_idx
  ON public.uni_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS uni_events_entity_idx
  ON public.uni_events(entity_type, entity_id, created_at DESC);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. Add FTS columns to uni_courses and uni_lessons for full-text search
-- ────────────────────────────────────────────────────────────────────────────
-- Generated tsvector columns for fast full-text search (Phase 5)
ALTER TABLE public.uni_courses
  ADD COLUMN IF NOT EXISTS fts_vector TSVECTOR
    GENERATED ALWAYS AS (
      to_tsvector('english',
        coalesce(title, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(array_to_string(tags, ' '), '')
      )
    ) STORED;

ALTER TABLE public.uni_lessons
  ADD COLUMN IF NOT EXISTS fts_vector TSVECTOR
    GENERATED ALWAYS AS (
      to_tsvector('english',
        coalesce(title, '') || ' ' ||
        coalesce(description, '') || ' ' ||
        coalesce(transcript, '')
      )
    ) STORED;

CREATE INDEX IF NOT EXISTS uni_courses_fts_idx ON public.uni_courses USING GIN(fts_vector);
CREATE INDEX IF NOT EXISTS uni_lessons_fts_idx ON public.uni_lessons USING GIN(fts_vector);
