<script lang="ts">
    import { onMount, getContext } from 'svelte';
    import type { MeiliContext } from '../../meili/types/meilisearch';
    import type { Network } from '../../meili/types/meilisearch';
    import { createApiClient } from '../../meili/utils/api';

    const { client } = getContext<MeiliContext>('meili');
    const api = createApiClient(client);

    let network = $state<Network | null>(null);
    let loading = $state(false);
    let error = $state<string | null>(null);

    // Form state
    let newRemoteUrl = $state('');
    let newRemoteKey = $state('');
    let newRemoteName = $state('');

    async function fetchNetworkConfig() {
        loading = true;
        error = null;
        try {
            // Endpoint: GET /network
            // Note: This is an experimental endpoint.
            const response = await api.getNetwork();
            network = response;
        } catch (e: any) {
            error = e.message;
            // Fallback structure if endpoint fails or is empty
            if (!network) {
                network = { self: 'unknown', remotes: [] };
            }
        } finally {
            loading = false;
        }
    }

    async function addRemote() {
        if (!newRemoteUrl || !newRemoteKey || !newRemoteName) return;
        loading = true;
        error = null;

        try {
            // Validate URL
            try {
                new URL(newRemoteUrl);
            } catch {
                throw new Error('Invalid URL format');
            }

            // Validate API Key (improved check: min 32 chars, alphanumeric + - _)
            if (newRemoteKey.length < 32 || !/^[A-Za-z0-9_-]+$/.test(newRemoteKey)) {
                throw new Error('API Key must be at least 32 characters and contain only letters, numbers, "-", or "_"');
            }

            // Construct new remote object
            const newRemote = {
                url: newRemoteUrl,
                searchApiKey: newRemoteKey,
                name: newRemoteName
            };

            // Current remotes
            const currentRemotes = network?.remotes || [];
            
            // Payload: { remotes: [...] }
            // We likely need to send the full list of remotes to update it, 
            // or there might be a specific add endpoint. Assuming PATCH /network with full list for now
            // based on common Meili patterns for settings.
            const payload = {
                remotes: [...currentRemotes, newRemote]
            };

            await api.updateNetwork(payload);
            
            // Reset form
            newRemoteUrl = '';
            newRemoteKey = '';
            newRemoteName = '';
            
            await fetchNetworkConfig();
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    async function removeRemote(name: string) {
        if (!confirm(`Remove remote "${name}"?`)) return;
        loading = true;
        error = null;
        try {
            const currentRemotes = network?.remotes || [];
            const updatedRemotes = currentRemotes.filter((r: any) => r.name !== name);

            const payload = {
                remotes: updatedRemotes
            };

            await api.updateNetwork(payload);
            await fetchNetworkConfig();
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        fetchNetworkConfig();
    });
</script>

<div class="network-config">
    <h3>Multi-Search Federation (Network)</h3>
    <p class="hint">Configure remote Meilisearch instances for federated search.</p>

    {#if error}
        <div class="error">
            <strong>Error:</strong> {error}
            <br>
            <small>Ensure Meilisearch is running with network features enabled.</small>
        </div>
    {/if}

    {#if network}
        <div class="section">
            <h4>Self Identity</h4>
            <div class="info-box">
                <strong>URL/ID:</strong> {network.self || 'Local Instance'}
            </div>
        </div>

        <div class="section">
            <h4>Remotes</h4>
            <div class="remotes-list">
                {#each (network.remotes || []) as remote}
                    <div class="remote-item">
                        <div class="remote-header">
                            <strong>{remote.name}</strong>
                            <span class="url">{remote.url}</span>
                        </div>
                        <div class="remote-key">
                            Key: {remote.searchApiKey ? '••••••••' : 'None'}
                        </div>
                        <button class="delete-btn" onclick={() => removeRemote(remote.name)} disabled={loading}>
                            Remove
                        </button>
                    </div>
                {/each}
                {#if (!network.remotes || network.remotes.length === 0)}
                    <div class="empty">No remote instances configured.</div>
                {/if}
            </div>
        </div>
    {/if}

    <div class="add-remote">
        <h4>Add Remote Instance</h4>
        
        <div class="form-group">
            <label for="remote-name">Name (Alias)</label>
            <input id="remote-name" type="text" bind:value={newRemoteName} placeholder="e.g. eu-cluster" />
        </div>

        <div class="form-group">
            <label for="remote-url">URL</label>
            <input id="remote-url" type="url" bind:value={newRemoteUrl} placeholder="https://eu.meilisearch.com" />
        </div>

        <div class="form-group">
            <label for="remote-key">Search API Key</label>
            <input id="remote-key" type="password" bind:value={newRemoteKey} placeholder="Search API Key" />
        </div>

        <button onclick={addRemote} disabled={loading || !newRemoteUrl || !newRemoteName}>
            {loading ? 'Updating...' : 'Add Remote'}
        </button>
    </div>
</div>

<style>
    .network-config {
        border: 1px solid #e0e0e0;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
    }
    .hint {
        color: #666;
        font-size: 0.9em;
        margin-bottom: 1rem;
    }
    .error {
        background: #ffebee;
        color: #c62828;
        padding: 8px;
        border-radius: 4px;
        margin-bottom: 1rem;
    }
    .section {
        margin-bottom: 1.5rem;
    }
    .info-box {
        background: #e3f2fd;
        padding: 8px;
        border-radius: 4px;
        color: #0d47a1;
    }
    .remotes-list {
        display: grid;
        gap: 1rem;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    }
    .remote-item {
        border: 1px solid #eee;
        padding: 1rem;
        border-radius: 4px;
        background: #fafafa;
        position: relative;
    }
    .remote-header {
        display: flex;
        flex-direction: column;
        margin-bottom: 0.5rem;
    }
    .url {
        font-size: 0.85em;
        color: #666;
    }
    .remote-key {
        font-size: 0.85em;
        color: #888;
        margin-bottom: 1rem;
    }
    .delete-btn {
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ffebee;
        color: #c62828;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8em;
    }
    .add-remote {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
    }
    .form-group {
        margin-bottom: 1rem;
    }
    .form-group label {
        display: block;
        font-weight: bold;
        margin-bottom: 4px;
        font-size: 0.9em;
    }
    .form-group input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .empty {
        color: #666;
        font-style: italic;
    }
</style>
