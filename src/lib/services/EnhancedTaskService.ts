/**
 * Enhanced Task Service with advanced task management features
 * Implements EnqueuedTaskPromise pattern, batch waiting, and intelligent polling
 */

import { MeiliSearch, type Task, type EnqueuedTask } from 'meilisearch';
import { MlsTaskTimeoutError } from '../errors';
import type { MeiliTask } from '../types/meilisearch';

export interface WaitOptions {
  timeOutMs?: number;
  intervalMs?: number;
}

export interface EnqueuedTaskPromise extends Promise<EnqueuedTask> {
  onFinish(waitOptions?: WaitOptions): Promise<Task>;
}

export class EnhancedTaskService {
  private client: MeiliSearch;
  private defaultWaitOptions: WaitOptions = {
    timeOutMs: 5000,
    intervalMs: 50
  };

  constructor(client: MeiliSearch, defaultWaitOptions?: WaitOptions) {
    this.client = client;
    if (defaultWaitOptions) {
      this.defaultWaitOptions = { ...this.defaultWaitOptions, ...defaultWaitOptions };
    }
  }

  /**
   * Wraps a task promise with enhanced functionality
   */
  wrapTaskPromise(taskPromise: Promise<EnqueuedTask>): EnqueuedTaskPromise {
    const enhancedPromise = taskPromise as EnqueuedTaskPromise;

    enhancedPromise.onFinish = async (waitOptions?: WaitOptions) => {
      const enqueuedTask = await taskPromise;
      return this.waitForTask(enqueuedTask.taskUid, waitOptions);
    };

    return enhancedPromise;
  }

  /**
   * Waits for a task to complete with intelligent polling
   * Uses exponential backoff to reduce server load
   */
  async waitForTask(
    taskUidOrEnqueuedTask: number | EnqueuedTask,
    options?: WaitOptions
  ): Promise<Task> {
    const taskUid = typeof taskUidOrEnqueuedTask === 'number'
      ? taskUidOrEnqueuedTask
      : taskUidOrEnqueuedTask.taskUid;

    const { timeOutMs, intervalMs } = { ...this.defaultWaitOptions, ...options };
    const startTime = Date.now();
    let currentInterval = intervalMs!;
    const maxInterval = 1000; // Max 1 second between polls

    while (true) {
      const task = await this.client.getTask(taskUid);

      if (!['enqueued', 'processing'].includes(task.status)) {
        return task;
      }

      if (timeOutMs && Date.now() - startTime > timeOutMs) {
        throw new MlsTaskTimeoutError(taskUid, timeOutMs);
      }

      await this.sleep(currentInterval);

      // Exponential backoff with cap
      currentInterval = Math.min(currentInterval * 1.5, maxInterval);
    }
  }

  /**
   * Waits for multiple tasks to complete
   * Returns results as they complete (not in order)
   */
  async *waitForTasksIter(
    taskUidsOrEnqueuedTasks: Iterable<number | EnqueuedTask>,
    options?: WaitOptions
  ): AsyncGenerator<Task, void, undefined> {
    const taskPromises = Array.from(taskUidsOrEnqueuedTasks).map(task =>
      this.waitForTask(task, options)
    );

    // Use Promise.race to yield results as they complete
    const pending = new Set(taskPromises.map((p, i) =>
      p.then(result => ({ index: i, result }))
    ));

    while (pending.size > 0) {
      const { index, result } = await Promise.race(pending);
      yield result;

      // Remove completed promise from pending set
      for (const p of pending) {
        const resolved = await Promise.race([p, Promise.resolve(null)]);
        if (resolved && resolved.index === index) {
          pending.delete(p);
          break;
        }
      }
    }
  }

  /**
   * Waits for multiple tasks to complete and returns all results
   */
  async waitForTasks(
    taskUidsOrEnqueuedTasks: Iterable<number | EnqueuedTask>,
    options?: WaitOptions
  ): Promise<Task[]> {
    const tasks: Task[] = [];

    for await (const task of this.waitForTasksIter(taskUidsOrEnqueuedTasks, options)) {
      tasks.push(task);
    }

    return tasks;
  }

  /**
   * Cancels tasks matching the given criteria
   */
  async cancelTasks(params?: {
    uids?: number[];
    statuses?: string[];
    types?: string[];
    indexUids?: string[];
  }): Promise<EnqueuedTask> {
    // Build query string
    const queryParams = new URLSearchParams();

    if (params?.uids) {
      queryParams.set('uids', params.uids.join(','));
    }
    if (params?.statuses) {
      queryParams.set('statuses', params.statuses.join(','));
    }
    if (params?.types) {
      queryParams.set('types', params.types.join(','));
    }
    if (params?.indexUids) {
      queryParams.set('indexUids', params.indexUids.join(','));
    }

    const response = await (this.client as any).httpRequest.post(
      `/tasks/cancel?${queryParams.toString()}`
    );

    return response;
  }

  /**
   * Deletes tasks matching the given criteria
   */
  async deleteTasks(params?: {
    uids?: number[];
    statuses?: string[];
    types?: string[];
    indexUids?: string[];
  }): Promise<EnqueuedTask> {
    // Build query string
    const queryParams = new URLSearchParams();

    if (params?.uids) {
      queryParams.set('uids', params.uids.join(','));
    }
    if (params?.statuses) {
      queryParams.set('statuses', params.statuses.join(','));
    }
    if (params?.types) {
      queryParams.set('types', params.types.join(','));
    }
    if (params?.indexUids) {
      queryParams.set('indexUids', params.indexUids.join(','));
    }

    const response = await (this.client as any).httpRequest.delete(
      `/tasks?${queryParams.toString()}`
    );

    return response;
  }

  /**
   * Gets detailed task statistics
   */
  async getTaskStats(): Promise<{
    totalTasks: number;
    statuses: Record<string, number>;
    types: Record<string, number>;
    indexes: Record<string, number>;
  }> {
    const tasks = await this.client.getTasks({ limit: 1000 });

    const stats = {
      totalTasks: tasks.total,
      statuses: {} as Record<string, number>,
      types: {} as Record<string, number>,
      indexes: {} as Record<string, number>
    };

    for (const task of tasks.results) {
      // Count by status
      stats.statuses[task.status] = (stats.statuses[task.status] || 0) + 1;

      // Count by type
      stats.types[task.type] = (stats.types[task.type] || 0) + 1;

      // Count by index
      if (task.indexUid) {
        stats.indexes[task.indexUid] = (stats.indexes[task.indexUid] || 0) + 1;
      }
    }

    return stats;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}