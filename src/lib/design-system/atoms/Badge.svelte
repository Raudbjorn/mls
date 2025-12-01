<script lang="ts">
    export let variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'processing' = 'default';
    export let size: 'small' | 'medium' | 'large' = 'medium';
</script>

<span class="badge badge-{variant} badge-{size}">
    <slot />
</span>

<style>
    .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
        text-transform: uppercase;
        font-weight: 500;
    }

    /* Size variants */
    .badge-small {
        font-size: 0.75em;
        padding: 2px 6px;
    }

    .badge-medium {
        font-size: 0.85em;
        padding: 4px 8px;
    }

    .badge-large {
        font-size: 0.95em;
        padding: 6px 12px;
    }

    /* Color variants */
    .badge-default {
        background: #f5f5f5;
        color: #666;
    }

    .badge-success {
        background: #e8f5e9;
        color: #2e7d32;
    }

    .badge-warning {
        background: #fff3e0;
        color: #e65100;
    }

    .badge-error {
        background: #ffebee;
        color: #c62828;
    }

    .badge-info {
        background: #e3f2fd;
        color: #1565c0;
    }

    .badge-processing {
        background: #e3f2fd;
        color: #1565c0;
        position: relative;
        overflow: hidden;
    }

    .badge-processing::after {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
        animation: processing 1.5s infinite;
    }

    @keyframes processing {
        to {
            left: 100%;
        }
    }
</style>