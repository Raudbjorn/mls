<!--
  QuickStart Component
  The absolute simplest way to get started with MeiliSearch UI

  Usage:
    import { QuickStart } from 'mls/golden-paths';

    <QuickStart
      host="http://localhost:7700"
      apiKey="your-key"
    />

  This gives you:
  - Automatic index detection
  - Search across all indexes
  - Admin interface if master key detected
  - Health monitoring
-->
<script lang="ts">
  import { onMount } from 'svelte';
  import { MeiliSearch } from 'meilisearch';
  import AdminConsole from './AdminConsole.svelte';
  import SearchPlayground from './SearchPlayground.svelte';
  import Spinner from '../design-system/atoms/Spinner.svelte';

  interface Props {
    host: string;
    apiKey: string;
    mode?: 'auto' | 'admin' | 'search';
  }

  let { host, apiKey, mode = 'auto' }: Props = $props();

  let detectedMode = $state<'admin' | 'search' | null>(null);
  let indexes = $state<string[]>([]);
  let selectedIndex = $state<string>('');
  let loading = $state(true);
  let error = $state<string | null>(null);

  const client = new MeiliSearch({ host, apiKey });

  async function detectCapabilities() {
    loading = true;
    error = null;

    try {
      // Try to fetch indexes - this will tell us if we have read access
      const indexList = await client.getIndexes();
      indexes = indexList.results.map(idx => idx.uid);

      if (indexes.length > 0) {
        selectedIndex = indexes[0];
      }

      // Try to fetch keys - this will only work with master key
      try {
        await client.getKeys();
        detectedMode = 'admin';
      } catch {
        // Not a master key, fallback to search mode
        detectedMode = 'search';
      }

      if (mode !== 'auto') {
        detectedMode = mode;
      }
    } catch (e: any) {
      error = `Connection failed: ${e.message}`;
      detectedMode = null;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    detectCapabilities();
  });
</script>

<div class="quickstart">
  {#if loading}
    <div class="loading-state">
      <Spinner size="large" />
      <p>Connecting to MeiliSearch...</p>
    </div>
  {:else if error}
    <div class="error-state">
      <h2>Connection Error</h2>
      <p>{error}</p>
      <div class="error-help">
        <h3>Quick fixes:</h3>
        <ul>
          <li>Ensure MeiliSearch is running at <code>{host}</code></li>
          <li>Check your API key is valid</li>
          <li>Verify CORS is configured if running in browser</li>
        </ul>
      </div>
    </div>
  {:else if detectedMode === 'admin'}
    <AdminConsole {host} {apiKey} />
  {:else if detectedMode === 'search' && selectedIndex}
    <div class="search-mode">
      {#if indexes.length > 1}
        <div class="index-selector">
          <label>
            Select Index:
            <select bind:value={selectedIndex}>
              {#each indexes as idx}
                <option value={idx}>{idx}</option>
              {/each}
            </select>
          </label>
        </div>
      {/if}
      <SearchPlayground {host} {apiKey} indexUid={selectedIndex} />
    </div>
  {:else}
    <div class="empty-state">
      <h2>No Indexes Found</h2>
      <p>Create an index first, then reload this page.</p>
      <pre>
        <code>
{`// Using curl:
curl -X POST '${host}/indexes' \\
  -H 'Authorization: Bearer ${apiKey}' \\
  -H 'Content-Type: application/json' \\
  --data-binary '{"uid": "movies", "primaryKey": "id"}'

// Or using the SDK:
await client.createIndex('movies', { primaryKey: 'id' });`}
        </code>
      </pre>
    </div>
  {/if}
</div>

<style>
  .quickstart {
    width: 100%;
    min-height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .loading-state,
  .error-state,
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    padding: 2rem;
    text-align: center;
  }

  .loading-state p {
    margin-top: 1rem;
    color: #666;
  }

  .error-state {
    background: #ffebee;
    color: #c62828;
  }

  .error-help {
    margin-top: 2rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    text-align: left;
    max-width: 500px;
  }

  .error-help h3 {
    margin-top: 0;
    font-size: 1rem;
  }

  .error-help ul {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }

  .error-help code {
    background: #f5f5f5;
    padding: 2px 4px;
    border-radius: 3px;
    font-family: monospace;
  }

  .search-mode {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .index-selector {
    padding: 1rem;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
  }

  .index-selector label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .index-selector select {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }

  .empty-state pre {
    margin-top: 2rem;
    padding: 1rem;
    background: #1e1e1e;
    color: #d4d4d4;
    border-radius: 8px;
    text-align: left;
    max-width: 600px;
    overflow-x: auto;
  }

  .empty-state code {
    font-family: 'Cascadia Code', 'Fira Code', monospace;
    font-size: 0.9rem;
  }
</style>