<script lang="ts">
    export let variant: 'primary' | 'secondary' | 'danger' | 'success' = 'primary';
    export let disabled = false;
    export let type: 'button' | 'submit' | 'reset' = 'button';
    export let loading = false;
    export let ariaLabel: string | undefined = undefined;
    export let ariaPressed: boolean | undefined = undefined;
    export let ariaExpanded: boolean | undefined = undefined;
    export let ariaControls: string | undefined = undefined;
    export let ariaDescribedBy: string | undefined = undefined;
</script>

<button
    {type}
    {disabled}
    class="btn btn-{variant}"
    class:loading
    on:click
    aria-label={ariaLabel}
    aria-pressed={ariaPressed}
    aria-expanded={ariaExpanded}
    aria-controls={ariaControls}
    aria-describedby={ariaDescribedBy}
    aria-disabled={disabled}
    aria-busy={loading}
>
    {#if loading}
        <span class="spinner"></span>
    {/if}
    <slot />
</button>

<style>
    .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s, background-color 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
    }

    .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .btn-primary {
        background-color: #5c6bc0;
        color: white;
    }

    .btn-primary:hover:not(:disabled) {
        background-color: #3949ab;
    }

    .btn-secondary {
        background-color: #e0e0e0;
        color: #333;
    }

    .btn-secondary:hover:not(:disabled) {
        background-color: #bdbdbd;
    }

    .btn-danger {
        background-color: #f44336;
        color: white;
    }

    .btn-danger:hover:not(:disabled) {
        background-color: #d32f2f;
    }

    .btn-success {
        background-color: #26a69a;
        color: white;
    }

    .btn-success:hover:not(:disabled) {
        background-color: #00897b;
    }

    .spinner {
        width: 14px;
        height: 14px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
        to { transform: rotate(360deg); }
    }
</style>