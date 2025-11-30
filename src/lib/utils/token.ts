/**
 * Tenant token generation utilities
 * Provides JWT token generation for restricted access to MeiliSearch
 */

import { MlsTokenError } from '../errors';

export interface TenantTokenOptions {
  apiKey: string;
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
 * Generates a tenant token for restricted access to MeiliSearch
 *
 * Note: Prefer using the MeiliSearch SDK's client.generateTenantToken() method when available.
 * This implementation is provided as a fallback for environments where the SDK method is not accessible.
 *
 * @param options - Token generation options
 * @returns JWT token string
 *
 * @example
 * ```ts
 * const token = await generateTenantToken({
 *   apiKey: 'your-api-key',
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
  try {
    // Base64URL encode helper
    const base64UrlEncode = (str: string): string => {
      return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
    };

    // Create header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    // Create payload
    const payload: JWTPayload = {
      apiKeyUid: options.apiKeyUid,
      searchRules: options.searchRules || ['*'],
      iat: Math.floor(Date.now() / 1000)
    };

    if (options.expiresAt) {
      payload.exp = Math.floor(options.expiresAt.getTime() / 1000);
    }

    // Encode header and payload
    const encodedHeader = base64UrlEncode(JSON.stringify(header));
    const encodedPayload = base64UrlEncode(JSON.stringify(payload));

    // Create signature using Web Crypto API
    const message = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const keyData = encoder.encode(options.apiKey);

    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Sign the message
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
    const encodedSignature = base64UrlEncode(
      String.fromCharCode(...new Uint8Array(signature))
    );

    // Combine to create JWT
    return `${message}.${encodedSignature}`;
  } catch (error) {
    throw new MlsTokenError('Failed to generate tenant token', error);
  }
}

/**
 * Validates a tenant token
 *
 * @param token - JWT token to validate
 * @param apiKey - API key used to sign the token
 * @returns True if valid, false otherwise
 */
export async function validateTenantToken(
  token: string,
  apiKey: string
): Promise<boolean> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');

    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      return false;
    }

    // Recreate the message
    const message = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const keyData = encoder.encode(apiKey);

    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode the signature
    const signatureBytes = Uint8Array.from(
      atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/')),
      c => c.charCodeAt(0)
    );

    // Verify the signature
    return await crypto.subtle.verify('HMAC', cryptoKey, signatureBytes, data);
  } catch {
    return false;
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

    const payload = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(payload);
  } catch (error) {
    throw new MlsTokenError('Failed to decode tenant token', error);
  }
}