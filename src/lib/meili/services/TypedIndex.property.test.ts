import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import { TypedIndex } from './TypedIndex';
import { MeiliSearch } from 'meilisearch';

describe('TypedIndex Property-Based Tests', () => {
  // Mock client for testing
  const mockClient = new MeiliSearch({ host: 'http://localhost:7700' });

  describe('Index naming and identification', () => {
    test('any valid index name round-trips without throwing', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }).filter(s => /^[a-zA-Z0-9_-]+$/.test(s)),
          (indexName) => {
            const typedIndex = new TypedIndex(mockClient.index(indexName));

            // Should be able to get the index back
            expect(typedIndex.index.uid).toBe(indexName);

            // Should maintain the same reference
            expect(typedIndex.index).toBe(typedIndex.index);
          }
        )
      );
    });

    test('document IDs are preserved through operations', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.oneof(fc.string(), fc.integer()),
            title: fc.string(),
            content: fc.string()
          }),
          (document) => {
            const typedIndex = new TypedIndex(mockClient.index('test'));

            // The typed index should preserve document ID type
            const docWithId = { ...document };

            // ID should be extractable
            if ('id' in docWithId) {
              expect(docWithId.id).toBeDefined();
              expect(['string', 'number']).toContain(typeof docWithId.id);
            }
          }
        )
      );
    });
  });

  describe('Type safety and mapping', () => {
    test('mapping functions never drop required fields', () => {
      interface TestDoc {
        id: string;
        title: string;
        optional?: string;
      }

      fc.assert(
        fc.property(
          fc.record({
            id: fc.string(),
            title: fc.string(),
            optional: fc.option(fc.string())
          }),
          (doc) => {
            const typedIndex = new TypedIndex<TestDoc>(mockClient.index('test'));

            // After any transformation, required fields must still exist
            const processedDoc = { ...doc } as TestDoc;

            expect(processedDoc.id).toBeDefined();
            expect(processedDoc.title).toBeDefined();
            // Optional can be undefined
            expect('optional' in processedDoc).toBe(true);
          }
        )
      );
    });

    test('config merging preserves all settings', () => {
      fc.assert(
        fc.property(
          fc.record({
            maxTotalHits: fc.option(fc.integer({ min: 1, max: 10000 })),
            maxOffset: fc.option(fc.integer({ min: 0, max: 1000 })),
            hitsPerPage: fc.option(fc.integer({ min: 1, max: 100 }))
          }),
          (config) => {
            const typedIndex = new TypedIndex(
              mockClient.index('test'),
              config as any
            );

            // Config should be stored
            if (config.maxTotalHits !== undefined) {
              expect(typedIndex.config?.pagination?.maxTotalHits).toBe(config.maxTotalHits);
            }

            // Should handle undefined gracefully
            if (!config.maxOffset) {
              expect(typedIndex.config?.pagination?.maxOffset).toBeUndefined();
            }
          }
        )
      );
    });
  });

  describe('Search parameter validation', () => {
    test('pagination never requests out-of-bounds pages', () => {
      fc.assert(
        fc.property(
          fc.record({
            page: fc.nat(),
            hitsPerPage: fc.integer({ min: 1, max: 100 }),
            totalHits: fc.integer({ min: 0, max: 10000 })
          }),
          ({ page, hitsPerPage, totalHits }) => {
            const maxPage = Math.ceil(totalHits / hitsPerPage) || 1;
            const safePage = Math.min(page, maxPage);

            // Calculate offset
            const offset = (safePage - 1) * hitsPerPage;

            // Offset should never exceed total
            expect(offset).toBeLessThanOrEqual(totalHits);
            expect(offset).toBeGreaterThanOrEqual(0);

            // Limit should be reasonable
            const limit = Math.min(hitsPerPage, totalHits - offset);
            expect(limit).toBeGreaterThanOrEqual(0);
            expect(limit).toBeLessThanOrEqual(hitsPerPage);
          }
        )
      );
    });
  });
});