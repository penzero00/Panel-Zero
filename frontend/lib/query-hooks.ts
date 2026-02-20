/**
 * TanStack Query Hooks for Backend Communication
 * MANDATORY: All server requests MUST use these hooks
 * Never use useState + useEffect for fetching data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import { supabase } from './supabase';
import type { Document, AnalysisTask, ProcessingResult, AgentProfile, CreateAgentProfileInput, UserProfile } from '@/types/index';

const QUERY_KEYS = {
  documents: ['documents'],
  document: (id: string) => ['documents', id],
  analysis: (taskId: string) => ['analysis', taskId],
  agentProfiles: ['agentProfiles'],
  agentProfile: (id: string) => ['agentProfiles', id],
  agentProfilesByRole: (role: string) => ['agentProfiles', 'role', role],
  currentUser: ['currentUser'],
  userProfile: (userId: string) => ['userProfile', userId],
};

// =========== Document Hooks ===========

export function useDocuments(token: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.documents,
    queryFn: () => apiClient.listDocuments(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
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

// =========== Analysis Hooks ===========

export function useStartAnalysis(token: string | null) {
  return useMutation({
    mutationFn: ({ fileId, agentRole }: { fileId: string; agentRole: string }) =>
      apiClient.startAnalysis(fileId, agentRole, token!),
  });
}

export function useAnalysisStatus(taskId: string | null, token: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.analysis(taskId || ''),
    queryFn: () => apiClient.getAnalysisStatus(taskId!, token!),
    enabled: !!taskId && !!token,
    refetchInterval: 1000, // Poll every 1 second
  });
}

// =========== Agent Profile Hooks ===========

export function useAgentProfiles(token: string | null) {
  return useQuery<AgentProfile[]>({
    queryKey: QUERY_KEYS.agentProfiles,
    queryFn: () => apiClient.listAgentProfiles(token!),
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAgentProfilesByRole(role: string, token: string | null) {
  return useQuery<AgentProfile[]>({
    queryKey: QUERY_KEYS.agentProfilesByRole(role),
    queryFn: () => apiClient.listAgentProfilesByRole(role, token!),
    enabled: !!token && !!role,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCreateAgentProfile(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (profile: CreateAgentProfileInput) => apiClient.createAgentProfile(profile, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.agentProfiles });
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

// =========== Account Settings Hooks ===========

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
  return useQuery<UserProfile | null>({
    queryKey: userId ? QUERY_KEYS.userProfile(userId) : ['userProfile', 'none'],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, full_name, institution, role, email_verified, avatar_url, created_at, updated_at')
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
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, full_name, institution, role, email_verified, avatar_url, created_at, updated_at')
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
        .from('profile-avatars')
        .upload(filePath, file, { upsert: true, contentType: file.type, cacheControl: '3600' });

      if (uploadError) {
        throw uploadError;
      }

      const { data: publicUrlData } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(filePath);

      const avatarUrl = publicUrlData.publicUrl;

      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select('id, full_name, institution, role, email_verified, avatar_url, created_at, updated_at')
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
