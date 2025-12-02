<script lang="ts">
  export let title: string = 'Admin Panel';
  export let sidebarItems: Array<{label: string, href: string, active?: boolean}> = [];
</script>

<div class="admin-shell">
  <header class="admin-shell__header">
    <h1>{title}</h1>
    <slot name="header-actions" />
  </header>
  
  <div class="admin-shell__body">
    <nav class="admin-shell__sidebar">
      {#each sidebarItems as item}
        <a 
          href={item.href} 
          class="sidebar-item"
          class:sidebar-item--active={item.active}
        >
          {item.label}
        </a>
      {/each}
    </nav>
    
    <main class="admin-shell__content">
      <slot />
    </main>
  </div>
</div>

<style>
  .admin-shell { display: flex; flex-direction: column; height: 100vh; }
  .admin-shell__header { 
    display: flex; 
    justify-content: space-between; 
    align-items: center;
    padding: 1rem 1.5rem; 
    border-bottom: 1px solid #dee2e6; 
  }
  .admin-shell__body { display: flex; flex: 1; overflow: hidden; }
  .admin-shell__sidebar { 
    width: 250px; 
    padding: 1rem; 
    border-right: 1px solid #dee2e6;
    overflow-y: auto;
  }
  .admin-shell__content { flex: 1; padding: 1.5rem; overflow-y: auto; }
  .sidebar-item { 
    display: block; 
    padding: 0.5rem 1rem; 
    color: #666; 
    text-decoration: none;
    border-radius: 4px;
    margin-bottom: 0.25rem;
  }
  .sidebar-item:hover { background: #f8f9fa; }
  .sidebar-item--active { background: #e3f2fd; color: #1976d2; }
</style>
