-- Seed Default Agent Profiles for PanelZero
-- Run this script in Supabase SQL Editor to create default profiles for each agent
-- These profiles are read-only and visible to all users

-- Note: Default profiles use NULL for owner_id (system-wide profiles)

-- Clean up existing default profiles (optional, for re-seeding)
DELETE FROM public.agent_profiles WHERE is_default = TRUE;

-- 1. Technical Reader - APA 7th Edition Strict
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
  NULL, -- System-wide default profile
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

-- 2. Language Critic - Grammar Focus
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

-- 3. Statistician - Data & Tables Focus
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

-- 4. Subject Specialist - Content Logic
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

-- 5. Chairman - Comprehensive Review
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

-- Optional: Create additional variant profiles

-- IEEE Style for Technical Reader
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

-- Chicago Style for Grammar
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

-- Verify insertion
SELECT 
  agent_role, 
  name, 
  is_default,
  preferred_citation_style,
  font_family,
  font_size
FROM public.agent_profiles 
WHERE is_default = TRUE
ORDER BY agent_role, name;
