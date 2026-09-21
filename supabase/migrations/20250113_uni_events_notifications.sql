-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Create uni_events and uni_notifications tables
-- These tables are referenced by the application but were missing from the DB.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── uni_events ────────────────────────────────────────────────────────────────
-- Analytics event stream. Written server-side only (service role).
-- Learners cannot read or modify their own rows (analytics are admin-only).

CREATE TABLE IF NOT EXISTS public.uni_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id   uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type   text        NOT NULL,
  entity_type  text,
  entity_id    uuid,
  value        numeric,
  metadata     jsonb       NOT NULL DEFAULT '{}',
  session_id   text,
  ip_address   text,
  user_agent   text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Index for per-user event lookups (reports, dashboards)
CREATE INDEX IF NOT EXISTS uni_events_profile_id_idx     ON public.uni_events (profile_id);
-- Index for filtering by event type (funnel analysis)
CREATE INDEX IF NOT EXISTS uni_events_event_type_idx     ON public.uni_events (event_type);
-- Index for entity lookups (e.g. all events for a specific lesson)
CREATE INDEX IF NOT EXISTS uni_events_entity_id_idx      ON public.uni_events (entity_id);
-- Chronological ordering is the most common query pattern
CREATE INDEX IF NOT EXISTS uni_events_created_at_idx     ON public.uni_events (created_at DESC);

-- RLS: disable reads for regular users; writes go through service role only
ALTER TABLE public.uni_events ENABLE ROW LEVEL SECURITY;

-- Admins and developers can read all events (for reports page)
CREATE POLICY "uni_events_admin_read" ON public.uni_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('university_admin') OR p.role IN ('admin', 'developer'))
    )
  );

-- No direct INSERT/UPDATE/DELETE from client — service role bypasses RLS


-- ── uni_notifications ─────────────────────────────────────────────────────────
-- In-app and email notification inbox per user.

CREATE TABLE IF NOT EXISTS public.uni_notifications (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  notification_type text        NOT NULL,               -- e.g. cert_issued, cert_expiring, due_soon
  title             text        NOT NULL,
  body              text        NOT NULL DEFAULT '',
  channels          text[]      NOT NULL DEFAULT ARRAY['in_app'],
  entity_type       text,                               -- e.g. certificate, course, enrollment
  entity_id         uuid,
  is_read           boolean     NOT NULL DEFAULT false,
  read_at           timestamptz,
  email_sent_at     timestamptz,
  email_message_id  text,                               -- Resend message ID for delivery tracking
  scheduled_for     timestamptz,                        -- future: scheduled delivery
  error             text,                               -- capture delivery errors
  metadata          jsonb       NOT NULL DEFAULT '{}',  -- arbitrary extra context
  created_at        timestamptz NOT NULL DEFAULT now()
);

-- Index for the notification bell query (unread count + inbox)
CREATE INDEX IF NOT EXISTS uni_notifications_profile_id_idx   ON public.uni_notifications (profile_id);
CREATE INDEX IF NOT EXISTS uni_notifications_unread_idx       ON public.uni_notifications (profile_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS uni_notifications_created_at_idx   ON public.uni_notifications (created_at DESC);
-- Deduplication lookups in compliance cron
CREATE INDEX IF NOT EXISTS uni_notifications_entity_type_idx  ON public.uni_notifications (entity_id, notification_type);

-- RLS: users can read and update (mark read) their own notifications only
ALTER TABLE public.uni_notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uni_notifications_owner_read" ON public.uni_notifications
  FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "uni_notifications_owner_update" ON public.uni_notifications
  FOR UPDATE
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid());

-- Admins can read all notifications (for support/debugging)
CREATE POLICY "uni_notifications_admin_read" ON public.uni_notifications
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('university_admin') OR p.role IN ('admin', 'developer'))
    )
  );

-- No client INSERT — notifications are created server-side via service role only
