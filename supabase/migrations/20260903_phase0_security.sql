-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG U — Phase 0 Security Hardening
-- Migration: 20260903_phase0_security.sql
--
-- Fixes all Phase 0 security vulnerabilities identified in the HCMG U audit:
--
--   1. Profile privilege escalation — add WITH CHECK to block self-elevation of
--      role, university_role, university_access, employment_status, is_active,
--      manager_id, and liftoff_roles via the user self-update RLS policy.
--
--   2. Mass assignment on course POST/PATCH — handled in application layer
--      (see app/api/university/admin/course/route.ts).
--
-- Idempotent: safe to re-run (policies use CREATE OR REPLACE / DROP IF EXISTS).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Drop the unsafe self-update policy ───────────────────────────────────
DROP POLICY IF EXISTS "users can update own profile" ON public.profiles;

-- ── 2. Recreate with WITH CHECK that locks privilege columns ─────────────────
-- Learners may update only display/contact fields.
-- The WITH CHECK compares every privilege column against its CURRENT DB value,
-- ensuring even if a client sends a changed value it is silently rejected at
-- the RLS layer — a defense-in-depth complement to the API allowlist.
CREATE POLICY "users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    -- Platform role must not change
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    -- University privilege columns must not change
    AND university_role     = (SELECT university_role     FROM public.profiles WHERE id = auth.uid())
    AND university_access   = (SELECT university_access   FROM public.profiles WHERE id = auth.uid())
    AND employment_status   = (SELECT employment_status   FROM public.profiles WHERE id = auth.uid())
    -- Account status must not change
    AND is_active           = (SELECT is_active           FROM public.profiles WHERE id = auth.uid())
    -- Reporting/management hierarchy must not change
    AND (manager_id IS NOT DISTINCT FROM (SELECT manager_id FROM public.profiles WHERE id = auth.uid()))
    -- Lift Off roles must not change
    AND liftoff_roles       = (SELECT liftoff_roles       FROM public.profiles WHERE id = auth.uid())
    AND liftoff_only        = (SELECT liftoff_only        FROM public.profiles WHERE id = auth.uid())
    -- Tenant must not change
    AND tenant_id           = (SELECT tenant_id           FROM public.profiles WHERE id = auth.uid())
  );

-- ── 3. Verify the policy exists with WITH CHECK ──────────────────────────────
-- Run after migration to confirm:
-- SELECT policyname, qual, with_check
-- FROM pg_policies
-- WHERE tablename = 'profiles' AND policyname = 'users can update own profile';
