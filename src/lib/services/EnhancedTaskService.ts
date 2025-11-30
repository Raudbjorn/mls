/**
 * Enhanced Task Service with advanced task management features
 * Implements EnqueuedTaskPromise pattern, batch waiting, and intelligent polling
 */

import { MeiliSearch, type Task, type EnqueuedTask, TaskTypes, TaskStatus } from 'meilisearch';
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
    const pending = new Set<Promise<{ index: number, result: Task }>>();
    taskPromises.forEach((p, i) => {
      // Create a wrapper promise that removes itself from the set when resolved
      const wrapper = p.then(result => {
        pending.delete(wrapper);
        return { index: i, result };
      });
      pending.add(wrapper);
    });

    while (pending.size > 0) {
      const { result } = await Promise.race(pending);
      yield result;
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
    statuses?: TaskStatus[];
    types?: TaskTypes[];
    indexUids?: string[];
  }): Promise<EnqueuedTask> {
    // Use the SDK's cancelTasks method directly
    return await this.client.cancelTasks(params || {});
  }

  /**
   * Deletes tasks matching the given criteria
   */
  async deleteTasks(params?: {
    uids?: number[];
    statuses?: TaskStatus[];
    types?: TaskTypes[];
    indexUids?: string[];
  }): Promise<EnqueuedTask> {
    // Use the SDK's deleteTasks method directly
    return await this.client.deleteTasks(params || {});
  }

  /**
   * Gets detailed task statistics with pagination support
   * Fixes the 1000 task limit by implementing pagination
   */
  async getTaskStats(): Promise<{
    totalTasks: number;
    statuses: Record<string, number>;
    types: Record<string, number>;
    indexes: Record<string, number>;
  }> {
    const stats = {
      totalTasks: 0,
      statuses: {} as Record<string, number>,
      types: {} as Record<string, number>,
      indexes: {} as Record<string, number>
    };

    const limit = 100; // Process in chunks of 100
    let from = 0;
    let hasMore = true;
    const seenTaskUids = new Set<number>();

    // Pagination loop to handle more than 1000 tasks
    while (hasMore) {
      const response = await this.client.getTasks({
        limit,
        from
      });

      // Update total count
      stats.totalTasks = response.total;

      // Process each task
      for (const task of response.results) {
        // Skip if we've already seen this task (shouldn't happen but being safe)
        if (seenTaskUids.has(task.uid)) {
          continue;
        }
        seenTaskUids.add(task.uid);

        // Count by status
        stats.statuses[task.status] = (stats.statuses[task.status] || 0) + 1;

        // Count by type
        stats.types[task.type] = (stats.types[task.type] || 0) + 1;

        // Count by index
        if (task.indexUid) {
          stats.indexes[task.indexUid] = (stats.indexes[task.indexUid] || 0) + 1;
        }
      }

      // Check if there are more results
      hasMore = response.next !== null;

      if (hasMore && response.next) {
        // Update 'from' for the next iteration
        from = response.next;
      }

      // Also check if we've reached the total
      if (response.total && seenTaskUids.size >= response.total) {
        hasMore = false;
      }
    }

    return stats;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}