<script lang="ts">
  export let title: string;
  export let onClose: (() => void) | undefined = undefined;
</script>

<header class="modal-header">
  <h2 class="modal-header__title">{title}</h2>
  {#if onClose}
    <button class="modal-header__close" on:click={onClose} aria-label="Close">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  {/if}
</header>

<style>
  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem;
    border-bottom: 1px solid #e0e0e0;
  }

  .modal-header__title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .modal-header__close {
    padding: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    transition: color 0.15s ease;
  }

  .modal-header__close:hover {
    color: #333;
  }
</style>
