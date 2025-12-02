<script lang="ts">
  import Toggle from '../atoms/Toggle.svelte';

  export let label: string;
  export let description: string | undefined = undefined;
  export let checked: boolean = false;
  export let disabled: boolean = false;
  export let onChange: ((checked: boolean) => void) | undefined = undefined;
</script>

<div class="toggle-row">
  <div class="toggle-row__content">
    <label class="toggle-row__label">{label}</label>
    {#if description}
      <p class="toggle-row__description">{description}</p>
    {/if}
  </div>
  <Toggle
    {checked}
    {disabled}
    onChange={onChange}
  />
</div>

<style>
  .toggle-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    transition: background-color 0.15s ease;
  }

  .toggle-row:hover {
    background-color: #f8f9fa;
  }

  .toggle-row__content {
    flex: 1;
    margin-right: 1rem;
  }

  .toggle-row__label {
    display: block;
    font-weight: 500;
    color: #333;
    margin-bottom: 0.25rem;
  }

  .toggle-row__description {
    margin: 0;
    font-size: 0.875rem;
    color: #666;
    line-height: 1.4;
  }
</style>