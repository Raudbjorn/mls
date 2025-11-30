<script lang="ts">
    // TypoToleranceEditor.svelte
    
    let { typoTolerance = $bindable({}) } = $props();

    // Default structure if undefined
    $effect(() => {
        if (!typoTolerance) {
            typoTolerance = {
                enabled: true,
                minWordSizeForTypos: { oneTypo: 5, twoTypos: 9 },
                disableOnWords: [],
                disableOnAttributes: []
            };
        }
    });

    let newDisabledWord = $state('');
    let newDisabledAttr = $state('');

    function addDisabledWord() {
        if (newDisabledWord && !typoTolerance.disableOnWords.includes(newDisabledWord)) {
            typoTolerance.disableOnWords = [...typoTolerance.disableOnWords, newDisabledWord];
            newDisabledWord = '';
        }
    }

    function removeDisabledWord(word: string) {
        typoTolerance.disableOnWords = typoTolerance.disableOnWords.filter(w => w !== word);
    }

    function addDisabledAttr() {
        if (newDisabledAttr && !typoTolerance.disableOnAttributes.includes(newDisabledAttr)) {
            typoTolerance.disableOnAttributes = [...typoTolerance.disableOnAttributes, newDisabledAttr];
            newDisabledAttr = '';
        }
    }

    function removeDisabledAttr(attr: string) {
        typoTolerance.disableOnAttributes = typoTolerance.disableOnAttributes.filter(a => a !== attr);
    }
</script>

<div class="typo-tolerance-editor">
    <h3>Typo Tolerance</h3>
    <p class="hint">Configure how forgiving the search is with spelling mistakes.</p>

    {#if typoTolerance}
        <div class="setting-row">
            <label>
                <input type="checkbox" bind:checked={typoTolerance.enabled} />
                Enable Typo Tolerance
            </label>
        </div>

        {#if typoTolerance.enabled}
            <div class="subsection">
                <h4>Minimum Word Size</h4>
                <div class="input-group">
                    <label>
                        One Typo:
                        <input type="number" bind:value={typoTolerance.minWordSizeForTypos.oneTypo} min="0" />
                    </label>
                    <label>
                        Two Typos:
                        <input type="number" bind:value={typoTolerance.minWordSizeForTypos.twoTypos} min="0" />
                    </label>
                </div>
            </div>

            <div class="subsection">
                <h4>Disable on Words</h4>
                <p class="hint">Specific words where typos should strictly NOT be corrected (e.g. brand names).</p>
                <div class="tags">
                    {#each typoTolerance.disableOnWords as word}
                        <span class="tag">{word} <button on:click={() => removeDisabledWord(word)}>×</button></span>
                    {/each}
                </div>
                <div class="add-input">
                    <input type="text" bind:value={newDisabledWord} placeholder="Word" />
                    <button on:click={addDisabledWord}>Add</button>
                </div>
            </div>

            <div class="subsection">
                <h4>Disable on Attributes</h4>
                <p class="hint">Attributes where typos should not be corrected (e.g. SKU, serial numbers).</p>
                <div class="tags">
                    {#each typoTolerance.disableOnAttributes as attr}
                        <span class="tag">{attr} <button on:click={() => removeDisabledAttr(attr)}>×</button></span>
                    {/each}
                </div>
                <div class="add-input">
                    <input type="text" bind:value={newDisabledAttr} placeholder="Attribute" />
                    <button on:click={addDisabledAttr}>Add</button>
                </div>
            </div>
        {/if}
    {/if}
</div>

<style>
    .typo-tolerance-editor {
        border: 1px solid #eee;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
    }
    .hint {
        color: #666;
        font-size: 0.9em;
        margin-bottom: 0.5rem;
    }
    .setting-row {
        margin-bottom: 1rem;
    }
    .subsection {
        margin-top: 1rem;
        padding-left: 1rem;
        border-left: 2px solid #eee;
    }
    .input-group {
        display: flex;
        gap: 1rem;
    }
    .input-group label {
        display: flex;
        flex-direction: column;
        font-size: 0.9em;
    }
    .tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
    }
    .tag {
        background: #f0f0f0;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 0.9em;
    }
    .tag button {
        border: none;
        background: none;
        cursor: pointer;
        color: #d32f2f;
        font-weight: bold;
    }
    .add-input {
        display: flex;
        gap: 0.5rem;
    }
</style>
