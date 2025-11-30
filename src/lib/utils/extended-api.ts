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
  updateChatWorkspaceSettings(
    uid: string,
    settings: ChatWorkspaceSettings
  ): Promise<ChatWorkspaceSettings>;
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
  updateLocalizedAttributes(
    indexUid: string,
    settings: LocalizedAttributesSettings
  ): Promise<{ taskUid: number }>;
  resetLocalizedAttributes(indexUid: string): Promise<{ taskUid: number }>;

  // Experimental Features
  getExperimentalFeatures(): Promise<ExperimentalFeatures>;
  updateExperimentalFeatures(
    features: Partial<ExperimentalFeatures>
  ): Promise<ExperimentalFeatures>;
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
  queries: Array<
    MultiSearchParams['queries'][0] & {
      federationOptions?: {
        remote?: string;
        weight?: number;
      };
    }
  >;
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

    // System Management - Using SDK methods where available
    async createDump() {
      try {
        // Use SDK method if available
        if (typeof client.createDump === 'function') {
          return await client.createDump();
        }
        // Fallback to HTTP client for older SDK versions
        return await httpClient.post('/dumps');
      } catch (error) {
        handleApiError(error);
      }
    },

    async createSnapshot() {
      try {
        // Use SDK method if available
        if (typeof client.createSnapshot === 'function') {
          return await client.createSnapshot();
        }
        // Fallback to HTTP client for older SDK versions
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
        if (typeof response === 'string') {
          return response.split('\n');
        }
        // If response is not a string, try to convert it or return as is if it's already an array
        if (Array.isArray(response)) {
          return response.map(String);
        }
        return [String(response)];
      } catch (error) {
        handleApiError(error);
        return []; // Unreachable but satisfies TS
      }
    },

    async streamLogs(callback: (log: string) => void): Promise<() => void> {
      return Promise.resolve(() => {
        console.warn('streamLogs is not yet implemented');
      });
    },

    // Federation & Multi-search - Using SDK methods
    async multiSearch<T = any>(params: MultiSearchParams): Promise<MultiSearchResponse<T>> {
      try {
        // Use SDK method which is available in recent versions
        if (typeof client.multiSearch === 'function') {
          return (await client.multiSearch(params)) as any as MultiSearchResponse<T>;
        }
        // Fallback for older SDK versions
        return (await httpClient.post('/multi-search', params)) as MultiSearchResponse<T>;
      } catch (error) {
        handleApiError(error);
        throw error; // Re-throw to satisfy return type
      }
    },

    async federatedSearch<T = any>(
      params: FederatedSearchParams
    ): Promise<FederatedSearchResponse<T>> {
      try {
        // Check if SDK supports federated multi-search
        if (typeof (client as any).federatedMultiSearch === 'function') {
          return (await (client as any).federatedMultiSearch(
            params
          )) as any as FederatedSearchResponse<T>;
        }
        // The SDK's multiSearch can handle federation with the federation parameter
        if (typeof client.multiSearch === 'function' && params.federation) {
          return (await client.multiSearch(params as any)) as any as FederatedSearchResponse<T>;
        }
        // Fallback to HTTP client
        return (await httpClient.post('/multi-search', params)) as FederatedSearchResponse<T>;
      } catch (error) {
        handleApiError(error);
        throw error; // Re-throw to satisfy return type
      }
    },

    // Advanced Index Operations
    async getSimilarDocuments(indexUid: string, params: SimilarDocumentsParams) {
      try {
        const index = client.index(indexUid);
        // Check if SDK supports similar documents (not available in current SDK)
        // This is an experimental feature not yet in the SDK
        return await httpClient.post(`/indexes/${indexUid}/similar`, params);
      } catch (error) {
        handleApiError(error);
      }
    },

    async facetSearch(indexUid: string, params: FacetSearchParams) {
      try {
        const index = client.index(indexUid);
        // Check if SDK supports searchForFacetValues
        if (typeof index.searchForFacetValues === 'function') {
          const result = await index.searchForFacetValues({
            facetName: params.facetName,
            facetQuery: params.facetQuery,
            filter: params.filter,
            q: params.q,
          });
          return {
            facetHits: result.facetHits,
            facetQuery: result.facetQuery || params.facetQuery,
            processingTimeMs: 0, // SDK doesn't provide this
          };
        }
        // Fallback to HTTP client
        return await httpClient.post(`/indexes/${indexUid}/facet-search`, params);
      } catch (error) {
        handleApiError(error);
      }
    },

    async fetchDocuments(indexUid: string, ids: (string | number)[]) {
      try {
        const index = client.index(indexUid);
        // Check if SDK supports fetchDocuments (available as getDocuments with filter)
        if (typeof index.getDocuments === 'function') {
          // Use getDocuments to fetch specific documents
          const results: any[] = [];
          for (const id of ids) {
            try {
              const doc = await index.getDocument(String(id));
              results.push(doc);
            } catch (e) {
              // Document not found, skip
            }
          }
          return results;
        }
        // Fallback to HTTP client for batch fetch
        return await httpClient.post(`/indexes/${indexUid}/documents/fetch`, { ids });
      } catch (error) {
        handleApiError(error);
      }
    },

    async editDocuments(indexUid: string, edits: DocumentEdit[]) {
      try {
        // Document editing with JSON Patch is not available in SDK
        // This is an experimental feature
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

    async resetLocalizedAttributes(indexUid: string) {
      try {
        return await httpClient.delete(`/indexes/${indexUid}/settings/localized-attributes`);
      } catch (error) {
        handleApiError(error);
      }
    },

    // Experimental Features - Using SDK methods
    async getExperimentalFeatures() {
      try {
        // Use SDK method which is available
        if (typeof (client as any).getExperimentalFeatures === 'function') {
          return await (client as any).getExperimentalFeatures();
        }
        // Fallback for older SDK versions
        return await httpClient.get('/experimental-features');
      } catch (error) {
        handleApiError(error);
      }
    },

    async updateExperimentalFeatures(features: Partial<ExperimentalFeatures>) {
      try {
        // Use SDK method which is available
        if (typeof (client as any).updateExperimentalFeatures === 'function') {
          return await (client as any).updateExperimentalFeatures(features);
        }
        // Fallback for older SDK versions
        return await httpClient.patch('/experimental-features', features);
      } catch (error) {
        handleApiError(error);
      }
    },
  };
}
