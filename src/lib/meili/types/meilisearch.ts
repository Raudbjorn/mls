import { MeiliSearch } from "meilisearch";

export interface MeiliClientConfig {
  host: string;
  apiKey: string;
}

export interface MeiliTask {
  taskUid: number;
  indexUid?: string;
  status: "enqueued" | "processing" | "succeeded" | "failed" | "canceled";
  type: string;
  duration?: string;
  enqueuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  error?: {
    message: string;
    code: string;
    type: string;
    link: string;
  };
  details?: Record<string, any>;
}

export interface MeiliContext {
  client: MeiliSearch;
  hasAdminRights: boolean;
  host: string;
}

export interface TaskQueueItem extends MeiliTask {
  // Add any UI-specific fields if needed
}

// Chat Types
export interface ChatWorkspace {
  id: string;
  name: string;
  model: string;
  systemPrompt?: string;
}

export interface ChatSettings {
  enabled: boolean;
  defaultWorkspaceId?: string;
}

// Webhook Types
export interface Webhook {
  id: string;
  url: string;
  events?: string[];
  headers?: Record<string, string>;
}

export interface WebhookUpdate {
  url?: string;
  events?: string[];
  headers?: Record<string, string>;
}

// Batch Types
export interface BatchStats {
  totalSize: number;
  writeChannelCongestion?: number;
  embedderRequests?: {
    succeeded: number;
    failed: number;
    total: number;
  };
}

export interface Batch {
  uid: number;
  status: string;
  type: string;
  duration: number;
  stats?: BatchStats;
  details?: {
    progress?: Record<string, number | string>;
  };
}

// Network/Federation Types
export interface RemoteConfig {
  url: string;
  searchApiKey: string;
  name: string;
}

export interface Network {
  self: string;
  remotes: RemoteConfig[];
}

// --- Type Guards ---

export function isTaskStatus(status: unknown): status is MeiliTask['status'] {
  return (
    typeof status === 'string' &&
    ['enqueued', 'processing', 'succeeded', 'failed', 'canceled'].includes(status)
  );
}

export function isMeiliTask(obj: unknown): obj is MeiliTask {
  if (typeof obj !== 'object' || obj === null) return false;
  const task = obj as MeiliTask;
  return (
    typeof task.taskUid === 'number' &&
    typeof task.type === 'string' &&
    typeof task.enqueuedAt === 'string' &&
    isTaskStatus(task.status)
  );
}

export function isWebhook(obj: unknown): obj is Webhook {
  if (typeof obj !== 'object' || obj === null) return false;
  const hook = obj as Webhook;
  return typeof hook.id === 'string' && typeof hook.url === 'string';
}

export function isBatch(obj: unknown): obj is Batch {
  if (typeof obj !== 'object' || obj === null) return false;
  const batch = obj as Batch;
  return (
    typeof batch.uid === 'number' &&
    typeof batch.status === 'string' &&
    typeof batch.type === 'string' &&
    typeof batch.duration === 'number'
  );
}

export function isNetwork(obj: unknown): obj is Network {
  if (typeof obj !== 'object' || obj === null) return false;
  const net = obj as Network;
  return (
    typeof net.self === 'string' &&
    Array.isArray(net.remotes) &&
    net.remotes.every(isRemoteConfig)
  );
}

export function isRemoteConfig(obj: unknown): obj is RemoteConfig {
  if (typeof obj !== 'object' || obj === null) return false;
  const remote = obj as RemoteConfig;
  return (
    typeof remote.url === 'string' &&
    typeof remote.searchApiKey === 'string' &&
    typeof remote.name === 'string'
  );
}