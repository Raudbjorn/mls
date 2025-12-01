<script lang="ts">
  import Button from '../atoms/Button.svelte';

  export let isOpen: boolean = false;
  export let title: string = 'Confirm Action';
  export let message: string = 'Are you sure you want to proceed?';
  export let confirmText: string = 'Confirm';
  export let cancelText: string = 'Cancel';
  export let danger: boolean = false;
  export let onConfirm: (() => void | Promise<void>) | undefined = undefined;
  export let onCancel: (() => void) | undefined = undefined;

  let isConfirming = false;

  async function handleConfirm() {
    if (onConfirm) {
      isConfirming = true;
      try {
        await onConfirm();
      } finally {
        isConfirming = false;
        isOpen = false;
      }
    }
  }

  function handleCancel() {
    onCancel?.();
    isOpen = false;
  }

  function handleBackdropClick() {
    if (!isConfirming) {
      handleCancel();
    }
  }

  function handleEscape(event: KeyboardEvent) {
    if (event.key === 'Escape' && !isConfirming) {
      handleCancel();
    }
  }
</script>

{#if isOpen}
  <div class="dialog-backdrop" on:click={handleBackdropClick} on:keydown={handleEscape}>
    <div class="dialog" on:click|stopPropagation role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <h2 id="dialog-title" class="dialog__title">{title}</h2>

      <p class="dialog__message">{message}</p>

      <div class="dialog__actions">
        <Button
          variant="secondary"
          onClick={handleCancel}
          disabled={isConfirming}
        >
          {cancelText}
        </Button>
        <Button
          variant={danger ? 'danger' : 'primary'}
          onClick={handleConfirm}
          disabled={isConfirming}
        >
          {isConfirming ? 'Processing...' : confirmText}
        </Button>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .dialog {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    max-width: 400px;
    width: 90%;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
    animation: slideIn 0.2s ease;
  }

  .dialog__title {
    margin: 0 0 1rem 0;
    font-size: 1.25rem;
    font-weight: 600;
  }

  .dialog__message {
    margin: 0 0 1.5rem 0;
    color: #666;
    line-height: 1.5;
  }

  .dialog__actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>