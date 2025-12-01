<!--
  Drop-in Search Playground
  Interactive search interface for testing and exploring MeiliSearch

  Usage:
    import { SearchPlayground } from 'mls/golden-paths';

    <SearchPlayground
      host="http://localhost:7700"
      apiKey="your-search-key"
      indexUid="movies"
    />
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import { MeiliSearch } from 'meilisearch';
  import HybridSearchTester from '../features/search/HybridSearchTester.svelte';
  import SearchInput from '../design-system/molecules/SearchInput.svelte';
  import Button from '../design-system/atoms/Button.svelte';
  import Badge from '../design-system/atoms/Badge.svelte';

  interface Props {
    host: string;
    apiKey: string;
    indexUid: string;
    placeholder?: string;
    showAdvanced?: boolean;
    theme?: 'light' | 'dark' | 'auto';
    displayMode?: 'simple' | 'json' | 'cards';
    searchOnType?: boolean;
    debounceMs?: number;
  }

  let {
    host,
    apiKey,
    indexUid,
    placeholder = 'Search...',
    showAdvanced = true,
    theme = 'auto',
    displayMode = 'cards',
    searchOnType = true,
    debounceMs = 300
  }: Props = $props();

  const client = new MeiliSearch({ host, apiKey });
  setContext('meili', { client });

  let query = $state('');
  let results = $state<any[]>([]);
  let searchTime = $state(0);
  let totalHits = $state(0);
  let isSearching = $state(false);
  let showAdvancedPanel = $state(false);
  let timer: number | null = null;

  async function performSearch() {
    if (!query.trim() && !showAdvancedPanel) return;

    isSearching = true;
    try {
      const response = await client.index(indexUid).search(query, {
        limit: 20,
        showMatchesPosition: true,
        attributesToHighlight: ['*']
      });

      results = response.hits;
      searchTime = response.processingTimeMs;
      totalHits = response.estimatedTotalHits || response.hits.length;
    } catch (error) {
      console.error('Search error:', error);
      results = [];
    } finally {
      isSearching = false;
    }
  }

  function handleSearchInput(value: string) {
    query = value;
    if (searchOnType) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(performSearch, debounceMs);
    }
  }

  function renderHighlightedField(value: any): string {
    if (typeof value === 'string') {
      return value.replace(/<em>/g, '<mark>').replace(/<\/em>/g, '</mark>');
    }
    return String(value);
  }

  $effect(() => {
    return () => {
      if (timer) clearTimeout(timer);
    };
  });
</script>

<div class="search-playground" data-theme={theme}>
  <div class="search-header">
    <h2>Search Playground</h2>
    <Badge type="info">{indexUid}</Badge>
  </div>

  <div class="search-bar">
    <SearchInput
      value={query}
      {placeholder}
      onInput={handleSearchInput}
      onSubmit={performSearch}
    />
    {#if !searchOnType}
      <Button onClick={performSearch} disabled={isSearching}>
        Search
      </Button>
    {/if}
    {#if showAdvanced}
      <Button
        variant="secondary"
        onClick={() => showAdvancedPanel = !showAdvancedPanel}
      >
        {showAdvancedPanel ? 'Hide' : 'Show'} Advanced
      </Button>
    {/if}
  </div>

  {#if showAdvancedPanel}
    <div class="advanced-panel">
      <HybridSearchTester {indexUid} />
    </div>
  {/if}

  <div class="search-meta">
    {#if isSearching}
      <span class="loading">Searching...</span>
    {:else if results.length > 0}
      <span>Found {totalHits} results in {searchTime}ms</span>
    {:else if query}
      <span>No results found</span>
    {/if}
  </div>

  <div class="results" class:results-{displayMode}>
    {#if displayMode === 'cards'}
      <div class="cards-grid">
        {#each results as hit}
          <div class="result-card">
            <div class="card-header">
              <strong>{hit.id || hit._id || 'Result'}</strong>
              {#if hit._rankingScore}
                <Badge type="success">Score: {hit._rankingScore.toFixed(3)}</Badge>
              {/if}
            </div>
            <div class="card-body">
              {#each Object.entries(hit) as [key, value]}
                {#if !key.startsWith('_') && value !== null && value !== undefined}
                  <div class="field">
                    <span class="field-key">{key}:</span>
                    {#if hit._formatted?.[key]}
                      <span class="field-value highlighted">
                        {@html renderHighlightedField(hit._formatted[key])}
                      </span>
                    {:else}
                      <span class="field-value">
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </span>
                    {/if}
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/each}
      </div>
    {:else if displayMode === 'json'}
      <pre class="json-view">{JSON.stringify(results, null, 2)}</pre>
    {:else}
      <div class="simple-list">
        {#each results as hit}
          <div class="simple-item">
            {hit.id || hit._id || hit.title || hit.name || 'Result'}
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .search-playground {
    width: 100%;
    min-height: 100vh;
    padding: 2rem;
    box-sizing: border-box;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .search-playground[data-theme="dark"] {
    background: #1a1a1a;
    color: #e0e0e0;
  }

  .search-playground[data-theme="light"] {
    background: #f8f9fa;
    color: #212121;
  }

  .search-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .search-header h2 {
    margin: 0;
  }

  .search-bar {
    display: flex;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .search-bar :global(.search-input) {
    flex: 1;
  }

  .advanced-panel {
    margin: 1rem 0;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.05);
    border-radius: 8px;
  }

  .search-meta {
    margin: 1rem 0;
    font-size: 0.9rem;
    color: #666;
  }

  .search-playground[data-theme="dark"] .search-meta {
    color: #999;
  }

  .loading {
    color: #1976d2;
  }

  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }

  .result-card {
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1rem;
    transition: box-shadow 0.2s;
  }

  .search-playground[data-theme="dark"] .result-card {
    background: #2a2a2a;
    border-color: #444;
  }

  .result-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #f0f0f0;
  }

  .search-playground[data-theme="dark"] .card-header {
    border-bottom-color: #444;
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .field {
    display: flex;
    gap: 0.5rem;
  }

  .field-key {
    font-weight: 600;
    color: #666;
    min-width: fit-content;
  }

  .field-value {
    flex: 1;
    word-break: break-word;
  }

  .field-value.highlighted :global(mark) {
    background: #ffeb3b;
    padding: 2px 4px;
    border-radius: 2px;
  }

  .json-view {
    background: #1e1e1e;
    color: #d4d4d4;
    padding: 1rem;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Cascadia Code', 'Fira Code', monospace;
    font-size: 0.9rem;
  }

  .simple-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .simple-item {
    padding: 0.75rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
  }

  .search-playground[data-theme="dark"] .simple-item {
    background: #2a2a2a;
    border-color: #444;
  }
</style>