-- Migration: extend uni_lesson_sessions for non-video lesson integrity
-- dwell_secs: server-accumulated active dwell time (visible + focused, capped per interval)
-- scroll_pct: highest scroll position reported by client (0-100)
ALTER TABLE public.uni_lesson_sessions
  ADD COLUMN IF NOT EXISTS dwell_secs integer NOT NULL DEFAULT 0;
ALTER TABLE public.uni_lesson_sessions
  ADD COLUMN IF NOT EXISTS scroll_pct smallint NOT NULL DEFAULT 0;
