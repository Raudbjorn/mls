/**
 * Tenant token generation utilities
 * Delegates to MeiliSearch SDK for secure token generation
 */

import type { MeiliSearch } from 'meilisearch';
import { MlsTokenError } from '../errors';

export interface TenantTokenOptions {
  client: MeiliSearch;
  apiKeyUid: string;
  searchRules?: SearchRules;
  expiresAt?: Date;
}

export type SearchRules = Record<string, SearchRule | null> | ['*'];

export interface SearchRule {
  filter?: string;
}

export interface JWTPayload {
  apiKeyUid: string;
  searchRules: SearchRules;
  iat: number;
  exp?: number;
}

/**
 * Simple Base64URL decode for token validation
 * Only used for decoding JWT tokens
 */
function base64UrlDecode(str: string): string {
  if (typeof globalThis !== 'undefined' && globalThis.Buffer) {
    // Node.js environment
    return Buffer.from(str, 'base64url').toString();
  } else if (typeof atob !== 'undefined') {
    // Browser environment
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat(4 - base64.length % 4);
    return atob(padded);
  } else {
    throw new MlsTokenError('No Base64 decoding method available in this environment');
  }
}

/**
 * Generates a tenant token for restricted access to MeiliSearch
 * Uses the official SDK method for secure token generation
 *
 * @param options - Token generation options
 * @returns JWT token string
 *
 * @example
 * ```ts
 * const token = await generateTenantToken({
 *   client: meiliClient,
 *   apiKeyUid: 'key-uid',
 *   searchRules: {
 *     'movies': { filter: 'category = "public"' }
 *   },
 *   expiresAt: new Date(Date.now() + 3600000) // 1 hour
 * });
 * ```
 */
export async function generateTenantToken(
  options: TenantTokenOptions
): Promise<string> {
  // Input validation
  if (!options.client) {
    throw new MlsTokenError('MeiliSearch client is required');
  }

  if (!options.apiKeyUid || typeof options.apiKeyUid !== 'string' || options.apiKeyUid.trim().length === 0) {
    throw new MlsTokenError('Invalid API key UID: must be a non-empty string');
  }

  if (options.expiresAt) {
    if (!(options.expiresAt instanceof Date)) {
      throw new MlsTokenError('Invalid expiresAt: must be a Date object');
    }
    if (options.expiresAt.getTime() <= Date.now()) {
      throw new MlsTokenError('Invalid expiresAt: expiration date must be in the future');
    }
  }

  if (options.searchRules && !Array.isArray(options.searchRules) && typeof options.searchRules !== 'object') {
    throw new MlsTokenError('Invalid searchRules: must be an object or array');
  }

  try {
    // Use the SDK's generateTenantToken method
    const token = await options.client.generateTenantToken(
      options.apiKeyUid,
      options.searchRules || ['*'],
      {
        expiresAt: options.expiresAt
      }
    );

    return token;
  } catch (error) {
    throw new MlsTokenError('Failed to generate tenant token', error);
  }
}

/**
 * Validates a tenant token by checking expiration
 * Note: For signature validation, create a new token with the same parameters
 * and compare, or use MeiliSearch's built-in validation when making requests
 *
 * @param token - JWT token to validate
 * @returns True if not expired, false otherwise
 */
export function validateTenantToken(token: string): boolean {
  try {
    const [, encodedPayload] = token.split('.');

    if (!encodedPayload) {
      return false;
    }

    // Check token expiration
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JWTPayload;
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return false; // Token has expired
    }

    return true; // Token structure is valid and not expired
  } catch {
    return false; // Invalid token format
  }
}

/**
 * Decodes a tenant token without validation
 *
 * @param token - JWT token to decode
 * @returns Decoded token payload
 */
export function decodeTenantToken(token: string): JWTPayload {
  try {
    const [, encodedPayload] = token.split('.');
    if (!encodedPayload) {
      throw new Error('Invalid token format');
    }

    const payload = base64UrlDecode(encodedPayload);
    return JSON.parse(payload) as JWTPayload;
  } catch (error) {
    throw new MlsTokenError('Failed to decode tenant token', error);
  }
}