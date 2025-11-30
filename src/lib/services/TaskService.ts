import { MeiliSearch } from "meilisearch";
import type { MeiliTask } from "../types/meilisearch";

export class TaskService {
  private tasks: Map<number, MeiliTask> = new Map();
  private client: MeiliSearch;
  private pollingIntervals: Map<number, NodeJS.Timeout> = new Map();

  constructor(client: MeiliSearch) {
    this.client = client;
  }

  async submitTask(promise: Promise<any>) {
    try {
      const response = await promise;
      if (response && response.taskUid) {
        await this.addTask(response.taskUid);
        return response.taskUid;
      }
    } catch (e) {
      console.error("Task submission failed", e);
      throw e;
    }
  }

  async addTask(taskUid: number) {
    // Fetch initial status immediately
    try {
      const task = await this.client.getTask(taskUid);
      this.tasks.set(taskUid, task as MeiliTask);

      // Start polling for this specific task if it's active
      if (["enqueued", "processing"].includes(task.status)) {
        this.startPollingForTask(taskUid);
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

  private startPollingForTask(taskUid: number) {
    // Don't start polling if already polling this task
    if (this.pollingIntervals.has(taskUid)) {
      return;
    }

    let errorCount = 0;
    const intervalId = setInterval(async () => {
      try {
        const task = await this.client.getTask(taskUid);
        this.tasks.set(taskUid, task as MeiliTask);

        // Stop polling if task is complete
        if (!["enqueued", "processing"].includes(task.status)) {
          this.stopPollingForTask(taskUid);
        }

        errorCount = 0; // Reset on success
      } catch (e: any) {
        errorCount++;
        console.error(`[TaskService] Error polling task ${taskUid}:`, {
          message: e.message,
          code: e.code,
        });

        // If too many errors, stop polling for this task
        if (errorCount > 5) {
          this.stopPollingForTask(taskUid);
          console.warn(
            `[TaskService] Stopped polling task ${taskUid} due to consecutive errors.`
          );
        }
      }
    }, 1000); // Poll every second

    this.pollingIntervals.set(taskUid, intervalId);
  }

  private stopPollingForTask(taskUid: number) {
    const intervalId = this.pollingIntervals.get(taskUid);
    if (intervalId) {
      clearInterval(intervalId);
      this.pollingIntervals.delete(taskUid);
    }
  }

  getTask(taskUid: number): MeiliTask | undefined {
    return this.tasks.get(taskUid);
  }

  getAllTasks(): MeiliTask[] {
    return Array.from<MeiliTask>(this.tasks.values()).sort(
      (a, b) => b.taskUid - a.taskUid
    );
  }

  // Clean up all polling intervals
  destroy() {
    this.pollingIntervals.forEach((intervalId) => clearInterval(intervalId));
    this.pollingIntervals.clear();
  }
}