/**
 * Supabase Client Configuration (Mock for Development)
 * This is a mock client for local development without a real database
 * Will be replaced with real Supabase client when database is ready
 */

// Mock Supabase client for development
const mockSupabase = {
  auth: {
    onAuthStateChange: (callback: any) => {
      callback('SIGNED_IN', { user: { id: 'dev-user-123', email: 'dev@example.com' } });
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    getSession: async () => ({
      data: {
        session: {
          user: { id: 'dev-user-123', email: 'dev@example.com' },
          access_token: 'dev-token-mock',
        },
      },
      error: null,
    }),
    signInWithPassword: async (credentials: any) => ({
      data: {
        user: { id: 'dev-user-123', email: credentials.email },
        session: { access_token: 'dev-token-mock' },
      },
      error: null,
    }),
    signUp: async (credentials: any) => ({
      data: {
        user: { id: 'dev-user-123', email: credentials.email },
        session: { access_token: 'dev-token-mock' },
      },
      error: null,
    }),
    signOut: async () => ({ error: null }),
  },
  from: (table: string) => ({
    select: () => ({ data: [], error: null }),
    insert: (data: any) => ({ data, error: null }),
    update: (data: any) => ({ data, error: null }),
    delete: () => ({ data: null, error: null }),
    eq: () => ({ data: [], error: null }),
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async (path: string, file: any) => ({ data: { path }, error: null }),
      download: async (path: string) => ({ data: new Blob(), error: null }),
      remove: async (paths: string[]) => ({ data: paths, error: null }),
      list: async () => ({ data: [], error: null }),
    }),
  },
};

console.log('⚠️  Using mock Supabase client (development mode). No real database connected.');

export const supabase = mockSupabase as any;
