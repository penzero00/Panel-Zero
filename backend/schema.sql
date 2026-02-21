-- PanelZero Unified Schema (Supabase PostgreSQL)
-- Run this file in Supabase SQL Editor after resetting the database.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================
-- Tables
-- =====================

-- User profiles table (extended user information)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  institution TEXT,
  role TEXT DEFAULT 'student', -- student, panelist, admin
  email_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Documents table (must come before saved_files)
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

-- Agent profiles table (customizable preferences for each agent)
CREATE TABLE IF NOT EXISTS public.agent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for system default profiles
  agent_role TEXT NOT NULL, -- tech, grammar, stats, subject, chairman
  name TEXT NOT NULL,
  custom_instruction TEXT, -- Custom instructions to be included in agent prompts

  -- Font preferences
  font_family TEXT NOT NULL DEFAULT 'Times New Roman',
  font_size INTEGER NOT NULL DEFAULT 12,
  font_style TEXT DEFAULT 'normal', -- normal, italic, bold, bold-italic
  enable_font_check BOOLEAN DEFAULT TRUE, -- Enable/disable font validation

  -- Margin preferences (in inches)
  margin_left_inches DECIMAL(3,2) NOT NULL DEFAULT 1.5,
  margin_right_inches DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  margin_top_inches DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  margin_bottom_inches DECIMAL(3,2) NOT NULL DEFAULT 1.0,
  enable_margin_check BOOLEAN DEFAULT TRUE, -- Enable/disable margin validation

  -- Paragraph preferences
  line_spacing DECIMAL(3,2) DEFAULT 2.0, -- 1.0 (single), 1.5, 2.0 (double)
  paragraph_spacing_before DECIMAL(3,2) DEFAULT 0,
  paragraph_spacing_after DECIMAL(3,2) DEFAULT 0,
  first_line_indent DECIMAL(3,2) DEFAULT 0.5,
  paragraph_alignment TEXT DEFAULT 'justify', -- left, center, right, justify
  enable_paragraph_check BOOLEAN DEFAULT TRUE, -- Enable/disable paragraph formatting validation

  -- Image and media preferences
  image_format TEXT DEFAULT 'embedded', -- embedded, inline, floating
  image_min_dpi INTEGER DEFAULT 300,
  image_max_width_inches DECIMAL(4,2) DEFAULT 6.0,
  enable_image_check BOOLEAN DEFAULT TRUE, -- Enable/disable image validation

  -- Grammar and language preferences
  check_passive_voice BOOLEAN DEFAULT TRUE,
  check_tense_consistency BOOLEAN DEFAULT TRUE,
  check_subject_verb_agreement BOOLEAN DEFAULT TRUE,
  check_sentence_fragments BOOLEAN DEFAULT TRUE,
  preferred_citation_style TEXT DEFAULT 'APA 7th', -- APA 7th, IEEE, Chicago, etc.
  enable_grammar_check BOOLEAN DEFAULT TRUE, -- Enable/disable grammar and language validation

  -- Additional spacing rules
  add_space_after_period BOOLEAN DEFAULT TRUE,
  add_space_after_comma BOOLEAN DEFAULT TRUE,
  check_double_spaces BOOLEAN DEFAULT TRUE,
  enable_spacing_check BOOLEAN DEFAULT TRUE, -- Enable/disable spacing and punctuation validation

  -- Metadata
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE, -- System-provided default profile
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, agent_role, name)
);

-- =====================
-- RLS Enablement
-- =====================

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_profiles ENABLE ROW LEVEL SECURITY;

-- =====================
-- RLS Policies
-- =====================

-- user_profiles
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

-- saved_files
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

-- documents
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

-- analysis_tasks
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

-- agent_profiles
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

-- =====================
-- Indexes
-- =====================

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

-- =====================
-- Triggers
-- =====================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, email_verified, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NEW.email_confirmed_at IS NOT NULL, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL) THEN
    UPDATE public.user_profiles
    SET email_verified = TRUE,
        email = NEW.email,
        updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();

-- =====================
-- Seed Default Agent Profiles
-- =====================

DELETE FROM public.agent_profiles WHERE is_default = TRUE;

