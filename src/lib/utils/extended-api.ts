/**
 * Extended API utilities for accessing additional MeiliSearch endpoints
 * Includes experimental features, system management, and advanced operations
 */

import type { MeiliSearch } from 'meilisearch';
import { MlsApiError } from '../errors';

export interface ExtendedApiClient {
  // Metrics & Monitoring
  getMetrics(): Promise<string>;

  // Chat Completions
  getChatWorkspaces(): Promise<ChatWorkspaceList>;
  getChatWorkspace(uid: string): Promise<ChatWorkspace>;
  getChatWorkspaceSettings(uid: string): Promise<ChatWorkspaceSettings>;
  updateChatWorkspaceSettings(uid: string, settings: ChatWorkspaceSettings): Promise<ChatWorkspaceSettings>;
  deleteChatWorkspace(uid: string): Promise<void>;
  chatCompletion(uid: string, messages: ChatMessage[]): Promise<ChatCompletionResponse>;

  // System Management
  createDump(): Promise<{ taskUid: number }>;
  createSnapshot(): Promise<{ taskUid: number }>;
  compactIndex(indexUid: string): Promise<{ taskUid: number }>;
  exportData(params?: ExportParams): Promise<any>;

  // Logs
  getErrorLogs(): Promise<string[]>;
  streamLogs(callback: (log: string) => void): Promise<() => void>;

  // Federation & Multi-search
  multiSearch<T = any>(params: MultiSearchParams): Promise<MultiSearchResponse<T>>;
  federatedSearch<T = any>(params: FederatedSearchParams): Promise<FederatedSearchResponse<T>>;

  // Advanced Index Operations
  getSimilarDocuments(indexUid: string, params: SimilarDocumentsParams): Promise<any>;
  facetSearch(indexUid: string, params: FacetSearchParams): Promise<FacetSearchResponse>;
  fetchDocuments(indexUid: string, ids: (string | number)[]): Promise<any[]>;
  editDocuments(indexUid: string, edits: DocumentEdit[]): Promise<{ taskUid: number }>;

  // Localization Settings
  getLocalizedAttributes(indexUid: string): Promise<LocalizedAttributesSettings>;
  updateLocalizedAttributes(indexUid: string, settings: LocalizedAttributesSettings): Promise<{ taskUid: number }>;

  // Experimental Features
  getExperimentalFeatures(): Promise<ExperimentalFeatures>;
  updateExperimentalFeatures(features: Partial<ExperimentalFeatures>): Promise<ExperimentalFeatures>;
}

// Type definitions
export interface ChatWorkspace {
  uid: string;
}

export interface ChatWorkspaceList {
  results: ChatWorkspace[];
  offset: number;
  limit: number;
  total: number;
}

export interface ChatWorkspaceSettings {
  source?: 'openAi' | 'azureOpenAi' | 'mistral' | 'gemini' | 'vLlm';
  orgId?: string;
  projectId?: string;
  apiVersion?: string;
  deploymentId?: string;
  baseUrl?: string;
  apiKey?: string;
  prompts?: {
    system?: string;
    searchDescription?: string;
    searchQParam?: string;
    searchIndexUidParam?: string;
  };
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatMessage;
    finish_reason: string;
  }>;
}

export interface ExportParams {
  format?: 'json' | 'csv' | 'ndjson';
  indexes?: string[];
}

export interface MultiSearchParams {
  queries: Array<{
    indexUid: string;
    q?: string;
    filter?: string;
    sort?: string[];
    limit?: number;
    offset?: number;
    [key: string]: any;
  }>;
}

export interface MultiSearchResponse<T> {
  results: Array<{
    indexUid: string;
    hits: T[];
    totalHits: number;
    processingTimeMs: number;
    query: string;
  }>;
}

export interface FederatedSearchParams extends MultiSearchParams {
  federation: {
    limit?: number;
    offset?: number;
  };
  queries: Array<MultiSearchParams['queries'][0] & {
    federationOptions?: {
      remote?: string;
      weight?: number;
    };
  }>;
}

export interface FederatedSearchResponse<T> extends MultiSearchResponse<T> {
  federated: {
    totalHits: number;
    processingTimeMs: number;
  };
}

export interface SimilarDocumentsParams {
  id: string | number;
  limit?: number;
  filter?: string;
  embedder?: string;
}

export interface FacetSearchParams {
  facetName: string;
  facetQuery: string;
  filter?: string;
  q?: string;
}

export interface FacetSearchResponse {
  facetHits: Array<{
    value: string;
    count: number;
  }>;
  facetQuery: string;
  processingTimeMs: number;
}

export interface DocumentEdit {
  id: string | number;
  operations: Array<{
    op: 'add' | 'remove' | 'replace';
    path: string;
    value?: any;
  }>;
}

export interface LocalizedAttributesSettings {
  localizedAttributes?: Array<{
    attributePatterns: string[];
    locales: string[];
  }> | null;
}

export interface ExperimentalFeatures {
  metrics?: boolean;
  chatCompletions?: boolean;
  vectorStore?: boolean;
  federation?: boolean;
  logs?: boolean;
}

/**
 * Creates an extended API client with access to additional endpoints
 */
