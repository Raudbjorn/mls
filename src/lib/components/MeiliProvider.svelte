<script lang="ts">
    import { setContext } from 'svelte';
    import { MeiliSearch } from 'meilisearch';
    import { TaskService } from '../services/TaskService';
    import type { MeiliContext } from '../types/meilisearch';

    let { host, apiKey, children } = $props();

    // Initialize client
    const client = new MeiliSearch({ host, apiKey });
    
    // Initialize TaskService
    const taskService = new TaskService(client);

    // Reactive permission check (simplified for now)
    let hasAdminRights = $state(false);
    let error = $state<string | null>(null);

    $effect(() => {
        // Simple check: try to list keys. If it fails with 403, we don't have admin rights.
        // Note: This is a heuristic.
        client.getKeys()
            .then(() => { 
                hasAdminRights = true; 
                error = null;
            })
            .catch((e) => { 
                hasAdminRights = false;
                if (e.code === 'missing_authorization_header' || e.code === 'invalid_api_key') {
                    // Expected for non-admin or invalid key
                    console.warn('Admin rights check failed:', e.message);
                } else {
                    error = `Connection error: ${e.message}`;
                    console.error('MeiliSearch connection error:', e);
                }
            });
    });

    // Provide context
    setContext<MeiliContext>('meili', {
        get client() { return client; },
        get hasAdminRights() { return hasAdminRights; },
        get host() { return host; }
    });

    setContext('taskService', taskService);
</script>

{@render children()}