INSERT INTO public.agent_profiles (
  id, owner_id, agent_role, name, description,
  font_family, font_size, font_style,
  margin_left_inches, margin_right_inches, margin_top_inches, margin_bottom_inches,
  line_spacing, paragraph_spacing_before, paragraph_spacing_after, first_line_indent, paragraph_alignment,
  image_format, image_min_dpi, image_max_width_inches,
  check_passive_voice, check_tense_consistency, check_subject_verb_agreement, check_sentence_fragments,
  preferred_citation_style,
  add_space_after_period, add_space_after_comma, check_double_spaces,
  is_active, is_default, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  NULL,
  'tech',
  'APA 7th Edition (Strict)',
  'Standard margins (1.5" left), Times New Roman 12pt, double-spaced. Strict format checking for technical correctness.',
  'Times New Roman', 12, 'normal',
  1.5, 1.0, 1.0, 1.0,
  2.0, 0, 0, 0.5, 'justify',
  'embedded', 300, 6.0,
  TRUE, TRUE, TRUE, TRUE,
  'APA 7th',
  TRUE, TRUE, TRUE,
  FALSE, TRUE, NOW(), NOW()
);

INSERT INTO public.agent_profiles (
  id, owner_id, agent_role, name, description,
  font_family, font_size, font_style,
  margin_left_inches, margin_right_inches, margin_top_inches, margin_bottom_inches,
  line_spacing, paragraph_spacing_before, paragraph_spacing_after, first_line_indent, paragraph_alignment,
  image_format, image_min_dpi, image_max_width_inches,
  check_passive_voice, check_tense_consistency, check_subject_verb_agreement, check_sentence_fragments,
  preferred_citation_style,
  add_space_after_period, add_space_after_comma, check_double_spaces,
  is_active, is_default, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  NULL,
  'grammar',
  'Academic Grammar (Comprehensive)',
  'All grammar checks enabled. Focuses on tense consistency, passive voice detection, and sentence structure.',
  'Times New Roman', 12, 'normal',
  1.5, 1.0, 1.0, 1.0,
  2.0, 0, 0, 0.5, 'justify',
  'embedded', 300, 6.0,
  TRUE, TRUE, TRUE, TRUE,
  'APA 7th',
  TRUE, TRUE, TRUE,
  FALSE, TRUE, NOW(), NOW()
);

INSERT INTO public.agent_profiles (
  id, owner_id, agent_role, name, description,
  font_family, font_size, font_style,
  margin_left_inches, margin_right_inches, margin_top_inches, margin_bottom_inches,
  line_spacing, paragraph_spacing_before, paragraph_spacing_after, first_line_indent, paragraph_alignment,
  image_format, image_min_dpi, image_max_width_inches,
  check_passive_voice, check_tense_consistency, check_subject_verb_agreement, check_sentence_fragments,
  preferred_citation_style,
  add_space_after_period, add_space_after_comma, check_double_spaces,
  is_active, is_default, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000003',
  NULL,
  'stats',
  'Statistical Analysis (APA)',
  'Optimized for statistical content. Validates data presentation, table formatting, and figure quality.',
  'Times New Roman', 12, 'normal',
  1.5, 1.0, 1.0, 1.0,
  2.0, 0, 0, 0.5, 'justify',
  'embedded', 300, 6.5,
  TRUE, TRUE, TRUE, TRUE,
  'APA 7th',
  TRUE, TRUE, TRUE,
  FALSE, TRUE, NOW(), NOW()
);

INSERT INTO public.agent_profiles (
  id, owner_id, agent_role, name, description,
  font_family, font_size, font_style,
  margin_left_inches, margin_right_inches, margin_top_inches, margin_bottom_inches,
  line_spacing, paragraph_spacing_before, paragraph_spacing_after, first_line_indent, paragraph_alignment,
  image_format, image_min_dpi, image_max_width_inches,
  check_passive_voice, check_tense_consistency, check_subject_verb_agreement, check_sentence_fragments,
  preferred_citation_style,
  add_space_after_period, add_space_after_comma, check_double_spaces,
  is_active, is_default, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000004',
  NULL,
  'subject',
  'Content Coherence (Academic)',
  'Evaluates logical flow and content coherence. Standard academic formatting with focus on argumentation.',
  'Times New Roman', 12, 'normal',
  1.5, 1.0, 1.0, 1.0,
  2.0, 0, 0, 0.5, 'justify',
  'embedded', 300, 6.0,
  TRUE, TRUE, TRUE, TRUE,
  'APA 7th',
  TRUE, TRUE, TRUE,
  FALSE, TRUE, NOW(), NOW()
);

