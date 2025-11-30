<script lang="ts">
    // RankingRulesEditor.svelte
    
    let { rules = $bindable([]) } = $props();

    let newRule = $state('');

    function addRule() {
        if (newRule && !rules.includes(newRule)) {
            rules = [...rules, newRule];
            newRule = '';
        }
    }

    function removeRule(index: number) {
        rules = rules.filter((_, i) => i !== index);
    }

    function moveRule(index: number, direction: 'up' | 'down') {
        if (direction === 'up' && index > 0) {
            const newRules = [...rules];
            [newRules[index - 1], newRules[index]] = [newRules[index], newRules[index - 1]];
            rules = newRules;
        } else if (direction === 'down' && index < rules.length - 1) {
            const newRules = [...rules];
            [newRules[index + 1], newRules[index]] = [newRules[index], newRules[index + 1]];
            rules = newRules;
        }
    }
</script>

<div class="ranking-rules-editor">
    <h3>Ranking Rules</h3>
    <p class="hint">
        Rules are applied in order. The first rule that breaks the tie determines the order.
        <br>
        <strong>Built-in rules:</strong> words, typo, proximity, attribute, sort, exactness.
        <br>
        <strong>Custom rules:</strong> <code>attribute:asc</code> or <code>attribute:desc</code>.
        <br>
        <em>Warning: Ensure attributes used in custom rules exist in all documents to avoid undefined behavior.</em>
    </p>
    
    <ul class="rules-list">
        {#each rules as rule, i}
            <li class="rule-item">
                <span class="rule-name">{rule}</span>
                <div class="actions">
                    <button on:click={() => moveRule(i, 'up')} disabled={i === 0}>↑</button>
                    <button on:click={() => moveRule(i, 'down')} disabled={i === rules.length - 1}>↓</button>
                    <button on:click={() => removeRule(i)} class="delete">×</button>
                </div>
            </li>
        {/each}
    </ul>

    <div class="add-rule">
        <input 
            type="text" 
            bind:value={newRule} 
            placeholder="attribute:asc or attribute:desc"
        />
        <button on:click={addRule}>Add Rule</button>
    </div>
</div>

<style>
    .ranking-rules-editor {
        border: 1px solid #eee;
        padding: 1rem;
        border-radius: 4px;
    }
    .rules-list {
        list-style: none;
        padding: 0;
    }
    .rule-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.5rem;
        background: #f9f9f9;
        margin-bottom: 0.5rem;
        border: 1px solid #ddd;
    }
    .actions button {
        margin-left: 0.25rem;
        cursor: pointer;
    }
    .add-rule {
        margin-top: 1rem;
        display: flex;
        gap: 0.5rem;
    }
</style>
