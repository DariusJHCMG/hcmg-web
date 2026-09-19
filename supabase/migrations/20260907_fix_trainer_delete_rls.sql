-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Fix trainer DELETE permission in RLS
-- Migration: 20260907_fix_trainer_delete_rls.sql
--
-- Problem:
--   uni_courses_write and uni_lessons_admin_write were both declared FOR ALL,
--   meaning a trainer could DELETE courses and lessons via direct DB access.
--   The application layer uses the service client (bypasses RLS) so this was
--   not reachable through the app, but it is a latent risk for any direct DB
--   connection or future service that does not use the service client.
--
-- Fix:
--   Replace FOR ALL trainer write policies with explicit INSERT, UPDATE only.
--   Admins (university_admin / admin / developer) retain full DELETE via a
--   separate admin-only policy.
--
-- Idempotent: DROP IF EXISTS before CREATE.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── uni_courses ──────────────────────────────────────────────────────────────

-- Drop the overly broad write policy
DROP POLICY IF EXISTS "uni_courses_write" ON public.uni_courses;

-- Trainers: INSERT + UPDATE only (no DELETE)
CREATE POLICY "uni_courses_trainer_write"
  ON public.uni_courses
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  );

CREATE POLICY "uni_courses_trainer_update"
  ON public.uni_courses
  FOR UPDATE TO authenticated
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

-- Admins only: DELETE
CREATE POLICY "uni_courses_admin_delete"
  ON public.uni_courses
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );

-- ── uni_lessons ──────────────────────────────────────────────────────────────

-- Drop the overly broad write policy
DROP POLICY IF EXISTS "uni_lessons_admin_write" ON public.uni_lessons;

-- Trainers: INSERT + UPDATE only (no DELETE)
CREATE POLICY "uni_lessons_trainer_insert"
  ON public.uni_lessons
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role IN ('trainer','university_admin') OR p.role IN ('admin','developer'))
    )
  );

CREATE POLICY "uni_lessons_trainer_update"
  ON public.uni_lessons
  FOR UPDATE TO authenticated
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

-- Admins only: DELETE
CREATE POLICY "uni_lessons_admin_delete"
  ON public.uni_lessons
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND (p.university_role = 'university_admin' OR p.role IN ('admin','developer'))
    )
  );
