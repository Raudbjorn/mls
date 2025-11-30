<script lang="ts">
    // SynonymManager.svelte
    
    // Synonyms are a dictionary: { "term": ["synonym1", "synonym2"] }
    let { synonyms = $bindable({}) } = $props();

    let newTerm = $state('');
    let newSynonymsInput = $state('');

    function addSynonym() {
        if (newTerm && newSynonymsInput) {
            const synonymList = newSynonymsInput.split(',').map(s => s.trim()).filter(s => s);
            // Create a new object to trigger reactivity if needed, though $bindable should handle it
            synonyms = { ...synonyms, [newTerm]: synonymList };
            newTerm = '';
            newSynonymsInput = '';
        }
    }

    function removeTerm(term: string) {
        const { [term]: _, ...rest } = synonyms;
        synonyms = rest;
    }
</script>

<div class="synonym-manager">
    <h3>Synonyms</h3>
    
    <div class="synonyms-list">
        {#each Object.entries(synonyms) as [term, list]}
            <div class="synonym-item">
                <div class="term"><strong>{term}</strong></div>
                <div class="list">
                    {#each list as syn}
                        <span class="syn-tag">{syn}</span>
                    {/each}
                </div>
                <button onclick={() => removeTerm(term)} class="delete">Remove</button>
            </div>
        {/each}
    </div>

    <div class="add-synonym">
        <input 
            type="text" 
            bind:value={newTerm} 
            placeholder="Term (e.g. 'phone')"
        />
        <input 
            type="text" 
            bind:value={newSynonymsInput} 
            placeholder="Synonyms (comma separated, e.g. 'iphone, android')"
        />
        <button onclick={addSynonym}>Add</button>
    </div>
</div>

<style>
    .synonym-manager {
        border: 1px solid #eee;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
    }
    .synonym-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem;
        border-bottom: 1px solid #eee;
    }
    .syn-tag {
        background: #e0e0e0;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
        margin-right: 4px;
    }
    .add-synonym {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
    }
</style>
