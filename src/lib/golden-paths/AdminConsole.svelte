<!--
  Drop-in Admin Console
  One-line setup for a complete MeiliSearch admin interface

  Usage:
    import { AdminConsole } from 'mls/golden-paths';

    <AdminConsole
      host="http://localhost:7700"
      apiKey="your-master-key"
    />
-->
<script lang="ts">
  import { setContext } from 'svelte';
  import { MeiliSearch } from 'meilisearch';
  import AdminShell from '../design-system/templates/AdminShell.svelte';
  import TaskMonitor from '../features/tasks/TaskMonitor.svelte';
  import IndexList from '../features/indexes/IndexList.svelte';
  import KeyManager from '../features/security/KeyManager.svelte';
  import BackupManager from '../features/backup/BackupManager.svelte';
  import HealthDashboard from '../features/health/HealthDashboard.svelte';

  interface Props {
    host: string;
    apiKey: string;
    title?: string;
    theme?: 'light' | 'dark' | 'auto';
    features?: {
      tasks?: boolean;
      indexes?: boolean;
      keys?: boolean;
      backup?: boolean;
      health?: boolean;
    };
  }

  let {
    host,
    apiKey,
    title = 'MeiliSearch Admin',
    theme = 'auto',
    features = {
      tasks: true,
      indexes: true,
      keys: true,
      backup: true,
      health: true
    }
  }: Props = $props();

  const client = new MeiliSearch({ host, apiKey });

  // Provide MeiliSearch context for all child components
  setContext('meili', { client });

  // Navigation based on enabled features
  $derived navigationItems = [
    features.health && { id: 'health', label: 'Health', icon: 'heart' },
    features.indexes && { id: 'indexes', label: 'Indexes', icon: 'database' },
    features.tasks && { id: 'tasks', label: 'Tasks', icon: 'clock' },
    features.keys && { id: 'keys', label: 'API Keys', icon: 'key' },
    features.backup && { id: 'backup', label: 'Backup', icon: 'download' },
  ].filter(Boolean);

  let activeSection = $state(navigationItems[0]?.id || 'health');
</script>

<div class="admin-console" data-theme={theme}>
  <AdminShell
    {title}
    {navigationItems}
    bind:activeSection
  >
    {#if activeSection === 'health' && features.health}
      <HealthDashboard />
    {:else if activeSection === 'indexes' && features.indexes}
      <IndexList />
    {:else if activeSection === 'tasks' && features.tasks}
      <TaskMonitor />
    {:else if activeSection === 'keys' && features.keys}
      <KeyManager />
    {:else if activeSection === 'backup' && features.backup}
      <BackupManager />
    {/if}
  </AdminShell>
</div>

<style>
  .admin-console {
    width: 100%;
    height: 100vh;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .admin-console[data-theme="dark"] {
    color-scheme: dark;
    background: #1a1a1a;
    color: #e0e0e0;
  }

  .admin-console[data-theme="light"] {
    color-scheme: light;
    background: #ffffff;
    color: #212121;
  }

  .admin-console[data-theme="auto"] {
    color-scheme: light dark;
  }
</style>