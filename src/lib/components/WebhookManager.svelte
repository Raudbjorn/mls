<script lang="ts">
    import { onMount, getContext } from 'svelte';
    import type { MeiliContext } from '../types/meilisearch';

    const { client } = getContext<MeiliContext>('meili');

    let webhooks = $state<any[]>([]);
    let loading = $state(false);
    let error = $state<string | null>(null);

    // Form state
    let newUrl = $state('');
    let newEvents = $state<string[]>([]);
    let newHeaders = $state(''); // JSON string for simplicity or key-value pair UI

    const availableEvents = [
        'documents.added',
        'documents.updated',
        'documents.deleted',
        'tasks.created',
        'tasks.enqueued',
        'tasks.processing',
        'tasks.succeeded',
        'tasks.failed',
        'tasks.canceled',
        'indexes.created',
        'indexes.updated',
        'indexes.deleted',
        'indexes.swapped'
    ];

    async function fetchWebhooks() {
        loading = true;
        error = null;
        try {
            // Using httpRequest as specific webhook methods might vary by SDK version
            // Endpoint: GET /webhooks
            const response = await (client as any).httpRequest.get('/webhooks');
            webhooks = response.results || [];
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    async function createWebhook() {
        if (!newUrl) return;
        loading = true;
        error = null;

            // Validate URL
            try {
                new URL(newUrl);
            } catch {
                throw new Error('Invalid URL format');
            }

            let parsedHeaders = {};
            if (newHeaders) {
                try {
                    parsedHeaders = JSON.parse(newHeaders);
                } catch (e) {
                    throw new Error('Invalid JSON for headers');
                }
            }

            const payload = {
                url: newUrl,
                events: newEvents.length > 0 ? newEvents : undefined,
                headers: parsedHeaders
            };

            // Endpoint: POST /webhooks
            await (client as any).httpRequest.post('/webhooks', payload);
            
            // Reset form
            newUrl = '';
            newEvents = [];
            newHeaders = '';
            
            await fetchWebhooks();
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    async function deleteWebhook(id: string) {
        if (!confirm('Are you sure you want to delete this webhook?')) return;
        loading = true;
        error = null;
        try {
            // Endpoint: DELETE /webhooks/{id}
            await (client as any).httpRequest.delete(`/webhooks/${id}`);
            await fetchWebhooks();
        } catch (e: any) {
            error = e.message;
        } finally {
            loading = false;
        }
    }

    function toggleEvent(event: string) {
        if (newEvents.includes(event)) {
            newEvents = newEvents.filter(e => e !== event);
        } else {
            newEvents = [...newEvents, event];
        }
    }

    onMount(() => {
        fetchWebhooks();
    });
</script>

<div class="webhook-manager">
    <h3>Webhooks</h3>
    <p class="hint">Trigger external URLs on Meilisearch events.</p>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    <div class="webhook-list">
        {#each webhooks as webhook}
            <div class="webhook-item">
                <div class="webhook-header">
                    <strong>{webhook.url}</strong>
                    <span class="id">ID: {webhook.id}</span>
                </div>
                <div class="webhook-details">
                    <div><strong>Events:</strong> {webhook.events ? webhook.events.join(', ') : 'All'}</div>
                    {#if webhook.headers && Object.keys(webhook.headers).length > 0}
                        <div><strong>Headers:</strong> {JSON.stringify(webhook.headers)}</div>
                    {/if}
                </div>
                <button class="delete-btn" onclick={() => deleteWebhook(webhook.id)} disabled={loading}>
                    Delete
                </button>
            </div>
        {/each}
        {#if webhooks.length === 0 && !loading}
            <div class="empty">No webhooks configured.</div>
        {/if}
    </div>

    <div class="add-webhook">
        <h4>Add Webhook</h4>
        
        <div class="form-group">
            <label>URL</label>
            <input type="url" bind:value={newUrl} placeholder="https://api.example.com/webhook" />
        </div>

        <div class="form-group">
            <label>Events (Select none for all)</label>
            <div class="events-grid">
                {#each availableEvents as event}
                    <label class="checkbox-label">
                        <input 
                            type="checkbox" 
                            checked={newEvents.includes(event)} 
                            onchange={() => toggleEvent(event)}
                        />
                        {event}
                    </label>
                {/each}
            </div>
        </div>

        <div class="form-group">
            <label>Headers (JSON)</label>
            <textarea 
                bind:value={newHeaders} 
                placeholder='{"Authorization": "Bearer token"}'
                rows="3"
            ></textarea>
        </div>

        <button onclick={createWebhook} disabled={loading || !newUrl}>
            {loading ? 'Processing...' : 'Create Webhook'}
        </button>
    </div>
</div>

<style>
    .webhook-manager {
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
    .webhook-list {
        margin-bottom: 2rem;
    }
    .webhook-item {
        border: 1px solid #eee;
        padding: 1rem;
        border-radius: 4px;
        margin-bottom: 0.5rem;
        background: #fafafa;
        position: relative;
    }
    .webhook-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
    }
    .id {
        font-size: 0.8em;
        color: #999;
    }
    .webhook-details {
        font-size: 0.9em;
        color: #555;
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
    .add-webhook {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
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
    .form-group input, .form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .events-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 0.5rem;
    }
    .checkbox-label {
        font-weight: normal !important;
        display: flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
    }
    .empty {
        color: #666;
        font-style: italic;
    }
</style>
