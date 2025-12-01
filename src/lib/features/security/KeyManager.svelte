<script lang="ts">
    import { getContext, onMount } from 'svelte';
    import type { MeiliContext } from '../../meili/types/meilisearch';
    import type { Key } from 'meilisearch';

    const { client, hasAdminRights } = getContext<MeiliContext>('meili');

    let keys = $state<Key[]>([]);
    let isLoading = $state(true);
    let error = $state<string | null>(null);

    // New Key Form State
    let newKeyDescription = $state('');
    let newKeyIndexes = $state('*'); // Default to all
    let newKeyExpiresAt = $state(''); // ISO date string
    
    // RBAC Permissions
    let permissions = $state({
        search: true,
        documentsAdd: false,
        documentsDelete: false,
        indexesCreate: false,
        indexesUpdate: false,
        indexesDelete: false,
        tasksGet: false,
        settingsGet: false,
        settingsUpdate: false,
        keysCreate: false // Usually restricted
    });

    onMount(async () => {
        await fetchKeys();
    });

    async function fetchKeys() {
        if (!hasAdminRights) {
            isLoading = false;
            return;
        }
        try {
            const response = await client.getKeys();
            keys = response.results;
        } catch (e: any) {
            error = e.message;
        } finally {
            isLoading = false;
        }
    }

    async function createKey() {
        if (!hasAdminRights) return;

        // Construct actions array from permissions object
        const actions = [];
        if (permissions.search) actions.push('search');
        if (permissions.documentsAdd) actions.push('documents.add');
        if (permissions.documentsDelete) actions.push('documents.delete');
        if (permissions.indexesCreate) actions.push('indexes.create');
        if (permissions.indexesUpdate) actions.push('indexes.update');
        if (permissions.indexesDelete) actions.push('indexes.delete');
        if (permissions.tasksGet) actions.push('tasks.get');
        if (permissions.settingsGet) actions.push('settings.get');
        if (permissions.settingsUpdate) actions.push('settings.update');
        if (permissions.keysCreate) actions.push('keys.create');

        const payload = {
            description: newKeyDescription,
            actions,
            indexes: newKeyIndexes.split(',').map(i => i.trim()),
            expiresAt: newKeyExpiresAt ? new Date(newKeyExpiresAt).toISOString() : null
        };

        try {
            await client.createKey(payload);
            await fetchKeys(); // Refresh list
            // Reset form
            newKeyDescription = '';
            newKeyExpiresAt = '';
        } catch (e: any) {
            error = e.message;
        }
    }

    async function deleteKey(uid: string) {
        if (!confirm('Are you sure you want to delete this key?')) return;
        try {
            await client.deleteKey(uid);
            await fetchKeys();
        } catch (e: any) {
            error = e.message;
        }
    }
</script>

<div class="key-manager">
    <h2>API Key Management</h2>

    {#if !hasAdminRights}
        <div class="warning">Admin rights required to manage keys.</div>
    {:else}
        <div class="create-key-section">
            <h3>Create New Key</h3>
            
            <div class="form-row">
                <label>Description</label>
                <input type="text" bind:value={newKeyDescription} placeholder="e.g. Frontend Search Key" />
            </div>

            <div class="form-row">
                <label>Indexes (comma separated)</label>
                <input type="text" bind:value={newKeyIndexes} placeholder="*" />
            </div>

            <div class="form-row">
                <label>Expiration (Optional)</label>
                <input type="datetime-local" bind:value={newKeyExpiresAt} />
            </div>

            <div class="rbac-matrix">
                <h4>Permissions (RBAC)</h4>
                <div class="checkbox-grid">
                    <label><input type="checkbox" bind:checked={permissions.search} /> Search</label>
                    <label><input type="checkbox" bind:checked={permissions.documentsAdd} /> Add Docs</label>
                    <label><input type="checkbox" bind:checked={permissions.documentsDelete} /> Delete Docs</label>
                    <label><input type="checkbox" bind:checked={permissions.indexesCreate} /> Create Index</label>
                    <label><input type="checkbox" bind:checked={permissions.indexesUpdate} /> Update Index</label>
                    <label><input type="checkbox" bind:checked={permissions.indexesDelete} /> Delete Index</label>
                    <label><input type="checkbox" bind:checked={permissions.settingsUpdate} /> Update Settings</label>
                </div>
            </div>

            <button onclick={createKey} class="create-btn">Generate Key</button>
        </div>

        <div class="keys-list">
            <h3>Existing Keys</h3>
            {#if isLoading}
                <p>Loading...</p>
            {:else}
                <table>
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Key Prefix</th>
                            <th>Actions</th>
                            <th>Expires</th>
                            <th>Manage</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each keys as key}
                            <tr>
                                <td>{key.description || 'No description'}</td>
                                <td class="mono">{key.uid.substring(0, 8)}...</td>
                                <td class="actions-cell">
                                    <div class="tags">
                                        {#each key.actions as action}
                                            <span class="tag">{action}</span>
                                        {/each}
                                    </div>
                                </td>
                                <td>{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}</td>
                                <td>
                                    <button onclick={() => deleteKey(key.uid)} class="delete-btn">Revoke</button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            {/if}
        </div>
    {/if}

    {#if error}
        <div class="error">{error}</div>
    {/if}
</div>

<style>
    .key-manager {
        padding: 20px;
    }
    .create-key-section {
        background: #f5f5f5;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 2rem;
    }
    .form-row {
        margin-bottom: 1rem;
    }
    .form-row label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: bold;
    }
    .form-row input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .rbac-matrix {
        margin: 1.5rem 0;
        background: white;
        padding: 1rem;
        border-radius: 4px;
        border: 1px solid #ddd;
    }
    .checkbox-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }
    .create-btn {
        background: #4caf50;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
    }
    .keys-list table {
        width: 100%;
        border-collapse: collapse;
    }
    .keys-list th, .keys-list td {
        text-align: left;
        padding: 12px;
        border-bottom: 1px solid #eee;
    }
    .mono {
        font-family: monospace;
    }
    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }
    .tag {
        background: #e3f2fd;
        font-size: 0.8em;
        padding: 2px 6px;
        border-radius: 4px;
    }
    .delete-btn {
        background: #ff5252;
        color: white;
        border: none;
        padding: 6px 12px;
        border-radius: 4px;
        cursor: pointer;
    }
    .error {
        color: red;
        margin-top: 1rem;
    }
</style>
