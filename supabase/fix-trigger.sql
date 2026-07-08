-- Drop and recreate the handle_new_user trigger to auto-populate all fields
-- including lo_slug, nmls, notify_email from user_metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    role,
    lo_slug,
    nmls,
    notify_email,
    is_active
  ) VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'role', 'loan_officer'),
    NULLIF(new.raw_user_meta_data->>'lo_slug', ''),
    NULLIF(new.raw_user_meta_data->>'nmls', ''),
    COALESCE(NULLIF(new.raw_user_meta_data->>'notify_email', ''), new.email),
    true
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name    = EXCLUDED.full_name,
    role         = EXCLUDED.role,
    lo_slug      = EXCLUDED.lo_slug,
    nmls         = EXCLUDED.nmls,
    notify_email = EXCLUDED.notify_email;

  -- Auto-create funnel link if lo_slug is set
  IF new.raw_user_meta_data->>'lo_slug' IS NOT NULL
     AND new.raw_user_meta_data->>'lo_slug' != '' THEN
    INSERT INTO public.funnel_links (lo_slug, lo_name, url, is_active)
    VALUES (
      new.raw_user_meta_data->>'lo_slug',
      COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      'https://hcmgloans.com/go/' || (new.raw_user_meta_data->>'lo_slug'),
      true
    )
    ON CONFLICT (lo_slug) DO NOTHING;
  END IF;

  RETURN new;
END;
$$;
