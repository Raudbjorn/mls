import { describe, it, expect } from 'vitest';
import {
  isMeiliTask,
  isTaskStatus,
  isWebhook,
  isBatch,
  isNetwork,
  type MeiliTask
} from './meilisearch';

describe('Type Guards and Validators', () => {
  describe('isMeiliTask', () => {
    it('should return true for valid MeiliTask', () => {
      const task: MeiliTask = {
        taskUid: 1,
        status: 'succeeded',
        type: 'indexCreation',
        enqueuedAt: '2023-01-01'
      };
      expect(isMeiliTask(task)).toBe(true);
    });

    it('should return false for invalid objects', () => {
      expect(isMeiliTask({})).toBe(false);
      expect(isMeiliTask(null)).toBe(false);
      expect(isMeiliTask({ taskUid: 'string' })).toBe(false);
    });

    it('should validate required fields', () => {
      const partial = { taskUid: 1, status: 'succeeded' };
      expect(isMeiliTask(partial)).toBe(false); // Missing type, enqueuedAt
    });
  });

  describe('isTaskStatus', () => {
    it('should accept valid statuses', () => {
      expect(isTaskStatus('enqueued')).toBe(true);
      expect(isTaskStatus('processing')).toBe(true);
      expect(isTaskStatus('succeeded')).toBe(true);
      expect(isTaskStatus('failed')).toBe(true);
      expect(isTaskStatus('canceled')).toBe(true);
    });

    it('should reject invalid statuses', () => {
      expect(isTaskStatus('pending')).toBe(false);
      expect(isTaskStatus('completed')).toBe(false);
      expect(isTaskStatus(123)).toBe(false);
    });
  });

  describe('isWebhook', () => {
    it('should validate webhook structure', () => {
      const hook = { id: '1', url: 'http://example.com' };
      expect(isWebhook(hook)).toBe(true);
    });

    it('should require id and url', () => {
      expect(isWebhook({ id: '1' })).toBe(false);
      expect(isWebhook({ url: 'http://example.com' })).toBe(false);
    });
  });

  describe('isBatch', () => {
    it('should validate batch structure', () => {
      const batch = {
        uid: 1,
        status: 'processing',
        type: 'import',
        duration: 100
      };
      expect(isBatch(batch)).toBe(true);
    });

    it('should reject invalid types', () => {
        const badBatch = { uid: 'string' };
        expect(isBatch(badBatch)).toBe(false);
    });
  });

  describe('isNetwork', () => {
    it('should validate network config structure', () => {
      const network = {
        self: 'http://localhost:7700',
        remotes: [
          { url: 'http://other:7700', searchApiKey: 'key', name: 'other' }
        ]
      };
      expect(isNetwork(network)).toBe(true);
    });
    
    it('should fail if remotes are invalid', () => {
        const network = {
            self: 'http://localhost:7700',
            remotes: [{ url: 'broken' }] // Missing keys
        };
        expect(isNetwork(network)).toBe(false);
    });
  });
});

