import { MeiliSearch } from "meilisearch";
import type { MeiliTask } from "../types/meilisearch";

export class TaskService {
  tasks = $state<Map<number, MeiliTask>>(new Map());
  client: MeiliSearch;

  constructor(client: MeiliSearch) {
    this.client = client;

    // Global polling effect
    $effect(() => {
      const activeTaskUids = Array.from<MeiliTask>(this.tasks.values())
        .filter((t) => ["enqueued", "processing"].includes(t.status))
        .map((t) => t.taskUid);

      if (activeTaskUids.length === 0) return;

      // Adaptive polling: 1s if active tasks, 5s otherwise (though effect only runs if active tasks exist)
      // Since we filter for active tasks, we can keep it at 1s, but let's add a backoff if errors occur.
      let errorCount = 0;

      const intervalId = setInterval(async () => {
        // Poll for all active tasks
        try {
          const response = await this.client.getTasks({
            uids: activeTaskUids,
          });

          response.results.forEach((updatedTask: MeiliTask) => {
            this.tasks.set(updatedTask.taskUid, updatedTask);
          });
          errorCount = 0; // Reset on success
        } catch (e: any) {
          errorCount++;
          console.error("[TaskService] Error polling tasks:", {
            message: e.message,
            code: e.code,
          });

          // If too many errors, stop polling for this batch to avoid spamming
          if (errorCount > 5) {
            clearInterval(intervalId);
            console.warn(
              "[TaskService] Stopped polling due to consecutive errors."
            );
          }
        }
      }, 1000); // Poll every second

      return () => clearInterval(intervalId);
    });
  }

  async submitTask(promise: Promise<any>) {
    try {
      const response = await promise;
      if (response && response.taskUid) {
        this.addTask(response.taskUid);
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
    } catch (e) {
      console.error(`Failed to fetch initial task ${taskUid}`, e);
      // Add a placeholder so polling picks it up if possible, or handle error
      this.tasks.set(taskUid, {
        taskUid,
        status: "enqueued",
        type: "unknown",
        enqueuedAt: new Date().toISOString(),
      });
    }
  }

  getTask(taskUid: number) {
    return this.tasks.get(taskUid);
  }

  getAllTasks() {
    return Array.from<MeiliTask>(this.tasks.values()).sort(
      (a, b) => b.taskUid - a.taskUid
    );
  }
}
