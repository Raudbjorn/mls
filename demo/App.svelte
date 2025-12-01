<!--
  MLS Demo Application
  Demonstrates all major features of the MLS library
-->
<script lang="ts">
  import { QuickStart, AdminConsole, SearchPlayground } from '../src/lib/golden-paths';
  import { ThemeProvider, ThemeSwitcher } from '../src/lib/design-system';
  import Button from '../src/lib/design-system/atoms/Button.svelte';
  import Badge from '../src/lib/design-system/atoms/Badge.svelte';

  let activeDemo = $state<'quickstart' | 'admin' | 'search' | 'components'>('quickstart');

  // Demo MeiliSearch configuration
  const config = {
    host: import.meta.env.VITE_MEILI_HOST || 'http://localhost:7700',
    apiKey: import.meta.env.VITE_MEILI_KEY || 'masterKey',
  };

  // Sample index for search demo
  const searchIndex = 'movies';
</script>

<ThemeProvider theme="auto">
  <div class="demo-app">
    <header class="demo-header">
      <div class="header-content">
        <h1>🔍 MLS Demo</h1>
        <p>MeiliSearch Library for Svelte</p>
      </div>
      <ThemeSwitcher variant="dropdown" />
    </header>

    <nav class="demo-nav">
      <button
        class="nav-button"
        class:active={activeDemo === 'quickstart'}
        onclick={() => activeDemo = 'quickstart'}
      >
        QuickStart
      </button>
      <button
        class="nav-button"
        class:active={activeDemo === 'admin'}
        onclick={() => activeDemo = 'admin'}
      >
        Admin Console
      </button>
      <button
        class="nav-button"
        class:active={activeDemo === 'search'}
        onclick={() => activeDemo = 'search'}
      >
        Search Playground
      </button>
      <button
        class="nav-button"
        class:active={activeDemo === 'components'}
        onclick={() => activeDemo = 'components'}
      >
        Components
      </button>
    </nav>

    <main class="demo-content">
      {#if activeDemo === 'quickstart'}
        <section>
          <h2>QuickStart - Auto-Detection</h2>
          <p>This component automatically detects your access level and shows the appropriate UI.</p>
          <div class="demo-container">
            <QuickStart {...config} />
          </div>
        </section>

      {:else if activeDemo === 'admin'}
        <section>
          <h2>Admin Console</h2>
          <p>Full-featured admin dashboard for MeiliSearch management.</p>
          <div class="demo-container">
            <AdminConsole
              {...config}
              title="Demo Admin"
              features={{
                tasks: true,
                indexes: true,
                keys: true,
                backup: true,
                health: true
              }}
            />
          </div>
        </section>

      {:else if activeDemo === 'search'}
        <section>
          <h2>Search Playground</h2>
          <p>Interactive search interface with advanced features.</p>
          <div class="demo-container">
            <SearchPlayground
              {...config}
              indexUid={searchIndex}
              placeholder="Search movies..."
              showAdvanced={true}
              displayMode="cards"
            />
          </div>
        </section>

      {:else if activeDemo === 'components'}
        <section>
          <h2>Design System Components</h2>
          <p>Showcase of individual components from the design system.</p>

          <div class="component-section">
            <h3>Buttons</h3>
            <div class="component-demo">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button disabled>Disabled</Button>
              <Button loading>Loading</Button>
            </div>
          </div>

          <div class="component-section">
            <h3>Badges</h3>
            <div class="component-demo">
              <Badge type="info">Info</Badge>
              <Badge type="success">Success</Badge>
              <Badge type="warning">Warning</Badge>
              <Badge type="error">Error</Badge>
              <Badge type="neutral">Neutral</Badge>
            </div>
          </div>

          <div class="component-section">
            <h3>Theme Switcher</h3>
            <div class="component-demo">
              <ThemeSwitcher variant="button" />
              <ThemeSwitcher variant="icon" />
              <ThemeSwitcher variant="dropdown" />
            </div>
          </div>
        </section>
      {/if}
    </main>

    <footer class="demo-footer">
      <p>
        Built with MLS |
        <a href="https://github.com/Raudbjorn/mls" target="_blank">GitHub</a> |
        <a href="/docs" target="_blank">Documentation</a> |
        <a href="https://www.meilisearch.com" target="_blank">MeiliSearch</a>
      </p>
    </footer>
  </div>
</ThemeProvider>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: system-ui, -apple-system, sans-serif;
  }

  .demo-app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--mls-surface-background);
    color: var(--mls-text-primary);
  }

  .demo-header {
    background: var(--mls-primary-600);
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: var(--mls-shadow-md);
  }

  .header-content h1 {
    margin: 0;
    font-size: 1.5rem;
  }

  .header-content p {
    margin: 0.25rem 0 0;
    opacity: 0.9;
    font-size: 0.875rem;
  }

  .demo-nav {
    background: var(--mls-surface-paper);
    padding: 0 2rem;
    display: flex;
    gap: 1rem;
    border-bottom: 1px solid var(--mls-neutral-200);
    overflow-x: auto;
  }

  .nav-button {
    padding: 1rem 1.5rem;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--mls-text-secondary);
    transition: all var(--mls-duration-fast) var(--mls-ease-inOut);
  }

  .nav-button:hover {
    color: var(--mls-text-primary);
    background: var(--mls-action-hover);
  }

  .nav-button.active {
    color: var(--mls-primary-600);
    border-bottom-color: var(--mls-primary-600);
  }

  .demo-content {
    flex: 1;
    padding: 2rem;
  }

  .demo-content section {
    max-width: 1200px;
    margin: 0 auto;
  }

  .demo-content h2 {
    margin-top: 0;
    color: var(--mls-text-primary);
  }

  .demo-content p {
    color: var(--mls-text-secondary);
    margin-bottom: 1.5rem;
  }

  .demo-container {
    background: var(--mls-surface-paper);
    border: 1px solid var(--mls-neutral-200);
    border-radius: var(--mls-radius-lg);
    overflow: hidden;
    min-height: 500px;
  }

  .component-section {
    margin-bottom: 2rem;
  }

  .component-section h3 {
    margin-bottom: 1rem;
    color: var(--mls-text-primary);
  }

  .component-demo {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
    padding: 1.5rem;
    background: var(--mls-surface-paper);
    border: 1px solid var(--mls-neutral-200);
    border-radius: var(--mls-radius-md);
  }

  .demo-footer {
    background: var(--mls-surface-paper);
    padding: 1.5rem 2rem;
    text-align: center;
    border-top: 1px solid var(--mls-neutral-200);
    color: var(--mls-text-secondary);
  }

  .demo-footer a {
    color: var(--mls-primary-500);
    text-decoration: none;
    margin: 0 0.5rem;
  }

  .demo-footer a:hover {
    text-decoration: underline;
  }
</style>