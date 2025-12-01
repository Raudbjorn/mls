<script lang="ts">
    import { getContext } from 'svelte';
    import type { MeiliContext } from '../../meili/types/meilisearch';

    const { client } = getContext<MeiliContext>('meili');

    let { indexUid } = $props();

    let query = $state('');
    let semanticRatio = $state(0.5);
    let rankingScoreThreshold = $state<number | null>(null);
    let embedder = $state('default');
    let filter = $state('');
    let facetsInput = $state('');

    let results = $state<Record<string, any>[]>([]);
    let facetDistribution = $state<Record<string, Record<string, number>> | null>(null);
    let searchTime = $state(0);
    let isSearching = $state(false);
    let error = $state<string | null>(null);
    let timer: number | null = null;

    // Cleanup timer on component unmount
    $effect(() => {
        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    });

    async function search() {
        if (!indexUid) return;
        isSearching = true;
        error = null;
        facetDistribution = null;

        try {
            const searchParams: any = {
                hybrid: {
                    semanticRatio: semanticRatio,
                    embedder: embedder
                },
                showRankingScore: true
            };

            if (rankingScoreThreshold !== null) {
                searchParams.rankingScoreThreshold = rankingScoreThreshold;
            }

            if (filter.trim()) {
                searchParams.filter = filter.trim();
            }

            if (facetsInput.trim()) {
                searchParams.facets = facetsInput.split(',').map(f => f.trim()).filter(f => f);
            }

            const response = await client.index(indexUid).search(query, searchParams);
            results = response.hits;
            facetDistribution = response.facetDistribution;
            searchTime = response.processingTimeMs;
        } catch (e: any) {
            error = e.message;
            results = [];
        } finally {
            isSearching = false;
        }
    }
</script>

<div class="hybrid-search-tester">
    <h3>Hybrid Search Tester</h3>
    
    <div class="search-controls">
        <div class="input-row">
            <input
                type="text"
                bind:value={query}
                placeholder="Search query..."
                oninput={() => {
                    // Debounce search
                    if (timer) clearTimeout(timer);
                    timer = setTimeout(search, 300);
                }}
                class="search-input"
            />
            <button onclick={search} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Search'}
            </button>
        </div>

        <div class="params-row">
            <div class="param-group">
                <label>Semantic Ratio: {semanticRatio}</label>
                <input 
                    type="range" 
                    bind:value={semanticRatio} 
                    min="0" 
                    max="1" 
                    step="0.1" 
                />
                <div class="ratio-labels">
                    <span>Keyword (0.0)</span>
                    <span>Semantic (1.0)</span>
                </div>
            </div>

            <div class="param-group">
                <label>Ranking Score Threshold</label>
                <input
                    type="number"
                    bind:value={rankingScoreThreshold}
                    min="0"
                    max="1"
                    step="0.1"
                    placeholder="Optional (0.0 - 1.0)"
                />
            </div>

            <div class="param-group">
                <label>Embedder</label>
                <input type="text" bind:value={embedder} placeholder="default" />
            </div>

            <div class="param-group full-width">
                <label>Filter (e.g. "genres = 'Horror'")</label>
                <input type="text" bind:value={filter} placeholder="Filter expression" />
            </div>

            <div class="param-group full-width">
                <label>Facets (comma-separated, e.g. "genres, director")</label>
                <input type="text" bind:value={facetsInput} placeholder="Attributes to facet" />
            </div>
        </div>
    </div>

    {#if error}
        <div class="error">{error}</div>
    {/if}

    <div class="results-area">
        <div class="meta">
            Found {results.length} hits in {searchTime}ms
        </div>
        
        {#if facetDistribution}
            <div class="facets-display">
                <h4>Facet Distribution</h4>
                <div class="facets-grid">
                    {#each Object.entries(facetDistribution) as [facet, values]}
                        <div class="facet-column">
                            <strong>{facet}</strong>
                            <ul>
                                {#each Object.entries(values) as [val, count]}
                                    <li>{val}: {count}</li>
                                {/each}
                            </ul>
                        </div>
                    {/each}
                </div>
            </div>
        {/if}

        <div class="hits">
            {#each results as hit}
                <div class="hit">
                    <div class="hit-header">
                        <strong>{hit.id}</strong>
                        <span class="score">Score: {hit._rankingScore}</span>
                    </div>
                    <pre>{JSON.stringify(hit, null, 2)}</pre>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .hybrid-search-tester {
        border: 1px solid #ddd;
        padding: 1rem;
        border-radius: 8px;
        background: #f8f9fa;
        margin-top: 2rem;
    }
    .search-controls {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin-bottom: 1rem;
    }
    .input-row {
        display: flex;
        gap: 0.5rem;
    }
    .search-input {
        flex: 1;
        padding: 8px;
        font-size: 1.1em;
    }
    .params-row {
        display: flex;
        gap: 2rem;
        flex-wrap: wrap;
    }
    .param-group {
        display: flex;
        flex-direction: column;
        min-width: 200px;
        flex: 1;
    }
    .param-group.full-width {
        flex-basis: 100%;
    }
    .ratio-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.8em;
        color: #666;
    }
    .results-area {
        border-top: 1px solid #eee;
        padding-top: 1rem;
    }
    .meta {
        font-size: 0.9em;
        color: #666;
        margin-bottom: 1rem;
    }
    .facets-display {
        background: white;
        padding: 1rem;
        border-radius: 4px;
        border: 1px solid #eee;
        margin-bottom: 1rem;
    }
    .facets-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 1rem;
    }
    .facet-column ul {
        list-style: none;
        padding: 0;
        margin: 0;
        font-size: 0.9em;
    }
    .hit {
        background: white;
        border: 1px solid #eee;
        padding: 10px;
        margin-bottom: 10px;
        border-radius: 4px;
    }
    .hit-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
        border-bottom: 1px solid #f0f0f0;
        padding-bottom: 5px;
    }
    .score {
        background: #e3f2fd;
        color: #1565c0;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
    }
    pre {
        margin: 0;
        font-size: 0.85em;
        overflow-x: auto;
    }
    .error {
        color: red;
        margin-bottom: 1rem;
    }
</style>
