-- ═══════════════════════════════════════════════════════════════════════════
-- HCMG — Security Advisor Fixes
-- Migration: 20260823_security_advisor_fixes.sql
--
-- Resolves two Supabase security advisor findings:
--
--   1. rls_disabled_in_public — arive_lookup_results has RLS enabled but
--      no policies. Supabase flags tables with zero policies even when the
--      intent is deny-all. Adding an explicit FALSE policy satisfies the
--      advisor and documents the intent. The service role bypasses RLS and
--      continues to work normally.
--
--   2. sensitive_columns_exposed — goal_leaderboard view exposes full_name,
--      avatar_url, nmls from profiles without honouring RLS. Recreating it
--      with security_invoker = true makes it run as the calling role so the
--      profiles RLS policies apply.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. arive_lookup_results: explicit deny-all for non-service-role access ────
-- All real access comes via createServiceClient() which bypasses RLS.
-- This policy makes the deny-all intent explicit and clears the advisor flag.
create policy "no direct client access"
  on public.arive_lookup_results
  as restrictive
  for all
  using (false);

-- ── 2. goal_leaderboard: recreate view with security_invoker = true ──────────
-- With security_invoker the view runs as the calling role (anon / authenticated)
-- so the RLS policies on profiles, goal_commitments, and goal_production apply.
-- The service role still bypasses RLS so server-side queries are unaffected.
create or replace view public.goal_leaderboard
  with (security_invoker = true)
as
WITH participants AS (
    SELECT DISTINCT ga.goal_month_id, ga.profile_id
      FROM goal_assignments ga
  UNION
    SELECT DISTINCT c_1.goal_month_id, c_1.profile_id
      FROM goal_commitments c_1
)
SELECT par.goal_month_id, par.profile_id,
       p.full_name, p.avatar_url, p.nmls,
       COALESCE(c.funded_volume_commitment, 0::numeric)  AS funded_volume_commitment,
       COALESCE(c.funded_units_commitment, 0)             AS funded_units_commitment,
       COALESCE(c.app_volume_commitment, 0::numeric)      AS app_volume_commitment,
       COALESCE(c.app_units_commitment, 0)                AS app_units_commitment,
       c.confidence_pct, c.submitted_at,
       COALESCE(sum(pr.funded_volume) FILTER (
           WHERE pr.is_excluded = false
             AND pr.event_type = ANY (ARRAY['funded', 'correction'])
             AND pr.funded_volume IS NOT NULL
       ), 0::numeric)::numeric(18,2)                      AS funded_volume_actual,
       COALESCE(sum(pr.funded_unit) FILTER (
           WHERE pr.is_excluded = false
             AND pr.event_type = ANY (ARRAY['funded', 'correction'])
       ), 0::bigint)::integer                             AS funded_units_actual,
       COALESCE(sum(pr.app_volume) FILTER (
           WHERE pr.is_excluded = false
             AND pr.event_type = ANY (ARRAY['application', 'funded'])
             AND pr.app_volume IS NOT NULL
       ), 0::numeric)::numeric(18,2)                      AS app_volume_actual,
       COALESCE(sum(pr.app_unit) FILTER (
           WHERE pr.is_excluded = false
             AND pr.event_type = ANY (ARRAY['application', 'funded'])
       ), 0::bigint)::integer                             AS app_units_actual
  FROM participants par
  JOIN profiles p ON p.id = par.profile_id
  LEFT JOIN goal_commitments c
         ON c.profile_id = par.profile_id AND c.goal_month_id = par.goal_month_id
  LEFT JOIN goal_production pr
         ON pr.profile_id = par.profile_id AND pr.goal_month_id = par.goal_month_id
 GROUP BY par.goal_month_id, par.profile_id,
          p.full_name, p.avatar_url, p.nmls,
          c.funded_volume_commitment, c.funded_units_commitment,
          c.app_volume_commitment, c.app_units_commitment,
          c.confidence_pct, c.submitted_at;
