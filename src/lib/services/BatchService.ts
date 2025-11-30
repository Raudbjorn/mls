/**
 * Batch processing service for efficient document operations
 * Provides memory-efficient batching and streaming capabilities
 */

import type { Index, EnqueuedTask } from 'meilisearch';
import { MlsBatchError } from '../errors';
import type { EnhancedTaskService } from './EnhancedTaskService';

export interface BatchOptions {
  batchSize?: number;
  primaryKey?: string;
  waitForCompletion?: boolean;
  onBatchComplete?: (batchIndex: number, task: EnqueuedTask) => void;
  onBatchError?: (batchIndex: number, error: Error) => void;
}

export interface BatchResult {
  totalBatches: number;
  successfulBatches: number;
  failedBatches: number;
  tasks: EnqueuedTask[];
  errors: Array<{ batchIndex: number; error: Error }>;
}

export class BatchService {
  private defaultBatchSize = 1000;
  private taskService?: EnhancedTaskService;

  constructor(taskService?: EnhancedTaskService) {
    this.taskService = taskService;
  }

  /**
   * Splits documents into batches
   */
  private *createBatches<T>(
    documents: T[],
    batchSize: number
  ): Generator<T[], void, unknown> {
    for (let i = 0; i < documents.length; i += batchSize) {
      yield documents.slice(i, i + batchSize);
    }
  }

  /**
   * Adds documents to an index in batches
   */
  async addDocumentsInBatches<T extends Record<string, any>>(
    index: Index<T>,
    documents: T[],
    options: BatchOptions = {}
  ): Promise<BatchResult> {
    const {
      batchSize = this.defaultBatchSize,
      primaryKey,
      waitForCompletion = false,
      onBatchComplete,
      onBatchError
    } = options;

    const result: BatchResult = {
      totalBatches: Math.ceil(documents.length / batchSize),
      successfulBatches: 0,
      failedBatches: 0,
      tasks: [],
      errors: []
    };

    const successfulBatchIndices: number[] = [];
    let batchIndex = 0;

    for (const batch of this.createBatches(documents, batchSize)) {
      try {
        const task = await index.addDocuments(batch, { primaryKey });
        result.tasks.push(task);
        result.successfulBatches++;
        successfulBatchIndices.push(batchIndex);

        if (onBatchComplete) {
          onBatchComplete(batchIndex, task);
        }

        // Wait for completion if requested
        if (waitForCompletion && this.taskService) {
          await this.taskService.waitForTask(task.taskUid);
        }
      } catch (error) {
        result.failedBatches++;
        const err = error as Error;
        result.errors.push({ batchIndex, error: err });

        if (onBatchError) {
          onBatchError(batchIndex, err);
        }
      }

      batchIndex++;
    }

    if (result.failedBatches > 0) {
      throw new MlsBatchError(
        `${result.failedBatches} out of ${result.totalBatches} batches failed`,
        result.errors.map(e => e.batchIndex),
        successfulBatchIndices
      );
    }

    return result;
  }

  /**
   * Updates documents in an index in batches
   */
  async updateDocumentsInBatches<T extends Record<string, any>>(
    index: Index<T>,
    documents: T[],
    options: BatchOptions = {}
  ): Promise<BatchResult> {
    const {
      batchSize = this.defaultBatchSize,
      primaryKey,
      waitForCompletion = false,
      onBatchComplete,
      onBatchError
    } = options;

    const result: BatchResult = {
      totalBatches: Math.ceil(documents.length / batchSize),
      successfulBatches: 0,
      failedBatches: 0,
      tasks: [],
      errors: []
    };

    const successfulBatchIndices: number[] = [];
    let batchIndex = 0;

    for (const batch of this.createBatches(documents, batchSize)) {
      try {
        const task = await index.updateDocuments(batch, { primaryKey });
        result.tasks.push(task);
        result.successfulBatches++;
        successfulBatchIndices.push(batchIndex);

        if (onBatchComplete) {
          onBatchComplete(batchIndex, task);
        }

        // Wait for completion if requested
        if (waitForCompletion && this.taskService) {
          await this.taskService.waitForTask(task.taskUid);
        }
      } catch (error) {
        result.failedBatches++;
        const err = error as Error;
        result.errors.push({ batchIndex, error: err });

        if (onBatchError) {
          onBatchError(batchIndex, err);
        }
      }

      batchIndex++;
    }

    if (result.failedBatches > 0) {
      throw new MlsBatchError(
        `${result.failedBatches} out of ${result.totalBatches} batches failed`,
        result.errors.map(e => e.batchIndex),
        successfulBatchIndices
      );
    }

    return result;
  }