export function createExtendedApiClient(client: MeiliSearch): ExtendedApiClient {
  const httpClient = (client as any).httpRequest;

  if (!httpClient) {
    throw new MlsApiError('Unable to access MeiliSearch HTTP client');
  }

  const handleApiError = (error: any): never => {
    throw new MlsApiError(
      error.message || 'API request failed',
      error.code,
      error.errorCode,
      error.errorType,
      error.errorLink,
      error
    );
  };

  return {
    // Metrics & Monitoring
    async getMetrics() {
      try {
        return await httpClient.get('/metrics');
      } catch (error) {
        handleApiError(error);
      }
    },

    // Chat Completions
    async getChatWorkspaces() {
      try {
        return await httpClient.get('/chats');
      } catch (error) {
        handleApiError(error);
      }
    },

    async getChatWorkspace(uid: string) {
      try {
        return await httpClient.get(`/chats/${uid}`);
      } catch (error) {
        handleApiError(error);
      }
    },

    async getChatWorkspaceSettings(uid: string) {
      try {
        return await httpClient.get(`/chats/${uid}/settings`);
      } catch (error) {
        handleApiError(error);
      }
    },

    async updateChatWorkspaceSettings(uid: string, settings: ChatWorkspaceSettings) {
      try {
        return await httpClient.patch(`/chats/${uid}/settings`, settings);
      } catch (error) {
        handleApiError(error);
      }
    },

    async deleteChatWorkspace(uid: string) {
      try {
        await httpClient.delete(`/chats/${uid}`);
      } catch (error) {
        handleApiError(error);
      }
    },

    async chatCompletion(uid: string, messages: ChatMessage[]) {
      try {
        return await httpClient.post(`/chats/${uid}/chat/completions`, { messages });
      } catch (error) {
        handleApiError(error);
      }
    },

    // System Management
    async createDump() {
      try {
        return await httpClient.post('/dumps');
      } catch (error) {
        handleApiError(error);
      }
    },

    async createSnapshot() {
      try {
        return await httpClient.post('/snapshots');
      } catch (error) {
        handleApiError(error);
      }
    },

    async compactIndex(indexUid: string) {
      try {
        return await httpClient.post(`/indexes/${indexUid}/compact`);
      } catch (error) {
        handleApiError(error);
      }
    },

    async exportData(params?: ExportParams) {
      try {
        return await httpClient.post('/export', params);
      } catch (error) {
        handleApiError(error);
      }
    },

    // Logs
    async getErrorLogs() {
      try {
        const response = await httpClient.post('/logs/stderr');
        return response.split('\n');
      } catch (error) {
        handleApiError(error);
      }
    },

    streamLogs(callback: (log: string) => void) {
      // Not yet implemented: would require WebSocket or SSE support
      throw new MlsApiError('streamLogs is not yet implemented.');
    },

    // Federation & Multi-search
    async multiSearch<T = any>(params: MultiSearchParams) {
      try {
        return await httpClient.post<MultiSearchResponse<T>>('/multi-search', params);
      } catch (error) {
        handleApiError(error);
      }
    },

    async federatedSearch<T = any>(params: FederatedSearchParams) {
      try {
        return await httpClient.post<FederatedSearchResponse<T>>('/multi-search', params);
      } catch (error) {
        handleApiError(error);
      }
    },

    // Advanced Index Operations
    async getSimilarDocuments(indexUid: string, params: SimilarDocumentsParams) {
      try {
        return await httpClient.post(`/indexes/${indexUid}/similar`, params);
      } catch (error) {
        handleApiError(error);
      }
    },

    async facetSearch(indexUid: string, params: FacetSearchParams) {
      try {
        return await httpClient.post(`/indexes/${indexUid}/facet-search`, params);
      } catch (error) {
        handleApiError(error);
      }
    },

    async fetchDocuments(indexUid: string, ids: (string | number)[]) {
      try {
        return await httpClient.post(`/indexes/${indexUid}/documents/fetch`, { ids });
      } catch (error) {
        handleApiError(error);
      }
    },

    async editDocuments(indexUid: string, edits: DocumentEdit[]) {
      try {
        return await httpClient.post(`/indexes/${indexUid}/documents/edit`, { edits });
      } catch (error) {
        handleApiError(error);
      }
    },

    // Localization Settings
    async getLocalizedAttributes(indexUid: string) {
      try {
        return await httpClient.get(`/indexes/${indexUid}/settings/localized-attributes`);
      } catch (error) {
        handleApiError(error);
      }
    },

    async updateLocalizedAttributes(indexUid: string, settings: LocalizedAttributesSettings) {
      try {
        return await httpClient.put(
          `/indexes/${indexUid}/settings/localized-attributes`,
          settings.localizedAttributes
        );
      } catch (error) {
        handleApiError(error);
      }
    },

    // Experimental Features
    async getExperimentalFeatures() {
      try {
        return await httpClient.get('/experimental-features');
      } catch (error) {
        handleApiError(error);
      }
    },

    async updateExperimentalFeatures(features: Partial<ExperimentalFeatures>) {
      try {
        return await httpClient.patch('/experimental-features', features);
      } catch (error) {
        handleApiError(error);
      }
    }
  };
}