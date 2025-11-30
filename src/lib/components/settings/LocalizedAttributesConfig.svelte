<script lang="ts">
  import { onMount, getContext } from 'svelte';
  import type { MeiliContext } from '../../types/meilisearch';
  import type { Index } from 'meilisearch';

  export let indexUid: string;

  const { client } = getContext<MeiliContext>('meili');
  const index = client.index(indexUid);

  interface LocalizedAttribute {
    attributePattern: string;
    locales: string[];
  }

  let localizedAttributes = $state<LocalizedAttribute[]>([]);
  let loading = $state(false);
  let error = $state<string | null>(null);

  // Form state
  let newAttributePattern = $state('');
  let selectedLocales = $state<string[]>([]);

  const availableLocales = [
    'eng', 'fra', 'deu', 'spa', 'ita', 'por', 'rus', 'jpn', 'kor', 'chi',
    'ara', 'hin', 'heb', 'pol', 'nld', 'swe', 'nor', 'dan', 'fin', 'tur'
  ];

  async function fetchLocalizedAttributes() {
    loading = true;
    error = null;
    try {
      const settings = await (index as any).httpRequest.get(
        `/indexes/${indexUid}/settings/localized-attributes`
      );
      localizedAttributes = settings || [];
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function updateLocalizedAttributes() {
    loading = true;
    error = null;
    try {
      await (index as any).httpRequest.put(
        `/indexes/${indexUid}/settings/localized-attributes`,
        localizedAttributes
      );
      await fetchLocalizedAttributes();
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function addLocalizedAttribute() {
    if (newAttributePattern && selectedLocales.length > 0) {
      localizedAttributes = [...localizedAttributes, {
        attributePattern: newAttributePattern,
        locales: [...selectedLocales]
      }];
      newAttributePattern = '';
      selectedLocales = [];
    }
  }

  function removeLocalizedAttribute(index: number) {
    localizedAttributes = localizedAttributes.filter((_, i) => i !== index);
  }

  function toggleLocale(locale: string) {
    if (selectedLocales.includes(locale)) {
      selectedLocales = selectedLocales.filter(l => l !== locale);
    } else {
      selectedLocales = [...selectedLocales, locale];
    }
  }

  onMount(() => {
    fetchLocalizedAttributes();
  });
</script>

<div class="localized-attributes-config">
  <h3>Localized Attributes Configuration</h3>

  {#if loading}
    <div class="loading">Loading...</div>
  {/if}

  {#if error}
    <div class="error">Error: {error}</div>
  {/if}

  <div class="current-attributes">
    <h4>Current Localized Attributes</h4>
    {#if localizedAttributes.length === 0}
      <p class="empty">No localized attributes configured</p>
    {:else}
      <ul>
        {#each localizedAttributes as attr, i}
          <li>
            <span class="pattern">{attr.attributePattern}</span>
            <span class="locales">
              Locales: {attr.locales.join(', ')}
            </span>
            <button onclick={() => removeLocalizedAttribute(i)} class="remove">
              Remove
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

  <div class="add-attribute">
    <h4>Add Localized Attribute</h4>

    <div class="form-group">
      <label for="pattern">Attribute Pattern:</label>
      <input
        id="pattern"
        type="text"
        bind:value={newAttributePattern}
        placeholder="e.g., title_*, description"
      />
    </div>

    <div class="form-group">
      <label>Select Locales:</label>
      <div class="locale-grid">
        {#each availableLocales as locale}
          <label class="locale-checkbox">
            <input
              type="checkbox"
              checked={selectedLocales.includes(locale)}
              onchange={() => toggleLocale(locale)}
            />
            <span>{locale}</span>
          </label>
        {/each}
      </div>
    </div>

    <button
      onclick={addLocalizedAttribute}
      disabled={!newAttributePattern || selectedLocales.length === 0}
      class="add-btn"
    >
      Add Localized Attribute
    </button>
  </div>

  <div class="actions">
    <button
      onclick={updateLocalizedAttributes}
      disabled={loading}
      class="save-btn"
    >
      Save Changes
    </button>
  </div>
</div>

<style>
  .localized-attributes-config {
    padding: 1rem;
    background: var(--color-surface, #fff);
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  h3, h4 {
    margin-top: 0;
    color: var(--color-text, #333);
  }

  .loading, .error, .empty {
    padding: 1rem;
    border-radius: 4px;
    margin: 0.5rem 0;
  }

  .loading {
    background: var(--color-info-bg, #e3f2fd);
    color: var(--color-info, #1976d2);
  }

  .error {
    background: var(--color-error-bg, #ffebee);
    color: var(--color-error, #c62828);
  }

  .empty {
    color: var(--color-text-muted, #666);
    font-style: italic;
  }

  .current-attributes ul {
    list-style: none;
    padding: 0;
  }

  .current-attributes li {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.5rem;
    margin: 0.5rem 0;
    background: var(--color-surface-variant, #f5f5f5);
    border-radius: 4px;
  }

  .pattern {
    font-family: monospace;
    font-weight: bold;
  }

  .locales {
    flex: 1;
    color: var(--color-text-muted, #666);
  }

  .form-group {
    margin: 1rem 0;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .form-group input[type="text"] {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid var(--color-border, #ddd);
    border-radius: 4px;
  }

  .locale-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 0.5rem;
    padding: 0.5rem;
    border: 1px solid var(--color-border, #ddd);
    border-radius: 4px;
    max-height: 200px;
    overflow-y: auto;
  }

  .locale-checkbox {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    cursor: pointer;
  }

  .locale-checkbox:hover {
    background: var(--color-surface-variant, #f5f5f5);
    border-radius: 2px;
  }

  button {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .remove {
    background: var(--color-error, #c62828);
    color: white;
    padding: 0.25rem 0.5rem;
    font-size: 0.85rem;
  }

  .remove:hover:not(:disabled) {
    background: var(--color-error-dark, #8e0000);
  }

  .add-btn {
    background: var(--color-primary, #1976d2);
    color: white;
    margin-top: 0.5rem;
  }

  .add-btn:hover:not(:disabled) {
    background: var(--color-primary-dark, #004ba0);
  }

  .actions {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid var(--color-border, #ddd);
  }

  .save-btn {
    background: var(--color-success, #4caf50);
    color: white;
  }

  .save-btn:hover:not(:disabled) {
    background: var(--color-success-dark, #2e7d32);
  }
</style>