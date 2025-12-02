<script lang="ts">
  import { generateUniqueId } from '../utils/accessibility';

  export let value: string = '';
  export let type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search' = 'text';
  export let placeholder: string = '';
  export let label: string | undefined = undefined;
  export let error: string | undefined = undefined;
  export let hint: string | undefined = undefined;
  export let disabled: boolean = false;
  export let readonly: boolean = false;
  export let required: boolean = false;
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let maxLength: number | undefined = undefined;
  export let minLength: number | undefined = undefined;

  // Generate a unique ID if none provided
  const inputId = id || generateUniqueId('textfield');

  let inputElement: HTMLInputElement;

  export function focus() {
    inputElement?.focus();
  }

  export function blur() {
    inputElement?.blur();
  }
</script>

<div class="text-field">
  {#if label}
    <label for={inputId} class="text-field__label">
      {label}
      {#if required}
        <span class="text-field__required">*</span>
      {/if}
    </label>
  {/if}

  <input
    bind:this={inputElement}
    bind:value
    {type}
    {placeholder}
    {disabled}
    {readonly}
    {required}
    {name}
    id={inputId}
    {maxLength}
    {minLength}
    class="text-field__input"
    class:text-field__input--error={error}
    aria-invalid={!!error}
    aria-describedby="{error ? `${inputId}-error` : ''} {hint ? `${inputId}-hint` : ''}".trim()
  />

  {#if error}
    <span class="text-field__error" id="{inputId}-error" role="alert">
      {error}
    </span>
  {/if}

  {#if hint && !error}
    <span class="text-field__hint" id="{inputId}-hint">
      {hint}
    </span>
  {/if}
</div>

<style>
  .text-field {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    width: 100%;
  }

  .text-field__label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #333;
  }

  .text-field__required {
    color: #dc3545;
    margin-left: 0.125rem;
  }

  .text-field__input {
    padding: 0.5rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #333;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  }

  .text-field__input:hover:not(:disabled):not(:read-only) {
    border-color: #999;
  }

  .text-field__input:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  }

  .text-field__input:disabled {
    background-color: #e9ecef;
    opacity: 0.6;
    cursor: not-allowed;
  }

  .text-field__input:read-only {
    background-color: #f8f9fa;
  }

  .text-field__input--error {
    border-color: #dc3545;
  }

  .text-field__input--error:focus {
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
  }

  .text-field__error {
    font-size: 0.875rem;
    color: #dc3545;
    margin-top: 0.125rem;
  }

  .text-field__hint {
    font-size: 0.875rem;
    color: #6c757d;
    margin-top: 0.125rem;
  }
</style>