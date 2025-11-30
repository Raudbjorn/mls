import type { MeiliSearch } from 'meilisearch';
import type { Network, Webhook, WebhookUpdate, Batch } from '../types/meilisearch';

/**
 * Response wrapper for paginated webhook lists
 */
export interface WebhookListResponse {
  results: Webhook[];
  offset: number;
  limit: number;
  total: number;
}

/**
 * Response wrapper for paginated batch lists
 */
export interface BatchListResponse {
  results: Batch[];
  offset: number;
  limit: number;
  total: number;
}

/**
 * Payload for creating a new webhook
 */
export interface CreateWebhookPayload {
  url: string;
  events?: string[];
  headers?: Record<string, string>;
}

/**
 * Payload for updating network configuration
 */
export interface UpdateNetworkPayload {
  remotes: Array<{
    url: string;
    searchApiKey: string;
    name: string;
  }>;
}

/**
 * Configuration returned by getConfig
 */
export interface ClientConfig {
  host: string;
  apiKey?: string;
}

/**
 * Utility functions for accessing MeiliSearch endpoints not exposed by the SDK.
 * These wrap the HTTP client to provide type-safe access to additional endpoints.
 */

export interface ApiClient {
  getNetwork(): Promise<Network>;
  updateNetwork(payload: UpdateNetworkPayload): Promise<Network>;
  getWebhooks(): Promise<WebhookListResponse>;
  createWebhook(payload: CreateWebhookPayload): Promise<Webhook>;
  deleteWebhook(id: string): Promise<void>;
  getBatches(): Promise<BatchListResponse>;
  getConfig(): ClientConfig;
  makeRequest<T = unknown>(method: string, path: string, body?: unknown): Promise<T>;
}

/**
 * Creates an API client wrapper around the MeiliSearch client
 * to access endpoints not exposed by the SDK
 */
export function createApiClient(client: MeiliSearch): ApiClient {
  // Access the underlying HTTP client
  // Note: This still uses private APIs but isolates them in one place
  const httpClient = (client as any).httpRequest;
  const config = (client as any).config;

  if (!httpClient) {
    throw new Error('Unable to access MeiliSearch HTTP client. This library requires MeiliSearch JS SDK.');
  }

  return {
    // Network federation endpoints
    async getNetwork(): Promise<Network> {
      return httpClient.get('/network');
    },

    async updateNetwork(payload: UpdateNetworkPayload): Promise<Network> {
      return httpClient.patch('/network', payload);
    },

    // Webhook endpoints
    async getWebhooks(): Promise<WebhookListResponse> {
      return httpClient.get('/webhooks');
    },

    async createWebhook(payload: CreateWebhookPayload): Promise<Webhook> {
      return httpClient.post('/webhooks', payload);
    },

    async deleteWebhook(id: string): Promise<void> {
      return httpClient.delete(`/webhooks/${id}`);
    },

    // Batch endpoints
    async getBatches(): Promise<BatchListResponse> {
      return httpClient.get('/batches');
    },

    // Config access
    getConfig(): ClientConfig {
      return {
        host: config?.host || '',
        apiKey: config?.apiKey
      };
    },

    // Generic request method for future extensibility
    async makeRequest<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
      const methodLower = method.toLowerCase();
      if (methodLower === 'get') {
        return httpClient.get(path);
      } else if (methodLower === 'post') {
        return httpClient.post(path, body);
      } else if (methodLower === 'put') {
        return httpClient.put(path, body);
      } else if (methodLower === 'patch') {
        return httpClient.patch(path, body);
      } else if (methodLower === 'delete') {
        return httpClient.delete(path);
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }
    }
  };
}