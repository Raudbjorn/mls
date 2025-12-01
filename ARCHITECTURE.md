# MLS Architecture

## Overview

MLS follows an **Atomic Design** pattern combined with **Domain-Driven Design** principles to create a scalable, maintainable component library for MeiliSearch.

## Directory Structure

```
src/lib/
├── design-system/     # Atomic UI components
│   ├── atoms/        # Basic building blocks (Button, Input, Badge)
│   ├── molecules/    # Composed components (SearchInput, ConfirmDialog)
│   ├── organisms/    # Complex UI sections (TaskTable, ApiKeyTable)
│   └── templates/    # Page layouts (AdminShell)
├── features/         # Feature modules
│   ├── backup/      # Backup management feature
│   ├── tasks/       # Task monitoring features
│   ├── settings/    # Settings management
│   └── ...          # Each feature is self-contained
├── meili/           # Domain layer
│   ├── services/    # Business logic (TaskService, BatchService)
│   ├── utils/       # Utilities (token generation, API client)
│   ├── types/       # TypeScript type definitions
│   └── errors/      # Custom error classes
└── index.ts         # Public API surface
```

## Layers

### 1. Design System Layer (`design-system/`)

Pure UI components following Atomic Design:

- **Atoms**: Indivisible UI elements (Button, Input, Badge)
- **Molecules**: Simple combinations of atoms (FormField, SearchInput)
- **Organisms**: Complex, reusable UI sections (TaskTable, ApiKeyTable)
- **Templates**: Page-level layout components (AdminShell)

**Key principles:**
- No business logic
- Pure presentation components
- Fully tested with unit tests
- Accessible by default

### 2. Feature Layer (`features/`)

Domain-specific feature implementations:

- Each feature is a complete, self-contained module
- Combines design-system components with meili services
- Contains feature-specific logic and state management
- Entry points for library consumers

**Examples:**
- `BackupManager`: Complete backup management UI
- `TaskMonitor`: Real-time task monitoring
- `KeyManager`: API key management interface

### 3. Domain Layer (`meili/`)

Core business logic and MeiliSearch integration:

- **Services**: Business logic classes (TaskService, BatchService)
- **Utils**: Helper functions and utilities
- **Types**: TypeScript type definitions for MeiliSearch entities
- **Errors**: Custom error classes for better error handling

**Key principles:**
- Framework-agnostic (could be used outside Svelte)
- Fully typed with TypeScript
- Property-based tested for invariants
- No UI concerns

## Testing Strategy

### Test Types and Locations

1. **Unit Tests** (co-located with source)
   - `*.test.ts` files next to components
   - Test individual components in isolation
   - Mock external dependencies

2. **Contract Tests** (`*.contract.test.ts`)
   - Test feature component interfaces
   - Ensure features maintain stable API
   - Validate integration points

3. **Property-Based Tests** (`*.property.test.ts`)
   - Test domain invariants with fast-check
   - Focus on meili services and utils
   - Generate random inputs to find edge cases

4. **Integration Tests** (`tests/integration/`)
   - Test library-level behavior
   - Validate public API surface
   - Cross-feature interactions

5. **E2E Tests** (`tests/e2e/`)
   - Full user flows
   - Real MeiliSearch instance
   - Browser automation with Playwright

### Testing Philosophy

- **Design System**: Behavior-focused tests (roles, events, accessibility)
- **Features**: Contract tests ensuring stable interfaces
- **Domain**: Property-based tests for invariants
- **Integration**: Public API validation

## Using the Library

### For Feature Consumers

```typescript
import { BackupManager, MeiliProvider } from 'mls';

// Use complete features out of the box
<MeiliProvider config={config}>
  <BackupManager />
</MeiliProvider>
```

### For Custom UI Builders

```typescript
import { designSystem, meili } from 'mls';

// Use design system components
const { Button, SearchInput } = designSystem.molecules;

// Use domain services directly
const taskService = new meili.TaskService(client);
```

### For Advanced Users

```typescript
import { TaskService } from 'mls/meili/services';
import { Button } from 'mls/design-system/atoms';

// Import specific parts for tree-shaking
```

## Development Workflow

1. **Adding a new atom/molecule**:
   - Create component in `design-system/[atoms|molecules]/`
   - Add unit tests next to component
   - Export from barrel file
   - Add to Storybook (if configured)

2. **Adding a new feature**:
   - Create feature folder in `features/`
   - Implement main component
   - Add contract tests
   - Export from feature index

3. **Adding domain logic**:
   - Add to appropriate `meili/` subfolder
   - Include property-based tests
   - Ensure full TypeScript typing

## Public API Stability

The public API is defined in `src/lib/index.ts` and validated by integration tests:

- **Stable**: Top-level component exports (BackupManager, MeiliProvider, etc.)
- **Stable**: Service classes (TaskService, BatchService, etc.)
- **Stable**: Utility functions (createApiClient, generateTenantToken, etc.)
- **Experimental**: May change between minor versions (marked in docs)

## Design Decisions

1. **Atomic Design**: Provides clear component hierarchy and reusability
2. **Feature Modules**: Enables independent development and testing
3. **Domain Layer**: Separates business logic from UI concerns
4. **Co-located Tests**: Keeps tests close to implementation
5. **Property-Based Testing**: Catches edge cases in critical domain logic
6. **TypeScript**: Full type safety throughout the stack

## Performance Considerations

- Components use Svelte's reactivity for efficient updates
- Services implement request batching and debouncing
- Large lists use virtual scrolling (where applicable)
- API clients support request cancellation

## Security

- Token generation uses Web Crypto API
- Input sanitization in all user-facing components
- API keys never logged or exposed in errors
- CORS-aware API client configuration