<script lang="ts">
  import { onDestroy } from 'svelte';
  import Icon from '../atoms/Icon.svelte';

  export let value: string = '';
  export let placeholder: string = 'Search...';
  export let onSearch: ((value: string) => void) | undefined = undefined;
  export let debounce: number = 300;

  let timer: number = 0;

  function handleInput() {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      onSearch?.(value);
    }, debounce);
  }

  // Cleanup timer on component destroy
  onDestroy(() => {
    clearTimeout(timer);
  });
</script>

<div class="search-input">
  <Icon name="search" size="small" />
  <input
    type="search"
    bind:value
    on:input={handleInput}
    {placeholder}
    class="search-input__field"
  />
</div>

<style>
  .search-input {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    transition: border-color 0.15s ease;
  }

  .search-input:focus-within {
    border-color: #007bff;
  }

  .search-input__field {
    flex: 1;
    border: none;
    outline: none;
    font-size: 0.875rem;
  }
</style>
