# Golden Paths 🚀

Zero-config components for instant MeiliSearch integration. Get up and running in under a minute.

## QuickStart - The Magic Component

The simplest possible integration. Just provide credentials and QuickStart figures out the rest:

```svelte
<script>
  import { QuickStart } from 'mls/golden-paths';
</script>

<QuickStart
  host="http://localhost:7700"
  apiKey="your-key"
/>
```

**What it does:**
- Auto-detects if you have admin (master key) or search-only access
- Shows admin console for master keys
- Shows search playground for search keys
- Handles connection errors gracefully
- Provides helpful setup instructions if no indexes exist

## AdminConsole - Full Admin Interface

Drop-in admin dashboard with everything you need:

```svelte
<script>
  import { AdminConsole } from 'mls/golden-paths';
</script>

<AdminConsole
  host="http://localhost:7700"
  apiKey="your-master-key"
  title="My Search Admin"
  theme="dark"
  features={{
    tasks: true,
    indexes: true,
    keys: true,
    backup: true,
    health: true
  }}
/>
```

**Features:**
- Health monitoring dashboard
- Index management
- Task monitoring
- API key management
- Backup/restore functionality
- Customizable feature flags
- Light/dark/auto theme support

## SearchPlayground - Interactive Search

Beautiful search interface for testing and development:

```svelte
<script>
  import { SearchPlayground } from 'mls/golden-paths';
</script>

<SearchPlayground
  host="http://localhost:7700"
  apiKey="your-search-key"
  indexUid="movies"
  placeholder="Search movies..."
  showAdvanced={true}
  displayMode="cards"
  searchOnType={true}
  debounceMs={300}
/>
```

**Features:**
- Real-time search as you type
- Multiple display modes (cards/json/simple)
- Advanced search panel with filters
- Highlighting of matched terms
- Search performance metrics
- Responsive design

## Quick Examples

### Example 1: Minimal Setup
```svelte
<!-- App.svelte -->
<script>
  import { QuickStart } from 'mls';
</script>

<QuickStart
  host={import.meta.env.VITE_MEILI_HOST}
  apiKey={import.meta.env.VITE_MEILI_KEY}
/>
```

### Example 2: Admin Dashboard
```svelte
<!-- Admin.svelte -->
<script>
  import { AdminConsole } from 'mls';
</script>

<AdminConsole
  host="http://localhost:7700"
  apiKey="masterKey123"
  theme="dark"
/>
```

### Example 3: Search Interface
```svelte
<!-- Search.svelte -->
<script>
  import { SearchPlayground } from 'mls';
</script>

<SearchPlayground
  host="http://localhost:7700"
  apiKey="searchKey456"
  indexUid="products"
  displayMode="cards"
/>
```

## Configuration Options

### QuickStart Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| host | string | required | MeiliSearch host URL |
| apiKey | string | required | API key |
| mode | 'auto' \| 'admin' \| 'search' | 'auto' | Force specific mode |

### AdminConsole Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| host | string | required | MeiliSearch host URL |
| apiKey | string | required | Master API key |
| title | string | 'MeiliSearch Admin' | Dashboard title |
| theme | 'light' \| 'dark' \| 'auto' | 'auto' | Theme mode |
| features | object | all enabled | Feature toggles |

### SearchPlayground Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| host | string | required | MeiliSearch host URL |
| apiKey | string | required | API key |
| indexUid | string | required | Index to search |
| placeholder | string | 'Search...' | Search input placeholder |
| showAdvanced | boolean | true | Show advanced panel |
| theme | 'light' \| 'dark' \| 'auto' | 'auto' | Theme mode |
| displayMode | 'simple' \| 'json' \| 'cards' | 'cards' | Result display mode |
| searchOnType | boolean | true | Search as you type |
| debounceMs | number | 300 | Debounce delay |

## Common Patterns

### Multi-Tenant Setup
```svelte
<script>
  import { AdminConsole } from 'mls';
  import { generateTenantToken } from 'mls';

  // Generate tenant-specific token
  const token = await generateTenantToken({
    apiKey: 'master-key',
    searchRules: {
      'products': { filter: `tenant_id = ${tenantId}` }
    }
  });
</script>

<AdminConsole host={host} apiKey={token} />
```

### Custom Themes
```svelte
<script>
  import { SearchPlayground } from 'mls';
</script>

<div class="custom-theme">
  <SearchPlayground
    host={host}
    apiKey={key}
    indexUid="docs"
    theme="light"
  />
</div>

<style>
  .custom-theme {
    --color-primary: #6366f1;
    --color-surface: #fafafa;
    --color-text: #1f2937;
  }
</style>
```

### Environment-Based Config
```svelte
<script>
  import { QuickStart } from 'mls';

  const config = {
    development: {
      host: 'http://localhost:7700',
      apiKey: 'test_key'
    },
    production: {
      host: 'https://search.example.com',
      apiKey: import.meta.env.VITE_MEILI_KEY
    }
  };

  const env = import.meta.env.MODE;
</script>

<QuickStart {...config[env]} />
```

## Styling

All golden path components support CSS variables for theming:

```css
/* Available CSS variables */
--color-primary: #1976d2;
--color-primary-dark: #004ba0;
--color-success: #4caf50;
--color-error: #c62828;
--color-surface: #ffffff;
--color-surface-variant: #f5f5f5;
--color-text: #212121;
--color-text-muted: #666666;
--color-border: #dddddd;
```

## TypeScript Support

All components are fully typed:

```typescript
import type {
  QuickStartProps,
  AdminConsoleProps,
  SearchPlaygroundProps
} from 'mls/golden-paths';

const config: AdminConsoleProps = {
  host: 'http://localhost:7700',
  apiKey: 'masterKey',
  theme: 'dark',
  features: {
    tasks: true,
    indexes: true,
    keys: false,
    backup: true,
    health: true
  }
};
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- No IE11 support

## Performance

Golden path components are optimized for performance:
- Lazy loading of features
- Debounced search
- Virtual scrolling for large result sets
- Request cancellation on component unmount
- Efficient re-renders with Svelte's reactivity

## Security

- API keys are never logged
- Supports tenant tokens for multi-tenant apps
- CORS-aware configuration
- Input sanitization built-in

## Next Steps

1. **Need custom UI?** Check out the [design system components](../design-system/README.md)
2. **Need advanced features?** See [feature modules](../features/README.md)
3. **Need programmatic control?** Use [services directly](../meili/services/README.md)

## Examples Repository

Check out [mls-examples](https://github.com/yourusername/mls-examples) for:
- SvelteKit integration
- Multi-tenant setup
- Custom themes
- Production deployment
- Testing strategies