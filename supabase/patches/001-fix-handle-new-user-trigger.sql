-- ═══════════════════════════════════════════════════════════════════
-- HCMG Portal — Trigger patch: populate lo_slug and nmls from metadata
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════════

-- Update the handle_new_user trigger to also populate lo_slug, nmls, notify_email, phone
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
declare
  _lo_slug text;
begin
  -- lo_slug must be unique and non-empty — treat empty string as null
  _lo_slug := nullif(trim(coalesce(new.raw_user_meta_data->>'lo_slug', '')), '');

  insert into public.profiles (id, email, full_name, role, lo_slug, nmls, notify_email)
  values (
    new.id,
    new.email,
    coalesce(nullif(trim(new.raw_user_meta_data->>'full_name'), ''), split_part(new.email, '@', 1)),
    coalesce(nullif(trim(new.raw_user_meta_data->>'role'), ''), 'loan_officer'),
    _lo_slug,
    nullif(trim(coalesce(new.raw_user_meta_data->>'nmls', '')), ''),
    nullif(trim(coalesce(new.raw_user_meta_data->>'notify_email', '')), '')
  );
  return new;
end;
$$;
