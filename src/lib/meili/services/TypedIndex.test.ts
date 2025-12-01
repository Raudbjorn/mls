import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TypedIndex, type TypedDocument } from './TypedIndex';
import { BatchService } from './BatchService';

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
});

