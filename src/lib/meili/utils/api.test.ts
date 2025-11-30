import { describe, it, expect } from 'vitest';

/**
 * API Utils Domain Tests
 *
 * API client utilities.
 * Goal: "Domain rules are correct under a storm of random inputs."
 */
describe('createApiClient', () => {
  describe('client creation', () => {
    it.todo('should create client with host and key', () => {
      expect.fail('TODO: Test that client is created with valid config');
    });

    it.todo('should validate host URL format', () => {
      expect.fail('TODO: Property test - invalid URLs are rejected');
    });

    it.todo('should handle missing API key gracefully', () => {
      expect.fail('TODO: Test that client works for public instances');
    });
  });

  describe('request handling', () => {
    it.todo('should include API key in headers', () => {
      expect.fail('TODO: Test that Authorization header is set');
    });

    it.todo('should handle timeout configuration', () => {
      expect.fail('TODO: Test that timeout option is respected');
    });

    it.todo('should retry on transient failures', () => {
      expect.fail('TODO: Test that retries work for network errors');
    });
  });

  describe('error handling', () => {
    it.todo('should throw MlsApiError for API errors', () => {
      expect.fail('TODO: Test that 4xx/5xx responses become MlsApiError');
    });

    it.todo('should include error details from response', () => {
      expect.fail('TODO: Test that error message/code are preserved');
    });

    it.todo('should throw MlsRequestTimeoutError on timeout', () => {
      expect.fail('TODO: Test that timeout triggers correct error type');
    });
  });

  describe('URL construction', () => {
    it.todo('should handle trailing slashes in host', () => {
      expect.fail('TODO: Property test - URLs are normalized correctly');
    });

    it.todo('should encode path parameters', () => {
      expect.fail('TODO: Property test - special chars in paths are encoded');
    });

    it.todo('should encode query parameters', () => {
      expect.fail('TODO: Property test - query params are properly encoded');
    });
  });
});
