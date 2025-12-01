<script lang="ts">
  export let label: string;
  export let value: string | number | boolean | undefined;
  export let copyable: boolean = false;

  let copied = false;

  function formatValue(val: any): string {
    if (val === undefined || val === null) return '-';
    if (typeof val === 'boolean') return val ? 'Yes' : 'No';
    return String(val);
  }

  async function copyToClipboard() {
    if (!copyable || !value) return;

    try {
      await navigator.clipboard.writeText(String(value));
      copied = true;
      setTimeout(() => {
        copied = false;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }

  $: displayValue = formatValue(value);
</script>

<div class="key-value-row">
  <span class="key-value-row__label">{label}:</span>
  <span class="key-value-row__value" class:key-value-row__value--copyable={copyable}>
    {displayValue}
    {#if copyable && value}
      <button
        class="key-value-row__copy"
        on:click={copyToClipboard}
        aria-label="Copy to clipboard"
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        {#if copied}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 111.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z"/>
          </svg>
        {:else}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.5 2A1.5 1.5 0 002 3.5v8A1.5 1.5 0 003.5 13h.55a.5.5 0 000-1H3.5a.5.5 0 01-.5-.5v-8a.5.5 0 01.5-.5h5a.5.5 0 01.5.5V4h2.5a.5.5 0 01.5.5v.55a.5.5 0 001 0V4.5A1.5 1.5 0 0011.5 3H9v-.5A1.5 1.5 0 007.5 1h-4z"/>
            <path d="M6.5 5A1.5 1.5 0 005 6.5v8A1.5 1.5 0 006.5 16h6a1.5 1.5 0 001.5-1.5v-8A1.5 1.5 0 0012.5 5h-6zm0 1h6a.5.5 0 01.5.5v8a.5.5 0 01-.5.5h-6a.5.5 0 01-.5-.5v-8a.5.5 0 01.5-.5z"/>
          </svg>
        {/if}
      </button>
    {/if}
  </span>
</div>

<style>
  .key-value-row {
    display: flex;
    align-items: baseline;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }

  .key-value-row:last-child {
    border-bottom: none;
  }

  .key-value-row__label {
    flex-shrink: 0;
    width: 140px;
    font-weight: 500;
    color: #666;
    font-size: 0.875rem;
  }

  .key-value-row__value {
    flex: 1;
    color: #333;
    word-break: break-word;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .key-value-row__value--copyable {
    cursor: text;
    user-select: all;
  }

  .key-value-row__copy {
    flex-shrink: 0;
    padding: 0.25rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: background-color 0.15s ease, color 0.15s ease;
  }

  .key-value-row__copy:hover {
    background-color: #f0f0f0;
    color: #333;
  }

  .key-value-row__copy:active {
    background-color: #e0e0e0;
  }
</style>