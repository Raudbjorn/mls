<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import type { MeiliContext } from '../../meili/types/meilisearch';

    const { client, hasAdminRights } = getContext<MeiliContext>('meili');

    let features = $state<Record<string, boolean>>({});
    let isLoading = $state(true);
    let error = $state<string | null>(null);

    onMount(async () => {
        await fetchFeatures();
    });

    async function fetchFeatures() {
        if (!hasAdminRights) {
            isLoading = false;
            return;
        }
        try {
            // Note: The experimental features endpoint returns a dictionary of feature: boolean
            features = await client.getExperimentalFeatures();
        } catch (e: any) {
            error = e.message;
        } finally {
            isLoading = false;
        }
    }

    async function toggleFeature(feature: string, currentValue: boolean) {
        if (!hasAdminRights) return;

        try {
            const payload = { [feature]: !currentValue };
            features = await client.updateExperimentalFeatures(payload);
        } catch (e: any) {
            error = e.message;
            // Revert optimistic update if we did one, or just re-fetch
            await fetchFeatures();
        }
    }
</script>

<div class="experimental-features">
    <h3>Experimental Features</h3>
    <div class="alert-warning">
        Warning: These features are experimental and may be unstable or change in future versions.
    </div>

    {#if !hasAdminRights}
        <p>Admin rights required to configure experimental features.</p>
    {:else if isLoading}
        <p>Loading...</p>
    {:else}
        <div class="features-list">
            {#each Object.entries(features) as [feature, enabled]}
                <div class="feature-item">
                    <span class="feature-name">{feature}</span>
                    <label class="switch">
                        <input
                            type="checkbox"
                            checked={enabled}
                            onchange={() => toggleFeature(feature, enabled)}
                        />
                        <span class="slider round"></span>
                    </label>
                </div>
            {/each}
            {#if Object.keys(features).length === 0}
                <p>No experimental features available to toggle.</p>
            {/if}
        </div>
    {/if}

    {#if error}
        <div class="error">{error}</div>
    {/if}
</div>

<style>
    .experimental-features {
        border: 1px solid #ffcc80;
        background: #fff3e0;
        padding: 1rem;
        border-radius: 8px;
        margin-top: 2rem;
    }
    .alert-warning {
        color: #e65100;
        font-weight: bold;
        margin-bottom: 1rem;
    }
    .feature-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem 0;
        border-bottom: 1px solid #ffe0b2;
    }
    .feature-name {
        font-family: monospace;
        font-size: 1.1em;
    }
    
    /* Toggle Switch Styles */
    .switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 24px;
    }
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: .4s;
    }
    .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 4px;
        bottom: 4px;
        background-color: white;
        transition: .4s;
    }
    input:checked + .slider {
        background-color: #ff9800;
    }
    input:checked + .slider:before {
        transform: translateX(16px);
    }
    .slider.round {
        border-radius: 34px;
    }
    .slider.round:before {
        border-radius: 50%;
    }
    .error {
        color: red;
        margin-top: 1rem;
    }
</style>
