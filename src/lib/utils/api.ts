import type { MeiliSearch } from 'meilisearch';

/**
 * Utility functions for accessing MeiliSearch endpoints not exposed by the SDK.
 * These wrap the HTTP client to provide type-safe access to additional endpoints.
 */

export interface ApiClient {
  getNetwork(): Promise<any>;
  updateNetwork(payload: any): Promise<any>;
  getWebhooks(): Promise<any>;
  createWebhook(payload: any): Promise<any>;
  deleteWebhook(id: string): Promise<any>;
  getBatches(): Promise<any>;
  getConfig(): { host: string; apiKey?: string };
  makeRequest(method: string, path: string, body?: any): Promise<any>;
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
    async getNetwork() {
      return httpClient.get('/network');
    },

    async updateNetwork(payload: any) {
      return httpClient.patch('/network', payload);
    },

    // Webhook endpoints
    async getWebhooks() {
      return httpClient.get('/webhooks');
    },

    async createWebhook(payload: any) {
      return httpClient.post('/webhooks', payload);
    },

    async deleteWebhook(id: string) {
      return httpClient.delete(`/webhooks/${id}`);
    },

    // Batch endpoints
    async getBatches() {
      return httpClient.get('/batches');
    },

    // Config access
    getConfig() {
      return {
        host: config?.host || '',
        apiKey: config?.apiKey
      };
    },

    // Generic request method for future extensibility
    async makeRequest(method: string, path: string, body?: any) {
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