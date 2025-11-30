// Core components
export { default as MeiliProvider } from './components/MeiliProvider.svelte';
export { default as MeiliSettings } from './components/MeiliSettings.svelte';
export { default as MeiliTaskWatcher } from './components/MeiliTaskWatcher.svelte';

// Administrative components
export { default as BackupManager } from './components/BackupManager.svelte';
export { default as BatchMonitor } from './components/BatchMonitor.svelte';
export { default as ExperimentalFeatures } from './components/ExperimentalFeatures.svelte';
export { default as HybridSearchTester } from './components/HybridSearchTester.svelte';
export { default as IndexSwapper } from './components/IndexSwapper.svelte';
export { default as KeyManager } from './components/KeyManager.svelte';
export { default as LogStreamer } from './components/LogStreamer.svelte';
export { default as NetworkFederationConfig } from './components/NetworkFederationConfig.svelte';
export { default as SystemHealth } from './components/SystemHealth.svelte';
export { default as WebhookManager } from './components/WebhookManager.svelte';

// Settings components
export { default as EmbedderConfig } from './components/settings/EmbedderConfig.svelte';
export { default as FilterAttributeConfig } from './components/settings/FilterAttributeConfig.svelte';
export { default as RankingRulesEditor } from './components/settings/RankingRulesEditor.svelte';
export { default as SearchDisplayConfig } from './components/settings/SearchDisplayConfig.svelte';
export { default as SynonymManager } from './components/settings/SynonymManager.svelte';
export { default as TypoToleranceEditor } from './components/settings/TypoToleranceEditor.svelte';
export { default as VectorIndexConfig } from './components/settings/VectorIndexConfig.svelte';

// Services
export { TaskService } from './services/TaskService';
export type { TaskServiceOptions, TaskCompletionCallback } from './services/TaskService';

// Utilities
export { createApiClient } from './utils/api';
export type {
  ApiClient,
  ClientConfig,
  WebhookListResponse,
  BatchListResponse,
  CreateWebhookPayload,
  UpdateNetworkPayload
} from './utils/api';

// Types
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
} from './types/meilisearch';