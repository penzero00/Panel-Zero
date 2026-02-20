/**
 * PanelZero Frontend Type Definitions
 * Strictly typed interfaces for role-based AI agents and document processing
 */

export type AgentRole = 'tech' | 'grammar' | 'stats' | 'subject' | 'chairman';

export interface Agent {
  id: AgentRole;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  description: string;
  model: 'python' | 'gemini-flash' | 'gemini-pro' | 'gpt-4o';
}

export interface AnalysisTask {
  task_id: string;
  file_id: string;
  agent_role: AgentRole;
  status: 'pending' | 'processing' | 'complete' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
}

export interface ProcessingResult {
  task_id: string;
  status: 'success' | 'error';
  major_errors: number;
  minor_errors: number;
  summary: string;
  file_download_url?: string;
  error_message?: string;
}

export interface Document {
  id: string;
  name: string;
  owner_id: string;
  upload_date: string;
  file_path: string;
  status: 'pending' | 'analyzed' | 'failed';
  errors?: number;
  created_at: string;
  expires_at: string;
}

export interface AgentProfile {
  id: string;
  owner_id: string;
  agent_role: AgentRole;
  name: string;
  description: string;
  
  // Font preferences
  font_family: string;
  font_size: number;
  font_style: 'normal' | 'italic' | 'bold' | 'bold-italic';
  
  // Margin preferences (in inches)
  margin_left_inches: number;
  margin_right_inches: number;
  margin_top_inches: number;
  margin_bottom_inches: number;
  
  // Paragraph preferences
  line_spacing: number;
  paragraph_spacing_before: number;
  paragraph_spacing_after: number;
  first_line_indent: number;
  paragraph_alignment: 'left' | 'center' | 'right' | 'justify';
  
  // Image and media preferences
  image_format: 'embedded' | 'inline' | 'floating';
  image_min_dpi: number;
  image_max_width_inches: number;
  
  // Grammar and language preferences
  check_passive_voice: boolean;
  check_tense_consistency: boolean;
  check_subject_verb_agreement: boolean;
  check_sentence_fragments: boolean;
  preferred_citation_style: string;
  
  // Additional spacing rules
  add_space_after_period: boolean;
  add_space_after_comma: boolean;
  check_double_spaces: boolean;
  
  // Metadata
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAgentProfileInput {
  agent_role: AgentRole;
  name: string;
  description?: string;
  font_family?: string;
  font_size?: number;
  font_style?: 'normal' | 'italic' | 'bold' | 'bold-italic';
  margin_left_inches?: number;
  margin_right_inches?: number;
  margin_top_inches?: number;
  margin_bottom_inches?: number;
  line_spacing?: number;
  paragraph_spacing_before?: number;
  paragraph_spacing_after?: number;
  first_line_indent?: number;
  paragraph_alignment?: 'left' | 'center' | 'right' | 'justify';
  image_format?: 'embedded' | 'inline' | 'floating';
  image_min_dpi?: number;
  image_max_width_inches?: number;
  check_passive_voice?: boolean;
  check_tense_consistency?: boolean;
  check_subject_verb_agreement?: boolean;
  check_sentence_fragments?: boolean;
  preferred_citation_style?: string;
  add_space_after_period?: boolean;
  add_space_after_comma?: boolean;
  check_double_spaces?: boolean;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  institution: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  full_name: string | null;
  institution: string | null;
  role: string;
  email_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
