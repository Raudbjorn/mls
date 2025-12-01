<script lang="ts">
    export let label: string;
    export let error = '';
    export let hint = '';
    export let required = false;
    export let id = '';
</script>

<div class="form-field">
    <label class="form-label" for={id}>
        {label}
        {#if required}
            <span class="required">*</span>
        {/if}
    </label>

    <div class="form-control">
        <slot />
    </div>

    {#if hint && !error}
        <p class="form-hint">{hint}</p>
    {/if}

    {#if error}
        <p class="form-error">{error}</p>
    {/if}
</div>

<style>
    .form-field {
        margin-bottom: 1.5rem;
    }

    .form-label {
        display: block;
        font-weight: 500;
        color: #333;
        margin-bottom: 0.5rem;
        font-size: 0.95rem;
    }

    .required {
        color: #f44336;
        margin-left: 4px;
    }

    .form-control {
        width: 100%;
    }

    .form-hint {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #666;
    }

    .form-error {
        margin-top: 0.25rem;
        font-size: 0.875rem;
        color: #f44336;
    }
</style>