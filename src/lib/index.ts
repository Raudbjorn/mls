// =============================================================================
// BACKWARD COMPATIBLE EXPORTS - Preserves existing API surface
// =============================================================================

// Core components (migrated to features)
export { default as MeiliProvider } from './features/provider/MeiliProvider.svelte';
export { default as MeiliSettings } from './features/settings/MeiliSettings.svelte';
export { default as MeiliTaskWatcher } from './features/tasks/MeiliTaskWatcher.svelte';

// Administrative components (migrated to features)
export { default as BackupManager } from './features/backup/BackupManager.svelte';
export { default as BatchMonitor } from './features/tasks/BatchMonitor.svelte';
export { default as ExperimentalFeaturesComponent } from './features/experimental/ExperimentalFeatures.svelte';
export { default as HybridSearchTester } from './features/search/HybridSearchTester.svelte';
export { default as IndexSwapper } from './features/indexes/IndexSwapper.svelte';
export { default as KeyManager } from './features/security/KeyManager.svelte';
export { default as LogStreamer } from './features/monitoring/LogStreamer.svelte';
export { default as NetworkFederationConfig } from './features/network/NetworkFederationConfig.svelte';
export { default as SystemHealth } from './features/health/SystemHealth.svelte';
export { default as WebhookManager } from './features/webhooks/WebhookManager.svelte';

// Settings components (migrated to features/settings)
export { default as EmbedderConfig } from './features/settings/EmbedderConfig.svelte';
export { default as FilterAttributeConfig } from './features/settings/FilterAttributeConfig.svelte';
export { default as RankingRulesEditor } from './features/settings/RankingRulesEditor.svelte';
export { default as SearchDisplayConfig } from './features/settings/SearchDisplayConfig.svelte';
export { default as SynonymManager } from './features/settings/SynonymManager.svelte';
export { default as TypoToleranceEditor } from './features/settings/TypoToleranceEditor.svelte';
export { default as VectorIndexConfig } from './features/settings/VectorIndexConfig.svelte';
export { default as LocalizedAttributesConfig } from './features/settings/LocalizedAttributesConfig.svelte';

// Services (migrated to meili/services)
export { TaskService } from './meili/services/TaskService';
export type { TaskServiceOptions, TaskCompletionCallback } from './meili/services/TaskService';
export { EnhancedTaskService } from './meili/services/EnhancedTaskService';
export { BatchService } from './meili/services/BatchService';
export { TypedIndex } from './meili/services/TypedIndex';

// Utilities (migrated to meili/utils)
export { generateTenantToken, validateTenantToken, decodeTenantToken } from './meili/utils/token';
export { createApiClient } from './meili/utils/api';
export { createExtendedApiClient } from './meili/utils/extended-api';
export type {
  ApiClient,
  ClientConfig,
  WebhookListResponse,
  BatchListResponse,
  CreateWebhookPayload,
  UpdateNetworkPayload
} from './meili/utils/api';

// Error classes (migrated to meili/errors)
export {
  MlsError,
  MlsApiError,
  MlsTaskTimeoutError,
  MlsRequestTimeoutError,
  MlsBatchError,
  MlsTokenError
} from './meili/errors';

// Types (migrated to meili/types)
export type {
  MeiliClientConfig,
  MeiliTask,
  MeiliContext,
  TaskQueueItem,
  ChatWorkspace,
  ChatSettings,
  Webhook,
  WebhookUpdate,
  BatchStats,
  Batch,
  RemoteConfig,
  Network
} from './meili/types/meilisearch';

// Export additional types from utilities
export type {
  TenantTokenOptions,
  SearchRules,
  SearchRule
} from './meili/utils/token';

export type {
  WaitOptions,
  EnqueuedTaskPromise
} from './meili/services/EnhancedTaskService';

export type {
  BatchOptions,
  BatchResult
} from './meili/services/BatchService';

export type {
  TypedDocument,
  IndexConfig
} from './meili/services/TypedIndex';

export type {
  ExtendedApiClient,
  ChatWorkspaceSettings,
  ChatMessage,
  ChatCompletionResponse,
  ExportParams,
  MultiSearchParams,
  MultiSearchResponse,
  FederatedSearchParams,
  FederatedSearchResponse,
  SimilarDocumentsParams,
  FacetSearchParams,
  FacetSearchResponse,
  DocumentEdit,
  ExperimentalFeatures
} from './meili/utils/extended-api';

// =============================================================================
// NEW ATOMIC DESIGN STRUCTURE - Organized exports
// =============================================================================

// Design System exports
export * as designSystem from './design-system';
export * as atoms from './design-system/atoms';
export * as molecules from './design-system/molecules';

// Feature exports
export * as features from './features';
export * as backup from './features/backup';
export * as tasks from './features/tasks';
export * as settings from './features/settings';
export * as search from './features/search';
export * as indexes from './features/indexes';
export * as security from './features/security';
export * as monitoring from './features/monitoring';
export * as provider from './features/provider';
export * as network from './features/network';
export * as health from './features/health';
export * as webhooks from './features/webhooks';
export * as experimental from './features/experimental';

// Meili domain layer exports
export * as meili from './meili';

// =============================================================================
// GOLDEN PATHS - Zero-config components for instant productivity
// =============================================================================

// Golden path components for quick starts
export { QuickStart, AdminConsole, SearchPlayground } from './golden-paths';
export * as goldenPaths from './golden-paths';