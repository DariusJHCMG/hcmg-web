-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: uni_lesson_sessions — Training Integrity Layer
--
-- Every learner video watch is tracked as a signed server-authorized session.
-- The server accumulates verified_secs from heartbeat segments.
-- Completion is NEVER granted by the client — only by CanCompleteLesson().
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.uni_lesson_sessions (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id          uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  enrollment_id       uuid        NOT NULL REFERENCES public.uni_enrollments(id) ON DELETE CASCADE,
  lesson_id           uuid        NOT NULL REFERENCES public.uni_lessons(id) ON DELETE CASCADE,
  course_id           uuid        NOT NULL REFERENCES public.uni_courses(id) ON DELETE CASCADE,

  -- Session lifecycle
  started_at          timestamptz NOT NULL DEFAULT now(),
  last_heartbeat_at   timestamptz NOT NULL DEFAULT now(),
  expires_at          timestamptz NOT NULL DEFAULT (now() + interval '4 hours'),
  ended_at            timestamptz,

  -- Verified engagement (server-calculated — never trust client)
  -- watch_segments: array of {from, to} positions (seconds) the server accepted
  watch_segments      jsonb       NOT NULL DEFAULT '[]',
  -- Total non-overlapping verified seconds based on accepted segments
  verified_secs       integer     NOT NULL DEFAULT 0,
  -- Video duration in seconds (set on first heartbeat)
  video_duration_secs integer,

  -- Integrity signals from client (informational only — server validates via segments)
  last_position_secs  integer,
  last_playback_rate  numeric(4,2) NOT NULL DEFAULT 1.0,
  -- How many heartbeats arrived while tab was hidden (flag for review)
  hidden_heartbeat_count integer  NOT NULL DEFAULT 0,
  -- How many seek events were detected
  seek_count          integer     NOT NULL DEFAULT 0,

  -- Completion (only set by server-side CanCompleteLesson check)
  completed           boolean     NOT NULL DEFAULT false,
  completed_at        timestamptz,

  -- Metadata
  ip_address          text,
  user_agent          text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS uni_lesson_sessions_profile_lesson_idx
  ON public.uni_lesson_sessions (profile_id, lesson_id);

CREATE INDEX IF NOT EXISTS uni_lesson_sessions_active_idx
  ON public.uni_lesson_sessions (profile_id, lesson_id, ended_at)
  WHERE ended_at IS NULL;

CREATE INDEX IF NOT EXISTS uni_lesson_sessions_last_heartbeat_idx
  ON public.uni_lesson_sessions (last_heartbeat_at);

-- RLS
ALTER TABLE public.uni_lesson_sessions ENABLE ROW LEVEL SECURITY;

-- Learners can read their own sessions
CREATE POLICY "uni_lesson_sessions_owner_read" ON public.uni_lesson_sessions
  FOR SELECT USING (profile_id = auth.uid());

-- Admins can read all sessions (for integrity dashboard)
CREATE POLICY "uni_lesson_sessions_admin_read" ON public.uni_lesson_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );

-- No client INSERT/UPDATE — all writes go through service role (API routes)
