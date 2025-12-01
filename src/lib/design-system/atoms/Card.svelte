<script lang="ts">
    export let padding: 'none' | 'small' | 'medium' | 'large' = 'medium';
    export let variant: 'default' | 'elevated' | 'outlined' = 'outlined';
</script>

<div
    class="card card-{variant} padding-{padding}"
    {...$$restProps}
>
    <slot />
</div>

<style>
    .card {
        background: white;
        border-radius: 4px;
        transition: box-shadow 0.2s;
    }

    .card-default {
        border: 1px solid #e0e0e0;
    }

    .card-elevated {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: none;
    }

    .card-outlined {
        border: 1px solid #e0e0e0;
    }

    .padding-none {
        padding: 0;
    }

    .padding-small {
        padding: 0.5rem;
    }

    .padding-medium {
        padding: 1rem;
    }

    .padding-large {
        padding: 1.5rem;
    }
</style>