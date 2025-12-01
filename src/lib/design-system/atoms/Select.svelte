<script lang="ts">
  export let value: string | number = '';
  export let options: Array<{value: string | number, label: string}> = [];
  export let placeholder: string = 'Select an option';
  export let disabled: boolean = false;
  export let error: string | undefined = undefined;
  export let required: boolean = false;
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
</script>

<div class="select-wrapper" class:select-wrapper--error={error}>
  <select
    bind:value
    {disabled}
    {required}
    {name}
    {id}
    class="select"
    class:select--error={error}
    aria-invalid={!!error}
    aria-describedby={error ? `${id}-error` : undefined}
  >
    <option value="" disabled selected hidden>{placeholder}</option>
    {#each options as option}
      <option value={option.value}>
        {option.label}
      </option>
    {/each}
  </select>

  {#if error}
    <span class="select__error" id="{id}-error" role="alert">
      {error}
    </span>
  {/if}
</div>

<style>
  .select-wrapper {
    position: relative;
    display: inline-block;
    width: 100%;
  }

  .select {
    width: 100%;
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #333;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .select:hover:not(:disabled) {
    border-color: #999;
  }

  .select:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  .select:disabled {
    background-color: #e9ecef;
    opacity: 0.6;
    cursor: not-allowed;
  }

  .select--error {
    border-color: #dc3545;
  }

  .select--error:focus {
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  }

  .select__error {
    display: block;
    margin-top: 0.25rem;
    font-size: 0.875rem;
    color: #dc3545;
  }
</style>