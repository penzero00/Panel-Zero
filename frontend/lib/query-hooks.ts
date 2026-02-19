/**
 * TanStack Query Hooks for Backend Communication
 * MANDATORY: All server requests MUST use these hooks
 * Never use useState + useEffect for fetching data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api-client';
import type { Document, AnalysisTask, ProcessingResult, RubricProfile } from '@/types/index';

const QUERY_KEYS = {
  documents: ['documents'],
  document: (id: string) => ['documents', id],
  analysis: (taskId: string) => ['analysis', taskId],
  rubrics: ['rubrics'],
  rubric: (id: string) => ['rubrics', id],
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

// =========== Rubric Hooks ===========

export function useRubrics(token: string | null) {
  return useQuery({
    queryKey: QUERY_KEYS.rubrics,
    queryFn: () => apiClient.listRubrics(token!),
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSetActiveRubric(token: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (rubricId: string) => apiClient.setActiveRubric(rubricId, token!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.rubrics });
    },
  });
}
