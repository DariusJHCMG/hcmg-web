-- Migration: add invite_pending column to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS invite_pending boolean NOT NULL DEFAULT false;
