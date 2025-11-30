<script lang="ts">
    import { getContext } from 'svelte';
    import type { TaskService } from '../services/TaskService.svelte.ts';

    const taskService = getContext<TaskService>('taskService');
    
    // Derived state for active tasks
    let activeTasks = $derived(
        taskService.getAllTasks().filter(t => ['enqueued', 'processing'].includes(t.status))
    );

    let recentFailures = $derived(
        taskService.getAllTasks().filter(t => t.status === 'failed').slice(0, 3)
    );
</script>

<div class="task-watcher">
    {#if activeTasks.length > 0}
        <div class="active-tasks">
            <h3>Active Tasks ({activeTasks.length})</h3>
            <ul>
                {#each activeTasks as task (task.taskUid)}
                    <li class="task-item processing">
                        <span class="id">#{task.taskUid}</span>
                        <span class="type">{task.type}</span>
                        <span class="status">{task.status}</span>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}

    {#if recentFailures.length > 0}
        <div class="failed-tasks">
            <h3>Recent Failures</h3>
            <ul>
                {#each recentFailures as task (task.taskUid)}
                    <li class="task-item failed">
                        <span class="id">#{task.taskUid}</span>
                        <span class="type">{task.type}</span>
                        <span class="error">{task.error?.message}</span>
                    </li>
                {/each}
            </ul>
        </div>
    {/if}
</div>

<style>
    .task-watcher {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 300px;
        z-index: 1000;
        font-family: sans-serif;
    }
    
    .active-tasks, .failed-tasks {
        background: white;
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 10px;
        margin-top: 10px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    h3 {
        margin: 0 0 10px 0;
        font-size: 14px;
        font-weight: 600;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    .task-item {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        padding: 4px 0;
        border-bottom: 1px solid #eee;
    }

    .task-item:last-child {
        border-bottom: none;
    }

    .failed .error {
        color: red;
        max-width: 150px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    
    .processing .status {
        color: blue;
    }
</style>
