<script module lang="ts">
  import type { Meta } from '@storybook/svelte';
  import SearchInput from './SearchInput.svelte';

  export const meta: Meta<SearchInput> = {
    title: 'Design System/Molecules/SearchInput',
    component: SearchInput,
    tags: ['autodocs'],
    argTypes: {
      value: {
        control: 'text'
      },
      placeholder: {
        control: 'text'
      },
      disabled: {
        control: 'boolean'
      },
      loading: {
        control: 'boolean'
      },
      size: {
        control: { type: 'select' },
        options: ['small', 'medium', 'large']
      },
      clearable: {
        control: 'boolean'
      },
      showIcon: {
        control: 'boolean'
      },
      onInput: { action: 'input' },
      onSubmit: { action: 'submit' },
      onClear: { action: 'clear' }
    }
  };
</script>

<script lang="ts">
  import { Story } from '@storybook/addon-svelte-csf';

  let searchValue = $state('');
  let recentSearches = $state<string[]>([]);
</script>

<Story name="Default">
  <SearchInput
    placeholder="Search..."
    onInput={(val) => console.log('Input:', val)}
    onSubmit={(val) => alert(`Searching for: ${val}`)}
  />
</Story>

<Story name="With Value" args={{ value: 'meilisearch' }}>
  <SearchInput {...args} />
</Story>

<Story name="Loading State" args={{ loading: true, value: 'searching...' }}>
  <SearchInput {...args} />
</Story>

<Story name="Disabled State" args={{ disabled: true, placeholder: 'Search disabled' }}>
  <SearchInput {...args} />
</Story>

<Story name="Sizes">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <SearchInput size="small" placeholder="Small search..." />
    <SearchInput size="medium" placeholder="Medium search..." />
    <SearchInput size="large" placeholder="Large search..." />
  </div>
</Story>

<Story name="Clearable">
  <SearchInput
    value="Clear me"
    clearable={true}
    onClear={() => console.log('Cleared!')}
  />
</Story>

<Story name="Without Icon">
  <SearchInput
    placeholder="No search icon..."
    showIcon={false}
  />
</Story>

<Story name="Interactive Example">
  <div style="display: flex; flex-direction: column; gap: 1rem;">
    <SearchInput
      bind:value={searchValue}
      placeholder="Try searching..."
      clearable={true}
      onSubmit={(val) => {
        if (val.trim()) {
          recentSearches = [val, ...recentSearches.slice(0, 4)];
        }
      }}
    />

    {#if searchValue}
      <p style="color: #666;">Current search: "{searchValue}"</p>
    {/if}

    {#if recentSearches.length > 0}
      <div>
        <p style="color: #666; margin-bottom: 0.5rem;">Recent searches:</p>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          {#each recentSearches as search}
            <button
              style="padding: 0.25rem 0.5rem; background: #f0f0f0; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;"
              onclick={() => searchValue = search}
            >
              {search}
            </button>
          {/each}
        </div>
      </div>
    {/if}
  </div>
</Story>

<Story name="Custom Styling">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; border-radius: 8px;">
    <SearchInput
      placeholder="Search in style..."
      style="--search-bg: white; --search-border: rgba(255, 255, 255, 0.3); --search-text: #333;"
    />
  </div>
</Story>