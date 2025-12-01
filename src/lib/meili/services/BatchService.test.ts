import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BatchService } from './BatchService';
import { MlsBatchError } from '../errors';
import type { Index } from 'meilisearch';

describe('BatchService', () => {
  let service: BatchService;
  let mockIndex: any;
  let mockTaskService: any;

  beforeEach(() => {
    mockIndex = {
      addDocuments: vi.fn(),
      updateDocuments: vi.fn(),
      deleteDocuments: vi.fn()
    };
    
    mockTaskService = {
      waitForTask: vi.fn().mockResolvedValue({ status: 'succeeded', taskUid: 1 })
    };

    service = new BatchService(mockTaskService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('calculateOptimalBatchSize', () => {
    it('should return default batch size for empty input', () => {
      const size = service.calculateOptimalBatchSize([]);
      expect(size).toBe(1000);
    });

    it('should calculate size based on memory limit', () => {
      // 1KB docs, 10MB limit -> ~10,000 docs (capped)
      // 100KB docs, 10MB limit -> ~100 docs
      const largeDocs = Array(10).fill({ content: 'x'.repeat(100 * 1024) }); 
      const size = service.calculateOptimalBatchSize(largeDocs, 10);
      
      // 10MB = 10485760 bytes. 
      // Doc size ~ 100KB * 1.3 (overhead) = 133KB.
      // 10485760 / 133120 = ~78.
      expect(size).toBeLessThan(1000);
      expect(size).toBeGreaterThan(10);
    });

    it('should respect min and max bounds', () => {
      // Tiny docs -> max 10000
      const tinyDocs = Array(10).fill({ a: 1 });
      const maxSize = service.calculateOptimalBatchSize(tinyDocs, 100); // Huge memory
      expect(maxSize).toBe(10000);

      // Huge docs -> min 1
      const hugeDocs = Array(1).fill({ content: 'x'.repeat(10 * 1024 * 1024) }); // 10MB doc
      const minSize = service.calculateOptimalBatchSize(hugeDocs, 1); // 1MB limit
      expect(minSize).toBe(1);
    });
  });

  describe('addDocumentsInBatches', () => {
    it('should split documents into batches', async () => {
      const docs = Array.from({ length: 2500 }, (_, i) => ({ id: i }));
      
      mockIndex.addDocuments.mockResolvedValue({ taskUid: 1, status: 'enqueued' });

      const result = await service.addDocumentsInBatches(mockIndex, docs, { batchSize: 1000 });

      // 2500 / 1000 = 3 batches (1000, 1000, 500)
      expect(mockIndex.addDocuments).toHaveBeenCalledTimes(3);
      expect(result.totalBatches).toBe(3);
      expect(result.successfulBatches).toBe(3);
      expect(result.failedBatches).toBe(0);
    });

    it('should call onBatchComplete callback', async () => {
      const docs = [{ id: 1 }, { id: 2 }];
      const onComplete = vi.fn();
      
      mockIndex.addDocuments.mockResolvedValue({ taskUid: 1 });

      await service.addDocumentsInBatches(mockIndex, docs, { 
        batchSize: 1,
        onBatchComplete: onComplete
      });

      expect(onComplete).toHaveBeenCalledTimes(2);
      expect(onComplete).toHaveBeenCalledWith(0, { taskUid: 1 });
      expect(onComplete).toHaveBeenCalledWith(1, { taskUid: 1 });
    });

    it('should handle batch errors and continue', async () => {
      const docs = [{ id: 1 }, { id: 2 }];
      
      mockIndex.addDocuments
        .mockResolvedValueOnce({ taskUid: 1 })
        .mockRejectedValueOnce(new Error('Network error'));

      try {
        await service.addDocumentsInBatches(mockIndex, docs, { batchSize: 1 });
      } catch (error: any) {
        expect(error).toBeInstanceOf(MlsBatchError);
        expect(error.failedBatches).toEqual([1]);
        expect(error.successfulBatches).toEqual([0]);
        expect(mockIndex.addDocuments).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('updateDocumentsInBatches', () => {
    it('should use updateDocuments method', async () => {
      const docs = [{ id: 1 }];
      mockIndex.updateDocuments.mockResolvedValue({ taskUid: 1 });

      await service.updateDocumentsInBatches(mockIndex, docs);

      expect(mockIndex.updateDocuments).toHaveBeenCalled();
      expect(mockIndex.addDocuments).not.toHaveBeenCalled();
    });
  });

  describe('deleteDocumentsInBatches', () => {
    it('should delete documents in batches', async () => {
      const ids = Array.from({ length: 150 }, (_, i) => i.toString());
      mockIndex.deleteDocuments.mockResolvedValue({ taskUid: 1 });

      await service.deleteDocumentsInBatches(mockIndex, ids, { batchSize: 100 });

      expect(mockIndex.deleteDocuments).toHaveBeenCalledTimes(2); // 100, 50
    });
  });

  describe('processDocumentStream', () => {
    async function* createStream(count: number) {
      for (let i = 0; i < count; i++) {
        yield { id: i };
      }
    }

    it('should process stream in batches', async () => {
      const stream = createStream(5);
      mockIndex.addDocuments.mockResolvedValue({ taskUid: 1 });

      const tasks = [];
      for await (const task of service.processDocumentStream(mockIndex, stream, 'add', { batchSize: 2 })) {
        tasks.push(task);
      }

      // 5 items, batch 2 -> 3 batches (2, 2, 1)
      expect(mockIndex.addDocuments).toHaveBeenCalledTimes(3);
      expect(tasks).toHaveLength(3);
    });

    it('should handle stream errors', async () => {
        async function* errorStream() {
            yield { id: 1 };
            throw new Error('Stream failed');
        }

        mockIndex.addDocuments.mockResolvedValue({ taskUid: 1 });

        const generator = service.processDocumentStream(mockIndex, errorStream(), 'add', { batchSize: 2 });
        
        await expect(async () => {
            for await (const _ of generator) {}
        }).rejects.toThrow('Stream failed');
        
        // Should have processed the first item in cleanup/final block because batch wasn't full but stream ended (errored)
        // Wait, if stream throws, the loop exits. The `catch` block catches "Stream iteration error".
        // Then it calls `throw streamError`.
        // Inside `processDocumentStream`:
        // catch (error) { ... if (batch.length > 0) try process ... throw streamError }
        // So it should try to add the 1 pending doc.
        expect(mockIndex.addDocuments).toHaveBeenCalledTimes(1);
    });
  });
});

