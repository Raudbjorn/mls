<script lang="ts">
    export let size: 'small' | 'medium' | 'large' = 'medium';
    export let color = '#5c6bc0';
    export let centered = false;
</script>

<div class="spinner-container" class:centered role="status" aria-label="Loading...">
    <div class="spinner spinner-{size}" style="--spinner-color: {color}" aria-hidden="true">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>
</div>

<style>
    .spinner-container {
        display: inline-block;
    }

    .spinner-container.centered {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        padding: 2rem;
    }

    .spinner {
        display: inline-block;
        position: relative;
    }

    .spinner-small {
        width: 20px;
        height: 20px;
    }

    .spinner-medium {
        width: 40px;
        height: 40px;
    }

    .spinner-large {
        width: 60px;
        height: 60px;
    }

    .spinner div {
        box-sizing: border-box;
        display: block;
        position: absolute;
        width: 100%;
        height: 100%;
        border: 2px solid var(--spinner-color);
        border-radius: 50%;
        animation: spinner 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
        border-color: var(--spinner-color) transparent transparent transparent;
    }

    .spinner div:nth-child(1) {
        animation-delay: -0.45s;
    }

    .spinner div:nth-child(2) {
        animation-delay: -0.3s;
    }

    .spinner div:nth-child(3) {
        animation-delay: -0.15s;
    }

    @keyframes spinner {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    @media (prefers-reduced-motion: reduce) {
        .spinner div {
            animation: none;
        }
    }
</style>
<!-- End of LoadingSpinner -->
