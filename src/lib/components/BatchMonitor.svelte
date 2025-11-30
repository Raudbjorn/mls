<script lang="ts">
    import { onMount, onDestroy, getContext } from 'svelte';
    import type { MeiliContext } from '../types/meilisearch';
    import { createApiClient } from '../utils/api';

    const { client } = getContext<MeiliContext>('meili');
    const api = createApiClient(client);

    let batches = $state<any[]>([]);
    let loading = $state(false);
    let error = $state<string | null>(null);
    let pollInterval: number | null = null;

    async function fetchBatches() {
        try {
            const response = await api.getBatches();
            batches = response.results || [];
            error = null;
        } catch (e: any) {
            error = e.message;
            // Stop polling if endpoint doesn't exist to avoid spamming errors
            if (e.status === 404 && pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
                error = "The /batches endpoint is not available. This feature requires Meilisearch v1.9+ with the 'metrics' experimental feature enabled.";
            } else {
                error = `Failed to fetch batches: ${e.message || 'Unknown error'}`;
            }
        } finally {
            loading = false;
        }
    }

    function startPolling() {
        fetchBatches();
        pollInterval = window.setInterval(fetchBatches, 2000);
    }

    function stopPolling() {
        if (pollInterval) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    onMount(() => {
        loading = true;
        startPolling();
    });

    onDestroy(() => {
        stopPolling();
    });

    function formatDuration(ms: number) {
        if (!ms) return '-';
        return `${(ms / 1000).toFixed(2)}s`;
    }
</script>

<div class="batch-monitor">
    <div class="header">
        <h3>Batch Monitor</h3>
        <div class="controls">
            {#if loading && !batches.length}
                <span>Loading...</span>
            {/if}
            <button on:click={pollInterval ? stopPolling : startPolling}>
                {pollInterval ? 'Pause' : 'Resume'}
            </button>
        </div>
    </div>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    <div class="batches-list">
        {#each batches as batch}
            <div class="batch-item">
                <div class="batch-header">
                    <span class="batch-id">Batch #{batch.uid}</span>
                    <span class="status {batch.status}">{batch.status}</span>
                </div>
                
                <div class="batch-stats">
                    <div class="stat">
                        <span class="label">Type:</span>
                        <span class="value">{batch.type}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Duration:</span>
                        <span class="value">{formatDuration(batch.duration)}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Size:</span>
                        <span class="value">{batch.stats?.totalSize || 0} bytes</span>
                    </div>
                </div>

                {#if batch.stats}
                    <div class="advanced-stats">
                        {#if batch.stats.writeChannelCongestion !== undefined}
                            <div class="stat-row">
                                <span>Write Channel Congestion:</span>
                                <progress value={batch.stats.writeChannelCongestion} max="100"></progress>
                            </div>
                        {/if}
                        {#if batch.stats.embedderRequests}
                             <div class="stat-row">
                                <span>Embedder Requests:</span>
                                <span>{batch.stats.embedderRequests.succeeded} / {batch.stats.embedderRequests.total} (Failed: {batch.stats.embedderRequests.failed})</span>
                            </div>
                        {/if}
                    </div>
                {/if}

                {#if batch.details?.progress}
                    <div class="progress-section">
                        <h4>Progress</h4>
                        <div class="steps">
                            {#each Object.entries(batch.details.progress) as [step, status]}
                                <div class="step">
                                    <span class="step-name">{step}</span>
                                    <span class="step-status">{String(status)}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}
            </div>
        {/each}
        {#if batches.length === 0 && !loading && !error}
            <div class="empty">No active batches found.</div>
        {/if}
    </div>
</div>

<style>
    .batch-monitor {
        border: 1px solid #e0e0e0;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
        background: #fcfcfc;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }
    .error {
        background: #ffebee;
        color: #c62828;
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 1rem;
    }
    .batches-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    .batch-item {
        border: 1px solid #eee;
        padding: 1rem;
        border-radius: 4px;
        background: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    .batch-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-weight: bold;
    }
    .status {
        text-transform: uppercase;
        font-size: 0.8em;
        padding: 2px 6px;
        border-radius: 4px;
    }
    .status.processing { background: #e3f2fd; color: #1565c0; }
    .status.succeeded { background: #e8f5e9; color: #2e7d32; }
    .status.failed { background: #ffebee; color: #c62828; }

    .batch-stats {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1rem;
        font-size: 0.9em;
        color: #555;
    }
    .stat {
        display: flex;
        gap: 0.5rem;
    }
    .label { font-weight: 600; }
    
    .advanced-stats {
        background: #f5f5f5;
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 1rem;
        font-size: 0.9em;
    }
    .stat-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 4px;
    }
    
    .progress-section h4 {
        margin: 0 0 0.5rem 0;
        font-size: 0.9em;
        color: #333;
    }
    .steps {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 0.5rem;
    }
    .step {
        background: #fafafa;
        border: 1px solid #eee;
        padding: 4px 8px;
        border-radius: 2px;
        font-size: 0.85em;
        display: flex;
        justify-content: space-between;
    }
    .empty {
        color: #666;
        font-style: italic;
        text-align: center;
        padding: 2rem;
    }
    button {
        cursor: pointer;
    }
</style>
