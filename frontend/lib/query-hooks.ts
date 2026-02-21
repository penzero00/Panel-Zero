/**
 * TanStack Query Hooks for Backend Communication with Real-time Subscriptions
 * MANDATORY: All server requests MUST use these hooks
 * Never use useState + useEffect for fetching data
 * Real-time subscriptions via Supabase ensure instant UI updates
 */

import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { supabase } from './supabase';
import type { Document, AnalysisTask, ProcessingResult, AgentProfile, CreateAgentProfileInput, UserProfile } from '@/types/index';

const PROFILE_AVATAR_BUCKET = process.env.NEXT_PUBLIC_PROFILE_AVATAR_BUCKET || 'profile-avatars';

const QUERY_KEYS = {
  documents: ['documents'],
  document: (id: string) => ['documents', id],
  analysis: (taskId: string) => ['analysis', taskId],
  analysisTasks: ['analysisTasks'],
  agentProfiles: ['agentProfiles'],
  agentProfile: (id: string) => ['agentProfiles', id],
  agentProfilesByRole: (role: string) => ['agentProfiles', 'role', role],
  currentUser: ['currentUser'],
  userProfile: (userId: string) => ['userProfile', userId],
};

// =========== Document Hooks with Real-time Subscriptions ===========

export function useDocuments(token: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.documents,
    queryFn: () => apiClient.listDocuments(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Subscribe to real-time document changes
  useEffect(() => {
    if (!token) return;

    const subscription = supabase
      .channel('documents')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => {
        // Invalidate and refetch documents
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [token, queryClient]);

  return query;
}

export function useUploadDocument(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => apiClient.uploadFile(file, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents });
    },
  });
}

// =========== Analysis Hooks with Real-time Subscriptions ===========

export function useAnalysisTasks(token: string | null, userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: QUERY_KEYS.analysisTasks,
    queryFn: async () => {
      if (!token) return [];
      const { data } = await supabase
        .from('analysis_tasks')
        .select('*')
        .order('created_at', { ascending: false });
      return data || [];
    },
    enabled: !!token && !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Subscribe to real-time analysis task changes
  useEffect(() => {
    if (!token) return;

    const subscription = supabase
      .channel('analysis_tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'analysis_tasks' }, () => {
        // Invalidate and refetch analysis tasks
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analysisTasks });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [token, queryClient]);

  return query;
}

export function useStartAnalysis(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fileId, agentRole, profileId }: { fileId: string; agentRole: string; profileId?: string }) =>
      apiClient.startAnalysis(fileId, agentRole, token!, profileId),
    onSuccess: () => {
      // Invalidate both documents and analysis tasks
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.documents });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.analysisTasks });
    },
  });
}

export function useAnalysisStatus(taskId: string | null, token: string | null) {
  return useQuery<AnalysisTask | null>({
    queryKey: QUERY_KEYS.analysis(taskId || ''),
    queryFn: () => apiClient.getAnalysisStatus(taskId!, token!),
    enabled: !!taskId && !!token,
    refetchInterval: 2000, // Poll every 2 seconds for live updates
    staleTime: 1000, // 1 second
  });
}

// =========== Agent Profile Hooks with Real-time Subscriptions ===========

