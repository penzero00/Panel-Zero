-- PanelZero Database Schema (Supabase PostgreSQL)
-- Execute this SQL in your Supabase dashboard

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table (extended user information)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  institution TEXT,
  role TEXT DEFAULT 'student', -- student, panelist, admin
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table with RLS (must come before saved_files)
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

-- Saved files table (for bookmarking/saving analyzed documents)
CREATE TABLE IF NOT EXISTS public.saved_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, document_id)
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

-- Agent profiles table - customizable preferences for each agent
CREATE TABLE IF NOT EXISTS public.agent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system default profiles
  agent_role TEXT NOT NULL, -- 'tech', 'grammar', 'stats', 'subject', 'chairman'
  name TEXT NOT NULL,
  description TEXT,
  
  -- Font preferences
  font_family TEXT NOT NULL DEFAULT 'Times New Roman',
  font_size INTEGER NOT NULL DEFAULT 12,
  font_style TEXT DEFAULT 'normal', -- 'normal', 'italic', 'bold', 'bold-italic'
  
  -- Margin preferences (in inches)
  margin_left_inches DECIMAL(3,2) NOT NULL DEFAULT 1.5,
  margin_right_inches DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  margin_top_inches DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  margin_bottom_inches DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  
  -- Paragraph preferences
  line_spacing DECIMAL(3,2) DEFAULT 2.0, -- 1.0 (single), 1.5, 2.0 (double)
  paragraph_spacing_before DECIMAL(3,2) DEFAULT 0,
  paragraph_spacing_after DECIMAL(3,2) DEFAULT 0,
  first_line_indent DECIMAL(3,2) DEFAULT 0.5,
  paragraph_alignment TEXT DEFAULT 'justify', -- 'left', 'center', 'right', 'justify'
  
  -- Image and media preferences
  image_format TEXT DEFAULT 'embedded', -- 'embedded', 'inline', 'floating'
  image_min_dpi INTEGER DEFAULT 300,
  image_max_width_inches DECIMAL(4,2) DEFAULT 6.0,
  
  -- Grammar and language preferences
  check_passive_voice BOOLEAN DEFAULT TRUE,
  check_tense_consistency BOOLEAN DEFAULT TRUE,
  check_subject_verb_agreement BOOLEAN DEFAULT TRUE,
  check_sentence_fragments BOOLEAN DEFAULT TRUE,
  preferred_citation_style TEXT DEFAULT 'APA 7th', -- 'APA 7th', 'IEEE', 'Chicago', etc.
  
  -- Additional spacing rules
  add_space_after_period BOOLEAN DEFAULT TRUE,
  add_space_after_comma BOOLEAN DEFAULT TRUE,
  check_double_spaces BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE, -- System-provided default profile
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, agent_role, name)
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for saved_files table
DROP POLICY IF EXISTS "Users can view their own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can insert their own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can update their own saved files" ON public.saved_files;
DROP POLICY IF EXISTS "Users can delete their own saved files" ON public.saved_files;

CREATE POLICY "Users can view their own saved files"
  ON public.saved_files
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own saved files"
  ON public.saved_files
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own saved files"
  ON public.saved_files
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own saved files"
  ON public.saved_files
  FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for documents table
DROP POLICY IF EXISTS "Users can only access their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can insert their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.documents;

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
DROP POLICY IF EXISTS "Users can only access their own analysis tasks" ON public.analysis_tasks;
DROP POLICY IF EXISTS "Users can insert their own analysis tasks" ON public.analysis_tasks;
DROP POLICY IF EXISTS "Users can update their own analysis tasks" ON public.analysis_tasks;

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

-- RLS Policies for agent_profiles table
DROP POLICY IF EXISTS "Users can access their own agent profiles and default profiles" ON public.agent_profiles;
DROP POLICY IF EXISTS "Users can insert their own agent profiles" ON public.agent_profiles;
DROP POLICY IF EXISTS "Users can update their own agent profiles" ON public.agent_profiles;
DROP POLICY IF EXISTS "Users can delete their own agent profiles" ON public.agent_profiles;

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

-- Create indexes for performance
DROP INDEX IF EXISTS public.idx_user_profiles_email_verified;
DROP INDEX IF EXISTS public.idx_user_profiles_role;
DROP INDEX IF EXISTS public.idx_saved_files_owner_id;
DROP INDEX IF EXISTS public.idx_saved_files_document_id;
DROP INDEX IF EXISTS public.idx_saved_files_is_favorite;
DROP INDEX IF EXISTS public.idx_documents_owner_id;
DROP INDEX IF EXISTS public.idx_documents_status;
DROP INDEX IF EXISTS public.idx_documents_expired_at;
DROP INDEX IF EXISTS public.idx_analysis_tasks_owner_id;
DROP INDEX IF EXISTS public.idx_analysis_tasks_file_id;
DROP INDEX IF EXISTS public.idx_analysis_tasks_status;
DROP INDEX IF EXISTS public.idx_agent_profiles_owner_id;
DROP INDEX IF EXISTS public.idx_agent_profiles_agent_role;
DROP INDEX IF EXISTS public.idx_agent_profiles_is_active;
DROP INDEX IF EXISTS public.idx_agent_profiles_is_default;

CREATE INDEX idx_user_profiles_email_verified ON public.user_profiles(email_verified);
CREATE INDEX idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX idx_saved_files_owner_id ON public.saved_files(owner_id);
CREATE INDEX idx_saved_files_document_id ON public.saved_files(document_id);
CREATE INDEX idx_saved_files_is_favorite ON public.saved_files(is_favorite);
CREATE INDEX idx_documents_owner_id ON public.documents(owner_id);
CREATE INDEX idx_documents_status ON public.documents(status);
CREATE INDEX idx_documents_expired_at ON public.documents(expired_at);
CREATE INDEX idx_analysis_tasks_owner_id ON public.analysis_tasks(owner_id);
CREATE INDEX idx_analysis_tasks_file_id ON public.analysis_tasks(file_id);
CREATE INDEX idx_analysis_tasks_status ON public.analysis_tasks(status);
CREATE INDEX idx_agent_profiles_owner_id ON public.agent_profiles(owner_id);
CREATE INDEX idx_agent_profiles_agent_role ON public.agent_profiles(agent_role);
CREATE INDEX idx_agent_profiles_is_active ON public.agent_profiles(is_active);
CREATE INDEX idx_agent_profiles_is_default ON public.agent_profiles(is_default);

-- Function to handle user creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email_verified, created_at)
  VALUES (NEW.id, NEW.email_confirmed_at IS NOT NULL, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for DOCX files (create via Supabase dashboard and set RLS)
-- Bucket name: thesis-drafts
-- RLS Policy: Allow authenticated users to upload/download/delete files with owner_id path prefix

-- Storage bucket for profile avatars (create via Supabase dashboard and set RLS)
-- Bucket name: profile-avatars (public read recommended)
-- RLS Policies (storage.objects):
--   INSERT: auth.uid() = owner AND bucket_id = 'profile-avatars'
--   UPDATE: auth.uid() = owner AND bucket_id = 'profile-avatars'
--   DELETE: auth.uid() = owner AND bucket_id = 'profile-avatars'
