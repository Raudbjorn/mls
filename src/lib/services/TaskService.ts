import { MeiliSearch, type EnqueuedTask } from "meilisearch";
import type { MeiliTask } from "../types/meilisearch";

/**
 * Configuration options for TaskService
 */
export interface TaskServiceOptions {
  /** Polling interval in milliseconds (default: 1000) */
  pollingInterval?: number;
  /** Maximum number of completed tasks to retain (default: 50) */
  maxCompletedTasks?: number;
  /** Time in ms to retain completed tasks before cleanup (default: 5 minutes) */
  completedTaskRetention?: number;
  /** Maximum consecutive errors before stopping polling (default: 5) */
  maxPollingErrors?: number;
}

/**
 * Callback function type for task completion events
 */
export type TaskCompletionCallback = (task: MeiliTask) => void;

const DEFAULT_OPTIONS: Required<TaskServiceOptions> = {
  pollingInterval: 1000,
  maxCompletedTasks: 50,
  completedTaskRetention: 5 * 60 * 1000, // 5 minutes
  maxPollingErrors: 5,
};

export class TaskService {
  private tasks: Map<number, MeiliTask> = new Map();
  private completedAt: Map<number, number> = new Map(); // Track when tasks completed
  private client: MeiliSearch;
  private pollingIntervals: Map<number, ReturnType<typeof setInterval>> = new Map();
  private options: Required<TaskServiceOptions>;
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private completionCallbacks: Set<TaskCompletionCallback> = new Set();

  constructor(client: MeiliSearch, options: TaskServiceOptions = {}) {
    this.client = client;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Start cleanup interval
    this.startCleanupInterval();
  }

  /**
   * Register a callback to be called when any task completes
   */
  onTaskComplete(callback: TaskCompletionCallback): () => void {
    this.completionCallbacks.add(callback);
    // Return unsubscribe function
    return () => this.completionCallbacks.delete(callback);
  }

  /**
   * Submit a task and start tracking it
   */
  async submitTask<T extends EnqueuedTask>(promise: Promise<T>): Promise<number> {
    try {
      const response = await promise;
      if (response && typeof response.taskUid === 'number') {
        await this.addTask(response.taskUid);
        return response.taskUid;
      }
      throw new Error("Invalid task response: missing taskUid");
    } catch (e) {
      console.error("Task submission failed", e);
      throw e;
    }
  }

  /**
   * Add an existing task to tracking
   */
  async addTask(taskUid: number): Promise<void> {
    // Fetch initial status immediately
    try {
      const task = await this.client.getTask(taskUid);
      this.tasks.set(taskUid, task as MeiliTask);

      // Start polling for this specific task if it's active
      if (["enqueued", "processing"].includes(task.status)) {
        this.startPollingForTask(taskUid);
      } else {
        // Task already completed, record completion time
        this.completedAt.set(taskUid, Date.now());
      }
    } catch (e) {
      console.error(`Failed to fetch initial task ${taskUid}`, e);
      // Add a placeholder so polling picks it up if possible
      this.tasks.set(taskUid, {
        taskUid,
        status: "enqueued",
        type: "unknown",
        enqueuedAt: new Date().toISOString(),
      });
      this.startPollingForTask(taskUid);
    }
  }

  private startPollingForTask(taskUid: number): void {
    // Don't start polling if already polling this task
    if (this.pollingIntervals.has(taskUid)) {
      return;
    }

    let errorCount = 0;
    const intervalId = setInterval(async () => {
      try {
        const task = await this.client.getTask(taskUid);
        const previousStatus = this.tasks.get(taskUid)?.status;
        this.tasks.set(taskUid, task as MeiliTask);

        // Stop polling if task is complete
        if (!["enqueued", "processing"].includes(task.status)) {
          this.stopPollingForTask(taskUid);
          this.completedAt.set(taskUid, Date.now());

          // Notify callbacks if status changed to completed/failed
          if (previousStatus !== task.status) {
            this.notifyCompletion(task as MeiliTask);
          }
        }

        errorCount = 0; // Reset on success
      } catch (e: unknown) {
        errorCount++;
        const error = e as Error & { code?: string };
        console.error(`[TaskService] Error polling task ${taskUid}:`, {
          message: error.message,
          code: error.code,
        });

        // If too many errors, stop polling for this task
        if (errorCount > this.options.maxPollingErrors) {
          this.stopPollingForTask(taskUid);
          console.warn(
            `[TaskService] Stopped polling task ${taskUid} due to consecutive errors.`
          );
        }
      }
    }, this.options.pollingInterval);

    this.pollingIntervals.set(taskUid, intervalId);
  }

  private stopPollingForTask(taskUid: number): void {
    const intervalId = this.pollingIntervals.get(taskUid);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(taskUid);
    }
  }

  private notifyCompletion(task: MeiliTask): void {
    this.completionCallbacks.forEach(callback => {
      try {
        callback(task);
      } catch (e) {
        console.error("[TaskService] Error in completion callback:", e);
      }
    });
  }

  private startCleanupInterval(): void {
    // Run cleanup every minute
    this.cleanupInterval = setInterval(() => {
      this.cleanupCompletedTasks();
    }, 60 * 1000);
  }

  private cleanupCompletedTasks(): void {
    const now = Date.now();
    const tasksToRemove: number[] = [];

    // Find tasks that have been completed for longer than retention period
    this.completedAt.forEach((completedTime, taskUid) => {
      if (now - completedTime > this.options.completedTaskRetention) {
        tasksToRemove.push(taskUid);
      }
    });

    // Remove old completed tasks
    tasksToRemove.forEach(taskUid => {
      this.tasks.delete(taskUid);
      this.completedAt.delete(taskUid);
    });

    // If still over limit, remove oldest completed tasks
    const completedTasks = Array.from(this.completedAt.entries())
      .sort((a, b) => a[1] - b[1]); // Sort by completion time

    while (completedTasks.length > this.options.maxCompletedTasks) {
      const oldest = completedTasks.shift();
      if (oldest) {
        this.tasks.delete(oldest[0]);
        this.completedAt.delete(oldest[0]);
      }
    }
  }

  /**
   * Get a specific task by UID
   */
  getTask(taskUid: number): MeiliTask | undefined {
    return this.tasks.get(taskUid);
  }

  /**
   * Get all tracked tasks, sorted by UID descending (newest first)
   */
  getAllTasks(): MeiliTask[] {
    return Array.from<MeiliTask>(this.tasks.values()).sort(
      (a, b) => b.taskUid - a.taskUid
    );
  }

  /**
   * Get count of active (polling) tasks
   */
  getActiveTaskCount(): number {
    return this.pollingIntervals.size;
  }

  /**
   * Check if a specific task is being polled
   */
  isPolling(taskUid: number): boolean {
    return this.pollingIntervals.has(taskUid);
  }

  /**
   * Manually trigger cleanup of completed tasks
   */
  cleanup(): void {
    this.cleanupCompletedTasks();
  }

  /**
   * Clean up all resources
   */
  destroy(): void {
    // Stop all polling intervals
    this.pollingIntervals.forEach((intervalId) => clearInterval(intervalId));
    this.pollingIntervals.clear();

    // Stop cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    // Clear callbacks
    this.completionCallbacks.clear();
  }
}
