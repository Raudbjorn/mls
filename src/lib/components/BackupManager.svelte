<script lang="ts">
    import { onMount, getContext } from 'svelte';
    import type { MeiliContext } from '../types/meilisearch';

    const { client, hasAdminRights } = getContext<MeiliContext>('meili');

    let recentBackups = $state<any[]>([]);
    let loading = $state(false);
    let error = $state<string | null>(null);

    async function fetchRecentBackups() {
        loading = true;
        try {
            const response = await client.getTasks({
                types: ['dumpCreation', 'snapshotCreation'],
                limit: 10,
                desc: true
            });
            recentBackups = response.results;
            error = null;
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    async function createDump() {
        if (!confirm('Create a new dump? This may take some time.')) return;
        loading = true;
        try {
            await client.createDump();
            // Wait a bit for task to be enqueued
            setTimeout(fetchRecentBackups, 500);
        } catch (e: any) {
            error = e.message;
            loading = false;
        }
    }

    async function createSnapshot() {
        if (!confirm('Create a new snapshot?')) return;
        loading = true;
        try {
            await client.createSnapshot();
            setTimeout(fetchRecentBackups, 500);
        } catch (e: any) {
            error = e.message;
            loading = false;
        }
    }

    onMount(() => {
        if (hasAdminRights) {
            fetchRecentBackups();
        }
    });

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleString();
    }
</script>

<div class="backup-manager">
    <h3>Data Management (Backups)</h3>
    <p class="hint">Create dumps (portable) or snapshots (quick, local) of your Meilisearch instance.</p>

    {#if !hasAdminRights}
        <div class="warning">Admin rights required to manage backups.</div>
    {:else}
        <div class="actions">
            <button class="action-btn dump" on:click={createDump} disabled={loading}>
                Create Dump
            </button>
            <button class="action-btn snapshot" on:click={createSnapshot} disabled={loading}>
                Create Snapshot
            </button>
        </div>

        {#if error}
            <div class="error">{error}</div>
        {/if}

        <div class="history">
            <h4>Recent Operations</h4>
            {#if loading && recentBackups.length === 0}
                <div class="loading">Loading history...</div>
            {/if}
            
            <div class="task-list">
                {#each recentBackups as task}
                    <div class="task-item">
                        <div class="task-header">
                            <span class="type {task.type}">{task.type === 'dumpCreation' ? 'Dump' : 'Snapshot'}</span>
                            <span class="status {task.status}">{task.status}</span>
                        </div>
                        <div class="task-meta">
                            <span>ID: {task.uid}</span>
                            <span>{formatDate(task.enqueuedAt)}</span>
                        </div>
                        {#if task.error}
                            <div class="task-error">{task.error.message}</div>
                        {/if}
                    </div>
                {/each}
                {#if recentBackups.length === 0 && !loading}
                    <div class="empty">No recent backup operations found.</div>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .backup-manager {
        border: 1px solid #e0e0e0;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
        background: #fff;
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
    .action-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        color: white;
        transition: opacity 0.2s;
    }
    .action-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
    .action-btn.dump {
        background-color: #5c6bc0;
    }
    .action-btn.snapshot {
        background-color: #26a69a;
    }
    .error {
        background: #ffebee;
        color: #c62828;
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 1rem;
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
        margin-bottom: 4px;
    }
    .type {
        font-weight: bold;
        font-size: 0.9em;
    }
    .type.dumpCreation { color: #3949ab; }
    .type.snapshotCreation { color: #00897b; }
    
    .status {
        font-size: 0.8em;
        text-transform: uppercase;
        padding: 2px 6px;
        border-radius: 2px;
    }
    .status.succeeded { background: #e8f5e9; color: #2e7d32; }
    .status.processing { background: #e3f2fd; color: #1565c0; }
    .status.failed { background: #ffebee; color: #c62828; }
    
    .task-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.8em;
        color: #757575;
    }
    .task-error {
        margin-top: 4px;
        font-size: 0.85em;
        color: #c62828;
    }
    .empty {
        color: #999;
        font-style: italic;
        text-align: center;
        padding: 1rem;
    }
    .loading {
        color: #666;
        text-align: center;
        padding: 1rem;
    }
</style>
