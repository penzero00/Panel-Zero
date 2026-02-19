-- PanelZero Database Schema (Supabase PostgreSQL)
-- Execute this SQL in your Supabase dashboard

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (managed by Supabase Auth, we just add custom columns)
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Documents table with RLS
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, analyzed, failed
  major_errors INTEGER DEFAULT 0,
  minor_errors INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expired_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '1 hour',
  deleted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(owner_id, file_path)
);

-- Analysis tasks table
CREATE TABLE IF NOT EXISTS public.analysis_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  agent_role TEXT NOT NULL, -- tech, grammar, stats, subject, chairman
  status TEXT NOT NULL DEFAULT 'queued', -- queued, processing, complete, failed
  progress INTEGER DEFAULT 0,
  celery_task_id TEXT,
  results JSONB,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(owner_id, file_id, agent_role)
);

-- Rubric profiles table
CREATE TABLE IF NOT EXISTS public.rubric_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  format_standard TEXT NOT NULL, -- "APA 7th Edition", "IEEE", etc.
  margin_left_inches DECIMAL(3,2) NOT NULL DEFAULT 1.5,
  margin_right_inches DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  margin_top_inches DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  margin_bottom_inches DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  font_family TEXT NOT NULL DEFAULT 'Times New Roman',
  font_size INTEGER NOT NULL DEFAULT 12,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, name)
);

-- Enable RLS on all tables
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rubric_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents table
CREATE POLICY "Users can only access their own documents"
  ON public.documents
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own documents"
  ON public.documents
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own documents"
  ON public.documents
  FOR DELETE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can update their own documents"
  ON public.documents
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for analysis_tasks table
CREATE POLICY "Users can only access their own analysis tasks"
  ON public.analysis_tasks
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own analysis tasks"
  ON public.analysis_tasks
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own analysis tasks"
  ON public.analysis_tasks
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- RLS Policies for rubric_profiles table
CREATE POLICY "Users can only access their own rubric profiles"
  ON public.rubric_profiles
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own rubric profiles"
  ON public.rubric_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own rubric profiles"
  ON public.rubric_profiles
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own rubric profiles"
  ON public.rubric_profiles
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Create indexes for performance
CREATE INDEX idx_documents_owner_id ON public.documents(owner_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_expired_at ON public.documents(expired_at);
CREATE INDEX idx_analysis_tasks_owner_id ON public.analysis_tasks(owner_id);
CREATE INDEX idx_analysis_tasks_file_id ON public.analysis_tasks(file_id);
CREATE INDEX idx_analysis_tasks_status ON public.analysis_tasks(status);
CREATE INDEX idx_rubric_profiles_owner_id ON public.rubric_profiles(owner_id);
CREATE INDEX idx_rubric_profiles_is_active ON public.rubric_profiles(is_active);

-- Storage bucket for DOCX files (create via Supabase dashboard and set RLS)
-- Bucket name: thesis-drafts
-- RLS Policy: Allow authenticated users to upload/download/delete files with owner_id path prefix
