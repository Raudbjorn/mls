<script lang="ts">
  export let size: 'small' | 'medium' | 'large' = 'medium';
  export let color: string = 'currentColor';
  export let ariaLabel: string = 'Loading';

  const sizeMap = {
    small: 16,
    medium: 32,
    large: 48
  };

  $: spinnerSize = sizeMap[size];
</script>

<div
  class="spinner spinner--{size}"
  role="status"
  aria-label={ariaLabel}
>
  <svg
    width={spinnerSize}
    height={spinnerSize}
    viewBox="0 0 50 50"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="25"
      cy="25"
      r="20"
      fill="none"
      stroke={color}
      stroke-width="4"
      stroke-linecap="round"
      stroke-dasharray="80, 200"
    />
  </svg>
  <span class="spinner__text visually-hidden">{ariaLabel}</span>
</div>

<style>
  .spinner {
    display: inline-block;
    animation: rotate 1s linear infinite;
  }

  .spinner svg {
    display: block;
  }

  .spinner svg circle {
    animation: dash 1.5s ease-in-out infinite;
  }

  @keyframes rotate {
    100% {
      transform: rotate(360deg);
    }
  }

  @keyframes dash {
    0% {
      stroke-dasharray: 1, 200;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 90, 200;
      stroke-dashoffset: -35px;
    }
    100% {
      stroke-dasharray: 90, 200;
      stroke-dashoffset: -124px;
    }
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Respect user's motion preferences */
  @media (prefers-reduced-motion: reduce) {
    .spinner,
    .spinner svg circle {
      animation: none;
    }

    .spinner svg circle {
      opacity: 0.8;
    }
  }
</style>
