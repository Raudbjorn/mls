# Test Implementation Tasks

This document outlines actionable test implementation tasks for the MLS (MeiliSearch Library for Svelte) project. Tests are organized by priority and implementation layer.

**Testing Framework:** Vitest
**Property Testing:** fast-check
**E2E Testing:** Playwright
**Coverage Tool:** @vitest/coverage-v8

---

## Implementation Strategy

### Priority Order
1. **Domain Layer (Meili Services)** - Foundation for all other tests
2. **Feature Components** - Depend on domain services
3. **Design System (Atoms → Molecules → Organisms)** - Atomic design hierarchy
4. **Integration Tests** - Validate public API contracts
5. **E2E Tests** - Complete user workflows

### Testing Patterns

#### Unit Test Pattern (Services)
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('ServiceName', () => {
  beforeEach(() => {
    vi.useFakeTimers(); // For time-dependent tests
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('method name', () => {
    it('should do expected behavior', () => {
      // Arrange: Set up test data
      // Act: Call the method
      // Assert: Verify the result
    });
  });
});
```

#### Svelte Component Test Pattern
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import Component from './Component.svelte';

describe('Component', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      render(Component, { props: { } });
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });
});
```

#### Property-Based Test Pattern
```typescript
import * as fc from 'fast-check';

it('should handle pagination for any array size', () => {
  fc.assert(
    fc.property(fc.array(fc.anything()), (items) => {
      const pagination = calculatePagination(items, 10);
      // Invariant: totalPages >= 1
      expect(pagination.totalPages).toBeGreaterThanOrEqual(1);
    })
  );
});
```

---

## Phase 1: Domain Layer (Meili Services)

### TIER 1: Core Task Management

#### Task 1.1: EnhancedTaskService Tests
**File:** `src/lib/meili/services/EnhancedTaskService.test.ts`
**Priority:** CRITICAL - Core service for async task operations
**Status:** ❌ STUB (26 test cases)
**Lines of Code:** ~300-400 expected

**Acceptance Criteria:**
- [ ] All 26 `it.todo()` tests have implementations
- [ ] Service successfully waits for single task completion
- [ ] Service handles batch task waits (multiple UIDs)
- [ ] Timeout handling works correctly (throws `MlsTaskTimeoutError`)
- [ ] Custom polling intervals are respected
- [ ] Task chaining with `.then()` works correctly
- [ ] Errors propagate correctly through chains
- [ ] Memory cleanup on service destroy
- [ ] Tests use fake timers for time-dependent operations
- [ ] All error cases covered (invalid tasks, timeouts, polling errors)

**Test Sections to Implement:**
1. `waitForTask` - Single task waiting
   - [ ] Success case
   - [ ] Failure case
   - [ ] Timeout case
   - [ ] Polling interval custom option

2. `waitForTasks` - Batch operations
   - [ ] All tasks complete
   - [ ] One task fails
   - [ ] Results returned in order

3. Task chaining
   - [ ] Sequential `.then()` operations
   - [ ] Error propagation in chain
   - [ ] Cancel/abort scenarios

4. Polling behavior
   - [ ] Exponential backoff (if implemented)
   - [ ] Max polling errors handling
   - [ ] Task status transitions

**Mock Pattern:**
```typescript
const mockClient = {
  getTask: vi.fn().mockResolvedValue({
    taskUid: 1,
    status: 'succeeded',
    type: 'indexCreation',
    enqueuedAt: new Date().toISOString(),
  })
};
```

**Related Files:**
- Implementation: `src/lib/meili/services/EnhancedTaskService.ts`
- Related Service: `src/lib/meili/services/TaskService.test.ts` (reference implementation)
- Error Types: `src/lib/meili/errors/index.ts`

---

#### Task 1.2: BatchService Tests
**File:** `src/lib/meili/services/BatchService.test.ts`
**Priority:** CRITICAL - Required for bulk operations
**Status:** ❌ STUB (20+ test cases)
**Lines of Code:** ~250-350 expected

**Acceptance Criteria:**
- [ ] All test.todo() tests have implementations
- [ ] Batching logic correctly groups items (1000 per batch)
- [ ] Progress callbacks fire for each batch
- [ ] Error recovery with partial success tracked
- [ ] Memory cleanup after batch operations
- [ ] Concurrent batch operations don't conflict
- [ ] Large dataset handling (10k+ items)
- [ ] Edge cases: empty batch, single item, exactly 1000 items

**Test Sections to Implement:**
1. Batch creation & grouping
   - [ ] Auto-batches at 1000 items
   - [ ] Respects custom batch size
   - [ ] Single batch for <1000 items

2. Progress tracking
   - [ ] Progress callback fires for each batch
   - [ ] Progress values 0-100%
   - [ ] Final callback on completion

3. Error handling
   - [ ] Partial success (some items fail)
   - [ ] Batch-level failures
   - [ ] Retry logic (if implemented)

4. Performance
   - [ ] Large dataset handling
   - [ ] Memory doesn't grow unbounded
   - [ ] Streaming for very large datasets

**Related Files:**
- Implementation: `src/lib/meili/services/BatchService.ts`
- Error Types: `src/lib/meili/errors/index.ts`

---

#### Task 1.3: TypedIndex Tests
**File:** `src/lib/meili/services/TypedIndex.test.ts`
**Priority:** HIGH - Generic index wrapper
**Status:** ❌ STUB (15+ test cases)
**Lines of Code:** ~200-300 expected

**Acceptance Criteria:**
- [ ] Generic type safety maintained through operations
- [ ] Automatic document ID generation when needed
- [ ] Index settings management works
- [ ] CRUD operations preserve types
- [ ] Search operations work with typed documents
- [ ] Batch updates with type checking

**Test Sections to Implement:**
1. Type safety
   - [ ] Generic type T preserved in searches
   - [ ] Type inference in CRUD methods

2. Document operations
   - [ ] Add documents with auto-ID
   - [ ] Update documents
   - [ ] Delete documents
   - [ ] Get single document

3. Settings management
   - [ ] Get index settings
   - [ ] Update settings
   - [ ] Reset settings

4. Search operations
   - [ ] Search preserves document type
   - [ ] Faceted search with types
   - [ ] Filter expressions

**Related Files:**
- Implementation: `src/lib/meili/services/TypedIndex.ts`
- Property Tests: `src/lib/meili/services/TypedIndex.property.test.ts` (reference)

---

### TIER 2: Utilities & Error Handling

#### Task 1.4: Error Classes Tests
**File:** `src/lib/meili/errors/index.test.ts`
**Priority:** HIGH - Error handling foundation
**Status:** ❌ STUB (12+ test cases)
**Lines of Code:** ~150-200 expected

**Acceptance Criteria:**
- [ ] All custom error classes instantiate correctly
- [ ] Error messages are descriptive
- [ ] Stack traces are preserved
- [ ] instanceof checks work for all error types
- [ ] Error conversion utilities work
- [ ] Error context data is accessible

**Test Sections to Implement:**
1. Error class instantiation
   - [ ] MlsError base class
   - [ ] MlsApiError (HTTP responses)
   - [ ] MlsTaskTimeoutError
   - [ ] MlsRequestTimeoutError
   - [ ] MlsBatchError
   - [ ] MlsTokenError

2. Error properties
   - [ ] message property set correctly
   - [ ] name property matches class
   - [ ] Cause/context data accessible
   - [ ] HTTP status codes preserved (for API errors)

3. Error checking
   - [ ] instanceof checks work
   - [ ] Error type guards function correctly

**Related Files:**
- Implementation: `src/lib/meili/errors/index.ts`

---

#### Task 1.5: Utility Functions - Token Generation
**File:** `src/lib/meili/utils/token.test.ts`
**Priority:** MEDIUM - Partially implemented
**Status:** ✅ PARTIALLY COMPLETE

**Assessment:**
- Core token generation already tested
- Additional test cases needed for:
  - [ ] Edge cases in search rule validation
  - [ ] Token expiration scenarios
  - [ ] Multi-tenant token isolation
  - [ ] Token revocation (if implemented)

**Related Files:**
- Implementation: `src/lib/meili/utils/token.ts`

---

#### Task 1.6: API Client Tests
**File:** `src/lib/meili/utils/api.test.ts`
**Priority:** MEDIUM - Partially implemented
**Status:** ✅ PARTIALLY COMPLETE

**Assessment:**
- Basic tests already present
- Property-based tests in `api.property.test.ts`
- Additional needed:
  - [ ] Request retry logic
  - [ ] Rate limiting handling
  - [ ] Request/response interceptors
  - [ ] Error response parsing

**Related Files:**
- Implementation: `src/lib/meili/utils/api.ts`
- Property Tests: `src/lib/meili/utils/api.property.test.ts`

---

#### Task 1.7: Extended API Tests
**File:** `src/lib/meili/utils/extended-api.test.ts`
**Priority:** MEDIUM - Partially implemented
**Status:** ✅ PARTIALLY COMPLETE

**Assessment:**
- Basic structure present
- Additional endpoints need testing:
  - [ ] Hybrid search
  - [ ] Faceted search
  - [ ] Similar documents
  - [ ] Chat completions (experimental)
  - [ ] Webhook management

**Related Files:**
- Implementation: `src/lib/meili/utils/extended-api.ts`

---

#### Task 1.8: Types Validation Tests
**File:** `src/lib/meili/types/meilisearch.test.ts`
**Priority:** LOW - Type definition validation
**Status:** ❌ STUB (8+ test cases)
**Lines of Code:** ~100-150 expected

**Acceptance Criteria:**
- [ ] Type definitions are correct
- [ ] Discriminated unions work
- [ ] Optional fields are truly optional
- [ ] Type guards function correctly

**Test Sections to Implement:**
1. Type structure validation
   - [ ] MeiliTask shape validation
   - [ ] MeiliClientConfig validation
   - [ ] Webhook shape validation
   - [ ] Batch shape validation

**Related Files:**
- Implementation: `src/lib/meili/types/meilisearch.ts`

---

## Phase 2: Feature Components

### Task 2.1: BackupManager Tests
**File:** `src/lib/features/backup/BackupManager.test.ts`
**Priority:** HIGH - Critical admin feature
**Status:** ❌ STUB (18+ test cases)
**Lines of Code:** ~250-350 expected

**Acceptance Criteria:**
- [ ] Backup creation workflow
- [ ] Backup download functionality
- [ ] Backup import/restore workflow
- [ ] Progress tracking during backup operations
- [ ] Error handling and recovery
- [ ] Component renders with MeiliProvider context
- [ ] User interactions work correctly
- [ ] Modal/dialog behavior for confirmations

**Test Sections to Implement:**
1. Backup operations
   - [ ] Create backup
   - [ ] List available backups
   - [ ] Download backup
   - [ ] Restore from backup
   - [ ] Delete backup

2. UI interactions
   - [ ] Buttons render and are clickable
   - [ ] Progress indication during long operations
   - [ ] Confirmation dialogs work
   - [ ] Error messages display

3. State management
   - [ ] Loading states update correctly
   - [ ] Success/error states handled
   - [ ] Data refreshed after operations

**Mock Pattern:**
Use Svelte testing library with context mocking:
```typescript
render(BackupManager, {
  props: { },
  context: new Map([
    ['meili', { client: mockClient }]
  ])
});
```

**Related Files:**
- Implementation: `src/lib/features/backup/BackupManager.svelte`
- Contract Test: `src/lib/features/backup/BackupManager.contract.test.ts` (reference)
- Service: `src/lib/meili/utils/api.ts`

---

### Task 2.2: MeiliTaskWatcher Tests
**File:** `src/lib/features/tasks/MeiliTaskWatcher.test.ts`
**Priority:** HIGH - Core monitoring feature
**Status:** ❌ STUB (15+ test cases)
**Lines of Code:** ~200-300 expected

**Acceptance Criteria:**
- [ ] Monitors running tasks correctly
- [ ] Updates when tasks complete
- [ ] Shows task status changes
- [ ] Handles task cancellation
- [ ] Cleans up on component destroy
- [ ] Displays task progress
- [ ] Shows task errors

**Test Sections to Implement:**
1. Task monitoring
   - [ ] Track task status
   - [ ] Handle status transitions
   - [ ] Update on polling interval

2. UI updates
   - [ ] Status display updates
   - [ ] Progress bar updates
   - [ ] Error messages shown

3. Lifecycle
   - [ ] Start monitoring on mount
   - [ ] Stop polling on destroy
   - [ ] Handle component remounting

**Related Files:**
- Implementation: `src/lib/features/tasks/MeiliTaskWatcher.svelte`
- Related Service: `src/lib/meili/services/EnhancedTaskService.ts`

---

### Task 2.3: BatchMonitor Tests
**File:** `src/lib/features/tasks/BatchMonitor.test.ts`
**Priority:** MEDIUM - Batch operation monitoring
**Status:** ❌ STUB (12+ test cases)
**Lines of Code:** ~200-250 expected

**Acceptance Criteria:**
- [ ] Displays batch operations
- [ ] Shows progress for each batch
- [ ] Handles batch completion
- [ ] Displays errors for failed batches
- [ ] Shows overall progress
- [ ] Cancels batch operations

**Test Sections to Implement:**
1. Batch tracking
   - [ ] Display multiple batches
   - [ ] Track individual batch progress
   - [ ] Show batch status

2. Progress indication
   - [ ] Overall progress calculation
   - [ ] Per-batch progress display
   - [ ] ETA calculation (if implemented)

3. User actions
   - [ ] Cancel operation
   - [ ] Pause operation (if supported)
   - [ ] Clear completed batches

**Related Files:**
- Implementation: `src/lib/features/tasks/BatchMonitor.svelte`
- Service: `src/lib/meili/services/BatchService.ts`

---

### Task 2.4: HybridSearchTester Tests
**File:** `src/lib/features/search/HybridSearchTester.test.ts`
**Priority:** MEDIUM - Experimental search feature
**Status:** ❌ STUB (14+ test cases)
**Lines of Code:** ~200-300 expected

**Acceptance Criteria:**
- [ ] Renders search interface
- [ ] Accepts search query
- [ ] Configures semantic ratio
- [ ] Sets ranking score threshold
- [ ] Specifies embedder
- [ ] Applies filters and facets
- [ ] Displays search results
- [ ] Shows facet distribution
- [ ] Handles errors gracefully

**Test Sections to Implement:**
1. Input handling
   - [ ] Query input binding
   - [ ] Semantic ratio slider (0-1)
   - [ ] Ranking score threshold input
   - [ ] Embedder selection
   - [ ] Filter expression parsing
   - [ ] Facets configuration

2. Search execution
   - [ ] Debounced search on input
   - [ ] Manual search button
   - [ ] Loading state during search

3. Results display
   - [ ] Results render correctly
   - [ ] Facet distribution display
   - [ ] Ranking scores shown
   - [ ] Search metrics (time, hits)

4. Error handling
   - [ ] Error messages display
   - [ ] Invalid queries handled
   - [ ] Missing embedder error

**Related Files:**
- Implementation: `src/lib/features/search/HybridSearchTester.svelte`
- Extended API: `src/lib/meili/utils/extended-api.ts`

---

### Task 2.5: MeiliSettings Tests
**File:** `src/lib/features/settings/MeiliSettings.test.ts`
**Priority:** MEDIUM - Settings management UI
**Status:** ❌ STUB (16+ test cases)
**Lines of Code:** ~250-350 expected

**Acceptance Criteria:**
- [ ] Displays current settings
- [ ] Updates individual settings
- [ ] Saves changes
- [ ] Cancels unsaved changes
- [ ] Shows validation errors
- [ ] Manages ranking rules
- [ ] Configures facet filters
- [ ] Handles typo tolerance settings

**Test Sections to Implement:**
1. Settings display
   - [ ] Load settings on mount
   - [ ] Display current values
   - [ ] Update form state

2. Settings modification
   - [ ] Update individual settings
   - [ ] Validate user input
   - [ ] Track unsaved changes

3. Persistence
   - [ ] Save settings to server
   - [ ] Reset to previous state on error
   - [ ] Confirm changes with user

4. Special cases
   - [ ] Ranking rules array handling
   - [ ] Nested settings objects
   - [ ] Optional settings defaults

**Related Files:**
- Implementation: `src/lib/features/settings/MeiliSettings.svelte`
- Settings Components: `src/lib/features/settings/*.svelte`

---

### Task 2.6: ExperimentalFeatures Tests
**File:** `src/lib/features/experimental/ExperimentalFeatures.test.ts`
**Priority:** LOW - Experimental features UI
**Status:** ❌ STUB (10+ test cases)
**Lines of Code:** ~150-200 expected

**Acceptance Criteria:**
- [ ] Lists available experimental features
- [ ] Enables/disables features
- [ ] Shows feature descriptions
- [ ] Confirms warnings for risky features
- [ ] Persists feature selection

**Related Files:**
- Implementation: `src/lib/features/experimental/ExperimentalFeatures.svelte`
- Types: `src/lib/meili/utils/extended-api.ts`

---

### Task 2.7: NetworkFederationConfig Tests
**File:** `src/lib/features/network/NetworkFederationConfig.test.ts`
**Priority:** LOW - Advanced networking feature
**Status:** ❌ STUB (12+ test cases)
**Lines of Code:** ~200-250 expected

**Acceptance Criteria:**
- [ ] Configures network federation
- [ ] Adds/removes federation nodes
- [ ] Displays node status
- [ ] Validates node configuration
- [ ] Shows federation metrics

**Related Files:**
- Implementation: `src/lib/features/network/NetworkFederationConfig.svelte`
- Extended API: `src/lib/meili/utils/extended-api.ts`

---

## Phase 3: Design System Components

> **Testing Approach for Design System:** Use `@testing-library/svelte` with focus on:
> - Component rendering with different props
> - User interactions (click, keyboard, form input)
> - Accessibility attributes (ARIA labels, roles)
> - Visual states (disabled, loading, error)
> - Slot rendering (named and default slots)

### Atom Tests (7 components, ~50 tests total)

#### Task 3.1: Button.test.ts
**File:** `src/lib/design-system/atoms/Button.test.ts`
**Status:** ❌ STUB (21 tests)
**Lines of Code:** ~250 expected

**Test Categories:**
1. Rendering (5 tests)
   - [ ] Default props
   - [ ] Variants (primary, secondary, danger, ghost)
   - [ ] Sizes (small, medium, large)
   - [ ] Icon slot
   - [ ] Loading state with spinner

2. Behavior (3 tests)
   - [ ] Click event handling
   - [ ] Disabled state prevention
   - [ ] Loading state prevention

3. Keyboard (3 tests)
   - [ ] Enter key activation
   - [ ] Space key activation
   - [ ] Focus management

4. Accessibility (4 tests)
   - [ ] aria-disabled when disabled
   - [ ] aria-busy when loading
   - [ ] aria-label for icon-only
   - [ ] role="button"

---

#### Task 3.2: Input/TextField.test.ts
**File:** `src/lib/design-system/atoms/TextField.test.ts`
**Status:** ❌ STUB (18 tests)

**Test Categories:**
1. Rendering
   - [ ] Text input field
   - [ ] Placeholder text
   - [ ] Initial value
   - [ ] Label association

2. Behavior
   - [ ] Input value binding
   - [ ] Change events
   - [ ] Clear functionality
   - [ ] Focus management

3. Validation
   - [ ] Required field error
   - [ ] Pattern validation
   - [ ] Min/max length

4. Accessibility
   - [ ] aria-invalid for errors
   - [ ] aria-describedby for hints
   - [ ] label association

---

#### Task 3.3: Select.test.ts
**File:** `src/lib/design-system/atoms/Select.test.ts`
**Status:** ❌ STUB (16 tests)

**Test Categories:**
1. Rendering
   - [ ] Select dropdown
   - [ ] Option list
   - [ ] Default selection
   - [ ] Disabled state

2. Behavior
   - [ ] Selection changes
   - [ ] Dropdown open/close
   - [ ] Keyboard navigation (arrow keys)
   - [ ] Enter to select

3. Content
   - [ ] Renders options correctly
   - [ ] Groups options (optgroup)
   - [ ] Custom option rendering

4. Accessibility
   - [ ] Keyboard navigation
   - [ ] ARIA attributes
   - [ ] Label association

---

#### Task 3.4: Toggle.test.ts
**File:** `src/lib/design-system/atoms/Toggle.test.ts`
**Status:** ❌ STUB (12 tests)

**Test Categories:**
1. Rendering
   - [ ] Checked/unchecked states
   - [ ] Disabled state
   - [ ] Label text

2. Behavior
   - [ ] Toggle on click
   - [ ] Keyboard activation
   - [ ] Controlled vs uncontrolled

3. Accessibility
   - [ ] aria-checked
   - [ ] role="switch"
   - [ ] Keyboard focusable

---

#### Task 3.5: Card.test.ts
**File:** `src/lib/design-system/atoms/Card.test.ts`
**Status:** ❌ STUB (10 tests)

**Test Categories:**
1. Rendering
   - [ ] Card structure
   - [ ] Default styling
   - [ ] Variant styles
   - [ ] Slot content

2. Behavior
   - [ ] Click handling
   - [ ] Hover states
   - [ ] Focus states

---

#### Task 3.6: Icon.test.ts
**File:** `src/lib/design-system/atoms/Icon.test.ts`
**Status:** ❌ STUB (8 tests)

**Test Categories:**
1. Rendering
   - [ ] Icon display
   - [ ] Size prop
   - [ ] Color prop
   - [ ] SVG rendering

2. Accessibility
   - [ ] aria-hidden for decorative
   - [ ] aria-label when semantic

---

#### Task 3.7: Tag/Badge.test.ts
**File:** `src/lib/design-system/atoms/Tag.test.ts`
**Status:** ❌ STUB (12 tests)

**Test Categories:**
1. Rendering
   - [ ] Text content
   - [ ] Variants
   - [ ] Size options
   - [ ] Close button (optional)

2. Behavior
   - [ ] Close/remove event
   - [ ] Clickable state

---

### Molecule Tests (7 components, ~50 tests total)

#### Task 3.8: SearchInput.test.ts
**File:** `src/lib/design-system/molecules/SearchInput.test.ts`
**Status:** ❌ STUB (14 tests)

**Test Categories:**
1. Rendering
   - [ ] Input with icon
   - [ ] Placeholder
   - [ ] Clear button
   - [ ] Loading spinner (optional)

2. Behavior
   - [ ] Input value binding
   - [ ] Debounced search event
   - [ ] Clear button functionality
   - [ ] Submit on Enter

3. Accessibility
   - [ ] Proper labeling
   - [ ] ARIA roles

---

#### Task 3.9: Modal/Dialog.test.ts
**File:** `src/lib/design-system/molecules/ConfirmDialog.test.ts`
**Status:** ❌ STUB (16 tests)

**Test Categories:**
1. Rendering
   - [ ] Modal structure
   - [ ] Overlay backdrop
   - [ ] Action buttons
   - [ ] Title and content

2. Behavior
   - [ ] Close button
   - [ ] Backdrop click to close
   - [ ] ESC key to close
   - [ ] Confirm/cancel actions

3. Accessibility
   - [ ] Focus trap
   - [ ] ARIA modal
   - [ ] Keyboard navigation

---

#### Task 3.10: Pagination.test.ts
**File:** `src/lib/design-system/molecules/PaginationControls.test.ts`
**Status:** ❌ STUB (14 tests)

**Test Categories:**
1. Rendering
   - [ ] Page buttons
   - [ ] Previous/next buttons
   - [ ] Current page indicator
   - [ ] Disabled states

2. Behavior
   - [ ] Navigate between pages
   - [ ] Disable at boundaries
   - [ ] Jump to page
   - [ ] Page size selection

3. Invariants (property tests)
   - [ ] currentPage never < 1
   - [ ] currentPage never > totalPages
   - [ ] Proper total pages calculation

---

#### Task 3.11: StatusBadge.test.ts
**File:** `src/lib/design-system/molecules/StatusBadge.test.ts`
**Status:** ❌ STUB (10 tests)

**Test Categories:**
1. Rendering
   - [ ] Status text
   - [ ] Status icon
   - [ ] Color by status
   - [ ] Optional tooltip

2. States
   - [ ] Success, error, warning, info

---

#### Task 3.12: Tooltip.test.ts
**File:** `src/lib/design-system/molecules/Tooltip.test.ts`
**Status:** ❌ STUB (12 tests)

**Test Categories:**
1. Rendering
   - [ ] Content display
   - [ ] Position options
   - [ ] Delay before show

2. Behavior
   - [ ] Show on hover
   - [ ] Hide on mouse leave
   - [ ] Keyboard accessible
   - [ ] Click to toggle (optional)

3. Accessibility
   - [ ] aria-describedby
   - [ ] ARIA live region (optional)

---

#### Task 3.13: KeyValueRow.test.ts
**File:** `src/lib/design-system/molecules/KeyValueRow.test.ts`
**Status:** ❌ STUB (8 tests)

**Test Categories:**
1. Rendering
   - [ ] Key display
   - [ ] Value display
   - [ ] Copy button (optional)
   - [ ] Edit mode (optional)

2. Behavior
   - [ ] Copy to clipboard
   - [ ] Edit/save workflow

---

### Organism Tests (7 components, ~70 tests total)

#### Task 3.14: TaskTable.test.ts
**File:** `src/lib/design-system/organisms/TaskTable.test.ts`
**Status:** ❌ STUB (18 tests)

**Test Categories:**
1. Rendering
   - [ ] Table structure
   - [ ] Column headers
   - [ ] Task rows
   - [ ] Status badges
   - [ ] Action buttons

2. Sorting & Filtering
   - [ ] Click header to sort
   - [ ] Filter by status
   - [ ] Filter by type
   - [ ] Search by task UID

3. Pagination
   - [ ] Load more button
   - [ ] Pagination controls
   - [ ] Page size selection

4. Actions
   - [ ] Cancel task button
   - [ ] Delete task button
   - [ ] Confirmation dialogs

---

#### Task 3.15: IndexListPanel.test.ts
**File:** `src/lib/design-system/organisms/IndexListPanel.test.ts`
**Status:** ❌ STUB (16 tests)

**Test Categories:**
1. Rendering
   - [ ] List of indexes
   - [ ] Index names
   - [ ] Document counts
   - [ ] Create button
   - [ ] Actions menu

2. Interactions
   - [ ] Select index
   - [ ] Delete index
   - [ ] Rename index
   - [ ] View settings

3. Filtering & Search
   - [ ] Search by name
   - [ ] Filter by type
   - [ ] Sort options

---

#### Task 3.16: IndexSettingsPanel.test.ts
**File:** `src/lib/design-system/organisms/IndexSettingsPanel.test.ts`
**Status:** ❌ STUB (14 tests)

**Test Categories:**
1. Rendering
   - [ ] Current settings display
   - [ ] Editable fields
   - [ ] Save/cancel buttons
   - [ ] Reset to defaults

2. Settings Categories
   - [ ] Ranking rules
   - [ ] Searchable attributes
   - [ ] Filterable attributes
   - [ ] Sortable attributes
   - [ ] Faceted search

3. Behavior
   - [ ] Save settings
   - [ ] Validate changes
   - [ ] Show errors
   - [ ] Revert changes

---

#### Task 3.17: ApiKeyTable.test.ts
**File:** `src/lib/design-system/organisms/ApiKeyTable.test.ts`
**Status:** ❌ STUB (14 tests)

**Test Categories:**
1. Rendering
   - [ ] API keys list
   - [ ] Key names
   - [ ] Key type (public/private)
   - [ ] Creation date
   - [ ] Expiration date (if applicable)

2. Actions
   - [ ] Copy key to clipboard
   - [ ] Reveal/hide key
   - [ ] Delete key
   - [ ] Edit permissions

3. Creation
   - [ ] Create new key dialog
   - [ ] Permissions selection
   - [ ] Expiration setting
   - [ ] Generated key display

---

#### Task 3.18: HealthOverview.test.ts
**File:** `src/lib/design-system/organisms/HealthOverview.test.ts`
**Status:** ❌ STUB (12 tests)

**Test Categories:**
1. Rendering
   - [ ] Health status summary
   - [ ] Status indicators (healthy/warning/error)
   - [ ] Metrics display
   - [ ] Last update time

2. Metrics
   - [ ] Database health
   - [ ] Index count
   - [ ] Pending tasks
   - [ ] API response time

3. Auto-refresh
   - [ ] Periodic health check
   - [ ] Update display
   - [ ] Handle errors

---

#### Task 3.19: LogViewer.test.ts
**File:** `src/lib/design-system/organisms/LogViewer.test.ts`
**Status:** ❌ STUB (14 tests)

**Test Categories:**
1. Rendering
   - [ ] Log entries list
   - [ ] Timestamps
   - [ ] Log levels (colors)
   - [ ] Message content

2. Features
   - [ ] Scroll to latest
   - [ ] Filter by level
   - [ ] Search in logs
   - [ ] Clear logs
   - [ ] Auto-scroll toggle
   - [ ] Copy log

3. Performance (Virtual Scrolling)
   - [ ] Handles large log sets
   - [ ] Virtualization rendering
   - [ ] Smooth scrolling

---

#### Task 3.20: WebhookTable.test.ts
**File:** `src/lib/design-system/organisms/WebhookTable.test.ts`
**Status:** ❌ STUB (12 tests)

**Test Categories:**
1. Rendering
   - [ ] Webhook list
   - [ ] Event types
   - [ ] Endpoint URL
   - [ ] Status indicator
   - [ ] Last triggered time

2. Actions
   - [ ] Create webhook
   - [ ] Edit webhook
   - [ ] Delete webhook
   - [ ] Test webhook
   - [ ] View delivery history

3. Creation/Editing
   - [ ] Modal form
   - [ ] Event selection
   - [ ] URL input
   - [ ] Headers/auth config

---

### Template Tests (3 components, ~30 tests total)

#### Task 3.21: AdminShell.test.ts
**File:** `src/lib/design-system/templates/AdminShell.test.ts`
**Status:** ❌ STUB (12 tests)

**Test Categories:**
1. Layout
   - [ ] Sidebar navigation
   - [ ] Top header
   - [ ] Main content area
   - [ ] Footer

2. Navigation
   - [ ] Navigate between sections
   - [ ] Active section highlighting
   - [ ] Menu toggle on mobile

3. Context
   - [ ] Provides MeiliProvider
   - [ ] Child components render
   - [ ] Context accessible

---

#### Task 3.22: IndexDashboardTemplate.test.ts
**File:** `src/lib/design-system/templates/IndexDashboardTemplate.test.ts`
**Status:** ❌ STUB (10 tests)

**Test Categories:**
1. Layout
   - [ ] Index list sidebar
   - [ ] Main content area
   - [ ] Settings panel

2. Interactions
   - [ ] Select index updates content
   - [ ] Edit index settings
   - [ ] View index documents

---

#### Task 3.23: SearchPlaygroundTemplate.test.ts
**File:** `src/lib/design-system/templates/SearchPlaygroundTemplate.test.ts`
**Status:** ❌ STUB (8 tests)

**Test Categories:**
1. Layout
   - [ ] Search panel
   - [ ] Results panel
   - [ ] Settings sidebar

2. Search Workflow
   - [ ] Execute search
   - [ ] Display results
   - [ ] Adjust search params

---

## Phase 4: Integration Tests

> **Integration Tests** validate the public API and component interactions without mocking internal services.

#### Task 4.1: Public API Tests
**File:** `tests/integration/public-api.integration.test.ts`
**Status:** ✅ IMPLEMENTED (Reference for other integration tests)

**Assessment:** Already complete - validates export structure and component shapes.

---

#### Task 4.2: Library Exports Integration
**File:** `tests/integration/library-exports.integration.test.ts`
**Status:** ✅ IMPLEMENTED

**Assessment:** Already validates all exports are present and correctly structured.

---

#### Task 4.3: MeiliProvider Context Integration
**File:** `tests/integration/meili-provider.integration.test.ts`
**Status:** ✅ IMPLEMENTED

**Assessment:** Tests provider context setup and accessibility to child components.

---

#### Task 4.4: Service Client Integration
**File:** `tests/integration/service-client.integration.test.ts`
**Status:** ✅ IMPLEMENTED

**Assessment:** Validates services can be instantiated and used with real client shape.

---

#### Task 4.5: Golden Paths Integration
**File:** `tests/integration/golden-paths.integration.test.ts`
**Status:** ✅ IMPLEMENTED

**Assessment:** Tests QuickStart, AdminConsole, SearchPlayground components.

---

## Phase 5: E2E Tests

> **E2E Tests** require a running MeiliSearch instance. Use Playwright for browser automation.

#### Task 5.1: MeiliSearch Admin Flow
**File:** `tests/e2e/meili-admin-flow.spec.ts`
**Priority:** HIGH
**Status:** ❌ STUB (~8 test scenarios)

**Test Scenarios:**
1. Setup & Authentication
   - [ ] Connect to MeiliSearch
   - [ ] Verify connection success
   - [ ] Handle connection error

2. Index Management
   - [ ] Create new index
   - [ ] Verify index creation
   - [ ] List indexes
   - [ ] Delete index
   - [ ] Verify deletion

3. Document Operations
   - [ ] Add documents
   - [ ] Update documents
   - [ ] Delete documents
   - [ ] Bulk import

4. Task Management
   - [ ] View running tasks
   - [ ] Monitor task progress
   - [ ] Cancel task
   - [ ] View task history

5. Settings Management
   - [ ] View current settings
   - [ ] Update ranking rules
   - [ ] Configure searchable attributes
   - [ ] Set up faceted search

**Setup Required:**
```bash
# Start MeiliSearch for testing
docker run -p 7700:7700 -e MEILI_MASTER_KEY='masterKey' getmeili/meilisearch:latest

# Run E2E tests
npm run test:e2e
```

**Example Test Structure:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('should create index and add documents', async ({ page }) => {
    // 1. Click create index
    // 2. Fill form
    // 3. Submit
    // 4. Verify index created
    // 5. Add documents
    // 6. Verify documents added
  });
});
```

---

#### Task 5.2: Search Playground E2E
**File:** `tests/e2e/search-playground.spec.ts`
**Priority:** HIGH
**Status:** ❌ STUB (~6 test scenarios)

**Test Scenarios:**
1. Search Interface
   - [ ] Load search playground
   - [ ] Select index
   - [ ] Enter search query

2. Basic Search
   - [ ] Execute search
   - [ ] Verify results display
   - [ ] Check result count

3. Advanced Search
   - [ ] Apply filters
   - [ ] Configure facets
   - [ ] Adjust ranking parameters
   - [ ] Set pagination

4. Hybrid Search (Experimental)
   - [ ] Configure semantic ratio
   - [ ] Select embedder
   - [ ] Execute hybrid search
   - [ ] Verify hybrid results

5. Result Interactions
   - [ ] View result details
   - [ ] Copy result
   - [ ] Export results

---

## Testing Best Practices

### Mocking Strategy
- **Unit Tests:** Mock external services (API client, timers)
- **Component Tests:** Mock only necessary context/services
- **Integration Tests:** Minimize mocking, test real interactions
- **E2E Tests:** No mocking, real browser and server

### Test Organization
```
describe('Feature', () => {
  describe('Specific Behavior', () => {
    it('should do one thing', () => {
      // AAA: Arrange, Act, Assert
    });
  });
});
```

### Assertions
- Test behavior, not implementation
- Use semantic matchers: `toBeInTheDocument()`, `toHaveClass()`
- Avoid testing internal state directly

### Async Testing
- Use `async/await` for clarity
- Use `vi.useFakeTimers()` for time-dependent tests
- Clean up with `afterEach()`

### Accessibility Testing
- Test ARIA attributes
- Verify keyboard navigation
- Check focus management
- Use screen reader patterns

---

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Run specific test file
npm test src/lib/meili/services/TaskService.test.ts

# Run in watch mode for TDD
npm run test:unit:watch

# Run with coverage
npm test -- --coverage

# Run only integration tests
npm test tests/integration/

# Run E2E tests
npm run test:e2e

# Run specific test pattern
npm test -- --grep "TaskService"
```

