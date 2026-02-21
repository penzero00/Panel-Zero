/**
 * Supabase Client Configuration
 * Real Supabase client for authentication and database operations
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate environment variables at runtime (not build time)
// Use placeholder values during build to allow Next.js to compile
const url = supabaseUrl || 'https://placeholder.supabase.co';
const key = supabaseAnonKey || 'placeholder-anon-key';

// Create Supabase client
export const supabase = createClient(url, key, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Runtime validation - will only affect browser/server runtime, not build time
if (typeof window !== 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
  console.error('❌ Missing Supabase environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
} else if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase client initialized successfully');
}

// Database types
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          institution: string | null;
          role: string;
          email_verified: boolean;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          institution?: string | null;
          role?: string;
          email_verified?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          institution?: string | null;
          role?: string;
          email_verified?: boolean;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      documents: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          file_path: string;
          status: string;
          major_errors: number;
          minor_errors: number;
          created_at: string;
          expired_at: string;
          deleted_at: string | null;
        };
      };
      saved_files: {
        Row: {
          id: string;
          owner_id: string;
          document_id: string;
          name: string;
          notes: string | null;
          is_favorite: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          document_id: string;
          name: string;
          notes?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          document_id?: string;
          name?: string;
          notes?: string | null;
          is_favorite?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};

