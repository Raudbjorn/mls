<script lang="ts">
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  
  export let keys: Array<{
    uid: string;
    name: string;
    description: string;
    actions: string[];
    expiresAt: string | null;
  }> = [];
  
  export let onDelete: ((uid: string) => void) | undefined = undefined;
  export let onEdit: ((uid: string) => void) | undefined = undefined;
</script>

<div class="api-key-table">
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Description</th>
        <th>Permissions</th>
        <th>Expires</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each keys as key}
        <tr>
          <td>{key.name || key.uid.substring(0, 8)}</td>
          <td>{key.description || '-'}</td>
          <td>
            <Badge variant="info">{key.actions.length} permissions</Badge>
          </td>
          <td>{key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}</td>
          <td class="actions">
            <Button size="small" variant="secondary" onClick={() => onEdit?.(key.uid)}>Edit</Button>
            <Button size="small" variant="danger" onClick={() => onDelete?.(key.uid)}>Delete</Button>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .api-key-table { width: 100%; overflow-x: auto; }
  .table { width: 100%; border-collapse: collapse; }
  th { text-align: left; padding: 0.75rem; border-bottom: 2px solid #dee2e6; }
  td { padding: 0.75rem; border-bottom: 1px solid #dee2e6; }
  .actions { display: flex; gap: 0.5rem; }
</style>
