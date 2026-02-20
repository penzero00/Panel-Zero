-- Fix agent_profiles table to allow NULL owner_id for default profiles
-- Run this BEFORE running seed_default_profiles.sql

-- Make owner_id nullable
ALTER TABLE public.agent_profiles ALTER COLUMN owner_id DROP NOT NULL;

-- Update RLS policies to handle NULL owner_id
DROP POLICY IF EXISTS "Users can access their own agent profiles and default profiles" ON public.agent_profiles;
DROP POLICY IF EXISTS "Users can insert their own agent profiles" ON public.agent_profiles;
DROP POLICY IF EXISTS "Users can update their own agent profiles" ON public.agent_profiles;
DROP POLICY IF EXISTS "Users can delete their own agent profiles" ON public.agent_profiles;

-- Recreate policies with NULL handling
CREATE POLICY "Users can access their own agent profiles and default profiles"
  ON public.agent_profiles
  FOR SELECT
  USING (auth.uid() = owner_id OR is_default = TRUE);

CREATE POLICY "Users can insert their own agent profiles"
  ON public.agent_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id AND is_default = FALSE);

CREATE POLICY "Users can update their own agent profiles"
  ON public.agent_profiles
  FOR UPDATE
  USING (auth.uid() = owner_id AND is_default = FALSE AND owner_id IS NOT NULL)
  WITH CHECK (auth.uid() = owner_id AND is_default = FALSE AND owner_id IS NOT NULL);

CREATE POLICY "Users can delete their own agent profiles"
  ON public.agent_profiles
  FOR DELETE
  USING (auth.uid() = owner_id AND is_default = FALSE AND owner_id IS NOT NULL);

-- Verify the change
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'agent_profiles' AND column_name = 'owner_id';
