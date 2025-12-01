<script lang="ts">
    import { getContext } from 'svelte';
    import type { MeiliContext } from '../../meili/types/meilisearch';
    import type { TaskService } from '../../meili/services/TaskService';

    const { client, hasAdminRights } = getContext<MeiliContext>('meili');
    const taskService = getContext<TaskService>('taskService');

    let indexA = $state('');
    let indexB = $state('');
    let isSwapping = $state(false);
    let error = $state<string | null>(null);

    async function swapIndexes() {
        if (!indexA || !indexB) {
            error = "Both index UIDs are required.";
            return;
        }
        if (!hasAdminRights) {
            error = "Admin rights required for swapping indexes.";
            return;
        }

        isSwapping = true;
        error = null;

        try {
            await taskService.submitTask(client.swapIndexes([{ indexes: [indexA, indexB] }]));
            // Reset inputs on success (task is queued)
            indexA = '';
            indexB = '';
        } catch (e: any) {
            error = e.message;
        } finally {
            isSwapping = false;
        }
    }
</script>

<div class="index-swapper">
    <h3>Zero-Downtime Index Swap</h3>
    <p class="description">
        Atomically swap two indexes. Useful for deploying new index versions without downtime.
    </p>

    <div class="swap-form">
        <div class="input-group">
            <label for="indexA">Index A (Current)</label>
            <input type="text" id="indexA" bind:value={indexA} placeholder="e.g. movies_v1" />
        </div>

        <div class="swap-icon">⇄</div>

        <div class="input-group">
            <label for="indexB">Index B (New)</label>
            <input type="text" id="indexB" bind:value={indexB} placeholder="e.g. movies_v2" />
        </div>
    </div>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    <button
        onclick={swapIndexes}
        disabled={isSwapping || !hasAdminRights || !indexA || !indexB}
        class="swap-btn"
    >
        {isSwapping ? 'Swapping...' : 'Swap Indexes'}
    </button>
</div>

<style>
    .index-swapper {
        border: 1px solid #ddd;
        padding: 1.5rem;
        border-radius: 8px;
        background: #fcfcfc;
        max-width: 600px;
    }
    .description {
        color: #666;
        font-size: 0.9em;
        margin-bottom: 1.5rem;
    }
    .swap-form {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    .input-group {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .input-group label {
        font-size: 0.85em;
        font-weight: bold;
    }
    .input-group input {
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .swap-icon {
        font-size: 1.5rem;
        color: #888;
        padding-top: 1rem;
    }
    .swap-btn {
        width: 100%;
        padding: 10px;
        background: #673ab7;
        color: white;
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
    }
    .swap-btn:disabled {
        background: #d1c4e9;
        cursor: not-allowed;
    }
    .error {
        color: red;
        margin-bottom: 1rem;
        font-size: 0.9em;
    }
</style>
