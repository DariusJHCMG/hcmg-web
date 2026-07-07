-- ═══════════════════════════════════════════════════════════════════
-- HCMG Portal — Patch 005
-- 1. Seed funnel_links for all existing LO profiles that have lo_slug
-- 2. Backfill notify_email on profiles where it is null (→ login email)
-- 3. Add DB-level trigger: auto-create/update funnel_link whenever a
--    profile's lo_slug is set or changed (so admin-portal creates are
--    always in sync even if the API upsert step fails)
-- 4. Add DB-level trigger: disable funnel_link when profile.is_active
--    goes false, re-enable when it goes true
--
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- Safe to run multiple times (all statements are idempotent).
-- ═══════════════════════════════════════════════════════════════════

-- ── 1. Seed funnel_links for existing LO profiles ─────────────────
insert into public.funnel_links (lo_slug, lo_name, url, is_active, clicks)
select
  p.lo_slug,
  p.full_name,
  'https://hcmg-web.vercel.app/go/' || p.lo_slug,
  p.is_active,
  0
from public.profiles p
where p.lo_slug is not null
  and p.lo_slug <> ''
on conflict (lo_slug) do update
  set lo_name   = excluded.lo_name,
      url       = excluded.url,
      is_active = excluded.is_active;

-- ── 2. Backfill notify_email where null ───────────────────────────
update public.profiles
set notify_email = email
where notify_email is null;

-- ── 3. Auto-manage funnel_link on profile lo_slug change ──────────
create or replace function public.sync_funnel_link()
returns trigger language plpgsql security definer as $$
declare
  _site text := 'https://hcmg-web.vercel.app';
begin
  -- If lo_slug was cleared, deactivate the old funnel link
  if (old.lo_slug is not null) and (new.lo_slug is null or new.lo_slug = '') then
    update public.funnel_links
    set is_active = false
    where lo_slug = old.lo_slug;
    return new;
  end if;

  -- If lo_slug was set or changed, upsert the funnel link
  if new.lo_slug is not null and new.lo_slug <> '' then
    insert into public.funnel_links (lo_slug, lo_name, url, is_active, clicks)
    values (
      new.lo_slug,
      new.full_name,
      _site || '/go/' || new.lo_slug,
      new.is_active,
      0
    )
    on conflict (lo_slug) do update
      set lo_name   = excluded.lo_name,
          url       = excluded.url,
          is_active = excluded.is_active;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_funnel_link on public.profiles;
create trigger profiles_sync_funnel_link
  after update of lo_slug, full_name, is_active
  on public.profiles
  for each row
  execute procedure public.sync_funnel_link();

-- Also fire on INSERT in case the API upsert doesn't happen
create or replace function public.sync_funnel_link_on_insert()
returns trigger language plpgsql security definer as $$
declare
  _site text := 'https://hcmg-web.vercel.app';
begin
  if new.lo_slug is not null and new.lo_slug <> '' then
    insert into public.funnel_links (lo_slug, lo_name, url, is_active, clicks)
    values (
      new.lo_slug,
      new.full_name,
      _site || '/go/' || new.lo_slug,
      new.is_active,
      0
    )
    on conflict (lo_slug) do update
      set lo_name   = excluded.lo_name,
          url       = excluded.url,
          is_active = excluded.is_active;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_insert_funnel_link on public.profiles;
create trigger profiles_insert_funnel_link
  after insert on public.profiles
  for each row
  execute procedure public.sync_funnel_link_on_insert();

-- ── 4. Verify seed results ─────────────────────────────────────────
-- Run this SELECT to confirm all LO profiles now have a funnel_link:
--
--   select p.full_name, p.lo_slug, p.is_active, fl.url, fl.is_active as link_active
--   from public.profiles p
--   left join public.funnel_links fl on fl.lo_slug = p.lo_slug
--   where p.lo_slug is not null
--   order by p.full_name;
