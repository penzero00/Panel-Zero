-- Migration: Add missing columns to agent_profiles table
-- Run this in Supabase SQL Editor to sync your database with schema.sql

-- Add custom_instruction column if it doesn't exist
ALTER TABLE public.agent_profiles
ADD COLUMN IF NOT EXISTS custom_instruction TEXT;

-- Add enable_grammar_check column if it doesn't exist
ALTER TABLE public.agent_profiles
ADD COLUMN IF NOT EXISTS enable_grammar_check BOOLEAN DEFAULT TRUE;

-- Add enable_spacing_check column if it doesn't exist
ALTER TABLE public.agent_profiles
ADD COLUMN IF NOT EXISTS enable_spacing_check BOOLEAN DEFAULT TRUE;

-- Add comments to columns (PostgreSQL style - separate COMMENT ON statements)
COMMENT ON COLUMN public.agent_profiles.custom_instruction IS 'Custom instructions to be included in agent prompts';
COMMENT ON COLUMN public.agent_profiles.enable_grammar_check IS 'Enable/disable grammar and language validation';
COMMENT ON COLUMN public.agent_profiles.enable_spacing_check IS 'Enable/disable spacing and punctuation validation';

-- Verify the columns were added (this won't modify anything, just shows structure)
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'agent_profiles' AND column_name IN ('custom_instruction', 'enable_grammar_check', 'enable_spacing_check');
