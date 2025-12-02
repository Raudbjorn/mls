<script lang="ts">
  import { onDestroy } from 'svelte';
  import { generateUniqueId } from '../utils/accessibility';

  export let content: string;
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  export let delay: number = 0;

  let showTooltip = false;
  let tooltipTimeout: number;

  // Generate unique ID for ARIA attributes
  const tooltipId = generateUniqueId('tooltip');

  function handleMouseEnter() {
    if (delay > 0) {
      tooltipTimeout = window.setTimeout(() => {
        showTooltip = true;
      }, delay);
    } else {
      showTooltip = true;
    }
  }

  function handleMouseLeave() {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
    }
    showTooltip = false;
  }

  // Cleanup timer on component destroy
  onDestroy(() => {
    clearTimeout(tooltipTimeout);
  });
</script>

<div
  class="tooltip-wrapper"
  role="group"
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:focus={handleMouseEnter}
  on:blur={handleMouseLeave}
  aria-describedby={showTooltip ? tooltipId : undefined}
>
  <slot />

  {#if showTooltip}
    <div
      id={tooltipId}
      class="tooltip tooltip--{position}"
      role="tooltip"
      aria-hidden="false"
    >
      {content}
    </div>
  {/if}
</div>

<style>
  .tooltip-wrapper {
    position: relative;
    display: inline-block;
  }

  .tooltip {
    position: absolute;
    z-index: 1000;
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
    color: white;
    background-color: rgba(0, 0, 0, 0.9);
    border-radius: 4px;
    white-space: nowrap;
    pointer-events: none;
    animation: fadeIn 0.2s ease-in-out;
  }

  /* Arrow */
  .tooltip::after {
    content: '';
    position: absolute;
    border: 5px solid transparent;
  }

  /* Position variants */
  .tooltip--top {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
  }

  .tooltip--top::after {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-top-color: rgba(0, 0, 0, 0.9);
  }

  .tooltip--bottom {
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: 8px;
  }

  .tooltip--bottom::after {
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    border-bottom-color: rgba(0, 0, 0, 0.9);
  }

  .tooltip--left {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: 8px;
  }

  .tooltip--left::after {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-left-color: rgba(0, 0, 0, 0.9);
  }

  .tooltip--right {
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: 8px;
  }

  .tooltip--right::after {
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    border-right-color: rgba(0, 0, 0, 0.9);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  /* Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .tooltip {
      animation: none;
    }
  }
</style>