export function useAgentProfiles(token: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<AgentProfile[]>({
    queryKey: QUERY_KEYS.agentProfiles,
    queryFn: () => apiClient.listAgentProfiles(token!),
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Subscribe to real-time agent profile changes
  useEffect(() => {
    if (!token) return;

    const subscription = supabase
      .channel('agent_profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_profiles' }, () => {
        // Invalidate and refetch agent profiles
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentProfiles });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [token, queryClient]);

  return query;
}

export function useAgentProfilesByRole(role: string, token: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<AgentProfile[]>({
    queryKey: QUERY_KEYS.agentProfilesByRole(role),
    queryFn: () => apiClient.listAgentProfilesByRole(role, token!),
    enabled: !!token && !!role,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Subscribe to real-time changes for this specific role
  useEffect(() => {
    if (!token || !role) return;

    const subscription = supabase
      .channel(`agent_profiles_${role}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agent_profiles' }, (payload: any) => {
        if (payload.new?.agent_role === role) {
          queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentProfilesByRole(role) });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [token, role, queryClient]);

  return query;
}

export function useCreateAgentProfile(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: CreateAgentProfileInput) => apiClient.createAgentProfile(profile, token!),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentProfiles });
      const agentRole = (variables as any).agent_role;
      if (agentRole) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentProfilesByRole(agentRole) });
      }
    },
  });
}

export function useUpdateAgentProfile(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, profile }: { id: string; profile: Partial<CreateAgentProfileInput> }) =>
      apiClient.updateAgentProfile(id, profile, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentProfiles });
    },
  });
}

export function useDeleteAgentProfile(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteAgentProfile(id, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentProfiles });
    },
  });
}

export function useSetActiveAgentProfile(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ profileId, agentRole }: { profileId: string; agentRole: string }) =>
      apiClient.setActiveAgentProfile(profileId, agentRole, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentProfiles });
    },
  });
}

// =========== Account Settings Hooks with Real-time Subscriptions ===========

export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      return data.user;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUserProfile(userId: string | null) {
  const queryClient = useQueryClient();

  const query = useQuery<UserProfile | null>({
    queryKey: userId ? QUERY_KEYS.userProfile(userId) : ['userProfile', 'none'],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, institution, role, email_verified, avatar_url, created_at, updated_at')
        .eq('id', userId)
        .single();
      if (error) {
        throw error;
      }
      return data as UserProfile;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  // Subscribe to real-time user profile changes
  useEffect(() => {
    if (!userId) return;

    const subscription = supabase
      .channel(`user_profile_${userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_profiles', filter: `id=eq.${userId}` }, () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userProfile(userId) });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, queryClient]);

  return query;

}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      updates,
    }: {
      userId: string;
      updates: Partial<Pick<UserProfile, 'full_name' | 'institution' | 'avatar_url'>>;
    }) => {
      const authUpdates: Record<string, string> = {};
      if (typeof updates.full_name !== 'undefined' && updates.full_name !== null) {
        authUpdates.full_name = updates.full_name;
      }
      if (typeof updates.avatar_url !== 'undefined' && updates.avatar_url !== null) {
        authUpdates.avatar_url = updates.avatar_url;
      }

      if (Object.keys(authUpdates).length > 0) {
        const { error: authError } = await supabase.auth.updateUser({ data: authUpdates });
        if (authError) {
          throw authError;
        }
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, full_name, email, institution, role, email_verified, avatar_url, created_at, updated_at')
        .single();
      if (error) {
        throw error;
      }
      return data as UserProfile;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userProfile(variables.userId) });
    },
  });
}

export function useUpdateAuthEmail() {
  return useMutation({
    mutationFn: async ({ email }: { email: string }) => {
      const { data, error } = await supabase.auth.updateUser({ email });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useUpdateAuthPassword() {
  return useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      const { data, error } = await supabase.auth.updateUser({ password });
      if (error) {
        throw error;
      }
      return data;
    },
  });
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const extension = file.name.split('.').pop()?.toLowerCase() || 'png';
      const filePath = `avatars/${userId}/profile.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(PROFILE_AVATAR_BUCKET)
        .upload(filePath, file, { upsert: true, contentType: file.type, cacheControl: '3600' });

      if (uploadError) {
        if (uploadError.message?.toLowerCase().includes('bucket')) {
          throw new Error(
            `Bucket not found: ${PROFILE_AVATAR_BUCKET}. Create this bucket in Supabase Storage or set NEXT_PUBLIC_PROFILE_AVATAR_BUCKET.`
          );
        }
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from(PROFILE_AVATAR_BUCKET)
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, full_name, email, institution, role, email_verified, avatar_url, created_at, updated_at')
        .single();

      if (profileError) {
        throw profileError;
      }

      return data as UserProfile;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userProfile(variables.userId) });
    },
  });
}
