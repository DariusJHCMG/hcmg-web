-- ═══════════════════════════════════════════════════════════════
-- SLICE by HCMG — Sync Helper Function
-- Creates a Postgres function that returns HCMG team members
-- from TenantMembership + User tables (which PostgREST can't
-- query directly due to schema cache issues with Prisma tables).
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

create or replace function public.get_hcmg_team_members(tenant_id_param text)
returns table (
  user_id          text,
  email            text,
  name             text,
  avatar_url       text,
  is_tenant_admin  boolean,
  primary_wire_role text,
  lo_nmls          text
)
language sql
security definer
stable
as $$
  select
    u.id                    as user_id,
    u.email                 as email,
    u.name                  as name,
    u."avatarUrl"           as avatar_url,
    tm."isTenantAdmin"      as is_tenant_admin,
    tm."primaryWireRole"    as primary_wire_role,
    tm."loNmls"             as lo_nmls
  from "TenantMembership" tm
  join "User" u on u.id = tm."userId"
  where tm."tenantId"  = tenant_id_param
    and tm."isActive"  = true
    and u."isActive"   = true;
$$;

-- Grant execute to service role (anon and authenticated also fine)
grant execute on function public.get_hcmg_team_members(text) to service_role;
grant execute on function public.get_hcmg_team_members(text) to authenticated;
grant execute on function public.get_hcmg_team_members(text) to anon;
