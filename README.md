# MLS - MeiliSearch Library for Svelte

A comprehensive Svelte/SvelteKit component library for managing and interacting with MeiliSearch instances. This library provides a suite of components for search administration, monitoring, and advanced features.

## Features

### Core Components
- **MeiliProvider** - Context provider for MeiliSearch client configuration
- **MeiliSettings** - General MeiliSearch settings management
- **TaskService** - Service layer for managing MeiliSearch tasks

### Administrative Tools
- **KeyManager** - API key management interface
- **IndexSwapper** - Swap indexes safely with zero downtime
- **BackupManager** - Backup and restore functionality
- **SystemHealth** - Monitor system health and performance metrics

### Search Configuration
- **RankingRulesEditor** - Configure and manage ranking rules
- **FilterAttributeConfig** - Set up filterable attributes
- **SynonymManager** - Manage search synonyms
- **TypoToleranceEditor** - Configure typo tolerance settings
- **SearchDisplayConfig** - Customize search result display

### Advanced Features
- **HybridSearchTester** - Test and configure hybrid search capabilities
- **VectorIndexConfig** - Configure vector search and embeddings
- **EmbedderConfig** - Set up and manage embedders
- **NetworkFederationConfig** - Configure network federation for distributed search

### Monitoring & Operations
- **MeiliTaskWatcher** - Real-time task monitoring
- **BatchMonitor** - Monitor batch operations
- **LogStreamer** - Stream and view logs in real-time
- **WebhookManager** - Configure and manage webhooks

### Experimental
- **ExperimentalFeatures** - Toggle and test experimental MeiliSearch features

## Installation

```bash
npm install mls
# or
pnpm add mls
# or
yarn add mls
```

## Quick Start

```svelte
<script>
  import { MeiliProvider, MeiliSettings } from 'mls';
</script>

<MeiliProvider host="http://localhost:7700" apiKey="your-master-key">
  <MeiliSettings />
</MeiliProvider>
```

## Prerequisites

- Svelte 5+ or SvelteKit
- MeiliSearch instance (v1.0+)
- Node.js 18+

## Component Usage

### Basic Setup

```svelte
<script>
  import { MeiliProvider } from 'mls';

  const config = {
    host: 'http://localhost:7700',
    apiKey: 'your-master-key'
  };
</script>

<MeiliProvider {...config}>
  <!-- Your app components here -->
</MeiliProvider>
```

### Task Monitoring

```svelte
<script>
  import { MeiliTaskWatcher } from 'mls';
</script>

<MeiliTaskWatcher />
```

### Index Management

```svelte
<script>
  import { IndexSwapper } from 'mls';
</script>

<IndexSwapper />
```

## API Reference

### Types

The library exports TypeScript types for all MeiliSearch entities:

```typescript
import type {
  MeiliClientConfig,
  MeiliTask,
  MeiliContext,
  Webhook,
  Batch,
  Network,
  RemoteConfig
} from 'mls';
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build library
npm run build

# Run tests
npm test
```

## Architecture

The library follows a modular architecture:

- `/components` - Svelte components for UI interactions
- `/services` - Service layer for business logic
- `/types` - TypeScript type definitions
- `/components/settings` - Specialized settings components

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

- [GitHub Issues](https://github.com/Raudbjorn/mls/issues)
- [Documentation](https://github.com/Raudbjorn/mls/wiki)

## Acknowledgments

Built with:
- [Svelte](https://svelte.dev)
- [MeiliSearch](https://meilisearch.com)
- [TypeScript](https://www.typescriptlang.org)