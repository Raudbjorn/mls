<script lang="ts">
    // FilterAttributeConfig.svelte
    
    let { 
        filterableAttributes = $bindable([]), 
        sortableAttributes = $bindable([]) 
    } = $props();

    let newFilterable = $state('');
    let newSortable = $state('');

    function addFilterable() {
        if (newFilterable && !filterableAttributes.includes(newFilterable)) {
            filterableAttributes = [...filterableAttributes, newFilterable];
            newFilterable = '';
        }
    }

    function removeFilterable(attr: string) {
        filterableAttributes = filterableAttributes.filter(a => a !== attr);
    }

    function addSortable() {
        if (newSortable && !sortableAttributes.includes(newSortable)) {
            sortableAttributes = [...sortableAttributes, newSortable];
            newSortable = '';
        }
    }

    function removeSortable(attr: string) {
        sortableAttributes = sortableAttributes.filter(a => a !== attr);
    }
</script>

<div class="attribute-config">
    <div class="section">
        <h3>Filterable Attributes</h3>
        <p class="hint">Attributes that can be used in the `filter` query parameter.</p>
        <div class="tags">
            {#each filterableAttributes as attr}
                <span class="tag">
                    {attr} 
                    <button onclick={() => removeFilterable(attr)}>×</button>
                </span>
            {/each}
        </div>
        <div class="add-input">
            <input type="text" bind:value={newFilterable} placeholder="Attribute name" />
            <button onclick={addFilterable}>Add</button>
        </div>
    </div>

    <div class="section">
        <h3>Sortable Attributes</h3>
        <p class="hint">Attributes that can be used in the `sort` query parameter.</p>
        <div class="tags">
            {#each sortableAttributes as attr}
                <span class="tag">
                    {attr} 
                    <button onclick={() => removeSortable(attr)}>×</button>
                </span>
            {/each}
        </div>
        <div class="add-input">
            <input type="text" bind:value={newSortable} placeholder="Attribute name" />
            <button onclick={addSortable}>Add</button>
        </div>
    </div>
</div>

<style>
    .attribute-config {
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
    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    .tag {
        background: #e0f7fa;
        padding: 4px 8px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        gap: 4px;
    }
    .tag button {
        background: none;
        border: none;
        cursor: pointer;
        font-weight: bold;
        color: #006064;
    }
    .add-input {
        display: flex;
        gap: 0.5rem;
    }
</style>
