# Atomic Design Migration Plan

## Component Classification

### Feature-Level Components (organisms → features/)
- **BackupManager.svelte** → features/backup/
- **BatchMonitor.svelte** → features/tasks/
- **ExperimentalFeatures.svelte** → features/experimental/
- **HybridSearchTester.svelte** → features/search/
- **IndexSwapper.svelte** → features/indexes/
- **KeyManager.svelte** → features/security/
- **LogStreamer.svelte** → features/monitoring/
- **MeiliProvider.svelte** → features/provider/ (special case - context provider)
- **MeiliSettings.svelte** → features/settings/ (main settings orchestrator)
- **MeiliTaskWatcher.svelte** → features/tasks/
- **NetworkFederationConfig.svelte** → features/network/
- **SystemHealth.svelte** → features/health/
- **WebhookManager.svelte** → features/webhooks/

### Settings Sub-components (organisms → features/settings/)
- **EmbedderConfig.svelte**
- **FilterAttributeConfig.svelte**
- **LocalizedAttributesConfig.svelte**
- **RankingRulesEditor.svelte**
- **SearchDisplayConfig.svelte**
- **SynonymManager.svelte**
- **TypoToleranceEditor.svelte**
- **VectorIndexConfig.svelte**

### Domain Layer (→ meili/)
#### Services
- BatchService.ts
- EnhancedTaskService.ts
- TaskService.ts (+ test)
- TypedIndex.ts

#### Utils
- api.ts
- extended-api.ts
- token.ts

#### Types
- meilisearch.ts

#### Errors
- index.ts

## Atoms to Extract (common UI patterns)
- Button (various states: primary, danger, disabled)
- Card (container with optional header)
- Badge (status indicators)
- Input (text, number, with labels)
- Toggle/Switch
- LoadingSpinner
- ErrorMessage
- SuccessMessage

## Molecules to Extract (composite patterns)
- SettingRow (label + description + control)
- FormField (label + input + error)
- StatusBadge (icon + text + color)
- ActionBar (buttons group)
- DataTable (with pagination)
- ConfirmDialog
- JsonEditor

## Migration Steps
1. ✅ Create folder structure
2. ✅ Move domain layer to meili/
3. ✅ Extract atoms
4. ✅ Extract molecules
5. ✅ Move feature components
6. ✅ Update imports
7. ✅ Update tests
8. ✅ Create barrel exports