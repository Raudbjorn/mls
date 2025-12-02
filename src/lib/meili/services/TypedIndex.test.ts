import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TypedIndex, type TypedDocument } from './TypedIndex';
import { BatchService } from './BatchService';
import { MlsTaskTimeoutError } from '../errors';

interface TestDoc extends TypedDocument {
  id: number;
  title: string;
  category: string;
}

describe('TypedIndex', () => {
  let typedIndex: TypedIndex<TestDoc>;
  let mockIndex: any;
  let mockBatchService: any;
  let mockTaskService: any;

  beforeEach(() => {
    mockIndex = {
      uid: 'test-index',
      search: vi.fn(),
      searchForFacetValues: vi.fn(),
      getDocument: vi.fn(),
      getDocuments: vi.fn(),
      addDocuments: vi.fn(),
      updateDocuments: vi.fn(),
      deleteDocument: vi.fn(),
      deleteDocuments: vi.fn(),
      deleteAllDocuments: vi.fn(),
      updateSettings: vi.fn(),
      getStats: vi.fn(),
      getTask: vi.fn(),
      httpRequest: {
        post: vi.fn()
      }
    };

    mockBatchService = {
      addDocumentsInBatches: vi.fn(),
      updateDocumentsInBatches: vi.fn()
    };

    mockTaskService = {
      waitForTask: vi.fn()
    };

    typedIndex = new TypedIndex<TestDoc>(
      mockIndex, 
      { primaryKey: 'id' }, 
      mockBatchService, 
      mockTaskService
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('document operations', () => {
    it('should add documents directly when below batch size', async () => {
      const docs: TestDoc[] = [{ id: 1, title: 'A', category: 'X' }];
      mockIndex.addDocuments.mockResolvedValue({ taskUid: 1 });

      await typedIndex.addDocuments(docs);

      expect(mockIndex.addDocuments).toHaveBeenCalledWith(docs, { primaryKey: 'id' });
      expect(mockBatchService.addDocumentsInBatches).not.toHaveBeenCalled();
    });

    it('should use batch service when documents exceed batch size', async () => {
      const docs = Array(1001).fill({ id: 1, title: 'A', category: 'X' });
      mockBatchService.addDocumentsInBatches.mockResolvedValue({ tasks: [] });

      await typedIndex.addDocuments(docs);

      expect(mockBatchService.addDocumentsInBatches).toHaveBeenCalled();
      expect(mockIndex.addDocuments).not.toHaveBeenCalled();
    });

    it('should update documents with type safety', async () => {
      const docs: Partial<TestDoc>[] = [{ id: 1, title: 'B' }];
      mockIndex.updateDocuments.mockResolvedValue({ taskUid: 2 });

      await typedIndex.updateDocuments(docs);

      expect(mockIndex.updateDocuments).toHaveBeenCalledWith(docs, { primaryKey: 'id' });
    });

    it('should return typed documents from search', async () => {
      const response = { hits: [{ id: 1, title: 'A', category: 'X' }] };
      mockIndex.search.mockResolvedValue(response);

      const result = await typedIndex.search('query');
      
      expect(mockIndex.search).toHaveBeenCalledWith('query', undefined);
      expect(result.hits[0].title).toBe('A');
    });

    it('should return typed document from getDocument', async () => {
      const doc = { id: 1, title: 'A', category: 'X' };
      mockIndex.getDocument.mockResolvedValue(doc);

      const result = await typedIndex.getDocument(1);
      
      expect(mockIndex.getDocument).toHaveBeenCalledWith('1');
      expect(result).toEqual(doc);
    });
  });

  describe('settings typing', () => {
    it('should convert typed attribute keys to strings for settings', async () => {
      mockIndex.updateSettings.mockResolvedValue({ taskUid: 3 });

      await typedIndex.updateSettings({
        searchableAttributes: ['title', 'category'],
        filterableAttributes: ['category']
      });

      expect(mockIndex.updateSettings).toHaveBeenCalledWith({
        searchableAttributes: ['title', 'category'],
        filterableAttributes: ['category']
      });
    });
  });

  describe('advanced features', () => {
    it('should use SDK method for similar documents if available', async () => {
      mockIndex.searchSimilarDocuments = vi.fn().mockResolvedValue({ hits: [] });
      
      await typedIndex.getSimilarDocuments(1);
      
      expect(mockIndex.searchSimilarDocuments).toHaveBeenCalled();
    });

    it('should fallback to httpRequest for similar documents', async () => {
      // Ensure method is undefined
      mockIndex.searchSimilarDocuments = undefined;
      mockIndex.httpRequest.post.mockResolvedValue({ hits: [] });
      
      await typedIndex.getSimilarDocuments(1);
      
      expect(mockIndex.httpRequest.post).toHaveBeenCalledWith(
        '/indexes/test-index/similar', 
        expect.objectContaining({ id: '1' })
      );
    });
  });
  
  describe('type guard', () => {
    it('should validate document shape matches type', () => {
       const validDoc = { id: 1, title: 'test' };
       const invalidDoc = { title: 'no id' };
       const notObj = 'string';

       expect(typedIndex.isValidDocument(validDoc)).toBe(true);
       expect(typedIndex.isValidDocument(invalidDoc)).toBe(false);
       expect(typedIndex.isValidDocument(notObj)).toBe(false);
    });
  });

  describe('delete operations', () => {
    it('should delete document by ID', async () => {
      mockIndex.deleteDocument.mockResolvedValue({ taskUid: 1 });

      await typedIndex.deleteDocument(123);

      expect(mockIndex.deleteDocument).toHaveBeenCalledWith('123');
    });

    it('should delete multiple documents by IDs', async () => {
      mockIndex.deleteDocuments.mockResolvedValue({ taskUid: 1 });

      await typedIndex.deleteDocuments([1, 2, 3]);

      expect(mockIndex.deleteDocuments).toHaveBeenCalledWith([1, 2, 3]);
    });

    it('should delete documents by filter', async () => {
      mockIndex.deleteDocuments.mockResolvedValue({ taskUid: 1 });
      const filter = { filter: 'category = "X"' };

      await typedIndex.deleteDocuments(filter);

      expect(mockIndex.deleteDocuments).toHaveBeenCalledWith(filter);
    });

    it('should delete all documents', async () => {
      mockIndex.deleteAllDocuments.mockResolvedValue({ taskUid: 1 });

      await typedIndex.deleteAllDocuments();

      expect(mockIndex.deleteAllDocuments).toHaveBeenCalled();
    });
  });

  describe('getDocuments', () => {
    it('should get documents with pagination', async () => {
      const mockResponse = {
        results: [{ id: 1, title: 'A', category: 'X' }],
        total: 100,
        limit: 10,
        offset: 0
      };
      mockIndex.getDocuments.mockResolvedValue(mockResponse);

      const result = await typedIndex.getDocuments({ limit: 10, offset: 0 });

      expect(mockIndex.getDocuments).toHaveBeenCalledWith({ limit: 10, offset: 0 });
      expect(result).toEqual(mockResponse);
    });

    it('should get documents with field selection', async () => {
      const mockResponse = {
        results: [{ id: 1, title: 'A' }],
        total: 1,
        limit: 20,
        offset: 0
      };
      mockIndex.getDocuments.mockResolvedValue(mockResponse);

      await typedIndex.getDocuments({ fields: ['id', 'title'] });

      expect(mockIndex.getDocuments).toHaveBeenCalledWith({
        fields: ['id', 'title']
      });
    });
  });

  describe('facet search', () => {
    it('should search for facet values', async () => {
      const mockResponse = {
        facetHits: [
          { value: 'X', count: 10 },
          { value: 'Y', count: 5 }
        ],
        facetQuery: 'X'
      };
      mockIndex.searchForFacetValues.mockResolvedValue(mockResponse);

      const result = await typedIndex.searchFacets('category', 'X');

      expect(mockIndex.searchForFacetValues).toHaveBeenCalledWith({
        facetName: 'category',
        facetQuery: 'X'
      });
      expect(result).toEqual(mockResponse.facetHits);
    });

    it('should support filters in facet search', async () => {
      const mockResponse = { facetHits: [] };
      mockIndex.searchForFacetValues.mockResolvedValue(mockResponse);

      await typedIndex.searchFacets('category', 'X', {
        filter: 'title = "test"',
        q: 'query'
      });

      expect(mockIndex.searchForFacetValues).toHaveBeenCalledWith({
        facetName: 'category',
        facetQuery: 'X',
        filter: 'title = "test"',
        q: 'query'
      });
    });
  });

  describe('editDocuments', () => {
    it('should edit documents with JSON patch operations', async () => {
      mockIndex.httpRequest.post.mockResolvedValue({ taskUid: 1 });

      const edits = [{
        id: 1,
        operations: [
          { op: 'replace' as const, path: '/title', value: 'New Title' }
        ]
      }];

      await typedIndex.editDocuments(edits);

      expect(mockIndex.httpRequest.post).toHaveBeenCalledWith(
        '/indexes/test-index/documents/edit',
        { edits }
      );
    });
  });

  describe('fetchDocuments', () => {
    it('should fetch specific documents by IDs', async () => {
      const docs = [{ id: 1, title: 'A', category: 'X' }];
      mockIndex.httpRequest.post.mockResolvedValue(docs);

      const result = await typedIndex.fetchDocuments([1, 2, 3]);

      expect(mockIndex.httpRequest.post).toHaveBeenCalledWith(
        '/indexes/test-index/documents/fetch',
        { ids: ['1', '2', '3'] }
      );
      expect(result).toEqual(docs);
    });
  });

  describe('getStats', () => {
    it('should get index statistics', async () => {
      const stats = {
        numberOfDocuments: 1000,
        isIndexing: false,
        fieldDistribution: { id: 1000, title: 1000, category: 950 }
      };
      mockIndex.getStats.mockResolvedValue(stats);

      const result = await typedIndex.getStats();

      expect(mockIndex.getStats).toHaveBeenCalled();
      expect(result).toEqual(stats);
    });
  });

  describe('waitForTask', () => {
    it('should use taskService when available', async () => {
      const task = { status: 'succeeded', taskUid: 1 };
      mockTaskService.waitForTask.mockResolvedValue(task);

      const result = await typedIndex.waitForTask(1);

      expect(mockTaskService.waitForTask).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual(task);
    });

    it('should fallback to basic polling without taskService', async () => {
      const typedIndexWithoutService = new TypedIndex(mockIndex, { primaryKey: 'id' });
      mockIndex.getTask = vi.fn()
        .mockResolvedValueOnce({ status: 'processing', taskUid: 1 })
        .mockResolvedValueOnce({ status: 'succeeded', taskUid: 1 });

      const result = await typedIndexWithoutService.waitForTask(1, { intervalMs: 10 });

      expect(mockIndex.getTask).toHaveBeenCalled();
      expect(result.status).toBe('succeeded');
    });

    it('should timeout when task does not complete', async () => {
      const typedIndexWithoutService = new TypedIndex(mockIndex, { primaryKey: 'id' });
      mockIndex.getTask = vi.fn().mockResolvedValue({ status: 'processing', taskUid: 1 });

      await expect(typedIndexWithoutService.waitForTask(1, { timeOutMs: 100, intervalMs: 10 }))
        .rejects.toThrow(MlsTaskTimeoutError);
    });
  });

  describe('getRawIndex', () => {
    it('should return the underlying index instance', () => {
      const rawIndex = typedIndex.getRawIndex();
      expect(rawIndex).toBe(mockIndex);
    });
  });

  describe('batch operations', () => {
    it('should use batch service for large add operations', async () => {
      const largeDocs = Array(1500).fill({ id: 1, title: 'Test', category: 'X' });
      mockBatchService.addDocumentsInBatches.mockResolvedValue({
        tasks: [{ taskUid: 1 }, { taskUid: 2 }]
      });

      const result = await typedIndex.addDocuments(largeDocs);

      expect(mockBatchService.addDocumentsInBatches).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should use batch service for large update operations', async () => {
      const largeDocs = Array(1500).fill({ id: 1, title: 'Updated' });
      mockBatchService.updateDocumentsInBatches.mockResolvedValue({
        tasks: [{ taskUid: 1 }, { taskUid: 2 }]
      });

      const result = await typedIndex.updateDocuments(largeDocs);

      expect(mockBatchService.updateDocumentsInBatches).toHaveBeenCalled();
      expect(Array.isArray(result)).toBe(true);
    });

    it('should respect custom batch size', async () => {
      const docs = Array(500).fill({ id: 1, title: 'Test', category: 'X' });
      mockBatchService.addDocumentsInBatches.mockResolvedValue({
        tasks: [{ taskUid: 1 }]
      });

      await typedIndex.addDocuments(docs, { batchSize: 100 });

      // 500 docs with batch size 100, should use batching
      expect(mockBatchService.addDocumentsInBatches).toHaveBeenCalledWith(
        mockIndex,
        docs,
        expect.objectContaining({ batchSize: 100 })
      );
    });
  });
});

