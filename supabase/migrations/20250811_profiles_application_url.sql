-- Add application_url to profiles (calendar_url already exists)
alter table profiles
  add column if not exists application_url text null;
