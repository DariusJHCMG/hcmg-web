-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Media Library + Quiz Attempt fix
-- Migration: 20260915_media_library.sql
--
-- 1. Make uni_quiz_attempts.lesson_id nullable
--    (course-level assessments don't belong to a specific lesson)
--
-- 2. Add uni_media_assets — centralized media library for Training Studio
--    Supports videos, images, audio, documents, captions/VTT
-- ═══════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 1. Make uni_quiz_attempts.lesson_id nullable
-- ────────────────────────────────────────────────────────────────────────────
ALTER TABLE public.uni_quiz_attempts
  ALTER COLUMN lesson_id DROP NOT NULL;

-- ────────────────────────────────────────────────────────────────────────────
-- 2. uni_media_assets — centralized media library
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.uni_media_assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Who uploaded it
  uploaded_by   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  -- Human-readable name (defaults to filename)
  name          TEXT NOT NULL,
  -- Media type drives which icon and player are used
  media_type    TEXT NOT NULL
    CHECK (media_type IN ('video','image','audio','document','presentation','caption')),
  -- Supabase Storage path inside the 'uni-media' bucket
  storage_path  TEXT NOT NULL,
  -- MIME type e.g. 'video/mp4', 'image/jpeg', 'application/pdf'
  mime_type     TEXT,
  -- File size in bytes
  file_size     BIGINT,
  -- Duration in seconds (for video/audio)
  duration_secs INTEGER,
  -- Dimensions (for images/video)
  width_px      INTEGER,
  height_px     INTEGER,
  -- Optional description / alt text
  description   TEXT,
  -- Soft-archive: hidden from library but not deleted from storage
  is_archived   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.uni_media_assets ENABLE ROW LEVEL SECURITY;

-- Trainers/admins can read all non-archived assets
CREATE POLICY "uni_media_assets_read" ON public.uni_media_assets
  FOR SELECT TO authenticated
  USING (
    is_archived = FALSE
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  );

-- Trainers/admins can insert/update/delete their own assets
-- University admins can manage all assets
CREATE POLICY "uni_media_assets_write" ON public.uni_media_assets
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

CREATE INDEX IF NOT EXISTS uni_media_assets_type_idx
  ON public.uni_media_assets(media_type)
  WHERE is_archived = FALSE;

CREATE INDEX IF NOT EXISTS uni_media_assets_uploaded_by_idx
  ON public.uni_media_assets(uploaded_by);

CREATE INDEX IF NOT EXISTS uni_media_assets_name_idx
  ON public.uni_media_assets USING GIN (to_tsvector('english', name));

-- ────────────────────────────────────────────────────────────────────────────
-- 3. Ensure 'uni-media' storage bucket exists
--    (Run manually in Supabase dashboard if INSERT fails due to permissions)
-- ────────────────────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uni-media',
  'uni-media',
  FALSE,
  524288000,  -- 500 MB per file
  ARRAY[
    'video/mp4','video/webm','video/quicktime',
    'image/jpeg','image/png','image/gif','image/webp',
    'audio/mpeg','audio/mp4','audio/wav',
    'application/pdf','application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/vtt','text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: authenticated users with trainer/admin role can upload/read
-- These policies are on storage.objects, managed separately via Supabase dashboard.
-- Bucket policy summary (apply in dashboard):
--   INSERT: university_role IN ('trainer','university_admin') OR role IN ('admin','developer')
--   SELECT: university_role IN ('trainer','university_admin') OR role IN ('admin','developer')
--   DELETE: university_role IN ('trainer','university_admin') OR role IN ('admin','developer')
