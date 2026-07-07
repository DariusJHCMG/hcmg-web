INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  'darius@hcmgloans.com',
  crypt('Queen1972$', gen_salt('bf')),
  now(),
  '{"full_name":"Darius James","role":"admin"}'::jsonb,
  now(),
  now(),
  'authenticated',
  'authenticated'
) RETURNING id;
