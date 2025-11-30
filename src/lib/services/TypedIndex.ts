/**
 * Type-safe Index wrapper with generic document support
 * Provides enhanced type safety and additional convenience methods
 */

import type {
  Index,
  SearchResponse,
  SearchParams,
  EnqueuedTask,
  TypoTolerance,
  Faceting,
  PaginationSettings,
} from 'meilisearch';
import type { BatchService } from './BatchService';
import type { EnhancedTaskService } from './EnhancedTaskService';
import { MlsTaskTimeoutError } from '../errors';

export interface TypedDocument {
  id?: string | number;
  [key: string]: any;
}

export interface IndexConfig<T extends TypedDocument> {
  primaryKey?: keyof T;
  searchableAttributes?: Array<keyof T>;
  filterableAttributes?: Array<keyof T>;
  sortableAttributes?: Array<keyof T>;
  displayedAttributes?: Array<keyof T>;
}

export class TypedIndex<T extends TypedDocument = TypedDocument> {
  private index: Index<T>;
  private config?: IndexConfig<T>;
  private batchService?: BatchService;
  private taskService?: EnhancedTaskService;

  constructor(
    index: Index<T>,
    config?: IndexConfig<T>,
    batchService?: BatchService,
    taskService?: EnhancedTaskService
  ) {
    this.index = index;
    this.config = config;
    this.batchService = batchService;
    this.taskService = taskService;
  }

  /**
   * Gets the underlying MeiliSearch index instance
   */
  getRawIndex(): Index<T> {
    return this.index;
  }

  /**
   * Searches the index with type-safe results
   */
  async search(query: string, params?: SearchParams): Promise<SearchResponse<T>> {
    return this.index.search(query, params);
  }

  /**
   * Performs a typed facet search
   *
   * Note: Consider using the MeiliSearch SDK's index.searchForFacetValues() method
   * if available in your SDK version, as it provides better type safety and support.
   */
  async searchFacets(
    facetName: keyof T,
    facetQuery: string,
    params?: {
      filter?: string;
      q?: string;
    }
  ): Promise<Array<{ value: string; count: number }>> {
    // Check if SDK has searchForFacetValues method
    if (typeof (this.index as any).searchForFacetValues === 'function') {
      const options = {
        facetName: String(facetName),
        facetQuery,
        ...params,
      };
      const response = await (this.index as any).searchForFacetValues(options);
      return response.facetHits || [];
    }

    // Fallback for older SDK versions
    const response = await (this.index as any).httpRequest.post(
      `/indexes/${this.index.uid}/facet-search`,
      {
        facetName: String(facetName),
        facetQuery,
        ...params,
      }
    );

    return response.facetHits;
  }

  /**
   * Gets a single document by ID with type safety
   */
  async getDocument(id: string | number): Promise<T> {
    return this.index.getDocument(String(id));
  }

  /**
   * Gets multiple documents with pagination
   */
  async getDocuments(params?: {
    limit?: number;
    offset?: number;
    fields?: Array<keyof T>;
    filter?: string;
  }): Promise<{
    results: T[];
    total: number;
    limit: number;
    offset: number;
  }> {
    const response = await this.index.getDocuments({
      ...params,
      fields: params?.fields?.map(String) as any,
    });

    return {
      results: response.results as T[],
      total: response.total || 0,
      limit: response.limit || 0,
      offset: response.offset || 0,
    };
  }

  /**
   * Adds documents with automatic batching for large datasets
   */
  async addDocuments(
    documents: T[],
    options?: {
      primaryKey?: keyof T;
      batchSize?: number;
      waitForCompletion?: boolean;
    }
  ): Promise<EnqueuedTask | EnqueuedTask[]> {
    const primaryKey = options?.primaryKey || this.config?.primaryKey;

    // Use batch service if available and documents exceed batch size
    if (this.batchService && documents.length > (options?.batchSize || 1000)) {
      const result = await this.batchService.addDocumentsInBatches(this.index, documents, {
        batchSize: options?.batchSize,
        primaryKey: primaryKey ? String(primaryKey) : undefined,
        waitForCompletion: options?.waitForCompletion,
      });
      return result.tasks;
    }

    // Otherwise use regular add
    return this.index.addDocuments(documents, {
      primaryKey: primaryKey ? String(primaryKey) : undefined,
    });
  }

  /**
   * Updates documents with automatic batching
   */
  async updateDocuments(
    documents: Partial<T>[],
    options?: {
      primaryKey?: keyof T;
      batchSize?: number;
      waitForCompletion?: boolean;
    }
  ): Promise<EnqueuedTask | EnqueuedTask[]> {
    const primaryKey = options?.primaryKey || this.config?.primaryKey;

    // Use batch service if available and documents exceed batch size
    if (this.batchService && documents.length > (options?.batchSize || 1000)) {
      const result = await this.batchService.updateDocumentsInBatches(
        this.index,
        documents as any,
        {
          batchSize: options?.batchSize,
          primaryKey: primaryKey ? String(primaryKey) : undefined,
          waitForCompletion: options?.waitForCompletion,
        }
      );
      return result.tasks;
    }

    // Otherwise use regular update
    return this.index.updateDocuments(documents as any, {
      primaryKey: primaryKey ? String(primaryKey) : undefined,
    });
  }

