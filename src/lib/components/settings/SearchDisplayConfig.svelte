<script lang="ts">
    // SearchDisplayConfig.svelte
    
    let { 
        searchableAttributes = $bindable(['*']), 
        displayedAttributes = $bindable(['*']) 
    } = $props();

    let newSearchable = $state('');
    let newDisplayed = $state('');

    // Searchable Attributes Logic (Ordered)
    function addSearchable() {
        if (newSearchable && !searchableAttributes.includes(newSearchable)) {
            // If '*' is present, it usually means "all". If adding specific ones, user might want to remove '*' or keep it at the end.
            // For simplicity, we just append.
            searchableAttributes = [...searchableAttributes, newSearchable];
            newSearchable = '';
        }
    }

    function removeSearchable(index: number) {
        searchableAttributes = searchableAttributes.filter((_, i) => i !== index);
    }

    function moveSearchable(index: number, direction: 'up' | 'down') {
        if (direction === 'up' && index > 0) {
            const newAttrs = [...searchableAttributes];
            [newAttrs[index - 1], newAttrs[index]] = [newAttrs[index], newAttrs[index - 1]];
            searchableAttributes = newAttrs;
        } else if (direction === 'down' && index < searchableAttributes.length - 1) {
            const newAttrs = [...searchableAttributes];
            [newAttrs[index + 1], newAttrs[index]] = [newAttrs[index], newAttrs[index + 1]];
            searchableAttributes = newAttrs;
        }
    }

    function resetSearchable() {
        searchableAttributes = ['*'];
    }

    // Displayed Attributes Logic (Set)
    function addDisplayed() {
        if (newDisplayed && !displayedAttributes.includes(newDisplayed)) {
            displayedAttributes = [...displayedAttributes, newDisplayed];
            newDisplayed = '';
        }
    }

    function removeDisplayed(attr: string) {
        displayedAttributes = displayedAttributes.filter(a => a !== attr);
    }

    function resetDisplayed() {
        displayedAttributes = ['*'];
    }
</script>

<div class="search-display-config">
    <div class="section">
        <h3>Searchable Attributes</h3>
        <p class="hint">
            Defines which fields are searched. <strong>Order matters!</strong> 
            Fields listed first are considered more important for ranking.
            Default is <code>['*']</code> (all fields).
        </p>
        
        <ul class="attr-list">
            {#each searchableAttributes as attr, i}
                <li class="attr-item">
                    <span class="name">{attr}</span>
                    <div class="actions">
                        <button onclick={() => moveSearchable(i, 'up')} disabled={i === 0}>↑</button>
                        <button onclick={() => moveSearchable(i, 'down')} disabled={i === searchableAttributes.length - 1}>↓</button>
                        <button onclick={() => removeSearchable(i)} class="delete">×</button>
                    </div>
                </li>
            {/each}
        </ul>
        
        <div class="controls">
            <div class="add-input">
                <input type="text" bind:value={newSearchable} placeholder="Attribute name" />
                <button onclick={addSearchable}>Add</button>
            </div>
            <button onclick={resetSearchable} class="reset-btn">Reset to All ('*')</button>
        </div>
    </div>

    <div class="section">
        <h3>Displayed Attributes</h3>
        <p class="hint">
            Defines which fields are returned in the search results. 
            Useful for reducing payload size. Default is <code>['*']</code>.
        </p>

        <div class="tags">
            {#each displayedAttributes as attr}
                <span class="tag">{attr} <button onclick={() => removeDisplayed(attr)}>×</button></span>
            {/each}
        </div>

        <div class="controls">
            <div class="add-input">
                <input type="text" bind:value={newDisplayed} placeholder="Attribute name" />
                <button onclick={addDisplayed}>Add</button>
            </div>
            <button onclick={resetDisplayed} class="reset-btn">Reset to All ('*')</button>
        </div>
    </div>
</div>

<style>
    .search-display-config {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-top: 1rem;
    }
    .section {
        border: 1px solid #eee;
        padding: 1rem;
        border-radius: 4px;
    }
    .hint {
        color: #666;
        font-size: 0.9em;
        margin-bottom: 1rem;
    }
    .attr-list {
        list-style: none;
        padding: 0;
        margin-bottom: 1rem;
    }
    .attr-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 4px 8px;
        background: #f9f9f9;
        margin-bottom: 4px;
        border: 1px solid #eee;
    }
    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    .tag {
        background: #e8eaf6;
        padding: 4px 8px;
        border-radius: 16px;
        font-size: 0.9em;
    }
    .tag button {
        border: none;
        background: none;
        cursor: pointer;
        color: #3f51b5;
        font-weight: bold;
        margin-left: 4px;
    }
    .controls {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    .add-input {
        display: flex;
        gap: 0.5rem;
    }
    .reset-btn {
        background: none;
        border: 1px dashed #999;
        color: #666;
        cursor: pointer;
        padding: 4px;
        font-size: 0.8em;
    }
</style>
