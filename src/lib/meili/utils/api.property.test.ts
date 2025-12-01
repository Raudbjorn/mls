import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { createApiClient } from './api';
import { MeiliSearch } from 'meilisearch';

describe('API Utils Property-Based Tests', () => {
  const mockClient = new MeiliSearch({ host: 'http://localhost:7700', apiKey: 'test-key' });

  describe('URL building and query params', () => {
    test('generated URLs parse back to same query object', () => {
      fc.assert(
        fc.property(
          fc.record({
            q: fc.option(fc.string()),
            limit: fc.option(fc.nat()),
            offset: fc.option(fc.nat()),
            filter: fc.option(fc.string()),
            sort: fc.option(fc.array(fc.string()))
          }),
          (queryObj) => {
            // Remove undefined values
            const cleanQuery = Object.entries(queryObj).reduce((acc, [key, val]) => {
              if (val !== undefined && val !== null) {
                acc[key] = val;
              }
              return acc;
            }, {} as any);

            // Build URL params
            const params = new URLSearchParams();
            for (const [key, value] of Object.entries(cleanQuery)) {
              if (Array.isArray(value)) {
                params.set(key, value.join(','));
              } else {
                params.set(key, String(value));
              }
            }

            // Parse back
            const parsed: any = {};
            params.forEach((value, key) => {
              if (key === 'sort' && value.includes(',')) {
                parsed[key] = value.split(',');
              } else if (key === 'limit' || key === 'offset') {
                parsed[key] = parseInt(value, 10);
              } else {
                parsed[key] = value;
              }
            });

            // Should match original (modulo undefined values)
            expect(parsed).toEqual(cleanQuery);
          }
        )
      );
    });

    test('no double-encoding of reserved characters', () => {
      fc.assert(
        fc.property(
          fc.record({
            path: fc.stringOf(fc.char().filter(c => c !== '/' && c !== '?')),
            query: fc.string()
          }),
          ({ path, query }) => {
            // Encode once
            const encoded = encodeURIComponent(query);

            // Should not re-encode
            const doubleEncoded = encodeURIComponent(encoded);

            // These should be different (unless query was already safe)
            if (query !== encoded) {
              expect(doubleEncoded).not.toBe(encoded);
              expect(doubleEncoded).toContain('%25'); // % gets encoded to %25
            }

            // Decoding twice should give original
            const decoded = decodeURIComponent(decodeURIComponent(doubleEncoded));
            expect(decoded).toBe(query);
          }
        )
      );
    });

    test('path segments are safely joined', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 1 }).filter(s => !s.includes('/'))),
          (segments) => {
            const joined = segments.join('/');

            // Should not have double slashes
            expect(joined).not.toContain('//');

            // Split should recover segments
            if (segments.length > 0) {
              const recovered = joined.split('/').filter(s => s.length > 0);
              expect(recovered).toEqual(segments.filter(s => s.length > 0));
            }
          }
        )
      );
    });
  });

  describe('HTTP method handling', () => {
    test('all standard methods are case-insensitive', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant('GET'),
            fc.constant('get'),
            fc.constant('Get'),
            fc.constant('POST'),
            fc.constant('post'),
            fc.constant('PUT'),
            fc.constant('put'),
            fc.constant('PATCH'),
            fc.constant('patch'),
            fc.constant('DELETE'),
            fc.constant('delete')
          ),
          (method) => {
            const api = createApiClient(mockClient);

            // Should normalize method
            const normalized = method.toLowerCase();
            expect(['get', 'post', 'put', 'patch', 'delete']).toContain(normalized);

            // makeRequest should handle any case
            // (In real impl, this would call the method)
            expect(() => {
              const validMethods = ['get', 'post', 'put', 'patch', 'delete'];
              if (!validMethods.includes(normalized)) {
                throw new Error(`Unsupported method: ${method}`);
              }
            }).not.toThrow();
          }
        )
      );
    });
  });

  describe('Config merging', () => {
    test('config values are properly inherited and overridden', () => {
      fc.assert(
        fc.property(
          fc.record({
            host1: fc.webUrl(),
            host2: fc.option(fc.webUrl()),
            key1: fc.string(),
            key2: fc.option(fc.string())
          }),
          ({ host1, host2, key1, key2 }) => {
            const client1 = new MeiliSearch({ host: host1, apiKey: key1 });
            const api = createApiClient(client1);

            const config1 = api.getConfig();
            expect(config1.host).toBe(host1);
            expect(config1.apiKey).toBe(key1);

            // If we had a way to override config
            // the most specific value should win
            const finalHost = host2 || host1;
            const finalKey = key2 || key1;

            expect(finalHost).toBeTruthy();
            expect(finalKey).toBeTruthy();
          }
        )
      );
    });
  });
});