<script lang="ts">
  export let variant: 'default' | 'primary' | 'success' | 'warning' | 'danger' = 'default';
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let removable: boolean = false;
  export let onRemove: (() => void) | undefined = undefined;
</script>

<span
  class="tag tag--{variant} tag--{size}"
  class:tag--removable={removable}
>
  <slot />

  {#if removable}
    <button
      class="tag__remove"
      on:click={onRemove}
      aria-label="Remove tag"
      type="button"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      >
        <line x1="3" y1="3" x2="9" y2="9"/>
        <line x1="9" y1="3" x2="3" y2="9"/>
      </svg>
    </button>
  {/if}
</span>

<style>
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    font-weight: 500;
    border-radius: 4px;
    transition: background-color 0.15s ease;
  }

  /* Size variants */
  .tag--small {
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
  }

  .tag--medium {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }

  .tag--large {
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
  }

  /* Color variants */
  .tag--default {
    background-color: #e9ecef;
    color: #495057;
  }

  .tag--primary {
    background-color: #cfe2ff;
    color: #084298;
  }

  .tag--success {
    background-color: #d1e7dd;
    color: #0f5132;
  }

  .tag--warning {
    background-color: #fff3cd;
    color: #664d03;
  }

  .tag--danger {
    background-color: #f8d7da;
    color: #842029;
  }

  /* Remove button */
  .tag__remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    margin-left: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.15s ease;
  }

  .tag__remove:hover,
  .tag__remove:focus-visible {
    opacity: 1;
  }

  .tag__remove:focus-visible {
    outline: 2px solid var(--mls-primary-500, #2196f3);
    outline-offset: 1px;
    border-radius: 2px;
  }

  .tag--removable {
    padding-right: 0.375rem;
  }
</style>