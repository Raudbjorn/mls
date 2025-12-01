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