  /**
   * Deletes a document by ID
   */
  async deleteDocument(id: string | number): Promise<EnqueuedTask> {
    return this.index.deleteDocument(String(id));
  }

  /**
   * Deletes multiple documents
   */
  async deleteDocuments(ids: string[] | number[] | { filter: string }): Promise<EnqueuedTask> {
    if (Array.isArray(ids)) {
      return this.index.deleteDocuments(ids.map(String));
    }
    // For filter-based deletion
    return this.index.deleteDocuments(ids);
  }

  /**
   * Deletes all documents
   */
  async deleteAllDocuments(): Promise<EnqueuedTask> {
    return this.index.deleteAllDocuments();
  }

  /**
   * Updates index settings with type-safe attribute names
   */
  async updateSettings(settings: {
    searchableAttributes?: Array<keyof T>;
    filterableAttributes?: Array<keyof T>;
    sortableAttributes?: Array<keyof T>;
    displayedAttributes?: Array<keyof T>;
    rankingRules?: string[];
    stopWords?: string[];
    synonyms?: Record<string, string[]>;
    typoTolerance?: TypoTolerance;
    faceting?: Faceting;
    pagination?: PaginationSettings;
  }): Promise<EnqueuedTask> {
    const mappedSettings: any = { ...settings };

    // Convert keyof T to strings
    if (settings.searchableAttributes) {
      mappedSettings.searchableAttributes = settings.searchableAttributes.map(String);
    }
    if (settings.filterableAttributes) {
      mappedSettings.filterableAttributes = settings.filterableAttributes.map(String);
    }
    if (settings.sortableAttributes) {
      mappedSettings.sortableAttributes = settings.sortableAttributes.map(String);
    }
    if (settings.displayedAttributes) {
      mappedSettings.displayedAttributes = settings.displayedAttributes.map(String);
    }

    return this.index.updateSettings(mappedSettings);
  }

  /**
   * Gets similar documents based on a reference document
   */
  async getSimilarDocuments(
    id: string | number,
    params?: {
      limit?: number;
      filter?: string;
      embedder?: string;
    }
  ): Promise<SearchResponse<T>> {
    return await (this.index as any).httpRequest.post(`/indexes/${this.index.uid}/similar`, {
      id: String(id),
      ...params,
    });
  }

  /**
   * Performs bulk document edits using JSON Patch operations
   */
  async editDocuments(
    edits: Array<{
      id: string | number;
      operations: Array<{
        op: 'add' | 'remove' | 'replace';
        path: string;
        value?: any;
      }>;
    }>
  ): Promise<EnqueuedTask> {
    return await (this.index as any).httpRequest.post(`/indexes/${this.index.uid}/documents/edit`, {
      edits,
    });
  }

  /**
   * Fetches specific documents by their IDs
   */
  async fetchDocuments(ids: (string | number)[]): Promise<T[]> {
    return await (this.index as any).httpRequest.post(
      `/indexes/${this.index.uid}/documents/fetch`,
      { ids: ids.map(String) }
    );
  }

  /**
   * Gets index statistics
   */
  async getStats(): Promise<{
    numberOfDocuments: number;
    isIndexing: boolean;
    fieldDistribution: Record<keyof T, number>;
  }> {
    const stats = await this.index.getStats();
    return {
      numberOfDocuments: stats.numberOfDocuments,
      isIndexing: stats.isIndexing,
      fieldDistribution: stats.fieldDistribution as Record<keyof T, number>,
    };
  }

  /**
   * Waits for a task to complete
   */
  async waitForTask(
    taskUid: number,
    options?: { timeOutMs?: number; intervalMs?: number }
  ): Promise<any> {
    if (this.taskService) {
      return this.taskService.waitForTask(taskUid, options);
    }

    // Fallback to basic polling
    const startTime = Date.now();
    const timeOut = options?.timeOutMs || 5000;
    const interval = options?.intervalMs || 100;

    while (Date.now() - startTime < timeOut) {
      const task = await this.index.getTask(taskUid);
      if (!['enqueued', 'processing'].includes(task.status)) {
        return task;
      }
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    throw new MlsTaskTimeoutError(taskUid, timeOut);
  }

  /**
   * Creates a type guard for documents
   */
  isValidDocument(doc: unknown): doc is T {
    if (typeof doc !== 'object' || doc === null) {
      return false;
    }

    // Check for primary key if configured
    if (this.config?.primaryKey) {
      const primaryKey = String(this.config.primaryKey);
      if (!(primaryKey in doc)) {
        return false;
      }
    }

    return true;
  }
}
