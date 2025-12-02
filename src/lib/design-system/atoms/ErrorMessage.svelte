<script lang="ts">
    export let title = 'Error';
    export let message: string | null = null;
    export let dismissible = false;

    let visible = true;

    // Reset visible state when message changes
    $: if (message) {
        visible = true;
    }

    function dismiss() {
        visible = false;
    }
</script>

{#if visible && message}
    <div class="error-message">
        <div class="error-content">
            <strong class="error-title">{title}:</strong>
            <span class="error-text">{message}</span>
        </div>
        {#if dismissible}
            <button class="dismiss-btn" on:click={dismiss} aria-label="Dismiss error">
                ×
            </button>
        {/if}
    </div>
{/if}

<style>
    .error-message {
        background: #ffebee;
        color: #c62828;
        padding: 12px 16px;
        border-radius: 4px;
        margin: 1rem 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        animation: slideIn 0.2s ease-out;
    }

    .error-content {
        flex: 1;
    }

    .error-title {
        margin-right: 0.5rem;
    }

    .error-text {
        word-break: break-word;
    }

    .dismiss-btn {
        background: none;
        border: none;
        color: #c62828;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        margin-left: 1rem;
        line-height: 1;
        opacity: 0.7;
        transition: opacity 0.2s;
    }

    .dismiss-btn:hover {
        opacity: 1;
    }

    @keyframes slideIn {
        from {
            transform: translateY(-10px);
            opacity: 0;
        }
        to {
            transform: translateY(0);
            opacity: 1;
        }
    }
</style>