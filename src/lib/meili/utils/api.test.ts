import { describe, it, expect } from 'vitest';

/**
 * API Utils Domain Tests
 *
 * API client utilities.
 * Goal: "Domain rules are correct under a storm of random inputs."
 */
describe('createApiClient', () => {
  describe('client creation', () => {
    it.todo('should create client with host and key');

    it.todo('should validate host URL format');

    it.todo('should handle missing API key gracefully');
  });

  describe('request handling', () => {
    it.todo('should include API key in headers');

    it.todo('should handle timeout configuration');

    it.todo('should retry on transient failures');
  });

  describe('error handling', () => {
    it.todo('should throw MlsApiError for API errors');

    it.todo('should include error details from response');

    it.todo('should throw MlsRequestTimeoutError on timeout');
  });

  describe('URL construction', () => {
    it.todo('should handle trailing slashes in host');

    it.todo('should encode path parameters');

    it.todo('should encode query parameters');
  });
});
