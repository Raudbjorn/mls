<script lang="ts">
    export let label: string;
    export let description = '';
    export let error = '';
    export let required = false;
</script>

<div class="setting-row">
    <div class="setting-info">
        <label class="setting-label">
            {label}
            {#if required}
                <span class="required">*</span>
            {/if}
        </label>
        {#if description}
            <p class="setting-description">{description}</p>
        {/if}
        {#if error}
            <p class="setting-error">{error}</p>
        {/if}
    </div>
    <div class="setting-control">
        <slot />
    </div>
</div>

<style>
    .setting-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 1rem 0;
        border-bottom: 1px solid #f0f0f0;
    }

    .setting-row:last-child {
        border-bottom: none;
    }

    .setting-info {
        flex: 1;
        margin-right: 2rem;
    }

    .setting-label {
        display: block;
        font-weight: 500;
        color: #333;
        margin-bottom: 0.25rem;
    }

    .required {
        color: #f44336;
        margin-left: 4px;
    }

    .setting-description {
        font-size: 0.875rem;
        color: #666;
        margin: 0.25rem 0 0 0;
        line-height: 1.4;
    }

    .setting-error {
        font-size: 0.875rem;
        color: #f44336;
        margin: 0.25rem 0 0 0;
    }

    .setting-control {
        flex-shrink: 0;
        display: flex;
        align-items: center;
    }
</style>