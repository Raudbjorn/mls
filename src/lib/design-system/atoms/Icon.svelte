<script lang="ts">
  export let name: string;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let color: string | undefined = undefined;
  export let ariaLabel: string | undefined = undefined;

  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32
  };

  $: iconSize = sizeMap[size];
</script>

<svg
  width={iconSize}
  height={iconSize}
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="2"
  stroke-linecap="round"
  stroke-linejoin="round"
  class="icon icon--{name} icon--{size}"
  style:color={color}
  aria-label={ariaLabel || name}
>
  {#if name === 'search'}
    <circle cx="11" cy="11" r="8"/>
    <path d="m21 21-4.35-4.35"/>
  {:else if name === 'check'}
    <polyline points="20 6 9 17 4 12"/>
  {:else if name === 'x'}
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  {:else if name === 'chevron-down'}
    <polyline points="6 9 12 15 18 9"/>
  {:else if name === 'alert'}
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  {:else}
    <!-- Fallback/placeholder -->
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  {/if}
</svg>

<style>
  .icon {
    display: inline-block;
    vertical-align: middle;
  }

  .icon--small {
    width: 16px;
    height: 16px;
  }

  .icon--medium {
    width: 24px;
    height: 24px;
  }

  .icon--large {
    width: 32px;
    height: 32px;
  }
</style>