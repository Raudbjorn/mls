import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TaskService, type TaskServiceOptions } from './TaskService';
import type { MeiliTask } from '../types/meilisearch';
import type { EnqueuedTask } from 'meilisearch';

// Helper to create a mock EnqueuedTask
const createMockEnqueuedTask = (taskUid: number): EnqueuedTask => ({
  taskUid,
  indexUid: 'test-index',
  status: 'enqueued',
  type: 'documentAdditionOrUpdate',
  enqueuedAt: new Date(),
});

// Mock MeiliSearch client
const createMockClient = (getTaskImpl?: (taskUid: number) => Promise<any>) => ({
  getTask: getTaskImpl || vi.fn().mockResolvedValue({
    taskUid: 1,
    status: 'succeeded',
    type: 'indexCreation',
    enqueuedAt: new Date().toISOString(),
  }),
});

describe('TaskService', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create instance with default options', () => {
      const client = createMockClient();
      const service = new TaskService(client as any);

      expect(service).toBeInstanceOf(TaskService);
      service.destroy();
    });

    it('should accept custom options', () => {
      const client = createMockClient();
      const options: TaskServiceOptions = {
        pollingInterval: 2000,
        maxCompletedTasks: 100,
        completedTaskRetention: 10 * 60 * 1000,
        maxPollingErrors: 10,
      };

      const service = new TaskService(client as any, options);
      expect(service).toBeInstanceOf(TaskService);
      service.destroy();
    });
  });

  describe('submitTask', () => {
    it('should submit a task and track it', async () => {
      const client = createMockClient();
      const service = new TaskService(client as any);

      const taskUid = await service.submitTask(
        Promise.resolve(createMockEnqueuedTask(42))
      );

      expect(taskUid).toBe(42);
      expect(client.getTask).toHaveBeenCalledWith(42);

      service.destroy();
    });

    it('should throw if task response is invalid', async () => {
      const client = createMockClient();
      const service = new TaskService(client as any);

      await expect(
        // @ts-expect-error Testing invalid input
        service.submitTask(Promise.resolve({}))
      ).rejects.toThrow('Invalid task response');

      service.destroy();
    });

    it('should throw if promise rejects', async () => {
      const client = createMockClient();
      const service = new TaskService(client as any);

      await expect(
        service.submitTask(Promise.reject(new Error('Network error')))
      ).rejects.toThrow('Network error');

      service.destroy();
    });
  });

  describe('addTask', () => {
    it('should add and fetch task status', async () => {
      const mockTask = {
        taskUid: 1,
        status: 'succeeded',
        type: 'documentAdditionOrUpdate',
        enqueuedAt: new Date().toISOString(),
      };

      const client = createMockClient(() => Promise.resolve(mockTask));
      const service = new TaskService(client as any);

      await service.addTask(1);

      const task = service.getTask(1);
      expect(task?.status).toBe('succeeded');

      service.destroy();
    });

    it('should start polling for active tasks', async () => {
      const mockTask = {
        taskUid: 1,
        status: 'processing',
        type: 'documentAdditionOrUpdate',
        enqueuedAt: new Date().toISOString(),
      };

      const client = createMockClient(() => Promise.resolve(mockTask));
      const service = new TaskService(client as any, { pollingInterval: 100 });

      await service.addTask(1);

      expect(service.isPolling(1)).toBe(true);

      service.destroy();
    });

    it('should not poll for completed tasks', async () => {
      const mockTask = {
        taskUid: 1,
        status: 'succeeded',
        type: 'documentAdditionOrUpdate',
        enqueuedAt: new Date().toISOString(),
      };

      const client = createMockClient(() => Promise.resolve(mockTask));
      const service = new TaskService(client as any);

      await service.addTask(1);

      expect(service.isPolling(1)).toBe(false);

      service.destroy();
    });
  });

  describe('getAllTasks', () => {
    it('should return all tasks sorted by UID descending', async () => {
      const client = {
        getTask: vi.fn()
          .mockResolvedValueOnce({ taskUid: 1, status: 'succeeded', type: 'test', enqueuedAt: new Date().toISOString() })
          .mockResolvedValueOnce({ taskUid: 2, status: 'succeeded', type: 'test', enqueuedAt: new Date().toISOString() })
          .mockResolvedValueOnce({ taskUid: 3, status: 'succeeded', type: 'test', enqueuedAt: new Date().toISOString() }),
      };

      const service = new TaskService(client as any);

      await service.addTask(1);
      await service.addTask(2);
      await service.addTask(3);

      const tasks = service.getAllTasks();
      expect(tasks.map(t => t.taskUid)).toEqual([3, 2, 1]);

      service.destroy();
    });
  });

  describe('getActiveTaskCount', () => {
    it('should return count of actively polling tasks', async () => {
      const client = {
        getTask: vi.fn()
          .mockResolvedValueOnce({ taskUid: 1, status: 'processing', type: 'test', enqueuedAt: new Date().toISOString() })
          .mockResolvedValueOnce({ taskUid: 2, status: 'processing', type: 'test', enqueuedAt: new Date().toISOString() })
          .mockResolvedValueOnce({ taskUid: 3, status: 'succeeded', type: 'test', enqueuedAt: new Date().toISOString() }),
      };

      const service = new TaskService(client as any);

      await service.addTask(1);
      await service.addTask(2);
      await service.addTask(3);

      expect(service.getActiveTaskCount()).toBe(2);

      service.destroy();
    });
  });

  describe('onTaskComplete', () => {
    it('should call callback when task completes', async () => {
      let callCount = 0;
      const completedTask: MeiliTask = {
        taskUid: 1,
        status: 'succeeded',
        type: 'test',
        enqueuedAt: new Date().toISOString(),
      };

      const client = {
        getTask: vi.fn()
          .mockResolvedValueOnce({ taskUid: 1, status: 'processing', type: 'test', enqueuedAt: new Date().toISOString() })
          .mockResolvedValueOnce(completedTask),
      };

      const service = new TaskService(client as any, { pollingInterval: 100 });

      const callback = vi.fn();
      service.onTaskComplete(callback);

      await service.addTask(1);

      // Advance timer to trigger polling
      await vi.advanceTimersByTimeAsync(150);

      expect(callback).toHaveBeenCalledWith(completedTask);

      service.destroy();
    });

    it('should return unsubscribe function', async () => {
      const client = createMockClient();
      const service = new TaskService(client as any);

      const callback = vi.fn();
      const unsubscribe = service.onTaskComplete(callback);

      expect(typeof unsubscribe).toBe('function');
      unsubscribe();

      service.destroy();
    });
  });

  describe('cleanup', () => {
    it('should remove old completed tasks', async () => {
      const client = {
        getTask: vi.fn().mockResolvedValue({
          taskUid: 1,
          status: 'succeeded',
          type: 'test',
          enqueuedAt: new Date().toISOString(),
        }),
      };

      const service = new TaskService(client as any, {
        completedTaskRetention: 1000, // 1 second retention
      });

      await service.addTask(1);
      expect(service.getTask(1)).toBeDefined();

      // Advance time past retention period
      vi.advanceTimersByTime(2000);

      // Trigger cleanup
      service.cleanup();

      expect(service.getTask(1)).toBeUndefined();

      service.destroy();
    });
  });

  describe('destroy', () => {
    it('should stop all polling intervals', async () => {
      const client = {
        getTask: vi.fn().mockResolvedValue({
          taskUid: 1,
          status: 'processing',
          type: 'test',
          enqueuedAt: new Date().toISOString(),
        }),
      };

      const service = new TaskService(client as any);

      await service.addTask(1);
      expect(service.isPolling(1)).toBe(true);

      service.destroy();

      expect(service.isPolling(1)).toBe(false);
      expect(service.getActiveTaskCount()).toBe(0);
    });

    it('should clear completion callbacks', async () => {
      const client = createMockClient();
      const service = new TaskService(client as any);

      const callback = vi.fn();
      service.onTaskComplete(callback);

      service.destroy();

      // After destroy, callbacks should be cleared (internal state)
      // We can't directly test this, but destroy should complete without error
      expect(service.getActiveTaskCount()).toBe(0);
    });
  });

  describe('polling behavior', () => {
    it('should stop polling after consecutive errors', async () => {
      const client = {
        getTask: vi.fn()
          .mockResolvedValueOnce({ taskUid: 1, status: 'processing', type: 'test', enqueuedAt: new Date().toISOString() })
          .mockRejectedValue(new Error('Network error')),
      };

      const service = new TaskService(client as any, {
        pollingInterval: 100,
        maxPollingErrors: 3,
      });

      await service.addTask(1);
      expect(service.isPolling(1)).toBe(true);

      // Advance time to trigger multiple failed polls
      for (let i = 0; i < 5; i++) {
        await vi.advanceTimersByTimeAsync(150);
      }

      expect(service.isPolling(1)).toBe(false);

      service.destroy();
    });

    it('should reset error count on successful poll', async () => {
      let callCount = 0;
      const client = {
        getTask: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount <= 2) {
            return Promise.reject(new Error('Temporary error'));
          }
          return Promise.resolve({
            taskUid: 1,
            status: 'processing',
            type: 'test',
            enqueuedAt: new Date().toISOString(),
          });
        }),
      };

      const service = new TaskService(client as any, {
        pollingInterval: 100,
        maxPollingErrors: 5,
      });

      await service.addTask(1);

      // Advance time to trigger polls
      for (let i = 0; i < 4; i++) {
        await vi.advanceTimersByTimeAsync(150);
      }

      // Should still be polling because errors were reset
      expect(service.isPolling(1)).toBe(true);

      service.destroy();
    });
  });
});
