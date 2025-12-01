<script lang="ts">
    import Badge from '../atoms/Badge.svelte';
    import type { MeiliTask } from '$lib/types/meilisearch';

    export let task: MeiliTask;
    export let showDetails = true;

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleString();
    }

    function getStatusVariant(status: string) {
        switch(status) {
            case 'succeeded': return 'success';
            case 'failed': return 'error';
            case 'processing': return 'processing';
            case 'enqueued': return 'info';
            default: return 'default';
        }
    }
</script>

<div class="task-item">
    <div class="task-header">
        <div class="task-main">
            <span class="task-type">{task.type}</span>
            <Badge variant={getStatusVariant(task.status)} size="small">
                {task.status}
            </Badge>
        </div>
        <span class="task-id">#{task.uid}</span>
    </div>

    {#if showDetails}
        <div class="task-meta">
            <span class="task-date">Enqueued: {formatDate(task.enqueuedAt)}</span>
            {#if task.finishedAt}
                <span class="task-duration">
                    Duration: {(new Date(task.finishedAt).getTime() - new Date(task.enqueuedAt).getTime()) / 1000}s
                </span>
            {/if}
        </div>

        {#if task.error}
            <div class="task-error">
                <strong>Error:</strong> {task.error.message}
                {#if task.error.code}
                    <span class="error-code">({task.error.code})</span>
                {/if}
            </div>
        {/if}

        {#if task.details}
            <details class="task-details">
                <summary>Details</summary>
                <pre>{JSON.stringify(task.details, null, 2)}</pre>
            </details>
        {/if}
    {/if}
</div>

<style>
    .task-item {
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 12px;
        background: white;
        margin-bottom: 8px;
    }

    .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
    }

    .task-main {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .task-type {
        font-weight: 500;
        color: #333;
    }

    .task-id {
        color: #666;
        font-size: 0.875rem;
        font-family: monospace;
    }

    .task-meta {
        display: flex;
        gap: 1rem;
        font-size: 0.875rem;
        color: #666;
        margin-bottom: 8px;
    }

    .task-error {
        background: #ffebee;
        color: #c62828;
        padding: 8px;
        border-radius: 4px;
        margin-top: 8px;
        font-size: 0.875rem;
    }

    .error-code {
        font-family: monospace;
        opacity: 0.8;
    }

    .task-details {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #e0e0e0;
    }

    .task-details summary {
        cursor: pointer;
        color: #5c6bc0;
        font-size: 0.875rem;
        font-weight: 500;
    }

    .task-details pre {
        margin-top: 8px;
        padding: 8px;
        background: #f5f5f5;
        border-radius: 4px;
        font-size: 0.75rem;
        overflow-x: auto;
    }
</style>