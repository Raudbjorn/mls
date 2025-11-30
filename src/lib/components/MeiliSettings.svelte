<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import type { MeiliContext } from '../types/meilisearch';
    import type { TaskService } from '../services/TaskService.svelte.ts';
    import RankingRulesEditor from './settings/RankingRulesEditor.svelte';
    import SynonymManager from './settings/SynonymManager.svelte';
    import FilterAttributeConfig from './settings/FilterAttributeConfig.svelte';
    import TypoToleranceEditor from './settings/TypoToleranceEditor.svelte';
    import SearchDisplayConfig from './settings/SearchDisplayConfig.svelte';
    import EmbedderConfig from './settings/EmbedderConfig.svelte';
    import VectorIndexConfig from './settings/VectorIndexConfig.svelte';

    let { indexUid } = $props();

    const { client, hasAdminRights } = getContext<MeiliContext>('meili');
    const taskService = getContext<TaskService>('taskService');

    // State for settings
    let settings = $state<any>({});
    let isLoading = $state(true);
    let isSaving = $state(false);
    let error = $state<string | null>(null);

    // Fetch settings on mount
    onMount(async () => {
        if (!indexUid) return;
        try {
            settings = await client.index(indexUid).getSettings();
        } catch (e: any) {
            error = e.message;
        } finally {
            isLoading = false;
        }
    });

    async function saveSettings() {
        if (!hasAdminRights) {
            error = "You do not have permission to update settings.";
            return;
        }

        isSaving = true;
        error = null;

        try {
            // Atomic update of all settings
            const task = await client.index(indexUid).updateSettings(settings);
            await taskService.submitTask(Promise.resolve(task));
        } catch (e: any) {
            error = e.message;
        } finally {
            isSaving = false;
        }
    }
</script>

<div class="meili-settings">
    <h2>Index Settings: {indexUid}</h2>

    {#if isLoading}
        <p>Loading settings...</p>
    {:else if error}
        <div class="error-alert">
            {error}
        </div>
    {:else}
        <div class="settings-form">
            <RankingRulesEditor bind:rules={settings.rankingRules} />
            
            <SearchDisplayConfig 
                bind:searchableAttributes={settings.searchableAttributes}
                bind:displayedAttributes={settings.displayedAttributes}
            />

            <FilterAttributeConfig 
                bind:filterableAttributes={settings.filterableAttributes}
                bind:sortableAttributes={settings.sortableAttributes}
            />

            <TypoToleranceEditor bind:typoTolerance={settings.typoTolerance} />

            <SynonymManager bind:synonyms={settings.synonyms} />

            <EmbedderConfig bind:embedders={settings.embedders} />
            
            <VectorIndexConfig bind:vectorIndexes={settings.vectorIndexes} />

            <div class="actions">
                <button 
                    onclick={saveSettings} 
                    disabled={isSaving || !hasAdminRights}
                    class="save-btn"
                >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                {#if !hasAdminRights}
                    <p class="permission-warning">Read-only: Admin key required to save.</p>
                {/if}
            </div>
        </div>
    {/if}
</div>

<style>
    .meili-settings {
        padding: 20px;
        max-width: 800px;
        margin: 0 auto;
    }
    .error-alert {
        background: #ffebee;
        color: #c62828;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 1rem;
    }
    .actions {
        margin-top: 2rem;
        border-top: 1px solid #eee;
        padding-top: 1rem;
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .save-btn {
        background: #2196f3;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 16px;
        cursor: pointer;
    }
    .save-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
    }
    .permission-warning {
        color: #f57c00;
        font-size: 0.9em;
        margin: 0;
    }
</style>
