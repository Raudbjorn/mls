<script lang="ts">
    // VectorIndexConfig.svelte
    
    // Meilisearch currently supports 'hnsw' type.
    // Structure: { "default": { "type": "hnsw", "hnsw": { "m": 16, "efConstruction": 200 } } }
    
    let { vectorIndexes = $bindable({}) } = $props();

    // Ensure default structure exists if empty
    $effect(() => {
        if (Object.keys(vectorIndexes).length === 0) {
            // We don't necessarily want to force a default if the user hasn't set one,
            // but for the UI we might want to show the 'default' index config.
        }
    });

    // Helper to get or create 'default' index config
    function getHnswConfig() {
        if (!vectorIndexes.default) {
            return { m: 16, efConstruction: 200 };
        }
        return vectorIndexes.default.hnsw || { m: 16, efConstruction: 200 };
    }

    let hnswConfig = $state(getHnswConfig());

    function updateConfig() {
        vectorIndexes = {
            ...vectorIndexes,
            default: {
                type: 'hnsw',
                hnsw: {
                    m: Number(hnswConfig.m),
                    efConstruction: Number(hnswConfig.efConstruction)
                }
            }
        };
    }
</script>

<div class="vector-index-config">
    <h3>Vector Index Settings (HNSW)</h3>
    <p class="hint">Configure the HNSW algorithm for vector search performance vs accuracy.</p>

    <div class="config-form">
        <div class="form-group">
            <label title="Number of bi-directional links created for every new element during construction.">
                M (Connections per node)
            </label>
            <input
                type="number"
                bind:value={hnswConfig.m}
                onchange={updateConfig}
                min="4"
                max="100"
            />
            <p class="hint-small">Higher = better recall, slower indexing. Default: 16</p>
        </div>

        <div class="form-group">
            <label title="Size of the dynamic list for the nearest neighbors (used during construction).">
                efConstruction (Beam size)
            </label>
            <input
                type="number"
                bind:value={hnswConfig.efConstruction}
                onchange={updateConfig}
                min="10"
            />
            <p class="hint-small">Higher = better quality, slower indexing. Default: 200</p>
        </div>
    </div>
</div>

<style>
    .vector-index-config {
        border: 1px solid #e0e0e0;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
    }
    .config-form {
        display: flex;
        gap: 2rem;
    }
    .form-group {
        flex: 1;
    }
    .form-group label {
        display: block;
        font-weight: bold;
        margin-bottom: 4px;
        cursor: help;
    }
    .form-group input {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .hint-small {
        font-size: 0.8em;
        color: #666;
        margin-top: 4px;
    }
</style>
