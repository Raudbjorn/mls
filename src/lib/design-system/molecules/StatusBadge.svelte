<script lang="ts">
  import Badge from '../atoms/Badge.svelte';

  export let status: 'success' | 'warning' | 'error' | 'info' | 'pending';
  export let text: string | undefined = undefined;

  const statusMap = {
    success: { variant: 'success', label: 'Success' },
    warning: { variant: 'warning', label: 'Warning' },
    error: { variant: 'danger', label: 'Error' },
    info: { variant: 'info', label: 'Info' },
    pending: { variant: 'secondary', label: 'Pending' }
  };

  $: config = statusMap[status] || statusMap.info;
  $: displayText = text || config.label;
</script>

<Badge variant={config.variant}>
  {displayText}
</Badge>
