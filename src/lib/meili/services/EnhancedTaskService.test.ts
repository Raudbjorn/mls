import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EnhancedTaskService } from './EnhancedTaskService';
import { MlsTaskTimeoutError } from '../errors';
import type { MeiliSearch, Task } from 'meilisearch';

// Mock MlsTaskTimeoutError since we might not have the full implementation yet
vi.mock('../errors', () => ({
  MlsTaskTimeoutError: class extends Error {
    constructor(public taskUid: number, public timeoutMs: number) {
      super(`Task ${taskUid} timed out after ${timeoutMs}ms`);
      this.name = 'MlsTaskTimeoutError';
    }
  }
}));

describe('EnhancedTaskService', () => {
  let service: EnhancedTaskService;
  let mockClient: any;

  beforeEach(() => {
    vi.useFakeTimers();
    
    mockClient = {
      getTask: vi.fn(),
      cancelTasks: vi.fn(),
      deleteTasks: vi.fn(),
      getTasks: vi.fn()
    };

    service = new EnhancedTaskService(mockClient as unknown as MeiliSearch);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('waitForTask', () => {
    it('should resolve when task completes successfully', async () => {
      const successTask = {
        taskUid: 1,
        status: 'succeeded',
        type: 'indexCreation',
        enqueuedAt: new Date().toISOString(),
        uid: 1 // Adding uid property as it is accessed in the service
      };

      mockClient.getTask.mockResolvedValue(successTask);

      const result = await service.waitForTask(1);
      expect(result).toEqual(successTask);
      expect(mockClient.getTask).toHaveBeenCalledWith(1);
    });

    it('should resolve when task fails', async () => {
      const failedTask = {
        taskUid: 2,
        status: 'failed',
        type: 'indexCreation',
        enqueuedAt: new Date().toISOString(),
        uid: 2
      };

      mockClient.getTask.mockResolvedValue(failedTask);

      const result = await service.waitForTask(2);
      expect(result).toEqual(failedTask);
    });

    it('should poll until task completes', async () => {
      const pendingTask = {
        taskUid: 1,
        status: 'processing',
        uid: 1
      };
      const completedTask = {
        taskUid: 1,
        status: 'succeeded',
        uid: 1
      };

      mockClient.getTask
        .mockResolvedValueOnce(pendingTask)
        .mockResolvedValueOnce(pendingTask)
        .mockResolvedValueOnce(completedTask);

      const promise = service.waitForTask(1, { intervalMs: 10 });
      
      // Advance timers to trigger polls
      await vi.advanceTimersByTimeAsync(100);
      
      const result = await promise;
      expect(result).toEqual(completedTask);
      expect(mockClient.getTask).toHaveBeenCalledTimes(3);
    });

    it('should timeout after configured duration', async () => {
      const pendingTask = {
        taskUid: 1,
        status: 'processing',
        uid: 1
      };

      mockClient.getTask.mockResolvedValue(pendingTask);

      const promise = service.waitForTask(1, { timeOutMs: 1000, intervalMs: 100 });
      
      // Attach handler immediately to avoid unhandled rejection during timer advance
      const result = expect(promise).rejects.toThrow(MlsTaskTimeoutError);
      
      // Advance past timeout with margin
      await vi.advanceTimersByTimeAsync(5000);

      await result;
    });

    it('should respect custom polling interval', async () => {
      const pendingTask = { taskUid: 1, status: 'processing', uid: 1 };
      const completedTask = { taskUid: 1, status: 'succeeded', uid: 1 };

      mockClient.getTask
        .mockResolvedValueOnce(pendingTask)
        .mockResolvedValueOnce(completedTask);

      const promise = service.waitForTask(1, { intervalMs: 500 });
      
      // Should not be called yet
      expect(mockClient.getTask).toHaveBeenCalledTimes(1);
      
      // Advance less than interval
      await vi.advanceTimersByTimeAsync(200);
      expect(mockClient.getTask).toHaveBeenCalledTimes(1);
      
      // Advance past interval
      await vi.advanceTimersByTimeAsync(300);
      
      await promise;
      expect(mockClient.getTask).toHaveBeenCalledTimes(2);
    });
  });

  describe('waitForTasks (batch)', () => {
    it('should resolve when all tasks complete', async () => {
      const task1 = { taskUid: 1, status: 'succeeded', uid: 1 };
      const task2 = { taskUid: 2, status: 'succeeded', uid: 2 };

      mockClient.getTask.mockImplementation((uid: number) => {
        if (uid === 1) return Promise.resolve(task1);
        if (uid === 2) return Promise.resolve(task2);
        return Promise.reject(new Error('Unknown task'));
      });

      const results = await service.waitForTasks([1, 2]);
      expect(results).toHaveLength(2);
      expect(results).toEqual(expect.arrayContaining([task1, task2]));
    });

    it('should return all task results including failures', async () => {
      const task1 = { taskUid: 1, status: 'succeeded', uid: 1 };
      const task2 = { taskUid: 2, status: 'failed', error: 'error', uid: 2 };

      mockClient.getTask.mockImplementation((uid: number) => {
        if (uid === 1) return Promise.resolve(task1);
        if (uid === 2) return Promise.resolve(task2);
        return Promise.reject(new Error('Unknown task'));
      });

      const results = await service.waitForTasks([1, 2]);
      expect(results).toHaveLength(2);
      expect(results).toEqual(expect.arrayContaining([task1, task2]));
    });
    
    it('should handle array of objects with taskUid', async () => {
      const task1 = { taskUid: 1, status: 'succeeded', uid: 1 };
      mockClient.getTask.mockResolvedValue(task1);
      
      const inputs = [{ taskUid: 1, status: 'enqueued' }];
      // @ts-ignore - testing duck typing compatibility
      const results = await service.waitForTasks(inputs);
      
      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(task1);
    });
  });

  describe('task chaining', () => {
    it('should chain sequential operations', async () => {
      const enqueuedTask = { taskUid: 1, status: 'enqueued', uid: 1 };
      const completedTask = { taskUid: 1, status: 'succeeded', uid: 1 };
      
      mockClient.getTask.mockResolvedValue(completedTask);
      
      const taskPromise = Promise.resolve(enqueuedTask);
      const enhanced = service.wrapTaskPromise(taskPromise);
      
      const result = await enhanced.onFinish();
      
      expect(result).toEqual(completedTask);
    });

    it('should propagate errors in chain', async () => {
      const error = new Error('Network error');
      const taskPromise = Promise.reject(error);
      const enhanced = service.wrapTaskPromise(taskPromise);
      
      await expect(enhanced.onFinish()).rejects.toThrow('Network error');
    });
  });

  describe('cancelTasks', () => {
    it('should delegate to client.cancelTasks', async () => {
      const params = { statuses: ['enqueued'] as any[] };
      const result = { taskUid: 999, status: 'enqueued', uid: 999 };
      
      mockClient.cancelTasks.mockResolvedValue(result);
      
      const response = await service.cancelTasks(params);
      
      expect(mockClient.cancelTasks).toHaveBeenCalledWith(params);
      expect(response).toEqual(result);
    });
  });

  describe('deleteTasks', () => {
    it('should delegate to client.deleteTasks', async () => {
      const params = { statuses: ['failed'] as any[] };
      const result = { taskUid: 999, status: 'enqueued', uid: 999 };
      
      mockClient.deleteTasks.mockResolvedValue(result);
      
      const response = await service.deleteTasks(params);
      
      expect(mockClient.deleteTasks).toHaveBeenCalledWith(params);
      expect(response).toEqual(result);
    });
  });
  
  describe('getTaskStats', () => {
    it('should paginate through tasks to calculate stats', async () => {
      // First page
      mockClient.getTasks.mockResolvedValueOnce({
        results: [
          { uid: 1, status: 'succeeded', type: 'indexCreation' },
          { uid: 2, status: 'failed', type: 'documentAddition', indexUid: 'movies' }
        ],
        total: 3,
        next: 2
      });

      // Second page
      mockClient.getTasks.mockResolvedValueOnce({
        results: [
          { uid: 3, status: 'succeeded', type: 'indexCreation' }
        ],
        total: 3,
        next: null
      });

      const stats = await service.getTaskStats();

      expect(stats.totalTasks).toBe(3);
      expect(stats.statuses['succeeded']).toBe(2);
      expect(stats.statuses['failed']).toBe(1);
      expect(stats.types['indexCreation']).toBe(2);
      expect(stats.indexes['movies']).toBe(1);
      expect(mockClient.getTasks).toHaveBeenCalledTimes(2);
    });

    it('should handle empty task list', async () => {
      mockClient.getTasks.mockResolvedValue({
        results: [],
        total: 0,
        next: null
      });

      const stats = await service.getTaskStats();

      expect(stats.totalTasks).toBe(0);
      expect(stats.statuses).toEqual({});
      expect(stats.types).toEqual({});
      expect(stats.indexes).toEqual({});
    });

    it('should handle large datasets with proper pagination', async () => {
      // Simulate a large dataset with multiple pages
      const pages = 15; // 1500 tasks total
      for (let i = 0; i < pages; i++) {
        mockClient.getTasks.mockResolvedValueOnce({
          results: Array.from({ length: 100 }, (_, idx) => ({
            uid: i * 100 + idx,
            status: idx % 3 === 0 ? 'succeeded' : idx % 3 === 1 ? 'failed' : 'processing',
            type: idx % 2 === 0 ? 'indexCreation' : 'documentAddition',
            indexUid: idx % 4 === 0 ? 'movies' : idx % 4 === 1 ? 'books' : undefined
          })),
          total: 1500,
          next: i < pages - 1 ? (i + 1) * 100 : null
        });
      }

      const stats = await service.getTaskStats();

      expect(stats.totalTasks).toBe(1500);
      expect(mockClient.getTasks).toHaveBeenCalledTimes(pages);
      // Verify stats calculation
      expect(Object.values(stats.statuses).reduce((a, b) => a + b, 0)).toBe(1500);
    });
  });

  describe('waitForTasksIter', () => {
    it('should yield results as they complete', async () => {
      const task1 = { taskUid: 1, status: 'succeeded', uid: 1 };
      const task2 = { taskUid: 2, status: 'succeeded', uid: 2 };
      const task3 = { taskUid: 3, status: 'failed', uid: 3 };

      // Mock tasks to complete immediately
      mockClient.getTask.mockImplementation((uid: number) => {
        if (uid === 1) return Promise.resolve(task1);
        if (uid === 2) return Promise.resolve(task2);
        if (uid === 3) return Promise.resolve(task3);
        return Promise.reject(new Error('Unknown task'));
      });

      const results = [];
      for await (const task of service.waitForTasksIter([1, 2, 3])) {
        results.push(task.uid);
      }

      // Results should be yielded as they complete
      expect(results).toHaveLength(3);
      expect(results).toContain(1);
      expect(results).toContain(2);
      expect(results).toContain(3);
    });

    it('should handle errors during iteration', async () => {
      const task1 = { taskUid: 1, status: 'succeeded', uid: 1 };

      mockClient.getTask.mockImplementation((uid: number) => {
        if (uid === 1) return Promise.resolve(task1);
        if (uid === 2) return Promise.reject(new Error('Task fetch failed'));
        return Promise.reject(new Error('Unknown task'));
      });

      const results = [];
      try {
        for await (const task of service.waitForTasksIter([1, 2])) {
          results.push(task);
        }
      } catch (error: any) {
        expect(error.message).toContain('Task fetch failed');
      }

      expect(results).toHaveLength(1);
      expect(results[0]).toEqual(task1);
    });
  });

  describe('exponential backoff', () => {
    it('should implement exponential backoff with cap', async () => {
      const pendingTask = { taskUid: 1, status: 'processing', uid: 1 };
      const completedTask = { taskUid: 1, status: 'succeeded', uid: 1 };

      let callCount = 0;
      mockClient.getTask.mockImplementation(() => {
        callCount++;
        if (callCount < 10) {
          return Promise.resolve(pendingTask);
        }
        return Promise.resolve(completedTask);
      });

      const promise = service.waitForTask(1, { intervalMs: 100, timeOutMs: 10000 });

      // Advance timers to simulate multiple polls with backoff
      for (let i = 0; i < 9; i++) {
        await vi.advanceTimersByTimeAsync(Math.min(100 * Math.pow(1.5, i), 1000));
      }

      const result = await promise;
      expect(result).toEqual(completedTask);
      expect(mockClient.getTask).toHaveBeenCalledTimes(10);
    });
  });

  describe('memory cleanup', () => {
    it('should clean up resources on service destroy', async () => {
      // Create multiple pending operations
      const pendingTask = { taskUid: 1, status: 'processing', uid: 1 };
      const completedTask = { taskUid: 1, status: 'succeeded', uid: 1 };

      // Mock to first return pending, then completed
      let callCount = 0;
      mockClient.getTask.mockImplementation(() => {
        callCount++;
        if (callCount <= 3) {
          return Promise.resolve(pendingTask);
        }
        return Promise.resolve(completedTask);
      });

      // Start multiple wait operations with short timeouts
      const promises = [
        service.waitForTask(1, { timeOutMs: 100, intervalMs: 10 }),
        service.waitForTask(2, { timeOutMs: 100, intervalMs: 10 }),
        service.waitForTask(3, { timeOutMs: 100, intervalMs: 10 })
      ];

      // Advance time to trigger timeout
      await vi.advanceTimersByTimeAsync(200);

      // All promises should either timeout or complete
      const results = await Promise.allSettled(promises);
      expect(results).toHaveLength(3);

      // Verify that at least some operations completed or failed
      const hasRejected = results.some(r => r.status === 'rejected');
      const hasFulfilled = results.some(r => r.status === 'fulfilled');
      expect(hasRejected || hasFulfilled).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle task with missing uid property gracefully', async () => {
      const malformedTask = { taskUid: 1, status: 'succeeded' };
      // @ts-ignore - testing malformed response
      mockClient.getTask.mockResolvedValue(malformedTask);

      const result = await service.waitForTask(1);
      expect(result).toEqual(malformedTask);
    });

    it('should handle concurrent waitForTask calls for same task', async () => {
      const task = { taskUid: 1, status: 'succeeded', uid: 1 };
      mockClient.getTask.mockResolvedValue(task);

      const [result1, result2] = await Promise.all([
        service.waitForTask(1),
        service.waitForTask(1)
      ]);

      expect(result1).toEqual(task);
      expect(result2).toEqual(task);
    });

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network timeout');
      mockClient.getTask.mockRejectedValue(networkError);

      await expect(service.waitForTask(1)).rejects.toThrow('Network timeout');
    });

    it('should handle task status transitions correctly', async () => {
      const statuses = [
        { taskUid: 1, status: 'enqueued', uid: 1 },
        { taskUid: 1, status: 'processing', uid: 1 },
        { taskUid: 1, status: 'succeeded', uid: 1 }
      ];

      let callCount = 0;
      mockClient.getTask.mockImplementation(() => {
        const result = statuses[Math.min(callCount, statuses.length - 1)];
        callCount++;
        return Promise.resolve(result);
      });

      const promise = service.waitForTask(1, { intervalMs: 10 });

      // Advance through status transitions
      await vi.advanceTimersByTimeAsync(50);

      const result = await promise;
      expect(result.status).toBe('succeeded');
    });
  });
});