INSERT INTO public.agent_profiles (
  id, owner_id, agent_role, name, description,
  font_family, font_size, font_style,
  margin_left_inches, margin_right_inches, margin_top_inches, margin_bottom_inches,
  line_spacing, paragraph_spacing_before, paragraph_spacing_after, first_line_indent, paragraph_alignment,
  image_format, image_min_dpi, image_max_width_inches,
  check_passive_voice, check_tense_consistency, check_subject_verb_agreement, check_sentence_fragments,
  preferred_citation_style,
  add_space_after_period, add_space_after_comma, check_double_spaces,
  is_active, is_default, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000005',
  NULL,
  'chairman',
  'Comprehensive Defense Review',
  'Synthesizes all previous agent feedback. Full comprehensive review of formatting, grammar, and content.',
  'Times New Roman', 12, 'normal',
  1.5, 1.0, 1.0, 1.0,
  2.0, 0, 0, 0.5, 'justify',
  'embedded', 300, 6.0,
  TRUE, TRUE, TRUE, TRUE,
  'APA 7th',
  TRUE, TRUE, TRUE,
  FALSE, TRUE, NOW(), NOW()
);

INSERT INTO public.agent_profiles (
  id, owner_id, agent_role, name, description,
  font_family, font_size, font_style,
  margin_left_inches, margin_right_inches, margin_top_inches, margin_bottom_inches,
  line_spacing, paragraph_spacing_before, paragraph_spacing_after, first_line_indent, paragraph_alignment,
  image_format, image_min_dpi, image_max_width_inches,
  check_passive_voice, check_tense_consistency, check_subject_verb_agreement, check_sentence_fragments,
  preferred_citation_style,
  add_space_after_period, add_space_after_comma, check_double_spaces,
  is_active, is_default, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000006',
  NULL,
  'tech',
  'IEEE Engineering Standard',
  'IEEE citation style with 1" margins all around. Optimized for engineering and technical manuscripts.',
  'Times New Roman', 10, 'normal',
  1.0, 1.0, 1.0, 1.0,
  1.5, 0, 0, 0.5, 'justify',
  'embedded', 300, 6.0,
  FALSE, TRUE, TRUE, TRUE,
  'IEEE',
  TRUE, TRUE, TRUE,
  FALSE, TRUE, NOW(), NOW()
);

INSERT INTO public.agent_profiles (
  id, owner_id, agent_role, name, description,
  font_family, font_size, font_style,
  margin_left_inches, margin_right_inches, margin_top_inches, margin_bottom_inches,
  line_spacing, paragraph_spacing_before, paragraph_spacing_after, first_line_indent, paragraph_alignment,
  image_format, image_min_dpi, image_max_width_inches,
  check_passive_voice, check_tense_consistency, check_subject_verb_agreement, check_sentence_fragments,
  preferred_citation_style,
  add_space_after_period, add_space_after_comma, check_double_spaces,
  is_active, is_default, created_at, updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000007',
  NULL,
  'grammar',
  'Chicago Manual of Style',
  'Chicago/Turabian formatting rules. Ideal for humanities and social sciences.',
  'Times New Roman', 12, 'normal',
  1.0, 1.0, 1.0, 1.0,
  2.0, 0, 0, 0.5, 'justify',
  'embedded', 300, 6.0,
  TRUE, TRUE, TRUE, TRUE,
  'Chicago',
  TRUE, TRUE, TRUE,
  FALSE, TRUE, NOW(), NOW()
);

-- =====================
-- Storage Buckets (create via Supabase dashboard and set RLS)
-- =====================

-- Bucket: thesis-drafts
INSERT INTO storage.buckets (id, name, public)
VALUES ('thesis-drafts', 'thesis-drafts', false)
ON CONFLICT (id) DO NOTHING;

-- Bucket: profile-avatars (public read recommended)
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies (storage.objects)
DROP POLICY IF EXISTS "Users can manage their thesis drafts" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their thesis drafts" ON storage.objects;
DROP POLICY IF EXISTS "Users can manage their profile avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can read profile avatars" ON storage.objects;

CREATE POLICY "Users can manage their thesis drafts"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'thesis-drafts' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'thesis-drafts' AND auth.uid() = owner);

CREATE POLICY "Users can read their thesis drafts"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'thesis-drafts' AND auth.uid() = owner);

CREATE POLICY "Users can manage their profile avatars"
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'profile-avatars' AND auth.uid() = owner)
  WITH CHECK (bucket_id = 'profile-avatars' AND auth.uid() = owner);

CREATE POLICY "Users can read profile avatars"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'profile-avatars');