### Coverage Goals
- **Meili Domain:** >85% coverage
- **Features:** >70% coverage
- **Design System:** >60% coverage (visual components harder to test)
- **Overall:** >75% coverage

---

## Task Tracking

### Completion Checklist Format

For each test file, create a checklist:

```
### [TASK_NUMBER]: [Component_Name]
- [ ] Test file created/updated
- [ ] All it.todo() -> actual tests
- [ ] Mocks set up correctly
- [ ] All test cases pass
- [ ] Coverage >80% (or target %)
- [ ] Code review passed
- [ ] Merged to main
```

### Dependency Map

```
TaskService (✅)
    ├── EnhancedTaskService (→ Task 1.1)
    └── MeiliTaskWatcher (→ Task 2.2)

BatchService (→ Task 1.2)
    └── BatchMonitor (→ Task 2.3)

TypedIndex (→ Task 1.3)
    └── All features depending on indexes

Error Classes (→ Task 1.4)
    └── All services

Design System Atoms (→ Task 3.1-3.7)
    └── Molecules (→ Task 3.8-3.13)
        └── Organisms (→ Task 3.14-3.20)
            └── Templates (→ Task 3.21-3.23)

Integration Tests (→ Task 4.x) - After domain layer
E2E Tests (→ Task 5.x) - After everything else
```

---

## Success Metrics

- All test files have >80% implementation (no it.todo() remaining)
- Overall test coverage >75%
- All tests pass on CI/CD
- E2E tests pass with running MeiliSearch
- Code review approved for each test file
- Performance benchmarks met for large datasets

---

## Questions & Clarifications

For ambiguous requirements, refer to:
1. **Implementation file** - See what the code actually does
2. **CLAUDE.md** - Architecture and patterns
3. **Related test files** - Examples of implemented tests
4. **Component props** - TypeScript interfaces define expected behavior

---

**Last Updated:** 2025-12-01
**Total Tasks:** 56
**Estimated Total Tests:** 600+
**Estimated Total LOC:** ~8000-10000
