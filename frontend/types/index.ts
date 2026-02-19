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

export interface RubricProfile {
  id: string;
  name: string;
  description: string;
  format_standard: string;
  margin_left_inches: number;
  font_family: string;
  font_size: number;
  is_active: boolean;
  owner_id: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  institution: string;
  created_at: string;
}
