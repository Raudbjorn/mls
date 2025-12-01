<script lang="ts">
    import { onMount, getContext } from 'svelte';
    import type { MeiliContext, MeiliTask } from '$lib/meili/types/meilisearch';
    import Card from '$lib/design-system/atoms/Card.svelte';
    import Button from '$lib/design-system/atoms/Button.svelte';
    import Badge from '$lib/design-system/atoms/Badge.svelte';
    import ErrorMessage from '$lib/design-system/atoms/ErrorMessage.svelte';
    import EmptyState from '$lib/design-system/atoms/EmptyState.svelte';
    import LoadingSpinner from '$lib/design-system/atoms/LoadingSpinner.svelte';

    const { client, hasAdminRights } = getContext<MeiliContext>('meili');
    const taskService = getContext<any>('taskService');

    let recentBackups = $state<MeiliTask[]>([]);
    let loading = $state(false);
    let error = $state<string | null>(null);

    async function fetchRecentBackups() {
        loading = true;
        try {
            const response = await client.getTasks({
                types: ['dumpCreation', 'snapshotCreation'],
                limit: 10
                // Note: Tasks are sorted by descending uid by default
            });
            recentBackups = response.results;
            error = null;
        } catch (e: unknown) {
            error = e instanceof Error ? e.message : String(e);
        } finally {
            loading = false;
        }
    }

    async function createBackup(type: 'dump' | 'snapshot') {
        const confirmationMessage = type === 'dump'
            ? 'Create a new dump? This may take some time.'
            : 'Create a new snapshot?';

        if (!confirm(confirmationMessage)) return;

        loading = true;
        try {
            const taskPromise = type === 'dump' ? client.createDump() : client.createSnapshot();
            await taskService.submitTask(taskPromise);
            await fetchRecentBackups();
        } catch (e: unknown) {
            error = e instanceof Error ? e.message : String(e);
        } finally {
            loading = false;
        }
    }

    async function createDump() {
        await createBackup('dump');
    }

    async function createSnapshot() {
        await createBackup('snapshot');
    }

    onMount(() => {
        if (hasAdminRights) {
            fetchRecentBackups();
        }
    });

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleString();
    }

    function getStatusVariant(status: string) {
        switch(status) {
            case 'succeeded': return 'success';
            case 'failed': return 'error';
            case 'processing': return 'processing';
            default: return 'info';
        }
    }

    function getTypeColor(type: string) {
        return type === 'dumpCreation' ? '#3949ab' : '#00897b';
    }
</script>

<Card>
    <h3>Data Management (Backups)</h3>
    <p class="hint">Create dumps (portable) or snapshots (quick, local) of your Meilisearch instance.</p>

    {#if !hasAdminRights}
        <div class="warning">Admin rights required to manage backups.</div>
    {:else}
        <div class="actions">
            <Button
                variant="primary"
                on:click={createDump}
                disabled={loading}
            >
                Create Dump
            </Button>
            <Button
                variant="success"
                on:click={createSnapshot}
                disabled={loading}
            >
                Create Snapshot
            </Button>
        </div>

        <ErrorMessage message={error} dismissible={true} />

        <div class="history">
            <h4>Recent Operations</h4>

            {#if loading && recentBackups.length === 0}
                <LoadingSpinner centered={true} />
            {:else if recentBackups.length === 0}
                <EmptyState
                    title="No recent backup operations"
                    message="Your backup history will appear here once you create dumps or snapshots."
                />
            {:else}
                <div class="task-list">
                    {#each recentBackups as task}
                        <div class="task-item">
                            <div class="task-header">
                                <div class="task-info">
                                    <span class="task-type" style="color: {getTypeColor(task.type)}">
                                        {task.type === 'dumpCreation' ? 'Dump' : 'Snapshot'}
                                    </span>
                                    <Badge variant={getStatusVariant(task.status)} size="small">
                                        {task.status}
                                    </Badge>
                                </div>
                                <span class="task-uid">#{task.uid}</span>
                            </div>
                            <div class="task-meta">
                                <span>{formatDate(task.enqueuedAt)}</span>
                                {#if task.finishedAt}
                                    <span class="duration">
                                        {((new Date(task.finishedAt).getTime() - new Date(task.enqueuedAt).getTime()) / 1000).toFixed(1)}s
                                    </span>
                                {/if}
                            </div>
                            {#if task.error}
                                <div class="task-error">{task.error.message}</div>
                            {/if}
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    {/if}
</Card>

<style>
    h3 {
        margin-top: 0;
        color: #333;
    }

    .hint {
        color: #666;
        font-size: 0.9em;
        margin-bottom: 1.5rem;
    }

    .warning {
        background: #fff3e0;
        color: #e65100;
        padding: 1rem;
        border-radius: 4px;
        text-align: center;
    }

    .actions {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
    }

    .history {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #e0e0e0;
    }

    .history h4 {
        margin-bottom: 1rem;
        color: #444;
    }

    .task-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .task-item {
        border: 1px solid #eee;
        padding: 10px;
        border-radius: 4px;
        background: #fafafa;
    }

    .task-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
    }

    .task-info {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .task-type {
        font-weight: bold;
        font-size: 0.9em;
    }

    .task-uid {
        font-family: monospace;
        font-size: 0.875rem;
        color: #666;
    }

    .task-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.8em;
        color: #757575;
    }

    .duration {
        font-family: monospace;
    }

    .task-error {
        margin-top: 4px;
        font-size: 0.85em;
        color: #c62828;
        background: #ffebee;
        padding: 4px 8px;
        border-radius: 2px;
    }
</style>