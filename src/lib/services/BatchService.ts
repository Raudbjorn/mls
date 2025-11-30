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

    let batchIndex = 0;
    const successfulBatchIndices: number[] = [];

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
        successfulBatchIndices,
        result.errors
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

    let batchIndex = 0;
    const successfulBatchIndices: number[] = [];

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
        successfulBatchIndices,
        result.errors
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

    let batchIndex = 0;
    const successfulBatchIndices: number[] = [];

    for (const batch of this.createBatches(documentIds, batchSize)) {
      try {
        const task = await index.deleteDocuments(batch as string[] | number[]);
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
        successfulBatchIndices,
        result.errors
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
    let batchCount = 0;
    const errors: Array<{ batchIndex: number; error: Error }> = [];

    try {
      for await (const document of documentStream) {
        batch.push(document);

        if (batch.length >= batchSize) {
          try {
            const task = operation === 'add'
              ? await index.addDocuments(batch, { primaryKey })
              : await index.updateDocuments(batch, { primaryKey });

            if (waitForCompletion && this.taskService) {
              await this.taskService.waitForTask(task.taskUid);
            }

            yield task;
            batchCount++;
          } catch (error) {
            // Capture error but continue processing
            errors.push({ batchIndex: batchCount, error: error as Error });
            if (options.onBatchError) {
              options.onBatchError(batchCount, error as Error);
            }
            batchCount++;
          }
          batch = [];
        }
      }
    } catch (error) {
      // Stream iteration error
      const streamError = new MlsBatchError(
        `Document stream processing failed: ${(error as Error).message}`,
        errors.map(e => e.batchIndex),
        [], // No successful batches tracked in stream error case
        errors,
        error
      );

      // Try to process any remaining documents before throwing
      if (batch.length > 0) {
        try {
          const task = operation === 'add'
            ? await index.addDocuments(batch, { primaryKey })
            : await index.updateDocuments(batch, { primaryKey });

          if (waitForCompletion && this.taskService) {
            await this.taskService.waitForTask(task.taskUid);
          }

          yield task;
        } catch (finalError) {
          errors.push({ batchIndex: batchCount, error: finalError as Error });
        }
      }

      throw streamError;
    }

    // Process remaining documents
    if (batch.length > 0) {
      try {
        const task = operation === 'add'
          ? await index.addDocuments(batch, { primaryKey })
          : await index.updateDocuments(batch, { primaryKey });

        if (waitForCompletion && this.taskService) {
          await this.taskService.waitForTask(task.taskUid);
        }

        yield task;
      } catch (error) {
        errors.push({ batchIndex: batchCount, error: error as Error });
        if (options.onBatchError) {
          options.onBatchError(batchCount, error as Error);
        }
      }
    }

    // If there were any errors, throw a batch error at the end
    if (errors.length > 0) {
      // Generate list of successful batch indices
      const failedIndices = new Set(errors.map(e => e.batchIndex));
      const successfulIndices = Array.from({ length: batchCount }, (_, i) => i)
        .filter(i => !failedIndices.has(i));

      throw new MlsBatchError(
        `${errors.length} batch(es) failed during stream processing`,
        errors.map(e => e.batchIndex),
        successfulIndices,
        errors
      );
    }
  }

  /**
   * Optimizes batch size based on document size and memory constraints
   * Accounts for MeiliSearch's payload limits and JSON serialization overhead
   */
  calculateOptimalBatchSize(
    sampleDocuments: any[],
    maxMemoryMB: number = 10
  ): number {
    if (!sampleDocuments || sampleDocuments.length === 0) {
      return this.defaultBatchSize;
    }

    // MeiliSearch has a default 100MB payload limit
    const MEILISEARCH_PAYLOAD_LIMIT_MB = 100;
    const effectiveMaxMemoryMB = Math.min(maxMemoryMB, MEILISEARCH_PAYLOAD_LIMIT_MB);

    // Sample up to 10 documents for size estimation
    const sampleSize = Math.min(10, sampleDocuments.length);
    const sample = sampleDocuments.slice(0, sampleSize);

    // Calculate average document size with JSON overhead
    // JSON serialization typically adds ~30% overhead for nested objects
    const JSON_OVERHEAD_FACTOR = 1.3;
    let totalSize = 0;

    for (const doc of sample) {
      try {
        totalSize += JSON.stringify(doc).length * JSON_OVERHEAD_FACTOR;
      } catch {
        // If serialization fails, use a conservative estimate
        totalSize += 1024; // 1KB per document as fallback
      }
    }

    const avgDocSize = totalSize / sample.length;

    // Ensure minimum document size to prevent division issues
    const minDocSize = 100; // 100 bytes minimum
    const effectiveDocSize = Math.max(avgDocSize, minDocSize);

    // Calculate batch size based on memory constraint
    const maxBytes = effectiveMaxMemoryMB * 1024 * 1024;
    const calculatedSize = Math.floor(maxBytes / effectiveDocSize);

    // Apply reasonable bounds
    const MIN_BATCH_SIZE = 1;     // At least 1 document
    const MAX_BATCH_SIZE = 10000; // MeiliSearch recommendation for batch size

    // Return clamped value
    return Math.max(MIN_BATCH_SIZE, Math.min(calculatedSize, MAX_BATCH_SIZE));
  }
}