  /**
   * Deletes documents in batches by their IDs
   */
  async deleteDocumentsInBatches(
    index: Index,
    documentIds: string[] | number[],
    options: Omit<BatchOptions, 'primaryKey'> = {}
  ): Promise<BatchResult> {
    const {
      batchSize = this.defaultBatchSize,
      waitForCompletion = false,
      onBatchComplete,
      onBatchError
    } = options;

    const result: BatchResult = {
      totalBatches: Math.ceil(documentIds.length / batchSize),
      successfulBatches: 0,
      failedBatches: 0,
      tasks: [],
      errors: []
    };

    const successfulBatchIndices: number[] = [];
    let batchIndex = 0;

    for (const batch of this.createBatches(documentIds, batchSize)) {
      try {
        // Convert to string array for the API
        const stringBatch = batch.map(id => String(id));
        const task = await index.deleteDocuments(stringBatch);
        result.tasks.push(task);
        result.successfulBatches++;
        successfulBatchIndices.push(batchIndex);

        if (onBatchComplete) {
          onBatchComplete(batchIndex, task);
        }

        // Wait for completion if requested
        if (waitForCompletion && this.taskService) {
          await this.taskService.waitForTask(task.taskUid);
        }
      } catch (error) {
        result.failedBatches++;
        const err = error as Error;
        result.errors.push({ batchIndex, error: err });

        if (onBatchError) {
          onBatchError(batchIndex, err);
        }
      }

      batchIndex++;
    }

    if (result.failedBatches > 0) {
      throw new MlsBatchError(
        `${result.failedBatches} out of ${result.totalBatches} batches failed`,
        result.errors.map(e => e.batchIndex),
        successfulBatchIndices
      );
    }

    return result;
  }

  /**
   * Processes documents from an async iterator in batches
   * Useful for streaming large datasets
   */
  async *processDocumentStream<T extends Record<string, any>>(
    index: Index<T>,
    documentStream: AsyncIterable<T>,
    operation: 'add' | 'update',
    options: BatchOptions = {}
  ): AsyncGenerator<EnqueuedTask, void, unknown> {
    const {
      batchSize = this.defaultBatchSize,
      primaryKey,
      waitForCompletion = false
    } = options;

    let batch: T[] = [];

    for await (const document of documentStream) {
      batch.push(document);

      if (batch.length >= batchSize) {
        const task = operation === 'add'
          ? await index.addDocuments(batch, { primaryKey })
          : await index.updateDocuments(batch, { primaryKey });

        if (waitForCompletion && this.taskService) {
          await this.taskService.waitForTask(task.taskUid);
        }

        yield task;
        batch = [];
      }
    }

    // Process remaining documents
    if (batch.length > 0) {
      const task = operation === 'add'
        ? await index.addDocuments(batch, { primaryKey })
        : await index.updateDocuments(batch, { primaryKey });

      if (waitForCompletion && this.taskService) {
        await this.taskService.waitForTask(task.taskUid);
      }

      yield task;
    }
  }

  /**
   * Optimizes batch size based on document size and memory constraints
   */
  calculateOptimalBatchSize(
    sampleDocuments: any[],
    maxMemoryMB: number = 10
  ): number {
    if (sampleDocuments.length === 0) {
      return this.defaultBatchSize;
    }

    // Estimate average document size
    const sample = sampleDocuments.slice(0, Math.min(10, sampleDocuments.length));
    const avgDocSize = sample.reduce((sum, doc) =>
      sum + JSON.stringify(doc).length, 0
    ) / sample.length;

    // Calculate batch size based on memory constraint
    const maxBytes = maxMemoryMB * 1024 * 1024;
    const optimalSize = Math.floor(maxBytes / avgDocSize);

    // Clamp between reasonable bounds
    return Math.max(100, Math.min(optimalSize, 10000));
  }
}