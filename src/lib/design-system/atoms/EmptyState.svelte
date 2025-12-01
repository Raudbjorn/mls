<script lang="ts">
    export let title = 'No data';
    export let message = '';
    export let icon = '';
</script>

<div class="empty-state">
    {#if icon}
        <div class="empty-icon">{icon}</div>
    {/if}
    <h3 class="empty-title">{title}</h3>
    {#if message}
        <p class="empty-message">{message}</p>
    {/if}
    {#if $$slots.default}
        <div class="empty-action">
            <slot />
        </div>
    {/if}
</div>

<style>
    .empty-state {
        text-align: center;
        padding: 3rem 2rem;
        color: #757575;
    }

    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
    }

    .empty-title {
        font-size: 1.2rem;
        font-weight: 500;
        color: #616161;
        margin: 0 0 0.5rem 0;
    }

    .empty-message {
        font-size: 0.95rem;
        margin: 0 0 1.5rem 0;
        color: #9e9e9e;
    }

    .empty-action {
        margin-top: 1.5rem;
    }
</style>