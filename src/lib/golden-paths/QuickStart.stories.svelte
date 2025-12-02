<script module lang="ts">
  import type { Meta } from '@storybook/svelte';
  import QuickStart from './QuickStart.svelte';
  // import { vi } from 'vitest'; // Removed: do not use vitest in Storybook stories

  // Mock MeiliSearch client for Storybook
  const mockClient = {
    getIndexes: async () => ({
      results: [
        { uid: 'movies', numberOfDocuments: 1000 },
        { uid: 'products', numberOfDocuments: 500 }
      ]
    }),
    getKeys: async () => [],
    index: () => ({
      search: async () => ({
        hits: [
          { id: 1, title: 'Example Result 1' },
          { id: 2, title: 'Example Result 2' }
        ],
        processingTimeMs: 5,
        estimatedTotalHits: 2
      })
    })
  };

  export const meta: Meta<QuickStart> = {
    title: 'Golden Paths/QuickStart',
    component: QuickStart,
    tags: ['autodocs'],
    parameters: {
      docs: {
        description: {
          component: `
The QuickStart component provides the simplest possible integration with MeiliSearch.
Just provide credentials and it automatically detects capabilities and shows the appropriate UI.

## Features
- Auto-detects admin vs search-only access
- Shows admin console for master keys
- Shows search playground for search keys
- Handles connection errors gracefully
- Provides helpful setup instructions

## Usage
\`\`\`svelte
<QuickStart
  host="http://localhost:7700"
  apiKey="your-key"
/>
\`\`\`
          `
        }
      }
    },
    argTypes: {
      host: {
        control: 'text',
        description: 'MeiliSearch host URL'
      },
      apiKey: {
        control: 'text',
        description: 'API key (master or search)'
      },
      mode: {
        control: { type: 'select' },
        options: ['auto', 'admin', 'search'],
        description: 'Force specific mode or auto-detect'
      }
    }
  };
</script>

<script lang="ts">
  import { Story } from '@storybook/addon-svelte-csf';
</script>

<Story
  name="Auto Detect"
  args={{
    host: 'http://localhost:7700',
    apiKey: 'masterKey_1234567890',
    mode: 'auto'
  }}
>
  <div style="height: 600px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <QuickStart {...args} />
  </div>
</Story>

<Story
  name="Admin Mode"
  args={{
    host: 'http://localhost:7700',
    apiKey: 'masterKey_1234567890',
    mode: 'admin'
  }}
>
  <div style="height: 600px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <QuickStart {...args} />
  </div>
</Story>

<Story
  name="Search Mode"
  args={{
    host: 'http://localhost:7700',
    apiKey: 'searchKey_1234567890',
    mode: 'search'
  }}
>
  <div style="height: 600px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <QuickStart {...args} />
  </div>
</Story>

<Story name="Connection Error">
  <div style="height: 400px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div class="error-simulation">
      <QuickStart
        host="http://invalid-host:7700"
        apiKey="invalid_key"
      />
    </div>
  </div>
</Story>

<Story name="Empty State">
  <div style="height: 400px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div class="empty-simulation">
      <QuickStart
        host="http://localhost:7700"
        apiKey="key_with_no_indexes"
      />
    </div>
  </div>
</Story>

<Story name="Loading State">
  <div style="height: 200px; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; display: flex; align-items: center; justify-content: center;">
    <div class="loading-state">
      <div style="text-align: center;">
        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        <p style="margin-top: 1rem; color: #666;">Connecting to MeiliSearch...</p>
      </div>
    </div>
  </div>
</Story>

<style>
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
</style>