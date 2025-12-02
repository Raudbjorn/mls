# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MLS (MeiliSearch Library for Svelte) is a comprehensive component library for MeiliSearch administration. It follows Atomic Design principles combined with Domain-Driven Design, using Svelte 5 with TypeScript.

## Essential Commands

### Development
```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Run MeiliSearch locally for testing
docker run -p 7700:7700 -e MEILI_MASTER_KEY='masterKey' getmeili/meilisearch:latest
```

### Testing
```bash
# Run all unit tests
npm test

# Watch mode for TDD
npm run test:unit:watch

# Run specific test file
npm test src/lib/meili/services/TaskService.test.ts

# Run tests matching pattern
npm test -- --grep "TaskService"
```

### Build & Validation
```bash
# Type checking
npm run check

# Linting
npm run lint

# Format code
npm run format

# Build library for distribution
npm run build

# Package for npm (creates dist/)
npm run package
```

### Documentation
```bash
# Run Storybook for component development
npm run storybook

# Build static Storybook
npm run build-storybook
```

## Architecture Patterns

### Three-Layer Architecture

1. **Design System (`src/lib/design-system/`)**: Pure UI components following Atomic Design
   - `atoms/`: Basic elements (Button, Input, Badge)
   - `molecules/`: Composed components (SearchInput, FormField)
   - `organisms/`: Complex sections (TaskTable, ApiKeyTable)
   - `templates/`: Page layouts (AdminShell)

2. **Features (`src/lib/features/`)**: Self-contained business modules
   - Each feature combines design-system components with domain services
   - Examples: `backup/`, `tasks/`, `settings/`, `search/`
   - Contains feature-specific state and logic

3. **Domain (`src/lib/meili/`)**: Core MeiliSearch integration
   - `services/`: Business logic (TaskService, BatchService, TypedIndex)
   - `utils/`: Utilities (api.ts, token.ts, extended-api.ts)
   - `types/`: TypeScript definitions
   - `errors/`: Custom error classes

### Public API Structure

The library exposes multiple import patterns:

```typescript
// Traditional flat imports (backward compatible)
import { BackupManager, TaskService } from 'mls';

// Namespace imports for better organization
import { features, meili, designSystem } from 'mls';
const BackupManager = features.backup.BackupManager;

// Direct feature imports
import { backup } from 'mls';
```

## Critical Implementation Details

### Svelte 5 Runes
Components use Svelte 5's new runes syntax:
```svelte
<script lang="ts">
  // Use $props() instead of export let
  let { prop, optional = false }: Props = $props();

  // Use $state() for reactive state
  let count = $state(0);

  // Use $effect() instead of $:
  $effect(() => {
    console.log('Count changed:', count);
  });
</script>
```

### MeiliSearch Integration
- All API calls go through `meili/utils/api.ts` or `extended-api.ts`
- Extended API handles experimental features not in the SDK
- Services wrap SDK client with additional functionality
- TypedIndex provides type-safe document operations

### Testing Patterns
- **Unit tests**: `*.test.ts` - Component isolation tests
- **Contract tests**: `*.contract.test.ts` - API stability tests
- **Property tests**: `*.property.test.ts` - Invariant testing with fast-check
- **Integration tests**: `tests/integration/` - Public API validation
- **E2E tests**: `tests/e2e/` - Full user flows with Playwright

### Component Patterns
Components follow consistent patterns:
- Props interface for TypeScript types
- JSDoc comments for documentation
- CSS variables for theming (`--mls-*` prefix)
- Accessibility attributes (ARIA labels, roles)
- Event handlers use `on:` prefix (e.g., `on:click`)

## Key Services and Utilities

### TaskService & EnhancedTaskService
- `TaskService`: Basic task operations with type safety
- `EnhancedTaskService`: Adds promises, timeouts, progress tracking
- Both handle task cancellation, deletion, and status monitoring

### BatchService
- Automatic request batching (1000 items per batch)
- Progress callbacks for long operations
- Error recovery with partial success tracking

### TypedIndex<T>
- Generic wrapper for type-safe index operations
- Automatic document ID generation
- Unified settings management

### Token Generation
- `generateTenantToken()`: Creates JWT tokens for multi-tenancy
- Uses Web Crypto API for signing
- Validates in browser environment only

## Component Hierarchy

### Provider Pattern
```svelte
<MeiliProvider host="..." apiKey="...">
  <!-- All child components have access to client -->
  <BackupManager />
  <TaskWatcher />
</MeiliProvider>
```

### Golden Paths
Pre-configured components for common use cases:
- `QuickStart`: Zero-config setup wizard
- `AdminConsole`: Complete admin interface
- `SearchPlayground`: Interactive search testing

## Security Considerations

### Known Security Issue
**CRITICAL**: `SearchPlayground.svelte` line 163 has an XSS vulnerability via `{@html}` directive. The `renderHighlightedField()` function doesn't properly sanitize HTML. Fix by using DOMPurify or removing `{@html}`.

### General Security Practices
- API keys handled via context, never in components directly
- Token generation validates browser environment
- All user inputs should be sanitized before rendering
- Use Svelte's default escaping, avoid `{@html}` unless sanitized

## Common Workflows

### Adding a New Feature
1. Create folder in `src/lib/features/your-feature/`
2. Add main component and index.ts export
3. Add contract test for API stability
4. Update `src/lib/features/index.ts` barrel export
5. Update main `src/lib/index.ts` if needed

### Adding Design System Component
1. Create in appropriate `design-system/[atoms|molecules|organisms]/`
2. Add unit test next to component
3. Export from category's index.ts
4. Consider adding Storybook story

### Modifying Domain Logic
1. Update service/utility in `meili/`
2. Add/update property-based tests
3. Ensure TypeScript types are complete
4. Check backward compatibility

## Testing MeiliSearch Features

The library includes components for testing experimental MeiliSearch features:
- `HybridSearchTester`: Vector + keyword search testing
- `NetworkFederationConfig`: Multi-instance federation
- `ExperimentalFeatures`: Feature flag management

These require specific MeiliSearch versions or configurations.

## Import Resolution

The library uses path aliases:
- `$lib` → `src/lib`
- `$lib/*` → `src/lib/*`

These are configured in `tsconfig.json` and handled by SvelteKit.

## Performance Patterns

- Virtual scrolling implemented in `LogViewer` for large datasets
- Batch operations use streaming and chunking
- Request debouncing in search components
- Task polling with exponential backoff

## State Management

- Component state uses Svelte 5's `$state()` rune
- Context API for MeiliSearch client sharing
- No external state management library required
- Feature components are self-contained with local state