<script lang="ts">
    // EmbedderConfig.svelte
    
    let { embedders = $bindable({}) } = $props();

    let newEmbedderName = $state('');
    let selectedSource = $state('openAi');
    
    // Embedder Form State
    let apiKey = $state('');
    let model = $state('');
    let documentTemplate = $state('');
    let dimensions = $state<number | null>(null);

    // Source options
    const sources = ['openAi', 'huggingFace', 'ollama', 'rest', 'userProvided'];

    function addEmbedder() {
        if (!newEmbedderName) return;

        const config: any = { source: selectedSource };

        if (apiKey) config.apiKey = apiKey;
        if (model) config.model = model;
        if (documentTemplate) config.documentTemplate = documentTemplate;
        if (dimensions) config.dimensions = dimensions;

        // Add to embedders object
        embedders = { ...embedders, [newEmbedderName]: config };

        // Reset form
        newEmbedderName = '';
        apiKey = '';
        model = '';
        documentTemplate = '';
        dimensions = null;
    }

    function removeEmbedder(name: string) {
        const { [name]: _, ...rest } = embedders;
        embedders = rest;
    }
</script>

<div class="embedder-config">
    <h3>Embedders (AI / Vector Search)</h3>
    <p class="hint">Configure embedders to enable semantic search.</p>

    <div class="embedders-list">
        {#each Object.entries(embedders) as [name, config]}
            <div class="embedder-item">
                <div class="header">
                    <strong>{name}</strong>
                    <span class="source-tag">{config.source}</span>
                </div>
                <div class="details">
                    {#if config.model}<div>Model: {config.model}</div>{/if}
                    {#if config.documentTemplate}
                        <div class="template-preview" title={config.documentTemplate}>
                            Template: {config.documentTemplate.substring(0, 30)}...
                        </div>
                    {/if}
                </div>
                <button onclick={() => removeEmbedder(name)} class="delete">Remove</button>
            </div>
        {/each}
    </div>

    <div class="add-embedder">
        <h4>Add New Embedder</h4>
        
        <div class="form-group">
            <label>Name (e.g. 'default', 'image')</label>
            <input type="text" bind:value={newEmbedderName} placeholder="Embedder Name" />
        </div>

        <div class="form-group">
            <label>Source</label>
            <select bind:value={selectedSource}>
                {#each sources as source}
                    <option value={source}>{source}</option>
                {/each}
            </select>
        </div>

        {#if selectedSource === 'openAi'}
            <div class="form-group">
                <label>API Key (Optional if env var set)</label>
                <input type="password" bind:value={apiKey} placeholder="sk-..." />
            </div>
            <div class="form-group">
                <label>Model</label>
                <input type="text" bind:value={model} placeholder="text-embedding-3-small" />
            </div>
        {/if}

        {#if selectedSource === 'huggingFace'}
            <div class="form-group">
                <label>Model</label>
                <input type="text" bind:value={model} placeholder="BAAI/bge-base-en-v1.5" />
            </div>
        {/if}
        
        {#if selectedSource === 'userProvided'}
             <div class="form-group">
                <label>Dimensions</label>
                <input type="number" bind:value={dimensions} placeholder="e.g. 1536" />
            </div>
        {/if}

        <div class="form-group">
            <label>Document Template (Optional)</label>
            <textarea 
                bind:value={documentTemplate} 
                placeholder="A document titled '{{doc.title}}'..."
                rows="3"
            ></textarea>
            <p class="hint-small">Liquid template to format document for embedding.</p>
        </div>

        <button onclick={addEmbedder} disabled={!newEmbedderName}>Add Embedder</button>
    </div>
</div>

<style>
    .embedder-config {
        border: 1px solid #e0e0e0;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
    }
    .embedders-list {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
    }
    .embedder-item {
        border: 1px solid #eee;
        padding: 10px;
        border-radius: 4px;
        background: #fafafa;
        position: relative;
    }
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }
    .source-tag {
        background: #e1bee7;
        color: #4a148c;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.8em;
    }
    .details {
        font-size: 0.85em;
        color: #666;
        margin-bottom: 2rem; /* space for delete button */
    }
    .delete {
        position: absolute;
        bottom: 10px;
        right: 10px;
        background: #ffebee;
        color: #c62828;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.8em;
    }
    .add-embedder {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
    }
    .form-group {
        margin-bottom: 1rem;
    }
    .form-group label {
        display: block;
        font-size: 0.9em;
        font-weight: bold;
        margin-bottom: 4px;
    }
    .form-group input, .form-group select, .form-group textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
    }
    .hint-small {
        font-size: 0.8em;
        color: #666;
        margin-top: 2px;
    }
</style>
