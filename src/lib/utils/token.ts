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
 * Environment-agnostic Base64URL encode function
 */
function base64UrlEncode(str: string): string {
  if (typeof globalThis !== 'undefined' && globalThis.Buffer) {
    // Node.js environment
    return Buffer.from(str).toString('base64url');
  } else if (typeof btoa !== 'undefined') {
    // Browser environment
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  } else {
    throw new MlsTokenError('No Base64 encoding method available in this environment');
  }
}

/**
 * Environment-agnostic Base64URL decode function
 */
function base64UrlDecode(str: string): string {
  if (typeof globalThis !== 'undefined' && globalThis.Buffer) {
    // Node.js environment
    return Buffer.from(str, 'base64url').toString();
  } else if (typeof atob !== 'undefined') {
    // Browser environment
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - base64.length % 4) % 4);
    return atob(padded);
  } else {
    throw new MlsTokenError('No Base64 decoding method available in this environment');
  }
}

/**
 * Get crypto implementation for the current environment
 */
async function getCrypto(): Promise<Crypto> {
  if (typeof globalThis !== 'undefined' && globalThis.crypto) {
    // Browser or Node.js with global crypto
    return globalThis.crypto;
  } else if (typeof global !== 'undefined' && typeof global.crypto !== 'undefined') {
    // Node.js with global crypto
    return global.crypto;
  } else {
    // Try to import Node.js crypto module
    try {
      const { webcrypto } = await import('crypto');
      return webcrypto as unknown as Crypto;
    } catch {
      throw new MlsTokenError('No crypto implementation available in this environment');
    }
  }
}

/**
 * Generates a tenant token for restricted access to MeiliSearch
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
  // Input validation
  if (!options.apiKey || typeof options.apiKey !== 'string' || options.apiKey.length < 8) {
    throw new MlsTokenError('Invalid API key: must be a string with at least 8 characters');
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
    // Create header
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    // Create payload with proper typing
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

    // Get crypto implementation for the current environment
    const crypto = await getCrypto();

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

    // Convert signature to base64url
    // In Node.js, we can use Buffer; in browser, we convert to string first
    let encodedSignature: string;
    if (typeof globalThis !== 'undefined' && globalThis.Buffer) {
      encodedSignature = Buffer.from(signature).toString('base64url');
    } else {
      // Avoid String.fromCharCode stack size limitation for large arrays
      const signatureArray = new Uint8Array(signature);
      const chunkSize = 8192; // Safe chunk size to avoid stack overflow
      let binaryString = '';
      for (let i = 0; i < signatureArray.length; i += chunkSize) {
        const chunk = signatureArray.slice(i, i + chunkSize);
        binaryString += String.fromCharCode(...chunk);
      }
      encodedSignature = base64UrlEncode(binaryString);
    }

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

    // Check token expiration before verifying signature
    try {
      const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JWTPayload;
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        return false; // Token has expired
      }
    } catch {
      return false; // Invalid payload format
    }

    // Recreate the message
    const message = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const keyData = encoder.encode(apiKey);

    // Get crypto implementation for the current environment
    const crypto = await getCrypto();

    // Import the key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode the signature based on environment
    let signatureBytes: Uint8Array;
    if (typeof globalThis !== 'undefined' && globalThis.Buffer) {
      // Node.js environment
      signatureBytes = new Uint8Array(Buffer.from(encodedSignature, 'base64url'));
    } else {
      // Browser environment
      const decodedSignature = base64UrlDecode(encodedSignature);
      signatureBytes = Uint8Array.from(decodedSignature, c => c.charCodeAt(0));
    }

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

    const payload = base64UrlDecode(encodedPayload);
    return JSON.parse(payload) as JWTPayload;
  } catch (error) {
    throw new MlsTokenError('Failed to decode tenant token', error);
  }
}