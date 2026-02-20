/**
 * API Client for FastAPI Backend Communication
 * All requests MUST use TanStack Query - never use raw fetch() or useState for async operations
 */

import type { AgentProfile } from '@/types/index';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  token?: string;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    config: ApiRequestConfig = {}
  ): Promise<T> {
    const { method = 'GET', body, headers = {}, token } = config;

    const fullUrl = `${this.baseUrl}${endpoint}`;
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  async uploadFile(
    file: File,
    token: string
  ): Promise<{ file_id: string; file_path: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const fullUrl = `${this.baseUrl}/documents/upload`;
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Upload failed');
    }

    return response.json();
  }

  // Document endpoints
  listDocuments(token: string) {
    return this.request('/documents', { token });
  }

  getDocument(fileId: string, token: string) {
    return this.request(`/documents/${fileId}`, { token });
  }

  // Analysis endpoints
  startAnalysis(fileId: string, agentRole: string, token: string) {
    return this.request('/analysis/start', {
      method: 'POST',
      body: { file_id: fileId, agent_role: agentRole },
      token,
    });
  }

  getAnalysisStatus(taskId: string, token: string) {
    return this.request(`/analysis/status/${taskId}`, { token });
  }

  downloadProcessedFile(taskId: string, token: string) {
    return `${this.baseUrl}/analysis/download/${taskId}`;
  }

  // Agent Profile endpoints
  listAgentProfiles(token: string): Promise<AgentProfile[]> {
    return this.request<AgentProfile[]>('/api/v1/agent-profiles', { token });
  }

  listAgentProfilesByRole(role: string, token: string): Promise<AgentProfile[]> {
    return this.request<AgentProfile[]>(`/api/v1/agent-profiles/role/${role}`, { token });
  }

  createAgentProfile(profile: unknown, token: string) {
    return this.request('/api/v1/agent-profiles', {
      method: 'POST',
      body: profile,
      token,
    });
  }

  updateAgentProfile(id: string, profile: unknown, token: string) {
    return this.request(`/api/v1/agent-profiles/${id}`, {
      method: 'PUT',
      body: profile,
      token,
    });
  }

  deleteAgentProfile(id: string, token: string) {
    return this.request(`/api/v1/agent-profiles/${id}`, {
      method: 'DELETE',
      token,
    });
  }

  setActiveAgentProfile(profileId: string, agentRole: string, token: string) {
    return this.request(`/api/v1/agent-profiles/${profileId}/activate`, {
      method: 'PUT',
      body: { agent_role: agentRole },
      token,
    });
  }
}

export const apiClient = new ApiClient();
