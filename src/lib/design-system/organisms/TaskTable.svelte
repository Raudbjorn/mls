<script lang="ts">
  import type { MeiliTask } from '../../meili/types/meilisearch';
  import Badge from '../atoms/Badge.svelte';
  import Button from '../atoms/Button.svelte';
  import LoadingSpinner from '../atoms/LoadingSpinner.svelte';
  import EmptyState from '../atoms/EmptyState.svelte';

  export let tasks: MeiliTask[] = [];
  export let loading: boolean = false;
  export let compact: boolean = false;

  function formatDate(dateStr: string) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString();
  }

  function getDuration(task: MeiliTask) {
    if (!task.finishedAt || !task.enqueuedAt) return '-';
    const start = new Date(task.enqueuedAt).getTime();
    const end = new Date(task.finishedAt).getTime();
    return ((end - start) / 1000).toFixed(2) + 's';
  }

  function getStatusVariant(status: string) {
    switch (status) {
      case 'succeeded':
        return 'success';
      case 'failed':
        return 'error';
      case 'processing':
        return 'processing';
      case 'enqueued':
        return 'warning';
      default:
        return 'default';
    }
  }
</script>

<div class="task-table-container" class:compact>
  {#if loading && tasks.length === 0}
    <div class="loading-state">
      <LoadingSpinner centered />
    </div>
  {:else if tasks.length === 0}
    <EmptyState title="No tasks found" message="There are no tasks to display." />
  {:else}
    <div class="table-responsive">
      <table class="task-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Enqueued At</th>
            {#if !compact}
              <th>Finished At</th>
              <th>Details</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each tasks as task (task.taskUid)}
            <tr class="task-row">
              <td class="task-id">#{task.taskUid}</td>
              <td class="task-type">{task.type}</td>
              <td class="task-status">
                <Badge variant={getStatusVariant(task.status)} size="small">
                  {task.status}
                </Badge>
              </td>
              <td class="task-duration">{getDuration(task)}</td>
              <td class="task-date">{formatDate(task.enqueuedAt)}</td>
              {#if !compact}
                <td class="task-date">{formatDate(task.finishedAt)}</td>
                <td class="task-details">
                  {#if task.error}
                    <span class="error-text" title={task.error.message}>
                      {task.error.message}
                    </span>
                  {:else}
                    <span class="details-json">
                      {JSON.stringify(task.details || {})}
                    </span>
                  {/if}
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</div>

<style>
  .task-table-container {
    width: 100%;
    background: white;
    border-radius: 8px;
    border: 1px solid #eee;
    overflow: hidden;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .task-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
    text-align: left;
  }

  th {
    background: #f8f9fa;
    padding: 0.75rem 1rem;
    font-weight: 600;
    color: #495057;
    border-bottom: 2px solid #dee2e6;
    white-space: nowrap;
  }

  td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #eee;
    vertical-align: middle;
  }

  .task-row:last-child td {
    border-bottom: none;
  }

  .task-row:hover {
    background-color: #f8f9fa;
  }

  .task-id {
    font-family: monospace;
    font-weight: 600;
    color: #666;
  }

  .task-type {
    font-weight: 500;
  }

  .task-duration {
    font-family: monospace;
  }

  .task-date {
    color: #666;
    white-space: nowrap;
  }

  .error-text {
    color: #dc3545;
    max-width: 200px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .details-json {
    color: #666;
    font-family: monospace;
    font-size: 0.8em;
    max-width: 200px;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .loading-state {
    padding: 2rem;
    display: flex;
    justify-content: center;
  }

  /* Compact mode adjustments */
  .compact .task-table {
    font-size: 0.8rem;
  }

  .compact td,
  .compact th {
    padding: 0.5rem 0.75rem;
  }
</style>
