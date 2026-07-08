-- Add profile page content fields to profiles table
alter table profiles
  add column if not exists hero_bio        text,
  add column if not exists about_headline  text,
  add column if not exists long_bio        text[],
  add column if not exists years_experience integer,
  add column if not exists specialties     text[];
